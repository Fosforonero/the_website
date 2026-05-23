// PostNav — sezione di chiusura del blog post.
// Mostra navigazione prev/next (per crawler + lettori) e fino a 3 articoli
// correlati. Ottimizzato per internal linking: ogni card è un <Link> di Next
// con anchor text descrittivo (titolo del post + tag), nessun "leggi tutto"
// generico — buona pratica SEO e di accessibilità.

import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";
import { getLocalePath, type Locale } from "@/lib/site";

type Props = {
  locale: Locale;
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
  related: BlogPostMeta[];
  labels: {
    prev: string;
    next: string;
    related: string;
    minRead: (n: number) => string;
  };
};

export function PostNav({ locale, prev, next, related, labels }: Props) {
  const hasAdjacent = prev !== null || next !== null;
  const hasRelated = related.length > 0;
  if (!hasAdjacent && !hasRelated) return null;

  return (
    <nav
      aria-label={labels.related}
      style={{
        marginTop: "clamp(48px, 8vw, 80px)",
        paddingTop: "clamp(32px, 5vw, 48px)",
        borderTop: "1px solid var(--color-rule)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(32px, 5vw, 48px)",
      }}
    >
      {/* prev/next adjacent posts — chronological */}
      {hasAdjacent ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
          className="fn-grid-postnav"
        >
          {prev ? (
            <AdjacentCard
              post={prev}
              locale={locale}
              direction="prev"
              label={labels.prev}
            />
          ) : (
            <div />
          )}
          {next ? (
            <AdjacentCard
              post={next}
              locale={locale}
              direction="next"
              label={labels.next}
            />
          ) : (
            <div />
          )}
        </div>
      ) : null}

      {/* related posts — same tag first, then chronological */}
      {hasRelated ? (
        <section>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.32em",
              color: "var(--color-dim)",
              textTransform: "uppercase",
              margin: "0 0 18px",
              fontWeight: 600,
            }}
          >
            {labels.related}
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {related.map((post) => (
              <li key={post.slug}>
                <RelatedRow post={post} locale={locale} minRead={labels.minRead} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────

function postHref(locale: Locale, slug: string) {
  return getLocalePath(locale, `/blog/${slug}`);
}

function AdjacentCard({
  post,
  locale,
  direction,
  label,
}: {
  post: BlogPostMeta;
  locale: Locale;
  direction: "prev" | "next";
  label: string;
}) {
  const arrow = direction === "prev" ? "←" : "→";
  const align = direction === "prev" ? "flex-start" : "flex-end";
  const textAlign = direction === "prev" ? "left" : "right";

  return (
    <Link
      href={postHref(locale, post.slug)}
      className="fn-card-hover"
      rel={direction === "prev" ? "prev" : "next"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        gap: 6,
        padding: "16px 18px",
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 10,
        textDecoration: "none",
        boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
        textAlign,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-dim)",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
        }}
      >
        {direction === "prev" ? `${arrow} ${label}` : `${label} ${arrow}`}
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--color-ink)",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
        }}
      >
        {post.title}
      </span>
    </Link>
  );
}

function RelatedRow({
  post,
  locale,
  minRead,
}: {
  post: BlogPostMeta;
  locale: Locale;
  minRead: (n: number) => string;
}) {
  return (
    <Link
      href={postHref(locale, post.slug)}
      className="fn-card-hover"
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "14px 18px",
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 10,
        textDecoration: "none",
        boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-accent)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 600,
          flex: "0 0 auto",
        }}
      >
        {post.tag}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 220,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 500,
          color: "var(--color-ink)",
          letterSpacing: "-0.01em",
          lineHeight: 1.35,
        }}
      >
        {post.title}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-dim)",
          letterSpacing: "0.08em",
        }}
      >
        {minRead(post.readingMinutes)} ↗
      </span>
    </Link>
  );
}
