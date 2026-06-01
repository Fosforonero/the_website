/**
 * Solar asset manifest — confidence levels and fallback materials.
 *
 * Current: All entries use procedural or symbolic confidence levels;
 * no real textures are integrated. plannedTextureUrl marks Sprint 05 targets.
 *
 * Sources: NASA Images and Media Guidelines, USGS Astrogeology, NASA Visible Earth.
 * Processing required: GeoTIFF/mosaic → equirectangular WebP 1K/2K/4K tiers.
 */

import type { SolarBodyCategory } from "./bodies";

export type SolarAssetConfidence =
  | "real-map"
  | "real-mesh"
  | "procedural"
  | "symbolic";

export type SolarAsset = {
  id: string;
  bodyId: string;
  confidence: SolarAssetConfidence;
  fallbackMaterial: "star" | "rocky" | "gas-giant" | "icy" | "comet";
  sourceUrl: string;
  credit: string;
  retrievedAt: string;
  licenseNote: string;
  /**
   * Sprint 05+: URL path served from /public, e.g. /lab/solar-system/textures/earth-2k.webp.
   * Only set when the file physically exists on disk.
   * confidence stays "procedural" until Task 2 verifies render output ("real-map").
   */
  localPath?: string;
  /**
   * Sprint 05 target: URL of specific NASA/USGS texture product to download
   * and process into a web-ready equirectangular WebP.
   * NOT integrated yet — confidence remains "procedural" until file exists.
   */
  plannedTextureUrl?: string;
};

// ---------------------------------------------------------------------------
// Fallback material mapping
// ---------------------------------------------------------------------------

export const FALLBACK_MATERIALS: Record<
  SolarBodyCategory,
  SolarAsset["fallbackMaterial"]
> = {
  star: "star",
  planet: "rocky",
  "dwarf-planet": "rocky",
  moon: "rocky",
  asteroid: "rocky",
  comet: "comet",
  tno: "icy",
  centaur: "icy",
  spacecraft: "rocky",
};

// ---------------------------------------------------------------------------
// Asset manifest (Sprint 01 — procedural placeholders)
// ---------------------------------------------------------------------------

