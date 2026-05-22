// Minimal dictionary-based i18n. No external lib — keeps bundle tiny and
// stays compatible with Server Components. Add keys here as the site grows.

import type { Locale } from "./site";

type Dict = {
  nav: {
    about: string;
    projects: string;
    blog: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    title1: string;
    titleRotating: [string, string, string]; // 3 words for the rotator
    paragraph: (name: string, brand: string) => string;
    ctaProjects: string;
    ctaContact: string;
  };
  metrics: {
    projects: string;
    projectsSub: string;
    since: string;
    sinceSub: string;
    base: string;
    baseSub: string;
    stack: string;
    stackSub: string;
  };
  about: {
    eyebrow: string;
    headline1: string;
    headline2: string;
    paragraphs: string[];
    closingNote: string;
    meta: {
      basedLabel: string;
      basedValue: string;
      stackLabel: string;
      stackValue: string;
      sinceLabel: string;
      teachesLabel: string;
    };
  };
  projects: {
    eyebrow: string;
    headline: string;
    statusLine: string;
    openProject: string;
    pendingLabel: string;
    pendingText: string;
    pendingCta: string;
  };
  blog: {
    eyebrow: string;
    headline: string;
    paragraph: string;
    allPostsCta: string;
    read: string;
    minRead: (n: number) => string;
  };
  contact: {
    eyebrow: string;
    headline: string;
    paragraph: string;
    emailLabel: string;
  };
  footer: {
    line1: string;
    line2: string;
    status: string;
  };
};

const it: Dict = {
  nav: { about: "Chi sono", projects: "Progetti", blog: "Blog", contact: "Contatti" },
  hero: {
    eyebrow: "SVILUPPATORE INDIPENDENTE · Roma · Dal 2017",
    title1: "Sviluppo software",
    titleRotating: ["indipendente.", "sostenibile.", "su misura."],
    paragraph: (name, brand) =>
      `Sono ${name}, sviluppatore con base a Roma. ${brand} è il nome sotto cui pubblico i miei progetti: applicazioni, dashboard e strumenti per web e mobile.`,
    ctaProjects: "Esplora i progetti",
    ctaContact: "Contatti",
  },
  metrics: {
    projects: "PROGETTI",
    projectsSub: "attivi",
    since: "DAL",
    sinceSub: "sviluppo software",
    base: "BASE",
    baseSub: "Italia",
    stack: "STACK",
    stackSub: "principali",
  },
  about: {
    eyebrow: "§ I — Chi sono",
    headline1: "Matteo",
    headline2: "Pizzi.",
    paragraphs: [
      "Sviluppo software dal 2017. Ho lavorato in agenzie e team di prodotto; da qualche tempo dedico la maggior parte del tempo a progetti propri.",
      "Fosforonero è il nome sotto cui raggruppo questi progetti. Niente azienda, niente team — solo un punto unico per chi vuole sapere a cosa lavoro.",
      "In parallelo al lavoro indipendente, insegno sviluppo software presso Orangee Academy. Confrontarsi con chi sta imparando è il modo migliore per restare onesti con i fondamentali.",
    ],
    closingNote:
      "Disponibile per consulenze tecniche, sviluppo di prototipi e supporto a progetti esistenti. Per richieste, scrivimi via email.",
    meta: {
      basedLabel: "// sede",
      basedValue: "Roma, Italia",
      stackLabel: "// stack",
      stackValue: "Flutter · Next.js · Supabase · TypeScript · PHP · WordPress · SEO",
      sinceLabel: "// dal",
      teachesLabel: "// insegna",
    },
  },
  projects: {
    eyebrow: "§ II — Progetti",
    headline: "Progetti.",
    statusLine: "02 ATTIVI · 01 IN SVILUPPO",
    openProject: "Apri progetto",
    pendingLabel: "03 · IN SVILUPPO",
    pendingText: "Progetto non ancora pubblico",
    pendingCta: "PROSSIMAMENTE",
  },
  blog: {
    eyebrow: "§ III — Scritti",
    headline: "Note tecniche.",
    paragraph:
      "Note di lavoro, retrospettive di progetti, scelte tecniche. Aggiornato quando ho qualcosa di concreto da raccontare.",
    allPostsCta: "TUTTI GLI ARTICOLI",
    read: "LEGGI",
    minRead: (n) => `${n} min di lettura`,
  },
  contact: {
    eyebrow: "§ IV — Contatti",
    headline: "Contatti.",
    paragraph:
      "Per qualsiasi richiesta, scrivere direttamente all'indirizzo email. Rispondo entro pochi giorni.",
    emailLabel: "EMAIL",
  },
  footer: {
    line1: "© MMXXVI · FOSFORONERO · ROMA, ITALIA",
    line2: "Matteo Pizzi · Sviluppatore",
    status: "● Attivo dal 2017",
  },
};

