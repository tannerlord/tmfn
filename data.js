// Turtle Mountain Forest Nursery: shared catalog data.
// Used by the public site, the owner dashboard, the printable order form AND the Cloudflare Worker,
// so prices and species only need to change here.

export const PRICE = 20;
export const SEASON = 2027;

export const SITE = {
  name: "Turtle Mountain Forest Nursery",
  short: "Turtle Mountain",
  domain: "turtlemountainforestnursery.com",
  url: "https://turtlemountainforestnursery.com",
  email: "TannerGilbertLord@gmail.com",
  phone: "(701) 263-1669",
  phoneE164: "+17012631669",
  instagram: "https://www.instagram.com/TMForestNursery/",
  instagramHandle: "@TMForestNursery",
  owner: "Tanner Lord",
  area: "Bottineau County, North Dakota",
  geo: { lat: 48.827, lon: -100.445 }
};

// group: evergreen | shade | fruit
// grown: trees ordered for the 2027 crop (see TOWNER-ORDER-2027.md); caps a single reservation
// photo: file in /assets/trees/  (run `npm run images` to download public-domain photos)
export const SPECIES = [
  { id: "bhs", name: "Black Hills Spruce", sci: "Picea glauca var. densata", group: "evergreen", zone: "Z3", mature: [40, 40], h20: [10, 20],
    use: "Windbreak · specimen", form: "spruce", fill: "--needle-2", ever: true, native: false, grown: 100, photo: "black-hills-spruce.jpg",
    blurb: "Dense, dark-green conical evergreen. The classic farmstead windbreak and yard specimen, with strong winter resistance.",
    goals: { windbreak: 2, privacy: 2, shade: .5, wildlife: 1, edible: 0, color: 0, fast: .5 }, soil: { loam: 2, sand: .5, clay: 1, wet: .5, salt: 0, knob: .5 } },
  { id: "cbs", name: "Colorado Blue Spruce", sci: "Picea pungens", group: "evergreen", zone: "Z2", mature: [60, 60], h20: [10, 20],
    use: "Specimen · windbreak", form: "spruce", fill: "--spruce-blue", ever: true, native: false, grown: 100, photo: "blue-spruce.jpg",
    blurb: "Silver-blue needles and a strong pyramidal form. Drought-tolerant once established; a landscape favorite.",
    goals: { windbreak: 1.5, privacy: 2, shade: .5, wildlife: 1, edible: 0, color: 1, fast: .5 }, soil: { loam: 2, sand: 1, clay: 1, wet: .5, salt: 0, knob: .5 } },
  { id: "pine", name: "Ponderosa Pine", sci: "Pinus ponderosa", group: "evergreen", zone: "Z3", mature: [55, 55], h20: [11, 22],
    use: "Windbreak", form: "pine", fill: "--needle", ever: true, native: true, grown: 50, photo: "ponderosa-pine.jpg",
    blurb: "Long-needled and drought-tolerant, thriving on sandy or thin soils. A tall, durable windbreak pine.",
    goals: { windbreak: 2, privacy: 1.5, shade: .5, wildlife: 1, edible: 0, color: 0, fast: 1 }, soil: { loam: 1.5, sand: 2, clay: .5, wet: 0, salt: 0, knob: 1.5 } },
  { id: "rmj", name: "Rocky Mountain Juniper", sci: "Juniperus scopulorum", group: "evergreen", zone: "Z3", mature: [15, 30], h20: [6, 15],
    use: "Windbreak · screen", form: "juniper", fill: "--silver", ever: true, native: true, grown: 50, photo: "rocky-mountain-juniper.jpg",
    blurb: "Silver-green, drought-hardy, and tough on marginal ground. A dependable windbreak conifer.",
    goals: { windbreak: 2, privacy: 1.5, shade: 0, wildlife: 1.5, edible: 0, color: .5, fast: .5 }, soil: { loam: 1.5, sand: 2, clay: 1.5, wet: 0, salt: 1, knob: 2 } },
  { id: "erc", name: "Eastern Red Cedar", sci: "Juniperus virginiana", group: "evergreen", zone: "Z3", mature: [25, 25], h20: [6, 15],
    use: "Wildlife · windbreak", form: "juniper", fill: "--juniper", ever: true, native: false, grown: 50, photo: "eastern-red-cedar.jpg",
    blurb: "Dense evergreen valued as one of the best conifers for wildlife cover, with a rusty winter color.",
    goals: { windbreak: 2, privacy: 2, shade: 0, wildlife: 2, edible: 0, color: .5, fast: .5 }, soil: { loam: 1.5, sand: 2, clay: 1.5, wet: .5, salt: 1, knob: 2 } },

  { id: "oak", name: "Bur Oak", sci: "Quercus macrocarpa", group: "shade", zone: "Z3", mature: [50, 70], h20: [14, 25],
    use: "Shade · wildlife", form: "oak", fill: "--leaf", ever: false, native: true, grown: 50, photo: "bur-oak.jpg",
    blurb: "A long-lived native shade tree with thick, corky bark and acorns that feed a wide range of wildlife.",
    goals: { windbreak: 1, privacy: .5, shade: 2, wildlife: 2, edible: 0, color: .5, fast: 0 }, soil: { loam: 2, sand: 1, clay: 2, wet: 1, salt: .5, knob: 1 } },
  { id: "aspen", name: "Quaking Aspen", sci: "Populus tremuloides", group: "shade", zone: "Z2", mature: [40, 50], h20: [22, 32],
    use: "Screening · fall color", form: "aspen", fill: "--gold", ever: false, native: true, grown: 50, photo: "quaking-aspen.jpg",
    blurb: "Fast-growing native of the Turtle Mountains with shimmering leaves and brilliant gold fall color.",
    goals: { windbreak: 1, privacy: 1.5, shade: 1, wildlife: 1, edible: 0, color: 2, fast: 2 }, soil: { loam: 1.5, sand: .5, clay: 1, wet: 2, salt: 0, knob: 0 } },
  { id: "larch", name: "Siberian Larch", sci: "Larix sibirica", group: "shade", zone: "Z2", mature: [40, 60], h20: [13, 20],
    use: "Specimen · windbreak", form: "spruce", fill: "--larch", ever: false, native: false, grown: 50, photo: "siberian-larch.jpg",
    blurb: "A conifer that drops its needles: soft green all summer, gold in fall, open and airy in winter. Hardy far past anything a Bottineau winter can throw at it.",
    goals: { windbreak: 1.5, privacy: 1, shade: 1, wildlife: 1, edible: 0, color: 2, fast: 1.5 }, soil: { loam: 2, sand: .5, clay: 1, wet: 1, salt: 0, knob: .5 } },

  { id: "june", name: "Juneberry", alt: "Saskatoon", sci: "Amelanchier alnifolia", group: "fruit", zone: "Z2", mature: [8, 15], h20: [5, 8],
    use: "Edible · wildlife", form: "shrub", fill: "--leaf-2", bloom: "--bloom", ever: false, native: true, grown: 100, photo: "juneberry.jpg",
    blurb: "A multi-stemmed native with white spring blooms, sweet edible berries, and orange-red fall color.",
    goals: { windbreak: .5, privacy: .5, shade: 0, wildlife: 2, edible: 2, color: 1.5, fast: .5 }, soil: { loam: 2, sand: 1, clay: 1, wet: .5, salt: 0, knob: 1 } },
  { id: "choke", name: "Schubert Chokecherry", sci: "Prunus virginiana 'Schubert'", group: "fruit", zone: "Z2", mature: [20, 25], h20: [7, 14],
    use: "Color · fruit · windbreak", form: "oak", fill: "--plum-leaf", ever: false, native: true, grown: 50, photo: "schubert-chokecherry.jpg",
    blurb: "Leaves open green and turn deep purple by midsummer. White spring flowers, dark cherries for jelly, and a favorite of birds.",
    goals: { windbreak: 1.5, privacy: 1, shade: .5, wildlife: 2, edible: 1.5, color: 2, fast: 1 }, soil: { loam: 2, sand: 1.5, clay: 1.5, wet: 1, salt: .5, knob: 1.5 } },
  { id: "plum", name: "American Plum", sci: "Prunus americana", group: "fruit", zone: "Z3", mature: [15, 20], h20: [4, 10],
    use: "Fruit · wildlife thicket", form: "oak", fill: "--leaf-2", bloom: "--bloom", ever: false, native: true, grown: 50, photo: "american-plum.jpg",
    blurb: "Native thicket-former with fragrant white blossoms before the leaves and tart red-yellow plums for jam. Plant several for fruit.",
    goals: { windbreak: 1, privacy: 1.5, shade: 0, wildlife: 2, edible: 2, color: 1, fast: 1 }, soil: { loam: 2, sand: 1.5, clay: 1, wet: .5, salt: 0, knob: 1 } },
  { id: "lilac", name: "Common Lilac", sci: "Syringa vulgaris", group: "fruit", zone: "Z3", mature: [10, 16], h20: [5, 12],
    use: "Fragrant hedge · windbreak", form: "shrub", fill: "--leaf", bloom: "--lilac", ever: false, native: false, grown: 50, photo: "common-lilac.jpg",
    blurb: "The farmstead classic: fragrant purple blooms in late spring and a dense hedge that blocks wind and views.",
    goals: { windbreak: 1.5, privacy: 2, shade: 0, wildlife: .5, edible: 0, color: 2, fast: 1 }, soil: { loam: 2, sand: 1, clay: 1.5, wet: .5, salt: .5, knob: 1 } },
  { id: "buffalo", name: "Silver Buffaloberry", sci: "Shepherdia argentea", group: "fruit", zone: "Z2", mature: [10, 18], h20: [4, 13],
    use: "Wildlife · salty ground", form: "shrub", fill: "--silver-leaf", bloom: "--berry", ever: false, native: true, grown: 50, photo: "silver-buffaloberry.jpg",
    blurb: "Silver-leaved native with bright red berries that hang on into winter. Plants are male or female, so plant several for fruit. One of the few shrubs that does well on salty ground.",
    goals: { windbreak: 1.5, privacy: 1.5, shade: 0, wildlife: 2, edible: 1, color: 1, fast: 1 }, soil: { loam: 2, sand: 1.5, clay: 1.5, wet: 1, salt: 2, knob: 1.5 } }
];

