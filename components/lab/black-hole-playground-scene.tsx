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
const MAX_PARTICLES = 2400;

type Body = {
  id: number;
  kind: BodyKind;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  color: THREE.Color;
  mesh: THREE.Mesh | null;
};

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

  // Spawn a body at a user-chosen position (raycast point on the disk plane),
  // with a tangential prograde velocity tuned for an eccentric infalling orbit.
  function spawnBodyAt(kind: BodyKind, point: THREE.Vector3) {
    const r0 = Math.hypot(point.x, point.z);
    if (r0 < 2.5) return; // too close to the horizon to place
    const pos = new THREE.Vector3(point.x, point.y, point.z);
    const vc = Math.sqrt(GM / r0);
    const factor = 0.55; // < circular → eccentric, dives toward the hole
    const radial = new THREE.Vector3(point.x, 0, point.z).normalize();
    const tang = new THREE.Vector3(-radial.z, 0, radial.x).multiplyScalar(vc * factor);
    const vel = tang;

    const cfg =
      kind === "star"
        ? { radius: 0.30, color: new THREE.Color("#fff0c0") }
        : kind === "comet"
        ? { radius: 0.10, color: new THREE.Color("#cfe8ff") }
        : { radius: 0.20, color: new THREE.Color("#6fa8d8") };

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(cfg.radius, 16, 12),
      new THREE.MeshBasicMaterial({ color: cfg.color })
    );
    mesh.position.copy(pos);
    groupRef.current?.add(mesh);

    bodies.current.push({
      id: nextId.current++,
      kind,
      pos,
      vel,
      radius: cfg.radius,
      color: cfg.color,
      mesh,
    });
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
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02));
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

    // Speed up simulated time, then sub-step for integration stability.
    const total = Math.min(rawDt, 0.05) * 20.0;
    const nSub = Math.max(1, Math.ceil(total / 0.025));
    const h = total / nSub;
    const a = parts.current;

    for (let s = 0; s < nSub; s++) {
      for (const b of bodies.current) {
        pwAccel(b.pos, tmp);
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
