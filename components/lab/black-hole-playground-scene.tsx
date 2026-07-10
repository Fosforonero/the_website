"use client";

import { useRef, useMemo, useEffect, useState, type MutableRefObject, type ElementRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

// Derived from the component itself (not imported from three-stdlib, which
// isn't a direct dependency of this package).
type OrbitControlsImpl = ElementRef<typeof OrbitControls>;
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlackHoleQuad } from "./black-hole-scene";
import { BlackHoleGrid } from "./black-hole-grid";
import { DitherEffect } from "./black-hole/dither-effect";
import { QUALITY_PRESETS, type BlackHoleQuality } from "./black-hole/black-hole-shader";
import { AccretionDiskParticles } from "./black-hole/accretion-disk-particles";
import type { WebGPUBgHandle } from "./black-hole-webgpu-background";
import {
  type BodyKind, type SimState, type Diagnostics,
  createSimState, resetSimState, advanceSimulation, getDiagnostics,
  spawnBodyAtClick, spawnPlanetarySystemPreset, spawnInfallingStellarSystemPreset,
  MAX_PARTICLES,
} from "./black-hole/playground-physics";

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
//
// The integrator, hierarchy and stream physics live in
// black-hole/playground-physics.ts (headlessly testable — see
// scripts/black-hole/audit-playground-dynamics.ts). This component owns only
// rendering: it holds a SimState, advances it once per frame, and mirrors the
// result into THREE meshes / buffer attributes.
// ---------------------------------------------------------------------------

export type { BodyKind };

export type PlaygroundHandle = {
  reset: () => void;
  system: () => void;
  infallingSystem: () => void;
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
  diagRef?: MutableRefObject<Diagnostics | null>; // ?bhDebug=1 overlay reads this
  showNames?: boolean;
  showTrails?: boolean;
  autoFrameRef?: MutableRefObject<number | null>; // target camera distance; null = no pending request
};

const KIND_LABEL: Record<BodyKind, string> = { planet: "Pianeta", star: "Stella", comet: "Cometa" };
// Bodies never shrink below this fraction of the viewport height on screen,
// regardless of zoom — otherwise a distant moon or a shrinking (disrupting)
// body can vanish to sub-pixel size well before it is actually gone.
const MIN_SCREEN_FRACTION = 0.012;

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

const DEFAULT_SEED = 1337;
const TRAIL_LEN = 90;

