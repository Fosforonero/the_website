// ---------------------------------------------------------------------------
// Playground N-body physics — pure, React-free module.
//
// Extracted from black-hole-playground-scene.tsx's `Simulation` component so
// the integrator, hierarchy bookkeeping and stream physics can be unit-tested
// headlessly (scripts/black-hole/audit-playground-dynamics.ts) without R3F or
// a browser. The React component owns only rendering: it holds a SimState,
// calls advanceSimulation() once per frame, and copies the result into THREE
// buffer attributes.
//
// Audit fixes vs. the previous inline implementation (2026-07-10):
//   - Math.random() replaced by a seeded PRNG (createSimState(seed)) → runs
//     are reproducible.
//   - Sequential per-body position updates (which made body i's force on
//     body j depend on whether i had already moved this substep) replaced by
//     kick-drift-kick (velocity-Verlet) leapfrog: all accelerations are
//     computed from one immutable position snapshot, THEN all velocities and
//     positions are updated. Mutual-gravity sums are accumulated in a fixed
//     id-sorted order regardless of the bodies array's own order, so the
//     result is independent of both update order and array order.
//   - One fixed SIM_DT drives orbits, disruption countdowns, tidal-stripping
//     emission and debris lifetime — all expressed in simulated seconds via a
//     fixed-step accumulator. Real frame dt is converted to simulated time
//     ONCE (via SIM_SECONDS_PER_REAL_SECOND) and never touched again; nothing
//     downstream mixes real dt and sim dt.
//   - The old scheme shrank dtMax for the WHOLE system based on the closest
//     body's distance to the horizon (one plunging body froze everyone).
//     SIM_DT is now a fixed global constant; bodies below DOOM_RADIUS are
//     flagged `doomed`, excluded from the mutual N-body sum (as both source
//     and target — the BH's own pull utterly dominates there), and removed
//     as soon as they cross HORIZON.
// ---------------------------------------------------------------------------

import * as THREE from "three";

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — replaces Math.random() everywhere in this
// module so a given seed always produces the same bodies, debris and outcome.
// ---------------------------------------------------------------------------
export type RNG = () => number;

export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Constants (units: r_s = 1, G = c = 1, GM_bh = 0.5 — matches the shader)
// ---------------------------------------------------------------------------
export const RS = 1.0;
export const GM = 0.5;
export const HORIZON = 1.02;
// Below this radius a body is flagged `doomed`: the BH's pull is so
// overwhelming there that mutual N-body perturbation is negligible, and the
// body will cross HORIZON within a handful of steps regardless.
export const DOOM_RADIUS = 1.6;
export const DISK_IN = 3.0;
export const DISK_OUT = 16.0;
export const MASS_TRANSFER_RADIUS = 11.0;
export const C_CAP = 0.985;
export const GW_STR = 2600.0;
export const MAX_PARTICLES = 14000;

// Fixed physics step, in SIMULATED seconds — chosen small enough to resolve
// the softened Paczyński–Wiita potential (floor d = max(r−RS, 0.05)) stably
// at DOOM_RADIUS without ever needing to shrink further. Independent of frame
// rate and of how many bodies are near the horizon.
export const SIM_DT = 0.01;
// How much simulated time one real second contributes to the accumulator —
// the ONLY place "16×" appears; downstream everything is simDt-clocked.
export const SIM_SECONDS_PER_REAL_SECOND = 16.0;
// Hard cap on catch-up steps per frame: if a frame stalls badly, we fall
// behind in simulated time rather than spiral into an ever-longer catch-up
// loop. Reported to the debug overlay as a "slowdown factor".
export const MAX_STEPS_PER_FRAME = 240;

export const HILL_EPS2 = 0.0144; // ε² = (0.12 r_s)² softening for moon/host two-body terms
// Bodies beyond this radius are removed as "ejected" (truly escaped/runaway,
// e.g. from an N-body slingshot). Must stay well beyond the outermost planet
// any preset intentionally places — spawnPlanetarySystemPreset spaces
// planets by several Hill radii and can legitimately reach a few hundred r_s
// for a 6-planet system, so this is generous on purpose, not a tuned "typical
// distance".
const EJECT_RADIUS = 500;

// ---------------------------------------------------------------------------
// Density → tidal radius. r_t = R_body·(M_bh/M_body)^(1/3); substituting
// M_body = (4/3)π R_body³ ρ gives r_t = (3·M_bh / (4π·ρ))^(1/3), independent
// of the body's own radius — the standard result that a fixed-density body's
// tidal-disruption distance depends only on its density and the BH's mass,
// not its size. Reference densities (g/cm³, real): comet nucleus ≈0.5 (e.g.
// 67P ≈0.53), Sun ≈1.41, Earth ≈5.51 — converted here to this sim's mass
// units by anchoring the planet (Earth-like) density so its tidal radius
// lands at the previous hand-tuned value (~3.4 r_s); star and comet follow
// from the SAME real-world ratio, not independently re-tuned. This is why
// the ordering differs from the old hardcoded per-kind radii (comet, being
// the least dense/fluffiest, now has the LARGEST tidal radius, not the
// star) — a direct, intended consequence of computing it from density.
export type BodyKind = "planet" | "star" | "comet";

const PLANET_DENSITY = 0.003037; // anchors r_t(planet) ≈ 3.4 r_s
const REAL_RATIO = { comet: 0.5, star: 1.41, planet: 5.51 };
const DENSITY_SCALE = PLANET_DENSITY / REAL_RATIO.planet;
export const DENSITY_BY_KIND: Record<BodyKind, number> = {
  planet: PLANET_DENSITY,
  star: REAL_RATIO.star * DENSITY_SCALE,
  comet: REAL_RATIO.comet * DENSITY_SCALE,
};

