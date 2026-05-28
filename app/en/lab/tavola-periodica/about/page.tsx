import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableAboutView } from "@/components/lab/periodic-table-about-view";

const PAGE_URL = `${site.url}/en/lab/tavola-periodica/about`;
const PAGE_URL_IT = `${site.url}/lab/tavola-periodica/about`;

export const metadata: Metadata = {
  title: "Interactive 3D Periodic Table — About · Fosforonero Lab",
  description:
    "Interactive chemical periodic table with 3D WebGL atomic visualizations. 118 elements, 5 historical atomic models (Thomson, Rutherford, Bohr, Sommerfeld, quantum), dark/light mode. Technology, roadmap and scientific sources.",
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
    title: "Interactive 3D Periodic Table — About · Fosforonero Lab",
    description: "118 elements with 3D WebGL atomic model. 5 historical models from Thomson to Schrödinger, dark/light mode, responsive. Free, open source, in the browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Interactive Periodic Table — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function AboutTavolaPeriodicaEn() {
  return <PeriodicTableAboutView locale="en" />;
}
