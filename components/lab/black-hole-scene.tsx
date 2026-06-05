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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type BlackHoleSceneProps = {
  quality: BlackHoleQuality;
  diskOn: boolean;
  dopplerOn: boolean;
};

// ---------------------------------------------------------------------------
// Fullscreen geodesic raymarch quad
// ---------------------------------------------------------------------------

function BlackHoleQuad({ quality, diskOn, dopplerOn }: BlackHoleSceneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const camBasis = useRef(new THREE.Matrix3());

  // Uniforms are created once; values are mutated each frame.
  const uniforms = useMemo(
    () => ({
      uCamPos: { value: new THREE.Vector3() },
      uCamBasis: { value: new THREE.Matrix3() },
      uTanFov: { value: 0.5 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uSteps: { value: QUALITY_PRESETS[quality].steps },
      uDiskInner: { value: 3.0 }, // ISCO for a non-rotating (Schwarzschild) BH
      uDiskOuter: { value: 16.0 },
      uDiskOn: { value: diskOn ? 1 : 0 },
      uDoppler: { value: dopplerOn ? 1 : 0 },
      uDiskTemp: { value: 9500 }, // emitted colour-temperature scale (Kelvin)
      uDiskBright: { value: 4.0 },
      uExposure: { value: 0.9 },
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
    u.uAspect.value = size.width / Math.max(1, size.height);
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 50;
    u.uTanFov.value = Math.tan((fov * Math.PI) / 360);
    // Live toggles / quality.
    u.uSteps.value = QUALITY_PRESETS[quality].steps;
    u.uDiskOn.value = diskOn ? 1 : 0;
    u.uDoppler.value = dopplerOn ? 1 : 0;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={blackHoleVertexShader}
        fragmentShader={blackHoleFragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
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
}: BlackHoleSceneProps) {
  const dprCap = QUALITY_PRESETS[quality].dprCap;

  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 2.2, 16] }}
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad quality={quality} diskOn={diskOn} dopplerOn={dopplerOn} />

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
          intensity={0.6}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
