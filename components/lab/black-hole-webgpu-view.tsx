"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BH_WGSL, UNIFORM_F32, UNIFORM_BYTES, U } from "./black-hole/black-hole-wgsl";

type Locale = "it" | "en";
type SkySource = "nasa8k" | "nasa16k";

const SKY_URLS: Record<SkySource, string> = {
  nasa8k:  "/sky/starmap_8k.jpg",
  nasa16k: "/sky/starmap_16k.jpg",
};

const COPY = {
  it: {
    title: "Buco Nero · WebGPU",
    spin: "Spin a", disk: "Disco", doppler: "Doppler", exposure: "Esposizione",
    quality: "Steps", jets: "Getti", volDisk: "Vol disk", starless: "Starless",
    pureBlack: "Puro nero", sky: "Cielo reale", skySrc: "Sorgente",
    controls: "Controlli",
    back: "← Lab", gl: "WebGL", about: "Equazioni", lang: "EN",
    noSupport: "Il tuo browser non supporta WebGPU.",
    noSupportSub: "Prova Chrome 113+ o Edge 113+ su desktop.",
    noSupportLink: "Usa la versione WebGL →",
    shaderErr: "Errore di compilazione shader WebGPU.",
    shaderErrSub: "Ricarica la pagina (⌘⇧R). Se il problema persiste, apri la console.",
    shaderErrLink: "Usa la versione WebGL →",
    loading: "Inizializzazione WebGPU…",
    badge: "WebGPU",
    hint: "Trascina per orbitare · Scroll per zoom",
    hintTouch: "Trascina per orbitare · Pizzica per zoom",
  },
  en: {
    title: "Black Hole · WebGPU",
    spin: "Spin a", disk: "Disk", doppler: "Doppler", exposure: "Exposure",
    quality: "Steps", jets: "Jets", volDisk: "Vol disk", starless: "Starless",
    pureBlack: "Pure black", sky: "Real sky", skySrc: "Source",
    controls: "Controls",
    back: "← Lab", gl: "WebGL", about: "Equations", lang: "IT",
    noSupport: "Your browser does not support WebGPU.",
    noSupportSub: "Try Chrome 113+ or Edge 113+ on desktop.",
    noSupportLink: "Use the WebGL version →",
    loading: "Initialising WebGPU…",
    badge: "WebGPU",
    hint: "Drag to orbit · Scroll to zoom",
    hintTouch: "Drag to orbit · Pinch to zoom",
  },
} as const;

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
function dot3(a: [number,number,number], b: [number,number,number]) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
function cross3(a: [number,number,number], b: [number,number,number]): [number,number,number] {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function norm3(v: [number,number,number]): [number,number,number] {
  const len = Math.sqrt(dot3(v,v)) || 1;
  return [v[0]/len, v[1]/len, v[2]/len];
}
function orbitCamera(az: number, el: number, dist: number) {
  const cosEl=Math.cos(el), sinEl=Math.sin(el), cosAz=Math.cos(az), sinAz=Math.sin(az);
  const camPos: [number,number,number] = [cosEl*sinAz*dist, sinEl*dist, cosEl*cosAz*dist];
  const fwd  = norm3([-camPos[0],-camPos[1],-camPos[2]]);
  const right= norm3(cross3(fwd,[0,1,0]));
  const up   = cross3(right,fwd) as [number,number,number];
  const back = norm3([camPos[0],camPos[1],camPos[2]]);
  return { camPos, right, up, backward: back };
}

function writeUniforms(
  buf: Float32Array,
  opts: {
    w: number; h: number; time: number;
    spin: number; diskOn: boolean; diskBright: number;
    diskTemp: number; diskOuter: number; dopplerOn: boolean;
    exposure: number; steps: number;
    style: number; pureBlack: boolean; jets: boolean; jetStr: number;
    volDisk: boolean; volThick: number; volOpacity: number;
    skyOn: boolean; skyBright: number;
    az: number; el: number; dist: number;
  },
) {
  const { camPos, right, up, backward } = orbitCamera(opts.az, opts.el, opts.dist);
  const tanFov = Math.tan((45 * Math.PI) / 360);
  const aspect = opts.w / opts.h;

  buf[U.CAM_PX]=camPos[0]; buf[U.CAM_PY]=camPos[1]; buf[U.CAM_PZ]=camPos[2];
  buf[U.CAM_RX]=right[0];  buf[U.CAM_RY]=right[1];  buf[U.CAM_RZ]=right[2];
  buf[U.CAM_UX]=up[0];     buf[U.CAM_UY]=up[1];     buf[U.CAM_UZ]=up[2];
  buf[U.CAM_BX]=backward[0]; buf[U.CAM_BY]=backward[1]; buf[U.CAM_BZ]=backward[2];
  buf[U.RES_X]=opts.w;   buf[U.RES_Y]=opts.h;
  buf[U.TAN_FOV]=tanFov; buf[U.ASPECT]=aspect;
  buf[U.TIME]=opts.time; buf[U.SPIN]=opts.spin;
  buf[U.DISK_ON]=opts.diskOn?1:0; buf[U.DISK_BRIGHT]=opts.diskBright;
  buf[U.DISK_TEMP]=opts.diskTemp; buf[U.DISK_OUTER]=opts.diskOuter;
  buf[U.DOPPLER_ON]=opts.dopplerOn?1:0; buf[U.EXPOSURE]=opts.exposure;
  buf[U.STEPS]=opts.steps; buf[U.STYLE]=opts.style;
  buf[U.PURE_BLACK]=opts.pureBlack?1:0; buf[U.JETS]=opts.jets?1:0;
  buf[U.JET_STR]=opts.jetStr; buf[U.VOL_DISK]=opts.volDisk?1:0;
  buf[U.VOL_THICK]=opts.volThick; buf[U.VOL_OPACITY]=opts.volOpacity;
  buf[U.SKY_ON]=opts.skyOn?1:0; buf[U.SKY_BRIGHT]=opts.skyBright;
}

// ---------------------------------------------------------------------------
// GPU state
// ---------------------------------------------------------------------------
interface CoreGPU {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  uniformBuf: GPUBuffer;
  uniformData: Float32Array;
  sampler: GPUSampler;
  placeholderTex: GPUTexture;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BlackHoleWebGPUView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef   = useRef<CoreGPU | null>(null);
  const rafRef    = useRef(0);

  // Sky texture (updated async after load)
  const skyTexRef      = useRef<GPUTexture | null>(null);
  const bindGroupRef   = useRef<GPUBindGroup | null>(null);
  const needsBGUpdate  = useRef(false);

  // Controls
  const [spin,       setSpin]       = useState(0.0);
  const [diskOn,     setDiskOn]     = useState(true);
  const [dopplerOn,  setDopplerOn]  = useState(true);
  const [exposure,   setExposure]   = useState(0.85);
  const [starless,   setStarless]   = useState(false);
  const [pureBlack,  setPureBlack]  = useState(false);
  const [jetsOn,     setJetsOn]     = useState(false);
  const [volDisk,    setVolDisk]    = useState(true);
  const [skyOn,      setSkyOn]      = useState(false);
  const [skySource,  setSkySource]  = useState<SkySource>("nasa8k");
  const [steps,      setSteps]      = useState(260);
  const [showControls, setShowControls] = useState(false);

  // Support: null=loading, true=ok, false=unsupported
  const [supported, setSupported] = useState<boolean | null>(null);

  // Orbit refs (no re-render on mouse move)
  const azRef   = useRef(0.3);
  const elRef   = useRef(0.35);
  const distRef = useRef(20.0);
  const dragRef = useRef<{x:number;y:number}|null>(null);

  // Latest controls accessible from RAF closure
  const ctrlRef = useRef({ spin, diskOn, dopplerOn, exposure, starless,
    pureBlack, jetsOn, volDisk, skyOn, steps });
  useEffect(() => {
    ctrlRef.current = { spin, diskOn, dopplerOn, exposure, starless,
      pureBlack, jetsOn, volDisk, skyOn, steps };
  }, [spin, diskOn, dopplerOn, exposure, starless, pureBlack, jetsOn, volDisk, skyOn, steps]);

  // Helper: rebuild bind group from current sky texture
  function makeBindGroup(core: CoreGPU, tex: GPUTexture): GPUBindGroup {
    return core.device.createBindGroup({
      layout: core.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: core.uniformBuf } },
        { binding: 1, resource: core.sampler },
        { binding: 2, resource: tex.createView() },
      ],
    });
  }

  // Load sky texture and update bind group
  const loadSkyTexture = useCallback(async (src: SkySource) => {
    const core = coreRef.current;
    if (!core) return;
    try {
      const blob   = await fetch(SKY_URLS[src]).then(r => r.blob());
      const bitmap = await createImageBitmap(blob);
      const tex    = core.device.createTexture({
        size: [bitmap.width, bitmap.height, 1],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST |
               GPUTextureUsage.RENDER_ATTACHMENT,
      });
      core.device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture: tex },
        [bitmap.width, bitmap.height],
      );
      bitmap.close();
      skyTexRef.current?.destroy();
      skyTexRef.current  = tex;
      needsBGUpdate.current = true;
    } catch {
      // Sky load failed — keep placeholder, sky_on stays as set by user
    }
  }, []);

  // Reload sky when source changes (only if sky is on)
  useEffect(() => {
    if (skyOn) void loadSkyTexture(skySource);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skySource]);

  // Load sky when toggled on for the first time
  useEffect(() => {
    if (skyOn && !skyTexRef.current) void loadSkyTexture(skySource);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skyOn]);

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
      try { device = await adapter.requestDevice(); }
      catch { setSupported(false); return; }
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
      const compInfo = await shaderModule.getCompilationInfo();
      const shaderErrors = compInfo.messages.filter((m) => m.type === "error");
      if (shaderErrors.length > 0) {
        console.error("[BH-WebGPU] WGSL compilation errors:\n" +
          shaderErrors.map((m) => `  line ${m.lineNum}: ${m.message}`).join("\n"));
        setSupported(false); device.destroy(); return;
      }
      const pipeline = await device.createRenderPipelineAsync({
        layout: "auto",
        vertex:   { module: shaderModule, entryPoint: "vs" },
        fragment: { module: shaderModule, entryPoint: "fs", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });

      // Sampler
      const sampler = device.createSampler({
        magFilter: "linear", minFilter: "linear",
        addressModeU: "repeat", addressModeV: "clamp-to-edge",
      });

      // 1×1 white placeholder texture (always bound; swapped when sky loads)
      const placeholderTex = device.createTexture({
        size: [1, 1, 1], format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      device.queue.writeTexture(
        { texture: placeholderTex },
        new Uint8Array([255, 255, 255, 255]),
        { bytesPerRow: 4 }, [1, 1, 1],
      );

      const core: CoreGPU = { device, context, pipeline, uniformBuf,
        uniformData: new Float32Array(UNIFORM_F32), sampler, placeholderTex };
      coreRef.current = core;

      // Initial bind group using placeholder
      bindGroupRef.current = makeBindGroup(core, placeholderTex);
      setSupported(true);

      let t0 = performance.now();
      function frame() {
        if (destroyed || !coreRef.current || !bindGroupRef.current) return;
        const core = coreRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Swap bind group if sky texture just arrived
        if (needsBGUpdate.current && skyTexRef.current) {
          bindGroupRef.current = makeBindGroup(core, skyTexRef.current);
          needsBGUpdate.current = false;
        }

        const time = (performance.now() - t0) / 1000;
        const ctrl = ctrlRef.current;
        writeUniforms(core.uniformData, {
          w: canvas.width, h: canvas.height, time,
          spin: ctrl.spin, diskOn: ctrl.diskOn,
          diskBright: 14 * (ctrl.dopplerOn ? 1.0 : 0.38),
          diskTemp: 10500, diskOuter: 16, dopplerOn: ctrl.dopplerOn,
          exposure: ctrl.exposure, steps: ctrl.steps,
          style: ctrl.starless ? 1 : 0,
          pureBlack: ctrl.pureBlack, jets: ctrl.jetsOn, jetStr: 0.5,
          volDisk: ctrl.volDisk, volThick: 1.0, volOpacity: 0.85,
          skyOn: ctrl.skyOn, skyBright: 1.2,
          az: azRef.current, el: elRef.current, dist: distRef.current,
        });
        core.device.queue.writeBuffer(core.uniformBuf, 0, core.uniformData);

        const encoder = core.device.createCommandEncoder();
        const pass    = encoder.beginRenderPass({
          colorAttachments: [{
            view:       core.context.getCurrentTexture().createView(),
            clearValue: { r:0, g:0, b:0, a:1 },
            loadOp: "clear", storeOp: "store",
          }],
        });
        pass.setPipeline(core.pipeline);
        pass.setBindGroup(0, bindGroupRef.current);
        pass.draw(3);
        pass.end();
        core.device.queue.submit([encoder.finish()]);
        rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    void init();
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      coreRef.current?.device.destroy();
      coreRef.current = null;
      skyTexRef.current = null;
      bindGroupRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Orbit
  const onMouseDown = useCallback((e: React.MouseEvent) => { dragRef.current={x:e.clientX,y:e.clientY}; }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    azRef.current -= (e.clientX-dragRef.current.x)*0.008;
    elRef.current  = Math.max(-1.3,Math.min(1.3,elRef.current+(e.clientY-dragRef.current.y)*0.008));
    dragRef.current = {x:e.clientX,y:e.clientY};
  }, []);
  const onMouseUp   = useCallback(() => { dragRef.current=null; }, []);
  const onWheel     = useCallback((e: React.WheelEvent) => {
    distRef.current = Math.max(4,Math.min(60,distRef.current*(1+e.deltaY*0.001)));
  }, []);
  const touchRef = useRef<{x:number;y:number}|null>(null);
  const pinchRef = useRef<number|null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t0=e.touches[0]!; const t1=e.touches[1]!;
      const dx=t0.clientX-t1.clientX; const dy=t0.clientY-t1.clientY;
      pinchRef.current = Math.sqrt(dx*dx+dy*dy);
      touchRef.current = null;
    } else {
      const t0=e.touches[0]; if(t0) touchRef.current={x:t0.clientX,y:t0.clientY};
      pinchRef.current = null;
    }
  }, []);
  const onTouchMove  = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current !== null) {
      const t0=e.touches[0]!; const t1=e.touches[1]!;
      const dx=t0.clientX-t1.clientX; const dy=t0.clientY-t1.clientY;
      const d=Math.sqrt(dx*dx+dy*dy);
      distRef.current = Math.max(4,Math.min(60,distRef.current*(pinchRef.current/d)));
      pinchRef.current = d;
    } else if (e.touches.length === 1 && touchRef.current) {
      const t0=e.touches[0]!;
      azRef.current -= (t0.clientX-touchRef.current.x)*0.008;
      elRef.current  = Math.max(-1.3,Math.min(1.3,elRef.current+(t0.clientY-touchRef.current.y)*0.008));
      touchRef.current={x:t0.clientX,y:t0.clientY};
    }
  }, []);
  const onTouchEnd   = useCallback(() => { touchRef.current=null; pinchRef.current=null; }, []);

  const glHref    = locale==="it" ? "/lab/buco-nero"        : "/en/lab/black-hole";
  const aboutHref = locale==="it" ? "/lab/buco-nero/about"  : "/en/lab/black-hole/about";
  const langHref  = locale==="it" ? "/en/lab/black-hole/webgpu" : "/lab/buco-nero/webgpu";

  return (
    <div className="bh-root">
      <div className="bh-toolbar">
        <span className="bh-toolbar__title">{t.title}</span>
        <span
          className="bh-control"
          style={{ cursor:"default", background:"rgba(99,179,237,.15)", color:"#63b3ed",
                   border:"1px solid rgba(99,179,237,.35)" }}
        >{t.badge}</span>
        <div className="bh-toolbar__sep" />

        {/* Spin */}
        <label className="bh-control">
          <span>{t.spin}</span>
          <input type="range" min={0} max={0.998} step={0.001} value={spin}
            onChange={e => setSpin(parseFloat(e.target.value))} style={{width:80}} />
          <span style={{width:34,textAlign:"right"}}>{spin.toFixed(3)}</span>
        </label>

        {/* Exposure */}
        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.exposure}</span>
          <input type="range" min={0.2} max={4.0} step={0.05} value={exposure}
            onChange={e => setExposure(parseFloat(e.target.value))} style={{width:68}} />
          <span style={{width:30,textAlign:"right"}}>{exposure.toFixed(2)}</span>
        </label>

        {/* Steps */}
        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.quality}</span>
          <select value={steps}
            onChange={e => setSteps(parseInt(e.target.value, 10))}
            className="bh-control" style={{padding:"0 2px"}}>
            <option value={140}>Low</option>
            <option value={240}>Med</option>
            <option value={300}>High</option>
          </select>
        </label>

        <div className="bh-toolbar__sep bh-toolbar__hide-sm" />

        {/* Toggles */}
        <button className={`bh-control${diskOn      ?" bh-control--active":""}`} onClick={()=>setDiskOn(v=>!v)}>{t.disk}</button>
        <button className={`bh-control bh-toolbar__hide-sm${dopplerOn  ?" bh-control--active":""}`} onClick={()=>setDopplerOn(v=>!v)}>{t.doppler}</button>
        <button className={`bh-control bh-toolbar__hide-sm${starless   ?" bh-control--active":""}`} onClick={()=>setStarless(v=>!v)}>{t.starless}</button>
        <button className={`bh-control bh-toolbar__hide-sm${pureBlack  ?" bh-control--active":""}`} onClick={()=>setPureBlack(v=>!v)}>{t.pureBlack}</button>
        <button className={`bh-control bh-toolbar__hide-sm${jetsOn     ?" bh-control--active":""}`} onClick={()=>setJetsOn(v=>!v)}>{t.jets}</button>
        <button className={`bh-control bh-toolbar__hide-sm${volDisk    ?" bh-control--active":""}`} onClick={()=>setVolDisk(v=>!v)}>{t.volDisk}</button>

        {/* Real sky */}
        <button className={`bh-control bh-toolbar__hide-sm${skyOn?" bh-control--active":""}`} onClick={()=>setSkyOn(v=>!v)}>{t.sky}</button>
        {skyOn && (
          <select value={skySource} onChange={e=>setSkySource(e.target.value as SkySource)}
            className="bh-control bh-toolbar__hide-sm" style={{padding:"0 2px"}}>
            <option value="nasa8k">NASA 8k</option>
            <option value="nasa16k">NASA 16k</option>
          </select>
        )}

        {/* Mobile settings button */}
        <button
          className={`bh-control bh-toolbar__only-sm${showControls?" bh-control--active":""}`}
          onClick={() => setShowControls(v=>!v)}
          aria-label={t.controls}
        >⚙</button>

        <div className="bh-toolbar__sep" />
        <Link href={glHref}    className="bh-control bh-toolbar__hide-sm">{t.gl}</Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link href={langHref}  hrefLang={locale==="it"?"en":"it"} className="bh-control">{t.lang}</Link>
        <Link href={locale==="it"?"/lab":"/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap">
        {supported===false && (
          <div className="bh-loading" style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center",justifyContent:"center",height:"100%"}}>
            <span>{t.noSupport}</span>
            <span style={{opacity:.6,fontSize:"0.9em"}}>{t.noSupportSub}</span>
            <Link href={glHref} className="bh-control" style={{marginTop:8}}>{t.noSupportLink}</Link>
          </div>
        )}
        {supported===null && <div className="bh-loading">{t.loading}</div>}
        <canvas
          ref={canvasRef}
          style={{width:"100%",height:"100%",display:supported===false?"none":"block",
                  cursor:"grab",touchAction:"none"}}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        />
        {supported===true && <p className="bh-hint bh-hint--hide-sm">{t.hint}</p>}

        {/* Mobile controls sheet */}
        {showControls && (
          <div className="bh-controls">
            <div className="bh-controls__head">
              <span>{t.controls}</span>
              <button onClick={() => setShowControls(false)}>×</button>
            </div>

            {/* Spin */}
            <label>
              <span>{t.spin}</span>
              <input type="range" min={0} max={0.998} step={0.001} value={spin}
                onChange={e => setSpin(parseFloat(e.target.value))} />
              <span style={{minWidth:36,textAlign:"right"}}>{spin.toFixed(3)}</span>
            </label>

            {/* Exposure */}
            <label>
              <span>{t.exposure}</span>
              <input type="range" min={0.2} max={4.0} step={0.05} value={exposure}
                onChange={e => setExposure(parseFloat(e.target.value))} />
              <span style={{minWidth:30,textAlign:"right"}}>{exposure.toFixed(2)}</span>
            </label>

            {/* Quality */}
            <label>
              <span>{t.quality}</span>
              <select value={steps} onChange={e => setSteps(parseInt(e.target.value, 10))}>
                <option value={140}>Low</option>
                <option value={240}>Med</option>
                <option value={300}>High</option>
              </select>
            </label>

            {/* Toggles */}
            <label className="bh-controls__toggle">
              <span>{t.disk}</span>
              <input type="checkbox" checked={diskOn}    onChange={() => setDiskOn(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.doppler}</span>
              <input type="checkbox" checked={dopplerOn} onChange={() => setDopplerOn(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.starless}</span>
              <input type="checkbox" checked={starless}  onChange={() => setStarless(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.pureBlack}</span>
              <input type="checkbox" checked={pureBlack} onChange={() => setPureBlack(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.jets}</span>
              <input type="checkbox" checked={jetsOn}    onChange={() => setJetsOn(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.volDisk}</span>
              <input type="checkbox" checked={volDisk}   onChange={() => setVolDisk(v=>!v)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.sky}</span>
              <input type="checkbox" checked={skyOn}     onChange={() => setSkyOn(v=>!v)} />
            </label>
            {skyOn && (
              <label>
                <span>{t.skySrc}</span>
                <select value={skySource} onChange={e => setSkySource(e.target.value as SkySource)}>
                  <option value="nasa8k">NASA 8k</option>
                  <option value="nasa16k">NASA 16k</option>
                </select>
              </label>
            )}

            <p className="bh-hint" style={{position:"static",transform:"none",
              background:"transparent",padding:"4px 0",marginTop:4}}>
              {t.hintTouch}
            </p>

            <div className="bh-controls__links">
              <Link href={glHref}>{t.gl}</Link>
              <Link href={aboutHref}>{t.about}</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
