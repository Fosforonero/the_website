"use client";

// ---------------------------------------------------------------------------
// Inline SVG figures for the black-hole methodology page.
// Every curve is COMPUTED from the equations stated in the page (no decorative
// art, per "fail loud, never fake"): light-deflection geodesic integral, the
// timelike effective potential / ISCO, the Doppler+redshift factor on a ring,
// and the equatorial Kerr photon-orbit radii vs spin. Geometrized units M = 1
// (so the Schwarzschild radius is r_s = 2M = 2, the photon sphere r = 3M, the
// ISCO r = 6M and the shadow impact parameter b_c = 3*sqrt(3) M).
// ---------------------------------------------------------------------------

type Locale = "it" | "en";
type Pt = [number, number];
type Series = { points: Pt[]; color: string; label: string; dashed?: boolean };
type VLine = { x: number; label: string; color?: string };
type HLine = { y: number; label?: string; color?: string };

export type FigureId = "deflection" | "potential" | "doppler" | "kerrShadow" | "polarization";

const C = {
  orange: "#ff8a3c",
  blue: "#5ec8ff",
  violet: "#b48cff",
  axis: "#5a6b86",
  grid: "#2a3550",
  text: "#aebbd2",
  ref: "#8090ad",
};

// --- Physics helpers (M = 1) ----------------------------------------------

const B_CRIT = 3 * Math.sqrt(3); // shadow / photon-ring impact parameter

/** Exact light bending: deflection angle alpha(b) for a Schwarzschild photon.
 *  Integrates (du/dphi)^2 = 1/b^2 - u^2 + 2u^3 (u = M/r) from 0 to the turning
 *  point u0, regularizing the sqrt singularity with u = u0(1 - s^2). */
function deflectionDeg(b: number): number {
  const inv = 1 / (b * b);
  const h = (u: number) => inv - u * u + 2 * u * u * u;
  // smallest positive root u0 (the physical turning point, r > 3M)
  let u0 = NaN;
  const step = 5e-4;
  for (let u = step; u < 1; u += step) {
    if (h(u) <= 0) {
      let lo = u - step;
      let hi = u;
      for (let k = 0; k < 60; k++) {
        const mid = 0.5 * (lo + hi);
        if (h(mid) > 0) lo = mid;
        else hi = mid;
      }
      u0 = 0.5 * (lo + hi);
      break;
    }
  }
  if (!Number.isFinite(u0)) return NaN;
  const N = 4000;
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const s = (i + 0.5) / N;
    const u = u0 * (1 - s * s);
    const hv = h(u);
    if (hv > 0) sum += (2 * u0 * s) / Math.sqrt(hv);
  }
  const dphi = 2 * (sum / N);
  return ((dphi - Math.PI) * 180) / Math.PI;
}

/** Timelike effective potential V_eff(r) = sqrt[(1-2/r)(1+L^2/r^2)]. */
function vEff(r: number, L: number): number {
  return Math.sqrt((1 - 2 / r) * (1 + (L * L) / (r * r)));
}

/** Equatorial circular photon-orbit radius in Kerr (Bardeen 1972).
 *  sign = -1 prograde, +1 retrograde. */
function rPhoton(a: number, sign: number): number {
  return 2 * (1 + Math.cos((2 / 3) * Math.acos(sign * a)));
}

function linspace(a: number, b: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + ((b - a) * i) / (n - 1));
  return out;
}

// --- Figure data (computed once at module load) ----------------------------

const deflectionData = (() => {
  const exact: Pt[] = [];
  const weak: Pt[] = [];
  for (const b of linspace(B_CRIT + 0.03, 14, 160)) {
    const a = deflectionDeg(b);
    if (Number.isFinite(a) && a <= 240) exact.push([b, a]);
    weak.push([b, ((4 / b) * 180) / Math.PI]); // weak-field 4M/b
  }
  return { exact, weak };
})();

