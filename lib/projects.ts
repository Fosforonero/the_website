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

export const projects: Project[] = [
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
        tagline: "Tutti i 118 elementi con atomo 3D in WebGL.",
        description:
          "Tavola periodica interattiva con visualizzazione tridimensionale dell'atomo per ogni elemento. Elettroni animati con trail luminosi, bloom post-processing e modelli Bohr/Schrödinger. Costruita con React Three Fiber direttamente nel browser.",
      },
      en: {
        tagline: "All 118 elements with a 3D WebGL atom viewer.",
        description:
          "Interactive periodic table with a real-time 3D atom for every element. Animated electrons with glow trails, bloom post-processing, and Bohr/Schrödinger models. Built with React Three Fiber in the browser.",
      },
    },
  },
  {
    id: "sitebrain",
    name: "SiteBrain AI",
    url: "/sitebrain",
    handle: "sitebrain.ai",
    status: "WIP",
    year: 2026,
    stack: ["PHP", "WordPress", "OpenAI", "Anthropic", "OpenRouter", "GPLv2+"],
    brand: "#f59e0b",
    copy: {
      it: {
        tagline: "Chatbot RAG self-hosted per WordPress, zero lock-in.",
        description:
          "Plugin WordPress con RAG engine self-hosted: indicizza pagine e post, risponde ai visitatori usando i tuoi contenuti effettivi con OpenAI, Anthropic o OpenRouter. Privacy-first, GDPR-ready, handoff lead integrato. Licenza base gratuita, licenze premium disponibili.",
      },
      en: {
        tagline: "Self-hosted RAG chatbot for WordPress, zero lock-in.",
        description:
          "WordPress plugin with a self-hosted RAG engine: indexes your pages and posts, answers visitors using your actual content via OpenAI, Anthropic, or OpenRouter. Privacy-first, GDPR-ready, built-in lead handoff. Free base license, premium licenses available.",
      },
    },
  },
];
