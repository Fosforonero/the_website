"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SOLAR_BODIES, SOLAR_SOURCES } from "@/lib/solar-system/bodies";
import { SOLAR_ASSETS } from "@/lib/solar-system/assets";
import { SOLAR_UI, type SolarLocale } from "@/lib/solar-system/i18n";
import type { ScaleBrightnessMode } from "@/lib/solar-system/scales";
import type {
  ScaleDistanceMode,
  ScaleRadiusMode,
  SolarBodyCategory,
} from "@/lib/solar-system/bodies";
import {
  formatAxialTilt,
  formatRotationPeriod,
  formatRotationDirection,
} from "@/lib/solar-system/rotation-model";
import type { CatalogCategory } from "@/lib/solar-system/catalog";
import { catalogCategoryLabel } from "@/lib/solar-system/catalog-filter";
import type { CatalogLayerSpec } from "./solar-system-scene";
import { REFERENCE_FRAME, AXIAL_TILT_RENDERING_NOTE } from "@/lib/solar-system/reference-frames";
import {
  DISTANCE_MODE_DISCLAIMERS,
  RADIUS_MODE_DISCLAIMERS,
} from "@/lib/solar-system/scales";
import { LIGHTING_DISCLOSURE } from "@/lib/solar-system/lighting-model";

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
  // Note: centaur and spacecraft are for catalog layer only,
  // not shown in the main body browser
];

const SPEED_OPTIONS = [
  { key: "realtime",          daysPerSecond: 1 / 86400 },
  { key: "day-per-second",    daysPerSecond: 1 },
  { key: "month-per-second",  daysPerSecond: 30 },
  { key: "year-per-second",   daysPerSecond: 365.25 },
] as const;

type SpeedKey = typeof SPEED_OPTIONS[number]["key"];

