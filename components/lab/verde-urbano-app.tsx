"use client";

// Verde Urbano — interactive app demo.
//
// A faithful React port of the original Verde Urbano phone prototype: a concept
// civic app for re-greening Rome. Seven screens driven by a single state
// machine — onboarding, home, participatory map, a donate flow, a report flow,
// a tree "diary" and a profile — plus a bottom sheet, a FAB action sheet and a
// bottom tab bar. Fully bilingual (IT/EN). The structural chrome (device frame,
// status bar, safe-areas) lives in verde-urbano-view.tsx + verde-urbano.css;
// this file owns the app surface, its state and its content.

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

/* ----------------------------------------------------------------------- */
/* Localised-string helper: a field that differs across locales is `{it,en}`; */
/* fields identical in both stay plain strings.                              */
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

type Tree = {
  id: string;
  name: LS;
  sci: string;
  price: number;
  co2: number;
  h: string;
  color: string;
};

type Level = { id: string; name: LS; desc: LS; extra: number };

type MyTree = {
  id: string;
  species: LS;
  area: string;
  planted: LS;
  status: LS;
  progress: number;
  h: LS;
  color: string;
};

/* ----------------------------- static data ----------------------------- */

const AREAS: Area[] = [
  { id: "pinciano", name: "Viale del Pinciano", zona: { it: "Pinciano · Municipio II", en: "Pinciano · District II" }, need: "alta", count: 8, x: 60, y: 30, kind: { it: "Filare stradale", en: "Street tree row" } },
  { id: "montesacro", name: "Largo Valtournanche", zona: { it: "Montesacro · Municipio III", en: "Montesacro · District III" }, need: "alta", count: 11, x: 73, y: 16, kind: { it: "Piazza", en: "Square" } },
  { id: "tiburtino", name: "Parco Tiburtino", zona: { it: "Tiburtino · Municipio IV", en: "Tiburtino · District IV" }, need: "media", count: 6, x: 84, y: 42, kind: { it: "Area verde", en: "Green area" } },
  { id: "trastevere", name: "Lungotevere Ripa", zona: { it: "Trastevere · Municipio I", en: "Trastevere · District I" }, need: "bassa", count: 3, x: 37, y: 54, kind: { it: "Argine", en: "Riverbank" } },
  { id: "ostiense", name: "Piazzale Ostiense", zona: { it: "Ostiense · Municipio VIII", en: "Ostiense · District VIII" }, need: "media", count: 5, x: 49, y: 72, kind: { it: "Piazza", en: "Square" } },
  { id: "eur", name: "Viale Europa", zona: { it: "EUR · Municipio IX", en: "EUR · District IX" }, need: "media", count: 7, x: 53, y: 88, kind: { it: "Viale alberato", en: "Tree-lined avenue" } },
];

const TREES: Tree[] = [
  { id: "acero", name: { it: "Acero campestre", en: "Field maple" }, sci: "Acer campestre", price: 45, co2: 18, h: "6–8 m", color: "#E0654B" },
  { id: "tiglio", name: { it: "Tiglio", en: "Linden" }, sci: "Tilia cordata", price: 70, co2: 24, h: "15–20 m", color: "#E59B26" },
  { id: "leccio", name: { it: "Leccio", en: "Holm oak" }, sci: "Quercus ilex", price: 90, co2: 31, h: "15–25 m", color: "#34B85A" },
  { id: "pino", name: { it: "Pino domestico", en: "Stone pine" }, sci: "Pinus pinea", price: 120, co2: 38, h: "20–25 m", color: "#2BAFC0" },
  { id: "roverella", name: { it: "Roverella", en: "Downy oak" }, sci: "Quercus pubescens", price: 150, co2: 45, h: "15–20 m", color: "#7A8C3F" },
];

const LEVELS: Level[] = [
  { id: "base", name: { it: "Piantumazione", en: "Planting" }, desc: { it: "Fornitura e messa a dimora", en: "Supply and planting" }, extra: 0 },
  { id: "plus", name: { it: "Piantumazione + cura", en: "Planting + care" }, desc: { it: "Manutenzione per 1 anno", en: "One year of maintenance" }, extra: 35 },
  { id: "completo", name: { it: "Adozione completa", en: "Full adoption" }, desc: { it: "3 anni di cura e monitoraggio", en: "3 years of care and monitoring" }, extra: 90 },
];

