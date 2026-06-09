// /en/preview — full English Landing while the home shows ComingSoon.
// Noindex: see app/preview/page.tsx for the reasoning.

import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Preview — Landing",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const revalidate = 3600;

export default async function PreviewPageEn() {
  const posts = await getAllPosts("en");
  return <Landing locale="en" posts={posts} />;
}
