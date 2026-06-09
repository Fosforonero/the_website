import type { Metadata } from "next";
import { LabIndex } from "@/components/lab/lab-index";
import { breadcrumbLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import "@/components/lab/lab-index.css";

const PAGE_URL = `${site.url}/en/lab`;
const PAGE_URL_IT = `${site.url}/lab`;
const DESC =
  "Fosforonero's interactive experiments: periodic table, 3D solar system and a relativistic black hole in WebGL. Free in the browser, real physics disclosed.";

export const metadata: Metadata = {
  title: "Lab · Interactive experiments",
  description: DESC,
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL_IT, en: PAGE_URL, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    title: "Fosforonero Lab · Interactive experiments",
    description: DESC,
    url: PAGE_URL,
    type: "website",
    locale: "en_US",
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export default function EnLabPage() {
  const ld = JSON.stringify(
    breadcrumbLd([
      { name: "Home", url: site.url },
      { name: "Lab", url: PAGE_URL },
    ]),
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <LabIndex locale="en" />
    </>
  );
}
