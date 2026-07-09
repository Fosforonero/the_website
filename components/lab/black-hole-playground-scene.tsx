"use client";

import { useRef, useMemo, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlackHoleQuad } from "./black-hole-scene";
import { BlackHoleGrid } from "./black-hole-grid";
import { DitherEffect } from "./black-hole/dither-effect";
import { QUALITY_PRESETS, type BlackHoleQuality } from "./black-hole/black-hole-shader";
import { AccretionDiskParticles } from "./black-hole/accretion-disk-particles";
import type { WebGPUBgHandle } from "./black-hole-webgpu-background";

// ---------------------------------------------------------------------------
// Black-hole PLAYGROUND
//
// Drop in planets, stars and comets and watch the black hole capture and
// (for stars) tidally disrupt them. Dynamics use the Paczyński–Wiita
// pseudo-Newtonian potential Φ = −GM/(r − r_s), which reproduces the ISCO
// (3 r_s) and the relativistic plunge — the standard cheap stand-in for a
// Schwarzschild black hole in N-body / accretion toy models.
//
// Units: r_s = 1, GM = 0.5 (G = c = 1), matching the lensing shader so the
// composited 3D bodies share the renderer's coordinate space.
//
// Honest note: the added bodies are NOT gravitationally lensed by the hole
// (they are composited 3D objects); the tidal stream is a particle model,
// not hydrodynamics.
// ---------------------------------------------------------------------------

export type BodyKind = "planet" | "star" | "comet";

export type PlaygroundHandle = {
  reset: () => void;
  system: () => void;
};

export type PlaygroundSceneProps = {
  quality: BlackHoleQuality;
  spin: number;
  diskOn: boolean;
  dopplerOn: boolean;
  jetsOn: boolean;
  windOn?: boolean;
  gridOn: boolean;
  gwOn: boolean;
  diskParticlesOn?: boolean; // background Keplerian particle disk (WebGPU mode)
  activeKind: BodyKind;
  apiRef: MutableRefObject<PlaygroundHandle | null>;
  scaleRef?: MutableRefObject<number>; // px on screen per 1 r_s (for the scale bar)
  webgpuMode?: boolean;
  bgRef?: MutableRefObject<WebGPUBgHandle | null>;
  ringdownStartRef?: MutableRefObject<number | null>; // null = inactive; else = clock time of trigger
};

// Reports how many screen pixels one Schwarzschild radius spans at the centre,
// so the UI can draw a zoom-aware scale bar.
function ScaleProbe({ scaleRef }: { scaleRef?: MutableRefObject<number> }) {
  const { camera, size } = useThree();
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!scaleRef) return;
    a.set(0, 0, 0).project(camera);
    b.set(1, 0, 0).project(camera);            // 1 r_s along world x at the centre
    const dx = (b.x - a.x) * 0.5 * size.width;
    const dy = (b.y - a.y) * 0.5 * size.height;
    scaleRef.current = Math.hypot(dx, dy);
  });
  return null;
}

const RS = 1.0;
const GM = 0.5;
const HORIZON = 1.02;
// Tidal-disruption radius by composition. Disruption scales as density^(−1/3),
// so denser bodies survive closer to the hole: a low-density star is torn far
// out, a dense rocky planet only very close (it is "more resistant"), and a
// loosely-bound comet disrupts easily.
function tidalRadiusFor(kind: BodyKind): number {
  if (kind === "star") return 6.5;
  if (kind === "comet") return 5.0;
  return 3.4; // planet (dense → resistant)
}
const DISK_IN = 3.0;      // accretion-disk inner radius (matches the shader)
const DISK_OUT = 16.0;    // accretion-disk outer radius
const MASS_TRANSFER_RADIUS = 11.0; // bodies inside this shed matter toward the BH
const C_CAP = 0.985;     // speed-of-light cap (c = 1 in geometric units)
const MAX_PARTICLES = 14000; // large pool → dense, continuous streams
// Gravitational-wave radiation-reaction strength. The real Peters luminosity is
// ~(v/c)⁵ tiny AND ∝ 1/r⁵, so at the radii where bodies are dropped the inspiral
// is imperceptible without a large amplification (otherwise GW on/off look
// identical). This factor scales it so a star placed at r ≈ 8–15 r_s visibly
// spirals in and is disrupted over a few seconds — the miniature EMRI "chirp" —
// while GW off leaves it on a stable (eccentric) orbit. Tunable.
const GW_STR = 2600.0;

type Body = {
  id: number;
  kind: BodyKind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  color: THREE.Color;
  mass: number;          // for hosting moons (planets); ~0 for test bodies
  parentId: number | null; // moon → host planet
  mesh: THREE.Mesh | null;
  merged?: boolean;        // marked when absorbed by another body this frame
  disrupting?: number;     // seconds remaining of a gradual tidal disruption
  disruptN?: number;       // total debris to release over the disruption
  mass0?: number;          // mass at disruption onset (to scale it down to 0)
  radius0?: number;        // radius at disruption onset
};

