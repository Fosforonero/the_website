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
  date: string; // ISO yyyy-mm-dd
  tag: string;
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
        tag: String(data.tag ?? ""),
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
      tag: String(data.tag ?? ""),
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
