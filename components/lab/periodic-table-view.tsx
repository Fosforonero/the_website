"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ELEMENTS, CATEGORY_COLOR, gridPosition, type Element } from "@/lib/elements-data";
import {
  EXTENDED, THEMATIC_PROPERTIES, STATE_COLOR, BLOCK_COLOR,
  type ThematicProperty, type ElementExtended,
} from "@/lib/element-extended-data";
import type { AtomModel } from "./atom-scene";

const AtomScene = dynamic(
  () => import("./atom-scene").then((m) => m.AtomScene),
  { ssr: false, loading: () => <div className="atom-loading">caricamento...</div> }
);

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
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

const MODELS: { key: AtomModel; label: string; desc: string; year: number }[] = [
  { key: "thomson",    label: "Thomson",     year: 1904, desc: "Sfera di carica positiva diffusa con elettroni incorporati — il modello «plum pudding» di J.J. Thomson" },
  { key: "rutherford", label: "Rutherford",  year: 1911, desc: "Nucleo denso e positivo attorniato da elettroni su orbite casuali — confermato dall'esperimento della lamina d'oro" },
  { key: "bohr",       label: "Bohr",        year: 1913, desc: "Orbite circolari quantizzate a livelli energetici discreti — spiega le righe spettrali dell'idrogeno" },
  { key: "sommerfeld", label: "Sommerfeld",  year: 1916, desc: "Orbite ellittiche kepleriane: l'elettrone accelera avvicinandosi al nucleo (2ª legge di Keplero)" },
  { key: "quantum",    label: "Quantistico", year: 1926, desc: "Orbitali come regioni di probabilità (nube elettronica s, p, d, f) — equazione di Schrödinger" },
];

// ─── Share helper ─────────────────────────────────────────────────────────────

