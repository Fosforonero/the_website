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
  /** Inverted variant: dark background, light glyph, accent details. */
  negative?: boolean;
};

export function P15Box({
  size = 32,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
  label,
  glow = false,
  negative = false,
}: Props) {
  // Negative variant inverts the palette: ink-filled tile, white text, accent
  // for the "15", and the inner "3p³" picks up the brand colour.
  const bg = negative ? "var(--color-ink)" : "transparent";
  const border = negative ? color : color;
  const numberColor = negative ? color : "currentColor";
  const symbolColor = negative ? "#fff" : "currentColor";
  const massColor = negative ? "rgba(255,255,255,0.65)" : "currentColor";
  const orbitalColor = negative ? color : dim;

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
          border: `1.5px solid ${border}`,
          background: bg,
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
        <div
          style={{
            fontSize: size * 0.18,
            opacity: negative ? 1 : 0.85,
            letterSpacing: "0.06em",
            color: numberColor,
          }}
        >
          15
        </div>
        <div
          style={{
            fontSize: size * 0.52,
            fontWeight: 700,
            lineHeight: 1,
            marginTop: -size * 0.04,
            color: symbolColor,
          }}
        >
          P
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: size * 0.14,
            opacity: negative ? 1 : 0.75,
            letterSpacing: "0.04em",
            color: massColor,
          }}
        >
          <span>30.97</span>
          <span style={{ color: orbitalColor }}>3p³</span>
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
            color: negative ? "#fff" : color,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
