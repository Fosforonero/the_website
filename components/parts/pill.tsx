import type { ReactNode, CSSProperties } from "react";

type Props = {
  children: ReactNode;
  color?: string;
  background?: string;
  style?: CSSProperties;
};

export function Pill({ children, color, background, style }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.16em",
        color: color ?? "var(--color-dim)",
        background: background ?? "var(--color-surface)",
        padding: "4px 8px",
        borderRadius: 4,
        fontWeight: 500,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
