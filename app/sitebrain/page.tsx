// SiteBrain AI — product landing page at /sitebrain
// Palette: fosforonero.com tokens (bg #FBFBFA, ink #0A0A0A, accent #00A341)

import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { Reveal } from "@/components/client/reveal";
import { SiteBrainMock } from "@/components/parts/sitebrain-mock";
import { site } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "SiteBrain AI — Chatbot RAG per WordPress",
  description:
    "Plugin WordPress gratuito con RAG engine self-hosted. Risponde ai visitatori usando i tuoi contenuti. OpenAI, Anthropic, OpenRouter. Zero lock-in, GDPR-ready.",
  alternates: {
    canonical: "/sitebrain",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: `${site.url}/sitebrain`,
    siteName: site.name,
    title: "SiteBrain AI — Chatbot RAG per WordPress",
    description:
      "Plugin WordPress gratuito con RAG engine self-hosted. Self-hosted, GDPR-ready, zero lock-in.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SiteBrain AI" }],
  },
  twitter: { card: "summary_large_image" },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK = [
  "PHP 8.0+",
  "WordPress 6.0+",
  "OpenAI",
  "Anthropic",
  "OpenRouter",
  "GPLv2+",
] as const;

const FEATURES = [
  {
    glyph: "◈",
    tag: "RAG Engine",
    title: "Indicizzazione automatica",
    body: "Scansiona pagine, post e documenti caricati. Ogni risposta è costruita sui tuoi contenuti effettivi, non su dati inventati.",
  },
  {
    glyph: "◎",
    tag: "Privacy-first",
    title: "Zero terze parti obbligatorie",
    body: "Dati sul tuo server WordPress. Nessun account cloud richiesto, nessun dato trasmesso a SiteBrain.",
  },
  {
    glyph: "◫",
    tag: "Multi-provider",
    title: "OpenAI · Anthropic · OpenRouter",
    body: "Cambi provider AI in trenta secondi dalle impostazioni. Porti la tua API key, paghi direttamente il provider.",
  },
  {
    glyph: "◷",
    tag: "AI → Umano",
    title: "Handoff lead integrato",
    body: "I visitatori lasciano nome, email e messaggio dall'interno della chat. Notifica email istantanea all'admin.",
  },
] as const;

