import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SolarSystemAboutView } from "@/components/lab/solar-system-about-view";

const PAGE_URL    = `${site.url}/en/lab/solar-system/about`;
const PAGE_URL_IT = `${site.url}/lab/sistema-solare/about`;
const APP_URL     = `${site.url}/en/lab/solar-system`;

export const metadata: Metadata = {
  title: "Data & Sources · Solar System 3D · Fosforonero Lab",
  description:
    "Scientific sources, technical stack, limitations and roadmap of the Solar System 3D simulator. Open data from NASA/JPL, ESA Hipparcos, OpenNGC.",
  alternates: {
    canonical: PAGE_URL,
    languages: { en: PAGE_URL, it: PAGE_URL_IT, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Data & Sources · Solar System 3D",
    description: "Scientific sources and stack of the Solar System 3D simulator.",
    images: [
      {
        url: `${site.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Data & Sources · Solar System 3D",
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
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",         item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab",          item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Solar System", item: APP_URL },
          { "@type": "ListItem", position: 4, name: "About",        item: PAGE_URL },
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
      <SolarSystemAboutView locale="en" />
    </>
  );
}
