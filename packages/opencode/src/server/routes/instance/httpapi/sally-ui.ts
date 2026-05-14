import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

function sallyUiHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sally Code Web UI</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0d10;
      --panel: #11151a;
      --panel-2: #151b22;
      --panel-3: #1b232c;
      --line: #28313d;
      --line-strong: #3a4654;
      --text: #f5f7fb;
      --muted: #96a3b2;
      --soft: #6f7d8e;
      --blue: #69a7ff;
      --green: #7bd88f;
      --orange: #ffaf74;
      --pink: #f08ab6;
      --red: #ff7f8a;
      --shadow: rgba(0, 0, 0, 0.26);
    }

    * { box-sizing: border-box; }
    html, body, #root { height: 100%; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow: hidden;
    }

    button, textarea, input, select {
      font: inherit;
    }

    button, select {
      cursor: pointer;
    }

    .app {
      display: grid;
      grid-template-columns: 286px minmax(0, 1fr) 360px;
      height: 100%;
      min-height: 0;
    }

    .sidebar, .inspector {
      min-height: 0;
      background: var(--panel);
      border-color: var(--line);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar { border-right: 1px solid var(--line); }
    .inspector { border-left: 1px solid var(--line); }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--line);
    }

    .mark {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--line-strong);
      background: var(--panel-3);
      color: var(--orange);
      font-weight: 800;
      letter-spacing: 0;
    }

    h1, h2, h3, p {
      margin: 0;
    }

    .brand h1 {
      font-size: 15px;
      line-height: 1.1;
    }

    .brand p {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
    }

    .sidebar-actions {
      display: grid;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid var(--line);
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 36px;
      border-radius: 8px;
      border: 1px solid var(--line-strong);
      background: var(--panel-3);
      color: var(--text);
      padding: 0 12px;
      text-decoration: none;
      transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    .button:hover {
      background: #222a34;
      border-color: #526173;
    }

    .button:active {
      transform: translateY(1px);
    }

    .button.primary {
      background: #173251;
      border-color: #2e6aa4;
      color: #e0f0ff;
    }

    .button.danger {
      background: #311b22;
      border-color: #6e3945;
      color: #ffdce2;
    }

    .button.ghost {
      background: transparent;
    }

    .button[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .section-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 14px 8px;
      color: var(--soft);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0;
    }

    .session-list {
      min-height: 0;
      overflow: auto;
      padding: 0 10px 14px;
    }

    .session {
      width: 100%;
      display: grid;
      gap: 5px;
      text-align: left;
      border-radius: 8px;
      padding: 10px;
      color: var(--text);
      background: transparent;
      border: 1px solid transparent;
    }

    .session:hover {
      background: #141a21;
      border-color: var(--line);
    }

    .session.active {
      background: #17202b;
      border-color: #34516e;
    }

    .session-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 650;
    }

    .session-meta {
      color: var(--muted);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .main {
      min-width: 0;
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      background:
        linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
    }

    .topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--line);
      background: rgba(11, 13, 16, 0.94);
      backdrop-filter: blur(14px);
    }

    .top-title {
      min-width: 0;
    }

    .top-title h2 {
      font-size: 14px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .top-title small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .top-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    .field {
      display: grid;
      gap: 4px;
      min-width: 148px;
    }

    .field label {
      color: var(--soft);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    select, input.rename-input {
      min-height: 34px;
      border-radius: 8px;
      border: 1px solid var(--line-strong);
      background: #10151b;
      color: var(--text);
      outline: none;
      padding: 0 10px;
      max-width: 260px;
    }

    select:focus, textarea:focus, input.rename-input:focus {
      border-color: #4d84bd;
      box-shadow: 0 0 0 3px rgba(105, 167, 255, 0.12);
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #10151b;
      color: var(--muted);
      font-size: 12px;
      padding: 0 10px;
      align-self: end;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 99px;
      background: var(--green);
      box-shadow: 0 0 12px rgba(123, 216, 143, 0.42);
    }

    .dot.busy {
      background: var(--orange);
      box-shadow: 0 0 12px rgba(255, 175, 116, 0.42);
    }

    .error {
      display: none;
      margin: 12px 16px 0;
      border-radius: 8px;
      border: 1px solid #79434b;
      background: #321b1f;
      color: #ffd9d9;
      padding: 10px;
      font-size: 12px;
      line-height: 1.4;
    }

    .error.visible {
      display: block;
    }

    .messages {
      min-height: 0;
      overflow: auto;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .empty {
      width: min(680px, 100%);
      margin: auto;
      border: 1px solid var(--line);
      background: rgba(17, 21, 26, 0.88);
      border-radius: 8px;
      padding: 22px;
      box-shadow: 0 18px 50px var(--shadow);
    }

    .empty h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .empty p {
      color: var(--muted);
      line-height: 1.55;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .suggestion {
      min-height: 34px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #161d25;
      color: var(--text);
      padding: 0 12px;
    }

    .message {
      display: grid;
      gap: 6px;
      max-width: min(820px, 88%);
    }

    .message.user {
      align-self: flex-end;
    }

    .message.assistant {
      align-self: flex-start;
    }

    .message-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      color: var(--soft);
      font-size: 11px;
      padding: 0 4px;
    }

    .bubble {
      border-radius: 8px;
      border: 1px solid var(--line);
      background: rgba(18, 23, 29, 0.94);
      padding: 12px 13px;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    .message.user .bubble {
      background: #173251;
      border-color: #2f679d;
      color: #ecf6ff;
    }

    .markdown {
      font-size: 14px;
    }

    .markdown > *:first-child { margin-top: 0; }
    .markdown > *:last-child { margin-bottom: 0; }
    .markdown p { margin: 0 0 10px; }
    .markdown ul, .markdown ol { margin: 8px 0 10px 22px; padding: 0; }
    .markdown li { margin: 4px 0; }
    .markdown a { color: var(--blue); }
    .markdown code {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      background: #0c1117;
      padding: 1px 5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.92em;
    }
    .markdown pre {
      margin: 10px 0;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      background: #0c1117;
      padding: 12px;
      overflow: auto;
    }
    .markdown pre code {
      border: 0;
      background: transparent;
      padding: 0;
      white-space: pre;
    }
    .markdown blockquote {
      margin: 10px 0;
      border-left: 3px solid var(--blue);
      padding-left: 12px;
      color: var(--muted);
    }
    .markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
    }
    .markdown th, .markdown td {
      border: 1px solid var(--line);
      padding: 6px 8px;
      text-align: left;
    }

    .part-list {
      display: grid;
      gap: 6px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .part {
      border: 1px solid rgba(255,255,255,0.055);
      background: #121820;
      border-radius: 8px;
      padding: 8px;
      color: var(--muted);
      font-size: 12px;
    }

    .composer {
      padding: 14px 18px 18px;
      border-top: 1px solid var(--line);
      background: rgba(11, 13, 16, 0.95);
      backdrop-filter: blur(14px);
    }

    .composer form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: end;
      max-width: 1040px;
      margin: 0 auto;
    }

    textarea {
      width: 100%;
      resize: none;
      min-height: 62px;
      max-height: 190px;
      border-radius: 8px;
      border: 1px solid var(--line-strong);
      background: #10151b;
      color: var(--text);
      outline: none;
      padding: 12px 13px;
      line-height: 1.45;
    }

    .inspector-scroll {
      min-height: 0;
      overflow: auto;
      padding: 12px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #11161d;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      font-size: 13px;
      font-weight: 650;
    }

    .panel-header span:last-child {
      color: var(--soft);
      font-weight: 500;
      font-size: 11px;
    }

    .panel-body {
      padding: 10px;
      display: grid;
      gap: 8px;
    }

    .change, .todo, .kv {
      border-radius: 8px;
      background: #151b22;
      border: 1px solid rgba(255,255,255,0.055);
      padding: 9px;
    }

    .change strong, .todo strong {
      display: block;
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .change small, .todo small, .kv small {
      display: block;
      margin-top: 5px;
      color: var(--muted);
      font-size: 11px;
    }

    .status-added { color: var(--green); }
    .status-deleted { color: var(--pink); }
    .status-modified { color: var(--orange); }

    .kv {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--muted);
      font-size: 12px;
    }

    .kv strong {
      color: var(--text);
      font-weight: 650;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .rename-row, .session-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .rename-input {
      flex: 1;
      min-width: 0;
    }

    .offline {
      display: grid;
      place-items: center;
      height: 100%;
      padding: 24px;
      color: var(--muted);
      text-align: center;
    }

    @media (max-width: 1120px) {
      .app { grid-template-columns: 250px minmax(0, 1fr); }
      .inspector { display: none; }
    }

    @media (max-width: 780px) {
      body { overflow: auto; }
      .app {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 100%;
      }
      .sidebar {
        max-height: 270px;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
      .main { min-height: 72vh; }
      .topbar { grid-template-columns: 1fr; }
      .top-controls { justify-content: stretch; }
      .field { min-width: 100%; }
      .field select { max-width: none; width: 100%; }
      .messages { padding: 16px; }
      .message { max-width: 96%; }
      .composer form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="offline">Loading Sally Web UI...</div>
  </div>
  <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@17.0.1/lib/marked.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.3.1/dist/purify.min.js"></script>
  <script>
    (function () {
      if (!window.React || !window.ReactDOM) {
        document.getElementById("root").innerHTML = '<div class="offline">React could not load. Check your internet connection and refresh.</div>'
        return
      }

      var e = React.createElement
      var useEffect = React.useEffect
      var useMemo = React.useMemo
      var useRef = React.useRef
      var useState = React.useState
      var params = new URLSearchParams(window.location.search)
      var pathParts = window.location.pathname.split("/").filter(Boolean)
      var initialSessionID = params.get("session") || (pathParts[0] === "sally" && pathParts[1] ? pathParts[1] : "")
      var initialDirectory = params.get("directory") || ""
      var suggestions = [
        "Explain how this codebase is organized",
        "Find likely bugs and missing tests in this workspace",
        "Run the relevant tests and fix any failures",
        "Polish the UI and keep the changes scoped"
      ]
      var agents = ["build", "general", "plan"]

      if (window.marked && window.marked.setOptions) {
        window.marked.setOptions({ breaks: true, gfm: true })
      }

      function cx() {
        return Array.prototype.slice.call(arguments).filter(Boolean).join(" ")
      }

      function escapeText(value) {
        return String(value == null ? "" : value)
      }

      function withDirectory(path) {
        var url = new URL(path, window.location.origin)
        if (initialDirectory) url.searchParams.set("directory", initialDirectory)
        return url.pathname + url.search
      }

      async function api(path, fallback, options) {
        var init = options || {}
        var headers = Object.assign({ accept: "application/json" }, init.headers || {})
        if (init.body && !headers["content-type"]) headers["content-type"] = "application/json"
        var response = await fetch(withDirectory(path), Object.assign({}, init, { headers: headers }))
        if (!response.ok) {
          var message = await response.text().catch(function () { return "" })
          throw new Error(message || response.status + " " + response.statusText)
        }
        if (response.status === 204) return fallback
        var text = await response.text()
        if (!text) return fallback
        try {
          return JSON.parse(text)
        } catch (_) {
          return text
        }
      }

      function formatTime(value) {
        if (!value) return "now"
        return new Date(value).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })
      }

      function sessionTitle(session) {
        if (!session) return "Sally Web UI"
        return session.title || session.slug || session.id
      }

      function markdownHtml(value) {
        var text = escapeText(value)
        if (!text.trim()) return ""
        var html = window.marked && window.marked.parse ? window.marked.parse(text) : text
        return window.DOMPurify ? window.DOMPurify.sanitize(html) : html
      }

      function Markdown(props) {
        var html = useMemo(function () {
          return markdownHtml(props.text)
        }, [props.text])
        return e("div", { className: "markdown", dangerouslySetInnerHTML: { __html: html } })
      }

      function statusOf(status, sessionID) {
        var current = status && status[sessionID]
        return current && current.type ? current.type : "idle"
      }

      function modelValues(provider) {
        if (!provider || !provider.models) return []
        return Object.keys(provider.models).map(function (id) { return provider.models[id] })
      }

      function chooseProvider(providerPayload, currentID) {
        var all = providerPayload && Array.isArray(providerPayload.all) ? providerPayload.all : []
        if (!all.length) return undefined
        var connected = Array.isArray(providerPayload.connected) ? providerPayload.connected : []
        return all.find(function (item) { return item.id === currentID }) ||
          all.find(function (item) { return item.id === "opencode" }) ||
          all.find(function (item) { return connected.indexOf(item.id) >= 0 }) ||
          all[0]
      }

      function chooseModel(providerPayload, provider, currentID) {
        var models = modelValues(provider)
        if (!provider || !models.length) return ""
        if (provider.models[currentID]) return currentID
        var defaultModel = providerPayload && providerPayload.default ? providerPayload.default[provider.id] : ""
        if (defaultModel && provider.models[defaultModel]) return defaultModel
        return models[0].id
      }

      function partText(part) {
        if (!part) return ""
        if (part.type === "text" || part.type === "reasoning") return part.text || ""
        if (part.type === "file") return "Attached file: " + (part.filename || part.url || "file")
        if (part.type === "patch") return "Patch: " + ((part.files || []).join(", ") || part.hash || "workspace")
        return ""
      }

      function mainMessageText(message) {
        var parts = Array.isArray(message.parts) ? message.parts : []
        var text = parts.map(partText).filter(Boolean).join("\\n\\n")
        if (text.trim()) return text
        if (message.info && message.info.error) return "Error: " + (message.info.error.message || message.info.error.name || "failed")
        return "No visible content yet."
      }

      function activityParts(message) {
        return (message.parts || []).filter(function (part) {
          return part.type && part.type !== "text" && part.type !== "reasoning"
        })
      }

      function partLabel(part) {
        if (!part) return "Activity"
        if (part.type === "tool") return "Tool: " + (part.title || part.tool || part.name || "running")
        if (part.type === "file") return "File: " + (part.filename || part.url || "attached")
        if (part.type === "patch") return "Patch: " + ((part.files || []).length || 0) + " file(s)"
        if (part.type === "agent") return "Agent: " + (part.name || "subagent")
        if (part.type === "step-start") return "Step started"
        return part.type
      }

      function Panel(props) {
        return e("section", { className: "panel" },
          e("div", { className: "panel-header" }, e("span", null, props.title), e("span", null, props.meta || "")),
          e("div", { className: "panel-body" }, props.children)
        )
      }

      function App() {
        var messageEndRef = useRef(null)
        var inputRef = useRef(null)
        var pollRef = useRef(null)
        var activeRef = useRef(initialSessionID)
        var selectionRef = useRef({ providerID: "", modelID: "", variant: "" })
        var agentRef = useRef("build")
        var [sessions, setSessions] = useState([])
        var [status, setStatus] = useState({})
        var [activeSessionID, setActiveSessionID] = useState(initialSessionID)
        var [messages, setMessages] = useState([])
        var [changes, setChanges] = useState([])
        var [todos, setTodos] = useState([])
        var [providerPayload, setProviderPayload] = useState(null)
        var [providers, setProviders] = useState([])
        var [selectedProviderID, setSelectedProviderID] = useState("")
        var [selectedModelID, setSelectedModelID] = useState("")
        var [selectedVariant, setSelectedVariant] = useState("")
        var [agent, setAgent] = useState("build")
        var [input, setInput] = useState("")
        var [renameValue, setRenameValue] = useState("")
        var [sending, setSending] = useState(false)
        var [loading, setLoading] = useState(true)
        var [error, setError] = useState("")
        var [lastSync, setLastSync] = useState("")

        var activeSession = useMemo(function () {
          return sessions.find(function (item) { return item.id === activeSessionID })
        }, [sessions, activeSessionID])

        var selectedProvider = useMemo(function () {
          return providers.find(function (item) { return item.id === selectedProviderID })
        }, [providers, selectedProviderID])

        var models = useMemo(function () {
          return modelValues(selectedProvider)
        }, [selectedProvider])

        var selectedModel = useMemo(function () {
          return models.find(function (item) { return item.id === selectedModelID })
        }, [models, selectedModelID])

        var variants = useMemo(function () {
          return selectedModel && selectedModel.variants ? Object.keys(selectedModel.variants) : []
        }, [selectedModel])

        var activeStatus = statusOf(status, activeSessionID)

        useEffect(function () {
          activeRef.current = activeSessionID
          if (activeSessionID) updateLocation(activeSessionID)
        }, [activeSessionID])

        useEffect(function () {
          selectionRef.current = {
            providerID: selectedProviderID,
            modelID: selectedModelID,
            variant: selectedVariant
          }
        }, [selectedProviderID, selectedModelID, selectedVariant])

        useEffect(function () {
          agentRef.current = agent
        }, [agent])

        useEffect(function () {
          if (activeSession) setRenameValue(sessionTitle(activeSession))
        }, [activeSession && activeSession.id, activeSession && activeSession.title])

        useEffect(function () {
          bootstrap()
          return function () {
            if (pollRef.current) window.clearInterval(pollRef.current)
          }
        }, [])

        useEffect(function () {
          if (!activeSessionID) return
          selectTerminalSession(activeSessionID)
          loadActive(activeSessionID, true)
        }, [activeSessionID])

        useEffect(function () {
          if (messageEndRef.current) messageEndRef.current.scrollIntoView({ block: "end" })
        }, [messages.length])

        async function bootstrap() {
          try {
            setError("")
            await Promise.all([loadProviders(), refreshSessions()])
            if (pollRef.current) window.clearInterval(pollRef.current)
            pollRef.current = window.setInterval(function () {
              refreshAll(true)
            }, 1500)
          } catch (err) {
            setError(err.message || String(err))
          } finally {
            setLoading(false)
          }
        }

        async function loadProviders() {
          var data = await api("/provider", null)
          if (!data) return
          var all = Array.isArray(data.all) ? data.all : []
          setProviderPayload(data)
          setProviders(all)
          var provider = chooseProvider(data, selectedProviderID)
          if (!provider) return
          var modelID = chooseModel(data, provider, selectedModelID)
          setSelectedProviderID(provider.id)
          setSelectedModelID(modelID)
        }

        async function refreshSessions() {
          var result = await Promise.all([
            api("/session?limit=60", []),
            api("/session/status", {})
          ])
          var list = Array.isArray(result[0]) ? result[0] : []
          list = list.slice().sort(function (a, b) {
            return (b.time && b.time.updated || 0) - (a.time && a.time.updated || 0)
          })
          setSessions(list)
          setStatus(result[1] || {})
          if (!activeRef.current && list.length) setActiveSessionID(list[0].id)
          setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
        }

        async function loadActive(sessionID, silent) {
          if (!sessionID) {
            setMessages([])
            setChanges([])
            setTodos([])
            return
          }
          try {
            if (!silent) setError("")
            var id = encodeURIComponent(sessionID)
            var result = await Promise.all([
              api("/session/" + id + "/message", []),
              api("/session/" + id + "/diff", []),
              api("/session/" + id + "/todo", []),
              api("/session/status", {})
            ])
            setMessages(Array.isArray(result[0]) ? result[0] : [])
            setChanges(Array.isArray(result[1]) ? result[1] : [])
            setTodos(Array.isArray(result[2]) ? result[2] : [])
            setStatus(result[3] || {})
            setLastSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
          } catch (err) {
            if (!silent) setError(err.message || String(err))
          }
        }

        async function refreshAll(silent) {
          try {
            if (!silent) setError("")
            await refreshSessions()
            await loadActive(activeRef.current, true)
          } catch (err) {
            if (!silent) setError(err.message || String(err))
          }
        }

        function updateLocation(sessionID) {
          var url = new URL(window.location.href)
          if (sessionID) url.searchParams.set("session", sessionID)
          if (initialDirectory) url.searchParams.set("directory", initialDirectory)
          history.replaceState(null, "", url.pathname + url.search)
        }

        async function selectTerminalSession(sessionID) {
          if (!sessionID) return
          await api("/tui/select-session", true, {
            method: "POST",
            body: JSON.stringify({ sessionID: sessionID })
          }).catch(function () {})
        }

        async function createSession() {
          var selection = selectionRef.current
          var model = selection.providerID && selection.modelID
            ? { providerID: selection.providerID, id: selection.modelID, variant: selection.variant || undefined }
            : undefined
          var payload = {
            title: "Sally Web - " + new Date().toLocaleString(),
            agent: agentRef.current
          }
          if (model) payload.model = model
          var created = await api("/session", null, {
            method: "POST",
            body: JSON.stringify(payload)
          })
          if (created && created.id) {
            activeRef.current = created.id
            setActiveSessionID(created.id)
            await selectTerminalSession(created.id)
            await refreshAll(true)
            return created.id
          }
          await refreshAll(true)
          return ""
        }

        async function renameSession() {
          if (!activeSessionID || !renameValue.trim()) return
          await api("/session/" + encodeURIComponent(activeSessionID), null, {
            method: "PATCH",
            body: JSON.stringify({ title: renameValue.trim() })
          })
          await refreshAll(true)
        }

        async function deleteSession() {
          if (!activeSessionID) return
          var current = activeSessionID
          await api("/session/" + encodeURIComponent(current), true, { method: "DELETE" })
          activeRef.current = ""
          setActiveSessionID("")
          setMessages([])
          setChanges([])
          setTodos([])
          await refreshAll(true)
        }

        async function abortSession() {
          if (!activeSessionID) return
          await api("/session/" + encodeURIComponent(activeSessionID) + "/abort", true, { method: "POST" })
          await refreshAll(true)
        }

        async function sendPrompt(text) {
          var trimmed = text.trim()
          if (!trimmed || sending) return
          var sessionID = activeRef.current
          if (!sessionID) {
            sessionID = await createSession()
          }
          if (!sessionID) return
          var selection = selectionRef.current
          var payload = {
            agent: agentRef.current,
            parts: [{ type: "text", text: trimmed }]
          }
          if (selection.providerID && selection.modelID) {
            payload.model = { providerID: selection.providerID, modelID: selection.modelID }
          }
          if (selection.variant) payload.variant = selection.variant
          setSending(true)
          try {
            setError("")
            await selectTerminalSession(sessionID)
            await api("/session/" + encodeURIComponent(sessionID) + "/prompt_async", null, {
              method: "POST",
              body: JSON.stringify(payload)
            })
            setInput("")
            if (inputRef.current) inputRef.current.style.height = "62px"
            await refreshAll(true)
          } catch (err) {
            setError(err.message || String(err))
          } finally {
            setSending(false)
          }
        }

        function onProviderChange(event) {
          var providerID = event.target.value
          var provider = providers.find(function (item) { return item.id === providerID })
          setSelectedProviderID(providerID)
          setSelectedModelID(chooseModel(providerPayload, provider, ""))
          setSelectedVariant("")
        }

        function onModelChange(event) {
          setSelectedModelID(event.target.value)
          setSelectedVariant("")
        }

        function onInput(event) {
          setInput(event.target.value)
          event.target.style.height = "auto"
          event.target.style.height = Math.min(190, event.target.scrollHeight) + "px"
        }

        function onPromptKeyDown(event) {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            sendPrompt(input)
          }
        }

        function renderSessions() {
          if (!sessions.length) {
            return e("div", { className: "session-meta", style: { padding: "10px" } }, "No sessions yet.")
          }
          return sessions.map(function (session) {
            var statusText = statusOf(status, session.id)
            return e("button", {
              key: session.id,
              type: "button",
              className: cx("session", session.id === activeSessionID && "active"),
              onClick: function () { setActiveSessionID(session.id) }
            },
              e("span", { className: "session-title" }, sessionTitle(session)),
              e("span", { className: "session-meta" }, statusText + " - " + formatTime(session.time && session.time.updated))
            )
          })
        }

        function renderMessages() {
          if (!messages.length) {
            return e("div", { className: "empty" },
              e("h3", null, activeSessionID ? "Ready in this session" : "Start a local coding session"),
              e("p", null, "Ask Sally to inspect the project, edit files, run tests, or explain how the codebase works. The terminal and browser share the same local session."),
              e("div", { className: "suggestions" },
                suggestions.map(function (item) {
                  return e("button", {
                    key: item,
                    type: "button",
                    className: "suggestion",
                    onClick: function () {
                      setInput(item)
                      if (inputRef.current) inputRef.current.focus()
                    }
                  }, item)
                })
              )
            )
          }

          return messages.map(function (message) {
            var info = message.info || {}
            var role = info.role || "assistant"
            var metaTime = info.time && (info.time.created || info.time.completed)
            var activities = activityParts(message)
            return e("article", { key: info.id || Math.random(), className: cx("message", role) },
              e("div", { className: "message-meta" },
                e("span", null, role),
                info.agent ? e("span", null, info.agent) : null,
                info.modelID ? e("span", null, info.providerID + " / " + info.modelID) : null,
                e("span", null, formatTime(metaTime))
              ),
              e("div", { className: "bubble" },
                e(Markdown, { text: mainMessageText(message) }),
                activities.length ? e("div", { className: "part-list" },
                  activities.map(function (part, index) {
                    return e("div", { className: "part", key: (part.id || index) }, partLabel(part))
                  })
                ) : null
              )
            )
          })
        }

        function renderChanges() {
          if (!changes.length) {
            return e("div", { className: "change" },
              e("strong", null, "No file changes yet"),
              e("small", null, "Edits will appear here as Sally works.")
            )
          }
          return changes.map(function (change, index) {
            var statusText = change.status || "modified"
            return e("div", { className: "change", key: (change.file || "file") + index },
              e("strong", null, change.file || "workspace"),
              e("small", null,
                e("span", { className: "status-" + statusText }, statusText),
                " - +" + (change.additions || 0) + " / -" + (change.deletions || 0)
              )
            )
          })
        }

        function renderTodos() {
          if (!todos.length) {
            return e("div", { className: "todo" },
              e("strong", null, "No todos yet"),
              e("small", null, "Task planning will appear here when the agent creates it.")
            )
          }
          return todos.map(function (todo, index) {
            return e("div", { className: "todo", key: todo.content + index },
              e("strong", null, todo.content || "Task"),
              e("small", null, (todo.status || "pending") + " - " + (todo.priority || "medium"))
            )
          })
        }

        function renderWorkspace() {
          return [
            e("div", { className: "kv", key: "dir" }, e("span", null, "Directory"), e("strong", null, initialDirectory || activeSession && activeSession.directory || "default")),
            e("div", { className: "kv", key: "session" }, e("span", null, "Session"), e("strong", null, activeSessionID || "none")),
            e("div", { className: "kv", key: "messages" }, e("span", null, "Messages"), e("strong", null, String(messages.length))),
            e("div", { className: "kv", key: "model" }, e("span", null, "Selected model"), e("strong", null, selectedProviderID && selectedModelID ? selectedProviderID + " / " + selectedModelID : "default"))
          ]
        }

        return e("main", { className: "app" },
          e("aside", { className: "sidebar" },
            e("div", { className: "brand" },
              e("div", { className: "mark" }, "SC"),
              e("div", null, e("h1", null, "Sally Code"), e("p", null, "React local workspace"))
            ),
            e("div", { className: "sidebar-actions" },
              e("button", { type: "button", className: "button primary", onClick: function () { createSession().catch(function (err) { setError(err.message || String(err)) }) } }, "New session"),
              e("button", { type: "button", className: "button", onClick: function () { refreshAll(false) } }, loading ? "Loading" : "Refresh")
            ),
            e("p", { className: "section-label" }, e("span", null, "Sessions"), e("span", null, String(sessions.length))),
            e("div", { className: "session-list" }, renderSessions())
          ),
          e("section", { className: "main" },
            e("div", { className: "topbar" },
              e("div", { className: "top-title" },
                e("h2", null, sessionTitle(activeSession)),
                e("small", null, activeSession ? (activeSession.directory || initialDirectory || "local workspace") + " - " + activeSession.id : "No active session")
              ),
              e("div", { className: "top-controls" },
                e("div", { className: "field" },
                  e("label", null, "Provider"),
                  e("select", { value: selectedProviderID, onChange: onProviderChange },
                    providers.map(function (provider) {
                      return e("option", { key: provider.id, value: provider.id }, provider.name || provider.id)
                    })
                  )
                ),
                e("div", { className: "field" },
                  e("label", null, "Model"),
                  e("select", { value: selectedModelID, onChange: onModelChange },
                    models.map(function (model) {
                      return e("option", { key: model.id, value: model.id }, model.name || model.id)
                    })
                  )
                ),
                variants.length ? e("div", { className: "field" },
                  e("label", null, "Variant"),
                  e("select", { value: selectedVariant, onChange: function (event) { setSelectedVariant(event.target.value) } },
                    e("option", { value: "" }, "default"),
                    variants.map(function (variant) {
                      return e("option", { key: variant, value: variant }, variant)
                    })
                  )
                ) : null,
                e("div", { className: "field" },
                  e("label", null, "Agent"),
                  e("select", { value: agent, onChange: function (event) { setAgent(event.target.value) } },
                    agents.map(function (item) {
                      return e("option", { key: item, value: item }, item)
                    })
                  )
                ),
                e("div", { className: "status-pill" },
                  e("span", { className: cx("dot", activeStatus !== "idle" && "busy") }),
                  e("span", null, activeStatus === "idle" ? "ready" : activeStatus)
                )
              )
            ),
            e("div", { className: cx("error", error && "visible") }, error),
            e("div", { className: "messages" },
              renderMessages(),
              e("div", { ref: messageEndRef })
            ),
            e("div", { className: "composer" },
              e("form", { onSubmit: function (event) { event.preventDefault(); sendPrompt(input) } },
                e("textarea", {
                  ref: inputRef,
                  value: input,
                  onInput: onInput,
                  onKeyDown: onPromptKeyDown,
                  placeholder: "Ask Sally Code to edit, explain, test, or review this project"
                }),
                e("button", { type: "submit", className: "button primary", disabled: sending || !input.trim() }, sending ? "Sending" : "Send")
              )
            )
          ),
          e("aside", { className: "inspector" },
            e("div", { className: "brand" },
              e("div", { className: "mark" }, "LV"),
              e("div", null, e("h1", null, "Live view"), e("p", null, lastSync ? "Synced " + lastSync : "Waiting for sync"))
            ),
            e("div", { className: "inspector-scroll" },
              e(Panel, { title: "Session control", meta: activeStatus },
                e("div", { className: "rename-row" },
                  e("input", { className: "rename-input", value: renameValue, onInput: function (event) { setRenameValue(event.target.value) } }),
                  e("button", { className: "button", type: "button", disabled: !activeSessionID, onClick: function () { renameSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Rename")
                ),
                e("div", { className: "session-actions" },
                  e("button", { className: "button", type: "button", disabled: !activeSessionID, onClick: function () { selectTerminalSession(activeSessionID) } }, "Show in terminal"),
                  e("button", { className: "button", type: "button", disabled: !activeSessionID || activeStatus === "idle", onClick: function () { abortSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Abort"),
                  e("button", { className: "button danger", type: "button", disabled: !activeSessionID, onClick: function () { deleteSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Delete")
                )
              ),
              e(Panel, { title: "Workspace", meta: initialDirectory ? "local" : "default" }, renderWorkspace()),
              e(Panel, { title: "Changed files", meta: String(changes.length) }, renderChanges()),
              e(Panel, { title: "Todos", meta: String(todos.length) }, renderTodos())
            )
          )
        )
      }

      ReactDOM.createRoot(document.getElementById("root")).render(e(App))
    })()
  </script>
</body>
</html>`
}

function sallyUiResponse() {
  return HttpServerResponse.text(sallyUiHtml(), {
    contentType: "text/html; charset=utf-8",
    headers: new Headers({
      "x-content-type-options": "nosniff",
    }),
  })
}

export const sallyUiRoute = HttpRouter.use((router) =>
  Effect.gen(function* () {
    yield* router.add("GET", "/sally", Effect.sync(sallyUiResponse))
    yield* router.add("GET", "/sally/:sessionID", Effect.sync(sallyUiResponse))
  }),
)
