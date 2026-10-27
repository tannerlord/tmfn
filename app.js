import { PRICE, SITE, SPECIES, WHOLESALE, GROUPS, ZONES, ROAD, PICKUP, HEARD, ALL } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mid = r => (r[0] + r[1]) / 2;
const h20For = (s, q) => !s.h20 ? 0 : q === "prime" ? s.h20[1] : q === "tough" ? s.h20[0] : mid(s.h20);
const rng = r => r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`;
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const store = {
  get(k, d) { try { const v = localStorage.getItem("tmfn:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("tmfn:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
let toastTimer = 0;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); toast("Copied"); return true; }
  catch (e) {
    if (fallbackEl && fallbackEl.select) { fallbackEl.select(); toast("Selected. Press Ctrl+C or ⌘C to copy"); }
    return false;
  }
}

/* ---------- photos ---------- */
let CREDITS = {};
function photoHTML(sp, cls = "ph", withCredit = true) {
  return `<div class="${cls}" data-photo="${esc(sp.photo || "")}">${cls === "ph" || cls === "mph" ? silhouette(sp) : ""}<img src="/assets/trees/${esc(sp.photo || "none.jpg")}" alt="${esc(sp.name)}" loading="lazy" decoding="async">${withCredit ? '<span class="credit"></span>' : ""}</div>`;
}
function wirePhotos(root = document) {
  $$("[data-photo]", root).forEach(ph => {
    if (ph.dataset.wired) return; ph.dataset.wired = "1";
    const img = ph.querySelector("img"); if (!img) return;
    const ok = () => { ph.classList.add("loaded"); const c = ph.querySelector(".credit"); const cr = CREDITS[ph.dataset.photo]; if (c && cr) c.innerHTML = `Photo: ${esc(cr.artist || "Unknown")} · ${esc(cr.license || "Public domain")}${cr.source ? ` · <a href="${esc(cr.source)}" target="_blank" rel="noopener">source</a>` : ""}`; };
    const bad = () => img.remove();
    if (img.complete) { img.naturalWidth > 0 ? ok() : bad(); }
    else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", bad, { once: true }); }
  });
}
fetch("/assets/trees/credits.json").then(r => r.ok ? r.json() : {}).then(c => { CREDITS = c || {}; $$("[data-photo]").forEach(ph => { delete ph.dataset.wired; }); wirePhotos(); }).catch(() => {});

/* ---------- tree drawing ---------- */
function tree(form, cx, base, h, fill, opt = {}) {
  h = Math.max(h, 2);
  const top = base - h, f = `fill:var(${fill})`, f1 = n => n.toFixed(1), bark = `fill:var(${opt.bark || "--bark"})`;
  let s = "";
  if (form === "spruce") {
    const w = h * 0.46, trunk = Math.max(1.4, h * 0.05), crownH = h * 0.92, n = 7, R = [];
    for (let i = 1; i <= n; i++) { const y = top + crownH * i / n, xo = (w / 2) * (i / n); R.push([cx + xo, y]); if (i < n) R.push([cx + xo * 0.62, y]); }
    let d = `M${f1(cx)} ${f1(top)}`;
    R.forEach(p => { d += ` L${f1(p[0])} ${f1(p[1])}`; });
    for (let i = R.length - 1; i >= 0; i--) d += ` L${f1(2 * cx - R[i][0])} ${f1(R[i][1])}`;
    s += `<rect x="${f1(cx - trunk / 2)}" y="${f1(base - h * 0.1)}" width="${f1(trunk)}" height="${f1(h * 0.1)}" style="${bark}"/><path d="${d} Z" style="${f}"/>`;
  } else if (form === "pine") {
    const tw = Math.max(1.4, h * 0.05);
    s += `<rect x="${f1(cx - tw / 2)}" y="${f1(base - h * 0.6)}" width="${f1(tw)}" height="${f1(h * 0.6)}" style="${bark}"/>`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(top + h * 0.2)}" rx="${f1(h * 0.19)}" ry="${f1(h * 0.2)}" style="${f}"/>`;
    s += `<ellipse cx="${f1(cx - h * 0.12)}" cy="${f1(top + h * 0.4)}" rx="${f1(h * 0.16)}" ry="${f1(h * 0.14)}" style="${f}"/>`;
    s += `<ellipse cx="${f1(cx + h * 0.13)}" cy="${f1(top + h * 0.36)}" rx="${f1(h * 0.16)}" ry="${f1(h * 0.14)}" style="${f}"/>`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(top + h * 0.52)}" rx="${f1(h * 0.14)}" ry="${f1(h * 0.09)}" style="${f}"/>`;
  } else if (form === "oak") {
    const tw = Math.max(1.6, h * 0.08);
    s += `<path d="M${f1(cx - tw / 2)} ${f1(base)} L${f1(cx - tw * 0.35)} ${f1(base - h * 0.45)} L${f1(cx + tw * 0.35)} ${f1(base - h * 0.45)} L${f1(cx + tw / 2)} ${f1(base)} Z" style="${bark}"/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(top + h * 0.3)}" r="${f1(h * 0.3)}" style="${f}"/>`;
    s += `<circle cx="${f1(cx - h * 0.24)}" cy="${f1(top + h * 0.45)}" r="${f1(h * 0.22)}" style="${f}"/>`;
    s += `<circle cx="${f1(cx + h * 0.25)}" cy="${f1(top + h * 0.43)}" r="${f1(h * 0.23)}" style="${f}"/>`;
    s += `<circle cx="${f1(cx - h * 0.04)}" cy="${f1(top + h * 0.55)}" r="${f1(h * 0.19)}" style="${f}"/>`;
    if (opt.bloom && h > 14) [[-.15, .2], [.18, .3], [-.3, .42], [.32, .45], [0, .5]].forEach(p => { s += `<circle cx="${f1(cx + p[0] * h)}" cy="${f1(top + p[1] * h)}" r="${f1(Math.max(1, h * 0.025))}" style="fill:var(${opt.bloom})"/>`; });
  } else if (form === "aspen") {
    const tw = Math.max(1.2, h * 0.035);
    s += `<rect x="${f1(cx - tw / 2)}" y="${f1(base - h * 0.62)}" width="${f1(tw)}" height="${f1(h * 0.62)}" style="fill:var(${opt.bark || "--aspen-bark"})"/>`;
    s += `<ellipse cx="${f1(cx)}" cy="${f1(top + h * 0.34)}" rx="${f1(h * 0.17)}" ry="${f1(h * 0.34)}" style="${f}"/>`;
    s += `<ellipse cx="${f1(cx + h * 0.06)}" cy="${f1(top + h * 0.52)}" rx="${f1(h * 0.12)}" ry="${f1(h * 0.18)}" style="${f}"/>`;
  } else if (form === "juniper") {
    const w = h * 0.48;
    s += `<rect x="${f1(cx - Math.max(1, h * 0.02))}" y="${f1(base - h * 0.06)}" width="${f1(Math.max(2, h * 0.04))}" height="${f1(h * 0.06)}" style="${bark}"/>`;
    s += `<path d="M${f1(cx)} ${f1(top)} C${f1(cx + w * 0.3)} ${f1(top + h * 0.22)} ${f1(cx + w * 0.58)} ${f1(top + h * 0.62)} ${f1(cx + w * 0.32)} ${f1(base - h * 0.05)} L${f1(cx - w * 0.32)} ${f1(base - h * 0.05)} C${f1(cx - w * 0.58)} ${f1(top + h * 0.62)} ${f1(cx - w * 0.3)} ${f1(top + h * 0.22)} ${f1(cx)} ${f1(top)} Z" style="${f}"/>`;
  } else {
    s += `<circle cx="${f1(cx)}" cy="${f1(base - h * 0.55)}" r="${f1(h * 0.42)}" style="${f}"/>`;
    s += `<circle cx="${f1(cx - h * 0.33)}" cy="${f1(base - h * 0.34)}" r="${f1(h * 0.32)}" style="${f}"/>`;
    s += `<circle cx="${f1(cx + h * 0.34)}" cy="${f1(base - h * 0.36)}" r="${f1(h * 0.33)}" style="${f}"/>`;
    if (opt.bloom && h > 14) [[-.2, -.7], [.15, -.82], [.32, -.55], [-.42, -.45], [.05, -.42], [.5, -.3], [-.18, -.25]].forEach(p => { s += `<circle cx="${f1(cx + p[0] * h)}" cy="${f1(base + p[1] * h)}" r="${f1(Math.max(1, h * 0.025))}" style="fill:var(${opt.bloom})"/>`; });
  }
  return s;
}
function house(cx, base, w) {
  const h = w * 0.55;
  return `<path d="M${cx - w / 2} ${base} V${base - h} L${cx} ${base - h - w * 0.32} L${cx + w / 2} ${base - h} V${base} Z" style="fill:var(--deck-3);stroke:var(--line-2);stroke-width:1"/>`;
}
function silhouette(s) {
  const W = 240, base = 168, ppf = 140 / 64, h = mid(s.mature || [s.h20 ? s.h20[1] : 8, s.h20 ? s.h20[1] : 8]) * ppf;
  return `<svg viewBox="0 0 ${W} 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${tree(s.form, W / 2, base, h, s.fill, { bloom: s.bloom })}<rect x="0" y="${base}" width="${W}" height="12" style="fill:var(--soil-top)"/></svg>`;
}

