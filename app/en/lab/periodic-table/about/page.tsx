import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableAboutView } from "@/components/lab/periodic-table-about-view";

const PAGE_URL = `${site.url}/en/lab/periodic-table/about`;
const PAGE_URL_IT = `${site.url}/lab/tavola-periodica/about`;

export const metadata: Metadata = {
  title: "3D Periodic Table: sources and roadmap",
  description:
    "Technology, scientific sources, and roadmap for the interactive 3D periodic table: 118 elements, historical atomic models, WebGL, dark/light mode.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL_IT,
      en: PAGE_URL,
      "x-default": PAGE_URL_IT,
    },
  },
  openGraph: {
    type: "article",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "3D Periodic Table: sources and roadmap",
    description: "Sources, technology, and roadmap for the interactive 3D periodic table: 118 elements, historical atomic models, and WebGL.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Interactive Periodic Table — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function AboutPeriodicTableEn() {
  return <PeriodicTableAboutView locale="en" />;
}
