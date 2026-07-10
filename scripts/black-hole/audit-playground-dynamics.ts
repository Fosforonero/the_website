// ---------------------------------------------------------------------------
// Mandatory test suite for fix/bh-playground-dynamics (7 scenarios required
// by spec). Run: tsx scripts/black-hole/audit-playground-dynamics.ts
//
// Mirrors the project's existing scripts/solar-system/audit-orbits.ts style:
// a plain tsx script with console-table output and a pass/fail counter, not a
// test framework (none exists in this repo yet and none of these checks need
// jsdom/DOM — pure numerical assertions against playground-physics.ts).
// ---------------------------------------------------------------------------
import * as THREE from "three";
import {
  createSimState, spawnBody, spawnPlanetWithMoons, spawnInfallingStellarSystemPreset, advanceSimulation,
  computeEnergy, computeBarycenter, computeMomentum,
  hillRadius, tidalRadiusFromDensity, DENSITY_BY_KIND, GM, RS, HILL_EPS2, type Body, type BodyKind,
} from "../../components/lab/black-hole/playground-physics";

let pass = 0, fail = 0;
function check(name: string, ok: boolean, detail: string) {
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  if (ok) pass++; else fail++;
}
function section(title: string) {
  console.log("\n" + "=".repeat(78));
  console.log(title);
  console.log("=".repeat(78));
}

function vCircAt(r: number): number {
  return Math.sqrt(GM * r) / Math.max(r - RS, 0.1);
}

// ---------------------------------------------------------------------------
// 1. Two equal bodies: mirror symmetry + stable (zero) barycenter/momentum.
// ---------------------------------------------------------------------------
section("1. Two equal bodies — symmetry and barycenter stability");
{
  const state = createSimState(1);
  const r = 15, v = vCircAt(r) * 0.9; // slightly sub-circular so it's not a trivial static mirror
  const A = spawnBody(state, "planet", new THREE.Vector3(r, 0, 0), new THREE.Vector3(0, 0, v), 0.01, 0.1, new THREE.Color("#fff"));
  const B = spawnBody(state, "planet", new THREE.Vector3(-r, 0, 0), new THREE.Vector3(0, 0, -v), 0.01, 0.1, new THREE.Color("#fff"));
  let maxMirrorErr = 0, maxBary = 0, maxP = 0;
  for (let i = 0; i < 2000; i++) {
    advanceSimulation(state, 1 / 60, { gwOn: false });
    const sumPos = A.pos.clone().add(B.pos).length();
    const bary = computeBarycenter(state.bodies).length();
    const p = computeMomentum(state.bodies).length();
    maxMirrorErr = Math.max(maxMirrorErr, sumPos);
    maxBary = Math.max(maxBary, bary);
    maxP = Math.max(maxP, p);
  }
  check("mirror symmetry holds (A.pos ≈ −B.pos)", maxMirrorErr < 1e-6, `max |A+B| = ${maxMirrorErr.toExponential(3)}`);
  check("barycenter stays at origin", maxBary < 1e-6, `max |barycenter| = ${maxBary.toExponential(3)}`);
  check("momentum stays ≈0", maxP < 1e-6, `max |p| = ${maxP.toExponential(3)}`);
}

