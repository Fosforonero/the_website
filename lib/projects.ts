// Project catalogue. Add new projects here; the homepage iterates over this.
import type { Locale } from "./site";

export type Project = {
  id: string;
  name: string;
  url: string;
  handle: string;
  status: "LIVE" | "ACTIVE" | "WIP";
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
];
