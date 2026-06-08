import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BlackHoleWebGPUView } from "@/components/lab/black-hole-webgpu-view";
import "@/components/lab/black-hole.css";

const PAGE_URL    = `${site.url}/en/lab/black-hole/webgpu`;
const PAGE_URL_IT = `${site.url}/lab/buco-nero/webgpu`;

export const metadata: Metadata = {
  title: "Black Hole WebGPU · Kerr Geodesics · Fosforonero Lab",
  description:
    "Native WebGPU renderer for the rotating Kerr black hole: exact photon geodesics ray-traced in real time using the browser's modern GPU pipeline. Same physics as the WebGL version, new API.",
  keywords: [
    "black hole WebGPU", "black hole simulator", "Kerr metric", "WebGPU",
    "gravitational lensing", "photon geodesics", "accretion disk",
    "general relativity", "Fosforonero Lab",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: { en: PAGE_URL, it: PAGE_URL_IT, "x-default": PAGE_URL_IT },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: PAGE_URL,
    siteName: site.name,
    title: "Black Hole WebGPU · Real-time Kerr Geodesics",
    description:
      "WebGPU renderer for the Kerr black hole: exact photon geodesics, accretion disk with relativistic Doppler. Modern GPU pipeline directly in the browser.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function BlackHoleWebGPUPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": PAGE_URL,
    name: "Black Hole WebGPU",
    description: metadata.description,
    url: PAGE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: ["en"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlackHoleWebGPUView locale="en" />
    </>
  );
}
