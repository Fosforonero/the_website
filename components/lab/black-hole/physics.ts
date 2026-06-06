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

// ---------------------------------------------------------------------------
// Page–Thorne (1974) relativistic thin-disk radiative flux for a Schwarzschild
// (a = 0) hole, computed exactly via the orbit-averaged integral rather than
// the Newtonian (1 − √(r_in/r)) approximation. For circular Schwarzschild
// geodesics (units M = 1): Ω = X^(−3/2), E = (1−2/X)/√(1−3/X),
// L = √X/√(1−3/X), and conveniently (E − ΩL)² = 1 − 3/X. The flux is
//   F(r) = −(Ṁ)/(4π√g)·(Ω_,r /(E−ΩL)²)·∫_{6}^{X}(E−ΩL) L_,r dX'
// with √g = r = X. We bake a normalised lookup over the renderer's disk radius
// rd (r_s = 1, so r/M = 2·rd) and the shader samples it. Source: Page & Thorne
// 1974, ApJ 191, 499; Novikov & Thorne 1973.
// ---------------------------------------------------------------------------

export const DISK_FLUX_LUT_N = 96;
export const DISK_FLUX_RD_MIN = 3.0;   // ISCO (r_s units)
export const DISK_FLUX_RD_MAX = 30.0;  // beyond the largest disk radius

function ptFluxAtX(X: number): number {
  if (X <= 6.0) return 0.0; // inside the ISCO: no stable disk
  const Lz = (x: number) => Math.sqrt(x) / Math.sqrt(1 - 3 / x);
  const integrand = (x: number) => {
    const dx = 1e-5 * x;
    const dL = (Lz(x + dx) - Lz(x - dx)) / (2 * dx);
    return Math.sqrt(1 - 3 / x) * dL; // (E−ΩL)·L_,r , with (E−ΩL)=√(1−3/X)
  };
  const n = 240, x0 = 6.0, hh = (X - x0) / n;
  let I = 0;
  for (let i = 0; i <= n; i++) {
    const xx = x0 + i * hh;
    const w = i === 0 || i === n ? 0.5 : 1.0; // trapezoidal
    I += w * integrand(xx);
  }
  I *= hh;
  // F = (3/2)/(4π X^{7/2}(1−3/X))·I   [from Ω_,r = −(3/2)X^{−5/2}, √g = X]
  return (1.5 / (4 * Math.PI * Math.pow(X, 3.5) * (1 - 3 / X))) * I;
}

export function buildDiskFluxLUT(): number[] {
  // peak of the Newtonian profile, to keep the overall brightness scale
  let oldPeak = 0;
  for (let rd = 3.001; rd < 30; rd += 0.02) {
    const f = Math.pow(3 / rd, 3) * Math.max(1 - Math.sqrt(3 / rd), 0);
    if (f > oldPeak) oldPeak = f;
  }
  const pt: number[] = [];
  let ptPeak = 0;
  for (let i = 0; i < DISK_FLUX_LUT_N; i++) {
    const rd = DISK_FLUX_RD_MIN + (DISK_FLUX_RD_MAX - DISK_FLUX_RD_MIN) * (i / (DISK_FLUX_LUT_N - 1));
    const F = Math.max(ptFluxAtX(2 * rd), 0); // r/M = 2·rd
    pt.push(F);
    if (F > ptPeak) ptPeak = F;
  }
  const scale = ptPeak > 0 ? oldPeak / ptPeak : 1;
  return pt.map((F) => F * scale);
}

export const DISK_FLUX_LUT = buildDiskFluxLUT();

// Map the mass to the disk's *colour* temperature for the renderer (shader
// range ≈ 3000–30000 K). This is a trend, not the literal peak temperature
// (which is far hotter): low-mass holes have hot, X-ray/UV disks → blue-white;
// supermassive holes have cooler UV/optical disks → warmer colour. Linear in
// log₁₀(M/M☉) from 0 (≈30000 K, blue-white) to 9 (≈5500 K, orange).
export function diskColorTempForMass(mSolar: number): number {
  const f = Math.min(1, Math.max(0, Math.log10(Math.max(mSolar, 1)) / 9));
  return Math.round(30000 + (5500 - 30000) * f);
}
