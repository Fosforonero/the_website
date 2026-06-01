/**
 * Ephemeris adapter — Keplerian orbital elements (Sprint 02).
 *
 * Computes heliocentric (or parent-relative) positions for all Solar System
 * bodies at a given date using full perifocal-to-ecliptic rotation.
 *
 * Source: NASA/JPL Horizons orbital elements (nasaJplHorizons).
 * Accuracy: suitable for visualization; not suitable for navigation.
 */

import { SOLAR_BODIES } from "./bodies";
import type { BodyState } from "./bodies";
import type { CatalogEntry } from "./catalog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Julian date of J2000.0 epoch (2000-Jan-01 12:00 TT) */
const J2000_JD = 2_451_545.0;

/** 1 AU in km — local to this module; use AU_KM from scales.ts elsewhere */
const AU_TO_KM = 149_597_870.7;

/** Julian date offset from Unix epoch (1970-01-01T00:00:00Z) in days */
const UNIX_EPOCH_JD = 2_440_587.5;

// ---------------------------------------------------------------------------
// Keplerian helpers
// ---------------------------------------------------------------------------

/**
 * Solve Kepler's equation M = E - e*sin(E) using Newton–Raphson iteration.
 * Handles high-eccentricity comets (e up to ~0.97).
 */
function solveKepler(M: number, e: number): number {
  const twoPi = 2 * Math.PI;
  const Mn = ((M % twoPi) + twoPi) % twoPi;

  let E = e > 0.8 ? Math.PI : Mn;
  for (let i = 0; i < 50; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

/**
 * Convert Keplerian orbital elements to a 3-D position vector (km).
 * Uses full perifocal-to-ecliptic rotation (Thrane & Christensen-Dalsgaard 2009).
 *
 * @param a        Semi-major axis (km)
 * @param e        Eccentricity
 * @param iDeg     Inclination (degrees)
 * @param OmegaDeg Longitude of ascending node Ω (degrees)
 * @param omegaDeg Argument of periapsis ω (degrees)
 * @param M        Mean anomaly (radians)
 * @returns        [x, y, z] ecliptic position (km)
 */
function keplerToXyz(
  a: number,
  e: number,
  iDeg: number,
  OmegaDeg: number,
  omegaDeg: number,
  M: number
): [number, number, number] {
  const E = solveKepler(M, e);

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const oneMecosE = 1 - e * cosE;

  // Radial distance
  const r = a * oneMecosE;

  // True anomaly components
  const cosNu = (cosE - e) / oneMecosE;
  const sinNu = (Math.sqrt(1 - e * e) * sinE) / oneMecosE;
  const nu = Math.atan2(sinNu, cosNu);

  const omegaPlusNu = (omegaDeg * Math.PI) / 180 + nu;
  const iRad = (iDeg * Math.PI) / 180;
  const OmegaRad = (OmegaDeg * Math.PI) / 180;

  const cosO = Math.cos(OmegaRad);
  const sinO = Math.sin(OmegaRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);
  const cosON = Math.cos(omegaPlusNu);
  const sinON = Math.sin(omegaPlusNu);

  // Perifocal-to-ecliptic rotation
  const x = r * (cosO * cosON - sinO * sinON * cosI);
  const y = r * (sinO * cosON + cosO * sinON * cosI);
  const z = r * sinON * sinI;

  return [x, y, z];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the position state for every catalogued Solar System body at the
 * given date, using Keplerian orbital elements.
 *
 * - The Sun is always at the origin [0, 0, 0].
 * - Bodies with full elements (Ω, ω, M₀) use epoch-accurate mean anomaly.
 * - Bodies missing elements default to M₀ = 0 at J2000 (MVP approximation).
 * - Moons include `localPositionKm` (parent-relative offset) for local rendering.
 */
export function getBodyStatesForDate(date: Date): BodyState[] {
  const jd = date.getTime() / 86_400_000 + UNIX_EPOCH_JD;

  const epochIso = date.toISOString();
  const stateMap = new Map<string, [number, number, number]>();
  const results: BodyState[] = [];

  function computePos(body: (typeof SOLAR_BODIES)[number]): [number, number, number] {
    if (
      body.semiMajorAxisKm === undefined ||
      body.orbitalPeriodDays === undefined ||
      body.eccentricity === undefined ||
      body.inclinationDeg === undefined
    ) {
      return [0, 0, 0];
    }

    const epochJd = body.epochJd ?? J2000_JD;
    const M0 = ((body.meanAnomalyDeg ?? 0) * Math.PI) / 180;
    const twoPi = 2 * Math.PI;
    const meanMotion = twoPi / body.orbitalPeriodDays;
    const daysSinceEpoch = jd - epochJd;
    const M = ((M0 + meanMotion * daysSinceEpoch) % twoPi + twoPi) % twoPi;

    const Omega = body.longitudeOfAscendingNodeDeg ?? 0;
    const omega = body.argumentOfPeriapsisDeg ?? 0;

    return keplerToXyz(
      body.semiMajorAxisKm,
      body.eccentricity,
      body.inclinationDeg,
      Omega,
      omega,
      M
    );
  }

  // Pass 1 — bodies whose parent is null or "sun"
  for (const body of SOLAR_BODIES) {
    if (body.parentId !== null && body.parentId !== "sun") continue;

    const pos = computePos(body);
    stateMap.set(body.id, pos);
    results.push({
      id: body.id,
      positionKm: pos,
      parentId: body.parentId,
      epochIso,
      source: "mvp-orbital-elements",
    });
  }

  // Pass 2 — moons (one level deep; sufficient for all catalogued moons)
  for (const body of SOLAR_BODIES) {
    if (body.parentId === null || body.parentId === "sun") continue;

    const localPos = computePos(body);

    const parentPos = stateMap.get(body.parentId) ?? ([0, 0, 0] as [number, number, number]);
    const worldPos: [number, number, number] = [
      localPos[0] + parentPos[0],
      localPos[1] + parentPos[1],
      localPos[2] + parentPos[2],
    ];

    stateMap.set(body.id, worldPos);
    results.push({
      id: body.id,
      positionKm: worldPos,
      localPositionKm: localPos,
      parentId: body.parentId,
      epochIso,
      source: "mvp-orbital-elements",
    });
  }

  return results;
}

/**
 * Sample one full orbit as an array of ecliptic-relative position vectors (km).
 * For moons, returns positions relative to their parent body (local frame).
 *
 * @param bodyId  ID of the body to sample
 * @param samples Number of sample points (default 256)
 * @returns       Array of [x, y, z] points in km, or empty array if no orbital data
 */
export function sampleOrbitPath(bodyId: string, samples = 256): Array<[number, number, number]> {
  const body = SOLAR_BODIES.find((b) => b.id === bodyId);
  if (
    !body ||
    body.semiMajorAxisKm === undefined ||
    body.eccentricity === undefined ||
    body.inclinationDeg === undefined
  ) {
    return [];
  }

  const Omega = body.longitudeOfAscendingNodeDeg ?? 0;
  const omega = body.argumentOfPeriapsisDeg ?? 0;
  const points: Array<[number, number, number]> = [];
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < samples; i++) {
    const M = (i / samples) * twoPi;
    points.push(
      keplerToXyz(
        body.semiMajorAxisKm,
        body.eccentricity,
        body.inclinationDeg,
        Omega,
        omega,
        M
      )
    );
  }

  return points;
}

/**
 * Sample an orbit path for a CatalogEntry using the same Keplerian math
 * as sampleOrbitPath. CatalogEntry uses AU for semi-major axis.
 * Returns heliocentric ecliptic positions in km.
 */
export function sampleCatalogEntryOrbitPath(
  entry: CatalogEntry,
  samples = 256
): Array<[number, number, number]> {
  const a = entry.semiMajorAxisAu * AU_TO_KM;
  const { eccentricity: e, inclinationDeg, longitudeAscNodeDeg: Omega, argPeriapsisDeg: omega } = entry;
  const twoPi = 2 * Math.PI;
  const points: Array<[number, number, number]> = [];
  for (let i = 0; i < samples; i++) {
    const M = (i / samples) * twoPi;
    points.push(keplerToXyz(a, e, inclinationDeg, Omega, omega, M));
  }
  return points;
}
