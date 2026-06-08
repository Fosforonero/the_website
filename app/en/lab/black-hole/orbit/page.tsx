import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHoleOrbitView } from "@/components/lab/black-hole-orbit-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole/orbit`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/orbite`;
const DESCRIPTION =
  "Relativistic orbits around a black hole: the exact Schwarzschild timelike geodesic, periastron precession (like Mercury), the ISCO and the plunge. Interactive WebGL.";

export const metadata: Metadata = {
  title: "Relativistic orbits · Black Hole · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL, languages: { it: PAGE_URL_IT, en: PAGE_URL, "x-default": PAGE_URL_IT } },
  openGraph: { type: "website", locale: "en_US", url: PAGE_URL, siteName: site.name, title: "Relativistic orbits around a black hole", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function OrbitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": PAGE_URL, name: "Relativistic orbits · Black Hole", description: DESCRIPTION, url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: ["en"], offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, author: { "@type": "Person", name: site.author.name, url: site.url }, keywords: "relativistic orbits, Schwarzschild geodesic, periastron precession, ISCO, general relativity, Mercury precession" },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
        { "@type": "ListItem", position: 3, name: "Black Hole", item: `${site.url}/en/lab/black-hole` },
        { "@type": "ListItem", position: 4, name: "Orbits", item: PAGE_URL },
      ] },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>Relativistic orbits around a black hole</h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHoleOrbitView locale="en" />
      </Suspense>
    </>
  );
}
