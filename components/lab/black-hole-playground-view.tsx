"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { BlackHoleQuality } from "./black-hole/black-hole-shader";
import type { PlaygroundHandle, BodyKind } from "./black-hole-playground-scene";
import type { WebGPUBgHandle } from "./black-hole-webgpu-background";
import type { Diagnostics } from "./black-hole/playground-physics";
import { PlaygroundDebugOverlay } from "./black-hole/playground-debug-overlay";

const WebGPUBackground = dynamic(
  () => import("./black-hole-webgpu-background").then(m => ({ default: m.BlackHoleWebGPUBackground })),
  { ssr: false, loading: () => null }
);

const PlaygroundScene = dynamic(() => import("./black-hole-playground-scene"), {
  ssr: false,
  loading: () => <div className="bh-loading">Playground…</div>,
});

type Locale = "it" | "en";

const COPY = {
  it: {
    title: "Buco Nero · Playground",
    addPlanet: "Pianeta",
    addStar: "Stella",
    addComet: "Cometa",
    reset: "Azzera",
    systemBtn: "✦ Sistema planetario",
    infallingBtn: "☄ Sistema stellare in caduta",
    names: "Nomi",
    trails: "Scie",
    quality: "Qualità",
    qualities: { ultra: "Ultra", high: "Alta", medium: "Media", low: "Bassa" },
    spin: "Spin ~",
    about: "Equazioni",
    back: "← Lab",
    sim: "Vista classica",
    webgpu: "WebGPU",
    doppler: "Doppler",
    disk: "Disco",
    jets: "Getti",
    wind: "Vento",
    grid: "Griglia",
    gw: "Onde grav.",
    diskParticles: "Disco particelle",
    ringdown: "Ringdown",
    ringdownTitle: "Simula una perturbazione: il buco nero oscilla alle frequenze quasi-normali di Kerr (l=2) poi si quieta — lo stesso segnale che LIGO misura dopo un merger.",
    hint: "Scegli un tipo e clicca nella scena per posizionare il corpo · trascina per ruotare. Le stelle entro il raggio mareale vengono disgregate in uno stream.",
    discShort: "Dinamica con potenziale pseudo-newtoniano di Paczyński–Wiita (riproduce l'ISCO e la caduta). I corpi non sono lensati; lo stream mareale è un modello a particelle. Scala (barra in basso): rₛ = orizzonte, ISCO 3 rₛ, disco 3–16 rₛ; le dimensioni dei corpi sono compresse per visibilità (stella ≈0,4 rₛ, pianeta ≈0,15 rₛ, cometa ≈0,05 rₛ). In scala reale il rapporto stella/buco nero dipende dalla massa: attorno a un buco nero stellare (~10 M☉, rₛ≈30 km) una stella è migliaia di volte più grande dell'orizzonte; attorno a uno supermassiccio (Gargantua) l'orizzonte supera di gran lunga ogni stella.",
    infoTitle: "Come funziona",
  },
  en: {
    title: "Black Hole · Playground",
    addPlanet: "Planet",
    addStar: "Star",
    addComet: "Comet",
    reset: "Reset",
    systemBtn: "✦ Planetary system",
    infallingBtn: "☄ Infalling stellar system",
    names: "Names",
    trails: "Trails",
    quality: "Quality",
    qualities: { ultra: "Ultra", high: "High", medium: "Medium", low: "Low" },
    spin: "Spin ~",
    about: "Equations",
    back: "← Lab",
    sim: "Classic view",
    webgpu: "WebGPU",
    doppler: "Doppler",
    disk: "Disk",
    jets: "Jets",
    wind: "Wind",
    grid: "Grid",
    gw: "GW inspiral",
    diskParticles: "Particle disk",
    ringdown: "Ringdown",
    ringdownTitle: "Simulate a perturbation: the black hole rings at Kerr quasi-normal mode frequencies (l=2) then settles — the same signal LIGO measures after a merger.",
    hint: "Pick a type and click in the scene to place the body · drag to rotate. Stars within the tidal radius are torn into a debris stream.",
    discShort: "Dynamics use the Paczyński–Wiita pseudo-Newtonian potential (reproduces the ISCO and the plunge). Bodies are not lensed; the tidal stream is a particle model. Scale (bar, bottom): rₛ = horizon, ISCO 3 rₛ, disk 3–16 rₛ; body sizes are compressed for visibility (star ≈0.4 rₛ, planet ≈0.15 rₛ, comet ≈0.05 rₛ). At real scale the star-to-hole ratio depends on mass: around a stellar-mass hole (~10 M☉, rₛ≈30 km) a star is thousands of times larger than the horizon; around a supermassive one (Gargantua) the horizon dwarfs any star.",
    infoTitle: "How it works",
  },
} as const;

