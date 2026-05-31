"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { CatalogEntry, CatalogCategory } from "@/lib/solar-system/catalog";
import type { ScaleDistanceMode } from "@/lib/solar-system/bodies";
import { scaleDistance, AU_KM } from "@/lib/solar-system/scales";

const CATEGORY_COLOR: Record<CatalogCategory, THREE.Color> = {
  "asteroid-neo":   new THREE.Color("#ff6b35"),
  "asteroid-mba":   new THREE.Color("#8a9ba8"),
  "asteroid-other": new THREE.Color("#6b7c8a"),
  comet:            new THREE.Color("#a8d8f0"),
  tno:              new THREE.Color("#c8a8d8"),
  centaur:          new THREE.Color("#d8c8a8"),
};

type HBucket = { maxH: number; size: number; opacity: number };
const H_BUCKETS: HBucket[] = [
  { maxH: 5,        size: 0.080, opacity: 0.95 },
  { maxH: 10,       size: 0.048, opacity: 0.90 },
  { maxH: 15,       size: 0.026, opacity: 0.78 },
  { maxH: 20,       size: 0.016, opacity: 0.65 },
  { maxH: Infinity, size: 0.010, opacity: 0.50 },
];

const TWO_PI = 2 * Math.PI;
const UNIX_EPOCH_JD = 2_440_587.5;

function solveKeplerCatalog(M: number, e: number): number {
  const Mn = ((M % TWO_PI) + TWO_PI) % TWO_PI;
  let E = e > 0.8 ? Math.PI : Mn;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

function computePositionAu(
  aAu: number, e: number, iDeg: number,
  OmegaDeg: number, omegaDeg: number, M: number
): [number, number, number] {
  const E = solveKeplerCatalog(M, e);
  const cosE = Math.cos(E), sinE = Math.sin(E);
  const oneMecosE = 1 - e * cosE;
  const r = aAu * oneMecosE;
  const cosNu = (cosE - e) / oneMecosE;
  const sinNu = (Math.sqrt(Math.max(0, 1 - e * e)) * sinE) / oneMecosE;
  const nu = Math.atan2(sinNu, cosNu);
  const opn = (omegaDeg * Math.PI) / 180 + nu;
  const iR = (iDeg * Math.PI) / 180;
  const OR = (OmegaDeg * Math.PI) / 180;
  const cO = Math.cos(OR), sO = Math.sin(OR), cI = Math.cos(iR), sI = Math.sin(iR);
  const cN = Math.cos(opn), sN = Math.sin(opn);
  return [
    r * (cO * cN - sO * sN * cI),
    r * (sO * cN + cO * sN * cI),
    r * sN * sI,
  ];
}

export type CatalogLayerProps = {
  entries: CatalogEntry[];
  category: CatalogCategory;
  epoch: Date;
  distanceMode: ScaleDistanceMode;
  visible: boolean;
};

export function CatalogLayer({ entries, category, epoch, distanceMode, visible }: CatalogLayerProps) {
  const lastComputedEpochRef = useRef<number>(0);
  const cachedBucketsRef = useRef<Array<{ positions: Float32Array; bucket: HBucket }>>([]);

  const color = CATEGORY_COLOR[category] ?? new THREE.Color(1, 1, 1);

  const bucketData = useMemo(() => {
    const epochMs = epoch.getTime();
    const jd = epochMs / 86_400_000 + UNIX_EPOCH_JD;

    if (
      cachedBucketsRef.current.length > 0 &&
      Math.abs(epochMs - lastComputedEpochRef.current) < 86_400_000
    ) {
      return cachedBucketsRef.current;
    }

    // Temporary arrays: one per bucket
    const bufs: Float32Array[] = H_BUCKETS.map(() => new Float32Array(entries.length * 3));
    const counts: number[] = new Array(H_BUCKETS.length).fill(0);

    for (const e of entries) {
      if (e.eccentricity >= 1.0 || e.semiMajorAxisAu <= 0 || e.periodDays <= 0) continue;

      const M0 = (e.meanAnomalyDeg * Math.PI) / 180;
      const meanMotion = TWO_PI / e.periodDays;
      const daysSinceEpoch = jd - e.epochJd;
      const M = ((M0 + meanMotion * daysSinceEpoch) % TWO_PI + TWO_PI) % TWO_PI;

      const [xAu, yAu, zAu] = computePositionAu(
        e.semiMajorAxisAu, e.eccentricity, e.inclinationDeg,
        e.longitudeAscNodeDeg, e.argPeriapsisDeg, M
      );

      let sx: number, sy: number, sz: number;
      if (distanceMode === "compressed") {
        sx = xAu; sy = yAu; sz = zAu;
      } else {
        const xKm = xAu * AU_KM, yKm = yAu * AU_KM, zKm = zAu * AU_KM;
        const magKm = Math.sqrt(xKm * xKm + yKm * yKm + zKm * zKm);
        if (magKm < 1) continue;
        const renderMag = scaleDistance(magKm, distanceMode);
        const f = renderMag / magKm;
        sx = xKm * f; sy = yKm * f; sz = zKm * f;
      }

      // Assign to H bucket
      const H = e.absoluteMagnitude ?? Infinity;
      const bi = H_BUCKETS.findIndex((b) => H < b.maxH);
      const bucketIdx = bi === -1 ? H_BUCKETS.length - 1 : bi;
      const n = counts[bucketIdx]!;
      const buf = bufs[bucketIdx]!;
      buf[n * 3]     = sx;
      buf[n * 3 + 1] = sy;
      buf[n * 3 + 2] = sz;
      counts[bucketIdx]!++;
    }

    const result = H_BUCKETS.map((bucket, i) => ({
      positions: bufs[i]!.slice(0, counts[i]! * 3),
      bucket,
    }));

    cachedBucketsRef.current = result;
    lastComputedEpochRef.current = epochMs;
    return result;
  }, [entries, epoch, distanceMode]);

  if (!visible) return null;

  return (
    <>
      {bucketData.map((bd, i) => {
        if (bd.positions.length === 0) return null;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(bd.positions, 3));
        return (
          <points key={i} geometry={geo}>
            <pointsMaterial
              color={color}
              size={bd.bucket.size}
              sizeAttenuation
              transparent
              opacity={bd.bucket.opacity}
              depthWrite={false}
            />
          </points>
        );
      })}
    </>
  );
}