export const GROUPS = [
  { id: "evergreen", name: "Evergreens", note: "Windbreaks, screens and winter color" },
  { id: "shade", name: "Shade & specimen", note: "Big trees for the yard and shelterbelt" },
  { id: "fruit", name: "Fruit & flowering", note: "Berries, blossoms and wildlife food" }
];

export const WHOLESALE = [
  { id: "poplar", name: "Hybrid Poplar", sci: "Populus hybrids", h20: [40, 50], form: "aspen", fill: "--leaf", photo: "hybrid-poplar.jpg",
    use: "Fastest height in the lineup. Needs moisture: swales, bottoms, drained edges." },
  { id: "willow", name: "Golden Willow", sci: "Salix alba 'Vitellina'", h20: [20, 40], form: "aspen", fill: "--willow", photo: "golden-willow.jpg",
    use: "Wet ground and riparian buffers; bright gold winter twigs." },
  { id: "dogwood", name: "Redosier Dogwood", sci: "Cornus sericea", h20: [4, 8], form: "shrub", fill: "--dogwood", native: true, photo: "redosier-dogwood.jpg",
    use: "Native shrub for streambanks and wet edges; red winter stems." },
  { id: "caragana", name: "Siberian Peashrub", sci: "Caragana arborescens", h20: [4, 11], form: "shrub", fill: "--leaf-2", photo: "siberian-peashrub.jpg",
    use: "The hardy outer row of a farmstead windbreak; handles dry ground." },
  { id: "nanking", name: "Nanking Cherry", sci: "Prunus tomentosa", h20: [3, 8], form: "shrub", fill: "--leaf-2", photo: "nanking-cherry.jpg",
    use: "Edible cherries and spring bloom. NRCS notes vigor drops within about 10 years; cutting back renews it." },
  { id: "elder", name: "American Elderberry", sci: "Sambucus canadensis", h20: null, form: "shrub", fill: "--leaf", photo: "american-elderberry.jpg",
    use: "Berries for wildlife and preserves. Not rated in the NRCS height tables." }
];

