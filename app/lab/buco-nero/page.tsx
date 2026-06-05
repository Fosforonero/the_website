import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { BlackHoleView } from "@/components/lab/black-hole-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero`;

export const metadata: Metadata = {
  title: "Buco Nero 3D · Lensing gravitazionale Schwarzschild · Fosforonero Lab",
  description:
    "Simulazione in tempo reale del lensing gravitazionale di un buco nero di Schwarzschild: geodetiche dei fotoni, disco di accrescimento con beaming Doppler e redshift gravitazionale. WebGL, gratis nel browser.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Buco Nero 3D · Lensing gravitazionale in tempo reale",
    description:
      "Geodetiche dei fotoni in spazio-tempo curvo, disco di accrescimento con effetti relativistici. Approssimazione real-time (non il render Kerr di Interstellar).",
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
        name: "Buco Nero 3D",
        alternateName: "Black Hole 3D",
        description: metadata.description,
        url: PAGE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "buco nero 3D, lensing gravitazionale, geodetiche fotoni, disco di accrescimento, beaming Doppler, redshift gravitazionale, Schwarzschild WebGL",
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
        Buco Nero 3D — Lensing gravitazionale Schwarzschild
      </h1>
      <Suspense fallback={<div className="bh-loading">…</div>}>
        <BlackHoleView locale="it" />
      </Suspense>
    </>
  );
}
