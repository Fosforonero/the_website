"use client";

// Small client island used in the footer to reopen the cookie banner from any
// page. Server components delegate the click action here.

import { openCookieBanner } from "@/components/client/cookie-banner";
import type { CSSProperties, ReactNode } from "react";

type Props = { children: ReactNode; className?: string; style?: CSSProperties };

export function CookieSettingsLink({ children, className, style }: Props) {
  return (
    <button
      type="button"
      onClick={() => openCookieBanner()}
      className={className}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
        letterSpacing: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
