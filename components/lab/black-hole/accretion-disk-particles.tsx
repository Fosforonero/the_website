"use client";

// ---------------------------------------------------------------------------
// Accretion-disk particle system — WebGPU playground layer
//
// 300 k particles on exact prograde Kerr orbits (Kerr-Schild units, same
// coordinate system as the main ray-march shader):
//
//   Ω_K(r, a)  = TSCALE / (X^{3/2} + a)          X = 2r (M=1 units)
//   κ²(r, a)   = Ω_K² · (1 − 6/X + 8a/X^{3/2} − 3a²/X²)
//
// Each particle also has a small epicyclic perturbation (e, κ) that makes
// the orbits slightly elliptical and precessing — giving the disk a live,
// turbulent texture. A small random inclination (σ ≈ 7°) puffs the disk
// into a visible 3D volume.
//
// DISCLOSURE: these particles are in the R3F/WebGL foreground canvas and are
// NOT gravitationally lensed by the WebGPU black-hole background. The same
// disclaimer applies to the 3D bodies (planets, stars, comets) in the same
// canvas. The depth-only occluder sphere at r = 2.6 RS hides particles inside
// the photon-capture shadow so the WebGPU shadow is visible underneath.
// ---------------------------------------------------------------------------

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Prograde Kerr ISCO — same formula as kerrISCO() in black-hole-shader.ts
function kerrISCO(spin: number): number {
  const a  = spin * 0.5; // a = χ·M, M = ½ RS
  const a2 = a * a;
  const Z1 = 1 + Math.cbrt(1 - a2) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const Z2 = Math.sqrt(3 * a2 + Z1 * Z1);
  return 3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));
}

// ---------------------------------------------------------------------------
// Vertex shader
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
precision highp float;

// Orbital parameters — set once at init, never updated per-frame
attribute float aRadius;      // semi-major axis (RS units, 1.5 .. 20)
attribute float aPhase0;      // initial orbital phase [0, 2π]
attribute float aEcc;         // orbital eccentricity [0, ~0.22]
attribute float aInc;         // inclination from equatorial plane (radians, small)
attribute float aNode;        // longitude of ascending node [0, 2π]
attribute float aEpicPhase0;  // epicyclic phase offset [0, 2π]

uniform float uTime;
uniform float uSpin;      // χ ∈ [0,1], same semantics as uSpin in main shader
uniform float uRISCO;     // ISCO in RS units — updated each frame from JS
uniform float uDiskOuter; // outer cutoff radius (RS units)
uniform float uDiskTemp;  // reference temperature at inner edge (K)
uniform float uDoppler;   // 0 = off / 1 = on

varying vec3  vColor;
varying float vAlpha;

// Simplified piecewise blackbody colour (matches the warm-to-blue ramp of the
// main shader's blackbody() function, enough for particle colouring).
vec3 bbColor(float T) {
  T = clamp(T, 300.0, 30000.0);
  if (T < 3500.0) {
    return mix(vec3(0.25, 0.0, 0.0), vec3(1.0, 0.38, 0.04), T / 3500.0);
  } else if (T < 6500.0) {
    return mix(vec3(1.0, 0.38, 0.04), vec3(1.0, 0.88, 0.60), (T - 3500.0) / 3000.0);
  } else if (T < 12000.0) {
    return mix(vec3(1.0, 0.88, 0.60), vec3(0.82, 0.90, 1.0), (T - 6500.0) / 5500.0);
  } else {
    return mix(vec3(0.82, 0.90, 1.0), vec3(0.62, 0.74, 1.0),
               clamp((T - 12000.0) / 13000.0, 0.0, 1.0));
  }
}

