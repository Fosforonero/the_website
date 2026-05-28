// Project card — single-column layout. No invented mock screenshots: we
// surface the project through copy (name, tagline, description, stack) and
// a CTA, with the brand colour expressed as an accent bar on the left rim.
//
// Mock SVG components (fitmesh-mock, splitvote-mock, chatbot-mock) are kept
// in the repo as legacy until we decide whether to replace them with real
// screenshots.

import { Pill } from "./pill";
import type { Project } from "@/lib/projects";
import type { Locale } from "@/lib/site";

type Props = { project: Project; idx: number; locale: Locale; openLabel: string };

export function ProjectCard({ project: p, idx, locale, openLabel }: Props) {
  const copy = p.copy[locale];
  const isExternal = p.url?.startsWith("http");

  return (
    <article
      className="fn-card-hover"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderLeft: `4px solid ${p.brand}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(10,10,10,0.04), 0 12px 32px rgba(10,10,10,0.06)",
      }}
    >
      <div
        className="fn-projectcard-header"
        style={{
          padding: "clamp(14px, 2.5vw, 18px) clamp(16px, 3vw, 22px)",
          borderBottom: "1px solid var(--color-rule)",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Pill>0{idx + 1}</Pill>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            ● {p.status}
          </Pill>
          <Pill>{p.year}</Pill>
        </div>
        {p.url ? (
          <a
            href={p.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="fn-link-underline"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-ink)",
              letterSpacing: "0.06em",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {p.handle} <span style={{ color: "var(--color-accent)" }}>{isExternal ? "↗" : "→"}</span>
          </a>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-dim)",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {p.handle}
          </span>
        )}
      </div>
      <div
        style={{
          padding: "clamp(24px, 4vw, 40px)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(28px, 4.5vw, 48px)",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "0 0 12px",
            letterSpacing: "-0.025em",
            lineHeight: 1.02,
          }}
        >
          {p.name}
        </h3>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(17px, 2.2vw, 21px)",
            color: "var(--color-accent)",
            fontWeight: 500,
            marginBottom: 20,
            maxWidth: 720,
            lineHeight: 1.35,
          }}
        >
          {copy.tagline}
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: "var(--color-ink-2)",
            opacity: 0.82,
            lineHeight: 1.65,
            margin: "0 0 24px",
            maxWidth: 720,
          }}
        >
          {copy.description}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.stack.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  padding: "4px 10px",
                  background: "var(--color-surface)",
                  color: "var(--color-ink-2)",
                  borderRadius: 4,
                  letterSpacing: "0.04em",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          {p.url ? (
            <a
              href={p.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "var(--color-ink)",
                color: "#fff",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {openLabel} <span style={{ color: "var(--color-accent)" }}>{isExternal ? "↗" : "→"}</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
