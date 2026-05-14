import { Prompt, type PromptRef } from "@tui/component/prompt"
import { TextAttributes, type RGBA } from "@opentui/core"
import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import open from "open"
import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { errorMessage } from "@/util/error"
import { useEditorContext } from "@tui/context/editor"
import { tint, useTheme } from "@tui/context/theme"
import { PanelBorder } from "../component/border"
import { useArgs } from "../context/args"
import { useLocal } from "../context/local"
import { useProject } from "../context/project"
import { useRouteData } from "@tui/context/route"
import { usePromptRef } from "../context/prompt"
import { useSDK } from "../context/sdk"
import { useSync } from "../context/sync"
import { Toast, useToast } from "../ui/toast"

let once = false
const placeholder = {
  normal: [
    "Review this project and suggest next steps",
    "Explain how this codebase is organized",
    "Find bugs in the current workspace",
  ],
  shell: ["ls -la", "git status", "pwd"],
}
const HOME_WIDTH = 76
const QUICK_STARTS = [
  {
    label: "Explain project",
    prompt: "Explain how this codebase is organized and point me to the most important files.",
  },
  {
    label: "Find bugs",
    prompt: "Review the current workspace for likely bugs, regressions, or missing tests.",
  },
  {
    label: "Fix tests",
    prompt: "Run the relevant tests and fix any failures you find.",
  },
  {
    label: "Polish UI",
    prompt: "Make this interface more modern, readable, and user friendly.",
  },
]

function HomeSignalBar() {
  const { theme } = useTheme()
  const [frame, setFrame] = createSignal(0)
  const cells = 46

  onMount(() => {
    const timer = setInterval(() => setFrame((value) => (value + 1) % cells), 90)
    onCleanup(() => clearInterval(timer))
  })

  const levels = createMemo(() =>
    Array.from({ length: cells }, (_, index) => {
      const distance = Math.min(Math.abs(index - frame()), cells - Math.abs(index - frame()))
      return Math.max(0, 1 - distance / 7)
    }),
  )

  return (
    <box width="100%" flexDirection="row">
      <For each={levels()}>
        {(level) => <text fg={tint(theme.borderSubtle, theme.primary, 0.14 + level * 0.62)}>-</text>}
      </For>
    </box>
  )
}

function HomePill(props: { label: string; value: string; color?: RGBA }) {
  const { theme } = useTheme()
  return (
    <box
      flexDirection="row"
      gap={1}
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={tint(theme.borderSubtle, props.color ?? theme.primary, 0.18)}
      backgroundColor={tint(theme.backgroundPanel, theme.backgroundElement, 0.34)}
      paddingLeft={1}
      paddingRight={1}
    >
      <text fg={theme.textMuted}>{props.label}</text>
      <text fg={props.color ?? theme.text} wrapMode="none" truncate>
        {props.value}
      </text>
    </box>
  )
}

function HomeHero(props: { agent: string; model: string; provider: string; workspace: string }) {
  const { theme } = useTheme()
  return (
    <box
      width="100%"
      maxWidth={HOME_WIDTH}
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={tint(theme.borderSubtle, theme.primary, 0.26)}
      backgroundColor={tint(theme.backgroundPanel, theme.backgroundElement, 0.44)}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      gap={1}
    >
      <box flexDirection="row" justifyContent="space-between" gap={2}>
        <box gap={0} flexShrink={1}>
          <text attributes={TextAttributes.BOLD} fg={theme.text}>
            SALLY CODE
          </text>
          <text fg={theme.textMuted}>Local AI coding workspace</text>
        </box>
        <box flexDirection="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
          <HomePill label="agent" value={props.agent} color={theme.primary} />
          <HomePill label="web" value="ready" color={theme.success} />
        </box>
      </box>
      <HomeSignalBar />
      <box flexDirection="row" gap={1} flexWrap="wrap">
        <HomePill label="model" value={props.model} />
        <HomePill label="provider" value={props.provider} />
        <HomePill label="workspace" value={props.workspace} color={theme.info} />
      </box>
    </box>
  )
}

function QuickStart(props: { label: string; prompt: string; onPick: (prompt: string) => void }) {
  const { theme } = useTheme()
  const [hover, setHover] = createSignal(false)
  const border = createMemo(() => (hover() ? theme.borderActive : theme.borderSubtle))
  const background = createMemo(() =>
    hover()
      ? tint(theme.backgroundElement, theme.primary, 0.08)
      : tint(theme.backgroundPanel, theme.backgroundElement, 0.36),
  )

  return (
    <box
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={border()}
      backgroundColor={background()}
      paddingLeft={1}
      paddingRight={1}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onMouseUp={() => props.onPick(props.prompt)}
    >
      <text fg={hover() ? theme.text : theme.textMuted} wrapMode="none">
        {props.label}
      </text>
    </box>
  )
}

