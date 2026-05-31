import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableManualView } from "@/components/lab/periodic-table-manual-view";

const PAGE_URL = `${site.url}/lab/tavola-periodica/manuale`;
const PAGE_URL_EN = `${site.url}/en/lab/periodic-table/manual`;

export const metadata: Metadata = {
  title: "Manuale Tavola Periodica 3D interattiva",
  description:
    "Manuale in italiano della tavola periodica 3D: ricerca elementi, viste tematiche, modelli atomici WebGL, pannello dati, controlli e uso mobile.",
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
    title: "Manuale Tavola Periodica 3D interattiva",
    description:
      "Guida pratica alla tavola periodica 3D: ricerca, viste tematiche, modelli atomici, dati chimici e controlli mobile.",
    images: [
      {
        url: `${site.url}/blog/tavola-periodica/tavola-periodica-interattiva-3d.png`,
        width: 1200,
        height: 630,
        alt: "Manuale della Tavola Periodica Interattiva 3D di Fosforonero",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function ManualeTavolaPeriodica() {
  return <PeriodicTableManualView locale="it" />;
}
