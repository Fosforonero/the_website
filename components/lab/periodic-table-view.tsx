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
import { MOLECULES_BY_Z, type Molecule } from "@/lib/molecules-data";
import { fetchMoleculeFromPubChem } from "@/lib/molecules-pubchem";
import { ElementStoryMode } from "./element-story-mode";
import type { AtomModel, VdWStyle, OrbitalKey } from "./atom-scene";
import { ORBITAL_META } from "./atom-scene";
import { getMolPolarLabel } from "./molecule-scene";
import type { MolViewMode } from "./molecule-scene";
import type { Locale } from "@/lib/site";
import {
  ELEMENT_NAMES_EN, CATEGORY_LABELS_EN, STATE_LABELS, BLOCK_LABELS,
  LAB_UI_TRANSLATIONS, ELEMENT_DESCRIPTIONS_EN, CRYSTAL_LABELS,
} from "@/lib/elements-i18n";
import { CrystalScene } from "./crystal-scene";
import {
  toKelvin, fromKelvin, inferPhaseAtTemperature, computeTemperatureRangeK,
  ROOM_TEMPERATURE_K,
} from "@/lib/temperature";

const CrystalViewScene = dynamic(
  () => import("./crystal-view-scene").then(m => m.CrystalViewScene),
  { ssr: false, loading: () => <div className="atom-loading">...</div> }
);

const MoleculeScene = dynamic(
  () => import("./molecule-scene").then(m => m.MoleculeScene),
  { ssr: false, loading: () => <div className="atom-loading">...</div> }
);

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

const MODEL_BADGES: Record<string, { it: string; en: string }> = {
  thomson:    { it: "storico",      en: "historical"   },
  rutherford: { it: "storico",      en: "historical"   },
  bohr:       { it: "storico",      en: "historical"   },
  sommerfeld: { it: "semiclassico", en: "semiclassical" },
  quantum:    { it: "moderno",      en: "modern"       },
};

