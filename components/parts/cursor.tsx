// CSS blink — pure server component, no JS.
type Props = { color?: string; height?: number; width?: number };

export function Cursor({ color = "var(--color-accent)", height = 18, width = 10 }: Props) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width,
        height,
        background: color,
        verticalAlign: "-0.18em",
        marginLeft: 6,
        boxShadow: `0 0 6px ${color}`,
        animation: "fnBlink 1.05s steps(2, start) infinite",
      }}
    />
  );
}
