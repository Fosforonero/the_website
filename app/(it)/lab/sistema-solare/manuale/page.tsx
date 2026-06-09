import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SolarSystemManualView } from "@/components/lab/solar-system-manual-view";

const PAGE_URL = `${site.url}/lab/sistema-solare/manuale`;
const PAGE_URL_EN = `${site.url}/en/lab/solar-system/manual`;
const APP_URL = `${site.url}/lab/sistema-solare`;

export const metadata: Metadata = {
  title: "Manuale · Sistema Solare 3D · Fosforonero Lab",
  description:
    "Guida completa al simulatore del sistema solare 3D. Come navigare, usare i controlli del tempo, le scale e leggere l'ispettore. FAQ inclusa.",
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Manuale Sistema Solare 3D",
    description: "Guida completa al simulatore del sistema solare 3D.",
    images: [
      {
        url: `${site.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Manuale Sistema Solare 3D",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function ManualePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": PAGE_URL,
        name: metadata.title,
        description: metadata.description,
        url: PAGE_URL,
        inLanguage: "it",
      },
      {
        "@type": "HowTo",
        name: "Come usare il Sistema Solare 3D",
        description: metadata.description,
        step: [
          {
            "@type": "HowToStep",
            name: "Seleziona un corpo celeste",
            text: "Fai clic su qualsiasi corpo nel browser o nella scena 3D per visualizzarne i dettagli nell'ispettore.",
          },
          {
            "@type": "HowToStep",
            name: "Cambia la data",
            text: "Usa il selettore di data nella barra degli strumenti o premi il pulsante Adesso per tornare alla data odierna.",
          },
          {
            "@type": "HowToStep",
            name: "Esplora scale diverse",
            text: "Usa i selettori di scala distanza e raggio per confrontare diverse visualizzazioni del sistema solare.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Le posizioni sono accurate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Approssimate. Sono calcolate da elementi orbitali pubblici. La precisione JPL Horizons è in arrivo.",
            },
          },
          {
            "@type": "Question",
            name: "Come posso vedere meglio i pianeti interni?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Usa la modalità scala 'Sistema interno' per espandere la zona entro 2 AU.",
            },
          },
          {
            "@type": "Question",
            name: "Posso aggiungere un pianeta personalizzato?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La modalità sandbox è in roadmap per un futuro sprint.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Sistema Solare", item: APP_URL },
          { "@type": "ListItem", position: 4, name: "Manuale", item: PAGE_URL },
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
      <SolarSystemManualView locale="it" />
    </>
  );
}