export function tidalRadiusFromDensity(density: number, bhMass: number = GM): number {
  return Math.cbrt((3 * bhMass) / (4 * Math.PI * Math.max(density, 1e-9)));
}

// Instantaneous Hill radius of a host (mass m) at distance d from the BH.
export function hillRadius(hostMass: number, hostDistFromBH: number, bhMass: number = GM): number {
  return hostDistFromBH * Math.cbrt(Math.max(hostMass, 1e-12) / (3 * bhMass));
}

// ---------------------------------------------------------------------------
// Body / particle types
// ---------------------------------------------------------------------------
export type Body = {
  id: number;
  kind: BodyKind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  mass: number; // physical mass — drives gravity + Hill radius
  density: number; // physical density — drives tidal radius (NOT visual size)
  visualRadius: number; // rendered sphere size — decoupled from mass/density
  color: THREE.Color;
  parentId: number | null; // moon → host planet/star; null = primary (orbits the BH directly)
  merged?: boolean;
  doomed?: boolean; // r < DOOM_RADIUS — excluded from mutual N-body gravity
  disrupting?: number; // remaining SIM seconds of a gradual tidal disruption
  disruptTotal?: number; // total sim-duration of this disruption (density/tidal-strength dependent)
  disruptN?: number;
  mass0?: number;
  visualRadius0?: number;
  tdeGroupId?: number; // tags this disruption event so its debris stream is independently attributable
};

export type ParticleArrays = {
  pos: Float32Array;
  col: Float32Array;
  vel: Float32Array;
  life: Float32Array; // remaining SIM seconds; <=0 = dead
  absorb: Float32Array; // 1 = candidate for disk capture on a decayed plane crossing; 0 = wraps freely
  planeCrossCount: Float32Array; // consecutive qualifying plane crossings — capture requires >=2, never the first
  groupId: Float32Array; // ties debris to its originating disruption/comet-shedding event
  count: number;
  cursor: number;
};

function makeParticles(): ParticleArrays {
  return {
    pos: new Float32Array(MAX_PARTICLES * 3),
    col: new Float32Array(MAX_PARTICLES * 3),
    vel: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
    absorb: new Float32Array(MAX_PARTICLES),
    planeCrossCount: new Float32Array(MAX_PARTICLES),
    groupId: new Float32Array(MAX_PARTICLES),
    count: 0,
    cursor: 0,
  };
}

export type SimState = {
  bodies: Body[];
  particles: ParticleArrays;
  rng: RNG;
  seed: number;
  accumulator: number; // simulated seconds not yet consumed by a SIM_DT step
  nextId: number;
  nextGroupId: number;
  // Debug/diagnostics from the most recent advanceSimulation() call.
  lastStepsThisFrame: number;
  lastRequestedSteps: number; // how many steps WOULD be needed to stay caught up
  simTimeElapsed: number; // total simulated seconds advanced so far
};

export function createSimState(seed: number): SimState {
  return {
    bodies: [],
    particles: makeParticles(),
    rng: mulberry32(seed),
    seed,
    accumulator: 0,
    nextId: 1,
    nextGroupId: 1,
    lastStepsThisFrame: 0,
    lastRequestedSteps: 0,
    simTimeElapsed: 0,
  };
}

export function resetSimState(state: SimState): void {
  state.bodies = [];
  const a = state.particles;
  a.life.fill(0);
  a.count = 0;
  a.cursor = 0;
  state.accumulator = 0;
  state.simTimeElapsed = 0;
  // Reseed from the ORIGINAL seed (not a fresh random one) so repeated resets
  // of the same session replay identically — determinism extends to "reset
  // and try again", not just to the first run.
  state.rng = mulberry32(state.seed);
}

// ---------------------------------------------------------------------------
// Gravity — Paczyński–Wiita pseudo-Newtonian potential toward the BH at the
// origin, plus mutual N-body gravity among massive bodies. Softened to avoid
// singular close encounters (same ε as before: 0.05 floor on d = r − RS for
// the BH term, ε² = 0.0144 for mutual/Hill two-body terms).
// ---------------------------------------------------------------------------
function pwAccelInto(pos: THREE.Vector3, out: THREE.Vector3): void {
  const r = pos.length();
  const d = Math.max(r - RS, 0.05);
  const a = -GM / (d * d) / Math.max(r, 1e-4);
  out.x += pos.x * a;
  out.y += pos.y * a;
  out.z += pos.z * a;
}

// Computes acceleration for every body from ONE immutable position snapshot
// (the `bodies` array's current .pos values are read but never mutated here)
// and accumulates mutual-gravity contributions in a fixed id-sorted order —
// so the result does not depend on the bodies array's own order, nor on
// which body is processed first.
function computeAccelerations(bodies: Body[], out: THREE.Vector3[]): void {
  const order = bodies.map((_, i) => i).sort((a, b) => bodies[a]!.id - bodies[b]!.id);
  const diff = new THREE.Vector3();
  for (let oi = 0; oi < order.length; oi++) {
    const i = order[oi]!;
    const bi = bodies[i]!;
    out[i]!.set(0, 0, 0);
    pwAccelInto(bi.pos, out[i]!);
    if (bi.doomed) continue; // BH-only near the horizon — mutual perturbation there is negligible and irrelevant
    for (let oj = 0; oj < order.length; oj++) {
      if (oj === oi) continue;
      const j = order[oj]!;
      const bj = bodies[j]!;
      if (bj.mass <= 0 || bj.doomed) continue; // doomed bodies excluded as a SOURCE too
      diff.copy(bj.pos).sub(bi.pos);
      const d2 = diff.lengthSq() + HILL_EPS2;
      const f = bj.mass / (d2 * Math.sqrt(d2));
      out[i]!.addScaledVector(diff, f);
    }
  }
}