const INITIAL_TREES: MyTree[] = [
  { id: "leccio1", species: { it: "Leccio", en: "Holm oak" }, area: "Viale del Pinciano", planted: "Mar 2026", status: { it: "In crescita", en: "Growing" }, progress: 38, h: { it: "1,9 m", en: "1.9 m" }, color: "#34B85A" },
  { id: "tiglio1", species: { it: "Tiglio", en: "Linden" }, area: "Viale Europa", planted: "Nov 2025", status: { it: "In salute", en: "Healthy" }, progress: 62, h: { it: "2,5 m", en: "2.5 m" }, color: "#E59B26" },
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
    role: { donatore: "Donatore", informatore: "Informatore" },
    ob: {
      h1: ["Ricostruiamo", "il verde della", "nostra città."],
      lead: "Trasforma il desiderio di fare bene in azione concreta: pianta alberi, segnala aree, fai crescere Roma. Insieme.",
      choose: "Scegli come partecipare",
      donor: "Sono un Donatore",
      donorSub: "Scelgo dove, quale albero e quanto investire.",
      scout: "Sono un Informatore",
      scoutSub: "Mappo le aree che hanno bisogno di alberi.",
      both: "Potrai sempre fare entrambe le cose.",
    },
    home: {
      hi: "Ciao, bentornato",
      title: "La tua Roma più verde",
      heroLabel: "ALBERI PIANTATI A ROMA",
      heroBig: "1.240",
      heroGoal: "su un obiettivo di 5.000 entro il 2027",
      heroDone: "25% completato",
      heroLeft: "3.760 mancanti",
      myTrees: "I tuoi\nalberi",
      co2y: "kg CO₂\nl'anno",
      citizens: "Cittadini\nattivi",
      donate: "Dona un albero",
      report: "Segnala",
      near: "Aree vicino a te",
      map: "Mappa →",
      treesNeeded: "alberi richiesti",
      donateHere: "Dona qui",
      grow: "Segui la crescita",
      all: "Tutti →",
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
      tapHint: "Tocca un pin per vedere l'area e donare.",
    },
    donate: {
      thanks: ["Grazie!", "Il tuo albero arriva."],
      thanksBody: "La messa a dimora è programmata. Riceverai foto e aggiornamenti a ogni fase della crescita.",
      follow: "Segui il tuo albero",
      home: "Torna alla home",
      step: "PASSO",
      of4: "DI 4",
      q1: "Dove pianti?",
      q1sub: "Scegli l'area che vuoi sostenere.",
      q2: "Quale albero?",
      q2sub: "Specie autoctone, adatte al clima di Roma.",
      upTo: "Fino a",
      q3: "Il tuo contributo",
      q3sub: "Scegli quanta parte del ciclo sostenere.",
      q4: "Riepilogo",
      rArea: "Area",
      rTree: "Albero",
      rContrib: "Contributo",
      rCo2: "CO₂ assorbita",
      perYear: "kg / anno",
      total: "Totale",
      confirm: "Conferma e pianta",
      disclaimer: "Interventi eseguiti da operatori incaricati dall'amministrazione.",
    },
    report: {
      sent: ["Segnalazione", "inviata!"],
      sentBody: "Grazie. La tua segnalazione entra nella mappa partecipata e aiuta a orientare le prossime donazioni.",
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
    tree: {
      photo: "Foto dell'albero",
      growing: "In crescita",
      plantedOn: "Piantato Mar 2026",
      name: "Leccio",
      sci: "Quercus ilex · Viale del Pinciano, Roma",
      height: "Altezza",
      co2y: "CO₂/anno",
      donors: "Donatori",
      growth: "La crescita, passo per passo",
      g1: "Messa a dimora",
      g1d: "Mar 2026",
      g2: "+3 mesi",
      g2d: "Giu 2026",
      g3: "+1 anno",
      g3d: "Mar 2027",
      updates: "Aggiornamenti",
      u1: "Prima potatura di formazione completata.",
      u1d: "18 giu · Operatore comunale",
      u2: "Controllo attecchimento: ottimo stato di salute.",
      u2d: "2 mag · Manutentore del verde",
      u3: "Albero messo a dimora. Grazie ai 12 donatori!",
      u3d: "14 mar · Squadra verde Roma",
      again: "Vuoi piantarne un altro?",
      againSub: "Ci sono ancora 7 alberi richiesti in questa zona.",
      againCta: "Dona un albero qui",
    },
    profile: {
      name: "Marco Rossi",
      donated: "Alberi donati",
      reports: "Segnalazioni",
      contributed: "Contribuiti",
      myTrees: "I miei alberi",
      myReports: "Le mie segnalazioni",
      r1: "Piazzale Ostiense",
      r1d: "Piazza da rinverdire · 2 sett. fa",
      r1s: "In valutazione",
      r2: "Via dei Gracchi",
      r2d: "5 alberi abbattuti · 1 mese fa",
      r2s: "Pianificato",
    },
    sheet: { needed: "alberi richiesti", from: "a partire da", donateHere: "Dona in quest'area" },
    fab: {
      donate: "Dona un albero",
      donateSub: "Scegli area, specie e contributo",
      report: "Segnala un'area",
      reportSub: "Mappa una necessità di verde",
    },
    nav: { home: "Home", map: "Mappa", diary: "Diario", profile: "Profilo" },
    a11y: { back: "Indietro", actions: "Azioni" },
  },
  en: {
    role: { donatore: "Donor", informatore: "Scout" },
    ob: {
      h1: ["Let's rebuild", "our city's", "green."],
      lead: "Turn the wish to do good into real action: plant trees, report areas, help Rome grow. Together.",
      choose: "Choose how to take part",
      donor: "I'm a Donor",
      donorSub: "I choose where, which tree and how much to invest.",
      scout: "I'm a Scout",
      scoutSub: "I map the areas that need trees.",
      both: "You can always do both.",
    },
    home: {
      hi: "Hi, welcome back",
      title: "Your greener Rome",
      heroLabel: "TREES PLANTED IN ROME",
      heroBig: "1,240",
      heroGoal: "of a 5,000 goal by 2027",
      heroDone: "25% complete",
      heroLeft: "3,760 to go",
      myTrees: "Your\ntrees",
      co2y: "kg CO₂\na year",
      citizens: "Active\ncitizens",
      donate: "Donate a tree",
      report: "Report",
      near: "Areas near you",
      map: "Map →",
      treesNeeded: "trees needed",
      donateHere: "Donate here",
      grow: "Follow the growth",
      all: "All →",
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
      tapHint: "Tap a pin to view the area and donate.",
    },
    donate: {
      thanks: ["Thank you!", "Your tree is on its way."],
      thanksBody: "Planting is scheduled. You'll get photos and updates at every growth stage.",
      follow: "Follow your tree",
      home: "Back to home",
      step: "STEP",
      of4: "OF 4",
      q1: "Where do you plant?",
      q1sub: "Choose the area you want to support.",
      q2: "Which tree?",
      q2sub: "Native species, suited to Rome's climate.",
      upTo: "Up to",
      q3: "Your contribution",
      q3sub: "Choose how much of the cycle to support.",
      q4: "Summary",
      rArea: "Area",
      rTree: "Tree",
      rContrib: "Contribution",
      rCo2: "CO₂ absorbed",
      perYear: "kg / year",
      total: "Total",
      confirm: "Confirm and plant",
      disclaimer: "Work carried out by operators appointed by the city.",
    },
    report: {
      sent: ["Report", "sent!"],
      sentBody: "Thanks. Your report joins the participatory map and helps steer the next donations.",
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
    tree: {
      photo: "Tree photo",
      growing: "Growing",
      plantedOn: "Planted Mar 2026",
      name: "Holm oak",
      sci: "Quercus ilex · Viale del Pinciano, Rome",
      height: "Height",
      co2y: "CO₂/yr",
      donors: "Donors",
      growth: "Growth, step by step",
      g1: "Planting",
      g1d: "Mar 2026",
      g2: "+3 months",
      g2d: "Jun 2026",
      g3: "+1 year",
      g3d: "Mar 2027",
      updates: "Updates",
      u1: "First formative pruning done.",
      u1d: "18 Jun · City operator",
      u2: "Establishment check: excellent health.",
      u2d: "2 May · Green maintainer",
      u3: "Tree planted. Thanks to the 12 donors!",
      u3d: "14 Mar · Rome green crew",
      again: "Want to plant another?",
      againSub: "There are still 7 trees needed in this area.",
      againCta: "Donate a tree here",
    },
    profile: {
      name: "Marco Rossi",
      donated: "Trees donated",
      reports: "Reports",
      contributed: "Contributed",
      myTrees: "My trees",
      myReports: "My reports",
      r1: "Piazzale Ostiense",
      r1d: "Square to re-green · 2 wks ago",
      r1s: "Under review",
      r2: "Via dei Gracchi",
      r2d: "5 trees felled · 1 month ago",
      r2s: "Planned",
    },
    sheet: { needed: "trees needed", from: "from", donateHere: "Donate in this area" },
    fab: {
      donate: "Donate a tree",
      donateSub: "Choose area, species and contribution",
      report: "Report an area",
      reportSub: "Map a green need",
    },
    nav: { home: "Home", map: "Map", diary: "Diary", profile: "Profile" },
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
function ChevL({ stroke = "#16321F" }: { stroke?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke={stroke} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
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
// The original used a host-bridged <image-slot>. Here we ship a self-contained,
// session-only picker: tap or drop an image and it shows immediately (object
// URL kept in component state). No persistence — this is a demo.

function VuPhoto({
  label,
  height,
  radius = 16,
  bg = "#CFE8BE",
  rect = false,
}: {
  label: string;
  height: number;
  radius?: number;
  bg?: string;
  rect?: boolean;
}) {
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

  // Release the blob URL when the slot unmounts (screen navigation) so a
  // picked image isn't pinned in memory for the document's lifetime.
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const r = rect ? 0 : radius;
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
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height,
        border: "none",
        padding: 0,
        cursor: "pointer",
        borderRadius: r,
        overflow: "hidden",
        background: url ? "#dfe8d4" : bg,
        outline: over ? "2px solid #1B8A43" : "none",
        outlineOffset: -2,
        fontFamily: "inherit",
      }}
      aria-label={label}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 12,
            textAlign: "center",
            color: "#3E6B43",
          }}
        >
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, maxWidth: "92%" }}>{label}</span>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        hidden
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </button>
  );
}

