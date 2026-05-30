import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { SolarSystemView } from "@/components/lab/solar-system-view";
import "@/components/lab/solar-system.css";

const PAGE_URL = `${site.url}/lab/sistema-solare`;
const PAGE_URL_EN = `${site.url}/en/lab/solar-system`;

export const metadata: Metadata = {
  title: "Sistema Solare 3D · Osservatorio WebGL · Fosforonero Lab",
  description: "Simulatore del sistema solare 3D con dati aperti NASA/JPL. Pianeti, lune, comete e asteroidi in tempo reale. Stelle reali da catalogo Hipparcos. Gratis nel browser.",
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
    title: "Sistema Solare 3D · Osservatorio WebGL",
    description: "Pianeti, lune, comete, asteroidi e stelle reali in 3D WebGL. Dati NASA/JPL Horizons.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Sistema Solare 3D — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function SistemaSolare() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Sistema Solare 3D",
        alternateName: "Solar System 3D",
        description: metadata.description,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it", "en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords: "sistema solare 3D, simulatore sistema solare, planetario WebGL, effemeridi NASA JPL, asteroidi comete satelliti, laboratorio astronomia online",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Sistema Solare", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Sistema Solare 3D
      </h1>
      <Suspense fallback={<div className="solar-loading">...</div>}>
        <SolarSystemView locale="it" />
      </Suspense>
    </>
  );
}