void main() {
  float r = aRadius;
  float a = uSpin;
  float X = 2.0 * r;  // M=1 units (M = RS/2)

  // Prograde Kerr angular velocity with TSCALE = 4.0.
  // At r=3 RS (X=6, a=0): OmK = 4/6^1.5 = 0.272 rad s^-1_visual,
  // matching turbulence co-rotation 1.4/3^1.5 = 0.269 — disk orbits and
  // turbulence pattern rotate together, so texture stays glued to particles.
  float OmK = 4.0 / (pow(X, 1.5) + a);

  // Kerr radial epicyclic frequency — zero at ISCO (marginally stable orbit),
  // imaginary inside (unstable → particles clipped to vAlpha=0 below).
  float kap2 = OmK * OmK * (1.0 - 6.0/X + 8.0*a/pow(X, 1.5) - 3.0*a*a/(X*X));
  float kap  = sqrt(max(kap2, 1.0e-6));

  // Prograde orbit, SAME sense as the ray-marched disk's turbulence (which
  // rotates by +omega). Earlier this used -OmK and ran counter to the disk.
  float phi  = aPhase0 + OmK * uTime;
  float ep   = aEpicPhase0 + kap * uTime;

  // Epicyclic perturbation (Keplerian eccentricity in the epicycle approximation)
  float dr   = aEcc * r * cos(ep);
  float dphi = -2.0 * (OmK / kap) * aEcc * sin(ep);
  float rEff = max(r + dr, uRISCO * 0.95);
  float phiE = phi + dphi;

  // 3D position: disk in XZ plane, Y = spin axis.
  // Small-angle inclination → vertical oscillation y ≈ r·i·sin(φ − Ω_node).
  vec3 pos = vec3(
    rEff *  cos(phiE),
    rEff *  aInc * sin(phiE - aNode),
    rEff *  sin(phiE)
  );

  // Page–Thorne radial flux F(r) ∝ (r_in/r)^3 · (1 − √(r_in/r))
  float rI  = uRISCO;
  float flx = 0.0;
  if (r > rI) {
    float q = sqrt(rI / r);
    flx = max(pow(rI / r, 3.0) * (1.0 - q), 0.0);
  }
  float T = uDiskTemp * pow(max(flx, 1.0e-4), 0.25);

  // Relativistic Doppler beaming (approximate, CW orbit, observer along +Z):
  //   v·n_obs = −r·Ω·cos φ  → positive on approaching (-X) side.
  float g = 1.0;
  if (uDoppler > 0.5) {
    float vToObs = rEff * OmK * cos(phiE);
    float beta   = clamp(vToObs / (rEff * OmK + 1.0e-3), -1.0, 1.0);
    g = max(1.0 + 0.55 * beta, 0.1);
  }

  vColor = bbColor(T * g);

  float iscoCut   = smoothstep(rI * 0.88, rI * 1.22, r);
  float outerFade = 1.0 - smoothstep(uDiskOuter * 0.55, uDiskOuter * 0.88, r);
  float bright    = pow(max(flx, 0.0), 0.45) * iscoCut * outerFade * (0.7 + 0.3 * g * g);
  vAlpha = clamp(bright * 0.072, 0.0, 0.50);

  // Clip particles inside ISCO (spin changes move the boundary)
  if (r < rI * 0.95) vAlpha = 0.0;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(-mv.z, 0.5);
  // Point-like grains. Tuned between the two extremes already tried: up to
  // 6px read as blobs, 2.2px max was nearly invisible over the bright disk.
  gl_PointSize = clamp(210.0 / d, 0.8, 3.4);
}
`;

// ---------------------------------------------------------------------------
// Fragment shader
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;
varying vec3  vColor;
varying float vAlpha;

void main() {
  vec2  uv = gl_PointCoord - 0.5;
  float d  = length(uv);
  if (d > 0.5) discard;
  // Tight core with a thin halo — reads as a pinpoint grain, not a soft blob.
  float a = vAlpha * (1.0 - smoothstep(0.08, 0.45, d));
  gl_FragColor = vec4(vColor, a);
}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DISK_RMIN = 1.5;   // inside photon sphere — always inside any ISCO
const DISK_RMAX = 20.0;

export function AccretionDiskParticles({
  spin = 0,
  dopplerOn = false,
  diskTemp = 10500,
  diskOuter = 16,
  count = 300_000,
}: {
  spin?: number;
  dopplerOn?: boolean;
  diskTemp?: number;
  diskOuter?: number;
  count?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // ---------------------------------------------------------------------------
  // Geometry — orbital parameters set once at mount.
  // Radial distribution ∝ r^{−0.75} concentrates particles near the ISCO
  // where the disk is physically brightest (Page–Thorne flux peaks at 1.36 r_in).
  // ---------------------------------------------------------------------------
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const aRadius     = new Float32Array(count);
    const aPhase0     = new Float32Array(count);
    const aEcc        = new Float32Array(count);
    const aInc        = new Float32Array(count);
    const aNode       = new Float32Array(count);
    const aEpicPhase0 = new Float32Array(count);

    // CDF^{-1} for density ∝ r^{-0.75}:  r = ((span·u + rMin^{0.25})^4)
    const p25min  = Math.pow(DISK_RMIN, 0.25);
    const p25span = Math.pow(DISK_RMAX, 0.25) - p25min;

    for (let i = 0; i < count; i++) {
      aRadius[i]     = Math.pow(p25span * Math.random() + p25min, 4);
      aPhase0[i]     = Math.random() * Math.PI * 2;

      // Eccentricity: Rayleigh distribution σ = 0.065 → most e < 0.15
      aEcc[i]        = Math.min(
        0.065 * Math.sqrt(-2 * Math.log(Math.random() + 1e-9)),
        0.24,
      );

      // Inclination: Box–Muller Normal(0, σ = 7°) — puffs the disk without
      // making it spherical; gives thin-disk appearance edge-on.
      const u1 = Math.max(Math.random(), 1e-9);
      const u2 = Math.random();
      aInc[i]        = 0.122 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      aNode[i]       = Math.random() * Math.PI * 2;
      aEpicPhase0[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute("aRadius",     new THREE.BufferAttribute(aRadius,     1));
    geo.setAttribute("aPhase0",     new THREE.BufferAttribute(aPhase0,     1));
    geo.setAttribute("aEcc",        new THREE.BufferAttribute(aEcc,        1));
    geo.setAttribute("aInc",        new THREE.BufferAttribute(aInc,        1));
    geo.setAttribute("aNode",       new THREE.BufferAttribute(aNode,       1));
    geo.setAttribute("aEpicPhase0", new THREE.BufferAttribute(aEpicPhase0, 1));
    // Dummy position buffer required by Three.js for the Points draw call.
    // Real positions are computed analytically in the vertex shader each frame.
    geo.setAttribute("position",    new THREE.BufferAttribute(new Float32Array(count * 3), 3));

    return geo;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime:      { value: 0 },
    uSpin:      { value: spin },
    uRISCO:     { value: kerrISCO(spin) },
    uDiskOuter: { value: diskOuter },
    uDiskTemp:  { value: diskTemp },
    uDoppler:   { value: dopplerOn ? 1 : 0 },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps — props synced per-frame below

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    type U = Record<string, { value: number } | undefined>;
    const u = matRef.current.uniforms as U;
    const uTime    = u.uTime;    if (uTime)    uTime.value    = clock.getElapsedTime();
    const uSpin    = u.uSpin;    if (uSpin)    uSpin.value    = spin;
    const uRISCO   = u.uRISCO;  if (uRISCO)   uRISCO.value   = kerrISCO(spin);
    const uDoppler = u.uDoppler; if (uDoppler) uDoppler.value = dopplerOn ? 1 : 0;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