function shareElement(el: Element) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/lab/tavola-periodica?z=${el.z}`;
  if (navigator.share) {
    navigator.share({ title: `${el.name} (${el.sym}) — Tavola Periodica`, url }).catch(() => {});
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

function getThematicColor(el: Element, prop: ThematicProperty, range: [number,number] | null): string {
  if (prop === "none") return CATEGORY_COLOR[el.category]!;
  const ext = EXTENDED[el.z];
  if (!ext) return "#6b7280";
  if (prop === "state") return STATE_COLOR[ext.state] ?? "#6b7280";
  if (prop === "block") return BLOCK_COLOR[ext.block] ?? "#6b7280";
  const raw = ext[prop as keyof ElementExtended] as number | null;
  if (raw === null || !range) return "#4b5563";
  const def = THEMATIC_PROPERTIES.find(p => p.key === prop);
  const value = def?.logScale ? Math.log10(Math.max(raw, 1e-12)) : raw;
  return heatmapColor((value - range[0]) / (range[1] - range[0]));
}

// ─── Element cell ─────────────────────────────────────────────────────────────

// ─── Light mode background options ───────────────────────────────────────────

const LIGHT_BACKGROUNDS = [
  { key: "sky",      color: "#e8ecf5", label: "cielo" },
  { key: "cream",    color: "#f2ede4", label: "crema" },
  { key: "lavender", color: "#edeaf5", label: "lavanda" },
] as const;

type LightBgKey = typeof LIGHT_BACKGROUNDS[number]["key"];

// ─── Search helpers ───────────────────────────────────────────────────────────

function matchesSearch(el: Element, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.toLowerCase().trim();
  return (
    el.name.toLowerCase().includes(lower) ||
    el.sym.toLowerCase() === lower ||
    el.z.toString() === lower.replace(/^0+/, "")
  );
}

// ─── Element cell ─────────────────────────────────────────────────────────────

type CellProps = {
  el: Element; selected: boolean; onSelect: (el: Element) => void;
  thematicColor?: string; dimmed?: boolean;
};

function ElementCell({ el, selected, onSelect, thematicColor, dimmed }: CellProps) {
  const color = thematicColor ?? CATEGORY_COLOR[el.category];
  return (
    <button
      className={`pt-cell${selected ? " pt-cell--active" : ""}${dimmed ? " pt-cell--dim" : ""}`}
      style={{ "--cat-color": color } as React.CSSProperties}
      onClick={() => onSelect(el)}
      title={`${el.name} — Z=${el.z}`}
      aria-label={`${el.name}, numero atomico ${el.z}`}
      aria-pressed={selected}
    >
      <span className="pt-cell__z" aria-hidden="true">{el.z}</span>
      <span className="pt-cell__sym">{el.sym}</span>
    </button>
  );
}

// col/row offsets: col 1 = period labels, row 1 = group headers
const C = (col: number) => col + 1;
const R = (row: number) => row + 1;

function PeriodicGrid({
  selected, onSelect, thematicProp, propRange, searchQuery,
}: {
  selected: Element | null;
  onSelect: (el: Element) => void;
  thematicProp: ThematicProperty;
  propRange: [number, number] | null;
  searchQuery: string;
}) {
  const hasSearch = searchQuery.trim().length > 0;
  return (
    <div className="pt-grid" role="grid" aria-label="Tavola periodica degli elementi">

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
              thematicColor={thematicProp !== "none"
                ? getThematicColor(el, thematicProp, propRange)
                : undefined}
              dimmed={hasSearch && !matchesSearch(el, searchQuery)}
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

function InfoPanel({ el }: { el: Element }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const color = CATEGORY_COLOR[el.category];
  const A   = el.z + el.stableN;
  const ext: ElementExtended | undefined = EXTENDED[el.z];
  const DESC_LIMIT = 120;

  return (
    <div className="pt-info" role="complementary" aria-label={`Dettagli ${el.name}`}>
      {/* Header */}
      <div className="pt-info__header" style={{ borderLeftColor: color }}>
        <div className="pt-info__header-top">
          <span className="pt-info__z">Z = {el.z}</span>
          <button
            className="pt-info__share"
            onClick={() => shareElement(el)}
            title="Condividi elemento"
            aria-label={`Condividi ${el.name}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        </div>
        <div className="pt-info__name-row">
          <h2 className="pt-info__name">{el.name}</h2>
          <span className="pt-info__sym" style={{ color }}>{el.sym}</span>
        </div>
        {ext && (
          <span className="pt-info__config" aria-label="Configurazione elettronica">
            {ext.config}
          </span>
        )}
      </div>

      {/* Scientific description — collapsible */}
      {ext?.description && (
        <div className="pt-info__desc-wrap">
          <p className="pt-info__desc">
            {descExpanded || ext.description.length <= DESC_LIMIT
              ? ext.description
              : ext.description.slice(0, DESC_LIMIT) + "…"}
          </p>
          {ext.description.length > DESC_LIMIT && (
            <button
              className="pt-info__desc-toggle"
              onClick={() => setDescExpanded(v => !v)}
              aria-expanded={descExpanded}
            >
              {descExpanded ? "meno" : "di più"}
            </button>
          )}
        </div>
      )}

      {/* Properties */}
      <dl className="pt-info__dl">
        <div><dt>Massa atomica</dt><dd>{el.mass} u</dd></div>
        <div>
          <dt>Isotopo stabile</dt>
          <dd><sup>{A}</sup>{el.sym}</dd>
        </div>
        <div>
          <dt>Configurazione shell</dt>
          <dd className="pt-info__shells">{el.shells.join(" · ")} e⁻</dd>
        </div>
        {ext && <>
          <div>
            <dt>Blocco / Stato</dt>
            <dd>
              <span className="pt-info__block-badge" data-block={ext.block}>{ext.block}</span>
              {" · "}
              <span style={{ color: STATE_COLOR[ext.state] }}>{ext.state}</span>
            </dd>
          </div>
          <div>
            <dt>Elettronegatività</dt>
            <dd>{fmt(ext.electronegativity, 2, "Pauling")}</dd>
          </div>
          <div>
            <dt>Raggio atomico</dt>
            <dd>{fmt(ext.atomicRadius, 0, "pm")}</dd>
          </div>
          <div>
            <dt>Ionizzazione I</dt>
            <dd>{fmt(ext.ionizationEnergy, 1, "kJ/mol")}</dd>
          </div>
          <div>
            <dt>Densità</dt>
            <dd>{fmt(ext.density, 3, "g/cm³")}</dd>
          </div>
          <div>
            <dt>Fusione / Ebollizione</dt>
            <dd>
              {fmt(ext.meltingPoint, 0, "K")}
              {ext.boilingPoint !== null && ` / ${fmt(ext.boilingPoint, 0, "K")}`}
            </dd>
          </div>
          {ext.discoverer && (
            <div>
              <dt>Scoperto da</dt>
              <dd>{ext.discoverer}{ext.discoveryYear ? `, ${ext.discoveryYear}` : ""}</dd>
            </div>
          )}
        </>}
        <div>
          <dt>Categoria</dt>
          <dd style={{ color }}>{CATEGORY_LABELS[el.category] ?? el.category}</dd>
        </div>
        <div><dt>Periodo / Gruppo</dt><dd>{el.period} / {el.group}</dd></div>
      </dl>
      <div className="pt-info__footer">
        <p className="pt-info__hint">trascina · scroll · Esc per tornare</p>
        <a
          href="https://ko-fi.com/fosforonero"
          target="_blank"
          rel="noopener noreferrer"
          className="pt-info__kofi"
          title="Supporta il progetto su Ko-fi"
        >
          ♥ supporta
        </a>
      </div>
    </div>
  );
}

