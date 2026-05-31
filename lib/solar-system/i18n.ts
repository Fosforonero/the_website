/**
 * Solar System Lab — bilingual UI copy (IT / EN).
 */

export type SolarLocale = "it" | "en";

export const SOLAR_UI = {
  it: {
    title: "Sistema Solare",
    subtitle: "Osservatorio 3D con dati aperti e fonti dichiarate",
    support: "Supporta su Ko-fi",
    supportLong:
      "Questo laboratorio è gratuito, senza pubblicità e costruito con dati aperti o pubblici. Se ti è utile o vuoi sostenere lo sviluppo di nuovi strumenti scientifici interattivi, puoi offrire un caffè su Ko-fi.",
    nowBtn: "Adesso",
    playBtn: "Riproduci",
    pauseBtn: "Pausa",
    speed: "Velocità",
    distanceMode: "Scala distanza",
    radiusMode: "Scala raggio",
    labels: "Etichette",
    constellations: "Costellazioni",
    deepSky: "Oggetti celesti",
    bodies: "Corpi celesti",
    inspector: "Ispettore",
    category: "Categoria",
    parent: "Corpo padre",
    radius: "Raggio",
    mass: "Massa",
    epoch: "Epoca",
    source: "Fonte",
    assetConfidence: "Qualità asset",
    sourcesPage: "Dati e fonti →",
    loading: "Caricamento simulazione...",
    categories: {
      star: "Stella",
      planet: "Pianeta",
      "dwarf-planet": "Pianeta nano",
      moon: "Luna",
      asteroid: "Asteroide",
      comet: "Cometa",
      tno: "Oggetto trans-nettuniano",
    },
    distanceModes: {
      compressed: "Compressa",
      "real-log": "Logaritmica",
      "inner-system": "Sistema interno",
    },
    radiusModes: {
      visible: "Visibile educativa",
      relative: "Relativa reale",
    },
    speeds: {
      "1": "×1 (tempo reale)",
      "24": "×24 (1 giorno/ora)",
      "365": "×365 (1 anno/ora)",
      "3650": "×3650 (10 anni/ora)",
    },
    firmamentSource:
      "Stelle: catalogo Hipparcos ESA · Costellazioni: Stellarium Sky Cultures · Oggetti profondi: OpenNGC",
    epochNote:
      "Posizioni approssimate (elementi orbitali MVP). Precisione JPL Horizons in arrivo.",
    moonScaleNote: "Le lune usano una scala locale aumentata per restare leggibili.",
    radiusScaleNote: "Il raggio visivo è scalato indipendentemente dalla distanza orbitale.",
  },
  en: {
    title: "Solar System",
    subtitle: "3D observatory with open data and cited sources",
    support: "Support on Ko-fi",
    supportLong:
      "This lab is free, ad-free and built on open or public data. If it is useful to you or you want to support more interactive scientific tools, you can buy a coffee on Ko-fi.",
    nowBtn: "Now",
    playBtn: "Play",
    pauseBtn: "Pause",
    speed: "Speed",
    distanceMode: "Distance scale",
    radiusMode: "Radius scale",
    labels: "Labels",
    constellations: "Constellations",
    deepSky: "Deep-sky objects",
    bodies: "Celestial bodies",
    inspector: "Inspector",
    category: "Category",
    parent: "Parent body",
    radius: "Radius",
    mass: "Mass",
    epoch: "Epoch",
    source: "Source",
    assetConfidence: "Asset quality",
    sourcesPage: "Data & sources →",
    loading: "Loading simulation...",
    categories: {
      star: "Star",
      planet: "Planet",
      "dwarf-planet": "Dwarf planet",
      moon: "Moon",
      asteroid: "Asteroid",
      comet: "Comet",
      tno: "Trans-Neptunian object",
    },
    distanceModes: {
      compressed: "Compressed",
      "real-log": "Logarithmic",
      "inner-system": "Inner system",
    },
    radiusModes: {
      visible: "Educational visible",
      relative: "Physical relative",
    },
    speeds: {
      "1": "×1 (real time)",
      "24": "×24 (1 day/hour)",
      "365": "×365 (1 year/hour)",
      "3650": "×3650 (10 years/hour)",
    },
    firmamentSource:
      "Stars: ESA Hipparcos catalog · Constellations: Stellarium Sky Cultures · Deep-sky: OpenNGC",
    epochNote:
      "Approximate positions (MVP orbital elements). JPL Horizons precision coming soon.",
    moonScaleNote: "Moons use an expanded local scale so they remain readable.",
    radiusScaleNote: "Visual radius is scaled independently from orbital distance.",
  },
} as const;
