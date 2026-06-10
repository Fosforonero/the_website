"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { QualityChoice, GpuInfo } from "./black-hole/black-hole-shader";
import { bhFacts, diskColorTempForMass, shadowAngleMuAs, EHT_TARGETS } from "./black-hole/physics";

// WebGL Canvas must never run on the server.
const BlackHoleScene = dynamic(() => import("./black-hole-scene"), {
  ssr: false,
  loading: () => <div className="bh-loading">Curvatura dello spazio-tempo…</div>,
});

type Locale = "it" | "en";

// Real-sky photo sources. NASA "Deep Star Maps 2020" (public domain) at 8k/16k,
// and ESO's all-sky panorama by S. Brunier (CC BY 4.0 — credited in the about).
// 16k and ESO are offered as desktop-only options (heavier downloads).
const SKY_SOURCES = {
  nasa8k: "/sky/starmap_8k.jpg",
  nasa16k: "/sky/starmap_16k.jpg",
  eso: "/sky/eso_panorama.jpg",
} as const;
type SkySource = keyof typeof SKY_SOURCES;

// ── compact number formatting for the real-scale panel ──────────────────────
const SUP: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};
const sup = (n: number) => String(n).split("").map((ch) => SUP[ch] ?? ch).join("");
function sci(x: number, d = 1): string {
  if (!isFinite(x) || x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -1 && e <= 3) return x >= 100 ? x.toFixed(0) : parseFloat(x.toPrecision(3)).toString();
  return `${(x / 10 ** e).toFixed(d)}×10${sup(e)}`;
}
const AU_KM = 1.495978707e8;
const YR_S = 3.15576e7;
function fmtMass(m: number): string {
  return m < 1e4 ? `${m >= 10 ? m.toFixed(0) : m.toFixed(1)} M☉` : `${sci(m)} M☉`;
}
function fmtLen(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 1e7) return `${sci(km)} km`;
  return `${sci(km / AU_KM)} AU`;
}
function fmtTime(s: number): string {
  if (s < 1e-3) return `${(s * 1e6).toFixed(0)} µs`;
  if (s < 1) return `${(s * 1e3).toFixed(1)} ms`;
  if (s < 60) return `${s.toFixed(2)} s`;
  if (s < 3600) return `${(s / 60).toFixed(1)} min`;
  if (s < 8.64e4) return `${(s / 3600).toFixed(1)} h`;
  if (s < 3.15e9) return `${(s / 8.64e4).toFixed(1)} d`;
  return `${sci(s / YR_S)} yr`;
}

