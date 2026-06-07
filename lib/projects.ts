// Project catalogue. Add new projects here; the homepage iterates over this.
import type { Locale } from "./site";

export type Project = {
  id: string;
  name: string;
  /** External link to the project (marketplace listing, app, etc). Optional
   *  for projects in beta/pre-launch that don't have a public URL yet. */
  url?: string;
  /** Short visible identifier under the project card header. */
  handle: string;
  status: "LIVE" | "ACTIVE" | "BETA" | "WIP";
  /** Hidden from the public site (homepage, coming-soon, JSON-LD) when true. */
  draft?: boolean;
  year: number;
  stack: string[];
  brand: string; // accent colour
  /** Per-locale tagline + description */
  copy: Record<
    Locale,
    {
      tagline: string;
      description: string;
    }
  >;
};

const allProjects: Project[] = [
  {
    id: "fitmesh",
    name: "FitMesh Sync",
    url: "https://www.fitmesh.fit",
    handle: "fitmesh.fit",
    status: "LIVE",
    year: 2025,
    stack: ["Flutter", "Supabase", "Next.js"],
    brand: "#22c55e",
    copy: {
      it: {
        tagline: "Sincronizzazione wearable e dashboard salute personale.",
        description:
          "Applicazione Android e dashboard web per la sincronizzazione di dispositivi Galaxy Watch e Wear OS. Visualizzazione di metriche e trend, esportazione dei dati, architettura privacy-first.",
      },
      en: {
        tagline: "Wearable sync and personal health dashboard.",
        description:
          "Android app and web dashboard syncing Galaxy Watch and Wear OS devices. Metrics, trends, data export, privacy-first architecture.",
      },
    },
  },
  {
    id: "splitvote",
    name: "SplitVote",
    url: "https://splitvote.io",
    handle: "splitvote.io",
    status: "LIVE",
    year: 2024,
    stack: ["Next.js", "Edge", "TypeScript"],
    brand: "#c084fc",
    copy: {
      it: {
        tagline: "Voto e sondaggi per gruppi, senza registrazione.",
        description:
          "Piattaforma web per la creazione e gestione di sondaggi e votazioni di gruppo. Senza account, senza tracciamento. In evoluzione verso un'applicazione mobile dedicata.",
      },
      en: {
        tagline: "Group polls without sign-up.",
        description:
          "Web app for quick group polls and votes. No accounts, no tracking. Evolving into a dedicated mobile app.",
      },
    },
  },
  {
    id: "tavola-periodica",
    name: "Tavola Periodica",
    url: "/lab/tavola-periodica",
    handle: "lab · chimica",
    status: "LIVE",
    year: 2026,
    stack: ["Three.js", "WebGL", "React", "Next.js"],
    brand: "#60a5fa",
    copy: {
      it: {
        tagline: "118 elementi, atomi 3D e manuale interattivo.",
        description:
          "Tavola periodica interattiva con 118 elementi, heatmap fisiche, numeri di ossidazione, isotopo stabile, modalità mobile e modelli atomici Thomson, Rutherford, Bohr, Sommerfeld e quantistico. Include pagina about con fonti scientifiche e manuale d'uso bilingue.",
      },
      en: {
        tagline: "118 elements, 3D atoms and an interactive manual.",
        description:
          "Interactive periodic table with 118 elements, physical-property heatmaps, oxidation states, stable isotope, mobile support, and Thomson, Rutherford, Bohr, Sommerfeld and quantum atomic models. Includes scientific sources and a bilingual user manual.",
      },
    },
  },
  {
    id: "buco-nero",
    name: "Buco Nero",
    url: "/lab/buco-nero",
    handle: "lab · astrofisica",
    status: "LIVE",
    year: 2026,
    stack: ["Three.js", "WebGL", "GLSL", "Next.js"],
    brand: "#ff8a3c",
    copy: {
      it: {
        tagline: "Lensing di Kerr in tempo reale, disco e playground gravitazionale.",
        description:
          "Simulazione di un buco nero con ray-tracing delle geodetiche nulle esatte (Schwarzschild e Kerr) in tempo reale: lensing gravitazionale, ombra, photon ring e disco di accrescimento di Page–Thorne con Doppler relativistico. Include una demo di orbite relativistiche, un playground a N-corpi con disgregazione mareale e onde gravitazionali, una griglia spazio-tempo, un pannello a scala reale e pagine equazioni/FAQ bilingui.",
      },
      en: {
        tagline: "Real-time Kerr lensing, accretion disk and a gravitational playground.",
        description:
          "A black-hole simulation ray-tracing the exact null geodesics (Schwarzschild and Kerr) in real time: gravitational lensing, shadow, photon ring and a Page–Thorne accretion disk with relativistic Doppler. Includes a relativistic-orbits demo, an N-body playground with tidal disruption and gravitational waves, a spacetime grid, a real-scale panel and bilingual equations/FAQ pages.",
      },
    },
  },
  {
    id: "sitebrain",
    name: "SiteBrain AI",
    url: "/sitebrain",
    handle: "sitebrain.ai",
    status: "WIP",
    draft: true, // temporarily hidden from the public site

    year: 2026,
    stack: ["PHP", "WordPress", "OpenAI", "Anthropic", "OpenRouter", "GPLv2+"],
    brand: "#f59e0b",
    copy: {
      it: {
        tagline: "Chatbot RAG self-hosted per WordPress.",
        description:
          "Plugin WordPress con RAG engine self-hosted: indicizza pagine, post e contenuti del sito, poi risponde ai visitatori con OpenAI, Anthropic o OpenRouter. Privacy-first, GDPR-ready, handoff lead integrato e licenze premium in preparazione.",
      },
      en: {
        tagline: "Self-hosted RAG chatbot for WordPress.",
        description:
          "WordPress plugin with a self-hosted RAG engine: indexes pages, posts and site content, then answers visitors via OpenAI, Anthropic or OpenRouter. Privacy-first, GDPR-ready, built-in lead handoff and premium licenses in progress.",
      },
    },
  },
];

// Public list: drafts (e.g. SiteBrain AI, temporarily pulled) are hidden.
export const projects: Project[] = allProjects.filter((p) => !p.draft);
