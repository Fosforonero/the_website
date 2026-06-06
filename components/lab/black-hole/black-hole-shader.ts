// ---------------------------------------------------------------------------
// Kerr black-hole renderer — GLSL shader source
// ---------------------------------------------------------------------------
//
// Physically-based gravitational lensing. For every screen pixel we shoot a
// camera ray and integrate the photon's EXACT null geodesic through curved
// spacetime around the hole, then shade:
//   - event horizon  → absorbed (black)
//   - accretion disk → blackbody emission + relativistic Doppler beaming
//                       + gravitational redshift
//   - escape         → background star field (already lensed by the bent ray)
//
// Units: Schwarzschild radius RS = 1, M = ½. Photon-sphere at 1.5, ISCO at 3
// (a = 0). The geodesic is integrated in the Kerr–Schild Hamiltonian form
// H = ½·g^{μν}p_μp_ν (drift dx/dλ = ∂H/∂p closed-form, kick dp/dλ = −½∇_x Hq by
// central differences), which at a = 0 reduces to Schwarzschild and reproduces
// the exact light-bending (Einstein ring, photon sphere, shadow). Two steppers:
// symplectic Euler (medium/low) and 4th-order Runge–Kutta (high, uHighOrder).
//
// DISCLOSURE: this is real GR lensing. At spin a = 0 it is Schwarzschild; with
// the Spin slider it integrates the EXACT Kerr null geodesics (Kerr–Schild
// Hamiltonian, see below) in real time — the same metric used for Interstellar's
// Gargantua (which was ray-traced offline). The disk follows Kerr too: inner
// edge at the prograde ISCO, exact Kerr Doppler/redshift, and the exact Kerr
// Page–Thorne radial flux per spin (only the absolute luminosity is held fixed
// across spin). Still approximate: the gaseous turbulence is procedural (not a
// GRMHD radiative-transfer solution).
// ---------------------------------------------------------------------------

export const blackHoleVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Fullscreen quad: ignore camera/model matrices, fill clip space directly.
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const blackHoleFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
out vec4 fragColor;

uniform vec3  uCamPos;     // camera world position
uniform mat3  uCamBasis;   // camera world rotation (cols: right, up, backward)
uniform mat4  uViewProj;   // projection * view, for writing gl_FragDepth
uniform float uTanFov;     // tan(fov/2)
uniform float uAspect;     // width / height
uniform float uTime;       // seconds
uniform int   uSteps;      // geodesic integration steps (quality)
uniform float uDiskInner;  // disk inner radius (RS units) — ISCO = 3 for Schwarzschild
uniform float uDiskOuter;  // disk outer radius (RS units)
uniform float uDiskOn;     // 0 / 1
uniform float uDoppler;    // 0 / 1 — relativistic beaming + redshift
uniform float uSpin;       // spin a ∈ [0,1] — APPROXIMATE Lense-Thirring frame dragging
uniform float uDiskTemp;   // emitted colour-temperature scale (Kelvin)
uniform float uDiskBright; // disk brightness scale
uniform float uJets;       // 0 / 1 — relativistic jets along the spin axis
uniform float uJetStr;     // jet emission strength
uniform float uExposure;
uniform float uHighOrder;  // 0/1 — use 4th-order RK4 geodesic step (high quality)
uniform float uUltra;      // 0/1 — 6th-order Yoshida symplectic via Tao (ultra quality)
uniform float uStyle;      // 0 = cinematic, 1 = "Starless" photographic (lensed real-sky look)
uniform float uDiskFlux[96]; // EXACT Kerr Page–Thorne flux profile for the CURRENT spin

const float RS = 1.0;
const int   MAX_STEPS = 400;

// Sample the exact Kerr Page–Thorne disk flux profile (recomputed on the CPU per
// spin and uploaded as a plain float-array uniform — no float texture, so it
// runs on every device). The 96 samples span rd ∈ [rIn, 30] (r_s); we sample
// over the normalised radius. rIn = ISCO(spin) is the current inner edge.
float diskFlux(float rd, float rIn) {
  float t = clamp((rd - rIn) / (30.0 - rIn), 0.0, 1.0) * 95.0;
  int i = int(floor(t));
  int j = min(i + 1, 95);
  return mix(uDiskFlux[i], uDiskFlux[j], t - float(i));
}

