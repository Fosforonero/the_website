"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { QualityChoice, GpuInfo } from "./black-hole/black-hole-shader";
import { bhFacts, diskColorTempForMass } from "./black-hole/physics";

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
    physics: "Scala reale",
    controls: "Controlli",
    share: "Condividi",
    eht: "EHT",
    starless: "Cielo reale",
    pureBlack: "Nero puro",
    skySrc: "Sorgente cielo",
    volDisk: "Disco 3D",
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
    physics: "Real scale",
    controls: "Controls",
    share: "Share",
    eht: "EHT",
    starless: "Real sky",
    pureBlack: "Pure black",
    skySrc: "Sky source",
    volDisk: "3D disk",
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
  const [diskOn, setDiskOn] = useState(true);
  const [dopplerOn, setDopplerOn] = useState(true);
  const [jetsOn, setJetsOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [spin, setSpin] = useState(0);
  const [diskTemp, setDiskTemp] = useState(10500);
  const [diskBright, setDiskBright] = useState(24);
  const [diskOuter, setDiskOuter] = useState(16);
  const [massSolar, setMassSolar] = useState(10);
  const [physOpen, setPhysOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [ehtOn, setEhtOn] = useState(false);
  const [starlessOn, setStarlessOn] = useState(false);
  const [pureBlackOn, setPureBlackOn] = useState(false);
  const [skySource, setSkySource] = useState<SkySource>("nasa8k");
  const [volDiskOn, setVolDiskOn] = useState(false);
  const onMass = (m: number) => { setMassSolar(m); setDiskTemp(diskColorTempForMass(m)); };
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
  const applyScenario = (m: number, s: number) => { onMass(m); setSpin(s); };
  const facts = bhFacts(massSolar);
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
            {(["auto", "ultra", "high", "medium", "low"] as QualityChoice[]).map((q) => (
              <option key={q} value={q}>
                {t.qualities[q]}
              </option>
            ))}
          </select>
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

        <button
          className={`bh-control bh-toolbar__hide-sm${volDiskOn ? " bh-control--active" : ""}`}
          onClick={() => setVolDiskOn((v) => !v)}
          title={locale === "it" ? "Disco 3D volumetrico — trasporto radiativo (pesante, desktop)" : "Volumetric 3D disk — radiative transfer (heavy, desktop)"}
        >
          {t.volDisk}
        </button>

        <button className="bh-control bh-toolbar__hide-sm" onClick={onShare}>📷 {t.share}</button>

        <div className="bh-toolbar__sep" />
        <Link href={playgroundHref} className="bh-control bh-toolbar__hide-sm">
          {t.playground}
        </Link>
        <Link href={locale === "it" ? "/lab/buco-nero/orbite" : "/en/lab/black-hole/orbit"} className="bh-control bh-toolbar__hide-sm">
          {t.orbits}
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
        <BlackHoleScene quality={quality} diskOn={diskOn} dopplerOn={dopplerOn} spin={spin} jetsOn={jetsOn} gridOn={gridOn} diskTemp={effTemp} diskBright={diskBright} diskOuter={diskOuter} eht={ehtOn} starless={starlessOn} pureBlack={pureBlackOn} skyUrl={SKY_SOURCES[skySource]} volDisk={volDiskOn} onGpu={setGpu} />
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
                {(["auto", "ultra", "high", "medium", "low"] as QualityChoice[]).map((q) => (
                  <option key={q} value={q}>{t.qualities[q]}</option>
                ))}
              </select>
            </label>
            {gpu && (
              <div style={{ fontSize: "0.66rem", color: "#6f86b5", lineHeight: 1.4, marginTop: -4, wordBreak: "break-word" }}>
                GPU: {gpu.renderer || "—"} · {locale === "it" ? "profilo" : "profile"} {gpu.tier}
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
            <label className="bh-controls__toggle">
              <span>{t.volDisk}</span>
              <input type="checkbox" checked={volDiskOn} onChange={(e) => setVolDiskOn(e.target.checked)} />
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
              <button onClick={() => applyScenario(4.3e6, 0.5)}>Sgr A*</button>
              <button onClick={() => applyScenario(6.5e9, 0.9)}>M87*</button>
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
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--color-rule, #1c2742)", fontSize: "0.7rem", color: "#6f86b5", lineHeight: 1.45, wordBreak: "break-word" }}>
                GPU: {gpu.renderer || "—"} · {locale === "it" ? "profilo" : "profile"} {gpu.tier}
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
