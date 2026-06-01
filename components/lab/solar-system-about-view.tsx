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
    label: "NASA Visible Earth / Blue Marble Next Generation",
    url: "https://visibleearth.nasa.gov/collection/1484/blue-marble-next-generation",
    usage: { it: "Mappa di visualizzazione Terra (integrata).", en: "Earth visualization map (integrated)." },
  },
  {
    label: "NASA GSFC SVS / LRO LROC WAC",
    url: "https://svs.gsfc.nasa.gov/4720",
    usage: { it: "Mappa di visualizzazione Luna (integrata).", en: "Moon visualization map (integrated)." },
  },
  {
    label: "NASA / USGS Viking Orbiter",
    url: "https://astrogeology.usgs.gov/search/map/Mars/Viking/MDIM21/Mars_Viking_MDIM21_ClrMosaic_global_232m",
    usage: { it: "Mappa di visualizzazione Marte (integrata, via mirror).", en: "Mars visualization map (integrated, via mirror)." },
  },
  {
    label: "NASA GSFC SVS / MESSENGER MDIS",
    url: "https://svs.gsfc.nasa.gov/4341",
    usage: { it: "Mappa di visualizzazione Mercurio (integrata, via mirror).", en: "Mercury visualization map (integrated, via mirror)." },
  },
  {
    label: "USGS Astrogeology",
    url: "https://astrogeology.usgs.gov/search",
    usage: { it: "Mappe planetarie e mosaici per corpi futuri.", en: "Planetary maps and mosaics for future bodies." },
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
    { done: true,  label: isIT ? "Fondamenta: Keplerian solver, catalogo corpi, firmamento Hipparcos, rendering WebGL procedural." : "Foundation: Keplerian solver, body catalog, Hipparcos firmament, procedural WebGL rendering." },
    { done: true,  label: isIT ? "Correzioni orbitali: Elementi orbitali completi (Ω, ω, M₀ J2000), percorsi orbitali ellittici campionati, scala raggi logaritmica categoriale, sistemi luna/satellite leggibili, playback giorni/sec." : "Orbital corrections: Full orbital elements (Ω, ω, M₀ J2000), sampled elliptical orbit paths, category-aware log radius scaling, readable moon/satellite systems, days/sec playback." },
    { done: true,  label: isIT ? "Fisica reale: Inclinazione assiale IAU 2015, anelli Saturno/Urano, illuminazione 1/r², sistema di riferimento HEC-J2000, frame/accuracy nell'ispettore." : "Real physics: IAU 2015 axial tilt, Saturn/Uranus rings, 1/r² lighting, HEC-J2000 reference frame, inspector frame/accuracy." },
    { done: true,  label: isIT ? "Catalogo SBDB: Catalogo SBDB (NEO/MBA/comete/TNO/centauri), ricerca live SBDB, marcatore Horizons precisione sub-km, API routes solar/catalog/search e solar/horizons." : "SBDB catalog: SBDB catalog (NEO/MBA/comets/TNOs/centaurs), live SBDB search, sub-km Horizons precision marker, solar/catalog/search and solar/horizons API routes." },
    { done: true,  label: isIT ? "Orientamento polare IAU: Polo IAU WGCCRE 2015 J2000 per pianeti principali e Luna (quaternione corretto nel renderer); catalogo NEO completo (41.780); sizing punti per magnitudine H." : "IAU pole orientation: IAU WGCCRE 2015 J2000 pole for major planets and Moon (correct quaternion in renderer); complete NEO catalog (41,780); catalog point sizing by H magnitude." },
    { done: true,  label: isIT ? "Asset visivi: Mappe di visualizzazione reali (Terra/Luna/Marte/Mercurio); gusci atmosferici visivi (Terra/Venere/Marte/Titano); percorso orbitale per oggetti catalogo selezionati; disclosures aggiornate." : "Visual assets: Real visualization maps (Earth/Moon/Mars/Mercury); visual atmosphere shells (Earth/Venus/Mars/Titan); orbit path for selected catalog objects; updated disclosures." },
    { done: true,  label: isIT ? "Ispezione oggetti catalogo: inspector con elementi orbitali (a, e, i, q, Q, periodo, H, diametro), badge NEO/PHA, coda cometa anti-solare, colori percorso per categoria, pulsante clear." : "Catalog object inspection: orbital element inspector (a, e, i, q, Q, period, H, diameter), NEO/PHA badges, anti-solar comet tail, category-aware orbit path colors, clear button." },
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
                { label: "lib/solar-system/reference-frames.ts", url: null, desc: isIT ? "Documentazione frame HEC-J2000, conversione eclittica-equatoriale." : "HEC-J2000 frame documentation, ecliptic-to-equatorial conversion." },
                { label: "lib/solar-system/rotation-model.ts", url: null, desc: isIT ? "Obliquità assiale IAU 2015, rotazione siderale, rilevamento retrogrado." : "IAU 2015 axial tilt, sidereal rotation, retrograde detection." },
                { label: "lib/solar-system/lighting-model.ts", url: null, desc: isIT ? "Configurazioni illuminazione fisica (1/r²) ed educativa." : "Physical (1/r²) and educational lighting configurations." },
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
              {isIT ? "FONTI DATI SCIENTIFICI" : "SCIENTIFIC DATA SOURCES"}
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

          {/* Minor body catalog data */}
          <section className="ss-about-section" aria-labelledby="ss-s-catalog">
            <h2 className="ss-about-section-title" id="ss-s-catalog">
              {isIT ? "DATI CATALOGO CORPI MINORI" : "MINOR BODY CATALOG DATA"}
            </h2>
            <div className="ss-about-notice">
              <strong>{isIT ? "Snapshot statico:" : "Static snapshot:"}</strong>{" "}
              {isIT
                ? "I chunk del catalogo sono snapshot generati da JPL SBDB Query API. Non si aggiornano automaticamente. Data di recupero: visibile in manifest.json."
                : "Catalog chunks are snapshots generated from the JPL SBDB Query API. They do not auto-refresh. Retrieval date: visible in manifest.json."}
            </div>
            <ul className="ss-about-sources">
              {[
                {
                  label: "JPL Small-Body Database Query API",
                  url: "https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html",
                  desc: isIT
                    ? "Asteroidi NEO (10.000), fascia principale (5.000), comete (~4.000), TNO (~6.000), centauri (~1.000). Elementi orbitali kepleriani, frame HEC-J2000."
                    : "NEO asteroids (10,000), main belt (5,000), comets (~4,000), TNOs (~6,000), centaurs (~1,000). Keplerian orbital elements, HEC-J2000 frame.",
                },
                {
                  label: "JPL Horizons System",
                  url: "https://ssd.jpl.nasa.gov/horizons/",
                  desc: isIT
                    ? "Vettori cartesiani on-demand per corpi selezionati dalla ricerca. Cache 1h. Precisione sub-km. Frame: Eclittica/J2000."
                    : "On-demand Cartesian vectors for search-selected bodies. 1h cache. Sub-km accuracy. Frame: Ecliptic/J2000.",
                },
              ].map(({ label, url, desc }) => (
                <li key={label}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  <span className="ss-about-sources-desc">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Texture and 3D asset sources */}
          <section className="ss-about-section" aria-labelledby="ss-s-textures">
            <h2 className="ss-about-section-title" id="ss-s-textures">
              {isIT ? "MAPPE DI VISUALIZZAZIONE E CREDITI ASSET" : "VISUALIZATION MAPS AND ASSET CREDITS"}
            </h2>
            <div className="ss-about-notice">
              <strong>{isIT ? "Stato attuale:" : "Current status:"}</strong>{" "}
              {isIT
                ? "Mappe di visualizzazione NASA/USGS integrate per Terra, Luna, Marte e Mercurio. Gli altri corpi usano materiali procedurali. Le mappe sono di visualizzazione, non texture fotografiche scientificamente calibrate. Per corpi futuri si utilizzeranno le seguenti fonti."
                : "NASA/USGS visualization maps integrated for Earth, Moon, Mars, and Mercury. Other bodies use procedural materials. Maps are visualization maps, not scientifically calibrated photographic textures. Additional bodies will use the following sources."}
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
                "Posizioni orbitali: elementi kepleriani J2000 nel frame HEC-J2000. Non integrazioni numeriche, non vettori live JPL Horizons. Precisione: pochi milioni di km su scale di anni.",
                "Orientamento assi: obliquità IAU 2015 corretta; polo IAU WGCCRE RA/Dec implementato per pianeti principali e Luna. Precessione e nutazione non modellate. Orientamento superficie (meridiano primo IAU WGCCRE): modello W = W0 + Ẇ·d implementato per Terra, Luna, Marte, Mercurio, Venere. Allineamento texture non verificato empiricamente.",
                "Anelli: geometria semplificata; le proporzioni anello/pianeta sono fisicamente corrette. Mancano: divisione di Cassini, ombre degli anelli sul pianeta. Gli anelli usano un materiale a colore fisso (meshBasicMaterial) e non ricevono la luce solare della PointLight.",
                "Illuminazione: la modalità educativa aggiunge un boost ambientale non fisico per la visibilità. La modalità fisica (1/r²) è disponibile ma rende i pianeti esterni molto scuri.",
                "Raggi visivi: scala logaritmica educativa per categoria. I corpi sono molto più grandi del reale rispetto alle distanze. Dichiarato nell'ispettore sotto \"Scale attive\".",
                "Massa: mostrata nell'ispettore come dato di riferimento. Non viene usata nella simulazione — le orbite sono kepleriane statiche, non N-body.",
                "Temperatura: nessun dato e nessun calcolo di temperatura superficiale, media o di equilibrio radiativo.",
                "Gravità e N-body: non implementati. Non ci sono forze gravitazionali tra i corpi.",
                "Eclissi, ombre e transiti: non implementati.",
                "Il catalogo stelle è un subset curato di Hipparcos (44 stelle), non il catalogo completo.",
                "Mappe di visualizzazione integrate per Terra, Luna, Marte, Mercurio; gli altri corpi usano materiali procedurali. Si tratta di mappe di visualizzazione, non texture fotografiche scientificamente calibrate. Allineamento longitudine texture: Terra e Luna verificati analiticamente (offset 0°). Marte (~69°) e Mercurio (~15.5°) richiedono confronto con effemeridi empiriche.",
                "Atmosfera: gusci visivi per Terra, Venere, Marte, Titano. Non è una simulazione fisica — nessuna fluidodinamica, nessuna chimica, nessun modello di scattering atmosferico.",
                "Coda cometa fisica (modello gas/polvere): non implementata. La coda visualizzata è solo direzionale (anti-solare), con lunghezza funzione della distanza eliocentrica.",
                "Catalog SBDB: posizioni da elementi kepleriani snapshot. Non vettori live. Precisione degrada per oggetti fortemente perturbati.",
                "Corpo selezionato (Horizons): vettore Horizons cached 1h. Accurato sub-km al momento della query. Non aggiornato in tempo reale.",
                "Copertura catalogo: basata sullo snapshot SBDB alla data di recupero. Non si aggiorna automaticamente.",
                "Catalogo NEO: snapshot completo SBDB (41.780 corpi al 31/05/2026).",
                "Esplorazione Pianeta Nove/X: non implementata (ipotesi, non dati reali).",
              ] : [
                "Orbital positions: J2000 Keplerian elements in the HEC-J2000 frame. Not numerical integrations, not live JPL Horizons vectors. Accuracy: a few million km over multi-year timescales.",
                "Axis orientation: IAU 2015 obliquity correct; IAU WGCCRE RA/Dec pole implemented for major planets and Moon. Precession and nutation not modelled. Surface orientation (IAU WGCCRE prime meridian): W = W0 + Ẇ·d model implemented for Earth, Moon, Mars, Mercury, Venus. Texture alignment not empirically verified.",
                "Rings: simplified geometry; ring/planet proportions are physically correct. Missing: Cassini Division, ring shadow on planet. Rings use a fixed-colour material (meshBasicMaterial) and do not receive sunlight from the PointLight.",
                "Lighting: educational mode adds a non-physical ambient boost for visibility. Physical mode (1/r²) is available but makes outer planets very dark.",
                "Visual radii: educational logarithmic scale by category. Bodies are much larger than real scale relative to distances. Declared in inspector under \"Active scales\".",
                "Mass: shown in the inspector as reference data. Not used in the simulation — orbits are static Keplerian, not N-body.",
                "Temperature: no data and no calculations for surface, mean, or radiative equilibrium temperature.",
                "Gravity and N-body: not implemented. No gravitational forces between bodies.",
                "Eclipses, shadows, and transits: not implemented.",
                "Star catalog is a curated subset of Hipparcos (44 stars), not the full catalog.",
                "Visualization maps integrated for Earth, Moon, Mars, Mercury; other bodies use procedural materials. Maps are visualization maps, not scientifically calibrated textures. Texture longitude alignment: Earth and Moon analytically verified (offset 0°). Mars (~69°) and Mercury (~15.5°) require empirical ephemeris comparison.",
                "Atmosphere: visual shells for Earth, Venus, Mars, Titan. Not a physics simulation — no fluid dynamics, no chemistry, no atmospheric scattering model.",
                "Physical comet tail (gas/dust model): not implemented. The rendered tail is directional only (anti-solar), with length as a function of heliocentric distance.",
                "Catalog SBDB: positions from Keplerian element snapshots. Not live vectors. Accuracy degrades for highly perturbed objects.",
                "Selected body (Horizons): Horizons vector cached 1h. Sub-km accurate at query time. Not updated in real time.",
                "Catalog coverage: based on SBDB snapshot at retrieval date. Does not auto-refresh.",
                "NEO catalog: complete SBDB snapshot (41,780 bodies as of 2026-05-31).",
                "Planet Nine / Planet X exploration: not implemented (hypothesis, not real catalog data).",
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
                "Mappe di visualizzazione per 4 corpi (Terra, Luna, Marte, Mercurio); gli altri corpi usano materiali procedurali leggeri.",
                "Corpi principali curati: ~28 (pianeti, lune, pianeti nani, comete notevoli).",
                "Snapshot SBDB: 26.132 corpi minori caricati on-demand come livelli di punti. Catalogo NEO completo (41.780 corpi).",
              ] : [
                "WebGL canvas loaded via dynamic import (SSR-safe).",
                "Visualization maps for 4 bodies (Earth, Moon, Mars, Mercury); other bodies use lightweight procedural materials.",
                "Curated major bodies: ~28 (planets, moons, dwarf planets, notable comets).",
                "SBDB snapshot: 26,132 minor bodies loaded on-demand as point layers. Complete NEO catalog (41,780 bodies).",
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
