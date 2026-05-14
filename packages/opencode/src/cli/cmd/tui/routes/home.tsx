import { Prompt, type PromptRef } from "@tui/component/prompt"
import { For, createEffect, createMemo, createSignal, onMount } from "solid-js"
import open from "open"
import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { errorMessage } from "@/util/error"
import { useEditorContext } from "@tui/context/editor"
import { tint, useTheme } from "@tui/context/theme"
import { PanelBorder } from "../component/border"
import { HomeLogo } from "../component/logo"
import { useArgs } from "../context/args"
import { useLocal } from "../context/local"
import { useProject } from "../context/project"
import { useRoute } from "@tui/context/route"
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
  const router = useRoute()
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
      const selectedModel = local.model.current()
      const agent = local.agent.current()?.name ?? "build"
      const variant = local.model.variant.current()
      const workspace = project.workspace.current()
      const input: Parameters<typeof sdk.client.session.create>[0] = {
        workspace,
        agent,
      }
      if (selectedModel) {
        input.model = {
          providerID: selectedModel.providerID,
          id: selectedModel.modelID,
          variant,
        }
      }
      const session = await sdk.client.session.create(input)
      if (session.error) throw session.error

      const base = sdk.openExternalServer ? await sdk.openExternalServer() : sdk.url
      const url = new URL(`/sally/${session.data.id}`, base)
      if (sdk.directory) url.searchParams.set("directory", sdk.directory)
      await open(url.toString())
      router.navigate({ type: "session", sessionID: session.data.id })
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

  return (
    <>
      <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
        <box flexGrow={1} minHeight={0} />
        <box height={1} minHeight={0} flexShrink={1} />
        <box flexShrink={0}>
          <TuiPluginRuntime.Slot name="home_logo" mode="replace">
            <HomeLogo />
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
