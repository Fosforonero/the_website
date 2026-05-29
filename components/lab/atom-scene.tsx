"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Element } from "@/lib/elements-data";
import { EXTENDED } from "@/lib/element-extended-data";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AtomModel = "thomson" | "rutherford" | "bohr" | "sommerfeld" | "quantum";
export type VdWStyle  = "off" | "wire" | "glass";

// ─── Constants ───────────────────────────────────────────────────────────────

const C_PROTON   = new THREE.Color(0xff5a4e);
const C_NEUTRON  = new THREE.Color(0xf5c842);
const C_ELECTRON = new THREE.Color(0x60a5fa);
const C_ELECTRON_LIGHT = new THREE.Color(0x1d4ed8);
const C_SPIN_UP   = new THREE.Color(0xf97316); // ↑ orange
const C_SPIN_DOWN = new THREE.Color(0xa78bfa); // ↓ violet

// Orbital type colors: s=amber, p=blue, d=emerald, f=purple
const L_COLORS_DARK = [
  new THREE.Color(0xf59e0b), // s
  new THREE.Color(0x60a5fa), // p
  new THREE.Color(0x34d399), // d
  new THREE.Color(0xc084fc), // f
] as [THREE.Color, THREE.Color, THREE.Color, THREE.Color];

const L_COLORS_LIGHT = [
  new THREE.Color(0xb45309), // s
  new THREE.Color(0x1d4ed8), // p
  new THREE.Color(0x059669), // d
  new THREE.Color(0x7c3aed), // f
] as [THREE.Color, THREE.Color, THREE.Color, THREE.Color];

const SHELL_BASE_R: number[] = [1.2, 2.1, 3.0, 3.9, 4.8, 5.7, 6.6];
const SHELL_SPEEDS: number[] = [1.0, 0.60, 0.38, 0.25, 0.18, 0.13, 0.10];
const SHELL_TILTS: [number, number, number][] = [
  [Math.PI / 2 + 0.12, 0, 0],
  [Math.PI / 3, Math.PI / 4, 0],
  [Math.PI / 6, -Math.PI / 4, Math.PI / 3],
  [Math.PI / 2.4, Math.PI / 2.8, -Math.PI / 6],
  [Math.PI / 5, Math.PI / 3, Math.PI / 4],
  [Math.PI / 4, -Math.PI / 5, -Math.PI / 3],
  [Math.PI / 3, Math.PI / 6, Math.PI / 5],
];
const SHELL_CAPS: number[] = [2, 8, 18, 32, 32, 18, 8];
const TRAIL_LEN = 32;

const SCALE_NORMAL = { radiusMul: 1.0, nucleonScale: 1.0, electronScale: 1.0 };
const SCALE_REAL   = { radiusMul: 3.6, nucleonScale: 0.25, electronScale: 0.35 };

// Shared geometry (never disposed — app lifetime)
const nucleonGeo   = new THREE.SphereGeometry(0.17, 16, 10);
const electronGeo  = new THREE.SphereGeometry(0.09, 12, 8);
const spinArrowGeo = new THREE.ConeGeometry(0.045, 0.13, 6);

// ─── Math helpers ─────────────────────────────────────────────────────────────

function nucleusRadius(z: number, n: number) {
  return 0.30 + Math.pow(z + n, 1 / 3) * 0.095;
}

function gaussRandom() {
  const u1 = Math.max(Math.random(), 1e-6);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * Math.random());
}

