"use client";

// Instagram gallery — 2026 elegant refresh.
// Design choices after first review:
// - NO asymmetric bento (1x1/2x1/1x2/2x2) — it looked chaotic with mixed
//   sizes + placeholders. Uniform grid is more editorial.
// - NO multi-colour halos — the rainbow effect competed with the brand
//   palette. Hover now uses a single subtle phosphor border-bottom + lift.
// - NO 3D tilt — gimmick, breaks the calm aesthetic.
// - YES one optional "featured" hero tile at the top, full width.
// - YES scroll-stagger reveal (fade + rise) for cinematic entrance.
// - YES placeholder tiles with a barely-there neutral gradient (no colour).

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { InstaPost } from "@/lib/instagram";
import { Reveal } from "@/components/client/reveal";

type TypeLabels = Record<"image" | "video" | "carousel", string>;

type T = {
  openOriginal: string;
  close: string;
  typeLabels: TypeLabels;
  empty: string;
};

type Variant = "base" | "dynamic";
type Props = { posts: InstaPost[]; t: T; locale?: "it" | "en"; variant?: Variant };

export function InstagramGallery({ posts, t, locale = "it", variant = "base" }: Props) {
  const [active, setActive] = useState<InstaPost | null>(null);
  const dateLocale = locale === "en" ? "en-US" : "it-IT";

  if (posts.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--color-dim)",
          letterSpacing: "0.08em",
          padding: "48px 0",
          textAlign: "center",
        }}
      >
        {t.empty}
      </p>
    );
  }

  // Dynamic variant: justified rows preserving each photo's exact aspect ratio,
  // with a dock-style hover that grows the hovered tile and shrinks its row-mates.
  if (variant === "dynamic") {
    return (
      <>
        <DynamicWall posts={posts} t={t} dateLocale={dateLocale} onOpen={setActive} />
        {active ? (
          <Lightbox post={active} onClose={() => setActive(null)} t={t} dateLocale={dateLocale} />
        ) : null}
      </>
    );
  }

  // The first post becomes the featured hero. The rest fall into a uniform
  // grid. If no posts are flagged, the very first becomes hero implicitly.
  const [hero, ...rest] = posts;

  return (
    <>
      {hero ? (
        <Reveal>
          <HeroTile post={hero} onOpen={() => setActive(hero)} t={t} dateLocale={dateLocale} />
        </Reveal>
      ) : null}

      {rest.length > 0 ? (
        <div
          className="fn-ig-grid"
          style={{
            display: "grid",
            gap: "clamp(14px, 1.8vw, 20px)",
            marginTop: "clamp(20px, 3vw, 32px)",
          }}
        >
          {rest.map((post, i) => (
            <Reveal key={post.id} delay={i * 60}>
              <Tile post={post} onOpen={() => setActive(post)} t={t} dateLocale={dateLocale} />
            </Reveal>
          ))}
        </div>
      ) : null}

      {active ? <Lightbox post={active} onClose={() => setActive(null)} t={t} dateLocale={dateLocale} /> : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Dynamic wall — justified rows (Flickr/Google Photos style).
// Each row is a flex container at a computed height; tiles flex-grow ∝ aspect
// so their widths reproduce the real photo shapes and fill the row edge to
// edge. Hovering a tile boosts its flex-grow → it widens and its row-mates
// shrink (dock magnification), with no row re-wrapping since each row is its
// own flex line.
// ─────────────────────────────────────────────────────────────

type Row = { items: InstaPost[]; height: number; last: boolean };

// Greedy justified row-breaking: accumulate tiles until their natural width at
// the target height fills the container, then lock that row's exact height.
function computeRows(posts: InstaPost[], containerW: number, targetH: number, gap: number): Row[] {
  const rows: Row[] = [];
  let row: InstaPost[] = [];
  let arSum = 0;
  for (const p of posts) {
    const ar = p.aspect && p.aspect > 0 ? p.aspect : 1;
    row.push(p);
    arSum += ar;
    const naturalW = arSum * targetH + gap * (row.length - 1);
    if (naturalW >= containerW) {
      const h = (containerW - gap * (row.length - 1)) / arSum;
      rows.push({ items: row, height: h, last: false });
      row = [];
      arSum = 0;
    }
  }
  if (row.length) {
    // Trailing row. With ≥2 photos, justify it to full width like the others
    // (a sparse half-row reads as broken). A lone trailing photo keeps its
    // natural size at the target height rather than ballooning full-width.
    if (row.length >= 2) {
      const h = (containerW - gap * (row.length - 1)) / arSum;
      rows.push({ items: row, height: h, last: false });
    } else {
      rows.push({ items: row, height: targetH, last: true });
    }
  }
  return rows;
}

function DynamicWall({
  posts,
  t,
  dateLocale,
  onOpen,
}: {
  posts: InstaPost[];
  t: T;
  dateLocale: string;
  onOpen: (p: InstaPost) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // 0 until measured. Server and first client render both see 0 → identical
  // fallback markup → no hydration mismatch; rows appear after mount.
  const [width, setWidth] = useState(0);

  // Tile size = target row height. Bigger → larger previews, fewer per row.
  // In a justified layout this is the real lever (the per-row count follows).
  // Persisted so the choice sticks; this is the future plugin "size" setting.
  const [size, setSize] = useState<"s" | "m" | "l">("m");
  useEffect(() => {
    const saved = window.localStorage.getItem("fn-ig-size");
    if (saved === "s" || saved === "m" || saved === "l") setSize(saved);
  }, []);
  const changeSize = (s: "s" | "m" | "l") => {
    setSize(s);
    try {
      window.localStorage.setItem("fn-ig-size", s);
    } catch {
      /* private mode — non-fatal */
    }
  };

  // Infinite scroll: render an initial batch, then reveal older photos as the
  // sentinel scrolls into view. The first INITIAL items are in the SSR fallback
  // markup so the most recent posts are crawlable (SEO); older ones load
  // progressively, the standard indexable-initial pattern.
  const INITIAL = 18;
  const BATCH = 12;
  const [visible, setVisible] = useState(INITIAL);
  const hasMore = visible < posts.length;
  const shown = posts.slice(0, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => Math.min(v + BATCH, posts.length));
      },
      { rootMargin: "600px 0px" }, // prefetch before the user reaches the bottom
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, posts.length]);

  const gap = 12;
  // Base desktop row height per size; scaled down on narrower screens.
  const baseH = size === "s" ? 210 : size === "l" ? 400 : 300;
  const factor = width === 0 ? 1 : width < 640 ? 0.58 : width < 1024 ? 0.8 : 1;
  const targetH = Math.round(baseH * factor);
  const rows = width > 0 ? computeRows(shown, width, targetH, gap) : [];

  return (
    <div ref={ref} style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
      <div className="fn-ig-sizectl" role="group" aria-label="Dimensione foto">
        {(["s", "m", "l"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeSize(s)}
            aria-pressed={size === s}
            aria-label={s === "s" ? "Foto piccole" : s === "m" ? "Foto medie" : "Foto grandi"}
            className={size === s ? "is-active" : undefined}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>
      {width === 0 ? (
        // SSR / first-paint fallback: a CSS flex-wrap justified row so the
        // images are in the HTML (SEO) before measurement kicks in.
        <div style={{ display: "flex", flexWrap: "wrap", gap }}>
          {shown.map((p) => (
            <div
              key={p.id}
              style={{
                height: targetH,
                flexGrow: p.aspect ?? 1,
                flexBasis: (p.aspect ?? 1) * targetH,
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <TileVisual post={p} t={t} />
            </div>
          ))}
        </div>
      ) : (
        rows.map((row, ri) => (
          <Reveal key={ri} delay={ri * 70}>
            <div style={{ display: "flex", gap, height: row.height, marginBottom: gap }}>
              {row.items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onOpen(p)}
                  aria-label={`Apri post: ${clip(p.caption, 60)}`}
                  className={`fn-ig-jtile${row.last ? " fn-ig-jtile--last" : ""}`}
                  style={
                    {
                      ["--ar"]: p.aspect ?? 1,
                      ...(row.last ? { flexBasis: (p.aspect ?? 1) * row.height } : null),
                      height: "100%",
                    } as CSSProperties
                  }
                >
                  <TileVisual post={p} t={t} />
                  <DynamicCaption post={p} dateLocale={dateLocale} />
                </button>
              ))}
            </div>
          </Reveal>
        ))
      )}
      {hasMore ? <div ref={sentinelRef} aria-hidden style={{ height: 1 }} /> : null}
    </div>
  );
}

// Caption strip for a justified tile — hidden until hover/focus, slides up.
function DynamicCaption({ post, dateLocale }: { post: InstaPost; dateLocale: string }) {
  if (!post.image) return null;
  return (
    <div className="fn-ig-jcap" aria-hidden>
      <span className="fn-ig-jcap__date">{formatDate(post.date, dateLocale)}</span>
      {post.caption ? <span className="fn-ig-jcap__text">{clip(post.caption, 70)}</span> : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Featured hero tile — full width, 21:9 aspect, larger caption.
// ─────────────────────────────────────────────────────────────

function HeroTile({ post, onOpen, t, dateLocale }: { post: InstaPost; onOpen: () => void; t: T; dateLocale: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Apri post: ${clip(post.caption, 60)}`}
      className="fn-ig-tile"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "21 / 9",
        minHeight: 220,
        padding: 0,
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--color-card)",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform .35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .35s ease",
      }}
    >
      <TileVisual post={post} t={t} />
      <TileCaption post={post} hero dateLocale={dateLocale} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Regular tile — uniform 1:1.
// ─────────────────────────────────────────────────────────────

function Tile({ post, onOpen, t, dateLocale }: { post: InstaPost; onOpen: () => void; t: T; dateLocale: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Apri post: ${clip(post.caption, 60)}`}
      className="fn-ig-tile"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        padding: 0,
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--color-card)",
        cursor: "pointer",
        textAlign: "left",
        transition: "transform .35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .35s ease",
      }}
    >
      <TileVisual post={post} t={t} />
      <TileCaption post={post} dateLocale={dateLocale} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-pieces: visual layer + caption overlay
// ─────────────────────────────────────────────────────────────

function TileVisual({ post, t }: { post: InstaPost; t: T }) {
  return (
    <>
      {post.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image}
          alt={clip(post.caption, 80)}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, var(--color-surface) 0%, var(--color-card) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-rule)",
          }}
        >
          <InstaIcon size={28} />
        </div>
      )}

      {/* Type chip — only for video/carousel */}
      {post.type && post.type !== "image" ? (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            padding: "4px 8px",
            background: "rgba(10,10,10,0.6)",
            color: "#fff",
            borderRadius: 4,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {t.typeLabels[post.type]}
        </span>
      ) : null}
    </>
  );
}

