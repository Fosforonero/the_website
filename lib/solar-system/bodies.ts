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
  | "tno"
  | "centaur"
  | "spacecraft";

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
  epochJd?: number;
  meanAnomalyDeg?: number;
  longitudeOfAscendingNodeDeg?: number;
  argumentOfPeriapsisDeg?: number;
  /**
   * ROTATION MODEL — Sprint 03A convention.
   *
   * axialTiltDeg: obliquity of the body's rotation axis relative to the
   * normal of its MEAN ORBITAL PLANE (not the ecliptic north pole, not
   * absolute ICRF RA/Dec).
   *
   * Convention:
   *   0°   = pole aligned with orbital plane normal (no tilt)
   *   90°  = pole in the orbital plane
   *   >90° = geometric retrograde sense (e.g. Venus 177°, Uranus 98°)
   *
   * Source: IAU WGCCRE 2015 obliquity values, referenced to each body's
   * mean orbital plane. Implemented in Sprint 04 — see poleRaDeg/poleDecDeg fields.
   *
   * rotationDirection: explicit prograde/retrograde classification.
   * MUST be set for all bodies with axialTiltDeg. Do not infer from tilt.
   * Retrograde = rotation opposite to orbital motion.
   *
   * Approximation declared (Sprint 03A):
   * The scene applies tiltAroundXRad as a rotation around scene X-axis.
   * This approximates the tilt relative to the ecliptic, not the exact
   * orbital plane for each body. For planets with low inclination (<3°)
   * the error is negligible. For high-inclination moons the approximation
   * is larger. Full per-body orbital-plane-normal tilt is Sprint 04.
   */
  axialTiltDeg?: number;
  /** Explicit rotation direction. Never infer from axialTiltDeg alone. */
  rotationDirection?: "prograde" | "retrograde";
  /**
   * Sidereal rotation period in hours.
   * Positive = prograde sense. Negative = retrograde sense (matches
   * rotationDirection). Both fields must agree.
   */
  siderealRotationHours?: number;
  /** Inner edge of ring system (km from body centre). Saturn and Uranus only. */
  ringInnerKm?: number;
  /** Outer edge of ring system (km from body centre). */
  ringOuterKm?: number;
  /**
   * IAU WGCCRE 2015 north pole orientation in ICRF J2000 (equatorial frame).
   * Sprint 04: used by rotation-model.ts to compute the correct ecliptic-frame
   * pole vector, replacing the scene X-axis approximation from Sprint 03A.
   *
   * poleRaDeg: right ascension of north pole (degrees, ICRF J2000)
   * poleDecDeg: declination of north pole (degrees, ICRF J2000)
   *
   * Source: IAU WGCCRE 2015 values at J2000 epoch.
   * Bodies without these fields fall back to the Sprint 03A axial-tilt approximation.
   */
  poleRaDeg?: number;
  poleDecDeg?: number;
  /**
   * IAU WGCCRE 2015 prime meridian angle W0 at J2000.0 (degrees).
   * W0 is the angle of the prime meridian from the ascending node of the body's
   * equator on the standard equator at J2000.0 TDB.
   * Source: Archinal et al. 2018 (CeMDA 130:22), Table 1.
   *
   * With rotationRateDegPerDay (Wdot), the prime meridian angle at epoch t is:
   *   W(t) = primeMeridianDeg + rotationRateDegPerDay * d
   * where d = Julian days since J2000.0 TDB.
   *
   * Negative Wdot means retrograde rotation (e.g. Venus).
   */
  primeMeridianDeg?: number;
  /**
   * IAU WGCCRE 2015 prime meridian rotation rate Wdot (degrees/day).
   * Sign convention: positive = prograde, negative = retrograde.
   * Source: Archinal et al. 2018 (CeMDA 130:22), Table 1.
   */
  rotationRateDegPerDay?: number;
  /**
   * Rotation model accuracy declaration.
   * "iau-wgccre" — W0 + Wdot*d used; accurate surface orientation.
   * "sidereal-only" — sidereal period only; phase unanchored to prime meridian.
   * "not-modelled" — rotation not modelled.
   */
  rotationModel?: "iau-wgccre" | "sidereal-only" | "not-modelled";
  /**
   * Correction (degrees) to add to the rendered rotation so the texture's
   * 0° meridian aligns with the IAU prime meridian.
   * 0 means the texture is already aligned (ideal case for NASA standard
   * equirectangular maps). Must be declared even if 0 once verified.
   * "not-verified" means alignment not yet tested — treat as approximate.
   */
  textureLongitudeOffsetDeg?: number | "not-verified";
  /**
   * Approximate atmosphere scale height boundary used for the visual shell (km).
   * Not a hard physical edge; atmosphere has no sharp boundary. Visualization only.
   * Source: approximate values from published atmospheric models.
   * Earth ~100 km (Kármán line), Venus ~100 km (dense cloud layer), Mars ~60 km, Titan ~600 km.
   */
  atmosphereHeightKm?: number;
  /**
   * Bilingual label for the atmosphere type, shown in the inspector.
   */
  atmosphereLabel?: { it: string; en: string };
  color: string;
  sourceIds: string[];
  assetId?: string;
};

