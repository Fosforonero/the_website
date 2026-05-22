// RotatingWord — 3-item cycler via CSS keyframes. No "use client" needed:
// pure markup, animation lives in globals.css (.fn-rotator → fnRotate3).
// An invisible sizer reserves the widest word's width so the layout never
// reflows during the cycle.

type Props = {
  /** Exactly 3 strings. */
  words: [string, string, string];
  color?: string;
};

export function RotatingWord({ words, color }: Props) {
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));
  return (
    <span style={{ display: "inline-block", position: "relative", verticalAlign: "top", color }}>
      <span aria-hidden style={{ visibility: "hidden", whiteSpace: "nowrap" }}>
        {longest}
      </span>
      <span
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          lineHeight: "inherit",
        }}
      >
        <span className="fn-rotator" style={{ display: "block" }} aria-live="polite">
          {[...words, words[0]].map((w, i) => (
            <span key={i} style={{ display: "block", whiteSpace: "nowrap" }}>
              {w}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
