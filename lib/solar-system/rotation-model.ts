/**
 * Rotation model for Solar System bodies.
 *
 * Computes axial tilt orientation and current rotation phase at a given epoch.
 *
 * Accuracy notes:
 * - Axial tilt magnitude: IAU 2015 values, correct.
 * - Pole direction: Sprint 04 — when poleRaDeg/poleDecDeg are present on a body,
 *   equatorialToEclipticPole() converts the IAU WGCCRE ICRF J2000 pole to the
 *   ecliptic frame and returns accuracy "iau-pole-vector". The scene then uses a
 *   quaternion (setFromUnitVectors Y→pole) instead of the Sprint 03A X-axis
 *   rotation approximation.
 * - For bodies without IAU pole data, falls back to Sprint 03A approximation
 *   (rotation around scene X-axis, accuracy "axial-tilt-approximate").
 * - Rotation phase: computed from sidereal period since J2000.0.
 *   Precession and nutation not modelled.
 * - Retrograde: correct for Venus (177°), Uranus (97.8°), Pluto (122.5°).
 */

import type { SolarBody } from "./bodies";

/** J2000.0 reference epoch in Unix milliseconds (2000-Jan-01T12:00:00Z). */
const J2000_MS = 946_728_000_000;

/** IAU 2006 obliquity of the ecliptic at J2000.0 (degrees). Matches reference-frames.ts. */
const ECLIPTIC_OBLIQUITY_DEG = 23.43929111;

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
  accuracy: "axial-tilt-approximate" | "iau-pole-vector" | "not-modelled";
  /**
   * Sprint 04: IAU WGCCRE pole direction in scene (ecliptic HEC-J2000) frame.
   * Unit vector. When present, the scene uses a quaternion derived from this
   * vector instead of the Sprint 03A X-axis rotation approximation.
   */
  eclipticPoleVector?: [number, number, number];
  /**
   * Surface orientation model used for this body.
   * "iau-prime-meridian" — W = W0 + Wdot*d; prime meridian tracked.
   * "sidereal-only" — phase from sidereal period, not anchored to W0.
   * "not-modelled" — no rotation data.
   */
  rotationOrientationModel: "iau-prime-meridian" | "sidereal-only" | "not-modelled";
};

/**
 * Convert an IAU WGCCRE pole (ICRF J2000 equatorial) to the ecliptic frame
 * used by the scene (HEC-J2000). Returns a unit vector.
 *
 * Rotation: R_x(ε) applied to the equatorial unit vector, where ε is the
 * obliquity of the ecliptic (IAU 2006, 23.43929111°).
 */
function equatorialToEclipticPole(
  raDeg: number,
  decDeg: number
): [number, number, number] {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const eps = (ECLIPTIC_OBLIQUITY_DEG * Math.PI) / 180;

  const xEq = Math.cos(dec) * Math.cos(ra);
  const yEq = Math.cos(dec) * Math.sin(ra);
  const zEq = Math.sin(dec);

  return [
    xEq,
    Math.cos(eps) * yEq + Math.sin(eps) * zEq,
    -Math.sin(eps) * yEq + Math.cos(eps) * zEq,
  ];
}