/** Newton's method solution to Kepler's equation: M = E − ε·sin(E) */
function solveKepler(M: number, ecc: number): number {
  if (ecc < 1e-9) return M;
  let E = M + ecc * Math.sin(M);
  for (let i = 0; i < 8; i++) {
    const dE = (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

function computeShellFills(z: number): number[] {
  const fills: number[] = [];
  let rem = z;
  for (let i = 0; i < 7 && rem > 0; i++) {
    const k = Math.min(SHELL_CAPS[i]!, rem);
    fills.push(k); rem -= k;
  }
  return fills;
}

// ─── Nucleus ─────────────────────────────────────────────────────────────────

function Nucleus({ z, n, scaleMul, lightMode = false }: { z: number; n: number; scaleMul: number; lightMode?: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const total = z + n;

  const { positions, isProton, r } = useMemo(() => {
    const r = nucleusRadius(z, n);
    const positions: THREE.Vector3[] = [];
    const isProton: boolean[] = [];
    const protonIdxs = new Set<number>();
    while (protonIdxs.size < z) protonIdxs.add(Math.floor(Math.random() * total));
    for (let i = 0; i < total; i++) {
      let pos = new THREE.Vector3();
      for (let a = 0; a < 80; a++) {
        const v = new THREE.Vector3(
          Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1,
        );
        if (v.lengthSq() > 1) continue;
        v.multiplyScalar(r);
        if (positions.every(p => p.distanceTo(v) >= 0.21)) { pos = v; break; }
      }
      positions.push(pos);
      isProton.push(protonIdxs.has(i));
    }
    return { positions, isProton, r };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, z]);

  useFrame((_, dt) => {
    groupRef.current.rotation.y += dt * 0.20;
    groupRef.current.rotation.x += dt * 0.07;
  });

  const glowFactor = Math.min(1, Math.log(total + 1) / 4);

  return (
    <group ref={groupRef} scale={[scaleMul, scaleMul, scaleMul]}>
      {positions.map((pos, i) => (
        <mesh key={i} geometry={nucleonGeo} position={pos}>
          <meshStandardMaterial
            color={isProton[i] ? C_PROTON : C_NEUTRON}
            emissive={isProton[i] ? C_PROTON : C_NEUTRON}
            emissiveIntensity={0.55}
            roughness={0.3} metalness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Thomson (1904) — plum pudding ───────────────────────────────────────────

function ThomsonAtom({ el, reduced, lightMode }: {
  el: Element; reduced: boolean; lightMode: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const pudR = 1.0 + Math.cbrt(el.z) * 0.38;

  const electronPositions = useMemo<THREE.Vector3[]>(() => {
    const positions: THREE.Vector3[] = [];
    const n = el.z;
    const r = pudR * 0.72;
    const phi = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / Math.max(n - 1, 1)) * 2;
      const sinT = Math.sqrt(1 - y * y);
      const theta = phi * i;
      positions.push(new THREE.Vector3(r * sinT * Math.cos(theta), r * y, r * sinT * Math.sin(theta)));
    }
    return positions;
  }, [el.z, pudR]);

  const vibPhases = useMemo(
    () => Array.from({ length: el.z }, () => [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2] as [number, number, number]),
    [el.z],
  );

  const objectsRef = useRef<{ electrons: THREE.Mesh[] } | null>(null);

  useEffect(() => {
    const g = groupRef.current;
    const eColor = lightMode ? C_ELECTRON_LIGHT : C_ELECTRON;

    // Pudding sphere (wireframe + soft surface)
    const puddingMat = new THREE.MeshStandardMaterial({
      color: "#f5c842", emissive: "#f59842",
      emissiveIntensity: lightMode ? 0.1 : 0.18,
      transparent: true, opacity: lightMode ? 0.07 : 0.08,
      depthWrite: false, side: THREE.DoubleSide,
    });
    const pudding = new THREE.Mesh(new THREE.SphereGeometry(pudR, 28, 28), puddingMat);
    g.add(pudding);

    // Inner wireframe grid
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#f5c842", wireframe: true, transparent: true,
      opacity: lightMode ? 0.06 : 0.05,
    });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(pudR, 12, 10), wireMat));

    // Electrons
    const electrons: THREE.Mesh[] = [];
    for (const pos of electronPositions) {
      const m = new THREE.Mesh(electronGeo, new THREE.MeshStandardMaterial({
        color: eColor, emissive: eColor,
        emissiveIntensity: lightMode ? 0.8 : 2.0, roughness: 0.1,
      }));
      m.position.copy(pos);
      g.add(m);
      electrons.push(m);
    }
    objectsRef.current = { electrons };

    return () => {
      g.clear();
      puddingMat.dispose(); wireMat.dispose();
      electrons.forEach(m => (m.material as THREE.Material).dispose());
      objectsRef.current = null;
    };
  }, [el.z, pudR, lightMode, electronPositions]);

  useFrame((state, dt) => {
    if (!objectsRef.current) return;
    if (!reduced) groupRef.current.rotation.y += dt * 0.10;
    const t = state.clock.elapsedTime;
    const { electrons } = objectsRef.current;
    const vib = 0.035;
    electrons.forEach((m, i) => {
      const bp = electronPositions[i]!;
      const [px, py, pz] = vibPhases[i]!;
      m.position.set(
        bp.x + vib * Math.sin(t * 2.0 + px),
        bp.y + vib * Math.sin(t * 1.7 + py),
        bp.z + vib * Math.sin(t * 2.3 + pz),
      );
    });
  });

  return <group ref={groupRef} />;
}

// ─── Rutherford (1911) — planetary ───────────────────────────────────────────

type RuthOrbit = {
  r: number; u: THREE.Vector3; v: THREE.Vector3; phase: number; speed: number;
};

function randomRuthOrbit(baseR: number): RuthOrbit {
  const r = baseR * (0.55 + Math.random() * 0.9);
  const n = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
  let u = new THREE.Vector3(1, 0, 0);
  if (Math.abs(n.x) > 0.92) u.set(0, 1, 0);
  u.sub(n.clone().multiplyScalar(u.dot(n))).normalize();
  const v = new THREE.Vector3().crossVectors(n, u).normalize();
  return { r, u, v, phase: Math.random() * Math.PI * 2, speed: (0.4 + Math.random() * 0.5) / Math.sqrt(r) };
}

function RutherfordAtom({ el, radiusMul, reduced, speedMul, lightMode, showSpin }: {
  el: Element; radiusMul: number; reduced: boolean; speedMul: number; lightMode: boolean; showSpin: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const tRef = useRef(0);
  const speedMulRef = useRef(speedMul);
  speedMulRef.current = speedMul;
  const showSpinRef = useRef(showSpin);
  showSpinRef.current = showSpin;
  const baseR = 1.6 * radiusMul;

  const orbits = useMemo<RuthOrbit[]>(
    () => Array.from({ length: el.z }, () => randomRuthOrbit(baseR)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [el.z, baseR],
  );

  const objectsRef = useRef<{
    electrons: THREE.Mesh[]; spinArrows: THREE.Mesh[]; orbitNormals: THREE.Vector3[];
  } | null>(null);

  useEffect(() => {
    const g = groupRef.current;
    const eColor = lightMode ? C_ELECTRON_LIGHT : C_ELECTRON;
    const ringColor = lightMode ? "#19191a" : "#ffffff";
    const ringOpacity = lightMode ? 0.07 : 0.05;

    const electrons: THREE.Mesh[] = [];
    const spinArrows: THREE.Mesh[] = [];
    const orbitNormals: THREE.Vector3[] = [];
    for (let i = 0; i < orbits.length; i++) {
      const orbit = orbits[i]!;
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 96; k++) {
        const a = (k / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3()
          .copy(orbit.u).multiplyScalar(Math.cos(a) * orbit.r)
          .addScaledVector(orbit.v, Math.sin(a) * orbit.r));
      }
      g.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: ringColor, transparent: true, opacity: ringOpacity }),
      ));
      const m = new THREE.Mesh(electronGeo, new THREE.MeshStandardMaterial({
        color: eColor, emissive: eColor, emissiveIntensity: lightMode ? 0.8 : 2.2, roughness: 0.1,
      }));
      g.add(m); electrons.push(m);

      const n = new THREE.Vector3().crossVectors(orbit.u, orbit.v).normalize();
      orbitNormals.push(n);
      const isUp = i % 2 === 0;
      const dir = isUp ? n.clone() : n.clone().negate();
      const arrow = new THREE.Mesh(spinArrowGeo, new THREE.MeshStandardMaterial({
        color: isUp ? C_SPIN_UP : C_SPIN_DOWN,
        emissive: isUp ? C_SPIN_UP : C_SPIN_DOWN,
        emissiveIntensity: lightMode ? 0.5 : 1.4,
        roughness: 0.2,
      }));
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      arrow.visible = false;
      g.add(arrow); spinArrows.push(arrow);
    }
    objectsRef.current = { electrons, spinArrows, orbitNormals };
    return () => {
      g.clear();
      electrons.forEach(m => (m.material as THREE.Material).dispose());
      spinArrows.forEach(a => (a.material as THREE.Material).dispose());
      objectsRef.current = null;
    };
  }, [el.z, baseR, lightMode, orbits]);

  useFrame((_, dt) => {
    if (!objectsRef.current) return;
    if (!reduced) tRef.current += dt * speedMulRef.current;
    const t = tRef.current;
    const { electrons, spinArrows, orbitNormals } = objectsRef.current;
    const doSpin = showSpinRef.current;
    electrons.forEach((m, i) => {
      const o = orbits[i]!;
      const a = o.phase + t * o.speed;
      m.position.copy(o.u).multiplyScalar(Math.cos(a) * o.r)
        .addScaledVector(o.v, Math.sin(a) * o.r);
      const arrow = spinArrows[i];
      if (arrow) {
        arrow.visible = doSpin;
        if (doSpin) {
          const n = orbitNormals[i]!;
          const sign = i % 2 === 0 ? 1 : -1;
          arrow.position.set(
            m.position.x + n.x * 0.22 * sign,
            m.position.y + n.y * 0.22 * sign,
            m.position.z + n.z * 0.22 * sign,
          );
        }
      }
    });
  });

  return <group ref={groupRef} />;
}

// ─── Bohr (1913) — circular quantized orbits ─────────────────────────────────

function BohrOrbit({ shellIdx, count, radiusMul, eMul, reduced, speedMul, lightMode, showSpin }: {
  shellIdx: number; count: number; radiusMul: number; eMul: number;
  reduced: boolean; speedMul: number; lightMode: boolean; showSpin: boolean;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const phaseRef  = useRef(0);
  const speedRef  = useRef(0);
  const showSpinRef = useRef(showSpin);
  showSpinRef.current = showSpin;

  const r         = (SHELL_BASE_R[shellIdx] ?? SHELL_BASE_R.at(-1)!) * radiusMul;
  const tilt      = SHELL_TILTS[shellIdx] ?? SHELL_TILTS.at(-1)!;
  const baseSpeed = SHELL_SPEEDS[shellIdx] ?? 0.09;
  speedRef.current = baseSpeed * speedMul;

  const objectsRef = useRef<{
    ring: THREE.Line;
    electrons: THREE.Mesh[]; trails: THREE.Line[];
    trailPosArr: Float32Array[]; histories: THREE.Vector3[][];
    spinArrows: THREE.Mesh[];
  } | null>(null);

  useEffect(() => {
    const g = groupRef.current;
    const eColor  = lightMode ? C_ELECTRON_LIGHT : C_ELECTRON;
    const ringCol = lightMode ? "#19191a" : "#ffffff";

    const ringPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: ringCol, transparent: true, opacity: lightMode ? 0.09 : 0.07 }),
    );
    g.add(ring);

    const electrons: THREE.Mesh[]    = [];
    const trails:    THREE.Line[]    = [];
    const trailPosArr: Float32Array[] = [];
    const histories: THREE.Vector3[][] = [];
    const spinArrows: THREE.Mesh[]    = [];

    for (let k = 0; k < count; k++) {
      const arr = new Float32Array(TRAIL_LEN * 3);
      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      const tLine = new THREE.Line(tGeo,
        new THREE.LineBasicMaterial({ color: eColor, transparent: true, opacity: lightMode ? 0.18 : 0.22 }));
      g.add(tLine); trails.push(tLine); trailPosArr.push(arr);
      histories.push(Array.from({ length: TRAIL_LEN }, () => new THREE.Vector3()));

      const m = new THREE.Mesh(electronGeo, new THREE.MeshStandardMaterial({
        color: eColor, emissive: eColor, emissiveIntensity: lightMode ? 0.8 : 2.2, roughness: 0.1,
      }));
      m.scale.setScalar(eMul);
      g.add(m); electrons.push(m);

      // Spin arrow: cone pointing ±Z (perpendicular to orbit plane)
      // Even index = spin ↑ (+Z), odd = spin ↓ (-Z)  — simplified Pauli model
      const isUp = k % 2 === 0;
      const arrow = new THREE.Mesh(
        spinArrowGeo,
        new THREE.MeshStandardMaterial({
          color: isUp ? C_SPIN_UP : C_SPIN_DOWN,
          emissive: isUp ? C_SPIN_UP : C_SPIN_DOWN,
          emissiveIntensity: lightMode ? 0.5 : 1.4,
          roughness: 0.2,
        }),
      );
      // ConeGeometry points along +Y by default; rotate to ±Z
      arrow.rotation.x = isUp ? -Math.PI / 2 : Math.PI / 2;
      arrow.scale.setScalar(eMul * 1.1);
      arrow.visible = false;
      g.add(arrow); spinArrows.push(arrow);
    }
    objectsRef.current = { ring, electrons, trails, trailPosArr, histories, spinArrows };

    return () => {
      g.clear();
      ring.geometry.dispose(); (ring.material as THREE.Material).dispose();
      trails.forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
      electrons.forEach(m => (m.material as THREE.Material).dispose());
      spinArrows.forEach(a => (a.material as THREE.Material).dispose());
      objectsRef.current = null;
    };
  }, [count, r, eMul, lightMode]);

  useFrame((state, dt) => {
    if (!objectsRef.current) return;
    if (!reduced) phaseRef.current += dt * speedRef.current;
    const { ring, electrons, trails, trailPosArr, histories, spinArrows } = objectsRef.current;
    // breathing
    (ring.material as THREE.LineBasicMaterial).opacity =
      (lightMode ? 0.07 : 0.05) + 0.03 * Math.sin(state.clock.elapsedTime * 0.8 + shellIdx);

    const doSpin = showSpinRef.current;
    for (let k = 0; k < count; k++) {
      const a = phaseRef.current + (k / count) * Math.PI * 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      electrons[k]?.position.set(x, y, 0);
      const hist = histories[k]!;
      hist.shift(); hist.push(new THREE.Vector3(x, y, 0));
      const arr = trailPosArr[k]!;
      for (let t = 0; t < TRAIL_LEN; t++) {
        const p = hist[t]!;
        arr[t * 3] = p.x; arr[t * 3 + 1] = p.y; arr[t * 3 + 2] = p.z;
      }
      (trails[k]!.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Position spin arrow above/below electron in local Z
      const arrow = spinArrows[k];
      if (arrow) {
        arrow.visible = doSpin;
        if (doSpin) {
          const zOff = k % 2 === 0 ? 0.22 : -0.22;
          arrow.position.set(x, y, zOff);
        }
      }
    }
  });

  return <group ref={groupRef} rotation={tilt} />;
}

