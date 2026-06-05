import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleAboutView } from "@/components/lab/black-hole-about-view";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole/about`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/about`;

const DESCRIPTION =
  "The equations behind the black-hole simulation: photon geodesics in the Schwarzschild metric, a Shakura–Sunyaev accretion disk, gravitational redshift and relativistic beaming. What is physically correct and what is artistic, with sources and credits.";

export const metadata: Metadata = {
  title: "Black hole: equations, physics & credits · Fosforonero Lab",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL_IT, en: PAGE_URL, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "article",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Black hole: the physics behind the simulation",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const FAQ = [
  {
    q: "Are the equations used real and correct?",
    a: "Yes for the lensing geometry: integrating null geodesics in the Schwarzschild metric is real physics and correctly reproduces the photon sphere, Einstein ring and shadow. Gravitational redshift, GR orbital velocity and relativistic beaming use the exact formulas. The disk color is the true blackbody color of the local temperature.",
  },
  {
    q: "Is it identical to Interstellar's black hole?",
    a: "No. Interstellar (Gargantua) uses the Kerr metric of a rotating black hole, computed offline. This simulation is Schwarzschild (non-rotating) and runs in real time in the browser.",
  },
  {
    q: "What is artistic rather than physical?",
    a: "The disk turbulence, the background stars and the absolute brightness/temperature scales are visual parameters. The radial profile, the blackbody color and the relativistic effects are physically grounded.",
  },
];

export default function BlackHoleAbout() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": PAGE_URL,
        headline: "Black hole: the physics behind the simulation",
        description: DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "en",
        author: { "@type": "Person", name: site.author.name, url: site.url },
        publisher: { "@type": "Organization", name: site.name, url: site.url },
        about: [
          "Schwarzschild metric",
          "Gravitational lensing",
          "Accretion disk",
          "Gravitational redshift",
          "General relativity",
        ],
        keywords:
          "black hole, Schwarzschild metric, photon geodesics, gravitational lensing, accretion disk, Shakura-Sunyaev, gravitational redshift, relativistic beaming, ISCO, Binet equation",
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
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/en/lab` },
          { "@type": "ListItem", position: 3, name: "Black Hole", item: `${site.url}/en/lab/black-hole` },
          { "@type": "ListItem", position: 4, name: "Equations & credits", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlackHoleAboutView locale="en" />
    </>
  );
}
