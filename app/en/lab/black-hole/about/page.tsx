import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleAboutView } from "@/components/lab/black-hole-about-view";
import "katex/dist/katex.min.css";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole/about`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/about`;

const DESCRIPTION =
  "The equations behind the black hole simulator: exact Kerr null geodesics, an accretion disk with the Page–Thorne flux, gravitational redshift and relativistic beaming. What is physics and what is artistic, with sources.";

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
    a: "Yes for the lensing geometry and the orbits: integrating Schwarzschild geodesics (null and timelike) is exact and reproduces the photon sphere, Einstein ring, shadow, ISCO and periastron precession. GR orbital velocity, redshift, the Liouville invariant and bolometric g⁴ beaming use the exact formulas; the color is the true blackbody color of the local temperature; the photon ring emerges from returning radiation.",
  },
  {
    q: "What is the difference between the Orbits demo and the Playground?",
    a: "The Orbits demo integrates the exact Schwarzschild timelike geodesic for a single body (exact precession and ISCO). The playground uses the Paczyński–Wiita pseudo-Newtonian potential, which reproduces the strong-field effects (ISCO, plunge) but allows mutual N-body gravity — an exactness/interactivity trade-off.",
  },
  {
    q: "Is it identical to Interstellar's black hole?",
    a: "It is the same Kerr metric. The difference is the computation: Interstellar's Gargantua was ray-traced offline (hours per frame), while this simulation integrates the exact Kerr null geodesics in real time in the browser (with the Spin slider). Interstellar's disk is an artistic model too, like ours.",
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
          "black hole, Kerr metric, Schwarzschild metric, photon geodesics, gravitational lensing, accretion disk, Page-Thorne, gravitational redshift, relativistic beaming, ISCO, Binet equation, gravitational waves",
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