function BohrAtom({ el, radiusMul, eMul, reduced, speedMul, lightMode, showSpin }: {
  el: Element; radiusMul: number; eMul: number;
  reduced: boolean; speedMul: number; lightMode: boolean; showSpin: boolean;
}) {
  const fills = useMemo(() => computeShellFills(el.z), [el.z]);
  return (
    <>
      {fills.map((c, i) => (
        <BohrOrbit key={i} shellIdx={i} count={c} radiusMul={radiusMul} eMul={eMul}
          reduced={reduced} speedMul={speedMul} lightMode={lightMode} showSpin={showSpin} />
      ))}
    </>
  );
}

// ─── Sommerfeld (1916) — elliptical Keplerian orbits ─────────────────────────

interface SubOrbital {
  shellIdx: number; k: number;
  a: number; b: number; ecc: number;
  tilt: [number, number, number];
  electronCount: number;
  speed: number;
}

function buildSommerfeldConfig(shellFills: number[], radiusMul: number): SubOrbital[] {
  const result: SubOrbital[] = [];
  shellFills.forEach((total, shellIdx) => {
    const n = shellIdx + 1;
    const numSubOrbits = Math.min(n, 4); // cap for visual clarity
    let remaining = total;
    for (let k = 1; k <= numSubOrbits; k++) {
      const isLast = k === numSubOrbits;
      const electrons = isLast ? remaining : Math.ceil(remaining / (numSubOrbits - k + 1));
      if (electrons <= 0) continue;
      const a = (SHELL_BASE_R[shellIdx] ?? SHELL_BASE_R.at(-1)!) * radiusMul;
      const kOverN = k / n;
      const ecc = Math.sqrt(Math.max(0, 1 - kOverN * kOverN));
      const baseTilt = SHELL_TILTS[shellIdx] ?? SHELL_TILTS.at(-1)!;
      result.push({
        shellIdx, k, a, b: a * kOverN, ecc,
        tilt: [baseTilt[0] + k * 0.44, baseTilt[1] + k * 0.60, baseTilt[2] + k * 0.35],
        electronCount: electrons,
        speed: SHELL_SPEEDS[shellIdx] ?? 0.1,
      });
      remaining -= electrons;
    }
  });
  return result;
}

