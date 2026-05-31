import { readFileSync } from "fs";
import { join } from "path";
import { SOLAR_BODIES } from "../../lib/solar-system/bodies";
import { getBodyStatesForDate } from "../../lib/solar-system/ephemeris";
import { scaleDistance, scaleRadius, scaleSatelliteOffsetKm, AU_KM } from "../../lib/solar-system/scales";
import { isRetrogradeRotation } from "../../lib/solar-system/rotation-model";
import { PHYSICAL_LIGHTING, EDUCATIONAL_LIGHTING } from "../../lib/solar-system/lighting-model";

const DATE = new Date("2026-05-29T00:00:00Z");
const states = getBodyStatesForDate(DATE);
const byId = new Map(states.map((s) => [s.id, s]));
const bodyById = new Map(SOLAR_BODIES.map((b) => [b.id, b]));

let warnings = 0;

// Sprint 02 acceptance criteria: required size-ordering pairs (larger first).
const REQUIRED_SIZE_PAIRS: [string, string][] = [
  ["sun", "jupiter"],
  ["jupiter", "neptune"],
  ["neptune", "earth"],
  ["earth", "moon"],
  ["moon", "vesta"],
  ["pluto", "charon"],
  ["ceres", "halley"],
];

// Sprint 02 acceptance criteria: required moon visual separation pairs.
const REQUIRED_MOON_SEPS: Array<{ moonId: string; parentId: string }> = [
  { moonId: "moon", parentId: "earth" },
  { moonId: "io", parentId: "jupiter" },
  { moonId: "charon", parentId: "pluto" },
];

// ---------------------------------------------------------------------------

console.log("=".repeat(70));
console.log("Solar System Orbital Audit —", DATE.toISOString().slice(0, 10));
console.log("=".repeat(70));

// --- 1. Distances and radii table (informational) -------------------------

console.log("\n--- Body distances and radii ---");
console.log(
  "id".padEnd(12),
  "sunAU".padEnd(10),
  "parentKm".padEnd(14),
  "visR".padEnd(8),
  "relR".padEnd(10),
  "comp".padEnd(8),
  "log".padEnd(8)
);
console.log("-".repeat(70));

for (const body of SOLAR_BODIES) {
  const s = byId.get(body.id);
  if (!s) continue;

  const [px, py, pz] = s.positionKm;
  const sunDist = Math.sqrt(px * px + py * py + pz * pz);

  let parentKm = sunDist;
  if (body.parentId && body.parentId !== "sun") {
    const ps = byId.get(body.parentId);
    if (ps) {
      const [ppx, ppy, ppz] = ps.positionKm;
      parentKm = Math.sqrt(
        (px - ppx) ** 2 + (py - ppy) ** 2 + (pz - ppz) ** 2
      );
    }
  }

  const sunAU = sunDist / AU_KM;
  const visR = scaleRadius(body.radiusKm, "visible", body.category);
  const relR = scaleRadius(body.radiusKm, "relative");
  const comp = scaleDistance(sunDist, "compressed");
  const log = scaleDistance(sunDist, "real-log");

  console.log(
    body.id.padEnd(12),
    sunAU.toFixed(4).padEnd(10),
    Math.round(parentKm).toLocaleString().padEnd(14),
    visR.toFixed(4).padEnd(8),
    relR.toFixed(5).padEnd(10),
    comp.toFixed(3).padEnd(8),
    log.toFixed(3).padEnd(8)
  );
}

// --- 2. All-moon separation info (informational) --------------------------

console.log("\n--- Moon separation (educational scale) — informational ---");

for (const body of SOLAR_BODIES) {
  if (body.category !== "moon") continue;
  const s = byId.get(body.id);
  const parent = body.parentId ? bodyById.get(body.parentId) : null;
  const ps = body.parentId ? byId.get(body.parentId) : null;
  if (!s || !parent || !ps) continue;

  const [px, py, pz] = s.positionKm;
  const [ppx, ppy, ppz] = ps.positionKm;
  const parentKm = Math.sqrt((px - ppx) ** 2 + (py - ppy) ** 2 + (pz - ppz) ** 2);

  const sepVisual = scaleSatelliteOffsetKm(parentKm, body.parentId ?? "");
  const moonVisR = scaleRadius(body.radiusKm, "visible", body.category);
  const parentVisR = scaleRadius(parent.radiusKm, "visible", parent.category);
  const minSep = 3 * Math.max(parentVisR, moonVisR);
  const ok = sepVisual >= minSep;

  console.log(
    `  ${ok ? "  OK " : " INFO"} ${body.id.padEnd(10)} → ${parent.id.padEnd(10)} sepVis=${sepVisual.toFixed(5)} min=${minSep.toFixed(5)}`
  );
}

// --- 3. Required moon separations (sprint acceptance criteria) ------------

console.log("\n--- Required moon separations [sprint spec] ---");