const COPY = {
  it: {
    title: "Buco Nero · Lensing Schwarzschild",
    quality: "Qualità",
    qualities: { auto: "Auto", ultra: "Ultra ✦", high: "Alta", medium: "Media", low: "Bassa" },
    disk: "Disco di accrescimento",
    doppler: "Doppler relativistico",
    jets: "Getti relativistici",
    grid: "Griglia spazio-tempo",
    temp: "Temperatura",
    accretion: "Accrescimento",
    diskRadius: "Raggio disco",
    spin: "Spin (Kerr a/M)",
    hint: "Trascina per orbitare · scroll per zoomare. Porta la vista quasi di taglio al disco per vedere l'alone alla Gargantua.",
    about: "Equazioni e crediti",
    playground: "Playground",
    orbits: "Orbite",
    webgpu: "WebGPU",
    physics: "Scala reale",
    controls: "Controlli",
    share: "Condividi",
    eht: "EHT",
    starless: "Cielo reale",
    pureBlack: "Nero puro",
    skySrc: "Sorgente cielo",
    volDisk: "Disco 3D",
    diskParticles: "Disco particelle",
    diskLabel: "Disco",
    diskOff: "Off",
    diskThin: "Sottile",
    diskVolOpt: "Volumetrico",
    diskPartOpt: "Particelle",
    hdr: "HDR",
    phys: {
      title: "Scala reale", mass: "Massa", close: "Chiudi",
      note: "I preset impostano massa e spin di un oggetto reale. La massa fissa il colore del disco (il trend reale); le dimensioni in scena restano compresse per visibilità.",
      rs: "Raggio di Schwarzschild", isco: "ISCO (orbita più interna)", tIsco: "Periodo orbitale all'ISCO",
      diskPeak: "T disco interno (~Eddington)", hawking: "Temperatura di Hawking",
      entropy: "Entropia (S/k_B)", evap: "Tempo di evaporazione",
    },
    closeInfo: "Chiudi",
    openInfo: "Info",
    discTitle: "Cosa stai guardando (e cosa no)",
    disc: [
      "Lensing gravitazionale reale di un buco nero di Schwarzschild (non rotante): per ogni pixel si integra la geodetica del fotone nello spazio-tempo curvo.",
      "Il disco di accrescimento include beaming Doppler relativistico e redshift gravitazionale, ma il modello di emissione è artistico (ispirato a Shakura–Sunyaev), non un trasporto radiativo.",
      "Lo slider Spin integra la metrica di Kerr ESATTA (geodetiche nulle ray-tracciate in forma di Kerr–Schild): ombra asimmetrica, photon ring spostato e frame-dragging reali. Restano approssimati colore/Doppler e profilo del disco (calcolati per a=0).",
      "È la stessa metrica di Kerr del Gargantua di Interstellar — lì ray-tracciata offline (ore per fotogramma), qui in tempo reale nel browser. L'emissione del disco resta un modello, non una soluzione GRMHD.",
    ],
    back: "← Torna al Lab",
  },
  en: {
    title: "Black Hole · Schwarzschild Lensing",
    quality: "Quality",
    qualities: { auto: "Auto", ultra: "Ultra ✦", high: "High", medium: "Medium", low: "Low" },
    disk: "Accretion disk",
    doppler: "Relativistic Doppler",
    jets: "Relativistic jets",
    grid: "Spacetime grid",
    temp: "Temperature",
    accretion: "Accretion",
    diskRadius: "Disk radius",
    spin: "Spin (Kerr a/M)",
    hint: "Drag to orbit · scroll to zoom. Bring the disk near edge-on to see the Gargantua-style halo.",
    about: "Equations & credits",
    playground: "Playground",
    orbits: "Orbits",
    webgpu: "WebGPU",
    physics: "Real scale",
    controls: "Controls",
    share: "Share",
    eht: "EHT",
    starless: "Real sky",
    pureBlack: "Pure black",
    skySrc: "Sky source",
    volDisk: "3D disk",
    diskParticles: "Particle disk",
    diskLabel: "Disk",
    diskOff: "Off",
    diskThin: "Thin",
    diskVolOpt: "Volumetric",
    diskPartOpt: "Particles",
    hdr: "HDR",
    phys: {
      title: "Real scale", mass: "Mass", close: "Close",
      note: "The presets set a real object's mass and spin. Mass sets the disk colour (the real trend); on-scene sizes stay compressed for visibility.",
      rs: "Schwarzschild radius", isco: "ISCO (innermost orbit)", tIsco: "Orbital period at the ISCO",
      diskPeak: "Inner-disk T (~Eddington)", hawking: "Hawking temperature",
      entropy: "Entropy (S/k_B)", evap: "Evaporation time",
    },
    closeInfo: "Close",
    openInfo: "Info",
    discTitle: "What you are seeing (and what you are not)",
    disc: [
      "Real gravitational lensing of a Schwarzschild (non-rotating) black hole: each pixel integrates the photon geodesic through curved spacetime.",
      "The accretion disk includes relativistic Doppler beaming and gravitational redshift, but the emission model is artistic (Shakura–Sunyaev-inspired), not radiative transfer.",
      "The Spin slider integrates the EXACT Kerr metric (null geodesics ray-traced in Kerr–Schild form): a real asymmetric shadow, displaced photon ring and frame dragging. The disk's colour/Doppler and radial profile are still computed for a=0.",
      "It is the same Kerr metric as Interstellar's Gargantua — there ray-traced offline (hours per frame), here in real time in the browser. The disk emission is still a model, not a GRMHD solution.",
    ],
    back: "← Back to Lab",
  },
} as const;

