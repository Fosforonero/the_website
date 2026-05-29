"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  FIRMAMENT_STARS,
  CONSTELLATION_LINES,
  DEEP_SKY_OBJECTS,
} from "@/lib/solar-system/firmament";
import type { FirmamentStar } from "@/lib/solar-system/bodies";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Radius of the firmament sphere in scene units. */
const FIRMAMENT_R = 900;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert RA/Dec degrees to a point on the unit sphere, then scale. */
function radecToXyz(raDeg: number, decDeg: number, r: number): THREE.Vector3 {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const x = r * Math.cos(dec) * Math.cos(ra);
  const y = r * Math.sin(dec);
  const z = r * Math.cos(dec) * Math.sin(ra);
  return new THREE.Vector3(x, y, z);
}

/**
 * Convert a B-V color index to an approximate RGB color.
 * B-V < 0  → blue-white; B-V ~ 0.6 → yellow; B-V > 1.5 → deep red.
 */
function bvToColor(bv: number): THREE.Color {
  const t = Math.max(-0.4, Math.min(2.0, bv));
  // Piecewise approximation
  let r: number, g: number, b: number;
  if (t < 0) {
    // hot blue-white
    r = 0.7 + 0.3 * (t + 0.4) / 0.4;
    g = 0.8 + 0.2 * (t + 0.4) / 0.4;
    b = 1.0;
  } else if (t < 0.4) {
    // white to yellow-white
    r = 1.0;
    g = 1.0;
    b = 1.0 - 0.4 * (t / 0.4);
  } else if (t < 1.0) {
    // yellow-white to orange
    r = 1.0;
    g = 1.0 - 0.2 * ((t - 0.4) / 0.6);
    b = 0.6 - 0.4 * ((t - 0.4) / 0.6);
  } else {
    // orange to deep red
    r = 1.0;
    g = 0.8 - 0.5 * ((t - 1.0) / 1.0);
    b = 0.2 - 0.15 * ((t - 1.0) / 1.0);
  }
  return new THREE.Color(
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b))
  );
}

/** Map star magnitude to point size (sizeAttenuation: false, so in pixels). */
function magnitudeToSize(mag: number): number {
  // Brightest stars (mag ~ -1.5) → 4px; faint (mag ~ 3.5) → 1px
  return Math.max(1.0, 4.0 - mag * 0.7);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders the star field as a Points mesh. */
function StarField({ stars }: { stars: FirmamentStar[] }) {
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const sz = new Float32Array(stars.length);

    stars.forEach((star, i) => {
      const v = radecToXyz(star.raDeg, star.decDeg, FIRMAMENT_R);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      const color =
        star.colorIndex !== undefined
          ? bvToColor(star.colorIndex)
          : new THREE.Color(1, 1, 1);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      sz[i] = magnitudeToSize(star.magnitude);
    });

    return [pos, col, sz] as const;
  }, [stars]);

  // We use a single PointsMaterial — size is the average; per-vertex size
  // requires a custom shader. For MVP we bin stars into 3 size passes.
  const brightStars = useMemo(
    () => stars.filter((s) => s.magnitude < 1.0),
    [stars]
  );
  const midStars = useMemo(
    () => stars.filter((s) => s.magnitude >= 1.0 && s.magnitude < 2.0),
    [stars]
  );
  const dimStars = useMemo(
    () => stars.filter((s) => s.magnitude >= 2.0),
    [stars]
  );

  return (
    <>
      <StarBin stars={brightStars} size={3.5} />
      <StarBin stars={midStars} size={2.2} />
      <StarBin stars={dimStars} size={1.4} />
    </>
  );
}

function StarBin({
  stars,
  size,
}: {
  stars: FirmamentStar[];
  size: number;
}) {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);

    stars.forEach((star, i) => {
      const v = radecToXyz(star.raDeg, star.decDeg, FIRMAMENT_R);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;

      const color =
        star.colorIndex !== undefined
          ? bvToColor(star.colorIndex)
          : new THREE.Color(1, 1, 1);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    });

    return [pos, col] as const;
  }, [stars]);

  if (stars.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
      />
    </points>
  );
}