for (const { moonId, parentId } of REQUIRED_MOON_SEPS) {
  const moon = bodyById.get(moonId);
  const parent = bodyById.get(parentId);
  const ms = byId.get(moonId);
  const ps = byId.get(parentId);
  if (!moon || !parent || !ms || !ps) {
    console.log(`  [WARN] ${moonId} or ${parentId} not found`);
    warnings++;
    continue;
  }

  const [mx, my, mz] = ms.positionKm;
  const [ppx, ppy, ppz] = ps.positionKm;
  const offsetKm = Math.sqrt((mx - ppx) ** 2 + (my - ppy) ** 2 + (mz - ppz) ** 2);

  const sepVisual = scaleSatelliteOffsetKm(offsetKm, parentId);
  const moonVisR = scaleRadius(moon.radiusKm, "visible", moon.category);
  const parentVisR = scaleRadius(parent.radiusKm, "visible", parent.category);
  const minSep = 3 * Math.max(parentVisR, moonVisR);
  const ok = sepVisual >= minSep;

  console.log(
    `  ${ok ? "    OK" : " [WARN]"} ${moonId.padEnd(8)} → ${parentId.padEnd(8)} sepVis=${sepVisual.toFixed(5)} minRequired=${minSep.toFixed(5)}`
  );
  if (!ok) warnings++;
}

// --- 4. Required size ordering (sprint acceptance criteria) ---------------

console.log("\n--- Required size ordering [sprint spec] ---");

for (const [biggerId, smallerId] of REQUIRED_SIZE_PAIRS) {
  const bigger = bodyById.get(biggerId);
  const smaller = bodyById.get(smallerId);
  if (!bigger || !smaller) {
    console.log(`  [WARN] body not found: ${biggerId} or ${smallerId}`);
    warnings++;
    continue;
  }
  const bigR = scaleRadius(bigger.radiusKm, "visible", bigger.category);
  const smallR = scaleRadius(smaller.radiusKm, "visible", smaller.category);
  const ok = bigR > smallR;
  console.log(
    `  ${ok ? "    OK" : " [WARN]"} ${biggerId.padEnd(8)} visR=${bigR.toFixed(4)} ${ok ? ">" : "≤"} ${smallerId.padEnd(8)} visR=${smallR.toFixed(4)}`
  );
  if (!ok) warnings++;
}

// --- A. Axial tilt checks [sprint 03A] -------------------------------------

console.log("\n--- Axial tilt and retrograde checks [sprint 03A] ---");

// Required tilt ranges (IAU 2015)
const TILT_CHECKS: Array<{ id: string; minDeg: number; maxDeg: number; note: string }> = [
  { id: "earth",   minDeg: 23.0,  maxDeg: 24.0,  note: "Earth obliquity" },
  { id: "saturn",  minDeg: 26.0,  maxDeg: 27.5,  note: "Saturn obliquity" },
  { id: "uranus",  minDeg: 97.0,  maxDeg: 98.5,  note: "Uranus extreme tilt" },
  { id: "venus",   minDeg: 177.0, maxDeg: 178.0, note: "Venus retrograde tilt" },
  { id: "mars",    minDeg: 24.5,  maxDeg: 26.0,  note: "Mars obliquity" },
  { id: "neptune", minDeg: 27.5,  maxDeg: 29.0,  note: "Neptune obliquity" },
];

for (const check of TILT_CHECKS) {
  const body = bodyById.get(check.id);
  if (!body) {
    console.log(`  [WARN] body not found: ${check.id}`);
    warnings++;
    continue;
  }
  const tilt = body.axialTiltDeg;
  if (tilt === undefined) {
    console.log(`  [WARN] ${check.id.padEnd(8)} axialTiltDeg missing (${check.note})`);
    warnings++;
    continue;
  }
  const ok = tilt >= check.minDeg && tilt <= check.maxDeg;
  console.log(
    `  ${ok ? "    OK" : " [WARN]"} ${check.id.padEnd(8)} tilt=${tilt.toFixed(3)}° (expected ${check.minDeg}–${check.maxDeg}° — ${check.note})`
  );
  if (!ok) warnings++;
}

// --- B. Retrograde rotation checks [sprint 03A] ----------------------------

console.log("\n--- Retrograde rotation checks [sprint 03A] ---");

const RETROGRADE_BODIES = [
  { id: "venus",  reason: "177° tilt + negative sidereal period" },
  { id: "uranus", reason: "97.8° tilt (>90° = retrograde sense)" },
  { id: "pluto",  reason: "122.5° tilt + negative sidereal period" },
];

for (const check of RETROGRADE_BODIES) {
  const body = bodyById.get(check.id);
  if (!body) {
    console.log(`  [WARN] body not found: ${check.id}`);
    warnings++;
    continue;
  }
  const isRetro = isRetrogradeRotation(body);
  const hasTilt = body.axialTiltDeg !== undefined;
  const hasPeriod = body.siderealRotationHours !== undefined;
  console.log(
    `  ${isRetro ? "    OK" : " [WARN]"} ${check.id.padEnd(8)} retrograde=${isRetro} tilt=${body.axialTiltDeg ?? "—"}° period=${body.siderealRotationHours ?? "—"}h (${check.reason})`
  );
  if (!isRetro || !hasTilt || !hasPeriod) warnings++;
}

// --- C. Ring system checks [sprint 03A] ------------------------------------