function SommerfeldAtom({ el, radiusMul, reduced, speedMul, lightMode, showSpin }: {
  el: Element; radiusMul: number; reduced: boolean; speedMul: number; lightMode: boolean; showSpin: boolean;
}) {
  const groupRef    = useRef<THREE.Group>(null!);
  const speedMulRef = useRef(speedMul);
  speedMulRef.current = speedMul;
  const showSpinRef = useRef(showSpin);
  showSpinRef.current = showSpin;

  const shellFills = useMemo(() => computeShellFills(el.z), [el.z]);
  const config     = useMemo(() => buildSommerfeldConfig(shellFills, radiusMul), [shellFills, radiusMul]);

  const totalE = config.reduce((s, o) => s + o.electronCount, 0);
  const phasesRef = useRef<Float32Array>(new Float32Array(totalE));
  if (phasesRef.current.length !== totalE) {
    phasesRef.current = new Float32Array(totalE).map(() => Math.random() * Math.PI * 2);
  }

  const objectsRef = useRef<{
    orbitGroups: THREE.Group[];
    electronArrays: THREE.Mesh[][];
    spinArrowArrays: THREE.Mesh[][];
  } | null>(null);

  useEffect(() => {
    const g = groupRef.current;
    const eColor  = lightMode ? C_ELECTRON_LIGHT : C_ELECTRON;
    const ringCol = lightMode ? "#19191a" : "#ffffff";
    const ringOp  = lightMode ? 0.09 : 0.06;

    const orbitGroups:    THREE.Group[]   = [];
    const electronArrays: THREE.Mesh[][]  = [];
    const spinArrowArrays: THREE.Mesh[][] = [];
    let globalEIdx = 0;

    for (const orbit of config) {
      const og = new THREE.Group();
      og.rotation.set(...orbit.tilt);
      g.add(og);

      // Ellipse path — parameterised by eccentric anomaly E
      // With nucleus at right focus: x = a·cos(E) − a·ε, y = b·sin(E)
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        const E = (i / 160) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          orbit.a * Math.cos(E) - orbit.a * orbit.ecc,
          orbit.b * Math.sin(E),
          0,
        ));
      }
      og.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: ringCol, transparent: true, opacity: ringOp }),
      ));

      const electrons: THREE.Mesh[]  = [];
      const spinArrows: THREE.Mesh[] = [];
      for (let i = 0; i < orbit.electronCount; i++) {
        const m = new THREE.Mesh(electronGeo, new THREE.MeshStandardMaterial({
          color: eColor, emissive: eColor,
          emissiveIntensity: lightMode ? 0.8 : 2.2, roughness: 0.1,
        }));
        og.add(m); electrons.push(m);

        const isUp = (globalEIdx + i) % 2 === 0;
        const arrow = new THREE.Mesh(spinArrowGeo, new THREE.MeshStandardMaterial({
          color: isUp ? C_SPIN_UP : C_SPIN_DOWN,
          emissive: isUp ? C_SPIN_UP : C_SPIN_DOWN,
          emissiveIntensity: lightMode ? 0.5 : 1.4,
          roughness: 0.2,
        }));
        arrow.rotation.x = isUp ? -Math.PI / 2 : Math.PI / 2;
        arrow.visible = false;
        og.add(arrow); spinArrows.push(arrow);
      }
      globalEIdx += orbit.electronCount;
      orbitGroups.push(og);
      electronArrays.push(electrons);
      spinArrowArrays.push(spinArrows);
    }
    objectsRef.current = { orbitGroups, electronArrays, spinArrowArrays };

    return () => {
      g.clear();
      orbitGroups.forEach(og => {
        og.traverse(obj => {
          if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else (obj.material as THREE.Material)?.dispose();
          }
        });
      });
      objectsRef.current = null;
    };
  }, [config, lightMode]);

  useFrame((_, dt) => {
    if (!objectsRef.current) return;
    const mul = speedMulRef.current;
    const { electronArrays, spinArrowArrays } = objectsRef.current;
    const phases = phasesRef.current;
    const doSpin = showSpinRef.current;

    let eIdx = 0;
    config.forEach((orbit, oi) => {
      const electrons  = electronArrays[oi]!;
      const spinArrows = spinArrowArrays[oi]!;
      if (!reduced) {
        for (let i = 0; i < orbit.electronCount; i++) {
          phases[eIdx + i] = ((phases[eIdx + i] ?? 0) + dt * orbit.speed * mul) % (Math.PI * 2);
        }
      }
      for (let i = 0; i < orbit.electronCount; i++) {
        const M = ((phases[eIdx + i] ?? 0) + (i / orbit.electronCount) * Math.PI * 2) % (Math.PI * 2);
        const E = solveKepler(M, orbit.ecc);
        const ex = orbit.a * Math.cos(E) - orbit.a * orbit.ecc;
        const ey = orbit.b * Math.sin(E);
        electrons[i]?.position.set(ex, ey, 0);
        const arrow = spinArrows[i];
        if (arrow) {
          arrow.visible = doSpin;
          if (doSpin) {
            const isUp = (eIdx + i) % 2 === 0;
            arrow.position.set(ex, ey, isUp ? 0.22 : -0.22);
          }
        }
      }
      eIdx += orbit.electronCount;
    });
  });

  return <group ref={groupRef} />;
}