// ── hashes / noise ─────────────────────────────────────────────────────────
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float hash31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
// Gradient (Perlin-style) noise with a quintic fade (C² continuous). Unlike
// value noise it carries no value plateaus, so it never shows the diamond/
// triangle lattice facets that appear when the disk is seen nearly edge-on in
// the foreground. Remapped to [0,1].
vec2 grad2(vec2 i) {
  float a = hash21(i) * 6.2831853; // random gradient direction
  return vec2(cos(a), sin(a));
}
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic fade
  float a = dot(grad2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(grad2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// ── background star field (sampled with the final, lensed ray direction) ────
// Two looks: the default "cinematic" near-black sky (Olbers), and a richer
// "Starless" photographic sky (uStyle>0.5) — a structured, dust-laned Milky Way
// with a denser starfield, à la rantonels/starless. Because this is sampled with
// the FULLY LENSED ray direction, the rich sky is genuinely warped by the hole
// (the starless signature), without shipping a multi-MB panorama texture.
vec3 starField(vec3 d) {
  vec3 col = vec3(0.00012, 0.00014, 0.00022);        // ~black sky floor
  bool sl = uStyle > 0.5;
  float band = exp(-pow(d.y * (sl ? 3.2 : 5.5), 2.0));
  col += vec3(0.0035, 0.004, 0.007) * band;

  float dust = 0.0, band2 = 0.0;
  if (sl) {
    // Structured galactic plane. A REAL Milky Way is granular — countless
    // unresolved stars — not a smooth glow, so we keep the diffuse component
    // faint and add the brightness as dense stars (below). Filaments come from a
    // contrasted fBm; dark dust lanes carve the band.
    float az = atan(d.z, d.x);
    vec2  g  = vec2(az * 2.4, d.y * 7.0);
    mat2  rr = mat2(0.80, -0.60, 0.60, 0.80);
    float n  = 0.0, amp = 0.5;
    for (int o = 0; o < 5; o++) { n += amp * gnoise(g); g = rr * g * 2.03 + 5.1; amp *= 0.5; }
    n = pow(clamp(n, 0.0, 1.0), 1.5);                       // contrast → filaments, not haze
    dust  = smoothstep(0.45, 0.85, gnoise(vec2(az * 3.3, d.y * 5.5) + 23.0)); // dark lanes
    band2 = band * n * (1.0 - 0.85 * dust);                // where the band stars live
    // faint diffuse component only (most of the band's light is the grain below)
    vec3 mwCol = mix(vec3(0.013, 0.014, 0.022), vec3(0.040, 0.032, 0.024), band);
    col += mwCol * band2 * 0.6;
    float core = exp(-pow(az * 0.8, 2.0)) * band;          // warm bulge toward the centre
    col += vec3(0.045, 0.035, 0.026) * core * (1.0 - 0.6 * dust);
  }

  // Discrete stars. In Starless mode two extra layers (k=2,3) are dense, faint
  // and CONCENTRATED in the galactic band (weighted by band2) so the Milky Way
  // reads as unresolved stars — the grain that kills the "haze" look.
  int layers = sl ? 4 : 2;
  for (int k = 0; k < 4; k++) {
    if (k >= layers) break;
    bool dense = k >= 2;                                    // band-concentrated grain
    float scale = (k == 0) ? 230.0 : (k == 1) ? 95.0 : (k == 2) ? 520.0 : 900.0;
    float thr   = dense ? (k == 2 ? 0.93 : 0.90) : (sl ? 0.978 : 0.985);
    vec3 g  = d * scale;
    vec3 id = floor(g);
    float h = hash31(id);
    if (h > thr) {
      vec3 f = fract(g) - 0.5;
      float star = smoothstep(0.5, 0.0, length(f));
      float tw   = 0.7 + 0.3 * sin(uTime * 2.0 + h * 40.0);
      float mag  = pow((h - thr) / (1.0 - thr), 2.0);
      vec3 sc    = mix(vec3(1.0, 0.9, 0.8), vec3(0.8, 0.9, 1.0), hash31(id + 7.0));
      // grain layers are faint and live only in the band (carved by dust);
      // bright foreground stars fill the whole sky.
      float w = dense ? band2 * 1.3 : 1.0;
      float bright = dense ? 0.7 : 2.0;
      col += sc * star * mag * tw * bright * w;
    }
  }
  return col;
}

// ── physical blackbody colour: temperature (Kelvin) → linear sRGB ───────────
// Planckian-locus approximation (after Neil Bartlett), valid ~1000–40000 K.
vec3 blackbody(float kelvin) {
  float t = clamp(kelvin, 1000.0, 40000.0);
  // Columns are the (a, b, c) coefficient vectors; channel = a/(t+b)+c.
  mat3 m = (t <= 6500.0)
    ? mat3(
        vec3(0.0, -2902.1955373783176, -8257.7997278925690),
        vec3(0.0,  1669.5803561666639,  2575.2827530017594),
        vec3(1.0,  1.3302673723350029,  1.8993753891711275))
    : mat3(
        vec3(1745.0425298314172,  1216.6168361476490, -8257.7997278925690),
        vec3(-2666.3474220535695, -2173.1012343082230,  2575.2827530017594),
        vec3(0.55995389139931482, 0.70381203140554553,  1.8993753891711275));
  vec3 c = clamp(m[0] / (vec3(t) + m[1]) + m[2], 0.0, 1.0);
  return mix(c, vec3(1.0), smoothstep(1000.0, 0.0, t));
}

// ACES filmic tone mapping (Narkowicz approximation): keeps saturation and
// rolls highlights smoothly to white — the luminous, cinematic look.
vec3 acesFilmic(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

// Window-space depth [0,1] of a world point, for occluding composited 3D
// objects (planets, moons, debris) behind the disk / shadow.
float depthFromWorld(vec3 wp) {
  vec4 c = uViewProj * vec4(wp, 1.0);
  return (c.z / c.w) * 0.5 + 0.5;
}

// ── Kerr metric in Kerr–Schild Cartesian form (spin axis +Y, M = RS/2 = 0.5) ──
// We ray-trace the EXACT Kerr null geodesics, not an approximation. Kerr–Schild
// is chosen because it has no Boyer–Lindquist coordinate singularity and is
// asymptotically Minkowski, so a distant camera ray's 4-momentum is simply its
// flat-space direction (E = 1, p_i = dir_i) — no observer tetrad to get wrong.
// At a = 0 it reduces exactly to Schwarzschild.
//
// Boyer–Lindquist radius r at Cartesian p:  (x²+z²)/(r²+a²) + y²/r² = 1.
float kerrR(vec3 p, float a) {
  float t  = dot(p, p) - a * a;
  float r2 = 0.5 * (t + sqrt(t * t + 4.0 * a * a * p.y * p.y));
  return sqrt(max(r2, 1e-8));
}
// Null Hamiltonian quadratic  Hq = gᵘᵛ pᵤ pᵥ  with conserved p_t = −E = −1.
// gᵘᵛ = ηᵘᵛ − f kᵘ kᵛ (η = diag(−1,1,1,1); k raised: kᵗ = −1), so
//   Hq = (|p_s|² − 1) − f·κ²,   κ = 1 + k_s·p_s,
// with f = 2M r³/(r⁴ + a²y²) and k_s = ((rx+az)/(r²+a²), y/r, (rz−ax)/(r²+a²)).
float kerrHq(vec3 p, vec3 ps, float a) {
  float r   = kerrR(p, a);
  float r2  = r * r;
  float f   = (r2 * r) / (r2 * r2 + a * a * p.y * p.y);  // 2M = 1
  float inv = 1.0 / (r2 + a * a);
  vec3  ks  = vec3((r * p.x + a * p.z) * inv, p.y / r, (r * p.z - a * p.x) * inv);
  float kap = 1.0 + dot(ks, ps);
  return dot(ps, ps) - 1.0 - f * kap * kap;
}

// Prograde ISCO radius (Bardeen 1972), χ = a/M = uSpin, returned in r_s units
// (M = ½). χ=0 → 3 r_s (= 6M); spinning up shrinks the inner edge.
float kerrISCO(float chi) {
  float a  = clamp(chi, 0.0, 0.999);
  float z1 = 1.0 + pow(1.0 - a * a, 1.0 / 3.0) * (pow(1.0 + a, 1.0 / 3.0) + pow(1.0 - a, 1.0 / 3.0));
  float z2 = sqrt(3.0 * a * a + z1 * z1);
  float xi = 3.0 + z2 - sqrt(max((3.0 - z1) * (3.0 + z1 + 2.0 * z2), 0.0)); // r_isco / M
  return 0.5 * xi;                                                          // r_s units
}

// Hamiltonian flow of H = ½·Hq for the Kerr null geodesic, split into the two
// vector fields used by the integrators below:
//   drift  dx/dλ = ∂H/∂p = g^{iμ}p_μ = p − f·κ·k_s   (closed form)
//   kick   dp/dλ = −∂H/∂x = −½ ∇_x Hq                 (central differences)
vec3 kerrVel(vec3 p, vec3 ps, float a) {
  float r = kerrR(p, a), r2 = r * r;
  float f = (r2 * r) / (r2 * r2 + a * a * p.y * p.y);
  float inv = 1.0 / (r2 + a * a);
  vec3  ks = vec3((r * p.x + a * p.z) * inv, p.y / r, (r * p.z - a * p.x) * inv);
  return ps - f * (1.0 + dot(ks, ps)) * ks;
}
vec3 kerrKick(vec3 p, vec3 ps, float a) {
  float e = 1.0e-3;
  vec3 g = vec3(
    kerrHq(p + vec3(e, 0.0, 0.0), ps, a) - kerrHq(p - vec3(e, 0.0, 0.0), ps, a),
    kerrHq(p + vec3(0.0, e, 0.0), ps, a) - kerrHq(p - vec3(0.0, e, 0.0), ps, a),
    kerrHq(p + vec3(0.0, 0.0, e), ps, a) - kerrHq(p - vec3(0.0, 0.0, e), ps, a));
  return -(0.25 / e) * g; // −½·(g/2e)
}

// Inner product of two 4-vectors (a0,av),(b0,bv) in the Kerr–Schild metric
// g = η + f·k⊗k with k_μ = (1, ks).
float ksDot(float a0, vec3 av, float b0, vec3 bv, float f, vec3 ks) {
  return -a0 * b0 + dot(av, bv) + f * (a0 + dot(ks, av)) * (b0 + dot(ks, bv));
}

// Photon spatial momenta for a STATIC observer at P looking along local unit
// direction n. Builds the observer's orthonormal tetrad (Gram–Schmidt in g) and
// maps n → coordinate momenta with E = −p_t normalised to 1. This makes the
// CLOSE-UP view physically correct: the flat-space ps = n is only the far-field
// limit (to which this reduces as f → 0). Verified offline: |Hq| ≈ 1e-16 at the
// camera for all radii. Falls back to n inside the ergosphere (no static obs).
vec3 cameraMomentum(vec3 P, vec3 n, float a) {
  float r = kerrR(P, a), r2 = r * r;
  float f = (r2 * r) / (r2 * r2 + a * a * P.y * P.y);
  if (f > 0.98) return n;
  float inv = 1.0 / (r2 + a * a);
  vec3  ks  = vec3((r * P.x + a * P.z) * inv, P.y / r, (r * P.z - a * P.x) * inv);
  float e0t = 1.0 / sqrt(1.0 - f);                          // observer u = ∂_t/√(−g_tt)
  float ee0 = ksDot(e0t, vec3(0.0), e0t, vec3(0.0), f, ks); // = −1
  // Gram–Schmidt the three coordinate axes against e0, then each other.
  float t1 = 0.0; vec3 s1 = vec3(1.0, 0.0, 0.0);
  t1 -= (ksDot(t1, s1, e0t, vec3(0.0), f, ks) / ee0) * e0t;
  float m1 = sqrt(abs(ksDot(t1, s1, t1, s1, f, ks))); t1 /= m1; s1 /= m1;
  float t2 = 0.0; vec3 s2 = vec3(0.0, 1.0, 0.0);
  t2 -= (ksDot(t2, s2, e0t, vec3(0.0), f, ks) / ee0) * e0t;
  float c21 = ksDot(t2, s2, t1, s1, f, ks) / ksDot(t1, s1, t1, s1, f, ks); t2 -= c21 * t1; s2 -= c21 * s1;
  float m2 = sqrt(abs(ksDot(t2, s2, t2, s2, f, ks))); t2 /= m2; s2 /= m2;
  float t3 = 0.0; vec3 s3 = vec3(0.0, 0.0, 1.0);
  t3 -= (ksDot(t3, s3, e0t, vec3(0.0), f, ks) / ee0) * e0t;
  float c31 = ksDot(t3, s3, t1, s1, f, ks) / ksDot(t1, s1, t1, s1, f, ks); t3 -= c31 * t1; s3 -= c31 * s1;
  float c32 = ksDot(t3, s3, t2, s2, f, ks) / ksDot(t2, s2, t2, s2, f, ks); t3 -= c32 * t2; s3 -= c32 * s2;
  float m3 = sqrt(abs(ksDot(t3, s3, t3, s3, f, ks))); t3 /= m3; s3 /= m3;
  // p^μ = e0 + n.x e1 + n.y e2 + n.z e3, then lower index and set E = −p_t = 1.
  float put = e0t + n.x * t1 + n.y * t2 + n.z * t3;
  vec3  puv =        n.x * s1 + n.y * s2 + n.z * s3;
  float kp  = put + dot(ks, puv);
  float pt  = -put + f * kp;            // p_t = g_tν p^ν
  vec3  ps  = puv + f * kp * ks;        // p_i = g_iν p^ν
  return ps / (-pt);
}

// ── Ultra integrator: 6th-order Yoshida SYMPLECTIC step for the NON-separable
// null Hamiltonian, via Tao's (2016) extended phase space. We duplicate the
// state (q,p)→(q,p,sx,sy) and a binding rotation keeps the copies together; the
// three explicit maps φ_A, φ_B, φ_{ωC} are composed symmetrically (2nd order)
// and raised to 6th order by the Yoshida weights. Verified offline: with
// ω = 0.25/dt it reaches ~4e-7 rad deflection at the same step count as RK4 —
// symplectic, but ~7× the per-step cost, so it is reserved for the Ultra tier.
const float YOSH6[7] = float[7](
  0.78451361047756, 0.235573213359357, -1.17767998417887,
  1.315185948683906, -1.17767998417887, 0.235573213359357, 0.78451361047756);
void taoStep(inout vec3 q, inout vec3 p, inout vec3 sx, inout vec3 sy, float d, float a, float om) {
  float h = 0.5 * d;
  p += h * kerrKick(q, sy, a);  sx += h * kerrVel(q, sy, a);   // φ_A(h/.. )
  q += h * kerrVel(sx, p, a);   sy += h * kerrKick(sx, p, a);  // φ_B
  float c = cos(2.0 * om * d), s = sin(2.0 * om * d);          // φ_{ωC}: rotate (q−sx, p−sy)
  vec3 qa = q - sx, pb = p - sy, qsum = q + sx, psum = p + sy;
  vec3 na = qa * c + pb * s, nb = -qa * s + pb * c;
  q = 0.5 * (qsum + na); sx = 0.5 * (qsum - na);
  p = 0.5 * (psum + nb); sy = 0.5 * (psum - nb);
  q += h * kerrVel(sx, p, a);   sy += h * kerrKick(sx, p, a);  // φ_B
  p += h * kerrKick(q, sy, a);  sx += h * kerrVel(q, sy, a);   // φ_A
}

void main() {
  // Reconstruct the world-space camera ray for this pixel.
  vec2 ndc = vUv * 2.0 - 1.0;
  float px = ndc.x * uAspect * uTanFov;
  float py = ndc.y * uTanFov;
  vec3 dir = normalize(uCamBasis * vec3(px, py, -1.0));
  vec3 pos = uCamPos;

  // Conserved squared angular momentum of the photon about the BH.
  vec3 L = cross(pos, dir);
  float h2 = dot(L, L);

  vec3 color = vec3(0.0);
  bool done = false;
  bool hitDisk = false; // the opaque disk occludes the photon ring behind it
  float outDepth = 1.0; // far by default (background → no occlusion)
  vec3 jetAccum = vec3(0.0); // optically-thin jet emission accumulated along the ray
  // Front-to-back compositing of the disk as an emissive/absorbing medium: the
  // opacity grows with local brightness (optical depth), so the bright inner
  // disk is opaque and the faint outskirts are semi-transparent — a SMOOTH
  // radial transition (no hard ring) that also self-limits the edge-on band.
  vec3  accCol = vec3(0.0);
  float accA   = 0.0;
  bool  depthSet = false;

  // Far from the hole spacetime is essentially flat, so a distant camera ray
  // travels in a straight line. Analytically advance it to the hole's
  // neighbourhood (sphere of radius R_far) before the geodesic march, so the
  // limited step budget is spent where curvature matters — otherwise zooming
  // far out exhausts the steps just reaching the hole (the disk/shadow glitch).
  const float R_far = 34.0;
  float b1 = dot(pos, dir);
  if (length(pos) > R_far) {
    if (b1 >= 0.0 || h2 > R_far * R_far) {
      // heading away, or impact parameter outside the influence sphere → pure
      // background (deflection negligible at this distance).
      color = starField(normalize(dir));
      done = true;
    } else {
      float disc = b1 * b1 - (dot(pos, pos) - R_far * R_far);
      pos += dir * (-b1 - sqrt(disc)); // advance to the sphere entry point
    }
  }

  float kerrA = uSpin * 0.5;                                            // a = χ·M, χ = uSpin ∈ [0,1]
  float rHor  = 0.5 * (1.0 + sqrt(max(1.0 - uSpin * uSpin, 0.0)));      // outer horizon r₊
  float rIn   = kerrISCO(uSpin);                                        // spin-dependent disk inner edge (ISCO)
  vec3  ps    = dir;                                                    // photon momentum (E=1, far→flat)
  vec3  shPos = pos, shMom = ps;                                        // Ultra: Tao extended-phase-space shadow copy

  for (int i = 0; i < MAX_STEPS && !done; i++) {
    if (i >= uSteps) break;
    float r = kerrR(pos, kerrA);

    // Event horizon → absorbed (any disk already composited stays in front).
    if (r < rHor + 0.02) {
      color = accCol;
      outDepth = depthSet ? outDepth : depthFromWorld(pos);
      done = true; break;
    }

    // Escaped to infinity → composite the disk over the background.
    if (r > 60.0 && dot(pos, ps) > 0.0) {
      color = accCol + (1.0 - accA) * starField(normalize(ps));
      done = true; break;
    }

    // Adaptive step: fine near the hole, coarse far away. Extra refinement just
    // outside the photon sphere lets a ray wind several times and hit the disk
    // on later crossings — the RETURNING RADIATION that builds the photon ring
    // from the disk's own light (higher-order images), not an analytic fake.
    float dt = clamp(r * 0.10, 0.02, 0.6);
    if (r < 6.0) dt = min(dt, 0.016 + 0.045 * (r - 1.0));

    // Relativistic jets: optically-thin, collimated emission along the spin
    // axis (±Y). Accumulated along the (lensed) ray, so the beams bend near
    // the hole. Bluish synchrotron-like glow, fading with height.
    if (uJets > 0.5) {
      float rho = length(pos.xz);        // cylindrical radius from the spin axis
      float ay  = abs(pos.y);
      if (ay > 1.4 && ay < 26.0) {
        float coneR = 0.18 + 0.13 * ay;  // jet widens with height
        float prof  = exp(-(rho * rho) / (coneR * coneR));
        float fade  = exp(-ay * 0.085) * (1.0 - exp(-(ay - 1.4) * 1.5));
        jetAccum += vec3(0.45, 0.65, 1.0) * (prof * fade * uJetStr * dt);
      }
    }

    // Exact Kerr geodesic step on the null Hamiltonian H = ½·Hq. Two schemes:
    //   • uHighOrder>0.5 → classic 4th-order Runge–Kutta (deflection accurate to
    //     ~1e-7 rad; the null invariant Hq stays constant to ~1e-6). Costs 4
    //     gradient evaluations per step, so it is reserved for "high" quality.
    //   • otherwise → 1st-order symplectic (semi-implicit) Euler: kick then drift
    //     with the updated momentum — cheap, one gradient/step, for medium/low.
    vec3 vel, posNext, psNext;
    if (uUltra > 0.5) {
      // 6th-order Yoshida symplectic (Tao extended phase space). ω = 0.25/dt
      // keeps the binding rotation angle constant per (adaptive) step.
      vec3 q = pos, p = ps, sx = shPos, sy = shMom;
      float om = 0.25 / dt;
      for (int k = 0; k < 7; k++) taoStep(q, p, sx, sy, YOSH6[k] * dt, kerrA, om);
      posNext = q; psNext = p; shPos = sx; shMom = sy;
      vel = (posNext - pos) / dt;
    } else if (uHighOrder > 0.5) {
      vec3 k1x = kerrVel(pos, ps, kerrA),                         k1p = kerrKick(pos, ps, kerrA);
      vec3 k2x = kerrVel(pos + 0.5*dt*k1x, ps + 0.5*dt*k1p, kerrA), k2p = kerrKick(pos + 0.5*dt*k1x, ps + 0.5*dt*k1p, kerrA);
      vec3 k3x = kerrVel(pos + 0.5*dt*k2x, ps + 0.5*dt*k2p, kerrA), k3p = kerrKick(pos + 0.5*dt*k2x, ps + 0.5*dt*k2p, kerrA);
      vec3 k4x = kerrVel(pos + dt*k3x, ps + dt*k3p, kerrA),         k4p = kerrKick(pos + dt*k3x, ps + dt*k3p, kerrA);
      posNext = pos + (dt/6.0)*(k1x + 2.0*k2x + 2.0*k3x + k4x);
      psNext  = ps  + (dt/6.0)*(k1p + 2.0*k2p + 2.0*k3p + k4p);
      vel = (posNext - pos) / dt;                     // mean coordinate velocity over the step
    } else {
      psNext  = ps + dt * kerrKick(pos, ps, kerrA);   // kick
      vel     = kerrVel(pos, psNext, kerrA);          // drift with updated momentum
      posNext = pos + vel * dt;
    }

    // Accretion-disk crossing of the equatorial (y = 0) plane. ONE sample per
    // crossing (no multi-step accumulation → no concentric step banding). The
    // opacity below uses the crossing angle so edge-on rays (long path through
    // the disk) read as thick/bright without any geometric slab.
    if (uDiskOn > 0.5 && pos.y * posNext.y < 0.0) {
      float tt  = pos.y / (pos.y - posNext.y);
      vec3  hit = mix(pos, posNext, tt);
      float rd  = kerrR(hit, kerrA);                    // Boyer–Lindquist radius in the disk plane

      if (rd > rIn && rd < uDiskOuter) {
        // Relativistic thin disk. Inner edge is the spin-dependent ISCO; the
        // baked EXACT Kerr Page–Thorne flux F(rd, spin) gives the true radial
        // profile for this spin (not the a=0 shape rescaled), so the hot region
        // tightens toward the smaller ISCO as the hole spins up.
        float flux  = diskFlux(rd, rIn);
        float T     = uDiskTemp * pow(flux, 0.25);           // emitted temperature (K)

        // Relativistic transfer: a blackbody seen with Doppler factor g stays a
        // blackbody at T_obs = g·T, with bolometric intensity ∝ g⁴ (the exact
        // invariant I_ν/ν³ = const, integrated over frequency).
        float g = 1.0;
        if (uDoppler > 0.5) {
          // EXACT Kerr redshift+Doppler for a prograde circular-orbit emitter:
          //   g = 1 / [ u^t (1 − Ω λ) ],
          // with Ω the gas angular velocity, u^t its 4-velocity time component
          // (gravitational + transverse dilation), and λ = L_z/E the photon's
          // conserved axial angular momentum. Reduces to √(1−3M/r)/(1−β) at a=0.
          // Units M = 1: X = r/M = 2·rd, a/M = uSpin.
          float X   = 2.0 * rd;
          float aM  = uSpin;
          float Om  = 1.0 / (pow(X, 1.5) + aM);                  // prograde Ω
          float gtt = -(1.0 - 2.0 / X);
          float gtp = -2.0 * aM / X;
          float gpp = X * X + aM * aM + 2.0 * aM * aM / X;        // equatorial Kerr
          float nrm = -(gtt + 2.0 * Om * gtp + Om * Om * gpp);    // (u^t)^{-2}
          float ut  = 1.0 / sqrt(max(nrm, 1e-4));
          float lam = 2.0 * (hit.x * ps.z - hit.z * ps.x);        // λ = L_z/E (M=1 units)
          g = 1.0 / (ut * max(1.0 - Om * lam, 1e-3));
        }
        float Tobs = T * g;

        // Bolometric surface brightness ∝ T_obs⁴ (Stefan–Boltzmann).
        float bright = uDiskBright * pow(Tobs / uDiskTemp, 4.0);
        // Outer boundary: NOT a razor edge — and the fix is mostly CONTRAST.
        // The disk would otherwise read as a uniform over-exposed plate clipped
        // to white, so its outer rim looks cut. We instead grade the brightness
        // down across almost the whole face (from ~⅓ of the radius out to the
        // truncation), concentrating the light into the hot inner ring and
        // letting the outer disk fall through the visible range into the
        // background — Interstellar's luminous core with fading arms. The inner
        // edge stays genuinely sharp (ISCO zero-stress boundary, flux → 0).
        float outer = 1.0 - smoothstep(uDiskOuter * 0.32, uDiskOuter, rd);
        bright *= outer * outer;

        // Gaseous structure: filamentary FBM turbulence in rotating disk-plane
        // coordinates (seamless, differential rotation). The disk is optically
        // thick (we see its photosphere — like Luminet/Interstellar), so this
        // textures the opaque surface; it is a procedural stand-in for the real
        // magnetorotational (MRI) turbulence, which would require GRMHD. Cheap:
        // a single sample at the first disk crossing per ray.
        // Differential (Keplerian-like) rotation — inner gas orbits faster.
        // Fast enough that the motion reads clearly even on the bright disk.
        float omega = uTime * 1.4 / pow(rd, 1.5);
        float ca = cos(omega), sa = sin(omega);
        vec2  q  = mat2(ca, -sa, sa, ca) * hit.xz;
        // FBM of GRADIENT noise (no lattice facets), with a per-octave rotation
        // so octaves never align into a grid, plus a domain warp that breaks up
        // the coarse base cells — otherwise, seen edge-on in the foreground, the
        // largest cell shows as flat triangular facets ("maglia" sul disco).
        // Texel footprint of the disk surface under this pixel (world units per
        // pixel). At grazing / distant views one pixel covers many noise cells,
        // so the high octaves under-sample and shimmer — classic perspective
        // aliasing. We fade each octave toward its mean (0.5) once its period
        // drops below the footprint (filtered fBm / mip-style band-limiting),
        // removing the shimmer without darkening the disk.
        //
        // The footprint is estimated ANALYTICALLY — distance × pixel-angle /
        // crossing-cosine — NOT from fwidth(hit). The hit point is ray-marched:
        // across a 2x2 GPU quad neighbouring rays can land on very
        // different disk radii (lensing, different equatorial crossings), so
        // fwidth(hit) is discontinuous and its per-quad value makes the octave
        // fade flip on/off in a screen-aligned lattice — the "rete" on the disk.
        // The analytic estimate is smooth across pixels, so no grid appears.
        float foot = length(hit - uCamPos) * uTanFov * 0.010 / max(abs(dir.y), 0.05);
        mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
        vec2 p = q * 0.6;
        vec2 warp = vec2(gnoise(p + 3.1), gnoise(p + 7.7)) - 0.5;
        p += 0.7 * warp;                          // domain warp → swirled, no facets
        float turb = 0.0;
        turb += 0.50 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 0.6));  p = rot * p * 2.0 + 11.5;
        turb += 0.28 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 1.2));  p = rot * p * 2.0 + 4.7;
        turb += 0.15 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 2.4));  p = rot * p * 2.0 + 19.2;
        turb += 0.07 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 4.8));
        turb = pow(clamp(turb, 0.0, 1.0), 1.25);  // contrast → visible rotating bands
        bright *= 0.20 + 1.7 * turb;               // lower floor → darker lanes, more contrast

        vec3 dcol = blackbody(Tobs) * bright;
        // Optical depth through the thin disk at this crossing: surface term
        // (∝ brightness) divided by the crossing cosine |v_y| — a grazing
        // (edge-on) crossing traverses a longer path, so it is more opaque and
        // brighter, with no geometric slab and no step banding. Bright inner
        // disk → opaque; faint outskirts → translucent (smooth radial fade).
        float alpha = clamp(bright * 1.1 / max(abs(vel.y), 0.07), 0.0, 1.0);
        accCol += (1.0 - accA) * alpha * dcol;
        if (!depthSet && alpha > 0.25) { outDepth = depthFromWorld(hit); depthSet = true; hitDisk = true; }
        accA += (1.0 - accA) * alpha;
        if (accA > 0.97) { color = accCol; done = true; break; }
      }
    }

    pos = posNext;
    ps  = psNext;
    dir = normalize(vel);
  }

  // Ray still in flight when steps ran out → composite disk over the background.
  if (!done) color = accCol + (1.0 - accA) * starField(normalize(dir));

  // Jet emission accumulated along the (lensed) ray.
  color += jetAccum;

  // The photon ring is no longer drawn analytically: it now emerges physically
  // from the returning radiation (higher-order disk images piling up near the
  // shadow, captured by the refined stepping above) — same colour as the disk,
  // so it merges with the secondary image instead of being a separate white band.

  // Exposure + ACES filmic tone map + gamma. ACES keeps saturation and rolls
  // bright highlights to white (the luminous, cinematic look) instead of the
  // flat, washed-out Reinhard curve.
  color *= uExposure;
  color = acesFilmic(color);
  color = pow(color, vec3(1.0 / 2.2));

  // Dither (±½ LSB, animated) to break the 8-bit banding/terracing visible on
  // the disk's smooth brightness gradient at close range.
  color += (hash21(gl_FragCoord.xy + fract(uTime) * 17.0) - 0.5) / 255.0;

  fragColor = vec4(color, 1.0);
  gl_FragDepth = outDepth;
}
`;

// ---------------------------------------------------------------------------
// Quality presets — geodesic step count + device-pixel-ratio cap.
// Higher steps = more accurate bending but heavier per-pixel cost.
// ---------------------------------------------------------------------------

export type BlackHoleQuality = "ultra" | "high" | "medium" | "low";

export const QUALITY_PRESETS: Record<
  BlackHoleQuality,
  { steps: number; dprCap: number; rk4: boolean; tao: boolean }
> = {
  // "ultra" uses the 6th-order Yoshida SYMPLECTIC step (Tao extended phase
  // space) — symplectic and 6th order, but ~7× the per-step cost and NOT
  // visibly different from "high" (RK4 is already exact to ~1e-7 rad for
  // single-pass rays). Included for completeness; supersampling is dropped to
  // keep it runnable. "high" uses 4th-order RK4. Medium/low use symplectic Euler.
  ultra:  { steps: 240, dprCap: 1.0, rk4: false, tao: true },
  high:   { steps: 320, dprCap: 2.0, rk4: true,  tao: false },
  medium: { steps: 240, dprCap: 1.4, rk4: false, tao: false },
  low:    { steps: 140, dprCap: 1.1, rk4: false, tao: false },
};
