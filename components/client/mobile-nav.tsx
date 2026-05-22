"use client";

// MobileNav — slide-in drawer with hamburger trigger.
// Visible only on screens narrower than 768px (.fn-show-mobile in globals.css).
// A11y: role="dialog" + aria-modal, focus moves to first link on open and
// returns to the trigger on close, Esc closes, body scroll is locked.

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type NavLink = { label: string; href: string };

type Props = {
  links: NavLink[];
  currentLocaleLabel: string;
  otherLocaleLabel: string;
  otherLocaleHref: string;
  ariaLabel: string;
};

export function MobileNav({
  links,
  currentLocaleLabel,
  otherLocaleLabel,
  otherLocaleHref,
  ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const dialogId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Esc to close + lock body scroll while open + restore focus on close.
  useEffect(() => {
    if (!open) return;
    // Snapshot the trigger so the cleanup doesn't read a ref that React may
    // have already detached from the DOM by then.
    const trigger = triggerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("fn-no-scroll");

    // Defer focus to give the dialog time to render.
    const focusTimer = window.setTimeout(() => {
      firstLinkRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("fn-no-scroll");
      window.clearTimeout(focusTimer);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={dialogId}
        className="fn-show-mobile"
        style={{
          width: 40,
          height: 40,
          padding: 0,
          background: "transparent",
          border: "1px solid var(--color-rule)",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--color-ink)",
        }}
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
          }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Chiudi menu"
            onClick={close}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,10,0.45)",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          />
          {/* Drawer panel */}
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className="fn-drawer-panel"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100dvh",
              width: "min(86vw, 360px)",
              background: "var(--color-card)",
              borderLeft: "1px solid var(--color-rule)",
              boxShadow: "-8px 0 32px rgba(10,10,10,0.18)",
              padding: "24px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Chiudi menu"
                style={{
                  width: 40,
                  height: 40,
                  background: "transparent",
                  border: "1px solid var(--color-rule)",
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--color-ink)",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <nav
              aria-label={ariaLabel}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginTop: 8,
              }}
            >
              {links.map((l, i) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={close}
                  ref={i === 0 ? firstLinkRef : undefined}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 28,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    letterSpacing: "-0.02em",
                    textDecoration: "none",
                    padding: "12px 4px",
                    borderBottom: "1px solid var(--color-rule)",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div style={{ marginTop: "auto" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--color-dim)",
                  letterSpacing: "0.24em",
                  marginBottom: 10,
                  textTransform: "uppercase",
                }}
              >
                Lingua
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  aria-current="true"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "8px 12px",
                    background: "var(--color-accent-soft)",
                    color: "var(--color-ink)",
                    borderRadius: 6,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {currentLocaleLabel}
                </span>
                <Link
                  href={otherLocaleHref}
                  onClick={close}
                  aria-label={`Switch language to ${otherLocaleLabel}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "8px 12px",
                    background: "var(--color-surface)",
                    color: "var(--color-dim)",
                    border: "1px solid var(--color-rule)",
                    borderRadius: 6,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  {otherLocaleLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BurgerIcon() {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="1" y1="2" x2="17" y2="2" />
      <line x1="1" y1="10" x2="17" y2="10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
}