const STREAM_COLOR = new THREE.Color("#ffc89c"); // tidally-stripped gas (reused)
const PLANET_MASS = 0.005; // host mass so moons stay bound (≪ a star's mass)
const PLANET_COLORS = [
  "#6fa8d8", "#d8a76f", "#9fd86f", "#c98fd0",
  "#d0b070", "#7fd0c0", "#d07f7f", "#8f9fd0",
];

// Pseudo-Newtonian (Paczyński–Wiita) acceleration toward the BH at origin.
function pwAccel(pos: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
  const r = pos.length();
  const d = Math.max(r - RS, 0.05);
  const a = -GM / (d * d) / Math.max(r, 1e-4);
  return out.copy(pos).multiplyScalar(a);
}

// ---------------------------------------------------------------------------
// Particle pool (tidal streams, comet tails, capture bursts)
// ---------------------------------------------------------------------------

type ParticleArrays = {
  pos: Float32Array;
  col: Float32Array;
  vel: Float32Array;
  life: Float32Array; // remaining life (s); <=0 = dead
  absorb: Float32Array; // 1 = absorbed by the disk on crossing; 0 = wraps freely
  count: number;  // high-water mark of slots ever written (for the draw range)
  cursor: number; // ring-buffer write head — emit is O(1), never starves
};

