import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHoleView } from "@/components/lab/black-hole-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero`;

const DESCRIPTION =
  "Real-time gravitational lensing of a Schwarzschild black hole: photon geodesics, an accretion disk with relativistic Doppler beaming and gravitational redshift. WebGL, free in the browser.";

export const metadata: Metadata = {
  title: "Black Hole 3D · Schwarzschild gravitational lensing · Fosforonero Lab",
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
    title: "Black Hole 3D · Real-time gravitational lensing",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BlackHolePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": PAGE_URL,
        name: "Black Hole 3D",
        alternateName: "Buco Nero 3D",
        description: DESCRIPTION,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["en", "it"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "black hole 3D, gravitational lensing, photon geodesics, accretion disk, Doppler beaming, gravitational redshift, Schwarzschild WebGL",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Black Hole", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
        Black Hole 3D — Schwarzschild gravitational lensing
      </h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHoleView locale="en" />
      </Suspense>
    </>
  );
}
