import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PeriodicTableManualView } from "@/components/lab/periodic-table-manual-view";

const PAGE_URL = `${site.url}/en/lab/periodic-table/manual`;
const PAGE_URL_IT = `${site.url}/lab/tavola-periodica/manuale`;

export const metadata: Metadata = {
  title: "Interactive 3D Periodic Table Manual",
  description:
    "English manual for the interactive 3D periodic table: element search, thematic views, WebGL atomic models, data panel, controls, and mobile use.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      it: PAGE_URL_IT,
      en: PAGE_URL,
      "x-default": PAGE_URL_IT,
    },
  },
  openGraph: {
    type: "article",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Interactive 3D Periodic Table Manual",
    description:
      "Practical guide to the 3D periodic table: search, thematic views, atomic models, chemical data, and mobile controls.",
    images: [
      {
        url: `${site.url}/blog/tavola-periodica/tavola-periodica-interattiva-3d.png`,
        width: 1200,
        height: 630,
        alt: "Manual for Fosforonero interactive 3D periodic table",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function PeriodicTableManualEn() {
  return <PeriodicTableManualView locale="en" />;
}