function makeParticles(): ParticleArrays {
  return {
    pos: new Float32Array(MAX_PARTICLES * 3),
    col: new Float32Array(MAX_PARTICLES * 3),
    vel: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
    absorb: new Float32Array(MAX_PARTICLES),
    count: 0,
    cursor: 0,
  };
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

function Simulation({
  apiRef,
  activeKind,
  gwOn,
}: {
  apiRef: MutableRefObject<PlaygroundHandle | null>;
  activeKind: BodyKind;
  gwOn: boolean;
}) {
  const bodies = useRef<Body[]>([]);
  const nextId = useRef(1);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const parts = useRef<ParticleArrays>(makeParticles());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);
  // Soft round sprite for the debris particles (otherwise GL points render as
  // hard squares → the "blocky" tidal stream).
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  // Spawn a particle into the pool. The pool is a ring buffer: writing is O(1)
  // and a fresh particle always lands (overwriting the oldest slot once full),
  // so a heavy tidal burst is never silently dropped and never hitches the
  // frame scanning for a free slot. absorb=true means the disk swallows it on a
  // plane crossing; the unbound tidal tail uses absorb=false so it wraps freely.
  function emit(p: THREE.Vector3, v: THREE.Vector3, c: THREE.Color, life: number, absorb = true) {
    const a = parts.current;
    const i = a.cursor;
    a.cursor = (a.cursor + 1) % MAX_PARTICLES;
    if (a.count < MAX_PARTICLES) a.count++;
    a.pos[i * 3] = p.x; a.pos[i * 3 + 1] = p.y; a.pos[i * 3 + 2] = p.z;
    a.vel[i * 3] = v.x; a.vel[i * 3 + 1] = v.y; a.vel[i * 3 + 2] = v.z;
    a.col[i * 3] = c.r; a.col[i * 3 + 1] = c.g; a.col[i * 3 + 2] = c.b;
    a.absorb[i] = absorb ? 1 : 0;
    a.life[i] = life;
  }

  function addBody(
    kind: BodyKind,
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    radius: number,
    color: THREE.Color,
    mass: number,
    parentId: number | null
  ): Body {
    // Planets and moons are lit by the disk/star (Standard material → shading &
    // phases); stars and comets are self-luminous (Basic material → they glow).
    const mat =
      kind === "planet"
        ? new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0 })
        : new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), mat);
    mesh.position.copy(pos);
    groupRef.current?.add(mesh);
    const b: Body = { id: nextId.current++, kind, pos, vel, radius, color, mass, parentId, mesh };
    bodies.current.push(b);
    return b;
  }

  // A planet (smaller/lighter than a star by orders of magnitude, compressed
  // here for visibility) with 0–3 moons on bound local orbits inside its Hill
  // sphere. Works for any orbital position/velocity (in- or out-of-plane).
  function createPlanet(pos: THREE.Vector3, vel: THREE.Vector3) {
    const pal = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)]!;
    const pr = 0.11 + Math.random() * 0.07;
    const pmass = PLANET_MASS * (pr / 0.14);
    const planet = addBody("planet", pos, vel, pr, new THREE.Color(pal), pmass, null);
    const nMoons = Math.floor(Math.random() * 4);
    for (let m = 0; m < nMoons; m++) {
      const rl = pr + 0.22 + m * (0.18 + Math.random() * 0.12);
      const phi = Math.random() * Math.PI * 2;
      const inc = (Math.random() - 0.5) * 0.4;
      const off = new THREE.Vector3(Math.cos(phi) * rl, Math.sin(inc) * rl * 0.4, Math.sin(phi) * rl);
      // Circular speed for the SAME softened force the integrator uses
      // (ε² = 0.0144): v² = pmass·rl² / (rl² + ε²)^{3/2}. Using the unsoftened
      // √(pmass/rl) over-speeds the moon → it drifts off and unbinds.
      const vLocal = Math.sqrt((pmass * rl * rl) / Math.pow(rl * rl + 0.0144, 1.5));
      const vMoon = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(vLocal);
      const mr = 0.025 + Math.random() * 0.03;
      const shade = 0.6 + Math.random() * 0.4;
      addBody("planet", pos.clone().add(off), vel.clone().add(vMoon), mr,
        new THREE.Color(0.72 * shade, 0.77 * shade, 0.83 * shade), 0.00008, planet.id);
    }
  }

  // Place a planet system on an inclined circular orbit at radius r.
  function spawnPlanetSystem(r: number, theta: number, incl: number) {
    const vCirc = Math.sqrt(GM * r) / Math.max(r - RS, 0.1);
    const ct = Math.cos(theta), st = Math.sin(theta);
    const si = Math.sin(incl), ci = Math.cos(incl);
    const pos = new THREE.Vector3(ct * r, st * si * r, st * ci * r);
    const vel = new THREE.Vector3(-st, ct * si, ct * ci).multiplyScalar(vCirc);
    createPlanet(pos, vel);
  }

  // Spawn a body at a user-chosen position (raycast point on the disk plane),
  // with a tangential prograde velocity tuned for an eccentric infalling orbit.
  // Planets are spawned as little systems: a planet with a couple of moons,
  // so the black hole stands in for the central star.
  function spawnBodyAt(kind: BodyKind, point: THREE.Vector3) {
    const r0 = Math.hypot(point.x, point.z);
    if (r0 < 2.5) return; // too close to the horizon to place
    const pos = new THREE.Vector3(point.x, point.y, point.z);
    // Circular-orbit speed in the Paczyński–Wiita potential: v² = r·dΦ/dr.
    // The launch speed as a FRACTION of circular sets the eccentricity:
    //   • planet → 1.0  : (near-)circular, so it forms a stable orbiting system;
    //   • star   → 0.94 : mildly eccentric — visibly swings inward each orbit
    //     but survives several passes before skimming the tidal radius (was
    //     0.86, which plunged too soon — bodies "fell in too easily");
    //   • comet  → 0.72 : eccentric and clearly dynamic, but with a periapsis
    //     that no longer dives straight through the horizon on the first orbit
    //     (was 0.55).
    const vCirc = Math.sqrt(GM * r0) / Math.max(r0 - RS, 0.1);
    const factor = kind === "comet" ? 0.72 : kind === "star" ? 0.94 : 1.0;
    const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
    const vel = new THREE.Vector3(-radial.z, 0, radial.x).multiplyScalar(vCirc * factor);

    if (kind === "planet") {
      createPlanet(pos, vel);
      return;
    }

    // A star is the most massive and largest body by far; a comet is tiny.
    const cfg =
      kind === "star"
        ? { radius: 0.42, color: new THREE.Color("#fff0c0"), mass: 0.06 }
        : { radius: 0.05, color: new THREE.Color("#cfe8ff"), mass: 0.0003 };
    addBody(kind, pos, vel, cfg.radius, cfg.color, cfg.mass, null);
  }

  function disrupt(b: Body, n: number) {
    // Tidal disruption event (TDE): the body is spaghettified into a thin
    // stream. The key physics is a spread in *specific orbital energy* imparted
    // along the orbital direction: half the debris becomes bound (ε<0) and
    // spirals back in, wrapping around the hole and feeding the disk, while the
    // other half is unbound (ε>0) and flies out as a tidal tail. The spread in
    // orbital period makes the debris stretch into a long stream over time.
    const speed  = Math.max(b.vel.length(), 1e-3);
    const vdir   = b.vel.clone().multiplyScalar(1 / speed);   // orbital direction
    const radial = b.pos.clone().normalize();
    // Debris colour by composition: stars warm, planets rocky, comets icy.
    const bound =
      b.kind === "comet" ? new THREE.Color("#8fc4dc")
      : b.kind === "planet" ? new THREE.Color("#9c7a5c")
      : new THREE.Color("#ff6a30");
    const tail =
      b.kind === "comet" ? new THREE.Color("#d6eef8")
      : b.kind === "planet" ? new THREE.Color("#cdb79c")
      : new THREE.Color("#ffd9a0");
    for (let k = 0; k < n; k++) {
      const u = ((k + Math.random()) / n) * 2 - 1; // -1 (bound) .. +1 (unbound)
      const isBound = u < 0.0;
      // Stretch the body into a long thin noodle along the orbit right away
      // (the classic spaghetti), with a tiny radial/vertical width.
      const p = b.pos.clone()
        .addScaledVector(vdir, u * 0.5)
        .addScaledVector(radial, (Math.random() - 0.5) * 0.05);
      // energy spread along the orbit (the two arms) PLUS a radial kick that
      // separates the fates: the BOUND half (u<0) is pushed INWARD — it loses
      // periastron and visibly spirals into the hole, getting eaten over the
      // next seconds — while the UNBOUND half (u>0) is pushed OUT as the tail,
      // so it is no longer just a single puff that disperses.
      const v = b.vel.clone()
        .addScaledVector(vdir, u * 0.16 * speed)
        .addScaledVector(radial, u * 0.20 * speed)
        .add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.05,   // thin vertical width
          (Math.random() - 0.5) * 0.02));
      const c = isBound ? bound : bound.clone().lerp(tail, u);
      // Bound half spirals back and CIRCULARISES into the disk (absorb=true);
      // the unbound half flies out as the tidal tail and is not absorbed.
      emit(p, v, c, isBound ? 16 : 24, isBound);
    }
  }

  function burst(b: Body) {
    const c = new THREE.Color("#ffffff");
    for (let k = 0; k < 26; k++) {
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      emit(b.pos.clone(), b.vel.clone().addScaledVector(dir, 0.05), c, 1.0);
    }
  }

  useEffect(() => {
    apiRef.current = {
      reset: () => {
        bodies.current = [];
        const a = parts.current;
        a.life.fill(0);
        a.count = 0;
        a.cursor = 0;
        if (groupRef.current) groupRef.current.clear();
      },
      // Generate a whole planetary system orbiting the black hole — the hole
      // stands in for the central star (à la Gargantua in Interstellar): several
      // planets at increasing radii on stable circular orbits, most with moons.
      system: () => {
        // Place the planets OUTSIDE the accretion disk (r_out = 16) on stable
        // circular orbits, with a small per-orbit inclination, so they form a
        // visible 3D system around the hole instead of vanishing into the disk.
        const n = 4 + Math.floor(Math.random() * 3); // 4–6 planets
        let r = 19 + Math.random() * 3;
        for (let i = 0; i < n; i++) {
          const th = Math.random() * Math.PI * 2;
          const incl = (Math.random() - 0.5) * 0.5; // tilt the orbital plane
          spawnPlanetSystem(r, th, incl);
          r += 7 + Math.random() * 8; // spread the orbits outward
        }
      },
    };
    return () => { apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state, rawDt) => {
    const group = groupRef.current;
    if (!group) return;

    // Speed up simulated time, then ADAPTIVELY sub-step. Near the hole the
    // potential is steep, so the step must stay below the local dynamical time
    // or it injects energy and the whole system blows up ("va in palla") — much
    // more likely with many bodies, since only one needs to be close. We cap the
    // substep COUNT for performance, but crucially we NEVER stretch h past the
    // stability limit dtMax: if that many steps isn't enough we advance LESS
    // simulated time (graceful slow-motion) instead of going unstable.
    const wanted = Math.min(rawDt, 0.05) * 16.0;
    let minDist = 1e9;
    for (const b of bodies.current) {
      const r = b.pos.length();
      if (r < 1.6) continue;          // doomed plungers don't force global slow-motion
      if (r - RS < minDist) minDist = r - RS;
    }
    const dtMax = Math.min(0.02, Math.max(0.005, 0.010 * minDist));
    const nSub = Math.min(64, Math.max(1, Math.ceil(wanted / dtMax)));
    const h = Math.min(dtMax, wanted / nSub); // h ≤ dtMax always → stable
    const total = h * nSub;                   // actual simulated time this frame
    const a = parts.current;

    for (let s = 0; s < nSub; s++) {
      // Bodies: black-hole pull (Paczyński–Wiita) + mutual N-body gravity among
      // all massive bodies (stars, planets). Softened to avoid singular close
      // encounters. Moons (mass 0) feel the others but do not perturb them; if
      // a host planet is swallowed it drops out and its moons orbit the BH.
      for (const b of bodies.current) {
        pwAccel(b.pos, tmp);
        for (const o of bodies.current) {
          if (o === b || o.mass <= 0.0) continue;
          tmp2.copy(o.pos).sub(b.pos);
          const d2 = tmp2.lengthSq() + 0.0144; // ε² = (0.12)² softening
          tmp.addScaledVector(tmp2, o.mass / (d2 * Math.sqrt(d2)));
        }
        b.vel.addScaledVector(tmp, h);
        // Gravitational-wave radiation reaction (optional). The body radiates
        // GWs and loses orbital energy, spiralling toward the BH — a miniature
        // EMRI. We remove energy at the Peters luminosity P = (32/5)·M²m²(M+m)/r⁵
        // (G=c=1) via a drag F = −(P/v²)·v (does work −P). Because P ∝ 1/r⁵ the
        // inspiral runs away near the hole — the chirp.
        if (gwOn && b.mass > 0.0) {
          const rb = b.pos.length();
          const vb2 = b.vel.lengthSq();
          if (rb > HORIZON && vb2 > 1e-8) {
            const P = GW_STR * 6.4 * GM * GM * b.mass * b.mass * (GM + b.mass) / Math.pow(rb, 5.0);
            const factor = Math.max(-(P * h) / (b.mass * vb2), -0.4); // clamp: never reverse v
            b.vel.addScaledVector(b.vel, factor);
          }
        }
        // No body may exceed the speed of light (c = 1 in geometric units).
        const sp = b.vel.length();
        if (sp > C_CAP) b.vel.multiplyScalar(C_CAP / sp);
        b.pos.addScaledVector(b.vel, h);
      }
    }

    // Particles (tidal streams / debris) are integrated with their OWN, capped
    // sub-stepping — they don't need the bodies' fine near-horizon steps. This
    // stops a single plunging body (up to 64 substeps) from multiplying the
    // 14k-particle cost and freezing the whole sim. Same total simulated time.
    const pSub = Math.min(nSub, 16);
    const ph = total / pSub;
    for (let ps = 0; ps < pSub; ps++) {
      for (let k = 0; k < a.count; k++) {
        if (a.life[k]! <= 0) continue;
        tmp.set(a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
        pwAccel(tmp, tmp2);
        a.vel[k * 3] = a.vel[k * 3]! + tmp2.x * ph;
        a.vel[k * 3 + 1] = a.vel[k * 3 + 1]! + tmp2.y * ph;
        a.vel[k * 3 + 2] = a.vel[k * 3 + 2]! + tmp2.z * ph;
        // Cap particle speed at c as well.
        const psp = Math.hypot(a.vel[k * 3]!, a.vel[k * 3 + 1]!, a.vel[k * 3 + 2]!);
        if (psp > C_CAP) {
          const s2 = C_CAP / psp;
          a.vel[k * 3] = a.vel[k * 3]! * s2;
          a.vel[k * 3 + 1] = a.vel[k * 3 + 1]! * s2;
          a.vel[k * 3 + 2] = a.vel[k * 3 + 2]! * s2;
        }
        a.pos[k * 3] = tmp.x + a.vel[k * 3]! * ph;
        a.pos[k * 3 + 1] = tmp.y + a.vel[k * 3 + 1]! * ph;
        a.pos[k * 3 + 2] = tmp.z + a.vel[k * 3 + 2]! * ph;
        // Absorb into the disk: if this step crossed the disk plane within the
        // disk's radial extent, the debris merges into the disk (feeds it)
        // rather than passing through and flying out the other side.
        if (a.absorb[k]! > 0.5 && tmp.y * a.pos[k * 3 + 1]! < 0.0) {
          const rr = Math.hypot(a.pos[k * 3]!, a.pos[k * 3 + 2]!);
          if (rr > DISK_IN && rr < DISK_OUT) a.life[k] = 0;
        }
      }
    }

    // ── Body–body collisions: overlapping primaries merge ────────────────
    // Two bodies that run into each other must not ghost through one another.
    // Overlapping PRIMARIES (parentId === null) coalesce into one, conserving
    // mass and momentum; the radius combines by volume (R³ = R₁³ + R₂³) and the
    // survivor keeps the more massive body's kind and colour. Moons stay bound
    // to their host and are skipped here, so they never merge with their planet.
    {
      const bs = bodies.current;
      let anyMerged = false;
      for (let i = 0; i < bs.length; i++) {
        const A = bs[i]!;
        if (A.parentId !== null || A.merged) continue;
        for (let j = i + 1; j < bs.length; j++) {
          const B = bs[j]!;
          if (B.parentId !== null || B.merged) continue;
          if (A.pos.distanceTo(B.pos) >= (A.radius + B.radius) * 0.85) continue;
          const big = A.mass >= B.mass ? A : B;
          const small = big === A ? B : A;
          const mA = big.mass, mB = small.mass, m = mA + mB;
          big.vel.multiplyScalar(mA).addScaledVector(small.vel, mB).multiplyScalar(1 / Math.max(m, 1e-9));
          big.pos.multiplyScalar(mA).addScaledVector(small.pos, mB).multiplyScalar(1 / Math.max(m, 1e-9));
          const newR = Math.cbrt(big.radius ** 3 + small.radius ** 3);
          if (big.mesh) big.mesh.scale.multiplyScalar(newR / Math.max(big.radius, 1e-6));
          big.radius = newR;
          big.mass = m;
          // (the small body's moons keep a now-stale parentId — harmless: it is
          // only ever tested against null, so they stay 'moons' and simply orbit
          // the merged body via the N-body gravity.)
          burst(big); // bright flash at the impact
          small.merged = true;
          anyMerged = true;
          if (A.merged) break; // A was the absorbed one — stop pairing it
        }
      }
      if (anyMerged) bodies.current = bs.filter((b) => !b.merged);
    }

    // ── Body classification (after integrating this frame) ───────────────
    const survivors: Body[] = [];
    for (const b of bodies.current) {
      const r = b.pos.length();
      if (b.kind === "comet" && r < 18) {
        tmp2.copy(b.pos).normalize().multiplyScalar(0.05);
        emit(b.pos, tmp2, new THREE.Color("#bfe0ff"), 2.2);
      }
      const rt = tidalRadiusFor(b.kind);
      // Tidal stripping: a primary body close to the hole (but not yet fully
      // disrupted) is stripped from its EXPOSED, BH-facing surface — a widening
      // sheet of gas, not a single thread — and the lifted material streams
      // toward the hole, feeding the disk. Emission is CONTINUOUS (a deterministic
      // number of parcels per frame, ≥1) so the stream never stutters, and it
      // broadens as the star sinks deeper into the tidal field.
      if (b.parentId === null && b.disrupting === undefined && r > rt && r < MASS_TRANSFER_RADIUS) {
        const frac = 1.0 - (r - rt) / (MASS_TRANSFER_RADIUS - rt); // 0 (far) .. 1 (near rt)
        // Dense, continuous stream: many parcels per frame, scaled by how deep
        // the body is in the tidal field and by its size.
        const nShed = Math.round((4 + frac * 30) * (b.radius / 0.4));
        const radial = b.pos.clone().multiplyScalar(1 / Math.max(r, 1e-4)); // outward unit
        // tangent basis on the star's BH-facing cap
        const up = Math.abs(radial.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const tA = new THREE.Vector3().crossVectors(radial, up).normalize();
        const tB = new THREE.Vector3().crossVectors(radial, tA).normalize();
        const capR = b.radius * (0.5 + 0.5 * frac); // exposed cap widens as it sinks
        // Orbital (tangential) direction of the star — the stream inherits this so
        // it WRAPS around the hole instead of falling straight in. Gas lifted from
        // the BH-facing face sits deeper in the potential, so it carries slightly
        // LESS specific angular momentum: shedding a few % of v_tan drops it onto a
        // tighter orbit and it spirals inward (a curved accretion stream, the way a
        // real Roche-overflow stream curves by Coriolis), rather than a radial spoke.
        const vTan = b.vel.clone().addScaledVector(radial, -b.vel.dot(radial));
        const vTanLen = vTan.length();
        const vTanHat = vTanLen > 1e-6 ? vTan.multiplyScalar(1 / vTanLen) : tA;
        for (let sIdx = 0; sIdx < nShed; sIdx++) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.sqrt(Math.random()) * capR;        // uniform over the cap disk
          const depth = Math.sqrt(Math.max(b.radius * b.radius - rad * rad, 0));
          const p = b.pos.clone()
            .addScaledVector(radial, -depth)                  // onto the BH-facing surface
            .addScaledVector(tA, Math.cos(ang) * rad)
            .addScaledVector(tB, Math.sin(ang) * rad);
          const vv = b.vel.clone()
            // shed ~8–20% of the orbital speed (loses angular momentum → spirals in)
            .addScaledVector(vTanHat, -(0.08 + 0.12 * frac) * vTanLen)
            // a much gentler radial nudge, just to break it off the surface
            .addScaledVector(radial, -0.012 * (0.4 + frac))
            .addScaledVector(tA, (Math.random() - 0.5) * 0.012)
            .addScaledVector(tB, (Math.random() - 0.5) * 0.012);
          emit(p, vv, STREAM_COLOR, 8.0);
        }
      }
      // Tidal disruption at the density-dependent radius. Spread over ~½ s so
      // the star stretches and is eaten gradually (a real spaghettification),
      // not a single puff: it keeps orbiting and shedding debris along its path
      // while shrinking, then disappears.
      if (b.parentId === null && (b.disrupting !== undefined || r < rt)) {
        if (b.disrupting === undefined) {
          // eslint-disable-next-line react-hooks/immutability
          b.disrupting = 0.5;
          b.disruptN = Math.round(220 + 900 * b.radius);
          b.mass0 = b.mass; b.radius0 = b.radius; // freeze pre-disruption values
        }
        const dtFrac = Math.min(rawDt, b.disrupting) / 0.5;
        disrupt(b, Math.max(1, Math.round(b.disruptN! * dtFrac)));
        b.disrupting -= rawDt;
        // The star loses mass as it is spaghettified: it drains to 0 over the ½ s,
        // so its gravitational pull on the other bodies visibly wanes. Radius (and
        // the mesh) track the remaining fraction f; mass ∝ volume ∝ f³.
        const f = Math.max(b.disrupting / 0.5, 0.0);
        b.mass = (b.mass0 ?? b.mass) * f * f * f;
        b.radius = (b.radius0 ?? b.radius) * f;
        if (b.mesh) b.mesh.scale.setScalar(f);
        if (b.disrupting <= 0 || r < HORIZON) {
          if (b.mesh) group.remove(b.mesh);
          continue; // fully spaghettified / swallowed
        }
        if (b.mesh) b.mesh.position.copy(b.pos);
        survivors.push(b); // still dissolving — keeps moving & emitting
        continue;
      }
      if (r < HORIZON) {
        burst(b);
        if (b.mesh) group.remove(b.mesh);
        continue; // consumed
      }
      if (r > 60) {
        if (b.mesh) group.remove(b.mesh);
        continue; // ejected
      }
      if (b.mesh) b.mesh.position.copy(b.pos);
      survivors.push(b);
    }
    bodies.current = survivors;

    // ── Particle lifetimes / capture ─────────────────────────────────────
    for (let k = 0; k < a.count; k++) {
      if (a.life[k]! <= 0) continue;
      a.life[k] = a.life[k]! - rawDt;
      const rp = Math.hypot(a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
      if (rp < HORIZON) a.life[k] = 0; // swallowed
    }

    // write to geometry
    const pts = pointsRef.current;
    if (pts) {
      const geo = pts.geometry;
      const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = geo.getAttribute("color") as THREE.BufferAttribute;
      for (let k = 0; k < MAX_PARTICLES; k++) {
        const alive = k < a.count && a.life[k]! > 0;
        if (alive) {
          posAttr.setXYZ(k, a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
          const f = Math.min(1, a.life[k]! / 3); // fade out near end of life
          colAttr.setXYZ(k, a.col[k * 3]! * f, a.col[k * 3 + 1]! * f, a.col[k * 3 + 2]! * f);
        } else {
          colAttr.setXYZ(k, 0, 0, 0);
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      geo.setDrawRange(0, a.count);
    }
  });

  // particle geometry buffers
  const [posBuf, colBuf] = useMemo(
    () => [new Float32Array(MAX_PARTICLES * 3), new Float32Array(MAX_PARTICLES * 3)],
    []
  );

  return (
    <>
      {/* The accretion disk is the system's light source: a warm point light at
          the centre (the bright inner disk) lights the planets/moons → phases,
          like a star would. A faint ambient keeps the dark side from going pure
          black. */}
      <pointLight position={[0, 0, 0]} color="#ffd2a0" intensity={18} distance={120} decay={1.5} />
      <ambientLight intensity={0.07} />

      {/* Invisible, raycastable plane on the disk plane: a click places the
          currently-selected body at the chosen position. A drag (handled by
          OrbitControls) rotates the camera and does not fire onClick. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          spawnBodyAt(activeKind, e.point);
        }}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <group ref={groupRef} />
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posBuf, 3]} />
          <bufferAttribute attach="attributes-color" args={[colBuf, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={sprite}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// ---------------------------------------------------------------------------
// QNM ringdown: computes the damped-sinusoid amplitude for the l=2 photon-ring
// quasi-normal mode and writes it to both the WebGPU bgRef and a shared ref
// read each frame by BlackHoleQuad (WebGL mode).
//
// Physics: Q(a) = ω_R/(2ω_I) fits tabulated Kerr QNM values (Leaver 1985):
//   a=0 → Q≈2.1 (~2 oscillations), a=0.9 → Q≈7.3 (~7), a=0.99 → Q≈13.
// Visual period is fixed at T=2s; the ratio ω_R/ω_I (hence Q) is preserved.
// ---------------------------------------------------------------------------
function qnmAmplitude(elapsed: number, spin: number): number {
  const Q      = 2.1 + 11.3 * Math.pow(spin, 3);
  const omegaR = Math.PI; // = 2π / T, T = 2s
  const omegaI = omegaR / (2 * Q);
  return Math.exp(-omegaI * elapsed) * Math.cos(omegaR * elapsed);
}

function QNMHook({
  spin,
  bgRef,
  ringdownStartRef,
  ringdownAmplRef,
}: {
  spin: number;
  bgRef?: MutableRefObject<WebGPUBgHandle | null>;
  ringdownStartRef?: MutableRefObject<number | null>;
  ringdownAmplRef: MutableRefObject<number>;
}) {
  const { clock } = useThree();
  useFrame(() => {
    const ref   = ringdownStartRef;
    const start = ref?.current ?? null;

    // Inactive
    if (start === null) {
      if (ringdownAmplRef.current !== 0) {
        ringdownAmplRef.current = 0;
        bgRef?.current?.setRingdown(0);
      }
      return;
    }

    // −1 is the trigger sentinel: latch the current clock time on this frame
    if (start === -1) {
      if (ref) ref.current = clock.getElapsedTime();
      return;
    }

    const elapsed = clock.getElapsedTime() - start;
    const ampl    = qnmAmplitude(elapsed, spin);
    ringdownAmplRef.current = ampl;
    bgRef?.current?.setRingdown(ampl);

    // Stop when envelope < 1%:  exp(−ω_I · t) < 0.01
    const Q      = 2.1 + 11.3 * Math.pow(spin, 3);
    const omegaI = Math.PI / (2 * Q);
    if (elapsed > Math.log(100) / omegaI) {
      if (ref) ref.current = null;
      ringdownAmplRef.current = 0;
      bgRef?.current?.setRingdown(0);
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// Camera sync: reads Three.js camera position each frame and pushes az/el/dist
// to the WebGPU background canvas so both renderers stay in sync.
// ---------------------------------------------------------------------------
function CameraSync({ bgRef }: { bgRef: MutableRefObject<WebGPUBgHandle | null> }) {
  const { camera } = useThree();
  useFrame(() => {
    const bg = bgRef.current;
    if (!bg) return;
    const dist = camera.position.length() || 1;
    const el   = Math.asin(Math.max(-1, Math.min(1, camera.position.y / dist)));
    const az   = Math.atan2(camera.position.x, camera.position.z);
    bg.setCamera(az, el, dist);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Public scene
// ---------------------------------------------------------------------------

export default function BlackHolePlaygroundScene({ quality, spin, diskOn, dopplerOn, jetsOn, windOn, gridOn, gwOn, diskParticlesOn = true, activeKind, apiRef, scaleRef, webgpuMode, bgRef, ringdownStartRef }: PlaygroundSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;
  // Shared ringdown amplitude ref: updated by QNMHook each frame, read by BlackHoleQuad.
  const ringdownAmplRef = useRef(0);
  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 6, 22] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: true, preserveDrawingBuffer: false }}
      style={{ position: "absolute", inset: 0, background: "transparent" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      {!webgpuMode && <BlackHoleQuad quality={quality} diskOn={diskOn} spin={spin} dopplerOn={dopplerOn} jetsOn={jetsOn} windOn={windOn} ringdownRef={ringdownAmplRef} />}
      {webgpuMode && bgRef && <CameraSync bgRef={bgRef} />}
      <QNMHook spin={spin} bgRef={bgRef} ringdownStartRef={ringdownStartRef} ringdownAmplRef={ringdownAmplRef} />
      {/* 300 k Keplerian particles — visible only in WebGPU mode where the
          ray-marched disk lives in the background canvas. Orbits follow the
          exact prograde Kerr angular velocity + epicyclic perturbation so the
          inner edge shifts with the spin slider (same ISCO as the shader).
          NOT gravitationally lensed (same limitation as the 3D bodies). */}
      {webgpuMode && diskParticlesOn && (
        <AccretionDiskParticles spin={spin} dopplerOn={dopplerOn} />
      )}
      {/* In WebGPU mode the R3F canvas is composited over the WebGPU background.
          The point light at the BH centre barely reaches bodies at r > 19 rs
          (decay=1.5), so planet meshes appear near-black against the bright disk.
          A hemisphere light (warm disk equator / cool zenith) gives diffuse fill
          that reads as "lit by the accretion disk environment" without blowing
          out the bloom on nearby objects. */}
      {webgpuMode && <hemisphereLight args={["#ffd2a0", "#1a0a00", 0.55]} />}
      {/* Depth-only occluder: the photon-capture shadow radius ≈ 3√3/2 ≈ 2.6 rs.
          colorWrite=false means it writes only to the depth buffer — no pixels
          are painted, so the R3F canvas stays transparent here and the WebGPU
          background (which correctly renders the black shadow) shows through.
          Objects whose 3D depth exceeds the sphere's near face are culled. */}
      {webgpuMode && (
        <mesh renderOrder={-1}>
          <sphereGeometry args={[2.6, 24, 16]} />
          <meshBasicMaterial colorWrite={false} side={THREE.FrontSide} depthWrite />
        </mesh>
      )}
      <BlackHoleGrid visible={gridOn} spin={spin} />
      <Simulation apiRef={apiRef} activeKind={activeKind} gwOn={gwOn} />
      <ScaleProbe scaleRef={scaleRef} />
      <OrbitControls
        makeDefault
        enablePan
        screenSpacePanning
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
        minDistance={2}
        maxDistance={600}
      />
      <EffectComposer frameBufferType={THREE.HalfFloatType}>
        <Bloom intensity={1.0} luminanceThreshold={0.62} luminanceSmoothing={0.75} mipmapBlur />
        <DitherEffect />
      </EffectComposer>
    </Canvas>
  );
}
