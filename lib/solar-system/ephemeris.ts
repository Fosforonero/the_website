/**
 * Ephemeris adapter — MVP Keplerian orbital elements.
 *
 * Computes heliocentric (or parent-relative) positions for all Solar System
 * bodies at a given date. Pure function; no side effects, no randomness.
 *
 * Source: NASA/JPL Horizons orbital elements (nasaJplHorizons).
 * Accuracy: suitable for visualization; not suitable for navigation.
 */

import { SOLAR_BODIES } from "./bodies";
import type { BodyState } from "./bodies";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Julian date of J2000.0 epoch (2000-Jan-01 12:00 TT) */
const J2000_JD = 2_451_545.0;

/** Julian date offset from Unix epoch (1970-01-01) in days */
const UNIX_EPOCH_JD = 2_440_587.5;

// ---------------------------------------------------------------------------
// Keplerian helpers
// ---------------------------------------------------------------------------

/**
 * Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E
 * using Newton–Raphson iteration (3 iterations are sufficient for e < 0.98).
 */
function solveKepler(M: number, e: number): number {
  // Normalise M to [0, 2π]
  const twoPi = 2 * Math.PI;
  const Mn = ((M % twoPi) + twoPi) % twoPi;

  let E = Mn; // initial guess
  for (let i = 0; i < 3; i++) {
    E = E - (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
  }
  return E;
}

/**
 * Convert Keplerian orbital elements to a 3-D position vector (km).
 *
 * @param a   Semi-major axis (km)
 * @param e   Eccentricity
 * @param iDeg  Inclination (degrees, orbital plane vs ecliptic)
 * @param M   Mean anomaly (radians)
 * @returns   [x, y, z] heliocentric ecliptic position (km)
 */
function keplerToXyz(
  a: number,
  e: number,
  iDeg: number,
  M: number
): [number, number, number] {
  const E = solveKepler(M, e);

  // True anomaly
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const sqrtFactor = Math.sqrt(1 - e * e);

  // Position in orbital plane
  const xOrbital = a * (cosE - e);
  const yOrbital = a * sqrtFactor * sinE;

  // Rotate by inclination (simplified: omega and RAAN = 0 for MVP)
  const iRad = (iDeg * Math.PI) / 180;
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);

  const x = xOrbital;
  const y = yOrbital * cosI;
  const z = yOrbital * sinI;

  return [x, y, z];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the position state for every catalogued Solar System body at the
 * given date, using simple Keplerian orbital elements.
 *
 * - The Sun is always at the origin [0, 0, 0].
 * - Moons are positioned relative to their parent's position.
 * - Bodies without orbital data are placed at the origin.
 */
export function getBodyStatesForDate(date: Date): BodyState[] {
  // Days since J2000.0
  const jd = date.getTime() / 86_400_000 + UNIX_EPOCH_JD;
  const daysSinceJ2000 = jd - J2000_JD;

  const epochIso = date.toISOString();
  const stateMap = new Map<string, [number, number, number]>();

  // Two-pass: first compute heliocentric (parent = sun / null), then moons.
  // We process in dependency order by iterating twice.
  const results: BodyState[] = [];

  // Pass 1 — bodies whose parent is null or "sun"
  for (const body of SOLAR_BODIES) {
    if (body.parentId !== null && body.parentId !== "sun") continue;

    let pos: [number, number, number] = [0, 0, 0];

    if (
      body.semiMajorAxisKm !== undefined &&
      body.orbitalPeriodDays !== undefined &&
      body.eccentricity !== undefined &&
      body.inclinationDeg !== undefined
    ) {
      const M =
        (2 * Math.PI * (daysSinceJ2000 / body.orbitalPeriodDays)) % (2 * Math.PI);
      pos = keplerToXyz(
        body.semiMajorAxisKm,
        body.eccentricity,
        body.inclinationDeg,
        M
      );
    }

    stateMap.set(body.id, pos);
    results.push({
      id: body.id,
      positionKm: pos,
      epochIso,
      source: "mvp-orbital-elements",
    });
  }

  // Pass 2 — moons (one level deep; sufficient for all catalogued moons)
  for (const body of SOLAR_BODIES) {
    if (body.parentId === null || body.parentId === "sun") continue;

    let localPos: [number, number, number] = [0, 0, 0];

    if (
      body.semiMajorAxisKm !== undefined &&
      body.orbitalPeriodDays !== undefined &&
      body.eccentricity !== undefined &&
      body.inclinationDeg !== undefined
    ) {
      const M =
        (2 * Math.PI * (daysSinceJ2000 / body.orbitalPeriodDays)) % (2 * Math.PI);
      localPos = keplerToXyz(
        body.semiMajorAxisKm,
        body.eccentricity,
        body.inclinationDeg,
        M
      );
    }

    // Add parent's position
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
      epochIso,
      source: "mvp-orbital-elements",
    });
  }

  return results;
}
