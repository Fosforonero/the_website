// Footer used by every route. Server-rendered.
// Holds the P15 glyph, status line, and the legal nav (Privacy, Cookies,
// Cookie settings — the last one is a client island that re-opens the banner).

import Link from "next/link";
import { P15Box } from "./p15-box";
import { CookieSettingsLink } from "@/components/client/cookie-settings-link";
import { getDictionary } from "@/lib/i18n";
import { getLocalePath, type Locale } from "@/lib/site";

type Props = { locale: Locale };

export function Footer({ locale }: Props) {
  const t = getDictionary(locale);

  return (
    <footer
      className="fn-footer-row"
      style={{
        padding: "clamp(32px, 5vw, 48px) clamp(20px, 5vw, 64px)",
        borderTop: "1px solid var(--color-rule)",
      }}
    >
      <div>
        <P15Box size={28} />
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-dim)",
            marginTop: 14,
            letterSpacing: "0.12em",
          }}
        >
          {t.footer.line1}
        </div>

        {/* Legal nav */}
        <nav
          aria-label={locale === "it" ? "Note legali" : "Legal notices"}
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 18px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-dim)",
            letterSpacing: "0.12em",
          }}
        >
          <Link
            href={getLocalePath(locale, "/privacy")}
            className="fn-link-underline"
            style={{ color: "var(--color-dim)", textDecoration: "none" }}
          >
            {t.footer.legal.privacy}
          </Link>
          <Link
            href={getLocalePath(locale, "/cookies")}
            className="fn-link-underline"
            style={{ color: "var(--color-dim)", textDecoration: "none" }}
          >
            {t.footer.legal.cookies}
          </Link>
          <CookieSettingsLink className="fn-link-underline">
            {t.footer.legal.cookieSettings}
          </CookieSettingsLink>
        </nav>
      </div>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-dim)",
          textAlign: "right",
          letterSpacing: "0.12em",
          lineHeight: 1.8,
        }}
      >
        {t.footer.line2}
        <br />
        <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{t.footer.status}</span>
      </div>
    </footer>
  );
}
