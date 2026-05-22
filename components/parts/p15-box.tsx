// P¹⁵ — the brand glyph. Periodic-table tile for Phosphorus. Pure SVG-free
// markup so it stays sharp and the colours theme via CSS custom props.

type Props = {
  size?: number;
  /** Accent colour; defaults to var(--color-accent). */
  color?: string;
  /** Dim secondary text colour. */
  dim?: string;
  /** Optional wordmark beneath the tile. */
  label?: string;
  /** Soft outer glow ring. */
  glow?: boolean;
};

export function P15Box({
  size = 32,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
  label,
  glow = false,
}: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        fontFamily: "var(--font-mono)",
        color,
        lineHeight: 1,
      }}
      aria-label={label ? undefined : "Fosforonero"}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `1.5px solid ${color}`,
          padding: size * 0.09,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          boxShadow: glow ? `0 0 20px ${color}33, inset 0 0 18px ${color}11` : "none",
        }}
        aria-hidden
      >
        <div style={{ fontSize: size * 0.18, opacity: 0.85, letterSpacing: "0.06em" }}>15</div>
        <div style={{ fontSize: size * 0.52, fontWeight: 700, lineHeight: 1, marginTop: -size * 0.04 }}>
          P
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: size * 0.14,
            opacity: 0.75,
            letterSpacing: "0.04em",
          }}
        >
          <span>30.97</span>
          <span style={{ color: dim }}>3p³</span>
        </div>
      </div>
      {label ? (
        <div
          style={{
            marginTop: 8,
            fontSize: size * 0.17,
            letterSpacing: "0.32em",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
