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
      --panel-2: #161b22;
      --panel-3: #1d242d;
      --line: #28313d;
      --line-strong: #3a4654;
      --text: #f4f7fb;
      --muted: #93a0ad;
      --soft: #667483;
      --blue: #69a7ff;
      --green: #7bd88f;
      --orange: #ffaf74;
      --pink: #f08ab6;
      --shadow: rgba(0, 0, 0, 0.28);
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow: hidden;
    }

    button, textarea, input {
      font: inherit;
    }

    button {
      border: 0;
    }

    .app {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr) 340px;
      height: 100vh;
      min-height: 0;
    }

    .sidebar, .inspector {
      min-height: 0;
      background: var(--panel);
      border-color: var(--line);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .sidebar { border-right: 1px solid var(--line); }
    .inspector { border-left: 1px solid var(--line); }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px;
      border-bottom: 1px solid var(--line);
    }

    .mark {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--line-strong);
      background: var(--panel-3);
      color: var(--orange);
      font-weight: 800;
      letter-spacing: 0;
    }

    .brand h1 {
      margin: 0;
      font-size: 15px;
      line-height: 1.1;
      letter-spacing: 0;
    }

    .brand p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 12px;
    }

    .sidebar-actions {
      display: grid;
      gap: 8px;
      padding: 14px;
      border-bottom: 1px solid var(--line);
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      border-radius: 9px;
      padding: 0 12px;
      background: var(--panel-3);
      color: var(--text);
      border: 1px solid var(--line-strong);
      cursor: pointer;
      transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
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
      color: #d8ebff;
    }

    .button.primary:hover {
      background: #1c3b5f;
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
      margin: 0;
      padding: 16px 16px 8px;
      color: var(--soft);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0;
    }

    .session-list {
      min-height: 0;
      overflow: auto;
      padding: 0 10px 16px;
    }

    .session {
      width: 100%;
      display: grid;
      gap: 5px;
      text-align: left;
      border-radius: 10px;
      padding: 11px 10px;
      color: var(--text);
      background: transparent;
      cursor: pointer;
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
        linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.024) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 18px;
      border-bottom: 1px solid var(--line);
      background: rgba(11, 13, 16, 0.92);
      backdrop-filter: blur(14px);
    }

    .topbar h2 {
      margin: 0;
      font-size: 14px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .topbar small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #10151b;
      color: var(--muted);
      font-size: 12px;
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

    .messages {
      min-height: 0;
      overflow: auto;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .empty {
      margin: auto;
      width: min(620px, 100%);
      border: 1px solid var(--line);
      background: rgba(17, 21, 26, 0.86);
      border-radius: 12px;
      padding: 22px;
      box-shadow: 0 18px 50px var(--shadow);
    }

    .empty h3 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .empty p {
      margin: 0;
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
      padding: 0 12px;
      background: #161d25;
      border: 1px solid var(--line);
      color: var(--text);
      cursor: pointer;
    }

    .message {
      display: grid;
      gap: 6px;
      max-width: min(780px, 86%);
    }

    .message.user {
      align-self: flex-end;
    }

    .message.assistant {
      align-self: flex-start;
    }

    .message-meta {
      display: flex;
      gap: 8px;
      color: var(--soft);
      font-size: 11px;
      padding: 0 4px;
    }

    .bubble {
      border: 1px solid var(--line);
      background: rgba(18, 23, 29, 0.92);
      border-radius: 12px;
      padding: 12px 13px;
      line-height: 1.55;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .message.user .bubble {
      background: #173251;
      border-color: #2f679d;
      color: #ecf6ff;
    }

    .tool-line {
      color: var(--muted);
      font-size: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 8px;
      padding-top: 8px;
    }

    .composer {
      padding: 14px 18px 18px;
      border-top: 1px solid var(--line);
      background: rgba(11, 13, 16, 0.94);
      backdrop-filter: blur(14px);
    }

    .composer form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: end;
      max-width: 980px;
      margin: 0 auto;
    }

    textarea {
      width: 100%;
      resize: none;
      min-height: 58px;
      max-height: 180px;
      border-radius: 12px;
      border: 1px solid var(--line-strong);
      background: #10151b;
      color: var(--text);
      outline: none;
      padding: 12px 13px;
      line-height: 1.45;
    }

    textarea:focus {
      border-color: #4d84bd;
      box-shadow: 0 0 0 3px rgba(105, 167, 255, 0.12);
    }

    .inspector-scroll {
      min-height: 0;
      overflow: auto;
      padding: 14px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #11161d;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 11px 12px;
      border-bottom: 1px solid var(--line);
      color: var(--text);
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
      border-radius: 9px;
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

    .error {
      color: #ffd9d9;
      background: #321b1f;
      border: 1px solid #79434b;
      border-radius: 10px;
      padding: 10px;
      margin: 12px 14px 0;
      font-size: 12px;
      display: none;
    }

    @media (max-width: 1050px) {
      .app {
        grid-template-columns: 240px minmax(0, 1fr);
      }
      .inspector {
        display: none;
      }
    }

    @media (max-width: 760px) {
      body {
        overflow: auto;
      }
      .app {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 100vh;
      }
      .sidebar {
        max-height: 260px;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
      .main {
        min-height: 72vh;
      }
      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }
      .messages {
        padding: 16px;
      }
      .message {
        max-width: 96%;
      }
      .composer form {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">SC</div>
        <div>
          <h1>Sally Code</h1>
          <p>Local web workspace</p>
        </div>
      </div>
      <div class="sidebar-actions">
        <button class="button primary" id="new-session" type="button">New session</button>
        <button class="button" id="refresh" type="button">Refresh</button>
      </div>
      <p class="section-label"><span>Sessions</span><span id="session-count">0</span></p>
      <div class="session-list" id="sessions"></div>
    </aside>

    <section class="main">
      <div class="topbar">
        <div>
          <h2 id="active-title">Sally Web UI</h2>
          <small id="active-subtitle">Connecting to local workspace</small>
        </div>
        <div class="top-actions">
          <div class="status-pill"><span class="dot" id="status-dot"></span><span id="status-text">ready</span></div>
          <div class="status-pill" id="model-pill">model: default</div>
        </div>
      </div>
      <div class="error" id="error"></div>
      <div class="messages" id="messages"></div>
      <div class="composer">
        <form id="composer-form">
          <textarea id="prompt" placeholder="Ask Sally Code to edit, explain, test, or review this project"></textarea>
          <button class="button primary" id="send" type="submit">Send</button>
        </form>
      </div>
    </section>

    <aside class="inspector">
      <div class="brand">
        <div class="mark">LV</div>
        <div>
          <h1>Live view</h1>
          <p id="last-sync">Waiting for sync</p>
        </div>
      </div>
      <div class="inspector-scroll">
        <section class="panel">
          <div class="panel-header"><span>Workspace</span><span id="workspace-state">local</span></div>
          <div class="panel-body" id="workspace"></div>
        </section>
        <section class="panel">
          <div class="panel-header"><span>Changed files</span><span id="change-count">0</span></div>
          <div class="panel-body" id="changes"></div>
        </section>
        <section class="panel">
          <div class="panel-header"><span>Todos</span><span id="todo-count">0</span></div>
          <div class="panel-body" id="todos"></div>
        </section>
      </div>
    </aside>
  </main>

  <script>
    (function () {
      var params = new URLSearchParams(window.location.search)
      var pathParts = window.location.pathname.split("/").filter(Boolean)
      var state = {
        directory: params.get("directory") || "",
        activeSessionId: params.get("session") || (pathParts[0] === "sally" && pathParts[1] ? pathParts[1] : ""),
        sessions: [],
        status: {},
        messages: [],
        changes: [],
        todos: [],
        provider: null,
        model: null,
        busy: false,
        sending: false,
        error: ""
      }
      var els = {
        sessions: document.getElementById("sessions"),
        sessionCount: document.getElementById("session-count"),
        activeTitle: document.getElementById("active-title"),
        activeSubtitle: document.getElementById("active-subtitle"),
        statusText: document.getElementById("status-text"),
        statusDot: document.getElementById("status-dot"),
        modelPill: document.getElementById("model-pill"),
        error: document.getElementById("error"),
        messages: document.getElementById("messages"),
        prompt: document.getElementById("prompt"),
        send: document.getElementById("send"),
        form: document.getElementById("composer-form"),
        newSession: document.getElementById("new-session"),
        refresh: document.getElementById("refresh"),
        changes: document.getElementById("changes"),
        changeCount: document.getElementById("change-count"),
        todos: document.getElementById("todos"),
        todoCount: document.getElementById("todo-count"),
        workspace: document.getElementById("workspace"),
        workspaceState: document.getElementById("workspace-state"),
        lastSync: document.getElementById("last-sync")
      }

      function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
          return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
        })
      }

      function withDirectory(path) {
        var url = new URL(path, window.location.origin)
        if (state.directory) url.searchParams.set("directory", state.directory)
        return url.pathname + url.search
      }

      async function api(path, fallback, options) {
        var response = await fetch(withDirectory(path), options || {})
        if (!response.ok) {
          var message = await response.text().catch(function () { return "" })
          throw new Error(message || (response.status + " " + response.statusText))
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

      function getActiveSession() {
        return state.sessions.find(function (item) { return item.id === state.activeSessionId })
      }

      function getStatus(sessionID) {
        var status = state.status && state.status[sessionID]
        return status && status.type ? status.type : "idle"
      }

      function setError(error) {
        state.error = error ? (error.message || String(error)) : ""
        els.error.style.display = state.error ? "block" : "none"
        els.error.textContent = state.error
      }

      function updateLocation() {
        var url = new URL(window.location.href)
        if (state.activeSessionId) url.searchParams.set("session", state.activeSessionId)
        if (state.directory) url.searchParams.set("directory", state.directory)
        history.replaceState(null, "", url.pathname + url.search)
      }

      async function loadProvider() {
        var data = await api("/provider", null)
        if (!data || !Array.isArray(data.all) || data.all.length === 0) return
        var preferredIDs = Array.isArray(data.connected) && data.connected.length ? data.connected : Object.keys(data.default || {})
        var provider = data.all.find(function (item) { return item.id === "opencode" })
          || data.all.find(function (item) { return preferredIDs.indexOf(item.id) >= 0 })
          || data.all[0]
        var modelID = data.default && data.default[provider.id]
        if (!modelID) {
          var modelKeys = Object.keys(provider.models || {})
          modelID = modelKeys.length ? modelKeys[0] : ""
        }
        if (provider && modelID) {
          state.provider = provider
          state.model = { providerID: provider.id, modelID: modelID }
        }
      }

      async function loadSessions() {
        var result = await Promise.all([
          api("/session?limit=40", []),
          api("/session/status", {})
        ])
        state.sessions = Array.isArray(result[0]) ? result[0] : []
        state.status = result[1] || {}
        if (!state.activeSessionId && state.sessions.length) state.activeSessionId = state.sessions[0].id
      }

      async function createSession() {
        var title = "Sally Web - " + new Date().toLocaleString()
        var session = await api("/session", null, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: title })
        })
        if (session && session.id) state.activeSessionId = session.id
        updateLocation()
        await loadSessions()
        await loadActive()
        render()
      }

      async function loadActive() {
        if (!state.activeSessionId) {
          state.messages = []
          state.changes = []
          state.todos = []
          return
        }
        var id = encodeURIComponent(state.activeSessionId)
        var result = await Promise.all([
          api("/session/" + id + "/message", []),
          api("/session/" + id + "/diff", []),
          api("/session/" + id + "/todo", []),
          api("/session/status", {})
        ])
        state.messages = Array.isArray(result[0]) ? result[0] : []
        state.changes = Array.isArray(result[1]) ? result[1] : []
        state.todos = Array.isArray(result[2]) ? result[2] : []
        state.status = result[3] || state.status || {}
        state.busy = getStatus(state.activeSessionId) !== "idle"
      }

      async function refreshAll() {
        try {
          setError()
          await loadSessions()
          if (!state.activeSessionId && state.sessions.length === 0) await createSession()
          else await loadActive()
          render()
        } catch (error) {
          setError(error)
          render()
        }
      }

      async function selectSession(sessionID) {
        state.activeSessionId = sessionID
        updateLocation()
        await loadActive()
        render()
      }

      async function sendPrompt(text) {
        var trimmed = text.trim()
        if (!trimmed || state.sending) return
        if (!state.activeSessionId) await createSession()
        if (!state.model) await loadProvider().catch(function () {})
        var payload = {
          agent: "build",
          parts: [{ type: "text", text: trimmed }]
        }
        if (state.model) payload.model = state.model
        state.sending = true
        renderComposer()
        try {
          await api("/session/" + encodeURIComponent(state.activeSessionId) + "/prompt_async", null, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          })
          els.prompt.value = ""
          await refreshAll()
        } catch (error) {
          setError(error)
        } finally {
          state.sending = false
          renderComposer()
        }
      }

      function renderSessions() {
        els.sessionCount.textContent = String(state.sessions.length)
        if (!state.sessions.length) {
          els.sessions.innerHTML = '<div class="session-meta" style="padding: 10px;">No sessions yet.</div>'
          return
        }
        els.sessions.innerHTML = state.sessions.map(function (session) {
          var active = session.id === state.activeSessionId ? " active" : ""
          var status = getStatus(session.id)
          return '<button class="session' + active + '" data-session="' + escapeHtml(session.id) + '" type="button">'
            + '<span class="session-title">' + escapeHtml(sessionTitle(session)) + '</span>'
            + '<span class="session-meta">' + escapeHtml(status) + ' - ' + escapeHtml(formatTime(session.time && session.time.updated)) + '</span>'
            + '</button>'
        }).join("")
        Array.prototype.forEach.call(els.sessions.querySelectorAll("[data-session]"), function (button) {
          button.addEventListener("click", function () {
            selectSession(button.getAttribute("data-session"))
          })
        })
      }

      function partText(part) {
        if (!part) return ""
        if (part.type === "text" || part.type === "reasoning") return part.text || ""
        if (part.type === "file") return "Attached file: " + (part.filename || part.url || "file")
        if (part.type === "tool") return "Tool: " + (part.title || part.tool || part.name || "running")
        if (part.type === "agent") return "Agent: " + (part.name || "subagent")
        if (part.type === "patch") return "Patch: " + ((part.files || []).join(", ") || part.hash || "workspace")
        return ""
      }

      function messageText(message) {
        var parts = Array.isArray(message.parts) ? message.parts : []
        var text = parts.map(partText).filter(Boolean).join("\\n")
        if (text.trim()) return text
        if (message.info && message.info.error) return "Error: " + (message.info.error.message || message.info.error.name || "failed")
        return "No visible content yet."
      }

      function renderMessages() {
        if (!state.messages.length) {
          els.messages.innerHTML = '<div class="empty">'
            + '<h3>Start a local coding session</h3>'
            + '<p>Ask Sally to inspect the project, change files, run tests, or explain how the codebase works. The terminal and this web view share the same local workspace.</p>'
            + '<div class="suggestions">'
            + '<button class="suggestion" data-suggest="Explain how this codebase is organized">Explain project</button>'
            + '<button class="suggestion" data-suggest="Find likely bugs and missing tests in this workspace">Find bugs</button>'
            + '<button class="suggestion" data-suggest="Run the relevant tests and fix any failures">Fix tests</button>'
            + '</div></div>'
          Array.prototype.forEach.call(els.messages.querySelectorAll("[data-suggest]"), function (button) {
            button.addEventListener("click", function () {
              els.prompt.value = button.getAttribute("data-suggest") || ""
              els.prompt.focus()
            })
          })
          return
        }
        els.messages.innerHTML = state.messages.map(function (message) {
          var info = message.info || {}
          var role = info.role || "assistant"
          var time = info.time && (info.time.created || info.time.completed)
          var meta = escapeHtml(role) + (info.agent ? " - " + escapeHtml(info.agent) : "") + " - " + escapeHtml(formatTime(time))
          var text = escapeHtml(messageText(message))
          var toolCount = (message.parts || []).filter(function (part) { return part.type && part.type !== "text" && part.type !== "reasoning" }).length
          var tools = toolCount ? '<div class="tool-line">' + toolCount + ' activity item' + (toolCount === 1 ? '' : 's') + '</div>' : ''
          return '<article class="message ' + escapeHtml(role) + '">'
            + '<div class="message-meta"><span>' + meta + '</span></div>'
            + '<div class="bubble">' + text + tools + '</div>'
            + '</article>'
        }).join("")
        els.messages.scrollTop = els.messages.scrollHeight
      }

      function renderChanges() {
        els.changeCount.textContent = String(state.changes.length)
        if (!state.changes.length) {
          els.changes.innerHTML = '<div class="change"><strong>No file changes yet</strong><small>Edits will appear here as Sally works.</small></div>'
          return
        }
        els.changes.innerHTML = state.changes.map(function (change) {
          var status = change.status || "modified"
          var name = change.file || "workspace"
          var add = typeof change.additions === "number" ? change.additions : 0
          var del = typeof change.deletions === "number" ? change.deletions : 0
          return '<div class="change">'
            + '<strong>' + escapeHtml(name) + '</strong>'
            + '<small><span class="status-' + escapeHtml(status) + '">' + escapeHtml(status) + '</span> - +' + add + ' / -' + del + '</small>'
            + '</div>'
        }).join("")
      }

      function renderTodos() {
        els.todoCount.textContent = String(state.todos.length)
        if (!state.todos.length) {
          els.todos.innerHTML = '<div class="todo"><strong>No todos yet</strong><small>Task planning will appear here when the agent creates it.</small></div>'
          return
        }
        els.todos.innerHTML = state.todos.map(function (todo) {
          return '<div class="todo">'
            + '<strong>' + escapeHtml(todo.content || "Task") + '</strong>'
            + '<small>' + escapeHtml(todo.status || "pending") + ' - ' + escapeHtml(todo.priority || "medium") + '</small>'
            + '</div>'
        }).join("")
      }

      function renderWorkspace(active) {
        var status = active ? getStatus(active.id) : "idle"
        els.workspaceState.textContent = status
        els.workspace.innerHTML = [
          '<div class="kv"><span>Directory</span><strong>' + escapeHtml(state.directory || (active && active.directory) || "default") + '</strong></div>',
          '<div class="kv"><span>Session</span><strong>' + escapeHtml(active ? active.id : "none") + '</strong></div>',
          '<div class="kv"><span>Messages</span><strong>' + String(state.messages.length) + '</strong></div>',
          '<div class="kv"><span>Changes</span><strong>' + String(state.changes.length) + '</strong></div>'
        ].join("")
      }

      function renderComposer() {
        els.send.disabled = state.sending
        els.send.textContent = state.sending ? "Sending" : "Send"
      }

      function renderHeader() {
        var active = getActiveSession()
        var status = active ? getStatus(active.id) : "idle"
        els.activeTitle.textContent = sessionTitle(active)
        els.activeSubtitle.textContent = active ? ((active.directory || state.directory || "local workspace") + " - " + active.id) : "No active session"
        els.statusText.textContent = status === "idle" ? "ready" : status
        els.statusDot.className = "dot" + (status === "idle" ? "" : " busy")
        els.modelPill.textContent = state.model ? ("model: " + state.model.providerID + " / " + state.model.modelID) : "model: default"
        els.lastSync.textContent = "Synced " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        renderWorkspace(active)
      }

      function render() {
        renderSessions()
        renderHeader()
        renderMessages()
        renderChanges()
        renderTodos()
        renderComposer()
      }

      els.form.addEventListener("submit", function (event) {
        event.preventDefault()
        sendPrompt(els.prompt.value)
      })

      els.prompt.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault()
          sendPrompt(els.prompt.value)
        }
      })

      els.prompt.addEventListener("input", function () {
        els.prompt.style.height = "auto"
        els.prompt.style.height = Math.min(180, els.prompt.scrollHeight) + "px"
      })

      els.newSession.addEventListener("click", function () {
        createSession().catch(setError)
      })

      els.refresh.addEventListener("click", function () {
        refreshAll()
      })

      async function start() {
        try {
          await Promise.all([
            loadProvider().catch(function () {}),
            loadSessions()
          ])
          if (!state.activeSessionId && state.sessions.length === 0) await createSession()
          else await loadActive()
          updateLocation()
          render()
          setInterval(refreshAll, 1600)
        } catch (error) {
          setError(error)
          render()
        }
      }

      start()
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
