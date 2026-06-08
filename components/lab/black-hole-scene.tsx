"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  blackHoleVertexShader,
  blackHoleFragmentShader,
  QUALITY_PRESETS,
  detectGpu,
  effectiveProfile,
  type BlackHoleQuality,
  type QualityChoice,
  type GpuInfo,
  type RenderProfile,
} from "./black-hole/black-hole-shader";
import { BlackHoleGrid } from "./black-hole-grid";
import { DitherEffect } from "./black-hole/dither-effect";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type BlackHoleSceneProps = {
  quality: QualityChoice;
  diskOn: boolean;
  dopplerOn: boolean;
  spin: number; // 0..1 — approximate frame dragging
  jetsOn: boolean; // relativistic jets along the spin axis
  gridOn?: boolean; // spacetime-fabric grid (Flamm's paraboloid)
  diskTemp?: number;   // disk colour-temperature scale (K)
  diskBright?: number; // accretion-rate / brightness scale
  diskOuter?: number;  // disk outer radius (r_s)
  eht?: boolean;       // "EHT mode": render at very low resolution (beam-limited look)
  starless?: boolean;  // "Real sky" toggle — sample the NASA photo (procedural fallback)
  pureBlack?: boolean; // "Pure black" preset: sky off, saturated-orange disk (NASA look)
  skyUrl?: string;     // equirectangular real-sky photo (default: NASA Deep Star Maps 8k)
  volDisk?: boolean;   // volumetric 3D disk (radiative transfer through an analytic plasma)
  onGpu?: (g: GpuInfo) => void; // report the detected GPU (for the UI to show)
  onFps?: (fps: number) => void; // report the EMA frame rate once per second
};

// Default real-sky photo: NASA/Goddard SVS "Deep Star Maps 2020" (public domain),
// an all-sky equirectangular map built from real star catalogs (Gaia/Tycho).
const DEFAULT_SKY_URL = "/sky/starmap_8k.jpg";

// NASA Deep Star Maps variants by pixel width. We load the LARGEST that fits the
// GPU's maxTextureSize, so the real photo also shows on phones (whose GPUs are
// often capped at 4096) instead of being rejected and falling back to procedural.
const NASA_VARIANTS: { w: number; url: string }[] = [
  { w: 16384, url: "/sky/starmap_16k.jpg" },
  { w: 8192, url: "/sky/starmap_8k.jpg" },
  { w: 4096, url: "/sky/starmap_4k.jpg" },
  { w: 2048, url: "/sky/starmap_2k.jpg" },
];
const SMALLEST_NASA_URL = "/sky/starmap_2k.jpg";
function fitNasaUrl(requested: string, maxTex: number): string {
  const i = NASA_VARIANTS.findIndex((v) => v.url === requested);
  if (i < 0) return requested; // not a NASA starmap (e.g. ESO): leave as-is
  const fit = NASA_VARIANTS.find((v, k) => k >= i && v.w <= maxTex);
  return fit ? fit.url : SMALLEST_NASA_URL;
}

// ---------------------------------------------------------------------------
// Fullscreen geodesic raymarch quad
// ---------------------------------------------------------------------------

