// ---------------------------------------------------------------------------
// Real-scale black-hole physics — pure functions mapping a mass (in solar
// masses) to the characteristic physical quantities shown in the "real scale"
// panel. This is the bridge between the dimensionless renderer (rₛ = 1) and a
// real object such as a stellar-mass hole, Sgr A* or M87*.
//
// Sources: Schwarzschild radius & ISCO (textbook GR); multicolour-disk peak
// temperature scaling T_in ∝ (M Ṁ)^¼ → ∝ M^(−¼) at fixed Eddington ratio
// (Shakura–Sunyaev / Makishima); Hawking temperature & Bekenstein–Hawking
// entropy (Hawking 1975, Bekenstein 1973); evaporation time (Page 1976).
// All constants SI.
// ---------------------------------------------------------------------------

const M_SUN = 1.98892e30;     // kg
const G = 6.674e-11;          // m³ kg⁻¹ s⁻²
const C = 2.99792458e8;       // m s⁻¹
const HBAR = 1.054571817e-34; // J s
const KB = 1.380649e-23;      // J K⁻¹

export type BHFacts = {
  rsKm: number;        // Schwarzschild radius r_s = 2GM/c²  (km)
  iscoKm: number;      // ISCO radius = 3 r_s = 6GM/c²        (km)
  tIscoSec: number;    // coordinate orbital period at the ISCO (s)
  diskPeakK: number;   // characteristic inner-disk temperature, ~Eddington (K)
  hawkingK: number;    // Hawking temperature T_H (K)
  entropyKB: number;   // Bekenstein–Hawking entropy S/k_B (dimensionless)
  evapYears: number;   // evaporation time (years)
};

export function bhFacts(mSolar: number): BHFacts {
  const M = mSolar * M_SUN;                       // kg
  const rs = (2 * G * M) / (C * C);               // m
  const isco = 3 * rs;                            // m  (= 6GM/c²)
  // Schwarzschild coordinate orbital period at radius r: T = 2π √(r³/GM).
  const tIsco = 2 * Math.PI * Math.sqrt(isco ** 3 / (G * M));
  // Multicolour-disk peak (inner) temperature at ~Eddington accretion.
  const diskPeak = 2.0e7 * Math.pow(mSolar, -0.25);
  // Hawking temperature: T_H = ħc³ / (8π G M k_B).
  const hawking = (HBAR * C ** 3) / (8 * Math.PI * G * M * KB);
  // Bekenstein–Hawking entropy: S/k_B = 4π G M² / (ħ c).
  const entropy = (4 * Math.PI * G * M * M) / (HBAR * C);
  // Evaporation time (pure Hawking, no infall): t ≈ 2.1×10⁶⁷ yr · (M/M☉)³.
  const evap = 2.1e67 * Math.pow(mSolar, 3);
  return {
    rsKm: rs / 1000,
    iscoKm: isco / 1000,
    tIscoSec: tIsco,
    diskPeakK: diskPeak,
    hawkingK: hawking,
    entropyKB: entropy,
    evapYears: evap,
  };
}

// Map the mass to the disk's *colour* temperature for the renderer (shader
// range ≈ 3000–30000 K). This is a trend, not the literal peak temperature
// (which is far hotter): low-mass holes have hot, X-ray/UV disks → blue-white;
// supermassive holes have cooler UV/optical disks → warmer colour. Linear in
// log₁₀(M/M☉) from 0 (≈30000 K, blue-white) to 9 (≈5500 K, orange).
export function diskColorTempForMass(mSolar: number): number {
  const f = Math.min(1, Math.max(0, Math.log10(Math.max(mSolar, 1)) / 9));
  return Math.round(30000 + (5500 - 30000) * f);
}
