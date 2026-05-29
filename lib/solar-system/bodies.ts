/**
 * Solar System body catalog — curated physical and orbital data.
 *
 * Sources: NASA/JPL Horizons, JPL Small-Body Database, JPL Planetary Satellites.
 * Values are real approximations; exact ephemerides come from ephemeris.ts.
 */

export type SolarBodyCategory =
  | "star"
  | "planet"
  | "dwarf-planet"
  | "moon"
  | "asteroid"
  | "comet"
  | "tno";

export type ScaleDistanceMode = "compressed" | "real-log" | "inner-system";
export type ScaleRadiusMode = "visible" | "relative";

export type SolarBody = {
  id: string;
  name: { it: string; en: string };
  category: SolarBodyCategory;
  parentId: string | null;
  radiusKm: number;
  massKg?: number;
  semiMajorAxisKm?: number;
  orbitalPeriodDays?: number;
  eccentricity?: number;
  inclinationDeg?: number;
  color: string;
  sourceIds: string[];
  assetId?: string;
};

export type BodyState = {
  id: string;
  positionKm: [number, number, number];
  velocityKmS?: [number, number, number];
  epochIso: string;
  source: "mvp-orbital-elements" | "jpl-horizons";
};

export type FirmamentStar = {
  id: string;
  name?: string;
  raDeg: number;
  decDeg: number;
  magnitude: number;
  colorIndex?: number;
  sourceIds: string[];
};

export type ConstellationLine = {
  constellationId: string;
  fromStarId: string;
  toStarId: string;
  sourceIds: string[];
};

export type DeepSkyObject = {
  id: string;
  name: string;
  kind: "galaxy" | "nebula" | "cluster";
  raDeg: number;
  decDeg: number;
  magnitude?: number;
  sourceIds: string[];
};

// ---------------------------------------------------------------------------
// Source registry
// ---------------------------------------------------------------------------

export const SOLAR_SOURCES = {
  nasaJplHorizons: {
    label: "NASA/JPL Horizons",
    url: "https://ssd.jpl.nasa.gov/horizons/",
    usage: "Ephemerides and Solar System body vectors.",
  },
  horizonsApi: {
    label: "NASA/JPL Horizons API",
    url: "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    usage: "Future server-side vector queries.",
  },
  jplSbdb: {
    label: "JPL Small-Body Database",
    url: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
    usage: "Asteroid, comet and trans-Neptunian object metadata.",
  },
  jplSatellites: {
    label: "JPL Planetary Satellites",
    url: "https://ssd.jpl.nasa.gov/sats/",
    usage: "Natural satellite reference data.",
  },
  nasaMedia: {
    label: "NASA Images and Media Guidelines",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    usage: "NASA media reuse and attribution policy.",
  },
  usgsAstrogeology: {
    label: "USGS Astrogeology",
    url: "https://astrogeology.usgs.gov/search",
    usage: "Planetary map and mosaic source for later texture processing.",
  },
  esaGaia: {
    label: "ESA Gaia DR3",
    url: "https://www.cosmos.esa.int/web/gaia/dr3",
    usage: "Reference source for future high-density star catalog layers.",
  },
  hipparcos: {
    label: "ESA Hipparcos Catalogues",
    url: "https://www.cosmos.esa.int/web/hipparcos/catalogues",
    usage: "Compact bright-star source for browser-ready firmament rendering.",
  },
  stellariumSkyCultures: {
    label: "Stellarium Sky Cultures",
    url: "https://github.com/Stellarium/stellarium/tree/master/skycultures",
    usage: "Constellation line and sky-culture metadata reference.",
  },
  openNgc: {
    label: "OpenNGC",
    url: "https://github.com/mattiaverga/OpenNGC",
    usage: "Open catalog for galaxies, nebulae and star clusters.",
  },
} as const;

// ---------------------------------------------------------------------------
// Body catalog
// ---------------------------------------------------------------------------