// ─── Category legend ──────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="pt-legend" role="list" aria-label="Categorie degli elementi">
      {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
        <div key={cat} className="pt-legend__item" role="listitem">
          <span className="pt-legend__dot" style={{ background: color }} aria-hidden="true" />
          <span className="pt-legend__label">{CATEGORY_LABELS[cat]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Thematic property selector ───────────────────────────────────────────────

function ThematicSelector({
  current, onChange,
}: {
  current: ThematicProperty;
  onChange: (p: ThematicProperty) => void;
}) {
  return (
    <div className="pt-thematic-selector" role="group" aria-label="Proprietà tematica">
      <span className="pt-thematic-selector__lbl">vista</span>
      {THEMATIC_PROPERTIES.map(({ key, label }) => (
        <button
          key={key}
          className={`pt-thematic-btn${current === key ? " active" : ""}`}
          onClick={() => onChange(key)}
          title={THEMATIC_PROPERTIES.find(p => p.key === key)?.description}
          aria-pressed={current === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Thematic heat-map legend bar ─────────────────────────────────────────────

function ThematicLegend({
  prop, range,
}: {
  prop: ThematicProperty;
  range: [number, number] | null;
}) {
  const def = THEMATIC_PROPERTIES.find(p => p.key === prop);
  if (!def || prop === "none") return null;

  if (prop === "state") {
    return (
      <div className="pt-thematic-legend">
        {Object.entries(STATE_COLOR).map(([state, color]) => (
          <div key={state} className="pt-thematic-legend__item">
            <span className="pt-thematic-legend__dot" style={{ background: color }} />
            <span>{state}</span>
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
            <span>Blocco {block}</span>
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
        aria-label={`Scala ${def.label}: da ${fmtVal(range[0])} a ${fmtVal(range[1])} ${def.unit}`}
      />
      <span className="pt-thematic-legend__max">{fmtVal(range[1])} {def.unit}</span>
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange, matchCount, onEnter }: {
  value: string;
  onChange: (v: string) => void;
  matchCount: number;
  onEnter: () => void;
}) {
  return (
    <div className="pt-search">
      <input
        className="pt-search__input"
        type="search"
        placeholder="cerca elemento…"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") onEnter();
          if (e.key === "Escape") onChange("");
        }}
        aria-label="Cerca elemento per nome, simbolo o numero atomico"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <>
          <span className="pt-search__count">{matchCount}</span>
          <button className="pt-search__clear" onClick={() => onChange("")} aria-label="Cancella ricerca">×</button>
        </>
      )}
    </div>
  );
}

// ─── Donate button ────────────────────────────────────────────────────────────

function DonateButton() {
  return (
    <a
      href="https://ko-fi.com/fosforonero"
      target="_blank"
      rel="noopener noreferrer"
      className="pt-donate-btn"
      title="Supporta il progetto — Ko-fi"
    >
      ♥ supporta
    </a>
  );
}

// ─── Light background selector ───────────────────────────────────────────────

function LightBgSelector({ value, onChange }: { value: LightBgKey; onChange: (k: LightBgKey) => void }) {
  return (
    <div className="pt-lightbg-selector" role="group" aria-label="Sfondo versione chiara">
      {LIGHT_BACKGROUNDS.map(({ key, color, label }) => (
        <button
          key={key}
          className={`pt-lightbg-btn${value === key ? " active" : ""}`}
          style={{ "--swatch": color } as React.CSSProperties}
          onClick={() => onChange(key)}
          title={label}
          aria-pressed={value === key}
          aria-label={label}
        />
      ))}
    </div>
  );
}

// ─── Stars intensity toggle ───────────────────────────────────────────────────

const STARS_LABELS = ["stelle off", "stelle ·", "stelle ··"] as const;

function StarsToggle({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <button
      className="pt-stars-toggle"
      onClick={() => onChange((value + 1) % 3)}
      aria-label={STARS_LABELS[value]}
      title={STARS_LABELS[value]}
    >
      {value === 0 ? "✦ off" : value === 1 ? "✦" : "✦✦"}
    </button>
  );
}

// ─── Model switch ─────────────────────────────────────────────────────────────

function ModelSwitch({ current, onChange }: { current: AtomModel; onChange: (m: AtomModel) => void }) {
  return (
    <div className="pt-model-switch" role="group" aria-label="Seleziona modello atomico">
      {/* Desktop: pill buttons */}
      {MODELS.map(({ key, label, year, desc }) => (
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
        aria-label="Seleziona modello atomico"
      >
        {MODELS.map(({ key, label, year }) => (
          <option key={key} value={key}>{label} — {year}</option>
        ))}
      </select>
    </div>
  );
}

function ModelDesc({ model }: { model: AtomModel }) {
  const m = MODELS.find(x => x.key === model);
  if (!m) return null;
  return <p className="pt-model-desc">{m.desc}</p>;
}

// ─── Speed slider ─────────────────────────────────────────────────────────────

function SpeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="pt-speed-slider" title="Velocità di animazione degli elettroni">
      <span className="pt-speed-slider__lbl">vel</span>
      <input
        type="range"
        min={0.1}
        max={3}
        step={0.05}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="pt-speed-slider__input"
        aria-label="Velocità animazione"
      />
      <span className="pt-speed-slider__val">{value.toFixed(1)}×</span>
    </label>
  );
}

// ─── Scale toggle ─────────────────────────────────────────────────────────────

function ScaleToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`pt-scale-toggle${on ? " active" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
      title="Visualizza le distanze reali tra nucleo ed elettroni"
    >
      <span className="pt-scale-toggle__sw" />
      <span>scala reale</span>
    </button>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function PeriodicTableView() {
  const [selected,        setSelected]        = useState<Element | null>(ELEMENTS[0] ?? null);
  const [view,            setView]            = useState<"table" | "atom">("table");
  const [model,           setModel]           = useState<AtomModel>("bohr");
  const [realScale,       setRealScale]       = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [lightMode,       setLightMode]       = useState(false);
  const [thematicProp,    setThematicProp]    = useState<ThematicProperty>("none");
  const [showLegend,      setShowLegend]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [starsIntensity,  setStarsIntensity]  = useState(1);
  const [lightBgKey,      setLightBgKey]      = useState<LightBgKey>("sky");

  const lightBgColor = LIGHT_BACKGROUNDS.find(b => b.key === lightBgKey)?.color ?? "#e8ecf5";

  const propRange = useMemo<[number, number] | null>(() => {
    if (thematicProp === "none" || thematicProp === "state" || thematicProp === "block") return null;
    const def = THEMATIC_PROPERTIES.find(p => p.key === thematicProp);
    const values = Object.values(EXTENDED)
      .map(e => e[thematicProp as keyof ElementExtended])
      .filter((v): v is number => typeof v === "number" && v > 0)
      .map(v => def?.logScale ? Math.log10(v) : v);
    if (values.length === 0) return null;
    return [Math.min(...values), Math.max(...values)];
  }, [thematicProp]);

  const searchMatchCount = useMemo(() =>
    ELEMENTS.filter(el => matchesSearch(el, searchQuery)).length,
  [searchQuery]);

  const handleSelect = useCallback((el: Element) => {
    setSelected(el); setView("atom");
  }, []);

  const handleBack = useCallback(() => { setView("table"); setSearchQuery(""); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && view === "atom") handleBack(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, handleBack]);

  return (
    <div
      className={`pt-root${lightMode ? " pt-root--light" : ""}`}
      style={lightMode ? { "--pt-light-bg": lightBgColor } as React.CSSProperties : undefined}
    >
      {/* ── Header ── */}
      <header className="pt-header">
        <div className="pt-header__left">
          {view === "atom" && (
            <button className="pt-back" onClick={handleBack} aria-label="Torna alla tavola">
              ← tavola
            </button>
          )}
          <div>
            <h1 className="pt-title">Tavola Periodica <em>interattiva</em></h1>
            <p className="pt-subtitle">
              {view === "atom" && selected
                ? `${selected.name} · ${selected.sym} · Z=${selected.z}`
                : "118 elementi · clicca per esplorare"}
            </p>
          </div>
        </div>
        <div className="pt-header__right">
          {view === "atom" && (
            <>
              <ModelSwitch current={model} onChange={setModel} />
              <ScaleToggle on={realScale} onToggle={() => setRealScale(v => !v)} />
              <SpeedSlider value={speedMultiplier} onChange={setSpeedMultiplier} />
              <StarsToggle value={starsIntensity} onChange={setStarsIntensity} />
              {lightMode && <LightBgSelector value={lightBgKey} onChange={setLightBgKey} />}
            </>
          )}
          {view === "table" && (
            <>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                matchCount={searchMatchCount}
                onEnter={() => {
                  if (searchMatchCount === 1) {
                    const match = ELEMENTS.find(el => matchesSearch(el, searchQuery));
                    if (match) { setSelected(match); setView("atom"); setSearchQuery(""); }
                  }
                }}
              />
              <button
                className={`pt-toggle-legend${showLegend ? " active" : ""}`}
                onClick={() => setShowLegend(v => !v)}
              >
                {showLegend ? "nascondi legenda" : "legenda"}
              </button>
              <a href="/lab/tavola-periodica/about" className="pt-about-link">about</a>
              <DonateButton />
            </>
          )}
          {/* theme toggle — always visible */}
          <button
            className={`pt-theme-toggle${lightMode ? " active" : ""}`}
            onClick={() => setLightMode(v => !v)}
            aria-pressed={lightMode}
            title={lightMode ? "Passa al tema scuro" : "Passa al tema chiaro"}
          >
            {lightMode ? "◑ scuro" : "◑ chiaro"}
          </button>
        </div>
      </header>

      {/* ── Atom view ── */}
      {view === "atom" && selected && (
        <div className="pt-atom-view">
          <div className="pt-canvas-wrap">
            <AtomScene
              element={selected}
              model={model}
              realScale={realScale}
              speedMultiplier={speedMultiplier}
              lightMode={lightMode}
              starsIntensity={starsIntensity}
              lightBg={lightBgColor}
              className="pt-canvas"
            />
            <ModelDesc model={model} />
          </div>
          <InfoPanel el={selected} />
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        <div className="pt-table-view">
          {showLegend && thematicProp === "none" && <Legend />}
          <ThematicSelector current={thematicProp} onChange={setThematicProp} />
          <ThematicLegend prop={thematicProp} range={propRange} />
          <div className="pt-scroll">
            <PeriodicGrid
              selected={selected}
              onSelect={handleSelect}
              thematicProp={thematicProp}
              propRange={propRange}
              searchQuery={searchQuery}
            />
          </div>
          {selected && (
            <div className="pt-footer-hint">
              <strong style={{ color: CATEGORY_COLOR[selected.category] }}>
                {selected.name}
              </strong>{" "}({selected.sym}) — Z={selected.z} —{" "}
              <span style={{ opacity: 0.5 }}>clicca per aprire l&apos;atomo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