function WebUIAction(props: { opening: boolean; onOpen: () => void }) {
  const { theme } = useTheme()
  const [hover, setHover] = createSignal(false)
  const accent = createMemo(() => tint(theme.primary, theme.success, hover() ? 0.28 : 0.12))

  return (
    <box
      width="100%"
      maxWidth={HOME_WIDTH}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={hover() ? accent() : tint(theme.borderSubtle, theme.primary, 0.22)}
      backgroundColor={
        hover()
          ? tint(theme.backgroundElement, theme.primary, 0.08)
          : tint(theme.backgroundPanel, theme.backgroundElement, 0.36)
      }
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      marginTop={1}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onMouseUp={() => props.onOpen()}
    >
      <box gap={0} flexShrink={1}>
        <text fg={hover() ? theme.text : theme.textMuted}>Open Web UI</text>
        <text fg={theme.textMuted} wrapMode="none" truncate>
          localhost chat, sessions, todos, and live file changes
        </text>
      </box>
      <text fg={props.opening ? theme.warning : accent()}>{props.opening ? "opening" : "launch"}</text>
    </box>
  )
}

function HomeQuickStarts(props: { onPick: (prompt: string) => void }) {
  return (
    <box
      width="100%"
      maxWidth={HOME_WIDTH}
      flexDirection="row"
      justifyContent="center"
      flexWrap="wrap"
      gap={1}
      paddingTop={1}
    >
      <For each={QUICK_STARTS}>{(item) => <QuickStart {...item} onPick={props.onPick} />}</For>
    </box>
  )
}

export function Home() {
  const sync = useSync()
  const project = useProject()
  const route = useRouteData("home")
  const promptRef = usePromptRef()
  const [ref, setRef] = createSignal<PromptRef | undefined>()
  const [openingWeb, setOpeningWeb] = createSignal(false)
  const args = useArgs()
  const local = useLocal()
  const editor = useEditorContext()
  const sdk = useSDK()
  const { theme } = useTheme()
  const toast = useToast()
  let sent = false

  onMount(() => {
    editor.clearSelection()
  })

  const bind = (r: PromptRef | undefined) => {
    setRef(r)
    promptRef.set(r)
    if (once || !r) return
    if (route.prompt) {
      r.set(route.prompt)
      once = true
      return
    }
    if (!args.prompt) return
    r.set({ input: args.prompt, parts: [] })
    once = true
  }

  // Wait for sync and model store to be ready before auto-submitting --prompt
  createEffect(() => {
    const r = ref()
    if (sent) return
    if (!r) return
    if (!sync.ready || !local.model.ready) return
    if (!args.prompt) return
    if (r.current.input !== args.prompt) return
    sent = true
    r.submit()
  })

  const pickQuickStart = (prompt: string) => {
    const r = ref()
    if (!r) return
    r.set({ input: prompt, parts: [] })
    r.focus()
  }

  const openWebUI = async () => {
    if (openingWeb()) return
    setOpeningWeb(true)
    try {
      const base = sdk.openExternalServer ? await sdk.openExternalServer() : sdk.url
      const url = new URL("/sally", base)
      if (sdk.directory) url.searchParams.set("directory", sdk.directory)
      await open(url.toString())
      toast.show({
        message: "Sally Web UI opened in browser",
        variant: "success",
      })
    } catch (error) {
      toast.show({
        message: errorMessage(error) ?? "Failed to open Sally Web UI",
        variant: "error",
      })
    } finally {
      setOpeningWeb(false)
    }
  }

  const heroAgent = createMemo(() => local.agent.current()?.name ?? "build")
  const heroModel = createMemo(() => local.model.parsed().model)
  const heroProvider = createMemo(() => local.model.parsed().provider)
  const heroWorkspace = createMemo(() => project.workspace.current() ?? "local")

  return (
    <>
      <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
        <box flexGrow={1} minHeight={0} />
        <box height={1} minHeight={0} flexShrink={1} />
        <box flexShrink={0}>
          <TuiPluginRuntime.Slot name="home_logo" mode="replace">
            <HomeHero agent={heroAgent()} model={heroModel()} provider={heroProvider()} workspace={heroWorkspace()} />
          </TuiPluginRuntime.Slot>
        </box>
        <box paddingTop={1} flexShrink={0}>
          <text fg={theme.textMuted}>Start with a task, ask a question, or jump into the browser workspace.</text>
        </box>
        <box width="100%" maxWidth={HOME_WIDTH} zIndex={1000} paddingTop={1} flexShrink={0}>
          <TuiPluginRuntime.Slot
            name="home_prompt"
            mode="replace"
            workspace_id={project.workspace.current()}
            ref={bind}
          >
            <Prompt
              ref={bind}
              workspaceID={project.workspace.current()}
              right={<TuiPluginRuntime.Slot name="home_prompt_right" workspace_id={project.workspace.current()} />}
              placeholders={placeholder}
              variant="home"
            />
          </TuiPluginRuntime.Slot>
        </box>
        <WebUIAction opening={openingWeb()} onOpen={openWebUI} />
        <HomeQuickStarts onPick={pickQuickStart} />
        <TuiPluginRuntime.Slot name="home_bottom" />
        <box flexGrow={1} minHeight={0} />
        <Toast />
      </box>
      <box width="100%" flexShrink={0}>
        <TuiPluginRuntime.Slot name="home_footer" mode="single_winner" />
      </box>
    </>
  )
}
