"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BH_WGSL, UNIFORM_F32, UNIFORM_BYTES, U } from "./black-hole/black-hole-wgsl";

type Locale = "it" | "en";

const COPY = {
  it: {
    title: "Buco Nero · WebGPU",
    spin: "Spin a",
    disk: "Disco",
    doppler: "Doppler",
    exposure: "Esposizione",
    back: "← Lab",
    gl: "Versione WebGL",
    about: "Equazioni",
    lang: "EN",
    noSupport: "Il tuo browser non supporta WebGPU.",
    noSupportSub: "Prova Chrome 113+ o Edge 113+ su desktop.",
    noSupportLink: "Usa la versione WebGL →",
    loading: "Inizializzazione WebGPU…",
    badge: "WebGPU",
    badgeTip: "Renderer WebGPU nativo — geodetiche di Kerr esatte, stesso motore fisico della versione WebGL ma pipeline GPU moderna.",
    hint: "Trascina per orbitare · Scroll per zoom",
  },
  en: {
    title: "Black Hole · WebGPU",
    spin: "Spin a",
    disk: "Disk",
    doppler: "Doppler",
    exposure: "Exposure",
    back: "← Lab",
    gl: "WebGL version",
    about: "Equations",
    lang: "IT",
    noSupport: "Your browser does not support WebGPU.",
    noSupportSub: "Try Chrome 113+ or Edge 113+ on desktop.",
    noSupportLink: "Use the WebGL version →",
    loading: "Initialising WebGPU…",
    badge: "WebGPU",
    badgeTip: "Native WebGPU renderer — exact Kerr geodesics, same physics engine as the WebGL version but modern GPU pipeline.",
    hint: "Drag to orbit · Scroll to zoom",
  },
} as const;