const PRICING = [
  {
    name: "Free",
    priceDisplay: "Gratis",
    period: "GPL",
    tagline: "Per siti personali e test.",
    features: [
      "RAG keyword search",
      "OpenAI · Anthropic · OpenRouter",
      "Handoff lead (3/giorno)",
      "Quick questions configurabili",
      "Temi colore base",
    ],
    cta: { label: "Download gratuito", href: "https://wordpress.org/plugins/sitebrain-ai/", primary: false },
    highlight: false,
  },
  {
    name: "Pro",
    priceDisplay: "$79",
    period: "/anno",
    tagline: "Per siti professionali e piccoli team.",
    features: [
      "RAG semantico + embeddings",
      "Upload documenti (PDF, DOCX, TXT, MD)",
      "Handoff lead illimitati + contesto chat",
      "Statistiche avanzate",
      "WooCommerce integrato",
    ],
    cta: { label: "Acquista Pro", href: "#buy-pro", primary: true },
    highlight: true,
  },
  {
    name: "Studio",
    priceDisplay: "$299",
    period: "/anno",
    tagline: "Per agenzie e siti multipli.",
    features: [
      "Tutto di Pro",
      "Fino a 5 installazioni",
      "API access",
      "Audit log completo",
      "GDPR avanzato",
    ],
    cta: { label: "Acquista Studio", href: "#buy-studio", primary: false },
    highlight: false,
  },
  {
    name: "Agency",
    priceDisplay: "$499",
    period: "/anno",
    tagline: "Installazioni illimitate.",
    features: [
      "Tutto di Studio",
      "Installazioni illimitate",
      "Priorità supporto",
      "Accesso funzionalità beta",
    ],
    cta: { label: "Acquista Agency", href: "#buy-agency", primary: false },
    highlight: false,
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteBrainPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav locale="it" />

      <main id="main" style={{ flex: 1 }}>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          style={{
            padding:
              "clamp(40px, 8vw, 80px) clamp(20px, 5vw, 64px) clamp(48px, 8vw, 80px)",
            maxWidth: 1280,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr minmax(0, 380px)",
              gap: "clamp(40px, 7vw, 96px)",
              alignItems: "center",
            }}
          >
            {/* Left */}
            <Reveal>
              <div>
                <Pill
                  background="var(--color-accent-soft)"
                  color="var(--color-accent)"
                >
                  ● Plugin WordPress · Free &amp; Open Source
                </Pill>

                <h1
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(52px, 9vw, 96px)",
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    margin: "clamp(16px, 2.5vw, 22px) 0 0",
                    letterSpacing: "-0.048em",
                    lineHeight: 0.92,
                  }}
                >
                  SiteBrain
                  <br />
                  <span style={{ color: "var(--color-accent)" }}>AI</span>
                </h1>

                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(17px, 2.2vw, 21px)",
                    color: "var(--color-ink-2)",
                    opacity: 0.75,
                    margin: "clamp(18px, 2.5vw, 26px) 0 clamp(26px, 4vw, 40px)",
                    maxWidth: 540,
                    lineHeight: 1.5,
                    fontWeight: 400,
                  }}
                >
                  RAG engine self-hosted per WordPress. Indicizza i tuoi
                  contenuti e risponde ai visitatori in modo accurato, 24/7.
                </p>

                {/* CTAs */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <a
                    href="https://wordpress.org/plugins/sitebrain-ai/"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "13px 22px",
                      background: "var(--color-ink)",
                      color: "#fff",
                      borderRadius: 8,
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    ↓ Download gratuito
                  </a>
                  <a
                    href="#pricing"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "13px 22px",
                      background: "transparent",
                      color: "var(--color-ink)",
                      borderRadius: 8,
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                      border: "1px solid var(--color-rule)",
                    }}
                  >
                    Scopri PRO{" "}
                    <span style={{ color: "var(--color-accent)" }}>↗</span>
                  </a>
                </div>

                {/* Stack pills */}
                <div
                  style={{
                    marginTop: "clamp(22px, 3vw, 32px)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {STACK.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        padding: "4px 10px",
                        background: "var(--color-surface)",
                        color: "var(--color-dim)",
                        borderRadius: 4,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right: widget mock */}
            <Reveal delay={100}>
              <SiteBrainMock />
            </Reveal>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            background: "var(--color-rule)",
            maxWidth: 1280,
            margin: "0 auto",
            width: "calc(100% - clamp(40px, 10vw, 128px))",
          }}
        />

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section
          style={{
            padding:
              "clamp(52px, 9vw, 96px) clamp(20px, 5vw, 64px)",
            maxWidth: 1280,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Reveal>
            <Pill>Funzionalità</Pill>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: "14px 0 clamp(36px, 5vw, 60px)",
                letterSpacing: "-0.038em",
                lineHeight: 0.98,
              }}
            >
              Costruito per durare.
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              border: "1px solid var(--color-rule)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {FEATURES.map((f, i) => (
              <Reveal key={f.tag} delay={i * 55}>
                <div
                  style={{
                    padding: "clamp(26px, 3.5vw, 40px)",
                    background: "var(--color-card)",
                    borderRight:
                      i % 2 === 0 ? "1px solid var(--color-rule)" : "none",
                    borderBottom:
                      i < 2 ? "1px solid var(--color-rule)" : "none",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 24,
                      color: "var(--color-accent)",
                      marginBottom: 18,
                      lineHeight: 1,
                    }}
                  >
                    {f.glyph}
                  </div>
                  <Pill>{f.tag}</Pill>
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(17px, 2.3vw, 22px)",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      margin: "10px 0 10px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(14px, 1.6vw, 16px)",
                      color: "var(--color-ink-2)",
                      opacity: 0.78,
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────────── */}
        <section
          id="pricing"
          style={{
            padding:
              "clamp(52px, 9vw, 96px) clamp(20px, 5vw, 64px)",
            maxWidth: 1280,
            margin: "0 auto",
            width: "100%",
            borderTop: "1px solid var(--color-rule)",
          }}
        >
          <Reveal>
            <Pill>Prezzi</Pill>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: "14px 0 clamp(36px, 5vw, 60px)",
                letterSpacing: "-0.038em",
                lineHeight: 0.98,
              }}
            >
              Semplice e trasparente.
            </h2>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 14,
              alignItems: "stretch",
            }}
          >
            {PRICING.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 55}>
                <div
                  style={{
                    background: tier.highlight
                      ? "var(--color-ink)"
                      : "var(--color-card)",
                    border: tier.highlight
                      ? "none"
                      : "1px solid var(--color-rule)",
                    borderLeft: `4px solid ${
                      tier.highlight ? "#00A341" : "var(--color-rule)"
                    }`,
                    borderRadius: 14,
                    padding: "clamp(22px, 3vw, 32px)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {/* Tier name */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      color: tier.highlight
                        ? "rgba(255,255,255,0.45)"
                        : "var(--color-dim)",
                      textTransform: "uppercase",
                    }}
                  >
                    {tier.name}
                  </span>

                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginTop: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "clamp(30px, 4vw, 42px)",
                        fontWeight: 700,
                        color: tier.highlight ? "#fff" : "var(--color-ink)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                      }}
                    >
                      {tier.priceDisplay}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: tier.highlight
                          ? "rgba(255,255,255,0.45)"
                          : "var(--color-dim)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {tier.period}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12.5,
                      color: tier.highlight
                        ? "rgba(255,255,255,0.52)"
                        : "var(--color-dim)",
                      margin: "0 0 20px",
                      lineHeight: 1.45,
                    }}
                  >
                    {tier.tagline}
                  </p>

                  {/* Feature list */}
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "0 0 24px",
                      flex: 1,
                    }}
                  >
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 13,
                          color: tier.highlight
                            ? "rgba(255,255,255,0.80)"
                            : "var(--color-ink-2)",
                          padding: "7px 0",
                          borderBottom: `1px solid ${
                            tier.highlight
                              ? "rgba(255,255,255,0.07)"
                              : "var(--color-rule)"
                          }`,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 9,
                        }}
                      >
                        <span
                          style={{
                            color: "#00A341",
                            flexShrink: 0,
                            fontSize: 10,
                            marginTop: 2,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={tier.cta.href}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "11px 18px",
                      background: tier.cta.primary
                        ? "#00A341"
                        : tier.highlight
                          ? "rgba(255,255,255,0.1)"
                          : "var(--color-surface)",
                      color: tier.cta.primary
                        ? "#fff"
                        : tier.highlight
                          ? "#fff"
                          : "var(--color-ink)",
                      borderRadius: 8,
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {tier.cta.label}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-dim)",
                textAlign: "center",
                marginTop: 20,
                letterSpacing: "0.06em",
              }}
            >
              Fatturazione annuale · Nessun rinnovo automatico senza consenso ·
              Pagamento con carta via Stripe
            </p>
          </Reveal>
        </section>

        {/* ── Footer CTA ────────────────────────────────────────────────────── */}
        <section
          style={{
            padding:
              "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 64px) clamp(64px, 10vw, 100px)",
            maxWidth: 1280,
            margin: "0 auto",
            width: "100%",
            borderTop: "1px solid var(--color-rule)",
          }}
        >
          <Reveal>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 22,
              }}
            >
              <Pill
                background="var(--color-accent-soft)"
                color="var(--color-accent)"
              >
                ● Disponibile ora · v1.0
              </Pill>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(22px, 3.8vw, 42px)",
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  margin: 0,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  maxWidth: 580,
                }}
              >
                Installa il plugin gratuito e inizia in 5 minuti.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <a
                  href="https://wordpress.org/plugins/sitebrain-ai/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 26px",
                    background: "var(--color-ink)",
                    color: "#fff",
                    borderRadius: 8,
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  ↓ Download gratuito
                </a>
                <a
                  href="mailto:matteo@fosforonero.com?subject=SiteBrain AI PRO"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 26px",
                    background: "transparent",
                    color: "var(--color-ink)",
                    borderRadius: 8,
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid var(--color-rule)",
                  }}
                >
                  Contatta per PRO{" "}
                  <span style={{ color: "var(--color-accent)" }}>→</span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer locale="it" />
    </div>
  );
}
