import Link from "next/link";
import { P15Box } from "./p15-box";
import { Pill } from "./pill";
import { getDictionary } from "@/lib/i18n";
import { site, type Locale, getLocalePath } from "@/lib/site";

type Props = { locale: Locale };

export function Nav({ locale }: Props) {
  const t = getDictionary(locale);
  const homeHref = getLocalePath(locale, "/");
  const otherLocale: Locale = locale === "it" ? "en" : "it";
  const otherLocaleHref = getLocalePath(otherLocale, "/");

  const links: Array<{ label: string; href: string }> = [
    { label: t.nav.about, href: `${homeHref}#about` },
    { label: t.nav.projects, href: `${homeHref}#progetti` },
    { label: t.nav.blog, href: `${homeHref === "/" ? "" : homeHref}/blog` },
    { label: t.nav.contact, href: `${homeHref}#contatti` },
  ];

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
        margin: "24px 32px",
        position: "sticky",
        top: 24,
        zIndex: 50,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(10,10,10,0.04)",
      }}
    >
      <Link
        href={homeHref}
        style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
        aria-label={site.name}
      >
        <P15Box size={30} />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--color-ink)",
            letterSpacing: "-0.015em",
          }}
        >
          {site.name}
        </span>
      </Link>

      <nav
        style={{
          display: "flex",
          gap: 4,
          fontSize: 14,
          color: "var(--color-ink-2)",
          alignItems: "center",
        }}
        aria-label="Primary"
      >
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="fn-link-underline"
            style={{
              color: "var(--color-ink-2)",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 6,
            }}
          >
            {l.label}
          </Link>
        ))}
        <span
          aria-hidden
          style={{ width: 1, height: 18, background: "var(--color-rule)", margin: "0 8px" }}
        />
        <Pill background="var(--color-accent-soft)" color="var(--color-ink)">
          {locale.toUpperCase()}
        </Pill>
        <Link
          href={otherLocaleHref}
          aria-label={`Switch language to ${otherLocale.toUpperCase()}`}
          style={{ textDecoration: "none" }}
        >
          <Pill>{otherLocale.toUpperCase()}</Pill>
        </Link>
      </nav>
    </header>
  );
}
