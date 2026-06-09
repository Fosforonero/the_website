import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { SolarSystemView } from "@/components/lab/solar-system-view";

const PAGE_URL = `${site.url}/en/lab/solar-system`;
const PAGE_URL_IT = `${site.url}/lab/sistema-solare`;

export const metadata: Metadata = {
  title: "Solar System 3D · WebGL Observatory · Fosforonero Lab",
  description: "3D solar system simulator with open NASA/JPL data. Planets, moons, comets and asteroids with Keplerian orbits. Real stars from the Hipparcos catalog. Free in your browser.",
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
    title: "Solar System 3D · WebGL Observatory",
    description: "Planets, moons, comets, asteroids and real stars in 3D WebGL. NASA/JPL data, Keplerian orbits.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Solar System 3D — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function SolarSystem() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Solar System 3D",
        alternateName: "Sistema Solare 3D",
        description: metadata.description,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it", "en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords: "solar system simulator, 3D solar system, WebGL orrery, NASA JPL ephemeris, asteroids comets satellites, online astronomy lab",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Solar System", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Solar System 3D
      </h1>
      <Suspense fallback={<div className="solar-loading">...</div>}>
        <SolarSystemView locale="en" />
      </Suspense>
    </>
  );
}
