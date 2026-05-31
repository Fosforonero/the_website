"use client";

import { Suspense, useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { FirmamentLayer } from "./firmament-layer";
import { CatalogLayer } from "./solar-system-catalog-layer";
import type { CatalogCategory } from "@/lib/solar-system/catalog";
import type { CatalogEntry } from "@/lib/solar-system/catalog";
import { SOLAR_BODIES } from "@/lib/solar-system/bodies";
import { getBodyStatesForDate, sampleOrbitPath } from "@/lib/solar-system/ephemeris";
import { scaleDistance, scaleRadius, scaleSatelliteOffsetKm, AU_KM } from "@/lib/solar-system/scales";
import { getBodyOrientation } from "@/lib/solar-system/rotation-model";
import type { ScaleBrightnessMode } from "@/lib/solar-system/scales";
import { getLightingConfig } from "@/lib/solar-system/lighting-model";
import type {
  ScaleDistanceMode,
  ScaleRadiusMode,
  SolarBody,
  BodyState,
} from "@/lib/solar-system/bodies";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CatalogLayerSpec = {
  category: CatalogCategory;
  entries: CatalogEntry[];
  visible: boolean;
};

export type SolarSystemSceneProps = {
  epoch: Date;
  selectedBodyId: string;
  distanceMode: ScaleDistanceMode;
  radiusMode: ScaleRadiusMode;
  onSelectBody: (id: string) => void;
  labelsVisible: boolean;
  constellationsVisible: boolean;
  deepSkyVisible: boolean;
  showAxes?: boolean;  // show planet rotation axis markers, default false
  brightnessMode: ScaleBrightnessMode;
  catalogLayers?: CatalogLayerSpec[];
  horizonsMarker?: {
    name: string;
    positionKm: [number, number, number];
  } | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How much to scale up the selected body for highlight. */
const SELECTED_SCALE = 1.4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Scale a heliocentric position vector (km) to render units.
 *
 * Non-linear modes (real-log, inner-system) must be applied to the vector
 * magnitude — not component-by-component — to preserve direction.
 */
function scalePositionVector(
  posKm: [number, number, number],
  mode: ScaleDistanceMode
): [number, number, number] {
  const [px, py, pz] = posKm;
  if (mode === "compressed") {
    const f = 1 / AU_KM;
    return [px * f, py * f, pz * f];
  }
  const magKm = Math.sqrt(px * px + py * py + pz * pz);
  if (magKm < 1) return [0, 0, 0];
  const f = scaleDistance(magKm, mode) / magKm;
  return [px * f, py * f, pz * f];
}

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
// Sampled orbit path for a single body
// ---------------------------------------------------------------------------

type OrbitPathProps = {
  bodyId: string;
  isMoon: boolean;
  parentState?: BodyState;
  distanceMode: ScaleDistanceMode;
};

function OrbitPath({ bodyId, isMoon, parentState, distanceMode }: OrbitPathProps) {
  const points = useMemo(() => sampleOrbitPath(bodyId, 256), [bodyId]);
  if (points.length < 2) return null;

  const scaledPoints = useMemo(() => {
    if (isMoon && parentState) {
      // Moon orbit: local km → scale → offset by parent's scaled world position
      const [ppx, ppy, ppz] = scalePositionVector(parentState.positionKm, distanceMode);
      return points.map(([x, y, z]) => {
        const [sx, sy, sz] = scalePositionVector([x, y, z], distanceMode);
        return new THREE.Vector3(ppx + sx, ppy + sy, ppz + sz);
      });
    }
    return points.map(([x, y, z]) => {
      const [sx, sy, sz] = scalePositionVector([x, y, z], distanceMode);
      return new THREE.Vector3(sx, sy, sz);
    });
  }, [points, isMoon, parentState, distanceMode]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(scaledPoints);
    return geo;
  }, [scaledPoints]);

  return (
    <lineLoop args={[geometry]}>
      <lineBasicMaterial
        color="#1a3050"
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </lineLoop>
  );
}

// ---------------------------------------------------------------------------
// Single body mesh
// ---------------------------------------------------------------------------

type BodyMeshProps = {
  body: SolarBody;
  state: BodyState;
  parentState?: BodyState;
  distanceMode: ScaleDistanceMode;
  radiusMode: ScaleRadiusMode;
  isSelected: boolean;
  labelsVisible: boolean;
  onSelect: () => void;
  epochMs: number;
  showAxes: boolean;
};

// ---------------------------------------------------------------------------
// Ring system — Saturn and Uranus, in the body's equatorial plane
// ---------------------------------------------------------------------------

type RingSystemProps = {
  body: SolarBody;
  displayBodyR: number;
};

function RingSystem({ body, displayBodyR }: RingSystemProps) {
  if (body.ringInnerKm === undefined || body.ringOuterKm === undefined) return null;

  // Scale ring radii proportionally to the body's visual radius.
  // We use the ratio of display radius to physical radius to preserve proportions.
  // This keeps rings visually proportional regardless of the active radius mode.
  // Disclosure: ring visual scale follows the same educational exaggeration as the body.
  const physBodyR = body.radiusKm;
  const scale = displayBodyR / physBodyR; // render-units per km

  const innerR = body.ringInnerKm * scale;
  const outerR = body.ringOuterKm * scale;

  // Rings are in equatorial plane = XZ plane in the tilted body frame.
  // rotation={[Math.PI/2, 0, 0]} lays the ring flat (XZ) when Y is up.
  const opacity = body.id === "saturn" ? 0.72 : 0.32;
  const color = body.id === "saturn" ? "#c8b880" : "#708090";

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 128]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function BodyMesh({
  body,
  state,
  parentState,
  distanceMode,
  radiusMode,
  isSelected,
  labelsVisible,
  onSelect,
  epochMs,
  showAxes,
}: BodyMeshProps) {
  // For moons: use boosted local offset from parent instead of world position.
  // This makes moon systems legible without pretending the offset is to scale.
  let scaledX: number, scaledY: number, scaledZ: number;

  if (body.category === "moon" && state.localPositionKm && parentState) {
    const [lx, ly, lz] = state.localPositionKm;
    const localMag = Math.sqrt(lx * lx + ly * ly + lz * lz);
    const [ppx, ppy, ppz] = scalePositionVector(parentState.positionKm, distanceMode);

    if (localMag > 0) {
      const boosted = scaleSatelliteOffsetKm(localMag, body.parentId ?? "");
      const nx = lx / localMag;
      const ny = ly / localMag;
      const nz = lz / localMag;
      scaledX = ppx + nx * boosted;
      scaledY = ppy + ny * boosted;
      scaledZ = ppz + nz * boosted;
    } else {
      [scaledX, scaledY, scaledZ] = scalePositionVector(parentState.positionKm, distanceMode);
    }
  } else {
    [scaledX, scaledY, scaledZ] = scalePositionVector(state.positionKm, distanceMode);
  }

  const r = scaleRadius(body.radiusKm, radiusMode, body.category);
  const displayR = isSelected ? r * SELECTED_SCALE : r;

  const isSun = body.category === "star";
  const color = hexToThreeColor(body.color);

  const orientation = getBodyOrientation(body, epochMs);

  // Sprint 04: use IAU pole quaternion when available, else fall back to X-axis approx
  const tiltQ = useMemo(() => {
    const q = new THREE.Quaternion();
    if (orientation.eclipticPoleVector) {
      const pole = new THREE.Vector3(...orientation.eclipticPoleVector).normalize();
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pole);
    } else if (orientation.tiltAroundXRad !== 0) {
      q.setFromEuler(new THREE.Euler(orientation.tiltAroundXRad, 0, 0, "XYZ"));
    }
    return q;
  }, [orientation.eclipticPoleVector, orientation.tiltAroundXRad]);

  return (
    <group position={[scaledX, scaledY, scaledZ]}>
      {/* Tilt group: quaternion from IAU pole vector (Sprint 04) or X-axis Euler fallback */}
      <group quaternion={tiltQ}>

        {/* Spin group: rotate around tilted pole for current phase */}
        <group rotation={[0, orientation.rotationPhaseRad, 0]}>
          <mesh
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
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
        </group>

        {/* Rotation axis marker — thin cylinder along the tilted Y axis */}
        {showAxes && !isSun && body.axialTiltDeg !== undefined && (
          <group>
            {/* Axis line */}
            <mesh>
              <cylinderGeometry args={[0.003, 0.003, displayR * 3.5, 6]} />
              <meshBasicMaterial color="#5090d0" transparent opacity={0.6} depthWrite={false} />
            </mesh>
            {/* North pole dot */}
            <mesh position={[0, displayR * 1.75, 0]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#70b0ff" />
            </mesh>
            {/* South pole dot */}
            <mesh position={[0, -displayR * 1.75, 0]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color="#4060a0" />
            </mesh>
          </group>
        )}

        {/* Ring system (Saturn, Uranus) — equatorial plane = perpendicular to tilted Y */}
        {body.ringInnerKm !== undefined && body.ringOuterKm !== undefined && (
          <RingSystem body={body} displayBodyR={displayR} />
        )}

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
      </group>

      {/* Label — outside tilt group so it stays upright */}
      {labelsVisible && (
        <Html
          position={[0, displayR * 1.6, 0]}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          <span className={isSelected ? "solar-body-label solar-body-label--selected" : "solar-body-label"}>
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
  showAxes,
  brightnessMode,
  catalogLayers,
  horizonsMarker,
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

      {/* Lighting — mode declared by brightnessMode prop */}
      {(() => {
        const cfg = getLightingConfig(brightnessMode);
        return (
          <>
            {cfg.ambientIntensity > 0 && (
              <ambientLight
                intensity={cfg.ambientIntensity}
                color={cfg.ambientColor}
              />
            )}
            <pointLight
              position={[0, 0, 0]}
              intensity={cfg.sunIntensity}
              color="#fff8e8"
              distance={cfg.sunDistance}
              decay={cfg.sunDecay}
            />
          </>
        );
      })()}

      {/* Background firmament */}
      <FirmamentLayer
        constellationsVisible={constellationsVisible}
        deepSkyVisible={deepSkyVisible}
        labelsVisible={labelsVisible}
      />

      {/* Orbit paths — sampled from same solver as body positions */}
      {SOLAR_BODIES.map((body) => {
        if (!body.semiMajorAxisKm) return null;
        if (body.category === "star") return null;

        const isMoon = body.parentId !== null && body.parentId !== "sun";
        if (isMoon) {
          // Draw moon orbit only when the moon or its parent is selected
          const isVisible =
            body.id === selectedBodyId ||
            body.parentId === selectedBodyId;
          if (!isVisible) return null;
        }

        const parentState = body.parentId ? stateById.get(body.parentId) : undefined;

        return (
          <OrbitPath
            key={`orbit-${body.id}`}
            bodyId={body.id}
            isMoon={isMoon}
            parentState={parentState}
            distanceMode={distanceMode}
          />
        );
      })}

      {/* Bodies */}
      {SOLAR_BODIES.map((body) => {
        const state = stateById.get(body.id);
        if (!state) return null;
        const parentState = body.parentId ? stateById.get(body.parentId) : undefined;
        return (
          <BodyMesh
            key={body.id}
            body={body}
            state={state}
            parentState={parentState}
            distanceMode={distanceMode}
            radiusMode={radiusMode}
            isSelected={body.id === selectedBodyId}
            labelsVisible={labelsVisible}
            onSelect={() => onSelectBody(body.id)}
            epochMs={epoch.getTime()}
            showAxes={showAxes ?? false}
          />
        );
      })}

      {/* Catalog layers — THREE.Points, never individual meshes */}
      {catalogLayers?.map((layer) => (
        <CatalogLayer
          key={`catalog-${layer.category}`}
          entries={layer.entries}
          category={layer.category}
          epoch={epoch}
          distanceMode={distanceMode}
          visible={layer.visible}
        />
      ))}

      {/* Horizons precision marker — teal sphere + ring for selected catalog body */}
      {horizonsMarker && (() => {
        const [x, y, z] = scalePositionVector(horizonsMarker.positionKm, distanceMode);
        return (
          <group position={[x, y, z]}>
            <mesh scale={0.035}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#00ffcc" transparent opacity={0.85} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.045, 0.055, 32]} />
              <meshBasicMaterial color="#00ffcc" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <Html position={[0, 0.08, 0]} occlude={false} style={{ pointerEvents: "none" }}>
              <span className="solar-body-label solar-body-label--selected" style={{ color: "#00ffcc", borderColor: "#00ffcc" }}>
                {horizonsMarker.name}
              </span>
            </Html>
          </group>
        );
      })()}

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
        camera={{ position: [0, 5, 10], fov: 60, near: 0.01, far: 2000 }}
        style={{ background: "#000008" }}
        gl={{ antialias: true, alpha: false }}
      >
        <InnerScene {...props} />
      </Canvas>
    </Suspense>
  );
}
