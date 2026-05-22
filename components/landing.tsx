// Landing page composition. Server Component.
// Composes Hero / Metrics / Ticker / About / Projects / Blog / Contact / Footer.
//
// All "reveal on scroll" client logic lives in <Reveal>; everything else is
// statically rendered. The rotating word and tech ticker are CSS-only.
//
// Inline styles use clamp() for fluid scaling between mobile and desktop;
// responsive layout shifts (grid recolumning, flex-stacking, show/hide) live
// in app/globals.css as .fn-* helper classes applied via className.

import { Reveal } from "@/components/client/reveal";
import { P15Box } from "@/components/parts/p15-box";
import { Pill } from "@/components/parts/pill";
import { RotatingWord } from "@/components/parts/rotating-word";
import { TechTicker } from "@/components/parts/tech-ticker";
import { Nav } from "@/components/parts/nav";
import { ProjectCard } from "@/components/parts/project-card";
import { BlogRow } from "@/components/parts/blog-row";
import type { ReactNode } from "react";
import { projects } from "@/lib/projects";
import { getDictionary } from "@/lib/i18n";
import { site, type Locale } from "@/lib/site";
import type { BlogPostMeta } from "@/lib/blog";

// Splits a paragraph on known tokens (brand name, teaching org) and replaces
// each occurrence with rich markup: brand → accent span, teaching → external
// link. Tokens that don't appear in the input are no-ops.
function renderAboutParagraph(text: string): ReactNode[] {
  type Token = { key: string; match: string; render: (s: string) => ReactNode };
  const tokens: Token[] = [
    {
      key: "brand",
      match: site.name,
      render: (s) => (
        <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{s}</span>
      ),
    },
    {
      key: "teaching",
      match: site.teaching.name,
      render: (s) => (
        <a
          href={site.teaching.url}
          target="_blank"
          rel="noopener noreferrer"
          className="fn-link-underline"
          style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 500 }}
        >
          {s}
        </a>
      ),
    },
  ];

  let parts: ReactNode[] = [text];
  for (const token of tokens) {
    const next: ReactNode[] = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        next.push(part);
        return;
      }
      const segments = part.split(token.match);
      segments.forEach((seg, i) => {
        if (seg) next.push(seg);
        if (i < segments.length - 1) {
          next.push(<span key={`${token.key}-${next.length}`}>{token.render(token.match)}</span>);
        }
      });
    });
    parts = next;
  }
  return parts;
}

const TECH = [
  "TypeScript",
  "Flutter",
  "Next.js",
  "Supabase",
  "React",
  "Dart",
  "PostgreSQL",
  "Tailwind",
  "Vercel",
  "Android",
  "Wear OS",
  "Edge runtime",
];

// Fluid spacing tokens shared across sections.
const SECTION_PAD_X = "clamp(20px, 5vw, 64px)";
const SECTION_PAD_Y = "clamp(64px, 12vw, 120px)";

type Props = { locale: Locale; posts: BlogPostMeta[] };

