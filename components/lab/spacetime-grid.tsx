"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Spacetime-deformation grid (gravity-well "rubber-sheet" embedding).
//
// A subdivided plane whose vertices are pushed down by the summed Newtonian
// potential of the nearby bodies, recomputed every frame from their live
// positions. This is the 2D popular-science *analogy*, not a literal solution
// of the Einstein field equations — see the disclosure copy in the UI.
//
// Depth is intentionally compressed (mass mapped through a log curve) so that
// planets remain visible next to the Sun, which would otherwise dominate.
// ---------------------------------------------------------------------------

export type GravityWell = {
  /** Render-space X (same units as the bodies in the scene). */
  x: number;
  /** Render-space Z. */
  z: number;
  /** Body mass in kg (mapped to a compressed well depth in the shader host). */
  massKg: number;
};

export type SpacetimeGridProps = {
  wells: GravityWell[];
  /** Half-extent of the grid in render units (covers ±extent). */
  extent?: number;
  /** Grid line spacing in render units. */
  spacing?: number;
  visible?: boolean;
};

const MAX_WELLS = 16;

// Compress the enormous mass dynamic range (Sun ~1e30, Moon ~7e22) into a
// legible well depth. log10-based, normalised so a Moon-mass body is ~1 unit.
function massToStrength(massKg: number): number {
  if (massKg <= 0) return 0;
  const l = Math.log10(massKg);
  return Math.max(0, (l - 21.5) * 0.7);
}

const vertexShader = /* glsl */ `
uniform vec3 uWells[${MAX_WELLS}];   // x, z, strength
uniform int  uWellCount;
uniform float uSoft;

varying float vDepth;
varying vec2  vWorld;

void main() {
  // Plane local (x, y) maps to world (x, z); we displace along world -Y.
  vec2 xz = position.xy;
  float depth = 0.0;
  for (int i = 0; i < ${MAX_WELLS}; i++) {
    if (i >= uWellCount) break;
    vec2 d = xz - uWells[i].xy;
    float dist = sqrt(dot(d, d) + uSoft * uSoft);
    depth += uWells[i].z / dist;
  }
  vDepth = depth;
  vWorld = xz;
  vec3 world = vec3(xz.x, -depth, xz.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uSpacing;
uniform vec3  uColor;

varying float vDepth;
varying vec2  vWorld;

// Anti-aliased world-space grid lines.
float gridLine(vec2 uv, float spacing) {
  vec2 g = uv / spacing;
  vec2 a = abs(fract(g - 0.5) - 0.5) / fwidth(g);
  return 1.0 - min(min(a.x, a.y), 1.0);
}

void main() {
  float l = gridLine(vWorld, uSpacing);
  if (l < 0.02) discard;
  float glow = clamp(vDepth * 0.18, 0.0, 1.0);
  vec3 col = mix(uColor, vec3(1.0, 0.62, 0.30), glow);
  float alpha = l * (0.22 + 0.6 * glow);
  gl_FragColor = vec4(col, alpha);
}
`;

export function SpacetimeGrid({
  wells,
  extent = 90,
  spacing = 1.0,
  visible = true,
}: SpacetimeGridProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uWells: {
        value: Array.from({ length: MAX_WELLS }, () => new THREE.Vector3()),
      },
      uWellCount: { value: 0 },
      uSoft: { value: 0.9 },
      uSpacing: { value: spacing },
      uColor: { value: new THREE.Color("#2f6fb0") },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Geometry: dense enough to capture the broad central well curvature.
  const segments = 240;

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms as typeof uniforms;
    const count = Math.min(wells.length, MAX_WELLS);
    for (let i = 0; i < count; i++) {
      const w = wells[i]!;
      u.uWells.value[i]!.set(w.x, w.z, massToStrength(w.massKg));
    }
    u.uWellCount.value = count;
    u.uSpacing.value = spacing;
  });

  if (!visible) return null;

  return (
    <mesh frustumCulled={false} renderOrder={-2}>
      <planeGeometry args={[extent * 2, extent * 2, segments, segments]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