const potentialData = (() => {
  const rs = linspace(3, 24, 200);
  const mk = (L: number): Pt[] => rs.map((r) => [r, vEff(r, L)]);
  return {
    isco: mk(Math.sqrt(12)), // L = sqrt(12) M -> inflection at the ISCO
    stable: mk(4.0),
    deep: mk(5.0),
  };
})();

const dopplerData = (() => {
  const r0 = 6; // ring at the ISCO
  const inc = (75 * Math.PI) / 180;
  const v = Math.sqrt(1 / (r0 - 2)); // locally measured orbital speed, M=1
  const grav = Math.sqrt(1 - 3 / r0);
  const g: Pt[] = [];
  const g4: Pt[] = [];
  for (const phiDeg of linspace(0, 360, 200)) {
    const phi = (phiDeg * Math.PI) / 180;
    const beta = v * Math.sin(inc) * Math.sin(phi);
    const gg = grav / (1 - beta);
    g.push([phiDeg, gg]);
    g4.push([phiDeg, gg * gg * gg * gg]);
  }
  return { g, g4 };
})();

const kerrData = (() => {
  const as = linspace(0, 1, 160);
  const prograde: Pt[] = as.map((a) => [a, rPhoton(a, -1)]);
  const retrograde: Pt[] = as.map((a) => [a, rPhoton(a, +1)]);
  const horizon: Pt[] = as.map((a) => [a, 1 + Math.sqrt(Math.max(0, 1 - a * a))]);
  return { prograde, retrograde, horizon };
})();

// --- Generic SVG line plot -------------------------------------------------

function fmt(n: number): string {
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(0);
  if (Math.abs(n - Math.round(n)) < 1e-9) return n.toFixed(0);
  return n.toFixed(1);
}