export const SOLAR_ASSETS: SolarAsset[] = [
  {
    id: "asset-sun",
    bodyId: "sun",
    confidence: "procedural",
    fallbackMaterial: "star",
    sourceUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    credit: "NASA SDO / AIA",
    retrievedAt: "2026-05-29",
    licenseNote: "NASA media may be used for educational purposes; verify attribution requirements at source URL.",
    plannedTextureUrl: "https://svs.gsfc.nasa.gov/cgi-bin/details.cgi?aid=4768",
  },
  {
    id: "asset-mercury",
    bodyId: "mercury",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004869/",
    credit: "NASA GSFC SVS / MESSENGER MDIS mosaic (via threex.planets)",
    retrievedAt: "2026-06-01",
    licenseNote: "NASA imagery is public domain for educational use; original data from NASA MESSENGER mission.",
    localPath: "/lab/solar-system/textures/mercury-2k.webp",
    plannedTextureUrl: "https://astrogeology.usgs.gov/search/map/Mercury/Messenger/MDIS/Mercury_Messenger_MDIS_Basemap_BDR_Mosaic_Global_166m",
  },
  {
    id: "asset-venus",
    bodyId: "venus",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-earth",
    bodyId: "earth",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74117/world.200408.3x5400x2700.jpg",
    credit: "NASA Visible Earth / Blue Marble Next Generation",
    retrievedAt: "2026-06-01",
    licenseNote: "NASA imagery is public domain for educational use; verify attribution requirements at visibleearth.nasa.gov.",
    localPath: "/lab/solar-system/textures/earth-2k.webp",
    plannedTextureUrl: "https://visibleearth.nasa.gov/view.php?id=74117",
  },
  {
    id: "asset-moon",
    bodyId: "moon",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg",
    credit: "NASA GSFC SVS / LRO LROC WAC mosaic",
    retrievedAt: "2026-06-01",
    licenseNote: "NASA imagery is public domain for educational use; verify attribution requirements at svs.gsfc.nasa.gov.",
    localPath: "/lab/solar-system/textures/moon-2k.webp",
    plannedTextureUrl: "https://astrogeology.usgs.gov/search/map/Moon/LRO/LROC_WAC/Lunar_LRO_LROC-WAC_Mosaic_global_100m_June2013",
  },
  {
    id: "asset-mars",
    bodyId: "mars",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg",
    credit: "NASA / USGS Viking Orbiter — Mars surface mosaic (via threex.planets)",
    retrievedAt: "2026-06-01",
    licenseNote: "NASA imagery is public domain for educational use; original data from NASA Viking Orbiter.",
    localPath: "/lab/solar-system/textures/mars-2k.webp",
    plannedTextureUrl: "https://astrogeology.usgs.gov/search/map/Mars/Viking/MDIM21/Mars_Viking_MDIM21_ClrMosaic_global_232m",
  },
  {
    id: "asset-jupiter",
    bodyId: "jupiter",
    confidence: "procedural",
    fallbackMaterial: "gas-giant",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-saturn",
    bodyId: "saturn",
    confidence: "procedural",
    fallbackMaterial: "gas-giant",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-uranus",
    bodyId: "uranus",
    confidence: "procedural",
    fallbackMaterial: "gas-giant",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-neptune",
    bodyId: "neptune",
    confidence: "procedural",
    fallbackMaterial: "gas-giant",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-io",
    bodyId: "io",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-europa",
    bodyId: "europa",
    confidence: "procedural",
    fallbackMaterial: "icy",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-ganymede",
    bodyId: "ganymede",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-callisto",
    bodyId: "callisto",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-titan",
    bodyId: "titan",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-enceladus",
    bodyId: "enceladus",
    confidence: "procedural",
    fallbackMaterial: "icy",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-triton",
    bodyId: "triton",
    confidence: "procedural",
    fallbackMaterial: "icy",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-pluto",
    bodyId: "pluto",
    confidence: "procedural",
    fallbackMaterial: "icy",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA / New Horizons",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-charon",
    bodyId: "charon",
    confidence: "procedural",
    fallbackMaterial: "icy",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-ceres",
    bodyId: "ceres",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA / Dawn",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-vesta",
    bodyId: "vesta",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA / Dawn",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-halley",
    bodyId: "halley",
    confidence: "symbolic",
    fallbackMaterial: "comet",
    sourceUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    credit: "NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
  {
    id: "asset-67p",
    bodyId: "67p",
    confidence: "symbolic",
    fallbackMaterial: "comet",
    sourceUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    credit: "ESA / Rosetta",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
  {
    id: "asset-eris",
    bodyId: "eris",
    confidence: "symbolic",
    fallbackMaterial: "icy",
    sourceUrl: "https://ssd.jpl.nasa.gov/",
    credit: "NASA/JPL",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
  {
    id: "asset-haumea",
    bodyId: "haumea",
    confidence: "symbolic",
    fallbackMaterial: "icy",
    sourceUrl: "https://ssd.jpl.nasa.gov/",
    credit: "NASA/JPL",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
  {
    id: "asset-makemake",
    bodyId: "makemake",
    confidence: "symbolic",
    fallbackMaterial: "icy",
    sourceUrl: "https://ssd.jpl.nasa.gov/",
    credit: "NASA/JPL",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
  {
    id: "asset-sedna",
    bodyId: "sedna",
    confidence: "symbolic",
    fallbackMaterial: "icy",
    sourceUrl: "https://ssd.jpl.nasa.gov/",
    credit: "NASA/JPL",
    retrievedAt: "2026-05-29",
    licenseNote: "Symbolic placeholder only.",
  },
];
