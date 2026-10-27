import { PRICE, SPECIES, WHOLESALE, ALL } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const STATUSES = [["new", "New"], ["contacted", "Contacted"], ["ready", "Ready"], ["picked-up", "Picked up"], ["canceled", "Canceled"]];
const STATUS_NAME = Object.fromEntries(STATUSES);
let KEY = "", ORDERS = [], filter = "open", query = "";
try { KEY = localStorage.getItem("tmfn:ownerKey") || ""; } catch (e) { /* no storage */ }

let toastTimer = 0;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600); }

async function call(path, opts = {}) {
  const r = await fetch(path, Object.assign({}, opts, { headers: Object.assign({ "authorization": "Bearer " + KEY, "content-type": "application/json" }, opts.headers || {}) }));
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { signOut("That owner key didn't work."); throw new Error("unauthorized"); }
  if (!r.ok || d.ok === false) throw new Error(d.error || `Request failed (${r.status})`);
  return d;
}

function signOut(msg) {
  KEY = ""; try { localStorage.removeItem("tmfn:ownerKey"); } catch (e) { /* ignore */ }
  $("#dash").hidden = true; $("#loginBox").hidden = false; $("#logout").hidden = true;
  $("#loginMsg").textContent = msg || ""; $("#loginMsg").className = "msgline" + (msg ? " err" : "");
  $("#key").focus();
}

async function load() {
  try {
    const d = await call("/api/orders");
    ORDERS = d.orders || [];
    $("#loginBox").hidden = true; $("#dash").hidden = false; $("#logout").hidden = false;
    $("#asOf").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    render();
  } catch (e) {
    if (e.message !== "unauthorized") { $("#loginBox").hidden = false; $("#dash").hidden = true; $("#loginMsg").textContent = e.message; $("#loginMsg").className = "msgline err"; }
  }
}

function active(o) { return o.status !== "canceled"; }
function render() {
  const act = ORDERS.filter(active);
  const reserved = {}, seeds = {};
  act.forEach(o => {
    Object.entries(o.items || {}).forEach(([k, n]) => { reserved[k] = (reserved[k] || 0) + n; });
    Object.entries(o.seedlings || {}).forEach(([k, n]) => { seeds[k] = (seeds[k] || 0) + n; });
  });
  const trees = Object.values(reserved).reduce((a, b) => a + b, 0), grown = SPECIES.reduce((a, s) => a + s.grown, 0);
  const metrics = [
    ["Active reservations", act.length, `${ORDERS.filter(o => o.status === "new").length} new, not yet contacted`],
    ["Trees reserved", trees.toLocaleString("en-US"), `of ${grown.toLocaleString("en-US")} grown (${Math.round(trees / grown * 100)}%)`],
    ["Retail value", money(trees * PRICE), `${money(act.filter(o => o.status === "picked-up").reduce((a, o) => a + (o.total || 0), 0))} picked up`],
    ["Seedling interest", Object.values(seeds).reduce((a, b) => a + b, 0).toLocaleString("en-US"), "Spring 2029, to quote"],
    ["Ready for pickup", act.filter(o => o.status === "ready").length, "reservations"],
    ["Canceled", ORDERS.length - act.length, "excluded from totals"]
  ];
  $("#metrics").innerHTML = metrics.map(m => `<div><span class="label">${m[0]}</span><div class="v">${m[1]}</div><div class="s">${esc(m[2])}</div></div>`).join("");

  $("#supplyRows").innerHTML = SPECIES.map(s => {
    const r = reserved[s.id] || 0, pct = Math.min(100, r / s.grown * 100), over = r > s.grown;
    return `<div class="supply-row"><span>${esc(s.name)}</span><span class="track"><span class="fill${over ? " over" : ""}" style="width:${pct.toFixed(1)}%"></span></span><span class="n"${over ? ' style="color:var(--warn)" title="More reserved than grown"' : ""}>${r} / ${s.grown}</span></div>`;
  }).join("");
  const wmax = Math.max(25, ...WHOLESALE.map(s => seeds[s.id] || 0));
  $("#wsRows").innerHTML = WHOLESALE.map(s => { const n = seeds[s.id] || 0; return `<div class="supply-row"><span>${esc(s.name)}</span><span class="track"><span class="fill" style="width:${(n / wmax * 100).toFixed(1)}%"></span></span><span class="n">${n}</span></div>`; }).join("");

  $("#statusFilter").innerHTML = [["open", "Open"], ["all", "All"]].concat(STATUSES).map(([v, l]) => {
    const n = v === "all" ? ORDERS.length : v === "open" ? ORDERS.filter(o => !["picked-up", "canceled"].includes(o.status)).length : ORDERS.filter(o => o.status === v).length;
    return `<button class="chip" type="button" data-f="${v}" aria-pressed="${filter === v}">${l} · ${n}</button>`;
  }).join("");

  const q = query.toLowerCase();
  const list = ORDERS.filter(o => filter === "all" || (filter === "open" ? !["picked-up", "canceled"].includes(o.status) : o.status === filter))
    .filter(o => !q || [o.id, o.name, o.phone, o.email, o.notes].join(" ").toLowerCase().includes(q));
  $("#shown").textContent = `${list.length} shown · newest first`;
  $("#list").innerHTML = list.length ? list.map(orderCard).join("") : `<div class="empty">${ORDERS.length ? "Nothing matches this filter." : "No reservations yet. When a customer sends one, it shows up here and in your inbox."}</div>`;
}

