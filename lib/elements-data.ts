export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type Element = {
  z: number;
  sym: string;
  name: string;
  period: number;
  group: number; // 1-18, lanthanides/actinides use 3
  category: ElementCategory;
  mass: number;
  /** Most stable / natural isotope neutron count */
  stableN: number;
  /** Electron shells: [K, L, M, N, O, P, Q] */
  shells: number[];
};

export const CATEGORY_COLOR: Record<ElementCategory, string> = {
  "alkali-metal":          "#ef4444",
  "alkaline-earth":        "#f97316",
  "transition-metal":      "#3b82f6",
  "post-transition-metal": "#06b6d4",
  "metalloid":             "#a3e635",
  "nonmetal":              "#22c55e",
  "halogen":               "#34d399",
  "noble-gas":             "#a855f7",
  "lanthanide":            "#ec4899",
  "actinide":              "#f43f5e",
  "unknown":               "#6b7280",
};

// fmt: z, sym, name(IT), period, group, category, mass, stableN, shells
export const ELEMENTS: Element[] = [
  { z:1,   sym:"H",   name:"Idrogeno",      period:1, group:1,  category:"nonmetal",              mass:1.008,   stableN:0,   shells:[1] },
  { z:2,   sym:"He",  name:"Elio",           period:1, group:18, category:"noble-gas",             mass:4.003,   stableN:2,   shells:[2] },
  { z:3,   sym:"Li",  name:"Litio",          period:2, group:1,  category:"alkali-metal",          mass:6.941,   stableN:4,   shells:[2,1] },
  { z:4,   sym:"Be",  name:"Berillio",       period:2, group:2,  category:"alkaline-earth",        mass:9.012,   stableN:5,   shells:[2,2] },
  { z:5,   sym:"B",   name:"Boro",           period:2, group:13, category:"metalloid",             mass:10.81,   stableN:6,   shells:[2,3] },
  { z:6,   sym:"C",   name:"Carbonio",       period:2, group:14, category:"nonmetal",              mass:12.011,  stableN:6,   shells:[2,4] },
  { z:7,   sym:"N",   name:"Azoto",          period:2, group:15, category:"nonmetal",              mass:14.007,  stableN:7,   shells:[2,5] },
  { z:8,   sym:"O",   name:"Ossigeno",       period:2, group:16, category:"nonmetal",              mass:15.999,  stableN:8,   shells:[2,6] },
  { z:9,   sym:"F",   name:"Fluoro",         period:2, group:17, category:"halogen",               mass:18.998,  stableN:10,  shells:[2,7] },
  { z:10,  sym:"Ne",  name:"Neon",           period:2, group:18, category:"noble-gas",             mass:20.18,   stableN:10,  shells:[2,8] },
  { z:11,  sym:"Na",  name:"Sodio",          period:3, group:1,  category:"alkali-metal",          mass:22.99,   stableN:12,  shells:[2,8,1] },
  { z:12,  sym:"Mg",  name:"Magnesio",       period:3, group:2,  category:"alkaline-earth",        mass:24.305,  stableN:12,  shells:[2,8,2] },
  { z:13,  sym:"Al",  name:"Alluminio",      period:3, group:13, category:"post-transition-metal", mass:26.982,  stableN:14,  shells:[2,8,3] },
  { z:14,  sym:"Si",  name:"Silicio",        period:3, group:14, category:"metalloid",             mass:28.086,  stableN:14,  shells:[2,8,4] },
  { z:15,  sym:"P",   name:"Fosforo",        period:3, group:15, category:"nonmetal",              mass:30.974,  stableN:16,  shells:[2,8,5] },
  { z:16,  sym:"S",   name:"Zolfo",          period:3, group:16, category:"nonmetal",              mass:32.06,   stableN:16,  shells:[2,8,6] },
  { z:17,  sym:"Cl",  name:"Cloro",          period:3, group:17, category:"halogen",               mass:35.45,   stableN:18,  shells:[2,8,7] },
  { z:18,  sym:"Ar",  name:"Argon",          period:3, group:18, category:"noble-gas",             mass:39.948,  stableN:22,  shells:[2,8,8] },
  { z:19,  sym:"K",   name:"Potassio",       period:4, group:1,  category:"alkali-metal",          mass:39.098,  stableN:20,  shells:[2,8,8,1] },
  { z:20,  sym:"Ca",  name:"Calcio",         period:4, group:2,  category:"alkaline-earth",        mass:40.078,  stableN:20,  shells:[2,8,8,2] },
  { z:21,  sym:"Sc",  name:"Scandio",        period:4, group:3,  category:"transition-metal",      mass:44.956,  stableN:24,  shells:[2,8,9,2] },
  { z:22,  sym:"Ti",  name:"Titanio",        period:4, group:4,  category:"transition-metal",      mass:47.867,  stableN:26,  shells:[2,8,10,2] },
  { z:23,  sym:"V",   name:"Vanadio",        period:4, group:5,  category:"transition-metal",      mass:50.942,  stableN:28,  shells:[2,8,11,2] },
  { z:24,  sym:"Cr",  name:"Cromo",          period:4, group:6,  category:"transition-metal",      mass:51.996,  stableN:28,  shells:[2,8,13,1] },
  { z:25,  sym:"Mn",  name:"Manganese",      period:4, group:7,  category:"transition-metal",      mass:54.938,  stableN:30,  shells:[2,8,13,2] },
  { z:26,  sym:"Fe",  name:"Ferro",          period:4, group:8,  category:"transition-metal",      mass:55.845,  stableN:30,  shells:[2,8,14,2] },
  { z:27,  sym:"Co",  name:"Cobalto",        period:4, group:9,  category:"transition-metal",      mass:58.933,  stableN:32,  shells:[2,8,15,2] },
  { z:28,  sym:"Ni",  name:"Nichel",         period:4, group:10, category:"transition-metal",      mass:58.693,  stableN:30,  shells:[2,8,16,2] },
  { z:29,  sym:"Cu",  name:"Rame",           period:4, group:11, category:"transition-metal",      mass:63.546,  stableN:34,  shells:[2,8,18,1] },
  { z:30,  sym:"Zn",  name:"Zinco",          period:4, group:12, category:"transition-metal",      mass:65.38,   stableN:34,  shells:[2,8,18,2] },
  { z:31,  sym:"Ga",  name:"Gallio",         period:4, group:13, category:"post-transition-metal", mass:69.723,  stableN:38,  shells:[2,8,18,3] },
  { z:32,  sym:"Ge",  name:"Germanio",       period:4, group:14, category:"metalloid",             mass:72.63,   stableN:40,  shells:[2,8,18,4] },
  { z:33,  sym:"As",  name:"Arsenico",       period:4, group:15, category:"metalloid",             mass:74.922,  stableN:42,  shells:[2,8,18,5] },
  { z:34,  sym:"Se",  name:"Selenio",        period:4, group:16, category:"nonmetal",              mass:78.971,  stableN:44,  shells:[2,8,18,6] },
  { z:35,  sym:"Br",  name:"Bromo",          period:4, group:17, category:"halogen",               mass:79.904,  stableN:44,  shells:[2,8,18,7] },
  { z:36,  sym:"Kr",  name:"Kripton",        period:4, group:18, category:"noble-gas",             mass:83.798,  stableN:48,  shells:[2,8,18,8] },
  { z:37,  sym:"Rb",  name:"Rubidio",        period:5, group:1,  category:"alkali-metal",          mass:85.468,  stableN:48,  shells:[2,8,18,8,1] },
  { z:38,  sym:"Sr",  name:"Stronzio",       period:5, group:2,  category:"alkaline-earth",        mass:87.62,   stableN:50,  shells:[2,8,18,8,2] },
  { z:39,  sym:"Y",   name:"Ittrio",         period:5, group:3,  category:"transition-metal",      mass:88.906,  stableN:50,  shells:[2,8,18,9,2] },
  { z:40,  sym:"Zr",  name:"Zirconio",       period:5, group:4,  category:"transition-metal",      mass:91.224,  stableN:51,  shells:[2,8,18,10,2] },
  { z:41,  sym:"Nb",  name:"Niobio",         period:5, group:5,  category:"transition-metal",      mass:92.906,  stableN:52,  shells:[2,8,18,12,1] },
  { z:42,  sym:"Mo",  name:"Molibdeno",      period:5, group:6,  category:"transition-metal",      mass:95.95,   stableN:54,  shells:[2,8,18,13,1] },
  { z:43,  sym:"Tc",  name:"Tecnezio",       period:5, group:7,  category:"transition-metal",      mass:98,      stableN:56,  shells:[2,8,18,13,2] },
  { z:44,  sym:"Ru",  name:"Rutenio",        period:5, group:8,  category:"transition-metal",      mass:101.07,  stableN:57,  shells:[2,8,18,15,1] },
  { z:45,  sym:"Rh",  name:"Rodio",          period:5, group:9,  category:"transition-metal",      mass:102.906, stableN:58,  shells:[2,8,18,16,1] },
  { z:46,  sym:"Pd",  name:"Palladio",       period:5, group:10, category:"transition-metal",      mass:106.42,  stableN:60,  shells:[2,8,18,18] },
  { z:47,  sym:"Ag",  name:"Argento",        period:5, group:11, category:"transition-metal",      mass:107.868, stableN:60,  shells:[2,8,18,18,1] },
  { z:48,  sym:"Cd",  name:"Cadmio",         period:5, group:12, category:"transition-metal",      mass:112.414, stableN:64,  shells:[2,8,18,18,2] },
  { z:49,  sym:"In",  name:"Indio",          period:5, group:13, category:"post-transition-metal", mass:114.818, stableN:66,  shells:[2,8,18,18,3] },
  { z:50,  sym:"Sn",  name:"Stagno",         period:5, group:14, category:"post-transition-metal", mass:118.71,  stableN:70,  shells:[2,8,18,18,4] },
  { z:51,  sym:"Sb",  name:"Antimonio",      period:5, group:15, category:"metalloid",             mass:121.76,  stableN:70,  shells:[2,8,18,18,5] },
  { z:52,  sym:"Te",  name:"Tellurio",       period:5, group:16, category:"metalloid",             mass:127.6,   stableN:76,  shells:[2,8,18,18,6] },
  { z:53,  sym:"I",   name:"Iodio",          period:5, group:17, category:"halogen",               mass:126.904, stableN:74,  shells:[2,8,18,18,7] },
  { z:54,  sym:"Xe",  name:"Xenon",          period:5, group:18, category:"noble-gas",             mass:131.293, stableN:78,  shells:[2,8,18,18,8] },
  { z:55,  sym:"Cs",  name:"Cesio",          period:6, group:1,  category:"alkali-metal",          mass:132.905, stableN:78,  shells:[2,8,18,18,8,1] },
  { z:56,  sym:"Ba",  name:"Bario",          period:6, group:2,  category:"alkaline-earth",        mass:137.327, stableN:82,  shells:[2,8,18,18,8,2] },
  { z:57,  sym:"La",  name:"Lantanio",       period:6, group:3,  category:"lanthanide",            mass:138.905, stableN:82,  shells:[2,8,18,18,9,2] },
  { z:58,  sym:"Ce",  name:"Cerio",          period:6, group:3,  category:"lanthanide",            mass:140.116, stableN:82,  shells:[2,8,18,19,9,2] },
  { z:59,  sym:"Pr",  name:"Praseodimio",    period:6, group:3,  category:"lanthanide",            mass:140.908, stableN:82,  shells:[2,8,18,21,8,2] },
  { z:60,  sym:"Nd",  name:"Neodimio",       period:6, group:3,  category:"lanthanide",            mass:144.242, stableN:84,  shells:[2,8,18,22,8,2] },
  { z:61,  sym:"Pm",  name:"Prometio",       period:6, group:3,  category:"lanthanide",            mass:145,     stableN:84,  shells:[2,8,18,23,8,2] },
  { z:62,  sym:"Sm",  name:"Samario",        period:6, group:3,  category:"lanthanide",            mass:150.36,  stableN:88,  shells:[2,8,18,24,8,2] },
  { z:63,  sym:"Eu",  name:"Europio",        period:6, group:3,  category:"lanthanide",            mass:151.964, stableN:88,  shells:[2,8,18,25,8,2] },
  { z:64,  sym:"Gd",  name:"Gadolinio",      period:6, group:3,  category:"lanthanide",            mass:157.25,  stableN:93,  shells:[2,8,18,25,9,2] },
  { z:65,  sym:"Tb",  name:"Terbio",         period:6, group:3,  category:"lanthanide",            mass:158.925, stableN:94,  shells:[2,8,18,27,8,2] },
  { z:66,  sym:"Dy",  name:"Disprosio",      period:6, group:3,  category:"lanthanide",            mass:162.5,   stableN:96,  shells:[2,8,18,28,8,2] },
  { z:67,  sym:"Ho",  name:"Olmio",          period:6, group:3,  category:"lanthanide",            mass:164.93,  stableN:98,  shells:[2,8,18,29,8,2] },
  { z:68,  sym:"Er",  name:"Erbio",          period:6, group:3,  category:"lanthanide",            mass:167.259, stableN:100, shells:[2,8,18,30,8,2] },
  { z:69,  sym:"Tm",  name:"Tulio",          period:6, group:3,  category:"lanthanide",            mass:168.934, stableN:100, shells:[2,8,18,31,8,2] },
  { z:70,  sym:"Yb",  name:"Itterbio",       period:6, group:3,  category:"lanthanide",            mass:173.045, stableN:102, shells:[2,8,18,32,8,2] },
  { z:71,  sym:"Lu",  name:"Lutezio",        period:6, group:3,  category:"lanthanide",            mass:174.967, stableN:104, shells:[2,8,18,32,9,2] },
  { z:72,  sym:"Hf",  name:"Afnio",          period:6, group:4,  category:"transition-metal",      mass:178.49,  stableN:106, shells:[2,8,18,32,10,2] },
  { z:73,  sym:"Ta",  name:"Tantalio",       period:6, group:5,  category:"transition-metal",      mass:180.948, stableN:108, shells:[2,8,18,32,11,2] },
  { z:74,  sym:"W",   name:"Tungsteno",      period:6, group:6,  category:"transition-metal",      mass:183.84,  stableN:110, shells:[2,8,18,32,12,2] },
  { z:75,  sym:"Re",  name:"Renio",          period:6, group:7,  category:"transition-metal",      mass:186.207, stableN:112, shells:[2,8,18,32,13,2] },
  { z:76,  sym:"Os",  name:"Osmio",          period:6, group:8,  category:"transition-metal",      mass:190.23,  stableN:114, shells:[2,8,18,32,14,2] },
  { z:77,  sym:"Ir",  name:"Iridio",         period:6, group:9,  category:"transition-metal",      mass:192.217, stableN:116, shells:[2,8,18,32,15,2] },
  { z:78,  sym:"Pt",  name:"Platino",        period:6, group:10, category:"transition-metal",      mass:195.084, stableN:117, shells:[2,8,18,32,17,1] },
  { z:79,  sym:"Au",  name:"Oro",            period:6, group:11, category:"transition-metal",      mass:196.967, stableN:118, shells:[2,8,18,32,18,1] },
  { z:80,  sym:"Hg",  name:"Mercurio",       period:6, group:12, category:"transition-metal",      mass:200.592, stableN:121, shells:[2,8,18,32,18,2] },
  { z:81,  sym:"Tl",  name:"Tallio",         period:6, group:13, category:"post-transition-metal", mass:204.38,  stableN:122, shells:[2,8,18,32,18,3] },
  { z:82,  sym:"Pb",  name:"Piombo",         period:6, group:14, category:"post-transition-metal", mass:207.2,   stableN:124, shells:[2,8,18,32,18,4] },
  { z:83,  sym:"Bi",  name:"Bismuto",        period:6, group:15, category:"post-transition-metal", mass:208.98,  stableN:126, shells:[2,8,18,32,18,5] },
  { z:84,  sym:"Po",  name:"Polonio",        period:6, group:16, category:"post-transition-metal", mass:209,     stableN:126, shells:[2,8,18,32,18,6] },
  { z:85,  sym:"At",  name:"Astato",         period:6, group:17, category:"halogen",               mass:210,     stableN:125, shells:[2,8,18,32,18,7] },
  { z:86,  sym:"Rn",  name:"Radon",          period:6, group:18, category:"noble-gas",             mass:222,     stableN:136, shells:[2,8,18,32,18,8] },
  { z:87,  sym:"Fr",  name:"Francio",        period:7, group:1,  category:"alkali-metal",          mass:223,     stableN:136, shells:[2,8,18,32,18,8,1] },
  { z:88,  sym:"Ra",  name:"Radio",          period:7, group:2,  category:"alkaline-earth",        mass:226,     stableN:138, shells:[2,8,18,32,18,8,2] },
  { z:89,  sym:"Ac",  name:"Attinio",        period:7, group:3,  category:"actinide",              mass:227,     stableN:138, shells:[2,8,18,32,18,9,2] },
  { z:90,  sym:"Th",  name:"Torio",          period:7, group:3,  category:"actinide",              mass:232.038, stableN:142, shells:[2,8,18,32,18,10,2] },
  { z:91,  sym:"Pa",  name:"Protoattinio",   period:7, group:3,  category:"actinide",              mass:231.036, stableN:140, shells:[2,8,18,32,20,9,2] },
  { z:92,  sym:"U",   name:"Uranio",         period:7, group:3,  category:"actinide",              mass:238.029, stableN:146, shells:[2,8,18,32,21,9,2] },
  { z:93,  sym:"Np",  name:"Nettunio",       period:7, group:3,  category:"actinide",              mass:237,     stableN:144, shells:[2,8,18,32,22,9,2] },
  { z:94,  sym:"Pu",  name:"Plutonio",       period:7, group:3,  category:"actinide",              mass:244,     stableN:150, shells:[2,8,18,32,24,8,2] },
  { z:95,  sym:"Am",  name:"Americio",       period:7, group:3,  category:"actinide",              mass:243,     stableN:148, shells:[2,8,18,32,25,8,2] },
  { z:96,  sym:"Cm",  name:"Curio",          period:7, group:3,  category:"actinide",              mass:247,     stableN:151, shells:[2,8,18,32,25,9,2] },
  { z:97,  sym:"Bk",  name:"Berkelio",       period:7, group:3,  category:"actinide",              mass:247,     stableN:150, shells:[2,8,18,32,27,8,2] },
  { z:98,  sym:"Cf",  name:"Californio",     period:7, group:3,  category:"actinide",              mass:251,     stableN:153, shells:[2,8,18,32,28,8,2] },
  { z:99,  sym:"Es",  name:"Einsteinio",     period:7, group:3,  category:"actinide",              mass:252,     stableN:153, shells:[2,8,18,32,29,8,2] },
  { z:100, sym:"Fm",  name:"Fermio",         period:7, group:3,  category:"actinide",              mass:257,     stableN:157, shells:[2,8,18,32,30,8,2] },
  { z:101, sym:"Md",  name:"Mendelevio",     period:7, group:3,  category:"actinide",              mass:258,     stableN:157, shells:[2,8,18,32,31,8,2] },
  { z:102, sym:"No",  name:"Nobelio",        period:7, group:3,  category:"actinide",              mass:259,     stableN:157, shells:[2,8,18,32,32,8,2] },
  { z:103, sym:"Lr",  name:"Laurenzio",      period:7, group:3,  category:"actinide",              mass:262,     stableN:159, shells:[2,8,18,32,32,8,3] },
  { z:104, sym:"Rf",  name:"Rutherfordio",   period:7, group:4,  category:"transition-metal",      mass:267,     stableN:163, shells:[2,8,18,32,32,10,2] },
  { z:105, sym:"Db",  name:"Dubnio",         period:7, group:5,  category:"transition-metal",      mass:270,     stableN:163, shells:[2,8,18,32,32,11,2] },
  { z:106, sym:"Sg",  name:"Seaborgio",      period:7, group:6,  category:"transition-metal",      mass:271,     stableN:165, shells:[2,8,18,32,32,12,2] },
  { z:107, sym:"Bh",  name:"Bohrio",         period:7, group:7,  category:"transition-metal",      mass:270,     stableN:163, shells:[2,8,18,32,32,13,2] },
  { z:108, sym:"Hs",  name:"Hassio",         period:7, group:8,  category:"transition-metal",      mass:277,     stableN:169, shells:[2,8,18,32,32,14,2] },
  { z:109, sym:"Mt",  name:"Meitnerio",      period:7, group:9,  category:"unknown",               mass:278,     stableN:169, shells:[2,8,18,32,32,15,2] },
  { z:110, sym:"Ds",  name:"Darmstadtio",    period:7, group:10, category:"unknown",               mass:281,     stableN:171, shells:[2,8,18,32,32,17,1] },
  { z:111, sym:"Rg",  name:"Roentgenio",     period:7, group:11, category:"unknown",               mass:282,     stableN:171, shells:[2,8,18,32,32,18,1] },
  { z:112, sym:"Cn",  name:"Copernicio",     period:7, group:12, category:"transition-metal",      mass:285,     stableN:173, shells:[2,8,18,32,32,18,2] },
  { z:113, sym:"Nh",  name:"Nihonio",        period:7, group:13, category:"unknown",               mass:286,     stableN:173, shells:[2,8,18,32,32,18,3] },
  { z:114, sym:"Fl",  name:"Flerovio",       period:7, group:14, category:"unknown",               mass:289,     stableN:175, shells:[2,8,18,32,32,18,4] },
  { z:115, sym:"Mc",  name:"Moscovio",       period:7, group:15, category:"unknown",               mass:290,     stableN:175, shells:[2,8,18,32,32,18,5] },
  { z:116, sym:"Lv",  name:"Livermorio",     period:7, group:16, category:"unknown",               mass:293,     stableN:177, shells:[2,8,18,32,32,18,6] },
  { z:117, sym:"Ts",  name:"Tennesso",       period:7, group:17, category:"unknown",               mass:294,     stableN:177, shells:[2,8,18,32,32,18,7] },
  { z:118, sym:"Og",  name:"Oganesson",      period:7, group:18, category:"unknown",               mass:294,     stableN:176, shells:[2,8,18,32,32,18,8] },
];

export const ELEMENT_BY_Z = Object.fromEntries(ELEMENTS.map(e => [e.z, e]));

// Grid position: lanthanides row = period 8 (displayed below), actinides = period 9
// Returns [col, row] where col is 1-18 and row is 1-7 (+ 2 for f-block)
export function gridPosition(el: Element): { col: number; row: number } {
  if (el.category === "lanthanide") {
    return { col: el.z - 57 + 4, row: 9 };
  }
  if (el.category === "actinide") {
    return { col: el.z - 89 + 4, row: 10 };
  }
  // For f-block placeholders (La/Ac row), shift right after group 2
  let col = el.group;
  // Period 6 & 7: groups 3-18 shift right by 1 to leave space for f-block
  // Lanthanides/actinides already returned above; col = group for everything else.
  return { col, row: el.period };
}
