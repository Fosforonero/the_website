import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../globals.css";
import { site } from "@/lib/site";
import { organizationLd, personLd, websiteLd } from "@/lib/jsonld";
import { CookieBanner } from "@/components/client/cookie-banner";

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
    default: `${site.name} — Independent software development`,
    template: `%s · ${site.name}`,
  },
  description: `${site.name} is the umbrella under which ${site.author.name}, a software engineer in Rome, publishes his projects: applications, dashboards and tooling for web and mobile.`,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.url }],
  creator: site.author.name,
  publisher: site.name,
  alternates: {
    canonical: "/en",
    languages: { it: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["it_IT"],
    url: `${site.url}/en`,
    siteName: site.name,
    title: `${site.name} — Independent software development`,
    description: `Independent studio of ${site.author.name}. FitMesh Sync, SplitVote and other projects.`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Independent software development`,
    description: `Independent studio of ${site.author.name}.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  manifest: "/manifest.webmanifest",
};

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  const ld = [websiteLd(), organizationLd(), personLd()];

  return (
    <html lang="en" className={`${sansGrotesk.variable} ${monoJetbrains.variable}`}>
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

        <a href="#main" className="skip-link">Skip to content</a>
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
