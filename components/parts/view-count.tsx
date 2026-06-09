"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  locale?: "it" | "en";
};

export function ViewCount({ slug, locale = "it" }: Props) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/blog/views/${slug}`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => setViews(d.views))
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  const label = locale === "it"
    ? `${views.toLocaleString("it-IT")} visualizzazioni`
    : `${views.toLocaleString("en-US")} views`;

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--color-dim)",
        letterSpacing: "0.08em",
      }}
    >
      {label}
    </span>
  );
}
