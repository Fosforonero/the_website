"use client";

import { Suspense, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { FirmamentLayer } from "./firmament-layer";
import { SOLAR_BODIES } from "@/lib/solar-system/bodies";
import { getBodyStatesForDate } from "@/lib/solar-system/ephemeris";
import { scaleDistance, scaleRadius } from "@/lib/solar-system/scales";
import type {
  ScaleDistanceMode,
  ScaleRadiusMode,
  SolarBody,
  BodyState,
} from "@/lib/solar-system/bodies";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SolarSystemSceneProps = {
  epoch: Date;
  selectedBodyId: string;
  distanceMode: ScaleDistanceMode;
  radiusMode: ScaleRadiusMode;
  onSelectBody: (id: string) => void;
  labelsVisible: boolean;
  constellationsVisible: boolean;
  deepSkyVisible: boolean;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Ring geometry segment count — enough for smooth circles. */
const ORBIT_RING_SEGMENTS = 128;

/** How much to scale up the selected body for highlight. */
const SELECTED_SCALE = 1.4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a CSS hex color string ("#rrggbb") to a THREE.Color.
 * Falls back to white on parse errors.
 */
function hexToThreeColor(hex: string): THREE.Color {
  try {
    return new THREE.Color(hex);
  } catch {
    return new THREE.Color(1, 1, 1);
  }
}

// ---------------------------------------------------------------------------
// Scene environment (fog + camera setup) — must be inside Canvas
// ---------------------------------------------------------------------------

function SceneSetup() {
  const { scene } = useThree();
  useEffect(() => {
    // Very subtle fog to give depth
    scene.fog = new THREE.FogExp2(0x000008, 0.0002);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
}

// ---------------------------------------------------------------------------
// Orbit ring for a single body
// ---------------------------------------------------------------------------

function OrbitRing({
  semiMajorAxisKm,
  distanceMode,
}: {
  semiMajorAxisKm: number;
  distanceMode: ScaleDistanceMode;
}) {
  const r = scaleDistance(semiMajorAxisKm, distanceMode);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      {/* ringGeometry args: [innerRadius, outerRadius, thetaSegments] */}
      <ringGeometry args={[r * 0.9985, r * 1.0015, ORBIT_RING_SEGMENTS]} />
      <meshBasicMaterial
        color="#1a3050"
        side={THREE.DoubleSide}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Single body mesh
// ---------------------------------------------------------------------------

type BodyMeshProps = {
  body: SolarBody;
  state: BodyState;
  distanceMode: ScaleDistanceMode;
  radiusMode: ScaleRadiusMode;
  isSelected: boolean;
  labelsVisible: boolean;
  onSelect: () => void;
};

function BodyMesh({
  body,
  state,
  distanceMode,
  radiusMode,
  isSelected,
  labelsVisible,
  onSelect,
}: BodyMeshProps) {
  const [px, py, pz] = state.positionKm;
  const scaledX = scaleDistance(px, distanceMode);
  const scaledY = scaleDistance(py, distanceMode);
  const scaledZ = scaleDistance(pz, distanceMode);

  const r = scaleRadius(body.radiusKm, radiusMode);
  const displayR = isSelected ? r * SELECTED_SCALE : r;

  const isSun = body.category === "star";
  const color = hexToThreeColor(body.color);

  return (
    <group position={[scaledX, scaledY, scaledZ]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        scale={displayR}
      >
        <sphereGeometry args={[1, 32, 32]} />
        {isSun ? (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.75}
            metalness={0.05}
            emissive={isSelected ? color : new THREE.Color(0, 0, 0)}
            emissiveIntensity={isSelected ? 0.18 : 0}
          />
        )}
      </mesh>

      {/* Selected highlight ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[displayR * 1.25, displayR * 1.45, 64]} />
          <meshBasicMaterial
            color="#ffd860"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Body label */}
      {labelsVisible && (
        <Html
          position={[0, displayR * 1.6, 0]}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          <span
            className={
              isSelected ? "solar-body-label solar-body-label--selected" : "solar-body-label"
            }
          >
            {body.name.en}
          </span>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Inner scene (must be mounted inside Canvas)
// ---------------------------------------------------------------------------

type InnerSceneProps = Omit<SolarSystemSceneProps, never>;

function InnerScene({
  epoch,
  selectedBodyId,
  distanceMode,
  radiusMode,
  onSelectBody,
  labelsVisible,
  constellationsVisible,
  deepSkyVisible,
}: InnerSceneProps) {
  const bodyStates = useMemo(
    () => getBodyStatesForDate(epoch),
    [epoch]
  );

  const stateById = useMemo(() => {
    const map = new Map<string, BodyState>();
    for (const s of bodyStates) map.set(s.id, s);
    return map;
  }, [bodyStates]);

  return (
    <>
      <SceneSetup />

      {/* Lighting */}
      <ambientLight intensity={0.06} color="#102030" />
      <pointLight
        position={[0, 0, 0]}
        intensity={4}
        color="#fff8e8"
        distance={2000}
        decay={1.8}
      />

      {/* Background firmament */}
      <FirmamentLayer
        constellationsVisible={constellationsVisible}
        deepSkyVisible={deepSkyVisible}
        labelsVisible={labelsVisible}
      />

      {/* Orbit rings */}
      {SOLAR_BODIES.map((body) => {
        if (!body.semiMajorAxisKm) return null;
        // Only draw rings for direct Sun children (planets, dwarf planets, etc.)
        if (body.parentId !== "sun" && body.parentId !== null) return null;
        if (body.category === "star") return null;
        return (
          <OrbitRing
            key={`ring-${body.id}`}
            semiMajorAxisKm={body.semiMajorAxisKm}
            distanceMode={distanceMode}
          />
        );
      })}

      {/* Bodies */}
      {SOLAR_BODIES.map((body) => {
        const state = stateById.get(body.id);
        if (!state) return null;
        return (
          <BodyMesh
            key={body.id}
            body={body}
            state={state}
            distanceMode={distanceMode}
            radiusMode={radiusMode}
            isSelected={body.id === selectedBodyId}
            labelsVisible={labelsVisible}
            onSelect={() => onSelectBody(body.id)}
          />
        );
      })}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={0.1}
        maxDistance={800}
        rotateSpeed={0.6}
        zoomSpeed={1.2}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------

function SceneLoading() {
  return (
    <div className="solar-loading">
      <span>Initialising scene…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component — wrapped in Canvas + Suspense
// ---------------------------------------------------------------------------

export default function SolarSystemScene(props: SolarSystemSceneProps) {
  return (
    <Suspense fallback={<SceneLoading />}>
      <Canvas
        camera={{ position: [0, 10, 30], fov: 60, near: 0.01, far: 5000 }}
        style={{ background: "#000008" }}
        gl={{ antialias: true, alpha: false }}
      >
        <InnerScene {...props} />
      </Canvas>
    </Suspense>
  );
}
