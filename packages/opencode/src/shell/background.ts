import { spawn, type ChildProcess } from "node:child_process"
import { ulid } from "ulid"
import * as Shell from "./shell"

const MAX_BUFFER_LINES = 5000
const MAX_LINE_LENGTH = 2000

export type Status = "running" | "exited" | "killed" | "error"

export type Entry = {
  id: string
  description: string
  shell: string
  command: string
  cwd: string
  startedAt: number
  endedAt: number | null
  status: Status
  exitCode: number | null
  signal: NodeJS.Signals | null
  errorMessage: string | null
  totalLines: number
}

type Internal = Entry & {
  process: ChildProcess | null
  lines: string[]
  partial: string
}

const tasks = new Map<string, Internal>()

function appendChunk(entry: Internal, text: string) {
  let buf = entry.partial + text
  let newlineIdx = buf.indexOf("\n")
  while (newlineIdx !== -1) {
    let line = buf.slice(0, newlineIdx)
    if (line.endsWith("\r")) line = line.slice(0, -1)
    if (line.length > MAX_LINE_LENGTH) line = line.slice(0, MAX_LINE_LENGTH) + "... (line truncated)"
    entry.lines.push(line)
    entry.totalLines += 1
    if (entry.lines.length > MAX_BUFFER_LINES) entry.lines.shift()
    buf = buf.slice(newlineIdx + 1)
    newlineIdx = buf.indexOf("\n")
  }
  entry.partial = buf
}

export function start(opts: {
  shell: string
  command: string
  cwd: string
  env: NodeJS.ProcessEnv
  description: string
}): Entry {
  const id = ulid()
  const internal: Internal = {
    id,
    description: opts.description,
    shell: opts.shell,
    command: opts.command,
    cwd: opts.cwd,
    startedAt: Date.now(),
    endedAt: null,
    status: "running",
    exitCode: null,
    signal: null,
    errorMessage: null,
    totalLines: 0,
    process: null,
    lines: [],
    partial: "",
  }
  tasks.set(id, internal)

  try {
    const argv = Shell.args(opts.shell, opts.command, opts.cwd)
    const cp = spawn(opts.shell, argv, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
      windowsHide: true,
    })
    internal.process = cp
    cp.stdout?.setEncoding("utf-8")
    cp.stderr?.setEncoding("utf-8")
    cp.stdout?.on("data", (chunk: string) => appendChunk(internal, chunk))
    cp.stderr?.on("data", (chunk: string) => appendChunk(internal, chunk))
    cp.on("error", (err) => {
      if (internal.status !== "running") return
      internal.status = "error"
      internal.errorMessage = err.message
      internal.endedAt = Date.now()
    })
    cp.on("exit", (code, signal) => {
      if (internal.partial) {
        let line = internal.partial
        if (line.length > MAX_LINE_LENGTH) line = line.slice(0, MAX_LINE_LENGTH) + "... (line truncated)"
        internal.lines.push(line)
        internal.totalLines += 1
        if (internal.lines.length > MAX_BUFFER_LINES) internal.lines.shift()
        internal.partial = ""
      }
      internal.exitCode = code
      internal.signal = signal
      internal.endedAt = Date.now()
      if (internal.status === "running") {
        internal.status = signal ? "killed" : "exited"
      }
    })
  } catch (err) {
    internal.status = "error"
    internal.errorMessage = err instanceof Error ? err.message : String(err)
    internal.endedAt = Date.now()
  }

  return snapshot(internal)
}

function snapshot(e: Internal): Entry {
  return {
    id: e.id,
    description: e.description,
    shell: e.shell,
    command: e.command,
    cwd: e.cwd,
    startedAt: e.startedAt,
    endedAt: e.endedAt,
    status: e.status,
    exitCode: e.exitCode,
    signal: e.signal,
    errorMessage: e.errorMessage,
    totalLines: e.totalLines,
  }
}

export type ReadResult = {
  entry: Entry
  fromLine: number
  toLine: number
  lines: string[]
  droppedLines: number
}

export function read(id: string, opts: { sinceLine?: number; maxLines?: number } = {}): ReadResult | undefined {
  const entry = tasks.get(id)
  if (!entry) return undefined
  const sinceLine = Math.max(0, opts.sinceLine ?? 0)
  const maxLines = Math.max(1, Math.min(opts.maxLines ?? 500, 2000))
  const bufferStart = entry.totalLines - entry.lines.length
  const from = Math.max(sinceLine, bufferStart)
  const offset = from - bufferStart
  const slice = entry.lines.slice(offset, offset + maxLines)
  const toLine = from + slice.length
  const droppedLines = sinceLine < bufferStart ? bufferStart - sinceLine : 0
  return {
    entry: snapshot(entry),
    fromLine: from,
    toLine,
    lines: slice,
    droppedLines,
  }
}

export function kill(id: string, signal: NodeJS.Signals = "SIGTERM"): { entry: Entry; sent: boolean } | undefined {
  const entry = tasks.get(id)
  if (!entry) return undefined
  let sent = false
  if (entry.status === "running" && entry.process) {
    try {
      entry.process.kill(signal)
      sent = true
    } catch {
      sent = false
    }
  }
  return { entry: snapshot(entry), sent }
}

export function list(): Entry[] {
  return Array.from(tasks.values()).map(snapshot)
}

export function remove(id: string): boolean {
  const entry = tasks.get(id)
  if (!entry) return false
  if (entry.status === "running") return false
  tasks.delete(id)
  return true
}

export * as BackgroundShell from "./background"
