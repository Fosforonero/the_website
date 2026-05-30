"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Molecule, BondType } from "@/lib/molecules-data";

export type MolViewMode = "ball-stick" | "space-filling" | "polarity";

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

// ─── Pauling electronegativity (for polarity mode) ───────────────────────────

const ELEM_EN: Record<number, number> = {
  1: 2.20, 6: 2.55, 7: 3.04, 8: 3.44, 9: 3.98,
  11: 0.93, 12: 1.31, 13: 1.61, 14: 1.90, 15: 2.19,
  16: 2.58, 17: 3.16, 19: 0.82, 20: 1.00,
  26: 1.83, 29: 1.90, 47: 1.93, 79: 2.54, 82: 2.33,
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
  ax, ay, az, bx, by, bz, order, type, opacity = 0.82,
}: {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  order: 1 | 2 | 3; type: BondType; opacity?: number;
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
              opacity={opacity}
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

// ─── Polarity helpers ─────────────────────────────────────────────────────────

type PolarLabel = "polar" | "apolar" | "apolarSymmetric" | "homopolar";

function computePolarityData(molecule: Molecule): {
  atomDeltas: number[];
  dipoleVec: THREE.Vector3;
  label: PolarLabel;
} {
  const n          = molecule.atoms.length;
  const accumDelta = new Array<number>(n).fill(0);
  const bondCount  = new Array<number>(n).fill(0);
  const dipoleVec  = new THREE.Vector3();
  let hasPolarBonds = false;
  let allHomopolar  = true;

  for (const b of molecule.bonds) {
    const atomA = molecule.atoms[b.a]!;
    const atomB = molecule.atoms[b.b]!;
    const enA   = ELEM_EN[atomA.elem] ?? 2.0;
    const enB   = ELEM_EN[atomB.elem] ?? 2.0;
    const dEN   = enB - enA; // positive → B more EN (δ−), A δ+
    const frac  = Math.tanh(Math.abs(dEN) / 2.0);

    if (frac > 0.05) hasPolarBonds = true;
    if (b.type !== "covalent" || frac > 0.05) allHomopolar = false;

    // signed delta: positive = δ−, negative = δ+
    accumDelta[b.a] = (accumDelta[b.a] ?? 0) - Math.sign(dEN) * frac;
    accumDelta[b.b] = (accumDelta[b.b] ?? 0) + Math.sign(dEN) * frac;
    bondCount[b.a]  = (bondCount[b.a]  ?? 0) + 1;
    bondCount[b.b]  = (bondCount[b.b]  ?? 0) + 1;

    // bond dipole vector points from δ+ toward δ− (chemistry convention)
    const vec = new THREE.Vector3(
      atomB.x - atomA.x, atomB.y - atomA.y, atomB.pz - atomA.pz,
    ).normalize();
    dipoleVec.addScaledVector(vec, (dEN > 0 ? 1 : -1) * frac * b.order);
  }

  const atomDeltas = accumDelta.map((d, i) => d / Math.max(bondCount[i] ?? 1, 1));
  const isPolar    = dipoleVec.length() > 0.15;
  const label: PolarLabel =
    allHomopolar    ? "homopolar"
    : isPolar       ? "polar"
    : hasPolarBonds ? "apolarSymmetric"
    :                 "apolar";

  return { atomDeltas, dipoleVec, label };
}

export function getMolPolarLabel(molecule: Molecule): PolarLabel {
  return computePolarityData(molecule).label;
}

function deltaToColor(delta: number): THREE.Color {
  const base = new THREE.Color("#8899aa");
  const t = Math.max(-1, Math.min(1, delta));
  if (t >= 0) return base.clone().lerp(new THREE.Color("#dc2626"), t);  // δ− red
  return base.clone().lerp(new THREE.Color("#2563eb"), -t);             // δ+ blue
}

// ─── Dipole arrow (cylinder shaft + cone head) ────────────────────────────────

function DipoleArrow({ dipoleVec }: { dipoleVec: THREE.Vector3 }) {
  const dir  = dipoleVec.clone().normalize();
  const len  = Math.min(dipoleVec.length() * 1.4, 2.0);
  const shL  = len * 0.72;
  const hdL  = len * 0.28;
  const col  = "#c77fa8";
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const shPos: [number, number, number] = [dir.x*shL/2, dir.y*shL/2, dir.z*shL/2];
  const hdPos: [number, number, number] = [dir.x*(shL+hdL/2), dir.y*(shL+hdL/2), dir.z*(shL+hdL/2)];
  return (
    <>
      <mesh position={shPos} quaternion={quat}>
        <cylinderGeometry args={[0.04, 0.04, shL, 8]} />
        <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={0.35}
          roughness={0.30} metalness={0.10} />
      </mesh>
      <mesh position={hdPos} quaternion={quat}>
        <coneGeometry args={[0.10, hdL, 8]} />
        <meshPhysicalMaterial color={col} emissive={col} emissiveIntensity={0.35}
          roughness={0.30} metalness={0.10} />
      </mesh>
    </>
  );
}

// ─── Lone pair blob ───────────────────────────────────────────────────────────

function LonePair({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.18, 10, 8]} />
      <meshPhysicalMaterial
        color="#67e8f9"
        emissive="#67e8f9"
        emissiveIntensity={0.45}
        transparent
        opacity={0.42}
        roughness={0.10}
        metalness={0}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Atom sphere with SDF label (ball-stick only) ─────────────────────────────

function AtomSphere({
  elem, x, y, pz, mode, showLabel, meshRef, deltaValue,
}: {
  elem: number; x: number; y: number; pz: number;
  mode: MolViewMode; showLabel: boolean;
  meshRef?: (m: THREE.Mesh | null) => void;
  deltaValue?: number;
}) {
  const baseCol = new THREE.Color(getAtomColor(elem));
  const col     = (mode === "polarity" && deltaValue !== undefined)
    ? deltaToColor(deltaValue) : baseCol;
  const r      = getAtomRadius(elem, mode);
  const symbol = getSymbol(elem);

  const showDeltaLabel  = mode === "polarity" && deltaValue !== undefined && Math.abs(deltaValue) > 0.15;
  const deltaLabelText  = (deltaValue ?? 0) > 0 ? "δ−" : "δ+";
  const deltaLabelColor = (deltaValue ?? 0) > 0 ? "#ff6b6b" : "#74c0fc";

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
      {showDeltaLabel && (
        <Billboard>
          <Text
            position={[0, r + 0.14, 0]}
            fontSize={0.10}
            color={deltaLabelColor}
            anchorX="center"
            anchorY="middle"
            depthOffset={-1}
          >
            {deltaLabelText}
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

  const polarData = useMemo(
    () => (mode === "polarity" ? computePolarityData(molecule) : null),
    [molecule, mode],
  );

  const showLabel = mode === "ball-stick" && molecule.atoms.length <= 16;

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.12;
    t.current += dt;
    // Vibration in ball-stick and polarity modes
    if (mode === "ball-stick" || mode === "polarity") {
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
      {/* Bonds — hidden in space-filling; dimmed in polarity */}
      {mode !== "space-filling" && molecule.bonds.map((b, i) => {
        const a     = molecule.atoms[b.a]!;
        const bAtom = molecule.atoms[b.b]!;
        return (
          <group key={i}>
            <Bond
              ax={a.x} ay={a.y} az={a.pz}
              bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
              order={b.order} type={b.type}
              opacity={mode === "polarity" ? 0.45 : 0.82}
            />
            {mode === "ball-stick" && (
              <BondElectrons
                ax={a.x} ay={a.y} az={a.pz}
                bx={bAtom.x} by={bAtom.y} bz={bAtom.pz}
                type={b.type}
              />
            )}
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
          deltaValue={polarData?.atomDeltas[i]}
        />
      ))}
      {/* Polarity extras: dipole arrow + lone pairs */}
      {mode === "polarity" && polarData && (
        <>
          {polarData.dipoleVec.length() > 0.15 && (
            <DipoleArrow dipoleVec={polarData.dipoleVec} />
          )}
          {molecule.lonePairs?.map((lp, i) => (
            <LonePair key={i} x={lp.x} y={lp.y} z={lp.z} />
          ))}
        </>
      )}
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
