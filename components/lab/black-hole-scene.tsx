"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  blackHoleVertexShader,
  blackHoleFragmentShader,
  QUALITY_PRESETS,
  type BlackHoleQuality,
} from "./black-hole/black-hole-shader";
import { BlackHoleGrid } from "./black-hole-grid";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type BlackHoleSceneProps = {
  quality: BlackHoleQuality;
  diskOn: boolean;
  dopplerOn: boolean;
  spin: number; // 0..1 — approximate frame dragging
  jetsOn: boolean; // relativistic jets along the spin axis
  gridOn?: boolean; // spacetime-fabric grid (Flamm's paraboloid)
};

// ---------------------------------------------------------------------------
// Fullscreen geodesic raymarch quad
// ---------------------------------------------------------------------------

export function BlackHoleQuad({ quality, diskOn, dopplerOn, spin, jetsOn }: BlackHoleSceneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const camBasis = useRef(new THREE.Matrix3());

  // Uniforms are created once; values are mutated each frame.
  const uniforms = useMemo(
    () => ({
      uCamPos: { value: new THREE.Vector3() },
      uCamBasis: { value: new THREE.Matrix3() },
      uViewProj: { value: new THREE.Matrix4() },
      uTanFov: { value: 0.5 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uSteps: { value: QUALITY_PRESETS[quality].steps },
      uDiskInner: { value: 3.0 }, // ISCO for a non-rotating (Schwarzschild) BH
      uDiskOuter: { value: 16.0 },
      uDiskOn: { value: diskOn ? 1 : 0 },
      uDoppler: { value: dopplerOn ? 1 : 0 },
      uSpin: { value: spin },
      uDiskTemp: { value: 10500 }, // emitted colour-temperature scale (Kelvin)
      uDiskBright: { value: 24.0 }, // bright, white-hot inner disk (ACES rolls highlights)
      uJets: { value: jetsOn ? 1 : 0 },
      uJetStr: { value: 0.7 },
      uExposure: { value: 1.15 },
    }),
    // Intentionally created once — toggle changes are applied in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ camera, size, clock }) => {
    // Mutate via the live material instance (not the memoised object) so the
    // React compiler immutability rule is satisfied.
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms as typeof uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uCamPos.value.copy(camera.position);
    camBasis.current.setFromMatrix4(camera.matrixWorld);
    u.uCamBasis.value.copy(camBasis.current);
    u.uViewProj.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    u.uAspect.value = size.width / Math.max(1, size.height);
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50;
    u.uTanFov.value = Math.tan((fov * Math.PI) / 360);
    // Live toggles / quality.
    u.uSteps.value = QUALITY_PRESETS[quality].steps;
    u.uDiskOn.value = diskOn ? 1 : 0;
    u.uDoppler.value = dopplerOn ? 1 : 0;
    u.uSpin.value = spin;
    u.uJets.value = jetsOn ? 1 : 0;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={blackHoleVertexShader}
        fragmentShader={blackHoleFragmentShader}
        uniforms={uniforms}
        glslVersion={THREE.GLSL3}
        depthTest
        depthWrite
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function BlackHoleScene({
  quality,
  diskOn,
  dopplerOn,
  spin,
  jetsOn,
  gridOn = false,
}: BlackHoleSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;

  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 2.2, 16] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad quality={quality} diskOn={diskOn} dopplerOn={dopplerOn} spin={spin} jetsOn={jetsOn} />
      <BlackHoleGrid visible={gridOn} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={4}
        maxDistance={55}
      />

      <EffectComposer>
        <Bloom
          intensity={1.3}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
