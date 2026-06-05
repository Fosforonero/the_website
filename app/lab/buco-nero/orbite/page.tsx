import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHoleOrbitView } from "@/components/lab/black-hole-orbit-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero/orbite`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/orbit`;
const DESCRIPTION =
  "Orbite relativistiche attorno a un buco nero: geodetica di tipo-tempo esatta di Schwarzschild, precessione del periastro (come Mercurio), ISCO e caduta. WebGL interattivo.";

export const metadata: Metadata = {
  title: "Orbite relativistiche · Buco Nero · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL, languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL } },
  openGraph: { type: "website", locale: "it_IT", url: PAGE_URL, siteName: site.name, title: "Orbite relativistiche attorno a un buco nero", description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function OrbitePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": PAGE_URL, name: "Orbite relativistiche · Buco Nero", description: DESCRIPTION, url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Web", inLanguage: ["it"], offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, author: { "@type": "Person", name: site.author.name, url: site.url }, keywords: "orbite relativistiche, geodetica Schwarzschild, precessione del periastro, ISCO, relatività generale, precessione di Mercurio" },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
        { "@type": "ListItem", position: 3, name: "Buco Nero", item: `${site.url}/lab/buco-nero` },
        { "@type": "ListItem", position: 4, name: "Orbite", item: PAGE_URL },
      ] },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>Orbite relativistiche attorno a un buco nero</h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHoleOrbitView locale="it" />
      </Suspense>
    </>
  );
}
