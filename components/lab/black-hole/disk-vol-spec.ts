// ---------------------------------------------------------------------------
// Volumetric ("Vol disk") accretion-disk spec — single source of truth shared
// between the GLSL raymarcher (black-hole-shader.ts, WebGL) and the WGSL one
// (black-hole-wgsl.ts, WebGPU). Both interpolate these values into their
// shader source via template literals so the two can no longer drift apart
// silently (they previously had a ~48× emission-chain gap and independently
// re-derived clamp ranges — see docs/black-hole-roadmap.md).
//
// These are the visually/physically meaningful knobs for the slim-disk volume:
// vertical structure, radial taper, emission gain and optical depth. The
// vertical profile is a CALIBRATED Gaussian, not a self-consistent hydrostatic
// solution — horClampMin/Max saturates H/r across almost the entire visible
// disk (see docs/black-hole-roadmap.md §0.7), so this reads as a
// near-constant-aspect-ratio thin disk in practice, a deliberate visual proxy
// rather than a varying thermal profile. Both shaders still each compute their
// own flux/temperature/Doppler physics inline (that part was already identical
// and needs no sharing) — this module only unifies the numbers that were tuned
// by eye.
// ---------------------------------------------------------------------------

export const VOL_DISK_SPEC = {
  // Base aspect-ratio coefficient feeding H/r = thickCoef * sqrt((flux^0.25) * r)
  // (before the clamp below). This is the JS-side default for the uVolThick /
  // vol_thick uniform in both renderers — GLSL defaulted this uniform to 0.03,
  // WGSL to 0.1 while also multiplying the clamped result by an extra 0.22
  // inside the shader; both ad-hoc fudges are gone, this is the one number.
  thickCoef: 0.03,

  // H/r = horCoefBase * sqrt((flux^0.25) * r), clamped to [horClampMin, horClampMax].
  // Loosening the ceiling balloons the slab into a fat torus that, seen
  // edge-on, blooms into diffuse haze — verified visually, don't raise this
  // without a fresh screenshot pass across all three framings.
  //
  // EXPLICIT INTERPRETATION (2026-07-10): with thickCoef=0.03, the pre-clamp
  // H/r exceeds horClampMax for every radius beyond roughly the inner 10% of
  // the disk (rho ≳ 1.1·rIn) — i.e. this ceiling is not an edge case, it is
  // the value actually rendered across almost the whole visible disk. Chosen
  // reading: a THIN DISK AT A NEAR-CONSTANT ASPECT RATIO, used as a visual
  // proxy — not an attempt at a genuinely varying thermal/flared profile. If
  // a real flare is wanted later, horClampMax has to move (and be re-verified
  // against the torus/haze failure mode above) — do not raise it just to make
  // the flare read more strongly with the current visual target unchanged.
  horClampMin: 0.012,
  horClampMax: 0.035,

  // Vertical Gaussian integration half-width, in scale heights (|z/H|). Below
  // this the density contribution is negligible; both shaders now integrate
  // the same extent instead of GLSL's 2.2σ vs WGSL's previous 1.5σ.
  zClampSigma: 2.0,

  // Radial taper: full density out to taperInner*outer, cubic falloff to ~0
  // by taperOuter*outer. Keeps the outer disk from reading as a diffuse halo
  // past its physical edge.
  taperInner: 0.60,
  taperOuter: 0.95,

  // Emission gain: converts blackbody(Tobs) * (Tobs/Tdisk)^4 * density *
  // turbulence into on-screen brightness (before uDiskBright/disk_bright and
  // exposure). WGSL was previously missing the (Tobs/Tdisk)^4 term entirely,
  // which is the main reason its volumetric disk didn't brighten toward the
  // core or beam with Doppler — that term is now restored in both.
  emissionGain: 1.5,

  // Optical depth per unit path length at reference density: dtau = opacity *
  // density * ds. Governs self-occlusion / limb darkening. GLSL's old 0.9 and
  // WGSL's old 0.08 were each untested guesses (~11x apart, no comment on
  // either side) — this is a recalibrated shared value, not an average.
  opacity: 0.15,

  // --- Ray-step refinement inside the disk slab -----------------------------
  // The far-field dt (up to 0.9, see the raymarch loop) can cross the whole
  // vertical Gaussian in a single step, rendering the volume as discrete
  // horizontal slabs. These four constants govern the finer stepping used
  // once a ray enters the slab; each is picked from whichever renderer's
  // value actually satisfies the "≳4 samples per scale height" target
  // (verified below), not averaged from the two prior independent guesses.

  // Refinement trigger: start the fine step once |y| < refineVerticalMult *
  // Hh (a world-space half-thickness). GLSL used 3.0, WGSL used 2.0 (exactly
  // the zClampSigma cutoff, zero margin). 3.0 gives a safety margin so the
  // coarse→fine step transition doesn't land right on the density falloff
  // edge, which would show as a faint ring artifact.
  refineVerticalMult: 3.0,

  // dt = max(refineStepFloor, refineStepFactor * Hh / max(|dir.y|, refineSlopeFloor))
  // At a vertical ray (|dir.y|=1) this gives samples-per-scale-height =
  // 1/refineStepFactor. GLSL's old 0.45 → ~2.2 samples/H (visibly banded);
  // WGSL's old 0.22 → ~4.5 samples/H (matches the documented target) — kept.
  refineStepFactor: 0.22,

  // Lower bound on dt itself (a performance floor, not a quality target):
  // WGSL's slightly higher 0.03 vs GLSL's 0.025 — kept WGSL's as the shared
  // value since it was tuned alongside refineStepFactor above.
  refineStepFloor: 0.03,

  // Floor on |dir.y| in the dt denominator: for near-grazing (edge-on) rays,
  // a larger floor means a SMALLER (finer) fixed step, which is exactly where
  // self-occlusion and thin-slab structure are hardest to resolve. WGSL's
  // 0.15 refines edge-on rays more than GLSL's old 0.12 — kept.
  refineSlopeFloor: 0.15,
} as const;

// Both GLSL and WGSL require float literals to carry a decimal point (a bare
// `2` is an int/abstract-int and can fail to compile against a float
// comparison) — JS's number→string coercion drops the trailing ".0" for
// whole numbers, so every interpolation site must go through this formatter
// rather than a raw `${VOL_DISK_SPEC.x}` template hole.
export function vf(n: number): string {
  return Number.isInteger(n) ? `${n}.0` : `${n}`;
}
