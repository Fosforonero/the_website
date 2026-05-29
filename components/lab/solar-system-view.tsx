"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SOLAR_BODIES, SOLAR_SOURCES } from "@/lib/solar-system/bodies";
import { SOLAR_ASSETS } from "@/lib/solar-system/assets";
import { SOLAR_UI, type SolarLocale } from "@/lib/solar-system/i18n";
import type {
  ScaleDistanceMode,
  ScaleRadiusMode,
  SolarBodyCategory,
} from "@/lib/solar-system/bodies";

// ---------------------------------------------------------------------------
// Dynamic import — required so WebGL Canvas never runs on the server
// ---------------------------------------------------------------------------

const SolarSystemScene = dynamic(
  () => import("./solar-system-scene"),
  {
    ssr: false,
    loading: () => <div className="solar-loading">Initialising scene…</div>,
  }
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KOFI_URL = "https://ko-fi.com/fosforonero";

const CATEGORY_ORDER: SolarBodyCategory[] = [
  "star",
  "planet",
  "dwarf-planet",
  "moon",
  "asteroid",
  "comet",
  "tno",
];

const SPEED_OPTIONS = [1, 24, 365, 3650] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SolarSystemViewProps = {
  locale: SolarLocale;
};

// ---------------------------------------------------------------------------
// Helper: format mass in scientific notation
// ---------------------------------------------------------------------------

function formatMass(massKg: number): string {
  const exp = Math.floor(Math.log10(massKg));
  const mantissa = massKg / Math.pow(10, exp);
  return `${mantissa.toFixed(2)} × 10^${exp} kg`;
}

// ---------------------------------------------------------------------------
// Helper: format date value for <input type="date">
// ---------------------------------------------------------------------------

function toDateInputValue(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SolarSystemView({ locale }: SolarSystemViewProps) {
  const t = SOLAR_UI[locale];

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedBodyId, setSelectedBodyId] = useState("earth");
  const [epoch, setEpoch] = useState(() => Date.now());
  const [playing, setPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(365);
  const [distanceMode, setDistanceMode] = useState<ScaleDistanceMode>("compressed");
  const [radiusMode, setRadiusMode] = useState<ScaleRadiusMode>("visible");
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [constellationsVisible, setConstellationsVisible] = useState(true);
  const [deepSkyVisible, setDeepSkyVisible] = useState(false);

  // ── Playback ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setEpoch((prev) => prev + speedMultiplier * 100);
    }, 100);
    return () => clearInterval(id);
  }, [playing, speedMultiplier]);

  // ── Derived: selected body ────────────────────────────────────────────────
  // SOLAR_BODIES always contains at least the Sun, so the fallback is safe.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selectedBody = SOLAR_BODIES.find((b) => b.id === selectedBodyId)!;
  const parentBody = selectedBody.parentId
    ? SOLAR_BODIES.find((b) => b.id === selectedBody.parentId)
    : null;
  const asset = SOLAR_ASSETS.find((a) => a.bodyId === selectedBodyId);

  // ── Derived: grouped bodies for browser ──────────────────────────────────
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: t.categories[cat],
    bodies: SOLAR_BODIES.filter((b) => b.category === cat),
  })).filter((g) => g.bodies.length > 0);

  // ── Memoised Date object for SolarSystemScene ─────────────────────────────
  const epochDate = useMemo(() => new Date(epoch), [epoch]);

  // ── Date input handler ────────────────────────────────────────────────────
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (!v) return;
    const ms = new Date(v).getTime();
    if (!isNaN(ms)) setEpoch(ms);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="solar-root">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="solar-toolbar">
        <span className="solar-toolbar__title">{t.title}</span>
        <div className="solar-toolbar__sep" />

        {/* Now button */}
        <button
          className="solar-control"
          onClick={() => setEpoch(Date.now())}
          title={t.nowBtn}
        >
          {t.nowBtn}
        </button>

        {/* Date picker */}
        <label className="solar-control">
          <input
            type="date"
            value={toDateInputValue(epoch)}
            onChange={handleDateChange}
          />
        </label>

        {/* Play / Pause */}
        <button
          className={`solar-control${playing ? " solar-control--active" : ""}`}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? t.pauseBtn : t.playBtn}
        </button>

        {/* Speed selector */}
        <label className="solar-control">
          <span>{t.speed}</span>
          <select
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t.speeds[String(s) as keyof typeof t.speeds]}
              </option>
            ))}
          </select>
        </label>

        <div className="solar-toolbar__sep solar-toolbar__hide-sm" />

        {/* Distance mode */}
        <label className="solar-control solar-toolbar__hide-sm">
          <span>{t.distanceMode}</span>
          <select
            value={distanceMode}
            onChange={(e) => setDistanceMode(e.target.value as ScaleDistanceMode)}
          >
            {(["compressed", "real-log", "inner-system"] as ScaleDistanceMode[]).map((m) => (
              <option key={m} value={m}>
                {t.distanceModes[m]}
              </option>
            ))}
          </select>
        </label>

        {/* Radius mode */}
        <label className="solar-control solar-toolbar__hide-sm">
          <span>{t.radiusMode}</span>
          <select
            value={radiusMode}
            onChange={(e) => setRadiusMode(e.target.value as ScaleRadiusMode)}
          >
            {(["visible", "relative"] as ScaleRadiusMode[]).map((m) => (
              <option key={m} value={m}>
                {t.radiusModes[m]}
              </option>
            ))}
          </select>
        </label>

        <div className="solar-toolbar__sep solar-toolbar__hide-sm" />

        {/* Label toggle */}
        <button
          className={`solar-control${labelsVisible ? " solar-control--active" : ""}`}
          onClick={() => setLabelsVisible((v) => !v)}
        >
          {t.labels}
        </button>

        {/* Constellation toggle */}
        <button
          className={`solar-control${constellationsVisible ? " solar-control--active" : ""}`}
          onClick={() => setConstellationsVisible((v) => !v)}
        >
          {t.constellations}
        </button>

        {/* Deep sky toggle */}
        <button
          className={`solar-control${deepSkyVisible ? " solar-control--active" : ""}`}
          onClick={() => setDeepSkyVisible((v) => !v)}
        >
          {t.deepSky}
        </button>

        {/* Ko-fi */}
        <a
          className="solar-kofi solar-toolbar__hide-sm"
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ {t.support}
        </a>
      </div>

      {/* ── Canvas ───────────────────────────────────────────────────────── */}
      <div className="solar-canvas-wrap">
        <SolarSystemScene
          epoch={epochDate}
          selectedBodyId={selectedBodyId}
          distanceMode={distanceMode}
          radiusMode={radiusMode}
          onSelectBody={setSelectedBodyId}
          labelsVisible={labelsVisible}
          constellationsVisible={constellationsVisible}
          deepSkyVisible={deepSkyVisible}
        />
      </div>

      {/* ── Object browser (left) ─────────────────────────────────────────── */}
      <div className="solar-browser">
        {grouped.map(({ category, label, bodies }) => (
          <div key={category}>
            <div className="solar-browser__section">{label}</div>
            {bodies.map((body) => (
              <button
                key={body.id}
                className={[
                  "solar-browser__item",
                  body.category === "moon" ? "solar-browser__item--moon" : "",
                  body.id === selectedBodyId ? "solar-browser__item--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedBodyId(body.id)}
              >
                <span
                  className="solar-browser__dot"
                  style={{ background: body.color }}
                />
                {body.name[locale]}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── Inspector (right) ─────────────────────────────────────────────── */}
      <div className="solar-inspector">
        <div className="solar-inspector__heading">{t.inspector}</div>
        <div className="solar-inspector__name">{selectedBody.name[locale]}</div>
        <span className="solar-inspector__badge">
          {t.categories[selectedBody.category]}
        </span>

        <div className="solar-inspector__divider" />

        {parentBody && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.parent}</span>
            <span className="solar-inspector__value">
              {parentBody.name[locale]}
            </span>
          </div>
        )}

        <div className="solar-inspector__row">
          <span className="solar-inspector__label">{t.radius}</span>
          <span className="solar-inspector__value">
            {selectedBody.radiusKm.toLocaleString()} km
          </span>
        </div>

        {selectedBody.massKg !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.mass}</span>
            <span className="solar-inspector__value">
              {formatMass(selectedBody.massKg)}
            </span>
          </div>
        )}

        <div className="solar-inspector__row">
          <span className="solar-inspector__label">{t.epoch}</span>
          <span className="solar-inspector__value">
            {new Date(epoch).toISOString().slice(0, 10)}
          </span>
        </div>

        <div className="solar-inspector__divider" />

        {/* Sources */}
        {selectedBody.sourceIds.length > 0 && (
          <div className="solar-inspector__row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
            <span className="solar-inspector__label">{t.source}</span>
            {selectedBody.sourceIds.map((sid) => {
              const src = SOLAR_SOURCES[sid as keyof typeof SOLAR_SOURCES];
              return src ? (
                <span key={sid} className="solar-inspector__value" style={{ textAlign: "left" }}>
                  {src.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Asset confidence */}
        {asset && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.assetConfidence}</span>
            <span className="solar-inspector__value">{asset.confidence}</span>
          </div>
        )}

        <div className="solar-inspector__divider" />

        {/* Epoch disclaimer */}
        <p
          style={{
            fontSize: "0.62rem",
            color: "#4a7090",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {t.epochNote}
        </p>

        {/* Firmament source */}
        <p
          style={{
            fontSize: "0.62rem",
            color: "#4a7090",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {t.firmamentSource}
        </p>

        <div className="solar-inspector__divider" />

        {/* Link to about page */}
        <Link
          href={locale === "it" ? "/lab/sistema-solare/about" : "/en/lab/solar-system/about"}
          className="solar-control"
          style={{ justifyContent: "center", textDecoration: "none" }}
        >
          {t.sourcesPage}
        </Link>

        {/* Ko-fi compact */}
        <a
          className="solar-kofi"
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ justifyContent: "center" }}
        >
          ☕ {t.support}
        </a>
      </div>
    </div>
  );
}
