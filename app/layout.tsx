import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { organizationLd, personLd } from "@/lib/jsonld";

// Self-hosted via next/font — zero CLS, no third-party request at runtime.
const sansGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});
const monoJetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-mono-jetbrains",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBFA" },
    { media: "(prefers-color-scheme: dark)", color: "#FBFBFA" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Sviluppo software indipendente`,
    template: `%s · ${site.name}`,
  },
  description: `${site.name} è il nome sotto cui ${site.author.name}, sviluppatore con base a ${site.author.city}, pubblica i suoi progetti: applicazioni, dashboard e strumenti per web e mobile.`,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.url }],
  creator: site.author.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
    languages: {
      it: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    alternateLocale: ["en_US"],
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Sviluppo software indipendente`,
    description: `Studio indipendente di ${site.author.name}. FitMesh Sync, SplitVote e altri progetti.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Sviluppo software indipendente`,
    description: `Studio indipendente di ${site.author.name}.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Site-wide JSON-LD: Organization + Person. Per-page JSON-LD (ItemList,
  // BlogPosting) is rendered inside the corresponding page.tsx.
  const ld = [organizationLd(), personLd()];

  return (
    <html lang="it" className={`${sansGrotesk.variable} ${monoJetbrains.variable}`}>
      <body>
        <a href="#main" className="skip-link">Vai al contenuto</a>
        {children}
        <script
          type="application/ld+json"
          // Inline JSON-LD is the documented Next.js pattern for SEO structured data.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </body>
    </html>
  );
}
