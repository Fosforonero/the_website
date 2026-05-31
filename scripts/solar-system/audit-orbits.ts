import { SOLAR_BODIES } from "../../lib/solar-system/bodies";
import { getBodyStatesForDate } from "../../lib/solar-system/ephemeris";
import { scaleDistance, scaleRadius, AU_KM } from "../../lib/solar-system/scales";

const DATE = new Date("2026-05-29T00:00:00Z");
const states = getBodyStatesForDate(DATE);
const byId = new Map(states.map((s) => [s.id, s]));
const bodyById = new Map(SOLAR_BODIES.map((b) => [b.id, b]));

let warnings = 0;

function warn(msg: string) {
  console.log(`  [WARN] ${msg}`);
  warnings++;
}

// Category ordering for size hierarchy check
const CAT_RANK: Record<string, number> = {
  star: 6,
  planet: 5,
  "dwarf-planet": 3,
  moon: 3,
  asteroid: 2,
  comet: 1,
  tno: 2,
};

// Override for specific hierarchy within planet-like bodies
const BODY_RANK: Record<string, number> = {
  sun: 100,
  jupiter: 50, saturn: 49, uranus: 48, neptune: 47,
  earth: 40, venus: 39, mars: 38, mercury: 37,
  ganymede: 30, titan: 29, callisto: 28, io: 27, europa: 26, triton: 25,
  moon: 24,
  pluto: 20, eris: 19, haumea: 18, makemake: 17, ceres: 16,
  sedna: 15, vesta: 14, charon: 13, enceladus: 12,
  "67p": 5, halley: 6,
};

void CAT_RANK; // used for future category-level checks

console.log("=".repeat(70));
console.log("Solar System Orbital Audit —", DATE.toISOString().slice(0, 10));
console.log("=".repeat(70));

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
  const visR = scaleRadius(body.radiusKm, "visible");
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

console.log("\n--- Moon separation checks (compressed mode) ---");

for (const body of SOLAR_BODIES) {
  if (body.category !== "moon") continue;
  const s = byId.get(body.id);
  const parent = body.parentId ? bodyById.get(body.parentId) : null;
  const ps = body.parentId ? byId.get(body.parentId) : null;
  if (!s || !parent || !ps) continue;

  const [px, py, pz] = s.positionKm;
  const [ppx, ppy, ppz] = ps.positionKm;
  const parentKm = Math.sqrt((px - ppx) ** 2 + (py - ppy) ** 2 + (pz - ppz) ** 2);

  const sepComp = scaleDistance(parentKm, "compressed");
  const moonVisR = scaleRadius(body.radiusKm, "visible");
  const parentVisR = scaleRadius(parent.radiusKm, "visible");
  const minSep = 3 * Math.max(parentVisR, moonVisR);

  const tooClose = sepComp < minSep;
  const status = tooClose ? "[WARN]" : "  OK  ";
  console.log(
    `  ${status} ${body.id.padEnd(10)} → ${parent.id.padEnd(10)} sep=${sepComp.toFixed(5)} minRequired=${minSep.toFixed(5)}`
  );
  if (tooClose) {
    warnings++;
  }
}

console.log("\n--- Size hierarchy checks (visible radius ordering) ---");
const orderedBodies = SOLAR_BODIES.filter((b) => BODY_RANK[b.id] !== undefined)
  .sort((a, b) => (BODY_RANK[b.id] ?? 0) - (BODY_RANK[a.id] ?? 0));

for (let i = 0; i < orderedBodies.length - 1; i++) {
  const bigger = orderedBodies[i];
  const smaller = orderedBodies[i + 1];
  if (!bigger || !smaller) continue;
  const bigR = scaleRadius(bigger.radiusKm, "visible");
  const smallR = scaleRadius(smaller.radiusKm, "visible");
  if (bigR <= smallR) {
    console.log(`  [WARN] ${bigger.id} visR=${bigR.toFixed(4)} should be > ${smaller.id} visR=${smallR.toFixed(4)}`);
    warnings++;
  }
}

console.log("\n" + "=".repeat(70));
if (warnings === 0) {
  console.log(`✅  All checks passed.`);
} else {
  console.log(`❌  ${warnings} warning(s) found. Fix the above issues.`);
}
console.log("=".repeat(70));

process.exit(warnings > 0 ? 1 : 0);
