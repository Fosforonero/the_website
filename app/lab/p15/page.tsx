// /lab/p15 — internal design lab.
// V0 (boxed) and V6 (mono) — each shown both light and negative.

import type { Metadata } from "next";
import { P15Box } from "@/components/parts/p15-box";
import { P15Mono } from "@/components/lab/p15-variants";

export const metadata: Metadata = {
  title: "P¹⁵ — design lab",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type Variant = {
  id: string;
  name: string;
  caption: string;
  Component: React.ComponentType<{
    size?: number;
    color?: string;
    dim?: string;
    negative?: boolean;
  }>;
};

const VARIANTS: Variant[] = [
  {
    id: "v0-boxed",
    name: "V0 · Boxed",
    caption: "La tile periodic-table style. Già in uso ovunque (Coming Soon, OG image, futuro Landing).",
    Component: P15Box,
  },
  {
    id: "v6-mono",
    name: "V6 · Mono / Typographic",
    caption: 'Senza cornice. Lockup tipografico "P + 15 + 30.97". Esportato come <P15Mono>.',
    Component: P15Mono,
  },
];

const SIZES = [56, 88, 144];

export default function P15LabPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(40px, 8vw, 72px) clamp(20px, 5vw, 64px)",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-dim)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          § Lab · internal
        </div>
        <h1
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            margin: "16px 0 12px",
          }}
        >
          P¹⁵ — light + negative
        </h1>
        <p
          style={{
            maxWidth: 640,
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "var(--color-ink-2)",
            opacity: 0.78,
            lineHeight: 1.5,
            margin: "0 0 48px",
          }}
        >
          Due varianti — V0 (boxed) e V6 (mono) — ciascuna in due trattamenti:
          chiara per sfondi light, negativa per sfondi dark / overlay /
          favicon su browser scuri. Prop <code>negative</code> già disponibile
          su entrambi i componenti.
        </p>
      </header>

      <section style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 24 }}>
        {VARIANTS.map(({ id, name, caption, Component }) => (
          <article
            key={id}
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-rule)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(10,10,10,0.04), 0 12px 32px rgba(10,10,10,0.04)",
            }}
          >
            <div
              style={{
                padding: "clamp(20px, 3vw, 28px) clamp(24px, 4vw, 36px)",
                borderBottom: "1px dashed var(--color-rule)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.018em",
                  }}
                >
                  {name}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 14,
                    color: "var(--color-dim)",
                    maxWidth: 720,
                  }}
                >
                  {caption}
                </p>
              </div>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-dim)",
                  background: "var(--color-surface)",
                  padding: "4px 10px",
                  borderRadius: 4,
                  letterSpacing: "0.04em",
                }}
              >
                {id}
              </code>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
              {/* Light row */}
              <VariantRow
                label="Light · su sfondo chiaro"
                bg="var(--color-bg)"
                inkOnTop={false}
                Component={Component}
                negative={false}
              />
              {/* Negative row */}
              <VariantRow
                label="Negative · su sfondo dark"
                bg="var(--color-ink)"
                inkOnTop
                Component={Component}
                negative
              />
            </div>
          </article>
        ))}
      </section>

      <footer
        style={{
          maxWidth: 1280,
          margin: "48px auto 0",
          paddingTop: 24,
          borderTop: "1px solid var(--color-rule)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-dim)",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        Internal · noindex · /lab/p15
      </footer>
    </main>
  );
}

function VariantRow({
  label,
  bg,
  inkOnTop,
  Component,
  negative,
}: {
  label: string;
  bg: string;
  inkOnTop: boolean;
  Component: React.ComponentType<{
    size?: number;
    color?: string;
    dim?: string;
    negative?: boolean;
  }>;
  negative: boolean;
}) {
  return (
    <div
      style={{
        background: bg,
        padding: "clamp(28px, 5vw, 48px) clamp(24px, 4vw, 36px)",
        borderTop: "1px solid var(--color-rule)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: inkOnTop ? "rgba(255,255,255,0.5)" : "var(--color-dim)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          gap: "clamp(28px, 5vw, 56px)",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {[56, 88, 144].map((s) => (
          <div
            key={s}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ minHeight: 160, display: "flex", alignItems: "center" }}>
              <Component size={s} negative={negative} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: inkOnTop ? "rgba(255,255,255,0.5)" : "var(--color-dim)",
              }}
            >
              {s}px
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Unused import suppression — page only needs SIZES if we expose it.
void SIZES;
