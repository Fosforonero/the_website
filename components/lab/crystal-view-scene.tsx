"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { CrystalStructure } from "@/lib/element-extended-data";

type VisCrystal = Exclude<CrystalStructure, "other" | null>;

const CELL = 2.2; // world-unit cell size

// Basis atoms per unit cell (fractional 0..1 coordinates within cell)
function getCellBasis(s: VisCrystal): Array<[number, number, number]> {
  if (s === "sc")      return [[0,0,0]];
  if (s === "bcc")     return [[0,0,0],[0.5,0.5,0.5]];
  if (s === "fcc")     return [[0,0,0],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5]];
  if (s === "diamond") return [
    [0,0,0],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],
    [0.25,0.25,0.25],[0.75,0.75,0.25],[0.75,0.25,0.75],[0.25,0.75,0.75],
  ];
  // hcp: approximate using two hexagonal layers in a pseudo-orthorhombic cell
  if (s === "hcp") {
    const h = Math.sqrt(2/3); // c/a ≈ 1.633
    return [
      [0,0,0],[0.5,0,0],[0.25,Math.sqrt(3)/4,0],[0.75,Math.sqrt(3)/4,0],
      [0.25,Math.sqrt(3)/12,h/2],[0.75,Math.sqrt(3)/12,h/2],
    ];
  }
  return [[0,0,0]];
}

// Nearest-neighbor cutoff in cell units
function getCutoff(s: VisCrystal): number {
  if (s === "sc")      return 1.05;
  if (s === "bcc")     return Math.sqrt(3) / 2 * 1.12;
  if (s === "fcc")     return Math.sqrt(2) / 2 * 1.12;
  if (s === "diamond") return Math.sqrt(3) / 4 * 1.12;
  if (s === "hcp")     return 0.6;
  return 1.05;
}

interface AtomPos { x: number; y: number; z: number }
interface Bond    { ax: number; ay: number; az: number; bx: number; by: number; bz: number }

function buildLattice(s: VisCrystal, repeat: number): { atoms: AtomPos[]; bonds: Bond[] } {
  const basis   = getCellBasis(s);
  const cutoff  = getCutoff(s) * CELL;
  const half    = (repeat * CELL) / 2;
  const atoms: AtomPos[] = [];

  for (let ix = 0; ix < repeat; ix++) {
    for (let iy = 0; iy < repeat; iy++) {
      for (let iz = 0; iz < repeat; iz++) {
        for (const [bx, by, bz] of basis) {
          atoms.push({
            x: (ix + bx) * CELL - half,
            y: (iy + by) * CELL - half,
            z: (iz + bz) * CELL - half,
          });
        }
      }
    }
  }

  const bonds: Bond[] = [];
  const n = atoms.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = atoms[i]!; const b = atoms[j]!;
      const dx = a.x-b.x, dy = a.y-b.y, dz = a.z-b.z;
      if (Math.sqrt(dx*dx+dy*dy+dz*dz) <= cutoff) {
        bonds.push({ ax:a.x, ay:a.y, az:a.z, bx:b.x, by:b.y, bz:b.z });
      }
    }
  }

  return { atoms, bonds };
}

// ─── Unit cell wireframe outline ──────────────────────────────────────────────

function UnitCellBox() {
  const edgesGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(CELL, CELL, CELL);
    return new THREE.EdgesGeometry(box);
  }, []);

  return (
    <lineSegments geometry={edgesGeo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.30} />
    </lineSegments>
  );
}

// ─── Scene content ────────────────────────────────────────────────────────────

