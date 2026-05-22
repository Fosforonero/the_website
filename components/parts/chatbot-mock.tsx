// Chatbot AI plugin preview — small fidelity mock of a chat bubble + a
// conversational search bar. Pure SVG/CSS; server-rendered.

type Props = { accent?: string };

export function ChatbotMock({ accent = "#06b6d4" }: Props) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/10",
        borderRadius: 10,
        overflow: "hidden",
        background: "linear-gradient(135deg, #04161d 0%, #0c2b3a 100%)",
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
        <span style={{ color: accent, fontWeight: 600 }}>CHATBOT · BETA</span>
        <span>WP · v1.0</span>
      </div>

      {/* Search bar (Elementor shortcode mode) */}
      <div style={{ padding: "0 14px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${accent}55`,
            borderRadius: 999,
            padding: "5px 10px",
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 8, color: "#9aa3b2" }}>
            Come posso aiutarti
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 1,
                height: 8,
                background: accent,
                marginLeft: 2,
                verticalAlign: "middle",
              }}
            />
          </span>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "78%",
            padding: "5px 9px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "10px 10px 10px 2px",
            fontSize: 8,
            color: "#e5e7eb",
            lineHeight: 1.35,
          }}
        >
          Ciao <span style={{ color: accent }}>👋</span> come posso aiutarti oggi?
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "60%",
            padding: "5px 9px",
            background: accent,
            borderRadius: "10px 10px 2px 10px",
            fontSize: 8,
            color: "#04161d",
            fontWeight: 500,
            lineHeight: 1.35,
          }}
        >
          Bandi aperti?
        </div>
      </div>

      {/* Floating bubble */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 0 4px ${accent}22, 0 6px 14px rgba(6,182,212,0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#04161d" aria-hidden>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    </div>
  );
}