export function BlackHoleQuad({
  quality, diskOn, dopplerOn, spin, jetsOn,
  diskTemp = 10500, diskBright = 24, diskOuter = 16, starless = false, pureBlack = false,
  skyUrl = DEFAULT_SKY_URL, volDisk = false, profile, isMobile = false, eht = false, onFps,
}: BlackHoleSceneProps & { profile?: RenderProfile; isMobile?: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const camBasis = useRef(new THREE.Matrix3());
  const skyReady = useRef(false);
  const glCaps = useThree((s) => s.gl.capabilities);
  const setDpr = useThree((s) => s.setDpr);
  // FPS governor (Auto mode). DESKTOP: scale the step count (resolution is fixed).
  // MOBILE: the bottleneck is fill-rate, and the photon ring needs its steps, so
  // we keep steps fixed and scale the RESOLUTION (DPR) instead — slow phones get
  // fluid without a broken ring.
  const fpsEma = useRef(60);
  const sinceCheck = useRef(0);
  // Desktop starts at 85% steps so the photon ring (~177 steps/orbit at r=3) is
  // visible from frame 1; mobile starts at 70% resolution (step count stays fixed).
  // Both scale toward 100% as the FPS governor confirms the GPU can handle it.
  const stepScale = useRef(isMobile ? 0.7 : 0.85);
  const resScale  = useRef(isMobile ? 0.7 : 1.0);
  // Effective render profile: GPU-tuned in Auto (passed from the parent), else the
  // chosen manual preset. In Auto the volumetric disk follows the profile.
  const prof: RenderProfile = profile ?? {
    ...QUALITY_PRESETS[quality === "auto" ? "medium" : quality],
    vol: false,
  };
  const effVol = quality === "auto" ? prof.vol : volDisk;
  // 1×1 black placeholder so the sampler is always bound (some drivers warn on an
  // unbound sampler even when the branch using it is disabled).
  const placeholder = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
    t.needsUpdate = true;
    return t;
  }, []);

  // Load the real-sky photo asynchronously. On success we bind it; on error we
  // simply leave uSkyOn at 0, so the procedural sky remains as a graceful fallback.
  useEffect(() => {
    skyReady.current = false;
    let cancelled = false;
    // Pick the largest NASA variant the GPU can actually upload (phones cap low).
    const url = fitNasaUrl(skyUrl, glCaps.maxTextureSize);
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        if (cancelled) { tex.dispose(); return; }
        // Guard against textures larger than the GPU can upload (the 16k photo is
        // 16384px — at/above the cap on some GPUs): fall back to procedural.
        const w = (tex.image as { width?: number } | undefined)?.width ?? 0;
        if (w > glCaps.maxTextureSize) { tex.dispose(); skyReady.current = false; return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;       // longitude wraps seamlessly
        tex.wrapT = THREE.ClampToEdgeWrapping;  // poles
        // NO mipmaps: near the hole the lensed ray directions diverge wildly, so the
        // GPU's auto-LOD (from screen-space uv derivatives, made worse by the
        // equirectangular seam) picks coarse mips in concentric rings — the grey
        // "wireframe sphere" artifact. LinearFilter + RepeatWrapping samples the
        // full-res texture seamlessly and lets the real lensing show.
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        const mat = matRef.current;
        if (mat) (mat.uniforms as { uSkyTex: { value: THREE.Texture } }).uSkyTex.value = tex;
        skyReady.current = true;
      },
      undefined,
      () => { skyReady.current = false; },
    );
    return () => { cancelled = true; };
  }, [skyUrl, glCaps]);

  // Uniforms are created once; values are mutated each frame.
  const uniforms = useMemo(
    () => ({
      uCamPos: { value: new THREE.Vector3() },
      uCamBasis: { value: new THREE.Matrix3() },
      uViewProj: { value: new THREE.Matrix4() },
      uTanFov: { value: 0.5 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uSteps: { value: prof.steps },
      uDiskInner: { value: 3.0 }, // ISCO for a non-rotating (Schwarzschild) BH
      uDiskOuter: { value: diskOuter },
      uDiskOn: { value: diskOn ? 1 : 0 },
      uDoppler: { value: dopplerOn ? 1 : 0 },
      uSpin: { value: spin },
      uDiskTemp: { value: diskTemp }, // emitted colour-temperature scale (Kelvin)
      uDiskBright: { value: diskBright }, // bright, white-hot inner disk (ACES rolls highlights)
      uJets: { value: jetsOn ? 1 : 0 },
      uJetStr: { value: 0.7 },
      uExposure: { value: 1.15 },
      uHighOrder: { value: prof.rk4 ? 1 : 0 },
      uUltra: { value: prof.tao ? 1 : 0 },
      uStyle: { value: starless ? 1 : 0 },
      uPureBlack: { value: pureBlack ? 1 : 0 },
      uSkyTex: { value: placeholder },
      uSkyOn: { value: 0 },
      uSkyBright: { value: 1.7 },
      uVolDisk: { value: volDisk ? 1 : 0 },
      uVolThick: { value: 0.03 },
      uVolOpacity: { value: 0.9 },
    }),
    // Intentionally created once — toggle changes are applied in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ camera, size, clock }, delta) => {
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
    // FPS EMA runs for every quality level so the counter stays live.
    // The governor (step/resolution scaling) only activates in Auto mode.
    const fpsSample = 1.0 / Math.max(delta, 1e-3);
    fpsEma.current = fpsEma.current * 0.92 + fpsSample * 0.08;
    sinceCheck.current += delta;
    const ticked = sinceCheck.current > 1.0;
    if (ticked) {
      sinceCheck.current = 0;
      onFps?.(Math.round(fpsEma.current));
    }
    if (quality === "auto" && !eht) {
      if (ticked) {
        if (isMobile) {
          const before = resScale.current;
          if (fpsEma.current < 40 && resScale.current > 0.55) resScale.current = Math.max(0.55, resScale.current - 0.12);
          else if (fpsEma.current > 56 && resScale.current < 1.0) resScale.current = Math.min(1.0, resScale.current + 0.1);
          if (resScale.current !== before) {
            const dprMax = (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1;
            setDpr(Math.min(dprMax, prof.dprCap * resScale.current));
          }
        } else {
          // Floor: keep enough steps for the photon ring (~200 min: 40 approach
          // + 133 half-orbit at r=3 + 40 departure). Below this the ring vanishes.
          const minScale = Math.max(0.5, 200 / prof.steps);
          if (fpsEma.current < 38 && stepScale.current > minScale) stepScale.current = Math.max(minScale, stepScale.current - 0.12);
          else if (fpsEma.current > 56 && stepScale.current < 1.0) stepScale.current = Math.min(1.0, stepScale.current + 0.08);
        }
      }
    } else if (quality !== "auto") {
      stepScale.current = 1.0;
    }
    const preset = prof;
    // Mobile keeps full steps (ring); desktop scales steps with the governor.
    u.uSteps.value = isMobile ? preset.steps : Math.max(60, Math.round(preset.steps * stepScale.current));
    u.uHighOrder.value = preset.rk4 ? 1 : 0;
    u.uUltra.value = preset.tao ? 1 : 0;
    u.uStyle.value = starless ? 1 : 0;
    u.uPureBlack.value = pureBlack ? 1 : 0;
    // Real photo when the toggle is on AND the texture has loaded; otherwise the
    // procedural starless sky (uStyle) shows as the fallback.
    u.uSkyOn.value = starless && skyReady.current ? 1 : 0;
    u.uVolDisk.value = effVol ? 1 : 0;
    u.uExposure.value = starless ? 1.12 : 1.15; // keep brightness ~constant so the toggle is instant, not a fade
    u.uDiskOn.value = diskOn ? 1 : 0;
    u.uDoppler.value = dopplerOn ? 1 : 0;
    u.uSpin.value = spin;
    u.uJets.value = jetsOn ? 1 : 0;
    u.uDiskTemp.value = diskTemp;
    // Without Doppler every orbit position emits at full unbeamed T⁴, saturating
    // the tonemapper. Scale to ~38% so the disk shows colour gradient and texture
    // instead of clipping to white. Doppler ON is unchanged.
    u.uDiskBright.value = diskBright * (dopplerOn ? 1.0 : 0.38);
    u.uDiskOuter.value = diskOuter;
  });

  // "Ultra" compiles a SEPARATE shader variant (#define BH_ULTRA) that contains
  // the Yoshida/Tao integrator. We toggle the define + recompile only when the
  // quality crosses into/out of "ultra", so the default shader never carries it.
  useEffect(() => {
    const mat = matRef.current;
    if (!mat) return;
    const want = prof.tao;
    const defs = (mat.defines ?? {}) as Record<string, string>;
    const has = defs.BH_ULTRA !== undefined;
    if (want !== has) {
      if (want) defs.BH_ULTRA = "";
      else delete defs.BH_ULTRA;
      mat.defines = defs;
      mat.needsUpdate = true; // force GLSL recompile of the correct variant
    }
  }, [prof.tao]);

  // The volumetric disk is likewise compiled into a SEPARATE variant
  // (#define BH_VOLDISK), so the default/mobile shader never carries the heavier
  // per-step radiative-transfer loop.
  useEffect(() => {
    const mat = matRef.current;
    if (!mat) return;
    const defs = (mat.defines ?? {}) as Record<string, string>;
    const has = defs.BH_VOLDISK !== undefined;
    if (effVol !== has) {
      if (effVol) defs.BH_VOLDISK = "";
      else delete defs.BH_VOLDISK;
      mat.defines = defs;
      mat.needsUpdate = true;
    }
  }, [effVol]);

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
  diskTemp,
  diskBright,
  diskOuter,
  eht = false,
  starless = false,
  pureBlack = false,
  skyUrl,
  volDisk = false,
  onGpu,
  onFps,
}: BlackHoleSceneProps) {
  // Detect the GPU once (before the Canvas mounts) so "Auto" can pick the initial
  // resolution/integrator/volumetric profile; the FPS governor refines it after.
  const gpu = useMemo(() => detectGpu(), []);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true,
    [],
  );
  const profile = effectiveProfile(quality, gpu, isMobile);
  useEffect(() => { onGpu?.(gpu); }, [gpu, onGpu]);
  const dprCap = profile.dprCap;

  return (
    <Canvas
      camera={{ fov: 50, near: 0.01, far: 5000, position: [0, 2.2, 16] }}
      dpr={eht ? [0.16, 0.16] : [1, dprCap]}
      gl={{ antialias: false, alpha: false, preserveDrawingBuffer: true }}
      style={{ background: "#000003" }}
    >
      <BlackHoleQuad
        quality={quality} profile={profile} isMobile={isMobile} eht={eht} diskOn={diskOn} dopplerOn={dopplerOn} spin={spin} jetsOn={jetsOn}
        diskTemp={diskTemp} diskBright={diskBright} diskOuter={diskOuter} starless={starless} pureBlack={pureBlack} skyUrl={skyUrl} volDisk={volDisk}
        onFps={onFps}
      />
      <BlackHoleGrid visible={gridOn} spin={spin} />

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
        <Bloom
          intensity={1.35}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.82}
          mipmapBlur
        />
        <DitherEffect />
      </EffectComposer>
    </Canvas>
  );
}