let accBufA: THREE.Vector3[] = [];
let accBufB: THREE.Vector3[] = [];
function ensureAccBufs(n: number): void {
  while (accBufA.length < n) accBufA.push(new THREE.Vector3());
  while (accBufB.length < n) accBufB.push(new THREE.Vector3());
}

// One velocity-Verlet (kick-drift-kick) leapfrog step of exactly `dt`
// simulated seconds. Order-independent by construction (see
// computeAccelerations); the ONLY per-body serial work below is applying
// each body's OWN already-computed acceleration, which commutes trivially.
function kdkStep(state: SimState, dt: number, gwOn: boolean): void {
  const bodies = state.bodies;
  const n = bodies.length;
  if (n === 0) return;
  ensureAccBufs(n);

  computeAccelerations(bodies, accBufA);
  for (let i = 0; i < n; i++) bodies[i]!.vel.addScaledVector(accBufA[i]!, dt * 0.5);
  for (let i = 0; i < n; i++) bodies[i]!.pos.addScaledVector(bodies[i]!.vel, dt);

  computeAccelerations(bodies, accBufB);
  for (let i = 0; i < n; i++) bodies[i]!.vel.addScaledVector(accBufB[i]!, dt * 0.5);

  if (gwOn) {
    for (const b of bodies) {
      if (b.mass <= 0) continue;
      const rb = b.pos.length();
      const vb2 = b.vel.lengthSq();
      if (rb <= HORIZON || vb2 <= 1e-8) continue;
      const P = GW_STR * 6.4 * GM * GM * b.mass * b.mass * (GM + b.mass) / Math.pow(rb, 5.0);
      const factor = Math.max(-(P * dt) / (b.mass * vb2), -0.4);
      b.vel.addScaledVector(b.vel, factor);
    }
  }

  for (const b of bodies) {
    const sp = b.vel.length();
    if (sp > C_CAP) b.vel.multiplyScalar(C_CAP / sp);
  }
}

// ---------------------------------------------------------------------------
// Conserved-quantity diagnostics (also used by the energy-drift test)
// ---------------------------------------------------------------------------
export function computeEnergy(bodies: Body[]): number {
  let E = 0;
  for (const b of bodies) {
    if (b.mass <= 0) continue;
    E += 0.5 * b.mass * b.vel.lengthSq();
    const r = b.pos.length();
    E += -GM * b.mass / Math.max(r - RS, 0.05);
  }
  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i]!;
    if (bi.mass <= 0) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const bj = bodies[j]!;
      if (bj.mass <= 0) continue;
      const d = bi.pos.distanceTo(bj.pos);
      E += -(bi.mass * bj.mass) / Math.sqrt(d * d + HILL_EPS2);
    }
  }
  return E;
}

export function computeAngularMomentum(bodies: Body[]): THREE.Vector3 {
  const L = new THREE.Vector3();
  const cross = new THREE.Vector3();
  for (const b of bodies) {
    if (b.mass <= 0) continue;
    cross.crossVectors(b.pos, b.vel).multiplyScalar(b.mass);
    L.add(cross);
  }
  return L;
}

export function computeMomentum(bodies: Body[]): THREE.Vector3 {
  const p = new THREE.Vector3();
  for (const b of bodies) if (b.mass > 0) p.addScaledVector(b.vel, b.mass);
  return p;
}

export function computeBarycenter(bodies: Body[]): THREE.Vector3 {
  const r = new THREE.Vector3();
  let m = 0;
  for (const b of bodies) {
    if (b.mass <= 0) continue;
    r.addScaledVector(b.pos, b.mass);
    m += b.mass;
  }
  return m > 0 ? r.multiplyScalar(1 / m) : r;
}

// ---------------------------------------------------------------------------
// Hierarchy — Hill-sphere planet/star ↔ moon bookkeeping.
// ---------------------------------------------------------------------------

// Detach any moon that has left its parent's INSTANTANEOUS Hill sphere or
// whose two-body (moon+parent only) orbital energy has gone positive
// (unbound from the parent even if still inside the Hill radius momentarily).
// Then try to (re)capture unbound moons into whichever nearby primary's Hill
// sphere they now sit inside, with negative relative energy — which may be a
// DIFFERENT planet than the one they just left.
// A host's Hill sphere is set by whatever ACTUALLY perturbs it — its own
// parent (e.g. a planet is perturbed by the star it orbits), not always the
// BH. Without this, a moon-of-planet-of-star used the planet's raw distance
// from the origin and the BH's mass as the perturber, silently skipping the
// star (the true, much closer tidal influence on that planet) — so a moon
// could read as falsely bound while its own planet was already being
// stripped by the star. Falls back to BH-relative (bhMass=GM default) when
// the host has no parent, or its parent no longer exists.
function hillRadiusOfHost(host: Body, byId: Map<number, Body>): number {
  if (host.parentId !== null) {
    const grandparent = byId.get(host.parentId);
    if (grandparent) return hillRadius(host.mass, host.pos.distanceTo(grandparent.pos), grandparent.mass);
  }
  return hillRadius(host.mass, host.pos.length());
}