// ─── Quantum orbital helpers ──────────────────────────────────────────────────

function getLColor(l: number, lightMode: boolean): THREE.Color {
  const idx = Math.min(l, 3) as 0 | 1 | 2 | 3;
  return (lightMode ? L_COLORS_LIGHT : L_COLORS_DARK)[idx];
}

function parseSubshells(config: string): Array<{ n: number; l: number; e: number }> {
  const lMap: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 };
  const result: Array<{ n: number; l: number; e: number }> = [];
  for (const m of config.matchAll(/(\d+)([spdf])(\d+)/g)) {
    const l = lMap[m[2]!];
    if (l !== undefined) result.push({ n: +m[1]!, l, e: +m[3]! });
  }
  return result;
}

// Sample a 3D unit direction weighted by the given orbital type's angular distribution
function sampleAngular(l: number): [number, number, number] {
  const rph = (): number => Math.random() * Math.PI * 2;
  const rco = (): number => Math.random() * 2 - 1;

  if (l === 0) {
    const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
    return [si * Math.cos(ph), si * Math.sin(ph), co];
  }

  if (l === 1) {
    // Dumbbell along one of three axes (px / py / pz)
    const axis = Math.floor(Math.random() * 3);
    const ax = axis === 0 ? 1 : 0;
    const ay = axis === 1 ? 1 : 0;
    const az = axis === 2 ? 1 : 0;
    for (let i = 0; i < 60; i++) {
      const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
      const dx = si * Math.cos(ph), dy = si * Math.sin(ph), dz = co;
      const dot = dx * ax + dy * ay + dz * az;
      if (Math.random() < dot * dot) return [dx, dy, dz];
    }
    return axis === 0 ? [1, 0, 0] : axis === 1 ? [0, 1, 0] : [0, 0, 1];
  }

  if (l === 2) {
    // Mix of d_z², d_xy, d_xz distributions → cloverleaf + two-lobe shapes
    // MAX_D = 0.4167 (reached at θ=π/2, φ=π/4 where dz2=0.25, dxy=1, dxz=0)
    const MAX_D = 0.4167;
    for (let i = 0; i < 80; i++) {
      const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
      const co2 = co * co; const si2 = si * si;
      const dz2  = (3 * co2 - 1) * (3 * co2 - 1) / 4;
      const dxy  = si2 * si2 * Math.sin(2 * ph) * Math.sin(2 * ph);
      const dxz  = si2 * co2 * 3;
      const prob = (dz2 + dxy + dxz) / 3;
      if (Math.random() < prob / MAX_D) return [si * Math.cos(ph), si * Math.sin(ph), co];
    }
    const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
    return [si * Math.cos(ph), si * Math.sin(ph), co];
  }

  // f: multi-lobe — mix of f_z³ and f_{xyz} type distributions
  // MAX_F = 4/9 ≈ 0.4444 (reached at poles θ=0,π where fz3=4/9, fxyz=0)
  const MAX_F = 4 / 9;
  for (let i = 0; i < 100; i++) {
    const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
    const co2 = co * co; const si2 = si * si;
    const fz3  = co2 * (5 * co2 - 3) * co2 * (5 * co2 - 3) / 9;
    const fxyz = si2 * co2 * Math.abs(Math.sin(3 * ph));
    if (Math.random() < (fz3 + fxyz) / MAX_F) return [si * Math.cos(ph), si * Math.sin(ph), co];
  }
  const ph = rph(); const co = rco(); const si = Math.sqrt(1 - co * co);
  return [si * Math.cos(ph), si * Math.sin(ph), co];
}

