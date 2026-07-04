import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { verdeFontClass } from "@/components/lab/verde-urbano-fonts";
import { VerdeUrbanoView } from "@/components/lab/verde-urbano-view";
import "@/components/lab/verde-urbano.css";

const PAGE_URL = `${site.url}/lab/verde-urbano`;
const PAGE_URL_EN = `${site.url}/en/lab/verde-urbano`;

export const metadata: Metadata = {
  title: "Verde Urbano · App concept per rinverdire Roma · Fosforonero Lab",
  description:
    "Demo interattiva e installabile: un'app concept per rigenerare il verde di Roma. Aiuta a piantare un albero — scegli il luogo e un albero specifico o un importo libero — oppure segnala un'area. Funziona come un'app nativa su Android e iPhone.",
  applicationName: "Verde Urbano",
  manifest: "/lab/verde-urbano/manifest.it.webmanifest",
  appleWebApp: { capable: true, title: "Verde Urbano", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/lab/verde-urbano/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/lab/verde-urbano/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL,
      en: PAGE_URL_EN,
      "x-default": PAGE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Verde Urbano · Ricostruiamo il verde di Roma",
    description:
      "Un'app concept per rigenerare il verde urbano di Roma: aiuta a piantare un albero indicando il luogo (esistente o nuovo) e un albero specifico o un importo libero. Demo interattiva installabile.",
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

export default function VerdeUrbano() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        name: "Verde Urbano — app concept per rinverdire Roma",
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: "it",
        primaryImageOfPage: `${site.url}/opengraph-image`,
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#app`,
        name: "Verde Urbano",
        description:
          "Demo interattiva e installabile (PWA) di un'app concept civica per rigenerare il verde urbano di Roma: si aiuta a piantare un albero scegliendo il luogo (esistente o nuovo) e un albero specifico o un importo libero, oppure si segnala un'area.",
        url: PAGE_URL,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web, iOS, Android",
        inLanguage: ["it", "en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: { "@type": "Person", name: site.author.name, url: site.url },
        keywords:
          "verde urbano, riforestazione urbana, app civica, fondo comune, donazioni, mappa partecipata, Roma, demo interattiva, PWA installabile, CO₂, alberi",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Verde Urbano", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={verdeFontClass}>
        <VerdeUrbanoView locale="it" />
      </div>
    </>
  );
}
