"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Molecule, BondType } from "@/lib/molecules-data";

export type MolViewMode = "ball-stick" | "space-filling";

// ─── Atom color palette (CPK-like) ───────────────────────────────────────────

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

// ─── Sphere radii ─────────────────────────────────────────────────────────────
// Ball-stick: ~55% VdW. Space-filling: full VdW (Three.js relative units).

const BALL_STICK_R: Record<number, number> = {
  1: 0.22, 6: 0.34, 7: 0.30, 8: 0.28, 9: 0.26,
  11: 0.48, 12: 0.42, 13: 0.40, 14: 0.38, 15: 0.38,
  16: 0.36, 17: 0.36, 19: 0.52, 20: 0.46, 26: 0.42,
  29: 0.40, 47: 0.44, 79: 0.44, 82: 0.46,
};

const SPACE_FILL_R: Record<number, number> = {
  1: 0.48, 6: 0.70, 7: 0.63, 8: 0.62, 9: 0.60,
  11: 0.92, 12: 0.70, 13: 0.75, 14: 0.85, 15: 0.73,
  16: 0.73, 17: 0.71, 19: 1.11, 20: 0.94, 26: 0.83,
  29: 0.80, 47: 0.86, 79: 0.87, 82: 0.82,
};

function getAtomRadius(elem: number, mode: MolViewMode): number {
  if (mode === "space-filling") return SPACE_FILL_R[elem] ?? 0.70;
  return BALL_STICK_R[elem] ?? 0.35;
}

function getAtomColor(elem: number): string {
  return ELEM_COLORS[elem] ?? "#6b7280";
}

// ─── Bond color palette (revised — less pastel) ───────────────────────────────

const BOND_COLOR: Record<BondType, string> = {
  covalent: "#7fb0ff",
  polar:    "#e8c477",
  ionic:    "#c77fa8",
};

// ─── Element symbol lookup ────────────────────────────────────────────────────

function getSymbol(z: number): string {
  const syms: Record<number, string> = {
    1:"H",2:"He",3:"Li",4:"Be",5:"B",6:"C",7:"N",8:"O",9:"F",10:"Ne",
    11:"Na",12:"Mg",13:"Al",14:"Si",15:"P",16:"S",17:"Cl",18:"Ar",
    19:"K",20:"Ca",26:"Fe",29:"Cu",47:"Ag",79:"Au",82:"Pb",
  };
  return syms[z] ?? `Z${z}`;
}

// ─── Vibration seed from formula (fixes identical vib for same-atom-count mols) ─

function hashFormula(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h);
}

// ─── Bond (proper cylinder orientation) ──────────────────────────────────────

