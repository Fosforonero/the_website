import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 86400;

const LAST_UPDATED = "2026-05-22";

export const metadata: Metadata = {
  title: "Privacy Policy — GDPR notice",
  description: `How ${site.name} (${site.author.name}) processes personal data under the EU GDPR (Regulation 2016/679): what we collect, purposes, legal basis and your rights.`,
  alternates: {
    canonical: "/en/privacy",
    languages: { it: "/privacy", en: "/en/privacy", "x-default": "/privacy" },
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPageEN() {
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
          § LEGAL — PRIVACY NOTICE
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
          {t.legal.privacyTitle}
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
          <h2>1. Data controller</h2>
          <p>
            The data controller is <strong>{site.author.name}</strong>, an independent software developer operating under the studio name <strong>{site.name}</strong>, based in {site.author.city}, Italy.
            Contact: <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>2. Personal data we process</h2>
          <p>We process the following categories of personal data:</p>
          <ul>
            <li>
              <strong>Browsing data</strong>: IP address, user agent, requested page, referrer, timestamp. Automatically recorded by our hosting provider (Vercel) for security and technical diagnostics. Retention: up to 30 days.
            </li>
            <li>
              <strong>Aggregate audience data</strong> via Google Analytics 4, activated only after your explicit consent. Includes: pages viewed, session duration, device, language, anonymised IP (the last octets are truncated by Google). Retention: 14 months.
            </li>
            <li>
              <strong>Email correspondence</strong>: if you write to {site.email}, we keep the content of your email for as long as necessary to reply and meet documentation obligations (up to 24 months).
            </li>
          </ul>

          <h2>3. Purposes of processing</h2>
          <ul>
            <li>To provide and operate the website and its content.</li>
            <li>To ensure the technical security of our systems (abuse mitigation, fraud prevention).</li>
            <li>To measure audience in aggregate form to improve the site (analytics).</li>
            <li>To reply to your requests when you contact us by email.</li>
          </ul>

          <h2>4. Legal basis</h2>
          <ul>
            <li><strong>Technical logs</strong>: GDPR Art. 6(1)(f) — legitimate interest of the controller in security and diagnostics.</li>
            <li><strong>Analytics</strong>: GDPR Art. 6(1)(a) — consent of the data subject, collected via the cookie banner and revocable at any time from “Cookie preferences” in the footer.</li>
            <li><strong>Email correspondence</strong>: GDPR Art. 6(1)(b) — performance of pre-contractual measures at your request.</li>
          </ul>

          <h2>5. Data recipients</h2>
          <p>Data may be processed by the following entities, acting as data processors:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> (hosting + CDN) — <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">Vercel Privacy Policy</a></li>
            <li><strong>Google Ireland Ltd / Google LLC</strong> (Google Analytics 4, only with consent) — <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">Google Privacy Policy</a></li>
            <li><strong>Namecheap, Inc.</strong> (domain registration + email forwarding) — <a href="https://www.namecheap.com/legal/general/privacy-policy/" rel="noopener noreferrer" target="_blank">Namecheap Privacy Policy</a></li>
          </ul>

          <h2>6. Non-EU transfers</h2>
          <p>
            Some providers (Vercel, Google, Namecheap) are based in the United States. Transfers occur under the European Commission’s <em>Standard Contractual Clauses</em> (decision 2021/914) and, where applicable, under the <em>EU-US Data Privacy Framework</em> certification.
          </p>

          <h2>7. Retention period</h2>
          <p>Data is retained for the time strictly necessary to the purposes for which it is collected, and in any case no longer than the limits stated in section 2.</p>

          <h2>8. Your rights</h2>
          <p>Under GDPR Articles 15-22 you have the right to:</p>
          <ul>
            <li>Access your personal data and obtain a copy (Art. 15).</li>
            <li>Request rectification if inaccurate (Art. 16).</li>
            <li>Request erasure (Art. 17).</li>
            <li>Request restriction of processing (Art. 18).</li>
            <li>Receive your data in a structured format and port it elsewhere (Art. 20).</li>
            <li>Object to processing based on legitimate interest (Art. 21).</li>
            <li>Withdraw consent at any time, without affecting the lawfulness of processing based on consent before its withdrawal.</li>
          </ul>
          <p>To exercise your rights, write to <a href={`mailto:${site.email}`}>{site.email}</a>. We will reply within 30 days.</p>

          <h2>9. Complaint to the supervisory authority</h2>
          <p>
            You also have the right to lodge a complaint with the Italian data protection authority, the <strong>Garante per la protezione dei dati personali</strong> (<a href="https://www.garanteprivacy.it" rel="noopener noreferrer" target="_blank">garanteprivacy.it</a>), if you believe the processing infringes the GDPR.
          </p>

          <h2>10. Changes</h2>
          <p>We may update this notice to reflect regulatory or operational changes. The current version is always available at this URL, with the last-updated date.</p>

          <hr />
          <p style={{ fontSize: "0.9em", color: "var(--color-dim)" }}>
            <em>This page summarises our data processing practices. It is not legal advice; for specific questions consult a qualified professional.</em>
          </p>
        </article>
      </main>
      <Footer locale="en" />
    </div>
  );
}
