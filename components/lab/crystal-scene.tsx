"use client";

import { useRef, useEffect } from "react";
import type { CrystalStructure } from "@/lib/element-extended-data";

type Visualizable = "fcc" | "bcc" | "hcp" | "diamond" | "sc";

// Returns atom positions in centered world-space coordinates.
// Cubic structures use a [-0.5, 0.5]³ unit cell; HCP uses a custom hexagonal arrangement.
function getAtoms(s: Visualizable): [number, number, number][] {
  const corners: [number, number, number][] = [
    [-0.5,-0.5,-0.5],[ 0.5,-0.5,-0.5],[-0.5, 0.5,-0.5],[ 0.5, 0.5,-0.5],
    [-0.5,-0.5, 0.5],[ 0.5,-0.5, 0.5],[-0.5, 0.5, 0.5],[ 0.5, 0.5, 0.5],
  ];
  if (s === "sc") return corners;
  if (s === "bcc") return [...corners, [0, 0, 0]];
  const faceC: [number, number, number][] = [
    [ 0,  0, -0.5],[ 0,  0,  0.5],
    [ 0, -0.5, 0 ],[ 0,  0.5, 0 ],
    [-0.5, 0,  0 ],[ 0.5, 0,  0 ],
  ];
  if (s === "fcc") return [...corners, ...faceC];
  if (s === "diamond") return [
    ...corners, ...faceC,
    [-0.25,-0.25,-0.25],[ 0.25, 0.25,-0.25],
    [ 0.25,-0.25, 0.25],[-0.25, 0.25, 0.25],
  ];
  // HCP: two hexagonal layers (A and B) viewed from slight angle
  if (s === "hcp") {
    const r = 0.48, h = 0.38;
    const out: [number, number, number][] = [];
    // Layer A (y = -h)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push([r * Math.cos(a), -h, r * Math.sin(a)]);
    }
    out.push([0, -h, 0]);
    // Layer B (y = 0) — interstitial triangular sites
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      out.push([r * 0.577 * Math.cos(a), 0, r * 0.577 * Math.sin(a)]);
    }
    // Layer A' (y = +h) — same positions as A
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push([r * Math.cos(a), h, r * Math.sin(a)]);
    }
    out.push([0, h, 0]);
    return out;
  }
  return corners;
}

// Cube wireframe: 12 edges between the 8 corners
const CUBE_EDGES: [number, number][] = [
  [0,1],[2,3],[4,5],[6,7],
  [0,2],[1,3],[4,6],[5,7],
  [0,4],[1,5],[2,6],[3,7],
];
const CUBE_CORNERS: [number, number, number][] = [
  [-0.5,-0.5,-0.5],[ 0.5,-0.5,-0.5],[-0.5, 0.5,-0.5],[ 0.5, 0.5,-0.5],
  [-0.5,-0.5, 0.5],[ 0.5,-0.5, 0.5],[-0.5, 0.5, 0.5],[ 0.5, 0.5, 0.5],
];

function project(
  x: number, y: number, z: number,
  rotY: number, SIZE: number,
): [number, number, number] {
  // Y-axis rotation
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const rx = x * cosY + z * sinY;
  const ry = y;
  const rz = -x * sinY + z * cosY;
  // Fixed X tilt (~25°)
  const tilt = 0.44;
  const cosX = Math.cos(tilt), sinX = Math.sin(tilt);
  const ty = ry * cosX - rz * sinX;
  const tz = ry * sinX + rz * cosX;
  // Perspective
  const fov = 2.1;
  const d = fov + tz;
  const scale = SIZE * 0.36;
  return [SIZE / 2 + (rx / d) * scale, SIZE / 2 - (ty / d) * scale, d];
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function CrystalScene({
  structure,
  color,
  lightMode = false,
}: {
  structure: CrystalStructure;
  color: string;
  lightMode?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);
  const rotRef    = useRef(0.4); // initial angle so structure is visible from start

  useEffect(() => {
    if (!structure || structure === "other") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const vis = structure as Visualizable;
    const SIZE = 100;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const atoms = getAtoms(vis);
    const isHcp = vis === "hcp";

    let rgb: [number, number, number] = [96, 165, 250];
    try { if (color.startsWith("#") && color.length === 7) rgb = hexToRgb(color); } catch { /* keep fallback */ }
    const [cr, cg, cb] = rgb;

    function draw() {
      if (!ctx) return;
      rotRef.current += 0.007;
      const rot = rotRef.current;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Unit cell wireframe (cubic structures only)
      if (!isHcp) {
        ctx.strokeStyle = lightMode ? "rgba(30,30,50,0.20)" : "rgba(180,200,255,0.18)";
        ctx.lineWidth = 0.8;
        for (const [a, b] of CUBE_EDGES) {
          const [ax, ay] = project(...CUBE_CORNERS[a]!, rot, SIZE);
          const [bx, by] = project(...CUBE_CORNERS[b]!, rot, SIZE);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        }
      }

      // Project atoms, sort back-to-front
      const pts = atoms.map(([x, y, z]) => {
        const [px, py, depth] = project(x, y, z, rot, SIZE);
        return { px, py, depth };
      });
      pts.sort((a, b) => b.depth - a.depth);

      const dMin = pts.at(-1)!.depth;
      const dMax = pts[0]!.depth;
      const dRng = dMax - dMin || 1;

      for (const { px, py, depth } of pts) {
        const t = (dMax - depth) / dRng; // 0 = back, 1 = front
        const baseR = isHcp ? 5.0 : 5.5;
        const r = baseR * (0.60 + t * 0.40);
        const alpha = 0.45 + t * 0.55;

        // Soft glow ring
        ctx.beginPath();
        ctx.arc(px, py, r * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = lightMode
          ? `rgba(${cr},${cg},${cb},${alpha * 0.08})`
          : `rgba(${cr},${cg},${cb},${alpha * 0.12})`;
        ctx.fill();

        // Sphere with radial gradient (highlight at top-left)
        const grad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.35, r * 0.05, px, py, r);
        grad.addColorStop(0, lightMode
          ? `rgba(${Math.min(255,cr+70)},${Math.min(255,cg+70)},${Math.min(255,cb+70)},${alpha})`
          : `rgba(${Math.min(255,cr+90)},${Math.min(255,cg+90)},${Math.min(255,cb+90)},${alpha})`);
        grad.addColorStop(1, lightMode
          ? `rgba(${Math.round(cr*0.55)},${Math.round(cg*0.55)},${Math.round(cb*0.55)},${alpha})`
          : `rgba(${Math.round(cr*0.60)},${Math.round(cg*0.60)},${Math.round(cb*0.60)},${alpha})`);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [structure, color, lightMode]);

  if (!structure || structure === "other") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pt-crystal-canvas"
      style={{ width: 100, height: 100 }}
      aria-hidden="true"
    />
  );
}
