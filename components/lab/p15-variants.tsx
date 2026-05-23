// P¹⁵ logo — surviving variant after the May 2026 review.
// V1 (Rounded), V2 (Circle), V3 (Heavy), V4 (Filled), V5 (Glitch) were
// removed because of alignment problems with the periodic-table layout.
// V0 (the original P15Box in components/parts/p15-box.tsx) and V6 (the
// typographic lockup below) are the two we keep.

type Props = {
  size?: number;
  color?: string;
  dim?: string;
  label?: string;
  /** Inverted variant: P becomes white, useful on dark backgrounds. */
  negative?: boolean;
};

// V6 — Mono / Typographic: no frame, oversized "P" + "15 / 30.97" lockup.
// Exported as P15Mono so other surfaces can reuse it (e.g. footer wordmark,
// document headers) without going through the boxed P15Box.
//
// Negative variant: the "P" turns white so the lockup reads on dark
// backgrounds; the consumer is responsible for the actual dark surface.
export function P15Mono({
  size = 88,
  color = "var(--color-accent)",
  dim = "var(--color-dim)",
  negative = false,
}: Props) {
  const pColor = negative ? "#fff" : "var(--color-ink)";
  const massColor = negative ? "rgba(255,255,255,0.6)" : dim;

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        display: "inline-flex",
        alignItems: "flex-start",
        gap: size * 0.04,
        lineHeight: 0.85,
      }}
      aria-hidden
    >
      <span
        style={{
          fontSize: size * 0.96,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          color: pColor,
        }}
      >
        P
      </span>
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
            color: massColor,
            letterSpacing: "0.04em",
          }}
        >
          30.97
        </span>
      </div>
    </div>
  );
}
