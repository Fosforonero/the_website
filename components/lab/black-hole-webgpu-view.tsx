"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  initWebGPU, writeUniforms, makePlaceholderBindGroup, makeSkyBindGroup,
  type CoreGPU,
} from "./black-hole/black-hole-webgpu-core";

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
    playground: "Playground", orbits: "Orbite",
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
    playground: "Playground", orbits: "Orbits",
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
  // Off by default: the volumetric disk is the heaviest path (radiative transfer
  // + turbulence per step, per pixel) and on WebGPU it can stall the page on
  // weaker GPUs. Users can still enable it explicitly via the Vol disk toggle.
  const [volDisk,    setVolDisk]    = useState(false);
  const [skyOn,      setSkyOn]      = useState(false);
  const [skySource,  setSkySource]  = useState<SkySource>("nasa8k");
  // Initial steps: lower on touch devices so the first frame is not stalled.
  // The user can raise them with the Steps select; we never override that choice.
  const isMobileGPU = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
  const [steps,      setSteps]      = useState(isMobileGPU ? 160 : 260);
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
      try {
        core.device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture: tex },
          [bitmap.width, bitmap.height],
        );
      } finally {
        bitmap.close();
      }
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

    let destroyed = false;

    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const core = await initWebGPU(canvas);
      if (!core) { setSupported(false); return; }
      if (destroyed) { core.device.destroy(); return; }

      coreRef.current = core;
      bindGroupRef.current = makePlaceholderBindGroup(core);
      setSupported(true);

      // FPS EMA governor: reduces canvas DPR when the GPU can't keep up.
      // Only active on touch devices (coarse pointer) — desktop is fast enough.
      const coarseDevice = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
      let fpsEmaGPU = 60;
      let lastFrameTime = performance.now();
      let sinceGovCheck = 0;
      let sinceAdjust = 0;

      let t0 = performance.now();
      function frame() {
        if (destroyed || !coreRef.current || !bindGroupRef.current) return;
        const core = coreRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Swap bind group if sky texture just arrived
        if (needsBGUpdate.current && skyTexRef.current) {
          bindGroupRef.current = makeSkyBindGroup(core, skyTexRef.current);
          needsBGUpdate.current = false;
        }

        // FPS EMA + adaptive DPR governor.
        // Active on touch devices always; on desktop only when vol disk is on
        // (vol disk is fill-rate-heavy everywhere, not just on mobile).
        const now = performance.now();
        const dt = Math.max((now - lastFrameTime) / 1000, 1e-3);
        lastFrameTime = now;
        fpsEmaGPU = fpsEmaGPU * 0.92 + (1.0 / dt) * 0.08;
        sinceGovCheck += dt;
        sinceAdjust   += dt;
        const ctrl = ctrlRef.current;
        const govActive = coarseDevice || ctrl.volDisk;
        if (govActive && sinceGovCheck > 1.0) {
          sinceGovCheck = 0;
          const baseCap = ctrl.volDisk
            ? (coarseDevice ? 0.75 : 1.25)
            : (coarseDevice ? 0.90 : 1.5);
          const applyDpr = () => {
            const dpr = Math.min(window.devicePixelRatio ?? 1, baseCap * dprScaleRef.current);
            canvas.width  = Math.floor(canvas.clientWidth  * dpr);
            canvas.height = Math.floor(canvas.clientHeight * dpr);
            // Each resize reallocates the swapchain (a visible hitch) and skews
            // the next frame times: reset the EMA to a neutral value so the
            // governor re-measures instead of cascading off the hitch itself.
            fpsEmaGPU = 42;
            sinceAdjust = 0;
          };
          if (fpsEmaGPU < 32 && dprScaleRef.current > 0.55) {
            // Remember the scale that failed: vsync quantises FPS to 60↔30,
            // which sits exactly across the 32/52 thresholds — without this
            // ceiling the governor drops and re-raises forever, and the
            // once-per-second canvas reallocation IS the stutter.
            recoverCeilRef.current = Math.max(0.55, dprScaleRef.current - 0.04);
            dprScaleRef.current = Math.max(0.55, dprScaleRef.current - 0.10);
            applyDpr();
          } else if (
            fpsEmaGPU > 52 &&
            dprScaleRef.current < recoverCeilRef.current &&
            sinceAdjust > 2.5
          ) {
            dprScaleRef.current = Math.min(recoverCeilRef.current, dprScaleRef.current + 0.06);
            applyDpr();
          }
        }

        const time = (performance.now() - t0) / 1000;
        writeUniforms(core.uniformData, {
          w: canvas.width, h: canvas.height, time,
          spin: ctrl.spin, diskOn: ctrl.diskOn,
          diskBright: ctrl.volDisk
            ? 2.5 * (ctrl.dopplerOn ? 1.0 : 0.38)
            : 14  * (ctrl.dopplerOn ? 1.0 : 0.38),
          diskTemp: 10500, diskOuter: 16, dopplerOn: ctrl.dopplerOn,
          exposure: ctrl.exposure, steps: ctrl.steps,
          style: ctrl.starless ? 1 : 0,
          pureBlack: ctrl.pureBlack, jets: ctrl.jetsOn, jetStr: 0.5,
          volDisk: ctrl.volDisk, volThick: 0.1, volOpacity: 0.08,
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

  // Adaptive DPR governor for WebGPU. Refs for the RAF loop to read/write.
  const dprScaleRef = useRef(1.0);  // multiplied against the cap, updated by the governor
  // Highest scale the governor may recover to: lowered each time a scale fails
  // (FPS < 32) so the recovery never climbs back into the failing zone.
  const recoverCeilRef = useRef(1.0);

  // When vol disk is toggled ON, immediately drop DPR and steps so the GPU
  // is not stalled on the first heavy frame. The governor recovers both if
  // the measured FPS allows it. On toggle-off, reset dprScale to full.
  const prevVolDiskRef = useRef(false);
  useEffect(() => {
    const justTurnedOn  = volDisk && !prevVolDiskRef.current;
    const justTurnedOff = !volDisk && prevVolDiskRef.current;
    prevVolDiskRef.current = volDisk;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
    if (justTurnedOn) {
      // Vol disk is the heaviest path — drop DPR immediately and cap steps.
      // Desktop cap 240 (= the "Med" preset, so the Steps select stays
      // truthful; ≥200 keeps the PHYSICAL photon ring instead of the analytic
      // fallback circle): affordable now that the slab step is slope-scaled
      // and near-plane rays no longer crawl at dt=0.035 through their whole
      // budget. Touch devices stay at 160 for fluidity.
      dprScaleRef.current = 0.65;
      recoverCeilRef.current = 1.0;   // new workload: let the governor re-probe
      setSteps(s => Math.min(s, coarse ? 160 : 240));
      const baseCap = coarse ? 0.75 : 1.25;
      const dpr = Math.min(window.devicePixelRatio ?? 1, baseCap * 0.65);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    } else if (justTurnedOff) {
      dprScaleRef.current = 1.0;
      recoverCeilRef.current = 1.0;
      const baseCap = coarse ? 0.90 : 1.5;
      const dpr = Math.min(window.devicePixelRatio ?? 1, baseCap);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    }
  }, [volDisk]);

  // Canvas resize — DPR caps:
  //   touch + vol disk:     0.75  (heaviest path)
  //   touch + no vol disk:  0.90  (was 1.5 — the main mobile bottleneck)
  //   desktop + vol disk:   1.25
  //   desktop + no vol disk: 1.5
  // Re-runs when volDisk changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
    const baseCap = volDisk ? (coarse ? 0.75 : 1.25) : (coarse ? 0.90 : 1.5);
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, baseCap * dprScaleRef.current);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => ro.disconnect();
  }, [volDisk]);

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

  const glHref         = locale==="it" ? "/lab/buco-nero"             : "/en/lab/black-hole";
  const aboutHref      = locale==="it" ? "/lab/buco-nero/about"       : "/en/lab/black-hole/about";
  const playgroundHref = locale==="it" ? "/lab/buco-nero/playground"  : "/en/lab/black-hole/playground";
  const orbitsHref     = locale==="it" ? "/lab/buco-nero/orbite"      : "/en/lab/black-hole/orbit";
  const langHref       = locale==="it" ? "/en/lab/black-hole/webgpu"  : "/lab/buco-nero/webgpu";

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

        {/* Spin — hidden in the collapsed toolbar (lives in the ⚙ sheet) */}
        <label className="bh-control bh-toolbar__hide-sm">
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
        <Link href={playgroundHref} className="bh-control bh-toolbar__hide-sm">{t.playground}</Link>
        <Link href={orbitsHref}     className="bh-control bh-toolbar__hide-sm">{t.orbits}</Link>
        <Link href={glHref}         className="bh-control bh-toolbar__hide-sm">{t.gl}</Link>
        <Link href={aboutHref}      className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link href={langHref}  hrefLang={locale==="it"?"en":"it"} className="bh-control">{t.lang}</Link>
        <Link href={locale==="it"?"/lab":"/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap">
        {supported===false && (
          <div className="bh-loading" role="alert" style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center",justifyContent:"center",height:"100%"}}>
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
