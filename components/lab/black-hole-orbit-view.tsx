"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { BlackHoleQuality } from "./black-hole/black-hole-shader";
import type { OrbitHandle, OrbitReadout, OrbitParams } from "./black-hole-orbit-scene";

const OrbitScene = dynamic(() => import("./black-hole-orbit-scene"), {
  ssr: false,
  loading: () => <div className="bh-loading">…</div>,
});

type Locale = "it" | "en";

const COPY = {
  it: {
    title: "Buco Nero · Orbite relativistiche",
    L: "Momento angolare L", r0: "Raggio iniziale r₀", reset: "Riavvia", disk: "Disco", incl: "Inclinazione",
    about: "Equazioni", back: "← Lab", sim: "Vista classica", presets: "Preset",
    pPrec: "Precessione", pIsco: "ISCO", pPlunge: "Caduta",
    hint: "Geodetica di tipo-tempo esatta di Schwarzschild (non l'approssimazione del playground). L'orbita precede formando una rosetta — la stessa fisica della precessione del perielio di Mercurio. Sotto L = √3 non esistono orbite stabili → caduta. Clicca nella scena per rilasciare la particella nel punto scelto. Anello arancio = ISCO (r = 6M), anello chiaro = sfera fotonica.",
    rLbl: "r", vLbl: "v", eLbl: "E", precLbl: "Δφ", driftLbl: "drift E", status: "stato",
    orbiting: "in orbita", plunged: "caduto", info: "Come funziona",
  },
  en: {
    title: "Black Hole · Relativistic orbits",
    L: "Angular momentum L", r0: "Initial radius r₀", reset: "Restart", disk: "Disk", incl: "Inclination",
    about: "Equations", back: "← Lab", sim: "Classic view", presets: "Presets",
    pPrec: "Precession", pIsco: "ISCO", pPlunge: "Plunge",
    hint: "Exact Schwarzschild timelike geodesic (not the playground's approximation). The orbit precesses into a rosette — the same physics as Mercury's perihelion precession. Below L = √3 there are no stable orbits → plunge. Click in the scene to release the particle at the chosen point. Orange ring = ISCO (r = 6M), light ring = photon sphere.",
    rLbl: "r", vLbl: "v", eLbl: "E", precLbl: "Δφ", driftLbl: "E drift", status: "status",
    orbiting: "orbiting", plunged: "plunged", info: "How it works",
  },
} as const;

const PRESETS: Record<string, OrbitParams> = {
  // Same start radius, different L: one precesses forever, the other plunges.
  prec: { L: 2.1, r0: 14 },
  isco: { L: 1.7321, r0: 3.02 },
  plunge: { L: 1.5, r0: 14 },
};

