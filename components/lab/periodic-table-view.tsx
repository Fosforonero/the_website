"use client";

import { useState, useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ELEMENTS, CATEGORY_COLOR, gridPosition, type Element } from "@/lib/elements-data";
import {
  EXTENDED, STATE_COLOR, BLOCK_COLOR,
  type ThematicProperty, type ElementExtended,
  type ElementState, type ElementBlock, type Isotope,
} from "@/lib/element-extended-data";
import type { AtomModel, VdWStyle } from "./atom-scene";
import type { Locale } from "@/lib/site";
import {
  ELEMENT_NAMES_EN, CATEGORY_LABELS_EN, STATE_LABELS, BLOCK_LABELS,
  LAB_UI_TRANSLATIONS, ELEMENT_DESCRIPTIONS_EN,
} from "@/lib/elements-i18n";

export interface ThematicPropertyDefinition {
  key: ThematicProperty;
  label: string;
  unit: string;
  description: string;
  logScale?: boolean;
}

const AtomScene = dynamic(
  () => import("./atom-scene").then((m) => m.AtomScene),
  { ssr: false, loading: () => <div className="atom-loading">...</div> }
);

// ─── Static data (Italian defaults) ──────────────────────────────────────────

const CATEGORY_LABELS_IT: Record<string, string> = {
  "alkali-metal":          "Metalli alcalini",
  "alkaline-earth":        "Alcalino-terrosi",
  "transition-metal":      "Metalli di transizione",
  "post-transition-metal": "Post-transizione",
  "metalloid":             "Metalloidi",
  "nonmetal":              "Non-metalli",
  "halogen":               "Alogeni",
  "noble-gas":             "Gas nobili",
  "lanthanide":            "Lantanidi",
  "actinide":              "Attinidi",
  "unknown":               "Sconosciuto",
};

const getCategoryLabel = (cat: string, locale: Locale): string => {
  if (locale === "en") {
    return CATEGORY_LABELS_EN[cat as keyof typeof CATEGORY_LABELS_EN] || cat;
  }
  return CATEGORY_LABELS_IT[cat] || cat;
};

const getModels = (locale: Locale) => {
  const t = LAB_UI_TRANSLATIONS[locale];
  return [
    { key: "thomson",    label: "Thomson",     year: 1904, desc: t.modelDescThomson },
    { key: "rutherford", label: "Rutherford",  year: 1911, desc: t.modelDescRutherford },
    { key: "bohr",       label: "Bohr",        year: 1913, desc: t.modelDescBohr },
    { key: "sommerfeld", label: "Sommerfeld",  year: 1916, desc: t.modelDescSommerfeld },
    { key: "quantum",    label: locale === "en" ? "Quantum" : "Quantistico", year: 1926, desc: t.modelDescQuantum },
  ] as const;
};

const getThematicProperties = (locale: Locale): ThematicPropertyDefinition[] => {
  return [
    { key: "none",              label: locale === "en" ? "Category" : "Categoria",          unit: "",        description: locale === "en" ? "Color by chemical category" : "Colore per categoria chimica" },
    { key: "electronegativity", label: locale === "en" ? "Electronegativity" : "Elettronegatività",  unit: "Pauling", description: locale === "en" ? "Pauling scale (0.79 – 3.98)" : "Scala di Pauling (0,79 – 3,98)" },
    { key: "atomicRadius",      label: locale === "en" ? "VdW radius" : "Raggio vdW",            unit: "pm",      description: locale === "en" ? "Van der Waals radius (pm)" : "Raggio di van der Waals (pm)" },
    { key: "covalentRadius",    label: locale === "en" ? "Covalent radius" : "Raggio covalente", unit: "pm",      description: locale === "en" ? "Single-bond covalent radius (pm)" : "Raggio covalente di legame singolo (pm)" },
    { key: "ionizationEnergy",  label: locale === "en" ? "Ionization I" : "Ionizzazione I",     unit: "kJ/mol",  description: locale === "en" ? "First ionization energy (kJ/mol)" : "Prima energia di ionizzazione (kJ/mol)" },
    { key: "density",           label: locale === "en" ? "Density" : "Densità",            unit: "g/cm³",   description: locale === "en" ? "Density at standard conditions (g/cm³)" : "Densità a condizioni standard (g/cm³)" },
    { key: "meltingPoint",      label: locale === "en" ? "Melting" : "Fusione",            unit: "K",       description: locale === "en" ? "Melting temperature (K)" : "Temperatura di fusione (K)" },
    { key: "boilingPoint",      label: locale === "en" ? "Boiling" : "Ebollizione",        unit: "K",       description: locale === "en" ? "Boiling temperature (K)" : "Temperatura di ebollizione (K)" },
    { key: "electronAffinity",  label: locale === "en" ? "Electron affinity" : "Affinità e⁻",        unit: "kJ/mol",  description: locale === "en" ? "Electron affinity (kJ/mol; positive = exothermic)" : "Affinità elettronica (kJ/mol; positivo = esotermica)" },
    { key: "crustAbundance",    label: locale === "en" ? "Crust abundance" : "Abbondanza crosta",  unit: "mg/kg",   description: locale === "en" ? "Abundance in Earth's crust (logarithmic scale)" : "Abbondanza nella crosta terrestre (scala logaritmica)", logScale: true },
    { key: "state",             label: locale === "en" ? "Physical state" : "Stato fisico",       unit: "",        description: locale === "en" ? "State at 25°C, 1 atm" : "Stato a 25°C, 1 atm" },
    { key: "block",             label: locale === "en" ? "Electron block" : "Blocco elettronico", unit: "",        description: locale === "en" ? "s, p, d or f block of the configuration" : "Blocco s, p, d o f della configurazione" },
  ];
};

// ─── Temperature / oxidation helpers ─────────────────────────────────────────

