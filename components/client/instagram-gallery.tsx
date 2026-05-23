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

import { useCallback, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import type { InstaPost } from "@/lib/instagram";
import { Reveal } from "@/components/client/reveal";

type TypeLabels = Record<"image" | "video" | "carousel", string>;

type T = {
  openOriginal: string;
  close: string;
  typeLabels: TypeLabels;
  empty: string;
};

type Props = { posts: InstaPost[]; t: T };

export function InstagramGallery({ posts, t }: Props) {
  const [active, setActive] = useState<InstaPost | null>(null);

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

  // The first post becomes the featured hero. The rest fall into a uniform
  // grid. If no posts are flagged, the very first becomes hero implicitly.
  const [hero, ...rest] = posts;

  return (
    <>
      {hero ? (
        <Reveal>
          <HeroTile post={hero} onOpen={() => setActive(hero)} t={t} />
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
              <Tile post={post} onOpen={() => setActive(post)} t={t} />
            </Reveal>
          ))}
        </div>
      ) : null}

      {active ? <Lightbox post={active} onClose={() => setActive(null)} t={t} /> : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Featured hero tile — full width, 21:9 aspect, larger caption.
// ─────────────────────────────────────────────────────────────

function HeroTile({ post, onOpen, t }: { post: InstaPost; onOpen: () => void; t: T }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Apri post: ${post.caption.slice(0, 60)}`}
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
      <TileCaption post={post} hero />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Regular tile — uniform 1:1.
// ─────────────────────────────────────────────────────────────

function Tile({ post, onOpen, t }: { post: InstaPost; onOpen: () => void; t: T }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Apri post: ${post.caption.slice(0, 60)}`}
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
      <TileCaption post={post} />
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
          alt={post.caption.slice(0, 80)}
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

function TileCaption({ post, hero }: { post: InstaPost; hero?: boolean }) {
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
          {formatDate(post.date)}
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
}: {
  post: InstaPost;
  onClose: () => void;
  t: T;
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
              alt={post.caption.slice(0, 80)}
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
            <span>{formatDate(post.date)}</span>
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
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
