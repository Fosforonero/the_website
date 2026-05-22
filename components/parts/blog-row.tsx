import Link from "next/link";
import { Pill } from "./pill";
import type { BlogPostMeta } from "@/lib/blog";
import { getLocalePath, type Locale } from "@/lib/site";

type Props = { post: BlogPostMeta; idx: number; readLabel: string };

export function BlogRow({ post, idx, readLabel }: Props) {
  const dateStr = new Date(post.date).toLocaleDateString(post.locale === "it" ? "it-IT" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const href = getLocalePath(post.locale as Locale, `/blog/${post.slug}`);

  return (
    <Link
      href={href}
      className="fn-card-hover fn-grid-blogrow"
      style={{
        display: "grid",
        gap: 32,
        padding: "clamp(20px, 3vw, 28px) clamp(20px, 4vw, 32px)",
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(10,10,10,0.03)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-dim)",
            letterSpacing: "0.16em",
          }}
        >
          0{idx + 1}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-ink-2)",
            marginTop: 4,
            letterSpacing: "0.04em",
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-dim)",
            marginTop: 2,
          }}
        >
          {post.readingMinutes} min
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            {post.tag}
          </Pill>
        </div>
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(18px, 2.5vw, 24px)",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "0 0 6px",
            letterSpacing: "-0.018em",
            lineHeight: 1.2,
          }}
        >
          {post.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            color: "var(--color-ink-2)",
            opacity: 0.75,
            lineHeight: 1.55,
            margin: 0,
            maxWidth: 580,
          }}
        >
          {post.excerpt}
        </p>
      </div>
      <span
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
        {readLabel} <span style={{ color: "var(--color-accent)" }}>↗</span>
      </span>
    </Link>
  );
}
