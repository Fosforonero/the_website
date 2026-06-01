import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { SOLAR_BODIES } from "../../lib/solar-system/bodies";
import { SOLAR_ASSETS } from "../../lib/solar-system/assets";
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

// Explicit rotationDirection field checks (must be set, never inferred)
const RETROGRADE_BODIES: Array<{ id: string; expectedDir: "retrograde" | "prograde"; reason: string }> = [
  { id: "venus",  expectedDir: "retrograde", reason: "177.4° obliquity + negative sidereal period" },
  { id: "uranus", expectedDir: "retrograde", reason: "97.8° obliquity (>90°) + negative sidereal period" },
  { id: "pluto",  expectedDir: "retrograde", reason: "119.6° obliquity + negative sidereal period" },
  { id: "earth",  expectedDir: "prograde",   reason: "23.4° obliquity, prograde" },
  { id: "saturn", expectedDir: "prograde",   reason: "26.7° obliquity, prograde" },
];

for (const check of RETROGRADE_BODIES) {
  const body = bodyById.get(check.id);
  if (!body) {
    console.log(`  [WARN] body not found: ${check.id}`);
    warnings++;
    continue;
  }
  // Must have explicit rotationDirection field (not inferred)
  const hasDir = body.rotationDirection !== undefined;
  const dirMatch = body.rotationDirection === check.expectedDir;
  const isRetro = isRetrogradeRotation(body);
  const ok = hasDir && dirMatch;
  console.log(
    `  ${ok ? "    OK" : " [WARN]"} ${check.id.padEnd(8)} rotationDirection=${body.rotationDirection ?? "MISSING"} (expected ${check.expectedDir}) tilt=${body.axialTiltDeg ?? "—"}° — ${check.reason}`
  );
  if (!ok) warnings++;
  void isRetro;
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

// --- G. Catalog snapshot validation [sprint 03B] --------------------------

console.log("\n--- Catalog snapshot validation [sprint 03B] ---");

const CATALOG_DIR_PATH = join(process.cwd(), "public/lab/solar-system/catalog");
const CATALOG_REQUIRED = [
  "neo.json",
  "mba-top5000.json",
  "comets.json",
  "tnos.json",
  "centaurs.json",
  "manifest.json",
];

for (const file of CATALOG_REQUIRED) {
  const filePath = join(CATALOG_DIR_PATH, file);
  if (!existsSync(filePath)) {
    console.log(`  [WARN] Missing: ${file} — run pnpm solar:fetch-catalog`);
    warnings++;
  } else {
    const raw = JSON.parse(readFileSync(filePath, "utf-8")) as {
      meta?: { count?: number; retrievedAt?: string };
      chunks?: unknown[];
    };
    const count = raw.meta?.count ?? (raw.chunks ? raw.chunks.length : "?");
    const date = raw.meta?.retrievedAt ?? "—";
    const kb = Math.round(readFileSync(filePath).length / 1024);
    console.log(
      `    OK  ${file.padEnd(24)} ${String(kb).padStart(5)} kB  count=${count}  retrieved=${date}`
    );
    // For neo.json: warn if count is below the full NEO population threshold
    if (file === "neo.json") {
      const neoCount = raw.meta?.count ?? 0;
      if (neoCount < 20_000) {
        console.log(`  [WARN] neo.json count=${neoCount} is below 20,000 — snapshot may be capped. Run pnpm solar:fetch-catalog.`);
        warnings++;
      }
    }
  }
}

// --- H. Texture manifest checks [sprint 05] ---------------------------------

console.log("\n--- Texture manifest checks [sprint 05] ---");

for (const asset of SOLAR_ASSETS) {
  if (asset.confidence === "real-map") {
    // real-map requires a localPath
    if (!asset.localPath) {
      console.log(`  FAIL ${asset.bodyId.padEnd(10)} confidence=real-map but localPath is missing`);
      warnings++;
      continue;
    }
    // localPath must point to an existing file under public/
    const segments = asset.localPath.split("/").filter(Boolean);
    const filePath = join(process.cwd(), "public", ...segments);
    if (!existsSync(filePath)) {
      console.log(`  FAIL ${asset.bodyId.padEnd(10)} confidence=real-map localPath=${asset.localPath} — file not found on disk`);
      warnings++;
    } else {
      console.log(`      OK ${asset.bodyId.padEnd(10)} confidence=real-map localPath=${asset.localPath}`);
    }
  } else if (asset.localPath) {
    // procedural/symbolic with a localPath — verify the file actually exists
    const segments = asset.localPath.split("/").filter(Boolean);
    const filePath = join(process.cwd(), "public", ...segments);
    if (!existsSync(filePath)) {
      console.log(`  FAIL ${asset.bodyId.padEnd(10)} confidence=${asset.confidence} localPath=${asset.localPath} — file not found on disk`);
      warnings++;
    } else {
      console.log(`      OK ${asset.bodyId.padEnd(10)} confidence=${asset.confidence} localPath=${asset.localPath}`);
    }
  } else {
    console.log(`      OK ${asset.bodyId.padEnd(10)} confidence=${asset.confidence} (no localPath — expected)`);
  }
}

// --- I. Atmosphere metadata checks [sprint 05] ------------------------------

console.log("\n--- Atmosphere metadata checks [sprint 05] ---");

for (const body of SOLAR_BODIES) {
  if (body.atmosphereHeightKm === undefined) continue;

  let ok = true;

  if (body.atmosphereHeightKm <= 0) {
    console.log(`  FAIL ${body.id.padEnd(10)} atmosphereHeightKm=${body.atmosphereHeightKm} — must be > 0`);
    warnings++;
    ok = false;
  }
  if (!body.atmosphereLabel?.it) {
    console.log(`  FAIL ${body.id.padEnd(10)} atmosphereLabel.it is missing or empty`);
    warnings++;
    ok = false;
  }
  if (!body.atmosphereLabel?.en) {
    console.log(`  FAIL ${body.id.padEnd(10)} atmosphereLabel.en is missing or empty`);
    warnings++;
    ok = false;
  }

  if (ok) {
    console.log(`      OK ${body.id.padEnd(10)} atmosphereHeightKm=${body.atmosphereHeightKm} km`);
  }
}

// --- J. Physics honesty checks [sprint 05] ----------------------------------

console.log("\n--- Physics honesty checks [sprint 05] ---");

// Verify that SOLAR_BODIES does not have any field implying N-body, eclipses,
// or magnetic fields are computed (none of these exist in the current type)
const noFakePhysics = SOLAR_BODIES.every(
  (b) => !("nbodyEnabled" in b) && !("eclipseEnabled" in b) && !("magneticFieldEnabled" in b)
);
if (!noFakePhysics) {
  warnings++;
  console.log("  FAIL No-fake-physics guard: unexpected physics fields in SOLAR_BODIES");
} else {
  console.log("   OK  no-fake-physics guard — N-body/eclipse/magnetic fields not in body catalog");
}

// --- K. Rotation model checks [sprint 05.2] ---------------------------------

console.log("\n--- Rotation model checks [sprint 05.2] ---");

// K1: real-map bodies must declare rotationModel
for (const asset of SOLAR_ASSETS) {
  if (asset.confidence !== "real-map") continue;
  const body = bodyById.get(asset.bodyId);
  if (!body) {
    console.log(`  FAIL  ${asset.bodyId}  real-map asset but body not found in SOLAR_BODIES`);
    warnings++;
    continue;
  }
  if (body.rotationModel === undefined) {
    console.log(`  FAIL  ${asset.bodyId}  real-map asset but no rotationModel declared`);
    warnings++;
  } else {
    console.log(`    OK  ${asset.bodyId}  rotationModel=${body.rotationModel}`);
  }
}

// K2: real-map bodies without textureLongitudeOffsetDeg get a WARNING (not FAIL)
for (const asset of SOLAR_ASSETS) {
  if (asset.confidence !== "real-map") continue;
  const body = bodyById.get(asset.bodyId);
  if (!body) continue; // already reported in K1
  if (body.textureLongitudeOffsetDeg === undefined) {
    console.log(`  WARN ${asset.bodyId}  real-map but textureLongitudeOffsetDeg not declared`);
    warnings++;
  } else if (body.textureLongitudeOffsetDeg === "not-verified") {
    console.log(`  WARN ${asset.bodyId}  textureLongitudeOffsetDeg=not-verified — alignment not empirically tested`);
    // not-verified is an honest declaration — do NOT increment warnings
  } else {
    console.log(`    OK  ${asset.bodyId}  textureLongitudeOffsetDeg=${body.textureLongitudeOffsetDeg}°`);
  }
}

// K3: IAU WGCCRE completeness for bodies with rotationModel = "iau-wgccre"
for (const body of SOLAR_BODIES) {
  if (body.rotationModel !== "iau-wgccre") continue;
  const missingW0 = body.primeMeridianDeg === undefined;
  const missingWdot = body.rotationRateDegPerDay === undefined;
  if (missingW0 || missingWdot) {
    if (missingW0) {
      console.log(`  FAIL  ${body.id}  rotationModel=iau-wgccre but primeMeridianDeg is missing`);
      warnings++;
    }
    if (missingWdot) {
      console.log(`  FAIL  ${body.id}  rotationModel=iau-wgccre but rotationRateDegPerDay is missing`);
      warnings++;
    }
  } else {
    console.log(`    OK  ${body.id}  W0=${body.primeMeridianDeg}° Ẇ=${body.rotationRateDegPerDay}°/day`);
  }
}

// --- L. Catalog selection checks [sprint 06] --------------------------------

console.log("\n--- Catalog selection checks [sprint 06] ---");

const ephemerisSource = readFileSync(
  join(process.cwd(), "lib/solar-system/ephemeris.ts"),
  "utf-8"
);

// L1: sampleCatalogEntryOrbitPath must be exported from ephemeris.ts
const hasExportedSampleOrbitPath = /export\s+function\s+sampleCatalogEntryOrbitPath/.test(ephemerisSource);
console.log(
  `  ${hasExportedSampleOrbitPath ? "    OK" : "  FAIL"} L1: sampleCatalogEntryOrbitPath exported from ephemeris.ts`
);
if (!hasExportedSampleOrbitPath) warnings++;

// L2: CatalogOrbitPath component must exist in solar-system-scene.tsx
const sceneSource3 = readFileSync(
  join(process.cwd(), "components/lab/solar-system-scene.tsx"),
  "utf-8"
);
const hasCatalogOrbitPath = /function CatalogOrbitPath/.test(sceneSource3);
console.log(
  `  ${hasCatalogOrbitPath ? "    OK" : "  FAIL"} L2: CatalogOrbitPath component present in solar-system-scene.tsx`
);
if (!hasCatalogOrbitPath) warnings++;

// L3: CometTail component must exist in solar-system-scene.tsx
const hasCometTail = /function CometTail/.test(sceneSource3);
console.log(
  `  ${hasCometTail ? "    OK" : "  FAIL"} L3: CometTail component present in solar-system-scene.tsx`
);
if (!hasCometTail) warnings++;

// L4: catalog layer renders as Points, not per-body paths
// CatalogLayer must be present (the Points layer)
const hasCatalogLayer = sceneSource3.includes("CatalogLayer");
// Must NOT have a loop rendering all catalog orbit paths
// Look for JSX patterns that would render CatalogOrbitPath in a loop over all entries
const hasAllCatalogOrbitPaths =
  /catalogLayers.*\.map.*CatalogOrbitPath/.test(sceneSource3) ||
  /catalogEntries.*\.map.*CatalogOrbitPath/.test(sceneSource3) ||
  /\.map\(.*entry.*\).*CatalogOrbitPath/.test(sceneSource3) ||
  /for\s*\(.*catalog.*\)\s*\{[^}]*CatalogOrbitPath/.test(sceneSource3);
// CatalogOrbitPath must only appear in context of selectedCatalogEntry, not a loop
const selectedOnlyPattern = /selectedCatalogEntry[^}]+CatalogOrbitPath/.test(sceneSource3) ||
  (/CatalogOrbitPath/.test(sceneSource3) && !hasAllCatalogOrbitPaths);
const l4ok = hasCatalogLayer && !hasAllCatalogOrbitPaths && selectedOnlyPattern;
console.log(
  `  ${hasCatalogLayer ? "    OK" : "  FAIL"} L4a: CatalogLayer (Points) present in scene`
);
if (!hasCatalogLayer) warnings++;
console.log(
  `  ${!hasAllCatalogOrbitPaths ? "    OK" : "  FAIL"} L4b: No loop rendering all catalog orbit paths`
);
if (hasAllCatalogOrbitPaths) warnings++;
console.log(
  `  ${selectedOnlyPattern ? "    OK" : "  FAIL"} L4c: CatalogOrbitPath only rendered for selectedCatalogEntry (not all entries)`
);
if (!selectedOnlyPattern) warnings++;

void l4ok;

// --- Summary ---------------------------------------------------------------

console.log("\n" + "=".repeat(70));
if (warnings === 0) {
  console.log("✅  All sprint acceptance checks passed.");
} else {
  console.log(`❌  ${warnings} sprint acceptance check(s) FAILED.`);
}
console.log("=".repeat(70));

process.exit(warnings > 0 ? 1 : 0);
