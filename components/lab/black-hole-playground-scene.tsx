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
  activeKind: BodyKind;
  apiRef: MutableRefObject<PlaygroundHandle | null>;
};

const RS = 1.0;
const GM = 0.5;
const HORIZON = 1.02;
const TIDAL_RADIUS = 6.0; // stars inside this radius are torn apart
const DISK_IN = 3.0;      // accretion-disk inner radius (matches the shader)
const DISK_OUT = 16.0;    // accretion-disk outer radius
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

const PLANET_MASS = 0.012; // host mass so moons stay bound inside the Hill sphere

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
  count: number;
};

function makeParticles(): ParticleArrays {
  return {
    pos: new Float32Array(MAX_PARTICLES * 3),
    col: new Float32Array(MAX_PARTICLES * 3),
    vel: new Float32Array(MAX_PARTICLES * 3),
    life: new Float32Array(MAX_PARTICLES),
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

  // Spawn a particle into the pool (reuses dead slots).
  function emit(p: THREE.Vector3, v: THREE.Vector3, c: THREE.Color, life: number) {
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
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 12),
      new THREE.MeshBasicMaterial({ color })
    );
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
      const planet = addBody("planet", pos, vel, 0.22, new THREE.Color("#6fa8d8"), PLANET_MASS, null);
      // Moons on small local orbits inside the Hill sphere.
      const nMoons = 2 + (Math.random() < 0.5 ? 1 : 0);
      for (let m = 0; m < nMoons; m++) {
        const rl = 0.5 + m * 0.32 + Math.random() * 0.1;          // local orbital radius
        const phi = Math.random() * Math.PI * 2;
        const off = new THREE.Vector3(Math.cos(phi) * rl, (Math.random() - 0.5) * 0.12, Math.sin(phi) * rl);
        const vLocal = Math.sqrt(PLANET_MASS / rl);                // local circular speed
        const vMoon = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi)).multiplyScalar(vLocal);
        addBody(
          "planet",
          pos.clone().add(off),
          vel.clone().add(vMoon),
          0.07,
          new THREE.Color("#b9c4d4"),
          0.0008, // small but non-zero → moons take part in the N-body too
          planet.id
        );
      }
      return;
    }

    const cfg =
      kind === "star"
        ? { radius: 0.30, color: new THREE.Color("#fff0c0"), mass: 0.035 }
        : { radius: 0.10, color: new THREE.Color("#cfe8ff"), mass: 0.0006 };
    addBody(kind, pos, vel, cfg.radius, cfg.color, cfg.mass, null);
  }

  function disruptStar(b: Body) {
    // Tidal stretching: spread debris along the radial direction with a range
    // of specific energies, forming an elongated stream.
    const radial = b.pos.clone().normalize();
    const c0 = new THREE.Color("#ffd28a");
    const c1 = new THREE.Color("#ff7a3c");
    for (let k = 0; k < 70; k++) {
      const u = (k / 69) * 2 - 1; // -1..1 along the stream
      const p = b.pos.clone().addScaledVector(radial, u * 0.4);
      const v = b.vel.clone()
        .addScaledVector(radial, u * 0.07) // energy spread → stretches the stream
        // vertical kick → debris arcs out of the disk plane, then rains back
        // down and is absorbed by the disk (instead of shooting straight through)
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.03));
      const c = c0.clone().lerp(c1, Math.abs(u));
      emit(p, v, c, 14);
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
        if (tmp.y * a.pos[k * 3 + 1]! < 0.0) {
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
      if (b.kind === "star" && r < TIDAL_RADIUS) {
        disruptStar(b);
        if (b.mesh) group.remove(b.mesh);
        continue; // star becomes a stream
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

export default function BlackHolePlaygroundScene({ quality, spin, activeKind, apiRef }: PlaygroundSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;
  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 6, 22] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad quality={quality} diskOn spin={spin} dopplerOn />
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
