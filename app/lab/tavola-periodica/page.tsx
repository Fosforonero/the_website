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
    "Tavola periodica interattiva con atomo 3D WebGL. Esplora 118 elementi e 5 modelli storici da Thomson a Schrödinger. Gratis, responsive, nel browser.",
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
    description: "118 elementi con atomo 3D WebGL in tempo reale. 5 modelli storici, heatmap fisiche, gratis nel browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Tavola Periodica Interattiva — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function TavolaPeriodica() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": PAGE_URL,
    name: "Tavola Periodica Interattiva 3D",
    alternateName: "Interactive 3D Periodic Table",
    description: metadata.description,
    url: PAGE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: ["it", "en"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    author: {
      "@type": "Person",
      name: site.author.name,
      url: site.url,
    },
    keywords: "tavola periodica, periodic table, atomo 3D, WebGL, chimica, elementi chimici, modelli atomici, Three.js",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Tavola Periodica Interattiva 3D
      </h1>
      <Suspense fallback={<div className="atom-loading">...</div>}>
        <PeriodicTableView locale="it" />
      </Suspense>
    </>
  );
}
