/**
 * Distance and radius scaling helpers for Solar System visualization.
 *
 * Render unit convention: 1 unit = 1 AU in compressed mode.
 */

import type { ScaleDistanceMode, ScaleRadiusMode } from "./bodies";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Kilometres per Astronomical Unit (IAU 2012 definition). */
export const AU_KM = 149_597_870.7;

/** Sun radius in km (reference for relative radius scaling). */
const SUN_RADIUS_KM = 696_340;

// ---------------------------------------------------------------------------
// Distance scaling
// ---------------------------------------------------------------------------

/**
 * Scale a distance (km) to render units for the given mode.
 *
 * - `compressed`   : linear, 1 AU → 1 render unit.
 * - `real-log`     : logarithmic, preserves large-scale structure.
 * - `inner-system` : inner planets (< 2 AU) expanded by ×3, outer compressed.
 */
export function scaleDistance(km: number, mode: ScaleDistanceMode): number {
  const au = km / AU_KM;

  switch (mode) {
    case "compressed":
      return au;

    case "real-log":
      return Math.log10(au + 1) * 5;

    case "inner-system":
      if (au < 2) {
        return au * 3;
      }
      return au;

    default: {
      // Exhaustive check — TypeScript will warn if a new mode is added
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Radius scaling
// ---------------------------------------------------------------------------

/**
 * Scale a body radius (km) to render units for the given mode.
 *
 * - `visible`  : minimum visible size enforced (0.02 units), Sun ≈ 0.70 units.
 * - `relative` : proportional to Sun, Sun = 0.5 units.
 */
export function scaleRadius(km: number, mode: ScaleRadiusMode): number {
  switch (mode) {
    case "visible":
      // Cap the Sun to avoid it swallowing Mercury's orbit; preserve
      // a noticeable size difference between gas giants and rocky bodies.
      return Math.min(0.15, Math.max(0.02, km / 2_000_000));

    case "relative":
      return (km / SUN_RADIUS_KM) * 0.5;

    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
