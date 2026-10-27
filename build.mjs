// Fills FAQ markup and JSON-LD into public/index.html from public/assets/data.js.
// Run: node build/build.mjs   (only needed after editing FAQ, species or prices)
import { readFile, writeFile, access } from "node:fs/promises";
import { SITE, SPECIES, PRICE, FAQ } from "../public/assets/data.js";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tpl = await readFile(new URL("./index.template.html", import.meta.url), "utf8");
// Only list a photo in Google's structured data when the file is actually in public/assets/trees/,
// so search tools don't report broken image links for species still showing a silhouette.
const hasPhoto = {};
for (const s of SPECIES) hasPhoto[s.id] = !!s.photo && await access(new URL("../public/assets/trees/" + s.photo, import.meta.url)).then(() => true, () => false);
const faqHtml = FAQ.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n      ");
const business = {
  "@context": "https://schema.org",
  "@type": "GardenStore",
  "@id": SITE.url + "/#business",
  name: SITE.name,
  url: SITE.url + "/",
  logo: SITE.url + "/icon-512.png",
  image: SITE.url + "/og-image.png",
  description: "Zone 3 and colder potted trees and conservation seedlings grown in the Turtle Mountains of North Dakota.",
  telephone: SITE.phoneE164,
  email: SITE.email,
  founder: { "@type": "Person", name: SITE.owner },
  foundingDate: "2024",
  address: { "@type": "PostalAddress", addressRegion: "ND", addressCountry: "US", addressLocality: "Bottineau" },
  areaServed: [{ "@type": "AdministrativeArea", name: "Bottineau County, North Dakota" }, { "@type": "State", name: "North Dakota" }],
  sameAs: [SITE.instagram],
  priceRange: "$20",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "2027 potted trees",
    itemListElement: SPECIES.map(s => ({
      "@type": "Offer", price: String(PRICE), priceCurrency: "USD", availability: "https://schema.org/PreOrder",
      itemOffered: Object.assign({ "@type": "Product", name: s.name, description: s.blurb }, hasPhoto[s.id] ? { image: SITE.url + "/assets/trees/" + s.photo } : {})
    }))
  }
};
const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
const ld = `<script type="application/ld+json">${JSON.stringify(business)}</script>\n<script type="application/ld+json">${JSON.stringify(faq)}</script>`;
// The copyright year is stamped at build time, so every deploy keeps it current without any page script.
const year = String(new Date().getFullYear());
// The photo-credit line only appears once photos are actually in public/assets/trees/.
const photos = Object.values(hasPhoto).filter(Boolean).length;
const credit = photos ? " · photos credited on each image" : "";
const out = tpl.replace("<!--FAQ-->", faqHtml).replace("<!--JSONLD-->", ld).replace("<!--YEAR-->", year).replace("<!--PHOTOCREDIT-->", credit);
await writeFile(new URL("../public/index.html", import.meta.url), out);
console.log("public/index.html written:", out.length, "bytes ·", `© 2024–${year} ·`, `${photos} of ${SPECIES.length} species photos found`);
