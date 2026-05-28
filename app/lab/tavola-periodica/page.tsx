import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { PeriodicTableView } from "@/components/lab/periodic-table-view";
import "@/components/lab/periodic-table.css";

const PAGE_URL = `${site.url}/lab/tavola-periodica`;
const PAGE_URL_EN = `${site.url}/en/lab/tavola-periodica`;

export const metadata: Metadata = {
  title: "Tavola Periodica Interattiva 3D · Fosforonero Lab",
  description:
    "Tavola periodica degli elementi interattiva con atomo 3D WebGL. Esplora 118 elementi e 5 modelli storici da Thomson a Schrödinger. Responsive, gratis, senza installazione.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL,
      en: PAGE_URL_EN,
      "x-default": PAGE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Tavola Periodica Interattiva 3D · Fosforonero Lab",
    description: "118 elementi con atomo 3D WebGL in tempo reale. 5 modelli storici, heatmap fisiche, responsive. Provalo gratis nel browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Tavola Periodica Interattiva — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function TavolaPeriodica() {
  return (
    <Suspense fallback={<div className="atom-loading">...</div>}>
      <PeriodicTableView locale="it" />
    </Suspense>
  );
}
