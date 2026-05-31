import { SOLAR_BODIES } from "../../lib/solar-system/bodies";
import { getBodyStatesForDate } from "../../lib/solar-system/ephemeris";
import { scaleDistance, scaleRadius, scaleSatelliteOffsetKm, AU_KM } from "../../lib/solar-system/scales";

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

// --- Summary ---------------------------------------------------------------

console.log("\n" + "=".repeat(70));
if (warnings === 0) {
  console.log("✅  All sprint acceptance checks passed.");
} else {
  console.log(`❌  ${warnings} sprint acceptance check(s) FAILED.`);
}
console.log("=".repeat(70));

process.exit(warnings > 0 ? 1 : 0);
