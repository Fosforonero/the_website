"use client";

import { useRef, useMemo, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlackHoleQuad } from "./black-hole-scene";
import { QUALITY_PRESETS, type BlackHoleQuality } from "./black-hole/black-hole-shader";

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
};

export type PlaygroundSceneProps = {
  quality: BlackHoleQuality;
  spin: number;
  diskOn: boolean;
  jetsOn: boolean;
  activeKind: BodyKind;
  apiRef: MutableRefObject<PlaygroundHandle | null>;
};

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
const MAX_PARTICLES = 2400;

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
};

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
  count: number;
};

function makeParticles(): ParticleArrays {
  return {
    pos: new Float32Array(MAX_PARTICLES * 3),
    col: new Float32Array(MAX_PARTICLES * 3),
    vel: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
    absorb: new Float32Array(MAX_PARTICLES),
    count: 0,
  };
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

function Simulation({
  apiRef,
  activeKind,
}: {
  apiRef: MutableRefObject<PlaygroundHandle | null>;
  activeKind: BodyKind;
}) {
  const bodies = useRef<Body[]>([]);
  const nextId = useRef(1);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const parts = useRef<ParticleArrays>(makeParticles());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);

  // Spawn a particle into the pool (reuses dead slots). absorb=true means the
  // disk swallows it on a plane crossing; tidal-stream debris uses absorb=false
  // so it can wrap around the hole before circularizing.
  function emit(p: THREE.Vector3, v: THREE.Vector3, c: THREE.Color, life: number, absorb = true) {
    const a = parts.current;
    let i = -1;
    for (let k = 0; k < a.count; k++) if (a.life[k]! <= 0) { i = k; break; }
    if (i < 0) {
      if (a.count >= MAX_PARTICLES) return;
      i = a.count++;
    }
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

  // Spawn a body at a user-chosen position (raycast point on the disk plane),
  // with a tangential prograde velocity tuned for an eccentric infalling orbit.
  // Planets are spawned as little systems: a planet with a couple of moons,
  // so the black hole stands in for the central star.
  function spawnBodyAt(kind: BodyKind, point: THREE.Vector3) {
    const r0 = Math.hypot(point.x, point.z);
    if (r0 < 2.5) return; // too close to the horizon to place
    const pos = new THREE.Vector3(point.x, point.y, point.z);
    // Circular-orbit speed in the Paczyński–Wiita potential: v² = r·dΦ/dr.
    // Planets/stars get a (near-)circular orbit so they actually orbit the
    // black hole; comets keep an eccentric, plunging orbit.
    const vCirc = Math.sqrt(GM * r0) / Math.max(r0 - RS, 0.1);
    const factor = kind === "comet" ? 0.55 : 1.0;
    const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
    const vel = new THREE.Vector3(-radial.z, 0, radial.x).multiplyScalar(vCirc * factor);

    if (kind === "planet") {
      // A planet is far smaller and lighter than a star (orders of magnitude in
      // reality; compressed here so it stays visible). Vary colour/size/moons.
      const pal = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)]!;
      const pr = 0.11 + Math.random() * 0.07;                  // radius 0.11–0.18
      const pmass = PLANET_MASS * (pr / 0.14);                 // mass scales with size
      const planet = addBody("planet", pos, vel, pr, new THREE.Color(pal), pmass, null);
      // 0–3 moons on small local orbits inside the Hill sphere.
      const nMoons = Math.floor(Math.random() * 4);
      for (let m = 0; m < nMoons; m++) {
        const rl = pr + 0.22 + m * (0.18 + Math.random() * 0.12); // local orbital radius
        const phi = Math.random() * Math.PI * 2;
        const inc = (Math.random() - 0.5) * 0.4;                 // orbital inclination
        const off = new THREE.Vector3(Math.cos(phi) * rl, Math.sin(inc) * rl * 0.4, Math.sin(phi) * rl);
        const vLocal = Math.sqrt(pmass / rl);                    // local circular speed
        const vMoon = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(vLocal);
        const mr = 0.025 + Math.random() * 0.03;
        const shade = 0.6 + Math.random() * 0.4;
        addBody(
          "planet",
          pos.clone().add(off),
          vel.clone().add(vMoon),
          mr,
          new THREE.Color(0.72 * shade, 0.77 * shade, 0.83 * shade),
          0.00008, // tiny → moons barely perturb, but take part in the N-body
          planet.id
        );
      }
      return;
    }

    // A star is the most massive and largest body by far; a comet is tiny.
    const cfg =
      kind === "star"
        ? { radius: 0.42, color: new THREE.Color("#fff0c0"), mass: 0.06 }
        : { radius: 0.05, color: new THREE.Color("#cfe8ff"), mass: 0.0003 };
    addBody(kind, pos, vel, cfg.radius, cfg.color, cfg.mass, null);
  }

  function disrupt(b: Body) {
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
    const N = Math.round(55 + 220 * b.radius); // bigger body → more debris
    for (let k = 0; k < N; k++) {
      const u = (k / (N - 1)) * 2 - 1;          // -1 (bound) .. +1 (unbound)
      // initial slight elongation along the orbit + tiny radial/vertical width
      const p = b.pos.clone()
        .addScaledVector(vdir, u * 0.18)
        .addScaledVector(radial, (Math.random() - 0.5) * 0.06);
      // energy spread along the orbit: negative u slows debris (bound), positive
      // u speeds it up (unbound). ~±15% of the orbital speed.
      const v = b.vel.clone()
        .addScaledVector(vdir, u * 0.15 * speed)
        .add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.05,   // thin vertical width
          (Math.random() - 0.5) * 0.02));
      const c = (u < 0.0) ? bound : bound.clone().lerp(tail, u);
      emit(p, v, c, 22, false);           // not absorbed → wraps around the hole
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
        if (groupRef.current) groupRef.current.clear();
      },
    };
    return () => { apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state, rawDt) => {
    const group = groupRef.current;
    if (!group) return;

    // Speed up simulated time, then ADAPTIVELY sub-step: refine the step when
    // any body is near the hole, where the potential is steep and a fixed step
    // would inject energy (making bound orbits spuriously escape). With fine
    // steps, energy is conserved — bound orbits stay bound and captures plunge.
    const total = Math.min(rawDt, 0.05) * 16.0;
    let minDist = 1e9;
    for (const b of bodies.current) {
      const d = b.pos.length() - RS;
      if (d < minDist) minDist = d;
    }
    const dtTarget = Math.min(0.025, Math.max(0.003, 0.012 * minDist));
    const nSub = Math.min(120, Math.max(1, Math.ceil(total / dtTarget)));
    const h = total / nSub;
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
        b.pos.addScaledVector(b.vel, h);
      }
      for (let k = 0; k < a.count; k++) {
        if (a.life[k]! <= 0) continue;
        tmp.set(a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
        pwAccel(tmp, tmp2);
        a.vel[k * 3] = a.vel[k * 3]! + tmp2.x * h;
        a.vel[k * 3 + 1] = a.vel[k * 3 + 1]! + tmp2.y * h;
        a.vel[k * 3 + 2] = a.vel[k * 3 + 2]! + tmp2.z * h;
        a.pos[k * 3] = tmp.x + a.vel[k * 3]! * h;
        a.pos[k * 3 + 1] = tmp.y + a.vel[k * 3 + 1]! * h;
        a.pos[k * 3 + 2] = tmp.z + a.vel[k * 3 + 2]! * h;
        // Absorb into the disk: if this step crossed the disk plane within the
        // disk's radial extent, the debris merges into the disk (feeds it)
        // rather than passing through and flying out the other side.
        if (a.absorb[k]! > 0.5 && tmp.y * a.pos[k * 3 + 1]! < 0.0) {
          const rr = Math.hypot(a.pos[k * 3]!, a.pos[k * 3 + 2]!);
          if (rr > DISK_IN && rr < DISK_OUT) a.life[k] = 0;
        }
      }
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
      // Mass transfer: a primary body close to the hole (but not yet captured
      // or fully disrupted) sheds matter from its inner side toward the BH —
      // a toy Roche-lobe-overflow stream that feeds the accretion disk.
      if (b.parentId === null && r > rt && r < MASS_TRANSFER_RADIUS) {
        const frac = 1.0 - (r - rt) / (MASS_TRANSFER_RADIUS - rt);
        if (Math.random() < frac * 0.9) {
          tmp.copy(b.pos).normalize();                           // radial unit (outward)
          tmp2.copy(b.pos).addScaledVector(tmp, -b.radius);      // inner, BH-facing point
          const vv = b.vel.clone().addScaledVector(tmp, -0.04 * (0.5 + frac)); // inward kick
          emit(tmp2, vv, new THREE.Color("#ffc89c"), 8.0);
        }
      }
      // Tidal disruption at the body's density-dependent radius (planets are
      // denser → smaller radius → more resistant). Moons (parented) just plunge.
      if (b.parentId === null && r < rt) {
        disrupt(b);
        if (b.mesh) group.remove(b.mesh);
        continue; // body becomes a debris stream
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
// Public scene
// ---------------------------------------------------------------------------

export default function BlackHolePlaygroundScene({ quality, spin, diskOn, jetsOn, activeKind, apiRef }: PlaygroundSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;
  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 6, 22] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad quality={quality} diskOn={diskOn} spin={spin} dopplerOn jetsOn={jetsOn} />
      <Simulation apiRef={apiRef} activeKind={activeKind} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={5}
        maxDistance={70}
      />
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.85} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
