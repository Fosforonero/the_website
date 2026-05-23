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
    legal: {
      privacy: string;
      cookies: string;
      cookieSettings: string;
    };
  };
  cookie: {
    title: string;
    body: string;
    bodyLink: string;
    acceptAll: string;
    rejectAll: string;
    manage: string;
    savePrefs: string;
    close: string;
    necessary: {
      name: string;
      desc: string;
    };
    analytics: {
      name: string;
      desc: string;
    };
    learnMore: string;
  };
  legal: {
    privacyTitle: string;
    cookieTitle: string;
    lastUpdated: (iso: string) => string;
  };
  comingSoon: {
    eyebrow: string;
    title: string;
    body: string;
    emailLabel: string;
    projectsLabel: string;
    socials: string;
    blogLink: string;
  };
  instagram: {
    eyebrow: string;
    title: string;
    body: string;
    openOriginal: string;
    close: string;
    typeLabel: (t: "image" | "video" | "carousel") => string;
    empty: string;
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
    ],
    closingNote:
      "Disponibile per consulenze tecniche, sviluppo di prototipi e supporto a progetti esistenti. Per richieste, scrivimi via email.",
    meta: {
      basedLabel: "// sede",
      basedValue: "Roma, Italia",
      stackLabel: "// stack",
      stackValue: "Flutter · Next.js · Supabase · TypeScript · PHP · WordPress · SEO",
      sinceLabel: "// dal",
    },
  },
  projects: {
    eyebrow: "§ II — Progetti",
    headline: "Progetti.",
    statusLine: "02 LIVE · 01 IN BETA",
    openProject: "Apri progetto",
    pendingLabel: "04 · IN ARRIVO",
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
    legal: {
      privacy: "Privacy",
      cookies: "Cookie",
      cookieSettings: "Preferenze cookie",
    },
  },
  cookie: {
    title: "Le tue preferenze sui cookie",
    body: "Questo sito usa cookie tecnici necessari al funzionamento. Per misurare l'audience in forma aggregata usiamo Google Analytics 4 in modalità consenso (Consent Mode v2), con cookie attivati solo dopo la tua scelta esplicita.",
    bodyLink: "Maggiori dettagli nella Cookie Policy.",
    acceptAll: "Accetta tutti",
    rejectAll: "Rifiuta tutti",
    manage: "Personalizza",
    savePrefs: "Salva preferenze",
    close: "Chiudi (equivale a rifiuto)",
    necessary: {
      name: "Necessari",
      desc: "Indispensabili per il funzionamento del sito. Includono la memorizzazione delle tue preferenze sui cookie. Sempre attivi.",
    },
    analytics: {
      name: "Analitici",
      desc: "Google Analytics 4 con IP anonimizzato. Aiutano a capire come viene usato il sito, senza profilazione individuale.",
    },
    learnMore: "Leggi la Cookie Policy",
  },
  legal: {
    privacyTitle: "Privacy Policy",
    cookieTitle: "Cookie Policy",
    lastUpdated: (iso) => `Ultimo aggiornamento: ${new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}`,
  },
  comingSoon: {
    eyebrow: "● IN ARRIVO",
    title: "Prossimamente.",
    body: "Il sito istituzionale di Fosforonero è in fase di completamento. Per qualsiasi richiesta, scrivimi via email.",
    emailLabel: "EMAIL",
    projectsLabel: "Progetti live",
    socials: "Altrove",
    blogLink: "Leggi gli appunti tecnici sul blog",
  },
  instagram: {
    eyebrow: "§ V — Instagram",
    title: "Dietro le quinte.",
    body: "Frammenti di build, screenshot, dietro le quinte. Aggiornato manualmente dal feed @fosforonero.",
    openOriginal: "Apri su Instagram",
    close: "Chiudi",
    typeLabel: (t) => (t === "video" ? "VIDEO" : t === "carousel" ? "CAROSELLO" : "IMMAGINE"),
    empty: "Nessun post ancora. Aggiorna content/instagram/posts.json per popolare la gallery.",
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
    ],
    closingNote:
      "Available for technical consulting, prototyping and support on existing codebases. For inquiries, send me an email.",
    meta: {
      basedLabel: "// based",
      basedValue: "Rome, Italy",
      stackLabel: "// stack",
      stackValue: "Flutter · Next.js · Supabase · TypeScript · PHP · WordPress · SEO",
      sinceLabel: "// since",
    },
  },
  projects: {
    eyebrow: "§ II — Projects",
    headline: "Projects.",
    statusLine: "02 LIVE · 01 IN BETA",
    openProject: "Open project",
    pendingLabel: "04 · IN PROGRESS",
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
    legal: {
      privacy: "Privacy",
      cookies: "Cookies",
      cookieSettings: "Cookie preferences",
    },
  },
  cookie: {
    title: "Your cookie preferences",
    body: "This site uses technical cookies that are strictly necessary. For aggregate audience measurement we use Google Analytics 4 in Consent Mode v2 — analytics cookies only fire after your explicit choice.",
    bodyLink: "Full details in the Cookie Policy.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    manage: "Customise",
    savePrefs: "Save preferences",
    close: "Close (counts as reject)",
    necessary: {
      name: "Necessary",
      desc: "Required for the site to work. They include storing your cookie choice. Always on.",
    },
    analytics: {
      name: "Analytics",
      desc: "Google Analytics 4 with anonymised IP. Helps us understand how the site is used, without individual profiling.",
    },
    learnMore: "Read the Cookie Policy",
  },
  legal: {
    privacyTitle: "Privacy Policy",
    cookieTitle: "Cookie Policy",
    lastUpdated: (iso) => `Last updated: ${new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`,
  },
  comingSoon: {
    eyebrow: "● LAUNCHING SOON",
    title: "Coming soon.",
    body: "The Fosforonero studio site is being finalised. For anything in the meantime, drop me an email.",
    emailLabel: "EMAIL",
    projectsLabel: "Live projects",
    socials: "Elsewhere",
    blogLink: "Read the technical notes on the blog",
  },
  instagram: {
    eyebrow: "§ V — Instagram",
    title: "Behind the scenes.",
    body: "Build fragments, screenshots, work-in-progress shots. Manually curated from the @fosforonero feed.",
    openOriginal: "Open on Instagram",
    close: "Close",
    typeLabel: (t) => (t === "video" ? "VIDEO" : t === "carousel" ? "CAROUSEL" : "IMAGE"),
    empty: "No posts yet. Update content/instagram/posts.json to populate the gallery.",
  },
};

const dictionaries: Record<Locale, Dict> = { it, en };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export type Dictionary = Dict;
