// Brand identity page. Server Component, reused by /identita (IT) and
// /en/identity (EN). Pubblica, indicizzabile, navigabile dal Nav del sito.
//
// Sezioni:
//   1) Hero editoriale con V6 (P15Mono) — momento tipografico grande
//   2) "Il nome" — racconto del fosforo nero (storia dell'università)
//   3) "Il simbolo" — V0 (P15Box) scomposto + annotazioni chimiche
//   4) "Variante negativa" — V0 + V6 su sfondo dark
//   5) "Colori" — palette tile + hex
//   6) "Tipografia" — Space Grotesk + JetBrains Mono samples
//   7) "Riferimento scientifico" — micro-bio chimica (per chi vuole sapere di più)

import Link from "next/link";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Reveal } from "@/components/client/reveal";
import { Pill } from "@/components/parts/pill";
import { P15Box } from "@/components/parts/p15-box";
import { P15Mono } from "@/components/lab/p15-variants";
import { getDictionary } from "@/lib/i18n";
import { getLocalePath, type Locale } from "@/lib/site";

const PAD_X = "clamp(20px, 5vw, 64px)";
const PAD_Y = "clamp(56px, 10vw, 96px)";

type Props = { locale: Locale };

export function IdentityPage({ locale }: Props) {
  const t = getDictionary(locale).identity;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Nav locale={locale} />

      <main id="main">
        {/* ───────── HERO — V6 editorial ───────── */}
        <section style={{ padding: `${PAD_Y} ${PAD_X} clamp(32px, 6vw, 64px)` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                {t.eyebrow}
              </Pill>
            </Reveal>
            <Reveal delay={100}>
              <h1
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(48px, 9vw, 112px)",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                  lineHeight: 0.95,
                  margin: "clamp(16px, 3vw, 24px) 0 12px",
                }}
              >
                {t.subtitle}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p
                style={{
                  maxWidth: 720,
                  fontSize: "clamp(17px, 2.2vw, 21px)",
                  color: "var(--color-ink-2)",
                  opacity: 0.78,
                  lineHeight: 1.55,
                  margin: "0 0 clamp(40px, 6vw, 64px)",
                }}
              >
                {t.intro}
              </p>
            </Reveal>

            {/* V6 editorial lockup */}
            <Reveal delay={260}>
              <div
                style={{
                  padding: "clamp(48px, 8vw, 96px) clamp(32px, 5vw, 64px)",
                  background: "var(--color-card)",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 16,
                  display: "flex",
                  justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(10,10,10,0.04), 0 24px 48px rgba(10,10,10,0.05)",
                }}
              >
                <P15Mono size={180} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── NAME ───────── */}
        <section
          style={{
            padding: `${PAD_Y} ${PAD_X}`,
            background: "var(--color-surface)",
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              display: "grid",
              gap: 24,
            }}
          >
            <Reveal>
              <SectionHeader number="01" title={t.nameTitle} />
            </Reveal>
            <Reveal delay={120}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(17px, 2vw, 20px)",
                  color: "var(--color-ink-2)",
                  lineHeight: 1.6,
                  display: "grid",
                  gap: "1em",
                }}
              >
                {t.nameBody.map((p, i) => (
                  <p key={i} style={{ margin: 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── SYMBOL — V0 scomposto ───────── */}
        <section style={{ padding: `${PAD_Y} ${PAD_X}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <SectionHeader number="02" title={t.symbolTitle} />
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  maxWidth: 720,
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--color-ink-2)",
                  opacity: 0.78,
                  lineHeight: 1.55,
                  marginTop: 16,
                  marginBottom: "clamp(32px, 5vw, 48px)",
                }}
              >
                {t.symbolBody}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div
                className="fn-grid-about"
                style={{
                  display: "grid",
                  gap: "clamp(32px, 5vw, 64px)",
                  alignItems: "center",
                  padding: "clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)",
                  background: "var(--color-card)",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 16,
                  boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
                }}
              >
                {/* Big symbol */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <P15Box size={240} />
                </div>

                {/* Annotations */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: 18,
                  }}
                >
                  {t.symbolAnnotations.map((a) => (
                    <li
                      key={a.label}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 16,
                        padding: "16px 18px",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-rule)",
                        borderRadius: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "var(--color-accent)",
                          minWidth: 68,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {a.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 16,
                          color: "var(--color-ink-2)",
                        }}
                      >
                        {a.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── NEGATIVE on dark ───────── */}
        <section
          style={{
            padding: `${PAD_Y} ${PAD_X}`,
            background: "var(--color-ink)",
            color: "var(--color-bg)",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <SectionHeader number="03" title={t.negativeTitle} darkMode />
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  maxWidth: 720,
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.55,
                  marginTop: 16,
                  marginBottom: "clamp(32px, 5vw, 48px)",
                }}
              >
                {t.negativeBody}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div
                style={{
                  display: "flex",
                  gap: "clamp(40px, 8vw, 96px)",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "clamp(48px, 8vw, 96px) clamp(24px, 4vw, 48px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                }}
              >
                <P15Box size={144} negative />
                <P15Mono size={144} negative />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── PALETTE ───────── */}
        <section
          style={{
            padding: `${PAD_Y} ${PAD_X}`,
            background: "var(--color-surface)",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <SectionHeader number="04" title={t.paletteTitle} />
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  maxWidth: 720,
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--color-ink-2)",
                  opacity: 0.78,
                  lineHeight: 1.55,
                  marginTop: 16,
                  marginBottom: "clamp(32px, 5vw, 48px)",
                }}
              >
                {t.paletteBody}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                {PALETTE.map((c) => (
                  <ColorTile key={c.hex} {...c} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── TYPOGRAPHY ───────── */}
        <section style={{ padding: `${PAD_Y} ${PAD_X}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <SectionHeader number="05" title={t.typoTitle} />
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  maxWidth: 720,
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--color-ink-2)",
                  opacity: 0.78,
                  lineHeight: 1.55,
                  marginTop: 16,
                  marginBottom: "clamp(32px, 5vw, 48px)",
                }}
              >
                {t.typoBody}
              </p>
            </Reveal>
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "1fr",
              }}
            >
              <Reveal delay={200}>
                <TypeSample
                  label={t.typoSansLabel}
                  family="var(--font-sans)"
                  sample="Sviluppo software indipendente."
                />
              </Reveal>
              <Reveal delay={280}>
                <TypeSample
                  label={t.typoMonoLabel}
                  family="var(--font-mono)"
                  sample="const fosforo = { Z: 15, m: 30.97, e: '3p³' };"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ───────── SCIENTIFIC REFERENCE ───────── */}
        <section
          style={{
            padding: `${PAD_Y} ${PAD_X}`,
            background: "var(--color-surface)",
          }}
        >
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <Reveal>
              <SectionHeader number="06" title={t.originTitle} />
            </Reveal>
            <Reveal delay={120}>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--color-ink-2)",
                  lineHeight: 1.6,
                  marginTop: 16,
                }}
              >
                {t.originBody}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ marginTop: 32 }}>
                <Link
                  href={getLocalePath(locale, "/")}
                  className="fn-link-underline"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--color-ink)",
                    letterSpacing: "0.12em",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {t.backHome}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-components (kept in-file to avoid scattering one-off pieces)
