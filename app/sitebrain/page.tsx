import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { Reveal } from "@/components/client/reveal";
import { SiteBrainMock } from "@/components/parts/sitebrain-mock";
import { SiteBrainPricing, type SiteBrainPrices } from "@/components/client/sitebrain-pricing";
import { SiteBrainFAQ } from "@/components/client/sitebrain-faq";
import { site } from "@/lib/site";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "SiteBrain AI — Chatbot RAG per WordPress",
  description:
    "Plugin WordPress gratuito con RAG engine self-hosted. Risponde ai visitatori usando i tuoi contenuti. OpenAI, Anthropic, OpenRouter. Zero lock-in, GDPR-ready.",
  alternates: { canonical: "/sitebrain" },
  openGraph: {
    type:      "website",
    locale:    "it_IT",
    url:       `${site.url}/sitebrain`,
    siteName:  site.name,
    title:     "SiteBrain AI — Chatbot RAG per WordPress",
    description:
      "Plugin WordPress gratuito con RAG engine self-hosted. Self-hosted, GDPR-ready, zero lock-in.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SiteBrain AI" }],
  },
  twitter: { card: "summary_large_image" },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK = ["PHP 8.0+", "WordPress 6.0+", "OpenAI", "Anthropic", "OpenRouter", "GPLv2+"] as const;