function updateHierarchy(state: SimState): void {
  const bodies = state.bodies;
  const byId = new Map(bodies.map((b) => [b.id, b]));
  const relPos = new THREE.Vector3();
  const relVel = new THREE.Vector3();

  for (const moon of bodies) {
    if (moon.parentId === null) continue;
    const parent = byId.get(moon.parentId);
    if (!parent) { moon.parentId = null; continue; } // parent no longer exists (merged/consumed) — orphaned
    relPos.copy(moon.pos).sub(parent.pos);
    relVel.copy(moon.vel).sub(parent.vel);
    const dist = relPos.length();
    const hill = hillRadiusOfHost(parent, byId);
    const relE = 0.5 * relVel.lengthSq() - parent.mass / Math.sqrt(dist * dist + HILL_EPS2);
    if (dist > hill || relE > 0) moon.parentId = null;
  }

  // Recapture: any body without a parent (not a moon) may be pulled into
  // ANOTHER primary's Hill sphere — including a moon that just detached, or a
  // primary star/comet that wanders close enough to a planet. Only massive
  // hosts (mass > 0) can capture; only bodies smaller than their candidate
  // host make sense as a "moon" of it. Ties (equal distance) break by the
  // LOWER id, not array position, so recapture stays independent of the
  // bodies array's own order.
  for (const body of bodies) {
    if (body.parentId !== null) continue;
    let bestHost: Body | null = null;
    let bestDist = Infinity;
    for (const host of bodies) {
      if (host === body || host.mass <= body.mass || host.parentId !== null) continue;
      relPos.copy(body.pos).sub(host.pos);
      const dist = relPos.length();
      const hill = hillRadiusOfHost(host, byId);
      if (dist >= hill) continue;
      relVel.copy(body.vel).sub(host.vel);
      const relE = 0.5 * relVel.lengthSq() - host.mass / Math.sqrt(dist * dist + HILL_EPS2);
      if (relE >= 0) continue;
      if (dist < bestDist || (dist === bestDist && host.id < bestHost!.id)) { bestDist = dist; bestHost = host; }
    }
    if (bestHost) body.parentId = bestHost.id;
  }
}

// Body–body collisions: any overlapping pair merges (bigger survives, keeps
// ITS OWN parentId — a moon absorbed into an unrelated planet simply
// disappears into it; two moons of the same planet merging stay a moon of
// that planet). Conserves mass and momentum.
function resolveCollisions(state: SimState): void {
  const bodies = state.bodies;
  let anyMerged = false;
  for (let i = 0; i < bodies.length; i++) {
    const A = bodies[i]!;
    if (A.merged) continue;
    for (let j = i + 1; j < bodies.length; j++) {
      const B = bodies[j]!;
      if (B.merged) continue;
      const overlap = (A.visualRadius + B.visualRadius) * 0.85;
      if (A.pos.distanceTo(B.pos) >= overlap) continue;
      // Tie-break by id, not array position, so which survivor keeps its
      // kind/color/parentId doesn't depend on the bodies array's own order.
      const big = A.mass !== B.mass ? (A.mass > B.mass ? A : B) : (A.id < B.id ? A : B);
      const small = big === A ? B : A;
      const mA = big.mass, mB = small.mass, m = mA + mB;
      big.vel.multiplyScalar(mA).addScaledVector(small.vel, mB).multiplyScalar(1 / Math.max(m, 1e-9));
      big.pos.multiplyScalar(mA).addScaledVector(small.pos, mB).multiplyScalar(1 / Math.max(m, 1e-9));
      const newVisual = Math.cbrt(big.visualRadius ** 3 + small.visualRadius ** 3);
      big.visualRadius = newVisual;
      big.mass = m;
      // Reparent: any moon of the absorbed body follows it into the survivor.
      for (const other of bodies) if (other.parentId === small.id) other.parentId = big.id;
      burstParticles(state, big);
      small.merged = true;
      anyMerged = true;
      if (A.merged) break;
    }
  }
  if (anyMerged) state.bodies = bodies.filter((b) => !b.merged);
}

// ---------------------------------------------------------------------------
// Tidal disruption & streams
// ---------------------------------------------------------------------------
function emit(
  state: SimState,
  p: THREE.Vector3, v: THREE.Vector3, c: THREE.Color, life: number,
  absorb: boolean, groupId: number,
): void {
  const a = state.particles;
  const i = a.cursor;
  a.cursor = (a.cursor + 1) % MAX_PARTICLES;
  if (a.count < MAX_PARTICLES) a.count++;
  a.pos[i * 3] = p.x; a.pos[i * 3 + 1] = p.y; a.pos[i * 3 + 2] = p.z;
  a.vel[i * 3] = v.x; a.vel[i * 3 + 1] = v.y; a.vel[i * 3 + 2] = v.z;
  a.col[i * 3] = c.r; a.col[i * 3 + 1] = c.g; a.col[i * 3 + 2] = c.b;
  a.absorb[i] = absorb ? 1 : 0;
  a.planeCrossCount[i] = 0;
  a.groupId[i] = groupId;
  a.life[i] = life;
}

// Local tidal acceleration difference across the body at radius r — the
// standard tidal-strength proxy 2·GM_bh·R/r³. Used only to scale HOW FAST a
// disruption completes (denser/deeper encounters finish faster), not whether
// it starts (that's still governed by tidalRadiusFromDensity via the caller).
function tidalStrength(bodyPhysicalRadius: number, r: number): number {
  return (2 * GM * bodyPhysicalRadius) / Math.max(r * r * r, 1e-6);
}

export function physicalRadiusOf(b: Body): number {
  return Math.cbrt((3 * b.mass) / (4 * Math.PI * Math.max(b.density, 1e-9)));
}

const BASE_DISRUPT_TIME = 0.5; // sim seconds, reference duration
const REF_TIDAL_STRENGTH = 0.01; // calibration point (roughly a planet at its own r_t)

function startDisruption(b: Body): void {
  const r = b.pos.length();
  const strength = tidalStrength(physicalRadiusOf(b), Math.max(r, 0.1));
  const scale = Math.min(3.0, Math.max(0.3, REF_TIDAL_STRENGTH / Math.max(strength, 1e-9)));
  b.disrupting = BASE_DISRUPT_TIME * scale;
  b.disruptTotal = b.disrupting;
  b.disruptN = Math.round(220 + 900 * physicalRadiusOf(b));
  b.mass0 = b.mass;
  b.visualRadius0 = b.visualRadius;
}