// ────────────────────────────────────────────────────────────────

function SectionHeader({
  number,
  title,
  darkMode = false,
}: {
  number: string;
  title: string;
  darkMode?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.32em",
          color: darkMode ? "rgba(255,255,255,0.5)" : "var(--color-dim)",
        }}
      >
        {"// "}{number}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(28px, 4.5vw, 44px)",
          fontWeight: 600,
          letterSpacing: "-0.028em",
          margin: 0,
          color: darkMode ? "var(--color-bg)" : "var(--color-ink)",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

type ColorEntry = { name: string; hex: string; varName: string; ink: boolean };

const PALETTE: ColorEntry[] = [
  { name: "Background", hex: "#FBFBFA", varName: "--color-bg", ink: true },
  { name: "Surface", hex: "#F4F4F1", varName: "--color-surface", ink: true },
  { name: "Card", hex: "#FFFFFF", varName: "--color-card", ink: true },
  { name: "Ink", hex: "#0A0A0A", varName: "--color-ink", ink: false },
  { name: "Ink 2", hex: "#1F1F1F", varName: "--color-ink-2", ink: false },
  { name: "Dim", hex: "#6B6B66", varName: "--color-dim", ink: false },
  { name: "Rule", hex: "#E7E7E2", varName: "--color-rule", ink: true },
  { name: "Phosphor", hex: "#00A341", varName: "--color-accent", ink: false },
];

function ColorTile({ name, hex, varName, ink }: ColorEntry) {
  return (
    <div
      style={{
        background: hex,
        border: "1px solid var(--color-rule)",
        borderRadius: 12,
        padding: "20px 18px",
        minHeight: 132,
        color: ink ? "var(--color-ink)" : "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 24,
        boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          opacity: 0.7,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span>{hex.toUpperCase()}</span>
        <span>{varName}</span>
      </div>
    </div>
  );
}

function TypeSample({
  label,
  family,
  sample,
}: {
  label: string;
  family: string;
  sample: string;
}) {
  return (
    <div
      style={{
        padding: "clamp(28px, 4vw, 40px) clamp(24px, 4vw, 40px)",
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-dim)",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: family,
          fontSize: "clamp(28px, 4.5vw, 44px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--color-ink)",
        }}
      >
        {sample}
      </div>
    </div>
  );
}
