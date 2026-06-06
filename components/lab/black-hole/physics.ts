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
// Page–Thorne (1974) relativistic thin-disk radiative flux for the EXACT KERR
// metric (Bardeen 1972 equatorial circular orbits), not just a = 0. For
// prograde circular orbits (units M = 1, x = r/M):
//   Ω = 1/(x^{3/2}+a),
//   E = (x^{3/2}−2x^{1/2}+a)/D,  L = (x²−2a x^{1/2}+a²)/D,
//   D = x^{3/4}·√(x^{3/2}−3x^{1/2}+2a),
// and the orbit-averaged flux
//   F(r) = −Ω_,r /(4π (E−ΩL)² √g) · ∫_{r_isco}^{r}(E−ΩL) L_,r dx'   (√g = x).
// At a = 0 this reduces analytically to the Schwarzschild profile
// ((E−ΩL)=√(1−3/X), Ω_,r=−3/2·X^{−5/2}) and numerically reproduces it to ~1e-10.
//
// We bake a 2-D lookup F(rd, a): NR radial samples per spin × NA spin rows, each
// row spanning rd ∈ [r_isco(a), 30] (r_s units, r/M = 2·rd) and NORMALISED to a
// common peak. So the *radial shape* (the physics — where the disk emits, how
// the hot region tightens toward the smaller ISCO as the hole spins up) varies
// with spin, while the absolute luminosity stays the artistic accretion-rate
// control (the true a→1 efficiency soars from 6% to 42%, ~100× peak flux, which
// would simply clip to white). The a = 0 row is byte-for-byte the previous
// Schwarzschild LUT. The shader bilinearly samples this field. Sources: Page &
// Thorne 1974, ApJ 191, 499; Bardeen 1972; Novikov & Thorne 1973.
// ---------------------------------------------------------------------------

export const DISK_FLUX_N = 96;         // radial samples in the profile
export const DISK_FLUX_RD_MAX = 30.0;  // outer radial extent of the LUT (r_s)

// Reference peak = the Newtonian profile peak, so the a = 0 profile reproduces
// the original Schwarzschild LUT exactly (overall brightness scale unchanged).
const FLUX_REF_PEAK = (() => {
  let p = 0;
  for (let rd = 3.001; rd < 30; rd += 0.02) {
    const f = Math.pow(3 / rd, 3) * Math.max(1 - Math.sqrt(3 / rd), 0);
    if (f > p) p = f;
  }
  return p;
})();

// Prograde equatorial circular-orbit quantities (M = 1, x = r/M).
function kerrCirc(x: number, a: number): { E: number; L: number; Om: number } {
  const sx = Math.sqrt(x);
  const D = Math.pow(x, 0.75) * Math.sqrt(Math.pow(x, 1.5) - 3 * sx + 2 * a);
  return {
    E: (Math.pow(x, 1.5) - 2 * sx + a) / D,
    L: (x * x - 2 * a * sx + a * a) / D,
    Om: 1 / (Math.pow(x, 1.5) + a),
  };
}

// Prograde ISCO radius (Bardeen 1972), returned in r/M.
function kerrISCOx(a: number): number {
  const Z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
  return 3 + Z2 - Math.sqrt(Math.max((3 - Z1) * (3 + Z1 + 2 * Z2), 0));
}

// Orbit-averaged Page–Thorne flux at x = r/M for spin a, inner edge xIsco.
function ptFluxKerrAtX(x: number, a: number, xIsco: number): number {
  if (x <= xIsco) return 0.0;
  const EmoL = (xx: number) => { const c = kerrCirc(xx, a); return c.E - c.Om * c.L; };
  const Lz = (xx: number) => kerrCirc(xx, a).L;
  const Om = (xx: number) => kerrCirc(xx, a).Om;
  const integrand = (xx: number) => {
    const dx = 1e-5 * xx;
    return (EmoL(xx) * (Lz(xx + dx) - Lz(xx - dx))) / (2 * dx); // (E−ΩL)·L_,r
  };
  const n = 240, hh = (x - xIsco) / n;
  let I = 0;
  for (let i = 0; i <= n; i++) {
    const xx = xIsco + i * hh;
    const w = i === 0 || i === n ? 0.5 : 1.0; // trapezoidal
    I += w * integrand(xx);
  }
  I *= hh;
  const dx = 1e-5 * x;
  const dOmdx = (Om(x + dx) - Om(x - dx)) / (2 * dx);
  const emol = EmoL(x);
  return (-dOmdx / (4 * Math.PI * emol * emol * x)) * I;
}

// Exact Kerr Page–Thorne radial flux profile for a given spin (uSpin = a/M ∈
// [0,1)), as DISK_FLUX_N samples over rd ∈ [ISCO(spin), 30] (r_s units),
// normalised to the common reference peak (the radial SHAPE varies with spin;
// the absolute luminosity stays the artistic accretion control). Recomputed on
// the CPU whenever the spin slider changes and uploaded as a plain float-array
// uniform — NO float texture, so it works on every WebGL2 device. The shader
// samples it over the normalised radius (rd − rIn)/(30 − rIn).
export function kerrFluxProfile(uSpin: number): number[] {
  const a = Math.min(Math.max(uSpin, 0), 0.999); // a/M
  const xIsco = kerrISCOx(a);
  const rdIsco = xIsco / 2; // r_s units
  const row: number[] = [];
  let peak = 0;
  for (let j = 0; j < DISK_FLUX_N; j++) {
    const rd = rdIsco + (DISK_FLUX_RD_MAX - rdIsco) * (j / (DISK_FLUX_N - 1));
    const F = Math.max(ptFluxKerrAtX(2 * rd, a, xIsco), 0); // r/M = 2·rd
    row.push(F);
    if (F > peak) peak = F;
  }
  const s = peak > 0 ? FLUX_REF_PEAK / peak : 0;
  return row.map((F) => F * s);
}

// Default (a = 0) profile for the initial uniform value.
export const DISK_FLUX_LUT = kerrFluxProfile(0);

// Map the mass to the disk's *colour* temperature for the renderer (shader
// range ≈ 3000–30000 K). This is a trend, not the literal peak temperature
// (which is far hotter): low-mass holes have hot, X-ray/UV disks → blue-white;
// supermassive holes have cooler UV/optical disks → warmer colour. Linear in
// log₁₀(M/M☉) from 0 (≈30000 K, blue-white) to 9 (≈5500 K, orange).
export function diskColorTempForMass(mSolar: number): number {
  const f = Math.min(1, Math.max(0, Math.log10(Math.max(mSolar, 1)) / 9));
  return Math.round(30000 + (5500 - 30000) * f);
}