// ---------------------------------------------------------------------------
// 2. Same scenario, bodies array reversed: equivalent (order-independent) result.
// ---------------------------------------------------------------------------
section("2. Order independence — same scenario, reversed bodies array");
{
  function buildFiveBody(): Body[] {
    const bodies: Body[] = [];
    const specs = [
      { r: 12, phase: 0.0, m: 0.02 },
      { r: 18, phase: 1.1, m: 0.01 },
      { r: 25, phase: 2.4, m: 0.015 },
      { r: 33, phase: 3.6, m: 0.008 },
      { r: 42, phase: 5.0, m: 0.012 },
    ];
    let id = 1;
    for (const s of specs) {
      const v = vCircAt(s.r);
      const pos = new THREE.Vector3(s.r * Math.cos(s.phase), 0, s.r * Math.sin(s.phase));
      const vel = new THREE.Vector3(-Math.sin(s.phase), 0, Math.cos(s.phase)).multiplyScalar(v);
      bodies.push({
        id: id++, kind: "planet", pos, vel, mass: s.m, density: 0.003, visualRadius: 0.1,
        color: new THREE.Color("#fff"), parentId: null,
      });
    }
    return bodies;
  }

  const stateFwd = createSimState(2);
  stateFwd.bodies = buildFiveBody();
  const stateRev = createSimState(2);
  stateRev.bodies = buildFiveBody().reverse();

  for (let i = 0; i < 3000; i++) {
    advanceSimulation(stateFwd, 1 / 60, { gwOn: false });
    advanceSimulation(stateRev, 1 / 60, { gwOn: false });
  }

  const byIdFwd = new Map(stateFwd.bodies.map((b) => [b.id, b]));
  const byIdRev = new Map(stateRev.bodies.map((b) => [b.id, b]));
  let maxPosDiff = 0, maxVelDiff = 0;
  for (const [id, bf] of byIdFwd) {
    const br = byIdRev.get(id);
    if (!br) continue;
    maxPosDiff = Math.max(maxPosDiff, bf.pos.distanceTo(br.pos));
    maxVelDiff = Math.max(maxVelDiff, bf.vel.distanceTo(br.vel));
  }
  check("same body count survives both orders", stateFwd.bodies.length === stateRev.bodies.length, `${stateFwd.bodies.length} vs ${stateRev.bodies.length}`);
  check("positions match (order-independent)", maxPosDiff < 1e-9, `max |Δpos| = ${maxPosDiff.toExponential(3)}`);
  check("velocities match (order-independent)", maxVelDiff < 1e-9, `max |Δvel| = ${maxVelDiff.toExponential(3)}`);

  // computeMomentum must actually be mass-weighted (Σ m·v), not a bare
  // Σ v — these 5 bodies have pairwise-distinct masses, so a bug that
  // dropped the mass factor would NOT go unnoticed here the way it would in
  // scenario 1's equal-and-opposite (m_A=m_B, v_A=−v_B) setup, where p=0
  // regardless of whether momentum is mass-weighted at all.
  const fresh = buildFiveBody();
  const handComputed = new THREE.Vector3();
  for (const b of fresh) handComputed.addScaledVector(b.vel, b.mass);
  const reported = computeMomentum(fresh);
  const momentumErr = handComputed.distanceTo(reported);
  check("computeMomentum is mass-weighted (Σ m·v), not a bare Σ v", momentumErr < 1e-12, `|handComputed − computeMomentum| = ${momentumErr.toExponential(3)}`);
}

// ---------------------------------------------------------------------------
// 3. Circular planet: energy drift measured after ≥20 orbits.
// ---------------------------------------------------------------------------
section("3. Circular orbit — energy drift after 20+ orbits");
{
  const state = createSimState(3);
  const r = 20;
  const v = vCircAt(r);
  const period = (2 * Math.PI * r) / v; // sim-seconds per orbit
  spawnBody(state, "planet", new THREE.Vector3(r, 0, 0), new THREE.Vector3(0, 0, v), 0.001, 0.1, new THREE.Color("#fff"));
  const E0 = computeEnergy(state.bodies);
  const targetSimTime = period * 22;
  while (state.simTimeElapsed < targetSimTime) advanceSimulation(state, 999, { gwOn: false });
  const E1 = computeEnergy(state.bodies);
  const r1 = state.bodies[0]!.pos.length();
  const drift = Math.abs((E1 - E0) / E0);
  check("22 orbital periods completed", state.simTimeElapsed >= targetSimTime, `simTime=${state.simTimeElapsed.toFixed(1)}s, target=${targetSimTime.toFixed(1)}s (period=${period.toFixed(2)}s)`);
  check("orbit stays circular (radius within 1%)", Math.abs(r1 - r) / r < 0.01, `r0=${r}, r_final=${r1.toFixed(4)}`);
  check("energy drift < 0.1% after 20+ orbits", drift < 1e-3, `E0=${E0.toExponential(4)}, E1=${E1.toExponential(4)}, drift=${(drift * 100).toExponential(3)}%`);
}

