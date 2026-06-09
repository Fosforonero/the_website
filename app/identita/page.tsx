// /identita — pagina pubblica "Identità del marchio".
// Sostituisce il vecchio /lab/p15 (rimosso). Indicizzabile, linkata da Nav,
// Footer e Coming Soon. Spiega il sistema visivo del progetto (V0 + V6,
// palette, tipografia) e l'origine del nome (fosforo nero).
//
// JSON-LD: eredita WebSite + Organization + Person dal root layout, qui
// aggiungiamo BreadcrumbList per migliorare la rappresentazione nella SERP.

import type { Metadata } from "next";
import { IdentityPage } from "@/components/parts/identity-page";
import { breadcrumbLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

const PAGE_DESC =
  "L'identità visiva di Fosforonero: il simbolo P¹⁵, l'origine del nome dal fosforo nero (allotropo del Fosforo, elemento 15), palette e tipografia.";

export const metadata: Metadata = {
  title: "Identità visiva · simbolo P¹⁵ e brand",
  description: PAGE_DESC,
  alternates: {
    canonical: "/identita",
    languages: { it: "/identita", en: "/en/identity", "x-default": "/identita" },
  },
  openGraph: {
    title: `Identità — ${site.name}`,
    description: PAGE_DESC,
    url: `${site.url}/identita`,
    type: "website",
    locale: "it_IT",
  },
};

export default function IdentitaPage() {
  const ld = JSON.stringify(
    breadcrumbLd([
      { name: "Home", url: site.url },
      { name: "Identità", url: `${site.url}/identita` },
    ]),
  );

  return (
    <>
      <IdentityPage locale="it" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />
    </>
  );
}