export function BlackHolePlaygroundView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const api = useRef<PlaygroundHandle | null>(null);
  const scaleRef = useRef(0);
  const bgRef = useRef<WebGPUBgHandle | null>(null);
  // QNM ringdown: set to the current clock time when triggered; null = inactive.
  const ringdownStartRef = useRef<number | null>(null);
  const [webgpuMode, setWebgpuMode] = useState(false);
  const [dopplerOn, setDopplerOn] = useState(true);
  const [scaleBar, setScaleBar] = useState({ px: 0, label: "" });
  const [quality, setQuality] = useState<BlackHoleQuality>("medium");
  const [spin, setSpin] = useState(0);
  const [diskOn, setDiskOn] = useState(true);
  const [jetsOn, setJetsOn] = useState(false);
  const [windOn, setWindOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [gwOn, setGwOn] = useState(false);
  const [diskParticlesOn, setDiskParticlesOn] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [showTrails, setShowTrails] = useState(false);
  const [activeKind, setActiveKind] = useState<BodyKind>("star");
  const diagRef = useRef<Diagnostics | null>(null);
  const autoFrameRef = useRef<number | null>(null);
  // Start collapsed; open the panel only on wider (non-mobile) screens.
  const [infoOpen, setInfoOpen] = useState(false);
  // ?bhDebug=1 — a dev-only diagnostics overlay (body/particle counts, simDt,
  // energy/momentum/angular-momentum, per-body Hill radii). Read once on
  // mount; not meant to be toggled live.
  const [bhDebug, setBhDebug] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined") setBhDebug(new URLSearchParams(window.location.search).get("bhDebug") === "1");
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined" && window.innerWidth >= 680) setInfoOpen(true);
  }, []);
  useEffect(() => {
    const onRot = () => window.setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    window.addEventListener("orientationchange", onRot);
    return () => window.removeEventListener("orientationchange", onRot);
  }, []);
  // Zoom-aware scale bar: pick a round number of r_s whose on-screen length is
  // a comfortable 60–150 px at the current zoom.
  useEffect(() => {
    const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200];
    const id = setInterval(() => {
      const pxPerRs = scaleRef.current;
      if (!pxPerRs || !isFinite(pxPerRs)) return;
      let pick = steps[0]!;
      for (const s of steps) { pick = s; if (pxPerRs * s >= 60) break; }
      setScaleBar({ px: Math.round(pxPerRs * pick), label: `${pick} rₛ` });
    }, 200);
    return () => clearInterval(id);
  }, []);

  const aboutHref = locale === "it" ? "/lab/buco-nero/about" : "/en/lab/black-hole/about";
  const simHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";

  return (
    <div className="bh-root">
      <div className="bh-toolbar">
        <span className="bh-toolbar__title">{t.title}</span>
        <div className="bh-toolbar__sep" />

        <button className={`bh-control${activeKind === "planet" ? " bh-control--active" : ""}`} onClick={() => setActiveKind("planet")}>{t.addPlanet}</button>
        <button className={`bh-control${activeKind === "star" ? " bh-control--active" : ""}`} onClick={() => setActiveKind("star")}>{t.addStar}</button>
        <button className={`bh-control${activeKind === "comet" ? " bh-control--active" : ""}`} onClick={() => setActiveKind("comet")}>{t.addComet}</button>
        <button className="bh-control bh-control--active" onClick={() => api.current?.system()}>{t.systemBtn}</button>
        <button className="bh-control bh-control--active bh-toolbar__hide-sm" onClick={() => api.current?.infallingSystem()}>{t.infallingBtn}</button>
        <button className="bh-control" onClick={() => api.current?.reset()}>{t.reset}</button>

        <button
          className={`bh-control bh-toolbar__hide-sm${showNames ? " bh-control--active" : ""}`}
          onClick={() => setShowNames((v) => !v)}
        >
          {t.names}
        </button>

        <button
          className={`bh-control bh-toolbar__hide-sm${showTrails ? " bh-control--active" : ""}`}
          onClick={() => setShowTrails((v) => !v)}
        >
          {t.trails}
        </button>

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
          className={`bh-control bh-toolbar__hide-sm${windOn ? " bh-control--active" : ""}`}
          onClick={() => setWindOn((v) => !v)}
        >
          {t.wind}
        </button>

        <button
          className={`bh-control${gridOn ? " bh-control--active" : ""}`}
          onClick={() => setGridOn((v) => !v)}
        >
          {t.grid}
        </button>

        <button
          className={`bh-control${gwOn ? " bh-control--active" : ""}`}
          onClick={() => setGwOn((v) => !v)}
        >
          {t.gw}
        </button>

        {webgpuMode && (
          <button
            className={`bh-control bh-toolbar__hide-sm${diskParticlesOn ? " bh-control--active" : ""}`}
            onClick={() => setDiskParticlesOn((v) => !v)}
          >
            {t.diskParticles}
          </button>
        )}

        <button
          className="bh-control bh-toolbar__hide-sm"
          title={t.ringdownTitle}
          onClick={() => {
            // −1 is a sentinel: "start requested". QNMHook latches clock.getElapsedTime()
            // on the next frame and replaces −1 with the actual start time.
            ringdownStartRef.current = -1;
          }}
        >
          {t.ringdown}
        </button>

        <div className="bh-toolbar__sep bh-toolbar__hide-sm" />

        <label className={`bh-control bh-toolbar__hide-sm${spin > 0 ? " bh-control--active" : ""}`}>
          <span>{t.spin}</span>
          <input
            type="range" min={0} max={0.95} step={0.02} value={spin}
            onChange={(e) => setSpin(parseFloat(e.target.value))}
            style={{ width: 80 }}
          />
        </label>

        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.quality}</span>
          <select value={quality} onChange={(e) => setQuality(e.target.value as BlackHoleQuality)}>
            {(["high", "medium", "low"] as BlackHoleQuality[]).map((q) => (
              <option key={q} value={q}>{t.qualities[q]}</option>
            ))}
          </select>
        </label>

        <div className="bh-toolbar__sep" />
        <button
          className={`bh-control bh-toolbar__hide-sm${webgpuMode ? " bh-control--active" : ""}`}
          onClick={() => setWebgpuMode(v => !v)}
          title={webgpuMode ? "Switch to WebGL renderer" : "Switch to WebGPU renderer"}
        >{t.webgpu}</button>
        <Link href={simHref} className="bh-control bh-toolbar__hide-sm">{t.sim}</Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link href={locale === "it" ? "/en/lab/black-hole/playground" : "/lab/buco-nero/playground"} className="bh-control" hrefLang={locale === "it" ? "en" : "it"} aria-label={locale === "it" ? "English version" : "Versione italiana"}>{locale === "it" ? "EN" : "IT"}</Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap" style={{ position: "relative", background: webgpuMode ? undefined : "#000003" }}>
        {webgpuMode && (
          <WebGPUBackground
            spin={spin} diskOn={diskOn} dopplerOn={dopplerOn} jetsOn={jetsOn}
            bgRef={bgRef}
          />
        )}
        <PlaygroundScene quality={quality} spin={spin} diskOn={diskOn} dopplerOn={dopplerOn} jetsOn={jetsOn} windOn={windOn} gridOn={gridOn} gwOn={gwOn} diskParticlesOn={diskParticlesOn} activeKind={activeKind} apiRef={api} scaleRef={scaleRef} webgpuMode={webgpuMode} bgRef={bgRef} ringdownStartRef={ringdownStartRef} diagRef={diagRef} showNames={showNames} showTrails={showTrails} autoFrameRef={autoFrameRef} />
        {bhDebug && <PlaygroundDebugOverlay diagRef={diagRef} />}
        {scaleBar.px > 0 && (
          <div className="bh-scalebar" aria-hidden>
            <span className="bh-scalebar__label">{scaleBar.label}</span>
            <span className="bh-scalebar__line" style={{ width: scaleBar.px }} />
          </div>
        )}
        <p className="bh-hint bh-hint--hide-sm">{t.hint}</p>

        {infoOpen ? (
          <div className="bh-disclosure" role="note">
            <div className="bh-disclosure__head">
              <span className="bh-disclosure__title">{t.infoTitle}</span>
              <button className="bh-disclosure__close" onClick={() => setInfoOpen(false)} aria-label="×">×</button>
            </div>
            <p className="bh-disclosure__text">{t.discShort}</p>
            <Link href={aboutHref} className="bh-disclosure__more">{t.about} →</Link>
          </div>
        ) : (
          <button className="bh-disclosure__reopen" onClick={() => setInfoOpen(true)}>ⓘ</button>
        )}
      </div>
    </div>
  );
}
