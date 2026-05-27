// SiteBrain AI chat widget preview — pure HTML/CSS, server-rendered.
// No hydration. Dark theme to contrast against the light fosforonero.com palette.

export function SiteBrainMock() {
  const bg0 = "#0D1117";
  const bg1 = "#161B22";
  const accent = "#00A341";
  const border = "rgba(255,255,255,0.06)";
  const textPrimary = "#CDD9E5";
  const textMuted = "#4B5563";

  const msgStyle = (fromUser: boolean): React.CSSProperties => ({
    background: fromUser ? `linear-gradient(135deg, ${accent}, #007A30)` : bg1,
    border: fromUser ? "none" : `1px solid ${border}`,
    borderRadius: fromUser ? "10px 10px 0 10px" : "0 10px 10px 10px",
    padding: "9px 12px",
    fontSize: 11.5,
    color: fromUser ? "#fff" : textPrimary,
    lineHeight: 1.55,
    maxWidth: "78%",
  });

  const avatar = (
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${accent}, #007A30)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        flexShrink: 0,
        marginTop: 2,
        color: "#fff",
        fontWeight: 700,
      }}
    >
      S
    </div>
  );

  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        aspectRatio: "9/14",
        borderRadius: 16,
        overflow: "hidden",
        background: bg0,
        border: `1px solid rgba(255,255,255,0.09)`,
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "13px 15px",
          background: bg1,
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}, #007A30)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            color: "#fff",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          S
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#E6EDF3", lineHeight: 1.2 }}>
            SiteBrain AI
          </div>
          <div
            style={{
              fontSize: 9.5,
              color: accent,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: accent,
              }}
            />
            ONLINE
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 16, color: textMuted, lineHeight: 1 }}>×</div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {/* Bot welcome */}
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
          {avatar}
          <div style={msgStyle(false)}>
            👋 Ciao! Come posso aiutarti?
          </div>
        </div>

        {/* User */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={msgStyle(true)}>Quali servizi offrite?</div>
        </div>

        {/* Bot answer with source cite */}
        <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
          {avatar}
          <div style={{ ...msgStyle(false), maxWidth: "85%" }}>
            Offriamo consulenza, sviluppo web e plugin WordPress su misura.{" "}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                color: accent,
                letterSpacing: "0.04em",
              }}
            >
              [Servizi →]
            </span>
          </div>
        </div>

        {/* Typing dots */}
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {avatar}
          <div
            style={{
              background: bg1,
              border: `1px solid ${border}`,
              borderRadius: "0 10px 10px 10px",
              padding: "10px 14px",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: accent,
                  opacity: 0.5 + i * 0.18,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick contact strip */}
      <div
        style={{
          padding: "7px 12px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          gap: 6,
          background: "rgba(0,163,65,0.04)",
        }}
      >
        {["WhatsApp", "Email"].map((ch) => (
          <span
            key={ch}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: accent,
              background: "rgba(0,163,65,0.12)",
              padding: "3px 8px",
              borderRadius: 20,
            }}
          >
            {ch}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9, color: textMuted, letterSpacing: "0.06em" }}>
          Talk to a person →
        </span>
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: bg0,
        }}
      >
        <div
          style={{
            flex: 1,
            background: bg1,
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 8,
            padding: "7px 11px",
            fontSize: 11,
            color: textMuted,
          }}
        >
          Scrivi un messaggio...
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ↑
        </div>
      </div>

      {/* Branding footer */}
      <div
        style={{
          padding: "5px 12px",
          background: bg0,
          borderTop: `1px solid rgba(255,255,255,0.03)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8.5,
            color: textMuted,
            letterSpacing: "0.12em",
          }}
        >
          POWERED BY SITEBRAIN AI
        </span>
      </div>
    </div>
  );
}
