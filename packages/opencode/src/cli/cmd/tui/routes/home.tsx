import { Prompt, type PromptRef } from "@tui/component/prompt"
import { For, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { HomeLogo } from "../component/logo"
import { useProject } from "../context/project"
import { useSync } from "../context/sync"
import { Toast } from "../ui/toast"
import { useArgs } from "../context/args"
import { useRouteData } from "@tui/context/route"
import { usePromptRef } from "../context/prompt"
import { useLocal } from "../context/local"
import { TuiPluginRuntime } from "@/cli/cmd/tui/plugin/runtime"
import { useEditorContext } from "@tui/context/editor"
import { tint, useTheme } from "@tui/context/theme"
import { PanelBorder } from "../component/border"

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

function HomePulseBar() {
  const { theme } = useTheme()
  const [frame, setFrame] = createSignal(0)
  const cells = 52

  onMount(() => {
    const timer = setInterval(() => setFrame((value) => (value + 1) % cells), 80)
    onCleanup(() => clearInterval(timer))
  })

  const levels = createMemo(() =>
    Array.from({ length: cells }, (_, index) => {
      const distance = Math.min(Math.abs(index - frame()), cells - Math.abs(index - frame()))
      return Math.max(0, 1 - distance / 7)
    }),
  )

  return (
    <box width="100%" maxWidth={HOME_WIDTH} flexDirection="row" justifyContent="center">
      <For each={levels()}>
        {(level) => <text fg={tint(theme.borderSubtle, theme.primary, 0.18 + level * 0.68)}>─</text>}
      </For>
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
  const args = useArgs()
  const local = useLocal()
  const editor = useEditorContext()
  const { theme } = useTheme()
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
        <box height={1} minHeight={0} flexShrink={1} />
        <box flexShrink={0}>
          <HomePulseBar />
        </box>
        <box paddingTop={1} flexShrink={0}>
          <text fg={theme.textMuted}>Start with a task, a question, or a file reference.</text>
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
