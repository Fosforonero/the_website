import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableAboutView } from "@/components/lab/periodic-table-about-view";

const PAGE_URL = `${site.url}/lab/tavola-periodica/about`;
const PAGE_URL_EN = `${site.url}/en/lab/tavola-periodica/about`;

export const metadata: Metadata = {
  title: "Tavola Periodica Interattiva 3D — About · Fosforonero Lab",
  description:
    "Tavola periodica degli elementi interattiva con visualizzazione 3D WebGL. 118 elementi, 5 modelli atomici storici (Thomson, Rutherford, Bohr, Sommerfeld, quantistico), dark/light mode. Tecnologia, roadmap e fonti scientifiche.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL,
      en: PAGE_URL_EN,
      "x-default": PAGE_URL,
    },
  },
  openGraph: {
    type: "article",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Tavola Periodica Interattiva 3D — About · Fosforonero Lab",
    description: "118 elementi con modello atomico 3D in WebGL. 5 modelli storici da Thomson a Schrödinger, dark/light mode, responsive. Gratis, open, nel browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Tavola Periodica Interattiva — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function AboutTavolaPeriodica() {
  return <PeriodicTableAboutView locale="it" />;
}