/* ------------------------------ component ------------------------------ */

export type Screen = "onboarding" | "home" | "map" | "donate" | "report" | "tree" | "profile";
export type Role = "donatore" | "informatore";

export type VerdeUrbanoAppProps = {
  locale: Locale;
  entryScreen?: Screen;
  defaultRole?: Role;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function VerdeUrbanoApp({ locale, entryScreen = "onboarding", defaultRole = "donatore", scrollRef }: VerdeUrbanoAppProps) {
  const t = T[locale];
  const ls = useCallback((v: LS): string => (typeof v === "string" ? v : v[locale]), [locale]);

  const [screen, setScreen] = useState<Screen>(entryScreen);
  const [role, setRole] = useState<Role | null>(entryScreen === "onboarding" ? null : defaultRole);
  const [fabOpen, setFabOpen] = useState(false);
  const [dStep, setDStep] = useState(1);
  const [dArea, setDArea] = useState<string | null>(null);
  const [dTree, setDTree] = useState<string | null>(null);
  const [dLevel, setDLevel] = useState<string | null>(null);
  const [rStep, setRStep] = useState(1);
  const [rType, setRType] = useState<string | null>(null);
  const [rPlaced, setRPlaced] = useState(false);
  const [mapFilter, setMapFilter] = useState<"all" | "alta">("all");
  const [sheetArea, setSheetArea] = useState<Area | null>(null);
  const [myTrees, setMyTrees] = useState<MyTree[]>(INITIAL_TREES);

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
  const chooseRole = (r: Role) => {
    setRole(r);
    setScreen("home");
    toTop();
  };
  const openTree = () => {
    setScreen("tree");
    setFabOpen(false);
    setSheetArea(null);
    toTop();
  };
  const startDonate = (areaId?: string) => {
    setScreen("donate");
    setFabOpen(false);
    setSheetArea(null);
    setDStep(areaId ? 2 : 1);
    setDArea(areaId ?? null);
    setDTree(null);
    setDLevel(null);
    toTop();
  };
  const dBack = () => {
    if (dStep <= 1) return go("home");
    setDStep(dStep - 1);
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
  const rBack = () => {
    if (rStep <= 1) return go("home");
    setRStep(rStep - 1);
    toTop();
  };
  const confirmDonate = () => {
    const tree = TREES.find((x) => x.id === dTree);
    const area = AREAS.find((x) => x.id === dArea);
    const nt: MyTree = {
      id: "t" + myTrees.length + "_" + (tree?.id ?? "x"),
      species: tree ? tree.name : { it: "Albero", en: "Tree" },
      area: area ? area.name : locale === "it" ? "Roma" : "Rome",
      planted: { it: "Giu 2026", en: "Jun 2026" },
      status: { it: "Appena piantato", en: "Just planted" },
      progress: 8,
      h: { it: "1,2 m", en: "1.2 m" },
      color: tree ? tree.color : "#34B85A",
    };
    setMyTrees((prev) => [nt, ...prev]);
    setDStep(5);
    toTop();
  };

  /* derived values */
  const areas = AREAS.map((a) => ({ ...a, needColor: NEED_META[a.need].c, needLabel: ls(NEED_META[a.need].l), needSoft: NEED_META[a.need].soft }));
  type EArea = (typeof areas)[number];
  const pins = (mapFilter === "alta" ? areas.filter((a) => a.need === "alta") : areas);
  const nearby = areas.filter((a) => a.need !== "bassa").slice(0, 3);
  const baseTree = TREES.find((x) => x.id === dTree);
  const dTreeObj = TREES.find((x) => x.id === dTree);
  const dAreaObj = areas.find((a) => a.id === dArea);
  const dLevelObj = LEVELS.find((l) => l.id === dLevel);
  const dTotal = dTreeObj ? dTreeObj.price + (dLevelObj ? dLevelObj.extra : 0) : 0;

  const showNav = ["home", "map", "profile", "tree"].includes(screen);
  const navColor = (on: boolean) => (on ? "#1B8A43" : "#9AA59B");
  const roleLabel = role === "informatore" ? t.role.informatore : t.role.donatore;

  /* ------------------------------- screens ------------------------------ */

  const onboarding = (
    <div style={{ animation: "vu-screenIn .5s ease both", minHeight: "100%", background: "linear-gradient(180deg,#E7F3DD 0%,#FAF6EC 62%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 48, right: -30, width: 140, height: 140, borderRadius: "50%", background: "#C2E3A8", opacity: 0.6, animation: "vu-floaty 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: 170, left: -26, width: 90, height: 90, borderRadius: "50%", background: "#F6D08A", opacity: 0.55, animation: "vu-floaty2 7s ease-in-out infinite" }} />
      <div style={{ padding: "34px 28px 28px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#16321F", color: "#fff", padding: "9px 15px 9px 11px", borderRadius: 40, fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>
          <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: "50%", background: "#34B85A", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={15} stroke="#fff" sw={1.8} />
          </span>
          Verde Urbano
        </div>
        <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 42, lineHeight: 1.04, letterSpacing: -1.2, margin: "46px 0 16px", color: "#16321F" }}>
          {t.ob.h1[0]}
          <br />
          {t.ob.h1[1]}
          <br />
          {t.ob.h1[2]}
        </h1>
        <p style={{ fontSize: 16.5, lineHeight: 1.5, color: "#41513F", margin: "0 0 8px", maxWidth: 330 }}>{t.ob.lead}</p>
      </div>
      <div style={{ padding: "18px 22px 40px", position: "relative", zIndex: 2 }}>
        <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase", color: "#7E8C7C", margin: "0 0 14px 4px" }}>{t.ob.choose}</p>
        <button type="button" onClick={() => chooseRole("donatore")} style={{ display: "block", width: "100%", textAlign: "left", border: "none", cursor: "pointer", background: "#16321F", color: "#fff", borderRadius: 26, padding: 22, marginBottom: 14, position: "relative", overflow: "hidden", fontFamily: "inherit" }}>
          <div style={{ position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: "50%", background: "rgba(52,184,90,.22)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: "none", width: 54, height: 54, borderRadius: 18, background: "#34B85A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={28} stroke="#16321F" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 21 }}>{t.ob.donor}</div>
              <div style={{ fontSize: 14, color: "#B9D6BF", marginTop: 3, lineHeight: 1.35 }}>{t.ob.donorSub}</div>
            </div>
            <ChevR />
          </div>
        </button>
        <button type="button" onClick={() => chooseRole("informatore")} style={{ display: "block", width: "100%", textAlign: "left", border: "2px solid #D8E6CF", cursor: "pointer", background: "#fff", color: "#16321F", borderRadius: 26, padding: "20px 22px", position: "relative", overflow: "hidden", fontFamily: "inherit" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: "none", width: 54, height: 54, borderRadius: 18, background: "#E0654B", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PinIcon size={26} stroke="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 21 }}>{t.ob.scout}</div>
              <div style={{ fontSize: 14, color: "#6B7A6C", marginTop: 3, lineHeight: 1.35 }}>{t.ob.scoutSub}</div>
            </div>
            <ChevR stroke="#C9D4C2" />
          </div>
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#8A968A", margin: "22px 0 0" }}>{t.ob.both}</p>
      </div>
    </div>
  );

  const home = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, color: "#7E8C7C", fontWeight: 600 }}>{t.home.hi}</div>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 25, letterSpacing: -0.5, lineHeight: 1.1 }}>{t.home.title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E4F2DE", color: "#1B8A43", fontWeight: 700, fontSize: 12.5, padding: "7px 12px", borderRadius: 30 }}>{roleLabel}</div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#16321F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>MR</div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#163E22 0%,#1F5E33 100%)", borderRadius: 28, padding: 24, color: "#fff", position: "relative", overflow: "hidden", marginBottom: 16 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard value={String(myTrees.length)} label={t.home.myTrees} color="#1B8A43" />
        <StatCard value="49" label={t.home.co2y} color="#E59B26" />
        <StatCard value="3.4k" label={t.home.citizens} color="#2BAFC0" />
      </div>

      <div style={{ display: "flex", gap: 11, marginBottom: 26 }}>
        <button type="button" onClick={() => startDonate()} style={{ flex: 1, cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 16, fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(27,138,67,.28)", fontFamily: "inherit" }}>
          <Leaf size={19} stroke="#fff" />
          {t.home.donate}
        </button>
        <button type="button" onClick={() => startReport()} style={{ flex: 1, cursor: "pointer", border: "2px solid #1B8A43", background: "#fff", color: "#1B8A43", borderRadius: 18, padding: 14, fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
          <PinIcon size={19} stroke="#1B8A43" />
          {t.home.report}
        </button>
      </div>

      <SectionHead title={t.home.near} action={t.home.map} onAction={() => go("map")} />
      <div className="vu-noscroll" style={{ display: "flex", gap: 13, overflowX: "auto", margin: "0 -18px 26px", padding: "2px 18px 6px" }}>
        {nearby.map((a) => (
          <div key={a.id} style={{ flex: "none", width: 236, background: "#fff", border: "1px solid #ECE6D8", borderRadius: 22, padding: 16, boxShadow: "0 8px 22px rgba(20,51,30,.05)" }}>
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
              <button type="button" onClick={() => startDonate(a.id)} style={{ border: "none", cursor: "pointer", background: "#E4F2DE", color: "#1B8A43", fontWeight: 700, fontSize: 13.5, padding: "9px 14px", borderRadius: 14, fontFamily: "inherit" }}>{t.home.donateHere}</button>
            </div>
          </div>
        ))}
      </div>

      <SectionHead title={t.home.grow} action={t.home.all} onAction={() => go("profile")} />
      {myTrees.map((tr) => (
        <TreeRow key={tr.id} tr={tr} ls={ls} onOpen={openTree} />
      ))}
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

  const donateProg = Math.min(dStep, 4) * 25;
  const donate = (
    <div style={{ animation: "vu-screenIn .4s ease both", minHeight: "100%", padding: "20px 18px 40px", background: "#FAF6EC" }}>
      {dStep === 5 ? (
        <div style={{ textAlign: "center", paddingTop: 70 }}>
          <div style={{ width: 108, height: 108, borderRadius: "50%", background: "#E4F2DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px", animation: "vu-pop .7s cubic-bezier(.2,1.2,.4,1) both" }}>
            <Leaf size={56} stroke="#1B8A43" />
          </div>
          <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 30, letterSpacing: -0.6, margin: "0 0 12px" }}>
            {t.donate.thanks[0]}
            <br />
            {t.donate.thanks[1]}
          </h1>
          <p style={{ fontSize: 16, color: "#5E6B5F", lineHeight: 1.5, maxWidth: 300, margin: "0 auto 34px" }}>{t.donate.thanksBody}</p>
          <button type="button" onClick={openTree} style={btnPrimary}>{t.donate.follow}</button>
          <button type="button" onClick={() => go("home")} style={btnGhost}>{t.donate.home}</button>
        </div>
      ) : (
        <>
          <FlowHeader onBack={dBack} backLabel={t.a11y.back} kicker={`${t.donate.step} ${dStep} ${t.donate.of4}`} prog={donateProg} progColor="#1B8A43" />
          {dStep === 1 && (
            <>
              <FlowTitle title={t.donate.q1} sub={t.donate.q1sub} />
              {areas.map((a) => (
                <button key={a.id} type="button" onClick={() => { setDArea(a.id); setDStep(2); toTop(); }} style={{ ...pickBtn, borderColor: dArea === a.id ? "#1B8A43" : "#ECE6D8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <span style={{ flex: "none", width: 14, height: 14, borderRadius: "50%", background: a.needColor }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: "#7E8C7C" }}>{ls(a.zona)} · {a.count} {t.home.treesNeeded}</div>
                    </div>
                    <ChevR size={20} stroke="#C9D4C2" sw={2.1} />
                  </div>
                </button>
              ))}
            </>
          )}
          {dStep === 2 && (
            <>
              <FlowTitle title={t.donate.q2} sub={t.donate.q2sub} />
              {TREES.map((tr) => (
                <button key={tr.id} type="button" onClick={() => { setDTree(tr.id); setDStep(3); toTop(); }} style={{ ...pickBtn, background: dTree === tr.id ? "#F1F8EE" : "#fff", borderColor: dTree === tr.id ? "#1B8A43" : "#ECE6D8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ flex: "none", width: 48, height: 48, borderRadius: 15, background: tr.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Leaf size={25} stroke="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16.5 }}>{ls(tr.name)}</div>
                      <div style={{ fontSize: 12.5, color: "#7E8C7C", fontStyle: "italic" }}>{tr.sci}</div>
                      <div style={{ fontSize: 12.5, color: "#41513F", marginTop: 3 }}>{t.donate.upTo} {tr.h} · {tr.co2} kg CO₂/{locale === "it" ? "anno" : "yr"}</div>
                    </div>
                    <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 19, color: "#1B8A43" }}>€{tr.price}</div>
                  </div>
                </button>
              ))}
            </>
          )}
          {dStep === 3 && (
            <>
              <FlowTitle title={t.donate.q3} sub={t.donate.q3sub} />
              {LEVELS.map((l) => (
                <button key={l.id} type="button" onClick={() => { setDLevel(l.id); setDStep(4); toTop(); }} style={{ ...pickBtn, padding: 17, borderColor: dLevel === l.id ? "#1B8A43" : "#ECE6D8" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16.5 }}>{ls(l.name)}</div>
                      <div style={{ fontSize: 13.5, color: "#7E8C7C", marginTop: 2 }}>{ls(l.desc)}</div>
                    </div>
                    <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 22, color: "#1B8A43" }}>€{(baseTree ? baseTree.price : 0) + l.extra}</div>
                  </div>
                </button>
              ))}
            </>
          )}
          {dStep === 4 && (
            <>
              <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 26, letterSpacing: -0.5, margin: "0 0 18px" }}>{t.donate.q4}</h1>
              <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 22, padding: "6px 18px", marginBottom: 18 }}>
                <SummaryRow k={t.donate.rArea} v={dAreaObj ? dAreaObj.name : ""} />
                <SummaryRow k={t.donate.rTree} v={dTreeObj ? ls(dTreeObj.name) : ""} />
                <SummaryRow k={t.donate.rContrib} v={dLevelObj ? ls(dLevelObj.name) : ""} />
                <SummaryRow k={t.donate.rCo2} v={`${dTreeObj ? dTreeObj.co2 : 0} ${t.donate.perYear}`} vColor="#1B8A43" last />
              </div>
              <div style={{ background: "#16321F", color: "#fff", borderRadius: 22, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 15, color: "#BFE0C6" }}>{t.donate.total}</span>
                <span style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 30 }}>€{dTotal}</span>
              </div>
              <button type="button" onClick={confirmDonate} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 18, padding: 17, fontWeight: 700, fontSize: 16.5, boxShadow: "0 10px 24px rgba(27,138,67,.3)", fontFamily: "inherit" }}>{t.donate.confirm}</button>
              <p style={{ textAlign: "center", fontSize: 12.5, color: "#9AA59B", margin: "14px 0 0" }}>{t.donate.disclaimer}</p>
            </>
          )}
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

  const tree = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "0 0 132px" }}>
      <div style={{ position: "relative" }}>
        <VuPhoto label={t.tree.photo} height={230} rect bg="#CFE8BE" />
        <button type="button" onClick={() => go("home")} style={{ position: "absolute", top: 18, left: 18, width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.92)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.12)" }} aria-label={t.a11y.back}>
          <ChevL />
        </button>
      </div>
      <div style={{ padding: "20px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E4F2DE", color: "#1B8A43", fontWeight: 700, fontSize: 12.5, padding: "6px 12px", borderRadius: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1B8A43" }} />
            {t.tree.growing}
          </span>
          <span style={{ fontSize: 13, color: "#9AA59B", fontWeight: 600 }}>{t.tree.plantedOn}</span>
        </div>
        <h1 style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 28, letterSpacing: -0.6, margin: "0 0 2px" }}>{t.tree.name}</h1>
        <p style={{ fontSize: 14.5, color: "#7E8C7C", margin: "0 0 18px" }}>{t.tree.sci}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          <MiniStat value={locale === "it" ? "1,9 m" : "1.9 m"} label={t.tree.height} />
          <MiniStat value="31 kg" label={t.tree.co2y} color="#1B8A43" />
          <MiniStat value="12" label={t.tree.donors} color="#E59B26" />
        </div>

        <h2 style={sectionH2}>{t.tree.growth}</h2>
        <div style={{ display: "flex", gap: 11, marginBottom: 26 }}>
          <GrowthSlot label={t.tree.g1} date={t.tree.g1d} bg="#CFE8BE" />
          <GrowthSlot label={t.tree.g2} date={t.tree.g2d} bg="#C2E3A6" />
          <GrowthSlot label={t.tree.g3} date={t.tree.g3d} bg="#A9D88B" />
        </div>

        <h2 style={sectionH2}>{t.tree.updates}</h2>
        <div style={{ position: "relative", paddingLeft: 26 }}>
          <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: "#E4DFCD" }} />
          <TimelineItem dot="#1B8A43" title={t.tree.u1} date={t.tree.u1d} />
          <TimelineItem dot="#34B85A" title={t.tree.u2} date={t.tree.u2d} />
          <TimelineItem dot="#C2E3A6" title={t.tree.u3} date={t.tree.u3d} last />
        </div>

        <div style={{ background: "#16321F", borderRadius: 24, padding: 22, color: "#fff", marginTop: 26 }}>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 700, fontSize: 19, marginBottom: 4 }}>{t.tree.again}</div>
          <div style={{ fontSize: 14, color: "#BFE0C6", marginBottom: 16 }}>{t.tree.againSub}</div>
          <button type="button" onClick={() => startDonate()} style={{ width: "100%", cursor: "pointer", border: "none", background: "#34B85A", color: "#16321F", borderRadius: 15, padding: 15, fontWeight: 800, fontSize: 15.5, fontFamily: "inherit" }}>{t.tree.againCta}</button>
        </div>
      </div>
    </div>
  );

  const profile = (
    <div style={{ animation: "vu-screenIn .45s ease both", padding: "22px 18px 132px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div style={{ width: 64, height: 64, borderRadius: 22, background: "#16321F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, fontFamily: "var(--vu-font-display)" }}>MR</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 23, letterSpacing: -0.4 }}>{t.profile.name}</div>
          <div style={{ display: "flex", gap: 7, marginTop: 5 }}>
            <span style={{ background: "#E4F2DE", color: "#1B8A43", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 30 }}>{t.role.donatore}</span>
            <span style={{ background: "#FBE3DC", color: "#E0654B", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 30 }}>{t.role.informatore}</span>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#1F5E33,#163E22)", borderRadius: 24, padding: 22, color: "#fff", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(52,184,90,.22)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <ProfileStat value={String(myTrees.length)} label={t.profile.donated} />
          <ProfileStat value="2" label={t.profile.reports} />
          <ProfileStat value="€235" label={t.profile.contributed} />
        </div>
      </div>

      <h2 style={sectionH2}>{t.profile.myTrees}</h2>
      {myTrees.map((tr) => (
        <TreeRow key={tr.id} tr={tr} ls={ls} onOpen={openTree} />
      ))}

      <h2 style={{ ...sectionH2, marginTop: 24 }}>{t.profile.myReports}</h2>
      <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: "6px 16px" }}>
        <ReportRow dot="#E59B26" title={t.profile.r1} sub={t.profile.r1d} tag={t.profile.r1s} tagColor="#E59B26" tagBg="#FBEFD6" />
        <ReportRow dot="#1B8A43" title={t.profile.r2} sub={t.profile.r2d} tag={t.profile.r2s} tagColor="#1B8A43" tagBg="#E4F2DE" last />
      </div>
    </div>
  );

  let body: ReactNode = null;
  if (screen === "onboarding") body = onboarding;
  else if (screen === "home") body = home;
  else if (screen === "map") body = map;
  else if (screen === "donate") body = donate;
  else if (screen === "report") body = report;
  else if (screen === "tree") body = tree;
  else if (screen === "profile") body = profile;

  return (
    <>
      <div ref={scrollRef} className="vu-scroll">
        {body}
      </div>

      {/* map bottom sheet */}
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
            <p style={{ fontSize: 14, color: "#7E8C7C", margin: "0 0 16px" }}>{ls(sheetArea.zona)}</p>
            <div style={{ display: "flex", gap: 11, marginBottom: 18 }}>
              <SheetStat value={String(sheetArea.count)} label={t.sheet.needed} />
              <SheetStat value="€45+" label={t.sheet.from} color="#1B8A43" />
            </div>
            <button type="button" onClick={() => startDonate(sheetArea.id)} style={{ width: "100%", cursor: "pointer", border: "none", background: "#1B8A43", color: "#fff", borderRadius: 16, padding: 16, fontWeight: 700, fontSize: 16, fontFamily: "inherit" }}>{t.sheet.donateHere}</button>
          </div>
        </>
      )}

      {/* FAB action sheet */}
      {fabOpen && (
        <>
          <div onClick={() => setFabOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 62, background: "rgba(20,51,30,.4)" }} />
          <div className="vu-fabsheet" style={{ position: "absolute", left: 0, right: 0, bottom: 100, zIndex: 63, width: "100%", padding: "0 18px", animation: "vu-sheetUp .3s ease both" }}>
            <button type="button" onClick={() => startDonate()} style={fabItem}>
              <span style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: "#1B8A43", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Leaf size={24} stroke="#fff" />
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 16.5 }}>{t.fab.donate}</span>
                <span style={{ display: "block", fontSize: 13, color: "#7E8C7C" }}>{t.fab.donateSub}</span>
              </span>
            </button>
            <button type="button" onClick={() => startReport()} style={{ ...fabItem, marginBottom: 0 }}>
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

      {/* bottom nav */}
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
          <NavBtn label={t.nav.diary} color={navColor(screen === "tree")} onClick={openTree}>
            <Leaf size={24} stroke="currentColor" />
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

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: "15px 12px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 24, color }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#7E8C7C", fontWeight: 600, lineHeight: 1.2, marginTop: 2, whiteSpace: "pre-line" }}>{label}</div>
    </div>
  );
}
function MiniStat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ECE6D8", borderRadius: 18, padding: 14, textAlign: "center" }}>
      <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 21, color }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#7E8C7C", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 32 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#BFE0C6", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
