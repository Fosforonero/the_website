"use client";

// Cookie banner — GDPR / ePrivacy compliant, bilingual.
// Design follows the "Cool Studio" identity (card, accent phosphor, mono+sans).
// Mobile-first: full-width bottom card with safe-area padding.
// Desktop: bottom-left, max-width 480px.
//
// Compliance notes
// - All three primary actions (Accept / Reject / Customise) are present and
//   visually equivalent in size and contrast. No "Accept" dark pattern.
// - The close button counts as REJECT (not accept) per Garante / EDPB.
// - ESC also rejects. Click-outside does NOT auto-accept.
// - Choice is persisted in localStorage with timestamp + schema version.
// - Consent Mode v2 is updated through lib/cookie-consent.writeConsent().
// - The banner reopens from anywhere via openBanner() / footer link.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  type ConsentChoice,
  applyConsentToGoogle,
  openBanner as _openBanner,
  readConsent,
  writeConsent,
} from "@/lib/cookie-consent";
import { getDictionary } from "@/lib/i18n";
import { getLocalePath, type Locale } from "@/lib/site";

type View = "compact" | "manage";

export function CookieBanner() {
  // Detect locale from the current path. Single banner instance lives in the
  // root layout — keeps it in sync with route transitions without remounts.
  const pathname = usePathname() ?? "/";
  const locale: Locale = useMemo(
    () => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "it"),
    [pathname],
  );
  const t = getDictionary(locale).cookie;
  const tLegal = getDictionary(locale).footer.legal;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("compact");
  const [analytics, setAnalytics] = useState(false);
  const titleId = useId();
  const descId = useId();
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);

  // Commit a consent decision (called by buttons + ESC handler).
  const commit = useCallback((analyticsGranted: boolean) => {
    writeConsent({ analytics: analyticsGranted });
    setOpen(false);
    setView("compact");
  }, []);

  // First visit: defer state updates by a tick so React doesn't flag a
  // cascading render inside the effect body. Also listen for re-open events.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = readConsent();
    const initTimer = window.setTimeout(() => {
      if (prev) {
        setAnalytics(prev.analytics);
        // Re-send consent to GA on every page load: the beforeInteractive script
        // always starts with analytics_storage=denied, so without this call the
        // consent granted on a previous visit would never be restored after reload.
        applyConsentToGoogle(prev);
      } else {
        setOpen(true);
      }
    }, 0);

    const onReopen = () => {
      const c = readConsent();
      window.setTimeout(() => {
        if (c) setAnalytics(c.analytics);
        setView("manage");
        setOpen(true);
      }, 0);
    };
    window.addEventListener("fn:cookie-banner-open", onReopen);
    return () => {
      window.removeEventListener("fn:cookie-banner-open", onReopen);
      window.clearTimeout(initTimer);
    };
  }, []);

  // Focus management + ESC = reject.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") commit(false);
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, commit]);

  // External listeners (in case the page wants to react to consent changes).
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentChoice>).detail;
      if (detail) setAnalytics(detail.analytics);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!open) return null;

  const cookiePolicyHref = getLocalePath(locale, "/cookies");

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descId}
      style={{
        position: "fixed",
        zIndex: 90,
        left: "clamp(12px, 3vw, 24px)",
        right: "clamp(12px, 3vw, 24px)",
        bottom: "clamp(12px, 3vw, 24px)",
        maxWidth: 480,
        background: "var(--color-card)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        boxShadow: "0 6px 24px rgba(10,10,10,0.12), 0 1px 3px rgba(10,10,10,0.06)",
        padding: "clamp(18px, 3vw, 24px)",
        fontFamily: "var(--font-sans)",
        color: "var(--color-ink)",
        animation: "fnBannerIn .35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-accent)",
            boxShadow: "0 0 0 4px var(--color-accent-soft)",
            marginTop: 8,
            flex: "0 0 8px",
          }}
        />
        <h2
          id={titleId}
          style={{
            fontSize: "clamp(16px, 2.2vw, 18px)",
            fontWeight: 600,
            letterSpacing: "-0.015em",
            margin: 0,
            flex: 1,
            lineHeight: 1.3,
          }}
        >
          {t.title}
        </h2>
        <button
          type="button"
          onClick={() => commit(false)}
          aria-label={t.close}
          style={{
            background: "transparent",
            border: 0,
            padding: 6,
            cursor: "pointer",
            color: "var(--color-dim)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: -6,
            marginTop: -6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <p
        id={descId}
        style={{
          margin: 0,
          fontSize: "clamp(13px, 1.6vw, 14px)",
          color: "var(--color-ink-2)",
          lineHeight: 1.55,
        }}
      >
        {t.body}{" "}
        <Link
          href={cookiePolicyHref}
          className="fn-link-underline"
          style={{ color: "var(--color-ink)", fontWeight: 500, textDecoration: "none" }}
        >
          {t.bodyLink}
        </Link>
      </p>

      {/* Manage panel */}
      {view === "manage" ? (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--color-rule)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <CategoryRow
            name={t.necessary.name}
            desc={t.necessary.desc}
            checked
            locked
          />
          <CategoryRow
            name={t.analytics.name}
            desc={t.analytics.desc}
            checked={analytics}
            onChange={setAnalytics}
          />
        </div>
      ) : null}

      {/* Actions */}
      <div
        style={{
          marginTop: "clamp(16px, 3vw, 20px)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {view === "compact" ? (
          <>
            <BannerButton
              ref={firstFocusRef}
              variant="primary"
              onClick={() => commit(true)}
            >
              {t.acceptAll}
            </BannerButton>
            <BannerButton variant="secondary" onClick={() => commit(false)}>
              {t.rejectAll}
            </BannerButton>
            <BannerButton variant="ghost" onClick={() => setView("manage")}>
              {t.manage}
            </BannerButton>
          </>
        ) : (
          <>
            <BannerButton
              ref={firstFocusRef}
              variant="primary"
              onClick={() => commit(analytics)}
            >
              {t.savePrefs}
            </BannerButton>
            <BannerButton variant="secondary" onClick={() => commit(false)}>
              {t.rejectAll}
            </BannerButton>
            <BannerButton variant="ghost" onClick={() => commit(true)}>
              {t.acceptAll}
            </BannerButton>
          </>
        )}
      </div>

      <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-dim)", letterSpacing: "0.04em" }}>
        <Link
          href={cookiePolicyHref}
          className="fn-link-underline"
          style={{ color: "var(--color-dim)", textDecoration: "none" }}
        >
          {t.learnMore} →
        </Link>
        {" · "}
        <Link
          href={getLocalePath(locale, "/privacy")}
          className="fn-link-underline"
          style={{ color: "var(--color-dim)", textDecoration: "none" }}
        >
          {tLegal.privacy} →
        </Link>
      </div>
    </div>
  );
}

