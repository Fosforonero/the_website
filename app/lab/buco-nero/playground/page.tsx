import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHolePlaygroundView } from "@/components/lab/black-hole-playground-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero/playground`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/playground`;

const DESCRIPTION =
  "Playground del buco nero: lancia pianeti, stelle e comete e guardalo catturarli. Le stelle entro il raggio mareale vengono disgregate in detriti. Modello di Paczyński–Wiita.";

export const metadata: Metadata = {
  title: "Buco Nero · Playground gravitazionale",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Buco Nero · Playground gravitazionale",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BucoNeroPlayground() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Buco Nero · Playground",
        description: DESCRIPTION,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "playground buco nero, tidal disruption, disgregazione mareale, Paczynski-Wiita, accrescimento, orbite relativistiche, simulazione gravitazionale",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Buco Nero", item: `${site.url}/lab/buco-nero` },
          { "@type": "ListItem", position: 4, name: "Playground", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        Buco Nero — Playground gravitazionale
      </h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHolePlaygroundView locale="it" />
      </Suspense>
    </>
  );
}
