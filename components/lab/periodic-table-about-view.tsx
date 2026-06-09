import Link from "next/link";
import { site, type Locale } from "@/lib/site";
import { ABOUT_TRANSLATIONS } from "@/lib/elements-i18n";

export type AboutViewProps = {
  locale: Locale;
};

export function PeriodicTableAboutView({ locale }: AboutViewProps) {
  const t = ABOUT_TRANSLATIONS[locale];

  const PAGE_URL = locale === "en" ? `${site.url}/en/lab/periodic-table/about` : `${site.url}/lab/tavola-periodica/about`;
  const APP_URL  = locale === "en" ? `${site.url}/en/lab/periodic-table` : `${site.url}/lab/tavola-periodica`;
  const MANUAL_URL = locale === "en" ? "/en/lab/periodic-table/manual" : "/lab/tavola-periodica/manuale";

  const PROJECTS = [
    {
      name: "FitMesh Sync",
      handle: "fitmesh.fit",
      url: "https://www.fitmesh.fit",
      desc: locale === "it"
        ? "Sincronizzazione wearable e dashboard salute personale. Android + Galaxy Watch + Wear OS."
        : "Wearable synchronization and personal health dashboard. Android + Galaxy Watch + Wear OS.",
      brand: "#22c55e",
      status: "LIVE",
    },
    {
      name: "SplitVote",
      handle: "splitvote.io",
      url: "https://splitvote.io",
      desc: locale === "it"
        ? "Voto e sondaggi per gruppi, senza registrazione né account. Privacy-first."
        : "Voting and polls for groups, with no registration or account. Privacy-first.",
      brand: "#c084fc",
      status: "LIVE",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": APP_URL,
        name: locale === "en" ? "Interactive Periodic Table 3D" : "Tavola Periodica Interattiva",
        alternateName: locale === "en" ? "Tavola Periodica Interattiva" : "Interactive Periodic Table 3D",
        description: t.heroLead,
        url: APP_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        inLanguage: ["it", "en"],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: {
          "@type": "Person",
          name: site.author.name,
          url: site.url,
        },
        keywords:
          locale === "en"
            ? "periodic table, 3D WebGL, atom, electron shell, Bohr model, chemistry, chemical elements, Three.js"
            : "tavola periodica, periodic table, 3D WebGL, atomo, electron shell, Bohr model, chimica, elementi chimici, Three.js",
      },
      {
        "@type": "TechArticle",
        "@id": PAGE_URL,
        headline: locale === "en"
          ? "Interactive Periodic Table 3D: technology, sources and scientific honesty"
          : "Tavola Periodica 3D interattiva: tecnologia, fonti e onestà scientifica",
        description: t.heroLead,
        url: PAGE_URL,
        inLanguage: locale,
        author: { "@type": "Person", name: site.author.name, url: site.url },
        publisher: { "@type": "Organization", name: site.name, url: site.url },
        about: locale === "en"
          ? ["Periodic table", "Atomic models", "Atomic orbitals", "Quantum mechanics", "Chemistry"]
          : ["Tavola periodica", "Modelli atomici", "Orbitali atomici", "Meccanica quantistica", "Chimica"],
        keywords: locale === "en"
          ? "periodic table, 3D WebGL, atomic models, Bohr model, Sommerfeld, hydrogen-like orbitals, electron configuration, quantum numbers, chemistry, chemical elements, Three.js"
          : "tavola periodica, 3D WebGL, modelli atomici, modello di Bohr, Sommerfeld, orbitali idrogenoidi, configurazione elettronica, numeri quantici, chimica, elementi chimici, Three.js",
        citation: [
          "IUPAC (2021), Standard Atomic Weights",
          "NIST Chemistry WebBook, SRD 69",
          "PubChem, NIH/NLM",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: t.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",             item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab",              item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: locale === "en" ? "Periodic Table" : "Tavola Periodica", item: APP_URL },
          { "@type": "ListItem", position: 4, name: "About",            item: PAGE_URL },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .ab {
          min-height: 100dvh;
          background: #0c0c18;
          color: #c8c8d8;
          font-family: var(--font-mono, ui-monospace, monospace);
          padding: 0 0 80px;
        }
        .ab-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(12,12,24,0.94);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .ab-nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ab-nav-back {
          font-family: inherit;
          font-size: 11px;
          color: rgba(200,200,216,0.60);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.16);
          padding: 5px 13px;
          border-radius: 999px;
          transition: color .15s, border-color .15s;
        }
        .ab-nav-back:hover { color: #eeeef8; border-color: rgba(255,255,255,0.30); }
        .ab-nav-brand {
          font-size: 11px;
          color: rgba(200,200,216,0.35);
          letter-spacing: 0.08em;
          text-decoration: none;
        }
        .ab-nav-brand:hover { color: rgba(200,200,216,0.65); }

        .ab-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 24px 0;
        }

        /* Hero */
        .ab-hero-tag {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(200,200,216,0.38);
          margin: 0 0 12px;
        }
        .ab-hero-title {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 300;
          line-height: 1.15;
          color: #eeeef8;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .ab-hero-title em { font-style: italic; color: rgba(238,238,248,0.42); }
        .ab-hero-lead {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(200,200,216,0.70);
          margin: 0 0 48px;
          max-width: 600px;
        }

        /* Section headings */
        .ab-section { margin: 0 0 56px; }
        .ab-section-title {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(200,200,216,0.35);
          margin: 0 0 20px;
          text-transform: uppercase;
          font-weight: normal;
        }

        /* FAQ */
        .ab-faq { display: flex; flex-direction: column; gap: 10px; }
        .ab-faq-item {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          padding: 0 16px;
        }
        .ab-faq-q {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          color: #eeeef8;
          padding: 14px 0;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .ab-faq-q::-webkit-details-marker { display: none; }
        .ab-faq-q::after {
          content: "+";
          color: rgba(200,200,216,0.45);
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
        }
        .ab-faq-item[open] .ab-faq-q::after { content: "−"; }
        .ab-faq-a {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(200,200,216,0.72);
          margin: 0;
          padding: 0 0 16px;
        }

        /* Stack list */
        .ab-stack {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ab-stack li {
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-size: 13px;
        }
        .ab-stack-name {
          color: #eeeef8;
          white-space: nowrap;
          min-width: 220px;
        }
        .ab-stack-name a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.18);
          transition: border-color .12s;
        }
        .ab-stack-name a:hover { border-color: rgba(238,238,248,0.55); }
        .ab-stack-desc { color: rgba(200,200,216,0.50); }

        /* Sources list */
        .ab-sources {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ab-sources li { font-size: 13px; line-height: 1.5; }
        .ab-sources a {
          color: #eeeef8;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.18);
          transition: border-color .12s;
        }
        .ab-sources a:hover { border-color: rgba(238,238,248,0.55); }
        .ab-sources-desc {
          display: block;
          color: rgba(200,200,216,0.45);
          font-size: 11px;
          margin-top: 3px;
        }

        /* Roadmap */
        .ab-roadmap {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ab-roadmap li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        .ab-roadmap-dot {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid;
          margin-top: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
        }
        .ab-roadmap-dot--done {
          border-color: #22c55e;
          color: #22c55e;
          background: rgba(34,197,94,0.10);
        }
        .ab-roadmap-dot--todo {
          border-color: rgba(200,200,216,0.22);
          color: rgba(200,200,216,0.22);
        }
        .ab-roadmap-text--done { color: rgba(200,200,216,0.65); }
        .ab-roadmap-text--todo { color: rgba(200,200,216,0.35); }

        /* Support / Ko-fi */
        .ab-support {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 32px;
        }
        .ab-support-text {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 15px;
          line-height: 1.7;
          color: rgba(200,200,216,0.70);
          margin: 0 0 24px;
        }
        .ab-support-text strong { color: #eeeef8; font-weight: 500; }
        .ab-kofi-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ff5e5b;
          color: #fff;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          font-weight: 500;
          padding: 11px 22px;
          border-radius: 999px;
          text-decoration: none;
          transition: background .15s, transform .1s;
        }
        .ab-kofi-btn:hover { background: #ff3a37; transform: translateY(-1px); }

        /* Projects grid */
        .ab-projects {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .ab-project-card {
          display: block;
          padding: 20px 22px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          text-decoration: none;
          transition: background .15s, border-color .15s;
        }
        .ab-project-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
        }
        .ab-project-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 8px;
        }
        .ab-project-name {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          font-weight: 500;
          color: #eeeef8;
        }
        .ab-project-status {
          font-size: 9px;
          letter-spacing: 0.10em;
          padding: 2px 7px;
          border-radius: 999px;
          border: 1px solid;
        }
        .ab-project-handle {
          font-size: 10px;
          color: rgba(200,200,216,0.35);
          margin: 0 0 10px;
          letter-spacing: 0.04em;
        }
        .ab-project-desc {
          font-size: 12px;
          line-height: 1.6;
          color: rgba(200,200,216,0.55);
        }

        /* Inspiration */
        .ab-inspiration-text {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          line-height: 1.78;
          color: rgba(200,200,216,0.65);
          max-width: 620px;
          margin: 0;
        }
        .ab-inline-link {
          color: #eeeef8;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.25);
          transition: border-color .12s;
        }
        .ab-inline-link:hover { border-color: rgba(238,238,248,0.65); }

        /* Divider */
        .ab-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0 0 56px;
        }

        @media (max-width: 600px) {
          .ab-body { padding: 36px 16px 0; }
          .ab-support { padding: 22px 18px; }
          .ab-stack-name { min-width: 0; display: block; margin-bottom: 2px; }
          .ab-stack li { flex-direction: column; gap: 2px; }
          .ab-projects { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ab" itemScope itemType="https://schema.org/WebPage">
        {/* Nav */}
        <nav className="ab-nav" aria-label="Navigazione">
          <div className="ab-nav-links">
            <Link href={APP_URL} className="ab-nav-back">
              {t.backLink}
            </Link>
            <Link href={MANUAL_URL} className="ab-nav-back">
              {locale === "en" ? "manual" : "manuale"}
            </Link>
          </div>
          <Link href={locale === "en" ? "/en" : "/"} className="ab-nav-brand">
            fosforonero.com
          </Link>
        </nav>

        <main className="ab-body">

          {/* Hero */}
          <p className="ab-hero-tag">{t.heroTag}</p>
          <h1 className="ab-hero-title">
            {t.heroTitle}<br /><em>{t.heroTitleEm}</em>
          </h1>
          <p className="ab-hero-lead">
            {t.heroLead}
          </p>

          {/* Stack */}
          <section className="ab-section" aria-labelledby="s-tech">
            <h2 className="ab-section-title" id="s-tech">{t.sectionTech}</h2>
            <ul className="ab-stack">
              {t.stack.map(({ label, desc, url }) => (
                <li key={label}>
                  <span className="ab-stack-name">
                    {url
                      ? <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                      : label}
                  </span>
                  <span className="ab-stack-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Data sources */}
          <section className="ab-section" aria-labelledby="s-sources">
            <h2 className="ab-section-title" id="s-sources">{t.sectionSources}</h2>
            <ul className="ab-sources">
              {t.sources.map(({ label, desc, url }) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  <span className="ab-sources-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Inspiration */}
          <section className="ab-section" aria-labelledby="s-inspiration">
            <h2 className="ab-section-title" id="s-inspiration">{t.sectionInspiration}</h2>
            <p className="ab-inspiration-text">
              {t.inspirationText}
            </p>
          </section>

          <hr className="ab-divider" />

          {/* Roadmap */}
          <section className="ab-section" aria-labelledby="s-roadmap">
            <h2 className="ab-section-title" id="s-roadmap">{t.sectionRoadmap}</h2>
            <ul className="ab-roadmap">
              {t.roadmap.map(({ done, label }) => (
                <li key={label}>
                  <span
                    className={`ab-roadmap-dot ${done ? "ab-roadmap-dot--done" : "ab-roadmap-dot--todo"}`}
                    aria-hidden="true"
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "ab-roadmap-text--done" : "ab-roadmap-text--todo"}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="ab-divider" />

          {/* FAQ */}
          <section className="ab-section" aria-labelledby="s-faq">
            <h2 className="ab-section-title" id="s-faq">{t.sectionFaq}</h2>
            <div className="ab-faq">
              {t.faq.map(({ q, a }) => (
                <details key={q} className="ab-faq-item">
                  <summary className="ab-faq-q">{q}</summary>
                  <p className="ab-faq-a">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <hr className="ab-divider" />

          {/* Support */}
          <section className="ab-section" aria-labelledby="s-support">
            <h2 className="ab-section-title" id="s-support">{t.sectionSupport}</h2>
            <div className="ab-support">
              <p className="ab-support-text">
                <strong>{t.supportText.split(" — ")[0]}</strong> — {t.supportText.split(" — ")[1]}
              </p>
              <a
                href="https://ko-fi.com/fosforonero"
                target="_blank"
                rel="noopener noreferrer"
                className="ab-kofi-btn"
                aria-label="Supporta Fosforonero su Ko-fi"
              >
                {t.supportBtn}
              </a>
            </div>
          </section>

          <hr className="ab-divider" />

          {/* Other projects */}
          <section className="ab-section" aria-labelledby="s-projects">
            <h2 className="ab-section-title" id="s-projects">{t.sectionProjects}</h2>
            <div className="ab-projects">
              {PROJECTS.map(({ name, handle, url, desc, brand, status }) => {
                const isExternal = url.startsWith("http");
                return (
                  <a
                    key={name}
                    href={url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="ab-project-card"
                    style={{ borderTopColor: brand }}
                    aria-label={`${name} — ${desc}`}
                  >
                    <div className="ab-project-top">
                      <span className="ab-project-name">{name}</span>
                      <span
                        className="ab-project-status"
                        style={{ borderColor: brand, color: brand }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="ab-project-handle">{handle}</p>
                    <p className="ab-project-desc">{desc}</p>
                  </a>
                );
              })}
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
