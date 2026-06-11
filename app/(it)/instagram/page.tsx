import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Pill } from "@/components/parts/pill";
import { InstagramGallery } from "@/components/client/instagram-gallery";
import { CookieSettingsLink } from "@/components/client/cookie-settings-link";
import Link from "next/link";
import { getAllInstagramPosts } from "@/lib/instagram";
import { getDictionary } from "@/lib/i18n";
import { getLocalePath, site } from "@/lib/site";
import { instagramGalleryLd } from "@/lib/jsonld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fotografia — attraverso l'obiettivo",
  description: `La passione per la fotografia di ${site.author.name}: paesaggi, viaggi, ritratti e dettagli. Una selezione dal feed Instagram @fosforonero.`,
  alternates: {
    canonical: "/instagram",
    languages: { it: "/instagram", en: "/en/instagram", "x-default": "/instagram" },
  },
};

export default async function InstagramPageIT() {
  const t = getDictionary("it");
  const posts = await getAllInstagramPosts();
  const galleryT = {
    openOriginal: t.instagram.openOriginal,
    close: t.instagram.close,
    share: t.instagram.share,
    copied: t.instagram.copied,
    empty: t.instagram.empty,
    typeLabels: {
      image: t.instagram.typeLabel("image"),
      video: t.instagram.typeLabel("video"),
      carousel: t.instagram.typeLabel("carousel"),
    },
  } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(instagramGalleryLd(posts, "it")) }}
      />
      <Nav locale="it" />
      <main
        id="main"
        style={{
          flex: 1,
          padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 64px) clamp(64px, 12vw, 120px)",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <header style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            {t.instagram.eyebrow}
          </Pill>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              margin: "clamp(14px, 2.5vw, 20px) 0 14px",
            }}
          >
            {t.instagram.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "var(--color-ink-2)",
              opacity: 0.78,
              lineHeight: 1.5,
              maxWidth: 620,
              margin: 0,
            }}
          >
            {t.instagram.body}
          </p>
          <a
            href={site.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="fn-link-underline"
            style={{
              display: "inline-block",
              marginTop: 14,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.12em",
              color: "var(--color-ink)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            @fosforonero <span style={{ color: "var(--color-accent)" }}>↗</span>
          </a>
        </header>

        <InstagramGallery posts={posts} t={galleryT} locale="it" variant="dynamic" />
      </main>
      <ComingSoonLegalFooter locale="it" t={t} />
    </div>
  );
}

// Small legal-only footer (same as ComingSoon) so the Instagram page stays
// quiet and doesn't pull in the full marketing footer.
function ComingSoonLegalFooter({
  locale,
  t,
}: {
  locale: "it" | "en";
  t: ReturnType<typeof getDictionary>;
}) {
  return (
    <div
      style={{
        padding: "clamp(20px, 4vw, 32px) clamp(20px, 5vw, 64px)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px 18px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--color-dim)",
        letterSpacing: "0.12em",
        borderTop: "1px solid var(--color-rule)",
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
    </div>
  );
}
