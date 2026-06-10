import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { BlogRow } from "@/components/parts/blog-row";
import { Pill } from "@/components/parts/pill";
import { Reveal } from "@/components/client/reveal";
import { getAllPosts } from "@/lib/blog";
import { getDictionary } from "@/lib/i18n";
import { blogIndexLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing · Technical notes",
  description: `Working notes, project retrospectives and technical decisions by ${site.author.name}, independent software engineer. Updated when there's something concrete to share.`,
  alternates: {
    canonical: "/en/blog",
    languages: { it: "/blog", en: "/en/blog", "x-default": "/blog" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${site.url}/en/blog`,
    siteName: site.name,
    title: `Writing · Technical notes · ${site.name}`,
    description: `Working notes, project retrospectives and technical decisions by ${site.author.name}.`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image" },
};

export default async function EnBlogIndexPage() {
  const t = getDictionary("en");
  const posts = await getAllPosts("en");
  const ld = blogIndexLd(posts, "en");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
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
        <Reveal>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            {t.blog.eyebrow}
          </Pill>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(48px, 9vw, 96px)",
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: "clamp(14px, 2.5vw, 20px) 0 16px",
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
            }}
          >
            {t.blog.headline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(17px, 2.2vw, 20px)",
              color: "var(--color-ink-2)",
              opacity: 0.78,
              maxWidth: 620,
              lineHeight: 1.5,
              marginBottom: "clamp(36px, 7vw, 56px)",
            }}
          >
            {t.blog.paragraph}
          </p>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 70}>
              <BlogRow post={post} idx={i} readLabel={t.blog.read} />
            </Reveal>
          ))}
        </div>
      </main>
      <Footer locale="en" />
    </div>
  );
}
