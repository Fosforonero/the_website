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

function buildFlammGrid(rOut: number, rings: number, spokes: number, depth: number, spin: number): THREE.BufferGeometry {
  // Embedding height, scaled and flipped so the surface is flat far out and
  // dips into a funnel toward the throat.
  const zEdge = Math.sqrt(rOut - RS);
  const y = (r: number) => -depth * (zEdge - Math.sqrt(Math.max(r - RS, 0.0)));
  // Frame-dragging swirl (Lense-Thirring): inertial frames are dragged ∝ 1/r³,
  // so the spokes spiral ever tighter toward the throat when the hole spins.
  const twist = (r: number) => spin * 6.0 / (r * r);

  // Ring radii: much denser near the hole (cubic spacing) so the throat is
  // detailed, plus a few extra rings right at the bottom of the funnel.
  const radii: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const tt = i / rings;
    radii.push(RS + 0.02 + (rOut - RS - 0.02) * tt * tt * tt); // cubic → dense centre
  }

  const seg = 120; // points per circle (smooth rings)
  const verts: number[] = [];

  // concentric rings
  for (const r of radii) {
    const yr = y(r);
    const tw = twist(r);
    for (let s = 0; s < seg; s++) {
      const a0 = (s / seg) * Math.PI * 2 + tw;
      const a1 = ((s + 1) / seg) * Math.PI * 2 + tw;
      verts.push(Math.cos(a0) * r, yr, Math.sin(a0) * r);
      verts.push(Math.cos(a1) * r, yr, Math.sin(a1) * r);
    }
  }
  // radial spokes — each radius twisted by its own frame-dragging angle, so the
  // spoke spirals inward when spin > 0.
  for (let s = 0; s < spokes; s++) {
    const a = (s / spokes) * Math.PI * 2;
    for (let i = 0; i < radii.length - 1; i++) {
      const ra = radii[i]!, rb = radii[i + 1]!;
      const aa = a + twist(ra), ab = a + twist(rb);
      verts.push(Math.cos(aa) * ra, y(ra), Math.sin(aa) * ra);
      verts.push(Math.cos(ab) * rb, y(rb), Math.sin(ab) * rb);
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
  spin = 0,
}: {
  visible: boolean;
  rOut?: number;
  rings?: number;
  spokes?: number;
  depth?: number;
  spin?: number;
}) {
  const geo = useMemo(() => buildFlammGrid(rOut, rings, spokes, depth, spin), [rOut, rings, spokes, depth, spin]);
  if (!visible) return null;
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#3f7fc0" transparent opacity={0.45} depthWrite={false} />
    </lineSegments>
  );
}
