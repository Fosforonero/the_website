"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { BlackHoleQuality } from "./black-hole/black-hole-shader";

// WebGL Canvas must never run on the server.
const BlackHoleScene = dynamic(() => import("./black-hole-scene"), {
  ssr: false,
  loading: () => <div className="bh-loading">Curvatura dello spazio-tempo…</div>,
});

type Locale = "it" | "en";

const COPY = {
  it: {
    title: "Buco Nero · Lensing Schwarzschild",
    quality: "Qualità",
    qualities: { high: "Alta", medium: "Media", low: "Bassa" },
    disk: "Disco di accrescimento",
    doppler: "Doppler relativistico",
    jets: "Getti relativistici",
    grid: "Griglia spazio-tempo",
    spin: "Spin (frame-dragging ~)",
    hint: "Trascina per orbitare · scroll per zoomare. Porta la vista quasi di taglio al disco per vedere l'alone alla Gargantua.",
    about: "Equazioni e crediti",
    playground: "Playground",
    orbits: "Orbite",
    closeInfo: "Chiudi",
    openInfo: "ⓘ Info",
    discTitle: "Cosa stai guardando (e cosa no)",
    disc: [
      "Lensing gravitazionale reale di un buco nero di Schwarzschild (non rotante): per ogni pixel si integra la geodetica del fotone nello spazio-tempo curvo.",
      "Il disco di accrescimento include beaming Doppler relativistico e redshift gravitazionale, ma il modello di emissione è artistico (ispirato a Shakura–Sunyaev), non un trasporto radiativo.",
      "Lo slider Spin aggiunge il frame-dragging in approssimazione di Lense-Thirring (gravitomagnetismo), non la metrica di Kerr completa.",
      "NON è il render di Gargantua di Interstellar: quello usava la metrica di Kerr (rotante) con ray-tracing calcolato offline, fotogrammi da ore ciascuno. Qui è un'approssimazione in tempo reale.",
    ],
    back: "← Torna al Lab",
  },
  en: {
    title: "Black Hole · Schwarzschild Lensing",
    quality: "Quality",
    qualities: { high: "High", medium: "Medium", low: "Low" },
    disk: "Accretion disk",
    doppler: "Relativistic Doppler",
    jets: "Relativistic jets",
    grid: "Spacetime grid",
    spin: "Spin (frame-dragging ~)",
    hint: "Drag to orbit · scroll to zoom. Bring the disk near edge-on to see the Gargantua-style halo.",
    about: "Equations & credits",
    playground: "Playground",
    orbits: "Orbits",
    closeInfo: "Close",
    openInfo: "ⓘ Info",
    discTitle: "What you are seeing (and what you are not)",
    disc: [
      "Real gravitational lensing of a Schwarzschild (non-rotating) black hole: each pixel integrates the photon geodesic through curved spacetime.",
      "The accretion disk includes relativistic Doppler beaming and gravitational redshift, but the emission model is artistic (Shakura–Sunyaev-inspired), not radiative transfer.",
      "The Spin slider adds frame dragging in the Lense-Thirring approximation (gravitomagnetism), not the full Kerr metric.",
      "This is NOT Interstellar's Gargantua render: that used the rotating Kerr metric with offline ray-tracing, hours per frame. This is a real-time approximation.",
    ],
    back: "← Back to Lab",
  },
} as const;

export function BlackHoleView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const [quality, setQuality] = useState<BlackHoleQuality>("medium");
  const [diskOn, setDiskOn] = useState(true);
  const [dopplerOn, setDopplerOn] = useState(true);
  const [jetsOn, setJetsOn] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [spin, setSpin] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined" && window.innerWidth >= 680) setInfoOpen(true);
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
            onChange={(e) => setQuality(e.target.value as BlackHoleQuality)}
          >
            {(["high", "medium", "low"] as BlackHoleQuality[]).map((q) => (
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
          className={`bh-control${dopplerOn ? " bh-control--active" : ""}`}
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
            max={0.98}
            step={0.02}
            value={spin}
            onChange={(e) => setSpin(parseFloat(e.target.value))}
            style={{ width: 90 }}
          />
          <span style={{ width: 28, textAlign: "right" }}>{spin.toFixed(2)}</span>
        </label>

        <div className="bh-toolbar__sep" />
        <Link href={playgroundHref} className="bh-control">
          {t.playground}
        </Link>
        <Link href={locale === "it" ? "/lab/buco-nero/orbite" : "/en/lab/black-hole/orbit"} className="bh-control bh-toolbar__hide-sm">
          {t.orbits}
        </Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">
          {t.about}
        </Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">
          {t.back}
        </Link>
      </div>

      <div className="bh-canvas-wrap">
        <BlackHoleScene quality={quality} diskOn={diskOn} dopplerOn={dopplerOn} spin={spin} jetsOn={jetsOn} gridOn={gridOn} />
        <p className="bh-hint">{t.hint}</p>

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
          </div>
        ) : (
          <button
            className="bh-disclosure__reopen"
            onClick={() => setInfoOpen(true)}
            title={t.discTitle}
          >
            {t.openInfo}
          </button>
        )}
      </div>
    </div>
  );
}
