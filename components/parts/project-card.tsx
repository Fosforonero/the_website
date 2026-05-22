import { Pill } from "./pill";
import { FitMeshMock } from "./fitmesh-mock";
import { SplitVoteMock } from "./splitvote-mock";
import type { Project } from "@/lib/projects";
import type { Locale } from "@/lib/site";

type Props = { project: Project; idx: number; locale: Locale; openLabel: string };

export function ProjectCard({ project: p, idx, locale, openLabel }: Props) {
  const Mock = p.id === "fitmesh" ? FitMeshMock : SplitVoteMock;
  const copy = p.copy[locale];

  return (
    <article
      className="fn-card-hover"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(10,10,10,0.04), 0 12px 32px rgba(10,10,10,0.06)",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--color-rule)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Pill>0{idx + 1}</Pill>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            ● {p.status}
          </Pill>
          <Pill>{p.year}</Pill>
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
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
          {p.handle} <span style={{ color: "var(--color-accent)" }}>↗</span>
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr",
          gap: 36,
          padding: 36,
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 48,
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: "0 0 10px",
              letterSpacing: "-0.025em",
              lineHeight: 1.02,
            }}
          >
            {p.name}
          </h3>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              color: "var(--color-accent)",
              fontWeight: 500,
              marginBottom: 18,
            }}
          >
            {copy.tagline}
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "var(--color-ink-2)",
              opacity: 0.78,
              lineHeight: 1.65,
              margin: "0 0 22px",
              maxWidth: 380,
            }}
          >
            {copy.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
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
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
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
            {openLabel} <span style={{ color: "var(--color-accent)" }}>↗</span>
          </a>
        </div>
        <div>
          <Mock accent={p.brand} />
        </div>
      </div>
    </article>
  );
}
