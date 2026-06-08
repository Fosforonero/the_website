import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleWebGPUView } from "@/components/lab/black-hole-webgpu-view";
import "@/components/lab/black-hole.css";

const PAGE_URL    = `${site.url}/lab/buco-nero/webgpu`;
const PAGE_URL_EN = `${site.url}/en/lab/black-hole/webgpu`;

export const metadata: Metadata = {
  title: "Buco Nero WebGPU · Geodetiche di Kerr · Fosforonero Lab",
  description:
    "Renderer WebGPU nativo del buco nero rotante di Kerr: geodetiche dei fotoni esatte ray-tracciate in tempo reale con la nuova pipeline GPU del browser. Stessa fisica della versione WebGL, API moderna.",
  keywords: [
    "buco nero WebGPU", "simulatore buco nero", "metrica di Kerr", "WebGPU",
    "lensing gravitazionale", "geodetiche fotoni", "disco di accrescimento",
    "relatività generale", "Fosforonero Lab",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: { it: PAGE_URL, en: PAGE_URL_EN, "x-default": PAGE_URL },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: PAGE_URL,
    siteName: site.name,
    title: "Buco Nero WebGPU · Geodetiche di Kerr in tempo reale",
    description:
      "Renderer WebGPU del buco nero di Kerr: geodetiche fotoni esatte, disco di accrescimento con Doppler relativistico. Pipeline GPU moderna direttamente nel browser.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BucoNeroWebGPUPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": PAGE_URL,
    name: "Buco Nero WebGPU",
    description: metadata.description,
    url: PAGE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: ["it"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlackHoleWebGPUView locale="it" />
    </>
  );
}
