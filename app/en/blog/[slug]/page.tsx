import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import "katex/dist/katex.min.css";
import { Math, Mi } from "@/components/parts/mdx-math";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { PostNav } from "@/components/parts/post-nav";
import { alternateSlug, getAdjacentPosts, getAllSlugs, getPost, getRelatedPosts } from "@/lib/blog";
import { blogPostingLd, breadcrumbLd } from "@/lib/jsonld";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllSlugs("en");
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("en", slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/en/blog/${post.slug}`,
      languages: {
        it: `/blog/${alternateSlug(post.slug)}`,
        en: `/en/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [site.author.name],
      tags: [post.tag],
      images: post.image ? [{ url: post.image, alt: post.imageAlt ?? post.title }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function EnBlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPost("en", slug);
  if (!post) notFound();

  const t = getDictionary("en");
  const [{ prev, next }, related] = await Promise.all([
    getAdjacentPosts("en", slug),
    getRelatedPosts("en", slug, 3),
  ]);

  const dateStr = new Date(post.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // BlogPosting + BreadcrumbList in a single JSON-LD payload (array form is
  // supported by Schema.org consumers; cuts down on inline <script> tags).
  const ld = JSON.stringify([
    blogPostingLd(post),
    breadcrumbLd([
      { name: "Home", url: `${site.url}/en` },
      { name: "Blog", url: `${site.url}/en/blog` },
      { name: post.title, url: `${site.url}/en/blog/${post.slug}` },
    ]),
  ]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav locale="en" />
      <main
        id="main"
        style={{
          flex: 1,
          padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 64px) clamp(64px, 12vw, 120px)",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <article>
          <header style={{ marginBottom: "clamp(28px, 5vw, 48px)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
                {post.tag}
              </Pill>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--color-dim)",
                  letterSpacing: "0.08em",
                }}
              >
                {dateStr} · {post.readingMinutes} min read
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(34px, 6vw, 56px)",
                fontWeight: 600,
                color: "var(--color-ink)",
                margin: "0 0 18px",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              {post.title}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(17px, 2.2vw, 22px)",
                color: "var(--color-ink-2)",
                opacity: 0.75,
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {post.excerpt}
            </p>
          </header>
          <div className="prose">
            <MDXRemote source={post.content} components={{ Math, Mi }} />
          </div>
          <footer
            style={{
              marginTop: "clamp(48px, 8vw, 80px)",
              paddingTop: 32,
              borderTop: "1px solid var(--color-rule)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-dim)",
              letterSpacing: "0.08em",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <span>{site.author.name}</span>
            <Link
              href="/en/blog"
              className="fn-link-underline"
              style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 600 }}
            >
              ← ALL POSTS
            </Link>
          </footer>

          <PostNav
            locale="en"
            prev={prev}
            next={next}
            related={related}
            labels={{
              prev: t.blog.prevLabel,
              next: t.blog.nextLabel,
              related: t.blog.relatedTitle,
              minRead: t.blog.minRead,
            }}
          />
        </article>
        {/* Structured data injected via JsonLdScript below */}
      </main>
      <Footer locale="en" />
      <JsonLdScript json={ld} />
    </div>
  );
}

// Server-only helper. The JSON is built on the server from controlled inputs
// (frontmatter from our own MDX files + site constants), so this is the
// documented Next.js pattern for embedding structured data on a page.
function JsonLdScript({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