const getModels = (locale: Locale) => {
  const t = LAB_UI_TRANSLATIONS[locale];
  return [
    { key: "thomson",    label: "Thomson",     year: 1904, badge: MODEL_BADGES.thomson![locale],    desc: t.modelDescThomson },
    { key: "rutherford", label: "Rutherford",  year: 1911, badge: MODEL_BADGES.rutherford![locale], desc: t.modelDescRutherford },
    { key: "bohr",       label: "Bohr",        year: 1913, badge: MODEL_BADGES.bohr![locale],       desc: t.modelDescBohr },
    { key: "sommerfeld", label: "Sommerfeld",  year: 1916, badge: MODEL_BADGES.sommerfeld![locale], desc: t.modelDescSommerfeld },
    { key: "quantum",    label: locale === "en" ? "Quantum" : "Quantistico", year: 1926, badge: MODEL_BADGES.quantum![locale], desc: t.modelDescQuantum },
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

function fmtTemp(k: number | null, unit: "K" | "C" | "F" = "K"): string {
  if (k === null) return "—";
  if (unit === "C") return `${(k - 273.15).toFixed(0)} °C`;
  if (unit === "F") return `${((k - 273.15) * 9 / 5 + 32).toFixed(0)} °F`;
  return `${k.toFixed(0)} K`;
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

function InfoPanel({ el, locale, tempUnit, lightMode, onDragStart, onCrystalClick, onMoleculeClick, onStoryClick }: { el: Element; locale: Locale; tempUnit: "K" | "C" | "F"; lightMode?: boolean; onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; onCrystalClick?: () => void; onMoleculeClick?: (idx: number) => void; onStoryClick?: () => void }) {
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

      {/* Properties — 4 semantic groups */}
      <dl className="pt-info__dl">

        {/* ── Identità ── */}
        <div className="pt-info__group">
          <p className="pt-info__group-label">{t.infoGroupIdentity}</p>
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
          {ext && (
            <div>
              <dt>{t.infoBlockState}</dt>
              <dd>
                <span className="pt-info__block-badge" data-block={ext.block}>{BLOCK_LABELS[locale][ext.block]}</span>
                {" · "}
                <span style={{ color: STATE_COLOR[ext.state] }}>{STATE_LABELS[locale][ext.state]}</span>
              </dd>
            </div>
          )}
          <div>
            <dt>{t.infoCategory}</dt>
            <dd style={{ color }}>{getCategoryLabel(el.category, locale)}</dd>
          </div>
          <div><dt>{t.infoPeriodGroup}</dt><dd>{el.period} / {el.group}</dd></div>
        </div>

        {/* ── Proprietà periodiche ── */}
        {ext && (
          <div className="pt-info__group">
            <p className="pt-info__group-label">{t.infoGroupPeriodic}</p>
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
          </div>
        )}

        {/* ── Struttura ── */}
        {ext && (
          <div className="pt-info__group">
            <p className="pt-info__group-label">{t.infoGroupStructure}</p>
            <div>
              <dt>{t.infoMelting}</dt>
              <dd>{fmtTemp(ext.meltingPoint, tempUnit)}</dd>
            </div>
            <div>
              <dt>{t.infoBoiling}</dt>
              <dd>{fmtTemp(ext.boilingPoint, tempUnit)}</dd>
            </div>
            {ext.crystalStructure && (
              <div className={ext.crystalStructure !== "other" ? "pt-info__crystal-row" : undefined}>
                <dt>{t.infoCrystalStructure}</dt>
                <dd>
                  <span className="pt-info__crystal-label">
                    {CRYSTAL_LABELS[locale][ext.crystalStructure] ?? ext.crystalStructure}
                  </span>
                  {ext.crystalStructure !== "other" && (
                    <button
                      className="pt-crystal-canvas-btn"
                      onClick={onCrystalClick}
                      title={t.crystalViewTitle}
                      aria-label={t.crystalViewTitle}
                    >
                      <CrystalScene
                        structure={ext.crystalStructure}
                        color={color ?? "#6b7280"}
                        lightMode={lightMode}
                      />
                      <span className="pt-crystal-canvas-hint">
                        {locale === "en" ? "expand" : "espandi"}
                      </span>
                    </button>
                  )}
                </dd>
              </div>
            )}
            {MOLECULES_BY_Z[el.z] && (
              <div className="pt-info__mol-row">
                <dt>{t.moleculeViewBtn}</dt>
                <dd className="pt-info__mol-list">
                  {(MOLECULES_BY_Z[el.z] ?? []).map((mol: Molecule, i: number) => (
                    <button
                      key={i}
                      className="pt-info__mol-badge"
                      onClick={() => onMoleculeClick?.(i)}
                      title={locale === "en" ? mol.nameEN : mol.nameIT}
                    >
                      {mol.formula}
                    </button>
                  ))}
                </dd>
              </div>
            )}
          </div>
        )}

        {/* ── Scoperta ── */}
        {ext?.discoverer && (
          <div className="pt-info__group">
            <p className="pt-info__group-label">{t.infoGroupHistory}</p>
            <div>
              <dt>{t.infoDiscoveredBy}</dt>
              <dd>
                {ext.discoverer}{ext.discoveryYear ? `, ${ext.discoveryYear}` : ""}
                {ext.discoverySource && (
                  <a
                    href={ext.discoverySource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pt-info__discovery-link"
                    title={locale === "en" ? "Source (RSC Periodic Table)" : "Fonte (RSC Tavola Periodica)"}
                    aria-label={locale === "en" ? "Discovery source" : "Fonte della scoperta"}
                  >↗</a>
                )}
              </dd>
            </div>
          </div>
        )}

      </dl>
      <div className="pt-info__footer">
        {onStoryClick && (
          <button
            className="pt-info__story-btn"
            onClick={onStoryClick}
            title={locale === "en" ? "Element story" : "Storia dell'elemento"}
          >
            {locale === "en" ? "✦ story" : "✦ storia"}
          </button>
        )}
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

// Trend annotations for properties with well-established periodic trends.
// Source: IUPAC recommendations. Only monotonic/near-monotonic trends are listed.
// density, electronAffinity, crustAbundance are excluded (irregular patterns).
const THEMATIC_TREND: Partial<Record<ThematicProperty, { it: string; en: string }>> = {
  electronegativity: {
    it: "↑ lungo il periodo · ↓ lungo il gruppo",
    en: "↑ across period · ↓ down group",
  },
  atomicRadius: {
    it: "↓ lungo il periodo · ↑ lungo il gruppo",
    en: "↓ across period · ↑ down group",
  },
  covalentRadius: {
    it: "↓ lungo il periodo · ↑ lungo il gruppo",
    en: "↓ across period · ↑ down group",
  },
  ionizationEnergy: {
    it: "↑ lungo il periodo · ↓ lungo il gruppo",
    en: "↑ across period · ↓ down group",
  },
};

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
  const trend = THEMATIC_TREND[prop];
  return (
    <div className="pt-thematic-legend pt-thematic-legend--gradient">
      <span className="pt-thematic-legend__min">{fmtVal(range[0])} {def.unit}</span>
      <div
        className="pt-thematic-legend__bar"
        style={{ background: `linear-gradient(to right, ${stops})` }}
        aria-label={`${locale === "en" ? "Scale" : "Scala"} ${def.label}: da ${fmtVal(range[0])} a ${fmtVal(range[1])} ${def.unit}`}
      />
      <span className="pt-thematic-legend__max">{fmtVal(range[1])} {def.unit}</span>
      {trend && (
        <span className="pt-thematic-legend__trend" aria-label={trend[locale]}>
          {trend[locale]}
        </span>
      )}
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

// ─── Temperature unit toggle ──────────────────────────────────────────────────

const TEMP_CYCLE: Record<"K" | "C" | "F", "K" | "C" | "F"> = { K: "C", C: "F", F: "K" };
const TEMP_DISPLAY: Record<"K" | "C" | "F", string> = { K: "K", C: "°C", F: "°F" };

function TempToggle({ value, onChange, locale }: { value: "K" | "C" | "F"; onChange: (v: "K" | "C" | "F") => void; locale: Locale }) {
  const title = locale === "en" ? "Temperature unit (K / °C / °F)" : "Unità di temperatura (K / °C / °F)";
  return (
    <button
      className="pt-temp-toggle"
      onClick={() => onChange(TEMP_CYCLE[value])}
      title={title}
      aria-label={title}
    >
      {TEMP_DISPLAY[value]}
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

function ModelSwitch({ current, onChange, locale, dimmed = false }: {
  current: AtomModel; onChange: (m: AtomModel) => void; locale: Locale; dimmed?: boolean;
}) {
  const models = getModels(locale);
  const grpLabel = locale === "en" ? "Select atomic model" : "Seleziona modello atomico";
  return (
    <div className={`pt-model-switch${dimmed ? " pt-model-switch--dimmed" : ""}`} role="group" aria-label={grpLabel}>
      {/* Desktop: pill buttons */}
      {models.map(({ key, label, year, badge, desc }) => (
        <button
          key={key}
          className={`pt-model-btn${current === key ? " active" : ""}`}
          onClick={() => onChange(key)}
          title={desc}
          aria-pressed={current === key}
        >
          {label}
          <span className="pt-model-year">{year}</span>
          <span className="pt-model-badge" data-model={key}>{badge}</span>
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

// ─── Orbital Inspector UI ─────────────────────────────────────────────────────

const ORBITAL_GROUPS: Array<{ family: string; keys: OrbitalKey[] }> = [
  { family: "s", keys: ["1s", "2s"] },
  { family: "p", keys: ["2px", "2py", "2pz"] },
  { family: "d", keys: ["3dz2", "3dxy", "3dx2y2"] },
];

const ORBITAL_DISPLAY: Record<OrbitalKey, string> = {
  "1s":     "1s",
  "2s":     "2s",
  "2px":    "2px",
  "2py":    "2py",
  "2pz":    "2pz",
  "3dz2":   "3dz²",
  "3dxy":   "3dxy",
  "3dx2y2": "3dx²−y²",
};

function OrbitalSelector({ current, onChange }: { current: OrbitalKey; onChange: (k: OrbitalKey) => void }) {
  return (
    <div className="pt-orbital-grid" role="group" aria-label="Orbital">
      {ORBITAL_GROUPS.map(({ family, keys }) => (
        <div key={family} className={`pt-orbital-row pt-orbital-row--${family}`}>
          {keys.map(k => (
            <button
              key={k}
              className={`pt-orbital-btn${current === k ? " active" : ""}`}
              onClick={() => onChange(k)}
              aria-pressed={current === k}
            >
              {ORBITAL_DISPLAY[k]}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Per-orbital copy (shape + description) ───────────────────────────────────

type OrbitalCopy = {
  shape: { it: string; en: string };
  desc:  { it: string; en: string };
};

const ORBITAL_COPY: Record<OrbitalKey, OrbitalCopy> = {
  "1s": {
    shape: { it: "sferico",                                  en: "spherical" },
    desc:  { it: "Densità massima al nucleo, calo esponenziale. Nessun nodo.",
             en: "Peak density at nucleus, exponential decay. No nodes." },
  },
  "2s": {
    shape: { it: "sferico, un nodo radiale",                 en: "spherical, one radial node" },
    desc:  { it: "Come 1s ma più esteso. Un guscio sferico a densità zero separa le due regioni di fase.",
             en: "Like 1s but larger. A spherical zero-density shell separates the two phase regions." },
  },
  "2px": {
    shape: { it: "due lobi lungo x, piano nodale yz",        en: "two lobes along x, nodal plane yz" },
    desc:  { it: "Identico a 2pz ma orientato sull'asse x. Il piano yz è il nodo angolare.",
             en: "Identical to 2pz but oriented along x. The yz plane is the angular node." },
  },
  "2py": {
    shape: { it: "due lobi lungo y, piano nodale xz",        en: "two lobes along y, nodal plane xz" },
    desc:  { it: "Identico a 2pz ma orientato sull'asse y. Il piano xz è il nodo angolare.",
             en: "Identical to 2pz but oriented along y. The xz plane is the angular node." },
  },
  "2pz": {
    shape: { it: "due lobi lungo z, piano nodale xy",        en: "two lobes along z, nodal plane xy" },
    desc:  { it: "Due lobi ai poli separati dal piano xy dove ψ = 0. Il colore indica la fase della funzione d'onda, non la carica elettrica.",
             en: "Two lobes at the poles separated by the xy plane where ψ = 0. Color shows wavefunction phase, not electric charge." },
  },
  "3dz2": {
    shape: { it: "due lobi polari + toro equatoriale",       en: "two polar lobes + equatorial torus" },
    desc:  { it: "Lobi lungo z e un anello equatoriale, divisi da due coni nodali. La forma più insolita degli orbitali d.",
             en: "Lobes along z and an equatorial ring, separated by two nodal cones. The most unusual of the d orbital shapes." },
  },
  "3dxy": {
    shape: { it: "quattro lobi nel piano xy, tra gli assi",  en: "four lobes in xy plane, between axes" },
    desc:  { it: "Quattro lobi a 45° dagli assi nel piano xy, divisi da due piani nodali (xz e yz).",
             en: "Four lobes at 45° from the axes in the xy plane, separated by two nodal planes (xz and yz)." },
  },
  "3dx2y2": {
    shape: { it: "quattro lobi nel piano xy, sugli assi",    en: "four lobes in xy plane, on the axes" },
    desc:  { it: "Come 3dxy ma ruotato di 45°: i lobi puntano lungo x e y, divisi da piani nodali tra gli assi.",
             en: "Like 3dxy but rotated 45°: lobes point along x and y, separated by nodal planes between the axes." },
  },
};

function OrbitalInfoPanel({
  orbitalKey, locale, isOpen = true, onToggle,
}: {
  orbitalKey: OrbitalKey;
  locale: Locale;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const meta = ORBITAL_META[orbitalKey];
  const copy = ORBITAL_COPY[orbitalKey];
  if (!meta || !copy) return null;
  const totalNodes = meta.radialNodes + meta.angularNodes;
  const isIT = locale === "it";

  const nodeDesc = (() => {
    const parts: string[] = [];
    if (meta.radialNodes > 0) parts.push(isIT ? `${meta.radialNodes} radiale` : `${meta.radialNodes} radial`);
    if (meta.angularNodes > 0) parts.push(isIT ? `${meta.angularNodes} angolare` : `${meta.angularNodes} angular`);
    if (parts.length === 0) return isIT ? "nessuno" : "none";
    return parts.join(", ");
  })();

  return (
    <div className={`pt-orbital-panel${isOpen ? "" : " pt-orbital-panel--collapsed"}`} aria-live="polite">
      <div
        className="pt-orbital-panel__header"
        onClick={onToggle}
        role={onToggle ? "button" : undefined}
        aria-expanded={onToggle ? isOpen : undefined}
        style={onToggle ? { cursor: "pointer" } : undefined}
      >
        <span className="pt-orbital-panel__name">{ORBITAL_DISPLAY[orbitalKey]}</span>
        <span className={`pt-orbital-family pt-orbital-family--${meta.family}`}>{meta.family}</span>
        {onToggle && (
          <span className="pt-orbital-panel__toggle" aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
        )}
      </div>
      {isOpen && (
        <>
          <p className="pt-orbital-shape">{isIT ? copy.shape.it : copy.shape.en}</p>
          <dl className="pt-orbital-panel__qn">
            <div><dt>n</dt><dd>{meta.n}</dd></div>
            <div><dt>l</dt><dd>{meta.l}</dd></div>
            <div><dt>m_l</dt><dd>{meta.ml}</dd></div>
            <div>
              <dt>{isIT ? "nodi" : "nodes"}</dt>
              <dd>{totalNodes} ({nodeDesc})</dd>
            </div>
          </dl>
          <div className="pt-orbital-phase-legend">
            <span className="pt-orbital-phase pt-orbital-phase--pos">
              <span className="pt-orbital-phase__swatch" />
              {isIT ? "fase +" : "phase +"}
            </span>
            <span className="pt-orbital-phase pt-orbital-phase--neg">
              <span className="pt-orbital-phase__swatch" />
              {isIT ? "fase −" : "phase −"}
            </span>
            <span className="pt-orbital-phase-note">{isIT ? "(≠ carica)" : "(≠ charge)"}</span>
          </div>
          <p className="pt-orbital-desc">{isIT ? copy.desc.it : copy.desc.en}</p>
          <p className="pt-orbital-disclaimer">
            {isIT
              ? "Idrogenoide (Z=1): esatto per l'idrogeno, indicativo per gli altri."
              : "Hydrogen-like (Z=1): exact for hydrogen, indicative for others."}
          </p>
          <p className="pt-orbital-vs-quantum">
            {isIT
              ? "Inspector: mostra un orbitale isolato. Vista quantistica: mostra la nuvola aggregata dei sottolivelli dell'elemento selezionato."
              : "Inspector: shows one isolated orbital. Quantum view: shows the aggregated cloud of the selected element's subshells."}
          </p>
        </>
      )}
    </div>
  );
}

function ModelLegend({ model, showSpin, locale }: { model: AtomModel; showSpin: boolean; locale: Locale }) {
  const isIT = locale === "it";
  type Item = { icon: string; it: string; en: string; dim?: boolean };
  const BASE_ITEMS: Record<AtomModel, Item[]> = {
    thomson: [
      { icon: "○", it: "sfera positiva diffusa", en: "diffuse positive sphere" },
      { icon: "•", it: "elettroni incorporati — plum pudding", en: "embedded electrons — plum pudding" },
      { icon: "↯", it: "storico (1904) — pre-nucleo", en: "historical (1904) — pre-nucleus", dim: true },
    ],
    rutherford: [
      { icon: "◉", it: "nucleo centrale denso", en: "dense central nucleus" },
      { icon: "○", it: "orbite classiche casuali", en: "random classical orbits" },
    ],
    bohr: [
      { icon: "○", it: "shell quantizzate per livello", en: "quantized shells by energy level" },
      { icon: "#", it: "numero di e⁻ per guscio", en: "electron count per shell" },
    ],
    sommerfeld: [
      { icon: "s·p·d·f", it: "colori per sottolivello", en: "colour by subshell" },
      { icon: "⊃", it: "orbite ellittiche — eccentricità ∝ ℓ", en: "elliptic orbits — eccentricity ∝ ℓ" },
      { icon: "↯", it: "semiclassico (1916)", en: "semiclassical (1916)", dim: true },
    ],
    quantum: [
      { icon: "s·p·d·f", it: "colori per sottolivello", en: "colour by subshell" },
      { icon: "∑", it: "nuvola aggregata — tutti i sottolivelli", en: "aggregate cloud — all subshells" },
      { icon: "→", it: "orbitale singolo → Inspector", en: "single orbital → Inspector", dim: true },
    ],
  };
  const spinSupported = model === "bohr" || model === "rutherford" || model === "sommerfeld";
  const spinItem: Item = showSpin
    ? { icon: "↑↓", it: "orientamento spin (Pauli)", en: "spin orientation (Pauli)" }
    : { icon: "↑↓", it: "spin nascosto — attiva ↑↓", en: "spin hidden — enable ↑↓", dim: true };
  const items: Item[] = [...(BASE_ITEMS[model] ?? []), ...(spinSupported ? [spinItem] : [])];
  return (
    <div className="pt-context-legend pt-context-legend--atom" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className={`pt-context-legend__item${item.dim ? " pt-context-legend__item--dim" : ""}`}>
          <span className="pt-context-legend__icon">{item.icon}</span>
          <span>{isIT ? item.it : item.en}</span>
        </span>
      ))}
      <span className="pt-context-legend__item pt-context-legend__item--dim">
        <span className="pt-context-legend__icon">T</span>
        <span>{isIT ? "atomo isolato · indipendente dallo stato macroscopico" : "isolated atom · independent of macroscopic state"}</span>
      </span>
    </div>
  );
}

function MolLegend({ molMode, isPubChem, locale }: { molMode: MolViewMode; isPubChem: boolean; locale: Locale }) {
  const isIT = locale === "it";
  return (
    <div className="pt-context-legend pt-context-legend--mol" aria-hidden="true">
      {molMode === "ball-stick" && <>
        <span className="pt-context-legend__item"><span className="pt-context-legend__icon">●</span><span>{isIT ? "sfere = atomi (colori CPK)" : "spheres = atoms (CPK colours)"}</span></span>
        <span className="pt-context-legend__item"><span className="pt-context-legend__icon">—</span><span>{isIT ? "aste = legami covalenti" : "sticks = covalent bonds"}</span></span>
      </>}
      {molMode === "space-filling" && <>
        <span className="pt-context-legend__item"><span className="pt-context-legend__icon">◉</span><span>{isIT ? "sfere = raggio van der Waals" : "spheres = van der Waals radius"}</span></span>
        <span className="pt-context-legend__item pt-context-legend__item--dim"><span className="pt-context-legend__icon">∅</span><span>{isIT ? "legami nascosti — riempimento spaziale" : "bonds hidden — space-filling mode"}</span></span>
      </>}
      {molMode === "polarity" && <>
        <span className="pt-context-legend__item"><span className="pt-context-legend__icon">δ</span><span>{isIT ? "colori = densità di carica δ+/δ−" : "colours = charge density δ+/δ−"}</span></span>
        <span className="pt-context-legend__item"><span className="pt-context-legend__icon">→</span><span>{isIT ? "freccia = vettore dipolo molecolare" : "arrow = molecular dipole vector"}</span></span>
      </>}
      {isPubChem && <span className="pt-context-legend__item pt-context-legend__item--dim"><span className="pt-context-legend__icon">⊕</span><span>{isIT ? "dati: PubChem NIH — rendering Fosforonero" : "data: PubChem NIH — rendering by Fosforonero"}</span></span>}
      <span className="pt-context-legend__item pt-context-legend__item--dim">
        <span className="pt-context-legend__icon">≈</span>
        <span>{isIT ? "molecole comuni · indipendenti dallo stato fisico dell'elemento puro" : "common molecules · independent of the pure element's physical state"}</span>
      </span>
    </div>
  );
}

function CrystalLegend({ structure, locale }: { structure: string | null | undefined; locale: Locale }) {
  const isIT = locale === "it";
  const isHcp = structure === "hcp";
  const isCovalent = structure === "diamond";
  const cellLabel = isHcp
    ? (isIT ? "prisma esagonale = cella HCP normalizzata" : "hexagonal prism = normalised HCP cell")
    : (isIT ? "cubo = cella elementare (unit cell)" : "cube = unit cell");
  const lineLabel = isCovalent
    ? (isIT ? "linee = legami covalenti (reale)" : "lines = covalent bonds (real)")
    : (isIT ? "linee = contatti di coordinazione" : "lines = coordination contacts");
  return (
    <div className="pt-context-legend pt-context-legend--crystal" aria-hidden="true">
      <span className="pt-context-legend__item"><span className="pt-context-legend__icon">{isHcp ? "⬡" : "□"}</span><span>{cellLabel}</span></span>
      <span className="pt-context-legend__item"><span className="pt-context-legend__icon">●</span><span>{isIT ? "sfere = posizioni atomiche nel reticolo" : "spheres = atomic sites in the lattice"}</span></span>
      <span className="pt-context-legend__item"><span className="pt-context-legend__icon">—</span><span>{lineLabel}</span></span>
      <span className="pt-context-legend__item pt-context-legend__item--dim"><span className="pt-context-legend__icon">~</span><span>{isIT ? "scala normalizzata — non in scala reale" : "normalised scale — not to real scale"}</span></span>
      <span className="pt-context-legend__item pt-context-legend__item--dim"><span className="pt-context-legend__icon">∥</span><span>{isIT ? "reticolo disponibile solo nello stato solido" : "lattice available in solid state only"}</span></span>
    </div>
  );
}

// ─── Temperature control overlay ─────────────────────────────────────────────

function TemperatureControl({
  temperatureK, onTemperatureK, unit, meltingPoint, boilingPoint, locale,
}: {
  temperatureK: number;
  onTemperatureK: (k: number) => void;
  unit: "K" | "C" | "F";
  meltingPoint: number | null;
  boilingPoint: number | null;
  locale: Locale;
}) {
  const t = LAB_UI_TRANSLATIONS[locale];
  const { max } = computeTemperatureRangeK(meltingPoint, boilingPoint);
  const phaseResult = inferPhaseAtTemperature(meltingPoint, boilingPoint, temperatureK);

  const [inputStr, setInputStr] = useState(String(Math.round(fromKelvin(temperatureK, unit))));

  useEffect(() => {
    setInputStr(String(Math.round(fromKelvin(temperatureK, unit))));
  }, [temperatureK, unit]);

  const commitInput = () => {
    const parsed = parseFloat(inputStr);
    if (!isNaN(parsed)) {
      const k = Math.max(0, Math.min(max, toKelvin(parsed, unit)));
      onTemperatureK(k);
    } else {
      setInputStr(String(Math.round(fromKelvin(temperatureK, unit))));
    }
  };

  const mpPct = meltingPoint !== null ? Math.max(0, Math.min(100, (meltingPoint / max) * 100)) : null;
  const bpPct = boilingPoint !== null ? Math.max(0, Math.min(100, (boilingPoint / max) * 100)) : null;

  const phaseLabel =
    phaseResult.phase === "solid"  ? t.tempPhaseSolid  :
    phaseResult.phase === "liquid" ? t.tempPhaseLiquid :
    phaseResult.phase === "gas"    ? t.tempPhaseGas    :
                                     t.tempPhaseUnknown;

  const noteText =
    phaseResult.note === "sublimation"     ? t.tempNoteSublimation :
    phaseResult.note === "no-boiling-data" ? t.tempNoteNoBoiling   :
    phaseResult.note === "no-data"         ? t.tempNoteNoData      :
    phaseResult.note === "no-melting-data" ? t.tempNoteNoMelting   :
    null;

  return (
    <div className="pt-temp-control">
      <div className="pt-temp-control__rail">
        <input
          type="range"
          className="pt-temp-control__slider"
          min={0}
          max={Math.round(max)}
          step={1}
          value={Math.round(temperatureK)}
          onChange={e => onTemperatureK(Number(e.target.value))}
          aria-label={t.tempControlLabel}
        />
        {mpPct !== null && (
          <span
            className="pt-temp-control__marker pt-temp-control__marker--fusion"
            style={{ left: `${mpPct}%` }}
            title={`${t.infoMelting}: ${meltingPoint!.toFixed(0)} K`}
          />
        )}
        {bpPct !== null && (
          <span
            className="pt-temp-control__marker pt-temp-control__marker--boiling"
            style={{ left: `${bpPct}%` }}
            title={`${t.infoBoiling}: ${boilingPoint!.toFixed(0)} K`}
          />
        )}
      </div>
      <div className="pt-temp-control__row">
        <input
          type="number"
          className="pt-temp-control__input"
          value={inputStr}
          onChange={e => setInputStr(e.target.value)}
          onBlur={commitInput}
          onKeyDown={e => { if (e.key === "Enter") commitInput(); }}
          aria-label={t.tempControlLabel}
        />
        <span className="pt-temp-control__unit">
          {unit === "C" ? "°C" : unit === "F" ? "°F" : "K"}
        </span>
        <span className={`pt-temp-control__badge pt-temp-control__badge--${phaseResult.phase}`}>
          {phaseLabel}
        </span>
        <button
          className="pt-temp-control__reset"
          onClick={() => onTemperatureK(ROOM_TEMPERATURE_K)}
          title={t.tempReset}
          aria-label={t.tempReset}
        >
          ↺
        </button>
      </div>
      {noteText !== null && (
        <p className="pt-temp-control__note">⚠ {noteText}</p>
      )}
      <p className="pt-temp-control__disclaimer">{t.tempDisclaimer}</p>
    </div>
  );
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
  const [tempUnit,        setTempUnit]        = usePersistedState<"K" | "C" | "F">("pt:tempUnit", "K");
  const [temperatureK,    setTemperatureK]    = usePersistedState<number>("pt:temperatureK", ROOM_TEMPERATURE_K);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [starsIntensity,  setStarsIntensity]  = usePersistedState<number>("pt:starsIntensity", 1);
  const [vdwStyle,        setVdwStyle]        = usePersistedState<VdWStyle>("pt:vdwStyle", "off");
  const [negativeMode,    setNegativeMode]    = usePersistedState<boolean>("pt:negativeMode", false);
  const [gridZoom,        setGridZoom]        = useState(1);
  const [showSpin,        setShowSpin]        = usePersistedState<boolean>("pt:showSpin", false);
  const [nucleusView,     setNucleusView]     = usePersistedState<boolean>("pt:nucleusView", false);
  const [inspectorOrbital, setInspectorOrbital] = usePersistedState<OrbitalKey | null>("pt:inspectorOrbital", null);
  const [crystalView,     setCrystalView]     = useState<boolean>(false);
  const [moleculeView,    setMoleculeView]    = useState<boolean>(false);
  const [activeMolIdx,    setActiveMolIdx]    = useState<number>(0);
  const [molMode,         setMolMode]         = usePersistedState<MolViewMode>("pt:molMode", "ball-stick");
  const [molResetKey,     setMolResetKey]     = useState<number>(0);
  const [molSearchQuery,  setMolSearchQuery]  = useState("");
  const [molSearchResult, setMolSearchResult] = useState<Molecule | null>(null);
  const [molSearchBusy,   setMolSearchBusy]   = useState(false);
  const [molSearchError,  setMolSearchError]  = useState<"notfound" | "networkerror" | null>(null);
  const [molSearchHasSearched, setMolSearchHasSearched] = useState(false);
  const [storyMode,       setStoryMode]       = useState(false);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [orbitalInfoOpen, setOrbitalInfoOpen] = useState(true);

  const [panelWidth,      setPanelWidth]      = usePersistedState<number>("pt:panelWidth", 264);
  const panelWidthRef                         = useRef(panelWidth);
  panelWidthRef.current                       = panelWidth;

  const [showHeader,      setShowHeader]      = useState(true);
  const lastScrollTop                         = useRef(0);
  const scrollRef                             = useRef<HTMLDivElement>(null);
  const pinchRef                              = useRef<{ dist: number } | null>(null);

  const propRange = useMemo<[number, number] | null>(() => {
    return getThematicPropertiesRangeMap(thematicProp);
  }, [thematicProp]);

  const selectedExt = selected ? EXTENDED[selected.z] : undefined;
  const phaseResult = useMemo(
    () => inferPhaseAtTemperature(
      selectedExt?.meltingPoint ?? null,
      selectedExt?.boilingPoint ?? null,
      temperatureK,
    ),
    [selectedExt, temperatureK],
  );
  const inferredPhase = phaseResult.phase;

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
    setShowHeader(true);
    setCrystalView(false);
    setMoleculeView(false);
    setMolSearchResult(null);
    setMolSearchQuery("");
    setMolSearchError(null);
    setMolSearchHasSearched(false);
    setCanvasFullscreen(false);
  }, []);

  const handleMolSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setMolSearchBusy(true);
    setMolSearchError(null);
    setMolSearchHasSearched(false);
    const result = await fetchMoleculeFromPubChem(trimmed);
    if (result.ok) {
      setMolSearchResult(result.mol);
      setMolSearchError(null);
    } else {
      setMolSearchResult(null);
      setMolSearchError(result.reason);
    }
    setMolSearchHasSearched(true);
    setMolSearchBusy(false);
  }, []);

  // Keyboard handler (Escape key)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && view === "atom") handleBack(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, handleBack]);

  // Clamp temperatureK to new element's max range when element changes
  useEffect(() => {
    if (!selected) return;
    const ext = EXTENDED[selected.z];
    const { max } = computeTemperatureRangeK(ext?.meltingPoint ?? null, ext?.boilingPoint ?? null);
    setTemperatureK(prev => prev > max ? max : prev);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.z]);

  // Auto-close crystal view when phase becomes liquid or gas
  useEffect(() => {
    if (crystalView && (inferredPhase === "liquid" || inferredPhase === "gas")) {
      setCrystalView(false);
    }
  }, [crystalView, inferredPhase]);

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
    <div className={`pt-root${lightMode ? " pt-root--light" : ""}${canvasFullscreen ? " pt-root--canvas-fs" : ""}`}>
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
              <ModelSwitch
                current={model}
                onChange={m => { setModel(m); setInspectorOrbital(null); setCrystalView(false); setMoleculeView(false); setNucleusView(false); }}
                locale={locale}
                dimmed={inspectorOrbital !== null}
              />
              <button
                className={`pt-orbital-toggle${inspectorOrbital !== null ? " active" : ""}`}
                onClick={() => {
                  if (inspectorOrbital !== null) {
                    setInspectorOrbital(null);
                  } else {
                    setInspectorOrbital("2pz");
                    setCrystalView(false);
                    setMoleculeView(false);
                    setNucleusView(false);
                  }
                }}
                aria-pressed={inspectorOrbital !== null}
                title={locale === "en" ? "Orbital Inspector — hydrogen-like orbitals" : "Inspector orbitali — orbitali idrogenoidi"}
              >
                {locale === "en" ? "Orbital Inspector" : "Inspector orbitali"}
              </button>
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
              <TempToggle value={tempUnit} onChange={setTempUnit} locale={locale} />
              <button
                className={`pt-nucleus-view-btn${nucleusView ? " active" : ""}`}
                onClick={() => { setNucleusView(v => !v); setCrystalView(false); setMoleculeView(false); setInspectorOrbital(null); }}
                aria-pressed={nucleusView}
                title={t.nucleusViewTitle}
              >
                {t.nucleusViewBtn}
              </button>
              {selected && EXTENDED[selected.z]?.crystalStructure && EXTENDED[selected.z]?.crystalStructure !== "other" && (() => {
                const phaseUnstable = inferredPhase === "liquid" || inferredPhase === "gas";
                const phaseUnknown  = inferredPhase === "unknown";
                return (
                  <button
                    className={`pt-crystal-view-btn${crystalView ? " active" : ""}${phaseUnstable ? " pt-crystal-view-btn--unstable" : ""}`}
                    onClick={() => { if (!phaseUnstable) { setCrystalView(v => !v); setNucleusView(false); setMoleculeView(false); setInspectorOrbital(null); } }}
                    disabled={phaseUnstable}
                    aria-pressed={crystalView}
                    title={phaseUnstable ? t.crystalUnstableTooltip : phaseUnknown ? t.crystalUnknownPhaseTooltip : t.crystalViewTitle}
                  >
                    {t.crystalViewBtn}{phaseUnknown && !phaseUnstable ? " ⚠" : ""}
                  </button>
                );
              })()}
              {selected && MOLECULES_BY_Z[selected.z] && (
                <button
                  className={`pt-molecule-view-btn${moleculeView ? " active" : ""}`}
                  onClick={() => { setMoleculeView(v => !v); setCrystalView(false); setNucleusView(false); setInspectorOrbital(null); setActiveMolIdx(0); }}
                  aria-pressed={moleculeView}
                  title={t.moleculeViewTitle}
                >
                  {t.moleculeViewBtn}
                </button>
              )}
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
            {/* Fullscreen toggle — always visible in atom view */}
            <button
              className={`pt-canvas-fs-btn${canvasFullscreen ? " active" : ""}`}
              onClick={() => setCanvasFullscreen(v => !v)}
              aria-pressed={canvasFullscreen}
              title={canvasFullscreen
                ? (locale === "en" ? "Exit fullscreen" : "Esci schermo intero")
                : (locale === "en" ? "Fullscreen canvas" : "Schermo intero")}
              aria-label={canvasFullscreen
                ? (locale === "en" ? "Exit fullscreen" : "Esci schermo intero")
                : (locale === "en" ? "Fullscreen canvas" : "Schermo intero")}
            >
              {canvasFullscreen ? "⊡" : "⊞"}
            </button>
            {moleculeView && (() => {
              const mols      = MOLECULES_BY_Z[selected.z];
              const predefined = mols?.[activeMolIdx];
              const mol        = molSearchResult ?? predefined;
              const polarLabel = mol && molMode === "polarity" ? getMolPolarLabel(mol) : null;
              return (
                <>
                  {mol && (
                    <>
                      <MoleculeScene
                        molecule={mol}
                        viewMode={molMode}
                        resetKey={molResetKey}
                        className="pt-canvas"
                      />
                      <div className="pt-mol-overlay">
                        <span className="pt-mol-formula">{mol.formula}</span>
                        <span className="pt-mol-name">
                          {locale === "en" ? mol.nameEN : mol.nameIT}
                        </span>
                        {polarLabel && (
                          <span className="pt-mol-polar-badge">
                            {polarLabel === "polar"           ? t.molPolar :
                             polarLabel === "apolarSymmetric" ? t.molApolarSymmetric :
                             polarLabel === "homopolar"       ? t.molHomopolar :
                                                               t.molApolar}
                          </span>
                        )}
                        {molSearchResult && (
                          <>
                            <span className="pt-mol-pubchem-badge">PubChem</span>
                            <span className="pt-mol-external-note">{t.molPubChemExternalNote}</span>
                            <button
                              className="pt-mol-clear-search"
                              onClick={() => { setMolSearchResult(null); setMolSearchQuery(""); setMolSearchError(null); setMolSearchHasSearched(false); }}
                              title={t.molBackToLocal}
                              aria-label={t.molBackToLocal}
                            >✕</button>
                          </>
                        )}
                      </div>
                      {/* View mode segmented control */}
                      <div className="pt-mol-mode">
                        <button
                          className={`pt-mol-mode-btn${molMode === "ball-stick" ? " active" : ""}`}
                          onClick={() => setMolMode("ball-stick")}
                          aria-pressed={molMode === "ball-stick"}
                          title={t.molModeBallStick}
                          aria-label={t.molModeBallStick}
                        >
                          {t.molModeBallStick}
                        </button>
                        <button
                          className={`pt-mol-mode-btn${molMode === "space-filling" ? " active" : ""}`}
                          onClick={() => setMolMode("space-filling")}
                          aria-pressed={molMode === "space-filling"}
                          title={t.molModeSpaceFill}
                          aria-label={t.molModeSpaceFill}
                        >
                          {t.molModeSpaceFill}
                        </button>
                        <button
                          className={`pt-mol-mode-btn${molMode === "polarity" ? " active" : ""}`}
                          onClick={() => setMolMode("polarity")}
                          aria-pressed={molMode === "polarity"}
                          title={t.molModePolarity}
                          aria-label={t.molModePolarity}
                        >
                          {t.molModePolarity}
                        </button>
                        <button
                          className="pt-mol-reset-btn"
                          onClick={() => setMolResetKey(k => k + 1)}
                          title={t.molModeReset}
                          aria-label={t.molModeReset}
                        >
                          {t.molModeReset}
                        </button>
                      </div>
                      <MolLegend molMode={molMode} isPubChem={!!molSearchResult} locale={locale} />
                    </>
                  )}
                  {!molSearchResult && mols && mols.length > 1 && (
                    <div className="pt-mol-tabs">
                      {mols.map((m, i) => (
                        <button
                          key={i}
                          className={`pt-mol-tab${i === activeMolIdx ? " active" : ""}`}
                          onClick={() => setActiveMolIdx(i)}
                        >
                          {m.formula}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* PubChem molecule search */}
                  <div className="pt-mol-pubchem-section">
                    <p className="pt-mol-pubchem-label">{t.molPubChemSection}</p>
                    <p className="pt-mol-pubchem-desc">{t.molPubChemDesc}</p>
                    <div className="pt-mol-search">
                      <input
                        className="pt-mol-search-input"
                        type="search"
                        value={molSearchQuery}
                        onChange={e => {
                          setMolSearchQuery(e.target.value);
                          if (molSearchHasSearched) { setMolSearchHasSearched(false); setMolSearchError(null); }
                        }}
                        onKeyDown={e => { if (e.key === "Enter") void handleMolSearch(molSearchQuery); }}
                        placeholder={t.molPubChemPlaceholder}
                        aria-label={locale === "en" ? "Search molecule on PubChem" : "Cerca molecola su PubChem"}
                      />
                      <button
                        className="pt-mol-search-btn"
                        onClick={() => void handleMolSearch(molSearchQuery)}
                        disabled={molSearchBusy || !molSearchQuery.trim()}
                        aria-label={locale === "en" ? "Search" : "Cerca"}
                      >
                        {molSearchBusy ? "…" : "↵"}
                      </button>
                    </div>
                    {molSearchHasSearched && !molSearchBusy && molSearchError === "notfound" && (
                      <p className="pt-mol-search-status">{t.molPubChemNotFound}</p>
                    )}
                    {molSearchHasSearched && !molSearchBusy && molSearchError === "networkerror" && (
                      <p className="pt-mol-search-status pt-mol-search-status--error">{t.molPubChemError}</p>
                    )}
                  </div>
                </>
              );
            })()}
            {crystalView && !moleculeView && EXTENDED[selected.z]?.crystalStructure ? (
              <>
                <CrystalViewScene
                  structure={EXTENDED[selected.z]!.crystalStructure}
                  color={CATEGORY_COLOR[selected.category] ?? "#6b7280"}
                  className="pt-canvas"
                />
                <CrystalLegend structure={EXTENDED[selected.z]?.crystalStructure} locale={locale} />
              </>
            ) : !moleculeView ? (
              <>
                <AtomScene
                  element={selected}
                  model={model}
                  realScale={realScale}
                  speedMultiplier={speedMultiplier}
                  lightMode={lightMode}
                  starsIntensity={starsIntensity}
                  vdwStyle={vdwStyle}
                  showSpin={showSpin}
                  nucleusView={nucleusView}
                  inspectorOrbital={inspectorOrbital}
                  className="pt-canvas"
                />
                {inspectorOrbital !== null && (
                  <>
                    <OrbitalSelector
                      current={inspectorOrbital}
                      onChange={setInspectorOrbital}
                    />
                    <OrbitalInfoPanel
                      orbitalKey={inspectorOrbital}
                      locale={locale}
                      isOpen={orbitalInfoOpen}
                      onToggle={() => setOrbitalInfoOpen(v => !v)}
                    />
                  </>
                )}
              </>
            ) : null}
            {(crystalView || moleculeView) && (
              <button
                className="pt-view-back-btn"
                onClick={() => { setCrystalView(false); setMoleculeView(false); setMolSearchResult(null); }}
                title={locale === "en" ? "Back to atom view" : "Torna alla vista atomo"}
              >
                ← {locale === "en" ? "atom" : "atomo"}
              </button>
            )}
            {nucleusView && (
              <div className="pt-nucleus-overlay" aria-live="polite">
                <div className="pt-nucleus-stat">
                  <span className="pt-nucleus-num">{selected.z}</span>
                  <span className="pt-nucleus-lbl">{locale === "en" ? "protons" : "protoni"}</span>
                </div>
                <div className="pt-nucleus-stat">
                  <span className="pt-nucleus-num">{selected.stableN}</span>
                  <span className="pt-nucleus-lbl">{locale === "en" ? "neutrons" : "neutroni"}</span>
                </div>
                <div className="pt-nucleus-stat">
                  <span className="pt-nucleus-num">{selected.z + selected.stableN}</span>
                  <span className="pt-nucleus-lbl">{locale === "en" ? "nucleons" : "nucleoni"}</span>
                </div>
              </div>
            )}
            {!nucleusView && inspectorOrbital === null && <ModelLegend model={model} showSpin={showSpin} locale={locale} />}
            {!nucleusView && !crystalView && !moleculeView && inspectorOrbital === null && (
              <TemperatureControl
                temperatureK={temperatureK}
                onTemperatureK={setTemperatureK}
                unit={tempUnit}
                meltingPoint={selectedExt?.meltingPoint ?? null}
                boilingPoint={selectedExt?.boilingPoint ?? null}
                locale={locale}
              />
            )}
          </div>
          <InfoPanel
            el={selected}
            locale={locale}
            tempUnit={tempUnit}
            lightMode={lightMode}
            onDragStart={handlePanelDragStart}
            onCrystalClick={() => { setCrystalView(true); setNucleusView(false); setMoleculeView(false); setInspectorOrbital(null); }}
            onMoleculeClick={(i) => { setMoleculeView(true); setActiveMolIdx(i); setCrystalView(false); setNucleusView(false); setInspectorOrbital(null); }}
            onStoryClick={() => setStoryMode(true)}
          />
          {storyMode && (
            <ElementStoryMode
              z={selected.z}
              locale={locale}
              onClose={() => setStoryMode(false)}
            />
          )}
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        <div className="pt-table-view">
          {/* Portrait mode hint (mobile only) */}
          <div className="pt-portrait-hint" aria-hidden="true">
            ↻ {locale === "en" ? "Rotate for best experience" : "Ruota il dispositivo"}
          </div>

          <div className="pt-toolbar">
            {thematicProp === "none" && <Legend locale={locale} />}
            <ThematicSelector
              current={thematicProp}
              onChange={(p) => { setThematicProp(p); }}
              locale={locale}
              negativeMode={negativeMode}
              onToggleNeg={() => setNegativeMode(v => !v)}
            />
            <ThematicLegend prop={thematicProp} range={propRange} locale={locale} />
          </div>
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
