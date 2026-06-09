import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../globals.css";
import { site } from "@/lib/site";
import { organizationLd, personLd, websiteLd } from "@/lib/jsonld";
import { CookieBanner } from "@/components/client/cookie-banner";
import { ScrollFade } from "@/components/client/scroll-fade";

const GA_ID_FALLBACK = "G-K1QTXSDVD8";
const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ||
  (process.env.NODE_ENV === "production" ? GA_ID_FALLBACK : undefined);

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
    languages: { it: "/", en: "/en", "x-default": "/" },
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

export default function ItRootLayout({ children }: { children: React.ReactNode }) {
  const ld = [websiteLd(), organizationLd(), personLd()];

  return (
    <html lang="it" className={`${sansGrotesk.variable} ${monoJetbrains.variable}`}>
      <body suppressHydrationWarning>
        <Script id="ga-consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });`}
        </Script>

        <a href="#main" className="skip-link">Vai al contenuto</a>
        <ScrollFade />
        {children}

        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        <CookieBanner />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </body>
    </html>
  );
}
