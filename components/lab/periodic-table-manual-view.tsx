import Link from "next/link";
import { site, type Locale } from "@/lib/site";

type ManualStep = {
  title: string;
  body: string;
};

type ManualSection = {
  id: string;
  title: string;
  body?: string;
  items?: ManualStep[];
};

const MANUAL = {
  it: {
    navBack: "← tavola periodica",
    navAbout: "fonti e roadmap",
    tag: "FOSFORONERO LAB · MANUALE",
    h1: "Manuale della Tavola Periodica 3D",
    lead:
      "Guida rapida per usare la tavola periodica interattiva di Fosforonero: ricerca elementi, viste tematiche, modelli atomici 3D, pannello dati e controlli mobile.",
    updated: "Aggiornato al 30 maggio 2026",
    appLabel: "Apri la tavola",
    aboutLabel: "Leggi fonti e roadmap",
    tocTitle: "Indice",
    faqTitle: "Domande rapide",
    sections: [
      {
        id: "iniziare",
        title: "1. Iniziare",
        body:
          "La schermata iniziale mostra tutti i 118 elementi. Ogni cella contiene numero atomico, simbolo, nome e massa atomica. Clicca una volta per evidenziare un elemento; clicca di nuovo sullo stesso elemento per aprire la vista atomica 3D.",
        items: [
          { title: "Ricerca", body: "Usa il campo in alto per cercare per nome, simbolo o numero atomico. Se il risultato è unico, premi Invio per aprirlo." },
          { title: "Lingua", body: "Il selettore IT / EN cambia lingua mantenendo la stessa sezione della tavola. Se sei su un atomo, conserva anche il numero atomico selezionato." },
          { title: "Tema", body: "Il pulsante chiaro/scuro cambia contrasto e palette. Le preferenze principali restano salvate nel browser." },
        ],
      },
      {
        id: "viste",
        title: "2. Viste della tavola",
        body:
          "La riga VISTA cambia il modo in cui le celle vengono colorate. Le viste non modificano i dati: servono a leggere pattern chimici e fisici direttamente sulla griglia.",
        items: [
          { title: "Categoria", body: "Evidenzia metalli alcalini, alcalino-terrosi, metalloidi, non metalli, alogeni, gas nobili, lantanidi e attinidi." },
          { title: "Proprietà fisiche", body: "Elettronegatività, raggio atomico, ionizzazione, densità, fusione, ebollizione, affinità elettronica e abbondanza in crosta diventano heatmap." },
          { title: "Stato fisico e blocco", body: "Mostrano stato della materia a temperatura ambiente e blocco elettronico s, p, d, f." },
          { title: "NEG", body: "Attiva la variante negativa della palette. È utile quando vuoi leggere valori e contrasti in modo più netto." },
        ],
      },
      {
        id: "atomo-3d",
        title: "3. Vista atomo 3D",
        body:
          "La vista atomo apre una scena WebGL interattiva. Puoi ruotare, zoomare e confrontare cinque modelli storici dello stesso elemento.",
        items: [
          { title: "Thomson", body: "Rappresenta l'atomo come carica positiva diffusa con elettroni immersi nella massa." },
          { title: "Rutherford", body: "Mostra nucleo compatto ed elettroni in orbita. È utile per visualizzare la separazione nucleo-elettroni." },
          { title: "Bohr", body: "Organizza gli elettroni in gusci energetici discreti. È la vista più leggibile per shell e configurazione." },
          { title: "Sommerfeld", body: "Introduce orbite ellittiche e rende più evidente la storia dei modelli atomici." },
          { title: "Quantistico", body: "Passa da traiettorie a regioni di probabilità, più vicine all'idea moderna di orbitale." },
        ],
      },
      {
        id: "controlli",
        title: "4. Controlli della scena",
        items: [
          { title: "Scala reale", body: "Aumenta la distanza relativa tra nucleo ed elettroni. È concettualmente più corretta, ma meno compatta." },
          { title: "VEL", body: "Regola la velocità dell'animazione degli elettroni." },
          { title: "Stelle", body: "Cambia l'intensità dello sfondo stellare o lo disattiva." },
          { title: "vdW", body: "Mostra o cambia lo stile della sfera del raggio di van der Waals quando disponibile." },
          { title: "↑↓", body: "Mostra lo spin elettronico nei modelli Bohr, Rutherford e Sommerfeld." },
          { title: "Nucleo", body: "Nasconde gli elettroni e zooma sul nucleo. In alto vengono mostrati il numero di protoni (Z), neutroni (N) e nucleoni (A)." },
          { title: "Reticolo", body: "Disponibile per gli elementi solidi con struttura cristallina nota. Apre una vista 3D interattiva del reticolo (FCC, BCC, HCP, diamante, cubica semplice). Il cubo mostra la cella elementare (unit cell) in scala normalizzata. Le linee indicano contatti di coordinazione visuale, non necessariamente legami covalenti." },
          { title: "Molecole", body: "Disponibile per gli elementi con molecole comuni associate. Apre il visualizzatore 3D della molecola (balls-and-sticks) con indicazione del tipo di legame." },
          { title: "Inspector orbitali", body: "Attiva la visualizzazione di orbitali idrogenoidi isolati (1s, 2s, 2px/y/z, 3dz², 3dxy, 3dx²−y²). Mostra la forma della funzione d'onda: lobi, nodi radiali e angolari, fase (teal +, rosa −). La fase indica il segno di ψ, non la carica elettrica. Non coincide con la vista quantistica, che invece aggrega tutti i sottolivelli dell'elemento selezionato." },
          { title: "Legende contestuali", body: "Una legenda compatta appare in basso nella vista 3D e mostra i simboli del modello atomico attivo (shell, colori orbite, orientamento spin), della molecola (sfere = atomi CPK, aste = legami, modalità riempimento o polarità) o del reticolo (cubo = cella elementare, linee = coordinazione)." },
          { title: "K / °C / °F", body: "Cambia l'unità di temperatura del pannello dati. La preferenza viene salvata nel browser." },
          { title: "Slider temperatura", body: "Sposta lo slider tra 0 K e un massimo dinamico per l'elemento selezionato (min 1000 K, max 12 000 K). Il badge mostra lo stato fisico derivato a 1 atm: solido, liquido, gas o sconosciuto. I marcatori blu (fusione) e rosso (ebollizione) sul cursore indicano le soglie di transizione quando i dati sono disponibili. Il pulsante ↺ riporta a 298,15 K (25°C). Solo lo stato fisico cambia con lo slider — densità, raggio e altre proprietà restano dati tabulati a condizioni standard." },
          { title: "Schermo intero canvas", body: "Il pulsante ⊞ in alto a destra nel canvas espande la scena 3D a tutta la larghezza, nascondendo il pannello dati. Premi ⊡ per tornare alla vista a due colonne. Funziona per tutti i modelli atomici, l'Inspector orbitali, il reticolo e la vista molecole." },
          { title: "Inspector orbitali — collassabile", body: "Nella vista Inspector orbitali, clicca sull'intestazione del pannello (nome + famiglia + ▼/▲) per espandere o collassare i dettagli. Quando collassato, nome e famiglia rimangono visibili. Utile su schermi piccoli dove il pannello copre parte della scena." },
        ],
      },
      {
        id: "pannello-dati",
        title: "5. Leggere il pannello dati",
        body:
          "Il pannello laterale riassume proprietà chimiche e fisiche. I dati sono pensati come riferimento rapido, non come sostituto di un manuale universitario.",
        items: [
          { title: "Configurazione shell", body: "Indica quanti elettroni occupano i livelli principali." },
          { title: "Numeri di ossidazione", body: "Mostrano gli stati comuni o teorici dell'elemento nelle reazioni." },
          { title: "Temperature", body: "Fusione ed ebollizione sono leggibili in Kelvin, Celsius o Fahrenheit quando disponibili." },
          { title: "Struttura cristallina", body: "Per i solidi mostra la struttura reticolare dominante con un diagramma 3D ruotante. Cliccalo per aprire la vista reticolo. Il cubo rappresenta la cella elementare in scala normalizzata didattica; le linee indicano coordinazione, non legami covalenti." },
          { title: "Molecole", body: "Mostra le molecole comuni dell'elemento come badge cliccabili. Cliccando si apre il visualizzatore 3D con formula, legami e tipo (covalente, polare, ionico)." },
          { title: "Modello quantistico", body: "Gli orbitali s, p, d, f sono visualizzati con colori diversi (ambra, blu, smeraldo, viola) e con le forme angolari derivate dalle funzioni d'onda idrogenoidi. Per esplorare un singolo orbitale con nodi e fase visibili, usa l'Inspector orbitali." },
          { title: "Descrizione", body: "Il testo introduttivo sintetizza ruolo, uso o comportamento dell'elemento." },
        ],
      },
      {
        id: "mobile",
        title: "6. Uso da mobile",
        body:
          "Su schermi piccoli la tavola resta esplorabile con scroll e zoom. Per evitare aperture accidentali, la selezione funziona in due passaggi anche su touch.",
        items: [
          { title: "Pinch-to-zoom", body: "Allarga la griglia con due dita quando vuoi leggere celle piccole." },
          { title: "Tap singolo", body: "Evidenzia l'elemento e aggiorna l'indicazione in basso." },
          { title: "Secondo tap", body: "Apre la vista atomica 3D dell'elemento selezionato." },
        ],
      },
      {
        id: "limiti",
        title: "7. Limiti e interpretazione",
        body:
          "La tavola usa modelli didattici e visualizzazioni qualitative. Le dimensioni, le orbite e le nubi elettroniche aiutano a capire relazioni e storia dei modelli, ma non sono una simulazione quantistica completa.",
        items: [
          { title: "Modelli storici", body: "Thomson, Rutherford, Bohr e Sommerfeld sono inclusi per confronto storico, non perché descrivano tutti l'atomo moderno." },
          { title: "Dati mancanti", body: "Per alcuni elementi sintetici o instabili alcune proprietà possono essere assenti, stimate o non applicabili." },
          { title: "Slider temperatura", body: "Lo slider varia solo la classificazione di fase (solido/liquido/gas) e la disponibilità della vista reticolo. Pressione assunta: 1 atm. La struttura cristallina, la densità e le altre proprietà tabulari non variano con la temperatura — richiederebbero dataset termici completi non disponibili per tutti i 118 elementi. L'arsenico (As) è un caso speciale: sublima a 1 atm e non ha fase liquida stabile." },
          { title: "Scale nucleo–orbite", body: "Le distanze tra nucleo e orbite elettroniche sono didattiche, non in scala fisica reale. Nei modelli storici (Bohr, Sommerfeld, Rutherford) le orbite hanno una distanza minima garantita dal nucleo visivo per evitare sovrapposizioni che renderebbero la visualizzazione illeggibile. Il modello quantistico non applica questo vincolo perché la densità elettronica al nucleo è fisicamente corretta per gli orbitali s." },
          { title: "Fonti", body: "La pagina about elenca IUPAC, NIST, PubChem e WebElements come riferimenti dati principali." },
        ],
      },
    ] satisfies ManualSection[],
    faqs: [
      { title: "La tavola periodica è gratuita?", body: "Sì. È accessibile dal browser senza account, installazione o paywall." },
      { title: "Posso usarla a scuola?", body: "Sì, come supporto didattico e visuale. Per dati ufficiali o verifiche scientifiche usa sempre anche le fonti citate nella pagina about." },
      { title: "Perché ci sono modelli atomici superati?", body: "Perché aiutano a capire come è cambiata l'idea di atomo nella storia della scienza." },
    ],
  },
  en: {
    navBack: "← periodic table",
    navAbout: "sources and roadmap",
    tag: "FOSFORONERO LAB · MANUAL",
    h1: "Interactive 3D Periodic Table Manual",
    lead:
      "A practical guide to Fosforonero's interactive periodic table: element search, thematic views, 3D atomic models, data panel, and mobile controls.",
    updated: "Updated on May 30, 2026",
    appLabel: "Open the table",
    aboutLabel: "Read sources and roadmap",
    tocTitle: "Contents",
    faqTitle: "Quick questions",
    sections: [
      {
        id: "start",
        title: "1. Getting started",
        body:
          "The initial screen shows all 118 elements. Each cell contains atomic number, symbol, name, and atomic mass. Click once to highlight an element; click the same element again to open its 3D atomic view.",
        items: [
          { title: "Search", body: "Use the search field to find an element by name, symbol, or atomic number. If there is only one match, press Enter to open it." },
          { title: "Language", body: "The IT / EN selector changes language while preserving the current table state. When viewing an atom, it keeps the selected atomic number." },
          { title: "Theme", body: "The light/dark control changes contrast and palette. Main preferences are stored in the browser." },
        ],
      },
      {
        id: "views",
        title: "2. Table views",
        body:
          "The VIEW row changes how cells are colored. Views do not change the data: they help reveal chemical and physical patterns directly on the grid.",
        items: [
          { title: "Category", body: "Highlights alkali metals, alkaline earths, metalloids, nonmetals, halogens, noble gases, lanthanides, and actinides." },
          { title: "Physical properties", body: "Electronegativity, atomic radius, ionization, density, melting point, boiling point, electron affinity, and crust abundance become heatmaps." },
          { title: "State and block", body: "Show state of matter at room temperature and electron block s, p, d, f." },
          { title: "NEG", body: "Enables the negative palette variant. It is useful when you want stronger contrast for values and categories." },
        ],
      },
      {
        id: "atom-3d",
        title: "3. 3D atom view",
        body:
          "The atom view opens an interactive WebGL scene. You can rotate, zoom, and compare five historical models of the same element.",
        items: [
          { title: "Thomson", body: "Represents the atom as a diffuse positive charge with electrons embedded in it." },
          { title: "Rutherford", body: "Shows a compact nucleus and orbiting electrons. Useful for seeing the nucleus-electron separation." },
          { title: "Bohr", body: "Places electrons into discrete energy shells. This is the clearest view for shells and configuration." },
          { title: "Sommerfeld", body: "Introduces elliptical orbits and makes the historical development of atomic models more visible." },
          { title: "Quantum", body: "Moves from trajectories to probability regions, closer to the modern idea of orbitals." },
        ],
      },
      {
        id: "controls",
        title: "4. Scene controls",
        items: [
          { title: "Real scale", body: "Increases the relative distance between nucleus and electrons. It is conceptually closer, but less compact." },
          { title: "Speed", body: "Controls electron animation speed." },
          { title: "Stars", body: "Changes starfield intensity or turns it off." },
          { title: "vdW", body: "Shows or changes the van der Waals radius sphere style when available." },
          { title: "↑↓", body: "Shows electron spin in Bohr, Rutherford, and Sommerfeld models." },
          { title: "Nucleus", body: "Hides electrons and zooms into the nucleus. Proton (Z), neutron (N), and nucleon (A) counts are shown as an overlay." },
          { title: "Lattice", body: "Available for solid elements with a known crystal structure. Opens an interactive 3D lattice view (FCC, BCC, HCP, diamond, simple cubic). The cube shows the unit cell at a normalised scale. Lines show visual coordination contacts, not necessarily covalent bonds." },
          { title: "Molecules", body: "Available for elements with common associated molecules. Opens the 3D molecule viewer (balls-and-sticks) with formula, bonds, and bond type." },
          { title: "Orbital Inspector", body: "Displays isolated hydrogen-like orbitals (1s, 2s, 2px/y/z, 3dz², 3dxy, 3dx²−y²). Shows wavefunction shape: lobes, radial and angular nodes, phase (teal +, rose −). Phase indicates the sign of ψ, not electric charge. Unlike the quantum view, which aggregates all subshells of the selected element." },
          { title: "Contextual legends", body: "A compact legend appears at the bottom of the 3D view and shows the symbols for the active atomic model (shells, orbit colours, spin orientation), molecule (spheres = CPK atoms, sticks = bonds, filling or polarity mode) or lattice (cube = unit cell, lines = coordination)." },
          { title: "K / °C / °F", body: "Cycles the temperature unit used in the data panel. The preference is saved in the browser." },
          { title: "Temperature slider", body: "Drag the slider between 0 K and a dynamic maximum for the selected element (min 1000 K, max 12 000 K). The badge shows the derived physical state at 1 atm: solid, liquid, gas, or unknown. Blue (melting) and red (boiling) markers on the track indicate transition thresholds when data are available. The ↺ button resets to 298.15 K (25 °C). Only physical state changes with the slider — density, radius, and other properties remain tabulated at standard conditions." },
          { title: "Fullscreen canvas", body: "The ⊞ button at the top-right of the canvas expands the 3D scene to full width, hiding the data panel. Press ⊡ to return to the two-column layout. Works for all atomic models, the Orbital Inspector, lattice, and molecule views." },
          { title: "Orbital Inspector — collapsible", body: "In the Orbital Inspector view, click the panel header (name + family + ▼/▲) to expand or collapse the details. When collapsed, name and family remain visible. Useful on small screens where the panel covers part of the scene." },
        ],
      },
      {
        id: "data-panel",
        title: "5. Reading the data panel",
        body:
          "The side panel summarizes chemical and physical properties. It is designed as a quick reference, not as a replacement for a university handbook.",
        items: [
          { title: "Shell configuration", body: "Shows how many electrons occupy the main energy levels." },
          { title: "Oxidation states", body: "Lists common or theoretical oxidation states for reactions." },
          { title: "Temperatures", body: "Melting and boiling points are readable in Kelvin, Celsius, or Fahrenheit when available." },
          { title: "Crystal structure", body: "For solid elements, shows the dominant lattice with a rotating 3D unit cell diagram. Click it to open the lattice view. The cube is the unit cell at a normalised didactic scale; lines show coordination contacts, not covalent bonds." },
          { title: "Molecules", body: "Shows common molecules as clickable badges. Clicking opens the 3D viewer with formula, bonds, and bond type (covalent, polar, ionic)." },
          { title: "Quantum model", body: "s, p, d, f orbitals are shown with distinct colors (amber, blue, emerald, violet) and the correct angular shapes derived from hydrogen-like wave functions. To explore a single orbital with visible nodes and phase, use the Orbital Inspector." },
          { title: "Description", body: "The introductory text summarizes role, use, or behavior of the element." },
        ],
      },
      {
        id: "mobile",
        title: "6. Mobile use",
        body:
          "On small screens the table remains usable with scrolling and zoom. To avoid accidental openings, touch selection also works in two steps.",
        items: [
          { title: "Pinch to zoom", body: "Expand the grid with two fingers when cells are too small to read." },
          { title: "Single tap", body: "Highlights the element and updates the bottom hint." },
          { title: "Second tap", body: "Opens the 3D atomic view for the selected element." },
        ],
      },
      {
        id: "limits",
        title: "7. Limits and interpretation",
        body:
          "The table uses educational models and qualitative visualizations. Sizes, orbits, and electron clouds help explain relationships and the history of models, but they are not a complete quantum simulation.",
        items: [
          { title: "Historical models", body: "Thomson, Rutherford, Bohr, and Sommerfeld are included for historical comparison, not because they all describe the modern atom." },
          { title: "Missing data", body: "For some synthetic or unstable elements, some properties may be absent, estimated, or not applicable." },
          { title: "Temperature slider", body: "The slider only changes phase classification (solid/liquid/gas) and crystal lattice availability. Pressure assumed: 1 atm. Crystal structure, density, and other tabulated properties do not vary with temperature — full thermal datasets are not available for all 118 elements. Arsenic (As) is a special case: it sublimes at 1 atm and has no stable liquid phase." },
          { title: "Nucleus–orbit distances", body: "Distances between the nucleus and electron orbits are educational, not physically to scale. In historical models (Bohr, Sommerfeld, Rutherford) orbits have a guaranteed minimum clearance from the visual nucleus to avoid overlaps that would make the visualization unreadable. The quantum model does not apply this constraint because electron density at the nucleus is physically correct for s orbitals." },
          { title: "Sources", body: "The about page lists IUPAC, NIST, PubChem, and WebElements as the main data references." },
        ],
      },
    ] satisfies ManualSection[],
    faqs: [
      { title: "Is the periodic table free?", body: "Yes. It runs in the browser with no account, install, or paywall." },
      { title: "Can I use it in school?", body: "Yes, as a teaching and visual support. For official data or scientific checks, also use the sources cited on the about page." },
      { title: "Why are outdated atomic models included?", body: "Because they help explain how the idea of the atom changed through the history of science." },
    ],
  },
} as const;

