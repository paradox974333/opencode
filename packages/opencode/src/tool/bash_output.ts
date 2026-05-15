import { Effect, Schema } from "effect"
import { NonNegativeInt, PositiveInt } from "@opencode-ai/core/schema"
import { BackgroundShell } from "@/shell/background"
import * as Tool from "./tool"
import DESCRIPTION from "./bash_output.txt"

export const Parameters = Schema.Struct({
  taskID: Schema.String.annotate({ description: "The id of the background task to read output from" }),
  sinceLine: Schema.optional(NonNegativeInt).annotate({
    description: "Only return lines at or after this absolute line number. Defaults to 0.",
  }),
  maxLines: Schema.optional(PositiveInt).annotate({
    description: "Maximum number of lines to return. Defaults to 500, capped at 2000.",
  }),
})

function formatRuntime(startedAt: number, endedAt: number | null) {
  const end = endedAt ?? Date.now()
  const ms = Math.max(0, end - startedAt)
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rs = s % 60
  return rs ? `${m}m${rs}s` : `${m}m`
}

export const BashOutputTool = Tool.define(
  "bash_output",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const result = yield* Effect.sync(() =>
            BackgroundShell.read(params.taskID, {
              sinceLine: params.sinceLine,
              maxLines: params.maxLines,
            }),
          )

          if (!result) {
            return yield* Effect.fail(
              new Error(`No background task found with id "${params.taskID}". It may have been killed and cleaned up, or never existed.`),
            )
          }

          const { entry, fromLine, toLine, lines, droppedLines } = result
          const header: string[] = [
            `taskID: ${entry.id}`,
            `description: ${entry.description}`,
            `status: ${entry.status}`,
            `runtime: ${formatRuntime(entry.startedAt, entry.endedAt)}`,
          ]
          if (entry.status !== "running") {
            if (entry.exitCode !== null) header.push(`exitCode: ${entry.exitCode}`)
            if (entry.signal) header.push(`signal: ${entry.signal}`)
            if (entry.errorMessage) header.push(`error: ${entry.errorMessage}`)
          }
          header.push(`buffered: lines ${fromLine}..${toLine - 1} of ${entry.totalLines} total`)
          if (droppedLines > 0) {
            header.push(`(${droppedLines} earlier lines dropped from ring buffer)`)
          }
          header.push(`nextSinceLine: ${toLine}`)

          const body = lines.length
            ? lines.map((line, i) => `${fromLine + i}: ${line}`).join("\n")
            : entry.status === "running"
              ? "(no new output yet)"
              : "(no output)"

          const output = [header.join("\n"), "", body].join("\n")

          return {
            title: entry.description,
            output,
            metadata: {
              taskID: entry.id,
              status: entry.status,
              exitCode: entry.exitCode,
              totalLines: entry.totalLines,
              fromLine,
              toLine,
              droppedLines,
            },
          }
        }),
    }
  }),
)
