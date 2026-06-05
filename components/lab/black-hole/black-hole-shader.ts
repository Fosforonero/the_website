// ---------------------------------------------------------------------------
// Schwarzschild black-hole renderer — GLSL shader source
// ---------------------------------------------------------------------------
//
// Physically-based (non-rotating, Schwarzschild) gravitational lensing.
// For every screen pixel we shoot a camera ray and integrate the null
// geodesic (photon path) in the curved spacetime around a point mass at the
// origin, then shade:
//   - event horizon  → absorbed (black)
//   - accretion disk → blackbody-ish emission + relativistic Doppler beaming
//                       + gravitational redshift
//   - escape         → background star field (already lensed by the bent ray)
//
// Units: Schwarzschild radius RS = 1. Photon-sphere at 1.5, ISCO at 3.
// The geodesic uses the Binet-equation acceleration
//     a = -1.5 · h² · r / |r|⁵      with  h² = |r × v|²  (conserved)
// which reproduces the exact light-bending of the Schwarzschild metric
// (Einstein ring, photon sphere) via velocity-Verlet integration.
//
// DISCLOSURE: this is a real GR-lensing approximation for a *non-rotating*
// black hole. It is NOT the Kerr (rotating) ray-traced render used for
// Interstellar's Gargantua, which was computed offline. The accretion-disk
// emission model is artistic (Shakura–Sunyaev-inspired), not a radiative
// transfer solution.
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
uniform float uExposure;

