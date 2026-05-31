/**
 * Solar asset manifest — confidence levels and fallback materials.
 *
 * Sprint 01: All entries use procedural or symbolic confidence levels;
 * no real textures are downloaded yet.
 *
 * Sources: NASA Images and Media Guidelines (nasaMedia), USGS Astrogeology (usgsAstrogeology).
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
    credit: "NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "NASA media may be used for educational purposes; verify attribution requirements at source URL.",
  },
  {
    id: "asset-mercury",
    bodyId: "mercury",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
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
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-moon",
    bodyId: "moon",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
  },
  {
    id: "asset-mars",
    bodyId: "mars",
    confidence: "procedural",
    fallbackMaterial: "rocky",
    sourceUrl: "https://astrogeology.usgs.gov/search",
    credit: "USGS Astrogeology / NASA",
    retrievedAt: "2026-05-29",
    licenseNote: "Placeholder; real texture requires download and processing from USGS source.",
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
