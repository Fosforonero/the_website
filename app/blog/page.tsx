import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { BlogRow } from "@/components/parts/blog-row";
import { Pill } from "@/components/parts/pill";
import { Reveal } from "@/components/client/reveal";
import { getAllPosts } from "@/lib/blog";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog · Note tecniche",
  description: `Note di lavoro, retrospettive e scelte tecniche di ${site.author.name}.`,
  alternates: {
    canonical: "/blog",
    languages: { it: "/blog", en: "/en/blog", "x-default": "/blog" },
  },
};

export default async function BlogIndexPage() {
  const t = getDictionary("it");
  const posts = await getAllPosts("it");

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav locale="it" />
      <main
        id="main"
        style={{ padding: "60px 64px 120px", maxWidth: 1280, margin: "0 auto" }}
      >
        <Reveal>
          <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
            {t.blog.eyebrow}
          </Pill>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 96,
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: "20px 0 16px",
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
            }}
          >
            {t.blog.headline}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 20,
              color: "var(--color-ink-2)",
              opacity: 0.78,
              maxWidth: 620,
              lineHeight: 1.5,
              marginBottom: 56,
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
    </div>
  );
}