const CATALOG_FILES: Partial<Record<CatalogCategory, string>> = {
  "asteroid-neo": "neo.json",
  "asteroid-mba": "mba-top5000.json",
  comet:          "comets.json",
  tno:            "tnos.json",
  centaur:        "centaurs.json",
};

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
  // SSR-safe: initialise to a fixed reference epoch so server and client
  // render the same markup, then snap to the real current date after mount.
  const [epoch, setEpoch] = useState(946_728_000_000); // 2000-01-01T12:00:00Z
  useEffect(() => { setEpoch(Date.now()); }, []);
  const [playing, setPlaying] = useState(false);
  const [speedKey, setSpeedKey] = useState<SpeedKey>("year-per-second");
  const [distanceMode, setDistanceMode] = useState<ScaleDistanceMode>("compressed");
  const [radiusMode, setRadiusMode] = useState<ScaleRadiusMode>("visible");
  const [brightnessMode, setBrightnessMode] = useState<ScaleBrightnessMode>("educational");
  const [showAxes, setShowAxes] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [constellationsVisible, setConstellationsVisible] = useState(true);
  const [deepSkyVisible, setDeepSkyVisible] = useState(false);
  const [catalogEntries, setCatalogEntries] = useState<
    Map<CatalogCategory, import("@/lib/solar-system/catalog").CatalogEntry[]>
  >(new Map());
  const [visibleCatalog, setVisibleCatalog] = useState<Set<CatalogCategory>>(new Set());

  // ── Playback ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const option = SPEED_OPTIONS.find((o) => o.key === speedKey) ?? SPEED_OPTIONS[3];
    const msPerDay = 86_400_000;
    let lastTime: number | null = null;
    let rafId: number;

    function tick(now: number) {
      if (lastTime !== null) {
        const deltaMs = now - lastTime;
        const deltaDays = (deltaMs / 1000) * option.daysPerSecond;
        setEpoch((prev) => prev + deltaDays * msPerDay);
      }
      lastTime = now;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing, speedKey]);

  // ── Derived: selected body ────────────────────────────────────────────────
  // SOLAR_BODIES always contains at least the Sun, so the fallback is safe.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selectedBody = SOLAR_BODIES.find((b) => b.id === selectedBodyId)!;
  const parentBody = selectedBody.parentId
    ? SOLAR_BODIES.find((b) => b.id === selectedBody.parentId)
    : null;
  const asset = SOLAR_ASSETS.find((a) => a.bodyId === selectedBodyId);

  // ── Derived: grouped bodies for browser ──────────────────────────────────
  const grouped = CATEGORY_ORDER.map((cat) => {
    const label = (t.categories as Record<string, string>)[cat] ?? cat;
    return {
      category: cat,
      label,
      bodies: SOLAR_BODIES.filter((b) => b.category === cat),
    };
  }).filter((g) => g.bodies.length > 0);

  // ── Memoised Date object for SolarSystemScene ─────────────────────────────
  const epochDate = useMemo(() => new Date(epoch), [epoch]);

  // ── Date input handler ────────────────────────────────────────────────────
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (!v) return;
    const ms = new Date(v).getTime();
    if (!isNaN(ms)) setEpoch(ms);
  }

  // ── Catalog loader / toggle ───────────────────────────────────────────────
  async function loadCatalogLayer(cat: CatalogCategory) {
    if (catalogEntries.has(cat)) return;
    const file = CATALOG_FILES[cat];
    if (!file) return;
    try {
      const res = await fetch(`/lab/solar-system/catalog/${file}`);
      if (!res.ok) return;
      const { decodeCatalogChunk } = await import("@/lib/solar-system/catalog");
      const chunk = decodeCatalogChunk(await res.json() as Parameters<typeof decodeCatalogChunk>[0]);
      setCatalogEntries((prev) => new Map(prev).set(cat, chunk.entries));
    } catch (e) {
      console.error("Failed to load catalog layer:", cat, e);
    }
  }

  function toggleCatalogLayer(cat: CatalogCategory) {
    setVisibleCatalog((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
        void loadCatalogLayer(cat);
      }
      return next;
    });
  }

  // ── Derived: catalog layer specs ──────────────────────────────────────────
  const catalogLayerSpecs: CatalogLayerSpec[] = Array.from(catalogEntries.entries()).map(
    ([category, entries]) => ({ category, entries, visible: visibleCatalog.has(category) })
  );

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
            value={speedKey}
            onChange={(e) => setSpeedKey(e.target.value as SpeedKey)}
          >
            {SPEED_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {t.speeds[o.key]}
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

        {/* Brightness mode */}
        <label className="solar-control solar-toolbar__hide-sm">
          <span>{t.brightnessMode}</span>
          <select
            value={brightnessMode}
            onChange={(e) => setBrightnessMode(e.target.value as ScaleBrightnessMode)}
          >
            {(["educational", "physical"] as ScaleBrightnessMode[]).map((m) => (
              <option key={m} value={m}>{t.brightnessModes[m]}</option>
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

        {/* Axis markers toggle */}
        <button
          className={`solar-control solar-toolbar__hide-sm${showAxes ? " solar-control--active" : ""}`}
          onClick={() => setShowAxes((v) => !v)}
        >
          {t.axisMarkers}
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

        <div className="solar-toolbar__sep solar-toolbar__hide-sm" />
        {(Object.keys(CATALOG_FILES) as CatalogCategory[]).map((cat) => {
          const count = catalogEntries.get(cat)?.length;
          const active = visibleCatalog.has(cat);
          return (
            <button
              key={cat}
              className={`solar-control solar-toolbar__hide-sm${active ? " solar-control--active" : ""}`}
              onClick={() => toggleCatalogLayer(cat)}
              title={catalogCategoryLabel(cat, locale)}
            >
              {catalogCategoryLabel(cat, locale)}
              {count !== undefined && ` (${count.toLocaleString()})`}
            </button>
          );
        })}

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
          brightnessMode={brightnessMode}
          onSelectBody={setSelectedBodyId}
          labelsVisible={labelsVisible}
          constellationsVisible={constellationsVisible}
          deepSkyVisible={deepSkyVisible}
          showAxes={showAxes}
          catalogLayers={catalogLayerSpecs}
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
          {(t.categories as Record<string, string>)[selectedBody.category] ?? selectedBody.category}
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
        <div className="solar-inspector__row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span className="solar-inspector__label">{t.radiusMode}</span>
          <span className="solar-inspector__value" style={{ fontSize: "0.60rem", color: "#4a7090" }}>
            {t.radiusModes[radiusMode]} — {locale === "it"
              ? "il raggio visivo è scalato indipendentemente dalla distanza."
              : "visual radius is scaled independently from orbital distance."}
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

        {/* Axial tilt */}
        {selectedBody.axialTiltDeg !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.axialTilt}</span>
            <span className="solar-inspector__value">
              {formatAxialTilt(selectedBody, locale)}
            </span>
          </div>
        )}

        {/* Rotation period */}
        {selectedBody.siderealRotationHours !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.rotationPeriod}</span>
            <span className="solar-inspector__value">
              {formatRotationPeriod(selectedBody, locale)}
            </span>
          </div>
        )}

        {/* Rotation direction */}
        {selectedBody.rotationDirection !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.rotationDirection}</span>
            <span className="solar-inspector__value">
              {formatRotationDirection(selectedBody, locale)}
            </span>
          </div>
        )}

        {/* Ring system */}
        {selectedBody.ringInnerKm !== undefined && selectedBody.ringOuterKm !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.ringSystem}</span>
            <span className="solar-inspector__value" style={{ fontSize: "0.65rem" }}>
              {selectedBody.ringInnerKm.toLocaleString()}–{selectedBody.ringOuterKm.toLocaleString()} km
            </span>
          </div>
        )}

        <div className="solar-inspector__row">
          <span className="solar-inspector__label">{t.epoch}</span>
          <span className="solar-inspector__value">
            {new Date(epoch).toISOString().slice(0, 10)}
          </span>
        </div>

        {/* Reference frame */}
        <div className="solar-inspector__row">
          <span className="solar-inspector__label">{t.referenceFrame}</span>
          <span className="solar-inspector__value" style={{ fontSize: "0.65rem" }}>
            {REFERENCE_FRAME.id}
          </span>
        </div>

        {/* Position accuracy */}
        <div className="solar-inspector__row">
          <span className="solar-inspector__label">{t.positionAccuracy}</span>
          <span className="solar-inspector__value" style={{ fontSize: "0.65rem", color: "#7aa0c0" }}>
            educational-keplerian
          </span>
        </div>

        {selectedBody.axialTiltDeg !== undefined && (
          <div className="solar-inspector__row">
            <span className="solar-inspector__label">{t.rotationAccuracy}</span>
            <span
              className="solar-inspector__value"
              style={{ fontSize: "0.60rem", color: "#4a7090", lineHeight: 1.3 }}
              title={AXIAL_TILT_RENDERING_NOTE[locale]}
            >
              axial-tilt-approximate
            </span>
          </div>
        )}

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

        {selectedBody.category === "moon" && (
          <p style={{ fontSize: "0.62rem", color: "#4a7090", lineHeight: 1.5, margin: 0 }}>
            {t.moonScaleNote}
          </p>
        )}

        {/* Active scale modes disclosure */}
        <div className="solar-inspector__divider" />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span className="solar-inspector__label" style={{ fontSize: "0.62rem" }}>{t.activeScales}</span>
          <p style={{ fontSize: "0.60rem", color: "#4a7090", lineHeight: 1.4, margin: 0 }}>
            {DISTANCE_MODE_DISCLAIMERS[distanceMode][locale]}
          </p>
          <p style={{ fontSize: "0.60rem", color: "#4a7090", lineHeight: 1.4, margin: 0 }}>
            {RADIUS_MODE_DISCLAIMERS[radiusMode][locale]}
          </p>
          <p style={{ fontSize: "0.60rem", color: "#4a7090", lineHeight: 1.4, margin: 0 }}>
            {LIGHTING_DISCLOSURE[brightnessMode][locale]}
          </p>
        </div>

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