// ─── Quantum / Schrödinger (1926) — probability cloud ────────────────────────

function buildSubshells(z: number): Array<{ n: number; l: number; e: number }> {
  const configStr = EXTENDED[z]?.config ?? "";
  let subs = parseSubshells(configStr);
  if (subs.length === 0) {
    const fills = computeShellFills(z);
    fills.forEach((count, si) => {
      const n = si + 1;
      subs.push({ n, l: 0, e: Math.min(count, 2) });
      if (count > 2) subs.push({ n, l: 1, e: Math.min(count - 2, 6) });
      if (count > 8) subs.push({ n, l: 2, e: count - 8 });
    });
  }
  return subs;
}

function buildPointCloud(
  subshells: Array<{ n: number; l: number; e: number }>,
  radiusMul: number,
  lightMode: boolean,
): THREE.Points {
  const POINTS_PER_E = 400;
  const positions: number[] = [];
  const colorArr:  number[] = [];

  for (const { n, l, e } of subshells) {
    const si   = Math.min(n - 1, SHELL_BASE_R.length - 1);
    const r0   = (SHELL_BASE_R[si] ?? 1.2) * radiusMul;
    const sigma = (0.22 + si * 0.045) * radiusMul;
    const total = e * POINTS_PER_E;
    const col   = getLColor(l, lightMode);
    let placed = 0, safety = 0;
    while (placed < total && safety++ < total * 10) {
      const r = r0 + gaussRandom() * sigma;
      if (r < 0.08) continue;
      const [dx, dy, dz] = sampleAngular(l);
      positions.push(r * dx, r * dy, r * dz);
      colorArr.push(col.r, col.g, col.b);
      placed++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.Float32BufferAttribute(colorArr,  3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    vertexColors: true,
    size: lightMode ? 0.062 : 0.072,
    transparent: true,
    opacity: lightMode ? 0.80 : 0.74,
    sizeAttenuation: true,
    depthWrite: false,
    blending: lightMode ? THREE.NormalBlending : THREE.AdditiveBlending,
  }));
}