// Phased spaghettification: an initial RADIAL stretch + transverse
// compression (the debris first spreads mostly along the radial direction,
// narrow across it), transitioning smoothly into the classic leading/trailing
// orbital-direction stream as the disruption progresses (phase 0→1). Emission
// RATE (not just total count) is tied to the instantaneous mass-loss rate
// dm/dt and to the local tidal strength, so a violent/deep disruption sheds
// visibly faster than a grazing one.
function disruptStep(state: SimState, b: Body, dt: number): void {
  const total = b.disruptTotal ?? BASE_DISRUPT_TIME;
  const before = Math.max(b.disrupting ?? total, 0);
  const after = Math.max(before - dt, 0);
  const phase = 1 - after / total; // 0 (just started) → 1 (fully spaghettified)
  const dmdt = ((b.mass0 ?? b.mass) / total); // constant mass-loss rate over the disruption window
  const nThisStep = Math.max(1, Math.round(((b.disruptN ?? 300) / total) * dt));

  const speed = Math.max(b.vel.length(), 1e-3);
  const vdir = b.vel.clone().multiplyScalar(1 / speed);
  const radial = b.pos.clone().normalize();
  const r = b.pos.length();
  const strength = tidalStrength(physicalRadiusOf(b), Math.max(r, 0.1));

  const bound =
    b.kind === "comet" ? new THREE.Color("#8fc4dc")
    : b.kind === "planet" ? new THREE.Color("#9c7a5c")
    : new THREE.Color("#ff6a30");
  const tail =
    b.kind === "comet" ? new THREE.Color("#d6eef8")
    : b.kind === "planet" ? new THREE.Color("#cdb79c")
    : new THREE.Color("#ffd9a0");

  const groupId = b.tdeGroupId ?? (b.tdeGroupId = state.nextGroupId++);

  for (let k = 0; k < nThisStep; k++) {
    const u = (state.rng() * 2 - 1);
    const isBound = u < 0.0;
    // Early phase (phase≈0): mostly radial elongation, tightly compressed
    // transverse to it. Late phase (phase≈1): the classic along-orbit
    // leading/trailing arms. Blend smoothly by `phase`.
    const alongOrbit = vdir.clone().multiplyScalar(u * 0.5 * phase);
    const alongRadial = radial.clone().multiplyScalar(u * 0.5 * (1 - phase) + (state.rng() - 0.5) * 0.05 * (0.3 + phase));
    const p = b.pos.clone().add(alongOrbit).add(alongRadial);
    const v = b.vel.clone()
      .addScaledVector(vdir, u * (0.08 + 0.16 * phase) * speed * (0.5 + 0.5 * strength / REF_TIDAL_STRENGTH))
      .addScaledVector(radial, u * (0.28 - 0.20 * phase) * speed)
      .add(new THREE.Vector3(
        (state.rng() - 0.5) * 0.02,
        (state.rng() - 0.5) * 0.05,
        (state.rng() - 0.5) * 0.02));
    const c = isBound ? bound : bound.clone().lerp(tail, Math.abs(u));
    emit(state, p, v, c, isBound ? 16 : 24, isBound, groupId);
  }

  b.disrupting = after;
  b.mass = Math.max((b.mass0 ?? b.mass) - dmdt * dt, 0);
  const f = Math.max(after / total, 0);
  b.visualRadius = (b.visualRadius0 ?? b.visualRadius) * Math.cbrt(Math.max(f, 0));

  if (after <= 0 || r < HORIZON) {
    b.merged = true; // fully spaghettified / swallowed — removed by the caller
  }
}

