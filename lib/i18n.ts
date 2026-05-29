// Minimal dictionary-based i18n. No external lib — keeps bundle tiny and
// stays compatible with Server Components. Add keys here as the site grows.

import type { Locale } from "./site";

type Dict = {
  nav: {
    about: string;
    projects: string;
    blog: string;
    contact: string;
    identity: string;
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
    prevLabel: string;
    nextLabel: string;
    relatedTitle: string;
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
  identity: {
    eyebrow: string;
    title: string;
    subtitle: string;
    intro: string;
    nameTitle: string;
    nameBody: string[];
    symbolTitle: string;
    symbolBody: string;
    symbolAnnotations: { label: string; value: string }[];
    negativeTitle: string;
    negativeBody: string;
    paletteTitle: string;
    paletteBody: string;
    typoTitle: string;
    typoBody: string;
    typoSansLabel: string;
    typoMonoLabel: string;
    originTitle: string;
    originBody: string;
    backHome: string;
  };
};

const it: Dict = {
  nav: { about: "Chi sono", projects: "Progetti", blog: "Blog", contact: "Contatti", identity: "Identità" },
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
    projectsSub: "nel portfolio",
    since: "DAL",
    sinceSub: "sviluppo software",
    base: "BASE",
    baseSub: "Italia",
    stack: "STACK",
    stackSub: "core + AI",
  },
  about: {
    eyebrow: "§ I — Chi sono",
    headline1: "Matteo",
    headline2: "Pizzi.",
    paragraphs: [
      "Sviluppo software dal 2017. Ho lavorato in agenzie e team di prodotto; da qualche tempo dedico la maggior parte del tempo a progetti propri.",
      "Fosforonero è il nome sotto cui raggruppo questi progetti. Niente azienda, niente team — solo un punto unico per chi vuole sapere a cosa lavoro.",
      "Il nome è nato durante l'università, mentre studiavo per un esame di chimica. Mi colpì il fosforo nero: l'allotropo più stabile del fosforo (P, Z=15, gruppo 15 — quello dell'azoto), un semiconduttore a banda proibita diretta con una struttura a strati bidimensionali increspati. Esfoliato in un singolo strato atomico prende il nome di fosforene, ed è uno dei materiali più studiati per l'elettronica del prossimo decennio. Un materiale silenzioso, denso, stabile — fatto per durare. Mi è sembrato il nome giusto per quello che provo a fare con il software.",
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
    statusLine: "LAB · APP · TOOLING",
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
    prevLabel: "Articolo precedente",
    nextLabel: "Articolo successivo",
    relatedTitle: "Continua a leggere",
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
  identity: {
    eyebrow: "§ VI — Identità",
    title: "P¹⁵",
    subtitle: "Identità del marchio.",
    intro:
      "Il marchio Fosforonero nasce dalla tavola periodica: il Fosforo, elemento numero 15, e in particolare il suo allotropo più stabile — il fosforo nero. Questa pagina raccoglie il sistema visivo del progetto: il simbolo, la sua origine, la palette e la tipografia.",
    nameTitle: "Il nome",
    nameBody: [
      "Il nome è nato all'università, mentre studiavo per un esame di chimica. Mi colpì il fosforo nero: l'allotropo più stabile del fosforo (P, Z = 15, gruppo 15 — quello dell'azoto). A differenza del fosforo bianco (instabile, piroforico) e del rosso (amorfo, comune nei fiammiferi), il fosforo nero è il più ordinato e stabile dal punto di vista termodinamico.",
      "Ha una struttura a strati bidimensionali increspati simile a quella della grafite, ma è un semiconduttore a banda proibita diretta — conduce elettricità in modo controllato, non come il grafene che è un conduttore puro. Esfoliato in un singolo strato atomico prende il nome di fosforene ed è uno dei materiali più studiati per l'elettronica del prossimo decennio.",
      "Un materiale silenzioso, denso, stabile — fatto per durare. Il nome giusto per quello che provo a fare con il software.",
    ],
    symbolTitle: "Il simbolo",
    symbolBody:
      "Il logo è una tile in stile tavola periodica, costruita interamente in HTML/CSS — niente SVG, niente font icon. Si scala in modo nitido a qualsiasi risoluzione e i colori sono ereditati da variabili CSS, quindi cambia tema con il contesto. Sotto la massa atomica compare l'abbreviazione «3p³»: è il sotto-livello esterno della configurazione elettronica, la parte che colloca il Fosforo nel blocco-p della tavola periodica e ne determina il comportamento chimico.",
    symbolAnnotations: [
      { label: "15", value: "Numero atomico" },
      { label: "P", value: "Simbolo del Fosforo" },
      { label: "30.97", value: "Massa atomica (u)" },
      { label: "[Ne] 3s² 3p³", value: "Configurazione elettronica" },
    ],
    negativeTitle: "Variante negativa",
    negativeBody:
      "Per superfici scure (sezioni dark, overlay, favicon su browser in modalità dark) entrambe le varianti dispongono di un trattamento negativo: il riempimento diventa ink, il simbolo bianco, l'accento phosphor mantiene l'identità.",
    paletteTitle: "Colori",
    paletteBody:
      "Una palette stretta — tre neutri di fondo, due livelli di inchiostro, un solo accento. Il verde phosphor (#00A341) è l'unico colore acceso; tutto il resto è scala di grigio per non distrarre dal contenuto.",
    typoTitle: "Tipografia",
    typoBody:
      "Due famiglie variabili, entrambe self-hosted via next/font: Space Grotesk per il display, JetBrains Mono per dati, codice e micro-label. Zero richieste a terze parti, zero CLS.",
    typoSansLabel: "Display · Space Grotesk",
    typoMonoLabel: "Mono · JetBrains Mono",
    originTitle: "Riferimento scientifico",
    originBody:
      "Numero atomico Z = 15. Massa atomica 30,974 u. Configurazione elettronica completa: [Ne] 3s² 3p³ — sul logo mostriamo solo «3p³», la parte di valenza, gli elettroni che determinano il comportamento chimico dell'elemento. Gruppo 15 (gruppo dell'azoto), periodo 3, blocco p. Stati di ossidazione principali: +5 (il più comune), ±3, +4. Allotropi noti: bianco (piroforico, p.f. 44,2 °C), rosso (amorfo, sublima a ~170 °C, comune nei fiammiferi), nero (il più stabile termodinamicamente, semiconduttore a strati) e violetto. Il fosforo fu isolato per la prima volta nel 1669 dal chimico tedesco Hennig Brand. Il nome viene dal greco φωσφόρος (phōsphóros) — «portatore di luce».",
    backHome: "← Torna alla home",
  },
};

const en: Dict = {
  nav: { about: "About", projects: "Projects", blog: "Writing", contact: "Contact", identity: "Identity" },
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
    projectsSub: "in portfolio",
    since: "SINCE",
    sinceSub: "building software",
    base: "BASED IN",
    baseSub: "Italy",
    stack: "STACK",
    stackSub: "core + AI",
  },
  about: {
    eyebrow: "§ I — About",
    headline1: "Matteo",
    headline2: "Pizzi.",
    paragraphs: [
      "Building software since 2017. I've worked across agencies and product teams; lately, most of my time goes into my own projects.",
      "Fosforonero is the umbrella for that work. No company, no team — a single place for anyone curious about what I'm shipping.",
      "The name comes from university, while I was studying for a chemistry exam. I got fascinated by black phosphorus: the most stable allotrope of phosphorus (P, Z=15, group 15 — the nitrogen group), a direct-bandgap semiconductor with a puckered two-dimensional layered structure. Exfoliated down to a single atomic layer it becomes phosphorene — one of the most actively studied materials for the electronics of the next decade. A quiet, dense, stable material — built to last. It felt like the right name for the kind of software I try to build.",
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
    statusLine: "LAB · APPS · TOOLING",
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
    prevLabel: "Previous post",
    nextLabel: "Next post",
    relatedTitle: "Keep reading",
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
  identity: {
    eyebrow: "§ VI — Identity",
    title: "P¹⁵",
    subtitle: "Brand identity.",
    intro:
      "The Fosforonero mark comes straight out of the periodic table: Phosphorus, element 15, and specifically its most stable allotrope — black phosphorus. This page documents the project's visual system: the symbol, its origin, palette and typography.",
    nameTitle: "The name",
    nameBody: [
      "The name was born at university, while I was studying for a chemistry exam. I got fascinated by black phosphorus: the most stable allotrope of phosphorus (P, Z = 15, group 15 — the nitrogen group). Unlike white phosphorus (unstable, pyrophoric) and red phosphorus (amorphous, common in matches), black phosphorus is the most ordered and thermodynamically stable form.",
      "It has a puckered two-dimensional layered structure — similar to graphite — but it's a direct-bandgap semiconductor, meaning it conducts electricity in a controlled way, unlike graphene which is a pure conductor. Exfoliated down to a single atomic layer it becomes phosphorene, one of the most actively studied materials for the electronics of the next decade.",
      "A quiet, dense, stable material — built to last. The right name for the kind of software I try to build.",
    ],
    symbolTitle: "The symbol",
    symbolBody:
      "The logo is a periodic-table-style tile, built entirely in HTML/CSS — no SVG, no icon font. It scales crisply at any resolution and inherits its colors from CSS variables, so it adapts to the surrounding context. Below the atomic mass, the «3p³» shorthand stands for the outer subshell of the electron configuration — the portion that places Phosphorus in the p-block of the periodic table and governs the element's chemistry.",
    symbolAnnotations: [
      { label: "15", value: "Atomic number" },
      { label: "P", value: "Phosphorus symbol" },
      { label: "30.97", value: "Atomic mass (u)" },
      { label: "[Ne] 3s² 3p³", value: "Electron configuration" },
    ],
    negativeTitle: "Negative variant",
    negativeBody:
      "For dark surfaces (dark sections, overlays, favicons in dark-mode browsers) both variants have a negative treatment: the fill becomes ink, the symbol turns white, the phosphor accent keeps the brand identity.",
    paletteTitle: "Colors",
    paletteBody:
      "A tight palette — three neutral backgrounds, two ink levels, a single accent. Phosphor green (#00A341) is the only saturated color; everything else is grayscale so as not to distract from the content.",
    typoTitle: "Typography",
    typoBody:
      "Two variable families, both self-hosted via next/font: Space Grotesk for display, JetBrains Mono for data, code and micro-labels. Zero third-party requests, zero CLS.",
    typoSansLabel: "Display · Space Grotesk",
    typoMonoLabel: "Mono · JetBrains Mono",
    originTitle: "Scientific reference",
    originBody:
      "Atomic number Z = 15. Atomic mass 30.974 u. Full electron configuration: [Ne] 3s² 3p³ — on the logo we only show «3p³», the valence portion, the electrons that determine the chemistry of the element. Group 15 (nitrogen group), period 3, p-block. Main oxidation states: +5 (most common), ±3, +4. Known allotropes: white (pyrophoric, m.p. 44.2 °C), red (amorphous, sublimes at ~170 °C, used in matches), black (most thermodynamically stable, layered semiconductor) and violet. Phosphorus was first isolated in 1669 by the German chemist Hennig Brand. The name comes from the Greek φωσφόρος (phōsphóros) — «light-bearer».",
    backHome: "← Back home",
  },
};

const dictionaries: Record<Locale, Dict> = { it, en };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}

export type Dictionary = Dict;
