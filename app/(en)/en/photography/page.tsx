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
  title: "Photography — through the lens",
  description: `${site.author.name}'s passion for photography: landscapes, travel, portraits and details. A selection from the @fosforonero Instagram feed.`,
  alternates: {
    canonical: "/en/photography",
    languages: { it: "/fotografia", en: "/en/photography", "x-default": "/fotografia" },
  },
};

export default async function InstagramPageEN() {
  const t = getDictionary("en");
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(instagramGalleryLd(posts, "en")) }}
      />
      <Nav locale="en" />
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

        <InstagramGallery posts={posts} t={galleryT} locale="en" />
      </main>
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
          href={getLocalePath("en", "/privacy")}
          className="fn-link-underline"
          style={{ color: "var(--color-dim)", textDecoration: "none" }}
        >
          {t.footer.legal.privacy}
        </Link>
        <Link
          href={getLocalePath("en", "/cookies")}
          className="fn-link-underline"
          style={{ color: "var(--color-dim)", textDecoration: "none" }}
        >
          {t.footer.legal.cookies}
        </Link>
        <CookieSettingsLink className="fn-link-underline">
          {t.footer.legal.cookieSettings}
        </CookieSettingsLink>
      </div>
    </div>
  );
}
