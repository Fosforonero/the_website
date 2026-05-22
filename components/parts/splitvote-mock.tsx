type Props = { accent?: string };

export function SplitVoteMock({ accent = "#c084fc" }: Props) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/10",
        borderRadius: 10,
        overflow: "hidden",
        background: "linear-gradient(135deg, #070718 0%, #1a0d2e 100%)",
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
          color: "#a78bfa",
          fontSize: 9,
        }}
      >
        <span style={{ fontWeight: 600, color: accent }}>SPLITVOTE</span>
        <span style={{ color: "#6b7280" }}>·io</span>
      </div>
      <div style={{ padding: "4px 14px 0" }}>
        <div style={{ fontSize: 11, color: "#e9d5ff", fontWeight: 600, lineHeight: 1.2 }}>
          Pizza o sushi stasera?
        </div>
        <div style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>247 voti · 3h fa</div>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              flex: 1,
              height: 14,
              borderRadius: 3,
              background: "rgba(192,132,252,0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "63%",
                background: `linear-gradient(90deg, ${accent}, #f472b6)`,
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "0 6px",
                fontSize: 8,
                color: "#fff",
                lineHeight: "14px",
                fontWeight: 500,
              }}
            >
              Pizza
            </div>
          </div>
          <span style={{ fontSize: 9, color: accent, fontWeight: 600, minWidth: 24 }}>63%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              flex: 1,
              height: 14,
              borderRadius: 3,
              background: "rgba(192,132,252,0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "37%",
                background: "rgba(167,139,250,0.5)",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "0 6px",
                fontSize: 8,
                color: "#e9d5ff",
                lineHeight: "14px",
              }}
            >
              Sushi
            </div>
          </div>
          <span style={{ fontSize: 9, color: "#a78bfa", minWidth: 24 }}>37%</span>
        </div>
      </div>
    </div>
  );
}
