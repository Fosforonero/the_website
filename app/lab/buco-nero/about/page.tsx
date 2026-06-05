import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleAboutView } from "@/components/lab/black-hole-about-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero/about`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/about`;

const DESCRIPTION =
  "Le equazioni della simulazione del buco nero: geodetiche dei fotoni nella metrica di Schwarzschild, disco di accrescimento di Shakura–Sunyaev, redshift gravitazionale e beaming relativistico. Cosa è fisicamente corretto e cosa è artistico, con fonti e crediti.";

export const metadata: Metadata = {
  title: "Buco nero: equazioni, fisica e crediti · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "article",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Buco nero: la fisica dietro la simulazione",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const FAQ = [
  {
    q: "Le equazioni usate sono reali e corrette?",
    a: "Sì per la geometria del lensing: l'integrazione delle geodetiche nulle nella metrica di Schwarzschild è fisica vera e riproduce correttamente sfera fotonica, anello di Einstein e ombra. Redshift gravitazionale, velocità orbitale GR e beaming relativistico usano le formule esatte. Il colore del disco è il vero corpo nero della temperatura locale.",
  },
  {
    q: "È identica al buco nero di Interstellar?",
    a: "No. Interstellar (Gargantua) usa la metrica di Kerr di un buco nero rotante, calcolata offline. Questa simulazione è di Schwarzschild (non rotante) e gira in tempo reale nel browser.",
  },
  {
    q: "Cosa è artistico e non fisico?",
    a: "La turbolenza del disco, le stelle di sfondo e le scale assolute di luminosità e temperatura sono parametri visivi. Il profilo radiale, il colore di corpo nero e gli effetti relativistici sono invece fisicamente fondati.",
  },
];

export default function BucoNeroAbout() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": PAGE_URL,
        headline: "Buco nero: la fisica dietro la simulazione",
        description: DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "it",
        author: { "@type": "Person", name: site.author.name, url: site.url },
        publisher: { "@type": "Organization", name: site.name, url: site.url },
        about: [
          "Metrica di Schwarzschild",
          "Lensing gravitazionale",
          "Disco di accrescimento",
          "Redshift gravitazionale",
          "Relatività generale",
        ],
        keywords:
          "buco nero, metrica di Schwarzschild, geodetiche dei fotoni, lensing gravitazionale, disco di accrescimento, Shakura-Sunyaev, redshift gravitazionale, beaming relativistico, ISCO, equazione di Binet",
        citation: [
          "Shakura & Sunyaev (1973), Astronomy & Astrophysics 24, 337",
          "James, von Tunzelmann, Franklin & Thorne (2015), Classical and Quantum Gravity 32, 065001",
          "Misner, Thorne & Wheeler, Gravitation (1973)",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((f) => ({
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
          { "@type": "ListItem", position: 4, name: "Equazioni e crediti", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlackHoleAboutView locale="it" />
    </>
  );
}
