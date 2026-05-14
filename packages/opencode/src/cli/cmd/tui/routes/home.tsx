import { Prompt, type PromptRef } from "@tui/component/prompt"
import { TextAttributes } from "@opentui/core"
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
    index: "01",
    label: "Explain project",
    hint: "Map structure",
    prompt: "Explain how this codebase is organized and point me to the most important files.",
  },
  {
    index: "02",
    label: "Find bugs",
    hint: "Scan risks",
    prompt: "Review the current workspace for likely bugs, regressions, or missing tests.",
  },
  {
    index: "03",
    label: "Fix tests",
    hint: "Repair suite",
    prompt: "Run the relevant tests and fix any failures you find.",
  },
  {
    index: "04",
    label: "Polish UI",
    hint: "Refine product",
    prompt: "Make this interface more modern, readable, and user friendly.",
  },
]
const STATUS_WIDTH = 24

function QuickStart(props: {
  index: string
  label: string
  hint: string
  prompt: string
  onPick: (prompt: string) => void
}) {
  const { theme } = useTheme()
  const [hover, setHover] = createSignal(false)
  const border = createMemo(() => (hover() ? theme.primary : tint(theme.borderSubtle, theme.primary, 0.18)))
  const background = createMemo(() =>
    hover()
      ? tint(theme.backgroundElement, theme.primary, 0.12)
      : tint(theme.backgroundPanel, theme.backgroundElement, 0.42),
  )

  return (
    <box
      width={18}
      flexDirection="column"
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={border()}
      backgroundColor={background()}
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      paddingBottom={1}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onMouseUp={() => props.onPick(props.prompt)}
    >
      <box flexDirection="row" gap={1}>
        <text fg={hover() ? theme.primary : theme.textMuted}>{props.index}</text>
        <text fg={theme.text} attributes={TextAttributes.BOLD} wrapMode="none" truncate>
          {props.label}
        </text>
      </box>
      <text fg={theme.textMuted} wrapMode="none" truncate>
        {props.hint}
      </text>
    </box>
  )
}

function StatusChip(props: { label: string; value: string; active?: boolean }) {
  const { theme } = useTheme()
  const background = createMemo(() =>
    props.active
      ? tint(theme.backgroundElement, theme.primary, 0.1)
      : tint(theme.backgroundPanel, theme.backgroundElement, 0.35),
  )

  return (
    <box
      width={STATUS_WIDTH}
      flexDirection="column"
      border={PanelBorder.border}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={
        props.active ? tint(theme.borderActive, theme.primary, 0.32) : tint(theme.borderSubtle, theme.primary, 0.12)
      }
      backgroundColor={background()}
      paddingLeft={1}
      paddingRight={1}
    >
      <text fg={theme.textMuted} wrapMode="none" truncate>
        {props.label}
      </text>
      <text
        fg={props.active ? theme.text : theme.textMuted}
        attributes={props.active ? TextAttributes.BOLD : undefined}
        wrapMode="none"
        truncate
      >
        {props.value}
      </text>
    </box>
  )
}

function HomeStatus(props: { agent: string; model: string; provider: string }) {
  return (
    <box width="100%" maxWidth={HOME_WIDTH} flexDirection="row" justifyContent="center" gap={1} paddingTop={1}>
      <StatusChip label="agent" value={props.agent} active />
      <StatusChip label="model" value={props.model} active={props.model !== "select model"} />
      <StatusChip label="provider" value={props.provider} active={props.provider !== "connect"} />
    </box>
  )
}

function HomeBrief() {
  const { theme } = useTheme()
  return (
    <box
      width="100%"
      maxWidth={HOME_WIDTH}
      flexDirection="row"
      justifyContent="space-between"
      gap={2}
      border={["left"]}
      customBorderChars={PanelBorder.customBorderChars}
      borderColor={theme.primary}
      backgroundColor={tint(theme.backgroundPanel, theme.backgroundElement, 0.34)}
      paddingLeft={2}
      paddingRight={2}
      paddingTop={1}
      paddingBottom={1}
      marginTop={1}
    >
      <box flexDirection="column" flexShrink={1}>
        <text fg={theme.text} attributes={TextAttributes.BOLD}>
          Sally workspace
        </text>
        <text fg={theme.textMuted} wrapMode="none" truncate>
          Plan, edit, test, and open the browser workspace from one place.
        </text>
      </box>
      <text fg={theme.success} wrapMode="none">
        ready
      </text>
    </box>
  )
}

function SectionLabel(props: { title: string; action?: string }) {
  const { theme } = useTheme()
  return (
    <box width="100%" maxWidth={HOME_WIDTH} flexDirection="row" justifyContent="space-between" paddingTop={1}>
      <text fg={theme.textMuted} attributes={TextAttributes.BOLD} wrapMode="none">
        {props.title}
      </text>
      <text fg={theme.textMuted} wrapMode="none">
        {props.action ?? ""}
      </text>
    </box>
  )
}

function WebUIAction(props: { opening: boolean; onOpen: () => void }) {
  const { theme } = useTheme()
  const [hover, setHover] = createSignal(false)
  const accent = createMemo(() => tint(theme.primary, theme.success, hover() ? 0.35 : 0.18))
  const surface = createMemo(() =>
    hover()
      ? tint(theme.backgroundElement, theme.primary, 0.12)
      : tint(theme.backgroundPanel, theme.backgroundElement, 0.44),
  )

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
      backgroundColor={surface()}
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
        <box flexDirection="row" gap={1}>
          <text fg={accent()} attributes={TextAttributes.BOLD}>
            WEB
          </text>
          <text fg={theme.text} attributes={TextAttributes.BOLD}>
            Browser workspace
          </text>
        </box>
        <text fg={theme.textMuted} wrapMode="none" truncate>
          Local chat, live changes, todos, and session history
        </text>
      </box>
      <box
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={props.opening ? tint(theme.backgroundElement, theme.warning, 0.18) : accent()}
      >
        <text fg={props.opening ? theme.warning : theme.text} attributes={TextAttributes.BOLD}>
          {props.opening ? "opening" : "open"}
        </text>
      </box>
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
  const toast = useToast()
  let sent = false

  const agentLabel = createMemo(() => local.agent.current()?.name ?? "build")
  const modelLabel = createMemo(() => local.model.current()?.modelID ?? "select model")
  const providerLabel = createMemo(() => local.model.current()?.providerID ?? "connect")

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
        <HomeStatus agent={agentLabel()} model={modelLabel()} provider={providerLabel()} />
        <HomeBrief />
        <SectionLabel title="Ask Sally" action="enter sends / shift+enter newline" />
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
        <SectionLabel title="Quick starts" action="click any card" />
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
