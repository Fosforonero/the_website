/** Pure temperature engine — no React, no side effects.
 *  All meltingPoint / boilingPoint values are in Kelvin (NIST/CRC source).
 *  Pressure assumed: 1 atm throughout. */

export type TemperatureUnit = "K" | "C" | "F";
export type PhysicalPhase   = "solid" | "liquid" | "gas" | "unknown";
export type PhaseNote =
  | "no-data"         // both mp and bp null (superheavy)
  | "sublimation"     // mp >= bp (e.g. As) — no stable liquid at 1 atm
  | "no-boiling-data" // mp present, bp null (e.g. Cf, Es, Fm, Md, No, Lr)
  | "no-melting-data" // bp present, mp null (defensive — not in current data)
  | "at-melting"      // T within ±0.5 K of mp
  | "at-boiling";     // T within ±0.5 K of bp

export interface PhaseResult {
  phase: PhysicalPhase;
  note: PhaseNote | null;
  temperatureK: number;
}

export const ROOM_TEMPERATURE_K    = 298.15;
export const SUN_SURFACE_K         = 12000;
export const DEFAULT_MAX_NO_DATA_K = 5000;

const PHASE_EPSILON_K = 0.5;

// ─── Conversion ───────────────────────────────────────────────────────────────

export function toKelvin(value: number, unit: TemperatureUnit): number {
  if (unit === "C") return value + 273.15;
  if (unit === "F") return (value - 32) * 5 / 9 + 273.15;
  return value;
}

export function fromKelvin(k: number, unit: TemperatureUnit): number {
  if (unit === "C") return k - 273.15;
  if (unit === "F") return (k - 273.15) * 9 / 5 + 32;
  return k;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
): number {
  return fromKelvin(toKelvin(value, from), to);
}

// ─── Phase inference ──────────────────────────────────────────────────────────

export function inferPhaseAtTemperature(
  meltingPoint: number | null,
  boilingPoint: number | null,
  tempK: number,
): PhaseResult {
  const t = tempK;

  // Both null — superheavy / no thermal data
  if (meltingPoint === null && boilingPoint === null) {
    return { phase: "unknown", note: "no-data", temperatureK: t };
  }

  // Sublimation: mp >= bp (e.g. As sublimes at 1 atm — no stable liquid)
  if (meltingPoint !== null && boilingPoint !== null && meltingPoint >= boilingPoint) {
    const phase: PhysicalPhase = t < meltingPoint ? "solid" : "gas";
    return { phase, note: "sublimation", temperatureK: t };
  }

  // mp known, bp unknown (Cf, Es, Fm, Md, No, Lr)
  if (meltingPoint !== null && boilingPoint === null) {
    if (t < meltingPoint) return { phase: "solid", note: null, temperatureK: t };
    return { phase: "unknown", note: "no-boiling-data", temperatureK: t };
  }

  // bp known, mp unknown — defensive branch (doesn't occur in current dataset)
  if (meltingPoint === null && boilingPoint !== null) {
    if (t >= boilingPoint) return { phase: "gas", note: null, temperatureK: t };
    return { phase: "unknown", note: "no-melting-data", temperatureK: t };
  }

  // Normal case: both present, mp < bp
  const mp = meltingPoint!;
  const bp = boilingPoint!;

  let note: PhaseNote | null = null;
  if      (Math.abs(t - mp) <= PHASE_EPSILON_K) note = "at-melting";
  else if (Math.abs(t - bp) <= PHASE_EPSILON_K) note = "at-boiling";

  if (t < mp) return { phase: "solid",  note, temperatureK: t };
  if (t < bp) return { phase: "liquid", note, temperatureK: t };
  return              { phase: "gas",   note, temperatureK: t };
}

// ─── Slider range ─────────────────────────────────────────────────────────────

export function computeTemperatureRangeK(
  meltingPoint: number | null,
  boilingPoint: number | null,
): { min: number; max: number } {
  const max = boilingPoint !== null
    ? Math.min(Math.max(boilingPoint * 1.2, 1000), SUN_SURFACE_K)
    : DEFAULT_MAX_NO_DATA_K;
  return { min: 0, max };
}
