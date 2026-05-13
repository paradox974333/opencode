#!/usr/bin/env bun

import { $ } from "bun"
import path from "path"
import os from "os"
import { ZodError } from "zod"
import { ZenData } from "../src/model"

type ZenDocument = ReturnType<typeof ZenData.validate>
type ZenInput = Parameters<typeof ZenData.validate>[0]
const PARTS = 30
const root = path.resolve(import.meta.dir, "../../../..")
const stage = process.argv.includes("--stage") ? process.argv[process.argv.indexOf("--stage") + 1] : "frank"
const port = Number(process.argv.includes("--port") ? process.argv[process.argv.indexOf("--port") + 1] : "4321")

if (!stage) throw new Error("Stage cannot be empty")
if (!Number.isInteger(port) || port <= 0) throw new Error("Port must be a positive integer")

const loadModels = async () => {
  const secrets = await $`bun sst secret list --stage ${stage}`.cwd(root).text()
  const lines = secrets.split("\n")
  const values = Array.from({ length: PARTS }, (_, i) => {
    const value = lines
      .find((line) => line.startsWith(`ZEN_MODELS${i + 1}=`))
      ?.split("=")
      .slice(1)
      .join("=")
    if (!value) throw new Error(`ZEN_MODELS${i + 1} not found`)
    return value
  })
  return validate(JSON.parse(values.join("")))
}

const validateReferences = (data: ZenDocument) => {
  const providerIds = new Set(Object.keys(data.providers))
  const missing = [
    ...Object.entries(data.zenModels).map(([id, model]) => [`zenModels.${id}`, model] as const),
    ...Object.entries(data.liteModels).map(([id, model]) => [`liteModels.${id}`, model] as const),
  ].flatMap(([modelId, model]) =>
    (Array.isArray(model) ? model : [model]).flatMap((variant) =>
      variant.providers
        .filter((provider) => !providerIds.has(provider.id))
        .map((provider) => `${modelId}: provider ${provider.id} does not exist`),
    ),
  )
  if (missing.length) throw new Error(missing.join("\n"))
  return data
}

const validate = (data: ZenInput) => validateReferences(ZenData.validate(data))

const saveModels = async (data: ZenDocument, targetStage = stage) => {
  const value = JSON.stringify(validate(data))
  const chunk = Math.ceil(value.length / PARTS)
  const envFile = Bun.file(path.join(os.tmpdir(), `models-${Date.now()}.env`))
  await envFile.write(
    Array.from({ length: PARTS }, (_, i) =>
      `ZEN_MODELS${i + 1}="${value
        .slice(chunk * i, i === PARTS - 1 ? undefined : chunk * (i + 1))
        .replace(/"/g, '\\"')}"`,
    ).join("\n"),
  )
  await $`bun sst secret load ${envFile.name} --stage ${targetStage}`.cwd(root)
}

const errorMessage = (error: unknown) => {
  if (error instanceof ZodError) return error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("\n")
  if (error instanceof Error) return error.message
  return String(error)
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })

const readBody = async (request: Request) => {
  const body = await request.json()
  if (!body || typeof body !== "object" || !("data" in body)) throw new Error("Request body must contain data")
  return validate(body.data as ZenInput)
}

