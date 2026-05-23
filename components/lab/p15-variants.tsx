// P¹⁵ logo — 6 algorithmic variants for design exploration.
// Each variant takes the same props (size, color, dim, label) so they're
// drop-in replaceable in components/parts/p15-box.tsx.

type Props = {
  size?: number;
  color?: string;
  dim?: string;
  label?: string;
};

// ─────────────────────────────────────────────────────────────
// V1 — Rounded: same tile, soft 14% radius corners.
// ─────────────────────────────────────────────────────────────
export function P15Rounded({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        borderRadius: size * 0.14,
        padding: size * 0.09,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        color,
      }}
      aria-hidden
    >
      <div style={{ fontSize: size * 0.18, opacity: 0.85, letterSpacing: "0.06em" }}>15</div>
      <div style={{ fontSize: size * 0.52, fontWeight: 700, lineHeight: 1 }}>P</div>
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
  );
}

// ─────────────────────────────────────────────────────────────
// V2 — Circle: round frame, same internal layout.
// ─────────────────────────────────────────────────────────────
export function P15Circle({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        borderRadius: "50%",
        padding: size * 0.14,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        color,
      }}
      aria-hidden
    >
      <div style={{ fontSize: size * 0.14, opacity: 0.85, letterSpacing: "0.1em" }}>15</div>
      <div style={{ fontSize: size * 0.48, fontWeight: 700, lineHeight: 1 }}>P</div>
      <div style={{ fontSize: size * 0.1, opacity: 0.75, letterSpacing: "0.16em", color: dim }}>
        30.97
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V3 — Heavy: thick 3px stroke, double-frame outline.
// ─────────────────────────────────────────────────────────────
export function P15Heavy({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${color}`,
        outline: `1px solid ${color}`,
        outlineOffset: 4,
        padding: size * 0.09,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        color,
      }}
      aria-hidden
    >
      <div style={{ fontSize: size * 0.18, fontWeight: 600, letterSpacing: "0.06em" }}>15</div>
      <div style={{ fontSize: size * 0.58, fontWeight: 800, lineHeight: 1, marginTop: -size * 0.04 }}>
        P
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: size * 0.14,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        <span>30.97</span>
        <span style={{ color: dim }}>3p³</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V4 — Filled / Inverted: ink fill, accent P, label inside.
// ─────────────────────────────────────────────────────────────
export function P15Filled({
  size = 88,
  color = "var(--color-accent)",
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "var(--color-ink)",
        color: "#fff",
        padding: size * 0.09,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
      }}
      aria-hidden
    >
      <div style={{ fontSize: size * 0.18, opacity: 0.7, letterSpacing: "0.06em" }}>15</div>
      <div
        style={{
          fontSize: size * 0.52,
          fontWeight: 700,
          lineHeight: 1,
          marginTop: -size * 0.04,
          color,
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
          opacity: 0.6,
          letterSpacing: "0.04em",
        }}
      >
        <span>30.97</span>
        <span style={{ color }}>3p³</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V5 — Glitch / Duotone: two layers offset, accent + ink shadow.
// ─────────────────────────────────────────────────────────────
function GlitchTile({
  size,
  shift,
  opacity,
  c,
  dim,
}: {
  size: number;
  shift: number;
  opacity: number;
  c: string;
  dim: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: shift,
        left: shift,
        width: size,
        height: size,
        border: `1.5px solid ${c}`,
        padding: size * 0.09,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        color: c,
        opacity,
      }}
      aria-hidden
    >
      <div style={{ fontSize: size * 0.18, letterSpacing: "0.06em" }}>15</div>
      <div style={{ fontSize: size * 0.52, fontWeight: 700, lineHeight: 1, marginTop: -size * 0.04 }}>
        P
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: size * 0.14,
          letterSpacing: "0.04em",
        }}
      >
        <span>30.97</span>
        <span style={{ color: dim }}>3p³</span>
      </div>
    </div>
  );
}

export function P15Glitch({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
}: Props) {
  return (
    <div style={{ position: "relative", width: size + 6, height: size + 6 }}>
      <GlitchTile size={size} shift={6} opacity={0.4} c="var(--color-ink)" dim={dim} />
      <GlitchTile size={size} shift={0} opacity={1} c={color} dim={dim} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V6 — Mono / Typographic: no box, just oversized "P¹⁵" lockup.
// ─────────────────────────────────────────────────────────────
export function P15Mono({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
}: Props) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--color-ink)",
        display: "inline-flex",
        alignItems: "flex-start",
        gap: size * 0.04,
        lineHeight: 0.85,
      }}
      aria-hidden
    >
      <span style={{ fontSize: size * 0.96, fontWeight: 700, letterSpacing: "-0.05em" }}>P</span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: size * 0.05,
          marginTop: size * 0.08,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: size * 0.26,
            fontWeight: 600,
            color,
            lineHeight: 1,
          }}
        >
          15
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: size * 0.13,
            color: dim,
            letterSpacing: "0.04em",
          }}
        >
          30.97
        </span>
      </div>
    </div>
  );
}
