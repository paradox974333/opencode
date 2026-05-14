import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

function sallyUiHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sally Code</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #090d12;
      --surface: #0d1218;
      --surface-2: #111822;
      --surface-3: #17202b;
      --line: #263141;
      --line-strong: #3a485b;
      --text: #f5f8fc;
      --muted: #98a6b8;
      --soft: #6d7a8e;
      --blue: #7ab7ff;
      --green: #7ddf9a;
      --orange: #ffb274;
      --red: #ff7f8a;
      --shadow: rgba(0, 0, 0, 0.35);
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

    h1, h2, h3, p {
      margin: 0;
    }

    .app {
      min-height: 100%;
      display: grid;
      grid-template-rows: 66px minmax(0, 1fr);
      background:
        radial-gradient(circle at 50% -220px, rgba(122, 183, 255, 0.1), transparent 420px),
        var(--bg);
    }

    .topbar {
      display: grid;
      grid-template-columns: minmax(190px, 1fr) auto minmax(190px, 1fr);
      align-items: center;
      gap: 18px;
      padding: 0 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      background: rgba(9, 13, 18, 0.9);
      backdrop-filter: blur(16px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }

    .mark {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--line-strong);
      background: var(--surface-2);
      color: var(--orange);
      font-weight: 800;
      letter-spacing: 0;
      flex: 0 0 auto;
    }

    .brand h1 {
      font-size: 16px;
      line-height: 1.1;
    }

    .brand p {
      margin-top: 3px;
      color: var(--muted);
      font-size: 12px;
    }

    .nav-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(15, 21, 29, 0.78);
      box-shadow: 0 12px 40px var(--shadow);
    }

    .nav-pill button {
      min-height: 36px;
      border-radius: 999px;
      border: 0;
      padding: 0 18px;
      color: var(--muted);
      background: transparent;
    }

    .nav-pill button.active {
      color: var(--text);
      background: #131c27;
      box-shadow: inset 0 0 0 1px var(--line-strong);
    }

    .top-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      min-width: 0;
    }

    .button {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      padding: 0 12px;
      text-decoration: none;
      transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
      white-space: nowrap;
    }

    .button:hover {
      background: var(--surface-2);
      border-color: var(--line-strong);
    }

    .button:active {
      transform: translateY(1px);
    }

    .button.primary {
      background: #e8eef7;
      border-color: #e8eef7;
      color: #101620;
      font-weight: 650;
    }

    .button.danger {
      background: #2a151b;
      border-color: #6a3540;
      color: #ffdce2;
    }

    .model-summary {
      max-width: min(34vw, 320px);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .button[disabled] {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .status-pill {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      color: var(--muted);
      padding: 0 11px;
      font-size: 12px;
      white-space: nowrap;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 14px rgba(125, 223, 154, 0.45);
    }

    .dot.busy {
      background: var(--orange);
      box-shadow: 0 0 14px rgba(255, 178, 116, 0.45);
    }

    .main {
      min-height: 0;
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      overflow: hidden;
    }

    .chat-shell {
      min-height: 0;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      justify-items: center;
    }

    .messages {
      width: min(980px, calc(100vw - 36px));
      min-height: 0;
      overflow: auto;
      padding: 34px 0 22px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      scrollbar-color: #344153 transparent;
    }

    .empty {
      margin: auto;
      width: min(820px, 100%);
      display: grid;
      justify-items: center;
      text-align: center;
      gap: 18px;
      padding-bottom: 8vh;
    }

    .empty h2 {
      font-size: clamp(24px, 3vw, 38px);
      font-weight: 650;
      letter-spacing: 0;
    }

    .empty p {
      width: min(640px, 100%);
      color: var(--muted);
      line-height: 1.55;
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 9px;
      width: min(760px, 100%);
    }

    .suggestion {
      min-height: 34px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(17, 24, 34, 0.9);
      color: var(--text);
      padding: 0 13px;
    }

    .message {
      width: min(820px, 100%);
      display: grid;
      gap: 8px;
      align-self: center;
    }

    .message.user {
      justify-items: end;
    }

    .message.assistant {
      justify-items: start;
    }

    .message-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      color: var(--soft);
      font-size: 11px;
      padding: 0 2px;
    }

    .bubble {
      max-width: min(760px, 100%);
      border: 1px solid transparent;
      border-radius: 16px;
      line-height: 1.58;
      overflow-wrap: anywhere;
    }

    .message.user .bubble {
      padding: 11px 14px;
      border-color: #2d5d91;
      background: #123154;
      color: #edf7ff;
    }

    .message.assistant .bubble {
      padding: 0;
      background: transparent;
      color: var(--text);
    }

    .markdown {
      font-size: 15px;
    }

    .markdown > *:first-child { margin-top: 0; }
    .markdown > *:last-child { margin-bottom: 0; }
    .markdown p { margin: 0 0 11px; }
    .markdown ul, .markdown ol { margin: 8px 0 11px 22px; padding: 0; }
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
      margin: 12px 0;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #0c1117;
      padding: 13px;
      overflow: auto;
    }
    .markdown pre code {
      border: 0;
      background: transparent;
      padding: 0;
      white-space: pre;
    }
    .markdown blockquote {
      margin: 12px 0;
      border-left: 3px solid var(--blue);
      padding-left: 12px;
      color: var(--muted);
    }
    .markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
    }
    .markdown th, .markdown td {
      border: 1px solid var(--line);
      padding: 7px 9px;
      text-align: left;
    }

    .activity-card {
      margin-top: 4px;
      width: min(680px, 100%);
      border-left: 1px solid var(--line-strong);
      color: var(--muted);
      padding-left: 16px;
      display: grid;
      gap: 8px;
      font-size: 13px;
    }

    .activity-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text);
      font-weight: 650;
    }

    .activity-title .mini {
      color: var(--muted);
      font-weight: 500;
      font-size: 12px;
    }

    .activity-row {
      display: flex;
      gap: 10px;
      align-items: baseline;
      min-width: 0;
    }

    .activity-row span:first-child {
      color: var(--soft);
      text-transform: uppercase;
      font-size: 11px;
      flex: 0 0 auto;
    }

    .activity-row span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .composer-wrap {
      width: 100%;
      padding: 12px 18px 18px;
      background: linear-gradient(transparent, rgba(9, 13, 18, 0.92) 22%);
    }

    .composer {
      width: min(880px, 100%);
      margin: 0 auto;
      display: grid;
      gap: 9px;
    }

    .live-strip {
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 34px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(13, 18, 24, 0.88);
      color: var(--muted);
      padding: 0 12px;
      font-size: 12px;
    }

    .live-strip.visible {
      display: flex;
    }

    .live-strip strong {
      color: var(--text);
      font-weight: 650;
    }

    .composer-box {
      position: relative;
      border: 1px solid var(--line-strong);
      border-radius: 24px;
      background: rgba(13, 18, 24, 0.96);
      box-shadow: 0 18px 60px var(--shadow);
      padding: 14px 78px 14px 18px;
    }

    textarea {
      width: 100%;
      min-height: 70px;
      max-height: 190px;
      resize: none;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--text);
      line-height: 1.45;
      padding: 0;
    }

    textarea::placeholder {
      color: #9fb0c4;
    }

    .send-button {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: 58px;
      height: 36px;
      border: 0;
      border-radius: 999px;
      background: #dbe5f2;
      color: #111821;
      font-size: 12px;
      font-weight: 750;
      display: grid;
      place-items: center;
    }

    .send-button[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .error {
      width: min(880px, calc(100vw - 36px));
      margin: 10px auto 0;
      border: 1px solid #70404a;
      border-radius: 12px;
      background: #2b171d;
      color: #ffdce2;
      padding: 10px 12px;
      font-size: 13px;
      line-height: 1.4;
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      z-index: 20;
      background: rgba(0,0,0,0.38);
      backdrop-filter: blur(4px);
    }

    .drawer {
      position: fixed;
      z-index: 21;
      top: 14px;
      right: 14px;
      bottom: 14px;
      width: min(390px, calc(100vw - 28px));
      border: 1px solid var(--line);
      border-radius: 22px;
      background: rgba(13, 18, 24, 0.98);
      box-shadow: 0 24px 90px rgba(0,0,0,0.48);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      overflow: hidden;
    }

    .drawer.left {
      left: 14px;
      right: auto;
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--line);
    }

    .drawer-header h2 {
      font-size: 15px;
    }

    .drawer-header p {
      margin-top: 3px;
      color: var(--muted);
      font-size: 12px;
    }

    .drawer-body {
      min-height: 0;
      overflow: auto;
      padding: 14px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .session-list {
      display: grid;
      gap: 8px;
    }

    .session {
      width: 100%;
      border: 1px solid transparent;
      border-radius: 14px;
      background: transparent;
      color: var(--text);
      padding: 11px 12px;
      text-align: left;
      display: grid;
      gap: 4px;
    }

    .session:hover {
      background: var(--surface-2);
      border-color: var(--line);
    }

    .session.active {
      background: #142030;
      border-color: #35516f;
    }

    .session strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
    }

    .session small {
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--surface);
      overflow: hidden;
    }

    .panel-title {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 12px;
      border-bottom: 1px solid var(--line);
      font-size: 13px;
      font-weight: 650;
    }

    .panel-title span:last-child {
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
    }

    .panel-body {
      padding: 12px;
      display: grid;
      gap: 9px;
    }

    .field {
      display: grid;
      gap: 5px;
    }

    .field label {
      color: var(--soft);
      font-size: 11px;
      text-transform: uppercase;
    }

    select, input.rename-input {
      width: 100%;
      min-height: 38px;
      border: 1px solid var(--line-strong);
      border-radius: 12px;
      background: #0c1219;
      color: var(--text);
      padding: 0 11px;
      outline: 0;
    }

    select:focus, input.rename-input:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(122, 183, 255, 0.12);
    }

    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .kv {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      background: #101720;
      color: var(--muted);
      padding: 9px;
      font-size: 12px;
    }

    .kv strong {
      color: var(--text);
      text-align: right;
      overflow-wrap: anywhere;
    }

    .change, .todo {
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      background: #101720;
      padding: 9px;
      display: grid;
      gap: 4px;
    }

    .change strong, .todo strong {
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .change small, .todo small {
      color: var(--muted);
      font-size: 11px;
    }

    .status-added { color: var(--green); }
    .status-deleted { color: var(--red); }
    .status-modified { color: var(--orange); }

    @media (max-width: 820px) {
      .topbar {
        grid-template-columns: 1fr auto;
      }
      .nav-pill {
        display: none;
      }
      .top-actions .status-pill {
        display: none;
      }
      .top-actions .model-summary {
        display: none;
      }
      .messages {
        width: calc(100vw - 28px);
        padding-top: 24px;
      }
      .composer-wrap {
        padding-left: 14px;
        padding-right: 14px;
      }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="empty"><h2>Loading Sally Code...</h2></div>
  </div>
  <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@17.0.1/lib/marked.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.3.1/dist/purify.min.js"></script>
  <script>
    (function () {
      if (!window.React || !window.ReactDOM) {
        document.getElementById("root").innerHTML = '<div class="empty"><h2>React could not load</h2><p>Check your internet connection and refresh.</p></div>'
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
        "Explain this project and the important files",
        "Find bugs and missing tests",
        "Run tests and fix failures",
        "Polish the UI in this workspace"
      ]
      var agents = ["build", "general", "plan"]

      if (window.marked && window.marked.setOptions) {
        window.marked.setOptions({ breaks: true, gfm: true })
      }

      function cx() {
        return Array.prototype.slice.call(arguments).filter(Boolean).join(" ")
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
        if (!session) return "New Sally session"
        return session.title || session.slug || session.id
      }

      function markdownHtml(value) {
        var text = String(value == null ? "" : value)
        if (!text.trim()) return ""
        var html = window.marked && window.marked.parse ? window.marked.parse(text) : text
        return window.DOMPurify ? window.DOMPurify.sanitize(html) : html
      }

      function Markdown(props) {
        var html = useMemo(function () { return markdownHtml(props.text) }, [props.text])
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
        return "Working..."
      }

      function activityLabel(part) {
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
          e("div", { className: "panel-title" }, e("span", null, props.title), e("span", null, props.meta || "")),
          e("div", { className: "panel-body" }, props.children)
        )
      }

      function Drawer(props) {
        if (!props.open) return null
        return e(React.Fragment, null,
          e("div", { className: "drawer-backdrop", onClick: props.onClose }),
          e("aside", { className: cx("drawer", props.side === "left" && "left") },
            e("div", { className: "drawer-header" },
              e("div", null, e("h2", null, props.title), e("p", null, props.subtitle || "")),
              e("button", { className: "button", type: "button", onClick: props.onClose }, "Close")
            ),
            e("div", { className: "drawer-body" }, props.children)
          )
        )
      }

      function App() {
        var messageEndRef = useRef(null)
        var inputRef = useRef(null)
        var pollRef = useRef(null)
        var eventRef = useRef(null)
        var activeRef = useRef(initialSessionID)
        var selectionRef = useRef({ providerID: "", modelID: "", variant: "" })
        var agentRef = useRef("build")
        var [sessions, setSessions] = useState([])
        var [status, setStatus] = useState({})
        var [activeSessionID, setActiveSessionID] = useState(initialSessionID)
        var [messages, setMessages] = useState([])
        var [changes, setChanges] = useState([])
        var [todos, setTodos] = useState([])
        var [activities, setActivities] = useState([{ kind: "status", text: "Connected to Sally Web UI", time: Date.now() }])
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
        var [historyOpen, setHistoryOpen] = useState(false)
        var [settingsOpen, setSettingsOpen] = useState(false)
        var [activityOpen, setActivityOpen] = useState(false)

        var activeSession = useMemo(function () {
          return sessions.find(function (item) { return item.id === activeSessionID })
        }, [sessions, activeSessionID])

        var selectedProvider = useMemo(function () {
          return providers.find(function (item) { return item.id === selectedProviderID })
        }, [providers, selectedProviderID])

        var models = useMemo(function () { return modelValues(selectedProvider) }, [selectedProvider])
        var selectedModel = useMemo(function () {
          return models.find(function (item) { return item.id === selectedModelID })
        }, [models, selectedModelID])
        var variants = useMemo(function () {
          return selectedModel && selectedModel.variants ? Object.keys(selectedModel.variants) : []
        }, [selectedModel])
        var activeStatus = statusOf(status, activeSessionID)
        var latestActivity = activities[0]

        useEffect(function () {
          activeRef.current = activeSessionID
          if (activeSessionID) updateLocation(activeSessionID)
        }, [activeSessionID])

        useEffect(function () {
          selectionRef.current = { providerID: selectedProviderID, modelID: selectedModelID, variant: selectedVariant }
        }, [selectedProviderID, selectedModelID, selectedVariant])

        useEffect(function () { agentRef.current = agent }, [agent])

        useEffect(function () {
          if (activeSession) setRenameValue(sessionTitle(activeSession))
        }, [activeSession && activeSession.id, activeSession && activeSession.title])

        useEffect(function () {
          bootstrap()
          return function () {
            if (pollRef.current) window.clearInterval(pollRef.current)
            if (eventRef.current) eventRef.current.close()
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

        function addActivity(kind, text) {
          setActivities(function (current) {
            var next = [{ kind: kind, text: text, time: Date.now() }].concat(current)
            return next.slice(0, 80)
          })
        }

        async function bootstrap() {
          try {
            setError("")
            await Promise.all([loadProviders(), refreshSessions()])
            connectEvents()
            if (pollRef.current) window.clearInterval(pollRef.current)
            pollRef.current = window.setInterval(function () { refreshAll(true) }, 4500)
          } catch (err) {
            setError(err.message || String(err))
          } finally {
            setLoading(false)
          }
        }

        function connectEvents() {
          if (eventRef.current) eventRef.current.close()
          try {
            var source = new EventSource(withDirectory("/event"))
            eventRef.current = source
            source.onmessage = function (message) {
              var event
              try { event = JSON.parse(message.data) } catch (_) { return }
              handleEvent(event)
            }
            source.onerror = function () {
              addActivity("status", "Live stream reconnecting")
            }
          } catch (_) {}
        }

        function eventSessionID(event) {
          var p = event && event.properties || {}
          return p.sessionID || p.info && p.info.id || undefined
        }

        function handleEvent(event) {
          var type = event && event.type || "event"
          var sessionID = eventSessionID(event)
          var active = activeRef.current
          if (type === "server.connected") addActivity("status", "Live stream connected")
          if (type === "server.heartbeat") return
          if (type === "session.status" && (!sessionID || sessionID === active)) {
            var statusText = event.properties && event.properties.status && event.properties.status.type || "working"
            addActivity(statusText === "idle" ? "done" : "status", statusText === "idle" ? "Response complete" : "Sally is " + statusText)
          }
          if (type.indexOf("message.part") >= 0 && (!sessionID || sessionID === active)) addActivity("step", "Streaming response updates")
          if (type.indexOf("tool") >= 0 && (!sessionID || sessionID === active)) addActivity("tool", "Tool activity")
          if (type === "todo.updated" && (!sessionID || sessionID === active)) addActivity("todo", "Todo list updated")
          if (type.indexOf("session.") === 0) refreshSessions().catch(function () {})
          if (!sessionID || sessionID === active) loadActive(active, true)
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
          var result = await Promise.all([api("/session?limit=60", []), api("/session/status", {})])
          var list = Array.isArray(result[0]) ? result[0] : []
          list = list.slice().sort(function (a, b) { return (b.time && b.time.updated || 0) - (a.time && a.time.updated || 0) })
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
          await api("/tui/select-session", true, { method: "POST", body: JSON.stringify({ sessionID: sessionID }) }).catch(function () {})
        }

        async function createSession() {
          var selection = selectionRef.current
          var model = selection.providerID && selection.modelID ? { providerID: selection.providerID, id: selection.modelID, variant: selection.variant || undefined } : undefined
          var payload = { title: "Sally Web - " + new Date().toLocaleString(), agent: agentRef.current }
          if (model) payload.model = model
          var created = await api("/session", null, { method: "POST", body: JSON.stringify(payload) })
          if (created && created.id) {
            activeRef.current = created.id
            setActiveSessionID(created.id)
            await selectTerminalSession(created.id)
            addActivity("status", "New session created")
            await refreshAll(true)
            return created.id
          }
          await refreshAll(true)
          return ""
        }

        async function renameSession() {
          if (!activeSessionID || !renameValue.trim()) return
          await api("/session/" + encodeURIComponent(activeSessionID), null, { method: "PATCH", body: JSON.stringify({ title: renameValue.trim() }) })
          addActivity("status", "Session renamed")
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
          addActivity("status", "Session deleted")
          await refreshAll(true)
        }

        async function abortSession() {
          if (!activeSessionID) return
          await api("/session/" + encodeURIComponent(activeSessionID) + "/abort", true, { method: "POST" })
          addActivity("status", "Abort requested")
          await refreshAll(true)
        }

        async function sendPrompt(text) {
          var trimmed = text.trim()
          if (!trimmed || sending) return
          var sessionID = activeRef.current
          if (!sessionID) sessionID = await createSession()
          if (!sessionID) return
          var selection = selectionRef.current
          var payload = { agent: agentRef.current, parts: [{ type: "text", text: trimmed }] }
          if (selection.providerID && selection.modelID) payload.model = { providerID: selection.providerID, modelID: selection.modelID }
          if (selection.variant) payload.variant = selection.variant
          setSending(true)
          try {
            setError("")
            addActivity("status", "Preparing live context")
            await selectTerminalSession(sessionID)
            await api("/session/" + encodeURIComponent(sessionID) + "/prompt_async", null, { method: "POST", body: JSON.stringify(payload) })
            setInput("")
            if (inputRef.current) inputRef.current.style.height = "70px"
            addActivity("status", "Prompt sent to Sally")
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

        function renderMessages() {
          if (!messages.length) {
            return e("div", { className: "empty" },
              e("h2", null, "What should Sally build today?"),
              e("div", { className: "suggestions" }, suggestions.map(function (item) {
                return e("button", { key: item, type: "button", className: "suggestion", onClick: function () { setInput(item); if (inputRef.current) inputRef.current.focus() } }, item)
              }))
            )
          }

          return messages.map(function (message) {
            var info = message.info || {}
            var role = info.role || "assistant"
            var metaTime = info.time && (info.time.created || info.time.completed)
            var activityParts = (message.parts || []).filter(function (part) { return part.type && part.type !== "text" && part.type !== "reasoning" })
            return e("article", { key: info.id || Math.random(), className: cx("message", role) },
              e("div", { className: "message-meta" },
                e("span", null, role),
                info.agent ? e("span", null, info.agent) : null,
                info.modelID ? e("span", null, info.providerID + " / " + info.modelID) : null,
                e("span", null, formatTime(metaTime))
              ),
              e("div", { className: "bubble" }, e(Markdown, { text: mainMessageText(message) })),
              activityParts.length && role !== "user" ? e("div", { className: "activity-card" },
                e("div", { className: "activity-title" }, "Live trace", e("span", { className: "mini" }, activityParts.length + " event" + (activityParts.length === 1 ? "" : "s"))),
                activityParts.slice(-5).map(function (part, index) {
                  return e("div", { className: "activity-row", key: (part.id || index) }, e("span", null, "step"), e("span", null, activityLabel(part)))
                })
              ) : null
            )
          })
        }

        function renderHistory() {
          if (!sessions.length) return e("p", { style: { color: "var(--muted)" } }, "No sessions yet.")
          return e("div", { className: "session-list" }, sessions.map(function (session) {
            var statusText = statusOf(status, session.id)
            return e("button", {
              key: session.id,
              type: "button",
              className: cx("session", session.id === activeSessionID && "active"),
              onClick: function () { setActiveSessionID(session.id); setHistoryOpen(false) }
            }, e("strong", null, sessionTitle(session)), e("small", null, statusText + " - " + formatTime(session.time && session.time.updated)))
          }))
        }

        function renderActivityDrawer() {
          return e(React.Fragment, null,
            e(Panel, { title: "Live stream", meta: activeStatus },
              activities.slice(0, 20).map(function (item, index) {
                return e("div", { className: "activity-row", key: item.time + "-" + index },
                  e("span", null, item.kind),
                  e("span", null, item.text + " - " + formatTime(item.time))
                )
              })
            ),
            e(Panel, { title: "Changed files", meta: String(changes.length) }, renderChanges()),
            e(Panel, { title: "Todos", meta: String(todos.length) }, renderTodos())
          )
        }

        function renderSettings() {
          return e(React.Fragment, null,
            e(Panel, { title: "Model", meta: selectedProviderID || "default" },
              e("div", { className: "field" }, e("label", null, "Provider"), e("select", { value: selectedProviderID, onChange: onProviderChange }, providers.map(function (provider) {
                return e("option", { key: provider.id, value: provider.id }, provider.name || provider.id)
              }))),
              e("div", { className: "field" }, e("label", null, "Model"), e("select", { value: selectedModelID, onChange: onModelChange }, models.map(function (model) {
                return e("option", { key: model.id, value: model.id }, model.name || model.id)
              }))),
              variants.length ? e("div", { className: "field" }, e("label", null, "Variant"), e("select", { value: selectedVariant, onChange: function (event) { setSelectedVariant(event.target.value) } }, e("option", { value: "" }, "default"), variants.map(function (variant) {
                return e("option", { key: variant, value: variant }, variant)
              }))) : null,
              e("div", { className: "field" }, e("label", null, "Agent"), e("select", { value: agent, onChange: function (event) { setAgent(event.target.value) } }, agents.map(function (item) {
                return e("option", { key: item, value: item }, item)
              })))
            ),
            e(Panel, { title: "Session", meta: activeSessionID ? "active" : "none" },
              e("input", { className: "rename-input", value: renameValue, onInput: function (event) { setRenameValue(event.target.value) }, placeholder: "Session title" }),
              e("div", { className: "row" },
                e("button", { className: "button", type: "button", disabled: !activeSessionID, onClick: function () { renameSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Rename"),
                e("button", { className: "button", type: "button", disabled: !activeSessionID, onClick: function () { selectTerminalSession(activeSessionID) } }, "Show in terminal"),
                e("button", { className: "button", type: "button", disabled: !activeSessionID || activeStatus === "idle", onClick: function () { abortSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Abort"),
                e("button", { className: "button danger", type: "button", disabled: !activeSessionID, onClick: function () { deleteSession().catch(function (err) { setError(err.message || String(err)) }) } }, "Delete")
              )
            ),
            e(Panel, { title: "Workspace", meta: initialDirectory ? "local" : "default" },
              e("div", { className: "kv" }, e("span", null, "Directory"), e("strong", null, initialDirectory || activeSession && activeSession.directory || "default")),
              e("div", { className: "kv" }, e("span", null, "Session"), e("strong", null, activeSessionID || "none")),
              e("div", { className: "kv" }, e("span", null, "Messages"), e("strong", null, String(messages.length))),
              e("div", { className: "kv" }, e("span", null, "Changes"), e("strong", null, String(changes.length)))
            )
          )
        }

        function renderChanges() {
          if (!changes.length) return e("div", { className: "change" }, e("strong", null, "No file changes yet"))
          return changes.map(function (change, index) {
            var statusText = change.status || "modified"
            return e("div", { className: "change", key: (change.file || "file") + index }, e("strong", null, change.file || "workspace"), e("small", null, e("span", { className: "status-" + statusText }, statusText), " - +" + (change.additions || 0) + " / -" + (change.deletions || 0)))
          })
        }

        function renderTodos() {
          if (!todos.length) return e("div", { className: "todo" }, e("strong", null, "No todos yet"))
          return todos.map(function (todo, index) {
            return e("div", { className: "todo", key: todo.content + index }, e("strong", null, todo.content || "Task"), e("small", null, (todo.status || "pending") + " - " + (todo.priority || "medium")))
          })
        }

        return e("main", { className: "app" },
          e("header", { className: "topbar" },
            e("div", { className: "brand" }, e("div", { className: "mark" }, "SC"), e("div", null, e("h1", null, "Sally Code"), e("p", null, activeSessionID ? "Local coding session" : "Coding assistant"))),
            e("nav", { className: "nav-pill" }, e("button", { className: "active", type: "button" }, "Sally"), e("button", { type: "button", onClick: function () { setActivityOpen(true) } }, "Activity"), e("button", { type: "button", onClick: function () { setSettingsOpen(true) } }, "Settings")),
            e("div", { className: "top-actions" },
              e("button", { className: "button", type: "button", onClick: function () { setHistoryOpen(true) } }, "History"),
              e("button", { className: "button model-summary", type: "button", onClick: function () { setSettingsOpen(true) } }, selectedModel ? (selectedProviderID + " / " + selectedModel.id) : "Model"),
              e("button", { className: "button primary", type: "button", onClick: function () { createSession().catch(function (err) { setError(err.message || String(err)) }) } }, "New Chat"),
              e("div", { className: "status-pill" }, e("span", { className: cx("dot", activeStatus !== "idle" && "busy") }), e("span", null, activeStatus === "idle" ? "ready" : activeStatus))
            )
          ),
          e("section", { className: "main" },
            e("div", { className: "chat-shell" },
              e("div", { className: "messages" }, renderMessages(), e("div", { ref: messageEndRef })),
              e("div", { className: "composer-wrap" },
                error ? e("div", { className: "error" }, error) : null,
                e("div", { className: "composer" },
                  e("button", { className: cx("live-strip", (latestActivity || activeStatus !== "idle") && "visible"), type: "button", onClick: function () { setActivityOpen(true) } },
                    e("span", null, e("strong", null, activeStatus === "idle" ? "Live activity" : "Sally is working"), " - " + (latestActivity ? latestActivity.text : "Waiting for updates")),
                    e("span", null, lastSync ? "synced " + lastSync : "open")
                  ),
                  e("form", { onSubmit: function (event) { event.preventDefault(); sendPrompt(input) } },
                    e("div", { className: "composer-box" },
                      e("textarea", { ref: inputRef, value: input, onInput: onInput, onKeyDown: onPromptKeyDown, placeholder: "Message Sally Code..." }),
                      e("button", { className: "send-button", type: "submit", disabled: sending || !input.trim(), title: "Send" }, sending ? "..." : "Send")
                    )
                  )
                )
              )
            )
          ),
          e(Drawer, { open: historyOpen, side: "left", title: "History", subtitle: sessions.length + " local sessions", onClose: function () { setHistoryOpen(false) } }, renderHistory()),
          e(Drawer, { open: settingsOpen, title: "Settings", subtitle: "Session and model", onClose: function () { setSettingsOpen(false) } }, renderSettings()),
          e(Drawer, { open: activityOpen, title: "Live activity", subtitle: activeStatus, onClose: function () { setActivityOpen(false) } }, renderActivityDrawer())
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