/* ---------- ground truth ---------- */
function surf(x) {
  if (x < 150) return 296 + 16 * Math.exp(-(((x - 78) / 24) ** 2)) - 2 * Math.sin(x / 17);
  if (x < 330) return 293 - 7 * Math.abs(Math.sin((x - 150) / 21));
  if (x < 480) return 291 + 1.5 * Math.sin(x / 40);
  if (x < 660) return 287 - 6 * Math.sin((x - 480) / 29);
  if (x < 790) return 287 - 7 * smooth((x - 660) / 130);
  if (x < 905) return 280 - 152 * smooth((x - 790) / 115);
  if (x < 1000) return 128 + 5 * Math.sin(x / 9) - 16 * Math.exp(-(((x - 955) / 18) ** 2));
  let y = 131 + 3 * Math.sin(x / 12);
  y += 12 * Math.exp(-(((x - 1018) / 9) ** 2));
  y += 22 * smooth((x - 1045) / 22) * smooth((1170 - x) / 22);
  return y;
}
function water(x0, x1, level) {
  const pts = [];
  for (let x = x0; x <= x1; x += 2) { const y = surf(x); if (y > level) pts.push([x, y]); }
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]} ${level}`;
  pts.forEach(p => { d += ` L${p[0]} ${p[1].toFixed(1)}`; });
  return `<path d="${d} L${pts[pts.length - 1][0]} ${level} Z" style="fill:var(--water)"/>`;
}
function buildGroundSVG() {
  const W = 1200, H = 430;
  let line = "";
  for (let x = 0; x <= W; x += 4) line += (x ? " L" : "M") + x + " " + surf(x).toFixed(1);
  const terrain = `M0 ${H} L` + line.slice(1) + ` L${W} ${H} Z`;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Cross-section of Bottineau County landforms from the Souris River to the Turtle Mountains">`;
  s += `<defs>
    <pattern id="p-till" width="36" height="28" patternUnits="userSpaceOnUse"><rect width="36" height="28" style="fill:var(--till)"/><ellipse cx="6" cy="7" rx="2.6" ry="1.8" style="fill:var(--pebble)"/><ellipse cx="24" cy="4" rx="1.6" ry="1.2" style="fill:var(--pebble)"/><ellipse cx="17" cy="17" rx="3" ry="2" style="fill:var(--pebble)"/><ellipse cx="31" cy="22" rx="1.8" ry="1.3" style="fill:var(--pebble)"/><ellipse cx="4" cy="23" rx="1.3" ry="1" style="fill:var(--pebble)"/></pattern>
    <pattern id="p-sand" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" style="fill:var(--soil-sub)"/><circle cx="2" cy="2" r="1" style="fill:var(--sand)"/><circle cx="6" cy="6" r=".9" style="fill:var(--sand)"/></pattern>
    <pattern id="p-clay" width="12" height="6" patternUnits="userSpaceOnUse"><rect width="12" height="6" style="fill:var(--soil-sub)"/><path d="M0 3 H12" style="stroke:var(--clay);stroke-width:1.6"/></pattern>
    <pattern id="p-silt" width="14" height="8" patternUnits="userSpaceOnUse"><rect width="14" height="8" style="fill:var(--soil-sub)"/><path d="M1 3 H7 M8 7 H13" style="stroke:var(--clay);stroke-width:1.2"/></pattern>
    <pattern id="p-peat" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" style="fill:var(--peat)"/><path d="M0 10 L10 0" style="stroke:var(--needle-2);stroke-width:1"/></pattern>
    <clipPath id="gtclip"><path d="${terrain}"/></clipPath>
  </defs>`;
  s += `<rect id="gtHl" x="0" y="20" width="150" height="${H - 20}" style="fill:var(--gold);opacity:.07"/><path id="gtHlTop" d="M0 20 H150" style="stroke:var(--gold);stroke-width:2"/>`;
  s += `<g clip-path="url(#gtclip)"><rect width="${W}" height="${H}" style="fill:url(#p-till)"/><rect x="0" width="150" height="${H}" style="fill:url(#p-silt)"/><rect x="150" width="180" height="${H}" style="fill:url(#p-sand)"/><rect x="330" width="150" height="${H}" style="fill:url(#p-clay)"/><rect x="660" width="130" height="${H}" style="fill:url(#p-silt)"/><rect x="1000" y="118" width="200" height="70" style="fill:url(#p-peat)"/><path d="${line}" style="fill:none;stroke:var(--soil-top);stroke-width:24"/></g>`;
  s += water(40, 116, 300) + water(1006, 1030, 136) + water(1040, 1176, 140);
  s += `<path d="${line}" style="fill:none;stroke:var(--line-2);stroke-width:1.5"/>`;
  for (let x = 668; x < 786; x += 9) s += `<rect x="${x}" y="${(surf(x) - 1.2).toFixed(1)}" width="4" height="1.4" style="fill:var(--fg);opacity:.55"/>`;
  [["aspen", 22, 30, "--willow"], ["shrub", 114, 9, "--silver-leaf"], ["aspen", 132, 25, "--willow"], ["pine", 188, 34, "--needle"], ["juniper", 246, 22, "--silver"], ["pine", 302, 29, "--needle"],
   ["oak", 382, 32, "--leaf"], ["shrub", 446, 10, "--leaf"], ["spruce", 508, 30, "--needle-2"], ["spruce", 526, 32, "--needle-2"], ["spruce", 544, 30, "--needle-2"], ["oak", 632, 26, "--plum-leaf"],
   ["shrub", 676, 9, "--silver-leaf"], ["aspen", 834, 24, "--gold"], ["oak", 868, 30, "--leaf"], ["aspen", 926, 30, "--gold"], ["juniper", 955, 20, "--juniper"], ["oak", 988, 28, "--leaf"],
   ["aspen", 1002, 22, "--willow"], ["shrub", 1036, 9, "--dogwood"], ["aspen", 1188, 24, "--willow"]].forEach(i => { s += tree(i[0], i[1], surf(i[1]) + 1, i[2], i[3]); });
  s += house(586, surf(586) + 1, 20) + house(608, surf(608) + 1, 14);
  [742, 754, 766].forEach((x, k) => { const hh = [12, 18, 10][k]; s += `<rect x="${x - 5}" y="${(surf(x) - hh).toFixed(1)}" width="10" height="${hh}" style="fill:var(--deck-3);stroke:var(--line-2)"/>`; });
  s += `<text x="756" y="${(surf(756) - 26).toFixed(1)}" text-anchor="middle" style="font:500 10px var(--mono);letter-spacing:.14em;fill:var(--fg)">BOTTINEAU</text>`;
  s += `<text x="1108" y="151" text-anchor="middle" style="font:italic 400 11px var(--body);fill:var(--fg);opacity:.85">Lake Metigoshe</text>`;
  s += `<text x="78" y="332" text-anchor="middle" style="font:500 10px var(--mono);letter-spacing:.1em;fill:var(--fg);opacity:.65">SOURIS R.</text>`;
  ZONES.forEach((z, i) => {
    const cx = z.lx || (z.x[0] + z.x[1]) / 2, sy = surf(cx), ly = sy - (i % 2 ? 92 : 58);
    s += `<g class="gt-lbl" data-z="${z.id}"><path d="M${cx} ${(ly + 8).toFixed(1)} V${(sy - 8).toFixed(1)}" style="stroke:var(--line-2);stroke-width:1"/><text x="${cx}" y="${ly.toFixed(1)}" text-anchor="middle" style="font:500 12px var(--mono);letter-spacing:.12em;fill:var(--mute)">${esc(z.short.toUpperCase())}</text></g>`;
  });
  ZONES.forEach(z => { s += `<g class="gt-zone" data-z="${z.id}" tabindex="0" role="button" aria-label="${esc(z.name)}"><rect class="gt-hit" x="${z.x[0]}" y="20" width="${z.x[1] - z.x[0]}" height="${H - 20}" style="fill:transparent"/></g>`; });
  return s + `</svg>`;
}
let gtZone = store.get("zone", "till");
if (!ZONES.some(z => z.id === gtZone)) gtZone = "till";
const pickChip = id => { const sp = ALL[id]; return `<button class="chip" type="button" data-goto="${id}"><span class="sw" style="background:var(${sp.fill})"></span>${esc(sp.name)}</button>`; };
function renderZone() {
  const idx = ZONES.findIndex(z => z.id === gtZone), z = ZONES[idx];
  $$("#gtTabs button").forEach(b => { const on = b.dataset.z === gtZone; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
  const hl = $("#gtHl"), top = $("#gtHlTop");
  if (hl) { hl.setAttribute("x", z.x[0]); hl.setAttribute("width", z.x[1] - z.x[0]); top.setAttribute("d", `M${z.x[0]} 20 H${z.x[1]}`); }
  $$(".gt-lbl").forEach(g => { g.querySelector("text").style.fill = g.dataset.z === gtZone ? "var(--gold)" : "var(--mute)"; });
  let b = `<div><div class="eyebrow"><span>Zone ${idx + 1} of ${ZONES.length}</span><span>SW → NE</span></div>
    <h3 style="margin-top:14px;font-size:clamp(28px,3.4vw,38px)">${esc(z.name)}</h3><p class="land">${esc(z.land)}</p>
    <div class="kv"><span class="label">In the ground</span><p>${esc(z.soils)}</p></div>
    <div class="kv"><span class="label">NRCS conservation tree group</span><div class="tags">${z.groups.map(g => `<span class="tag">Group ${esc(g)}</span>`).join("")}</div></div>
    <div class="kv"><span class="label">Watch for</span><ul>${z.limits.map(l => `<li>${esc(l)}</li>`).join("")}</ul></div></div>`;
  b += `<div><div class="kv" style="margin-top:0"><span class="label">Plant from the 2027 lineup</span><div class="opts" style="margin-top:0">${z.picks.map(pickChip).join("")}</div></div>`;
  if (z.knob && z.knob.length) b += `<div class="kv"><span class="label">On limy knobs</span><div class="opts" style="margin-top:0">${z.knob.map(pickChip).join("")}</div></div>`;
  if (z.wpicks.length) b += `<div class="kv"><span class="label">Spring 2029 seedlings</span><div class="opts" style="margin-top:0">${z.wpicks.map(pickChip).join("")}</div></div>`;
  b += `<div class="kv"><span class="label">Skip here</span><div class="tags">${z.avoid.map(a => `<span class="tag warn">${esc(a)}</span>`).join("")}</div></div>`;
  b += `<div class="note"><span class="label" style="color:var(--gold)">Field note</span><p>${esc(z.tip)}</p></div>`;
  b += `<a class="ext" href="https://websoilsurvey.nrcs.usda.gov/app/" target="_blank" rel="noopener">Confirm your parcel on Web Soil Survey ↗</a></div>`;
  $("#gtDetail").innerHTML = b;
}
function setZone(id, focusTab) { gtZone = id; store.set("zone", id); renderZone(); if (focusTab) { const t = $(`#gtTabs button[data-z="${id}"]`); if (t) t.focus(); } }
function initGround() {
  $("#gtTabs").innerHTML = ZONES.map((z, i) => `<button role="tab" type="button" data-z="${z.id}" aria-controls="gtDetail"><span class="label">Zone ${i + 1}</span><span>${esc(z.short)}</span></button>`).join("");
  $("#gtFig").innerHTML = buildGroundSVG();
  $("#gtTabs").addEventListener("click", e => { const b = e.target.closest("button[data-z]"); if (b) setZone(b.dataset.z); });
  $("#gtTabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = ZONES.findIndex(z => z.id === gtZone), n = (i + (e.key === "ArrowRight" ? 1 : -1) + ZONES.length) % ZONES.length;
    e.preventDefault(); setZone(ZONES[n].id, true);
  });
  $("#gtFig").addEventListener("click", e => { const g = e.target.closest(".gt-zone"); if (g) setZone(g.dataset.z); });
  $("#gtFig").addEventListener("keydown", e => { const g = e.target.closest(".gt-zone"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setZone(g.dataset.z); } });
  renderZone();
}

/* ---------- cart ---------- */
const cart = store.get("cart", {});
const wcart = store.get("wcart", {});
Object.keys(cart).forEach(k => { if (!ALL[k] || !ALL[k].retail || !(cart[k] > 0)) delete cart[k]; else cart[k] = Math.min(cart[k], ALL[k].grown); });
Object.keys(wcart).forEach(k => { if (!ALL[k] || ALL[k].retail || !(wcart[k] >= 25)) delete wcart[k]; });
const cartTrees = () => Object.values(cart).reduce((a, b) => a + b, 0);
const cartTotal = () => SPECIES.reduce((a, s) => a + (cart[s.id] || 0) * PRICE, 0);
function cartChanged() { store.set("cart", cart); store.set("wcart", wcart); renderCounts(); renderReserve(); }
function setQty(id, n, quiet) {
  const sp = ALL[id]; n = Math.max(0, Math.round(n || 0));
  if (n > sp.grown) { n = sp.grown; if (!quiet) toast(`${sp.grown} ${sp.name} grown for 2027. Call Tanner for more.`); }
  if (n) cart[id] = n; else delete cart[id];
  cartChanged();
}
function setW(id, n) { n = Math.round(n || 0); if (n > 0 && n < 25) n = 25; n = Math.min(99999, n); if (n > 0) wcart[id] = n; else delete wcart[id]; cartChanged(); }
function renderCounts() {
  const n = cartTrees(), w = Object.values(wcart).reduce((a, b) => a + b, 0);
  $("#cartCount").textContent = n;
  SPECIES.forEach(s => { $$(`[data-qo="${s.id}"]`).forEach(o => { o.textContent = cart[s.id] || 0; }); });
  WHOLESALE.forEach(s => { $$(`[data-wo="${s.id}"]`).forEach(o => { o.textContent = wcart[s.id] || 0; }); });
  const bar = $("#cartbar");
  $("#cbTrees").textContent = n ? `${n} tree${n > 1 ? "s" : ""}` : `${w} seedlings`;
  $("#cbTotal").textContent = n ? `${money(cartTotal())} · no payment now` : "Spring 2029 interest";
  bar.dataset.has = (n || w) ? "1" : "";
  updateBar();
}
let reserveVisible = false;
function updateBar() { const bar = $("#cartbar"); bar.classList.toggle("show", !!bar.dataset.has && !reserveVisible); }

/* ---------- catalog ---------- */
const stepper = (id, wholesale) => wholesale
  ? `<span class="step"><button type="button" data-w="${id}" data-d="-25" aria-label="Fewer ${esc(ALL[id].name)}">−</button><output data-wo="${id}">0</output><button type="button" data-w="${id}" data-d="25" aria-label="25 more ${esc(ALL[id].name)}">+</button></span>`
  : `<span class="step"><button type="button" data-q="${id}" data-d="-1" aria-label="Remove one ${esc(ALL[id].name)}">−</button><output data-qo="${id}">0</output><button type="button" data-q="${id}" data-d="1" aria-label="Add one ${esc(ALL[id].name)}">+</button></span>`;
function card(s) {
  return `<article class="card" id="card-${s.id}">
    ${photoHTML(s)}
    <div class="card-body">
      <div class="tags"><span class="tag gold">${s.zone}</span>${s.native ? '<span class="tag">Native to ND</span>' : ""}${s.grown <= 50 ? '<span class="tag">Small batch</span>' : ""}</div>
      <div><h4>${esc(s.name)}</h4><div class="sci">${esc(s.sci)}</div></div>
      <p class="blurb">${esc(s.blurb)}</p>
      <dl class="specs"><dt>Mature</dt><dd>${rng(s.mature)} ft</dd><dt>20-yr</dt><dd>${rng(s.h20)} ft <span style="color:var(--dim)">NRCS</span></dd><dt>Use</dt><dd>${esc(s.use)}</dd></dl>
      <div class="buy"><span class="price">$20<small>EACH</small></span>${stepper(s.id)}</div>
    </div></article>`;
}
function renderCatalog() {
  const promos = `<div class="promo"><div><span class="label">Not sure?</span><h4 style="margin-top:10px">Five questions, three trees</h4><p style="margin-top:8px">Match the lineup to your goal and your ground.</p></div><a class="btn sm" href="#finder">Open tree finder</a></div>
    <div class="promo"><div><span class="label">Windbreak?</span><h4 style="margin-top:10px">Plan rows to scale</h4><p style="margin-top:8px">Get tree counts, cost and the sheltered zone.</p></div><a class="btn sm" href="#windbreak">Open designer</a></div>`;
  $("#catGroups").innerHTML = GROUPS.map(g => {
    const list = SPECIES.filter(s => s.group === g.id);
    return `<div class="cat-group"><div class="cat-group-head"><h3>${esc(g.name)}</h3><span class="label">${esc(g.note)} · ${list.length} species</span></div>
      <div class="cat-grid">${list.map(card).join("")}${g.id === "shade" ? promos : ""}</div></div>`;
  }).join("");
  $("#wsBody").innerHTML = WHOLESALE.map(s => `<tr id="card-${s.id}">
    <td><div class="sp-cell">${photoHTML(s, "thumb", false)}<span><strong>${esc(s.name)}</strong>${s.native ? ' <span class="tag" style="margin-left:6px">Native</span>' : ""}</span></div></td>
    <td class="sci">${esc(s.sci)}</td><td class="n">${s.h20 ? rng(s.h20) + " ft" : "Not rated"}</td>
    <td style="color:var(--mute);font-size:14px">${esc(s.use)}</td><td class="n">${stepper(s.id, true)}</td></tr>`).join("");
  wirePhotos();
}
function goto(id) {
  const el = $(`#card-${id}`); if (!el) return;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1400);
}
document.addEventListener("click", e => {
  const q = e.target.closest("[data-q]");
  if (q) { const id = q.dataset.q; setQty(id, (cart[id] || 0) + Number(q.dataset.d)); return; }
  const w = e.target.closest("[data-w]");
  if (w) { const id = w.dataset.w, cur = wcart[id] || 0, d = Number(w.dataset.d); setW(id, d < 0 && cur <= 25 ? 0 : cur + d); return; }
  const g = e.target.closest("[data-goto]");
  if (g) { goto(g.dataset.goto); return; }
  const c = e.target.closest("[data-copy]");
  if (c) { const el = document.getElementById(c.dataset.copy); copyText(el.textContent.trim()); }
});

