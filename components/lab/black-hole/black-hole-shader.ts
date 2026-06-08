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
uniform float uUltra;      // 0/1 — 6th-order Yoshida symplectic (only compiled when BH_ULTRA is defined)
uniform float uStyle;      // 0 = cinematic, 1 = "Starless" photographic (lensed real-sky look)
uniform float uPureBlack;  // 1 = "Pure black" preset (sky off, saturated-orange disk — NASA/Schnittman look)
uniform sampler2D uSkyTex; // equirectangular real-sky photo (NASA Deep Star Maps 2020)
uniform float uSkyOn;      // 1 = sample the real photo (lensed) instead of procedural stars
uniform float uSkyBright;  // brightness scale for the real sky
uniform float uVolDisk;    // 1 = volumetric 3D disk (radiative transfer through an analytic plasma)
uniform float uVolThick;   // disk aspect-ratio scale (sets H/r)
uniform float uVolOpacity; // volumetric absorption coefficient

const float RS = 1.0;
const int   MAX_STEPS = 400;

// Relativistic thin-disk radiative flux (Novikov–Thorne / Shakura–Sunyaev radial
// profile with a zero-torque inner boundary): F ∝ (r_in/r)³·(1−√(r_in/r)). The
// inner edge r_in is the spin-dependent ISCO, so the hot ring tracks the ISCO as
// the hole spins up. Computed ANALYTICALLY in the shader — no lookup table, no
// uniform array, no texture — so it renders on every WebGL device. Peaks at
// ~0.057 near 1.36·r_in, matching the previous baked profile.
float diskFlux(float rd, float rIn) {
  if (rd <= rIn) return 0.0;
  float x = rIn / rd;
  return x * x * x * (1.0 - sqrt(x));
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
  if (uPureBlack > 0.5) return vec3(0.0);             // sky off (pure-black preset)
  // Real sky: a NASA equirectangular all-sky photo sampled with the FULLY LENSED
  // ray direction, so the genuine Milky Way is bent and smeared around the hole.
  if (uSkyOn > 0.5) {
    float lon = atan(d.z, d.x);
    float lat = asin(clamp(d.y, -1.0, 1.0));
    vec2  uv  = vec2(lon * 0.15915494 + 0.5, 0.5 - lat * 0.31830989); // /(2π), /π
    vec3  sky = texture(uSkyTex, uv).rgb;
    // The NASA map is a soft grey-brown wash; crush the low-mids (darker, blacker
    // sky, more contrast) and boost saturation so the dust lanes and nebulae read
    // in colour instead of grey.
    sky = pow(sky, vec3(1.4));
    float lum = dot(sky, vec3(0.299, 0.587, 0.114));
    sky = max(mix(vec3(lum), sky, 1.5), 0.0);          // +50% saturation
    return sky * uSkyBright;
  }
  vec3 col = vec3(0.00012, 0.00014, 0.00022);        // ~black sky floor
  bool sl = uStyle > 0.5;
  // Starless uses a BROADER band so the Milky Way fills more of the sky (the thin
  // cinematic band sat right on the disk plane and read as "nothing").
  float band = exp(-pow(d.y * (sl ? 3.0 : 5.5), 2.0));
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
    n = pow(clamp(n, 0.0, 1.0), 1.35);                      // contrast → filaments, not haze
    dust  = smoothstep(0.40, 0.80, gnoise(vec2(az * 3.3, d.y * 5.5) + 23.0)); // dark lanes
    band2 = band * n * (1.0 - 0.85 * dust);                // where the band stars live
    // Diffuse Milky-Way glow — brighter than before so the band actually reads,
    // but still structured (filaments carved by dark dust lanes), not a flat fog.
    vec3 mwCol = mix(vec3(0.020, 0.024, 0.040), vec3(0.075, 0.060, 0.045), band);
    col += mwCol * band2 * 0.45;                            // lower diffuse → less beige fog
    float core = exp(-pow(az * 0.8, 2.0)) * band;          // warm bulge toward the centre
    col += vec3(0.090, 0.066, 0.046) * core * (1.0 - 0.6 * dust) * 0.8;
    // Nebulae: sparse coloured emission/reflection patches along the plane — a
    // second, lower-frequency fBm picks bright clumps, tinted between reddish HII
    // and bluish reflection. Adds the colour/depth that reads as "more detailed".
    vec2  ng = vec2(az * 1.3, d.y * 3.2) + 41.0;
    float neb = 0.0, na = 0.55;
    for (int o = 0; o < 3; o++) { neb += na * gnoise(ng); ng = rr * ng * 2.1 + 2.3; na *= 0.5; }
    neb = pow(clamp(neb, 0.0, 1.0), 3.0);                   // sparse, bright clumps (less haze)
    float tint = gnoise(vec2(az * 0.7, d.y * 1.6) + 7.0);
    vec3  nebCol = mix(vec3(0.16, 0.04, 0.07), vec3(0.04, 0.07, 0.16), tint); // HII red ↔ reflection blue
    col += nebCol * neb * band * (1.0 - 0.55 * dust) * 1.1;
  }

  // Discrete stars. In Starless mode two extra layers (k=2,3) are dense, faint
  // and CONCENTRATED in the galactic band (weighted by band2) so the Milky Way
  // reads as unresolved stars — the grain that kills the "haze" look.
  int layers = sl ? 4 : 2;
  for (int k = 0; k < 4; k++) {
    if (k >= layers) break;
    bool dense = k >= 2;                                    // band-concentrated grain
    float scale = (k == 0) ? 230.0 : (k == 1) ? 95.0 : (k == 2) ? 520.0 : 900.0;
    // Denser, brighter band grain so the Milky Way reads as countless unresolved
    // stars; in Starless the general field is also a touch denser than cinematic.
    float thr   = dense ? (k == 2 ? 0.88 : 0.85) : (sl ? 0.965 : 0.985);
    vec3 g  = d * scale;
    vec3 id = floor(g);
    float h = hash31(id);
    if (h > thr) {
      vec3 f = fract(g) - 0.5;
      float star = smoothstep(0.5, 0.0, length(f));
      float tw   = 0.7 + 0.3 * sin(uTime * 2.0 + h * 40.0);
      float mag  = pow((h - thr) / (1.0 - thr), 2.0);
      vec3 sc    = mix(vec3(1.0, 0.9, 0.8), vec3(0.8, 0.9, 1.0), hash31(id + 7.0));
      // grain layers live in the band (carved by dust); bright foreground stars
      // fill the whole sky.
      float w = dense ? band2 * 2.4 : 1.0;
      float bright = dense ? 1.5 : 2.0;
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

// ── "Ultra" integrator (DESKTOP): 6th-order Yoshida SYMPLECTIC step for the
// non-separable null Hamiltonian, via Tao's (2016) extended phase space. This is
// gated behind #define BH_ULTRA so it is compiled ONLY for the Ultra-quality
// shader variant — the default/mobile shader never contains it, so it cannot
// blow the mobile shader-compile budget (which is what broke the disk before).
#ifdef BH_ULTRA
const float YOSH6[7] = float[7](
  0.78451361047756, 0.235573213359357, -1.17767998417887,
  1.315185948683906, -1.17767998417887, 0.235573213359357, 0.78451361047756);
void taoStep(inout vec3 q, inout vec3 p, inout vec3 sx, inout vec3 sy, float d, float a, float om) {
  float h = 0.5 * d;
  p += h * kerrKick(q, sy, a);  sx += h * kerrVel(q, sy, a);
  q += h * kerrVel(sx, p, a);   sy += h * kerrKick(sx, p, a);
  float c = cos(2.0 * om * d), s = sin(2.0 * om * d);
  vec3 qa = q - sx, pb = p - sy, qsum = q + sx, psum = p + sy;
  vec3 na = qa * c + pb * s, nb = -qa * s + pb * c;
  q = 0.5 * (qsum + na); sx = 0.5 * (qsum - na);
  p = 0.5 * (psum + nb); sy = 0.5 * (psum - nb);
  q += h * kerrVel(sx, p, a);   sy += h * kerrKick(sx, p, a);
  p += h * kerrKick(q, sy, a);  sx += h * kerrVel(q, sy, a);
}
#endif

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
  int   diskXings = 0;                                                  // disk-plane crossings (for photon-ring contrast)
  vec3  ps    = dir;                                                    // photon momentum (E=1, far→flat)
#ifdef BH_ULTRA
  vec3  shPos = pos, shMom = ps;                                        // Tao extended-phase-space shadow copy
#endif

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
#ifdef BH_ULTRA
    if (uUltra > 0.5) {
      // 6th-order Yoshida symplectic (Tao). ω = 0.25/dt keeps the binding
      // rotation angle constant per (adaptive) step.
      vec3 q = pos, p = ps, sx = shPos, sy = shMom;
      float om = 0.25 / dt;
      for (int k = 0; k < 7; k++) taoStep(q, p, sx, sy, YOSH6[k] * dt, kerrA, om);
      posNext = q; psNext = p; shPos = sx; shMom = sy;
      vel = (posNext - pos) / dt;
    } else
#endif
    if (uHighOrder > 0.5) {
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
    if (uDiskOn > 0.5 && uVolDisk < 0.5 && pos.y * posNext.y < 0.0) {
      float tt  = pos.y / (pos.y - posNext.y);
      vec3  hit = mix(pos, posNext, tt);
      float rd  = kerrR(hit, kerrA);                    // Boyer–Lindquist radius in the disk plane

      if (rd > rIn && rd < uDiskOuter) {
        diskXings++;                                        // 1 = direct image, ≥2 = returning (ring) images
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
        // Hot inner lip (Interstellar look): flare toward the ISCO where the flux
        // peaks, so the inner edge glows white-hot. The flux already → 0 exactly
        // at rIn (zero-torque boundary), so the sharp inner edge is preserved.
        bright *= 1.0 + 1.3 * smoothstep(rIn * 3.0, rIn * 1.25, rd);

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
        float foot = length(hit - uCamPos) * uTanFov * 0.0035 / max(abs(dir.y), 0.05);
        mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
        vec2 p = q * 0.6;
        vec2 warp = vec2(gnoise(p + 3.1), gnoise(p + 7.7)) - 0.5;
        p += 0.7 * warp;                          // domain warp → swirled, no facets
        float turb = 0.0;
        // The two coarse octaves co-rotate rigidly, so the Keplerian shear winds
        // them into the big concentric bands (physically right — like cream in
        // coffee). The two fine octaves below get a slow time-drifting seed: they
        // keep regenerating (a "boil") instead of shearing into perfectly clean
        // filaments — a cheap stand-in for the MRI continuously rebuilding the
        // small-scale turbulence, so the disk never settles into spotless rings
        // and always keeps some turbulent grain riding on the bands.
        turb += 0.50 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 0.6));  p = rot * p * 2.0 + 11.5;
        turb += 0.28 * mix(0.5, gnoise(p), 1.0 - smoothstep(0.45, 0.9, foot * 1.2));  p = rot * p * 2.0 + 4.7;
        turb += 0.15 * mix(0.5, gnoise(p + vec2( uTime * 0.09, -uTime * 0.06)), 1.0 - smoothstep(0.45, 0.9, foot * 2.4));  p = rot * p * 2.0 + 19.2;
        turb += 0.07 * mix(0.5, gnoise(p + vec2(-uTime * 0.13,  uTime * 0.11)), 1.0 - smoothstep(0.45, 0.9, foot * 4.8));
        turb = pow(clamp(turb, 0.0, 1.0), 1.25);  // contrast → bands ride under churning grain
        bright *= 0.20 + 1.7 * turb;               // lower floor → darker lanes, more contrast

        // (No discrete per-crossing brightness boost: it left a hard seam where a
        // ray's crossing count steps 1→2, very visible on a black background. The
        // photon ring / secondary image still emerge from the real returning light.)

        vec3 dcol = blackbody(Tobs) * bright;
        // "Pure black" preset: monochromatic saturated orange (NASA/Schnittman
        // look) instead of the physical blackbody colour ramp.
        if (uPureBlack > 0.5) dcol = vec3(1.0, 0.42, 0.12) * bright;
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

    // Volumetric veil: a faint warm glow within a scale height of the disk plane,
    // integrated along the ray, so the razor-thin disk gains a soft vertical
    // "thickness" (Interstellar's wispy halo) without a real 3D gas model. Cheap:
    // a fixed warm tint × the analytic flux, gated to steps actually near the plane.
    if (uDiskOn > 0.5 && uVolDisk < 0.5 && uPureBlack < 0.5) {
      float ya = abs(pos.y);
      if (ya < 0.55) {
        float rv = kerrR(pos, kerrA);
        if (rv > rIn && rv < uDiskOuter) {
          float vfl  = diskFlux(rv, rIn);
          float vert = exp(-(ya * ya) / 0.040);            // scale height ≈ 0.14
          float ov   = 1.0 - smoothstep(uDiskOuter * 0.32, uDiskOuter, rv);
          vec3  vcol = vec3(1.0, 0.62, 0.32) * (vfl * ov * ov);
          accCol += (1.0 - accA) * vcol * vert * dt * uDiskBright * 0.020;
        }
      }
    }

#ifdef BH_VOLDISK
    // Volumetric 3D disk: integrate the radiative-transfer equation (emission +
    // absorption) through an ANALYTIC plasma model along this geodesic step,
    // instead of sampling a thin sheet. Vertical structure is a hydrostatic
    // Gaussian ρ(r,z)=ρ₀(r)·exp(−z²/2H²) with scale height H≈c_s/Ω_K (the sound
    // speed c_s comes from the local temperature we already compute). NOT GRMHD —
    // an analytic slim-disk model — but a real volume: it self-occludes and
    // limb-brightens. Gated behind a compile #define so the default shader stays
    // small (mobile compile budget).
    if (uDiskOn > 0.5 && uVolDisk > 0.5 && accA < 0.99) {
      vec3  mid = 0.5 * (pos + posNext);
      float rho = length(mid.xz);                          // cylindrical radius (equatorial plane y=0)
      if (rho > rIn && rho < uDiskOuter) {
        float flux = diskFlux(rho, rIn);
        float T    = uDiskTemp * pow(flux, 0.25);
        // H/r ≈ c_s/v_φ ∝ sqrt(T·r): a flared slim disk, clamped to a sane range.
        // Keep the slim disk genuinely THIN: a high H/r cap makes Hh=HoR·rho
        // balloon at large radius into a fat torus that, seen edge-on, fills the
        // frame and (once it clips to white) blooms into a diffuse haze.
        // Upper clamp 0.035 (was 0.05) keeps the disk a narrow equatorial band.
        float HoR  = clamp(uVolThick * sqrt(pow(flux, 0.25) * rho), 0.012, 0.035);
        float Hh   = HoR * rho;
        float zr   = mid.y / Hh;
        if (abs(zr) < 2.2) {
          float dens = exp(-0.5 * zr * zr);                // hydrostatic vertical profile
          float radial = 1.0 - smoothstep(uDiskOuter * 0.32, uDiskOuter, rho);
          dens *= radial * radial;                         // soft outer taper
          // Exact Kerr Doppler/redshift for the local circular orbit (as thin disk).
          float g = 1.0;
          if (uDoppler > 0.5) {
            float X = 2.0 * rho, aM = uSpin;
            float Om = 1.0 / (pow(X, 1.5) + aM);
            float gtt = -(1.0 - 2.0 / X), gtp = -2.0 * aM / X, gpp = X * X + aM * aM + 2.0 * aM * aM / X;
            float nrm = -(gtt + 2.0 * Om * gtp + Om * Om * gpp);
            float ut  = 1.0 / sqrt(max(nrm, 1e-4));
            float lam = 2.0 * (mid.x * ps.z - mid.z * ps.x);
            g = 1.0 / (ut * max(1.0 - Om * lam, 1e-3));
          }
          float Tobs = T * g;
          // Co-rotating turbulence (2 octaves), sheared by differential rotation.
          float om = uTime * 1.4 / pow(rho, 1.5);
          float ca = cos(om), sa = sin(om);
          vec2  qd = mat2(ca, -sa, sa, ca) * mid.xz * 0.6;
          float tb = 0.6 * gnoise(qd) + 0.4 * gnoise(qd * 2.03 + vec2(uTime * 0.1, 5.1));
          tb = clamp(0.45 + 1.1 * tb, 0.0, 1.7);
          float ds   = dt * length(vel);                   // path length of this step
          float emis = pow(Tobs / uDiskTemp, 4.0) * dens * tb;   // emission coefficient (beaming ∝ T_obs⁴)
          float dtau = uVolOpacity * dens * ds;            // optical depth of this segment
          // Emission must dominate absorption (or the volume reads as a dark, muddy
          // blob), but not so much it clips to white and feeds the bloom a screen-
          // filling halo. Moderate gain now that the slab is thin.
          vec3  j    = blackbody(Tobs) * (uDiskBright * 0.6 * emis * ds);
          accCol += (1.0 - accA) * j;                      // emission, attenuated by gas already in front
          accA   += (1.0 - accA) * (1.0 - exp(-dtau));     // accumulate opacity (self-occlusion)
          if (!depthSet && accA > 0.30) { outDepth = depthFromWorld(mid); depthSet = true; hitDisk = true; }
          if (accA > 0.99) { color = accCol; done = true; break; }
        }
      }
    }
#endif

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
// The UI also offers "Auto", which is resolved to one of the concrete presets at
// runtime from the detected GPU and then adapted to the measured frame rate.
export type QualityChoice = BlackHoleQuality | "auto";

export const QUALITY_PRESETS: Record<
  BlackHoleQuality,
  { steps: number; dprCap: number; rk4: boolean; tao: boolean }
> = {
  // "ultra" → 6th-order Yoshida SYMPLECTIC step (Tao), compiled into a SEPARATE
  // shader variant (#define BH_ULTRA) used only when selected, so it never
  // bloats the default/mobile shader. Desktop/high-end-GPU target (heaviest):
  // many steps + 2× supersampling.
  // "high" → 4th-order RK4 + 2× supersampling. medium/low → cheap symplectic Euler.
  ultra:  { steps: 300, dprCap: 2.0, rk4: false, tao: true },
  high:   { steps: 320, dprCap: 2.0, rk4: true,  tao: false },
  medium: { steps: 240, dprCap: 1.4, rk4: false, tao: false },
  low:    { steps: 140, dprCap: 1.1, rk4: false, tao: false },
};

// ---------------------------------------------------------------------------
// GPU detection + "Auto" quality
// ---------------------------------------------------------------------------
// WebGL has no vendor-specific code paths (one GLSL for every GPU); "optimizing
// for NVIDIA/Radeon/Apple-Silicon" means detecting the GPU and dialing quality
// (steps, supersampling, integrator, volumetric disk) up on strong desktop GPUs
// and down on weak/integrated/mobile ones — backed by an FPS governor for when
// the renderer string is masked (some browsers hide it for privacy).

export type GpuTier = "high" | "mid" | "low";
export type GpuInfo = { tier: GpuTier; renderer: string; isAppleSilicon: boolean };

export function detectGpu(): GpuInfo {
  if (typeof document === "undefined" || typeof navigator === "undefined")
    return { tier: "mid", renderer: "", isAppleSilicon: false };
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { tier: "low", renderer: "", isAppleSilicon: false };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    const s = renderer.toLowerCase();
    // Extra signals — mobile GPUs are coarsely (or not at all) identified by the
    // renderer string (iOS reports a generic "Apple GPU" for every iPhone), so we
    // also use deviceMemory (Chrome) and core count; the FPS governor corrects.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const mem = nav.deviceMemory ?? 0;          // GB, Chrome/Android only
    const cores = navigator.hardwareConcurrency ?? 0;
    const strong = mem >= 6 || cores >= 8;
    const decent = mem >= 4 || cores >= 6;
    // Apple Silicon Mac: Chrome/ANGLE reports "Apple M1/M2/M3…" in the renderer.
    // iOS always reports "Apple GPU" or "Apple A<n>" — that branch is separate below.
    const isAppleSilicon = /apple m\d/.test(s);

    let tier: GpuTier = "mid";
    if (/swiftshader|llvmpipe|software|basic render/.test(s)) tier = "low";
    // Apple Silicon Mac detected above, or discrete GPU (NVIDIA/Radeon).
    else if (isAppleSilicon || /geforce|nvidia|\brtx\b|\bgtx\b|radeon rx|radeon pro|radeon vii|quadro|tesla|\brx \d{3}/.test(s))
      tier = "high";
    // Qualcomm Adreno (Android): clean numbering — 7xx/8xx flagship, 6xx mid.
    else if (/adreno/.test(s)) {
      const n = parseInt((s.match(/adreno[^\d]*(\d{3,})/) || [])[1] || "0", 10);
      tier = n >= 700 ? "high" : n >= 640 ? "mid" : "low";
    }
    // ARM Mali / Immortalis (Android): numbering is messy → lean on device signals.
    else if (/mali|immortalis/.test(s)) {
      tier = /immortalis/.test(s) ? "high" : strong ? "high" : decent ? "mid" : "low";
    }
    else if (/powervr/.test(s)) tier = decent ? "mid" : "low";
    // iOS hides the model as "Apple GPU": use device signals + the FPS governor.
    else if (/apple gpu|apple a\d/.test(s)) tier = strong ? "high" : decent ? "mid" : "low";
    else if (/intel|iris|uhd|hd graphics|\barc\b/.test(s)) tier = "mid";
    else tier = mem && mem <= 2 ? "low" : "mid";
    return { tier, renderer, isAppleSilicon };
  } catch {
    return { tier: "mid", renderer: "", isAppleSilicon: false };
  }
}

// Full render profile (decoupled from the manual preset names so desktop and
// mobile can be tuned independently). On mobile the bottleneck is fill-rate, so
// we cap the device-pixel-ratio and favour the cheap symplectic-Euler integrator
// with more steps over RK4/Yoshida; the heavy extras (supersampling, volumetric
// disk, Ultra integrator) are desktop-only.
export type RenderProfile = { steps: number; dprCap: number; rk4: boolean; tao: boolean; vol: boolean };

export function effectiveProfile(choice: QualityChoice, gpu: GpuInfo, isMobile: boolean): RenderProfile {
  if (choice !== "auto") {
    return { ...QUALITY_PRESETS[choice], vol: false }; // manual: the 3D-disk toggle controls vol
  }
  if (isMobile) {
    // Mobile is fill-rate (DPR) bound, NOT step bound — and the photon ring needs
    // enough steps to resolve. So keep steps high (~240, the value that resolved
    // the ring fine before) on every tier and use the DPR as the perf knob; the
    // governor on mobile scales resolution, not steps, so the ring never breaks.
    if (gpu.tier === "high") return { steps: 240, dprCap: 1.4, rk4: false, tao: false, vol: false };
    if (gpu.tier === "mid")  return { steps: 240, dprCap: 1.2, rk4: false, tao: false, vol: false };
    return { steps: 230, dprCap: 1.0, rk4: false, tao: false, vol: false };
  }
  // Desktop.
  // Apple Silicon (M-series integrated GPU): powerful but not a discrete card.
  // Skip Tao integrator and volumetric disk (vol adds per-step work for every ray
  // and tanks fps to ~11 on M2 Pro); 340 steps at DPR 1.5 gives the photon ring
  // (needs ~177 steps/orbit at r=3) while keeping fps acceptable. Vol disk is
  // still available as a manual toggle for users who accept the fps hit.
  if (gpu.tier === "high" && gpu.isAppleSilicon)
    return { steps: 340, dprCap: 1.5, rk4: false, tao: false, vol: false };
  if (gpu.tier === "high") return { steps: 300, dprCap: 2.0, rk4: false, tao: true,  vol: true };  // NVIDIA/Radeon discrete
  if (gpu.tier === "mid")  return { steps: 320, dprCap: 2.0, rk4: true,  tao: false, vol: false }; // Intel/Iris/Arc
  return { steps: 240, dprCap: 1.4, rk4: false, tao: false, vol: false };
}

