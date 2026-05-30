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
    "Interactive periodic table with 3D WebGL atoms. Explore 118 elements and 5 historical models from Thomson to Schrödinger. Free, responsive, in your browser.",
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
    description: "118 elements with real-time 3D WebGL atoms. 5 historical models, physical property heatmaps, free in the browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Interactive Periodic Table — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function TavolaPeriodicaEn() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": PAGE_URL,
    name: "Interactive 3D Periodic Table",
    alternateName: "Tavola Periodica Interattiva 3D",
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
    keywords: "periodic table, 3D atom, WebGL, chemistry, chemical elements, atomic models, Three.js",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Interactive 3D Periodic Table
      </h1>
      <Suspense fallback={<div className="atom-loading">...</div>}>
        <PeriodicTableView locale="en" />
      </Suspense>
    </>
  );
}
