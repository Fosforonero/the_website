"use client";

// Instagram bento gallery — 2026 design.
// - Asymmetric bento grid (1x1 / 2x1 / 1x2 / 2x2) with `grid-auto-flow: dense`
// - Mobile-first: 2 cols on phone, 3 on tablet, 4 on desktop
// - 3D tilt on hover (pointer-driven, capped at 6deg, eased)
// - Halo: per-tile dominant colour bleeds as a glow on hover
// - Lightbox modal on click: image + full caption + link to original post

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { InstaPost, InstaTileSize } from "@/lib/instagram";

// We accept a precomputed map of type labels rather than a function — React
// Server Components can only serialise plain data when handing props to a
// client component.
type TypeLabels = Record<"image" | "video" | "carousel", string>;

type T = {
  openOriginal: string;
  close: string;
  typeLabels: TypeLabels;
  empty: string;
};

type Props = { posts: InstaPost[]; t: T };

const SIZE_SPAN: Record<InstaTileSize, { col: number; row: number }> = {
  "1x1": { col: 1, row: 1 },
  "2x1": { col: 2, row: 1 },
  "1x2": { col: 1, row: 2 },
  "2x2": { col: 2, row: 2 },
};

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

  return (
    <>
      <div
        className="fn-ig-grid"
        style={{
          display: "grid",
          gridAutoFlow: "dense",
          gridAutoRows: "minmax(140px, auto)",
          gap: "clamp(10px, 1.4vw, 16px)",
        }}
      >
        {posts.map((post) => (
          <Tile key={post.id} post={post} onOpen={() => setActive(post)} t={t} />
        ))}
      </div>

      {active ? <Lightbox post={active} onClose={() => setActive(null)} t={t} /> : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Tile — 3D tilt + halo on hover
// ─────────────────────────────────────────────────────────────

function Tile({ post, onOpen, t }: { post: InstaPost; onOpen: () => void; t: T }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const span = SIZE_SPAN[post.size ?? "1x1"];
  const halo = post.halo ?? "var(--color-accent)";

  const onMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const maxDeg = 6;
    el.style.setProperty("--tilt-x", `${-(y * maxDeg).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * maxDeg).toFixed(2)}deg`);
    el.style.setProperty("--halo-opacity", "0.55");
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--halo-opacity", "0");
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onBlur={reset}
      aria-label={`Apri post: ${post.caption.slice(0, 60)}`}
      style={
        {
          gridColumn: `span ${span.col}`,
          gridRow: `span ${span.row}`,
          position: "relative",
          border: 0,
          padding: 0,
          background: "transparent",
          cursor: "pointer",
          borderRadius: 14,
          transformStyle: "preserve-3d",
          transform:
            "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
          transition: "transform .35s cubic-bezier(0.16, 1, 0.3, 1)",
          // Halo behind the tile
          boxShadow: `0 0 28px 0 ${halo}`,
          // Default halo invisible; pointer moves up the opacity via a sibling layer
          "--halo-opacity": 0,
        } as CSSProperties
      }
      className="fn-ig-tile"
    >
      {/* Halo layer (controls opacity to avoid box-shadow opacity quirks) */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 18,
          background: `radial-gradient(closest-side, ${halo}55, transparent 70%)`,
          opacity: "var(--halo-opacity, 0)" as unknown as number,
          transition: "opacity .35s ease",
          pointerEvents: "none",
          filter: "blur(8px)",
          zIndex: -1,
        }}
      />

      <TileBody post={post} t={t} halo={halo} />
    </button>
  );
}

function TileBody({ post, t, halo }: { post: InstaPost; t: T; halo: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 140,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--color-rule)",
        background: post.image
          ? "var(--color-card)"
          : `linear-gradient(135deg, ${halo}22 0%, ${halo}44 100%), var(--color-card)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: halo,
            opacity: 0.7,
          }}
        >
          <InstaIcon size={32} />
        </div>
      )}

      {/* Bottom gradient veil for readability */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
          background: post.image
            ? "linear-gradient(to top, rgba(10,10,10,0.78), transparent)"
            : "linear-gradient(to top, rgba(10,10,10,0.06), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Top-right type chip */}
      {post.type && post.type !== "image" ? (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
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

      {/* Caption + date pinned bottom-left */}
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          textAlign: "left",
          color: post.image ? "#fff" : "var(--color-ink)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(11px, 1.2vw, 13px)",
            lineHeight: 1.4,
            fontWeight: 500,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {post.caption}
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            opacity: 0.8,
          }}
        >
          {formatDate(post.date)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lightbox modal
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("fn-no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("fn-no-scroll");
    };
  }, [onClose]);

  const halo = post.halo ?? "var(--color-accent)";

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
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10,10,10,0.7)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: 0,
          padding: 0,
          cursor: "pointer",
        }}
      />

      {/* Panel */}
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
          boxShadow: `0 0 40px ${halo}22, 0 20px 60px rgba(10,10,10,0.4)`,
          animation: "fnBannerIn .28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Image / placeholder area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "4 / 3",
            background: post.image
              ? "var(--color-bg)"
              : `linear-gradient(135deg, ${halo}22, ${halo}55)`,
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{ color: halo, opacity: 0.8 }}>
              <InstaIcon size={64} />
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              background: "rgba(255,255,255,0.9)",
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

        {/* Caption + meta + CTA */}
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
              {t.openOriginal} <span style={{ color: halo }}>↗</span>
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