const en: Dict = {
  nav: { about: "About", projects: "Projects", blog: "Writing", contact: "Contact" },
  hero: {
    eyebrow: "INDEPENDENT DEVELOPER · Rome · Since 2017",
    title1: "Building software",
    titleRotating: ["independently.", "sustainably.", "tailored."],
    paragraph: (name, brand) =>
      `I'm ${name}, a software engineer based in Rome. ${brand} is the name I publish my projects under: applications, dashboards and tooling for web and mobile.`,
    ctaProjects: "Browse projects",
    ctaContact: "Get in touch",
  },
  metrics: {
    projects: "PROJECTS",
    projectsSub: "shipping",
    since: "SINCE",
    sinceSub: "building software",
    base: "BASED IN",
    baseSub: "Italy",
    stack: "STACK",
    stackSub: "primary",
  },
  about: {
    eyebrow: "§ I — About",
    headline1: "Matteo",
    headline2: "Pizzi.",
    paragraphs: [
      "Building software since 2017. I've worked across agencies and product teams; lately, most of my time goes into my own projects.",
      "Fosforonero is the umbrella for that work. No company, no team — a single place for anyone curious about what I'm shipping.",
      "Alongside the independent practice, I teach software development at Orangee Academy. Working with people who are still learning is the best way to stay honest about the fundamentals.",
    ],
    closingNote:
      "Available for technical consulting, prototyping and support on existing codebases. For inquiries, send me an email.",
    meta: {
      basedLabel: "// based",
      basedValue: "Rome, Italy",
      stackLabel: "// stack",
      stackValue: "Flutter · Next.js · Supabase · TypeScript · PHP · WordPress · SEO",
      sinceLabel: "// since",
      teachesLabel: "// teaches at",
    },
  },
  projects: {
    eyebrow: "§ II — Projects",
    headline: "Projects.",
    statusLine: "02 SHIPPING · 01 IN PROGRESS",
    openProject: "Open project",
    pendingLabel: "03 · IN PROGRESS",
    pendingText: "Not public yet",
    pendingCta: "COMING SOON",
  },
  blog: {
    eyebrow: "§ III — Writing",
    headline: "Technical notes.",
    paragraph:
      "Working notes, project retrospectives, technical decisions. Updated whenever there's something concrete worth sharing.",
    allPostsCta: "ALL POSTS",
    read: "READ",
    minRead: (n) => `${n} min read`,
  },
  contact: {
    eyebrow: "§ IV — Contact",
    headline: "Contact.",
    paragraph:
      "For any inquiry, please send a direct email. I usually reply within a couple of days.",
    emailLabel: "EMAIL",
  },
  footer: {
    line1: "© MMXXVI · FOSFORONERO · ROME, ITALY",
    line2: "Matteo Pizzi · Software engineer",
    status: "● Active since 2017",
  },
};

const dictionaries: Record<Locale, Dict> = { it, en };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export type Dictionary = Dict;
