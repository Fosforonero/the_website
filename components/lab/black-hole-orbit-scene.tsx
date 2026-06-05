"use client";

import { useRef, useMemo, useEffect, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlackHoleQuad } from "./black-hole-scene";
import { QUALITY_PRESETS, type BlackHoleQuality } from "./black-hole/black-hole-shader";

// ---------------------------------------------------------------------------
// Single-body GR demo — EXACT Schwarzschild timelike geodesic of a test mass.
//
// Integrate the relativistic orbit equation in the azimuth φ (u = 1/r):
//     d²u/dφ² + u = M/L² + 3M·u²
// The extra 3M·u² term (absent in Newton) produces periastron precession; for
// specific angular momentum below L = 2√3·M there is no stable orbit and the
// particle plunges. Units: G = c = 1, r_s = 2M = 1 → M = 0.5, ISCO at r = 6M = 3.
//
// This is the rigorous single-body counterpart to the pseudo-Newtonian
// playground (which trades exactness for clean N-body interaction).
// ---------------------------------------------------------------------------

const M = 0.5;
const RS = 1.0;
const ISCO = 3.0;            // 6M
const R_PHOTON = 1.5;        // photon sphere
const TRAIL = 5000;

export type OrbitParams = { L: number; r0: number };
export type OrbitReadout = {
  r: number; E: number; L: number; precessionDeg: number;
  status: "orbiting" | "plunged";
};
export type OrbitHandle = { reset: (p: OrbitParams) => void };
export type OrbitSceneProps = {
  quality: BlackHoleQuality;
  diskOn: boolean;
  params: OrbitParams;
  apiRef: MutableRefObject<OrbitHandle | null>;
  readoutRef: MutableRefObject<OrbitReadout | null>;
};

function uAccel(u: number, L: number): number {
  return M / (L * L) + 3.0 * M * u * u - u; // d²u/dφ²
}
function specificEnergy(r0: number, L: number): number {
  return Math.sqrt(Math.max(1 - 2 * M / r0, 0) * (1 + (L * L) / (r0 * r0)));
}

// thin reference ring in the equatorial plane
function Ring({ r, color, opacity }: { r: number; color: string; opacity: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.02, r + 0.02, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function OrbitBody({ params, apiRef, readoutRef }: Omit<OrbitSceneProps, "quality" | "diskOn">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Trail line owns its buffers (head bright → tail faded via vertex colours).
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ln = new THREE.Line(geo, mat);
    ln.frustumCulled = false;
    return ln;
  }, []);

  const st = useRef({
    u: 1 / params.r0, du: 0, phi: 0, L: params.L,
    E: specificEnergy(params.r0, params.L),
    count: 0, plunged: false, lastPeri: 0, precDeg: 0,
  });

  function init(p: OrbitParams) {
    const s = st.current;
    s.u = 1 / p.r0; s.du = 0; s.phi = 0; s.L = p.L;
    s.E = specificEnergy(p.r0, p.L);
    s.count = 0; s.plunged = false; s.lastPeri = 0; s.precDeg = 0;
    lineObj.geometry.setDrawRange(0, 0);
  }

  useEffect(() => {
    apiRef.current = { reset: (p) => init(p) };
    return () => { apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    init(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useFrame((_s, rawDt) => {
    const s = st.current;
    if (!s.plunged) {
      const dphiTotal = Math.min(rawDt, 0.05) * 2.3;
      const nSub = 28;
      const dphi = dphiTotal / nSub;
      let prevDu = s.du;
      for (let i = 0; i < nSub; i++) {
        const a0 = uAccel(s.u, s.L);
        s.u = s.u + s.du * dphi + 0.5 * a0 * dphi * dphi;
        const a1 = uAccel(s.u, s.L);
        s.du = s.du + 0.5 * (a0 + a1) * dphi;
        s.phi += dphi;
        if (1 / s.u <= RS) { s.plunged = true; break; }
        if (prevDu > 0 && s.du <= 0) { // periapsis
          if (s.lastPeri > 0) s.precDeg = ((s.phi - s.lastPeri) - 2 * Math.PI) * (180 / Math.PI);
          s.lastPeri = s.phi;
        }
        prevDu = s.du;
      }
    }

    const r = 1 / s.u;
    const x = r * Math.cos(s.phi);
    const z = r * Math.sin(s.phi);
    meshRef.current?.position.set(x, 0, z);
    haloRef.current?.position.set(x, 0, z);

    if (!s.plunged) {
      const geo = lineObj.geometry;
      const pos = geo.getAttribute("position") as THREE.BufferAttribute;
      const col = geo.getAttribute("color") as THREE.BufferAttribute;
      const pa = pos.array as Float32Array;
      const ca = col.array as Float32Array;
      if (s.count >= TRAIL) { pa.copyWithin(0, 3); ca.copyWithin(0, 3); s.count = TRAIL - 1; }
      pa[s.count * 3] = x; pa[s.count * 3 + 1] = 0; pa[s.count * 3 + 2] = z;
      ca[s.count * 3] = 0.45; ca[s.count * 3 + 1] = 0.85; ca[s.count * 3 + 2] = 1.0;
      s.count++;
      // fade the tail (older points dimmer) for a comet-like trail
      const n = s.count;
      for (let k = 0; k < n; k++) {
        const f = k / n; // 0 oldest → 1 newest
        ca[k * 3] = 0.10 + 0.45 * f;
        ca[k * 3 + 1] = 0.30 + 0.65 * f;
        ca[k * 3 + 2] = 0.40 + 0.60 * f;
      }
      pos.needsUpdate = true; col.needsUpdate = true;
      geo.setDrawRange(0, s.count);
    }

    const ro = readoutRef.current;
    const status: "orbiting" | "plunged" = s.plunged ? "plunged" : "orbiting";
    const next = { r, E: s.E, L: s.L, precessionDeg: s.precDeg, status };
    if (ro) { ro.r = next.r; ro.E = next.E; ro.L = next.L; ro.precessionDeg = next.precessionDeg; ro.status = next.status; }
    else readoutRef.current = next;
  });

  return (
    <>
      {/* glowing test particle + soft halo */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.14, 20, 16]} />
        <meshBasicMaterial color="#dff6ff" />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.30, 16, 12]} />
        <meshBasicMaterial color="#7fd8ff" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <primitive object={lineObj} />
      <Ring r={ISCO} color="#ff7a3c" opacity={0.55} />
      <Ring r={R_PHOTON} color="#cfe6ff" opacity={0.35} />
    </>
  );
}

export default function BlackHoleOrbitScene({ quality, diskOn, params, apiRef, readoutRef }: OrbitSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;
  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 32, 10] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad quality={quality} diskOn={diskOn} spin={0} dopplerOn jetsOn={false} />
      <OrbitBody params={params} apiRef={apiRef} readoutRef={readoutRef} />
      <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08}
        rotateSpeed={0.5} zoomSpeed={0.8} minDistance={5} maxDistance={90} />
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.4} luminanceSmoothing={0.85} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

export { ISCO };
