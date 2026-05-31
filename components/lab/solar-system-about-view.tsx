import Link from "next/link";
import { site } from "@/lib/site";
import { SOLAR_SOURCES } from "@/lib/solar-system/bodies";

export type SolarAboutViewProps = {
  locale: "it" | "en";
};

const SPRINT01_SOURCES: Array<keyof typeof SOLAR_SOURCES> = [
  "nasaJplHorizons",
  "jplSatellites",
  "jplSbdb",
  "hipparcos",
  "stellariumSkyCultures",
  "openNgc",
];

const TEXTURE_SOURCES = [
  {
    label: "NASA 3D Resources",
    url: "https://science.nasa.gov/3d-resources/",
    usage: { it: "Modelli 3D e texture planetarie future (sprint 02+).", en: "Future planet 3D models and textures (sprint 02+)." },
  },
  {
    label: "JPL Planetary Texture Maps",
    url: "https://space.jpl.nasa.gov/tmaps/",
    usage: { it: "Mappe superficiali ad alta risoluzione per texture future.", en: "High-resolution surface maps for future textures." },
  },
  {
    label: "USGS Astrogeology",
    url: "https://astrogeology.usgs.gov/search",
    usage: { it: "Mappe planetarie e mosaici per texture future.", en: "Planetary maps and mosaics for future texture processing." },
  },
  {
    label: "NASA Media Guidelines",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    usage: { it: "Linee guida riutilizzo asset NASA.", en: "NASA asset reuse and attribution policy." },
  },
];

