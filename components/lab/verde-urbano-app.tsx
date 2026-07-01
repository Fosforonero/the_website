"use client";

// Verde Urbano — interactive app demo.
//
// A concept civic app for re-greening Rome. Single, role-free flow: every user
// enters straight into the app and can donate, report or just explore, anytime.
// Screens: home, participatory map, a free "give what you can" donation into a
// common fund, a report flow, an "how it works / transparency" info screen and a
// profile — plus a bottom sheet, a FAB action sheet and a bottom tab bar.
// Fully bilingual (IT/EN). The structural chrome (device frame, status bar,
// safe-areas) lives in verde-urbano-view.tsx + verde-urbano.css; this file owns
// the app surface, its state and its content.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

export type Locale = "it" | "en";

/* Localised-string helper: a field that differs across locales is `{it,en}`;
   fields identical in both stay plain strings. */
type LS = string | { it: string; en: string };

type Need = "alta" | "media" | "bassa";

type Area = {
  id: string;
  name: string;
  zona: LS;
  need: Need;
  count: number;
  x: number;
  y: number;
  kind: LS;
};

type MyDonation = { id: string; amount: number; date: LS };

/* ----------------------------- static data ----------------------------- */

const AREAS: Area[] = [
  { id: "pinciano", name: "Viale del Pinciano", zona: { it: "Pinciano · Municipio II", en: "Pinciano · District II" }, need: "alta", count: 8, x: 60, y: 30, kind: { it: "Filare stradale", en: "Street tree row" } },
  { id: "montesacro", name: "Largo Valtournanche", zona: { it: "Montesacro · Municipio III", en: "Montesacro · District III" }, need: "alta", count: 11, x: 73, y: 16, kind: { it: "Piazza", en: "Square" } },
  { id: "tiburtino", name: "Parco Tiburtino", zona: { it: "Tiburtino · Municipio IV", en: "Tiburtino · District IV" }, need: "media", count: 6, x: 84, y: 42, kind: { it: "Area verde", en: "Green area" } },
  { id: "trastevere", name: "Lungotevere Ripa", zona: { it: "Trastevere · Municipio I", en: "Trastevere · District I" }, need: "bassa", count: 3, x: 37, y: 54, kind: { it: "Argine", en: "Riverbank" } },
  { id: "ostiense", name: "Piazzale Ostiense", zona: { it: "Ostiense · Municipio VIII", en: "Ostiense · District VIII" }, need: "media", count: 5, x: 49, y: 72, kind: { it: "Piazza", en: "Square" } },
  { id: "eur", name: "Viale Europa", zona: { it: "EUR · Municipio IX", en: "EUR · District IX" }, need: "media", count: 7, x: 53, y: 88, kind: { it: "Viale alberato", en: "Tree-lined avenue" } },
];

// Preset donation amounts (€) for the "give what you can" screen.
const AMOUNTS = [1, 2, 5, 10, 20, 50];

// Common-fund seed figures (session demo). Avg cost per tree used only to show a
// transparent "trees financed" derived number.
const FUND_START = 12480;
const AVG_TREE_COST = 75;

const INITIAL_DONATIONS: MyDonation[] = [
  { id: "d_seed1", amount: 25, date: { it: "2 sett. fa", en: "2 wks ago" } },
  { id: "d_seed2", amount: 10, date: { it: "1 mese fa", en: "1 month ago" } },
];

const NEED_META: Record<Need, { c: string; l: LS; soft: string }> = {
  alta: { c: "#E0654B", l: { it: "Priorità alta", en: "High priority" }, soft: "#FBE3DC" },
  media: { c: "#E59B26", l: { it: "Priorità media", en: "Medium priority" }, soft: "#FBEFD6" },
  bassa: { c: "#1B8A43", l: { it: "Priorità bassa", en: "Low priority" }, soft: "#E4F2DE" },
};

type ReportType = { id: string; label: LS; color: string; soft: string; icon: "tree" | "road" | "space" };
const REPORT_TYPES: ReportType[] = [
  { id: "abbattuto", label: { it: "Alberi abbattuti non sostituiti", en: "Felled trees, not replaced" }, color: "#E0654B", soft: "#FBE3DC", icon: "tree" },
  { id: "strada", label: { it: "Strada o filare senza alberature", en: "Street or row with no trees" }, color: "#E59B26", soft: "#FBEFD6", icon: "road" },
  { id: "spazio", label: { it: "Spazio pubblico da rinverdire", en: "Public space to re-green" }, color: "#1B8A43", soft: "#E4F2DE", icon: "space" },
];

/* ------------------------------ ui strings ----------------------------- */

