"use client";

import { useEffect } from "react";

// Sets document.documentElement.lang for client-side navigation and
// screen readers. The SSR html tag is owned by the root layout ("it");
// a proper fix requires route groups with per-locale root layouts.
export function LangSync({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);
  return null;
}