export const ZONES = [
  { id: "souris", name: "Souris River bottoms", short: "River bottoms", x: [0, 150], lx: 78,
    land: "Flood plain along the Souris River, which loops north through the county on its way back into Canada.",
    soils: "Flood-plain loams with spring overflow and a high water table. NRCS files flood-plain soils like Lamoure and Fossum in its wet, limy groups.",
    groups: ["1K", "2K"], limits: ["Spring flooding and late, wet planting", "Lime raises soil pH on some sites", "Grass and weed competition"],
    picks: ["buffalo", "aspen", "choke"], wpicks: ["poplar", "willow", "dogwood"], avoid: ["Spruce", "Pines", "Junipers"],
    tip: "Build a riparian buffer: dogwood and willow on the bank, buffaloberry and aspen one step back from the water." },
  { id: "sand", name: "Sandy lake plain", short: "Sandy plain", x: [150, 330],
    land: "Beach ridges and deltas left by Glacial Lake Souris, which once covered much of the county.",
    soils: "Deep, sandy, fast-draining soils that run short of water later in the season. NRCS puts sandy loams in group 5 and deep sands in group 7.",
    groups: ["5", "7"], limits: ["Drought and low water-holding capacity", "Blowing sand abrades young trees", "Watering during establishment may be essential"],
    picks: ["pine", "rmj", "erc", "plum", "choke"], wpicks: ["caragana"], avoid: ["Spruce without irrigation", "Quaking aspen", "Willows"],
    tip: "On blowing sand, NRCS calls for specialized site prep and leaving the sod between rows undisturbed. Water the first summers." },
  { id: "clay", name: "Clay lake flats", short: "Clay flats", x: [330, 480],
    land: "Flat, low ground where the old lake stood longest and fine clay settled out.",
    soils: "Clayey soils such as Rolla, which NRCS maps on the collapsed lake plains near the Turtle Mountains. Slow to drain and slow to warm in spring.",
    groups: ["4C"], limits: ["High clay and slow permeability", "Water swings: soggy spring, tight summer", "Erosion where flats meet slopes"],
    picks: ["oak", "lilac", "buffalo", "erc", "rmj"], wpicks: ["caragana"], avoid: ["Willow, poplar and aspen without an on-site moisture check"],
    tip: "NRCS allows willows, poplars and aspen on group 4 and 4C soils only after an on-site evaluation confirms enough moisture." },
  { id: "till", name: "Till plain farmland", short: "Till plain", x: [480, 660],
    land: "Rolling drift prairie: cropland and farmsteads on loamy glacial till.",
    soils: "Deep, well-drained loams with high water-holding capacity (NRCS group 3), plus moist swales where soils like Svea and Gardena collect runoff (group 1).",
    groups: ["1", "3"], limits: ["Grass and weed competition is the main threat", "Water erosion on sloping fields"],
    picks: ["bhs", "cbs", "oak", "pine", "larch", "june", "choke", "lilac"], wpicks: ["caragana", "poplar", "nanking"], avoid: ["Willow on dry knolls"],
    tip: "The best all-round tree ground in the county. Keep weeds controlled until the canopy closes and nearly the whole lineup performs." },
  { id: "seep", name: "Mountain-foot seep belt", short: "Seep belt", x: [660, 790], lx: 698,
    land: "The narrow strip along the south foot of Turtle Mountain, from Bottineau east toward Belcourt, where groundwater from the hills surfaces.",
    soils: "Silty loams on old lake deposits, somewhat poorly drained, with salts wicking to the surface and a water table near 2 ft at times. Bottineau's Highway 5 quicksand sits in this belt.",
    groups: ["9W"], limits: ["Salinity: over half of ND's tree species do poorly even on slightly saline soil", "Seasonal high water table", "A planting may survive yet never become an effective windbreak"],
    picks: ["buffalo", "rmj", "erc"], wpicks: ["caragana"], avoid: ["Spruce", "Bur oak", "Quaking aspen", "Juneberry"],
    tip: "NRCS names buffaloberry as one of the few species that survive or do well on moderately saline soil. Move other plantings to higher ground when you can." },
  { id: "upland", name: "Turtle Mountain uplands", short: "Uplands", x: [790, 1000],
    land: "Hilly, forested moraine 600 to 800 ft above the plain, on the edge of the aspen parkland.",
    soils: "Bottineau loam: very deep, well-drained loamy till on slopes up to 25%, mostly in woodland and wildlife habitat. Higher knobs carry Buse soils with lime near the surface (NRCS group 8K).",
    groups: ["3", "8K", "10"], limits: ["Slopes over 15% fall into group 10: hand plant and mulch", "Lime on knobs narrows the species list", "Machine planting is limited on hills"],
    picks: ["oak", "aspen", "june", "choke", "plum", "bhs"], knob: ["rmj", "erc"], wpicks: [], avoid: ["Machine planting on steep slopes"],
    tip: "Plant the native mix the hills already grow: bur oak, aspen, juneberry, chokecherry and plum. Put the junipers on the limy knobs." },
  { id: "wet", name: "Potholes, fens and lakeshore", short: "Potholes & lakes", x: [1000, 1200], lx: 1060,
    land: "Lake Metigoshe and the numerous small lakes, potholes and peat bogs scattered across the hills.",
    soils: "Tonka and Parnell soils in potholes are ponded part of the season; Eramosh soils fill the fens. NRCS groups these as 2 and 2H, and undrained wet ground as group 10.",
    groups: ["2", "2H", "10"], limits: ["Standing water in spring", "Planting delayed by wet conditions", "Undrained wet soils aren't recommended for windbreaks"],
    picks: ["aspen"], wpicks: ["willow", "dogwood", "poplar"], avoid: ["Conifers", "Bur oak", "Juneberry"],
    tip: "Work the rim, not the bottom: willow and dogwood at the wet edge, aspen and poplar on drained ground just above." }
];