export function BlackHoleView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const [quality, setQuality] = useState<QualityChoice>("auto");
  const [gpu, setGpu] = useState<GpuInfo | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [diskMode, setDiskMode] = useState<"off" | "thin" | "vol" | "particles">("thin");
  const [dopplerOn, setDopplerOn] = useState(true);
  const [jetsOn, setJetsOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [spin, setSpin] = useState(0);
  const [diskTemp, setDiskTemp] = useState(10500);
  const [diskBright, setDiskBright] = useState(14);
  const [diskOuter, setDiskOuter] = useState(16);
  const [massSolar, setMassSolar] = useState(10);
  const [physOpen, setPhysOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [ehtOn, setEhtOn] = useState(false);
  const [starlessOn, setStarlessOn] = useState(false);
  const [pureBlackOn, setPureBlackOn] = useState(false);
  const [skySource, setSkySource] = useState<SkySource>("nasa8k");
  // Single source of truth for the disk: derive the three scene flags from it.
  const diskOn = diskMode !== "off";
  const volDiskOn = diskMode === "vol";
  const diskParticlesOn = diskMode === "particles";
  const [distKpc, setDistKpc] = useState(8.1); // distance for shadow angle calc (kpc)
  // Ultra needs the 6th-order Tao integrator: only discrete desktop GPUs support
  // it without freezing. Apple Silicon and mobile get it disabled.
  const ultraAvailable = !gpu || (gpu.tier === "high" && !gpu.isAppleSilicon);
  useEffect(() => {
    if (quality === "ultra" && !ultraAvailable) setQuality("auto");
  }, [quality, ultraAvailable]);

  // HDR display detection — initialised after mount to avoid SSR mismatch.
  const isHdrDisplay = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(dynamic-range: high)").matches === true,
    [],
  );
  const [hdrMode, setHdrMode] = useState(false);
  useEffect(() => { setHdrMode(isHdrDisplay); }, [isHdrDisplay]);

  const onMass = (m: number) => { setMassSolar(m); setDiskTemp(diskColorTempForMass(m)); };
  const applyPreset = (m: number, s: number, kpc?: number) => { onMass(m); setSpin(s); if (kpc !== undefined) setDistKpc(kpc); };
  // Capture the WebGL canvas (preserveDrawingBuffer is on) and share/download it.
  const onShare = () => {
    const canvas = document.querySelector(".bh-canvas-wrap canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "fosforonero-buco-nero.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] }) && navigator.share) {
        navigator.share({ files: [file], title: "Buco Nero · Fosforonero", text: "fosforonero.com/lab/buco-nero" }).catch(() => {});
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fosforonero-buco-nero.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  // Scenario presets: set a representative mass AND spin for a famous object.
  const applyScenario = applyPreset;
  const facts = bhFacts(massSolar);
  const shadowMuAs = useMemo(() => shadowAngleMuAs(massSolar, distKpc), [massSolar, distKpc]);
  // Accretion rate Ṁ physically raises BOTH luminosity (∝ Ṁ) and temperature
  // (∝ Ṁ¼): so the accretion control also shifts the colour (hotter/bluer when
  // higher), not just the brightness. The temperature slider is the base colour.
  const effTemp = Math.round(diskTemp * Math.pow(diskBright / 24, 0.25));
  const [infoOpen, setInfoOpen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined" && window.innerWidth >= 680) setInfoOpen(true);
  }, []);
  // Mobile: nudge the WebGL canvas to re-measure after a device rotation, so the
  // black hole re-centres instead of staying on the old (portrait) viewport.
  useEffect(() => {
    const onRot = () => window.setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    window.addEventListener("orientationchange", onRot);
    return () => window.removeEventListener("orientationchange", onRot);
  }, []);
  // ── §7.4 Shareable permalink ─────────────────────────────────────────────
  // Restore state from URL params on mount, then keep URL in sync.
  const restoredRef = useRef(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    if (p.has("s")) setSpin(clamp(parseFloat(p.get("s")!), 0, 0.95));
    if (p.has("q")) { const qv = p.get("q"); if (["auto","ultra","high","medium","low"].includes(qv!)) setQuality(qv as QualityChoice); }
    if (p.has("b")) setDiskBright(clamp(parseFloat(p.get("b")!), 5, 60));
    if (p.has("t")) setDiskTemp(clamp(parseFloat(p.get("t")!), 3000, 20000));
    if (p.has("r")) setDiskOuter(clamp(parseFloat(p.get("r")!), 8, 26));
    if (p.has("d")) setDopplerOn(p.get("d") !== "0");
    if (p.has("j")) setJetsOn(p.get("j") === "1");
    if (p.has("dm")) { const dm = p.get("dm")!; if (["off", "thin", "vol", "particles"].includes(dm)) setDiskMode(dm as "off" | "thin" | "vol" | "particles"); }
    else if (p.get("v") === "1") setDiskMode("vol"); // legacy param
    if (p.has("g")) setGridOn(p.get("g") === "1");
    if (p.has("dist")) setDistKpc(clamp(parseFloat(p.get("dist")!), 0.1, 1e6));
    queueMicrotask(() => { restoredRef.current = true; });
  }, []);
  useEffect(() => {
    if (!restoredRef.current) return;
    const p = new URLSearchParams();
    if (spin !== 0) p.set("s", spin.toFixed(2));
    if (quality !== "auto") p.set("q", quality);
    if (diskBright !== 14) p.set("b", diskBright.toFixed(0));
    if (diskTemp !== 10500) p.set("t", diskTemp.toFixed(0));
    if (diskOuter !== 16) p.set("r", diskOuter.toFixed(1));
    if (!dopplerOn) p.set("d", "0");
    if (jetsOn) p.set("j", "1");
    if (diskMode !== "thin") p.set("dm", diskMode);
    if (gridOn) p.set("g", "1");
    if (distKpc !== 8.1) p.set("dist", distKpc.toFixed(1));
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [spin, quality, diskBright, diskTemp, diskOuter, dopplerOn, jetsOn, diskMode, gridOn, distKpc]);
  // ─────────────────────────────────────────────────────────────────────────

  const aboutHref = locale === "it" ? "/lab/buco-nero/about" : "/en/lab/black-hole/about";
  const playgroundHref = locale === "it" ? "/lab/buco-nero/playground" : "/en/lab/black-hole/playground";

  return (
    <div className="bh-root">
      <div className="bh-toolbar">
        <span className="bh-toolbar__title">{t.title}</span>
        <div className="bh-toolbar__sep" />

        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.quality}</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as QualityChoice)}
          >
            {(["auto", "ultra", "high", "medium", "low"] as QualityChoice[]).map((q) => {
              const disabled = q === "ultra" && !ultraAvailable;
              return (
                <option key={q} value={q} disabled={disabled}>
                  {disabled ? `${t.qualities[q]} (${locale === "it" ? "non supportato" : "not supported"})` : t.qualities[q]}
                </option>
              );
            })}
          </select>
        </label>

        <button
          className={`bh-control bh-toolbar__hide-sm${hdrMode ? " bh-control--active" : ""}`}
          onClick={() => setHdrMode((v) => !v)}
          title={locale === "it" ? "Modalità HDR: esposizione ottimizzata per display ad ampia gamma dinamica" : "HDR mode: exposure tuned for wide dynamic range displays"}
        >
          {t.hdr}
        </button>

        <label className="bh-control" aria-label={t.diskLabel}>
          <span>{t.diskLabel}</span>
          <select
            value={diskMode}
            onChange={(e) => setDiskMode(e.target.value as "off" | "thin" | "vol" | "particles")}
          >
            <option value="off">{t.diskOff}</option>
            <option value="thin">{t.diskThin}</option>
            <option value="vol">{t.diskVolOpt}</option>
            <option value="particles">{t.diskPartOpt}</option>
          </select>
        </label>

        <button
          className={`bh-control bh-toolbar__hide-sm${dopplerOn ? " bh-control--active" : ""}`}
          onClick={() => setDopplerOn((v) => !v)}
        >
          {t.doppler}
        </button>

        <button
          className={`bh-control bh-toolbar__hide-sm${jetsOn ? " bh-control--active" : ""}`}
          onClick={() => setJetsOn((v) => !v)}
        >
          {t.jets}
        </button>

        <button
          className={`bh-control bh-toolbar__hide-sm${gridOn ? " bh-control--active" : ""}`}
          onClick={() => setGridOn((v) => !v)}
        >
          {t.grid}
        </button>

        <label className={`bh-control bh-toolbar__hide-sm${spin > 0 ? " bh-control--active" : ""}`}>
          <span>{t.spin}</span>
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.02}
            value={spin}
            onChange={(e) => setSpin(parseFloat(e.target.value))}
            style={{ width: 90 }}
          />
          <span style={{ width: 28, textAlign: "right" }}>{spin.toFixed(2)}</span>
        </label>

        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.temp}</span>
          <input type="range" min={3000} max={20000} step={250} value={diskTemp}
            onChange={(e) => setDiskTemp(parseFloat(e.target.value))} style={{ width: 80 }} />
          <span style={{ width: 42, textAlign: "right" }}>{(diskTemp / 1000).toFixed(1)}kK</span>
        </label>
        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.accretion}</span>
          <input type="range" min={5} max={60} step={1} value={diskBright}
            onChange={(e) => setDiskBright(parseFloat(e.target.value))} style={{ width: 80 }} />
        </label>
        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.diskRadius}</span>
          <input type="range" min={8} max={26} step={0.5} value={diskOuter}
            onChange={(e) => setDiskOuter(parseFloat(e.target.value))} style={{ width: 80 }} />
        </label>

        <button
          className={`bh-control bh-toolbar__hide-sm${physOpen ? " bh-control--active" : ""}`}
          onClick={() => setPhysOpen((v) => !v)}
        >
          {t.physics}
        </button>

        <button
          className={`bh-control bh-toolbar__only-sm${controlsOpen ? " bh-control--active" : ""}`}
          onClick={() => setControlsOpen((v) => !v)}
        >
          ⚙ {t.controls}
        </button>

        <button
          className={`bh-control bh-toolbar__hide-sm${ehtOn ? " bh-control--active" : ""}`}
          onClick={() => setEhtOn((v) => !v)}
          title="Event Horizon Telescope"
        >
          {t.eht}
        </button>

        <button
          className={`bh-control${starlessOn ? " bh-control--active" : ""}`}
          onClick={() => setStarlessOn((v) => !v)}
          title={locale === "it" ? "Cielo reale — foto NASA Deep Star Maps lensata dal buco nero" : "Real sky — NASA Deep Star Maps photo, lensed by the black hole"}
        >
          {t.starless}
        </button>

        {starlessOn && (
          <select
            className="bh-control bh-toolbar__hide-sm"
            value={skySource}
            onChange={(e) => setSkySource(e.target.value as SkySource)}
            aria-label={t.skySrc}
            title={t.skySrc}
          >
            <option value="nasa8k">NASA 8k</option>
            <option value="nasa16k">NASA 16k</option>
            <option value="eso">ESO (Brunier)</option>
          </select>
        )}

        <button
          className={`bh-control${pureBlackOn ? " bh-control--active" : ""}`}
          onClick={() => setPureBlackOn((v) => !v)}
          title={locale === "it" ? "Nero puro — cielo spento, disco arancio saturo (look NASA)" : "Pure black — sky off, saturated-orange disk (NASA look)"}
        >
          {t.pureBlack}
        </button>

        <button className="bh-control bh-toolbar__hide-sm" onClick={onShare}>📷 {t.share}</button>

        <div className="bh-toolbar__sep" />
        <Link href={playgroundHref} className="bh-control bh-toolbar__hide-sm">
          {t.playground}
        </Link>
        <Link href={locale === "it" ? "/lab/buco-nero/orbite" : "/en/lab/black-hole/orbit"} className="bh-control bh-toolbar__hide-sm">
          {t.orbits}
        </Link>
        <Link href={locale === "it" ? "/lab/buco-nero/webgpu" : "/en/lab/black-hole/webgpu"} className="bh-control bh-toolbar__hide-sm">
          {t.webgpu}
        </Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">
          {t.about}
        </Link>
        <Link
          href={locale === "it" ? "/en/lab/black-hole" : "/lab/buco-nero"}
          className="bh-control"
          hrefLang={locale === "it" ? "en" : "it"}
          aria-label={locale === "it" ? "English version" : "Versione italiana"}
        >
          {locale === "it" ? "EN" : "IT"}
        </Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">
          {t.back}
        </Link>
      </div>

      <div className={`bh-canvas-wrap${ehtOn ? " bh-eht" : ""}`}>
        <BlackHoleScene quality={quality} diskOn={diskOn} dopplerOn={dopplerOn} spin={spin} jetsOn={jetsOn} gridOn={gridOn} diskTemp={effTemp} diskBright={diskBright} diskOuter={diskOuter} eht={ehtOn} starless={starlessOn} pureBlack={pureBlackOn} skyUrl={SKY_SOURCES[skySource]} volDisk={volDiskOn} diskParticles={diskParticlesOn} hdrMode={hdrMode} onGpu={setGpu} onFps={setFps} />
        <p className="bh-hint">{t.hint}</p>

        {controlsOpen && (
          <div className="bh-controls" role="note">
            <div className="bh-controls__head">
              <span>{t.controls}</span>
              <button onClick={() => setControlsOpen(false)} aria-label="×">×</button>
            </div>
            <label>
              <span>{t.quality}</span>
              <select value={quality} onChange={(e) => setQuality(e.target.value as QualityChoice)}>
                {(["auto", "ultra", "high", "medium", "low"] as QualityChoice[]).map((q) => {
                  const disabled = q === "ultra" && !ultraAvailable;
                  return (
                    <option key={q} value={q} disabled={disabled}>
                      {disabled ? `${t.qualities[q]} (${locale === "it" ? "non supportato" : "not supported"})` : t.qualities[q]}
                    </option>
                  );
                })}
              </select>
            </label>
            {gpu && (
              <div role="status" aria-live="polite" style={{ fontSize: "0.66rem", color: "#6f86b5", lineHeight: 1.4, marginTop: -4, wordBreak: "break-word" }}>
                GPU: {gpu.renderer || "—"} · {locale === "it" ? "profilo" : "profile"} {gpu.tier}
                {fps !== null && (
                  <span style={{ marginLeft: 6, color: fps >= 50 ? "#5fbf6f" : fps >= 30 ? "#c8a83a" : "#c84040" }}>
                    · {fps} fps
                  </span>
                )}
              </div>
            )}
            <label>
              <span>{t.temp}</span>
              <input type="range" min={3000} max={20000} step={250} value={diskTemp}
                onChange={(e) => setDiskTemp(parseFloat(e.target.value))} />
            </label>
            <label>
              <span>{t.accretion}</span>
              <input type="range" min={5} max={60} step={1} value={diskBright}
                onChange={(e) => setDiskBright(parseFloat(e.target.value))} />
            </label>
            <label>
              <span>{t.diskRadius}</span>
              <input type="range" min={8} max={26} step={0.5} value={diskOuter}
                onChange={(e) => setDiskOuter(parseFloat(e.target.value))} />
            </label>
            <label>
              <span>{t.spin}</span>
              <input type="range" min={0} max={0.95} step={0.02} value={spin}
                onChange={(e) => setSpin(parseFloat(e.target.value))} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.doppler}</span>
              <input type="checkbox" checked={dopplerOn} onChange={(e) => setDopplerOn(e.target.checked)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.grid}</span>
              <input type="checkbox" checked={gridOn} onChange={(e) => setGridOn(e.target.checked)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.hdr}</span>
              <input type="checkbox" checked={hdrMode} onChange={(e) => setHdrMode(e.target.checked)} />
            </label>
            <label className="bh-controls__toggle">
              <span>{t.jets}</span>
              <input type="checkbox" checked={jetsOn} onChange={(e) => setJetsOn(e.target.checked)} />
            </label>
            {starlessOn && (
              <label>
                <span>{t.skySrc}</span>
                <select value={skySource} onChange={(e) => setSkySource(e.target.value as SkySource)}>
                  <option value="nasa8k">NASA 8k</option>
                  <option value="nasa16k">NASA 16k</option>
                  <option value="eso">ESO (Brunier)</option>
                </select>
              </label>
            )}
            <label>
              <span>{t.diskLabel}</span>
              <select value={diskMode} onChange={(e) => setDiskMode(e.target.value as "off" | "thin" | "vol" | "particles")}>
                <option value="off">{t.diskOff}</option>
                <option value="thin">{t.diskThin}</option>
                <option value="vol">{t.diskVolOpt}</option>
                <option value="particles">{t.diskPartOpt}</option>
              </select>
            </label>
            <label className="bh-controls__toggle">
              <span>{t.eht}</span>
              <input type="checkbox" checked={ehtOn} onChange={(e) => setEhtOn(e.target.checked)} />
            </label>
            <div className="bh-controls__links">
              <button onClick={() => { setControlsOpen(false); setPhysOpen(true); }}>{t.physics}</button>
              <button onClick={onShare}>📷 {t.share}</button>
              <Link href={playgroundHref}>{t.playground}</Link>
              <Link href={locale === "it" ? "/lab/buco-nero/orbite" : "/en/lab/black-hole/orbit"}>{t.orbits}</Link>
              <Link href={aboutHref}>{t.about}</Link>
            </div>
          </div>
        )}

        {physOpen && (
          <div className="bh-physpanel" role="note">
            <div className="bh-physpanel__head">
              <span>{t.phys.title}</span>
              <button onClick={() => setPhysOpen(false)} aria-label={t.phys.close}>×</button>
            </div>
            <label className="bh-physpanel__mass">
              <span>{t.phys.mass}</span>
              <input type="range" min={0} max={9.5} step={0.1}
                value={Math.log10(massSolar)}
                onChange={(e) => onMass(10 ** parseFloat(e.target.value))} />
              <b>{fmtMass(massSolar)}</b>
            </label>
            <div className="bh-physpanel__presets">
              <button onClick={() => applyScenario(10, 0)}>10 M☉</button>
              <button onClick={() => applyScenario(4.3e6, 0.5, 8.1)}>Sgr A*</button>
              <button onClick={() => applyScenario(6.5e9, 0.9, 16800)}>M87*</button>
              <button onClick={() => applyScenario(1e8, 0.95)}>Gargantua</button>
            </div>
            <div className="bh-physpanel__grid">
              <div><span>{t.phys.rs}</span><b>{fmtLen(facts.rsKm)}</b></div>
              <div><span>{t.phys.isco}</span><b>{fmtLen(facts.iscoKm)}</b></div>
              <div><span>{t.phys.tIsco}</span><b>{fmtTime(facts.tIscoSec)}</b></div>
              <div><span>{t.phys.diskPeak}</span><b>{sci(facts.diskPeakK)} K</b></div>
              <div><span>{t.phys.hawking}</span><b>{sci(facts.hawkingK)} K</b></div>
              <div><span>{t.phys.entropy}</span><b>{sci(facts.entropyKB)}</b></div>
              <div><span>{t.phys.evap}</span><b>{sci(facts.evapYears)} yr</b></div>
            </div>
            <p className="bh-physpanel__note">{t.phys.note}</p>

            {/* ── Shadow / EHT validation section ── */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1c2742" }}>
              <div style={{ fontSize: "0.60rem", color: "#8fa3cc", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                {locale === "it" ? "Ombra & confronto EHT" : "Shadow & EHT comparison"}
              </div>

              {/* Distance control */}
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.63rem", marginBottom: 8 }}>
                <span style={{ color: "#6f86ad", minWidth: 60 }}>{locale === "it" ? "Distanza" : "Distance"}</span>
                <input type="range" min={-1} max={4.5} step={0.05}
                  value={Math.log10(distKpc)}
                  onChange={(e) => setDistKpc(10 ** parseFloat(e.target.value))}
                  style={{ flex: 1, minWidth: 0 }} />
                <b style={{ color: "#dfe8f5", minWidth: 72, textAlign: "right", fontSize: "0.63rem" }}>
                  {distKpc < 1000 ? `${distKpc < 10 ? distKpc.toFixed(2) : distKpc.toFixed(0)} kpc` : `${(distKpc / 1000).toFixed(1)} Mpc`}
                </b>
              </label>

              {/* Computed + analytical row */}
              <div className="bh-physpanel__grid" style={{ marginBottom: 8 }}>
                <div>
                  <span>b_crit (a=0)</span>
                  <b>3√3 ≈ 5.196 GM/c²</b>
                </div>
                <div>
                  <span>{locale === "it" ? "Diametro angolare ombra" : "Shadow angular diameter"}</span>
                  <b>{shadowMuAs.toFixed(1)} µas</b>
                </div>
              </div>

              {/* EHT reference table */}
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: "3px 8px", fontSize: "0.58rem", alignItems: "baseline" }}>
                <span style={{ color: "#4a5e80" }}></span>
                <span style={{ color: "#4a5e80" }}>{locale === "it" ? "stimato" : "computed"}</span>
                <span style={{ color: "#4a5e80" }}>EHT {locale === "it" ? "misurato" : "measured"}</span>
                <span style={{ color: "#4a5e80" }}>{locale === "it" ? "scarto" : "error"}</span>
                {EHT_TARGETS.map((tgt) => {
                  const comp = shadowAngleMuAs(tgt.mSolar, tgt.distKpc);
                  const errPct = Math.abs(comp - tgt.measuredMuAs) / tgt.measuredMuAs * 100;
                  return [
                    <b key={tgt.name + "n"} style={{ color: "#dfe8f5" }}>{tgt.name}</b>,
                    <span key={tgt.name + "c"} style={{ color: "#c8d8f0" }}>{comp.toFixed(0)} µas</span>,
                    <span key={tgt.name + "e"} style={{ color: "#5fbf6f" }}>{tgt.measuredMuAs} µas</span>,
                    <span key={tgt.name + "d"} style={{ color: errPct < 15 ? "#5fbf6f" : "#c8a83a" }}>{errPct.toFixed(0)}%</span>,
                  ];
                })}
              </div>

              <p className="bh-physpanel__note" style={{ marginTop: 6 }}>
                {locale === "it"
                  ? `Formula Schwarzschild (a=0): esatta al limite non-rotante; varia ±~10% con lo spin (Kerr). Distanza Sgr A*: 8,1 kpc (GRAVITY 2022); M87*: 16,8 Mpc (EHT 2019). Rif: Bardeen 1973, EHT 2019/2022.`
                  : `Schwarzschild formula (a=0): exact in the non-rotating limit; varies ±~10% with spin (Kerr). Sgr A* dist: 8.1 kpc (GRAVITY 2022); M87*: 16.8 Mpc (EHT 2019). Ref: Bardeen 1973, EHT 2019/2022.`}
              </p>
            </div>
          </div>
        )}

        {infoOpen ? (
          <div className="bh-disclosure" role="note">
            <div className="bh-disclosure__head">
              <span className="bh-disclosure__title">{t.discTitle}</span>
              <button
                className="bh-disclosure__close"
                onClick={() => setInfoOpen(false)}
                aria-label={t.closeInfo}
                title={t.closeInfo}
              >
                ×
              </button>
            </div>
            <ul>
              {t.disc.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <Link href={aboutHref} className="bh-disclosure__more">
              {t.about} →
            </Link>
            {gpu && (
              <div role="status" aria-live="polite" style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--color-rule, #1c2742)", fontSize: "0.7rem", color: "#6f86b5", lineHeight: 1.45, wordBreak: "break-word" }}>
                GPU: {gpu.renderer || "—"} · {locale === "it" ? "profilo" : "profile"} {gpu.tier}
                {fps !== null && (
                  <span style={{ marginLeft: 6, color: fps >= 50 ? "#5fbf6f" : fps >= 30 ? "#c8a83a" : "#c84040" }}>
                    · {fps} fps
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            className="bh-disclosure__reopen"
            onClick={() => setInfoOpen(true)}
            title={t.discTitle}
            aria-label={t.openInfo}
          >
            <span className="bh-disclosure__reopen-icon" aria-hidden="true">ⓘ</span>
            <span className="bh-disclosure__reopen-label">{t.openInfo}</span>
          </button>
        )}
      </div>
    </div>
  );
}
