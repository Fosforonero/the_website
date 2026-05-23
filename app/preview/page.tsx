// /preview — Landing completa accessibile durante il periodo Coming Soon,
// così il sito può essere rivisto in tutte le sue sezioni prima del lancio.
// Noindex: non deve essere indicizzata né mostrata nei risultati di ricerca.

import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Preview — Landing",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const revalidate = 3600;

export default async function PreviewPage() {
  const posts = await getAllPosts("it");
  return <Landing locale="it" posts={posts} />;
}
