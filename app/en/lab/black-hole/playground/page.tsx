import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHolePlaygroundView } from "@/components/lab/black-hole-playground-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole/playground`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/playground`;

const DESCRIPTION =
  "Black hole playground: drop in planets, stars and comets and watch it capture them. Stars within the tidal radius are torn into a debris stream. Paczyński–Wiita dynamics.";

export const metadata: Metadata = {
  title: "Black Hole · Gravitational playground · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL_IT, en: PAGE_URL, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Black Hole · Gravitational playground",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BlackHolePlayground() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Black Hole · Playground",
        description: DESCRIPTION,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "black hole playground, tidal disruption, Paczynski-Wiita, accretion, relativistic orbits, gravitational simulation",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Black Hole", item: `${site.url}/en/lab/black-hole` },
          { "@type": "ListItem", position: 4, name: "Playground", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Black Hole — Gravitational playground
      </h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHolePlaygroundView locale="en" />
      </Suspense>
    </>
  );
}
