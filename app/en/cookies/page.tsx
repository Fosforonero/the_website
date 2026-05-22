import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { CookieSettingsLink } from "@/components/client/cookie-settings-link";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 86400;

const LAST_UPDATED = "2026-05-22";

export const metadata: Metadata = {
  title: "Cookie Policy — cookies we use",
  description: `List of cookies used by ${site.name} (necessary and Google Analytics 4 analytics in Consent Mode v2), their purpose, duration and how to manage consent.`,
  alternates: {
    canonical: "/en/cookies",
    languages: { it: "/cookies", en: "/en/cookies", "x-default": "/cookies" },
  },
  robots: { index: true, follow: true },
};

export default function CookiesPageEN() {
  const t = getDictionary("en");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav locale="en" />
      <main
        id="main"
        style={{
          flex: 1,
          padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 64px) clamp(64px, 12vw, 120px)",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
          § LEGAL — COOKIES
        </Pill>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(34px, 6vw, 56px)",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "clamp(14px, 2.5vw, 20px) 0 12px",
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
          }}
        >
          {t.legal.cookieTitle}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-dim)",
            margin: "0 0 32px",
            letterSpacing: "0.08em",
          }}
        >
          {t.legal.lastUpdated(LAST_UPDATED)}
        </p>

        <article className="prose">
          <h2>1. What are cookies</h2>
          <p>
            <em>Cookies</em> are small text files that websites store on your device to keep information useful for operation or user experience. Equivalent technologies (e.g. <em>localStorage</em>) are treated the same as cookies under this policy.
          </p>

          <h2>2. Cookies used by {site.name}</h2>
          <p>
            We split cookies in two categories. The first (necessary) is always active because it is required for the site to work. The second (analytics) is activated only after your explicit consent.
          </p>

          <h3>2.1 Necessary (always on)</h3>
          <ul>
            <li>
              <strong><code>fn-cookie-consent-v1</code></strong> — <em>localStorage</em>. Stores your choice on the cookie banner. Without it we couldn’t remember if you accepted or rejected. Duration: persistent on your device until you remove it. Domain: {site.domain}.
            </li>
          </ul>

          <h3>2.2 Analytics (consent required)</h3>
          <p>
            We use <strong>Google Analytics 4</strong> in <em>Consent Mode v2</em>: the cookies below are installed <strong>only after your explicit acceptance</strong> through the banner. Without consent, GA4 sends aggregated signals without persistent identifiers (ping mode).
          </p>
          <ul>
            <li><strong><code>_ga</code></strong> — Google. Anonymised unique identifier. Duration: 24 months. Purpose: distinguishing users.</li>
            <li><strong><code>_ga_&lt;ID&gt;</code></strong> — Google. GA4 session state. Duration: 24 months.</li>
          </ul>

          <h2>3. Managing your preferences</h2>
          <p>
            You can review or change your choice at any time using the button below: the cookie banner will reopen pre-loaded with your current settings.
          </p>
          <p>
            <CookieSettingsLink
              className="fn-link-underline"
              style={{
                color: "var(--color-accent)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Open cookie preferences →
            </CookieSettingsLink>
          </p>

          <h2>4. Managing cookies from your browser</h2>
          <p>All major browsers let you view, delete and block cookies:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" rel="noopener noreferrer" target="_blank">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" rel="noopener noreferrer" target="_blank">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" rel="noopener noreferrer" target="_blank">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge" rel="noopener noreferrer" target="_blank">Microsoft Edge</a></li>
          </ul>

          <h2>5. Google Analytics opt-out</h2>
          <p>
            You can disable GA4 tracking on <strong>all</strong> sites by installing Google’s official browser add-on:{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">tools.google.com/dlpage/gaoptout</a>.
          </p>

          <h2>6. Updates</h2>
          <p>
            If we change the technologies we track or the categories of cookies, we will flag it here and re-prompt the consent banner. The consent schema version ({"v1"}) ensures your choice only applies to the current version.
          </p>

          <hr />
          <p style={{ fontSize: "0.9em", color: "var(--color-dim)" }}>
            <em>For the full discipline of personal data processing, see our Privacy Policy.</em>
          </p>
        </article>
      </main>
      <Footer locale="en" />
    </div>
  );
}