export const SOLAR_BODIES: SolarBody[] = [
  // ── Star ──────────────────────────────────────────────────────────────────
  {
    id: "sun",
    name: { it: "Sole", en: "Sun" },
    category: "star",
    parentId: null,
    radiusKm: 696_340,
    massKg: 1.989e30,
    color: "#FDB813",
    sourceIds: ["nasaJplHorizons"],
  },

  // ── Planets ───────────────────────────────────────────────────────────────
  {
    id: "mercury",
    name: { it: "Mercurio", en: "Mercury" },
    category: "planet",
    parentId: "sun",
    radiusKm: 2_439.7,
    massKg: 3.301e23,
    semiMajorAxisKm: 57_909_050,
    orbitalPeriodDays: 87.969,
    eccentricity: 0.2056,
    inclinationDeg: 7.005,
    color: "#B5B5B5",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "venus",
    name: { it: "Venere", en: "Venus" },
    category: "planet",
    parentId: "sun",
    radiusKm: 6_051.8,
    massKg: 4.867e24,
    semiMajorAxisKm: 108_208_000,
    orbitalPeriodDays: 224.701,
    eccentricity: 0.0067,
    inclinationDeg: 3.394,
    color: "#E8C46A",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "earth",
    name: { it: "Terra", en: "Earth" },
    category: "planet",
    parentId: "sun",
    radiusKm: 6_371,
    massKg: 5.972e24,
    semiMajorAxisKm: 149_597_870.7,
    orbitalPeriodDays: 365.25,
    eccentricity: 0.0167,
    inclinationDeg: 0.0,
    color: "#3A9BDC",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "mars",
    name: { it: "Marte", en: "Mars" },
    category: "planet",
    parentId: "sun",
    radiusKm: 3_389.5,
    massKg: 6.39e23,
    semiMajorAxisKm: 227_939_200,
    orbitalPeriodDays: 686.971,
    eccentricity: 0.0934,
    inclinationDeg: 1.850,
    color: "#C1440E",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "jupiter",
    name: { it: "Giove", en: "Jupiter" },
    category: "planet",
    parentId: "sun",
    radiusKm: 69_911,
    massKg: 1.898e27,
    semiMajorAxisKm: 778_570_000,
    orbitalPeriodDays: 4_332.589,
    eccentricity: 0.0489,
    inclinationDeg: 1.303,
    color: "#C88B3A",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "saturn",
    name: { it: "Saturno", en: "Saturn" },
    category: "planet",
    parentId: "sun",
    radiusKm: 58_232,
    massKg: 5.683e26,
    semiMajorAxisKm: 1_432_041_000,
    orbitalPeriodDays: 10_759.22,
    eccentricity: 0.0565,
    inclinationDeg: 2.485,
    color: "#E4D191",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "uranus",
    name: { it: "Urano", en: "Uranus" },
    category: "planet",
    parentId: "sun",
    radiusKm: 25_362,
    massKg: 8.681e25,
    semiMajorAxisKm: 2_867_043_000,
    orbitalPeriodDays: 30_688.5,
    eccentricity: 0.0463,
    inclinationDeg: 0.773,
    color: "#7DE8E8",
    sourceIds: ["nasaJplHorizons"],
  },
  {
    id: "neptune",
    name: { it: "Nettuno", en: "Neptune" },
    category: "planet",
    parentId: "sun",
    radiusKm: 24_622,
    massKg: 1.024e26,
    semiMajorAxisKm: 4_515_000_000,
    orbitalPeriodDays: 60_182,
    eccentricity: 0.0086,
    inclinationDeg: 1.770,
    color: "#4B70DD",
    sourceIds: ["nasaJplHorizons"],
  },

  // ── Earth's Moon ──────────────────────────────────────────────────────────
  {
    id: "moon",
    name: { it: "Luna", en: "Moon" },
    category: "moon",
    parentId: "earth",
    radiusKm: 1_737.4,
    massKg: 7.342e22,
    semiMajorAxisKm: 384_400,
    orbitalPeriodDays: 27.321,
    eccentricity: 0.0549,
    inclinationDeg: 5.145,
    color: "#C8C8C8",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },

  // ── Galilean Moons (Jupiter) ──────────────────────────────────────────────
  {
    id: "io",
    name: { it: "Io", en: "Io" },
    category: "moon",
    parentId: "jupiter",
    radiusKm: 1_821.6,
    massKg: 8.932e22,
    semiMajorAxisKm: 421_700,
    orbitalPeriodDays: 1.769,
    eccentricity: 0.0041,
    inclinationDeg: 0.036,
    color: "#FFD966",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },
  {
    id: "europa",
    name: { it: "Europa", en: "Europa" },
    category: "moon",
    parentId: "jupiter",
    radiusKm: 1_560.8,
    massKg: 4.8e22,
    semiMajorAxisKm: 671_100,
    orbitalPeriodDays: 3.551,
    eccentricity: 0.009,
    inclinationDeg: 0.466,
    color: "#C8A882",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },
  {
    id: "ganymede",
    name: { it: "Ganimede", en: "Ganymede" },
    category: "moon",
    parentId: "jupiter",
    radiusKm: 2_634.1,
    massKg: 1.482e23,
    semiMajorAxisKm: 1_070_400,
    orbitalPeriodDays: 7.155,
    eccentricity: 0.0013,
    inclinationDeg: 0.177,
    color: "#A09070",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },
  {
    id: "callisto",
    name: { it: "Callisto", en: "Callisto" },
    category: "moon",
    parentId: "jupiter",
    radiusKm: 2_410.3,
    massKg: 1.076e23,
    semiMajorAxisKm: 1_882_700,
    orbitalPeriodDays: 16.689,
    eccentricity: 0.0074,
    inclinationDeg: 0.192,
    color: "#7A6050",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },

  // ── Saturn Moons ──────────────────────────────────────────────────────────
  {
    id: "titan",
    name: { it: "Titano", en: "Titan" },
    category: "moon",
    parentId: "saturn",
    radiusKm: 2_574.7,
    massKg: 1.345e23,
    semiMajorAxisKm: 1_221_870,
    orbitalPeriodDays: 15.945,
    eccentricity: 0.0288,
    inclinationDeg: 0.34854,
    color: "#E8A040",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },
  {
    id: "enceladus",
    name: { it: "Encelado", en: "Enceladus" },
    category: "moon",
    parentId: "saturn",
    radiusKm: 252.1,
    massKg: 1.08e20,
    semiMajorAxisKm: 237_948,
    orbitalPeriodDays: 1.370,
    eccentricity: 0.0047,
    inclinationDeg: 0.009,
    color: "#E8F0F8",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },

  // ── Neptune Moon ──────────────────────────────────────────────────────────
  {
    id: "triton",
    name: { it: "Tritone", en: "Triton" },
    category: "moon",
    parentId: "neptune",
    radiusKm: 1_353.4,
    massKg: 2.14e22,
    semiMajorAxisKm: 354_759,
    orbitalPeriodDays: 5.877,
    eccentricity: 0.000016,
    inclinationDeg: 156.885, // retrograde
    color: "#C0D0D8",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },

  // ── Dwarf Planets ─────────────────────────────────────────────────────────
  {
    id: "pluto",
    name: { it: "Plutone", en: "Pluto" },
    category: "dwarf-planet",
    parentId: "sun",
    radiusKm: 1_188.3,
    massKg: 1.303e22,
    semiMajorAxisKm: 5_906_380_000,
    orbitalPeriodDays: 90_560,
    eccentricity: 0.2488,
    inclinationDeg: 17.14,
    color: "#C8B89A",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
  {
    id: "ceres",
    name: { it: "Cerere", en: "Ceres" },
    category: "dwarf-planet",
    parentId: "sun",
    radiusKm: 476.2,
    massKg: 9.393e20,
    semiMajorAxisKm: 413_690_250,
    orbitalPeriodDays: 1_680.5,
    eccentricity: 0.0755,
    inclinationDeg: 10.594,
    color: "#A89880",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },

  // ── Charon (moon of Pluto) ────────────────────────────────────────────────
  {
    id: "charon",
    name: { it: "Caronte", en: "Charon" },
    category: "moon",
    parentId: "pluto",
    radiusKm: 606,
    massKg: 1.586e21,
    semiMajorAxisKm: 19_591,
    orbitalPeriodDays: 6.387,
    eccentricity: 0.0002,
    inclinationDeg: 0.001,
    color: "#B0A898",
    sourceIds: ["nasaJplHorizons", "jplSatellites"],
  },

  // ── Asteroid ──────────────────────────────────────────────────────────────
  {
    id: "vesta",
    name: { it: "Vesta", en: "Vesta" },
    category: "asteroid",
    parentId: "sun",
    radiusKm: 262.7,
    massKg: 2.59e20,
    semiMajorAxisKm: 353_268_000,
    orbitalPeriodDays: 1_325.75,
    eccentricity: 0.0887,
    inclinationDeg: 7.142,
    color: "#909090",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },

  // ── Comets ────────────────────────────────────────────────────────────────
  {
    id: "halley",
    name: { it: "Cometa di Halley", en: "Halley's Comet" },
    category: "comet",
    parentId: "sun",
    radiusKm: 11,
    massKg: 2.2e14,
    semiMajorAxisKm: 2_683_580_000,
    orbitalPeriodDays: 27_516,
    eccentricity: 0.9671,
    inclinationDeg: 162.26, // retrograde
    color: "#C0D8F0",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
  {
    id: "67p",
    name: { it: "67P/Churyumov–Gerasimenko", en: "67P/Churyumov–Gerasimenko" },
    category: "comet",
    parentId: "sun",
    radiusKm: 2,
    massKg: 9.982e12,
    semiMajorAxisKm: 522_736_000,
    orbitalPeriodDays: 2_369,
    eccentricity: 0.6413,
    inclinationDeg: 7.04,
    color: "#8C7860",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },

  // ── Trans-Neptunian Objects ───────────────────────────────────────────────
  {
    id: "eris",
    name: { it: "Eris", en: "Eris" },
    category: "tno",
    parentId: "sun",
    radiusKm: 1_163,
    massKg: 1.66e22,
    semiMajorAxisKm: 10_166_000_000,
    orbitalPeriodDays: 203_830,
    eccentricity: 0.4418,
    inclinationDeg: 44.04,
    color: "#D8D0C8",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
  {
    id: "haumea",
    name: { it: "Haumea", en: "Haumea" },
    category: "tno",
    parentId: "sun",
    radiusKm: 816,
    massKg: 4.006e21,
    semiMajorAxisKm: 6_484_000_000,
    orbitalPeriodDays: 103_774,
    eccentricity: 0.1887,
    inclinationDeg: 28.19,
    color: "#E0D8D0",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
  {
    id: "makemake",
    name: { it: "Makemake", en: "Makemake" },
    category: "tno",
    parentId: "sun",
    radiusKm: 715,
    massKg: 3.1e21,
    semiMajorAxisKm: 6_796_000_000,
    orbitalPeriodDays: 111_845,
    eccentricity: 0.1591,
    inclinationDeg: 29.01,
    color: "#E8D8C0",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
  {
    id: "sedna",
    name: { it: "Sedna", en: "Sedna" },
    category: "tno",
    parentId: "sun",
    radiusKm: 497.5,
    massKg: 5e20,
    semiMajorAxisKm: 76_320_000_000,
    orbitalPeriodDays: 4_404_480,
    eccentricity: 0.8496,
    inclinationDeg: 11.93,
    color: "#D08060",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
];