const T = {
  it: {
    home: {
      hi: "Ciao 👋",
      title: "La tua Roma più verde",
      heroLabel: "ALBERI PIANTATI A ROMA",
      heroBig: "1.240",
      heroGoal: "su un obiettivo di 5.000 entro il 2027",
      heroDone: "25% completato",
      heroLeft: "3.760 mancanti",
      fundTitle: "Fondo comune",
      fundRaised: "raccolti",
      fundTrees: "alberi già finanziati · ogni euro tracciato",
      donate: "Dona quello che puoi",
      report: "Segnala un'area",
      near: "Aree che aspettano",
      map: "Mappa →",
      treesNeeded: "alberi richiesti",
      howTitle: "Come funziona",
      howBody: "Doni quello che puoi, i cittadini segnalano le aree, l'associazione pianta dove serve di più. Semplice e trasparente.",
      howCta: "Scopri di più",
    },
    map: {
      title: "Mappa partecipata",
      sub: "Le necessità di verde, segnalate dai cittadini di Roma.",
      allAreas: "Tutte le aree",
      highPrio: "Priorità alta",
      city: "Roma",
      legHigh: "Alta",
      legMid: "Media",
      legLow: "Bassa",
      legHint: "Il numero = alberi richiesti",
      tapHint: "Tocca un pin per vedere la necessità dell'area.",
    },
    sheet: {
      needed: "alberi richiesti",
      note: "Il fondo comune viene usato qui in base alla priorità dell'area — non scegli tu.",
      donate: "Dona al fondo comune",
      report: "Segnala un problema qui",
    },
    donate: {
      title: "Dona quello che puoi",
      sub: "Scegli un importo: va tutto nel fondo comune per gli alberi di Roma.",
      custom: "Altro importo",
      fundTitle: "Fondo comune",
      fundBody: "Nessun albero da scegliere: l'associazione usa il fondo per piantare dove serve di più. Ogni euro è tracciato.",
      how: "Come funziona →",
      cta: "Dona",
      pick: "Scegli un importo",
      demo: "Donazione simulata — questa è una demo.",
      thanks: ["Grazie!", "Il tuo contributo conta."],
      thanksTail: "entrano nel fondo comune. L'associazione li userà per piantare dove serve di più, in modo trasparente.",
      seeHow: "Come vengono usati i fondi",
      home: "Torna alla home",
    },
    report: {
      sent: ["Segnalazione", "inviata!"],
      sentBody: "Grazie. La tua segnalazione entra nella mappa partecipata e aiuta a orientare le prossime piantumazioni.",
      seeMap: "Vedi sulla mappa",
      home: "Torna alla home",
      head: "SEGNALA UN'AREA",
      q1: "Dov'è l'area?",
      q1sub: "Tocca la mappa per posizionare il punto.",
      tapPlace: "Tocca per posizionare",
      cont: "Continua",
      useLoc: "Usa la mia posizione attuale",
      q2: "Di che si tratta?",
      q2sub: "Aiutaci a capire la necessità.",
      q3: "Aggiungi dettagli",
      q3sub: "Una foto rende la segnalazione più utile.",
      photo: "Trascina o tocca per aggiungere una foto",
      notePh: "Descrivi l'area (facoltativo): es. filare con 6 ceppi non sostituiti…",
      send: "Invia segnalazione",
    },
    info: {
      title: "Come funziona",
      intro: "Un unico flusso, senza ruoli: puoi donare, segnalare o solo esplorare. Quando vuoi.",
      steps: [
        { t: "1 · Doni quello che puoi", b: "Anche 1 €. Tutte le donazioni confluiscono in un fondo comune." },
        { t: "2 · I cittadini segnalano", b: "Le segnalazioni costruiscono la mappa delle aree che hanno più bisogno di verde." },
        { t: "3 · L'associazione pianta", b: "Con il fondo, l'ente gestore finanzia le piantumazioni dove servono di più." },
      ],
      allocTitle: "Come vengono assegnati i fondi",
      alloc: ["Priorità alle aree con maggiore necessità", "Ordine cronologico delle segnalazioni", "Priorità definite dagli amministratori"],
      allocNote: "Assegnazione automatica e trasparente: non scegli tu quale albero finanziare.",
      transpTitle: "Trasparenza",
      transpBody: "Ogni euro è tracciato. L'associazione pubblica rendiconti e aggiornamenti sulle piantumazioni finanziate.",
      fundLabel: "raccolti nel fondo",
      treesLabel: "alberi finanziati",
      cta: "Dona quello che puoi",
    },
    profile: {
      name: "Marco Rossi",
      tag: "Cittadino attivo",
      donated: "donato",
      reports: "segnalazioni",
      donations: "donazioni",
      myDonations: "Le mie donazioni",
      myReports: "Le mie segnalazioni",
      toFund: "al fondo comune",
      r1: "Piazzale Ostiense",
      r1d: "Piazza da rinverdire · 2 sett. fa",
      r1s: "In valutazione",
      r2: "Via dei Gracchi",
      r2d: "5 alberi abbattuti · 1 mese fa",
      r2s: "Pianificato",
    },
    fab: {
      donate: "Dona quello che puoi",
      donateSub: "Un importo libero, nel fondo comune",
      report: "Segnala un'area",
      reportSub: "Mappa una necessità di verde",
    },
    nav: { home: "Home", map: "Mappa", info: "Info", profile: "Profilo" },
    a11y: { back: "Indietro", actions: "Azioni" },
  },
  en: {
    home: {
      hi: "Hi 👋",
      title: "Your greener Rome",
      heroLabel: "TREES PLANTED IN ROME",
      heroBig: "1,240",
      heroGoal: "of a 5,000 goal by 2027",
      heroDone: "25% complete",
      heroLeft: "3,760 to go",
      fundTitle: "Common fund",
      fundRaised: "raised",
      fundTrees: "trees already financed · every euro tracked",
      donate: "Give what you can",
      report: "Report an area",
      near: "Areas waiting",
      map: "Map →",
      treesNeeded: "trees needed",
      howTitle: "How it works",
      howBody: "You give what you can, citizens report areas, the association plants where it's needed most. Simple and transparent.",
      howCta: "Learn more",
    },
    map: {
      title: "Participatory map",
      sub: "Green needs, reported by Rome's citizens.",
      allAreas: "All areas",
      highPrio: "High priority",
      city: "Rome",
      legHigh: "High",
      legMid: "Medium",
      legLow: "Low",
      legHint: "The number = trees needed",
      tapHint: "Tap a pin to see the area's need.",
    },
    sheet: {
      needed: "trees needed",
      note: "The common fund is used here based on the area's priority — you don't choose.",
      donate: "Give to the common fund",
      report: "Report a problem here",
    },
    donate: {
      title: "Give what you can",
      sub: "Pick an amount: it all goes into the common fund for Rome's trees.",
      custom: "Other amount",
      fundTitle: "Common fund",
      fundBody: "No tree to pick: the association uses the fund to plant where it's needed most. Every euro is tracked.",
      how: "How it works →",
      cta: "Give",
      pick: "Pick an amount",
      demo: "Simulated donation — this is a demo.",
      thanks: ["Thank you!", "Your contribution counts."],
      thanksTail: "go into the common fund. The association will use them to plant where it's needed most, transparently.",
      seeHow: "How the funds are used",
      home: "Back to home",
    },
    report: {
      sent: ["Report", "sent!"],
      sentBody: "Thanks. Your report joins the participatory map and helps steer the next plantings.",
      seeMap: "See on the map",
      home: "Back to home",
      head: "REPORT AN AREA",
      q1: "Where's the area?",
      q1sub: "Tap the map to drop the pin.",
      tapPlace: "Tap to drop the pin",
      cont: "Continue",
      useLoc: "Use my current location",
      q2: "What is it?",
      q2sub: "Help us understand the need.",
      q3: "Add details",
      q3sub: "A photo makes the report more useful.",
      photo: "Drag or tap to add a photo",
      notePh: "Describe the area (optional): e.g. a row with 6 stumps not replaced…",
      send: "Send report",
    },
    info: {
      title: "How it works",
      intro: "One single flow, no roles: you can donate, report or just explore. Whenever you like.",
      steps: [
        { t: "1 · You give what you can", b: "Even €1. Every donation flows into one common fund." },
        { t: "2 · Citizens report", b: "Reports build the map of the areas that need green the most." },
        { t: "3 · The association plants", b: "With the fund, the managing body finances plantings where they're needed most." },
      ],
      allocTitle: "How funds are allocated",
      alloc: ["Priority to the areas with the greatest need", "Chronological order of reports", "Priorities set by administrators"],
      allocNote: "Automatic and transparent allocation: you don't choose which tree to finance.",
      transpTitle: "Transparency",
      transpBody: "Every euro is tracked. The association publishes reports and updates on the financed plantings.",
      fundLabel: "raised in the fund",
      treesLabel: "trees financed",
      cta: "Give what you can",
    },
    profile: {
      name: "Marco Rossi",
      tag: "Active citizen",
      donated: "donated",
      reports: "reports",
      donations: "donations",
      myDonations: "My donations",
      myReports: "My reports",
      toFund: "to the common fund",
      r1: "Piazzale Ostiense",
      r1d: "Square to re-green · 2 wks ago",
      r1s: "Under review",
      r2: "Via dei Gracchi",
      r2d: "5 trees felled · 1 month ago",
      r2s: "Planned",
    },
    fab: {
      donate: "Give what you can",
      donateSub: "A free amount, into the common fund",
      report: "Report an area",
      reportSub: "Map a green need",
    },
    nav: { home: "Home", map: "Map", info: "Info", profile: "Profile" },
    a11y: { back: "Back", actions: "Actions" },
  },
} as const;

