import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SolarSystemManualView } from "@/components/lab/solar-system-manual-view";

const PAGE_URL = `${site.url}/en/lab/solar-system/manual`;
const PAGE_URL_IT = `${site.url}/lab/sistema-solare/manuale`;
const APP_URL = `${site.url}/en/lab/solar-system`;

export const metadata: Metadata = {
  title: "Manual · Solar System 3D · Fosforonero Lab",
  description:
    "Complete guide to the 3D solar system simulator. How to navigate, use time controls, scale modes, and read the inspector. FAQ included.",
  alternates: {
    canonical: PAGE_URL,
    languages: { en: PAGE_URL, it: PAGE_URL_IT, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Manual · Solar System 3D",
    description: "Complete guide to the 3D solar system simulator.",
    images: [
      {
        url: `${site.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Solar System 3D Manual",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function ManualPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        name: metadata.title,
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: "en",
      },
      {
        "@type": "HowTo",
        name: "How to use the Solar System 3D",
        description: metadata.description,
        step: [
          {
            "@type": "HowToStep",
            name: "Select a celestial body",
            text: "Click on any body in the browser panel or in the 3D scene to view its details in the inspector.",
          },
          {
            "@type": "HowToStep",
            name: "Change the date",
            text: "Use the date picker in the toolbar or press the Now button to return to today's date.",
          },
          {
            "@type": "HowToStep",
            name: "Explore different scales",
            text: "Use the distance and radius scale selectors to compare different views of the solar system.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Are the positions accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Approximate. They are computed from public orbital elements. JPL Horizons precision is coming in a future sprint.",
            },
          },
          {
            "@type": "Question",
            name: "How can I see the inner planets better?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the 'Inner system' scale mode to expand the zone within 2 AU.",
            },
          },
          {
            "@type": "Question",
            name: "Can I add a custom planet?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sandbox mode is on the roadmap for a future sprint.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Solar System", item: APP_URL },
          { "@type": "ListItem", position: 4, name: "Manual", item: PAGE_URL },
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
      <SolarSystemManualView locale="en" />
    </>
  );
}