// ---------------------------------------------------------------------------
// Simulation — thin rendering wrapper over playground-physics.ts
// ---------------------------------------------------------------------------
function Simulation({
  apiRef,
  activeKind,
  gwOn,
  diagRef,
  showNames,
  showTrails,
  autoFrameRef,
}: {
  apiRef: MutableRefObject<PlaygroundHandle | null>;
  activeKind: BodyKind;
  gwOn: boolean;
  diagRef?: MutableRefObject<Diagnostics | null>;
  showNames?: boolean;
  showTrails?: boolean;
  autoFrameRef?: MutableRefObject<number | null>;
}) {
  const stateRef = useRef<SimState>(createSimState(DEFAULT_SEED));
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const meshMap = useRef<Map<number, THREE.Mesh>>(new Map());
  const haloMap = useRef<Map<number, THREE.Sprite>>(new Map());
  const trailMap = useRef<Map<number, THREE.Vector3[]>>(new Map());
  const trailLineMap = useRef<Map<number, THREE.Line>>(new Map());
  const { camera } = useThree();
  const [labels, setLabels] = useState<{ id: number; kind: BodyKind; pos: [number, number, number] }[]>([]);
  const labelThrottle = useRef(0);

  function meshMaterialFor(kind: BodyKind, color: THREE.Color): THREE.Material {
    return kind === "planet"
      ? new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0 })
      : new THREE.MeshBasicMaterial({ color });
  }

  // Unit-radius geometry: actual size is applied every frame via
  // mesh.scale.setScalar(body.visualRadius), so disruption shrink and merge
  // growth never compound on top of a baked-in geometry radius.
  const unitSphereGeo = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);

  // Soft round sprite reused for both debris particles and body halos.
  const glowTex = useMemo(() => {
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

  function requestAutoFrame(bodies: { pos: THREE.Vector3 }[]) {
    if (!autoFrameRef || bodies.length === 0) return;
    let maxR = 0;
    for (const b of bodies) maxR = Math.max(maxR, b.pos.length());
    autoFrameRef.current = Math.max(maxR * 1.7, 10); // margin so the outermost orbit isn't clipped at the frame edge
  }

  useEffect(() => {
    apiRef.current = {
      reset: () => {
        resetSimState(stateRef.current);
        for (const mesh of meshMap.current.values()) groupRef.current?.remove(mesh);
        meshMap.current.clear();
        for (const halo of haloMap.current.values()) groupRef.current?.remove(halo);
        haloMap.current.clear();
        trailMap.current.clear();
        for (const line of trailLineMap.current.values()) groupRef.current?.remove(line);
        trailLineMap.current.clear();
        setLabels([]);
      },
      system: () => { requestAutoFrame(spawnPlanetarySystemPreset(stateRef.current)); },
      infallingSystem: () => { requestAutoFrame(spawnInfallingStellarSystemPreset(stateRef.current)); },
    };
    return () => { apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state, rawDt) => {
    const group = groupRef.current;
    if (!group) return;
    const sim = stateRef.current;

    advanceSimulation(sim, rawDt, { gwOn });

    // ── Mesh diffing: create/remove meshes to match the current body set ──
    const liveIds = new Set(sim.bodies.map((b) => b.id));
    for (const [id, mesh] of meshMap.current) {
      if (!liveIds.has(id)) {
        group.remove(mesh);
        meshMap.current.delete(id);
        const halo = haloMap.current.get(id);
        if (halo) { group.remove(halo); haloMap.current.delete(id); }
        const trail = trailLineMap.current.get(id);
        if (trail) { group.remove(trail); trailLineMap.current.delete(id); }
        trailMap.current.delete(id);
      }
    }
    const camDist = camera.position.length() || 1;
    // Half-height of the view frustum at distance camDist, in world units —
    // used to convert MIN_SCREEN_FRACTION (a fraction of viewport height)
    // into a world-space minimum radius at the body's approximate depth.
    const persp = camera as THREE.PerspectiveCamera;
    const vFov = ((persp.fov ?? 50) * Math.PI) / 180;
    for (const b of sim.bodies) {
      let mesh = meshMap.current.get(b.id);
      if (!mesh) {
        mesh = new THREE.Mesh(unitSphereGeo, meshMaterialFor(b.kind, b.color));
        group.add(mesh);
        meshMap.current.set(b.id, mesh);
      }
      mesh.position.copy(b.pos);
      const depth = Math.max(camera.position.distanceTo(b.pos), 0.5);
      const minWorldRadius = Math.tan(vFov / 2) * depth * MIN_SCREEN_FRACTION;
      const scale = Math.max(b.visualRadius, minWorldRadius, 1e-4);
      mesh.scale.setScalar(scale);

      // Halo: a faint additive glow behind the body, sized relative to its
      // ON-SCREEN scale (so it stays proportionate even when the min-size
      // floor above kicks in for a tiny/distant/shrinking body).
      let halo = haloMap.current.get(b.id);
      if (!halo) {
        halo = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex, color: b.color, transparent: true, opacity: 0.45,
          depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        group.add(halo);
        haloMap.current.set(b.id, halo);
      }
      halo.position.copy(b.pos);
      halo.scale.setScalar(scale * 3.2);

      if (showTrails) {
        let trail = trailMap.current.get(b.id);
        if (!trail) { trail = []; trailMap.current.set(b.id, trail); }
        trail.push(b.pos.clone());
        if (trail.length > TRAIL_LEN) trail.shift();
        let line = trailLineMap.current.get(b.id);
        if (!line || line.geometry.attributes.position?.count !== trail.length) {
          if (line) group.remove(line);
          const geo = new THREE.BufferGeometry().setFromPoints(trail);
          line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: b.color, transparent: true, opacity: 0.35 }));
          group.add(line);
          trailLineMap.current.set(b.id, line);
        } else {
          line.geometry.setFromPoints(trail);
        }
      }
    }
    if (!showTrails && trailLineMap.current.size > 0) {
      for (const line of trailLineMap.current.values()) group.remove(line);
      trailLineMap.current.clear();
      trailMap.current.clear();
    }

    // ── Particle geometry (debris/tails) — mirrored straight from the pool ──
    const pts = pointsRef.current;
    const a = sim.particles;
    if (pts) {
      const geo = pts.geometry;
      const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
      const colAttr = geo.getAttribute("color") as THREE.BufferAttribute;
      for (let k = 0; k < MAX_PARTICLES; k++) {
        const alive = k < a.count && a.life[k]! > 0;
        if (alive) {
          posAttr.setXYZ(k, a.pos[k * 3]!, a.pos[k * 3 + 1]!, a.pos[k * 3 + 2]!);
          const f = Math.min(1, a.life[k]! / 3);
          colAttr.setXYZ(k, a.col[k * 3]! * f, a.col[k * 3 + 1]! * f, a.col[k * 3 + 2]! * f);
        } else {
          colAttr.setXYZ(k, 0, 0, 0);
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      geo.setDrawRange(0, a.count);
    }

    if (diagRef) diagRef.current = getDiagnostics(sim);

    // Name labels: throttled to 5/s — slow enough to skip a full 60fps React
    // re-render per body, fast enough that the label lag is imperceptible
    // against orbital motion.
    labelThrottle.current += rawDt;
    if (showNames && labelThrottle.current > 0.2) {
      labelThrottle.current = 0;
      setLabels(sim.bodies.map((b) => ({ id: b.id, kind: b.kind, pos: [b.pos.x, b.pos.y, b.pos.z] })));
    } else if (!showNames && labels.length > 0) {
      setLabels([]);
    }
  });

  // particle geometry buffers
  const [posBuf, colBuf] = useMemo(
    () => [new Float32Array(MAX_PARTICLES * 3), new Float32Array(MAX_PARTICLES * 3)],
    []
  );

  return (
    <>
      <pointLight position={[0, 0, 0]} color="#ffd2a0" intensity={18} distance={120} decay={1.5} />
      <ambientLight intensity={0.07} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          spawnBodyAtClick(stateRef.current, activeKind, e.point);
        }}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <group ref={groupRef}>
        {showNames && labels.map((l) => (
          <Html key={l.id} position={l.pos} occlude={false} style={{ pointerEvents: "none" }}>
            <span className="bh-body-label">{KIND_LABEL[l.kind]} {l.id}</span>
          </Html>
        ))}
      </group>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posBuf, 3]} />
          <bufferAttribute attach="attributes-color" args={[colBuf, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={glowTex}
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
// Auto-framing: after a preset spawns a system, Simulation writes the desired
// camera distance into autoFrameRef; this component eases the camera toward
// it (preserving its current azimuth/elevation) so the whole system lands in
// frame without a jump cut.
// ---------------------------------------------------------------------------
function AutoFramer({
  autoFrameRef,
  controlsRef,
}: {
  autoFrameRef?: MutableRefObject<number | null>;
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  useFrame((_state, dt) => {
    if (!autoFrameRef?.current) return;
    const target = autoFrameRef.current;
    const dist = camera.position.length() || 1;
    const diff = target - dist;
    if (Math.abs(diff) < target * 0.02) { autoFrameRef.current = null; return; }
    const next = dist + diff * Math.min(1, dt * 2.5);
    camera.position.multiplyScalar(next / dist);
    controlsRef.current?.update();
  });
  return null;
}

// ---------------------------------------------------------------------------
// Public scene
// ---------------------------------------------------------------------------

export default function BlackHolePlaygroundScene({ quality, spin, diskOn, dopplerOn, jetsOn, windOn, gridOn, gwOn, diskParticlesOn = true, activeKind, apiRef, scaleRef, webgpuMode, bgRef, ringdownStartRef, diagRef, showNames, showTrails, autoFrameRef }: PlaygroundSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;
  // Shared ringdown amplitude ref: updated by QNMHook each frame, read by BlackHoleQuad.
  const ringdownAmplRef = useRef(0);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
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
      <Simulation apiRef={apiRef} activeKind={activeKind} gwOn={gwOn} diagRef={diagRef} showNames={showNames} showTrails={showTrails} autoFrameRef={autoFrameRef} />
      <ScaleProbe scaleRef={scaleRef} />
      <AutoFramer autoFrameRef={autoFrameRef} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
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
