// /en/identity — English version of the brand identity page.

import type { Metadata } from "next";
import { IdentityPage } from "@/components/parts/identity-page";
import { breadcrumbLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

const PAGE_DESC =
  "The visual identity of Fosforonero: the P¹⁵ symbol, the origin of the name from black phosphorus (an allotrope of Phosphorus, element 15), palette and typography.";

export const metadata: Metadata = {
  title: "Identity",
  description: PAGE_DESC,
  alternates: {
    canonical: "/en/identity",
    languages: { it: "/identita", en: "/en/identity", "x-default": "/identita" },
  },
  openGraph: {
    title: `Identity — ${site.name}`,
    description: PAGE_DESC,
    url: `${site.url}/en/identity`,
    type: "website",
    locale: "en_US",
  },
};

export default function IdentityRoute() {
  const ld = JSON.stringify(
    breadcrumbLd([
      { name: "Home", url: `${site.url}/en` },
      { name: "Identity", url: `${site.url}/en/identity` },
    ]),
  );

  return (
    <>
      <IdentityPage locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />
    </>
  );
}