/* ------------------------------- icons --------------------------------- */

function Leaf({ size = 24, stroke = "#fff", sw = 1.9 }: { size?: number; stroke?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21V11M12 11c0-4 3-7 7-7 0 5-3 7-7 7Zm0 2c0-3-2.5-5-6-5 0 3.5 2.5 5 6 5Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function ChevR({ size = 22, stroke = "#7FD79A", sw = 2.2 }: { size?: number; stroke?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon({ size = 19, stroke = "#1B8A43" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" stroke={stroke} strokeWidth={1.9} strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" stroke={stroke} strokeWidth={1.9} />
    </svg>
  );
}
function InfoIcon({ size = 24, stroke = "currentColor" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={1.9} />
      <path d="M12 11v5" stroke={stroke} strokeWidth={1.9} strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1" fill={stroke} />
    </svg>
  );
}
function ReportTypeIcon({ kind, color }: { kind: ReportType["icon"]; color: string }) {
  if (kind === "tree") return <Leaf size={24} stroke={color} />;
  if (kind === "road")
    return (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 3 5 21M16 3l3 18M12 5v3M12 13v3M12 20v1" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 20h18M6 20c0-5 2-9 6-9s6 4 6 9" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------- image-slot widget ------------------------- */
// Self-contained, session-only picker: tap or drop an image and it shows
// immediately (object URL kept in component state). No persistence — a demo.

function VuPhoto({ label, height, radius = 16, bg = "#CFE8BE" }: { label: string; height: number; radius?: number; bg?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const next = URL.createObjectURL(file);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setUrl(next);
  };

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        accept(e.dataTransfer.files?.[0]);
      }}
      style={{ position: "relative", display: "block", width: "100%", height, border: "none", padding: 0, cursor: "pointer", borderRadius: radius, overflow: "hidden", background: url ? "#dfe8d4" : bg, outline: over ? "2px solid #1B8A43" : "none", outlineOffset: -2, fontFamily: "inherit" }}
      aria-label={label}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, textAlign: "center", color: "#3E6B43" }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, maxWidth: "92%" }}>{label}</span>
        </span>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ""; }} />
    </button>
  );
}

/* ------------------------------ component ------------------------------ */

export type Screen = "home" | "map" | "donate" | "report" | "info" | "profile";