console.log("\n--- Ring system checks [sprint 03A] ---");

const RING_BODIES = [
  { id: "saturn",  minInner: 70_000, minOuter: 130_000 },
  { id: "uranus",  minInner: 30_000, minOuter: 45_000 },
];

for (const check of RING_BODIES) {
  const body = bodyById.get(check.id);
  if (!body) {
    console.log(`  [WARN] body not found: ${check.id}`);
    warnings++;
    continue;
  }
  const hasRings = body.ringInnerKm !== undefined && body.ringOuterKm !== undefined;
  const innerOk = hasRings && body.ringInnerKm! > body.radiusKm;
  const outerOk = hasRings && body.ringOuterKm! > body.ringInnerKm!;
  const innerRange = hasRings && body.ringInnerKm! >= check.minInner;
  const outerRange = hasRings && body.ringOuterKm! >= check.minOuter;
  const ok = hasRings && innerOk && outerOk && innerRange && outerRange;
  console.log(
    `  ${ok ? "    OK" : " [WARN]"} ${check.id.padEnd(8)} rings=${hasRings} inner=${body.ringInnerKm ?? "—"} km outer=${body.ringOuterKm ?? "—"} km (body radius=${body.radiusKm} km)`
  );
  if (!ok) warnings++;
}

// --- D. No circular orbit ring regression [sprint 02] ----------------------

console.log("\n--- No circular orbit ring regression [sprint 02] ---");

const sceneSource = readFileSync(
  join(process.cwd(), "components/lab/solar-system-scene.tsx"),
  "utf-8"
);

// Old OrbitRing component used ringGeometry — must be gone
const hasOldOrbitRing = sceneSource.includes("OrbitRing") ||
  (sceneSource.includes("ringGeometry") && sceneSource.includes("ORBIT_RING_SEGMENTS"));

console.log(
  `  ${hasOldOrbitRing ? " [WARN]" : "    OK"} No old circular OrbitRing / ORBIT_RING_SEGMENTS found`
);
if (hasOldOrbitRing) warnings++;

// Verify sampled OrbitPath is present
const hasSampledOrbit = sceneSource.includes("OrbitPath") && sceneSource.includes("lineLoop");
console.log(
  `  ${hasSampledOrbit ? "    OK" : " [WARN]"} Sampled OrbitPath with lineLoop present`
);
if (!hasSampledOrbit) warnings++;

// --- E. Moon local scale disclosure [sprint 02] ----------------------------

console.log("\n--- Moon local scale disclosure [sprint 02] ---");

const viewSource = readFileSync(
  join(process.cwd(), "components/lab/solar-system-view.tsx"),
  "utf-8"
);

const hasMoonScaleNote = viewSource.includes("moonScaleNote");
const hasScaleSatelliteOffset = readFileSync(
  join(process.cwd(), "components/lab/solar-system-scene.tsx"),
  "utf-8"
).includes("scaleSatelliteOffsetKm");

console.log(
  `  ${hasMoonScaleNote ? "    OK" : " [WARN]"} moonScaleNote disclosure in view`
);
console.log(
  `  ${hasScaleSatelliteOffset ? "    OK" : " [WARN]"} scaleSatelliteOffsetKm used in scene`
);
if (!hasMoonScaleNote) warnings++;
if (!hasScaleSatelliteOffset) warnings++;

// --- F. Physical lighting model checks [sprint 03A] ------------------------

console.log("\n--- Physical lighting model checks [sprint 03A] ---");

const physOk = PHYSICAL_LIGHTING.sunDecay === 2 && PHYSICAL_LIGHTING.ambientIntensity === 0 && PHYSICAL_LIGHTING.sunDistance === 0;
const eduOk = EDUCATIONAL_LIGHTING.sunDecay === 2 && EDUCATIONAL_LIGHTING.ambientIntensity > 0 && EDUCATIONAL_LIGHTING.sunDistance === 0;

console.log(
  `  ${physOk ? "    OK" : " [WARN]"} Physical lighting: decay=2 ambient=0 distance=unlimited`
);
console.log(
  `  ${eduOk ? "    OK" : " [WARN]"} Educational lighting: decay=2 ambient=${EDUCATIONAL_LIGHTING.ambientIntensity} (declared boost)`
);
if (!physOk) warnings++;
if (!eduOk) warnings++;

// Verify scene no longer contains the old decay=1.8
const sceneSource2 = readFileSync(
  join(process.cwd(), "components/lab/solar-system-scene.tsx"),
  "utf-8"
);
const hasOldDecay = sceneSource2.includes("decay={1.8}") || sceneSource2.includes("decay: 1.8");
console.log(
  `  ${hasOldDecay ? " [WARN]" : "    OK"} Old non-physical decay=1.8 removed from scene`
);
if (hasOldDecay) warnings++;

// --- Summary ---------------------------------------------------------------

console.log("\n" + "=".repeat(70));
if (warnings === 0) {
  console.log("✅  All sprint acceptance checks passed.");
} else {
  console.log(`❌  ${warnings} sprint acceptance check(s) FAILED.`);
}
console.log("=".repeat(70));

process.exit(warnings > 0 ? 1 : 0);