function fmtTemp(k: number | null): string {
  if (k === null) return "—";
  const c = k - 273.15;
  const f = c * 9 / 5 + 32;
  return `${k.toFixed(0)} K · ${c.toFixed(0)} °C · ${f.toFixed(0)} °F`;
}

function oxColor(n: number): string {
  if (n === 0) return "#6b7280";
  if (n > 0) {
    const p = ["#fbbf24", "#f97316", "#ef4444", "#b91c1c", "#7f1d1d", "#4c0519"];
    return p[Math.min(n - 1, p.length - 1)]!;
  }
  const p = ["#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];
  return p[Math.min(-n - 1, p.length - 1)]!;
}

// ─── Share helper ─────────────────────────────────────────────────────────────

function shareElement(el: Element, locale: Locale, name: string) {
  const prefix = locale === "en" ? "/en" : "";
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}${prefix}/lab/tavola-periodica?z=${el.z}`;
  const shareTitle = locale === "en" ? "Interactive Periodic Table 3D" : "Tavola Periodica Interattiva";
  if (navigator.share) {
    navigator.share({ title: `${name} (${el.sym}) — ${shareTitle}`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).catch(() => {});
  }
}

// ─── Thematic color helpers ───────────────────────────────────────────────────

function lerpColor(a: [number,number,number], b: [number,number,number], t: number): string {
  const r = Math.round(a[0] + (b[0]-a[0])*t);
  const g = Math.round(a[1] + (b[1]-a[1])*t);
  const bl = Math.round(a[2] + (b[2]-a[2])*t);
  return `rgb(${r},${g},${bl})`;
}

// viridis-inspired: blue → teal → green → yellow → red
const HEAT_STOPS: Array<[number,number,number]> = [
  [37,99,235],   // blue  t=0
  [6,182,212],   // cyan  t=0.25
  [16,185,129],  // teal  t=0.5
  [245,158,11],  // amber t=0.75
  [220,38,38],   // red   t=1
];

function heatmapColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const seg  = clamped * (HEAT_STOPS.length - 1);
  const idx  = Math.min(Math.floor(seg), HEAT_STOPS.length - 2);
  const frac = seg - idx;
  return lerpColor(HEAT_STOPS[idx]!, HEAT_STOPS[idx + 1]!, frac);
}

const getThematicPropertiesRangeMap = (thematicProp: ThematicProperty) => {
  const def = getThematicProperties("it").find(p => p.key === thematicProp);
  const values = Object.values(EXTENDED)
    .map(e => e[thematicProp as keyof ElementExtended])
    .filter((v): v is number => typeof v === "number" && v > 0)
    .map(v => def?.logScale ? Math.log10(v) : v);
  if (values.length === 0) return null;
  return [Math.min(...values), Math.max(...values)] as [number, number];
};

function getThematicValueText(el: Element, prop: ThematicProperty, locale: Locale): string {
  if (prop === "none") return "";
  const ext = EXTENDED[el.z];
  if (!ext) return "—";
  if (prop === "state") return STATE_LABELS[locale][ext.state];
  if (prop === "block") return BLOCK_LABELS[locale][ext.block];
  const raw = ext[prop as keyof ElementExtended] as number | null;
  if (raw === null) return "—";
  const [dec, unit] = ((): [number, string] => {
    switch (prop) {
      case "electronegativity": return [2, "Pauling"];
      case "atomicRadius":      return [0, "pm"];
      case "ionizationEnergy":  return [1, "kJ/mol"];
      case "density":           return [3, "g/cm³"];
      case "meltingPoint":      return [0, "K"];
      case "boilingPoint":      return [0, "K"];
      case "electronAffinity":  return [1, "kJ/mol"];
      case "crustAbundance":    return [2, "mg/kg"];
      default:                  return [2, ""];
    }
  })();
  return `${raw.toFixed(dec)} ${unit}`.trim();
}

function getThematicColor(el: Element, prop: ThematicProperty, range: [number,number] | null): string {
  if (prop === "none") return CATEGORY_COLOR[el.category]!;
  const ext = EXTENDED[el.z];
  if (!ext) return "#6b7280";
  if (prop === "state") return STATE_COLOR[ext.state] ?? "#6b7280";
  if (prop === "block") return BLOCK_COLOR[ext.block] ?? "#6b7280";
  const raw = ext[prop as keyof ElementExtended] as number | null;
  if (raw === null || !range) return "#4b5563";
  const def = getThematicProperties("it").find(p => p.key === prop);
  const value = def?.logScale ? Math.log10(Math.max(raw, 1e-12)) : raw;
  return heatmapColor((value - range[0]) / (range[1] - range[0]));
}

// ─── Light mode background options ───────────────────────────────────────────

const LIGHT_BACKGROUNDS = [
  { key: "sky",      color: "#e8ecf5", label: { it: "cielo", en: "sky" } },
  { key: "cream",    color: "#f2ede4", label: { it: "crema", en: "cream" } },
  { key: "lavender", color: "#edeaf5", label: { it: "lavanda", en: "lavender" } },
] as const;

type LightBgKey = typeof LIGHT_BACKGROUNDS[number]["key"];

// ─── Search helpers ───────────────────────────────────────────────────────────

function matchesSearch(el: Element, q: string, locale: Locale): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase().trim();
  const name = locale === "en" ? (ELEMENT_NAMES_EN[el.z] || el.name) : el.name;
  return (
    name.toLowerCase().includes(lower) ||
    el.sym.toLowerCase() === lower ||
    el.z.toString() === lower.replace(/^0+/, "")
  );
}

// ─── Compact value for in-cell display ───────────────────────────────────────

function getCellDisplayText(el: Element, prop: ThematicProperty): string {
  if (prop === "none") return "";
  const ext = EXTENDED[el.z];
  if (!ext) return "—";
  if (prop === "state") {
    const m: Record<string, string> = { solid: "S", liquid: "L", gas: "G", synthetic: "⊕" };
    return m[ext.state] ?? "";
  }
  if (prop === "block") return ext.block;
  const raw = ext[prop as keyof ElementExtended] as number | null;
  if (raw === null) return "—";
  switch (prop) {
    case "electronegativity": return raw.toFixed(2);
    case "atomicRadius":      return raw.toFixed(0);
    case "ionizationEnergy":  return raw.toFixed(0);
    case "density":           return raw < 1 ? raw.toFixed(3) : raw.toFixed(1);
    case "meltingPoint":      return raw.toFixed(0);
    case "boilingPoint":      return raw.toFixed(0);
    case "electronAffinity":  return raw.toFixed(1);
    case "crustAbundance":    return raw >= 1000 ? `${(raw / 1000).toFixed(1)}k` : raw.toFixed(1);
    default:                  return raw.toFixed(1);
  }
}

// ─── Element cell ─────────────────────────────────────────────────────────────

type CellProps = {
  el: Element; selected: boolean; onSelect: (el: Element) => void;
  thematicColor?: string; thematicProp?: ThematicProperty; negativeMode?: boolean;
  dimmed?: boolean; locale: Locale;
};

function ElementCell({ el, selected, onSelect, thematicColor, thematicProp, negativeMode, dimmed, locale }: CellProps) {
  const color = thematicColor ?? CATEGORY_COLOR[el.category];
  const name = locale === "en" ? (ELEMENT_NAMES_EN[el.z] || el.name) : el.name;
  const labelText = locale === "en" ? `${name}, atomic number ${el.z}` : `${name}, numero atomico ${el.z}`;
  const isThematic = thematicColor !== undefined;
  // Fill applies to both category and thematic mode; NEG removes fill
  const isFilled = !negativeMode;
  const cellVal = thematicProp && thematicProp !== "none" ? getCellDisplayText(el, thematicProp) : null;
  return (
    <button
      className={`pt-cell${selected ? " pt-cell--active" : ""}${dimmed ? " pt-cell--dim" : ""}${isFilled ? " pt-cell--filled" : ""}`}
      style={{ "--cat-color": color } as React.CSSProperties}
      onClick={() => onSelect(el)}
      title={`${name} — Z=${el.z}`}
      aria-label={labelText}
      aria-pressed={selected}
    >
      <span className="pt-cell__z" aria-hidden="true">{el.z}</span>
      <span className="pt-cell__sym">{el.sym}</span>
      {!isThematic && (
        <>
          <span className="pt-cell__name" aria-hidden="true">{name}</span>
          <span className="pt-cell__mass" aria-hidden="true">{el.mass}</span>
        </>
      )}
      {isThematic && cellVal && (
        <span className="pt-cell__val" aria-hidden="true">{cellVal}</span>
      )}
    </button>
  );
}

// col/row offsets: col 1 = period labels, row 1 = group headers
const C = (col: number) => col + 1;
const R = (row: number) => row + 1;

function PeriodicGrid({
  selected, onSelect, thematicProp, propRange, searchQuery, locale, negativeMode,
}: {
  selected: Element | null;
  onSelect: (el: Element) => void;
  thematicProp: ThematicProperty;
  propRange: [number, number] | null;
  searchQuery: string;
  locale: Locale;
  negativeMode: boolean;
}) {
  const hasSearch = searchQuery.trim().length > 0;
  const titleText = locale === "en" ? "Periodic table of elements" : "Tavola periodica degli elementi";
  return (
    <div className="pt-grid" role="grid" aria-label={titleText}>

      {/* ── Group headers (row 1, cols 2–19) ── */}
      {Array.from({ length: 18 }, (_, i) => i + 1).map(g => (
        <div key={`g${g}`} className="pt-group-label" style={{ gridColumn: C(g), gridRow: 1 }}>
          {g}
        </div>
      ))}

      {/* ── Period labels (col 1, rows 2–8) ── */}
      {[1, 2, 3, 4, 5, 6, 7].map(p => (
        <div key={`p${p}`} className="pt-period-label" style={{ gridColumn: 1, gridRow: R(p) }}>
          {p}{(p === 6 || p === 7) && <sup>*</sup>}
        </div>
      ))}

      {/* ── Elements ── */}
      {ELEMENTS.map((el) => {
        const { col, row } = gridPosition(el);
        return (
          <div key={el.z} className="pt-grid__cell" style={{ gridColumn: C(col), gridRow: R(row) }}>
            <ElementCell
              el={el}
              selected={selected?.z === el.z}
              onSelect={onSelect}
              locale={locale}
              thematicColor={thematicProp !== "none"
                ? getThematicColor(el, thematicProp, propRange)
                : undefined}
              thematicProp={thematicProp}
              negativeMode={negativeMode}
              dimmed={hasSearch && !matchesSearch(el, searchQuery, locale)}
            />
          </div>
        );
      })}

      {/* ── f-block gap markers (group 3 slot in periods 6–7) ── */}
      <div className="pt-grid__gap" style={{ gridColumn: C(3), gridRow: R(6) }}>
        <span className="pt-gap-label">*57–71</span>
      </div>
      <div className="pt-grid__gap" style={{ gridColumn: C(3), gridRow: R(7) }}>
        <span className="pt-gap-label">**89–103</span>
      </div>

      {/* ── f-block separator (row 9) ── */}
      <div className="pt-fblock-sep" style={{ gridColumn: "1 / span 19", gridRow: 9 }} />

      {/* ── f-block row labels ── */}
      <div className="pt-period-label pt-period-label--fblock" style={{ gridColumn: 1, gridRow: R(9) }}>
        *
      </div>
      <div className="pt-period-label pt-period-label--fblock" style={{ gridColumn: 1, gridRow: R(10) }}>
        **
      </div>

    </div>
  );
}

// ─── Info panel ───────────────────────────────────────────────────────────────

function fmt(val: number | null, decimals = 2, suffix = ""): string {
  if (val === null) return "—";
  return `${val.toFixed(decimals)}${suffix ? " " + suffix : ""}`;
}

function InfoPanel({ el, locale, onDragStart }: { el: Element; locale: Locale; onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void }) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const [descExpanded, setDescExpanded] = useState(false);
  const color = CATEGORY_COLOR[el.category];
  const A   = el.z + el.stableN;
  const ext: ElementExtended | undefined = EXTENDED[el.z];
  const DESC_LIMIT = 120;

  const name = locale === "en" ? (ELEMENT_NAMES_EN[el.z] || el.name) : el.name;
  const description = locale === "en" ? (ELEMENT_DESCRIPTIONS_EN[el.z] || ext?.description) : ext?.description;
  const descLabel = locale === "en" ? `Details of ${name}` : `Dettagli ${name}`;
  const shareLabel = locale === "en" ? `Share ${name}` : `Condividi ${name}`;

  return (
    <div className="pt-info" role="complementary" aria-label={descLabel}>
      <div className="pt-panel-drag" onMouseDown={onDragStart} onTouchStart={onDragStart} aria-hidden="true" />
      {/* Header */}
      <div className="pt-info__header" style={{ borderLeftColor: color }}>
        <div className="pt-info__header-top">
          <span className="pt-info__z">Z = {el.z}</span>
          <button
            className="pt-info__share"
            onClick={() => shareElement(el, locale, name)}
            title={shareLabel}
            aria-label={shareLabel}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        </div>
        <div className="pt-info__name-row">
          <h2 className="pt-info__name">{name}</h2>
          <span className="pt-info__sym" style={{ color }}>{el.sym}</span>
        </div>
        {ext && (
          <span className="pt-info__config" aria-label="Configurazione elettronica">
            {ext.config}
          </span>
        )}
      </div>

      {/* Scientific description — collapsible */}
      {description && (
        <div className="pt-info__desc-wrap">
          <p className="pt-info__desc">
            {descExpanded || description.length <= DESC_LIMIT
              ? description
              : description.slice(0, DESC_LIMIT) + "…"}
          </p>
          {description.length > DESC_LIMIT && (
            <button
              className="pt-info__desc-toggle"
              onClick={() => setDescExpanded(v => !v)}
              aria-expanded={descExpanded}
            >
              {descExpanded ? t.readLess : t.readMore}
            </button>
          )}
        </div>
      )}

      {/* Properties */}
      <dl className="pt-info__dl">
        <div><dt>{t.infoAtomicMass}</dt><dd>{el.mass} u</dd></div>
        <div>
          <dt>{t.infoStableIsotope}</dt>
          <dd><sup>{A}</sup>{el.sym}</dd>
        </div>
        {ext && ext.isotopes.length > 0 && (
          <div className="pt-info__iso-row">
            <dt>{t.infoNaturalIsotopes}</dt>
            <dd className="pt-info__isotopes">
              {ext.isotopes.map((iso: Isotope) => (
                <span key={iso.massNumber} className="pt-info__iso-badge">
                  <sup>{iso.massNumber}</sup>{el.sym}
                  {iso.abundance !== null && (
                    <span className="pt-info__iso-pct">
                      {iso.abundance < 0.1
                        ? iso.abundance.toFixed(3)
                        : iso.abundance < 1
                          ? iso.abundance.toFixed(2)
                          : iso.abundance.toFixed(1)}%
                    </span>
                  )}
                  {iso.name && <span className="pt-info__iso-name">{iso.name}</span>}
                </span>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt>{t.infoShellConfig}</dt>
          <dd className="pt-info__shells">{el.shells.join(" · ")} e⁻</dd>
        </div>
        {ext && <>
          <div>
            <dt>{t.infoBlockState}</dt>
            <dd>
              <span className="pt-info__block-badge" data-block={ext.block}>{BLOCK_LABELS[locale][ext.block]}</span>
              {" · "}
              <span style={{ color: STATE_COLOR[ext.state] }}>{STATE_LABELS[locale][ext.state]}</span>
            </dd>
          </div>
          <div>
            <dt>{t.infoElectronegativity}</dt>
            <dd>{fmt(ext.electronegativity, 2, "Pauling")}</dd>
          </div>
          <div>
            <dt>{t.infoAtomicRadius}</dt>
            <dd>{fmt(ext.atomicRadius, 0, "pm")}</dd>
          </div>
          {ext.covalentRadius !== null && (
            <div>
              <dt>{t.infoCovalentRadius}</dt>
              <dd>{fmt(ext.covalentRadius, 0, "pm")}</dd>
            </div>
          )}
          <div>
            <dt>{t.infoIonization}</dt>
            <dd>{fmt(ext.ionizationEnergy, 1, "kJ/mol")}</dd>
          </div>
          <div>
            <dt>{t.infoDensity}</dt>
            <dd>{fmt(ext.density, 3, "g/cm³")}</dd>
          </div>
          <div>
            <dt>{t.infoMelting}</dt>
            <dd>{fmtTemp(ext.meltingPoint)}</dd>
          </div>
          <div>
            <dt>{t.infoBoiling}</dt>
            <dd>{fmtTemp(ext.boilingPoint)}</dd>
          </div>
          {ext.oxidationStates.length > 0 && (
            <div className="pt-info__ox-row">
              <dt>{t.infoOxidation}</dt>
              <dd className="pt-info__ox-states">
                {ext.oxidationStates.map(n => (
                  <span
                    key={n}
                    className={`pt-info__ox-badge${n === ext.commonOxidation ? " pt-info__ox-badge--common" : ""}`}
                    style={{ "--ox-color": oxColor(n) } as React.CSSProperties}
                  >
                    {n > 0 ? `+${n}` : n === 0 ? "0" : String(n)}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {ext.discoverer && (
            <div>
              <dt>{t.infoDiscoveredBy}</dt>
              <dd>{ext.discoverer}{ext.discoveryYear ? `, ${ext.discoveryYear}` : ""}</dd>
            </div>
          )}
        </>}
        <div>
          <dt>{t.infoCategory}</dt>
          <dd style={{ color }}>{getCategoryLabel(el.category, locale)}</dd>
        </div>
        <div><dt>{t.infoPeriodGroup}</dt><dd>{el.period} / {el.group}</dd></div>
      </dl>
      <div className="pt-info__footer">
        <p className="pt-info__hint">{t.infoHint}</p>
        <a
          href="https://ko-fi.com/fosforonero"
          target="_blank"
          rel="noopener noreferrer"
          className="pt-info__kofi"
          title={locale === "en" ? "Support the project on Ko-fi" : "Supporta il progetto su Ko-fi"}
        >
          {t.infoSupport}
        </a>
      </div>
    </div>
  );
}

// ─── Category legend ──────────────────────────────────────────────────────────

function Legend({ locale }: { locale: Locale }) {
  const legendLabel = locale === "en" ? "Element categories" : "Categorie degli elementi";
  return (
    <div className="pt-legend" role="list" aria-label={legendLabel}>
      {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
        <div key={cat} className="pt-legend__item" role="listitem">
          <span className="pt-legend__dot" style={{ background: color }} aria-hidden="true" />
          <span className="pt-legend__label">{getCategoryLabel(cat, locale)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Thematic property selector ───────────────────────────────────────────────

function ThematicSelector({
  current, onChange, locale, negativeMode, onToggleNeg,
}: {
  current: ThematicProperty;
  onChange: (p: ThematicProperty) => void;
  locale: Locale;
  negativeMode: boolean;
  onToggleNeg: () => void;
}) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const props = getThematicProperties(locale);
  const grpLabel = locale === "en" ? "Thematic view property" : "Proprietà tematica";
  const negTitle = locale === "en" ? "Text only: show color in symbol" : "Solo testo: colore nel simbolo";
  return (
    <div className="pt-thematic-selector" role="group" aria-label={grpLabel}>
      <span className="pt-thematic-selector__lbl">{t.viewLabel}</span>
      {props.map(({ key, label, description }) => (
        <button
          key={key}
          className={`pt-thematic-btn${current === key ? " active" : ""}`}
          onClick={() => onChange(key)}
          title={description}
          aria-pressed={current === key}
        >
          {label}
        </button>
      ))}
      <span className="pt-thematic-sep" aria-hidden="true" />
      <button
        className={`pt-thematic-neg${negativeMode ? " active" : ""}`}
        onClick={onToggleNeg}
        title={negTitle}
        aria-pressed={negativeMode}
      >
        NEG
      </button>
    </div>
  );
}

// ─── Thematic heat-map legend bar ─────────────────────────────────────────────

function ThematicLegend({
  prop, range, locale,
}: {
  prop: ThematicProperty;
  range: [number, number] | null;
  locale: Locale;
}) {
  const def = getThematicProperties(locale).find(p => p.key === prop);
  if (!def || prop === "none") return null;

  if (prop === "state") {
    return (
      <div className="pt-thematic-legend">
        {Object.entries(STATE_COLOR).map(([state, color]) => (
          <div key={state} className="pt-thematic-legend__item">
            <span className="pt-thematic-legend__dot" style={{ background: color }} />
            <span>{STATE_LABELS[locale][state as ElementState]}</span>
          </div>
        ))}
      </div>
    );
  }
  if (prop === "block") {
    return (
      <div className="pt-thematic-legend">
        {Object.entries(BLOCK_COLOR).map(([block, color]) => (
          <div key={block} className="pt-thematic-legend__item">
            <span className="pt-thematic-legend__dot" style={{ background: color }} />
            <span>{BLOCK_LABELS[locale][block as ElementBlock]}</span>
          </div>
        ))}
      </div>
    );
  }
  if (!range) return null;
  const stops = HEAT_STOPS.map(([r, g, b]) => `rgb(${r},${g},${b})`).join(",");
  const fmtVal = (v: number) => def.logScale
    ? (Math.pow(10, v) >= 1000 ? `${(Math.pow(10, v) / 1000).toFixed(0)}k` : Math.pow(10, v).toFixed(2))
    : v.toFixed(1);
  return (
    <div className="pt-thematic-legend pt-thematic-legend--gradient">
      <span className="pt-thematic-legend__min">{fmtVal(range[0])} {def.unit}</span>
      <div
        className="pt-thematic-legend__bar"
        style={{ background: `linear-gradient(to right, ${stops})` }}
        aria-label={`${locale === "en" ? "Scale" : "Scala"} ${def.label}: da ${fmtVal(range[0])} a ${fmtVal(range[1])} ${def.unit}`}
      />
      <span className="pt-thematic-legend__max">{fmtVal(range[1])} {def.unit}</span>
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange, matchCount, onEnter, locale }: {
  value: string;
  onChange: (v: string) => void;
  matchCount: number;
  onEnter: () => void;
  locale: Locale;
}) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const inputLabel = locale === "en" ? "Search element by name, symbol or atomic number" : "Cerca elemento per nome, simbolo o numero atomico";
  const clearLabel = locale === "en" ? "Clear search" : "Cancella ricerca";
  return (
    <div className="pt-search">
      <input
        className="pt-search__input"
        type="search"
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") onEnter();
          if (e.key === "Escape") onChange("");
        }}
        aria-label={inputLabel}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <>
          <span className="pt-search__count">{matchCount}</span>
          <button className="pt-search__clear" onClick={() => onChange("")} aria-label={clearLabel}>×</button>
        </>
      )}
    </div>
  );
}

// ─── Donate button ────────────────────────────────────────────────────────────

function DonateButton({ locale }: { locale: Locale }) {
  const t = LAB_UI_TRANSLATIONS[locale];
  return (
    <a
      href="https://ko-fi.com/fosforonero"
      target="_blank"
      rel="noopener noreferrer"
      className="pt-donate-btn"
      title={locale === "en" ? "Support the project — Ko-fi" : "Supporta il progetto — Ko-fi"}
    >
      {t.infoSupport}
    </a>
  );
}

// ─── Light background selector ───────────────────────────────────────────────

function LightBgSelector({ value, onChange, locale }: { value: LightBgKey; onChange: (k: LightBgKey) => void; locale: Locale }) {
  const grpLabel = locale === "en" ? "Light theme background" : "Sfondo versione chiara";
  return (
    <div className="pt-lightbg-selector" role="group" aria-label={grpLabel}>
      {LIGHT_BACKGROUNDS.map(({ key, color, label }) => (
        <button
          key={key}
          className={`pt-lightbg-btn${value === key ? " active" : ""}`}
          style={{ "--swatch": color } as React.CSSProperties}
          onClick={() => onChange(key)}
          title={label[locale]}
          aria-pressed={value === key}
          aria-label={label[locale]}
        />
      ))}
    </div>
  );
}

// ─── Stars intensity toggle ───────────────────────────────────────────────────

function StarsToggle({ value, onChange, locale }: { value: number; onChange: (v: number) => void; locale: Locale }) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const labels = [t.starsOff, t.starsMid, t.starsHigh];
  const btnLabels = [t.starsBtnOff, t.starsBtnMid, t.starsBtnHigh];
  return (
    <button
      className="pt-stars-toggle"
      onClick={() => onChange((value + 1) % 3)}
      aria-label={labels[value]}
      title={labels[value]}
    >
      {btnLabels[value]}
    </button>
  );
}

// ─── Van der Waals toggle ─────────────────────────────────────────────────────

const VDW_CYCLE: Record<VdWStyle, VdWStyle> = { off: "wire", wire: "glass", glass: "off" };
const VDW_LABEL: Record<VdWStyle, string> = { off: "vdW", wire: "vdW ◻", glass: "vdW ◉" };

function VdWToggle({ style, onCycle, locale }: { style: VdWStyle; onCycle: () => void; locale: Locale }) {
  const TITLES: Record<VdWStyle, string> = {
    off:   locale === "en" ? "Show wireframe radius"   : "Mostra raggio wireframe",
    wire:  locale === "en" ? "Switch to glass style"   : "Passa a stile vetro",
    glass: locale === "en" ? "Hide van der Waals radius" : "Nascondi raggio vdW",
  };
  return (
    <button
      className={`pt-vdw-toggle${style !== "off" ? ` active pt-vdw-toggle--${style}` : ""}`}
      onClick={onCycle}
      aria-pressed={style !== "off"}
      title={TITLES[style]}
      aria-label={TITLES[style]}
    >
      {VDW_LABEL[style]}
    </button>
  );
}

// ─── Model switch ─────────────────────────────────────────────────────────────

function ModelSwitch({ current, onChange, locale }: { current: AtomModel; onChange: (m: AtomModel) => void; locale: Locale }) {
  const models = getModels(locale);
  const grpLabel = locale === "en" ? "Select atomic model" : "Seleziona modello atomico";
  return (
    <div className="pt-model-switch" role="group" aria-label={grpLabel}>
      {/* Desktop: pill buttons */}
      {models.map(({ key, label, year, desc }) => (
        <button
          key={key}
          className={`pt-model-btn${current === key ? " active" : ""}`}
          onClick={() => onChange(key)}
          title={desc}
          aria-pressed={current === key}
        >
          {label}
          <span className="pt-model-year">{year}</span>
        </button>
      ))}
      {/* Mobile: native select */}
      <select
        className="pt-model-select"
        value={current}
        onChange={e => onChange(e.target.value as AtomModel)}
        aria-label={grpLabel}
      >
        {models.map(({ key, label, year }) => (
          <option key={key} value={key}>{label} — {year}</option>
        ))}
      </select>
    </div>
  );
}

function ModelDesc({ model, locale }: { model: AtomModel; locale: Locale }) {
  const m = getModels(locale).find(x => x.key === model);
  if (!m) return null;
  return <p className="pt-model-desc">{m.desc}</p>;
}

// ─── Speed slider ─────────────────────────────────────────────────────────────

function SpeedSlider({ value, onChange, locale }: { value: number; onChange: (v: number) => void; locale: Locale }) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const titleText = locale === "en" ? "Electron animation speed" : "Velocità di animazione degli elettroni";
  const ariaText = locale === "en" ? "Animation speed" : "Velocità animazione";
  return (
    <label className="pt-speed-slider" title={titleText}>
      <span className="pt-speed-slider__lbl">{t.speedLabel}</span>
      <input
        type="range"
        min={0.1}
        max={3}
        step={0.05}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="pt-speed-slider__input"
        aria-label={ariaText}
      />
      <span className="pt-speed-slider__val">{value.toFixed(1)}×</span>
    </label>
  );
}

// ─── Scale toggle ─────────────────────────────────────────────────────────────

function ScaleToggle({ on, onToggle, locale }: { on: boolean; onToggle: () => void; locale: Locale }) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const titleText = locale === "en" ? "Display real distances between nucleus and electrons" : "Visualizza le distanze reali tra nucleo ed elettroni";
  return (
    <button
      className={`pt-scale-toggle${on ? " active" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
      title={titleText}
    >
      <span className="pt-scale-toggle__sw" />
      <span>{t.scaleReal}</span>
    </button>
  );
}

