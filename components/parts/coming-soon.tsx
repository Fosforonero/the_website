// Coming-soon page used at / and /en while the full site is being finalised.
// Minimal, centred, fully responsive. Other routes (blog, privacy, cookies)
// remain accessible — this only replaces the home/landing.

import Link from "next/link";
import { P15Box } from "./p15-box";
import { Pill } from "./pill";
import { Footer } from "./footer";
import { getDictionary } from "@/lib/i18n";
import { getLocalePath, site, type Locale } from "@/lib/site";

type Props = { locale: Locale };

export function ComingSoon({ locale }: Props) {
  const t = getDictionary(locale);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* subtle dot grid background, matches main site identity */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.45,
          backgroundImage:
            "radial-gradient(var(--color-rule) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <main
        id="main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(48px, 10vw, 96px) clamp(20px, 5vw, 64px)",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {/* Eyebrow status pill (phosphor green) */}
        <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
          {t.comingSoon.eyebrow}
        </Pill>

        {/* Glyph */}
        <div style={{ marginTop: "clamp(28px, 5vw, 40px)" }}>
          <P15Box size={88} glow />
        </div>

        {/* Wordmark */}
        <div
          style={{
            marginTop: "clamp(20px, 3vw, 28px)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(11px, 1.4vw, 13px)",
            letterSpacing: "0.32em",
            color: "var(--color-dim)",
            textTransform: "uppercase",
          }}
        >
          {site.name}
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(48px, 11vw, 128px)",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "clamp(20px, 3vw, 28px) 0 0",
            letterSpacing: "-0.045em",
            lineHeight: 0.95,
            maxWidth: 920,
          }}
        >
          {t.comingSoon.title}
        </h1>

        {/* Subline */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(17px, 2.2vw, 22px)",
            color: "var(--color-ink-2)",
            opacity: 0.78,
            maxWidth: 560,
            lineHeight: 1.5,
            marginTop: "clamp(24px, 4vw, 36px)",
          }}
        >
          {t.comingSoon.body}
        </p>

        {/* Email CTA */}
        <a
          href={`mailto:${site.email}`}
          style={{
            marginTop: "clamp(32px, 5vw, 48px)",
            display: "inline-flex",
            gap: 14,
            alignItems: "center",
            padding: "clamp(14px, 2.5vw, 18px) clamp(18px, 3vw, 24px)",
            background: "var(--color-card)",
            border: "1.5px solid var(--color-ink)",
            borderRadius: 14,
            maxWidth: "min(560px, 100%)",
            textDecoration: "none",
            boxShadow: "0 2px 0 var(--color-ink), 0 12px 32px rgba(10,10,10,0.08)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Pill>{t.comingSoon.emailLabel}</Pill>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(16px, 2.2vw, 20px)",
              color: "var(--color-ink)",
              fontWeight: 500,
              wordBreak: "break-all",
            }}
          >
            {site.email}
          </span>
          <span style={{ color: "var(--color-accent)", fontSize: 20, fontWeight: 600 }}>↗</span>
        </a>

        {/* Socials (no GitHub) */}
        <div
          style={{
            marginTop: "clamp(28px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.32em",
              color: "var(--color-dim)",
              textTransform: "uppercase",
            }}
          >
            {t.comingSoon.socials}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {(
              [
                ["LinkedIn", site.socials.linkedin],
                ["Hugging Face", site.socials.huggingface],
                ["Instagram", site.socials.instagram],
              ] as const
            ).map(([k, href]) => (
              <a
                key={k}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="fn-link-underline"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "var(--color-ink)",
                  padding: "8px 14px",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 999,
                  background: "var(--color-card)",
                  textDecoration: "none",
                }}
              >
                {k} <span style={{ color: "var(--color-accent)" }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* Discreet blog link — the rest of the site keeps working */}
        <div style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
          <Link
            href={getLocalePath(locale, "/blog")}
            className="fn-link-underline"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "var(--color-dim)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            {t.comingSoon.blogLink} →
          </Link>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