function orderCard(o) {
  const when = new Date(o.created);
  const items = Object.entries(o.items || {}).map(([k, n]) => `<li>${n} × ${esc(ALL[k] ? ALL[k].name : k)}</li>`).join("");
  const seeds = Object.entries(o.seedlings || {}).map(([k, n]) => `<li>${n} × ${esc(ALL[k] ? ALL[k].name : k)} seedlings</li>`).join("");
  return `<article class="order" data-id="${esc(o.id)}">
    <div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="oid">${esc(o.id)}</span><span class="pill ${esc(o.status)}">${esc(STATUS_NAME[o.status] || o.status)}</span></div>
      <div class="who">${esc(o.name)}</div>
      <div class="meta">${o.phone ? `<a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>` : "no phone"} · ${o.email ? `<a href="mailto:${esc(o.email)}?subject=${encodeURIComponent("Your Turtle Mountain Forest Nursery reservation " + o.id)}">${esc(o.email)}</a>` : "no email"}</div>
      <div class="meta">Received ${isNaN(when) ? "-" : when.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · Pickup: ${esc(o.pickup || "-")}${o.heard ? " · Heard via " + esc(o.heard) : ""}</div>
      ${o.notes ? `<div class="notes">${esc(o.notes)}</div>` : ""}
    </div>
    <div>
      <span class="label">2027 trees · ${o.trees || 0} · ${money(o.total || 0)}</span>
      ${items ? `<ul>${items}</ul>` : `<p class="meta">None</p>`}
      ${seeds ? `<div class="label" style="margin-top:12px">Spring 2029 interest</div><ul>${seeds}</ul>` : ""}
    </div>
    <div class="ctl no-print">
      <label class="label" for="st-${esc(o.id)}">Status</label>
      <select id="st-${esc(o.id)}" data-status>${STATUSES.map(([v, l]) => `<option value="${v}"${o.status === v ? " selected" : ""}>${l}</option>`).join("")}</select>
      <label class="label" for="nt-${esc(o.id)}">Private note</label>
      <textarea id="nt-${esc(o.id)}" data-note maxlength="2000" style="min-height:64px" placeholder="Called 5/12, pickup Saturday">${esc(o.ownerNote || "")}</textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" type="button" data-save>Save</button><button class="btn sm danger" type="button" data-del>Delete</button></div>
      <div class="msgline" data-msg></div>
    </div>
  </article>`;
}

