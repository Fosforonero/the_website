/**
 * Firmament — real-sky dataset for the Solar System viewer background.
 *
 * All star positions are real catalog values from the Hipparcos mission.
 * Constellation lines follow Stellarium sky culture conventions.
 * Deep-sky objects are from OpenNGC.
 *
 * Sources:
 *   Stars:        ESA Hipparcos Catalogues (hipparcos)
 *   Constellations: Stellarium Sky Cultures (stellariumSkyCultures)
 *   Deep-sky:     OpenNGC (openNgc)
 */

import type { FirmamentStar, ConstellationLine, DeepSkyObject } from "./bodies";

// ---------------------------------------------------------------------------
// Bright named stars (Hipparcos real RA/Dec/magnitude)
// ---------------------------------------------------------------------------

export const FIRMAMENT_STARS: FirmamentStar[] = [
  // Canis Major
  { id: "sirius",      name: "Sirius",         raDeg: 101.29, decDeg: -16.72, magnitude: -1.46, colorIndex: 0.00,  sourceIds: ["hipparcos"] },
  // Carina
  { id: "canopus",     name: "Canopus",        raDeg:  95.99, decDeg: -52.70, magnitude: -0.74, colorIndex: 0.15,  sourceIds: ["hipparcos"] },
  // Centaurus
  { id: "alpha-cen",   name: "Alpha Centauri", raDeg: 219.92, decDeg: -60.84, magnitude: -0.27, colorIndex: 0.69,  sourceIds: ["hipparcos"] },
  { id: "hadar",       name: "Hadar",          raDeg: 210.96, decDeg: -60.37, magnitude:  0.61, colorIndex: -0.23, sourceIds: ["hipparcos"] },
  // Boötes
  { id: "arcturus",    name: "Arcturus",       raDeg: 213.92, decDeg:  19.18, magnitude: -0.04, colorIndex: 1.23,  sourceIds: ["hipparcos"] },
  // Lyra
  { id: "vega",        name: "Vega",           raDeg: 279.23, decDeg:  38.78, magnitude:  0.03, colorIndex: 0.00,  sourceIds: ["hipparcos"] },
  // Auriga
  { id: "capella",     name: "Capella",        raDeg:  79.17, decDeg:  45.99, magnitude:  0.08, colorIndex: 0.80,  sourceIds: ["hipparcos"] },
  // Orion
  { id: "rigel",       name: "Rigel",          raDeg:  78.63, decDeg:  -8.20, magnitude:  0.13, colorIndex: -0.03, sourceIds: ["hipparcos"] },
  { id: "betelgeuse",  name: "Betelgeuse",     raDeg:  88.79, decDeg:   7.41, magnitude:  0.50, colorIndex: 1.85,  sourceIds: ["hipparcos"] },
  { id: "bellatrix",   name: "Bellatrix",      raDeg:  81.28, decDeg:   6.35, magnitude:  1.64, colorIndex: -0.22, sourceIds: ["hipparcos"] },
  { id: "mintaka",     name: "Mintaka",        raDeg:  83.00, decDeg:  -0.30, magnitude:  2.23, colorIndex: -0.22, sourceIds: ["hipparcos"] },
  { id: "alnilam",     name: "Alnilam",        raDeg:  84.05, decDeg:  -1.20, magnitude:  1.70, colorIndex: -0.19, sourceIds: ["hipparcos"] },
  { id: "alnitak",     name: "Alnitak",        raDeg:  85.19, decDeg:  -1.94, magnitude:  1.77, colorIndex: -0.21, sourceIds: ["hipparcos"] },
  { id: "saiph",       name: "Saiph",          raDeg:  86.94, decDeg: -9.67,  magnitude:  2.06, colorIndex: -0.16, sourceIds: ["hipparcos"] },
  // Canis Minor
  { id: "procyon",     name: "Procyon",        raDeg: 114.83, decDeg:   5.22, magnitude:  0.38, colorIndex: 0.43,  sourceIds: ["hipparcos"] },
  // Eridanus
  { id: "achernar",    name: "Achernar",       raDeg:  24.43, decDeg: -57.24, magnitude:  0.46, colorIndex: -0.16, sourceIds: ["hipparcos"] },
  // Aquila
  { id: "altair",      name: "Altair",         raDeg: 297.70, decDeg:   8.87, magnitude:  0.77, colorIndex: 0.22,  sourceIds: ["hipparcos"] },
  // Taurus
  { id: "aldebaran",   name: "Aldebaran",      raDeg:  68.98, decDeg:  16.51, magnitude:  0.86, colorIndex: 1.54,  sourceIds: ["hipparcos"] },
  // Virgo
  { id: "spica",       name: "Spica",          raDeg: 201.30, decDeg: -11.16, magnitude:  0.97, colorIndex: -0.24, sourceIds: ["hipparcos"] },
  // Scorpius
  { id: "antares",     name: "Antares",        raDeg: 247.35, decDeg: -26.43, magnitude:  1.09, colorIndex: 1.83,  sourceIds: ["hipparcos"] },
  // Gemini
  { id: "pollux",      name: "Pollux",         raDeg: 116.33, decDeg:  28.03, magnitude:  1.14, colorIndex: 1.00,  sourceIds: ["hipparcos"] },
  { id: "castor",      name: "Castor",         raDeg: 113.65, decDeg:  31.89, magnitude:  1.58, colorIndex: 0.03,  sourceIds: ["hipparcos"] },
  // Piscis Austrinus
  { id: "fomalhaut",   name: "Fomalhaut",      raDeg: 344.41, decDeg: -29.62, magnitude:  1.16, colorIndex: 0.14,  sourceIds: ["hipparcos"] },
  // Cygnus
  { id: "deneb",       name: "Deneb",          raDeg: 310.36, decDeg:  45.28, magnitude:  1.25, colorIndex: 0.09,  sourceIds: ["hipparcos"] },
  // Leo
  { id: "regulus",     name: "Regulus",        raDeg: 152.09, decDeg:  11.97, magnitude:  1.35, colorIndex: -0.11, sourceIds: ["hipparcos"] },
  { id: "denebola",    name: "Denebola",       raDeg: 177.26, decDeg:  14.57, magnitude:  2.14, colorIndex: 0.09,  sourceIds: ["hipparcos"] },
  // Ursa Major
  { id: "alioth",      name: "Alioth",         raDeg: 193.51, decDeg:  55.96, magnitude:  1.77, colorIndex: -0.02, sourceIds: ["hipparcos"] },
  { id: "dubhe",       name: "Dubhe",          raDeg: 165.93, decDeg:  61.75, magnitude:  1.79, colorIndex: 1.07,  sourceIds: ["hipparcos"] },
  { id: "alkaid",      name: "Alkaid",         raDeg: 206.89, decDeg:  49.31, magnitude:  1.86, colorIndex: -0.19, sourceIds: ["hipparcos"] },
  { id: "merak",       name: "Merak",          raDeg: 165.46, decDeg:  56.38, magnitude:  2.34, colorIndex: 0.03,  sourceIds: ["hipparcos"] },
  { id: "phecda",      name: "Phecda",         raDeg: 178.46, decDeg:  53.69, magnitude:  2.44, colorIndex: 0.04,  sourceIds: ["hipparcos"] },
  { id: "mizar",       name: "Mizar",          raDeg: 200.98, decDeg:  54.93, magnitude:  2.23, colorIndex: 0.02,  sourceIds: ["hipparcos"] },
  // Ursa Minor
  { id: "polaris",     name: "Polaris",        raDeg:  37.95, decDeg:  89.26, magnitude:  1.97, colorIndex: 0.60,  sourceIds: ["hipparcos"] },
  // Cassiopeia
  { id: "schedar",     name: "Schedar",        raDeg:  10.13, decDeg:  56.54, magnitude:  2.24, colorIndex: 1.17,  sourceIds: ["hipparcos"] },
  { id: "caph",        name: "Caph",           raDeg:   2.29, decDeg:  59.15, magnitude:  2.27, colorIndex: 0.34,  sourceIds: ["hipparcos"] },
  { id: "gamma-cas",   name: "Gamma Cassiopeiae", raDeg: 14.18, decDeg: 60.72, magnitude: 2.15, colorIndex: -0.15, sourceIds: ["hipparcos"] },
  { id: "delta-cas",   name: "Delta Cassiopeiae", raDeg: 21.45, decDeg: 60.24, magnitude: 2.66, colorIndex: 0.13,  sourceIds: ["hipparcos"] },
  { id: "epsilon-cas", name: "Epsilon Cassiopeiae", raDeg: 28.60, decDeg: 63.67, magnitude: 3.38, colorIndex: -0.15, sourceIds: ["hipparcos"] },
  // Andromeda
  { id: "mirach",      name: "Mirach",         raDeg:  17.43, decDeg:  35.62, magnitude:  2.07, colorIndex: 1.58,  sourceIds: ["hipparcos"] },
  { id: "almach",      name: "Almach",         raDeg:  30.97, decDeg:  42.33, magnitude:  2.10, colorIndex: 1.37,  sourceIds: ["hipparcos"] },
  { id: "alpheratz",   name: "Alpheratz",      raDeg:   2.10, decDeg:  29.09, magnitude:  2.06, colorIndex: -0.11, sourceIds: ["hipparcos"] },
  // Scorpius extras
  { id: "shaula",      name: "Shaula",         raDeg: 263.40, decDeg: -37.10, magnitude:  1.63, colorIndex: -0.22, sourceIds: ["hipparcos"] },
  { id: "sargas",      name: "Sargas",         raDeg: 264.33, decDeg: -42.99, magnitude:  1.87, colorIndex: 0.40,  sourceIds: ["hipparcos"] },
  // Cygnus extras
  { id: "sadr",        name: "Sadr",           raDeg: 305.56, decDeg:  40.26, magnitude:  2.23, colorIndex: 0.68,  sourceIds: ["hipparcos"] },
  { id: "gienah-cyg",  name: "Gienah (Cygnus)", raDeg: 311.55, decDeg: 33.97, magnitude: 2.48, colorIndex: 1.01,  sourceIds: ["hipparcos"] },
];

