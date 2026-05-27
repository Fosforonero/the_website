import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";

export const metadata: Metadata = {
  title: "Acquisto completato — SiteBrain AI",
  robots: { index: false },
};

export default function SiteBrainSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav locale="it" />

      <main
        id="main"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 64px)",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--color-accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              fontSize: 28,
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700,
              color: "var(--color-ink)",
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Acquisto completato.
          </h1>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "var(--color-ink-2)",
              opacity: 0.75,
              lineHeight: 1.6,
              margin: "0 0 36px",
            }}
          >
            Riceverai a breve un'email con la tua chiave di licenza SiteBrain AI
            PRO. Incollala in{" "}
            <strong style={{ color: "var(--color-ink)", fontWeight: 600 }}>
              Dashboard → SiteBrain AI → Impostazioni → Licenza
            </strong>
            .
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/sitebrain"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "var(--color-ink)",
                color: "#fff",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Torna a SiteBrain AI
            </a>
            <a
              href="https://wordpress.org/plugins/sitebrain-ai/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                background: "transparent",
                color: "var(--color-ink)",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                border: "1px solid var(--color-rule)",
              }}
            >
              ↓ Scarica il plugin
            </a>
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-dim)",
              marginTop: 32,
              letterSpacing: "0.04em",
            }}
          >
            Problemi? Scrivi a{" "}
            <a
              href="mailto:mat.pizzi@gmail.com"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              mat.pizzi@gmail.com
            </a>
          </p>
        </div>
      </main>

      <Footer locale="it" />
    </div>
  );
}
