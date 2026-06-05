"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import Link from "next/link";
import type { BlackHoleQuality } from "./black-hole/black-hole-shader";
import type { PlaygroundHandle, BodyKind } from "./black-hole-playground-scene";

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
    quality: "Qualità",
    qualities: { high: "Alta", medium: "Media", low: "Bassa" },
    spin: "Spin ~",
    about: "Equazioni",
    back: "← Lab",
    sim: "Vista classica",
    hint: "Scegli un tipo e clicca nella scena per posizionare il corpo · trascina per ruotare. Le stelle entro il raggio mareale vengono disgregate in uno stream.",
    discShort: "Dinamica con potenziale pseudo-newtoniano di Paczyński–Wiita (riproduce l'ISCO e la caduta). I corpi non sono lensati; lo stream mareale è un modello a particelle.",
  },
  en: {
    title: "Black Hole · Playground",
    addPlanet: "Planet",
    addStar: "Star",
    addComet: "Comet",
    reset: "Reset",
    quality: "Quality",
    qualities: { high: "High", medium: "Medium", low: "Low" },
    spin: "Spin ~",
    about: "Equations",
    back: "← Lab",
    sim: "Classic view",
    hint: "Pick a type and click in the scene to place the body · drag to rotate. Stars within the tidal radius are torn into a debris stream.",
    discShort: "Dynamics use the Paczyński–Wiita pseudo-Newtonian potential (reproduces the ISCO and the plunge). Bodies are not lensed; the tidal stream is a particle model.",
  },
} as const;

export function BlackHolePlaygroundView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const api = useRef<PlaygroundHandle | null>(null);
  const [quality, setQuality] = useState<BlackHoleQuality>("medium");
  const [spin, setSpin] = useState(0);
  const [activeKind, setActiveKind] = useState<BodyKind>("star");
  const [infoOpen, setInfoOpen] = useState(true);

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
        <button className="bh-control" onClick={() => api.current?.reset()}>{t.reset}</button>

        <div className="bh-toolbar__sep bh-toolbar__hide-sm" />

        <label className={`bh-control bh-toolbar__hide-sm${spin > 0 ? " bh-control--active" : ""}`}>
          <span>{t.spin}</span>
          <input
            type="range" min={0} max={0.98} step={0.02} value={spin}
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
        <Link href={simHref} className="bh-control bh-toolbar__hide-sm">{t.sim}</Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap">
        <PlaygroundScene quality={quality} spin={spin} activeKind={activeKind} apiRef={api} />
        <p className="bh-hint">{t.hint}</p>

        {infoOpen ? (
          <div className="bh-disclosure" role="note">
            <button className="bh-disclosure__close" onClick={() => setInfoOpen(false)} aria-label="×">×</button>
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
