// TechTicker — horizontally-scrolling list. Pure CSS animation in globals.css
// (.fn-ticker → fnTicker). The content is duplicated so the loop is seamless.

import type { CSSProperties } from "react";

type Props = {
  items: string[];
  separator?: string;
  /** Wrap-around speed in seconds. */
  speedSec?: number;
  style?: CSSProperties;
};

export function TechTicker({ items, separator = "·", speedSec = 50, style }: Props) {
  // Set the animation duration via inline style override on the .fn-ticker
  // element. Tailwind v4 / native CSS picks this up cleanly.
  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        ...style,
      }}
    >
      <div
        className="fn-ticker"
        style={{ display: "inline-block", animationDuration: `${speedSec}s` }}
      >
        {[0, 1].map((rep) => (
          <span key={rep} style={{ display: "inline-block" }}>
            {items.map((it, i) => (
              <span key={i} style={{ display: "inline-block", padding: "0 24px" }}>
                <span style={{ color: "var(--color-ink)" }}>{it}</span>
                <span style={{ color: "var(--color-dim)", opacity: 0.4, marginLeft: 24 }}>
                  {separator}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
