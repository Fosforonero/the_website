"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { CATEGORY_COLOR } from "@/lib/elements-data";
import { EXTENDED } from "@/lib/element-extended-data";
import type { Molecule, BondType } from "@/lib/molecules-data";

// Map atomic number → visual color (from category color palette)
const ELEM_COLORS: Record<number, string> = {
  1:  "#d1d5db", // H: light gray
  6:  "#374151", // C: dark gray
  7:  "#3b82f6", // N: blue
  8:  "#ef4444", // O: red
  9:  "#a3e635", // F: yellow-green
  11: "#a78bfa", // Na: violet
  12: "#34d399", // Mg: emerald
  13: "#f59e0b", // Al: amber
  14: "#8b5cf6", // Si: purple
  15: "#f97316", // P: orange
  16: "#facc15", // S: yellow
  17: "#4ade80", // Cl: green
  19: "#a78bfa", // K: violet
  20: "#6ee7b7", // Ca: teal
  26: "#f87171", // Fe: pink-red
  29: "#fb923c", // Cu: copper-orange
  47: "#d1d5db", // Ag: silver
  79: "#fbbf24", // Au: gold
  82: "#9ca3af", // Pb: gray
};

// Bond type visual color
const BOND_COLOR: Record<BondType, string> = {
  covalent: "#93c5fd",  // blue
  polar:    "#fde68a",  // amber
  ionic:    "#f9a8d4",  // pink
};

// Van der Waals radii for atom sphere sizes (relative)
const ATOM_RADII: Record<number, number> = {
  1: 0.22, 6: 0.34, 7: 0.30, 8: 0.28, 9: 0.26,
  11: 0.48, 12: 0.42, 13: 0.40, 14: 0.38, 15: 0.38,
  16: 0.36, 17: 0.36, 19: 0.52, 20: 0.46, 26: 0.42,
  29: 0.40, 47: 0.44, 79: 0.44, 82: 0.46,
};

function getAtomRadius(elem: number): number {
  return ATOM_RADII[elem] ?? 0.35;
}

function getAtomColor(elem: number): string {
  if (ELEM_COLORS[elem]) return ELEM_COLORS[elem]!;
  const ext = EXTENDED[elem];
  if (!ext) return "#6b7280";
  // Fallback to category color — need to find element by Z
  return "#6b7280";
}

// ─── Bond cylinder helper ─────────────────────────────────────────────────────