const page = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zen Model Editor</title>
  <style>
    :root { color-scheme: dark; --bg: #111112; --panel: #19191c; --muted: #9b9ba5; --text: #f5f5f7; --line: #2b2b31; --accent: #93c5fd; --ok: #86efac; --bad: #fca5a5; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header { position: sticky; top: 0; z-index: 2; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(14px); }
    h1 { margin: 0; font-size: 18px; letter-spacing: -0.02em; }
    button, select, input { border: 1px solid var(--line); border-radius: 10px; background: #222229; color: var(--text); padding: 9px 11px; font: inherit; }
    button { cursor: pointer; }
    button.primary { background: #1d4ed8; border-color: #2563eb; }
    button.danger { background: #4c1d1d; border-color: #7f1d1d; }
    main { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100vh - 70px); }
    aside { border-right: 1px solid var(--line); padding: 16px; position: sticky; top: 70px; height: calc(100vh - 70px); overflow: auto; }
    section { padding: 20px; overflow: auto; }
    .filters { display: grid; gap: 10px; margin-bottom: 14px; }
    .stats { color: var(--muted); font-size: 12px; }
    .list { display: grid; gap: 8px; }
    .item { text-align: left; display: grid; gap: 4px; width: 100%; }
    .item.active { border-color: var(--accent); }
    .item small, .muted { color: var(--muted); }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .status { white-space: pre-wrap; color: var(--muted); }
    .status.ok { color: var(--ok); }
    .status.bad { color: var(--bad); }
    .detail { display: grid; gap: 16px; max-width: 1180px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
    .meta div { border: 1px solid var(--line); border-radius: 12px; padding: 10px; }
    .meta span { display: block; color: var(--muted); font-size: 12px; }
    pre, textarea { width: 100%; margin: 0; border: 1px solid var(--line); border-radius: 14px; background: #0c0c0e; color: var(--text); padding: 14px; overflow: auto; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    textarea { min-height: 58vh; resize: vertical; }
    dialog { width: min(560px, calc(100vw - 32px)); border: 1px solid var(--line); border-radius: 18px; background: var(--panel); color: var(--text); padding: 0; }
    dialog::backdrop { background: rgb(0 0 0 / 0.72); }
    .modal { display: grid; gap: 14px; padding: 20px; }
    .modal h2 { margin: 0; }
    .modal input { width: 100%; }
    .hidden { display: none; }
    @media (max-width: 820px) { header, main { display: block; } aside { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--line); } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Zen Model Editor</h1>
      <div id="subtitle" class="muted">Loading...</div>
    </div>
    <div class="toolbar">
      <button id="pushProd" class="danger">Push to production</button>
      <button id="reload">Reload SST</button>
      <button id="validate">Validate All</button>
    </div>
  </header>
  <dialog id="promoteDialog">
    <div class="modal">
      <h2 id="promoteTitle">Confirm Promotion</h2>
      <p id="promoteMessage" class="muted"></p>
      <label>
        <span id="promotePrompt" class="muted"></span>
        <input id="promoteConfirm" autocomplete="off" />
      </label>
      <div class="toolbar">
        <button id="promoteCancel">Cancel</button>
        <button id="promoteSubmit" class="danger">Confirm</button>
      </div>
    </div>
  </dialog>
  <dialog id="cloneDialog">
    <div class="modal">
      <h2 id="cloneTitle">Clone Entry</h2>
      <p id="cloneMessage" class="muted"></p>
      <label>
        <span id="cloneIdLabel" class="muted">New id</span>
        <input id="cloneId" autocomplete="off" />
      </label>
      <label>
        <span id="cloneNameLabel" class="muted">New display name</span>
        <input id="cloneName" autocomplete="off" />
      </label>
      <div class="toolbar">
        <button id="cloneCancel">Cancel</button>
        <button id="cloneSubmit" class="primary">Create editable copy</button>
      </div>
    </div>
  </dialog>
  <dialog id="renameDialog">
    <div class="modal">
      <h2>Rename ID</h2>
      <p id="renameMessage" class="muted"></p>
      <label>
        <span class="muted">New id</span>
        <input id="renameId" autocomplete="off" />
      </label>
      <div class="toolbar">
        <button id="renameCancel">Cancel</button>
        <button id="renameSubmit" class="primary">Rename locally</button>
      </div>
    </div>
  </dialog>
  <dialog id="deleteDialog">
    <div class="modal">
      <h2>Delete Entry</h2>
      <p id="deleteMessage" class="muted"></p>
      <label>
        <span id="deletePrompt" class="muted"></span>
        <input id="deleteConfirm" autocomplete="off" />
      </label>
      <div class="toolbar">
        <button id="deleteCancel">Cancel</button>
        <button id="deleteSubmit" class="danger">Delete and save</button>
      </div>
    </div>
  </dialog>
  <main>
    <aside>
      <div class="filters">
        <input id="search" placeholder="Search model or provider" />
        <select id="collection">
          <option value="all">Zen, Go, and providers</option>
          <option value="zenModels">Zen models</option>
          <option value="liteModels">Go models</option>
          <option value="providers">Providers</option>
        </select>
        <div id="stats" class="stats"></div>
      </div>
      <div id="list" class="list"></div>
    </aside>
    <section>
      <div id="status" class="status"></div>
      <div id="detail" class="detail"></div>
    </section>
  </main>
  <script>
    const labels = { zenModels: "Zen", liteModels: "Go", providers: "Provider" }
    const state = { data: null, stage: ${JSON.stringify(stage)}, loadedAt: "", items: [], selected: null, editing: false }
    const promotion = { target: "", required: "" }
    const clone = { source: null }
    const $ = (id) => document.getElementById(id)
    const escapeHtml = (value) => value.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]))

    const request = async (url, options) => {
      const response = await fetch(url, options)
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || response.statusText)
      return body
    }

    const setStatus = (message, type = "") => {
      $("status").textContent = message
      $("status").className = "status " + type
    }

    const flatten = () => ["zenModels", "liteModels", "providers"].flatMap((collection) =>
      Object.entries(state.data[collection]).map(([id, value]) => ({ collection, id, value })),
    )

    const insertAfter = (record, afterId, id, value) => Object.fromEntries(
      Object.entries(record).flatMap(([key, current]) => key === afterId ? [[key, current], [id, value]] : [[key, current]]),
    )

    const renameKey = (record, oldId, newId) => Object.fromEntries(
      Object.entries(record).map(([key, value]) => [key === oldId ? newId : key, value]),
    )

    const deleteKey = (record, id) => Object.fromEntries(Object.entries(record).filter(([key]) => key !== id))

    const providerReferences = (providerId) => Object.entries({ ...state.data.zenModels, ...state.data.liteModels }).flatMap(([modelId, model]) =>
      (Array.isArray(model) ? model : [model]).flatMap((variant) =>
        variant.providers.some((provider) => provider.id === providerId) ? [modelId] : [],
      ),
    )

    const renamedCopy = (item, name) => {
      if (item.collection === "providers") {
        const provider = structuredClone(item.value)
        return {
          ...provider,
          displayName: name || provider.displayName,
          apiKey:
            typeof provider.apiKey === "string"
              ? ""
              : Object.fromEntries(Object.keys(provider.apiKey).map((key) => [key, ""])),
        }
      }
      if (!name) return structuredClone(item.value)
      if (Array.isArray(item.value)) return structuredClone(item.value).map((variant) => ({ ...variant, name }))
      return { ...structuredClone(item.value), name }
    }

    const refreshList = () => {
      const search = $("search").value.trim().toLowerCase()
      const collection = $("collection").value
      state.items = flatten().filter((item) => {
        if (collection !== "all" && item.collection !== collection) return false
        return !search || item.id.toLowerCase().includes(search) || JSON.stringify(item.value).toLowerCase().includes(search)
      })
      $("stats").textContent = Object.keys(state.data.zenModels).length + " Zen models, " + Object.keys(state.data.liteModels).length + " Go models, " + Object.keys(state.data.providers).length + " providers. Showing " + state.items.length + "."
      $("list").innerHTML = state.items.map((item, index) =>
        '<button class="item ' + (state.selected && state.selected.collection === item.collection && state.selected.id === item.id ? "active" : "") + '" data-index="' + index + '">' +
          '<strong>' + escapeHtml(item.id) + '</strong>' +
          '<small>' + labels[item.collection] + (Array.isArray(item.value) ? " - " + item.value.length + " variants" : "") + '</small>' +
        '</button>'
      ).join("")
      document.querySelectorAll(".item").forEach((button) => button.addEventListener("click", () => {
        state.selected = state.items[Number(button.dataset.index)]
        state.editing = false
        render()
      }))
    }

    const summary = (item) => item.collection === "providers" ? [
      ["ID", item.id],
      ["Display name", item.value.displayName || ""],
      ["API", item.value.api],
      ["Format", item.value.format || ""],
      ["API key shape", typeof item.value.apiKey === "string" ? "single" : Object.keys(item.value.apiKey).length + " keys"],
    ] : [
      ["ID", item.id],
      ["Name", Array.isArray(item.value) ? item.value.map((variant) => variant.name).join(", ") : item.value.name],
      ["Providers", (Array.isArray(item.value) ? item.value.flatMap((variant) => variant.providers) : item.value.providers).map((provider) => provider.id).join(", ")],
      ["Anonymous", Array.isArray(item.value) ? item.value.map((variant) => String(Boolean(variant.allowAnonymous))).join(", ") : String(Boolean(item.value.allowAnonymous))],
      ["Rate limit", Array.isArray(item.value) ? item.value.map((variant) => variant.rateLimit || "").join(", ") : item.value.rateLimit || ""],
    ]

    const renderDetail = () => {
      if (!state.selected) {
        $("detail").innerHTML = '<div class="card muted">Select a Zen model, Go model, or provider to inspect every property and edit it.</div>'
        return
      }
      const item = state.selected
      const text = JSON.stringify(state.data[item.collection][item.id], null, 2)
      const escaped = escapeHtml(text)
      $("detail").innerHTML =
        '<div class="card detail">' +
          '<div>' +
            '<h2>' + escapeHtml(item.id) + '</h2>' +
            '<div class="muted">' + labels[item.collection] + ' - ' + item.collection + '</div>' +
          '</div>' +
          '<div class="meta">' + summary(item).map(([key, value]) => '<div><span>' + escapeHtml(key) + '</span>' + escapeHtml(String(value || "-")) + '</div>').join("") + '</div>' +
          '<div class="toolbar">' +
            '<button id="edit" class="' + (state.editing ? "hidden" : "primary") + '">Edit</button>' +
            '<button id="rename" class="' + (state.editing ? "hidden" : "") + '">Rename ID</button>' +
            '<button id="clone" class="' + (state.editing ? "hidden" : "") + '">' + (item.collection === "providers" ? "Clone provider" : "Clone model") + '</button>' +
            '<button id="delete" class="' + (state.editing ? "hidden danger" : "danger") + '">Delete</button>' +
            '<button id="save" class="' + (state.editing ? "primary" : "hidden") + '">Save</button>' +
            '<button id="cancel" class="' + (state.editing ? "" : "hidden") + '">Cancel</button>' +
          '</div>' +
          '<pre class="' + (state.editing ? "hidden" : "") + '">' + escaped + '</pre>' +
          '<textarea id="editor" class="' + (state.editing ? "" : "hidden") + '" spellcheck="false">' + escaped + '</textarea>' +
        '</div>'
      $("edit")?.addEventListener("click", () => { state.editing = true; renderDetail() })
      $("rename")?.addEventListener("click", openRenameDialog)
      $("clone")?.addEventListener("click", openCloneDialog)
      $("delete")?.addEventListener("click", () => { try { openDeleteDialog() } catch (error) { setStatus(error.message, "bad") } })
      $("cancel")?.addEventListener("click", () => { state.editing = false; renderDetail() })
      $("save")?.addEventListener("click", () => saveSelected().catch((error) => setStatus(error.message, "bad")))
    }

    const render = () => {
      $("subtitle").textContent = "Stage " + state.stage + " - loaded " + state.loadedAt
      refreshList()
      renderDetail()
    }

    const load = async (url = "/api/models") => {
      setStatus("Loading models from SST...")
      const body = await request(url, url === "/api/models" ? undefined : { method: "POST" })
      state.data = body.data
      state.stage = body.stage
      state.loadedAt = body.loadedAt
      state.selected = null
      state.editing = false
      setStatus("Loaded models.", "ok")
      render()
    }

    const validateAll = async () => {
      await request("/api/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: state.data }) })
      setStatus("Schema validation passed.", "ok")
    }

    const openPromoteDialog = (target) => {
      promotion.target = target
      promotion.required = "production"
      $("promoteTitle").textContent = "Push to production"
      $("promoteMessage").textContent = "This will validate the currently loaded " + state.stage + " model data, then overwrite ZEN_MODELS in the " + target + " SST stage. Unsaved edits in the textarea are not included."
      $("promotePrompt").textContent = "Type " + promotion.required + " to confirm."
      $("promoteConfirm").value = ""
      $("promoteDialog").showModal()
      $("promoteConfirm").focus()
    }

    const promote = async () => {
      if ($("promoteConfirm").value !== promotion.required) throw new Error("Confirmation text does not match.")
      $("promoteDialog").close()
      setStatus("Validating and pushing to " + promotion.target + "...")
      await request("/api/promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target: promotion.target }) })
      setStatus("Pushed validated model data to " + promotion.target + ".", "ok")
    }

    const openCloneDialog = () => {
      clone.source = state.selected
      $("cloneTitle").textContent = clone.source.collection === "providers" ? "Clone provider" : "Clone model"
      $("cloneMessage").textContent = "The new entry will be inserted immediately after " + clone.source.id + " in " + clone.source.collection + ". It is not written to SST until you click Save."
      $("cloneIdLabel").textContent = clone.source.collection === "providers" ? "New provider id" : "New model id"
      $("cloneNameLabel").textContent = clone.source.collection === "providers" ? "New display name (optional)" : "New model display name (optional)"
      $("cloneId").value = ""
      $("cloneName").value = ""
      $("cloneDialog").showModal()
      $("cloneId").focus()
    }

    const createClone = () => {
      const id = $("cloneId").value.trim()
      if (!id) throw new Error("New id is required.")
      if (state.data[clone.source.collection][id]) throw new Error(id + " already exists in " + clone.source.collection + ".")
      state.data[clone.source.collection] = insertAfter(
        state.data[clone.source.collection],
        clone.source.id,
        id,
        renamedCopy(clone.source, $("cloneName").value.trim()),
      )
      state.selected = { collection: clone.source.collection, id, value: state.data[clone.source.collection][id] }
      state.editing = true
      $("cloneDialog").close()
      setStatus("Created editable copy after " + clone.source.id + ". Review it, then click Save to write SST.", "ok")
      render()
    }

    const openRenameDialog = () => {
      $("renameMessage").textContent = "This changes the " + state.selected.collection + " key for " + state.selected.id + ". It is not written to SST until you click Save. If this is a provider id, update any model provider references before saving."
      $("renameId").value = state.selected.id
      $("renameDialog").showModal()
      $("renameId").focus()
    }

    const renameSelected = () => {
      const id = $("renameId").value.trim()
      if (!id) throw new Error("New id is required.")
      if (id === state.selected.id) {
        $("renameDialog").close()
        return
      }
      if (state.data[state.selected.collection][id]) throw new Error(id + " already exists in " + state.selected.collection + ".")
      state.data[state.selected.collection] = renameKey(state.data[state.selected.collection], state.selected.id, id)
      state.selected = { collection: state.selected.collection, id, value: state.data[state.selected.collection][id] }
      state.editing = true
      $("renameDialog").close()
      setStatus("Renamed locally. Review the entry, then click Save to validate and write SST.", "ok")
      render()
    }

    const openDeleteDialog = () => {
      if (state.selected.collection === "providers") {
        const refs = providerReferences(state.selected.id)
        if (refs.length) throw new Error("Cannot delete provider " + state.selected.id + " because these models reference it:\\n" + refs.join("\\n"))
      }
      $("deleteMessage").textContent = "This will remove " + state.selected.id + " from " + state.selected.collection + ", validate the full model document, and write the change to SST."
      $("deletePrompt").textContent = "Type " + state.selected.id + " to confirm."
      $("deleteConfirm").value = ""
      $("deleteDialog").showModal()
      $("deleteConfirm").focus()
    }

    const deleteSelected = async () => {
      if ($("deleteConfirm").value !== state.selected.id) throw new Error("Confirmation text does not match.")
      setStatus("Validating and deleting " + state.selected.id + "...")
      const deleted = state.selected.id
      const nextData = structuredClone(state.data)
      nextData[state.selected.collection] = deleteKey(nextData[state.selected.collection], state.selected.id)
      const body = await request("/api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: nextData }) })
      state.data = body.data
      state.loadedAt = body.loadedAt
      state.selected = null
      state.editing = false
      $("deleteDialog").close()
      setStatus("Deleted " + deleted + ".", "ok")
      render()
    }

    const saveSelected = async () => {
      const nextValue = JSON.parse($("editor").value)
      const nextData = structuredClone(state.data)
      nextData[state.selected.collection][state.selected.id] = nextValue
      setStatus("Validating and writing SST secrets...")
      const body = await request("/api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ data: nextData }) })
      state.data = body.data
      state.loadedAt = body.loadedAt
      state.selected = { ...state.selected, value: state.data[state.selected.collection][state.selected.id] }
      state.editing = false
      setStatus("Saved " + state.selected.id + ".", "ok")
      render()
    }

    $("reload").addEventListener("click", () => load("/api/reload").catch((error) => setStatus(error.message, "bad")))
    $("validate").addEventListener("click", () => validateAll().catch((error) => setStatus(error.message, "bad")))
    $("pushProd").addEventListener("click", () => openPromoteDialog("production"))
    $("promoteCancel").addEventListener("click", () => $("promoteDialog").close())
    $("promoteSubmit").addEventListener("click", () => promote().catch((error) => setStatus(error.message, "bad")))
    $("cloneCancel").addEventListener("click", () => $("cloneDialog").close())
    $("cloneSubmit").addEventListener("click", () => { try { createClone() } catch (error) { setStatus(error.message, "bad") } })
    $("renameCancel").addEventListener("click", () => $("renameDialog").close())
    $("renameSubmit").addEventListener("click", () => { try { renameSelected() } catch (error) { setStatus(error.message, "bad") } })
    $("deleteCancel").addEventListener("click", () => $("deleteDialog").close())
    $("deleteSubmit").addEventListener("click", () => deleteSelected().catch((error) => setStatus(error.message, "bad")))
    $("search").addEventListener("input", refreshList)
    $("collection").addEventListener("change", refreshList)
    load().catch((error) => setStatus(error.message, "bad"))
    window.addEventListener("error", (event) => setStatus(event.error?.message || event.message, "bad"))
  </script>
</body>
</html>`

const state = {
  data: await loadModels(),
  loadedAt: new Date().toISOString(),
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const url = new URL(request.url)
    try {
      if (request.method === "GET" && url.pathname === "/") return new Response(page(), { headers: { "content-type": "text/html; charset=utf-8" } })
      if (request.method === "GET" && url.pathname === "/api/models") return json({ stage, loadedAt: state.loadedAt, data: state.data })
      if (request.method === "POST" && url.pathname === "/api/reload") {
        state.data = await loadModels()
        state.loadedAt = new Date().toISOString()
        return json({ stage, loadedAt: state.loadedAt, data: state.data })
      }
      if (request.method === "POST" && url.pathname === "/api/validate") {
        await readBody(request)
        return json({ ok: true })
      }
      if (request.method === "POST" && url.pathname === "/api/save") {
        const data = await readBody(request)
        await saveModels(data)
        state.data = data
        state.loadedAt = new Date().toISOString()
        return json({ stage, loadedAt: state.loadedAt, data: state.data })
      }
      if (request.method === "POST" && url.pathname === "/api/promote") {
        const body = await request.json()
        if (!body || typeof body !== "object" || !("target" in body)) throw new Error("Request body must contain target")
        if (body.target !== "production") throw new Error("Target must be production")
        await saveModels(validate(state.data), body.target)
        return json({ target: body.target })
      }
      return json({ error: "Not found" }, 404)
    } catch (error) {
      return json({ error: errorMessage(error) }, 400)
    }
  },
})

console.log(`Zen model editor running at http://localhost:${server.port}`)
console.log(`Stage: ${stage}`)
console.log("Press Ctrl+C to stop")
