// MDX blog loader — server-only. Reads .mdx files from content/blog/<locale>/,
// parses frontmatter, computes reading time. Pure FS access; no DB.
import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "./site";

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd — original publish date
  updated?: string; // ISO yyyy-mm-dd — last meaningful content update (optional)
  tag: string;
  image?: string;
  imageAlt?: string;
  readingTime: string;
  readingMinutes: number;
  locale: Locale;
  draft: boolean;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

const ROOT = path.join(process.cwd(), "content", "blog");

// In production we hide posts with frontmatter `draft: true`. In dev they
// remain visible so the author can review them in-context.
const HIDE_DRAFTS = process.env.NODE_ENV === "production";

// Articles whose IT and EN slugs differ (localized URLs). Maps a slug to its
// counterpart in the other language so hreflang / canonical alternates point to
// the page that actually exists (most articles share one slug across languages).
const SLUG_ALTERNATES: Record<string, string> = {
  "splitvote-account-opzionali": "splitvote-optional-accounts",
  "splitvote-optional-accounts": "splitvote-account-opzionali",
  "splitvote-architettura-nextjs-redis-supabase": "splitvote-architecture-nextjs-redis-supabase",
  "splitvote-architecture-nextjs-redis-supabase": "splitvote-architettura-nextjs-redis-supabase",
  "tradurre-1200-pagine-ollama": "translating-1200-pages-ollama",
  "translating-1200-pages-ollama": "tradurre-1200-pagine-ollama",
  "costruire-motore-di-traduzione-weglot": "build-your-own-translation-engine",
  "build-your-own-translation-engine": "costruire-motore-di-traduzione-weglot",
};
export function alternateSlug(slug: string): string {
  return SLUG_ALTERNATES[slug] ?? slug;
}

async function safeReadDir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

export async function getAllPosts(locale: Locale): Promise<BlogPostMeta[]> {
  const dir = path.join(ROOT, locale);
  const files = (await safeReadDir(dir)).filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const fp = path.join(dir, file);
      const raw = await fs.readFile(fp, "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.mdx$/, "");
      const rt = readingTime(content);
      return {
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date ?? ""),
        updated: data.updated ? String(data.updated) : undefined,
        tag: String(data.tag ?? ""),
        image: data.image ? String(data.image) : undefined,
        imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
        readingTime: rt.text,
        readingMinutes: Math.max(1, Math.round(rt.minutes)),
        locale,
        draft: data.draft === true,
      } satisfies BlogPostMeta;
    }),
  );
  return posts
    .filter((p) => !(HIDE_DRAFTS && p.draft))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(locale: Locale, slug: string): Promise<BlogPost | null> {
  const fp = path.join(ROOT, locale, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(fp, "utf8");
    const { data, content } = matter(raw);
    if (HIDE_DRAFTS && data.draft === true) return null;
    const rt = readingTime(content);
    return {
      slug,
      title: String(data.title ?? slug),
      excerpt: String(data.excerpt ?? ""),
      date: String(data.date ?? ""),
      updated: data.updated ? String(data.updated) : undefined,
      tag: String(data.tag ?? ""),
      image: data.image ? String(data.image) : undefined,
      imageAlt: data.imageAlt ? String(data.imageAlt) : undefined,
      readingTime: rt.text,
      readingMinutes: Math.max(1, Math.round(rt.minutes)),
      locale,
      draft: data.draft === true,
      content,
    };
  } catch {
    return null;
  }
}

/**
 * Adjacent posts in chronological order, for prev/next navigation on a post.
 * Posts are sorted newest-first, so visually:
 *   "← Older post" = posts[idx + 1]  (we expose as `prev`)
 *   "Newer post →" = posts[idx - 1]  (we expose as `next`)
 */
export async function getAdjacentPosts(
  locale: Locale,
  slug: string,
): Promise<{ prev: BlogPostMeta | null; next: BlogPostMeta | null }> {
  const posts = await getAllPosts(locale);
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    next: idx > 0 ? posts[idx - 1] ?? null : null,
    prev: idx < posts.length - 1 ? posts[idx + 1] ?? null : null,
  };
}

/**
 * Related posts: same tag first (most relevant), then fill with chronological
 * neighbours up to `limit`. Always excludes the current post.
 */
export async function getRelatedPosts(
  locale: Locale,
  slug: string,
  limit = 3,
): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts(locale);
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  const others = posts.filter((p) => p.slug !== slug);
  const sameTag = others.filter((p) => p.tag === current.tag);
  const otherTags = others.filter((p) => p.tag !== current.tag);
  return [...sameTag, ...otherTags].slice(0, limit);
}

export async function getAllSlugs(locale: Locale): Promise<string[]> {
  const dir = path.join(ROOT, locale);
  const files = (await safeReadDir(dir)).filter((f) => f.endsWith(".mdx"));
  if (!HIDE_DRAFTS) return files.map((f) => f.replace(/\.mdx$/, ""));
  // In production, parse frontmatter to skip drafts at build time.
  const slugs: string[] = [];
  for (const file of files) {
    const fp = path.join(ROOT, locale, file);
    const raw = await fs.readFile(fp, "utf8");
    const { data } = matter(raw);
    if (data.draft === true) continue;
    slugs.push(file.replace(/\.mdx$/, ""));
  }
  return slugs;
}
