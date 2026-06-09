import Link from "next/link";
import { P15Box } from "./p15-box";
import { Pill } from "./pill";
import { MobileNav } from "@/components/client/mobile-nav";
import { getDictionary } from "@/lib/i18n";
import { site, type Locale, getLocalePath } from "@/lib/site";

type Props = { locale: Locale };

export function Nav({ locale }: Props) {
  const t = getDictionary(locale);
  const homeHref = getLocalePath(locale, "/");
  const otherLocale: Locale = locale === "it" ? "en" : "it";
  const otherLocaleHref = getLocalePath(otherLocale, "/");
  const ariaLabel = locale === "it" ? "Menu di navigazione" : "Navigation menu";

  // Identity page has different slugs per locale (identita vs identity), so
  // it's computed explicitly rather than via getLocalePath.
  const identityHref = locale === "it" ? "/identita" : "/en/identity";

  const links: Array<{ label: string; href: string }> = [
    { label: t.nav.about, href: `${homeHref}#about` },
    { label: t.nav.projects, href: `${homeHref}#progetti` },
    { label: t.nav.blog, href: `${homeHref === "/" ? "" : homeHref}/blog` },
    { label: t.nav.identity, href: identityHref },
    { label: t.nav.contact, href: `${homeHref}#contatti` },
  ];

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "clamp(14px, 3vw, 20px) clamp(16px, 4vw, 32px)",
        margin: "clamp(12px, 3vw, 24px) clamp(12px, 4vw, 32px)",
        position: "sticky",
        top: "clamp(12px, 3vw, 24px)",
        zIndex: 50,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--color-rule)",
        borderRadius: 14,
        boxShadow: "0 1px 4px rgba(10,10,10,0.08)",
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
        className="fn-hide-mobile"
        style={{
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

      <MobileNav
        links={links}
        currentLocaleLabel={locale.toUpperCase()}
        otherLocaleLabel={otherLocale.toUpperCase()}
        otherLocaleHref={otherLocaleHref}
        ariaLabel={ariaLabel}
      />
    </header>
  );
}