export type VerdeUrbanoAppProps = {
  locale: Locale;
  entryScreen?: Screen;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function VerdeUrbanoApp({ locale, entryScreen = "home", scrollRef }: VerdeUrbanoAppProps) {
  const t = T[locale];
  const ls = useCallback((v: LS): string => (typeof v === "string" ? v : v[locale]), [locale]);
  const fmt = useCallback((n: number) => n.toLocaleString(locale === "it" ? "it-IT" : "en-US"), [locale]);

  const [screen, setScreen] = useState<Screen>(entryScreen);
  const [fabOpen, setFabOpen] = useState(false);
  const [mapFilter, setMapFilter] = useState<"all" | "alta">("all");
  const [sheetArea, setSheetArea] = useState<Area | null>(null);

  // Donation (common fund)
  const [dStep, setDStep] = useState<1 | 2>(1);
  const [dAmount, setDAmount] = useState<number | null>(null);
  const [dCustom, setDCustom] = useState("");
  const [dDone, setDDone] = useState(0);
  const [fundRaised, setFundRaised] = useState(FUND_START);
  const [myDonations, setMyDonations] = useState<MyDonation[]>(INITIAL_DONATIONS);

  // Report flow
  const [rStep, setRStep] = useState(1);
  const [rType, setRType] = useState<string | null>(null);
  const [rPlaced, setRPlaced] = useState(false);

  const toTop = useCallback(() => scrollRef.current?.scrollTo({ top: 0 }), [scrollRef]);

  const go = useCallback(
    (s: Screen) => {
      setScreen(s);
      setFabOpen(false);
      setSheetArea(null);
      toTop();
    },
    [toTop],
  );

  const startDonate = () => {
    setScreen("donate");
    setFabOpen(false);
    setSheetArea(null);
    setDStep(1);
    setDAmount(null);
    setDCustom("");
    toTop();
  };
  const startReport = () => {
    setScreen("report");
    setFabOpen(false);
    setRStep(1);
    setRType(null);
    setRPlaced(false);
    toTop();
  };
  // Open the map already focused on a specific area's sheet (used by the home
  // "areas waiting" cards, whose specific data implies a drill-in).
  const openArea = (a: Area) => {
    setScreen("map");
    setSheetArea(a);
    setFabOpen(false);
    toTop();
  };
  const rBack = () => {
    if (rStep <= 1) return go("home");
    setRStep(rStep - 1);
    toTop();
  };

  const effAmount = dCustom.trim() !== "" ? Math.max(0, Math.floor(Number(dCustom)) || 0) : dAmount ?? 0;
  const confirmDonate = () => {
    if (effAmount <= 0) return;
    setFundRaised((f) => f + effAmount);
    setMyDonations((prev) => [{ id: "d" + prev.length + "_" + effAmount, amount: effAmount, date: { it: "Adesso", en: "Just now" } }, ...prev]);
    setDDone(effAmount);
    setDStep(2);
    toTop();
  };

  /* derived */
  const areas = AREAS.map((a) => ({ ...a, needColor: NEED_META[a.need].c, needLabel: ls(NEED_META[a.need].l), needSoft: NEED_META[a.need].soft }));
  const pins = mapFilter === "alta" ? areas.filter((a) => a.need === "alta") : areas;
  const nearby = areas.filter((a) => a.need !== "bassa").slice(0, 3);
  const treesFunded = Math.floor(fundRaised / AVG_TREE_COST);
  const totalDonated = myDonations.reduce((s, d) => s + d.amount, 0);

  const showNav = ["home", "map", "profile", "info"].includes(screen);
  const navColor = (on: boolean) => (on ? "#1B8A43" : "#9AA59B");

  /* ------------------------------- screens ------------------------------ */

  const home = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, color: "#7E8C7C", fontWeight: 600 }}>{t.home.hi}</div>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 25, letterSpacing: -0.5, lineHeight: 1.1 }}>{t.home.title}</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#16321F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>MR</div>
      </div>

      {/* collective goal */}
      <div style={{ background: "linear-gradient(135deg,#163E22 0%,#1F5E33 100%)", borderRadius: 28, padding: 24, color: "#fff", position: "relative", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ position: "absolute", right: -30, bottom: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(52,184,90,.25)" }} />
        <div style={{ position: "absolute", right: 18, top: 18, opacity: 0.5, animation: "vu-floaty 7s ease-in-out infinite" }}>
          <Leaf size={40} stroke="#7FD79A" sw={1.6} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, color: "#9FCBA9", fontWeight: 600, letterSpacing: 0.3 }}>{t.home.heroLabel}</div>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 46, letterSpacing: -1.5, lineHeight: 1, margin: "6px 0 4px" }}>{t.home.heroBig}</div>
          <div style={{ fontSize: 14, color: "#BFE0C6" }}>{t.home.heroGoal}</div>
          <div style={{ height: 10, borderRadius: 20, background: "rgba(255,255,255,.18)", marginTop: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "25%", borderRadius: 20, background: "linear-gradient(90deg,#7FD79A,#34B85A)", animation: "vu-barfill 1.1s ease both" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#A9D2B2", marginTop: 8 }}>
            <span>{t.home.heroDone}</span>
            <span>{t.home.heroLeft}</span>
          </div>
        </div>
      </div>

      {/* common fund */}
      <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 22, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: "#E4F2DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={24} stroke="#1B8A43" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: "#7E8C7C", fontWeight: 700 }}>{t.home.fundTitle}</div>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24, color: "#16321F", lineHeight: 1.1 }}>
            €{fmt(fundRaised)} <span style={{ fontSize: 13, fontWeight: 600, color: "#7E8C7C", fontFamily: "var(--vu-font-text)" }}>{t.home.fundRaised}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#1B8A43", fontWeight: 600, marginTop: 1 }}>{fmt(treesFunded)} {t.home.fundTrees}</div>
        </div>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 11, marginBottom: 26 }}>
        <button type="button" onClick={startDonate} style={{ flex: 1, cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 16, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(27,138,67,.28)", fontFamily: "inherit" }}>
          <Leaf size={19} stroke="#fff" />
          {t.home.donate}
        </button>
        <button type="button" onClick={startReport} style={{ flex: 1, cursor: "pointer", border: "2px solid #1B8A43", background: "#fff", color: "#1B8A43", borderRadius: 18, padding: 14, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
          <PinIcon size={19} stroke="#1B8A43" />
          {t.home.report}
        </button>
      </div>

      {/* areas waiting (informational → map) */}
      <SectionHead title={t.home.near} action={t.home.map} onAction={() => go("map")} />
      <div className="vu-noscroll" style={{ display: "flex", gap: 13, overflowX: "auto", margin: "0 -18px 26px", padding: "2px 18px 6px" }}>
        {nearby.map((a) => (
          <button key={a.id} type="button" onClick={() => openArea(a)} style={{ flex: "none", width: 236, textAlign: "left", cursor: "pointer", background: "#fff", border: "1px solid #ECE6D8", borderRadius: 22, padding: 16, boxShadow: "0 8px 22px rgba(20,51,30,.05)", fontFamily: "inherit", color: "#16321F" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12, padding: "5px 10px", borderRadius: 30, background: a.needSoft, color: a.needColor }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.needColor }} />
                {a.needLabel}
              </span>
              <span style={{ fontSize: 12, color: "#9AA59B", fontWeight: 600 }}>{ls(a.kind)}</span>
            </div>
            <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 18, lineHeight: 1.15, marginBottom: 2 }}>{a.name}</div>
            <div style={{ fontSize: 13, color: "#7E8C7C", marginBottom: 14 }}>{ls(a.zona)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13.5, color: "#41513F" }}>
                <strong style={{ fontFamily: "var(--vu-font-display)", fontSize: 17, color: "#16321F" }}>{a.count}</strong> {t.home.treesNeeded}
              </div>
              <ChevR size={18} stroke="#C9D4C2" sw={2.1} />
            </div>
          </button>
        ))}
      </div>

      {/* how it works teaser */}
      <button type="button" onClick={() => go("info")} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "#16321F", color: "#fff", border: "none", borderRadius: 24, padding: 22, fontFamily: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <InfoIcon size={20} stroke="#7FD79A" />
          <span style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 19 }}>{t.home.howTitle}</span>
        </div>
        <div style={{ fontSize: 14, color: "#BFE0C6", lineHeight: 1.45, marginBottom: 12 }}>{t.home.howBody}</div>
        <span style={{ color: "#34B85A", fontWeight: 700, fontSize: 14 }}>{t.home.howCta} →</span>
      </button>
    </div>
  );

  const map = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 27, letterSpacing: -0.6, margin: 0 }}>{t.map.title}</h1>
        <p style={{ fontSize: 14.5, color: "#7E8C7C", margin: "4px 0 0" }}>{t.map.sub}</p>
      </div>
      <div style={{ display: "flex", gap: 9, marginBottom: 14 }}>
        <FilterChip label={t.map.allAreas} active={mapFilter === "all"} onClick={() => setMapFilter("all")} />
        <FilterChip label={t.map.highPrio} active={mapFilter === "alta"} onClick={() => setMapFilter("alta")} dot="#E0654B" />
      </div>

      <div style={{ position: "relative", width: "100%", height: 430, borderRadius: 26, overflow: "hidden", background: "linear-gradient(150deg,#EAF3E0,#DEEFD2)", border: "1px solid #D6E6C9", boxShadow: "inset 0 0 60px rgba(20,51,30,.05),0 16px 34px -20px rgba(20,51,30,.3)" }}>
        <MapArt />
        <div style={{ position: "absolute", left: "30%", top: "40%", transform: "translate(-50%,-50%)", zIndex: 4 }}>
          <span style={{ position: "absolute", left: "50%", top: "50%", width: 18, height: 18, borderRadius: "50%", background: "#2BAFC0", animation: "vu-ringpulse 2.2s ease-out infinite" }} />
          <span style={{ position: "relative", display: "block", width: 14, height: 14, borderRadius: "50%", background: "#2BAFC0", border: "3px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,.2)" }} />
        </div>
        {pins.map((p) => (
          <button key={p.id} type="button" onClick={() => setSheetArea(p)} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", border: "none", background: "none", cursor: "pointer", padding: 0, zIndex: 5 }} aria-label={p.name}>
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50% 50% 50% 12px", background: p.needColor, border: "3px solid #fff", boxShadow: "0 8px 16px rgba(20,51,30,.3)", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "var(--vu-font-display)", animation: "vu-pinDrop .5s cubic-bezier(.2,1.3,.4,1) both" }}>{p.count}</span>
          </button>
        ))}
        <div style={{ position: "absolute", right: 12, bottom: 12, zIndex: 6, background: "rgba(255,255,255,.85)", backdropFilter: "blur(4px)", borderRadius: 12, padding: "6px 11px", fontSize: 11, fontWeight: 700, color: "#5E6B5F", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(20,51,30,.12)" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3l3 7-3-1.6L9 10l3-7Z" fill="#E0654B" />
            <path d="M12 12v9" stroke="#9AA59B" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
          {t.map.city}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16, fontSize: 12.5, color: "#6B7A6C", fontWeight: 600 }}>
        <LegendDot color="#E0654B" label={t.map.legHigh} />
        <LegendDot color="#E59B26" label={t.map.legMid} />
        <LegendDot color="#1B8A43" label={t.map.legLow} />
        <span style={{ color: "#9AA59B" }}>{t.map.legHint}</span>
      </div>
      <p style={{ textAlign: "center", fontSize: 13, color: "#9AA59B", marginTop: 18 }}>{t.map.tapHint}</p>
    </div>
  );

  const donate = (
    <div style={{ animation: "vu-screenIn .4s ease both", minHeight: "100%", padding: "20px 18px 40px", background: "#FAF6EC" }}>
      {dStep === 2 ? (
        <div style={{ textAlign: "center", paddingTop: 70 }}>
          <div style={{ width: 108, height: 108, borderRadius: "50%", background: "#E4F2DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px", animation: "vu-pop .7s cubic-bezier(.2,1.2,.4,1) both" }}>
            <Leaf size={56} stroke="#1B8A43" />
          </div>
          <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 30, letterSpacing: -0.6, margin: "0 0 12px" }}>
            {t.donate.thanks[0]}
            <br />
            {t.donate.thanks[1]}
          </h1>
          <p style={{ fontSize: 16, color: "#5E6B5F", lineHeight: 1.5, maxWidth: 320, margin: "0 auto 34px" }}>
            <strong style={{ color: "#16321F" }}>€{fmt(dDone)}</strong> {t.donate.thanksTail}
          </p>
          <button type="button" onClick={() => go("info")} style={btnPrimary}>{t.donate.seeHow}</button>
          <button type="button" onClick={() => go("home")} style={btnGhost}>{t.donate.home}</button>
        </div>
      ) : (
        <>
          <BackRow onBack={() => go("home")} title={t.donate.title} backLabel={t.a11y.back} />
          <p style={{ fontSize: 14.5, color: "#7E8C7C", margin: "0 0 20px" }}>{t.donate.sub}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            {AMOUNTS.map((a) => {
              const sel = dCustom.trim() === "" && dAmount === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setDAmount(a); setDCustom(""); }}
                  style={{ padding: "16px 0", borderRadius: 16, border: `2px solid ${sel ? "#1B8A43" : "#ECE6D8"}`, background: sel ? "#1B8A43" : "#fff", color: sel ? "#fff" : "#16321F", fontWeight: 800, fontSize: 20, fontFamily: "var(--vu-font-display)", cursor: "pointer" }}
                >
                  €{a}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative", marginBottom: 18 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 700, color: "#7E8C7C", pointerEvents: "none" }}>€</span>
            <input
              inputMode="numeric"
              value={dCustom}
              onChange={(e) => { setDCustom(e.target.value.replace(/[^0-9]/g, "")); setDAmount(null); }}
              placeholder={t.donate.custom}
              style={{ width: "100%", border: `2px solid ${dCustom.trim() !== "" ? "#1B8A43" : "#ECE6D8"}`, borderRadius: 16, padding: "14px 16px 14px 30px", fontFamily: "inherit", fontSize: 16, color: "#16321F", background: "#fff", outline: "none" }}
            />
          </div>

          <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: 17, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>
              <Leaf size={18} stroke="#1B8A43" /> {t.donate.fundTitle}
            </div>
            <p style={{ fontSize: 13.5, color: "#7E8C7C", lineHeight: 1.45, margin: "0 0 8px" }}>{t.donate.fundBody}</p>
            <button type="button" onClick={() => go("info")} style={{ background: "none", border: "none", color: "#1B8A43", fontWeight: 700, fontSize: 13.5, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>{t.donate.how}</button>
          </div>

          <button
            type="button"
            onClick={confirmDonate}
            disabled={effAmount <= 0}
            style={{ width: "100%", cursor: effAmount > 0 ? "pointer" : "default", border: "none", background: effAmount > 0 ? "#1B8A43" : "#EDEFEA", color: effAmount > 0 ? "#fff" : "#5E6B5F", borderRadius: 18, padding: 17, fontWeight: 700, fontSize: 16.5, boxShadow: effAmount > 0 ? "0 10px 24px rgba(27,138,67,.3)" : "none", fontFamily: "inherit", transition: "background .2s ease, color .2s ease" }}
          >
            {effAmount > 0 ? `${t.donate.cta} €${fmt(effAmount)}` : t.donate.pick}
          </button>
          <p style={{ textAlign: "center", fontSize: 12.5, color: "#9AA59B", margin: "14px 0 0" }}>{t.donate.demo}</p>
        </>
      )}
    </div>
  );

  const reportProg = (Math.min(rStep, 3) / 3) * 100;
  const report = (
    <div style={{ animation: "vu-screenIn .4s ease both", minHeight: "100%", padding: "20px 18px 40px", background: "#FAF6EC" }}>
      {rStep === 4 ? (
        <div style={{ textAlign: "center", paddingTop: 70 }}>
          <div style={{ width: 108, height: 108, borderRadius: "50%", background: "#FBE3DC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px", animation: "vu-pop .7s cubic-bezier(.2,1.2,.4,1) both" }}>
            <PinIcon size={52} stroke="#E0654B" />
          </div>
          <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 30, letterSpacing: -0.6, margin: "0 0 12px" }}>
            {t.report.sent[0]}
            <br />
            {t.report.sent[1]}
          </h1>
          <p style={{ fontSize: 16, color: "#5E6B5F", lineHeight: 1.5, maxWidth: 310, margin: "0 auto 34px" }}>{t.report.sentBody}</p>
          <button type="button" onClick={() => go("map")} style={btnPrimary}>{t.report.seeMap}</button>
          <button type="button" onClick={() => go("home")} style={btnGhost}>{t.report.home}</button>
        </div>
      ) : (
        <>
          <FlowHeader onBack={rBack} backLabel={t.a11y.back} kicker={t.report.head} prog={reportProg} progColor="#E0654B" />
          {rStep === 1 && (
            <>
              <FlowTitle title={t.report.q1} sub={t.report.q1sub} />
              <div onClick={() => setRPlaced(true)} style={{ position: "relative", width: "100%", height: 300, borderRadius: 24, overflow: "hidden", cursor: "pointer", background: "linear-gradient(150deg,#EAF3E0,#DEEFD2)", border: "1px solid #D6E6C9", boxShadow: "inset 0 0 50px rgba(20,51,30,.05)" }}>
                <ReportMapArt />
                {!rPlaced && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, color: "#5E6B5F", pointerEvents: "none" }}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#1B8A43" strokeWidth={2} strokeLinecap="round" />
                      <circle cx="12" cy="12" r="4" stroke="#1B8A43" strokeWidth={2} />
                    </svg>
                    <span style={{ fontSize: 12.5, fontWeight: 700, background: "rgba(255,255,255,.85)", padding: "5px 11px", borderRadius: 20 }}>{t.report.tapPlace}</span>
                  </div>
                )}
                {rPlaced && (
                  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", animation: "vu-pop .5s ease both" }}>
                    <span style={{ position: "absolute", left: "50%", top: "50%", width: 40, height: 40, borderRadius: "50%", background: "#E0654B", animation: "vu-ringpulse 1.8s ease-out infinite" }} />
                    <span style={{ position: "relative", display: "block", width: 38, height: 38, borderRadius: "50% 50% 50% 12px", background: "#E0654B", border: "3px solid #fff", boxShadow: "0 6px 14px rgba(20,51,30,.3)" }} />
                  </div>
                )}
              </div>
              {rPlaced ? (
                <button type="button" onClick={() => { setRStep(2); toTop(); }} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 16, fontWeight: 700, fontSize: 16, marginTop: 18, fontFamily: "inherit" }}>{t.report.cont}</button>
              ) : (
                <button type="button" onClick={() => setRPlaced(true)} style={{ width: "100%", cursor: "pointer", border: "2px solid #D8E6CF", background: "#fff", color: "#1B8A43", borderRadius: 18, padding: 14, fontWeight: 700, fontSize: 15, marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="3" stroke="#1B8A43" strokeWidth={2} />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1B8A43" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                  {t.report.useLoc}
                </button>
              )}
            </>
          )}
          {rStep === 2 && (
            <>
              <FlowTitle title={t.report.q2} sub={t.report.q2sub} />
              {REPORT_TYPES.map((rt) => (
                <button key={rt.id} type="button" onClick={() => { setRType(rt.id); setRStep(3); toTop(); }} style={{ ...pickBtn, padding: 17, borderColor: rType === rt.id ? "#1B8A43" : "#ECE6D8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: rt.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ReportTypeIcon kind={rt.icon} color={rt.color} />
                    </div>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{ls(rt.label)}</div>
                    <ChevR size={20} stroke="#C9D4C2" sw={2.1} />
                  </div>
                </button>
              ))}
            </>
          )}
          {rStep === 3 && (
            <>
              <FlowTitle title={t.report.q3} sub={t.report.q3sub} />
              <div style={{ marginBottom: 16 }}>
                <VuPhoto label={t.report.photo} height={190} radius={20} bg="#EAF1E2" />
              </div>
              <textarea placeholder={t.report.notePh} style={{ width: "100%", minHeight: 96, resize: "none", border: "2px solid #ECE6D8", borderRadius: 18, padding: 15, fontFamily: "inherit", fontSize: 15, color: "#16321F", background: "#fff", outline: "none" }} />
              <button type="button" onClick={() => { setRStep(4); toTop(); }} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 17, fontWeight: 700, fontSize: 16.5, marginTop: 18, boxShadow: "0 10px 24px rgba(27,138,67,.3)", fontFamily: "inherit" }}>{t.report.send}</button>
            </>
          )}
        </>
      )}
    </div>
  );

  const info = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 27, letterSpacing: -0.6, margin: 0 }}>{t.info.title}</h1>
      <p style={{ fontSize: 14.5, color: "#7E8C7C", margin: "6px 0 20px", lineHeight: 1.45 }}>{t.info.intro}</p>

      {/* fund snapshot */}
      <div style={{ display: "flex", gap: 11, marginBottom: 24 }}>
        <div style={{ flex: 1, background: "linear-gradient(135deg,#163E22,#1F5E33)", color: "#fff", borderRadius: 20, padding: "16px 14px" }}>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24 }}>€{fmt(fundRaised)}</div>
          <div style={{ fontSize: 12, color: "#BFE0C6", fontWeight: 600, marginTop: 2 }}>{t.info.fundLabel}</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: "16px 14px" }}>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24, color: "#1B8A43" }}>{fmt(treesFunded)}</div>
          <div style={{ fontSize: 12, color: "#7E8C7C", fontWeight: 600, marginTop: 2 }}>{t.info.treesLabel}</div>
        </div>
      </div>

      {/* 3 steps */}
      <div style={{ position: "relative", paddingLeft: 4, marginBottom: 8 }}>
        {t.info.steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ flex: "none", width: 40, height: 40, borderRadius: 13, background: "#E4F2DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i === 0 ? <Leaf size={22} stroke="#1B8A43" /> : i === 1 ? <PinIcon size={20} stroke="#1B8A43" /> : <InfoIcon size={22} stroke="#1B8A43" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 2 }}>{s.t}</div>
              <div style={{ fontSize: 13.5, color: "#7E8C7C", lineHeight: 1.45 }}>{s.b}</div>
            </div>
          </div>
        ))}
      </div>

      {/* allocation criteria */}
      <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 22, padding: "18px 18px 16px", marginTop: 16, marginBottom: 16 }}>
        <h2 style={{ ...sectionH2, fontSize: 18, marginBottom: 12 }}>{t.info.allocTitle}</h2>
        {t.info.alloc.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
            <span style={{ flex: "none", width: 22, height: 22, borderRadius: "50%", background: "#E4F2DE", color: "#1B8A43", fontWeight: 800, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: "#41513F", lineHeight: 1.4 }}>{a}</span>
          </div>
        ))}
        <p style={{ fontSize: 12.5, color: "#9AA59B", margin: "8px 0 0", lineHeight: 1.4 }}>{t.info.allocNote}</p>
      </div>

      {/* transparency */}
      <div style={{ background: "#E4F2DE", borderRadius: 22, padding: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16, color: "#16321F", marginBottom: 5 }}>
          <InfoIcon size={19} stroke="#1B8A43" /> {t.info.transpTitle}
        </div>
        <p style={{ fontSize: 13.5, color: "#41513F", lineHeight: 1.45, margin: 0 }}>{t.info.transpBody}</p>
      </div>

      <button type="button" onClick={startDonate} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 17, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 10px 24px rgba(27,138,67,.28)", fontFamily: "inherit" }}>
        <Leaf size={19} stroke="#fff" /> {t.info.cta}
      </button>
    </div>
  );

  const profile = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: 22, background: "#16321F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, fontFamily: "var(--vu-font-display)" }}>MR</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 23, letterSpacing: -0.4 }}>{t.profile.name}</div>
          <div style={{ display: "flex", gap: 7, marginTop: 5 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E4F2DE", color: "#1B8A43", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 30 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1B8A43" }} />
              {t.profile.tag}
            </span>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#1F5E33,#163E22)", borderRadius: 24, padding: 22, color: "#fff", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(52,184,90,.22)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <ProfileStat value={`€${fmt(totalDonated)}`} label={t.profile.donated} />
          <ProfileStat value="2" label={t.profile.reports} />
          <ProfileStat value={String(myDonations.length)} label={t.profile.donations} />
        </div>
      </div>

      <h2 style={sectionH2}>{t.profile.myDonations}</h2>
      <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: "6px 16px", marginBottom: 24 }}>
        {myDonations.map((d, i) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 0", borderBottom: i === myDonations.length - 1 ? "none" : "1px solid #F1ECDF" }}>
            <span style={{ flex: "none", width: 34, height: 34, borderRadius: 11, background: "#E4F2DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={18} stroke="#1B8A43" />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, fontFamily: "var(--vu-font-display)" }}>€{fmt(d.amount)}</div>
              <div style={{ fontSize: 12.5, color: "#7E8C7C" }}>{t.profile.toFund}</div>
            </div>
            <span style={{ fontSize: 12.5, color: "#9AA59B", fontWeight: 600 }}>{ls(d.date)}</span>
          </div>
        ))}
      </div>

      <h2 style={sectionH2}>{t.profile.myReports}</h2>
      <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: "6px 16px" }}>
        <ReportRow dot="#E59B26" title={t.profile.r1} sub={t.profile.r1d} tag={t.profile.r1s} tagColor="#E59B26" tagBg="#FBEFD6" />
        <ReportRow dot="#1B8A43" title={t.profile.r2} sub={t.profile.r2d} tag={t.profile.r2s} tagColor="#1B8A43" tagBg="#E4F2DE" last />
      </div>
    </div>
  );

  let body: ReactNode = null;
  if (screen === "home") body = home;
  else if (screen === "map") body = map;
  else if (screen === "donate") body = donate;
  else if (screen === "report") body = report;
  else if (screen === "info") body = info;
  else if (screen === "profile") body = profile;

  return (
    <>
      <div ref={scrollRef} className="vu-scroll">
        {body}
      </div>

      {/* map bottom sheet — area info + give-to-fund */}
      {sheetArea && (
        <>
          <div onClick={() => setSheetArea(null)} style={{ position: "absolute", inset: 0, zIndex: 60, background: "rgba(20,51,30,.35)" }} />
          <div className="vu-sheet" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 61, width: "100%", background: "#fff", borderRadius: "28px 28px 0 0", padding: "10px 20px 34px", animation: "vu-sheetUp .35s cubic-bezier(.2,.9,.3,1) both", boxShadow: "0 -10px 40px rgba(20,51,30,.18)" }}>
            <div style={{ width: 44, height: 5, borderRadius: 10, background: "#E4DFCD", margin: "0 auto 18px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12.5, padding: "6px 11px", borderRadius: 30, background: NEED_META[sheetArea.need].soft, color: NEED_META[sheetArea.need].c }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: NEED_META[sheetArea.need].c }} />
                {ls(NEED_META[sheetArea.need].l)}
              </span>
              <span style={{ fontSize: 13, color: "#9AA59B", fontWeight: 600 }}>{ls(sheetArea.kind)}</span>
            </div>
            <h2 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24, letterSpacing: -0.5, margin: "0 0 2px" }}>{sheetArea.name}</h2>
            <p style={{ fontSize: 14, color: "#7E8C7C", margin: "0 0 14px" }}>{ls(sheetArea.zona)} · <strong style={{ color: "#16321F" }}>{sheetArea.count}</strong> {t.sheet.needed}</p>
            <p style={{ fontSize: 13, color: "#7E8C7C", lineHeight: 1.45, margin: "0 0 16px" }}>{t.sheet.note}</p>
            <button type="button" onClick={startDonate} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 16, marginBottom: 10, fontFamily: "inherit" }}>{t.sheet.donate}</button>
            <button type="button" onClick={startReport} style={{ width: "100%", cursor: "pointer", border: "2px solid #ECE6D8", background: "#fff", color: "#16321F", borderRadius: 16, padding: 13, fontWeight: 700, fontSize: 14.5, fontFamily: "inherit" }}>{t.sheet.report}</button>
          </div>
        </>
      )}

      {/* FAB action sheet — the two actions, available from anywhere */}
      {fabOpen && (
        <>
          <div onClick={() => setFabOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 62, background: "rgba(20,51,30,.4)" }} />
          <div className="vu-fabsheet" style={{ position: "absolute", left: 0, right: 0, bottom: 100, zIndex: 63, width: "100%", padding: "0 18px", animation: "vu-sheetUp .3s ease both" }}>
            <button type="button" onClick={startDonate} style={fabItem}>
              <span style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: "#1B8A43", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Leaf size={24} stroke="#fff" />
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 16.5 }}>{t.fab.donate}</span>
                <span style={{ display: "block", fontSize: 13, color: "#7E8C7C" }}>{t.fab.donateSub}</span>
              </span>
            </button>
            <button type="button" onClick={startReport} style={{ ...fabItem, marginBottom: 0 }}>
              <span style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: "#E0654B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PinIcon size={22} stroke="#fff" />
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 16.5 }}>{t.fab.report}</span>
                <span style={{ display: "block", fontSize: 13, color: "#7E8C7C" }}>{t.fab.reportSub}</span>
              </span>
            </button>
          </div>
        </>
      )}

      {/* bottom nav — Home · Map · [+] · Info · Profile */}
      {showNav && (
        <div className="vu-nav" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 55, width: "100%", background: "rgba(255,255,255,.92)", backdropFilter: "blur(14px)", borderTop: "1px solid #ECE6D8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <NavBtn label={t.nav.home} color={navColor(screen === "home")} onClick={() => go("home")}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" />
            </svg>
          </NavBtn>
          <NavBtn label={t.nav.map} color={navColor(screen === "map")} onClick={() => go("map")}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" />
            </svg>
          </NavBtn>
          <button type="button" onClick={() => setFabOpen((v) => !v)} style={{ flex: "none", width: 58, background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "center" }} aria-label={t.a11y.actions}>
            <span style={{ width: 54, height: 54, borderRadius: 18, background: "#1B8A43", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(27,138,67,.4)", marginTop: -22 }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
              </svg>
            </span>
          </button>
          <NavBtn label={t.nav.info} color={navColor(screen === "info")} onClick={() => go("info")}>
            <InfoIcon size={24} stroke="currentColor" />
          </NavBtn>
          <NavBtn label={t.nav.profile} color={navColor(screen === "profile")} onClick={() => go("profile")}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={1.9} />
              <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" />
            </svg>
          </NavBtn>
        </div>
      )}
    </>
  );
}