export const ROAD = [
  { y: 2024, s: "done", t: "Founded by Tanner Lord in Bottineau County. First experimentation year: wholesale seedling procedures and limited retail production." },
  { y: 2025, s: "done", t: "Second experimentation year, refining wholesale seedling procedures with limited retail production." },
  { y: 2026, s: "now", t: "Closed for the season for major production updates, shifting focus toward retail trees and landscaping." },
  { y: 2027, s: "", t: "First retail crop: 13 cold-hardy species in trade-gallon pots at $20 per tree." },
  { y: 2028, s: "", t: "Wholesale seedling production begins: bareroot and cutting-grown stock for districts and farmers." },
  { y: 2029, s: "", t: "First wholesale seedling crop ready for pickup: fast, easy-to-establish conservation species." }
];

export const PICKUP = ["As soon as ready", "Summer 2027", "Fall 2027", "Flexible"];
export const HEARD = ["Facebook", "Instagram", "Google search", "Friend or neighbor", "Event or market", "Other"];

export const FAQ = [
  { q: "Do I pay when I reserve?", a: "No. A reservation holds your trees. Tanner confirms your total and how you'd like to pay before pickup." },
  { q: "When can I pick up?", a: "The 2027 crop is potted in spring 2027. Tanner contacts you when your trees are ready, and pickup is at the nursery in Bottineau County." },
  { q: "How big are the trees?", a: "Every tree comes in a trade-gallon pot. Size varies by species: the spruce and pine start larger, while aspen, juneberry and chokecherry put on fast growth in their first summer. Ask for current sizes before pickup." },
  { q: "Will they survive a Bottineau winter?", a: "Every species is rated zone 3 or colder. Bottineau sits in USDA zone 3b, where the average coldest night of the year falls between −35 and −30°F." },
  { q: "Do you deliver or plant?", a: "Pickup only for now. For planting or landscaping help, contact Tanner directly." },
  { q: "When should I plant?", a: "Spring and early fall are easiest. North Dakota tree planting usually runs from early May into early June, once the soil reaches about 45°F. Potted trees can go in later as long as you water through dry spells." },
  { q: "Can I order conservation seedlings in bulk?", a: "Yes, starting Spring 2029: bareroot and cutting-grown seedlings, minimum 25 per species, pickup only. Note your interest on this page and Tanner follows up with pricing." }
];

export const ALL = Object.fromEntries([
  ...SPECIES.map(s => [s.id, Object.assign(s, { retail: true })]),
  ...WHOLESALE.map(s => [s.id, Object.assign(s, { retail: false })])
]);
