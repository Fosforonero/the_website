import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleAboutView } from "@/components/lab/black-hole-about-view";
import "katex/dist/katex.min.css";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/lab/buco-nero/about`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/about`;

const DESCRIPTION =
  "Le equazioni del simulatore di buco nero: geodetiche nulle esatte di Kerr, disco di accrescimento con flusso di Page–Thorne, redshift gravitazionale e beaming. Cosa è fisica e cosa è artistico, con fonti.";

export const metadata: Metadata = {
  title: "Buco nero: equazioni, fisica e crediti",
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
    a: "Sì per la geometria del lensing e per le orbite: l'integrazione delle geodetiche di Schwarzschild (nulle e di tipo-tempo) è esatta e riproduce sfera fotonica, anello di Einstein, ombra, ISCO e precessione del periastro. Velocità orbitale GR, redshift, invariante di Liouville e beaming bolometrico g⁴ usano le formule esatte; il colore è il vero corpo nero della temperatura locale; il photon ring emerge dalla returning radiation.",
  },
  {
    q: "Qual è la differenza tra la demo «Orbite» e il «Playground»?",
    a: "La demo «Orbite» integra la geodetica di tipo-tempo esatta di Schwarzschild per un singolo corpo (precessione e ISCO esatti). Il playground usa il potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce gli effetti forti (ISCO, caduta) ma permette la gravità reciproca a N-corpi — un compromesso esattezza/interattività.",
  },
  {
    q: "È identica al buco nero di Interstellar?",
    a: "È la stessa metrica di Kerr. La differenza è il calcolo: il Gargantua di Interstellar è stato ray-tracciato offline (ore per fotogramma), mentre questa simulazione integra le geodetiche nulle esatte di Kerr in tempo reale nel browser (con lo slider Spin). Anche il disco di Interstellar è un modello artistico, come il nostro.",
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
          "buco nero, metrica di Kerr, metrica di Schwarzschild, geodetiche dei fotoni, lensing gravitazionale, disco di accrescimento, Page-Thorne, redshift gravitazionale, beaming relativistico, ISCO, equazione di Binet, onde gravitazionali",
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
