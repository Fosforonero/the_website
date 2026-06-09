import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableAboutView } from "@/components/lab/periodic-table-about-view";

const PAGE_URL = `${site.url}/lab/tavola-periodica/about`;
const PAGE_URL_EN = `${site.url}/en/lab/periodic-table/about`;

export const metadata: Metadata = {
  title: "Tavola Periodica 3D: fonti e roadmap",
  description:
    "Tecnologia, fonti scientifiche e roadmap della tavola periodica interattiva 3D: 118 elementi, modelli atomici storici, WebGL, dark/light mode.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL,
      en: PAGE_URL_EN,
      "x-default": PAGE_URL,
    },
  },
  openGraph: {
    type: "article",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Tavola Periodica 3D: fonti e roadmap",
    description: "Fonti, tecnologia e roadmap della tavola periodica interattiva 3D: 118 elementi, modelli atomici storici e WebGL.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Tavola Periodica Interattiva — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function AboutTavolaPeriodica() {
  return <PeriodicTableAboutView locale="it" />;
}