export type BodyState = {
  id: string;
  positionKm: [number, number, number];
  localPositionKm?: [number, number, number];
  parentId: string | null;
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 174.794,
    longitudeOfAscendingNodeDeg: 48.340,
    argumentOfPeriapsisDeg: 29.118,
    axialTiltDeg: 0.034,
    rotationDirection: "prograde",
    siderealRotationHours: 1407.6,
    poleRaDeg: 281.0103,
    poleDecDeg: 61.4155,
    primeMeridianDeg: 329.548,
    rotationRateDegPerDay: 6.1385025,
    rotationModel: "iau-wgccre",
    // Sprint 05.3: systematic offset ~+15.5° expected (tilt-X vs IAU ascending node).
    // Requires empirical ephemeris comparison. M1-M5 periodic corrections not modelled.
    textureLongitudeOffsetDeg: "not-verified",
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 50.212,
    longitudeOfAscendingNodeDeg: 76.673,
    argumentOfPeriapsisDeg: 55.095,
    axialTiltDeg: 177.36,
    rotationDirection: "retrograde",
    siderealRotationHours: -5832.5,
    poleRaDeg: 272.76,
    poleDecDeg: 67.16,
    primeMeridianDeg: 160.20,
    rotationRateDegPerDay: -1.4813688,
    rotationModel: "iau-wgccre",
    textureLongitudeOffsetDeg: "not-verified",
    atmosphereHeightKm: 100,
    atmosphereLabel: { it: "Atmosfera densa — strato di nubi (~100 km)", en: "Dense atmosphere — cloud layer (~100 km)" },
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 357.537,
    longitudeOfAscendingNodeDeg: 0.0,
    argumentOfPeriapsisDeg: 102.930,
    axialTiltDeg: 23.439,
    rotationDirection: "prograde",
    siderealRotationHours: 23.934,
    poleRaDeg: 0.00,
    poleDecDeg: 90.00,
    primeMeridianDeg: 190.147,
    rotationRateDegPerDay: 360.9856235,
    rotationModel: "iau-wgccre",
    // Sprint 05.3: analytically verified — tilt-X aligns with ecliptic +X = vernal equinox
    // = IAU ascending node for Earth's near-ecliptic pole. NASA Blue Marble prime meridian
    // at U=0.5 correctly aligned. No empirical correction needed.
    textureLongitudeOffsetDeg: 0,
    atmosphereHeightKm: 100,
    atmosphereLabel: { it: "Atmosfera — guscio visivo fino alla linea di Kármán (~100 km)", en: "Atmosphere — visual shell to Kármán line (~100 km)" },
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 19.349,
    longitudeOfAscendingNodeDeg: 49.713,
    argumentOfPeriapsisDeg: 286.369,
    axialTiltDeg: 25.189,
    rotationDirection: "prograde",
    siderealRotationHours: 24.623,
    poleRaDeg: 317.269,
    poleDecDeg: 54.432,
    primeMeridianDeg: 176.630,
    rotationRateDegPerDay: 350.89198226,
    rotationModel: "iau-wgccre",
    // Sprint 05.3: systematic offset ~+69° expected (Mars pole RA=317.68°, Dec=52.89°
    // → tilt-X ≈ [0.79, -0.45, -0.42] vs IAU ascending node ≈ [0.67, 0.68, -0.29]).
    // Requires empirical ephemeris comparison before setting a numeric value.
    textureLongitudeOffsetDeg: "not-verified",
    atmosphereHeightKm: 60,
    atmosphereLabel: { it: "Atmosfera tenue (~60 km)", en: "Thin atmosphere (~60 km)" },
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 20.060,
    longitudeOfAscendingNodeDeg: 100.293,
    argumentOfPeriapsisDeg: 273.982,
    axialTiltDeg: 3.128,
    rotationDirection: "prograde",
    siderealRotationHours: 9.925,
    poleRaDeg: 268.057,
    poleDecDeg: 64.495,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 317.214,
    longitudeOfAscendingNodeDeg: 113.640,
    argumentOfPeriapsisDeg: 339.221,
    axialTiltDeg: 26.732,
    rotationDirection: "prograde",
    siderealRotationHours: 10.656,
    ringInnerKm: 74_500,
    ringOuterKm: 140_220,
    poleRaDeg: 40.589,
    poleDecDeg: 83.537,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 141.769,
    longitudeOfAscendingNodeDeg: 73.963,
    argumentOfPeriapsisDeg: 98.472,
    axialTiltDeg: 97.774,
    rotationDirection: "retrograde",
    siderealRotationHours: -17.240,
    ringInnerKm: 38_000,
    ringOuterKm: 51_149,
    poleRaDeg: 257.311,
    poleDecDeg: -15.175,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 257.541,
    longitudeOfAscendingNodeDeg: 131.784,
    argumentOfPeriapsisDeg: 274.898,
    axialTiltDeg: 28.322,
    rotationDirection: "prograde",
    siderealRotationHours: 16.110,
    poleRaDeg: 299.36,
    poleDecDeg: 43.46,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 135.270,
    longitudeOfAscendingNodeDeg: 125.045,
    argumentOfPeriapsisDeg: 318.150,
    axialTiltDeg: 6.687,
    rotationDirection: "prograde",
    siderealRotationHours: 655.720,
    poleRaDeg: 269.9949,
    poleDecDeg: 66.5392,
    primeMeridianDeg: 38.321,
    rotationRateDegPerDay: 13.1763581,
    rotationModel: "iau-wgccre",
    // Sprint 05.3: analytically verified — Moon pole ≈ ecliptic north → tilt-X ≈ IAU ascending
    // node. NASA LRO WAC prime meridian at U=0.5 correctly aligned. Libration E1-E13 not
    // modelled (max ~13° phase error in extreme cases).
    textureLongitudeOffsetDeg: 0,
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
    atmosphereHeightKm: 600,
    atmosphereLabel: { it: "Atmosfera densa con nebbia di idrocarburi (~600 km)", en: "Dense atmosphere with hydrocarbon haze (~600 km)" },
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 238.929,
    longitudeOfAscendingNodeDeg: 110.303,
    argumentOfPeriapsisDeg: 224.067,
    axialTiltDeg: 119.6,
    rotationDirection: "retrograde",
    siderealRotationHours: -153.293,
    poleRaDeg: 132.993,
    poleDecDeg: -6.163,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 77.372,
    longitudeOfAscendingNodeDeg: 80.327,
    argumentOfPeriapsisDeg: 73.597,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 38.380,
    longitudeOfAscendingNodeDeg: 58.420,
    argumentOfPeriapsisDeg: 111.332,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 198.0,
    longitudeOfAscendingNodeDeg: 35.960,
    argumentOfPeriapsisDeg: 151.310,
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
    epochJd: 2451545.0,
    meanAnomalyDeg: 358.0,
    longitudeOfAscendingNodeDeg: 144.520,
    argumentOfPeriapsisDeg: 311.190,
    color: "#D08060",
    sourceIds: ["nasaJplHorizons", "jplSbdb"],
  },
];
