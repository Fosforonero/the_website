import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `${site.name} — Independent software development`, template: `%s · ${site.name}` },
  description: `${site.name} is the umbrella under which ${site.author.name}, a developer based in Rome, publishes his projects: apps, dashboards and tools for web and mobile.`,
  alternates: {
    canonical: "/en",
    languages: { it: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    locale: "en_US",
    alternateLocale: ["it_IT"],
    title: `${site.name} — Independent software development`,
    description: `Independent studio of ${site.author.name}. FitMesh Sync, SplitVote and other projects.`,
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  // EN-only layout wrapper. The <html lang> attribute is still "it" because
  // it's set on the root <html>; in production you may want to override it
  // via a top-of-tree client component or by restructuring to per-locale
  // route groups. For SEO, the per-page `alternates.languages` metadata is
  // what matters most for Google.
  return <>{children}</>;
}