// ---------------------------------------------------------------------------
// 4. Planet + moon far from the BH: moon stays bound.
// ---------------------------------------------------------------------------
section("4. Planet+moon far from the BH — moon stays stable");
{
  const state = createSimState(4);
  const r = 150; // far — large, stable Hill sphere
  const v = vCircAt(r);
  const planet = spawnBody(state, "planet", new THREE.Vector3(r, 0, 0), new THREE.Vector3(0, 0, v), 0.01, 0.15, new THREE.Color("#fff"));
  const hill0 = hillRadius(planet.mass, r);
  const rl = hill0 * 0.15; // safely inside the Hill sphere
  const vMoon = Math.sqrt((planet.mass * rl * rl) / Math.pow(rl * rl + HILL_EPS2, 1.5));
  spawnBody(
    state, "planet", planet.pos.clone().add(new THREE.Vector3(rl, 0, 0)),
    planet.vel.clone().add(new THREE.Vector3(0, 0, vMoon)), 0.0001, 0.02, new THREE.Color("#ccc"), planet.id,
  );
  let everDetached = false, maxDistOverHill = 0;
  for (let i = 0; i < 6000; i++) {
    advanceSimulation(state, 1 / 60, { gwOn: false });
    const moon = state.bodies.find((b) => b.parentId !== null);
    if (!moon) { everDetached = true; break; }
    const host = state.bodies.find((b) => b.id === moon.parentId)!;
    const dist = moon.pos.distanceTo(host.pos);
    const hill = hillRadius(host.mass, host.pos.length());
    maxDistOverHill = Math.max(maxDistOverHill, dist / hill);
  }
  check("moon never detaches", !everDetached, everDetached ? "detached during the run" : "stayed bound for 100s");
  check("moon stays well inside the Hill sphere", maxDistOverHill < 0.5, `max dist/hill = ${maxDistOverHill.toFixed(3)}`);
}

// ---------------------------------------------------------------------------
// 5. Same system approaching the BH: moon torn away as the Hill sphere shrinks.
// ---------------------------------------------------------------------------
section("5. Planet+moon approaching the BH — moon detaches as Hill sphere shrinks");
{
  const state = createSimState(5);
  const r0 = 150;
  const vFull = vCircAt(r0);
  // Sub-circular (0.55x) launch from r0 → a single eccentric two-body ellipse
  // (no dissipation, gwOn:false), falling from apoapsis r0 toward periapsis —
  // the Hill sphere shrinks with r well before periapsis is reached.
  const planet = spawnBody(
    state, "planet", new THREE.Vector3(r0, 0, 0), new THREE.Vector3(0, 0, vFull * 0.55),
    0.01, 0.15, new THREE.Color("#fff"),
  );
  const hill0 = hillRadius(planet.mass, r0);
  const rl = hill0 * 0.5; // inside the INITIAL Hill sphere, but not deep — will fall outside it once Hill shrinks enough
  const vMoon = Math.sqrt((planet.mass * rl * rl) / Math.pow(rl * rl + HILL_EPS2, 1.5));
  const moon = spawnBody(
    state, "planet", planet.pos.clone().add(new THREE.Vector3(rl, 0, 0)),
    planet.vel.clone().add(new THREE.Vector3(0, 0, vMoon)), 0.0001, 0.02, new THREE.Color("#ccc"), planet.id,
  );
  let detachedAt: number | null = null;
  let hillAtDetach = 0, rAtDetach = 0;
  for (let i = 0; i < 20000; i++) {
    advanceSimulation(state, 1 / 60, { gwOn: false });
    const m = state.bodies.find((b) => b.id === moon.id);
    if (!m) break; // consumed/merged — stop
    if (m.parentId === null) {
      detachedAt = state.simTimeElapsed;
      const p = state.bodies.find((b) => b.id === planet.id);
      if (p) { hillAtDetach = hillRadius(p.mass, p.pos.length()); rAtDetach = p.pos.length(); }
      break;
    }
  }
  check("moon detaches at some point during the approach", detachedAt !== null, detachedAt !== null ? `detached at simTime=${detachedAt.toFixed(1)}s (planet r=${rAtDetach.toFixed(2)}, hill=${hillAtDetach.toFixed(3)})` : "never detached");
  // Encode the CAUSAL claim, not just "detachment happened somewhere": the
  // planet must actually have fallen (rAtDetach < r0) and its Hill sphere
  // must actually have shrunk (hillAtDetach < hill0) — otherwise a bug that
  // detaches moons for an unrelated reason (e.g. a sign error in the relE
  // energy criterion) would still pass the check above.
  check(
    "detachment happened BECAUSE the planet fell and its Hill sphere shrank",
    detachedAt !== null && rAtDetach < r0 && hillAtDetach < hill0,
    `r0=${r0}, rAtDetach=${rAtDetach.toFixed(2)} (must be <${r0}); hill0=${hill0.toFixed(3)}, hillAtDetach=${hillAtDetach.toFixed(3)} (must be <${hill0.toFixed(3)})`,
  );
}

