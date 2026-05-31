/**
 * Distance and radius scaling helpers for Solar System visualization.
 *
 * Render unit convention: 1 unit ≈ 1 AU in compressed mode.
 */

import type { ScaleDistanceMode, ScaleRadiusMode, SolarBodyCategory } from "./bodies";

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
      return au < 2 ? au * 3 : au;

    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Radius scaling
// ---------------------------------------------------------------------------

/**
 * Category tiers for logarithmic radius scaling.
 * Higher tier = larger visual representation.
 */
const CATEGORY_BASE: Record<SolarBodyCategory, number> = {
  star: 0.70,         // Sun — capped separately
  planet: 0.10,       // gas giants anchor
  "dwarf-planet": 0.020,
  moon: 0.018,
  asteroid: 0.008,
  comet: 0.007,
  tno: 0.015,
};

/**
 * Minimum clickable size per category.
 */
const CATEGORY_MIN: Record<SolarBodyCategory, number> = {
  star: 0.25,
  planet: 0.035,
  "dwarf-planet": 0.014,
  moon: 0.012,
  asteroid: 0.007,
  comet: 0.006,
  tno: 0.010,
};

/**
 * Scale a body radius (km) to render units for the given mode.
 *
 * - `visible`  : logarithmic, category-aware. Preserves ordering while keeping
 *                every body clickable. Visual radius is NOT proportional to physical size.
 * - `relative` : proportional to Sun; Sun = 0.5 render units.
 *
 * The optional `category` parameter enables the category-aware logarithmic
 * floor in `visible` mode. Without it, the function falls back to a generic
 * log scale. Pass `body.category` when calling from the scene.
 */
export function scaleRadius(
  km: number,
  mode: ScaleRadiusMode,
  category?: SolarBodyCategory
): number {
  switch (mode) {
    case "visible": {
      if (category === "star") {
        // Sun: large but capped so it doesn't swallow inner orbits
        return Math.min(0.28, Math.max(0.25, (km / SUN_RADIUS_KM) * 0.28));
      }

      const base = category ? CATEGORY_BASE[category] : 0.020;
      const minR = category ? CATEGORY_MIN[category] : 0.008;

      // Logarithmic scale anchored at base, with floor at minR
      // log scale: value = base * log10(km / referenceKm + 1) + offset
      // Reference: Earth radius (6371 km) → 0.040 render units for planets
      const logScale = base * Math.log10(km / 1000 + 1);
      return Math.max(minR, Math.min(base * 2.5, logScale));
    }

    case "relative":
      return (km / SUN_RADIUS_KM) * 0.5;

    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

/**
 * Scale a moon's local offset (km) from its parent to render units so that
 * the moon system remains legible at educational scale.
 *
 * Returns an expanded offset — not to any real scale. The scene MUST label
 * this as educational/local satellite scale.
 *
 * @param offsetKm  Physical distance from parent (km)
 * @param parentId  ID of the parent body (for future per-system tuning)
 */
export function scaleSatelliteOffsetKm(offsetKm: number, parentId: string): number {
  // Boost factor: bring moon orbits into the ~0.05–0.3 render-unit range
  // Earth-Moon: 384,400 km → should render ~0.08
  // Io/Jupiter: 421,700 km → should render ~0.08
  // The boost is ~200× relative to compressed AU scale
  const boostFactor = 200 / AU_KM;
  const raw = offsetKm * boostFactor;

  // Per-system tuning: Pluto-Charon is a tight binary, needs extra boost
  const bonus = parentId === "pluto" ? 2.5 : 1.0;
  return Math.max(0.04, raw * bonus);
}
