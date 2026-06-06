import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleFaqView, FAQ } from "@/components/lab/black-hole-faq-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero/faq`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/faq`;

const DESCRIPTION =
  "Domande frequenti sulla simulazione del buco nero: è una simulazione vera? La massa influenza la griglia spazio-tempo? Lo spin è la metrica di Kerr? Le dimensioni sono in scala? C'è fisica del plasma? Risposte brevi e oneste, con link alle equazioni.";

export const metadata: Metadata = {
  title: "Buco nero · Domande frequenti (FAQ) · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Buco nero · Domande frequenti",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BucoNeroFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        inLanguage: "it",
        url: PAGE_URL,
        mainEntity: FAQ.it.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: "Buco Nero", item: `${site.url}/lab/buco-nero` },
          { "@type": "ListItem", position: 4, name: "FAQ", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlackHoleFaqView locale="it" />
    </>
  );
}