function csv() {
  const head = ["id", "created", "status", "name", "phone", "email", "pickup", "heard", "trees", "total", "items", "seedlings", "notes", "owner_note"];
  // Customer-typed text starting with = + - @ would run as a formula in Excel or Sheets; a leading ' keeps it as text.
  // Plain phone numbers like +1 701 555 0100 are left alone.
  const cell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s().-]+$/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = ORDERS.map(o => [o.id, o.created, o.status, o.name, o.phone, o.email, o.pickup, o.heard, o.trees, o.total,
    Object.entries(o.items || {}).map(([k, n]) => `${n} ${ALL[k] ? ALL[k].name : k}`).join("; "),
    Object.entries(o.seedlings || {}).map(([k, n]) => `${n} ${ALL[k] ? ALL[k].name : k}`).join("; "), o.notes, o.ownerNote].map(cell).join(","));
  const blob = new Blob([[head.join(",")].concat(rows).join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tmfn-reservations-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function health() {
  try {
    const h = await (await fetch("/api/health")).json();
    const missing = [!h.email && "order email", !h.storage && "order storage", !h.advisor && "AI advisor"].filter(Boolean);
    const st = $("#health");
    st.innerHTML = `<span class="dot ${missing.length ? "off" : "live"}"></span><span></span>${h.email ? ' <button class="btn sm" type="button" id="testMail" style="margin-left:8px">Send test email</button>' : ""}`;
    st.children[1].textContent = missing.length ? `Not set up yet: ${missing.join(", ")}. See README.` : "Order email, storage and AI advisor are all on.";
    const t = $("#testMail");
    if (t) t.addEventListener("click", async () => { t.disabled = true; try { await call("/api/orders/test-email", { method: "POST", body: "{}" }); toast("Test email sent. Check your inbox."); } catch (e) { toast(e.message); } t.disabled = false; });
  } catch (e) { /* offline */ }
}

$("#loginForm").addEventListener("submit", e => {
  e.preventDefault(); KEY = $("#key").value.trim();
  try { localStorage.setItem("tmfn:ownerKey", KEY); } catch (err) { /* ignore */ }
  load(); health();
});
$("#logout").addEventListener("click", () => signOut(""));
$("#refresh").addEventListener("click", () => load().then(() => toast("Refreshed")));
$("#csv").addEventListener("click", csv);
$("#print").addEventListener("click", () => window.print());
$("#q").addEventListener("input", e => { query = e.target.value; render(); });
document.addEventListener("click", async e => {
  const f = e.target.closest("[data-f]"); if (f) { filter = f.dataset.f; render(); return; }
  const card = e.target.closest(".order"); if (!card) return;
  const id = card.dataset.id, msg = card.querySelector("[data-msg]");
  if (e.target.closest("[data-save]")) {
    try {
      const d = await call(`/api/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status: card.querySelector("[data-status]").value, ownerNote: card.querySelector("[data-note]").value }) });
      const i = ORDERS.findIndex(o => o.id === id); if (i >= 0) ORDERS[i] = d.order;
      render(); toast(`${id} saved`);
    } catch (err) { if (msg) { msg.textContent = err.message; msg.className = "msgline err"; } }
  }
  const del = e.target.closest("[data-del]");
  if (del) {
    if (del.dataset.confirm !== "1") { del.dataset.confirm = "1"; del.textContent = "Confirm delete"; setTimeout(() => { if (del.isConnected) { del.dataset.confirm = ""; del.textContent = "Delete"; } }, 4000); return; }
    try { await call(`/api/orders/${encodeURIComponent(id)}`, { method: "DELETE" }); ORDERS = ORDERS.filter(o => o.id !== id); render(); toast(`${id} deleted`); }
    catch (err) { if (msg) { msg.textContent = err.message; msg.className = "msgline err"; } }
  }
});
window.addEventListener("focus", () => { if (KEY && !$("#dash").hidden) load(); });

if (KEY) { load(); health(); } else { $("#loginBox").hidden = false; }