// ───────── Sub-components ─────────

import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const BannerButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant: ButtonVariant }>(
  function BannerButton({ variant, children, style, ...rest }, ref) {
    const base: React.CSSProperties = {
      flex: "1 1 auto",
      minHeight: 44,
      padding: "10px 16px",
      borderRadius: 10,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      border: "1px solid transparent",
      letterSpacing: "-0.005em",
      whiteSpace: "nowrap",
    };
    const variants: Record<ButtonVariant, React.CSSProperties> = {
      primary: { background: "var(--color-ink)", color: "#fff" },
      secondary: {
        background: "var(--color-card)",
        color: "var(--color-ink)",
        border: "1px solid var(--color-rule)",
      },
      ghost: {
        background: "transparent",
        color: "var(--color-dim)",
        border: "1px solid transparent",
      },
    };
    return (
      <button ref={ref} {...rest} style={{ ...base, ...variants[variant], ...style }}>
        {children}
      </button>
    );
  },
);

function CategoryRow({
  name,
  desc,
  checked,
  locked,
  onChange,
}: {
  name: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.85 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
        style={{
          marginTop: 3,
          width: 16,
          height: 16,
          accentColor: "var(--color-accent)",
          cursor: locked ? "not-allowed" : "pointer",
          flex: "0 0 16px",
        }}
        aria-describedby={`${name}-desc`}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-ink)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {name}
          {locked ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                background: "var(--color-surface)",
                color: "var(--color-dim)",
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Always on
            </span>
          ) : null}
        </div>
        <div
          id={`${name}-desc`}
          style={{
            marginTop: 4,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--color-dim)",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      </div>
    </label>
  );
}

// Re-export for convenience (the Footer "manage cookies" link uses it).
export { _openBanner as openCookieBanner };
