import { SessionID } from "@/session/schema"
import { Effect, Schema } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

const Params = Schema.Struct({
  sessionID: SessionID,
})

function sessionMapHtml(sessionID: SessionID) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sally Code Session Map</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1012;
      --panel: #17191d;
      --panel-2: #1f2228;
      --line: #2e333c;
      --text: #f4f1ea;
      --muted: #9aa0a9;
      --accent: #ff9f75;
      --blue: #6fb7ff;
      --green: #a7d96a;
      --pink: #e88bb3;
      --purple: #b997ff;
      --yellow: #f2cc60;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      overflow: hidden;
    }

    button, input, a {
      font: inherit;
    }

    .shell {
      display: grid;
      grid-template-columns: 290px minmax(0, 1fr) 330px;
      height: 100vh;
    }

    .sidebar, .details {
      background: var(--panel);
      border-color: var(--line);
      padding: 18px;
      overflow: auto;
    }

    .sidebar { border-right: 1px solid var(--line); }
    .details { border-left: 1px solid var(--line); }

    .brand {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 18px;
    }

    .mark {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--accent);
      font-weight: 800;
      border-radius: 8px;
    }

    h1 {
      margin: 0;
      font-size: 17px;
      line-height: 1.2;
    }

    .session-id {
      margin-top: 3px;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .search {
      width: 100%;
      height: 36px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #101215;
      color: var(--text);
      padding: 0 11px;
      outline: none;
    }

    .search:focus {
      border-color: var(--accent);
    }

    .section-title {
      margin: 20px 0 9px;
      color: var(--muted);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .stat {
      border: 1px solid var(--line);
      background: #121419;
      border-radius: 8px;
      padding: 10px;
    }

    .stat strong {
      display: block;
      font-size: 19px;
    }

    .stat span {
      display: block;
      margin-top: 2px;
      color: var(--muted);
      font-size: 11px;
    }

    .filters {
      display: grid;
      gap: 7px;
    }

    .filter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border: 1px solid var(--line);
      background: #121419;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      color: var(--text);
    }

    .filter input { accent-color: var(--accent); }
    .filter small { color: var(--muted); }

    .actions {
      display: grid;
      gap: 8px;
    }

    .action {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 36px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      text-decoration: none;
      cursor: pointer;
    }

    .action.primary {
      border-color: rgba(255, 159, 117, 0.4);
      background: #2a201d;
      color: #ffd6c3;
    }

    .canvas {
      position: relative;
      min-width: 0;
      background:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
        var(--bg);
      background-size: 28px 28px;
    }

    .toolbar {
      position: absolute;
      z-index: 2;
      top: 16px;
      left: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      pointer-events: none;
    }

    .pill {
      pointer-events: auto;
      border: 1px solid var(--line);
      background: rgba(23, 25, 29, 0.92);
      border-radius: 8px;
      padding: 8px 10px;
      color: var(--muted);
      font-size: 12px;
      backdrop-filter: blur(10px);
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .edge {
      stroke: #3a404a;
      stroke-width: 1.2;
      opacity: 0.62;
    }

    .node {
      cursor: grab;
    }

    .node:active {
      cursor: grabbing;
    }

    .node circle {
      stroke: #0f1012;
      stroke-width: 2.5;
    }

    .node.selected circle {
      stroke: var(--accent);
      stroke-width: 4;
    }

    .node text {
      fill: var(--text);
      paint-order: stroke;
      stroke: rgba(15,16,18,0.9);
      stroke-width: 4px;
      stroke-linejoin: round;
      font-size: 12px;
      pointer-events: none;
      user-select: none;
    }

    .empty, .error {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--muted);
      padding: 24px;
      text-align: center;
    }

    .error { color: #ff9a9a; }

    .detail-title {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 6px;
      overflow-wrap: anywhere;
    }

    .detail-type {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--muted);
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 11px;
      margin-bottom: 14px;
    }

    .detail-body {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: #d7d2c8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.55;
    }

    .list {
      display: grid;
      gap: 7px;
      margin-top: 12px;
    }

    .list button {
      text-align: left;
      width: 100%;
      border: 1px solid var(--line);
      background: #121419;
      color: var(--text);
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      overflow-wrap: anywhere;
    }

    .notice {
      margin-top: 14px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    @media (max-width: 1000px) {
      body { overflow: auto; }
      .shell {
        grid-template-columns: 1fr;
        height: auto;
        min-height: 100vh;
      }
      .sidebar, .details {
        border: 0;
      }
      .canvas {
        height: 72vh;
        min-height: 520px;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">S</div>
        <div>
          <h1>Session Map</h1>
          <div class="session-id" id="sessionId"></div>
        </div>
      </div>

      <input id="search" class="search" type="search" placeholder="Search graph" autocomplete="off" />

      <div class="section-title">Overview</div>
      <div class="stat-grid" id="stats"></div>

      <div class="section-title">Show</div>
      <div class="filters" id="filters"></div>

      <div class="section-title">Actions</div>
      <div class="actions">
        <a class="action primary" id="chatLink" href="/">Open chat</a>
        <button class="action" id="fit">Fit graph</button>
      </div>

      <p class="notice">Click a node to inspect it. Drag nodes to rearrange the graph. Open chat returns to the same session in the browser.</p>
    </aside>

    <section class="canvas">
      <div class="toolbar">
        <div class="pill" id="status">Loading session memory graph...</div>
        <div class="pill">Messages, tools, files, todos, diffs, and child sessions</div>
      </div>
      <svg id="graph" viewBox="0 0 1200 760" role="img" aria-label="Interactive session graph"></svg>
      <div class="empty" id="empty" hidden>No graph nodes match your filters.</div>
      <div class="error" id="error" hidden></div>
    </section>

    <aside class="details">
      <div class="detail-title" id="detailTitle">Choose a node</div>
      <div class="detail-type" id="detailType">memory graph</div>
      <div class="detail-body" id="detailBody">Select any node to see the message, tool call, file, todo, diff, or child session behind it.</div>
      <div class="section-title">Connected</div>
      <div class="list" id="related"></div>
    </aside>
  </main>

  <script>
    var SESSION_ID = ${JSON.stringify(sessionID)}
    var WIDTH = 1200
    var HEIGHT = 760
    var MAX_MESSAGES = 180
    var MAX_NODES = 520
    var TYPES = ["user", "assistant", "tool", "file", "todo", "diff", "child", "section"]
    var COLORS = {
      session: "#ff9f75",
      section: "#f4f1ea",
      user: "#6fb7ff",
      assistant: "#a7d96a",
      tool: "#f2cc60",
      file: "#7dd3fc",
      todo: "#c4e36b",
      diff: "#f08aa3",
      child: "#b997ff",
      omitted: "#9aa0a9"
    }
    var SECTION = {
      messages: { x: 280, y: 340, label: "Messages" },
      tools: { x: 760, y: 230, label: "Tools" },
      files: { x: 840, y: 545, label: "Files" },
      todos: { x: 330, y: 590, label: "Todos" },
      diffs: { x: 1000, y: 380, label: "Diffs" },
      children: { x: 585, y: 645, label: "Children" }
    }
    var state = {
      graph: undefined,
      hidden: new Set(),
      selected: "session",
      search: "",
      directory: new URLSearchParams(location.search).get("directory") || "",
      dragging: undefined
    }

    var svg = document.getElementById("graph")
    var statsEl = document.getElementById("stats")
    var filtersEl = document.getElementById("filters")
    var statusEl = document.getElementById("status")
    var emptyEl = document.getElementById("empty")
    var errorEl = document.getElementById("error")
    var searchEl = document.getElementById("search")
    var detailTitle = document.getElementById("detailTitle")
    var detailType = document.getElementById("detailType")
    var detailBody = document.getElementById("detailBody")
    var relatedEl = document.getElementById("related")
    var chatLink = document.getElementById("chatLink")
    document.getElementById("sessionId").textContent = SESSION_ID

    function escapeHtml(input) {
      return String(input == null ? "" : input)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
    }

    function shortText(input, max) {
      var text = String(input == null ? "" : input).replace(/\\s+/g, " ").trim()
      if (text.length <= max) return text
      return text.slice(0, Math.max(0, max - 1)) + "..."
    }

    function json(value) {
      try {
        return JSON.stringify(value, null, 2)
      } catch (_) {
        return String(value)
      }
    }

    function queryString() {
      var query = new URLSearchParams()
      if (state.directory) query.set("directory", state.directory)
      return query.toString()
    }

    async function api(path, fallback) {
      var url = new URL(path, location.origin)
      if (state.directory) url.searchParams.set("directory", state.directory)
      var response = await fetch(url)
      if (!response.ok) {
        if (fallback !== undefined) return fallback
        throw new Error(path + " failed with HTTP " + response.status)
      }
      return response.json()
    }

    function base64Encode(value) {
      var bytes = new TextEncoder().encode(value)
      var binary = ""
      for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      return btoa(binary).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=/g, "")
    }

    function updateChatLink(session) {
      var directory = state.directory || session.directory || ""
      if (!directory) {
        chatLink.href = "/session/" + encodeURIComponent(SESSION_ID)
        return
      }
      chatLink.href = "/" + base64Encode(directory) + "/session/" + encodeURIComponent(SESSION_ID)
    }

    function messageInfo(message) {
      return message.info || message
    }

    function messageParts(message) {
      return message.parts || message.part || []
    }

    function partText(part) {
      if (!part) return ""
      if (part.type === "text") return part.text || ""
      if (part.type === "reasoning") return part.text || part.reasoning || ""
      if (part.type === "tool") {
        var stateInfo = part.state || {}
        return [part.tool, stateInfo.title, json(stateInfo.input), stateInfo.output].filter(Boolean).join("\\n")
      }
      if (part.type === "file") return part.filename || part.url || ""
      return json(part)
    }

    function addNode(map, node) {
      if (!map.has(node.id)) map.set(node.id, node)
      return map.get(node.id)
    }

    function addEdge(edges, from, to, label) {
      if (!from || !to || from === to) return
      edges.push({ from: from, to: to, label: label || "" })
    }

    function pathCandidates(value, result, depth) {
      if (!result) result = new Set()
      if (depth > 4 || value == null) return result
      if (typeof value === "string") {
        var matches = value.match(/(?:[A-Za-z]:\\\\|\\.\\.?[\\\\/]|[\\w.-]+[\\\\/])[\\w. @()[\\]{}+~#,$%&!=\\\\/-]+\\.[A-Za-z0-9]{1,10}/g) || []
        for (var i = 0; i < matches.length; i++) {
          var cleaned = matches[i].replace(/[),.;:]+$/g, "")
          if (cleaned.length <= 180) result.add(cleaned)
        }
        return result
      }
      if (Array.isArray(value)) {
        for (var a = 0; a < value.length; a++) pathCandidates(value[a], result, depth + 1)
        return result
      }
      if (typeof value === "object") {
        for (var key in value) pathCandidates(value[key], result, depth + 1)
      }
      return result
    }

    function sectionId(name) {
      return "section:" + name
    }

    function addSectionNodes(nodes, edges) {
      addNode(nodes, {
        id: "session",
        type: "session",
        label: "Session",
        title: "Current session",
        body: "This is the root of the current Sally Code conversation graph.",
        x: WIDTH / 2,
        y: HEIGHT / 2,
        fixed: true,
        radius: 28
      })
      Object.keys(SECTION).forEach(function (key) {
        var item = SECTION[key]
        addNode(nodes, {
          id: sectionId(key),
          type: "section",
          section: key,
          label: item.label,
          title: item.label,
          body: "Graph section for " + item.label.toLowerCase() + ".",
          x: item.x,
          y: item.y,
          fixed: true,
          radius: 19
        })
        addEdge(edges, "session", sectionId(key), "section")
      })
    }

    function buildGraph(input) {
      var nodes = new Map()
      var edges = []
      var stats = {
        messages: input.messages.length,
        tools: 0,
        files: 0,
        todos: input.todos.length,
        diffs: input.diffs.length,
        children: input.children.length,
        omitted: 0
      }
      addSectionNodes(nodes, edges)

      var messages = input.messages
      if (messages.length > MAX_MESSAGES) {
        stats.omitted += messages.length - MAX_MESSAGES
        messages = messages.slice(messages.length - MAX_MESSAGES)
        addNode(nodes, {
          id: "omitted:messages",
          type: "omitted",
          label: String(stats.omitted) + " older",
          title: "Older messages hidden",
          body: String(stats.omitted) + " older messages are hidden to keep this graph responsive.",
          radius: 15
        })
        addEdge(edges, sectionId("messages"), "omitted:messages", "older")
      }

      var previousMessage = ""
      messages.forEach(function (message, index) {
        var info = messageInfo(message)
        var parts = messageParts(message)
        var role = info.role || "message"
        var text = parts.map(partText).filter(Boolean).join("\\n\\n")
        var messageId = "message:" + info.id
        addNode(nodes, {
          id: messageId,
          type: role === "assistant" ? "assistant" : "user",
          section: "messages",
          label: role === "assistant" ? "Assistant " + (index + 1) : "User " + (index + 1),
          title: (role || "message") + " message",
          body: text || json(info),
          ref: info.id,
          radius: role === "assistant" ? 17 : 16
        })
        addEdge(edges, sectionId("messages"), messageId, role)
        if (previousMessage) addEdge(edges, previousMessage, messageId, "next")
        previousMessage = messageId

        parts.forEach(function (part, partIndex) {
          if (part.type === "tool") {
            stats.tools += 1
            var stateInfo = part.state || {}
            var toolName = part.tool || part.name || "tool"
            var toolId = "tool:" + (part.id || info.id + ":" + partIndex)
            addNode(nodes, {
              id: toolId,
              type: "tool",
              section: "tools",
              label: toolName,
              title: toolName,
              body: json({
                status: stateInfo.status,
                title: stateInfo.title,
                input: stateInfo.input,
                output: stateInfo.output,
                metadata: stateInfo.metadata
              }),
              ref: part.id,
              radius: 14
            })
            addEdge(edges, messageId, toolId, "called")
            addEdge(edges, sectionId("tools"), toolId, "tool")

            pathCandidates(stateInfo.input).forEach(function (file) {
              var fileId = "file:" + file
              if (!nodes.has(fileId)) stats.files += 1
              addNode(nodes, {
                id: fileId,
                type: "file",
                section: "files",
                label: file.split(/[\\\\/]/).pop() || file,
                title: file,
                body: file,
                ref: file,
                radius: 12
              })
              addEdge(edges, toolId, fileId, "input")
              addEdge(edges, sectionId("files"), fileId, "file")
            })

            var metadata = stateInfo.metadata || {}
            if (metadata.sessionId) {
              var childIdFromTool = "child:" + metadata.sessionId
              addNode(nodes, {
                id: childIdFromTool,
                type: "child",
                section: "children",
                label: "Subagent",
                title: "Subagent session",
                body: metadata.sessionId,
                ref: metadata.sessionId,
                radius: 14
              })
              addEdge(edges, toolId, childIdFromTool, "spawned")
              addEdge(edges, sectionId("children"), childIdFromTool, "child")
            }
          }

          if (part.type === "file") {
            var filename = part.filename || part.url || "file"
            var filePartId = "file:" + filename
            if (!nodes.has(filePartId)) stats.files += 1
            addNode(nodes, {
              id: filePartId,
              type: "file",
              section: "files",
              label: filename.split(/[\\\\/]/).pop() || filename,
              title: filename,
              body: json(part),
              ref: filename,
              radius: 12
            })
            addEdge(edges, messageId, filePartId, "attached")
            addEdge(edges, sectionId("files"), filePartId, "file")
          }
        })
      })

      input.todos.forEach(function (todo, index) {
        var todoId = "todo:" + (todo.id || index)
        var title = todo.title || todo.content || todo.text || "Todo"
        addNode(nodes, {
          id: todoId,
          type: "todo",
          section: "todos",
          label: shortText(title, 18),
          title: title,
          body: json(todo),
          ref: todo.id,
          radius: 13
        })
        addEdge(edges, sectionId("todos"), todoId, "todo")
      })

      input.diffs.forEach(function (diff, index) {
        var file = diff.file || diff.path || diff.name || "diff-" + index
        var diffId = "diff:" + file
        addNode(nodes, {
          id: diffId,
          type: "diff",
          section: "diffs",
          label: file.split(/[\\\\/]/).pop() || file,
          title: file,
          body: json(diff),
          ref: file,
          radius: 12
        })
        addEdge(edges, sectionId("diffs"), diffId, "diff")
        var linkedFileId = "file:" + file
        if (!nodes.has(linkedFileId)) stats.files += 1
        addNode(nodes, {
          id: linkedFileId,
          type: "file",
          section: "files",
          label: file.split(/[\\\\/]/).pop() || file,
          title: file,
          body: file,
          ref: file,
          radius: 12
        })
        addEdge(edges, diffId, linkedFileId, "changes")
        addEdge(edges, sectionId("files"), linkedFileId, "file")
      })

      input.children.forEach(function (child) {
        var childId = "child:" + child.id
        addNode(nodes, {
          id: childId,
          type: "child",
          section: "children",
          label: shortText(child.title || "Child", 18),
          title: child.title || child.id,
          body: json(child),
          ref: child.id,
          radius: 14
        })
        addEdge(edges, sectionId("children"), childId, "child")
      })

      var list = Array.from(nodes.values())
      if (list.length > MAX_NODES) {
        var keep = new Set(["session"])
        TYPES.forEach(function (type) {
          keep.add(sectionId(type + "s"))
        })
        list = list.filter(function (node, index) {
          return node.fixed || index < MAX_NODES
        })
        var allowed = new Set(list.map(function (node) { return node.id }))
        edges = edges.filter(function (edge) {
          return allowed.has(edge.from) && allowed.has(edge.to)
        })
      }

      return { nodes: list, edges: edges, stats: stats }
    }

    function initializePositions(graph) {
      graph.nodes.forEach(function (node, index) {
        if (typeof node.x === "number" && typeof node.y === "number") return
        var section = SECTION[node.section || "messages"] || { x: WIDTH / 2, y: HEIGHT / 2 }
        var angle = (index * 2.399963229728653) % (Math.PI * 2)
        var radius = 60 + (index % 8) * 18
        node.x = section.x + Math.cos(angle) * radius
        node.y = section.y + Math.sin(angle) * radius
      })
    }

    function layout(graph) {
      initializePositions(graph)
      var byId = new Map(graph.nodes.map(function (node) { return [node.id, node] }))
      for (var step = 0; step < 170; step++) {
        for (var i = 0; i < graph.nodes.length; i++) {
          var a = graph.nodes[i]
          if (a.fixed) continue
          var ax = 0
          var ay = 0
          var section = SECTION[a.section || "messages"] || { x: WIDTH / 2, y: HEIGHT / 2 }
          ax += (section.x - a.x) * 0.004
          ay += (section.y - a.y) * 0.004
          for (var j = i + 1; j < graph.nodes.length; j++) {
            var b = graph.nodes[j]
            var dx = a.x - b.x
            var dy = a.y - b.y
            var dist2 = Math.max(80, dx * dx + dy * dy)
            var force = 900 / dist2
            ax += dx * force
            ay += dy * force
            if (!b.fixed) {
              b.x -= dx * force
              b.y -= dy * force
            }
          }
          a.x += ax
          a.y += ay
          a.x = Math.max(50, Math.min(WIDTH - 50, a.x))
          a.y = Math.max(70, Math.min(HEIGHT - 50, a.y))
        }
        graph.edges.forEach(function (edge) {
          var from = byId.get(edge.from)
          var to = byId.get(edge.to)
          if (!from || !to || from.fixed && to.fixed) return
          var dx = to.x - from.x
          var dy = to.y - from.y
          var distance = Math.sqrt(dx * dx + dy * dy) || 1
          var target = 105
          var pull = (distance - target) * 0.008
          if (!from.fixed) {
            from.x += dx / distance * pull
            from.y += dy / distance * pull
          }
          if (!to.fixed) {
            to.x -= dx / distance * pull
            to.y -= dy / distance * pull
          }
        })
      }
    }

    function visibleNode(node) {
      if (state.hidden.has(node.type)) return false
      if (!state.search) return true
      if (node.type === "session" || node.type === "section") return true
      var haystack = [node.label, node.title, node.body, node.ref, node.type].join(" ").toLowerCase()
      return haystack.indexOf(state.search) !== -1
    }

    function renderStats(graph) {
      var items = [
        ["Messages", graph.stats.messages],
        ["Tools", graph.stats.tools],
        ["Files", graph.stats.files],
        ["Todos", graph.stats.todos],
        ["Diffs", graph.stats.diffs],
        ["Children", graph.stats.children]
      ]
      statsEl.innerHTML = items.map(function (item) {
        return '<div class="stat"><strong>' + escapeHtml(item[1]) + '</strong><span>' + escapeHtml(item[0]) + '</span></div>'
      }).join("")
    }

    function renderFilters(graph) {
      var counts = graph.nodes.reduce(function (acc, node) {
        acc[node.type] = (acc[node.type] || 0) + 1
        return acc
      }, {})
      filtersEl.innerHTML = TYPES.map(function (type) {
        return '<label class="filter"><span><input type="checkbox" data-type="' + escapeHtml(type) + '" checked /> ' + escapeHtml(type) + '</span><small>' + escapeHtml(counts[type] || 0) + '</small></label>'
      }).join("")
      filtersEl.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("change", function () {
          if (input.checked) state.hidden.delete(input.dataset.type)
          else state.hidden.add(input.dataset.type)
          renderGraph()
        })
      })
    }

    function renderGraph() {
      var graph = state.graph
      if (!graph) return
      var visible = new Set(graph.nodes.filter(visibleNode).map(function (node) { return node.id }))
      var visibleNodes = graph.nodes.filter(function (node) { return visible.has(node.id) })
      var visibleEdges = graph.edges.filter(function (edge) { return visible.has(edge.from) && visible.has(edge.to) })
      var byId = new Map(graph.nodes.map(function (node) { return [node.id, node] }))
      emptyEl.hidden = visibleNodes.length > 0
      svg.innerHTML =
        '<g class="edges">' +
        visibleEdges.map(function (edge) {
          var from = byId.get(edge.from)
          var to = byId.get(edge.to)
          return '<line class="edge" x1="' + from.x + '" y1="' + from.y + '" x2="' + to.x + '" y2="' + to.y + '"></line>'
        }).join("") +
        '</g><g class="nodes">' +
        visibleNodes.map(function (node) {
          var selected = node.id === state.selected ? " selected" : ""
          var color = COLORS[node.type] || COLORS.section
          var radius = node.radius || 13
          return '<g class="node' + selected + '" data-id="' + escapeHtml(node.id) + '" transform="translate(' + node.x + ' ' + node.y + ')"><circle r="' + radius + '" fill="' + color + '"></circle><text x="' + (radius + 7) + '" y="4">' + escapeHtml(shortText(node.label || node.title, 24)) + '</text></g>'
        }).join("") +
        '</g>'
      svg.querySelectorAll(".node").forEach(function (nodeEl) {
        nodeEl.addEventListener("click", function (event) {
          event.stopPropagation()
          selectNode(nodeEl.dataset.id)
        })
        nodeEl.addEventListener("mousedown", function (event) {
          var node = byId.get(nodeEl.dataset.id)
          if (!node || node.fixed) return
          state.dragging = { node: node, x: event.clientX, y: event.clientY }
        })
      })
      if (state.selected) renderDetails(state.selected)
    }

    function selectNode(id) {
      state.selected = id
      renderGraph()
    }

    function renderDetails(id) {
      var graph = state.graph
      var node = graph.nodes.find(function (item) { return item.id === id })
      if (!node) return
      detailTitle.textContent = node.title || node.label || node.id
      detailType.textContent = node.type
      detailBody.textContent = node.body || node.ref || ""
      var related = graph.edges
        .filter(function (edge) { return edge.from === id || edge.to === id })
        .map(function (edge) { return edge.from === id ? edge.to : edge.from })
        .map(function (relatedId) { return graph.nodes.find(function (item) { return item.id === relatedId }) })
        .filter(Boolean)
        .slice(0, 18)
      relatedEl.innerHTML = related.map(function (item) {
        return '<button data-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.label || item.title || item.id) + '<br><small>' + escapeHtml(item.type) + '</small></button>'
      }).join("") || '<div class="notice">No direct connections.</div>'
      relatedEl.querySelectorAll("button").forEach(function (button) {
        button.addEventListener("click", function () {
          selectNode(button.dataset.id)
        })
      })
    }

    function fitGraph() {
      svg.setAttribute("viewBox", "0 0 " + WIDTH + " " + HEIGHT)
    }

    async function load() {
      try {
        var session = await api("/session/" + encodeURIComponent(SESSION_ID))
        if (!state.directory && session.directory) state.directory = session.directory
        updateChatLink(session)
        var query = queryString()
        history.replaceState(null, "", location.pathname + (query ? "?" + query : ""))
        var results = await Promise.all([
          api("/session/" + encodeURIComponent(SESSION_ID) + "/message", []),
          api("/session/" + encodeURIComponent(SESSION_ID) + "/children", []),
          api("/session/" + encodeURIComponent(SESSION_ID) + "/todo", []),
          api("/session/" + encodeURIComponent(SESSION_ID) + "/diff", [])
        ])
        var graph = buildGraph({
          session: session,
          messages: Array.isArray(results[0]) ? results[0] : [],
          children: Array.isArray(results[1]) ? results[1] : [],
          todos: Array.isArray(results[2]) ? results[2] : [],
          diffs: Array.isArray(results[3]) ? results[3] : []
        })
        layout(graph)
        state.graph = graph
        renderStats(graph)
        renderFilters(graph)
        statusEl.textContent = "Graph ready: " + graph.nodes.length + " nodes, " + graph.edges.length + " links"
        renderGraph()
        renderDetails("session")
      } catch (error) {
        errorEl.hidden = false
        errorEl.textContent = error && error.message ? error.message : String(error)
        statusEl.textContent = "Could not load session map"
      }
    }

    searchEl.addEventListener("input", function () {
      state.search = searchEl.value.trim().toLowerCase()
      renderGraph()
    })

    document.getElementById("fit").addEventListener("click", fitGraph)
    svg.addEventListener("click", function () { selectNode("session") })
    window.addEventListener("mousemove", function (event) {
      if (!state.dragging) return
      var box = svg.getBoundingClientRect()
      var scaleX = WIDTH / box.width
      var scaleY = HEIGHT / box.height
      state.dragging.node.x += event.movementX * scaleX
      state.dragging.node.y += event.movementY * scaleY
      renderGraph()
    })
    window.addEventListener("mouseup", function () {
      state.dragging = undefined
    })

    load()
  </script>
</body>
</html>`
}

export const sessionMapRoute = HttpRouter.use((router) =>
  Effect.gen(function* () {
    yield* router.add(
      "GET",
      "/sessionmap/:sessionID",
      Effect.gen(function* () {
        const params = yield* HttpRouter.schemaPathParams(Params)
        return HttpServerResponse.text(sessionMapHtml(params.sessionID), {
          contentType: "text/html; charset=utf-8",
          headers: new Headers({
            "x-content-type-options": "nosniff",
          }),
        })
      }),
    )
  }),
)
