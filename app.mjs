import render from "./workspace.mjs";

const KEY = "lps-plan-versions";
let memory = [];

function persistent() {
  try {
    localStorage.setItem("__lps_probe__", "1");
    localStorage.removeItem("__lps_probe__");
    return true;
  } catch {
    return false;
  }
}

const stored = persistent();

function read() {
  if (!stored) return memory.slice();
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows)
      ? rows.filter(r => r && Number.isFinite(Number(r.id)) && typeof r.snapshot === "string")
      : [];
  } catch {
    return [];
  }
}

function write(rows) {
  memory = rows;
  if (stored) localStorage.setItem(KEY, JSON.stringify(rows));
}

function versions() {
  return read()
    .map(r => ({ id: Number(r.id), title: String(r.title ?? "Untitled") }))
    .sort((a, b) => b.id - a.id);
}

function nextId(rows) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

function handle(event) {
  const reply = { id: event.id };
  try {
    if (event.kind === "save") {
      const project = JSON.parse(event.snapshot);
      if (!project.prompt || !project.prompt.trim()) throw new Error("The prompt is empty.");
      const rows = read();
      const id = nextId(rows);
      const goal = project.brief && project.brief.goal ? String(project.brief.goal) : "";
      rows.push({ id, title: (goal || "Untitled package").slice(0, 100), snapshot: event.snapshot });
      write(rows);
      reply.version = id;
    } else if (event.kind === "open") {
      const row = read().find(r => Number(r.id) === Number(event.version));
      if (!row) throw new Error("That version could not be found.");
      reply.project = JSON.parse(row.snapshot);
    }
  } catch (err) {
    reply.error = "Could not finish this action: " + (err && err.message ? err.message : err);
  }
  return reply;
}

let reply = null;

function mount() {
  render({
    parentElement: document.body,
    data: { versions: versions(), reply },
    setTriggerValue(name, value) {
      if (name !== "action") return;
      reply = handle(value);
      mount();
    },
  });
}

mount();

if (!stored) {
  const note = document.createElement("p");
  note.textContent =
    "Saved packages last only for this browser session here. Open the app on its own page to keep them.";
  note.style.cssText =
    "position:fixed;left:12px;bottom:12px;z-index:50;background:#254d39;color:#fff;padding:8px 12px;border-radius:10px;font:12px/1.4 Inter,sans-serif;max-width:320px";
  document.body.append(note);
}
