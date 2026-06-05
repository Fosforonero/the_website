"use client";

import { useMemo } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Spacetime-fabric grid for the black hole — Flamm's paraboloid, the exact
// isometric embedding of the equatorial (t, θ=π/2 const) slice of the
// Schwarzschild geometry into 3D Euclidean space:
//     z(r) = 2 · √(r_s · (r − r_s))          (r ≥ r_s)
// i.e. the famous "funnel". A radial grid drawn on this surface visualises the
// real spatial curvature around the hole (not a generic rubber sheet).
// Units: r_s = 1.
// ---------------------------------------------------------------------------

const RS = 1.0;

function buildFlammGrid(rOut: number, rings: number, spokes: number, depth: number): THREE.BufferGeometry {
  // Embedding height, scaled and flipped so the surface is flat far out and
  // dips into a funnel toward the throat.
  const zEdge = Math.sqrt(rOut - RS);
  const y = (r: number) => -depth * (zEdge - Math.sqrt(Math.max(r - RS, 0.0)));

  // Ring radii: denser near the hole (where curvature is strong).
  const radii: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const tt = i / rings;
    radii.push(RS + 0.06 + (rOut - RS - 0.06) * tt * tt); // quadratic spacing
  }

  const seg = 96; // points per circle (smooth rings)
  const verts: number[] = [];

  // concentric rings
  for (const r of radii) {
    const yr = y(r);
    for (let s = 0; s < seg; s++) {
      const a0 = (s / seg) * Math.PI * 2;
      const a1 = ((s + 1) / seg) * Math.PI * 2;
      verts.push(Math.cos(a0) * r, yr, Math.sin(a0) * r);
      verts.push(Math.cos(a1) * r, yr, Math.sin(a1) * r);
    }
  }
  // radial spokes
  for (let s = 0; s < spokes; s++) {
    const a = (s / spokes) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    for (let i = 0; i < radii.length - 1; i++) {
      const ra = radii[i]!, rb = radii[i + 1]!;
      verts.push(ca * ra, y(ra), sa * ra);
      verts.push(ca * rb, y(rb), sa * rb);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  return geo;
}

export function BlackHoleGrid({
  visible,
  rOut = 44,
  rings = 24,
  spokes = 64,
  depth = 1.7,
}: {
  visible: boolean;
  rOut?: number;
  rings?: number;
  spokes?: number;
  depth?: number;
}) {
  const geo = useMemo(() => buildFlammGrid(rOut, rings, spokes, depth), [rOut, rings, spokes, depth]);
  if (!visible) return null;
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#3f7fc0" transparent opacity={0.45} depthWrite={false} />
    </lineSegments>
  );
}
