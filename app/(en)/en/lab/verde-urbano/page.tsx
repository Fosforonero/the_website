import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { verdeFontClass } from "@/components/lab/verde-urbano-fonts";
import { VerdeUrbanoView } from "@/components/lab/verde-urbano-view";
import "@/components/lab/verde-urbano.css";

const PAGE_URL = `${site.url}/en/lab/verde-urbano`;
const PAGE_URL_IT = `${site.url}/lab/verde-urbano`;

export const metadata: Metadata = {
  title: "Verde Urbano · A concept app to re-green Rome · Fosforonero Lab",
  description:
    "Installable interactive demo: a concept app to regrow Rome's urban green. Help plant a tree — pick the location and a specific tree or a free amount — or report an area. Works like a native app on Android and iPhone.",
  applicationName: "Verde Urbano",
  manifest: "/lab/verde-urbano/manifest.en.webmanifest",
  appleWebApp: { capable: true, title: "Verde Urbano", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/lab/verde-urbano/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/lab/verde-urbano/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: PAGE_URL,
    languages: {
      en: PAGE_URL,
      it: PAGE_URL_IT,
      "x-default": PAGE_URL_IT,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Verde Urbano · Let's rebuild Rome's green",
    description:
      "A concept app to regrow Rome's urban green: help plant a tree by picking the location (existing or new) and a specific tree or a free amount. Installable interactive demo.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Verde Urbano — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  // Hidden demo: shareable by direct link only, never indexed or listed.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF6EC",
};

export default function VerdeUrbanoEn() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        name: "Verde Urbano — a concept app to re-green Rome",
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: "en",
        primaryImageOfPage: `${site.url}/opengraph-image`,
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#app`,
        name: "Verde Urbano",
        description:
          "Installable interactive demo (PWA) of a civic concept app to regrow Rome's urban green: help plant a tree by choosing the location (existing or new) and a specific tree or a free amount, or report an area.",
        url: PAGE_URL,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web, iOS, Android",
        inLanguage: ["it", "en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "urban green, urban reforestation, civic app, common fund, donations, participatory map, Rome, interactive demo, installable PWA, CO₂, trees",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en` },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Verde Urbano", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={verdeFontClass}>
        <VerdeUrbanoView locale="en" />
      </div>
    </>
  );
}
