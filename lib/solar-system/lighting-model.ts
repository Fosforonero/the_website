/**
 * Lighting model for the Solar System Lab.
 *
 * Two declared modes:
 *
 * physical:
 *   Three.js pointLight at Sun with decay=2 (inverse-square law, 1/r²).
 *   No ambient light. Outer planets are as dark as in reality.
 *   Neptune at ~30 AU receives ~1/900 the irradiance of Earth.
 *   Physically correct; may be very dark for distant bodies.
 *
 * educational:
 *   Same pointLight (decay=2) + a small declared ambient boost.
 *   Outer planets remain visible. Disclosed in UI and inspector.
 *   Default mode.
 *
 * Neither mode is "real time" unless Horizons vectors are also used.
 * The ambient boost in educational mode is NOT physically motivated.
 * It must always be labelled wherever active.
 */

import type { ScaleBrightnessMode } from "./scales";

export type { ScaleBrightnessMode };

export type LightingConfig = {
  mode: ScaleBrightnessMode;
  /** pointLight intensity at Sun position (render units). */
  sunIntensity: number;
  /** pointLight decay exponent. 2 = physically correct inverse-square. */
  sunDecay: number;
  /** pointLight maximum distance (0 = unlimited). */
  sunDistance: number;
  /** Ambient light intensity. Must be 0 in physical mode. */
  ambientIntensity: number;
  /** Ambient light colour (hex). */
  ambientColor: string;
};

export const PHYSICAL_LIGHTING: LightingConfig = {
  mode: "physical",
  sunIntensity: 3.0,
  sunDecay: 2,
  sunDistance: 0,
  ambientIntensity: 0,
  ambientColor: "#000000",
};

export const EDUCATIONAL_LIGHTING: LightingConfig = {
  mode: "educational",
  sunIntensity: 3.0,
  sunDecay: 2,
  sunDistance: 0,
  ambientIntensity: 0.06,
  ambientColor: "#0a1828",
};

export function getLightingConfig(mode: ScaleBrightnessMode): LightingConfig {
  return mode === "physical" ? PHYSICAL_LIGHTING : EDUCATIONAL_LIGHTING;
}

export const LIGHTING_DISCLOSURE = {
  physical: {
    it: "Illuminazione fisica 1/r²: nessun boost. I pianeti esterni sono scuri come nella realtà.",
    en: "Physical 1/r² lighting: no boost. Outer planets are as dark as in reality.",
  },
  educational: {
    it: "Illuminazione educativa: 1/r² solare + boost ambientale dichiarato per visibilità pianeti esterni.",
    en: "Educational lighting: solar 1/r² + declared ambient boost for outer planet visibility.",
  },
} as const;
