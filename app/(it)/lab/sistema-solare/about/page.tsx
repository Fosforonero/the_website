import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SolarSystemAboutView } from "@/components/lab/solar-system-about-view";

const PAGE_URL    = `${site.url}/lab/sistema-solare/about`;
const PAGE_URL_EN = `${site.url}/en/lab/solar-system/about`;
const APP_URL     = `${site.url}/lab/sistema-solare`;

export const metadata: Metadata = {
  title: "Dati e fonti · Sistema Solare 3D · Fosforonero Lab",
  description:
    "Fonti scientifiche, stack tecnologico, limitazioni e roadmap del simulatore Sistema Solare 3D. Dati aperti NASA/JPL, ESA Hipparcos, OpenNGC.",
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Dati e fonti · Sistema Solare 3D",
    description: "Fonti scientifiche e stack del simulatore Sistema Solare 3D.",
    images: [
      {
        url: `${site.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Dati e fonti · Sistema Solare 3D",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        name: metadata.title as string,
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: "it",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",          item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab",           item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Sistema Solare", item: APP_URL },
          { "@type": "ListItem", position: 4, name: "About",          item: PAGE_URL },
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
      <SolarSystemAboutView locale="it" />
    </>
  );
}