function disposeCloud(cloud: THREE.Points) {
  cloud.geometry.dispose();
  (cloud.material as THREE.Material).dispose();
}

function QuantumAtom({ el, radiusMul, reduced, lightMode }: {
  el: Element; radiusMul: number; reduced: boolean; lightMode: boolean;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const cloudRef  = useRef<THREE.Points | null>(null);
  const [revealed, setRevealed] = useState(0);

  const subshells = useMemo(() => buildSubshells(el.z), [el.z]);

  // Progressive reveal: reset and start timer on element change
  useEffect(() => {
    setRevealed(0);
    if (subshells.length === 0) return;
    let count = 0;
    const id = setInterval(() => {
      count++;
      setRevealed(count);
      if (count >= subshells.length) clearInterval(id);
    }, 380);
    return () => clearInterval(id);
  }, [el.z, subshells.length]);

  // Rebuild point cloud whenever revealed count, scale, or theme changes
  useEffect(() => {
    const g = groupRef.current;
    const old = cloudRef.current;

    if (el.z === 0 || revealed === 0) {
      if (old) { g.remove(old); disposeCloud(old); cloudRef.current = null; }
      return;
    }

    const cloud = buildPointCloud(subshells.slice(0, revealed), radiusMul, lightMode);
    // Add new before removing old → no visual flash
    g.add(cloud);
    if (old) { g.remove(old); disposeCloud(old); }
    cloudRef.current = cloud;

    return () => {
      if (cloudRef.current === cloud) {
        g.remove(cloud); disposeCloud(cloud); cloudRef.current = null;
      } else {
        disposeCloud(cloud);
      }
    };
  }, [el.z, radiusMul, lightMode, revealed, subshells]);

  useFrame((_, dt) => {
    if (!reduced && groupRef.current) groupRef.current.rotation.y += dt * 0.05;
  });

  return <group ref={groupRef} />;
}

// ─── Van der Waals radius sphere ─────────────────────────────────────────────

function VanDerWaalsSphere({ element, radiusMul, style, lightMode }: {
  element: Element; radiusMul: number; style: "wire" | "glass"; lightMode: boolean;
}) {
  const shellCount = useMemo(() => computeShellFills(element.z).length, [element.z]);
  const r = (SHELL_BASE_R[shellCount - 1] ?? SHELL_BASE_R.at(-1)!) * radiusMul * 1.42;
  const col = lightMode ? "#3a5fc0" : "#7ab0ff";

  if (style === "wire") {
    return (
      <mesh>
        <sphereGeometry args={[r, 20, 14]} />
        <meshBasicMaterial wireframe color={col} transparent opacity={lightMode ? 0.22 : 0.18} />
      </mesh>
    );
  }

  // glass
  return (
    <group>
      <mesh>
        <sphereGeometry args={[r, 64, 48]} />
        <meshStandardMaterial
          color={col} transparent opacity={0.10}
          roughness={0.0} metalness={0.08}
          depthWrite={false} side={THREE.FrontSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[r * 0.997, 64, 48]} />
        <meshStandardMaterial
          color={col} transparent opacity={0.05}
          roughness={0.0} metalness={0.0}
          depthWrite={false} side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ─── Light-mode star field ────────────────────────────────────────────────────

const LIGHT_STARS_COUNTS = [0, 2000, 5000] as const;

function LightModeStars({ intensity }: { intensity: number }) {
  const count = LIGHT_STARS_COUNTS[intensity] ?? 0;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 55;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  if (count === 0) return null;
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.22} color="#2a2a40" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ─── Camera setup ─────────────────────────────────────────────────────────────

function CameraSetup({ shells, realScale, nucleusView }: { shells: number; realScale: boolean; nucleusView?: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    const dist = nucleusView ? 3.2 : (realScale ? 12 + shells * 4.5 : 5 + shells * 2.4);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, dist);
    camera.updateProjectionMatrix();
  }, [camera, shells, realScale, nucleusView]);
  return null;
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export type AtomSceneProps = {
  element: Element;
  model?: AtomModel;
  realScale?: boolean;
  speedMultiplier?: number;
  lightMode?: boolean;
  lightBg?: string;
  starsIntensity?: number;
  vdwStyle?: VdWStyle;
  showSpin?: boolean;
  nucleusView?: boolean;
  className?: string;
};

export function AtomScene({
  element, model = "bohr", realScale = false,
  speedMultiplier = 1, lightMode = false,
  lightBg = "#e8ecf5", starsIntensity = 1,
  vdwStyle = "off", showSpin = false, nucleusView = false, className,
}: AtomSceneProps) {
  const reduced =
    typeof window !== "undefined"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const sc = realScale ? SCALE_REAL : SCALE_NORMAL;

  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 600, position: [0, 0, 14] }}
    >
      <CameraSetup shells={element.shells.length} realScale={realScale} nucleusView={nucleusView} />
      {!lightMode && <color attach="background" args={["#060610"]} />}

      {lightMode ? (
        <>
          <ambientLight intensity={2.0} />
          <pointLight position={[5, 5, 5]} intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={0.4} />
          <LightModeStars intensity={starsIntensity} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-4, -3, -4]} intensity={0.5} color="#4070ff" />
          {starsIntensity > 0 && (
            <Stars
              radius={90} depth={50}
              count={starsIntensity === 2 ? 5500 : 2800}
              factor={3} saturation={0.2} fade
            />
          )}
        </>
      )}

      <Nucleus z={element.z} n={element.stableN} scaleMul={sc.nucleonScale} lightMode={lightMode} />

      {!nucleusView && model === "thomson" && (
        <ThomsonAtom el={element} reduced={reduced} lightMode={lightMode} />
      )}
      {!nucleusView && model === "rutherford" && (
        <RutherfordAtom el={element} radiusMul={sc.radiusMul} reduced={reduced}
          speedMul={speedMultiplier} lightMode={lightMode} showSpin={showSpin} />
      )}
      {!nucleusView && model === "bohr" && (
        <BohrAtom el={element} radiusMul={sc.radiusMul} eMul={sc.electronScale}
          reduced={reduced} speedMul={speedMultiplier} lightMode={lightMode} showSpin={showSpin} />
      )}
      {!nucleusView && model === "sommerfeld" && (
        <SommerfeldAtom el={element} radiusMul={sc.radiusMul} reduced={reduced}
          speedMul={speedMultiplier} lightMode={lightMode} showSpin={showSpin} />
      )}
      {!nucleusView && model === "quantum" && (
        <QuantumAtom el={element} radiusMul={sc.radiusMul} reduced={reduced} lightMode={lightMode} />
      )}

      {!nucleusView && vdwStyle !== "off" && (
        <VanDerWaalsSphere element={element} radiusMul={sc.radiusMul} style={vdwStyle} lightMode={lightMode} />
      )}

      <OrbitControls
        enablePan={false} enableDamping dampingFactor={0.07}
        rotateSpeed={0.6} zoomSpeed={0.7}
        minDistance={2} maxDistance={realScale ? 120 : 50}
      />

      {!lightMode && (
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.12} luminanceSmoothing={0.65} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