function LatticeContent({
  structure, color, lightMode,
}: { structure: VisCrystal; color: string; lightMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  const { atoms, bonds, atomGeo, atomMat, bondMat, unitCellCenter } = useMemo(() => {
    // diamond/hcp kept smaller due to complex basis; sc/bcc/fcc extended for infinite-crystal effect
    const repeat = structure === "diamond" ? 2 : structure === "hcp" ? 3 : 5;
    const { atoms, bonds } = buildLattice(structure, repeat);
    const half = (repeat * CELL) / 2;
    // center unit cell: ix=floor(repeat/2), same for iy,iz
    const ci = Math.floor(repeat / 2);
    const cellOrigin = ci * CELL - half + CELL / 2;
    const unitCellCenter = new THREE.Vector3(cellOrigin, cellOrigin, cellOrigin);

    const col = new THREE.Color(color);
    const atomR = structure === "diamond" ? 0.28 : 0.30;
    const atomGeo = new THREE.SphereGeometry(atomR, 20, 14);
    const atomMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: lightMode ? 0.10 : 0.65,
      roughness: 0.28,
      metalness: lightMode ? 0.1 : 0.55,
    });
    const bondCol = lightMode ? new THREE.Color(0x444455) : new THREE.Color(0x8899cc);
    const bondMat = new THREE.MeshStandardMaterial({
      color: bondCol,
      emissive: bondCol,
      emissiveIntensity: lightMode ? 0.03 : 0.18,
      roughness: 0.55,
      metalness: 0.15,
      transparent: true,
      opacity: lightMode ? 0.50 : 0.65,
    });
    return { atoms, bonds, atomGeo, atomMat, bondMat, unitCellCenter };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure, color, lightMode]);

  // Instanced mesh for atoms
  const instRef = useRef<THREE.InstancedMesh>(null!);
  useMemo(() => {
    const dummy = new THREE.Object3D();
    atoms.forEach((a, i) => {
      dummy.position.set(a.x, a.y, a.z);
      dummy.updateMatrix();
      instRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (instRef.current) instRef.current.instanceMatrix.needsUpdate = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atoms]);

  // Bond cylinders built once
  const bondMeshes = useMemo(() => {
    return bonds.map((b, i) => {
      const ax = b.ax, ay = b.ay, az = b.az;
      const bx = b.bx, by = b.by, bz = b.bz;
      const dx = bx-ax, dy = by-ay, dz = bz-az;
      const len = Math.sqrt(dx*dx+dy*dy+dz*dz);
      const mx = (ax+bx)/2, my = (ay+by)/2, mz = (az+bz)/2;
      const geo = new THREE.CylinderGeometry(0.055, 0.055, len, 8, 1);
      const mesh = new THREE.Mesh(geo, bondMat);
      mesh.position.set(mx, my, mz);
      const axis = new THREE.Vector3(dx/len, dy/len, dz/len);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), axis);
      return <primitive key={i} object={mesh} />;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bonds, bondMat]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={instRef}
        args={[atomGeo, atomMat, atoms.length]}
        onUpdate={self => {
          const dummy = new THREE.Object3D();
          atoms.forEach((a, i) => {
            dummy.position.set(a.x, a.y, a.z);
            dummy.updateMatrix();
            self.setMatrixAt(i, dummy.matrix);
          });
          self.instanceMatrix.needsUpdate = true;
        }}
      />
      {bondMeshes}
      <group position={unitCellCenter}>
        <UnitCellBox />
      </group>
    </group>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function CrystalViewScene({
  structure, color, className,
}: {
  structure: CrystalStructure;
  color: string;
  className?: string;
}) {
  if (!structure || structure === "other") return null;
  const vis = structure as VisCrystal;

  return (
    <Canvas
      className={className}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 200, position: [7, 5, 9] }}
    >
      <color attach="background" args={["#060610"]} />
      {/* Exponential fog blends outer lattice atoms into background → infinite crystal illusion */}
      <fogExp2 attach="fog" args={["#060610", 0.042]} />

      <ambientLight intensity={0.65} />
      <pointLight position={[6, 6, 6]} intensity={1.8} />
      <pointLight position={[-5, -4, -5]} intensity={0.6} color="#4466ff" />

      <LatticeContent structure={vis} color={color} lightMode={false} />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        minDistance={3}
        maxDistance={40}
      />

      <EffectComposer>
        <Bloom intensity={1.0} luminanceThreshold={0.15} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