function LinePlot(props: {
  title: string;
  xLabel: string;
  yLabel: string;
  xRange: [number, number];
  yRange: [number, number];
  series: Series[];
  vlines?: VLine[];
  hlines?: HLine[];
  caption: string;
}) {
  const { title, xLabel, yLabel, xRange, yRange, series, vlines, hlines, caption } = props;
  const W = 580;
  const H = 360;
  const m = { l: 58, r: 16, t: 16, b: 48 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const [x0, x1] = xRange;
  const [y0, y1] = yRange;
  const sx = (x: number) => m.l + ((x - x0) / (x1 - x0)) * pw;
  const sy = (y: number) => m.t + (1 - (y - y0) / (y1 - y0)) * ph;
  const toPath = (pts: Pt[]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(" ");
  const xticks = linspace(x0, x1, 6);
  const yticks = linspace(y0, y1, 5);

  return (
    <figure className="bh-about__fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="bh-about__plot">
        {/* grid + ticks */}
        {xticks.map((tx, i) => (
          <g key={`x${i}`}>
            <line x1={sx(tx)} y1={m.t} x2={sx(tx)} y2={m.t + ph} stroke={C.grid} strokeWidth={1} />
            <text x={sx(tx)} y={m.t + ph + 18} fill={C.text} fontSize={11} textAnchor="middle">
              {fmt(tx)}
            </text>
          </g>
        ))}
        {yticks.map((ty, i) => (
          <g key={`y${i}`}>
            <line x1={m.l} y1={sy(ty)} x2={m.l + pw} y2={sy(ty)} stroke={C.grid} strokeWidth={1} />
            <text x={m.l - 8} y={sy(ty) + 4} fill={C.text} fontSize={11} textAnchor="end">
              {fmt(ty)}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={m.l} y1={m.t} x2={m.l} y2={m.t + ph} stroke={C.axis} strokeWidth={1.5} />
        <line x1={m.l} y1={m.t + ph} x2={m.l + pw} y2={m.t + ph} stroke={C.axis} strokeWidth={1.5} />
        {/* reference lines */}
        {hlines?.map((hl, i) => (
          <g key={`h${i}`}>
            <line
              x1={m.l}
              y1={sy(hl.y)}
              x2={m.l + pw}
              y2={sy(hl.y)}
              stroke={hl.color ?? C.ref}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {hl.label && (
              <text x={m.l + pw - 4} y={sy(hl.y) - 4} fill={hl.color ?? C.ref} fontSize={10} textAnchor="end">
                {hl.label}
              </text>
            )}
          </g>
        ))}
        {vlines?.map((vl, i) => (
          <g key={`v${i}`}>
            <line
              x1={sx(vl.x)}
              y1={m.t}
              x2={sx(vl.x)}
              y2={m.t + ph}
              stroke={vl.color ?? C.ref}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text x={sx(vl.x) + 4} y={m.t + 12} fill={vl.color ?? C.ref} fontSize={10}>
              {vl.label}
            </text>
          </g>
        ))}
        {/* data */}
        {series.map((s, i) => (
          <path
            key={i}
            d={toPath(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "6 4" : undefined}
            strokeLinejoin="round"
          />
        ))}
        {/* legend */}
        <g>
          {series.map((s, i) => (
            <g key={i} transform={`translate(${m.l + 12}, ${m.t + 14 + i * 16})`}>
              <line x1={0} y1={0} x2={20} y2={0} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "6 4" : undefined} />
              <text x={26} y={4} fill={C.text} fontSize={11}>
                {s.label}
              </text>
            </g>
          ))}
        </g>
        {/* axis labels */}
        <text x={m.l + pw / 2} y={H - 8} fill={C.text} fontSize={12} textAnchor="middle">
          {xLabel}
        </text>
        <text
          x={14}
          y={m.t + ph / 2}
          fill={C.text}
          fontSize={12}
          textAnchor="middle"
          transform={`rotate(-90 14 ${m.t + ph / 2})`}
        >
          {yLabel}
        </text>
      </svg>
      <figcaption className="bh-about__figcap">{caption}</figcaption>
    </figure>
  );
}

// --- Localized figure wrappers ---------------------------------------------

const TXT: Partial<Record<FigureId, Record<Locale, { x: string; y: string; cap: string; series: string[] }>>> = {
  deflection: {
    it: {
      x: "parametro d'impatto b / M",
      y: "angolo di deflessione α (gradi)",
      cap: "Deflessione esatta della luce: per b grandi tende al valore di campo debole 4M/b, ma diverge avvicinandosi a b_c = 3√3 M ≈ 5,2 M, il bordo dell'ombra dove la luce gira più volte attorno al buco e nasce il photon ring.",
      series: ["α esatto (geodetica)", "4M/b (campo debole)"],
    },
    en: {
      x: "impact parameter b / M",
      y: "deflection angle α (degrees)",
      cap: "Exact light bending: for large b it approaches the weak-field value 4M/b, but it diverges as b → b_c = 3√3 M ≈ 5.2 M, the shadow edge where light winds several times around the hole and the photon ring forms.",
      series: ["α exact (geodesic)", "4M/b (weak field)"],
    },
  },
  potential: {
    it: {
      x: "raggio r / M",
      y: "potenziale efficace V_eff",
      cap: "Potenziale efficace di una particella massiva. Sopra L = √12 M c'è una conca (orbita stabile) e una gobba (instabile); a L = √12 M si fondono in un flesso a r = 6M: è l'ISCO, l'ultima orbita circolare stabile. Più dentro non c'è nulla che trattenga il gas.",
      series: ["L = √12 M (ISCO)", "L = 4 M", "L = 5 M"],
    },
    en: {
      x: "radius r / M",
      y: "effective potential V_eff",
      cap: "Effective potential of a massive particle. Above L = √12 M there is a well (stable orbit) and a bump (unstable); at L = √12 M they merge into an inflection at r = 6M: the ISCO, the innermost stable circular orbit. Closer in, nothing holds the gas.",
      series: ["L = √12 M (ISCO)", "L = 4 M", "L = 5 M"],
    },
  },
  doppler: {
    it: {
      x: "azimut sull'anello φ (gradi)",
      y: "fattore g  e  luminosità g⁴",
      cap: "Anello di gas all'ISCO (r = 6M) visto a 75° di inclinazione. Il fattore g (redshift gravitazionale × Doppler) supera 1 sul lato che avanza e scende sotto 1 su quello che recede; la luminosità va come g⁴, perciò un lato è abbagliante e blu, l'altro cupo e rosso.",
      series: ["g (shift di frequenza)", "g⁴ (luminosità)"],
    },
    en: {
      x: "azimuth around the ring φ (degrees)",
      y: "factor g  and  brightness g⁴",
      cap: "A gas ring at the ISCO (r = 6M) seen at 75° inclination. The factor g (gravitational redshift × Doppler) exceeds 1 on the approaching side and drops below 1 on the receding one; brightness scales as g⁴, so one side is blinding and blue, the other dim and red.",
      series: ["g (frequency shift)", "g⁴ (brightness)"],
    },
  },
  kerrShadow: {
    it: {
      x: "spin a / M",
      y: "raggio r / M",
      cap: "Orbite fotoniche equatoriali di Kerr al crescere dello spin. A buco fermo coincidono a r = 3M; ruotando, il fotone prograda scende fino a r = M e il retrogrado sale a r = 4M: il frame-dragging spezza l'anello fotonico in modo asimmetrico. In grigio l'orizzonte degli eventi.",
      series: ["fotone prograda", "fotone retrogrado", "orizzonte r₊"],
    },
    en: {
      x: "spin a / M",
      y: "radius r / M",
      cap: "Equatorial Kerr photon orbits as spin increases. For a static hole they coincide at r = 3M; with rotation the prograde photon drops to r = M and the retrograde one rises to r = 4M: frame dragging splits the photon ring asymmetrically. The event horizon is shown in grey.",
      series: ["prograde photon", "retrograde photon", "horizon r₊"],
    },
  },
};

// Schematic EVPA (polarization) figure — §7.5.
// Assumes toroidal B field viewed at inclination 75°. The E-vector (EVPA) for
// optically-thin synchrotron is perpendicular to the projected B on the sky.
// For toroidal B at disk azimuth φ: projected B ∝ (−sin φ, cos φ · cos i),
// so EVPA direction ∝ (cos φ · cos i, sin φ) (normalised).
// This is a SCHEMATIC — no GR polarization transport, no Faraday rotation.
const POL_INCL = (75 * Math.PI) / 180;
function PolarizationFigure({ locale }: { locale: Locale }) {
  const W = 580, H = 320;
  const cx = W / 2, cy = H / 2;
  const ci = Math.cos(POL_INCL);
  const ticks: { x: number; y: number; dx: number; dy: number; bright: number }[] = [];
  const radii = [55, 80, 108];
  const nPhi = 16;
  for (const ra of radii) {
    for (let k = 0; k < nPhi; k++) {
      const phi = (2 * Math.PI * k) / nPhi;
      const px = cx + ra * Math.cos(phi);
      const py = cy + ra * Math.sin(phi) * ci;
      // projected toroidal B direction
      const bx = -Math.sin(phi), by = Math.cos(phi) * ci;
      const bn = Math.sqrt(bx * bx + by * by);
      // EVPA perpendicular to B
      const ex = by / bn, ey = -bx / bn;
      // Doppler factor g ≈ grav / (1 − v·sin(i)·sin(φ))
      const vOrb = Math.sqrt(1 / (6 - 2)); // ~ ISCO speed M=1
      const grav = Math.sqrt(1 - 3 / 6);
      const g = grav / (1 - vOrb * Math.sin(POL_INCL) * Math.sin(phi));
      const bright = Math.min(1, Math.max(0.15, (g * g) / 2.5));
      ticks.push({ x: px, y: py, dx: ex, dy: ey, bright });
    }
  }
  const shadow = 38;
  const cap = locale === "it"
    ? "Polarizzazione schematica per campo B toroidale a 75° di inclinazione. Le stanghette mostrano la direzione EVPA (vettore E). Il semitono riflette il beaming Doppler (lato sinistro più brillante). SCHEMATICO — nessun trasporto radiativo GR, nessuna rotazione di Faraday."
    : "Schematic polarization for toroidal B field at 75° inclination. Tick marks show the EVPA (E-vector) direction. The shading reflects Doppler beaming (left side brighter). SCHEMATIC — no GR polarization transport, no Faraday rotation.";
  return (
    <figure className="bh-about__fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Polarization EVPA schematic" className="bh-about__plot">
        {/* disk background ellipse */}
        <ellipse cx={cx} cy={cy} rx={120} ry={120 * ci} fill="#1a0a04" stroke="#3a1800" strokeWidth={1} />
        {/* shadow */}
        <ellipse cx={cx} cy={cy} rx={shadow} ry={shadow * ci} fill="#050a14" />
        {/* EVPA ticks */}
        {ticks.map((tk, i) => {
          const len = 9;
          const col = `rgba(255,200,100,${tk.bright.toFixed(2)})`;
          return (
            <line key={i}
              x1={tk.x - tk.dx * len} y1={tk.y - tk.dy * len}
              x2={tk.x + tk.dx * len} y2={tk.y + tk.dy * len}
              stroke={col} strokeWidth={1.5} strokeLinecap="round" />
          );
        })}
        {/* horizon label */}
        <text x={cx} y={cy + 5} fill="#3a5070" fontSize={10} textAnchor="middle">horizon</text>
        {/* B field label */}
        <text x={cx + 130} y={cy - 12} fill={C.text} fontSize={10}>B</text>
        <path d={`M${cx + 118},${cy - 8} Q${cx + 122},${cy - 18} ${cx + 128},${cy - 14}`}
          fill="none" stroke={C.text} strokeWidth={1} />
      </svg>
      <figcaption className="bh-about__figcap">{cap}</figcaption>
    </figure>
  );
}

export function AboutFigure({ id, locale }: { id: FigureId; locale: Locale }) {
  if (id === "polarization") return <PolarizationFigure locale={locale} />;
  const t = TXT[id]![locale];
  if (id === "deflection") {
    return (
      <LinePlot
        title={t.y}
        xLabel={t.x}
        yLabel={t.y}
        xRange={[5, 14]}
        yRange={[0, 240]}
        vlines={[{ x: B_CRIT, label: "b_c = 3√3 M", color: C.violet }]}
        series={[
          { points: deflectionData.exact, color: C.orange, label: t.series[0]! },
          { points: deflectionData.weak, color: C.ref, label: t.series[1]!, dashed: true },
        ]}
        caption={t.cap}
      />
    );
  }
  if (id === "potential") {
    return (
      <LinePlot
        title={t.y}
        xLabel={t.x}
        yLabel={t.y}
        xRange={[3, 24]}
        yRange={[0.9, 1.15]}
        vlines={[{ x: 6, label: "ISCO 6M", color: C.violet }]}
        series={[
          { points: potentialData.isco, color: C.orange, label: t.series[0]! },
          { points: potentialData.stable, color: C.blue, label: t.series[1]! },
          { points: potentialData.deep, color: C.violet, label: t.series[2]! },
        ]}
        caption={t.cap}
      />
    );
  }
  if (id === "doppler") {
    return (
      <LinePlot
        title={t.y}
        xLabel={t.x}
        yLabel={t.y}
        xRange={[0, 360]}
        yRange={[0, 3.6]}
        hlines={[{ y: 1, label: "g = 1", color: C.ref }]}
        series={[
          { points: dopplerData.g, color: C.orange, label: t.series[0]! },
          { points: dopplerData.g4, color: C.blue, label: t.series[1]! },
        ]}
        caption={t.cap}
      />
    );
  }
  return (
    <LinePlot
      title={t.y}
      xLabel={t.x}
      yLabel={t.y}
      xRange={[0, 1]}
      yRange={[0, 4.5]}
      series={[
        { points: kerrData.prograde, color: C.orange, label: t.series[0]! },
        { points: kerrData.retrograde, color: C.blue, label: t.series[1]! },
        { points: kerrData.horizon, color: C.ref, label: t.series[2]!, dashed: true },
      ]}
      caption={t.cap}
    />
  );
}