/**
 * Compute the orientation of a body at the given epoch (Unix ms).
 *
 * Returns a tilt angle (for the tilt group) and a rotation phase (for the
 * spin group). When eclipticPoleVector is present (accuracy "iau-pole-vector"),
 * the scene should use a quaternion (setFromUnitVectors Y→pole) instead of the
 * tiltAroundXRad Euler approximation.
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
      rotationOrientationModel: "not-modelled",
    };
  }

  // Sprint 04: use IAU WGCCRE pole RA/Dec when available for correct ecliptic orientation
  if (body.poleRaDeg !== undefined && body.poleDecDeg !== undefined) {
    const eclipticPoleVector = equatorialToEclipticPole(body.poleRaDeg, body.poleDecDeg);

    // Sprint 05.2: use IAU WGCCRE prime meridian W = W0 + Wdot*d when available
    let rotationPhaseRad: number;
    let rotationOrientationModel: "iau-prime-meridian" | "sidereal-only";
    const twoPi = 2 * Math.PI;

    if (body.primeMeridianDeg !== undefined && body.rotationRateDegPerDay !== undefined) {
      // IAU WGCCRE prime meridian model: W = W0 + Wdot * d + textureOffset
      const daysSinceJ2000 = (epochMs - J2000_MS) / 86_400_000;
      const textureOffset = typeof body.textureLongitudeOffsetDeg === "number" ? body.textureLongitudeOffsetDeg : 0;
      const W_deg = body.primeMeridianDeg + body.rotationRateDegPerDay * daysSinceJ2000 + textureOffset;
      rotationPhaseRad = ((W_deg * Math.PI / 180) % twoPi + twoPi) % twoPi;
      rotationOrientationModel = "iau-prime-meridian";
    } else {
      // Sidereal-only: no W0 anchor
      const elapsedHours = (epochMs - J2000_MS) / 3_600_000;
      const periodHours = Math.abs(body.siderealRotationHours);
      const phaseRaw = (elapsedHours / periodHours) * 2 * Math.PI;
      const direction = body.siderealRotationHours < 0 ? -1 : 1;
      rotationPhaseRad = ((direction * phaseRaw) % twoPi + twoPi) % twoPi;
      rotationOrientationModel = "sidereal-only";
    }

    return {
      tiltAroundXRad: (body.axialTiltDeg * Math.PI) / 180, // kept for backward compat
      rotationPhaseRad,
      isRetrograde: isRetrogradeRotation(body),
      accuracy: "iau-pole-vector",
      eclipticPoleVector,
      rotationOrientationModel,
    };
  }

  const tiltRad = (body.axialTiltDeg * Math.PI) / 180;
  const isRetrograde = isRetrogradeRotation(body);

  // Sprint 05.2: use IAU WGCCRE prime meridian W = W0 + Wdot*d when available
  let rotationPhaseRad: number;
  let rotationOrientationModel: "iau-prime-meridian" | "sidereal-only";
  const twoPi = 2 * Math.PI;

  if (body.primeMeridianDeg !== undefined && body.rotationRateDegPerDay !== undefined) {
    // IAU WGCCRE prime meridian model: W = W0 + Wdot * d + textureOffset
    const daysSinceJ2000 = (epochMs - J2000_MS) / 86_400_000;
    const textureOffset = typeof body.textureLongitudeOffsetDeg === "number" ? body.textureLongitudeOffsetDeg : 0;
    const W_deg = body.primeMeridianDeg + body.rotationRateDegPerDay * daysSinceJ2000 + textureOffset;
    rotationPhaseRad = ((W_deg * Math.PI / 180) % twoPi + twoPi) % twoPi;
    rotationOrientationModel = "iau-prime-meridian";
  } else {
    // Sidereal-only: no W0 anchor
    const elapsedHours = (epochMs - J2000_MS) / 3_600_000;
    const periodHours = Math.abs(body.siderealRotationHours);
    const phaseRaw = (elapsedHours / periodHours) * 2 * Math.PI;
    const direction = body.siderealRotationHours < 0 ? -1 : 1;
    rotationPhaseRad = ((direction * phaseRaw) % twoPi + twoPi) % twoPi;
    rotationOrientationModel = "sidereal-only";
  }

  return {
    tiltAroundXRad: tiltRad,
    rotationPhaseRad,
    isRetrograde,
    accuracy: "axial-tilt-approximate",
    rotationOrientationModel,
  };
}

/**
 * Human-readable accuracy note for inspector display.
 * Describes pole direction accuracy (separate from surface orientation).
 */
export const ROTATION_ACCURACY_NOTES = {
  "axial-tilt-approximate": {
    it: "Obliquità reale IAU 2015. Azimut del polo approssimato — RA/Dec IAU WGCCRE in Sprint 04.",
    en: "Real obliquity IAU 2015. Pole azimuth approximated — IAU WGCCRE RA/Dec in Sprint 04.",
  },
  "iau-pole-vector": {
    it: "Polo IAU WGCCRE 2015 J2000 — direzione asse corretta nel frame eclittico.",
    en: "IAU WGCCRE 2015 J2000 pole — correct axis direction in ecliptic frame.",
  },
  "not-modelled": {
    it: "Rotazione non modellata per questo corpo.",
    en: "Rotation not modelled for this body.",
  },
} as const;

/**
 * Human-readable surface orientation model note for inspector display.
 * Describes how the rotation phase (longitude) is computed — separate from pole accuracy.
 */
export const ROTATION_ORIENTATION_NOTES = {
  "iau-prime-meridian": {
    it: "Orientamento superficie: meridiano primo IAU WGCCRE 2015. W = W0 + Ẇ·d da J2000.0.",
    en: "Surface orientation: IAU WGCCRE 2015 prime meridian. W = W0 + Ẇ·d from J2000.0.",
  },
  "sidereal-only": {
    it: "Fase siderale da J2000.0, senza ancoraggio al meridiano primo IAU. Orientamento longitudine approssimato.",
    en: "Sidereal phase from J2000.0, not anchored to IAU prime meridian. Longitude orientation approximate.",
  },
  "not-modelled": {
    it: "Rotazione non modellata per questo corpo.",
    en: "Rotation not modelled for this body.",
  },
} as const;

/**
 * Returns true if the body's rotation is retrograde.
 *
 * Uses the explicit `rotationDirection` field when available.
 * Falls back to `siderealRotationHours < 0` for compatibility with bodies
 * that have not yet been assigned a `rotationDirection`.
 * Does NOT infer from axialTiltDeg alone — obliquity > 90° is a necessary
 * but not sufficient condition for retrograde in all conventions.
 */
export function isRetrogradeRotation(body: RotatableSolarBody): boolean {
  if (body.rotationDirection !== undefined) return body.rotationDirection === "retrograde";
  // Fallback for bodies without explicit rotationDirection
  if (body.siderealRotationHours !== undefined) return body.siderealRotationHours < 0;
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

/**
 * Format the rotation direction for display in the inspector.
 * Uses explicit rotationDirection field.
 * Returns "—" if not set.
 */
export function formatRotationDirection(
  body: RotatableSolarBody,
  locale: "it" | "en"
): string {
  if (body.rotationDirection === undefined) return "—";
  return body.rotationDirection === "retrograde"
    ? locale === "it" ? "Retrograda" : "Retrograde"
    : locale === "it" ? "Prograda" : "Prograde";
}