// ---------------------------------------------------------------------------
// Math helpers (no import to keep this file self-contained)
// ---------------------------------------------------------------------------
function dot3(a: [number, number, number], b: [number, number, number]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross3(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function norm3(v: [number, number, number]): [number, number, number] {
  const len = Math.sqrt(dot3(v, v)) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

// Camera from spherical orbit angles
function orbitCamera(az: number, el: number, dist: number) {
  const cosEl = Math.cos(el), sinEl = Math.sin(el);
  const cosAz = Math.cos(az), sinAz = Math.sin(az);
  const px = cosEl * sinAz * dist;
  const py = sinEl * dist;
  const pz = cosEl * cosAz * dist;
  const camPos: [number, number, number] = [px, py, pz];
  const fwd = norm3([-px, -py, -pz]);
  const worldUp: [number, number, number] = [0, 1, 0];
  const right = norm3(cross3(fwd, worldUp));
  const up = cross3(right, fwd);
  const backward = norm3([px, py, pz]);
  return { camPos, right, up: up as [number, number, number], backward };
}

// Fill the Float32Array that maps to the WGSL Uniforms struct
function writeUniforms(
  buf: Float32Array,
  opts: {
    w: number; h: number; time: number;
    spin: number; diskOn: boolean; diskBright: number;
    diskTemp: number; diskOuter: number; dopplerOn: boolean;
    exposure: number; steps: number;
    az: number; el: number; dist: number;
  },
) {
  const { camPos, right, up, backward } = orbitCamera(opts.az, opts.el, opts.dist);
  const tanFov = Math.tan((45 * Math.PI) / 360); // 45° FOV
  const aspect = opts.w / opts.h;

  buf[U.CAM_PX] = camPos[0]; buf[U.CAM_PY] = camPos[1]; buf[U.CAM_PZ] = camPos[2];
  buf[U.CAM_RX] = right[0];  buf[U.CAM_RY] = right[1];  buf[U.CAM_RZ] = right[2];
  buf[U.CAM_UX] = up[0];     buf[U.CAM_UY] = up[1];     buf[U.CAM_UZ] = up[2];
  buf[U.CAM_BX] = backward[0]; buf[U.CAM_BY] = backward[1]; buf[U.CAM_BZ] = backward[2];
  buf[U.RES_X]      = opts.w;
  buf[U.RES_Y]      = opts.h;
  buf[U.TAN_FOV]    = tanFov;
  buf[U.ASPECT]     = aspect;
  buf[U.TIME]       = opts.time;
  buf[U.SPIN]       = opts.spin;
  buf[U.DISK_ON]    = opts.diskOn ? 1 : 0;
  buf[U.DISK_BRIGHT] = opts.diskBright;
  buf[U.DISK_TEMP]  = opts.diskTemp;
  buf[U.DISK_OUTER] = opts.diskOuter;
  buf[U.DOPPLER_ON] = opts.dopplerOn ? 1 : 0;
  buf[U.EXPOSURE]   = opts.exposure;
  buf[U.STEPS]      = opts.steps;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface GPUState {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  uniformBuf: GPUBuffer;
  uniformData: Float32Array;
}

export function BlackHoleWebGPUView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gpuRef = useRef<GPUState | null>(null);
  const rafRef = useRef(0);

  // Controlled values
  const [spin, setSpin] = useState(0.0);
  const [diskOn, setDiskOn] = useState(true);
  const [dopplerOn, setDopplerOn] = useState(true);
  const [exposure, setExposure] = useState(1.2);

  // Support state: null=loading, true=ok, false=not supported
  const [supported, setSupported] = useState<boolean | null>(null);

  // Orbit via refs (no re-render on mouse move)
  const azRef = useRef(0.3);
  const elRef = useRef(0.35);
  const distRef = useRef(20.0);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // Latest control values accessible from the RAF closure
  const ctrlRef = useRef({ spin, diskOn, dopplerOn, exposure });
  useEffect(() => { ctrlRef.current = { spin, diskOn, dopplerOn, exposure }; },
    [spin, diskOn, dopplerOn, exposure]);

  // WebGPU init
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const nav = navigator as Navigator & { gpu?: GPU };
    if (!nav.gpu) { setSupported(false); return; }

    let destroyed = false;

    async function init() {
      const adapter = await nav.gpu!.requestAdapter({ powerPreference: "high-performance" });
      if (!adapter || destroyed) { if (!adapter) setSupported(false); return; }

      let device: GPUDevice;
      try {
        device = await adapter.requestDevice();
      } catch {
        setSupported(false);
        return;
      }
      if (destroyed) { device.destroy(); return; }

      const canvas = canvasRef.current;
      if (!canvas) { device.destroy(); return; }

      const context = canvas.getContext("webgpu");
      if (!context) { setSupported(false); device.destroy(); return; }

      const format = nav.gpu!.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "opaque" });

      const uniformBuf = device.createBuffer({
        size: UNIFORM_BYTES,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const shaderModule = device.createShaderModule({ code: BH_WGSL });
      const pipeline = await device.createRenderPipelineAsync({
        layout: "auto",
        vertex: { module: shaderModule, entryPoint: "vs" },
        fragment: { module: shaderModule, entryPoint: "fs", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuf } }],
      });

      const uniformData = new Float32Array(UNIFORM_F32);
      gpuRef.current = { device, context, pipeline, bindGroup, uniformBuf, uniformData };
      setSupported(true);

      // Start render loop
      let t0 = performance.now();
      function frame() {
        if (destroyed || !gpuRef.current) return;
        const { device, context, pipeline, bindGroup, uniformBuf, uniformData } = gpuRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const time = (performance.now() - t0) / 1000;
        const ctrl = ctrlRef.current;

        writeUniforms(uniformData, {
          w: canvas.width, h: canvas.height,
          time,
          spin: ctrl.spin,
          diskOn: ctrl.diskOn,
          diskBright: 1.6,
          diskTemp: 6400,
          diskOuter: 12,
          dopplerOn: ctrl.dopplerOn,
          exposure: ctrl.exposure,
          steps: 260,
          az: azRef.current,
          el: elRef.current,
          dist: distRef.current,
        });
        device.queue.writeBuffer(uniformBuf, 0, uniformData);

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);

        rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    void init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      gpuRef.current?.device.destroy();
      gpuRef.current = null;
    };
  }, []); // run once

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Orbit controls — mouse
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    azRef.current -= dx * 0.008;
    elRef.current = Math.max(-1.3, Math.min(1.3, elRef.current + dy * 0.008));
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    distRef.current = Math.max(6, Math.min(50, distRef.current + e.deltaY * 0.02));
  }, []);

  // Touch controls
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t0 = e.touches[0];
    if (t0) touchRef.current = { x: t0.clientX, y: t0.clientY };
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t0 = e.touches[0];
    if (!t0) return;
    const dx = t0.clientX - touchRef.current.x;
    const dy = t0.clientY - touchRef.current.y;
    touchRef.current = { x: t0.clientX, y: t0.clientY };
    azRef.current -= dx * 0.008;
    elRef.current = Math.max(-1.3, Math.min(1.3, elRef.current + dy * 0.008));
  }, []);
  const onTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  const glHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";
  const aboutHref = locale === "it" ? "/lab/buco-nero/about" : "/en/lab/black-hole/about";
  const langHref = locale === "it" ? "/en/lab/black-hole/webgpu" : "/lab/buco-nero/webgpu";

  return (
    <div className="bh-root">
      <div className="bh-toolbar">
        <span className="bh-toolbar__title">{t.title}</span>
        <span
          className="bh-control bh-control--badge"
          title={t.badgeTip}
          style={{ cursor: "default", background: "rgba(99,179,237,.15)", color: "#63b3ed", border: "1px solid rgba(99,179,237,.35)" }}
        >
          {t.badge}
        </span>
        <div className="bh-toolbar__sep" />

        <label className="bh-control">
          <span>{t.spin}</span>
          <input
            type="range" min={0} max={0.998} step={0.001} value={spin}
            onChange={(e) => setSpin(parseFloat(e.target.value))}
            style={{ width: 80 }}
          />
          <span style={{ width: 34, textAlign: "right" }}>{spin.toFixed(3)}</span>
        </label>

        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.exposure}</span>
          <input
            type="range" min={0.2} max={4.0} step={0.05} value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
            style={{ width: 72 }}
          />
          <span style={{ width: 30, textAlign: "right" }}>{exposure.toFixed(2)}</span>
        </label>

        <button
          className={`bh-control${diskOn ? " bh-control--active" : ""}`}
          onClick={() => setDiskOn((v) => !v)}
        >
          {t.disk}
        </button>
        <button
          className={`bh-control bh-toolbar__hide-sm${dopplerOn ? " bh-control--active" : ""}`}
          onClick={() => setDopplerOn((v) => !v)}
        >
          {t.doppler}
        </button>

        <div className="bh-toolbar__sep" />
        <Link href={glHref} className="bh-control bh-toolbar__hide-sm">{t.gl}</Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link
          href={langHref}
          hrefLang={locale === "it" ? "en" : "it"}
          className="bh-control"
        >
          {t.lang}
        </Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap">
        {supported === false && (
          <div className="bh-loading" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", justifyContent: "center", height: "100%" }}>
            <span>{t.noSupport}</span>
            <span style={{ opacity: 0.6, fontSize: "0.9em" }}>{t.noSupportSub}</span>
            <Link href={glHref} className="bh-control" style={{ marginTop: 8 }}>{t.noSupportLink}</Link>
          </div>
        )}
        {supported === null && (
          <div className="bh-loading">{t.loading}</div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%", height: "100%",
            display: supported === false ? "none" : "block",
            cursor: "grab",
            touchAction: "none",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        {supported === true && (
          <p className="bh-hint bh-hint--hide-sm">{t.hint}</p>
        )}
      </div>
    </div>
  );
}
