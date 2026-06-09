"use client";

import { useEffect, useRef } from "react";

// Fixed gradient overlay that fades page content into the nav as the user
// scrolls. Uses a solid-color div clipped with mask-image so background-color
// can transition smoothly between section colours.
//
// Reads actual computed background-color from each `main > section` — no
// data-attributes needed. Falls back to body background when no section
// matches (e.g. on non-landing pages).
export function ScrollFade() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Approximate height from viewport top to bottom of sticky nav.
    // 24px top margin + ~52px nav height = ~76px.
    const NAV_BOTTOM = 76;

    // Walk up from el to find the first ancestor with a non-transparent bg.
    function resolvedBg(el: Element): string {
      let node: Element | null = el;
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
        node = node.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

    function getActiveBg(): string {
      const sections = document.querySelectorAll("main > section");
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= NAV_BOTTOM && r.bottom > NAV_BOTTOM) {
          return resolvedBg(s);
        }
      }
      // Fallback: first section (before any scrolling) or body.
      const first = document.querySelector("main > section");
      if (first) return resolvedBg(first);
      return getComputedStyle(document.body).backgroundColor;
    }

    function update() {
      if (el) el.style.backgroundColor = getActiveBg();
    }

    window.addEventListener("scroll", update, { passive: true });
    // Also update on resize (viewport height change on mobile).
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 90,
        zIndex: 45,
        pointerEvents: "none",
        transition: "background-color 0.3s ease",
        maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
      }}
    />
  );
}