const float RS = 1.0;
const int   MAX_STEPS = 400;

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
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i + vec2(0.0, 0.0));
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// ── background star field (sampled with the final, lensed ray direction) ────
vec3 starField(vec3 d) {
  vec3 col = vec3(0.012, 0.014, 0.022);              // faint sky
  float band = exp(-pow(d.y * 3.5, 2.0));            // milky-way-ish band
  col += vec3(0.05, 0.055, 0.085) * band * 0.5;

  for (int k = 0; k < 2; k++) {
    float scale = (k == 0) ? 230.0 : 95.0;
    vec3 g  = d * scale;
    vec3 id = floor(g);
    float h = hash31(id);
    if (h > 0.985) {
      vec3 f = fract(g) - 0.5;
      float star = smoothstep(0.5, 0.0, length(f));
      float tw   = 0.7 + 0.3 * sin(uTime * 2.0 + h * 40.0);
      float mag  = pow((h - 0.985) / 0.015, 2.0);
      vec3 sc    = mix(vec3(1.0, 0.9, 0.8), vec3(0.8, 0.9, 1.0), hash31(id + 7.0));
      col += sc * star * mag * tw * 1.4;
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

// Window-space depth [0,1] of a world point, for occluding composited 3D
// objects (planets, moons, debris) behind the disk / shadow.
float depthFromWorld(vec3 wp) {
  vec4 c = uViewProj * vec4(wp, 1.0);
  return (c.z / c.w) * 0.5 + 0.5;
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
  float outDepth = 1.0; // far by default (background → no occlusion)

  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= uSteps) break;
    float r = length(pos);

    // Event horizon → absorbed.
    if (r < RS) { color = vec3(0.0); outDepth = depthFromWorld(pos); done = true; break; }

    // Escaped to infinity → background.
    if (r > 60.0 && dot(pos, dir) > 0.0) {
      color = starField(normalize(dir));
      done = true; break;
    }

    // Adaptive step: fine near the hole, coarse far away.
    float dt = clamp(r * 0.10, 0.02, 0.6);

    // Geodesic (Binet) acceleration — bends the ray toward the mass.
    vec3 acc     = -1.5 * h2 * pos / pow(dot(pos, pos), 2.5);

    // APPROXIMATE frame dragging (Lense-Thirring gravitomagnetic dipole, spin
    // along +Y). This is NOT the full Kerr metric: it is a physically-motivated
    // approximation that drags photon paths azimuthally around the spin axis.
    if (uSpin > 0.001) {
      vec3  rh = pos / r;
      vec3  J  = vec3(0.0, uSpin, 0.0);
      vec3  Bg = (3.0 * dot(J, rh) * rh - J) / (r * r * r);
      acc += 1.5 * cross(dir, Bg);
    }

    vec3 posNext = pos + dir * dt + 0.5 * acc * dt * dt;
    vec3 dirNext = dir + acc * dt;

    // Accretion-disk crossing in the equatorial (y = 0) plane.
    if (uDiskOn > 0.5 && pos.y * posNext.y < 0.0) {
      float tt  = pos.y / (pos.y - posNext.y);          // crossing fraction
      vec3  hit = mix(pos, posNext, tt);
      float rd  = length(hit.xz);                       // in-plane radius

      if (rd > uDiskInner && rd < uDiskOuter) {
        // Physical optically-thick Shakura–Sunyaev thin disk (no artistic
        // turbulence): emitted flux ∝ r⁻³·(1 − √(r_in/r)), T ∝ flux^¼. The
        // surface is a local blackbody, so its intensity is set purely by T.
        float edge  = max(1.0 - sqrt(uDiskInner / rd), 0.0); // →0 at inner edge
        float flux  = pow(uDiskInner / rd, 3.0) * edge;
        float T     = uDiskTemp * pow(flux, 0.25);           // emitted temperature (K)

        // Relativistic transfer: a blackbody seen with Doppler factor g stays a
        // blackbody at T_obs = g·T, with bolometric intensity ∝ g⁴ (the exact
        // invariant I_ν/ν³ = const, integrated over frequency).
        float g = 1.0;
        if (uDoppler > 0.5) {
          // Exact Schwarzschild circular-orbit speed (locally measured):
          //   v = √(M / (r − 2M)),  M = RS/2 = 0.5  →  0.5c at the ISCO.
          float v    = min(sqrt(0.5 / max(rd - 1.0, 0.05)), 0.99);
          vec3  tang = normalize(vec3(-hit.z, 0.0, hit.x)); // prograde about +y
          vec3  toCam = normalize(uCamPos - hit);
          float beta  = dot(tang, toCam) * v;                // line-of-sight, >0 approaching
          // √(1 − 3M/r) folds gravitational + transverse time dilation; the
          // 1/(1−β) is the remaining longitudinal Doppler.
          float timeDil = sqrt(max(1.0 - 1.5 / rd, 0.0));
          g = timeDil / max(1.0 - beta, 1e-3);
        }
        float Tobs = T * g;

        // Bolometric surface brightness ∝ T_obs⁴ (Stefan–Boltzmann).
        float bright = uDiskBright * pow(Tobs / uDiskTemp, 4.0);
        bright *= smoothstep(uDiskOuter, uDiskOuter - 2.0, rd); // soft outer edge

        // Gaseous structure: filamentary FBM turbulence in rotating disk-plane
        // coordinates (seamless, differential rotation). The disk is optically
        // thick (we see its photosphere — like Luminet/Interstellar), so this
        // textures the opaque surface; it is a procedural stand-in for the real
        // magnetorotational (MRI) turbulence, which would require GRMHD. Cheap:
        // a single sample at the first disk crossing per ray.
        float omega = uTime * 0.32 / pow(rd, 1.5);
        float ca = cos(omega), sa = sin(omega);
        vec2  q  = mat2(ca, -sa, sa, ca) * hit.xz;
        // anisotropic stretch → sheared, gas-like streaks along the flow
        vec2  qs = vec2(q.x, q.y * 2.4);
        float turb = 0.45 * vnoise(qs * 0.55)
                   + 0.27 * vnoise(qs * 1.30)
                   + 0.16 * vnoise(qs * 3.10)
                   + 0.12 * vnoise(qs * 6.80);
        turb = pow(clamp(turb, 0.0, 1.0), 1.7); // contrast → filaments & voids
        bright *= 0.32 + 1.5 * turb;

        color = blackbody(Tobs) * bright;
        outDepth = depthFromWorld(hit);
        done = true; break;
      }
    }

    pos = posNext;
    dir = dirNext;
  }

  // Ray still in flight when steps ran out → fall back to background.
  if (!done) color = starField(normalize(dir));

  // Exposure + Reinhard tone map + gamma.
  color *= uExposure;
  color = color / (1.0 + color);
  color = pow(color, vec3(1.0 / 2.2));

  fragColor = vec4(color, 1.0);
  gl_FragDepth = outDepth;
}
`;

// ---------------------------------------------------------------------------
// Quality presets — geodesic step count + device-pixel-ratio cap.
// Higher steps = more accurate bending but heavier per-pixel cost.
// ---------------------------------------------------------------------------

export type BlackHoleQuality = "high" | "medium" | "low";

export const QUALITY_PRESETS: Record<
  BlackHoleQuality,
  { steps: number; dprCap: number }
> = {
  high:   { steps: 400, dprCap: 1.75 },
  medium: { steps: 240, dprCap: 1.25 },
  low:    { steps: 140, dprCap: 1.0 },
};
