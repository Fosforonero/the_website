"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const BG = "#060610";

// ─── Solid: 3×3×3 ordered grid, gentle thermal vibration ─────────────────────

const SOLID_N = 3;
const SOLID_SPACING = 1.5;
const SOLID_R = 0.42;
const SOLID_AMP = 0.055;

function SolidContent({ color }: { color: string }) {
  const basePositions = useMemo<THREE.Vector3[]>(() => {
    const pts: THREE.Vector3[] = [];
    for (let x = 0; x < SOLID_N; x++)
      for (let y = 0; y < SOLID_N; y++)
        for (let z = 0; z < SOLID_N; z++)
          pts.push(new THREE.Vector3(
            (x - 1) * SOLID_SPACING,
            (y - 1) * SOLID_SPACING,
            (z - 1) * SOLID_SPACING,
          ));
    return pts;
  }, []);

  const instRef = useRef<THREE.InstancedMesh>(null!);
  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const col    = useMemo(() => new THREE.Color(color), [color]);
  const geo    = useMemo(() => new THREE.SphereGeometry(SOLID_R, 16, 12), []);
  const mat    = useMemo(() => new THREE.MeshStandardMaterial({
    color: col, emissive: col, emissiveIntensity: 0.45,
    roughness: 0.25, metalness: 0.55,
  }), [col]);

  const count = SOLID_N ** 3;

  useFrame(({ clock }) => {
    if (!instRef.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const base = basePositions[i]!;
      const ph = i * 0.713; // golden-ratio phase spread → varied vibration
      dummy.position.set(
        base.x + SOLID_AMP * Math.sin(t * 1.8 + ph),
        base.y + SOLID_AMP * Math.sin(t * 1.5 + ph * 1.3),
        base.z + SOLID_AMP * Math.sin(t * 2.1 + ph * 0.7),
      );
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instRef}
      args={[geo, mat, count]}
      onUpdate={self => {
        for (let i = 0; i < count; i++) {
          dummy.position.copy(basePositions[i]!);
          dummy.updateMatrix();
          self.setMatrixAt(i, dummy.matrix);
        }
        self.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

// ─── Liquid: disordered spheres, slow Brownian drift ─────────────────────────

const LIQUID_N    = 28;
const LIQUID_RBOX = 3.2;
const LIQUID_RSPH = 0.34;

type PhysState = { pos: THREE.Vector3[]; vel: THREE.Vector3[] };

function LiquidContent({ color }: { color: string }) {
  const stateRef = useRef<PhysState | null>(null);
  if (!stateRef.current) {
    stateRef.current = {
      pos: Array.from({ length: LIQUID_N }, () => {
        const r     = (0.2 + 0.8 * Math.cbrt(Math.random())) * LIQUID_RBOX;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(1 - 2 * Math.random());
        return new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        );
      }),
      vel: Array.from({ length: LIQUID_N }, () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.016,
          (Math.random() - 0.5) * 0.016,
          (Math.random() - 0.5) * 0.016,
        )
      ),
    };
  }

  const instRef = useRef<THREE.InstancedMesh>(null!);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const col     = useMemo(() => new THREE.Color(color), [color]);
  const geo     = useMemo(() => new THREE.SphereGeometry(LIQUID_RSPH, 14, 10), []);
  const mat     = useMemo(() => new THREE.MeshStandardMaterial({
    color: col, emissive: col, emissiveIntensity: 0.35,
    roughness: 0.35, metalness: 0.40, transparent: true, opacity: 0.92,
  }), [col]);

  useFrame(() => {
    if (!instRef.current || !stateRef.current) return;
    const { pos, vel } = stateRef.current;
    for (let i = 0; i < LIQUID_N; i++) {
      const p = pos[i]!;
      const v = vel[i]!;
      p.addScaledVector(v, 1);
      const len = p.length();
      if (len > LIQUID_RBOX) {
        const n = p.clone().normalize();
        v.addScaledVector(n, -2 * v.dot(n));
        v.multiplyScalar(0.85);
        p.setLength(LIQUID_RBOX);
      }
      dummy.position.copy(p);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instRef}
      args={[geo, mat, LIQUID_N]}
      onUpdate={self => {
        const pos = stateRef.current!.pos;
        for (let i = 0; i < LIQUID_N; i++) {
          dummy.position.copy(pos[i]!);
          dummy.updateMatrix();
          self.setMatrixAt(i, dummy.matrix);
        }
        self.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

// ─── Gas: sparse spheres, faster ballistic motion ────────────────────────────

const GAS_N    = 12;
const GAS_BOX  = 5.5;
const GAS_RSPH = 0.28;

function GasContent({ color }: { color: string }) {
  const stateRef = useRef<PhysState | null>(null);
  if (!stateRef.current) {
    stateRef.current = {
      pos: Array.from({ length: GAS_N }, () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * GAS_BOX * 1.4,
          (Math.random() - 0.5) * GAS_BOX * 1.4,
          (Math.random() - 0.5) * GAS_BOX * 1.4,
        )
      ),
      vel: Array.from({ length: GAS_N }, () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.044,
          (Math.random() - 0.5) * 0.044,
          (Math.random() - 0.5) * 0.044,
        )
      ),
    };
  }

  const instRef = useRef<THREE.InstancedMesh>(null!);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const col     = useMemo(() => new THREE.Color(color), [color]);
  const geo     = useMemo(() => new THREE.SphereGeometry(GAS_RSPH, 12, 9), []);
  const mat     = useMemo(() => new THREE.MeshStandardMaterial({
    color: col, emissive: col, emissiveIntensity: 0.50,
    roughness: 0.20, metalness: 0.45, transparent: true, opacity: 0.85,
  }), [col]);

  useFrame(() => {
    if (!instRef.current || !stateRef.current) return;
    const { pos, vel } = stateRef.current;
    const half = GAS_BOX;
    for (let i = 0; i < GAS_N; i++) {
      const p = pos[i]!;
      const v = vel[i]!;
      p.addScaledVector(v, 1);
      if (Math.abs(p.x) > half) { v.x *= -1; p.x = Math.sign(p.x) * half; }
      if (Math.abs(p.y) > half) { v.y *= -1; p.y = Math.sign(p.y) * half; }
      if (Math.abs(p.z) > half) { v.z *= -1; p.z = Math.sign(p.z) * half; }
      dummy.position.copy(p);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instRef}
      args={[geo, mat, GAS_N]}
      onUpdate={self => {
        const pos = stateRef.current!.pos;
        for (let i = 0; i < GAS_N; i++) {
          dummy.position.copy(pos[i]!);
          dummy.updateMatrix();
          self.setMatrixAt(i, dummy.matrix);
        }
        self.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function MaterialScene({
  phase, color, className,
}: {
  phase: "solid" | "liquid" | "gas";
  color: string;
  className?: string;
}) {
  const camZ    = phase === "gas" ? 22 : 14;
  const fogDens = phase === "gas" ? 0.018 : 0.032;

  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0, 0, camZ] }}
    >
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, fogDens]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[6,  5,  6]} intensity={1.6} />
      <pointLight position={[-5, -4, -4]} intensity={0.5} color="#4466ff" />

      {phase === "solid"  && <SolidContent  color={color} />}
      {phase === "liquid" && <LiquidContent color={color} />}
      {phase === "gas"    && <GasContent    color={color} />}

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        minDistance={3}
        maxDistance={60}
      />

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.12} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
