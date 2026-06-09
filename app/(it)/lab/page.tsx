import type { Metadata } from "next";
import { LabIndex } from "@/components/lab/lab-index";
import { breadcrumbLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import "@/components/lab/lab-index.css";

const PAGE_URL = `${site.url}/lab`;
const PAGE_URL_EN = `${site.url}/en/lab`;
const DESC =
  "Esperimenti interattivi di Fosforonero: tavola periodica, sistema solare 3D e buco nero relativistico in WebGL. Gratis nel browser, fisica reale dichiarata.";

export const metadata: Metadata = {
  title: "Lab · Esperimenti interattivi",
  description: DESC,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    title: "Fosforonero Lab · Esperimenti interattivi",
    description: DESC,
    url: PAGE_URL,
    type: "website",
    locale: "it_IT",
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export default function LabPage() {
  const ld = JSON.stringify(
    breadcrumbLd([
      { name: "Home", url: site.url },
      { name: "Lab", url: PAGE_URL },
    ]),
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <LabIndex locale="it" />
    </>
  );
}