export function SolarSystemAboutView({ locale }: SolarAboutViewProps) {
  const isIT = locale === "it";

  const APP_URL = isIT ? "/lab/sistema-solare" : "/en/lab/solar-system";
  const ABOUT_URL = `${site.url}${isIT ? "/lab/sistema-solare/about" : "/en/lab/solar-system/about"}`;
  const OTHER_APP_URL = isIT ? "/en/lab/solar-system" : "/lab/sistema-solare";

  const PROJECTS = [
    {
      name: "FitMesh Sync",
      handle: "fitmesh.fit",
      url: "https://www.fitmesh.fit",
      desc: isIT
        ? "Sincronizzazione wearable e dashboard salute personale. Android + Galaxy Watch + Wear OS."
        : "Wearable synchronization and personal health dashboard. Android + Galaxy Watch + Wear OS.",
      brand: "#22c55e",
      status: "LIVE",
    },
    {
      name: "SplitVote",
      handle: "splitvote.io",
      url: "https://splitvote.io",
      desc: isIT
        ? "Voto e sondaggi per gruppi, senza registrazione né account. Privacy-first."
        : "Voting and polls for groups, with no registration or account. Privacy-first.",
      brand: "#c084fc",
      status: "LIVE",
    },
    {
      name: "SiteBrain AI",
      handle: "sitebrain.ai",
      url: isIT ? "/sitebrain" : "/en/sitebrain",
      desc: isIT
        ? "Plugin WordPress con RAG engine self-hosted. Indicizza i tuoi contenuti e risponde ai visitatori con OpenAI, Anthropic o OpenRouter. Privacy-first, GDPR-ready."
        : "WordPress plugin with self-hosted RAG engine. Index your content and answer visitors using OpenAI, Anthropic or OpenRouter. Privacy-first, GDPR-ready.",
      brand: "#f59e0b",
      status: "LIVE",
    },
    {
      name: isIT ? "Tavola Periodica" : "Periodic Table",
      handle: "lab/tavola-periodica",
      url: isIT ? "/lab/tavola-periodica" : "/en/lab/periodic-table",
      desc: isIT
        ? "Tavola periodica 3D interattiva: atomi, orbitali s/p/d/f, reticoli cristallini e molecole WebGL."
        : "Interactive 3D periodic table: atoms, s/p/d/f orbitals, crystal lattices and WebGL molecules.",
      brand: "#38bdf8",
      status: "LIVE",
    },
  ];

  const ROADMAP = [
    { done: true,  label: isIT ? "Sprint 01: Keplerian solver, catalogo corpi, firmamento Hipparcos, rendering WebGL procedural." : "Sprint 01: Keplerian solver, body catalog, Hipparcos firmament, procedural WebGL rendering." },
    { done: false, label: isIT ? "Sprint 02: API route JPL Horizons per posizioni precise; ingestione texture reali NASA/USGS; catalogo stelle esteso da Gaia DR3." : "Sprint 02: Live JPL Horizons API route for precise positions; real NASA/USGS texture ingestion; expanded star catalog from Gaia DR3." },
    { done: false, label: isIT ? "Sprint 03: Catalogo satelliti naturali; fascia asteroidale come punti instanziati." : "Sprint 03: Natural satellite catalog; asteroid belt as instanced points." },
    { done: false, label: isIT ? "Sprint 04: Satelliti artificiali CelesTrak; modalità sandbox con fisica." : "Sprint 04: CelesTrak artificial satellites; sandbox physics mode." },
  ];

  return (
    <>
      <style>{`
        .ss-about {
          min-height: 100dvh;
          background: #0c0c18;
          color: #c8c8d8;
          font-family: var(--font-mono, ui-monospace, monospace);
          padding: 0 0 80px;
        }
        .ss-about-nav {
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
        .ss-about-nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .ss-about-nav-back {
          font-family: inherit;
          font-size: 11px;
          color: rgba(200,200,216,0.60);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.16);
          padding: 5px 13px;
          border-radius: 999px;
          transition: color .15s, border-color .15s;
        }
        .ss-about-nav-back:hover { color: #eeeef8; border-color: rgba(255,255,255,0.30); }
        .ss-about-nav-brand {
          font-size: 11px;
          color: rgba(200,200,216,0.35);
          letter-spacing: 0.08em;
          text-decoration: none;
        }
        .ss-about-nav-brand:hover { color: rgba(200,200,216,0.65); }

        .ss-about-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 24px 0;
        }

        /* Hero */
        .ss-about-hero-tag {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(200,200,216,0.38);
          margin: 0 0 12px;
        }
        .ss-about-hero-title {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 300;
          line-height: 1.15;
          color: #eeeef8;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .ss-about-hero-title em { font-style: italic; color: rgba(238,238,248,0.42); }
        .ss-about-hero-lead {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(200,200,216,0.70);
          margin: 0 0 48px;
          max-width: 600px;
        }

        /* Section headings */
        .ss-about-section { margin: 0 0 56px; }
        .ss-about-section-title {
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(200,200,216,0.35);
          margin: 0 0 20px;
          text-transform: uppercase;
          font-weight: normal;
        }

        /* Stack list */
        .ss-about-stack {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ss-about-stack li {
          display: flex;
          align-items: baseline;
          gap: 12px;
          font-size: 13px;
        }
        .ss-about-stack-name {
          color: #eeeef8;
          white-space: nowrap;
          min-width: 240px;
        }
        .ss-about-stack-name a {
          color: inherit;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.18);
          transition: border-color .12s;
        }
        .ss-about-stack-name a:hover { border-color: rgba(238,238,248,0.55); }
        .ss-about-stack-desc { color: rgba(200,200,216,0.50); }

        /* Sources list */
        .ss-about-sources {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ss-about-sources li { font-size: 13px; line-height: 1.5; }
        .ss-about-sources a {
          color: #eeeef8;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.18);
          transition: border-color .12s;
        }
        .ss-about-sources a:hover { border-color: rgba(238,238,248,0.55); }
        .ss-about-sources-desc {
          display: block;
          color: rgba(200,200,216,0.45);
          font-size: 11px;
          margin-top: 3px;
        }

        /* Notice box */
        .ss-about-notice {
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.18);
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(200,200,216,0.60);
          margin: 0 0 24px;
        }
        .ss-about-notice strong { color: rgba(251,191,36,0.80); font-weight: 500; }

        /* Limitations */
        .ss-about-limits {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ss-about-limits li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(200,200,216,0.60);
        }
        .ss-about-limits-bullet {
          flex-shrink: 0;
          color: rgba(200,200,216,0.25);
          margin-top: 1px;
        }

        /* Roadmap */
        .ss-about-roadmap {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ss-about-roadmap li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        .ss-about-roadmap-dot {
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
        .ss-about-roadmap-dot--done {
          border-color: #22c55e;
          color: #22c55e;
          background: rgba(34,197,94,0.10);
        }
        .ss-about-roadmap-dot--todo {
          border-color: rgba(200,200,216,0.22);
          color: rgba(200,200,216,0.22);
        }
        .ss-about-roadmap-text--done { color: rgba(200,200,216,0.65); }
        .ss-about-roadmap-text--todo { color: rgba(200,200,216,0.35); }

        /* Support / Ko-fi */
        .ss-about-support {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 32px;
        }
        .ss-about-support-text {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 15px;
          line-height: 1.7;
          color: rgba(200,200,216,0.70);
          margin: 0 0 24px;
        }
        .ss-about-support-text strong { color: #eeeef8; font-weight: 500; }
        .ss-about-kofi-btn {
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
        .ss-about-kofi-btn:hover { background: #ff3a37; transform: translateY(-1px); }

        /* Projects grid */
        .ss-about-projects {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .ss-about-project-card {
          display: block;
          padding: 20px 22px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          text-decoration: none;
          transition: background .15s, border-color .15s;
        }
        .ss-about-project-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.13);
        }
        .ss-about-project-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 0 8px;
        }
        .ss-about-project-name {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          font-weight: 500;
          color: #eeeef8;
        }
        .ss-about-project-status {
          font-size: 9px;
          letter-spacing: 0.10em;
          padding: 2px 7px;
          border-radius: 999px;
          border: 1px solid;
        }
        .ss-about-project-handle {
          font-size: 10px;
          color: rgba(200,200,216,0.35);
          margin: 0 0 10px;
          letter-spacing: 0.04em;
        }
        .ss-about-project-desc {
          font-size: 12px;
          line-height: 1.6;
          color: rgba(200,200,216,0.55);
        }

        /* Prose */
        .ss-about-prose {
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          line-height: 1.78;
          color: rgba(200,200,216,0.65);
          max-width: 620px;
          margin: 0;
        }
        .ss-about-inline-link {
          color: #eeeef8;
          text-decoration: none;
          border-bottom: 1px solid rgba(238,238,248,0.25);
          transition: border-color .12s;
        }
        .ss-about-inline-link:hover { border-color: rgba(238,238,248,0.65); }

        /* Divider */
        .ss-about-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0 0 56px;
        }

        @media (max-width: 600px) {
          .ss-about-body { padding: 36px 16px 0; }
          .ss-about-support { padding: 22px 18px; }
          .ss-about-stack-name { min-width: 0; display: block; margin-bottom: 2px; }
          .ss-about-stack li { flex-direction: column; gap: 2px; }
          .ss-about-projects { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ss-about" itemScope itemType="https://schema.org/WebPage">

        {/* Nav */}
        <nav className="ss-about-nav" aria-label={isIT ? "Navigazione" : "Navigation"}>
          <div className="ss-about-nav-links">
            <Link href={APP_URL} className="ss-about-nav-back">
              {isIT ? "← sistema solare" : "← solar system"}
            </Link>
            <Link href={OTHER_APP_URL} className="ss-about-nav-back">
              {isIT ? "EN" : "IT"}
            </Link>
          </div>
          <Link href={isIT ? "/" : "/en"} className="ss-about-nav-brand">
            fosforonero.com
          </Link>
        </nav>

        <main className="ss-about-body">

          {/* Hero */}
          <p className="ss-about-hero-tag">
            {isIT ? "SISTEMA SOLARE 3D · FOSFORONERO LAB" : "SOLAR SYSTEM 3D · FOSFORONERO LAB"}
          </p>
          <h1 className="ss-about-hero-title">
            {isIT ? "Dati, fonti" : "Data, sources"}<br />
            <em>{isIT ? "e stack tecnologico." : "and technical stack."}</em>
          </h1>
          <p className="ss-about-hero-lead">
            {isIT
              ? "Sistema Solare 3D è un osservatorio WebGL open-source costruito per Fosforonero. Ogni posizione, ogni stella e ogni dato visualizzato proviene da fonti aperte o pubbliche con citazione esplicita."
              : "Solar System 3D is an open-source WebGL observatory built for Fosforonero. Every position, star, and datum displayed comes from open or public sources with explicit citation."}
          </p>

          {/* Technical stack */}
          <section className="ss-about-section" aria-labelledby="ss-s-tech">
            <h2 className="ss-about-section-title" id="ss-s-tech">
              {isIT ? "STACK TECNOLOGICO" : "TECHNICAL STACK"}
            </h2>
            <ul className="ss-about-stack">
              {[
                { label: "Next.js (App Router)", url: "https://nextjs.org/", desc: isIT ? "Framework React con routing file-system." : "React framework with file-system routing." },
                { label: "React", url: "https://react.dev/", desc: isIT ? "UI component model." : "UI component model." },
                { label: "TypeScript", url: "https://www.typescriptlang.org/", desc: isIT ? "Type safety su tutto il codebase." : "Type safety across the whole codebase." },
                { label: "Three.js", url: "https://threejs.org/", desc: isIT ? "Motore WebGL 3D sottostante." : "Underlying WebGL 3D engine." },
                { label: "React Three Fiber", url: "https://docs.pmnd.rs/react-three-fiber", desc: isIT ? "Bridge React declarativo per Three.js." : "Declarative React bridge for Three.js." },
                { label: "@react-three/drei", url: "https://github.com/pmndrs/drei", desc: isIT ? "Helpers e astrazioni per R3F." : "Helpers and abstractions for R3F." },
                { label: "@react-three/postprocessing", url: "https://github.com/pmndrs/react-postprocessing", desc: isIT ? "Effetti post-processing: bloom, vignette." : "Post-processing effects: bloom, vignette." },
                { label: isIT ? "Meccanica orbitale (Keplerian solver)" : "Orbital mechanics (Keplerian solver)", url: null, desc: isIT ? "Solver Kepleriano custom basato su elementi orbitali pubblici." : "Custom Keplerian solver using public orbital elements." },
                { label: isIT ? "Catalogo stelle: ESA Hipparcos" : "Star catalog: ESA Hipparcos", url: "https://www.cosmos.esa.int/web/hipparcos/catalogues", desc: isIT ? "Subset curato per rendering browser-ready." : "Curated subset for browser-ready firmament rendering." },
                { label: "Vercel", url: "https://vercel.com/", desc: isIT ? "Hosting e deployment." : "Hosting and deployment." },
              ].map(({ label, url, desc }) => (
                <li key={label}>
                  <span className="ss-about-stack-name">
                    {url
                      ? <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                      : label}
                  </span>
                  <span className="ss-about-stack-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Scientific data sources */}
          <section className="ss-about-section" aria-labelledby="ss-s-sources">
            <h2 className="ss-about-section-title" id="ss-s-sources">
              {isIT ? "FONTI DATI SCIENTIFICI (SPRINT 01)" : "SCIENTIFIC DATA SOURCES (SPRINT 01)"}
            </h2>
            <ul className="ss-about-sources">
              {SPRINT01_SOURCES.map((key) => {
                const src = SOLAR_SOURCES[key];
                return (
                  <li key={key}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
                    <span className="ss-about-sources-desc">{src.usage}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Texture and 3D asset sources */}
          <section className="ss-about-section" aria-labelledby="ss-s-textures">
            <h2 className="ss-about-section-title" id="ss-s-textures">
              {isIT ? "TEXTURE E ASSET 3D (SPRINT 02+)" : "TEXTURES AND 3D ASSETS (SPRINT 02+)"}
            </h2>
            <div className="ss-about-notice">
              <strong>{isIT ? "Sprint 01:" : "Sprint 01:"}</strong>{" "}
              {isIT
                ? "Tutti i materiali sono procedurali. Nessuna texture reale è ancora stata scaricata. Le seguenti fonti saranno integrate in sprint futuri."
                : "All materials are procedural. No real texture maps have been downloaded yet. The following sources will be integrated in future sprints."}
            </div>
            <ul className="ss-about-sources">
              {TEXTURE_SOURCES.map(({ label, url, usage }) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  <span className="ss-about-sources-desc">{isIT ? usage.it : usage.en}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Open data and license notes */}
          <section className="ss-about-section" aria-labelledby="ss-s-license">
            <h2 className="ss-about-section-title" id="ss-s-license">
              {isIT ? "DATI APERTI E LICENZE" : "OPEN DATA AND LICENSE NOTES"}
            </h2>
            <p className="ss-about-prose">
              {isIT
                ? "Le immagini e i dati NASA sono generalmente pubblici secondo le linee guida media NASA. I prodotti USGS sono generalmente di dominio pubblico statunitense. Tutti i crediti delle fonti sono mantenuti. Non è implicita alcuna approvazione da parte di NASA, JPL o USGS."
                : "NASA imagery and data are generally public under NASA media guidelines. USGS-authored products are generally US public domain. All source credits are retained. No NASA, JPL or USGS endorsement is implied."}
            </p>
          </section>

          {/* Scientific limitations */}
          <section className="ss-about-section" aria-labelledby="ss-s-limits">
            <h2 className="ss-about-section-title" id="ss-s-limits">
              {isIT ? "LIMITAZIONI SCIENTIFICHE" : "SCIENTIFIC LIMITATIONS"}
            </h2>
            <ul className="ss-about-limits">
              {(isIT ? [
                "Le posizioni orbitali usano elementi Kepleriani semplificati (MVP sprint 01), non vettori live JPL Horizons.",
                "Le modalità di scala sono educative, non fisicamente accurate.",
                "Il catalogo stelle è un subset curato di Hipparcos (44 stelle), non il catalogo completo.",
                "Le linee delle costellazioni fanno riferimento ai dati Stellarium sky cultures.",
                "Le texture sono procedurali; i dettagli superficiali non sono scientificamente rappresentativi.",
              ] : [
                "Orbital positions use simplified Keplerian elements (sprint 01 MVP), not live JPL Horizons vectors.",
                "Scale modes are educational, not physically accurate.",
                "Star catalog is a curated subset of Hipparcos (44 stars), not the full catalog.",
                "Constellation lines reference Stellarium sky cultures data.",
                "Textures are procedural; surface details are not scientifically representative.",
              ]).map((text) => (
                <li key={text}>
                  <span className="ss-about-limits-bullet" aria-hidden="true">—</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Performance strategy */}
          <section className="ss-about-section" aria-labelledby="ss-s-perf">
            <h2 className="ss-about-section-title" id="ss-s-perf">
              {isIT ? "STRATEGIA PERFORMANCE" : "PERFORMANCE STRATEGY"}
            </h2>
            <ul className="ss-about-limits">
              {(isIT ? [
                "Canvas WebGL caricato via dynamic import (SSR-safe).",
                "Nessuna texture pesante in Sprint 01.",
                "Catalogo corpi minori limitato a ~28 corpi curati.",
                "Rendering instanziato pianificato per cataloghi densi futuri.",
              ] : [
                "WebGL canvas loaded via dynamic import (SSR-safe).",
                "No heavy texture maps in Sprint 01.",
                "Minor body catalog limited to ~28 curated bodies.",
                "Instanced rendering planned for future dense catalogs.",
              ]).map((text) => (
                <li key={text}>
                  <span className="ss-about-limits-bullet" aria-hidden="true">—</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="ss-about-divider" />

          {/* Roadmap */}
          <section className="ss-about-section" aria-labelledby="ss-s-roadmap">
            <h2 className="ss-about-section-title" id="ss-s-roadmap">
              {isIT ? "ROADMAP" : "ROADMAP"}
            </h2>
            <ul className="ss-about-roadmap">
              {ROADMAP.map(({ done, label }) => (
                <li key={label}>
                  <span
                    className={`ss-about-roadmap-dot ${done ? "ss-about-roadmap-dot--done" : "ss-about-roadmap-dot--todo"}`}
                    aria-hidden="true"
                  >
                    {done ? "✓" : ""}
                  </span>
                  <span className={done ? "ss-about-roadmap-text--done" : "ss-about-roadmap-text--todo"}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="ss-about-divider" />

          {/* Support */}
          <section className="ss-about-section" aria-labelledby="ss-s-support">
            <h2 className="ss-about-section-title" id="ss-s-support">
              {isIT ? "SUPPORTA IL PROGETTO" : "SUPPORT THE PROJECT"}
            </h2>
            <div className="ss-about-support">
              <p className="ss-about-support-text">
                {isIT
                  ? "Questo laboratorio è gratuito, senza pubblicità e costruito con dati aperti o pubblici. Se ti è utile o vuoi sostenere lo sviluppo di nuovi strumenti scientifici interattivi, puoi offrire un caffè su Ko-fi."
                  : "This lab is free, ad-free and built on open or public data. If it is useful to you or you want to support more interactive scientific tools, you can buy a coffee on Ko-fi."}
              </p>
              <a
                href="https://ko-fi.com/fosforonero"
                target="_blank"
                rel="noopener noreferrer"
                className="ss-about-kofi-btn"
                aria-label={isIT ? "Supporta Fosforonero su Ko-fi" : "Support Fosforonero on Ko-fi"}
              >
                ☕ {isIT ? "Supporta su Ko-fi" : "Support on Ko-fi"}
              </a>
            </div>
          </section>

          <hr className="ss-about-divider" />

          {/* Other projects */}
          <section className="ss-about-section" aria-labelledby="ss-s-projects">
            <h2 className="ss-about-section-title" id="ss-s-projects">
              {isIT ? "ALTRI PROGETTI FOSFORONERO" : "OTHER FOSFORONERO PROJECTS"}
            </h2>
            <div className="ss-about-projects">
              {PROJECTS.map(({ name, handle, url, desc, brand, status }) => {
                const isExternal = url.startsWith("http");
                return (
                  <a
                    key={name}
                    href={url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="ss-about-project-card"
                    style={{ borderTopColor: brand }}
                    aria-label={`${name} — ${desc}`}
                  >
                    <div className="ss-about-project-top">
                      <span className="ss-about-project-name">{name}</span>
                      <span
                        className="ss-about-project-status"
                        style={{ borderColor: brand, color: brand }}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="ss-about-project-handle">{handle}</p>
                    <p className="ss-about-project-desc">{desc}</p>
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