/** Renders constellation stick figures as line segments. */
function ConstellationLines() {
  const starIndex = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    for (const star of FIRMAMENT_STARS) {
      map.set(star.id, radecToXyz(star.raDeg, star.decDeg, FIRMAMENT_R - 1));
    }
    return map;
  }, []);

  const linePositions = useMemo(() => {
    const verts: number[] = [];
    for (const line of CONSTELLATION_LINES) {
      const from = starIndex.get(line.fromStarId);
      const to = starIndex.get(line.toStarId);
      if (!from || !to) continue;
      verts.push(from.x, from.y, from.z, to.x, to.y, to.z);
    }
    return new Float32Array(verts);
  }, [starIndex]);

  if (linePositions.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#446688"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/** Renders constellation name labels at the centroid of each constellation. */
function ConstellationLabels() {
  const labels = useMemo(() => {
    // Group stars by constellation via CONSTELLATION_LINES
    const constMap = new Map<string, Set<string>>();
    for (const line of CONSTELLATION_LINES) {
      const cid = line.constellationId;
      if (!constMap.has(cid)) constMap.set(cid, new Set());
      constMap.get(cid)!.add(line.fromStarId);
      constMap.get(cid)!.add(line.toStarId);
    }

    const starPos = new Map<string, THREE.Vector3>();
    for (const star of FIRMAMENT_STARS) {
      starPos.set(star.id, radecToXyz(star.raDeg, star.decDeg, FIRMAMENT_R - 2));
    }

    const result: { id: string; name: string; position: THREE.Vector3 }[] = [];
    constMap.forEach((starIds, cid) => {
      const pts: THREE.Vector3[] = [];
      starIds.forEach((sid) => {
        const p = starPos.get(sid);
        if (p) pts.push(p);
      });
      if (pts.length === 0) return;

      const centroid = new THREE.Vector3();
      pts.forEach((p) => centroid.add(p));
      centroid.divideScalar(pts.length);

      result.push({
        id: cid,
        name: cid
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        position: centroid,
      });
    });

    return result;
  }, []);

  return (
    <>
      {labels.map((label) => (
        <Html
          key={label.id}
          position={[label.position.x, label.position.y, label.position.z]}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          <span className="solar-firmament-label">{label.name}</span>
        </Html>
      ))}
    </>
  );
}

/** Renders deep-sky object markers. */
function DeepSkyLayer({ labelsVisible }: { labelsVisible: boolean }) {
  return (
    <>
      {DEEP_SKY_OBJECTS.map((dso) => {
        const pos = radecToXyz(dso.raDeg, dso.decDeg, FIRMAMENT_R - 2);
        return (
          <group key={dso.id} position={[pos.x, pos.y, pos.z]}>
            {/* Small cross marker rendered as two short line segments */}
            <mesh>
              <sphereGeometry args={[0.8, 6, 6]} />
              <meshBasicMaterial
                color={
                  dso.kind === "galaxy"
                    ? "#c080ff"
                    : dso.kind === "nebula"
                    ? "#80c0ff"
                    : "#80ffb0"
                }
                transparent
                opacity={0.5}
                depthWrite={false}
              />
            </mesh>
            {labelsVisible && (
              <Html occlude={false} style={{ pointerEvents: "none" }}>
                <span className="solar-deep-sky-label">{dso.name}</span>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export type FirmamentLayerProps = {
  constellationsVisible: boolean;
  deepSkyVisible: boolean;
  labelsVisible: boolean;
};

export function FirmamentLayer({
  constellationsVisible,
  deepSkyVisible,
  labelsVisible,
}: FirmamentLayerProps) {
  return (
    <group>
      {/* Star field — always rendered */}
      <StarField stars={FIRMAMENT_STARS} />

      {/* Constellation lines */}
      {constellationsVisible && <ConstellationLines />}

      {/* Constellation name labels */}
      {constellationsVisible && labelsVisible && <ConstellationLabels />}

      {/* Deep-sky objects */}
      {deepSkyVisible && <DeepSkyLayer labelsVisible={labelsVisible} />}
    </group>
  );
}