/* ----------------------------- small parts ----------------------------- */

const btnPrimary: CSSProperties = { width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 17, fontWeight: 700, fontSize: 16, marginBottom: 11, fontFamily: "inherit" };
const btnGhost: CSSProperties = { width: "100%", cursor: "pointer", border: "2px solid #D8E6CF", background: "#fff", color: "#16321F", borderRadius: 18, padding: 15, fontWeight: 700, fontSize: 16, fontFamily: "inherit" };
const pickBtn: CSSProperties = { display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "#fff", border: "2px solid #ECE6D8", borderRadius: 20, padding: 15, marginBottom: 11, fontFamily: "inherit", color: "#16321F" };
const fabItem: CSSProperties = { display: "flex", width: "100%", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer", background: "#fff", border: "none", borderRadius: 20, padding: 17, marginBottom: 11, boxShadow: "0 12px 30px rgba(20,51,30,.18)", fontFamily: "inherit", color: "#16321F" };
const sectionH2: CSSProperties = { fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 20, margin: "0 0 14px", letterSpacing: -0.3 };

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 26 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#BFE0C6", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
function SectionHead({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 13 }}>
      <h2 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: -0.3 }}>{title}</h2>
      <button type="button" onClick={onAction} style={{ background: "none", border: "none", color: "#1B8A43", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{action}</button>
    </div>
  );
}
function FilterChip({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button type="button" onClick={onClick} style={{ cursor: "pointer", whiteSpace: "nowrap", border: "1px solid #ECE6D8", borderRadius: 30, padding: "9px 16px", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6, background: active ? "#1B8A43" : "#fff", color: active ? "#fff" : "#5E6B5F", fontFamily: "inherit" }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />}
      {label}
    </button>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}
function BackRow({ onBack, title, backLabel }: { onBack: () => void; title: string; backLabel: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <button type="button" onClick={onBack} style={{ flex: "none", width: 42, height: 42, borderRadius: "50%", border: "1px solid #ECE6D8", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label={backLabel}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="#16321F" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24, letterSpacing: -0.5, margin: 0 }}>{title}</h1>
    </div>
  );
}
function FlowHeader({ onBack, backLabel, kicker, prog, progColor }: { onBack: () => void; backLabel: string; kicker: string; prog: number; progColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <button type="button" onClick={onBack} style={{ flex: "none", width: 42, height: 42, borderRadius: "50%", border: "1px solid #ECE6D8", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label={backLabel}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="#16321F" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: "#9AA59B", fontWeight: 700, letterSpacing: 0.4 }}>{kicker}</div>
        <div style={{ height: 6, borderRadius: 20, background: "#EEE9DA", marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 20, background: progColor, width: `${prog}%`, transition: "width .4s ease" }} />
        </div>
      </div>
    </div>
  );
}
function FlowTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 26, letterSpacing: -0.5, margin: "0 0 4px" }}>{title}</h1>
      <p style={{ fontSize: 14.5, color: "#7E8C7C", margin: "0 0 18px" }}>{sub}</p>
    </>
  );
}
function ReportRow({ dot, title, sub, tag, tagColor, tagBg, last }: { dot: string; title: string; sub: string; tag: string; tagColor: string; tagBg: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 0", borderBottom: last ? "none" : "1px solid #F1ECDF" }}>
      <span style={{ flex: "none", width: 11, height: 11, borderRadius: "50%", background: dot }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#7E8C7C" }}>{sub}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: tagColor, background: tagBg, padding: "5px 10px", borderRadius: 20 }}>{tag}</span>
    </div>
  );
}
function NavBtn({ label, color, onClick, children }: { label: string; color: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color, fontFamily: "inherit" }}>
      {children}
      <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
    </button>
  );
}