// ---------------------------------------------------------------------------
// 5b (extra, beyond the 7 mandated scenarios). Depth-2 hierarchy: a moon's
// Hill sphere must be judged against its OWN parent's actual perturber (the
// star it orbits), not the black hole — closing the gap the independent
// audit found: a moon-of-planet-of-star could read as falsely bound through
// the star's own tidal stripping if this used the BH by default.
// ---------------------------------------------------------------------------
section("5b (extra). Moon-of-planet-of-star — Hill sphere judged against the star, not the BH");
{
  const state = createSimState(9);
  const bodies = spawnInfallingStellarSystemPreset(state, 9);
  const star = bodies[0]!;
  const depthTwoMoons = bodies.filter((b) => {
    if (b.parentId === null) return false;
    const parent = bodies.find((p) => p.id === b.parentId);
    return parent !== undefined && parent.parentId !== null; // parent is itself a moon (of the star)
  });
  check("preset actually produced a depth-2 moon-of-planet-of-star", depthTwoMoons.length > 0, `${depthTwoMoons.length} depth-2 moon(s) found`);

  if (depthTwoMoons.length > 0) {
    const starRt = tidalRadiusFromDensity(DENSITY_BY_KIND.star);
    let starStrippingAt: number | null = null;
    let firstDepthTwoDetachAt: number | null = null;
    const watchIds = new Set(depthTwoMoons.map((b) => b.id));
    for (let i = 0; i < 8000 && (starStrippingAt === null || firstDepthTwoDetachAt === null); i++) {
      advanceSimulation(state, 1 / 60, { gwOn: false });
      const s = state.bodies.find((b) => b.id === star.id);
      if (s && starStrippingAt === null) {
        const r = s.pos.length();
        if (r <= 11.0 && r > starRt) starStrippingAt = state.simTimeElapsed; // MASS_TRANSFER_RADIUS window start
      }
      for (const id of watchIds) {
        const m = state.bodies.find((b) => b.id === id);
        if (firstDepthTwoDetachAt === null && (!m || m.parentId === null)) firstDepthTwoDetachAt = state.simTimeElapsed;
      }
    }
    check(
      "depth-2 moon detaches at/before the star's own tidal stripping begins",
      firstDepthTwoDetachAt !== null && starStrippingAt !== null && firstDepthTwoDetachAt <= starStrippingAt,
      `moon detached at simTime=${firstDepthTwoDetachAt}, star stripping began at simTime=${starStrippingAt}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 6. 24 bodies for 60 (simulated) seconds: no freeze, no NaN/Infinity.
// ---------------------------------------------------------------------------
section("6. 24 bodies for 60 simulated seconds — no freeze, no NaN");
{
  const state = createSimState(6);
  const kinds: BodyKind[] = ["planet", "star", "comet"];
  for (let i = 0; i < 12 && state.bodies.length < 24; i++) {
    const r = 10 + i * 6;
    const kind = kinds[i % kinds.length]!;
    const v = vCircAt(r) * (kind === "comet" ? 0.72 : kind === "star" ? 0.94 : 1.0);
    const th = i * 1.3;
    const pos = new THREE.Vector3(r * Math.cos(th), 0, r * Math.sin(th));
    const vel = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th)).multiplyScalar(v);
    if (kind === "planet") spawnPlanetWithMoons(state, pos, vel);
    else spawnBody(state, kind, pos, vel, kind === "star" ? 0.05 : 0.0003, kind === "star" ? 0.3 : 0.05, new THREE.Color("#fff"));
  }
  // Top up deterministically (no moons, so the count is exact) if the
  // random moon counts above left us short of 24.
  let topUpR = 10 + 12 * 6;
  while (state.bodies.length < 24) {
    const v = vCircAt(topUpR);
    const th = topUpR * 0.7;
    spawnBody(
      state, "planet",
      new THREE.Vector3(topUpR * Math.cos(th), 0, topUpR * Math.sin(th)),
      new THREE.Vector3(-Math.sin(th), 0, Math.cos(th)).multiplyScalar(v),
      0.001, 0.08, new THREE.Color("#fff"),
    );
    topUpR += 6;
  }
  const count = state.bodies.length;
  let sawNaN = false;
  const start = performance.now();
  let frames = 0;
  while (state.simTimeElapsed < 60 && performance.now() - start < 30000) {
    advanceSimulation(state, 999, { gwOn: true });
    frames++;
    for (const b of state.bodies) {
      if (!Number.isFinite(b.pos.x) || !Number.isFinite(b.pos.y) || !Number.isFinite(b.pos.z)
        || !Number.isFinite(b.vel.x) || !Number.isFinite(b.vel.y) || !Number.isFinite(b.vel.z)) { sawNaN = true; break; }
    }
    const a = state.particles;
    for (let k = 0; k < a.count && !sawNaN; k++) {
      if (a.life[k]! <= 0) continue;
      if (!Number.isFinite(a.pos[k * 3]!) || !Number.isFinite(a.pos[k * 3 + 1]!) || !Number.isFinite(a.pos[k * 3 + 2]!)) sawNaN = true;
    }
    if (sawNaN) break;
  }
  const elapsedWall = performance.now() - start;
  check("initial spawn reached 24 bodies", count >= 24, `spawned ${count} bodies (mixed planets/stars/comets, planets with 0-3 moons each, topped up with bare planets)`);
  check("reached 60 simulated seconds without stalling", state.simTimeElapsed >= 60, `simTime=${state.simTimeElapsed.toFixed(1)}s in ${elapsedWall.toFixed(0)}ms wall, ${frames} advanceSimulation() calls`);
  check("no NaN/Infinity anywhere", !sawNaN, sawNaN ? "NaN/Infinity detected" : "all finite throughout");
}

// ---------------------------------------------------------------------------
// 7. Two simultaneous TDEs: independent streams, correct directions.
// ---------------------------------------------------------------------------
section("7. Two simultaneous TDEs — independent streams, correct directions");
{
  const state = createSimState(7);
  // Two stars placed on OPPOSITE sides, orbiting in OPPOSITE senses, both
  // starting just inside their (density-derived) tidal radius (≈5.36 r_s for
  // the star density — see DENSITY_BY_KIND) so disruption fires immediately
  // for both, in the same frame.
  const starA = spawnBody(state, "star", new THREE.Vector3(5.0, 0, 0), new THREE.Vector3(0, 0, 0.4), 0.06, 0.3, new THREE.Color("#fff0c0"));
  const starB = spawnBody(state, "star", new THREE.Vector3(-5.0, 0, 0), new THREE.Vector3(0, 0, -0.35), 0.06, 0.3, new THREE.Color("#fff0c0"));
  const dirA = starA.vel.clone().normalize();
  const dirB = starB.vel.clone().normalize();

  // Run long enough for both ~0.2-0.5 sim-second disruptions to complete and
  // emit their debris, but well short of the debris's own 16-24 sim-second
  // lifetime — checking too late would find the particles already expired.
  for (let i = 0; i < 15; i++) advanceSimulation(state, 1 / 60, { gwOn: false });

  const a = state.particles;
  const groupOf = new Map<number, { sumV: THREE.Vector3; n: number }>();
  for (let k = 0; k < a.count; k++) {
    if (a.life[k]! <= 0) continue;
    const g = a.groupId[k]!;
    const rec = groupOf.get(g) ?? { sumV: new THREE.Vector3(), n: 0 };
    rec.sumV.add(new THREE.Vector3(a.vel[k * 3]!, a.vel[k * 3 + 1]!, a.vel[k * 3 + 2]!));
    rec.n++;
    groupOf.set(g, rec);
  }
  const groups = Array.from(groupOf.entries()).filter(([, r]) => r.n > 5);
  check("at least two independent debris groups exist", groups.length >= 2, `${groups.length} groups with >5 particles (of ${groupOf.size} total)`);

  if (groups.length >= 2) {
    // Match each group's bulk velocity direction to whichever star's orbital
    // direction it correlates with best.
    const bulkDirs = groups.map(([g, r]) => [g, r.sumV.clone().normalize()] as const);
    const dotsToA = bulkDirs.map(([, d]) => d.dot(dirA));
    const dotsToB = bulkDirs.map(([, d]) => d.dot(dirB));
    const bestForA = Math.max(...dotsToA);
    const bestForB = Math.max(...dotsToB);
    check("some group's bulk motion correlates with star A's orbital direction", bestForA > 0.3, `best cos(angle) to A = ${bestForA.toFixed(3)}`);
    check("some group's bulk motion correlates with star B's orbital direction", bestForB > 0.3, `best cos(angle) to B = ${bestForB.toFixed(3)}`);
    const crossDot = bulkDirs[0]![1].dot(bulkDirs[1]![1]);
    check("the two groups' bulk directions are NOT identical (not mixed up)", crossDot < 0.95, `cos(angle) between group 0 and group 1 = ${crossDot.toFixed(3)}`);
  }

  // Direct check of the actual bound/unbound split (disruptStep's `isBound`,
  // mirrored in the particle pool's `absorb` flag): bound debris is kicked
  // RADIALLY INWARD, unbound debris OUTWARD. The bulk-direction checks above
  // are dominated by each star's own inherited velocity and would not catch
  // a broken/inverted bound-vs-unbound split — this checks that split
  // directly via each particle's radial velocity component (v·r̂).
  {
    const sums = new Map<number, { boundRadial: number; boundN: number; unboundRadial: number; unboundN: number }>();
    for (let k = 0; k < a.count; k++) {
      if (a.life[k]! <= 0) continue;
      const g = a.groupId[k]!;
      const px = a.pos[k * 3]!, py = a.pos[k * 3 + 1]!, pz = a.pos[k * 3 + 2]!;
      const r = Math.hypot(px, py, pz) || 1;
      const vr = (a.vel[k * 3]! * px + a.vel[k * 3 + 1]! * py + a.vel[k * 3 + 2]! * pz) / r; // v·r̂
      const rec = sums.get(g) ?? { boundRadial: 0, boundN: 0, unboundRadial: 0, unboundN: 0 };
      if (a.absorb[k]! > 0.5) { rec.boundRadial += vr; rec.boundN++; } else { rec.unboundRadial += vr; rec.unboundN++; }
      sums.set(g, rec);
    }
    let allGroupsCorrect = groups.length >= 2;
    const details: string[] = [];
    for (const [g] of groups) {
      const rec = sums.get(g);
      if (!rec || rec.boundN < 3 || rec.unboundN < 3) { allGroupsCorrect = false; details.push(`group ${g}: insufficient bound/unbound samples`); continue; }
      const meanBound = rec.boundRadial / rec.boundN;
      const meanUnbound = rec.unboundRadial / rec.unboundN;
      const correct = meanBound < meanUnbound; // bound trends inward relative to unbound
      if (!correct) allGroupsCorrect = false;
      details.push(`group ${g}: meanRadialV bound=${meanBound.toFixed(4)} unbound=${meanUnbound.toFixed(4)} (bound<unbound: ${correct})`);
    }
    check("bound debris trends radially inward relative to unbound debris (real bound/unbound split, not just inherited velocity)", allGroupsCorrect, details.join("; "));
  }
}

// ---------------------------------------------------------------------------
section("SUMMARY");
console.log(`${pass} passed, ${fail} failed, ${pass + fail} total checks`);
if (fail > 0) process.exitCode = 1;