function Bond({
  ax, ay, az, bx, by, bz, order, type,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  order: 1 | 2 | 3; type: BondType;
}) {
  const dx = bx-ax, dy = by-ay, dz = bz-az;
  const len = Math.sqrt(dx*dx+dy*dy+dz*dz);
  const mid = new THREE.Vector3((ax+bx)/2, (ay+by)/2, (az+bz)/2);
  const dir = new THREE.Vector3(dx/len, dy/len, dz/len);
  const col = new THREE.Color(BOND_COLOR[type]);

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
            <meshPhysicalMaterial
              color={col}
              emissive={col}
              emissiveIntensity={0.10}
              roughness={0.40}
              metalness={0.10}
              transparent
              opacity={0.82}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Electron cloud points along covalent/polar bonds ────────────────────────

function BondElectrons({
  ax, ay, az, bx, by, bz, type,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  type: BondType;
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
    const eCol = type === "covalent"
      ? new THREE.Color(BOND_COLOR.covalent)
      : new THREE.Color(BOND_COLOR.polar);
    for (let i = 0; i < n; i++) {
      const frac = i / (n - 1);
      pos.push(
        ax + ux * frac * len + (Math.random()-0.5) * 0.08,
        ay + uy * frac * len + (Math.random()-0.5) * 0.08,
        az + uz * frac * len + (Math.random()-0.5) * 0.08,
      );
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
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Atom sphere with SDF label (ball-stick only) ─────────────────────────────

function AtomSphere({
  elem, x, y, pz, mode, showLabel, meshRef,
}: {
  elem: number; x: number; y: number; pz: number;
  mode: MolViewMode; showLabel: boolean;
  meshRef?: (m: THREE.Mesh | null) => void;
}) {
  const col    = new THREE.Color(getAtomColor(elem));
  const r      = getAtomRadius(elem, mode);
  const symbol = getSymbol(elem);

  return (
    <mesh ref={meshRef} position={[x, y, pz]}>
      <sphereGeometry args={[r, 22, 16]} />
      <meshPhysicalMaterial
        color={col}
        emissive={col}
        emissiveIntensity={0.08}
        roughness={mode === "space-filling" ? 0.35 : 0.25}
        metalness={0.0}
        clearcoat={mode === "space-filling" ? 0.30 : 0.60}
        clearcoatRoughness={0.20}
      />
      {showLabel && (
        <Billboard>
          <Text
            position={[0, r + 0.14, 0]}
            fontSize={0.11}
            color="#d8d8e8"
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
          >
            {symbol}
          </Text>
        </Billboard>
      )}
    </mesh>
  );
}

// ─── Vibration parameters — seed derived per-formula ─────────────────────────

interface VibParam {
  freq: number; ampX: number; ampY: number; ampZ: number;
  phX: number; phY: number; phZ: number;
}

function makeVibParams(n: number, seed: number): VibParam[] {
  return Array.from({ length: n }, (_, i) => {
    const s = (seed + i * 7919) >>> 0;
    return {
      freq: 1.2 + (s % 3) * 0.4,
      ampX: 0.025 + (s % 2) * 0.01,
      ampY: 0.020 + (s % 3) * 0.008,
      ampZ: 0.018 + (s % 2) * 0.012,
      phX:  (s * 1.7) % (Math.PI * 2),
      phY:  (s * 2.3) % (Math.PI * 2),
      phZ:  (s * 3.1) % (Math.PI * 2),
    };
  });
}

// ─── Camera auto-fit on molecule change ──────────────────────────────────────
// Molecules are VSEPR-centered at origin, so target stays (0,0,0).
// makeDefault registers OrbitControls in the R3F store.

type ControlsLike = THREE.EventDispatcher & { update(): void };

function CameraAutoFit({ molecule, resetKey }: { molecule: Molecule; resetKey: number }) {
  const { camera, controls } = useThree();
  const oc = controls as ControlsLike | null;

  useEffect(() => {
    const pts = molecule.atoms.map(a => new THREE.Vector3(a.x, a.y, a.pz));
    const box = new THREE.Box3().setFromPoints(pts.length > 0 ? pts : [new THREE.Vector3()]);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const r   = Math.max(sphere.radius, 1.2);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = r / Math.sin(fov / 2) * 1.5;
    camera.position.set(0, dist * 0.15, dist);
    oc?.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [molecule]);

  useEffect(() => {
    if (resetKey === 0) return;
    camera.position.set(0, 0.8, 5.5);
    oc?.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return null;
}

// ─── Scene content ────────────────────────────────────────────────────────────

function MolContent({
  molecule, mode,
}: {
  molecule: Molecule; mode: MolViewMode;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const atomMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);

  const seed      = useMemo(() => hashFormula(molecule.formula), [molecule.formula]);
  const vibParams = useMemo(
    () => makeVibParams(molecule.atoms.length, seed),
    [molecule.atoms.length, seed],
  );

  const showLabel = mode === "ball-stick" && molecule.atoms.length <= 16;

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.12;
    t.current += dt;
    // Vibration only in ball-stick mode
    if (mode === "ball-stick") {
      molecule.atoms.forEach((a, i) => {
        const mesh = atomMeshRefs.current[i];
        const vp   = vibParams[i];
        if (!mesh || !vp) return;
        mesh.position.set(
          a.x  + vp.ampX * Math.sin(vp.freq * t.current + vp.phX),
          a.y  + vp.ampY * Math.sin(vp.freq * 1.3 * t.current + vp.phY),
          a.pz + vp.ampZ * Math.sin(vp.freq * 0.7 * t.current + vp.phZ),
        );
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bonds — hidden in space-filling */}
      {mode === "ball-stick" && molecule.bonds.map((b, i) => {
        const a     = molecule.atoms[b.a]!;
        const bAtom = molecule.atoms[b.b]!;
        return (
          <group key={i}>
            <Bond
              ax={a.x} ay={a.y} az={a.pz}
              bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
              order={b.order} type={b.type}
            />
            <BondElectrons
              ax={a.x} ay={a.y} az={a.pz}
              bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
              type={b.type}
            />
          </group>
        );
      })}
      {/* Atoms */}
      {molecule.atoms.map((a, i) => (
        <AtomSphere
          key={i}
          elem={a.elem} x={a.x} y={a.y} pz={a.pz}
          mode={mode}
          showLabel={showLabel}
          meshRef={(m) => { atomMeshRefs.current[i] = m; }}
        />
      ))}
    </group>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function MoleculeScene({
  molecule,
  viewMode = "ball-stick",
  resetKey = 0,
  className,
}: {
  molecule: Molecule;
  viewMode?: MolViewMode;
  resetKey?: number;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.1, far: 200, position: [0, 0.8, 5.5] }}
    >
      <color attach="background" args={["#09091e"]} />

      {/* 3-point cinematic lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 5, 4]}    intensity={1.4} color="#fff4e6" />
      <pointLight position={[-5, -2, -3]} intensity={0.5} color="#3b5bdb" />
      <directionalLight position={[0, 4, -6]} intensity={0.7} color="#aab8ff" />

      <MolContent molecule={molecule} mode={viewMode} />
      <CameraAutoFit molecule={molecule} resetKey={resetKey} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        minDistance={2}
        maxDistance={20}
      />

      <EffectComposer>
        <Bloom intensity={1.0} luminanceThreshold={0.55} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