/* ------------------------------ map art -------------------------------- */

function MapArt() {
  return (
    <svg viewBox="0 0 330 430" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} aria-hidden>
      <path d="M-10,-10 H180 Q150,90 110,150 Q60,200 -10,180 Z" fill="#E9F2DE" />
      <path d="M180,-10 H340 V110 Q270,140 225,105 Q190,65 180,-10 Z" fill="#E4EFD7" />
      <path d="M340,110 V300 Q270,330 225,285 Q210,205 275,175 Q320,150 340,110 Z" fill="#EBF3E1" />
      <path d="M-10,180 Q60,210 105,260 Q135,320 100,400 Q55,450 -10,440 Z" fill="#E6F1DB" />
      <path d="M340,300 V440 H110 Q140,360 210,320 Q300,300 340,300 Z" fill="#E2EED4" />
      <path d="M135,205 Q195,195 222,245 Q222,295 175,312 Q128,302 120,255 Q124,222 135,205 Z" fill="#F2ECDA" opacity="0.8" />
      <path d="M105,-10 C135,60 80,120 100,190 C118,250 72,300 108,360 C130,400 118,440 128,452 L160,452 C150,415 165,378 145,330 C123,282 170,242 148,182 C128,132 178,70 150,-10 Z" fill="#B6DCEA" />
      <path d="M127,-10 C155,60 100,120 120,190 C137,250 92,300 126,360" stroke="#E6F4FA" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M35,55 A155,155 0 1 0 300,355" stroke="#F6F1E4" strokeWidth="7" fill="none" opacity="0.85" strokeLinecap="round" />
      <path d="M0,150 Q110,130 330,170" stroke="#FBF7EE" strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M0,250 Q150,240 330,275" stroke="#FBF7EE" strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M190,0 Q210,210 230,440" stroke="#FBF7EE" strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M275,0 Q260,160 300,440" stroke="#FBF7EE" strokeWidth="3.5" fill="none" opacity="0.85" />
      <path d="M0,330 Q165,320 330,348" stroke="#EFE9D8" strokeWidth="1.6" fill="none" opacity="0.8" />
      <path d="M35,55 Q88,42 100,80 Q104,118 64,126 Q28,118 27,88 Q30,64 35,55 Z" fill="#C4E3A8" />
      <ellipse cx="278" cy="238" rx="44" ry="37" fill="#C4E3A8" />
      <path d="M45,300 Q98,290 102,332 Q98,374 56,378 Q20,368 22,332 Q28,308 45,300 Z" fill="#C4E3A8" />
      <g fill="#3E7A3A" fontFamily="var(--vu-font-text)" fontSize="9.5" fontWeight="700" textAnchor="middle" opacity="0.6">
        <text x="64" y="90">Villa Ada</text>
        <text x="278" y="242">Villa Borghese</text>
        <text x="60" y="340">Caffarella</text>
      </g>
      <g fill="#E3DAC2" opacity="0.7">
        <circle cx="150" cy="235" r="2.4" /><circle cx="165" cy="248" r="2.1" /><circle cx="182" cy="236" r="2.4" />
        <circle cx="172" cy="262" r="2.1" /><circle cx="192" cy="256" r="2.4" /><circle cx="156" cy="276" r="2.1" />
      </g>
    </svg>
  );
}

function ReportMapArt() {
  return (
    <svg viewBox="0 0 330 300" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} aria-hidden>
      <path d="M-10,-10 H170 Q150,70 110,120 Q60,160 -10,150 Z" fill="#E9F2DE" />
      <path d="M330,90 V230 Q260,250 220,215 Q210,150 270,135 Z" fill="#EBF3E1" />
      <path d="M105,-10 C130,50 85,95 105,150 C120,200 80,240 110,310 L150,310 C140,255 165,220 145,165 C125,120 165,70 145,-10 Z" fill="#B6DCEA" />
      <path d="M0,120 Q120,105 330,140" stroke="#FBF7EE" strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M0,210 Q150,200 330,230" stroke="#FBF7EE" strokeWidth="4" fill="none" opacity="0.9" />
      <path d="M210,0 Q225,150 245,310" stroke="#FBF7EE" strokeWidth="3.5" fill="none" opacity="0.85" />
      <ellipse cx="265" cy="180" rx="40" ry="32" fill="#C4E3A8" />
      <path d="M35,40 Q85,30 96,66 Q100,100 62,108 Q28,100 27,72 Z" fill="#C4E3A8" />
    </svg>
  );
}