export function Landing({ locale, posts }: Props) {
  const t = getDictionary(locale);

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
      {/* subtle dot grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.5,
          backgroundImage:
            "radial-gradient(var(--color-rule) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Nav locale={locale} />

      <main id="main">
        {/* ───────── HERO ───────── */}
        <section
          id="top"
          style={{
            padding: `clamp(48px, 10vw, 80px) ${SECTION_PAD_X} ${SECTION_PAD_Y}`,
            position: "relative",
          }}
        >
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 14px 6px 8px",
                background: "#fff",
                border: "1px solid var(--color-rule)",
                borderRadius: 999,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-dim)",
                letterSpacing: "0.08em",
                boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  boxShadow: "0 0 0 4px var(--color-accent-soft)",
                }}
              />
              <span style={{ color: "var(--color-ink)" }}>{t.hero.eyebrow}</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(48px, 9vw, 128px)",
                fontWeight: 600,
                lineHeight: 0.95,
                color: "var(--color-ink)",
                margin: "clamp(20px, 3vw, 32px) 0 0",
                letterSpacing: "-0.045em",
                maxWidth: 1100,
              }}
            >
              {t.hero.title1}
              <br />
              <RotatingWord words={t.hero.titleRotating} color="var(--color-accent)" />
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(17px, 2.2vw, 22px)",
                color: "var(--color-ink-2)",
                opacity: 0.75,
                maxWidth: 640,
                lineHeight: 1.5,
                marginTop: "clamp(24px, 4vw, 36px)",
              }}
            >
              {t.hero.paragraph(site.author.name, site.name)}
            </p>
          </Reveal>

          <Reveal delay={340}>
            <div style={{ display: "flex", gap: 12, marginTop: "clamp(24px, 4vw, 36px)", flexWrap: "wrap" }}>
              <a
                href="#progetti"
                style={{
                  padding: "clamp(12px, 2vw, 14px) clamp(18px, 3vw, 22px)",
                  background: "var(--color-ink)",
                  color: "#fff",
                  borderRadius: 10,
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                }}
              >
                {t.hero.ctaProjects} <span style={{ color: "var(--color-accent)" }}>→</span>
              </a>
              <a
                href="#contatti"
                style={{
                  padding: "clamp(12px, 2vw, 14px) clamp(18px, 3vw, 22px)",
                  background: "#fff",
                  color: "var(--color-ink)",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 10,
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                {t.hero.ctaContact}
              </a>
            </div>
          </Reveal>

          {/* metric strip */}
          <Reveal delay={120}>
            <div
              className="fn-grid-metrics"
              style={{
                marginTop: "clamp(48px, 8vw, 80px)",
                padding: "clamp(20px, 3vw, 28px) clamp(20px, 4vw, 32px)",
                background: "#fff",
                border: "1px solid var(--color-rule)",
                borderRadius: 14,
                display: "grid",
                gap: "clamp(18px, 3vw, 32px)",
                boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
              }}
            >
              {[
                [t.metrics.projects, "02", t.metrics.projectsSub],
                [t.metrics.since, "2017", t.metrics.sinceSub],
                [t.metrics.base, "Roma", t.metrics.baseSub],
                [t.metrics.stack, "Flutter · TS", t.metrics.stackSub],
              ].map(([k, v, sub]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--color-dim)",
                      letterSpacing: "0.24em",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(28px, 4vw, 36px)",
                      color: "var(--color-ink)",
                      fontWeight: 600,
                      marginTop: 8,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--color-dim)",
                      marginTop: 2,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ───────── TECH TICKER ───────── */}
        <Reveal>
          <div
            style={{
              padding: "24px 0",
              borderTop: "1px solid var(--color-rule)",
              borderBottom: "1px solid var(--color-rule)",
              background: "#fff",
            }}
          >
            <TechTicker
              items={TECH}
              speedSec={50}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            />
          </div>
        </Reveal>

        {/* ───────── ABOUT ───────── */}
        <section
          id="about"
          style={{
            padding: `${SECTION_PAD_Y} ${SECTION_PAD_X}`,
            background: "var(--color-surface)",
            position: "relative",
          }}
        >
          <div
            className="fn-grid-about"
            style={{
              display: "grid",
              gap: "clamp(40px, 6vw, 80px)",
              maxWidth: 1280,
              margin: "0 auto",
            }}
          >
            <Reveal>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                {t.about.eyebrow}
              </Pill>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(36px, 5.5vw, 64px)",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  margin: "clamp(16px, 3vw, 24px) 0 0",
                  letterSpacing: "-0.035em",
                  lineHeight: 1,
                }}
              >
                {t.about.headline1}
                <br />
                {t.about.headline2}
              </h2>
              <div
                style={{
                  marginTop: 28,
                  padding: 18,
                  background: "#fff",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--color-ink-2)",
                  lineHeight: 2,
                  letterSpacing: "0.04em",
                }}
              >
                <div>
                  <span style={{ color: "var(--color-dim)" }}>{t.about.meta.basedLabel}</span>
                </div>
                <div>{t.about.meta.basedValue}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--color-dim)" }}>{t.about.meta.stackLabel}</span>
                </div>
                <div>{t.about.meta.stackValue}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--color-dim)" }}>{t.about.meta.sinceLabel}</span>
                </div>
                <div>
                  <span style={{ color: "var(--color-accent)" }}>{site.author.since}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--color-dim)" }}>{t.about.meta.teachesLabel}</span>
                </div>
                <div>
                  <a
                    href={site.teaching.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fn-link-underline"
                    style={{ color: "var(--color-ink-2)", textDecoration: "none" }}
                  >
                    {site.teaching.name} <span style={{ color: "var(--color-accent)" }}>↗</span>
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(17px, 2vw, 21px)",
                  lineHeight: 1.55,
                  color: "var(--color-ink-2)",
                  paddingTop: "clamp(0px, 3vw, 32px)",
                }}
              >
                {t.about.paragraphs.map((p, i) => (
                  <p key={i} style={{ margin: "0 0 24px" }}>
                    {renderAboutParagraph(p)}
                  </p>
                ))}
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    color: "var(--color-dim)",
                    paddingTop: 24,
                    borderTop: "1px solid var(--color-rule)",
                  }}
                >
                  {t.about.closingNote}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── PROJECTS ───────── */}
        <section
          id="progetti"
          style={{ padding: `${SECTION_PAD_Y} ${SECTION_PAD_X}`, position: "relative" }}
        >
          <Reveal>
            <div className="fn-row-stack" style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
              <div>
                <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                  {t.projects.eyebrow}
                </Pill>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(40px, 7vw, 72px)",
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    margin: "14px 0 0",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {t.projects.headline}
                </h2>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--color-dim)",
                  letterSpacing: "0.16em",
                  lineHeight: 1.8,
                }}
              >
                {t.projects.statusLine}
              </div>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProjectCard
                  project={p}
                  idx={i}
                  locale={locale}
                  openLabel={t.projects.openProject}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────── BLOG ───────── */}
        {posts.length > 0 ? (
          <section
            id="blog"
            style={{
              padding: `${SECTION_PAD_Y} ${SECTION_PAD_X}`,
              background: "var(--color-surface)",
              position: "relative",
            }}
          >
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <Reveal>
                <div className="fn-row-stack" style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
                  <div>
                    <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                      {t.blog.eyebrow}
                    </Pill>
                    <h2
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "clamp(40px, 7vw, 72px)",
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        margin: "14px 0 12px",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {t.blog.headline}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "clamp(16px, 2vw, 18px)",
                        color: "var(--color-ink-2)",
                        opacity: 0.75,
                        margin: 0,
                        maxWidth: 520,
                        lineHeight: 1.5,
                      }}
                    >
                      {t.blog.paragraph}
                    </p>
                  </div>
                  <a
                    href={locale === "it" ? "/blog" : "/en/blog"}
                    className="fn-link-underline"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--color-ink)",
                      letterSpacing: "0.16em",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {t.blog.allPostsCta} <span style={{ color: "var(--color-accent)" }}>→</span>
                  </a>
                </div>
              </Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {posts.slice(0, 4).map((post, i) => (
                  <Reveal key={post.slug} delay={i * 80}>
                    <BlogRow post={post} idx={i} readLabel={t.blog.read} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ───────── CONTACT ───────── */}
        <section
          id="contatti"
          style={{ padding: `${SECTION_PAD_Y} ${SECTION_PAD_X}`, position: "relative" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                {t.contact.eyebrow}
              </Pill>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(48px, 10vw, 112px)",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  margin: "clamp(16px, 3vw, 24px) 0 0",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.95,
                }}
              >
                {t.contact.headline}
              </h2>
              <p
                style={{
                  fontSize: "clamp(17px, 2.2vw, 22px)",
                  color: "var(--color-ink-2)",
                  opacity: 0.75,
                  maxWidth: 620,
                  marginTop: "clamp(16px, 3vw, 24px)",
                  lineHeight: 1.45,
                }}
              >
                {t.contact.paragraph}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <a
                href={`mailto:${site.email}`}
                style={{
                  marginTop: "clamp(28px, 5vw, 48px)",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: "clamp(14px, 2.5vw, 18px) clamp(16px, 3vw, 22px)",
                  background: "#fff",
                  border: "1.5px solid var(--color-ink)",
                  borderRadius: 14,
                  maxWidth: 580,
                  textDecoration: "none",
                  boxShadow: "0 2px 0 var(--color-ink), 0 12px 32px rgba(10,10,10,0.08)",
                  flexWrap: "wrap",
                }}
              >
                <Pill>{t.contact.emailLabel}</Pill>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(17px, 2.2vw, 22px)",
                    color: "var(--color-ink)",
                    fontWeight: 500,
                    wordBreak: "break-all",
                  }}
                >
                  {site.email}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ color: "var(--color-accent)", fontSize: 22, fontWeight: 600 }}>↗</span>
              </a>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: "flex", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
                {(
                  [
                    ["GitHub", "github.com/fosforonero", site.socials.github],
                    ["LinkedIn", "in/matteo-pizzi", site.socials.linkedin],
                    ["Hugging Face", "huggingface.co/Fosforonero", site.socials.huggingface],
                    ["Instagram", "instagram.com/fosforonero", site.socials.instagram],
                  ] as const
                ).map(([k, v, href]) => (
                  <a
                    key={k}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fn-card-hover"
                    style={{
                      padding: "14px 20px",
                      background: "#fff",
                      border: "1px solid var(--color-rule)",
                      borderRadius: 10,
                      textDecoration: "none",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-dim)",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {k.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        color: "var(--color-ink)",
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </span>
                    <span style={{ color: "var(--color-accent)" }}>↗</span>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer
        className="fn-footer-row"
        style={{
          padding: `clamp(32px, 5vw, 48px) ${SECTION_PAD_X}`,
          borderTop: "1px solid var(--color-rule)",
        }}
      >
        <div>
          <P15Box size={28} />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-dim)",
              marginTop: 14,
              letterSpacing: "0.12em",
            }}
          >
            {t.footer.line1}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-dim)",
            textAlign: "right",
            letterSpacing: "0.12em",
            lineHeight: 1.8,
          }}
        >
          {t.footer.line2}
          <br />
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{t.footer.status}</span>
        </div>
      </footer>
    </div>
  );
}