function SheetStat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div style={{ flex: 1, background: "#F7F3E8", borderRadius: 16, padding: 14, textAlign: "center" }}>
      <div style={{ fontFamily: "var(--vu-font-display)", fontWeight: 800, fontSize: 22, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#7E8C7C", fontWeight: 600 }}>{label}</div>
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
function FlowHeader({ onBack, backLabel, kicker, prog, progColor }: { onBack: () => void; backLabel: string; kicker: string; prog: number; progColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <button type="button" onClick={onBack} style={{ flex: "none", width: 42, height: 42, borderRadius: "50%", border: "1px solid #ECE6D8", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label={backLabel}>
        <ChevL />
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
function SummaryRow({ k, v, vColor, last }: { k: string; v: string; vColor?: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: last ? "none" : "1px solid #F1ECDF" }}>
      <span style={{ color: "#7E8C7C" }}>{k}</span>
      <span style={{ fontWeight: 700, textAlign: "right", color: vColor }}>{v}</span>
    </div>
  );
}
function GrowthSlot({ label, date, bg }: { label: string; date: string; bg: string }) {
  return (
    <div style={{ flex: 1 }}>
      <VuPhoto label={label} height={110} bg={bg} />
      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 7 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#9AA59B" }}>{date}</div>
    </div>
  );
}
function TimelineItem({ dot, title, date, last }: { dot: string; title: string; date: string; last?: boolean }) {
  return (
    <div style={{ position: "relative", marginBottom: last ? 0 : 18 }}>
      <span style={{ position: "absolute", left: -26, top: 3, width: 16, height: 16, borderRadius: "50%", background: dot, border: "3px solid #FAF6EC" }} />
      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "#9AA59B", marginTop: 2 }}>{date}</div>
    </div>
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

function TreeRow({ tr, ls, onOpen }: { tr: MyTree; ls: (v: LS) => string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "#fff", border: "1px solid #ECE6D8", borderRadius: 20, padding: 15, marginBottom: 11, fontFamily: "inherit", color: "#16321F" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: tr.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={24} stroke="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{ls(tr.species)}</div>
            <div style={{ fontSize: 12.5, color: "#1B8A43", fontWeight: 700 }}>{ls(tr.status)}</div>
          </div>
          <div style={{ fontSize: 13, color: "#7E8C7C", margin: "1px 0 9px" }}>{tr.area} · {ls(tr.h)}</div>
          <div style={{ height: 7, borderRadius: 20, background: "#EEE9DA", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 20, background: "linear-gradient(90deg,#34B85A,#1B8A43)", width: `${tr.progress}%` }} />
          </div>
        </div>
      </div>
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
