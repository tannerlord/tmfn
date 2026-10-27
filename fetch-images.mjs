#!/usr/bin/env node
// Downloads one public-domain (or CC0) photo per species from Wikimedia Commons into
// public/assets/trees/ and records the photographer and license in credits.json.
//
//   npm run images                   download photos you don't have yet
//   npm run images -- --force        replace every photo
//   npm run images -- --only=lilac,choke --force
//
// Don't like a pick? Find a better public-domain photo on commons.wikimedia.org, put its
// "File:..." title in scripts/image-picks.json under the species id, and rerun with --only=<id> --force.
// Files you drop into public/assets/trees/ yourself are never overwritten without --force.
import { SPECIES, WHOLESALE } from "../public/assets/data.js";
import { readFile, writeFile, access, mkdir } from "node:fs/promises";

const DIR = new URL("../public/assets/trees/", import.meta.url);
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "TurtleMountainForestNursery-ImageFetcher/1.0 (https://turtlemountainforestnursery.com)";
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyArg = args.find(a => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice(7).split(",").map(s => s.trim()).filter(Boolean) : null;

const QUERIES = {
  bhs: ["Picea glauca densata", "Picea glauca tree"], cbs: ["Picea pungens tree", "Picea pungens"], pine: ["Pinus ponderosa tree", "Pinus ponderosa"],
  rmj: ["Juniperus scopulorum"], erc: ["Juniperus virginiana tree", "Juniperus virginiana"], oak: ["Quercus macrocarpa tree", "Quercus macrocarpa"],
  aspen: ["Populus tremuloides grove", "Populus tremuloides"], larch: ["Larix sibirica"], june: ["Amelanchier alnifolia"],
  choke: ["Prunus virginiana Schubert", "Prunus virginiana"], plum: ["Prunus americana"], lilac: ["Syringa vulgaris flowers", "Syringa vulgaris"],
  buffalo: ["Shepherdia argentea"], poplar: ["hybrid poplar plantation", "Populus canadensis", "poplar windbreak"], willow: ["Salix alba Vitellina", "Salix alba"],
  dogwood: ["Cornus sericea"], caragana: ["Caragana arborescens"], nanking: ["Prunus tomentosa"], elder: ["Sambucus canadensis", "Sambucus nigra canadensis"]
};
const LICENSE_FILTERS = ["haswbstatement:P6216=Q19652", "haswbstatement:P275=Q6938433"]; // copyright status: public domain · license: CC0
const OK_LICENSE = /public domain|^pd\b|cc0|cc-zero/i;
const EXCLUDE = /herbar|specimen|\bmap\b|range|distribution|illustrat|drawing|\bplate\b|botanical|seed|pollen|lumber|\bwood\b|grain|section|logo|stamp|\.svg|\.tiff?$|\.gif$|\.pdf$/i;
const strip = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(params) {
  const p = new URLSearchParams(Object.assign({ action: "query", format: "json", formatversion: "2", prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "960", iiextmetadatafilter: "LicenseShortName|Artist|Credit" }, params));
  const r = await fetch(`${API}?${p}`, { headers: { "user-agent": UA, "api-user-agent": UA } });
  if (!r.ok) throw new Error(`Commons API answered ${r.status}`);
  const d = await r.json();
  return ((d.query && d.query.pages) || []).sort((a, b) => (a.index || 0) - (b.index || 0));
}
function usable(pg, strict) {
  const ii = pg && pg.imageinfo && pg.imageinfo[0];
  if (!ii) return null;
  const lic = strip(ii.extmetadata && ii.extmetadata.LicenseShortName && ii.extmetadata.LicenseShortName.value);
  if (!OK_LICENSE.test(lic)) return null;
  if (strict) {
    if (EXCLUDE.test(pg.title)) return null;
    if (!/jpe?g|png|webp/i.test(ii.mime || "")) return null;
    if ((ii.width || 0) < 800) return null;
    const ar = ii.width / ii.height; if (ar < 0.6 || ar > 2.1) return null;
  }
  return { title: pg.title, url: ii.thumburl || ii.url, source: ii.descriptionurl, license: lic, artist: strip(ii.extmetadata.Artist && ii.extmetadata.Artist.value) || strip(ii.extmetadata.Credit && ii.extmetadata.Credit.value) || "Wikimedia Commons" };
}
async function find(id, picks) {
  if (picks[id]) {
    const pages = await api({ titles: picks[id] });
    const u = usable(pages[0], false);
    if (u) return u;
    console.warn(`  ${id}: pinned file "${picks[id]}" isn't public domain or CC0, or wasn't found; searching instead.`);
  }
  for (const lic of LICENSE_FILTERS) {
    for (const q of QUERIES[id] || []) {
      const pages = await api({ generator: "search", gsrnamespace: "6", gsrlimit: "25", gsrsearch: `${q} ${lic} filetype:bitmap` });
      for (const pg of pages) { const u = usable(pg, true); if (u) return u; }
      await sleep(250);
    }
  }
  return null;
}
async function exists(url) { try { await access(url); return true; } catch { return false; } }

async function main() {
  await mkdir(DIR, { recursive: true });
  const credUrl = new URL("credits.json", DIR);
  const credits = JSON.parse(await readFile(credUrl, "utf8").catch(() => "{}"));
  const picks = JSON.parse(await readFile(new URL("./image-picks.json", import.meta.url), "utf8").catch(() => "{}"));
  const list = [...SPECIES, ...WHOLESALE].filter(s => !ONLY || ONLY.includes(s.id));
  let got = 0, skipped = 0, missed = [];
  for (const s of list) {
    const file = new URL(s.photo, DIR);
    if (!FORCE && await exists(file)) { console.log(`  ${s.id}: have ${s.photo}, skipping`); skipped++; continue; }
    try {
      const hit = await find(s.id, picks);
      if (!hit) { console.warn(`  ${s.id}: no public-domain photo found`); missed.push(s.name); continue; }
      const r = await fetch(hit.url, { headers: { "user-agent": UA } });
      if (!r.ok) throw new Error(`download answered ${r.status}`);
      await writeFile(file, Buffer.from(await r.arrayBuffer()));
      credits[s.photo] = { artist: hit.artist.slice(0, 120), license: hit.license, source: hit.source, title: hit.title };
      console.log(`  ${s.id}: ${hit.title}  [${hit.license}]`);
      got++;
    } catch (e) { console.warn(`  ${s.id}: ${e.message}`); missed.push(s.name); }
    await sleep(400);
  }
  await writeFile(credUrl, JSON.stringify(credits, null, 2) + "\n");
  console.log(`\nDownloaded ${got}, kept ${skipped}${missed.length ? `, missing: ${missed.join(", ")}` : ""}.`);
  console.log("Check each photo on the site before deploying. Species without a photo show a drawn silhouette instead.");
}
main().catch(e => { console.error(e); process.exit(1); });