function TileCaption({ post, hero, dateLocale }: { post: InstaPost; hero?: boolean; dateLocale: string }) {
  const hasImage = !!post.image;

  return (
    <>
      {/* Gradient veil only when there's a real image, otherwise the
          placeholder is already pale and the caption reads against it. */}
      {hasImage ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: hero ? "55%" : "65%",
            background: "linear-gradient(to top, rgba(10,10,10,0.85), transparent)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: hero ? "clamp(20px, 3vw, 32px)" : 14,
          right: hero ? "clamp(20px, 3vw, 32px)" : 14,
          bottom: hero ? "clamp(20px, 3vw, 32px)" : 14,
          color: hasImage ? "#fff" : "var(--color-ink)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: hero ? "clamp(15px, 2vw, 19px)" : "clamp(12px, 1.3vw, 14px)",
            lineHeight: 1.4,
            fontWeight: 500,
            display: "-webkit-box",
            WebkitLineClamp: hero ? 3 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            letterSpacing: hero ? "-0.015em" : 0,
          }}
        >
          {post.caption}
        </div>
        <div
          style={{
            marginTop: hero ? 10 : 6,
            fontFamily: "var(--font-mono)",
            fontSize: hero ? 11 : 10,
            letterSpacing: "0.16em",
            opacity: hasImage ? 0.85 : 0.6,
            textTransform: "uppercase",
          }}
        >
          {formatDate(post.date, dateLocale)}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Lightbox modal (unchanged from previous version)
// ─────────────────────────────────────────────────────────────

function Lightbox({
  post,
  onClose,
  t,
  dateLocale,
}: {
  post: InstaPost;
  onClose: () => void;
  t: T;
  dateLocale: string;
}) {
  const titleId = useId();

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("fn-no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("fn-no-scroll");
    };
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 32px)",
      }}
    >
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,10,10,0.75)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: 0,
          padding: 0,
          cursor: "pointer",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: "min(860px, 100%)",
          maxHeight: "92vh",
          width: "100%",
          background: "var(--color-card)",
          border: "1px solid var(--color-rule)",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(10,10,10,0.4)",
          animation: "fnBannerIn .28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4 / 3",
            background: post.image
              ? "var(--color-bg)"
              : "linear-gradient(135deg, var(--color-surface), var(--color-card))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image}
              alt={clip(post.caption, 80)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ color: "var(--color-rule)" }}>
              <InstaIcon size={56} />
            </div>
          )}

          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              background: "rgba(255,255,255,0.92)",
              color: "var(--color-ink)",
              border: 0,
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(10,10,10,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: "clamp(20px, 3vw, 28px)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowY: "auto",
          }}
        >
          <div
            id={titleId}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-dim)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              display: "flex",
              gap: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span>{formatDate(post.date, dateLocale)}</span>
            {post.type ? <span>· {t.typeLabels[post.type]}</span> : null}
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(15px, 2vw, 17px)",
              lineHeight: 1.55,
              color: "var(--color-ink-2)",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {post.caption}
          </p>
          {post.permalink ? (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "var(--color-ink)",
                color: "#fff",
                borderRadius: 8,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {t.openOriginal} <span style={{ color: "var(--color-accent)" }}>↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// Code-point-safe truncation: Array.from splits by Unicode code points, so we
// never cut an emoji's surrogate pair in half. A lone surrogate serializes
// differently on server vs client and breaks hydration (real captions contain
// emoji like 🌴). Trailing newlines/spaces are trimmed for clean alt text.
function clip(s: string, n: number): string {
  const cp = Array.from(s);
  const out = cp.length > n ? cp.slice(0, n).join("") : s;
  return out.replace(/\s+/g, " ").trim();
}

function formatDate(iso: string, locale: string): string {
  try {
    // Explicit locale (it-IT / en-US) keeps SSR and client output identical —
    // `undefined` would use the server's locale on the server and the browser's
    // on the client, causing a hydration mismatch.
    return new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function InstaIcon({ size = 24 }: { size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
