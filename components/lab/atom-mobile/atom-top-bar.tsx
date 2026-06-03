"use client";
import Link from "next/link";

export function AtomTopBar({
  name, symbol, z, modeSubtitle, locale, onBack, langHref, manualHref, t,
}: {
  name: string; symbol: string; z: number; modeSubtitle: string;
  locale: "it" | "en";
  onBack: () => void;
  langHref: string;
  manualHref: string;
  t: { back: string; manual: string };
}) {
  return (
    <div className="pt-atomm-topbar">
      <button type="button" className="pt-atomm-iconbtn" onClick={onBack}>‹ {t.back}</button>
      <div className="pt-atomm-title">
        <h1 className="pt-atomm-title__h1">
          {name} <em className="pt-atomm-title__sub">· {symbol} {z}</em>
        </h1>
        <p className="pt-atomm-title__mode">{modeSubtitle}</p>
      </div>
      <Link href={langHref} className="pt-atomm-lang" aria-label={locale === "it" ? "English" : "Italiano"}>
        {locale === "it" ? "EN" : "IT"}
      </Link>
      <Link href={manualHref} className="pt-atomm-info" aria-label={t.manual}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}