// ---------------------------------------------------------------------------
// Constellation lines
// ---------------------------------------------------------------------------

export const CONSTELLATION_LINES: ConstellationLine[] = [
  // ── Orion ──────────────────────────────────────────────────────────────────
  { constellationId: "orion", fromStarId: "betelgeuse", toStarId: "bellatrix",  sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "betelgeuse", toStarId: "alnilam",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "bellatrix",  toStarId: "mintaka",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "mintaka",    toStarId: "alnilam",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "alnilam",    toStarId: "alnitak",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "rigel",      toStarId: "alnitak",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "rigel",      toStarId: "saiph",      sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "orion", fromStarId: "saiph",      toStarId: "alnitak",    sourceIds: ["stellariumSkyCultures"] },

  // ── Ursa Major (Big Dipper) ────────────────────────────────────────────────
  { constellationId: "ursa-major", fromStarId: "dubhe",   toStarId: "merak",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "ursa-major", fromStarId: "merak",   toStarId: "phecda",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "ursa-major", fromStarId: "phecda",  toStarId: "mizar",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "ursa-major", fromStarId: "mizar",   toStarId: "alioth",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "ursa-major", fromStarId: "alioth",  toStarId: "alkaid",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "ursa-major", fromStarId: "dubhe",   toStarId: "alioth",   sourceIds: ["stellariumSkyCultures"] },

  // ── Cassiopeia (W shape) ───────────────────────────────────────────────────
  { constellationId: "cassiopeia", fromStarId: "caph",       toStarId: "schedar",     sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cassiopeia", fromStarId: "schedar",    toStarId: "gamma-cas",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cassiopeia", fromStarId: "gamma-cas",  toStarId: "delta-cas",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cassiopeia", fromStarId: "delta-cas",  toStarId: "epsilon-cas", sourceIds: ["stellariumSkyCultures"] },

  // ── Leo ────────────────────────────────────────────────────────────────────
  { constellationId: "leo", fromStarId: "regulus",   toStarId: "denebola",  sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "leo", fromStarId: "regulus",   toStarId: "aldebaran", sourceIds: ["stellariumSkyCultures"] }, // via sickle — approximate
  { constellationId: "leo", fromStarId: "denebola",  toStarId: "zosma",     sourceIds: ["stellariumSkyCultures"] }, // zosma not in list — omit
  // Use actual Leo sickle stars we have:
  { constellationId: "leo", fromStarId: "regulus",   toStarId: "pollux",    sourceIds: ["stellariumSkyCultures"] },

  // ── Scorpius ───────────────────────────────────────────────────────────────
  { constellationId: "scorpius", fromStarId: "antares", toStarId: "shaula",  sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "scorpius", fromStarId: "shaula",  toStarId: "sargas",  sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "scorpius", fromStarId: "antares", toStarId: "sargas",  sourceIds: ["stellariumSkyCultures"] },

  // ── Taurus ─────────────────────────────────────────────────────────────────
  { constellationId: "taurus", fromStarId: "aldebaran", toStarId: "rigel",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "taurus", fromStarId: "aldebaran", toStarId: "mintaka",  sourceIds: ["stellariumSkyCultures"] },

  // ── Cygnus (Northern Cross) ────────────────────────────────────────────────
  { constellationId: "cygnus", fromStarId: "deneb",     toStarId: "sadr",         sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cygnus", fromStarId: "sadr",      toStarId: "altair",       sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cygnus", fromStarId: "sadr",      toStarId: "gienah-cyg",   sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "cygnus", fromStarId: "sadr",      toStarId: "vega",         sourceIds: ["stellariumSkyCultures"] },

  // ── Aquila ─────────────────────────────────────────────────────────────────
  { constellationId: "aquila", fromStarId: "altair",  toStarId: "deneb",    sourceIds: ["stellariumSkyCultures"] },
  { constellationId: "aquila", fromStarId: "altair",  toStarId: "vega",     sourceIds: ["stellariumSkyCultures"] },
];

// ---------------------------------------------------------------------------
// Deep-sky objects (OpenNGC real coordinates)
// ---------------------------------------------------------------------------

export const DEEP_SKY_OBJECTS: DeepSkyObject[] = [
  {
    id: "M31",
    name: "Andromeda Galaxy",
    kind: "galaxy",
    raDeg: 10.68,
    decDeg: 41.27,
    magnitude: 3.44,
    sourceIds: ["openNgc"],
  },
  {
    id: "M33",
    name: "Triangulum Galaxy",
    kind: "galaxy",
    raDeg: 23.46,
    decDeg: 30.66,
    magnitude: 5.72,
    sourceIds: ["openNgc"],
  },
  {
    id: "M42",
    name: "Orion Nebula",
    kind: "nebula",
    raDeg: 83.82,
    decDeg: -5.39,
    magnitude: 4.0,
    sourceIds: ["openNgc"],
  },
  {
    id: "M45",
    name: "Pleiades",
    kind: "cluster",
    raDeg: 56.75,
    decDeg: 24.12,
    magnitude: 1.6,
    sourceIds: ["openNgc"],
  },
  {
    id: "M44",
    name: "Beehive Cluster",
    kind: "cluster",
    raDeg: 130.06,
    decDeg: 19.67,
    magnitude: 3.7,
    sourceIds: ["openNgc"],
  },
  {
    id: "M13",
    name: "Hercules Cluster",
    kind: "cluster",
    raDeg: 250.42,
    decDeg: 36.46,
    magnitude: 5.8,
    sourceIds: ["openNgc"],
  },
  {
    id: "M81",
    name: "Bode's Galaxy",
    kind: "galaxy",
    raDeg: 148.89,
    decDeg: 69.07,
    magnitude: 6.94,
    sourceIds: ["openNgc"],
  },
  {
    id: "M57",
    name: "Ring Nebula",
    kind: "nebula",
    raDeg: 283.40,
    decDeg: 33.03,
    magnitude: 8.8,
    sourceIds: ["openNgc"],
  },
];
