/**
 * Rotation model for Solar System bodies.
 *
 * Computes axial tilt orientation and current rotation phase at a given epoch.
 *
 * Accuracy notes:
 * - Axial tilt magnitude: IAU 2015 values, correct.
 * - Pole azimuth direction: approximated as rotation around scene X-axis.
 *   The full IAU WGCCRE RA/Dec pole direction is NOT yet implemented
 *   (planned for Sprint 04). This means the tilt direction in the scene
 *   may be off by up to ~180° for some bodies, but the tilt angle is correct.
 * - Rotation phase: computed from sidereal period since J2000.0.
 *   Precession and nutation not modelled.
 * - Retrograde: correct for Venus (177°), Uranus (97.8°), Pluto (122.5°).
 */

import type { SolarBody } from "./bodies";

/** J2000.0 reference epoch in Unix milliseconds (2000-Jan-01T12:00:00Z). */
const J2000_MS = 946_728_000_000;

/**
 * Extension of SolarBody with rotation fields added in Task 2.
 * Using an intersection so this file stays forward-compatible without
 * modifying bodies.ts before Task 2 lands.
 */
type RotatableSolarBody = SolarBody & {
  axialTiltDeg?: number;
  siderealRotationHours?: number;
};

export type BodyOrientation = {
  /** Tilt of the rotation axis around scene X-axis (radians). */
  tiltAroundXRad: number;
  /** Current rotation phase around the (tilted) pole axis (radians). */
  rotationPhaseRad: number;
  /** True if siderealRotationHours < 0 or axialTiltDeg > 90°. */
  isRetrograde: boolean;
  /** Accuracy level of this orientation computation. */
  accuracy: "axial-tilt-approximate" | "not-modelled";
};

/**
 * Compute the orientation of a body at the given epoch (Unix ms).
 *
 * Returns a tilt angle (for the tilt group) and a rotation phase (for the
 * spin group). Apply them as:
 *   <group rotation={[tiltAroundXRad, 0, 0]}>
 *     <group rotation={[0, rotationPhaseRad, 0]}>
 *       <mesh /> (the sphere)
 *     </group>
 *   </group>
 *
 * Accepts any SolarBody; rotation fields are optional until Task 2 lands.
 */
export function getBodyOrientation(
  body: RotatableSolarBody,
  epochMs: number
): BodyOrientation {
  if (body.axialTiltDeg === undefined || body.siderealRotationHours === undefined) {
    return {
      tiltAroundXRad: 0,
      rotationPhaseRad: 0,
      isRetrograde: false,
      accuracy: "not-modelled",
    };
  }

  const tiltRad = (body.axialTiltDeg * Math.PI) / 180;
  const isRetrograde =
    body.siderealRotationHours < 0 || body.axialTiltDeg > 90;

  const elapsedHours = (epochMs - J2000_MS) / 3_600_000;
  const periodHours = Math.abs(body.siderealRotationHours);
  const phaseRaw = (elapsedHours / periodHours) * 2 * Math.PI;
  const direction = body.siderealRotationHours < 0 ? -1 : 1;
  const twoPi = 2 * Math.PI;
  const rotationPhaseRad =
    ((direction * phaseRaw) % twoPi + twoPi) % twoPi;

  return {
    tiltAroundXRad: tiltRad,
    rotationPhaseRad,
    isRetrograde,
    accuracy: "axial-tilt-approximate",
  };
}

/**
 * Human-readable accuracy note for inspector display.
 */
export const ROTATION_ACCURACY_NOTES = {
  "axial-tilt-approximate": {
    it: "Obliquità reale IAU 2015. Azimut del polo approssimato — RA/Dec IAU WGCCRE in Sprint 04.",
    en: "Real obliquity IAU 2015. Pole azimuth approximated — IAU WGCCRE RA/Dec in Sprint 04.",
  },
  "not-modelled": {
    it: "Rotazione non modellata per questo corpo.",
    en: "Rotation not modelled for this body.",
  },
} as const;

/**
 * Returns true if the body's axial tilt or rotation direction is retrograde.
 * Retrograde: sidereal period negative OR tilt > 90°.
 *
 * Accepts any SolarBody; rotation fields are optional until Task 2 lands.
 */
export function isRetrogradeRotation(body: RotatableSolarBody): boolean {
  if (body.siderealRotationHours !== undefined && body.siderealRotationHours < 0) return true;
  if (body.axialTiltDeg !== undefined && body.axialTiltDeg > 90) return true;
  return false;
}

/**
 * Format axial tilt for display.
 * Returns e.g. "177.4° (retrogrado)" or "23.4° (progrado)".
 *
 * Accepts any SolarBody; rotation fields are optional until Task 2 lands.
 */
export function formatAxialTilt(
  body: RotatableSolarBody,
  locale: "it" | "en"
): string {
  if (body.axialTiltDeg === undefined) return "—";
  const retroLabel = locale === "it" ? "retrogrado" : "retrograde";
  const proLabel = locale === "it" ? "progrado" : "prograde";
  const label = isRetrogradeRotation(body) ? retroLabel : proLabel;
  return `${body.axialTiltDeg.toFixed(1)}° (${label})`;
}

/**
 * Format sidereal rotation period for display.
 * Returns e.g. "23.9 h" or "243.0 d (retrogrado)".
 *
 * Accepts any SolarBody; rotation fields are optional until Task 2 lands.
 */
export function formatRotationPeriod(
  body: RotatableSolarBody,
  locale: "it" | "en"
): string {
  if (body.siderealRotationHours === undefined) return "—";
  const h = Math.abs(body.siderealRotationHours);
  const retroLabel = locale === "it" ? " (retrogrado)" : " (retrograde)";
  const suffix = isRetrogradeRotation(body) ? retroLabel : "";
  if (h >= 24) {
    return `${(h / 24).toFixed(2)} d${suffix}`;
  }
  return `${h.toFixed(1)} h${suffix}`;
}