/* ---------- finder ---------- */
const FQ = [
  { k: "goal", label: "Goal", opts: [["windbreak", "Block wind"], ["privacy", "Privacy screen"], ["shade", "Shade"], ["wildlife", "Wildlife"], ["edible", "Fruit"], ["color", "Color"], ["fast", "Fast cover"]] },
  { k: "ground", label: "Your ground", opts: [["loam", "Loamy farmland or lawn"], ["sand", "Sandy, dries out fast"], ["clay", "Heavy clay"], ["wet", "Wet in spring"], ["salt", "White salt crust"], ["knob", "Hilltop or gravelly knob"]] },
  { k: "space", label: "Room to grow", opts: [["small", "Under 20 ft"], ["medium", "20 to 40 ft"], ["large", "40 ft or more"]] },
  { k: "leaf", label: "Foliage", opts: [["ever", "Evergreen"], ["decid", "Leaves that turn"], ["either", "Either"]] },
  { k: "pace", label: "Patience", opts: [["fast", "Need height soon"], ["steady", "Happy to wait"]] }
];
const GOALP = { windbreak: "block wind", privacy: "screen for privacy", shade: "cast shade", wildlife: "feed and shelter wildlife", edible: "grow fruit", color: "bring color", fast: "give fast cover" };
const GROUNDP = { loam: "loamy ground", sand: "sandy ground", clay: "heavy clay", wet: "ground that's wet in spring", salt: "salty ground", knob: "dry, limy knobs" };
const fa = Object.assign({ goal: "windbreak", ground: "loam", space: "large", leaf: "either", pace: "steady" }, store.get("finder", {}));
function score(s) {
  const goal = s.goals[fa.goal] || 0, soil = s.soil[fa.ground] || 0;
  const lim = fa.space === "small" ? 20 : fa.space === "medium" ? 40 : 999;
  const size = s.mature[1] <= lim ? 2 : s.mature[0] <= lim ? 1 : 0;
  const leaf = fa.leaf === "either" ? 2 : ((fa.leaf === "ever") === s.ever ? 2 : 0);
  const speed = fa.pace === "fast" ? Math.min(2, s.h20[1] / 16) : 2;
  let pct = Math.round((goal * 3 + soil * 3 + size * 2 + leaf * 1.5 + speed) / 21 * 100);
  if (soil === 0) pct = Math.min(pct, 24);
  if (leaf === 0) pct = Math.min(pct, 40);
  if (size === 0) pct = Math.min(pct, 48);
  return { s, pct, goal, soil, size };
}
function reasons(r) {
  const g = GOALP[fa.goal], gr = GROUNDP[fa.ground];
  return [
    r.goal >= 2 ? ["good", `Top pick to ${g}`] : r.goal >= 1 ? ["", `Can ${g}`] : ["bad", `Not built to ${g}`],
    r.soil >= 2 ? ["good", `Thrives on ${gr}`] : r.soil >= 1 ? ["", `Handles ${gr}`] : r.soil > 0 ? ["bad", `Struggles on ${gr}`] : ["bad", `Wrong tree for ${gr}`],
    [r.size === 2 ? "good" : r.size ? "" : "bad", `Mature height ${rng(r.s.mature)} ft${r.size === 2 ? ", fits your space" : r.size ? ", may outgrow it" : ", too big for the space"}`],
    ["", `NRCS 20-year height ${rng(r.s.h20)} ft${r.s.native ? " · native to ND" : ""}`]
  ];
}
function renderFinder() {
  $("#fq").innerHTML = FQ.map(q => `<div class="q" role="group" aria-label="${q.label}"><span class="label">${q.label}</span><div class="opts">${q.opts.map(o => `<button class="chip" type="button" data-fk="${q.k}" data-fv="${o[0]}" aria-pressed="${fa[q.k] === o[0]}">${o[1]}</button>`).join("")}</div></div>`).join("");
  const ranked = SPECIES.map(score).sort((a, b) => b.pct - a.pct).slice(0, 3);
  let html = ranked.map((r, i) => `<div class="match${i === 0 ? " top" : ""}">${photoHTML(r.s, "mph", false)}<div class="mbody">
    <div class="row1"><span class="pct">${r.pct}<small>%</small></span><div><h4>${esc(r.s.name)}</h4><div class="sci">${esc(r.s.sci)}</div></div></div>
    <ul>${reasons(r).map(x => `<li class="${x[0]}">${esc(x[1])}</li>`).join("")}</ul>
    <div class="acts"><button class="btn sm${i === 0 ? " primary" : ""}" type="button" data-add="${r.s.id}">Add to reservation</button><button class="btn sm" type="button" data-see="${r.s.id}">See it grow</button></div></div></div>`).join("");
  if (fa.ground === "wet") html += `<p class="hint">Wet ground also suits the Spring 2029 willow, dogwood and hybrid poplar seedlings. <button class="chip" type="button" data-goto="willow" style="margin-top:8px">See wholesale</button></p>`;
  if (fa.ground === "salt") html += `<p class="hint">Salty ground limits nearly every tree. Silver buffaloberry is one of the few that does well on it; plant others on higher, non-saline ground where you can.</p>`;
  $("#fr").innerHTML = html;
  wirePhotos($("#fr"));
}
function initFinder() {
  renderFinder();
  $("#finder").addEventListener("click", e => {
    const c = e.target.closest("[data-fk]");
    if (c) { fa[c.dataset.fk] = c.dataset.fv; store.set("finder", fa); renderFinder(); const again = $(`[data-fk="${c.dataset.fk}"][data-fv="${c.dataset.fv}"]`); if (again) again.focus(); return; }
    const a = e.target.closest("[data-add]");
    if (a) { setQty(a.dataset.add, (cart[a.dataset.add] || 0) + 1); toast(`Added 1 ${ALL[a.dataset.add].name}`); return; }
    const v = e.target.closest("[data-see]");
    if (v) { const id = v.dataset.see; if (!grow.sel.includes(id)) grow.sel = [id].concat(grow.sel).slice(0, 4); renderGrow(); $("#grow").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  });
}

/* ---------- grow ---------- */
const grow = Object.assign({ sel: ["bhs", "oak", "aspen", "choke"], year: 10, q: "typical" }, store.get("grow", {}));
grow.sel = (grow.sel || []).filter(id => ALL[id] && ALL[id].retail).slice(0, 4);
if (!grow.sel.length) grow.sel = ["bhs", "oak"];
function heightAt(s, t, q) {
  const h0 = 1.5, H = mid(s.mature), h20 = h20For(s, q);
  const r = Math.min(.95, Math.max(.05, (h20 - h0) / (H - h0))), k = -Math.log(1 - Math.sqrt(r)) / 20;
  return h0 + (H - h0) * Math.pow(1 - Math.exp(-k * t), 2);
}
const QUAL = [["prime", "Prime"], ["typical", "Typical"], ["tough", "Tough"]];
const segHTML = cur => QUAL.map(q => `<button type="button" data-qv="${q[0]}" aria-pressed="${cur === q[0]}">${q[1]}</button>`).join("");
function renderGrow() {
  store.set("grow", grow);
  $("#yr").value = grow.year; $("#yrOut").textContent = grow.year;
  $("#growSoil").innerHTML = segHTML(grow.q);
  $("#selCount").textContent = `· ${grow.sel.length} of 4`;
  $("#growPick").innerHTML = SPECIES.map(s => `<button class="chip" type="button" data-gs="${s.id}" aria-pressed="${grow.sel.includes(s.id)}"><span class="sw" style="background:var(${s.fill})"></span>${esc(s.name)}</button>`).join("");
  const W = 1000, base = 420, ppf = (base - 36) / 64;
  let s = `<svg viewBox="0 0 ${W} 484" role="img" aria-label="Trees at year ${grow.year} after planting, drawn to scale">`;
  for (let ft = 10; ft <= 60; ft += 10) { const y = base - ft * ppf; s += `<path d="M58 ${y.toFixed(1)} H${W - 16}" style="stroke:var(--line);stroke-width:1"/><text x="50" y="${(y + 3).toFixed(1)}" text-anchor="end" style="font:500 10px var(--mono);fill:var(--dim)">${ft} FT</text>`; }
  s += `<rect x="0" y="${base}" width="${W}" height="64" style="fill:var(--soil-top)"/><path d="M0 ${base} H${W}" style="stroke:var(--line-2);stroke-width:1.5"/>`;
  const ph = 6 * ppf, px = 100;
  s += `<circle cx="${px}" cy="${(base - ph + ph * 0.09).toFixed(1)}" r="${(ph * 0.09).toFixed(1)}" style="fill:var(--mute)"/><path d="M${px - ph * 0.11} ${base} L${px - ph * 0.08} ${base - ph * 0.5} L${px - ph * 0.13} ${base - ph * 0.78} L${px + ph * 0.13} ${base - ph * 0.78} L${px + ph * 0.08} ${base - ph * 0.5} L${px + ph * 0.11} ${base} Z" style="fill:var(--mute)"/>`;
  s += `<text x="${px}" y="${base + 20}" text-anchor="middle" style="font:500 10px var(--mono);letter-spacing:.1em;fill:var(--dim)">6 FT</text>`;
  const n = grow.sel.length, x0 = 170, slot = (W - 30 - x0) / n;
  grow.sel.forEach((id, i) => {
    const sp = ALL[id], cx = x0 + slot * (i + .5), h = heightAt(sp, grow.year, grow.q);
    const mY = base - mid(sp.mature) * ppf, lo = base - sp.h20[0] * ppf, hi = base - sp.h20[1] * ppf, bx = cx + Math.min(slot * 0.38, 90);
    s += `<path d="M${(cx - slot * 0.32).toFixed(1)} ${mY.toFixed(1)} H${(cx + slot * 0.32).toFixed(1)}" style="stroke:var(--fg);stroke-width:1;stroke-dasharray:3 4;opacity:.45"/>`;
    s += `<text x="${(cx - slot * 0.32).toFixed(1)}" y="${(mY - 6).toFixed(1)}" style="font:500 9px var(--mono);letter-spacing:.1em;fill:var(--mute)">MATURE ${rng(sp.mature)} FT</text>`;
    s += `<rect x="${(bx - 2).toFixed(1)}" y="${hi.toFixed(1)}" width="4" height="${(lo - hi).toFixed(1)}" style="fill:var(--frost);opacity:.7"/><text x="${(bx + 7).toFixed(1)}" y="${((lo + hi) / 2 + 3).toFixed(1)}" style="font:500 9px var(--mono);letter-spacing:.08em;fill:var(--frost)">20-YR</text>`;
    s += tree(sp.form, cx, base, h * ppf, sp.fill, { bloom: grow.year >= 3 ? sp.bloom : null });
    s += `<text x="${cx.toFixed(1)}" y="${base + 22}" text-anchor="middle" style="font:500 10px var(--mono);letter-spacing:.1em;fill:var(--fg)">${esc(sp.name.toUpperCase())}</text>`;
    s += `<text x="${cx.toFixed(1)}" y="${base + 48}" text-anchor="middle" style="font:600 22px var(--display);fill:var(--gold)">${h.toFixed(h < 10 ? 1 : 0)} FT</text>`;
  });
  $("#scene").innerHTML = s + `</svg>`;
  $("#readout").innerHTML = grow.sel.map(id => { const sp = ALL[id], h = heightAt(sp, grow.year, grow.q); return `<div><span class="label">${esc(sp.name)}</span><div class="h">${h.toFixed(h < 10 ? 1 : 0)}<small>ft</small></div><p>Yr 20 NRCS ${rng(sp.h20)} ft<br>Mature ${rng(sp.mature)} ft</p></div>`; }).join("");
}
let playing = 0;
function play() {
  if (playing) { cancelAnimationFrame(playing); playing = 0; $("#playBtn").textContent = "Play 40 years"; return; }
  if (reduced) { grow.year = 40; renderGrow(); return; }
  const start = grow.year >= 40 ? 0 : grow.year, t0 = performance.now(), dur = (40 - start) * 140;
  $("#playBtn").textContent = "Pause";
  const step = now => {
    const y = Math.min(40, Math.round(start + (now - t0) / dur * (40 - start)));
    if (y !== grow.year) { grow.year = y; renderGrow(); }
    if (y < 40) playing = requestAnimationFrame(step); else { playing = 0; $("#playBtn").textContent = "Play 40 years"; }
  };
  grow.year = start; renderGrow(); playing = requestAnimationFrame(step);
}
function initGrow() {
  renderGrow();
  $("#yr").addEventListener("input", e => { grow.year = Number(e.target.value); renderGrow(); });
  $("#playBtn").addEventListener("click", play);
  $("#growSoil").addEventListener("click", e => { const b = e.target.closest("[data-qv]"); if (b) { grow.q = b.dataset.qv; renderGrow(); } });
  $("#growPick").addEventListener("click", e => {
    const b = e.target.closest("[data-gs]"); if (!b) return;
    const id = b.dataset.gs, i = grow.sel.indexOf(id);
    if (i >= 0) { if (grow.sel.length > 1) grow.sel.splice(i, 1); else { toast("Keep at least one tree in the yard"); return; } }
    else { if (grow.sel.length >= 4) { toast("Four trees at a time. Remove one first."); return; } grow.sel.push(id); }
    renderGrow(); const again = $(`[data-gs="${id}"]`); if (again) again.focus();
  });
}

/* ---------- windbreak ---------- */
const ROW_GAP = 20;
const wb = Object.assign({ len: 400, q: "typical", rows: [{ sp: "lilac", s: 5 }, { sp: "erc", s: 10 }, { sp: "bhs", s: 10 }] }, store.get("wb", {}));
wb.rows = (wb.rows || []).filter(r => ALL[r.sp]).slice(0, 5);
if (!wb.rows.length) wb.rows = [{ sp: "bhs", s: 10 }];
function wbCalc() {
  const L = Math.max(50, Math.min(5000, Number(wb.len) || 400));
  const rows = wb.rows.map(r => { const sp = ALL[r.sp], s = Math.max(2, Math.min(50, Number(r.s) || 10)); return { sp, s, n: Math.floor(L / s) + 1, h: h20For(sp, wb.q) }; });
  const H = Math.max(...rows.map(r => r.h), 0.1);
  const retail = rows.filter(r => r.sp.retail).reduce((a, r) => a + r.n, 0), whole = rows.filter(r => !r.sp.retail).reduce((a, r) => a + r.n, 0);
  return { L, rows, H, retail, whole, total: retail + whole, prot: 10 * H, drift: 3 * H, acres: L * 10 * H / 43560, longOK: L >= 10 * H };
}
function speciesOptions(cur) {
  const o = list => list.map(s => `<option value="${s.id}"${s.id === cur ? " selected" : ""}>${esc(s.name)}${s.h20 ? "" : " (not rated)"}</option>`).join("");
  return `<optgroup label="2027 potted trees · $20">${o(SPECIES)}</optgroup><optgroup label="Spring 2029 seedlings · quote">${o(WHOLESALE)}</optgroup>`;
}
function renderWBControls() {
  $("#wbLen").value = wb.len;
  $("#wbSoil").innerHTML = segHTML(wb.q);
  $("#wbRows").innerHTML = wb.rows.map((r, i) => `<div class="wb-row"><span class="label">Row ${i + 1}${i === 0 ? " · windward" : ""}</span>
    <label class="sr" for="wbSp${i}">Row ${i + 1} species</label><select id="wbSp${i}" data-row="${i}" data-f="sp">${speciesOptions(r.sp)}</select>
    <label class="sr" for="wbS${i}">Row ${i + 1} spacing in feet</label><input type="number" id="wbS${i}" data-row="${i}" data-f="s" min="2" max="50" step="1" value="${r.s}" inputmode="numeric" title="Spacing in row (ft)">
    <button type="button" class="icon-btn" data-del="${i}" aria-label="Remove row ${i + 1}"${wb.rows.length < 2 ? " disabled" : ""}>×</button></div>`).join("");
  $("#wbAdd").disabled = wb.rows.length >= 5;
}
function renderWB() {
  store.set("wb", wb);
  const c = wbCalc();
  const m = [
    ["Trees", c.total.toLocaleString("en-US"), `${c.rows.length} row${c.rows.length > 1 ? "s" : ""} · ${c.L.toLocaleString("en-US")} ft long`],
    ["Retail cost", money(c.retail * PRICE), `${c.retail.toLocaleString("en-US")} potted trees at $20`],
    ["Seedlings", c.whole.toLocaleString("en-US"), c.whole ? "Spring 2029, priced on request" : "None in this plan"],
    ["20-yr height", `${Math.round(c.H)} ft`, `Tallest row, ${wb.q} site (NRCS)`],
    ["Shelter", `${Math.round(c.prot)} ft`, `≈10H downwind · ${c.acres.toFixed(1)} acres`],
    ["Length check", c.longOK ? "Pass" : "Extend", c.longOK ? "At least 10× tree height" : `Aim for ${Math.ceil(c.prot / 10) * 10} ft or more`]
  ];
  $("#wbMetrics").innerHTML = m.map((x, i) => `<div><span class="label">${x[0]}</span><div class="v${i === 5 ? (c.longOK ? " ok" : " warn") : ""}">${x[1]}</div><div class="s">${x[2]}</div></div>`).join("");
  const W = 1000, padX = 70, rowsDepth = (c.rows.length - 1) * ROW_GAP, ppf = Math.min((W - padX * 2) / c.L, 380 / (c.prot + rowsDepth));
  const lenPx = c.L * ppf, x0 = (W - lenPx) / 2, y0 = 92, lastY = y0 + rowsDepth * ppf, protY = lastY + c.prot * ppf, driftY = lastY + c.drift * ppf, Hh = Math.ceil(protY + 70);
  let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Plan view of the windbreak and its sheltered zone, to scale">`;
  s += `<rect x="${x0}" y="${lastY}" width="${lenPx}" height="${(protY - lastY).toFixed(1)}" style="fill:var(--gold);opacity:.07"/><rect x="${x0}" y="${lastY}" width="${lenPx}" height="${(driftY - lastY).toFixed(1)}" style="fill:var(--frost);opacity:.14"/>`;
  s += `<path d="M${x0} ${protY.toFixed(1)} H${x0 + lenPx}" style="stroke:var(--gold);stroke-dasharray:6 5;stroke-width:1.5"/><text x="${x0 + lenPx}" y="${(protY + 18).toFixed(1)}" text-anchor="end" style="font:500 11px var(--mono);letter-spacing:.1em;fill:var(--gold)">SHELTER ≈10H · ${Math.round(c.prot)} FT</text>`;
  s += `<path d="M${x0} ${driftY.toFixed(1)} H${x0 + lenPx}" style="stroke:var(--frost);stroke-dasharray:2 4;stroke-width:1"/><text x="${x0 + 4}" y="${(driftY + 15).toFixed(1)}" style="font:500 11px var(--mono);letter-spacing:.1em;fill:var(--frost)">DEEP DRIFT ≈3H · ${Math.round(c.drift)} FT</text>`;
  const hy = lastY + (c.prot * 0.6) * ppf, hx = x0 + lenPx / 2, hw = Math.max(16, Math.min(60, 40 * ppf));
  s += house(hx, hy, hw) + `<text x="${hx}" y="${(hy + 16).toFixed(1)}" text-anchor="middle" style="font:500 10px var(--mono);letter-spacing:.12em;fill:var(--mute)">YARD</text>`;
  s += `<defs><marker id="wbArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:var(--mute)"/></marker></defs>`;
  for (let k = 0; k < 5; k++) { const ax = x0 + lenPx * (k + .5) / 5; s += `<path d="M${ax.toFixed(1)} 26 V${(y0 - 22).toFixed(1)}" style="stroke:var(--mute);stroke-width:1.2" marker-end="url(#wbArrow)"/>`; }
  s += `<text x="${x0}" y="20" style="font:500 11px var(--mono);letter-spacing:.14em;fill:var(--mute)">WINTER WIND</text>`;
  c.rows.forEach((r, i) => {
    const y = y0 + i * ROW_GAP * ppf, gap = r.s * ppf, rad = Math.max(1.6, Math.min(7, (r.sp.retail ? 4.5 : 3) * ppf));
    if (gap < 3.2) s += `<path d="M${x0} ${y.toFixed(1)} H${x0 + lenPx}" style="stroke:var(${r.sp.fill});stroke-width:${(rad * 2).toFixed(1)};stroke-linecap:round"/>`;
    else for (let k = 0; k < r.n; k++) s += `<circle cx="${(x0 + k * gap).toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" style="fill:var(${r.sp.fill})"/>`;
    s += `<text x="${(x0 - 10).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" style="font:500 10px var(--mono);fill:var(--dim)">R${i + 1}</text>`;
  });
  const sb = c.L >= 1500 ? 500 : c.L >= 600 ? 200 : c.L >= 200 ? 100 : 50, sby = Hh - 26;
  s += `<path d="M${x0} ${sby} H${(x0 + sb * ppf).toFixed(1)}" style="stroke:var(--fg);stroke-width:2"/><text x="${x0}" y="${sby + 16}" style="font:500 10px var(--mono);letter-spacing:.1em;fill:var(--mute)">${sb} FT</text>`;
  $("#wbPlan").innerHTML = s + `</svg>`;
  $("#wbSummary").textContent = c.rows.map((r, i) => `R${i + 1} ${r.n} ${r.sp.name} @ ${r.s} ft`).join(" · ");
}
function initWB() {
  renderWBControls(); renderWB();
  $("#wbLen").addEventListener("input", e => { wb.len = e.target.value; renderWB(); });
  $("#wbLen").addEventListener("change", e => { wb.len = Math.max(50, Math.min(5000, Number(e.target.value) || 400)); e.target.value = wb.len; renderWB(); });
  $("#wbSoil").addEventListener("click", e => { const b = e.target.closest("[data-qv]"); if (b) { wb.q = b.dataset.qv; $("#wbSoil").innerHTML = segHTML(wb.q); renderWB(); } });
  $("#wbRows").addEventListener("change", e => {
    const t = e.target, i = Number(t.dataset.row); if (isNaN(i)) return;
    if (t.dataset.f === "sp") { wb.rows[i].sp = t.value; wb.rows[i].s = ALL[t.value].form === "shrub" ? 5 : 10; renderWBControls(); }
    else { wb.rows[i].s = Math.max(2, Math.min(50, Number(t.value) || 10)); t.value = wb.rows[i].s; }
    renderWB();
  });
  $("#wbRows").addEventListener("input", e => { const t = e.target; if (t.dataset.f === "s") { const v = Number(t.value); if (v >= 2) { wb.rows[Number(t.dataset.row)].s = v; renderWB(); } } });
  $("#wbRows").addEventListener("click", e => { const d = e.target.closest("[data-del]"); if (d && wb.rows.length > 1) { wb.rows.splice(Number(d.dataset.del), 1); renderWBControls(); renderWB(); } });
  $("#wbAdd").addEventListener("click", () => { if (wb.rows.length < 5) { wb.rows.push({ sp: "pine", s: 10 }); renderWBControls(); renderWB(); } });
  $("#wbToCart").addEventListener("click", () => {
    const c = wbCalc(); let capped = [];
    c.rows.forEach(r => {
      if (r.sp.retail) { const want = (cart[r.sp.id] || 0) + r.n; if (want > r.sp.grown) capped.push(r.sp.name); cart[r.sp.id] = Math.min(r.sp.grown, want); }
      else wcart[r.sp.id] = Math.max(25, (wcart[r.sp.id] || 0) + r.n);
    });
    cartChanged();
    toast(capped.length ? `Added. ${capped.join(", ")} capped at this season's supply; Tanner can source more.` : `Added ${c.total.toLocaleString("en-US")} plants from the plan`);
  });
}

/* ---------- roadmap ---------- */
function renderRoad() {
  $("#road").innerHTML = ROAD.map(r => `<div class="${r.s}"><div class="y">${r.y}</div>${r.s === "now" ? '<span class="tag gold" style="margin-top:8px">Now</span>' : ""}<p>${esc(r.t)}</p></div>`).join("");
}

/* ---------- reserve ---------- */
const formStart = Date.now();
function renderReserve() {
  const lines = SPECIES.filter(s => cart[s.id]);
  $("#resLines").innerHTML = lines.length ? `<div class="lines">${lines.map(s => `<div class="line">${photoHTML(s, "thumb", false)}<div class="nm">${esc(s.name)}<small>${esc(s.sci)}</small></div>${stepper(s.id)}<span class="tot">${money(cart[s.id] * PRICE)}</span></div>`).join("")}</div>`
    : `<div class="empty">No trees yet. Add them from the <a href="#catalog">2027 lineup</a>, the <a href="#finder">tree finder</a>, or the <a href="#windbreak">windbreak designer</a>.</div>`;
  $("#resTotal").textContent = money(cartTotal());
  const ws = WHOLESALE.filter(s => wcart[s.id]);
  $("#resWs").innerHTML = ws.length ? `<div class="lines">${ws.map(s => `<div class="line">${photoHTML(s, "thumb", false)}<div class="nm">${esc(s.name)}<small>Minimum 25 · Spring 2029</small></div>${stepper(s.id, true)}<span class="tot">Quote</span></div>`).join("")}</div>`
    : `<div class="empty">No seedlings noted. Add interest from the <a href="#wholesale">wholesale table</a>.</div>`;
  renderCountsOnly();
  wirePhotos($("#reserve"));
}
function renderCountsOnly() {
  SPECIES.forEach(s => { $$(`[data-qo="${s.id}"]`).forEach(o => { o.textContent = cart[s.id] || 0; }); });
  WHOLESALE.forEach(s => { $$(`[data-wo="${s.id}"]`).forEach(o => { o.textContent = wcart[s.id] || 0; }); });
}
function summaryText(extra) {
  const lines = SPECIES.filter(s => cart[s.id]).map(s => `- ${cart[s.id]} x ${s.name} (${money(cart[s.id] * PRICE)})`);
  const ws = WHOLESALE.filter(s => wcart[s.id]).map(s => `- ${wcart[s.id]} x ${s.name} seedlings (Spring 2029, quote)`);
  return [
    `${SITE.name} reservation${extra ? " " + extra : ""}`, "",
    "2027 potted trees:", ...(lines.length ? lines : ["- none"]), `Retail total: ${money(cartTotal())}`, "",
    "Spring 2029 seedling interest:", ...(ws.length ? ws : ["- none"]), "",
    `Name: ${$("#rName").value.trim() || "-"}`, `Phone: ${$("#rPhone").value.trim() || "-"}`, `Email: ${$("#rEmail").value.trim() || "-"}`,
    `Pickup: ${$("#rPickup").value}`, `Notes: ${$("#rNotes").value.trim() || "-"}`, "",
    `Send to ${SITE.email} or ${SITE.phone}`
  ].join("\n");
}
function setMsg(t, cls) { const m = $("#resMsg"); m.textContent = t; m.className = "msgline" + (cls ? " " + cls : ""); }
async function submitOrder(e) {
  e.preventDefault();
  const hasItems = Object.keys(cart).length || Object.keys(wcart).length;
  const name = $("#rName").value.trim(), phone = $("#rPhone").value.trim(), email = $("#rEmail").value.trim();
  if (!hasItems) { setMsg("Add at least one tree or seedling first.", "err"); return; }
  if (!name) { setMsg("Add your name.", "err"); $("#rName").focus(); return; }
  if (!phone && !email) { setMsg("Add a phone number or an email so Tanner can reach you.", "err"); $("#rPhone").focus(); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setMsg("That email address doesn't look right.", "err"); $("#rEmail").focus(); return; }
  const btn = $("#resSave"); btn.disabled = true; setMsg("Sending your reservation…");
  const payload = { items: Object.assign({}, cart), seedlings: Object.assign({}, wcart), name, phone, email, pickup: $("#rPickup").value, heard: $("#rHeard").value, notes: $("#rNotes").value.trim(), website: ($("#rLeaveBlank") || { value: "" }).value, elapsed: Date.now() - formStart, source: "web" };
  try {
    const r = await fetch("/api/order", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.error || `Request failed (${r.status})`);
    showDone(d.id, summaryText(d.id));
  } catch (err) {
    btn.disabled = false;
    setMsg(`Couldn't send: ${err.message}. Copy the summary below and send it to Tanner.`, "err");
    const ta = $("#resText"); ta.value = summaryText(); ta.hidden = false; ta.focus(); ta.select();
  }
}
function showDone(id, text) {
  const contact = $("#rPhone").value.trim() || $("#rEmail").value.trim();
  $("#resForm").hidden = true;
  const d = $("#resDone"); d.hidden = false;
  $("#doneId").textContent = id;
  $("#doneContact").textContent = contact;
  $("#doneText").value = text;
  store.set("last", { id, at: new Date().toISOString() });
  // Keep name/phone/email for a repeat order, but don't carry this order's notes into the next one.
  const draft = store.get("contact", {}); delete draft.rNotes; store.set("contact", draft); $("#rNotes").value = "";
  Object.keys(cart).forEach(k => delete cart[k]); Object.keys(wcart).forEach(k => delete wcart[k]);
  cartChanged();
  d.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
function initReserve() {
  $("#rPickup").innerHTML = PICKUP.map(p => `<option>${esc(p)}</option>`).join("");
  $("#rHeard").innerHTML = `<option value="">Choose one (optional)</option>` + HEARD.map(p => `<option>${esc(p)}</option>`).join("");
  const draft = store.get("contact", {});
  ["rName", "rPhone", "rEmail", "rNotes"].forEach(id => { if (draft[id]) $("#" + id).value = draft[id]; $("#" + id).addEventListener("input", () => { const d = store.get("contact", {}); d[id] = $("#" + id).value; store.set("contact", d); }); });
  renderReserve();
  $("#resForm").addEventListener("submit", submitOrder);
  $("#resCopy").addEventListener("click", () => { const ta = $("#resText"); ta.value = summaryText(); ta.hidden = false; copyText(ta.value, ta); });
  $("#doneCopy").addEventListener("click", () => copyText($("#doneText").value, $("#doneText")));
  $("#doneNew").addEventListener("click", () => { $("#resDone").hidden = true; $("#resForm").hidden = false; setMsg(""); $("#resSave").disabled = false; $("#rNotes").value = ""; $("#catalog").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { reserveVisible = es[0].isIntersecting; updateBar(); }, { threshold: 0.05 }).observe($("#reserve"));
}

/* ---------- ask (Workers AI via /api/ask) ---------- */
const turns = [];
let asking = false, askCtl = null;
const ASK_CHIPS = [
  "What should I plant for a windbreak on sandy ground north of my farmyard?",
  "Which trees in your lineup are native to North Dakota?",
  "How many trees do I need for a 300 ft, three-row windbreak?",
  "What grows on salty ground near the foot of the hills?",
  "Which fruit trees would you plant for jam and for birds?"
];
function addMsg(role, text) {
  const d = document.createElement("div"); d.className = "msg " + role;
  if (role !== "sys") { const who = document.createElement("span"); who.className = "label who"; who.textContent = role === "user" ? "You" : SITE.name; d.appendChild(who); }
  const body = document.createElement("span"); body.textContent = text; d.appendChild(body);
  $("#log").appendChild(d); $("#log").scrollTop = $("#log").scrollHeight;
  return body;
}
function askState(kind, text) { const st = $("#askStatus"); st.innerHTML = `<span class="dot ${kind}"></span><span></span>`; st.lastChild.textContent = text; }
async function ask(q) {
  q = (q || "").trim(); if (!q || asking) return;
  asking = true; addMsg("user", q); turns.push({ role: "user", content: q });
  while (turns.length > 10) turns.shift();
  while (turns.length && turns[0].role !== "user") turns.shift();
  const body = addMsg("bot", "Thinking…");
  askCtl = new AbortController();
  $("#askIn").value = ""; $("#askSend").disabled = true; $("#askStop").hidden = false;
  try {
    const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: turns }), signal: askCtl.signal });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.error || "The advisor is unavailable right now.");
    body.textContent = d.answer; turns.push({ role: "assistant", content: d.answer });
    askState("live", "Live. Answers draw on this site's catalog and soil notes.");
  } catch (e) {
    if (e.name === "AbortError") { if (body.textContent === "Thinking…") body.parentNode.remove(); }
    else { body.parentNode.remove(); addMsg("sys", `${e.message} Call or text ${SITE.phone} instead.`); }
    if (turns.length && turns[turns.length - 1].role === "user") turns.pop();
  } finally { asking = false; askCtl = null; $("#askStop").hidden = true; $("#askSend").disabled = false; }
}
function initAsk() {
  $("#askChips").innerHTML = ASK_CHIPS.map(q => `<button class="chip" type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join("");
  $("#askChips").addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (b) ask(b.dataset.ask); });
  $("#askForm").addEventListener("submit", e => { e.preventDefault(); ask($("#askIn").value); });
  $("#askStop").addEventListener("click", () => { if (askCtl) askCtl.abort(); });
  fetch("/api/health").then(r => r.json()).then(h => {
    if (h.advisor) askState("live", "Live. Answers draw on this site's catalog and soil notes.");
    else askState("off", `The advisor is offline. Call or text ${SITE.phone}.`);
  }).catch(() => askState("off", `The advisor is offline. Call or text ${SITE.phone}.`));
}

/* ---------- hero sky ---------- */
function initSky() {
  const cv = $("#sky"), ctx = cv.getContext("2d"); if (!ctx) return;
  const col = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { void: col("--void"), deck: col("--deck"), deck2: col("--deck-2"), deck3: col("--deck-3"), fg: col("--fg") };
  let W = 0, H = 0, stars = [], spikes = [], raf = 0, visible = true, seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const ridge = (x, base, amp, k) => H * base - H * amp * smooth((x / W - 0.42) / 0.38) - Math.sin(x / (55 * k)) * 5 * k - Math.sin(x / (23 * k) + k) * 3;
  function build() {
    seed = 7; stars = []; spikes = [];
    const n = Math.round(W * H / 2600);
    for (let i = 0; i < n; i++) stars.push({ x: rand() * W, y: rand() * H * 0.75, r: rand() * 1.1 + .2, p: rand() * 6.28, s: .4 + rand() * 1.4 });
    for (let x = 0; x < W; x += 5 + rand() * 9) { const t = x / W; if (t > 0.38 && rand() < 0.35 + t * 0.5) spikes.push({ x, h: 6 + rand() * 16 * (0.4 + t) }); }
  }
  function size() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); draw(0);
  }
  function draw(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.void); g.addColorStop(.7, C.deck); g.addColorStop(1, C.deck2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const a = ctx.createRadialGradient(W * .72, H * .36, 0, W * .72, H * .36, W * .45); a.addColorStop(0, "rgba(155,188,203,.10)"); a.addColorStop(1, "rgba(155,188,203,0)");
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.fg;
    stars.forEach(s => { ctx.globalAlpha = .25 + .55 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.s + s.p)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });
    ctx.globalAlpha = 1;
    const layer = (base, amp, k, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 6) ctx.lineTo(x, ridge(x, base, amp, k)); ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); };
    layer(.80, .26, 1.7, C.deck3); layer(.86, .22, 1.2, C.deck2); layer(.92, .19, .8, C.void);
    ctx.fillStyle = C.void;
    spikes.forEach(p => { const y = ridge(p.x, .92, .19, .8) + 2; ctx.beginPath(); ctx.moveTo(p.x - p.h * .22, y); ctx.lineTo(p.x, y - p.h); ctx.lineTo(p.x + p.h * .22, y); ctx.closePath(); ctx.fill(); });
  }
  const loop = now => { draw(now); raf = visible ? requestAnimationFrame(loop) : 0; };
  size();
  window.addEventListener("resize", () => { cancelAnimationFrame(raf); raf = 0; size(); if (!reduced && visible) raf = requestAnimationFrame(loop); });
  if (!reduced && "IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 }).observe(cv);
}

/* ---------- boot ---------- */
initSky();
initGround();
renderCatalog();
initFinder();
initGrow();
initWB();
renderRoad();
initReserve();
initAsk();
renderCounts();
if (location.hash === "#reserve") $("#reserve").scrollIntoView();