const FEATURES = [
  {
    glyph: "◈",
    tag:   "RAG Engine",
    title: "Indicizzazione automatica",
    body:  "Scansiona pagine, post e documenti caricati. Ogni risposta è costruita sui tuoi contenuti effettivi, non su dati inventati.",
  },
  {
    glyph: "◎",
    tag:   "Privacy-first",
    title: "Zero terze parti obbligatorie",
    body:  "Dati sul tuo server WordPress. Nessun account cloud richiesto, nessun dato trasmesso a SiteBrain.",
  },
  {
    glyph: "◫",
    tag:   "Multi-provider",
    title: "OpenAI · Anthropic · OpenRouter",
    body:  "Cambi provider AI in trenta secondi dalle impostazioni. Porti la tua API key, paghi direttamente il provider.",
  },
  {
    glyph: "◷",
    tag:   "AI → Umano",
    title: "Handoff lead integrato",
    body:  "I visitatori lasciano nome, email e messaggio dall'interno della chat. Notifica email istantanea all'admin.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Installa il plugin",   body: "Carica lo ZIP da WordPress.org o via wp-admin. Attivazione in un click." },
  { n: "02", title: "Inserisci la API key", body: "Collega OpenAI, Anthropic o OpenRouter dalle impostazioni. La chiave resta sul tuo server." },
  { n: "03", title: "Indicizza i contenuti",body: "Un click su «Index Content» e SiteBrain legge pagine, post e documenti caricati." },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrices(): SiteBrainPrices {
  return {
    pro: {
      annual:   { usd: process.env.SB_PRICE_PRO          ?? "", eur: process.env.SB_PRICE_PRO_EUR          ?? "" },
      lifetime: { usd: process.env.SB_PRICE_PRO_LIFETIME ?? "", eur: process.env.SB_PRICE_PRO_LIFETIME_EUR ?? "" },
    },
    studio: {
      annual:   { usd: process.env.SB_PRICE_STUDIO          ?? "", eur: process.env.SB_PRICE_STUDIO_EUR          ?? "" },
      lifetime: { usd: process.env.SB_PRICE_STUDIO_LIFETIME ?? "", eur: process.env.SB_PRICE_STUDIO_LIFETIME_EUR ?? "" },
    },
    agency: {
      annual:   { usd: process.env.SB_PRICE_AGENCY          ?? "", eur: process.env.SB_PRICE_AGENCY_EUR          ?? "" },
      lifetime: { usd: process.env.SB_PRICE_AGENCY_LIFETIME ?? "", eur: process.env.SB_PRICE_AGENCY_LIFETIME_EUR ?? "" },
    },
  };
}

const pad  = "clamp(20px,5vw,64px)";
const wide = { maxWidth: 1280, margin: "0 auto", width: "100%" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteBrainPage() {
  const prices = getPrices();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
      <Nav locale="it" />

      <main id="main" style={{ flex: 1 }}>

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            ...wide,
            padding: `clamp(48px,9vw,96px) ${pad} clamp(56px,9vw,96px)`,
            display: "grid",
            gridTemplateColumns: "1fr minmax(0,400px)",
            gap: "clamp(40px,7vw,96px)",
            alignItems: "center",
          }}
        >
          <Reveal>
            <div>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                ● Plugin WordPress · Free &amp; Open Source
              </Pill>

              <h1
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(56px,9.5vw,104px)",
                  fontWeight:    700,
                  color:         "var(--color-ink)",
                  margin:        "clamp(16px,2.5vw,22px) 0 0",
                  letterSpacing: "-0.05em",
                  lineHeight:    0.9,
                }}
              >
                SiteBrain
                <br />
                <span style={{ color: "var(--color-accent)" }}>AI</span>
              </h1>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize:   "clamp(17px,2.2vw,21px)",
                  color:      "var(--color-ink-2)",
                  opacity:    0.72,
                  margin:     "clamp(20px,2.8vw,28px) 0 clamp(28px,4vw,44px)",
                  maxWidth:   520,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                RAG engine self-hosted per WordPress. Indicizza i tuoi contenuti e risponde ai visitatori in modo accurato, 24/7.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <a
                  href="https://wordpress.org/plugins/sitebrain-ai/"
                  style={{
                    display:       "inline-flex",
                    alignItems:    "center",
                    gap:           8,
                    padding:       "14px 26px",
                    background:    "var(--color-ink)",
                    color:         "#fff",
                    borderRadius:  10,
                    fontFamily:    "var(--font-sans)",
                    fontSize:      15,
                    fontWeight:    700,
                    textDecoration:"none",
                    letterSpacing: "-0.01em",
                  }}
                >
                  ↓ Download gratuito
                </a>
                <a
                  href="#pricing"
                  style={{
                    display:       "inline-flex",
                    alignItems:    "center",
                    gap:           8,
                    padding:       "14px 26px",
                    background:    "transparent",
                    color:         "var(--color-ink)",
                    borderRadius:  10,
                    fontFamily:    "var(--font-sans)",
                    fontSize:      15,
                    fontWeight:    600,
                    textDecoration:"none",
                    border:        "1px solid var(--color-rule)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Piani PRO <span style={{ color: "var(--color-accent)" }}>↓</span>
                </a>
              </div>

              {/* Stack pills */}
              <div style={{ marginTop: "clamp(24px,3vw,36px)", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STACK.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily:    "var(--font-mono)",
                      fontSize:      11,
                      padding:       "4px 10px",
                      background:    "var(--color-surface)",
                      color:         "var(--color-dim)",
                      borderRadius:  4,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <SiteBrainMock />
          </Reveal>
        </section>

        {/* ══ COME FUNZIONA ═════════════════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid var(--color-rule)" }}>
          <section
            style={{
              ...wide,
              padding: `clamp(52px,8vw,88px) ${pad}`,
            }}
          >
            <Reveal>
              <Pill>Come funziona</Pill>
              <h2
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(32px,5.5vw,58px)",
                  fontWeight:    700,
                  color:         "var(--color-ink)",
                  margin:        "14px 0 clamp(36px,5vw,60px)",
                  letterSpacing: "-0.038em",
                  lineHeight:    0.98,
                }}
              >
                Operativo in 5 minuti.
              </h2>
            </Reveal>

            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap:                 "clamp(20px,3vw,32px)",
              }}
            >
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 80}>
                  <div
                    style={{
                      background:   "var(--color-card)",
                      border:       "1px solid var(--color-rule)",
                      borderTop:    "3px solid var(--color-accent)",
                      borderRadius: 14,
                      padding:      "clamp(22px,3vw,32px)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      11,
                        color:         "var(--color-accent)",
                        letterSpacing: "0.14em",
                        display:       "block",
                        marginBottom:  14,
                      }}
                    >
                      {step.n}
                    </span>
                    <h3
                      style={{
                        fontFamily:    "var(--font-sans)",
                        fontSize:      "clamp(16px,2vw,20px)",
                        fontWeight:    600,
                        color:         "var(--color-ink)",
                        margin:        "0 0 10px",
                        letterSpacing: "-0.02em",
                        lineHeight:    1.2,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize:   "clamp(13px,1.5vw,15px)",
                        color:      "var(--color-dim)",
                        lineHeight: 1.65,
                        margin:     0,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid var(--color-rule)", background: "var(--color-surface)" }}>
          <section
            style={{
              ...wide,
              padding: `clamp(52px,8vw,88px) ${pad}`,
            }}
          >
            <Reveal>
              <Pill>Funzionalità</Pill>
              <h2
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(32px,5.5vw,58px)",
                  fontWeight:    700,
                  color:         "var(--color-ink)",
                  margin:        "14px 0 clamp(36px,5vw,60px)",
                  letterSpacing: "-0.038em",
                  lineHeight:    0.98,
                }}
              >
                Costruito per durare.
              </h2>
            </Reveal>

            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap:                 "clamp(14px,2vw,20px)",
              }}
            >
              {FEATURES.map((f, i) => (
                <Reveal key={f.tag} delay={i * 55}>
                  <div
                    className="fn-card-hover"
                    style={{
                      background:   "var(--color-card)",
                      border:       "1px solid var(--color-rule)",
                      borderTop:    "3px solid var(--color-accent)",
                      borderRadius: 16,
                      padding:      "clamp(26px,3.5vw,40px)",
                      height:       "100%",
                      boxSizing:    "border-box",
                    }}
                  >
                    <div
                      style={{
                        fontFamily:  "var(--font-mono)",
                        fontSize:    40,
                        color:       "var(--color-accent)",
                        marginBottom: 20,
                        lineHeight:  1,
                        opacity:     0.7,
                      }}
                    >
                      {f.glyph}
                    </div>
                    <Pill>{f.tag}</Pill>
                    <h3
                      style={{
                        fontFamily:    "var(--font-sans)",
                        fontSize:      "clamp(17px,2.3vw,22px)",
                        fontWeight:    600,
                        color:         "var(--color-ink)",
                        margin:        "10px 0 10px",
                        letterSpacing: "-0.02em",
                        lineHeight:    1.2,
                      }}
                    >
                      {f.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize:   "clamp(14px,1.6vw,16px)",
                        color:      "var(--color-dim)",
                        lineHeight: 1.65,
                        margin:     0,
                      }}
                    >
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* ══ PRICING (dark) ════════════════════════════════════════════════════ */}
        <div id="pricing" style={{ background: "#0A0A0A" }}>
          <section style={{ ...wide, padding: `clamp(56px,9vw,100px) ${pad}` }}>
            <Reveal>
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.35)",
                  display:       "block",
                  marginBottom:  14,
                }}
              >
                Prezzi
              </span>
              <h2
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(36px,6vw,68px)",
                  fontWeight:    700,
                  color:         "#fff",
                  margin:        "0 0 clamp(40px,5.5vw,64px)",
                  letterSpacing: "-0.042em",
                  lineHeight:    0.96,
                }}
              >
                Semplice e
                <br />
                <span style={{ color: "#00A341" }}>trasparente.</span>
              </h2>
            </Reveal>

            <SiteBrainPricing prices={prices} />
          </section>
        </div>

        {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
        <div style={{ borderTop: "1px solid var(--color-rule)" }}>
          <section style={{ ...wide, padding: `clamp(52px,8vw,88px) ${pad}` }}>
            <Reveal>
              <Pill>FAQ</Pill>
              <h2
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(32px,5.5vw,58px)",
                  fontWeight:    700,
                  color:         "var(--color-ink)",
                  margin:        "14px 0 clamp(32px,5vw,52px)",
                  letterSpacing: "-0.038em",
                  lineHeight:    0.98,
                }}
              >
                Domande frequenti.
              </h2>
            </Reveal>
            <div style={{ maxWidth: 760 }}>
              <SiteBrainFAQ />
            </div>
          </section>
        </div>

        {/* ══ CTA (dark) ════════════════════════════════════════════════════════ */}
        <div style={{ background: "#0A0A0A" }}>
          <section
            style={{
              ...wide,
              padding:    `clamp(64px,10vw,112px) ${pad}`,
              textAlign:  "center",
              display:    "flex",
              flexDirection: "column",
              alignItems: "center",
              gap:        28,
            }}
          >
            <Reveal>
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.35)",
                  display:       "block",
                  marginBottom:  8,
                }}
              >
                ● Disponibile ora · v1.0
              </span>
              <p
                style={{
                  fontFamily:    "var(--font-sans)",
                  fontSize:      "clamp(28px,5vw,60px)",
                  fontWeight:    700,
                  color:         "#fff",
                  margin:        0,
                  letterSpacing: "-0.04em",
                  lineHeight:    1.0,
                  maxWidth:      680,
                }}
              >
                Installa gratis.
                <br />
                <span style={{ color: "#00A341" }}>Potenzia con il PRO</span>
                <br />
                quando sei pronto.
              </p>

              <div
                style={{
                  display:        "flex",
                  gap:            12,
                  flexWrap:       "wrap",
                  justifyContent: "center",
                  marginTop:      36,
                }}
              >
                <a
                  href="https://wordpress.org/plugins/sitebrain-ai/"
                  style={{
                    display:       "inline-flex",
                    alignItems:    "center",
                    gap:           8,
                    padding:       "15px 30px",
                    background:    "#fff",
                    color:         "#0A0A0A",
                    borderRadius:  10,
                    fontFamily:    "var(--font-sans)",
                    fontSize:      15,
                    fontWeight:    700,
                    textDecoration:"none",
                    letterSpacing: "-0.01em",
                  }}
                >
                  ↓ Download gratuito
                </a>
                <a
                  href="#pricing"
                  style={{
                    display:       "inline-flex",
                    alignItems:    "center",
                    gap:           8,
                    padding:       "15px 30px",
                    background:    "transparent",
                    color:         "#fff",
                    borderRadius:  10,
                    fontFamily:    "var(--font-sans)",
                    fontSize:      15,
                    fontWeight:    600,
                    textDecoration:"none",
                    border:        "1px solid rgba(255,255,255,0.2)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Vedi piani PRO <span style={{ color: "#00A341" }}>↑</span>
                </a>
              </div>
            </Reveal>
          </section>
        </div>

      </main>

      <Footer locale="it" />
    </div>
  );
}