export function BlackHoleOrbitView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const api = useRef<OrbitHandle | null>(null);
  const readout = useRef<OrbitReadout | null>(null);
  const [quality] = useState<BlackHoleQuality>("medium");
  const [diskOn, setDiskOn] = useState(false);
  const [params, setParams] = useState<OrbitParams>(PRESETS.prec!);
  const [infoOpen, setInfoOpen] = useState(false);
  const [r, setR] = useState(0);
  const [vel, setVel] = useState(0);
  const [prec, setPrec] = useState(0);
  const [drift, setDrift] = useState(0);
  const [status, setStatus] = useState<"orbiting" | "plunged">("orbiting");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof window !== "undefined" && window.innerWidth >= 680) setInfoOpen(true);
  }, []);
  useEffect(() => {
    const onRot = () => window.setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    window.addEventListener("orientationchange", onRot);
    return () => window.removeEventListener("orientationchange", onRot);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const ro = readout.current;
      if (!ro) return;
      setR(ro.r); setVel(ro.v); setPrec(ro.precessionDeg); setDrift(ro.driftE); setStatus(ro.status);
    }, 120);
    return () => clearInterval(id);
  }, []);

  const aboutHref = locale === "it" ? "/lab/buco-nero/about" : "/en/lab/black-hole/about";
  const simHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";
  const E = Math.sqrt(Math.max(1 - 1.0 / params.r0, 0) * (1 + (params.L * params.L) / (params.r0 * params.r0)));

  return (
    <div className="bh-root">
      <div className="bh-toolbar">
        <span className="bh-toolbar__title">{t.title}</span>
        <div className="bh-toolbar__sep" />

        <span className="bh-control bh-toolbar__hide-sm" style={{ cursor: "default", opacity: 0.7 }}>{t.presets}:</span>
        <button className="bh-control" onClick={() => setParams(PRESETS.prec!)}>{t.pPrec}</button>
        <button className="bh-control" onClick={() => setParams(PRESETS.isco!)}>{t.pIsco}</button>
        <button className="bh-control" onClick={() => setParams(PRESETS.plunge!)}>{t.pPlunge}</button>
        <button className="bh-control" onClick={() => api.current?.reset(params)}>{t.reset}</button>

        <div className="bh-toolbar__sep bh-toolbar__hide-sm" />

        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.L}</span>
          <input type="range" min={1.55} max={5} step={0.01} value={params.L}
            onChange={(e) => setParams((p) => ({ ...p, L: parseFloat(e.target.value) }))} style={{ width: 88 }} />
          <span style={{ width: 30, textAlign: "right" }}>{params.L.toFixed(2)}</span>
        </label>
        <label className="bh-control bh-toolbar__hide-sm">
          <span>{t.r0}</span>
          <input type="range" min={3} max={30} step={0.2} value={params.r0}
            onChange={(e) => setParams((p) => ({ ...p, r0: parseFloat(e.target.value) }))} style={{ width: 88 }} />
          <span style={{ width: 30, textAlign: "right" }}>{params.r0.toFixed(1)}</span>
        </label>
        <label className={`bh-control${(params.incl ?? 0) > 0 ? " bh-control--active" : ""}`}>
          <span>{t.incl}</span>
          <input type="range" min={0} max={1.4} step={0.05} value={params.incl ?? 0}
            onChange={(e) => setParams((p) => ({ ...p, incl: parseFloat(e.target.value) }))} style={{ width: 72 }} />
          <span style={{ width: 30, textAlign: "right" }}>{Math.round((params.incl ?? 0) * 180 / Math.PI)}°</span>
        </label>

        <button className={`bh-control bh-toolbar__hide-sm${diskOn ? " bh-control--active" : ""}`} onClick={() => setDiskOn((v) => !v)}>{t.disk}</button>

        <div className="bh-toolbar__sep" />
        <Link href={simHref} className="bh-control bh-toolbar__hide-sm">{t.sim}</Link>
        <Link href={aboutHref} className="bh-control bh-toolbar__hide-sm">{t.about}</Link>
        <Link href={locale === "it" ? "/lab" : "/en/lab"} className="bh-control">{t.back}</Link>
      </div>

      <div className="bh-canvas-wrap">
        <OrbitScene quality={quality} diskOn={diskOn} params={params} apiRef={api} readoutRef={readout}
          onPlace={(r0, phi0) => setParams((p) => ({ ...p, r0, phi0 }))} />
        <p className="bh-hint bh-hint--hide-sm">{t.hint}</p>

        <div className="bh-readout">
          <div><span>{t.rLbl}</span><b>{r.toFixed(2)} rₛ</b></div>
          <div><span>{t.vLbl}</span><b style={{ color: vel > 0.5 ? "#ffd27a" : "#dfe8f5" }}>{vel.toFixed(3)} c</b></div>
          <div><span>{t.eLbl}</span><b>{E.toFixed(4)}</b></div>
          <div><span>L</span><b>{params.L.toFixed(3)}</b></div>
          <div><span>{t.precLbl}</span><b>{status === "plunged" ? "—" : `${prec.toFixed(1)}°`}</b></div>
          <div><span>{t.driftLbl}</span><b style={{ color: "#7fe0a0" }}>{drift > 0 ? drift.toExponential(1) : "—"}</b></div>
          <div><span>{t.status}</span><b style={{ color: status === "plunged" ? "#ff7a5c" : "#7fe0a0" }}>{status === "plunged" ? t.plunged : t.orbiting}</b></div>
        </div>

        {infoOpen ? (
          <div className="bh-disclosure" role="note">
            <div className="bh-disclosure__head">
              <span className="bh-disclosure__title">{t.info}</span>
              <button className="bh-disclosure__close" onClick={() => setInfoOpen(false)} aria-label="×">×</button>
            </div>
            <p className="bh-disclosure__text">{t.hint}</p>
            <Link href={aboutHref} className="bh-disclosure__more">{t.about} →</Link>
          </div>
        ) : (
          <button className="bh-disclosure__reopen" onClick={() => setInfoOpen(true)}>ⓘ</button>
        )}
      </div>
    </div>
  );
}
