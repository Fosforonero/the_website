import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { PeriodicTableView } from "@/components/lab/periodic-table-view";
import "@/components/lab/periodic-table.css";

const PAGE_URL = `${site.url}/en/lab/tavola-periodica`;
const PAGE_URL_IT = `${site.url}/lab/tavola-periodica`;

export const metadata: Metadata = {
  title: "Interactive 3D Periodic Table · Fosforonero Lab",
  description:
    "Interactive chemical periodic table with 3D WebGL atomic visualizations. Explore 118 elements and 5 historical atomic models from Thomson to Schrödinger. Responsive, free, and serverless.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL_IT,
      en: PAGE_URL,
      "x-default": PAGE_URL_IT,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Interactive 3D Periodic Table · Fosforonero Lab",
    description: "118 elements with real-time 3D WebGL atomic visualizations. 5 historical models, physical properties heatmaps, responsive. Try it free in the browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Interactive Periodic Table — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function TavolaPeriodicaEn() {
  return (
    <Suspense fallback={<div className="atom-loading">...</div>}>
      <PeriodicTableView locale="en" />
    </Suspense>
  );
}