// ─── Persisted state hook (localStorage) ─────────────────────────────────────

function usePersistedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch { /* ignore parse / quota errors */ }
    hydratedRef.current = true;
  }, [key]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
  }, [key, value]);

  return [value, setValue];
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function PeriodicTableView({ locale = "it" }: { locale?: Locale }) {
  const searchParams = useSearchParams();
  const t = LAB_UI_TRANSLATIONS[locale];

  const [selected,        setSelected]        = useState<Element | null>(ELEMENTS[0] ?? null);
  const [view,            setView]            = useState<"table" | "atom">("table");
  const [model,           setModel]           = usePersistedState<AtomModel>("pt:model", "bohr");
  const [realScale,       setRealScale]       = usePersistedState<boolean>("pt:realScale", false);
  const [speedMultiplier, setSpeedMultiplier] = usePersistedState<number>("pt:speedMultiplier", 1.0);
  const [lightMode,       setLightMode]       = usePersistedState<boolean>("pt:lightMode", false);
  const [thematicProp,    setThematicProp]    = usePersistedState<ThematicProperty>("pt:thematicProp", "none");
  const [showLegend,      setShowLegend]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [starsIntensity,  setStarsIntensity]  = usePersistedState<number>("pt:starsIntensity", 1);
  const [lightBgKey,      setLightBgKey]      = usePersistedState<LightBgKey>("pt:lightBgKey", "sky");
  const [vdwStyle,        setVdwStyle]        = usePersistedState<VdWStyle>("pt:vdwStyle", "off");
  const [negativeMode,    setNegativeMode]    = usePersistedState<boolean>("pt:negativeMode", false);
  const [gridZoom,        setGridZoom]        = useState(1);
  const [showSpin,        setShowSpin]        = usePersistedState<boolean>("pt:showSpin", false);

  const [panelWidth,      setPanelWidth]      = usePersistedState<number>("pt:panelWidth", 264);
  const panelWidthRef                         = useRef(panelWidth);
  panelWidthRef.current                       = panelWidth;

  const [showHeader,      setShowHeader]      = useState(true);
  const lastScrollTop                         = useRef(0);
  const scrollRef                             = useRef<HTMLDivElement>(null);
  const pinchRef                              = useRef<{ dist: number } | null>(null);

  const lightBgColor = LIGHT_BACKGROUNDS.find(b => b.key === lightBgKey)?.color ?? "#e8ecf5";

  const propRange = useMemo<[number, number] | null>(() => {
    return getThematicPropertiesRangeMap(thematicProp);
  }, [thematicProp]);

  const handlePanelDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const startX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
    const startW = panelWidthRef.current;
    function onMove(ev: MouseEvent | TouchEvent) {
      const x = 'touches' in ev ? (ev as TouchEvent).touches[0]?.clientX ?? 0 : (ev as MouseEvent).clientX;
      setPanelWidth(Math.min(520, Math.max(200, startW + (startX - x))));
    }
    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, [setPanelWidth]);

  const searchMatchCount = useMemo(() =>
    ELEMENTS.filter(el => matchesSearch(el, searchQuery, locale)).length,
  [searchQuery, locale]);

  const handleSelect = useCallback((el: Element) => {
    if (selected?.z === el.z && view === "table") {
      // Second click on already-selected element → go to atom
      setView("atom");
    } else {
      // First click → select and highlight
      setSelected(el);
    }
    setShowHeader(true);
  }, [selected, view]);

  const handleBack = useCallback(() => {
    setView("table");
    setSearchQuery("");
    setShowHeader(true); // reset header visibility
  }, []);

  // Keyboard handler (Escape key)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && view === "atom") handleBack(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, handleBack]);

  // Deep-linking z query parameter parsing
  useEffect(() => {
    const zParam = searchParams.get("z");
    if (zParam) {
      const zNum = parseInt(zParam, 10);
      const match = ELEMENTS.find(el => el.z === zNum);
      if (match) {
        setSelected(match);
        setView("atom");
      }
    }
  }, [searchParams]);

  // Scroll hiding sticky header logic — rAF-throttled to avoid jitter
  const scrollTickRef = useRef(false);
  const handleScroll = useCallback(() => {
    if (scrollTickRef.current) return;
    scrollTickRef.current = true;
    requestAnimationFrame(() => {
      scrollTickRef.current = false;
      const el = scrollRef.current;
      if (!el) return;
      const currentScroll = el.scrollTop;
      if (Math.abs(currentScroll - lastScrollTop.current) > 16) {
        if (currentScroll > lastScrollTop.current && currentScroll > 80) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        lastScrollTop.current = currentScroll;
      }
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || view !== "table") return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [view, handleScroll]);

  // Pinch-to-zoom on the grid scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || view !== "table") return;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0]!;
        const t1 = e.touches[1]!;
        pinchRef.current = { dist: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY) };
      }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const t0 = e.touches[0]!;
        const t1 = e.touches[1]!;
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        const ratio = dist / pinchRef.current.dist;
        setGridZoom(z => Math.max(0.5, Math.min(3, z * ratio)));
        pinchRef.current.dist = dist;
      }
    };
    const onEnd = () => { pinchRef.current = null; };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [view]);

  // Reset header if switching views
  useEffect(() => {
    setShowHeader(true);
  }, [view]);

  const selectedName = selected ? (locale === "en" ? (ELEMENT_NAMES_EN[selected.z] || selected.name) : selected.name) : "";

  return (
    <div
      className={`pt-root${lightMode ? " pt-root--light" : ""}`}
      style={lightMode ? { "--pt-light-bg": lightBgColor } as React.CSSProperties : undefined}
    >
      {/* ── Header ── */}
      <header className={`pt-header${showHeader ? "" : " pt-header--hidden"}`}>
        <div className="pt-header__left">
          {view === "atom" && (
            <button className="pt-back" onClick={handleBack} aria-label={t.backToTable}>
              {t.backToTable}
            </button>
          )}
          <div>
            <h1 className="pt-title">{t.title} <em>{t.titleEm}</em></h1>
            <p className="pt-subtitle">
              {view === "atom" && selected
                ? t.subtitleAtom(selectedName, selected.sym, selected.z)
                : t.subtitleTable}
            </p>
          </div>
        </div>
        <div className="pt-header__right">
          {view === "atom" && (
            <>
              <ModelSwitch current={model} onChange={setModel} locale={locale} />
              <ScaleToggle on={realScale} onToggle={() => setRealScale(v => !v)} locale={locale} />
              <SpeedSlider value={speedMultiplier} onChange={setSpeedMultiplier} locale={locale} />
              <StarsToggle value={starsIntensity} onChange={setStarsIntensity} locale={locale} />
              <VdWToggle style={vdwStyle} onCycle={() => setVdwStyle(s => VDW_CYCLE[s])} locale={locale} />
              {(model === "bohr" || model === "rutherford" || model === "sommerfeld") && (
                <button
                  className={`pt-spin-toggle${showSpin ? " active" : ""}`}
                  onClick={() => setShowSpin(v => !v)}
                  aria-pressed={showSpin}
                  title={locale === "en" ? "Show electron spins (↑↓ Pauli)" : "Mostra spin elettronici (↑↓ Pauli)"}
                >
                  ↑↓
                </button>
              )}
              {lightMode && <LightBgSelector value={lightBgKey} onChange={setLightBgKey} locale={locale} />}
            </>
          )}
          {view === "table" && (
            <>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                matchCount={searchMatchCount}
                locale={locale}
                onEnter={() => {
                  if (searchMatchCount === 1) {
                    const match = ELEMENTS.find(el => matchesSearch(el, searchQuery, locale));
                    if (match) { setSelected(match); setView("atom"); setSearchQuery(""); }
                  }
                }}
              />
              <button
                className={`pt-toggle-legend${showLegend ? " active" : ""}`}
                onClick={() => setShowLegend(v => !v)}
              >
                {showLegend ? t.hideLegend : t.showLegend}
              </button>
              <Link href={locale === "en" ? "/en/lab/tavola-periodica/about" : "/lab/tavola-periodica/about"} className="pt-about-link">
                {t.aboutLink}
              </Link>
              <Link href={locale === "en" ? "/en/lab/tavola-periodica/manual" : "/lab/tavola-periodica/manuale"} className="pt-about-link">
                {t.manualLink}
              </Link>
              <DonateButton locale={locale} />
            </>
          )}

          {/* Symmetrical Language Toggle */}
          <div className="pt-lang-switch" role="group" aria-label={locale === "en" ? "Language" : "Lingua"}>
            <Link
              href={locale === "it" ? "#" : `/lab/tavola-periodica${view === "atom" && selected ? `?z=${selected.z}` : ""}`}
              className={`pt-lang-btn${locale === "it" ? " active" : ""}`}
              onClick={(e) => { if (locale === "it") e.preventDefault(); }}
              aria-label="Italiano"
            >
              IT
            </Link>
            <span className="pt-lang-sep" aria-hidden="true">/</span>
            <Link
              href={locale === "en" ? "#" : `/en/lab/tavola-periodica${view === "atom" && selected ? `?z=${selected.z}` : ""}`}
              className={`pt-lang-btn${locale === "en" ? " active" : ""}`}
              onClick={(e) => { if (locale === "en") e.preventDefault(); }}
              aria-label="English"
            >
              EN
            </Link>
          </div>

          {/* theme toggle — always visible */}
          <button
            className={`pt-theme-toggle${lightMode ? " active" : ""}`}
            onClick={() => setLightMode(v => !v)}
            aria-pressed={lightMode}
            title={lightMode ? t.themeToggleTitleLight : t.themeToggleTitleDark}
          >
            {lightMode ? t.themeDark : t.themeLight}
          </button>
        </div>
      </header>

      {/* ── Atom view ── */}
      {view === "atom" && selected && (
        <div className="pt-atom-view" style={{ '--pt-info-width': `${panelWidth}px` } as React.CSSProperties}>
          <div className="pt-canvas-wrap">
            <AtomScene
              element={selected}
              model={model}
              realScale={realScale}
              speedMultiplier={speedMultiplier}
              lightMode={lightMode}
              starsIntensity={starsIntensity}
              lightBg={lightBgColor}
              vdwStyle={vdwStyle}
              showSpin={showSpin}
              className="pt-canvas"
            />
            <ModelDesc model={model} locale={locale} />
          </div>
          <InfoPanel el={selected} locale={locale} onDragStart={handlePanelDragStart} />
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        <div className="pt-table-view">
          {/* Portrait mode hint (mobile only) */}
          <div className="pt-portrait-hint" aria-hidden="true">
            ↻ {locale === "en" ? "Rotate for best experience" : "Ruota il dispositivo"}
          </div>

          {showLegend && thematicProp === "none" && <Legend locale={locale} />}
          <ThematicSelector
            current={thematicProp}
            onChange={(p) => { setThematicProp(p); }}
            locale={locale}
            negativeMode={negativeMode}
            onToggleNeg={() => setNegativeMode(v => !v)}
          />
          <ThematicLegend prop={thematicProp} range={propRange} locale={locale} />
          <div className="pt-scroll" ref={scrollRef}>
            <div style={gridZoom !== 1 ? { zoom: gridZoom } as React.CSSProperties : undefined}>
              <PeriodicGrid
                selected={selected}
                onSelect={handleSelect}
                thematicProp={thematicProp}
                propRange={propRange}
                searchQuery={searchQuery}
                locale={locale}
                negativeMode={negativeMode}
              />
            </div>
          </div>
          {selected && (
            <div className="pt-footer-hint">
              <strong style={{ color: CATEGORY_COLOR[selected.category] }}>
                {selectedName}
              </strong>{" "}({selected.sym}) — Z={selected.z}
              {thematicProp !== "none" && (
                <> — <span className="pt-footer-hint__val">{getThematicValueText(selected, thematicProp, locale)}</span></>
              )}
              {" — "}
              <span style={{ opacity: 0.5 }}>
                {locale === "en" ? "click again to view atom →" : "clicca di nuovo per l'atomo →"}
              </span>
            </div>
          )}
          <p className="pt-table-scroll-hint" aria-hidden="true">
            ← {locale === "en" ? "scroll to see all 118 elements" : "scorri per tutti i 118 elementi"} →
          </p>
        </div>
      )}
    </div>
  );
}