function BondMesh({
  ax, ay, az, bx, by, bz, order, type, lightMode,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  order: 1 | 2 | 3; type: BondType; lightMode: boolean;
}) {
  const dx = bx-ax, dy = by-ay, dz = bz-az;
  const len = Math.sqrt(dx*dx+dy*dy+dz*dz);
  const mx = (ax+bx)/2, my = (ay+by)/2, mz = (az+bz)/2;
  const colHex = BOND_COLOR[type];
  const col = new THREE.Color(colHex);

  const cylinders = useMemo(() => {
    const result = [];
    const r = order === 1 ? 0.065 : 0.050;
    const offsets = order === 1 ? [0] : order === 2 ? [-0.08, 0.08] : [-0.12, 0, 0.12];

    for (const off of offsets) {
      result.push(off);
    }
    return result;
  }, [order]);

  // Perpendicular offset direction
  const axis   = new THREE.Vector3(dx/len, dy/len, dz/len);
  const up     = Math.abs(axis.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
  const perp   = new THREE.Vector3().crossVectors(axis, up).normalize();

  return (
    <>
      {cylinders.map((off, i) => {
        const px = mx + perp.x * off;
        const py = my + perp.y * off;
        const pz = mz + perp.z * off;
        const r = order === 1 ? 0.065 : 0.052;
        return (
          <mesh key={i} position={[px, py, pz]}>
            <cylinderGeometry args={[r, r, len, 8, 1]} />
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={lightMode ? 0.05 : 0.25}
              roughness={0.45}
              metalness={0.05}
              transparent
              opacity={lightMode ? 0.75 : 0.85}
            />
            {/* inline quaternion via ref to rotate cylinder along bond axis */}
            <primitive
              object={new THREE.Object3D()}
              onUpdate={(self: THREE.Object3D) => {
                self.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), axis);
              }}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Bond with proper orientation ─────────────────────────────────────────────

function Bond({
  ax, ay, az, bx, by, bz, order, type, lightMode,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  order: 1 | 2 | 3; type: BondType; lightMode: boolean;
}) {
  const dx = bx-ax, dy = by-ay, dz = bz-az;
  const len = Math.sqrt(dx*dx+dy*dy+dz*dz);
  const mid = new THREE.Vector3((ax+bx)/2, (ay+by)/2, (az+bz)/2);
  const dir = new THREE.Vector3(dx/len, dy/len, dz/len);
  const colHex = BOND_COLOR[type];
  const col = new THREE.Color(colHex);

  const up   = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
  const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir);

  const offsets = order === 1 ? [0] : order === 2 ? [-0.08, 0.08] : [-0.12, 0, 0.12];
  const r       = order === 1 ? 0.065 : 0.050;

  return (
    <>
      {offsets.map((off, i) => {
        const pos: [number, number, number] = [
          mid.x + perp.x * off,
          mid.y + perp.y * off,
          mid.z + perp.z * off,
        ];
        return (
          <mesh key={i} position={pos} quaternion={quat}>
            <cylinderGeometry args={[r, r, len, 8, 1]} />
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={lightMode ? 0.04 : 0.22}
              roughness={0.45}
              metalness={0.05}
              transparent
              opacity={lightMode ? 0.72 : 0.82}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Electron cloud for covalent/polar bonds ──────────────────────────────────

function BondElectrons({
  ax, ay, az, bx, by, bz, type, lightMode,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  type: BondType; lightMode: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    if (pointsRef.current) {
      (pointsRef.current.material as THREE.PointsMaterial).opacity =
        0.5 + 0.4 * Math.sin(t.current * 2.5);
    }
  });

  const { positions, colors } = useMemo(() => {
    if (type === "ionic") return { positions: new Float32Array(0), colors: new Float32Array(0) };
    const n = 18;
    const pos: number[] = [];
    const col: number[] = [];
    const dx = bx-ax, dy = by-ay, dz = bz-az;
    const len = Math.sqrt(dx*dx+dy*dy+dz*dz);
    const ux = dx/len, uy = dy/len, uz = dz/len;
    const eCol = type === "covalent" ? new THREE.Color(0x93c5fd) : new THREE.Color(0xfde68a);
    for (let i = 0; i < n; i++) {
      const t = (i / (n-1));
      const x = ax + ux * t * len + (Math.random()-0.5) * 0.08;
      const y = ay + uy * t * len + (Math.random()-0.5) * 0.08;
      const z = az + uz * t * len + (Math.random()-0.5) * 0.08;
      pos.push(x, y, z);
      col.push(eCol.r, eCol.g, eCol.b);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ax, ay, az, bx, by, bz, type]);

  if (type === "ionic" || positions.length === 0) return null;
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.06}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={lightMode ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Atom sphere ──────────────────────────────────────────────────────────────

function AtomSphere({
  elem, x, y, pz, lightMode, showLabel,
}: {
  elem: number; x: number; y: number; pz: number; lightMode: boolean; showLabel: boolean;
}) {
  const col   = new THREE.Color(getAtomColor(elem));
  const r     = getAtomRadius(elem);
  const sym   = EXTENDED[elem]?.config ? String.fromCharCode(64 + elem) : `Z${elem}`;
  // Get actual symbol
  const symbol = getSymbol(elem);

  return (
    <mesh position={[x, y, pz]}>
      <sphereGeometry args={[r, 22, 16]} />
      <meshStandardMaterial
        color={col}
        emissive={col}
        emissiveIntensity={lightMode ? 0.05 : 0.20}
        roughness={0.30}
        metalness={lightMode ? 0.05 : 0.25}
      />
      {showLabel && (
        <Html center distanceFactor={5} style={{ pointerEvents: "none" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            color: lightMode ? "#111" : "#eee",
            background: lightMode ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)",
            padding: "1px 4px",
            borderRadius: "4px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}>
            {symbol}
          </span>
        </Html>
      )}
    </mesh>
  );
}

// Helper: get element symbol from Z
function getSymbol(z: number): string {
  const syms: Record<number, string> = {
    1:"H",2:"He",3:"Li",4:"Be",5:"B",6:"C",7:"N",8:"O",9:"F",10:"Ne",
    11:"Na",12:"Mg",13:"Al",14:"Si",15:"P",16:"S",17:"Cl",18:"Ar",
    19:"K",20:"Ca",26:"Fe",29:"Cu",47:"Ag",79:"Au",82:"Pb",
  };
  return syms[z] ?? `Z${z}`;
}

// ─── Scene content ────────────────────────────────────────────────────────────

function MolContent({ molecule, lightMode }: { molecule: Molecule; lightMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Bonds (behind atoms) */}
      {molecule.bonds.map((b, i) => {
        const a = molecule.atoms[b.a]!;
        const bAtom = molecule.atoms[b.b]!;
        return (
          <group key={i}>
            <Bond
              ax={a.x} ay={a.y} az={a.pz}
              bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
              order={b.order} type={b.type} lightMode={lightMode}
            />
            <BondElectrons
              ax={a.x} ay={a.y} az={a.pz}
              bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
              type={b.type} lightMode={lightMode}
            />
          </group>
        );
      })}
      {/* Atoms */}
      {molecule.atoms.map((a, i) => (
        <AtomSphere
          key={i}
          elem={a.elem} x={a.x} y={a.y} pz={a.pz}
          lightMode={lightMode}
          showLabel={molecule.atoms.length <= 12}
        />
      ))}
    </group>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function MoleculeScene({
  molecule, lightMode = false, lightBg = "#e8ecf5", className,
}: {
  molecule: Molecule;
  lightMode?: boolean;
  lightBg?: string;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 200, position: [0, 1, 6] }}
    >
      {!lightMode && <color attach="background" args={["#060610"]} />}
      {lightMode  && <color attach="background" args={[lightBg as `#${string}`]} />}

      {lightMode ? (
        <>
          <ambientLight intensity={2.2} />
          <directionalLight position={[4, 6, 4]} intensity={0.5} />
          <pointLight position={[-3, -2, -3]} intensity={0.2} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.35} />
          <pointLight position={[5, 5, 5]} intensity={1.3} />
          <pointLight position={[-4, -3, -4]} intensity={0.5} color="#4060ff" />
        </>
      )}

      <MolContent molecule={molecule} lightMode={lightMode} />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        minDistance={2}
        maxDistance={20}
      />

      {!lightMode && (
        <EffectComposer>
          <Bloom intensity={1.0} luminanceThreshold={0.18} luminanceSmoothing={0.7} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