// Continuous tidal stripping BEFORE full disruption (a widening sheet of gas
// off the BH-facing surface, feeding the disk) — unchanged physical picture
// from before, just re-timed onto simDt.
function tidalStrippingStep(state: SimState, b: Body, dt: number): void {
  const r = b.pos.length();
  const rt = tidalRadiusFromDensity(b.density);
  const frac = 1.0 - (r - rt) / (MASS_TRANSFER_RADIUS - rt);
  const nShed = Math.max(1, Math.round((4 + frac * 30) * (physicalRadiusOf(b) / 0.4) * dt * 20));
  const radial = b.pos.clone().multiplyScalar(1 / Math.max(r, 1e-4));
  const up = Math.abs(radial.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const tA = new THREE.Vector3().crossVectors(radial, up).normalize();
  const tB = new THREE.Vector3().crossVectors(radial, tA).normalize();
  const capR = physicalRadiusOf(b) * (0.5 + 0.5 * frac);
  const vTan = b.vel.clone().addScaledVector(radial, -b.vel.dot(radial));
  const vTanLen = vTan.length();
  const vTanHat = vTanLen > 1e-6 ? vTan.multiplyScalar(1 / vTanLen) : tA;
  const groupId = b.tdeGroupId ?? (b.tdeGroupId = state.nextGroupId++);
  for (let s = 0; s < nShed; s++) {
    const ang = state.rng() * Math.PI * 2;
    const rad = Math.sqrt(state.rng()) * capR;
    const depth = Math.sqrt(Math.max(physicalRadiusOf(b) ** 2 - rad * rad, 0));
    const p = b.pos.clone()
      .addScaledVector(radial, -depth)
      .addScaledVector(tA, Math.cos(ang) * rad)
      .addScaledVector(tB, Math.sin(ang) * rad);
    const vv = b.vel.clone()
      .addScaledVector(vTanHat, -(0.08 + 0.12 * frac) * vTanLen)
      .addScaledVector(radial, -0.012 * (0.4 + frac))
      .addScaledVector(tA, (state.rng() - 0.5) * 0.012)
      .addScaledVector(tB, (state.rng() - 0.5) * 0.012);
    emit(state, p, vv, new THREE.Color("#ffc89c"), 8.0, true, groupId);
  }
}

// Comet tail: the shed material carries the comet's OWN orbital velocity
// PLUS an outward kick away from the heating source (the BH at the origin),
// not just a bare radial puff disconnected from the comet's motion.
function cometTailStep(state: SimState, b: Body, dt: number): void {
  const away = b.pos.clone().normalize();
  const v = b.vel.clone().addScaledVector(away, 0.05);
  const groupId = b.tdeGroupId ?? (b.tdeGroupId = state.nextGroupId++);
  if ((globalThis as any).__DEBUG_COMET__) {
    console.log("[DEBUG cometTailStep] b.pos=", b.pos.toArray(), "b.vel=", b.vel.toArray(), "away=", away.toArray(), "v(emitted)=", v.toArray());
  }
  emit(state, b.pos.clone(), v, new THREE.Color("#bfe0ff"), 2.2, false, groupId);
  void dt;
}

function tidalRadiusFor(b: Body): number {
  return tidalRadiusFromDensity(b.density);
}

// Bright flash of sparks at a merge/capture event — purely a visual read of
// the SAME particle pool other streams use, not simulation state.
function burstParticles(state: SimState, b: Body): void {
  const c = new THREE.Color("#ffffff");
  const groupId = state.nextGroupId++;
  for (let k = 0; k < 26; k++) {
    const dir = new THREE.Vector3(state.rng() - 0.5, state.rng() - 0.5, state.rng() - 0.5).normalize();
    emit(state, b.pos.clone(), b.vel.clone().addScaledVector(dir, 0.05), c, 1.0, false, groupId);
  }
}

// ---------------------------------------------------------------------------
// Particle (debris/tail) integration — same fixed SIM_DT as bodies, simple
// symplectic (semi-implicit) Euler under the BH's potential only (no mutual
// self-gravity among debris, unchanged from before). Disk-plane absorption
// now requires at least TWO qualifying crossings, never the first.
// ---------------------------------------------------------------------------
function stepParticles(state: SimState, dt: number): void {
  const a = state.particles;
  const acc = new THREE.Vector3();
  const posv = new THREE.Vector3();
  for (let k = 0; k < a.count; k++) {
    if (a.life[k]! <= 0) continue;
    posv.set(a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
    acc.set(0, 0, 0);
    pwAccelInto(posv, acc);
    a.vel[k * 3] = a.vel[k * 3]! + acc.x * dt;
    a.vel[k * 3 + 1] = a.vel[k * 3 + 1]! + acc.y * dt;
    a.vel[k * 3 + 2] = a.vel[k * 3 + 2]! + acc.z * dt;
    const psp = Math.hypot(a.vel[k * 3]!, a.vel[k * 3 + 1]!, a.vel[k * 3 + 2]!);
    if (psp > C_CAP) {
      const s2 = C_CAP / psp;
      a.vel[k * 3] = a.vel[k * 3]! * s2;
      a.vel[k * 3 + 1] = a.vel[k * 3 + 1]! * s2;
      a.vel[k * 3 + 2] = a.vel[k * 3 + 2]! * s2;
    }
    const yBefore = a.pos[k * 3 + 1]!;
    a.pos[k * 3] = posv.x + a.vel[k * 3]! * dt;
    a.pos[k * 3 + 1] = posv.y + a.vel[k * 3 + 1]! * dt;
    a.pos[k * 3 + 2] = posv.z + a.vel[k * 3 + 2]! * dt;

    if (a.absorb[k]! > 0.5 && yBefore * a.pos[k * 3 + 1]! < 0.0) {
      const rr = Math.hypot(a.pos[k * 3]!, a.pos[k * 3 + 2]!);
      if (rr > DISK_IN && rr < DISK_OUT) {
        a.planeCrossCount[k] = (a.planeCrossCount[k] ?? 0) + 1;
        if (a.planeCrossCount[k]! >= 2) a.life[k] = 0; // never captured on the FIRST crossing
      }
    }
    a.life[k] = a.life[k]! - dt;
    const rp = Math.hypot(a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
    if (rp < HORIZON) a.life[k] = 0;
  }
}

// ---------------------------------------------------------------------------
// Fixed-step driver
// ---------------------------------------------------------------------------
export type AdvanceOpts = {
  gwOn: boolean;
};

export function advanceSimulation(state: SimState, rawDt: number, opts: AdvanceOpts): void {
  state.accumulator += Math.min(rawDt, 0.1) * SIM_SECONDS_PER_REAL_SECOND;
  const requested = Math.ceil(state.accumulator / SIM_DT);
  state.lastRequestedSteps = requested;

  let steps = 0;
  while (state.accumulator >= SIM_DT && steps < MAX_STEPS_PER_FRAME) {
    stepOnce(state, SIM_DT, opts);
    state.accumulator -= SIM_DT;
    state.simTimeElapsed += SIM_DT;
    steps++;
  }
  state.lastStepsThisFrame = steps;
}

function stepOnce(state: SimState, dt: number, opts: AdvanceOpts): void {
  for (const b of state.bodies) b.doomed = b.pos.length() < DOOM_RADIUS;

  kdkStep(state, dt, opts.gwOn);

  const survivors: Body[] = [];
  for (const b of state.bodies) {
    const r = b.pos.length();
    if (b.parentId !== null) { survivors.push(b); continue; } // moons don't independently disrupt/strip

    if (b.kind === "comet" && r < 18) cometTailStep(state, b, dt);

    const rt = tidalRadiusFor(b);
    if (b.disrupting === undefined && r > rt && r < MASS_TRANSFER_RADIUS) {
      tidalStrippingStep(state, b, dt);
    }
    if (b.disrupting !== undefined || r < rt) {
      if (b.disrupting === undefined) startDisruption(b);
      disruptStep(state, b, dt);
      if (b.merged || r < HORIZON) { if (b.merged) burstParticles(state, b); continue; }
      survivors.push(b);
      continue;
    }
    if (r < HORIZON) { burstParticles(state, b); continue; }
    if (r > EJECT_RADIUS) continue; // ejected
    survivors.push(b);
  }
  state.bodies = survivors;

  resolveCollisions(state);
  updateHierarchy(state);
  stepParticles(state, dt);
}

// ---------------------------------------------------------------------------
// Spawners
// ---------------------------------------------------------------------------
const PLANET_COLORS = [
  "#6fa8d8", "#d8a76f", "#9fd86f", "#c98fd0",
  "#d0b070", "#7fd0c0", "#d07f7f", "#8f9fd0",
];

export function spawnBody(
  state: SimState, kind: BodyKind, pos: THREE.Vector3, vel: THREE.Vector3,
  mass: number, visualRadius: number, color: THREE.Color, parentId: number | null = null,
): Body {
  const b: Body = {
    id: state.nextId++, kind, pos, vel, mass,
    density: DENSITY_BY_KIND[kind], visualRadius, color, parentId,
  };
  state.bodies.push(b);
  return b;
}

export function spawnPlanetWithMoons(state: SimState, pos: THREE.Vector3, vel: THREE.Vector3): Body {
  const rng = state.rng;
  const pal = PLANET_COLORS[Math.floor(rng() * PLANET_COLORS.length)]!;
  const pr = 0.11 + rng() * 0.07;
  const pmass = 0.005 * (pr / 0.14);
  const planet = spawnBody(state, "planet", pos, vel, pmass, pr, new THREE.Color(pal));
  const nMoons = Math.floor(rng() * 4);
  for (let m = 0; m < nMoons; m++) {
    const rl = pr + 0.22 + m * (0.18 + rng() * 0.12);
    const phi = rng() * Math.PI * 2;
    const inc = (rng() - 0.5) * 0.4;
    const off = new THREE.Vector3(Math.cos(phi) * rl, Math.sin(inc) * rl * 0.4, Math.sin(phi) * rl);
    const vLocal = Math.sqrt((pmass * rl * rl) / Math.pow(rl * rl + HILL_EPS2, 1.5));
    const vMoon = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(vLocal);
    const mr = 0.025 + rng() * 0.03;
    const shade = 0.6 + rng() * 0.4;
    spawnBody(
      state, "planet", pos.clone().add(off), vel.clone().add(vMoon),
      0.00008, mr, new THREE.Color(0.72 * shade, 0.77 * shade, 0.83 * shade), planet.id,
    );
  }
  return planet;
}

// "Sistema planetario": planets directly around the BH, spaced by their
// MUTUAL Hill radii (each next orbit starts beyond the previous planet's own
// Hill sphere, so they can't immediately perturb each other into chaos), all
// within a bounded radius so auto-framing can fit the whole system on screen.
// maxR is a safety backstop, not the primary limiter: auto-framing (in the
// React layer) adapts the camera to whatever extent actually gets spawned,
// so the planet COUNT (n, below) is what normally bounds the system size —
// Hill-radius spacing alone would rarely reach maxR before n runs out.
export function spawnPlanetarySystemPreset(state: SimState, maxR = 300): Body[] {
  const rng = state.rng;
  const n = 4 + Math.floor(rng() * 3);
  const spawned: Body[] = [];
  let r = DISK_OUT + 3 + rng() * 2;
  for (let i = 0; i < n && r < maxR; i++) {
    const th = rng() * Math.PI * 2;
    const incl = (rng() - 0.5) * 0.35;
    const vCirc = Math.sqrt(GM * r) / Math.max(r - RS, 0.1);
    const ct = Math.cos(th), st = Math.sin(th);
    const si = Math.sin(incl), ci = Math.cos(incl);
    const pos = new THREE.Vector3(ct * r, st * si * r, st * ci * r);
    const vel = new THREE.Vector3(-st, ct * si, ct * ci).multiplyScalar(vCirc);
    const planet = spawnPlanetWithMoons(state, pos, vel);
    spawned.push(planet);
    const hill = hillRadius(planet.mass, r);
    r += Math.max(hill * 4, 3) + rng() * 2; // clear separation: several Hill radii apart
  }
  return spawned;
}

// "Sistema stellare in caduta": one star with bound planets/moons on an
// INFALLING (eccentric, low angular momentum) trajectory whose barycenter
// passes close to the BH — tides should strip the loosely-bound moons first,
// then the outer planets, and only lastly threaten the star itself.
export function spawnInfallingStellarSystemPreset(state: SimState, periapsis = 9): Body[] {
  const rng = state.rng;
  const r0 = 40;
  const vCirc = Math.sqrt(GM * r0) / Math.max(r0 - RS, 0.1);
  // Launch well below circular speed so the orbit is a deeply eccentric
  // plunge with periapsis near `periapsis` rather than a stable ellipse.
  const factor = Math.sqrt(Math.max(2 * periapsis / (r0 + periapsis), 0.05));
  const starPos = new THREE.Vector3(r0, 0, 0);
  const starVel = new THREE.Vector3(0, 0, 1).multiplyScalar(vCirc * factor);
  const star = spawnBody(
    state, "star", starPos, starVel, 0.06, 0.42, new THREE.Color("#fff0c0"),
  );
  const spawned: Body[] = [star];
  // Two planets, each with a chance of moons, orbiting the star well inside
  // its OWN Hill sphere (so they stay bound until the star gets close enough
  // to the BH for that Hill sphere to shrink below their orbital radius).
  const starHillAtR0 = hillRadius(star.mass, r0);
  const radii = [starHillAtR0 * 0.15, starHillAtR0 * 0.35];
  for (const rl of radii) {
    const phi = rng() * Math.PI * 2;
    const vLocal = Math.sqrt((star.mass * rl * rl) / Math.pow(rl * rl + HILL_EPS2, 1.5));
    const off = new THREE.Vector3(Math.cos(phi) * rl, 0, Math.sin(phi) * rl);
    const vOff = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(vLocal);
    const pr = 0.09 + rng() * 0.05;
    const planet = spawnBody(
      state, "planet", starPos.clone().add(off), starVel.clone().add(vOff),
      0.003 * (pr / 0.14), pr, new THREE.Color(PLANET_COLORS[Math.floor(rng() * PLANET_COLORS.length)]!), star.id,
    );
    spawned.push(planet);
    if (rng() > 0.4) {
      const mrl = pr + 0.15 + rng() * 0.1;
      const mphi = rng() * Math.PI * 2;
      const mvLocal = Math.sqrt((planet.mass * mrl * mrl) / Math.pow(mrl * mrl + HILL_EPS2, 1.5));
      const moon = spawnBody(
        state, "planet",
        planet.pos.clone().add(new THREE.Vector3(Math.cos(mphi) * mrl, 0, Math.sin(mphi) * mrl)),
        planet.vel.clone().add(new THREE.Vector3(-Math.sin(mphi), 0, Math.cos(mphi)).multiplyScalar(mvLocal)),
        0.00005, 0.02 + rng() * 0.02, new THREE.Color(0.75, 0.78, 0.85), planet.id,
      );
      spawned.push(moon);
    }
  }
  return spawned;
}

// Spawn a body at a user-chosen point (raycast hit on the disk plane), with a
// tangential prograde velocity that is a FRACTION of the local circular speed
// — the fraction sets the eccentricity (planet ≈ circular; star/comet
// eccentric, so they swing inward and eventually meet their tidal radius).
export function spawnBodyAtClick(state: SimState, kind: BodyKind, point: THREE.Vector3): Body | null {
  const r0 = Math.hypot(point.x, point.z);
  if (r0 < 2.5) return null; // too close to the horizon to place
  const pos = new THREE.Vector3(point.x, point.y, point.z);
  const vCirc = Math.sqrt(GM * r0) / Math.max(r0 - RS, 0.1);
  const factor = kind === "comet" ? 0.72 : kind === "star" ? 0.94 : 1.0;
  const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
  const vel = new THREE.Vector3(-radial.z, 0, radial.x).multiplyScalar(vCirc * factor);

  if (kind === "planet") return spawnPlanetWithMoons(state, pos, vel);

  const cfg = kind === "star"
    ? { visualRadius: 0.42, color: new THREE.Color("#fff0c0"), mass: 0.06 }
    : { visualRadius: 0.05, color: new THREE.Color("#cfe8ff"), mass: 0.0003 };
  return spawnBody(state, kind, pos, vel, cfg.mass, cfg.visualRadius, cfg.color);
}

// ---------------------------------------------------------------------------
// Diagnostics (?bhDebug=1 overlay + used directly by tests)
// ---------------------------------------------------------------------------
export type BodyDiagnostic = {
  id: number; kind: BodyKind; parentId: number | null;
  distToParent: number | null; hillRadius: number | null;
  accFromBH: number; accFromOthers: number;
};

export type Diagnostics = {
  bodyCount: number;
  particleCount: number;
  simDt: number;
  stepsThisFrame: number;
  requestedSteps: number;
  slowdownFactor: number; // 1 = fully caught up; >1 = falling behind by that factor
  energy: number;
  angularMomentum: THREE.Vector3;
  momentum: THREE.Vector3;
  barycenter: THREE.Vector3;
  bodies: BodyDiagnostic[];
};

export function getDiagnostics(state: SimState): Diagnostics {
  const bodies = state.bodies;
  const bhAcc = new THREE.Vector3();
  const otherAcc = new THREE.Vector3();
  const diff = new THREE.Vector3();
  const byId = new Map(bodies.map((b) => [b.id, b]));
  const perBody: BodyDiagnostic[] = bodies.map((b) => {
    bhAcc.set(0, 0, 0);
    pwAccelInto(b.pos, bhAcc);
    otherAcc.set(0, 0, 0);
    // Mirror computeAccelerations' doomed-body exclusion exactly (playground-physics.ts's
    // real integrator): a doomed body receives no mutual-gravity contribution as a target,
    // and contributes none as a source — otherwise this diagnostic would show a non-zero
    // "aOther" that the leapfrog step never actually applied, precisely during near-horizon
    // TDE dynamics where a developer would most want to trust it.
    if (!b.doomed) {
      for (const o of bodies) {
        if (o === b || o.mass <= 0 || o.doomed) continue;
        diff.copy(o.pos).sub(b.pos);
        const d2 = diff.lengthSq() + HILL_EPS2;
        otherAcc.addScaledVector(diff, o.mass / (d2 * Math.sqrt(d2)));
      }
    }
    let distToParent: number | null = null;
    let hill: number | null = null;
    if (b.parentId !== null) {
      const parent = byId.get(b.parentId);
      if (parent) {
        distToParent = b.pos.distanceTo(parent.pos);
        hill = hillRadiusOfHost(parent, byId);
      }
    }
    return {
      id: b.id, kind: b.kind, parentId: b.parentId,
      distToParent, hillRadius: hill,
      accFromBH: bhAcc.length(), accFromOthers: otherAcc.length(),
    };
  });
  return {
    bodyCount: bodies.length,
    particleCount: state.particles.count,
    simDt: SIM_DT,
    stepsThisFrame: state.lastStepsThisFrame,
    requestedSteps: state.lastRequestedSteps,
    slowdownFactor: state.lastRequestedSteps > 0 ? state.lastRequestedSteps / Math.max(state.lastStepsThisFrame, 1) : 1,
    energy: computeEnergy(bodies),
    angularMomentum: computeAngularMomentum(bodies),
    momentum: computeMomentum(bodies),
    barycenter: computeBarycenter(bodies),
    bodies: perBody,
  };
}
