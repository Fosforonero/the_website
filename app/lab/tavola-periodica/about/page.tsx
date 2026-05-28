import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

const PAGE_URL = `${site.url}/lab/tavola-periodica/about`;
const APP_URL  = `${site.url}/lab/tavola-periodica`;

export const metadata: Metadata = {
  title: "Tavola Periodica Interattiva 3D — About · Fosforonero Lab",
  description:
    "Tavola periodica degli elementi interattiva con visualizzazione 3D WebGL. 118 elementi, 5 modelli atomici storici (Thomson, Rutherford, Bohr, Sommerfeld, quantistico), dark/light mode. Tecnologia, roadmap e fonti scientifiche.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type:        "article",
    locale:      "it_IT",
    url:         PAGE_URL,
    siteName:    site.name,
    title:       "Tavola Periodica Interattiva 3D — About · Fosforonero Lab",
    description: "118 elementi con modello atomico 3D in WebGL. 5 modelli storici da Thomson a Schrödinger, dark/light mode, responsive. Gratis, open, nel browser.",
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "Tavola Periodica Interattiva — Fosforonero Lab" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK: { label: string; desc: string; url?: string }[] = [
  { label: "Three.js / React Three Fiber", desc: "motore 3D WebGL per la scena atomica",          url: "https://threejs.org" },
  { label: "@react-three/drei",             desc: "Stars, OrbitControls, post-processing bloom",   url: "https://github.com/pmndrs/drei" },
  { label: "Next.js 16 App Router",          desc: "rendering ibrido SSR + client dinamico",        url: "https://nextjs.org" },
  { label: "TypeScript 6",                  desc: "type-safety su tutta la pipeline",              url: "https://www.typescriptlang.org" },
];

const SOURCES: { label: string; desc: string; url: string }[] = [
  {
    label: "IUPAC — Tavola periodica ufficiale",
    desc:  "Pesi atomici standard, simboli e nomenclatura IUPAC 2021.",
    url:   "https://iupac.org/what-we-do/periodic-table-of-elements/",
  },
  {
    label: "NIST Chemistry WebBook",
    desc:  "Dati termofisici, energia di ionizzazione, affinità elettronica. Pubblico dominio (US Gov.).",
    url:   "https://webbook.nist.gov/chemistry/",
  },
  {
    label: "PubChem (NIH / NLM)",
    desc:  "Dati di struttura, proprietà fisiche e biologiche. Pubblico dominio (US Gov.).",
    url:   "https://pubchem.ncbi.nlm.nih.gov/",
  },
  {
    label: "WebElements (University of Sheffield)",
    desc:  "Configurazioni elettroniche, raggi atomici, abbondanza in crosta.",
    url:   "https://www.webelements.com/",
  },
];

const ROADMAP = [
  // ── Completato ────────────────────────────────────────────────────────────
  { done: true,  label: "Tavola periodica 118 elementi — 11 viste tematiche: heatmap, stato fisico, blocco" },
  { done: true,  label: "5 modelli atomici storici: Thomson → Rutherford → Bohr → Sommerfeld → Quantistico" },
  { done: true,  label: "Scala reale nucleo–elettroni, slider velocità, controllo intensità stelle" },
  { done: true,  label: "Info panel: configurazione elettronica, 10+ proprietà fisiche, scopritore, anno" },
  { done: true,  label: "Dark / light mode con 3 palette · responsive tablet e mobile" },
  { done: true,  label: "Ricerca per nome, simbolo o numero atomico con dimming celle" },
  // ── Zoom nella materia (Powers of Ten) ───────────────────────────────────
  { done: false, label: "Vista materiale: ogni elemento mostra il suo aspetto reale — cubo metallico, pool liquido, nuvola gas in WebGL" },
  { done: false, label: "Slider temperatura in tempo reale: solido → liquido → gas calcolato su Tm/Tb di ogni elemento" },
  { done: false, label: "Struttura cristallina 3D per ogni elemento (FCC, BCC, HCP, diamond cubic, ecc.)" },
  { done: false, label: "Legami atomici nella struttura: metalliche, covalenti, ionici — animazione reticolo" },
  // ── Zoom sub-atomico ──────────────────────────────────────────────────────
  { done: false, label: "Livello 2: zoom nel nucleo — protoni e neutroni come sfere 3D a scala reale" },
  { done: false, label: "Forme reali degli orbitali s / p / d / f (equazione di Schrödinger)" },
  { done: false, label: "Livello 3: zoom nei quark — struttura sub-nucleare del protone (up/down quark + gluoni)" },
  { done: false, label: "Livello 4: bosoni, campo di Higgs, particelle elementari del Modello Standard" },
];

const PROJECTS = [
  {
    name: "FitMesh Sync",
    handle: "fitmesh.fit",
    url: "https://www.fitmesh.fit",
    desc: "Sincronizzazione wearable e dashboard salute personale. Android + Galaxy Watch + Wear OS.",
    brand: "#22c55e",
    status: "LIVE",
  },
  {
    name: "SplitVote",
    handle: "splitvote.io",
    url: "https://splitvote.io",
    desc: "Voto e sondaggi per gruppi, senza registrazione né account. Privacy-first.",
    brand: "#c084fc",
    status: "LIVE",
  },
  {
    name: "SiteBrain AI",
    handle: "sitebrain.ai",
    url: "/sitebrain",
    desc: "Plugin WordPress con RAG engine self-hosted. Indicizza i tuoi contenuti e risponde ai visitatori con OpenAI, Anthropic o OpenRouter. Privacy-first, GDPR-ready.",
    brand: "#f59e0b",
    status: "LIVE",
  },
];

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": APP_URL,
      name: "Tavola Periodica Interattiva",
      alternateName: "Interactive Periodic Table 3D",
      description:
        "Tavola periodica degli elementi interattiva con visualizzazione 3D WebGL. 118 elementi, 5 modelli atomici storici, dark/light mode, responsive.",
      url: APP_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: ["it", "en"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      author: {
        "@type": "Person",
        name: "Matteo Pizzi",
        url: site.url,
      },
      keywords:
        "tavola periodica, periodic table, 3D WebGL, atomo, electron shell, Bohr model, chemistry, elementi chimici, Three.js",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",             item: site.url },
        { "@type": "ListItem", position: 2, name: "Lab",              item: `${site.url}/lab` },
        { "@type": "ListItem", position: 3, name: "Tavola Periodica", item: APP_URL },
        { "@type": "ListItem", position: 4, name: "About",            item: PAGE_URL },
      ],
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutTavolaPeriodica() {
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
          <Link href="/lab/tavola-periodica" className="ab-nav-back">
            ← tavola periodica
          </Link>
          <Link href="/" className="ab-nav-brand">
            fosforonero.com
          </Link>
        </nav>

        <main className="ab-body">

          {/* Hero */}
          <p className="ab-hero-tag">FOSFORONERO LAB · 2026</p>
          <h1 className="ab-hero-title">
            Tavola Periodica<br /><em>interattiva</em>
          </h1>
          <p className="ab-hero-lead">
            Un esperimento che unisce chimica, storia della scienza e computer
            grafica: 118 elementi, cinque modelli atomici storici da Thomson a
            Schrödinger, una scena WebGL in tempo reale per ogni atomo. Tutto
            gira nel browser, senza server, senza installazioni.
          </p>

          {/* Stack */}
          <section className="ab-section" aria-labelledby="s-tech">
            <h2 className="ab-section-title" id="s-tech">Tecnologia</h2>
            <ul className="ab-stack">
              {STACK.map(({ label, desc, url }) => (
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
            <h2 className="ab-section-title" id="s-sources">Fonti dei dati</h2>
            <ul className="ab-sources">
              {SOURCES.map(({ label, desc, url }) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  <span className="ab-sources-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Inspiration */}
          <section className="ab-section" aria-labelledby="s-inspiration">
            <h2 className="ab-section-title" id="s-inspiration">Ispirazione</h2>
            <p className="ab-inspiration-text">
              Questo progetto è ispirato a{" "}
              <a
                href="https://www.eamesoffice.com/the-work/powers-of-ten/"
                target="_blank"
                rel="noopener noreferrer"
                className="ab-inline-link"
              >
                <em>Powers of Ten</em>
              </a>
              {" "}(1977) di Charles & Ray Eames — il cortometraggio scientifico che esplora
              le scale dell'universo, dal nucleo del protone alle galassie remote, con un
              fattore di zoom di 10 per ogni passo. L&apos;obiettivo di questa tavola periodica
              è replicare quella stessa progressione per ogni elemento: dal campione macroscopico
              alla struttura cristallina, all&apos;atomo, al nucleo, fino ai quark e ai bosoni.
            </p>
          </section>

          <hr className="ab-divider" />

          {/* Roadmap */}
          <section className="ab-section" aria-labelledby="s-roadmap">
            <h2 className="ab-section-title" id="s-roadmap">Roadmap</h2>
            <ul className="ab-roadmap">
              {ROADMAP.map(({ done, label }) => (
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

          {/* Support */}
          <section className="ab-section" aria-labelledby="s-support">
            <h2 className="ab-section-title" id="s-support">Supporta il progetto</h2>
            <div className="ab-support">
              <p className="ab-support-text">
                Questo progetto è <strong>gratuito e open</strong> — nessuna
                pubblicità, nessun paywall. Se ti è utile o semplicemente ti
                piace, considera di offrire un caffè: ogni supporto permette di
                dedicare più tempo a questo e agli altri progetti qui sotto, e
                di espandere le funzionalità secondo la roadmap.
              </p>
              <a
                href="https://ko-fi.com/fosforonero"
                target="_blank"
                rel="noopener noreferrer"
                className="ab-kofi-btn"
                aria-label="Supporta Fosforonero su Ko-fi"
              >
                ♥ Supporta su Ko-fi
              </a>
            </div>
          </section>

          <hr className="ab-divider" />

          {/* Other projects */}
          <section className="ab-section" aria-labelledby="s-projects">
            <h2 className="ab-section-title" id="s-projects">Altri progetti</h2>
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
