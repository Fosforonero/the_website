// FitMesh app preview — small fidelity mock with health-graph silhouette.
// Pure SVG + CSS; server-rendered.

type Props = { accent?: string };

export function FitMeshMock({ accent = "#22c55e" }: Props) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/10",
        borderRadius: 10,
        overflow: "hidden",
        background: "linear-gradient(135deg, #050816 0%, #0a1226 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 14px",
          color: "#9aa3b2",
          fontSize: 9,
        }}
      >
        <span style={{ color: accent, fontWeight: 600 }}>FITMESH</span>
        <span>● ● ●</span>
      </div>
      <div style={{ padding: "2px 14px" }}>
        <div style={{ fontSize: 8, color: "#6b7280", letterSpacing: "0.1em" }}>
          HEART RATE · 24H
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            color: "#e5e7eb",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          72 <span style={{ fontSize: 9, color: accent }}>BPM</span>
        </div>
      </div>
      <svg viewBox="0 0 240 80" style={{ width: "100%", height: "52%", display: "block" }} aria-hidden>
        <defs>
          <linearGradient id="fmg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,50 L20,48 L30,40 L40,55 L55,38 L70,42 L85,30 L100,46 L115,28 L130,50 L150,36 L170,44 L190,32 L210,40 L240,28 L240,80 L0,80 Z"
          fill="url(#fmg)"
        />
        <path
          d="M0,50 L20,48 L30,40 L40,55 L55,38 L70,42 L85,30 L100,46 L115,28 L130,50 L150,36 L170,44 L190,32 L210,40 L240,28"
          fill="none"
          stroke={accent}
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
