import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — Sviluppo software indipendente`;

// Edge-rendered OG image. Re-rendered at build/deploy; cached aggressively.
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FBFBFA",
          color: "#0A0A0A",
          padding: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        {/* P15 box wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 96,
              height: 96,
              border: "2.5px solid #00A341",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 10,
              boxSizing: "border-box",
              color: "#00A341",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.85 }}>15</div>
            <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1 }}>P</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>30.97</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 80, fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.035em" }}>
            Sviluppo software
            <br />
            <span style={{ color: "#00A341" }}>indipendente.</span>
          </div>
          <div style={{ fontSize: 26, color: "#6B6B66", marginTop: 12 }}>
            {site.author.name} · {site.author.city}, Italia · Dal {site.author.since}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
