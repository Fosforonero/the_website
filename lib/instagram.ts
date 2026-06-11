// Instagram gallery loader — pure FS read of content/instagram/posts.json.
// No external API call: the source is a static JSON file you maintain
// manually (or via a future import script). This keeps the build fast,
// avoids Instagram's API moving target, and keeps the site Vercel-static.
import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

export type InstaTileSize = "1x1" | "2x1" | "1x2" | "2x2";
export type InstaType = "image" | "video" | "carousel";

export type InstaPost = {
  id: string;
  caption: string;
  /** ISO yyyy-mm-dd of the original post. */
  date: string;
  /** Direct link to the post on instagram.com (used by the lightbox CTA). */
  permalink?: string;
  /** Path inside /public, e.g. "/instagram/abc.webp". null = render placeholder. */
  image: string | null;
  /** All slides for a carousel post (≥2). Absent for single-image posts. */
  images?: string[];
  type?: InstaType;
  /** Bento tile size — defaults to 1x1. */
  size?: InstaTileSize;
  /** Dominant colour used for the hover halo. Hex string. */
  halo?: string;
  /** width / height of the image — drives the justified "dynamic" layout. */
  aspect?: number;
};

const FILE = path.join(process.cwd(), "content", "instagram", "posts.json");

export async function getAllInstagramPosts(): Promise<InstaPost[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as InstaPost[];
    return parsed.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}
