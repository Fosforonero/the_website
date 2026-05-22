// Landing page composition. Server Component.
// Composes Hero / Metrics / Ticker / About / Projects / Blog / Contact / Footer.
//
// All "reveal on scroll" client logic lives in <Reveal>; everything else is
// statically rendered. The rotating word and tech ticker are CSS-only.

import { Reveal } from "@/components/client/reveal";
import { P15Box } from "@/components/parts/p15-box";
import { Pill } from "@/components/parts/pill";
import { RotatingWord } from "@/components/parts/rotating-word";
import { TechTicker } from "@/components/parts/tech-ticker";
import { Cursor } from "@/components/parts/cursor";
import { Nav } from "@/components/parts/nav";
import { ProjectCard } from "@/components/parts/project-card";
import { BlogRow } from "@/components/parts/blog-row";
import { projects } from "@/lib/projects";
import { getDictionary } from "@/lib/i18n";
import { site, type Locale } from "@/lib/site";
import type { BlogPostMeta } from "@/lib/blog";

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
        <section id="top" style={{ padding: "80px 64px 120px", position: "relative" }}>
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
                fontSize: 128,
                fontWeight: 600,
                lineHeight: 0.95,
                color: "var(--color-ink)",
                margin: "32px 0 0",
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
                fontSize: 22,
                color: "var(--color-ink-2)",
                opacity: 0.75,
                maxWidth: 640,
                lineHeight: 1.5,
                marginTop: 36,
              }}
            >
              {t.hero.paragraph(site.author.name, site.name)}
            </p>
          </Reveal>

          <Reveal delay={340}>
            <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
              <a
                href="#progetti"
                style={{
                  padding: "14px 22px",
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
                  padding: "14px 22px",
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
              style={{
                marginTop: 80,
                padding: "28px 32px",
                background: "#fff",
                border: "1px solid var(--color-rule)",
                borderRadius: 14,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 32,
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
                      fontSize: 36,
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
          style={{ padding: "120px 64px", background: "var(--color-surface)", position: "relative" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: 80,
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
                  fontSize: 64,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  margin: "24px 0 0",
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
                  <span style={{ color: "var(--color-dim)" }}>// sede</span>
                </div>
                <div>{site.author.city}, Italia</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--color-dim)" }}>// stack</span>
                </div>
                <div>Flutter · Next.js · Supabase · TypeScript</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: "var(--color-dim)" }}>// dal</span>
                </div>
                <div>
                  <span style={{ color: "var(--color-accent)" }}>{site.author.since}</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: "var(--color-ink-2)",
                  paddingTop: 32,
                }}
              >
                {t.about.paragraphs.map((p, i) => (
                  <p key={i} style={{ margin: "0 0 24px" }}>
                    {p.includes(site.name) ? (
                      <>
                        {p.split(site.name).map((chunk, j, arr) => (
                          <span key={j}>
                            {chunk}
                            {j < arr.length - 1 ? (
                              <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>
                                {site.name}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </>
                    ) : (
                      p
                    )}
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
        <section id="progetti" style={{ padding: "120px 64px", position: "relative" }}>
          <Reveal>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 48,
              }}
            >
              <div>
                <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                  {t.projects.eyebrow}
                </Pill>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 72,
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
                  textAlign: "right",
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
            <Reveal delay={180}>
              <div
                style={{
                  background: "#fff",
                  border: "1px dashed var(--color-rule)",
                  borderRadius: 14,
                  padding: "32px 36px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <Pill>{t.projects.pendingLabel}</Pill>
                  <div style={{ fontSize: 24, color: "var(--color-dim)", fontWeight: 500 }}>
                    {t.projects.pendingText}
                    <Cursor height={20} />
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--color-dim)",
                    fontWeight: 600,
                    letterSpacing: "0.24em",
                  }}
                >
                  {t.projects.pendingCta}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────── BLOG ───────── */}
        {posts.length > 0 ? (
          <section
            id="blog"
            style={{
              padding: "120px 64px",
              background: "var(--color-surface)",
              position: "relative",
            }}
          >
            <Reveal>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 48,
                  maxWidth: 1280,
                  margin: "0 auto 48px",
                }}
              >
                <div>
                  <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                    {t.blog.eyebrow}
                  </Pill>
                  <h2
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 72,
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
                      fontSize: 18,
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 1280,
                margin: "0 auto",
              }}
            >
              {posts.slice(0, 4).map((post, i) => (
                <Reveal key={post.slug} delay={i * 80}>
                  <BlogRow post={post} idx={i} readLabel={t.blog.read} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {/* ───────── CONTACT ───────── */}
        <section id="contatti" style={{ padding: "120px 64px", position: "relative" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <Reveal>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                {t.contact.eyebrow}
              </Pill>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 112,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  margin: "24px 0 0",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.95,
                }}
              >
                {t.contact.headline}
              </h2>
              <p
                style={{
                  fontSize: 22,
                  color: "var(--color-ink-2)",
                  opacity: 0.75,
                  maxWidth: 620,
                  marginTop: 24,
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
                  marginTop: 48,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: "18px 22px",
                  background: "#fff",
                  border: "1.5px solid var(--color-ink)",
                  borderRadius: 14,
                  maxWidth: 580,
                  textDecoration: "none",
                  boxShadow: "0 2px 0 var(--color-ink), 0 12px 32px rgba(10,10,10,0.08)",
                }}
              >
                <Pill>{t.contact.emailLabel}</Pill>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 22,
                    color: "var(--color-ink)",
                    fontWeight: 500,
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
                {[
                  ["GitHub", "github.com/fosforonero", site.socials.github],
                  ["LinkedIn", "in/matteopizzi", site.socials.linkedin],
                  ["Hugging Face", "huggingface.co/fosforonero", site.socials.huggingface],
                ].map(([k, v, href]) => (
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
        style={{
          padding: "48px 64px",
          borderTop: "1px solid var(--color-rule)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
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
