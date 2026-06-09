import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleFaqView } from "@/components/lab/black-hole-faq-view";
import { FAQ } from "@/components/lab/black-hole/faq-data";
import "@/components/lab/black-hole.css";

const PAGE_URL = `${site.url}/en/lab/black-hole/faq`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/faq`;

const DESCRIPTION =
  "FAQ about the black-hole simulator: is it a real simulation? Is the spin the Kerr metric? Are the sizes to scale? Is there plasma physics? Short, honest answers.";

export const metadata: Metadata = {
  title: "Black hole · Frequently asked questions (FAQ)",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
    languages: { en: PAGE_URL, it: PAGE_URL_IT, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Black hole · Frequently asked questions",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BlackHoleFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        inLanguage: "en",
        url: PAGE_URL,
        mainEntity: FAQ.en.map((f) => ({
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
          { "@type": "ListItem", position: 4, name: "FAQ", item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlackHoleFaqView locale="en" />
    </>
  );
}
