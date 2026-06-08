import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHoleView } from "@/components/lab/black-hole-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole`;

export const metadata: Metadata = {
  title: "Simulatore Buco Nero 3D · Kerr in tempo reale · Fosforonero Lab",
  description:
    "Simulatore di buco nero rotante (Kerr) in tempo reale: lensing gravitazionale reale, disco di accrescimento con Doppler e redshift, ombra e photon ring. La fisica del Gargantua di Interstellar, interattiva e gratis.",
  keywords: [
    "simulatore buco nero", "buco nero 3D", "buco nero rotante", "metrica di Kerr",
    "lensing gravitazionale", "disco di accrescimento", "Gargantua Interstellar",
    "photon ring", "onde gravitazionali", "relatività generale", "WebGL",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Simulatore di Buco Nero 3D · Kerr in tempo reale",
    description:
      "Lensing gravitazionale reale di un buco nero rotante (Kerr): geodetiche dei fotoni ray-tracciate in tempo reale, disco di accrescimento relativistico, onde gravitazionali. Come il Gargantua di Interstellar, interattivo nel browser.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BucoNeroPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Simulatore di Buco Nero 3D",
        alternateName: "Black Hole 3D Simulator",
        description: metadata.description,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "simulatore buco nero, buco nero 3D, buco nero rotante, metrica di Kerr, lensing gravitazionale, disco di accrescimento, Gargantua Interstellar, photon ring, onde gravitazionali, relatività generale, WebGL",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Buco Nero", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        Simulatore di Buco Nero 3D — lensing gravitazionale e metrica di Kerr in tempo reale
      </h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHoleView locale="it" />
      </Suspense>
    </>
  );
}