export function PeriodicTableManualView({ locale }: { locale: Locale }) {
  const t = MANUAL[locale];
  const prefix = locale === "en" ? "/en" : "";
  const appPath = `${prefix}/lab/tavola-periodica`;
  const aboutPath = `${prefix}/lab/tavola-periodica/about`;
  const manualPath = locale === "en" ? "/en/lab/tavola-periodica/manual" : "/lab/tavola-periodica/manuale";
  const pageUrl = `${site.url}${manualPath}`;
  const appUrl = `${site.url}${appPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        name: t.h1,
        description: t.lead,
        url: pageUrl,
        inLanguage: locale === "en" ? "en-US" : "it-IT",
        isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
        about: {
          "@type": "WebApplication",
          name: locale === "en" ? "Interactive 3D Periodic Table" : "Tavola Periodica Interattiva 3D",
          url: appUrl,
          applicationCategory: "EducationalApplication",
        },
      },
      {
        "@type": "HowTo",
        name: t.h1,
        description: t.lead,
        totalTime: "PT5M",
        step: t.sections.slice(0, 6).map((section, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: section.title,
          text: [section.body, ...(section.items ?? []).map((item) => `${item.title}: ${item.body}`)]
            .filter(Boolean)
            .join(" "),
          url: `${pageUrl}#${section.id}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.title,
          acceptedAnswer: { "@type": "Answer", text: faq.body },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Lab", item: `${site.url}/lab` },
          { "@type": "ListItem", position: 3, name: locale === "en" ? "Periodic Table" : "Tavola Periodica", item: appUrl },
          { "@type": "ListItem", position: 4, name: locale === "en" ? "Manual" : "Manuale", item: pageUrl },
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
        .pm {
          min-height: 100dvh;
          background: #0c0c18;
          color: #c8c8d8;
          font-family: var(--font-mono, ui-monospace, monospace);
          padding: 0 0 96px;
        }
        .pm-nav {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(12,12,24,0.94);
          backdrop-filter: blur(8px);
        }
        .pm-nav-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .pm-chip {
          color: rgba(238,238,248,0.72);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          padding: 6px 13px;
          text-decoration: none;
          font-size: 11px;
        }
        .pm-chip:hover { color: #eeeef8; border-color: rgba(255,255,255,0.34); }
        .pm-brand {
          color: rgba(200,200,216,0.36);
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.08em;
        }
        .pm-body {
          max-width: 980px;
          margin: 0 auto;
          padding: 56px 24px 0;
        }
        .pm-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
          gap: clamp(28px, 5vw, 64px);
          align-items: start;
          margin-bottom: 56px;
        }
        .pm-tag {
          margin: 0 0 14px;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: rgba(200,200,216,0.38);
        }
        .pm h1 {
          margin: 0 0 20px;
          color: #eeeef8;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: clamp(34px, 6vw, 64px);
          font-weight: 400;
          line-height: 0.96;
          letter-spacing: 0;
        }
        .pm-lead {
          max-width: 660px;
          margin: 0 0 22px;
          color: rgba(200,200,216,0.72);
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: clamp(17px, 2vw, 22px);
          line-height: 1.45;
        }
        .pm-updated {
          margin: 0;
          color: rgba(200,200,216,0.42);
          font-size: 11px;
        }
        .pm-cta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 26px; }
        .pm-cta-primary {
          color: #06110a;
          background: #34d26f;
          border: 1px solid #34d26f;
          border-radius: 999px;
          padding: 10px 16px;
          text-decoration: none;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          font-weight: 600;
        }
        .pm-cta-secondary {
          color: rgba(238,238,248,0.78);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          padding: 10px 16px;
          text-decoration: none;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
        }
        .pm-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          padding: 22px;
        }
        .pm-toc-title {
          margin: 0 0 14px;
          color: rgba(200,200,216,0.38);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .pm-toc {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .pm-toc a {
          color: #eeeef8;
          text-decoration: none;
          font-size: 13px;
          line-height: 1.35;
        }
        .pm-toc a:hover { color: #34d26f; }
        .pm-section {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: clamp(20px, 4vw, 48px);
          padding: 42px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .pm-section h2 {
          position: sticky;
          top: 74px;
          align-self: start;
          margin: 0;
          color: #eeeef8;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 22px;
          font-weight: 500;
          line-height: 1.12;
          letter-spacing: 0;
        }
        .pm-section-body > p {
          margin: 0 0 22px;
          color: rgba(200,200,216,0.68);
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 16px;
          line-height: 1.72;
        }
        .pm-list {
          display: grid;
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .pm-list li {
          display: grid;
          grid-template-columns: minmax(120px, 190px) minmax(0, 1fr);
          gap: 18px;
          padding: 16px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .pm-list strong {
          color: #34d26f;
          font-weight: 600;
          font-size: 13px;
        }
        .pm-list span {
          color: rgba(200,200,216,0.62);
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 15px;
          line-height: 1.58;
        }
        .pm-faq {
          margin-top: 32px;
          padding-top: 42px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .pm-faq h2 {
          margin: 0 0 20px;
          color: #eeeef8;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 28px;
          font-weight: 500;
          letter-spacing: 0;
        }
        .pm-faq-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .pm-faq article {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 18px;
          background: rgba(255,255,255,0.025);
        }
        .pm-faq h3 {
          margin: 0 0 10px;
          color: #eeeef8;
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 16px;
          font-weight: 500;
        }
        .pm-faq p {
          margin: 0;
          color: rgba(200,200,216,0.62);
          font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
          font-size: 14px;
          line-height: 1.55;
        }
        @media (max-width: 820px) {
          .pm-body { padding: 40px 18px 0; }
          .pm-hero,
          .pm-section,
          .pm-list li,
          .pm-faq-grid { grid-template-columns: 1fr; }
          .pm-section h2 { position: static; }
          .pm-nav { align-items: flex-start; }
          .pm-brand { display: none; }
        }
      `}</style>

      <div className="pm">
        <nav className="pm-nav" aria-label={locale === "en" ? "Manual navigation" : "Navigazione manuale"}>
          <div className="pm-nav-group">
            <Link href={appPath} className="pm-chip">{t.navBack}</Link>
            <Link href={aboutPath} className="pm-chip">{t.navAbout}</Link>
          </div>
          <Link href={locale === "en" ? "/en" : "/"} className="pm-brand">fosforonero.com</Link>
        </nav>

        <main className="pm-body">
          <section className="pm-hero" aria-labelledby="manual-title">
            <div>
              <p className="pm-tag">{t.tag}</p>
              <h1 id="manual-title">{t.h1}</h1>
              <p className="pm-lead">{t.lead}</p>
              <p className="pm-updated">{t.updated}</p>
              <div className="pm-cta">
                <Link href={appPath} className="pm-cta-primary">{t.appLabel}</Link>
                <Link href={aboutPath} className="pm-cta-secondary">{t.aboutLabel}</Link>
              </div>
            </div>
            <aside className="pm-card" aria-labelledby="manual-toc">
              <h2 className="pm-toc-title" id="manual-toc">{t.tocTitle}</h2>
              <ol className="pm-toc">
                {t.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </aside>
          </section>

          {t.sections.map((section) => (
            <section className="pm-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <div className="pm-section-body">
                {section.body && <p>{section.body}</p>}
                {section.items && (
                  <ul className="pm-list">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <section className="pm-faq" aria-labelledby="manual-faq">
            <h2 id="manual-faq">{t.faqTitle}</h2>
            <div className="pm-faq-grid">
              {t.faqs.map((faq) => (
                <article key={faq.title}>
                  <h3>{faq.title}</h3>
                  <p>{faq.body}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
