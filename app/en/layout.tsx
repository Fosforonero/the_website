import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LangSync } from "@/components/client/lang-sync";

export const metadata: Metadata = {
  title: { default: `${site.name} — Independent software development`, template: `%s · ${site.name}` },
  description: `${site.name} is the umbrella under which ${site.author.name}, a software engineer in Rome, publishes his projects: applications, dashboards and tooling for web and mobile.`,
  alternates: {
    canonical: "/en",
    languages: { it: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["it_IT"],
    url: `${site.url}/en`,
    siteName: site.name,
    title: `${site.name} — Independent software development`,
    description: `Independent studio of ${site.author.name}. FitMesh Sync, SplitVote and other projects.`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Independent software development`,
    description: `Independent studio of ${site.author.name}.`,
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LangSync lang="en" />
      {children}
    </>
  );
}
