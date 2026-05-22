import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Nav } from "@/components/parts/nav";
import { Pill } from "@/components/parts/pill";
import { getAllSlugs, getPost } from "@/lib/blog";
import { blogPostingLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

// Static generation for every known post; built once at deploy.
export async function generateStaticParams() {
  const slugs = await getAllSlugs("it");
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
  const post = await getPost("it", slug);
  if (!post) return { title: "Articolo non trovato" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: {
        it: `/blog/${post.slug}`,
        en: `/en/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [site.author.name],
      tags: [post.tag],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPost("it", slug);
  if (!post) notFound();

  const dateStr = new Date(post.date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav locale="it" />
      <main id="main" style={{ padding: "60px 64px 120px", maxWidth: 760, margin: "0 auto" }}>
        <article>
          <header style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
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
                {dateStr} · {post.readingMinutes} min di lettura
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 56,
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
                fontSize: 22,
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
            <MDXRemote source={post.content} />
          </div>
          <footer
            style={{
              marginTop: 80,
              paddingTop: 32,
              borderTop: "1px solid var(--color-rule)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-dim)",
              letterSpacing: "0.08em",
            }}
          >
            <span>{site.author.name}</span>
            <a
              href="/blog"
              className="fn-link-underline"
              style={{ color: "var(--color-ink)", textDecoration: "none", fontWeight: 600 }}
            >
              ← TUTTI GLI ARTICOLI
            </a>
          </footer>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd(post)) }}
      />
    </div>
  );
}
