// Common molecules keyed by characteristic element Z.
// Geometry: VSEPR-derived Cartesian coordinates (visual Å-scale, centered at origin).
// Bond order: 1=single, 2=double, 3=triple

export type BondOrder = 1 | 2 | 3;
export type BondType  = "covalent" | "polar" | "ionic";

export interface MolAtom {
  elem: number;             // atomic number
  x: number; y: number; pz: number; // 3D position
}

export interface MolBond {
  a: number; b: number;    // atom indices
  order: BondOrder;
  type: BondType;
}

export interface Molecule {
  formula: string;
  nameIT: string;
  nameEN: string;
  atoms: MolAtom[];
  bonds: MolBond[];
  geometry: string;
  descIT: string;
  descEN: string;
}

// ─── Molecule definitions ─────────────────────────────────────────────────────

const H2: Molecule = {
  formula: "H₂", nameIT: "Idrogeno molecolare", nameEN: "Molecular hydrogen",
  geometry: "linear",
  descIT: "Legame covalente omopolare. Due atomi H condividono una coppia di elettroni (σ 1s-1s).",
  descEN: "Nonpolar covalent bond. Two H atoms share one electron pair (σ 1s-1s).",
  atoms: [
    { elem:1, x:-0.37, y:0, pz:0 },
    { elem:1, x: 0.37, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"covalent" }],
};

const H2O: Molecule = {
  formula: "H₂O", nameIT: "Acqua", nameEN: "Water",
  geometry: "bent",
  descIT: "Geometria angolata (104.5°). Due legami polari O–H con coppie solitarie sull'ossigeno.",
  descEN: "Bent geometry (104.5°). Two polar O–H bonds with lone pairs on oxygen.",
  atoms: [
    { elem:8, x: 0,     y: 0.12, pz:0 },
    { elem:1, x:-0.76,  y:-0.47, pz:0 },
    { elem:1, x: 0.76,  y:-0.47, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
  ],
};

const O2: Molecule = {
  formula: "O₂", nameIT: "Ossigeno molecolare", nameEN: "Molecular oxygen",
  geometry: "linear",
  descIT: "Doppio legame O=O con due elettroni spaiati (paramagnetico).",
  descEN: "Double covalent O=O bond with two unpaired electrons (paramagnetic).",
  atoms: [
    { elem:8, x:-0.60, y:0, pz:0 },
    { elem:8, x: 0.60, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:2, type:"covalent" }],
};

const CO2: Molecule = {
  formula: "CO₂", nameIT: "Anidride carbonica", nameEN: "Carbon dioxide",
  geometry: "linear",
  descIT: "Lineare con due doppi legami polari C=O. Dipoli opposti si annullano.",
  descEN: "Linear, two polar C=O double bonds. Opposing dipoles cancel.",
  atoms: [
    { elem:6, x: 0,    y:0, pz:0 },
    { elem:8, x:-1.16, y:0, pz:0 },
    { elem:8, x: 1.16, y:0, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:2, type:"polar" },
  ],
};

const NH3: Molecule = {
  formula: "NH₃", nameIT: "Ammoniaca", nameEN: "Ammonia",
  geometry: "trigonal pyramidal",
  descIT: "Piramide trigonale. Tre legami N–H e una coppia solitaria sull'azoto.",
  descEN: "Trigonal pyramidal. Three N–H bonds plus one lone pair on nitrogen.",
  atoms: [
    { elem:7, x: 0,    y: 0.38,  pz: 0     },
    { elem:1, x: 0,    y:-0.38,  pz: 0.94  },
    { elem:1, x: 0.82, y:-0.38,  pz:-0.47  },
    { elem:1, x:-0.82, y:-0.38,  pz:-0.47  },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
  ],
};

const CH4: Molecule = {
  formula: "CH₄", nameIT: "Metano", nameEN: "Methane",
  geometry: "tetrahedral",
  descIT: "Geometria tetraedrica (109.5°). Quattro legami C–H covalenti equivalenti.",
  descEN: "Tetrahedral geometry (109.5°). Four equivalent covalent C–H bonds.",
  atoms: [
    { elem:6, x: 0,    y: 0,    pz: 0    },
    { elem:1, x: 0.63, y: 0.63, pz: 0.63 },
    { elem:1, x:-0.63, y:-0.63, pz: 0.63 },
    { elem:1, x:-0.63, y: 0.63, pz:-0.63 },
    { elem:1, x: 0.63, y:-0.63, pz:-0.63 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
    { a:0, b:4, order:1, type:"polar" },
  ],
};

const HCl: Molecule = {
  formula: "HCl", nameIT: "Acido cloridrico", nameEN: "Hydrogen chloride",
  geometry: "linear",
  descIT: "Legame polare H–Cl: densità elettronica concentrata sull'atomo di Cl più elettronegativo.",
  descEN: "Polar H–Cl bond: electron density shifts towards the more electronegative Cl atom.",
  atoms: [
    { elem:1,  x:-0.64, y:0, pz:0 },
    { elem:17, x: 0.64, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"polar" }],
};

const NaCl: Molecule = {
  formula: "NaCl", nameIT: "Cloruro di sodio", nameEN: "Sodium chloride",
  geometry: "linear",
  descIT: "Legame ionico: il sodio cede un elettrone al cloro (Na⁺ e Cl⁻).",
  descEN: "Ionic bond: sodium donates one electron to chlorine, forming Na⁺ and Cl⁻.",
  atoms: [
    { elem:11, x:-1.18, y:0, pz:0 },
    { elem:17, x: 1.18, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"ionic" }],
};

const N2: Molecule = {
  formula: "N₂", nameIT: "Azoto molecolare", nameEN: "Molecular nitrogen",
  geometry: "linear",
  descIT: "Triplo legame N≡N (σ + 2π). Molto stabile (ΔH = 945 kJ/mol).",
  descEN: "Triple bond N≡N (σ + 2π bonds). Very stable (ΔH = 945 kJ/mol).",
  atoms: [
    { elem:7, x:-0.55, y:0, pz:0 },
    { elem:7, x: 0.55, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:3, type:"covalent" }],
};

const F2: Molecule = {
  formula: "F₂", nameIT: "Fluoro molecolare", nameEN: "Molecular fluorine",
  geometry: "linear",
  descIT: "Legame F–F debole (159 kJ/mol) per repulsione tra coppie solitarie vicine.",
  descEN: "Weak F–F bond (159 kJ/mol) due to close lone-pair repulsion.",
  atoms: [
    { elem:9, x:-0.71, y:0, pz:0 },
    { elem:9, x: 0.71, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"covalent" }],
};

const SO2: Molecule = {
  formula: "SO₂", nameIT: "Anidride solforosa", nameEN: "Sulfur dioxide",
  geometry: "bent",
  descIT: "Geometria angolata (119°). Legami S=O con risonanza, coppia solitaria sullo zolfo.",
  descEN: "Bent geometry (119°). S=O bonds with resonance and lone pair on sulfur.",
  atoms: [
    { elem:16, x: 0,     y: 0.30,  pz:0 },
    { elem:8,  x:-1.08,  y:-0.45,  pz:0 },
    { elem:8,  x: 1.08,  y:-0.45,  pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:2, type:"polar" },
  ],
};

const H2S: Molecule = {
  formula: "H₂S", nameIT: "Acido solfidrico", nameEN: "Hydrogen sulfide",
  geometry: "bent",
  descIT: "Geometria angolata (92°). Analogo di H₂O ma meno polare. Odore di uova marce.",
  descEN: "Bent geometry (92°). H₂O analogue but less polar. Rotten-egg smell.",
  atoms: [
    { elem:16, x: 0,    y: 0.15, pz:0 },
    { elem:1,  x:-0.97, y:-0.60, pz:0 },
    { elem:1,  x: 0.97, y:-0.60, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
  ],
};

const H2SO4: Molecule = {
  formula: "H₂SO₄", nameIT: "Acido solforico", nameEN: "Sulfuric acid",
  geometry: "tetrahedral",
  descIT: "Tetraedro attorno a S. Due legami S=O e due gruppi O–H. Forte acido diprotico.",
  descEN: "Tetrahedral around S. Two S=O double bonds and two O–H groups. Strong diprotic acid.",
  atoms: [
    { elem:16, x: 0,     y: 0,     pz: 0     },
    { elem:8,  x: 1.07,  y: 0.60,  pz: 0.43  },
    { elem:8,  x:-1.07,  y: 0.60,  pz:-0.43  },
    { elem:8,  x: 0.97,  y:-0.82,  pz:-0.29  },
    { elem:8,  x:-0.97,  y:-0.82,  pz: 0.29  },
    { elem:1,  x: 1.75,  y:-1.30,  pz:-0.48  },
    { elem:1,  x:-1.75,  y:-1.30,  pz: 0.48  },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:2, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
    { a:0, b:4, order:1, type:"polar" },
    { a:3, b:5, order:1, type:"polar" },
    { a:4, b:6, order:1, type:"polar" },
  ],
};

const Cl2: Molecule = {
  formula: "Cl₂", nameIT: "Cloro molecolare", nameEN: "Molecular chlorine",
  geometry: "linear",
  descIT: "Legame covalente apolare Cl–Cl. Agente ossidante e disinfettante.",
  descEN: "Nonpolar covalent Cl–Cl bond. Oxidising agent and disinfectant.",
  atoms: [
    { elem:17, x:-1.0, y:0, pz:0 },
    { elem:17, x: 1.0, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"covalent" }],
};

const NaOH: Molecule = {
  formula: "NaOH", nameIT: "Idrossido di sodio", nameEN: "Sodium hydroxide",
  geometry: "linear",
  descIT: "Base forte: legame ionico Na–O e legame covalente polare O–H.",
  descEN: "Strong base: ionic Na–O bond and polar covalent O–H bond.",
  atoms: [
    { elem:11, x:-1.80, y:0, pz:0 },
    { elem:8,  x: 0,    y:0, pz:0 },
    { elem:1,  x: 0.97, y:0, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:1, b:2, order:1, type:"polar" },
  ],
};

const MgO: Molecule = {
  formula: "MgO", nameIT: "Ossido di magnesio", nameEN: "Magnesium oxide",
  geometry: "linear",
  descIT: "Legame ionico Mg²⁺ e O²⁻. Struttura rocksalt, refrattario ad alta stabilità.",
  descEN: "Ionic bond Mg²⁺ and O²⁻. Rock-salt crystal structure, highly stable refractory.",
  atoms: [
    { elem:12, x:-1.05, y:0, pz:0 },
    { elem:8,  x: 1.05, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"ionic" }],
};

const AlCl3: Molecule = {
  formula: "AlCl₃", nameIT: "Cloruro di alluminio", nameEN: "Aluminium chloride",
  geometry: "trigonal planar",
  descIT: "Trigonale planare. Acido di Lewis con orbitale p vuoto sull'alluminio.",
  descEN: "Trigonal planar. Lewis acid with empty p orbital on aluminium.",
  atoms: [
    { elem:13, x: 0,    y: 0,    pz:0 },
    { elem:17, x: 2.06, y: 0,    pz:0 },
    { elem:17, x:-1.03, y: 1.78, pz:0 },
    { elem:17, x:-1.03, y:-1.78, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
  ],
};

const SiO2: Molecule = {
  formula: "SiO₂", nameIT: "Diossido di silicio", nameEN: "Silicon dioxide",
  geometry: "linear",
  descIT: "Unità strutturale della silice. In natura forma reti tetraedriche SiO₄.",
  descEN: "Structural unit of silica. Forms SiO₄ tetrahedral networks in nature.",
  atoms: [
    { elem:14, x: 0,    y:0, pz:0 },
    { elem:8,  x:-1.61, y:0, pz:0 },
    { elem:8,  x: 1.61, y:0, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:2, type:"polar" },
  ],
};

const H3PO4: Molecule = {
  formula: "H₃PO₄", nameIT: "Acido fosforico", nameEN: "Phosphoric acid",
  geometry: "tetrahedral",
  descIT: "Tetraedro attorno a P. Un legame P=O e tre gruppi O–H. Acido triprotico.",
  descEN: "Tetrahedron around P. One P=O bond and three O–H groups. Triprotic acid.",
  atoms: [
    { elem:15, x: 0,    y: 0,    pz: 0     },
    { elem:8,  x: 0,    y: 1.50, pz: 0     },
    { elem:8,  x: 1.30, y:-0.50, pz: 0.75  },
    { elem:8,  x:-1.30, y:-0.50, pz: 0.75  },
    { elem:8,  x: 0,    y:-0.50, pz:-1.50  },
    { elem:1,  x: 2.20, y:-0.85, pz: 1.27  },
    { elem:1,  x:-2.20, y:-0.85, pz: 1.27  },
    { elem:1,  x: 0,    y:-0.85, pz:-2.54  },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
    { a:0, b:4, order:1, type:"polar" },
    { a:2, b:5, order:1, type:"polar" },
    { a:3, b:6, order:1, type:"polar" },
    { a:4, b:7, order:1, type:"polar" },
  ],
};

const KCl: Molecule = {
  formula: "KCl", nameIT: "Cloruro di potassio", nameEN: "Potassium chloride",
  geometry: "linear",
  descIT: "Legame ionico K⁺–Cl⁻. Sale usato in medicina come sostituto del sodio.",
  descEN: "Ionic K⁺–Cl⁻ bond. Salt used medically as a sodium substitute.",
  atoms: [
    { elem:19, x:-1.41, y:0, pz:0 },
    { elem:17, x: 1.41, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"ionic" }],
};

const CaCO3: Molecule = {
  formula: "CaCO₃", nameIT: "Carbonato di calcio", nameEN: "Calcium carbonate",
  geometry: "planar (CO₃²⁻)",
  descIT: "Ione CO₃²⁻ planare con Ca²⁺. Componente del calcare e delle conchiglie.",
  descEN: "Planar CO₃²⁻ ion with Ca²⁺. Main mineral of limestone and seashells.",
  atoms: [
    { elem:20, x:-2.40, y: 0,    pz:0 },
    { elem:6,  x: 0,    y: 0,    pz:0 },
    { elem:8,  x: 1.29, y: 0,    pz:0 },
    { elem:8,  x:-0.65, y: 1.12, pz:0 },
    { elem:8,  x:-0.65, y:-1.12, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:1, b:2, order:2, type:"polar" },
    { a:1, b:3, order:1, type:"polar" },
    { a:1, b:4, order:1, type:"polar" },
  ],
};

const CO: Molecule = {
  formula: "CO", nameIT: "Monossido di carbonio", nameEN: "Carbon monoxide",
  geometry: "linear",
  descIT: "Triplo legame C≡O, isostrutturale con N₂. Altamente tossico.",
  descEN: "Triple bond C≡O, isoelectronic with N₂. Highly toxic.",
  atoms: [
    { elem:6, x:-0.56, y:0, pz:0 },
    { elem:8, x: 0.56, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:3, type:"polar" }],
};

const C2H6: Molecule = {
  formula: "C₂H₆", nameIT: "Etano", nameEN: "Ethane",
  geometry: "staggered",
  descIT: "Legame C–C singolo con rotazione libera. Sei legami C–H tetraedrici.",
  descEN: "Single C–C bond with free rotation. Six tetrahedral C–H bonds.",
  atoms: [
    { elem:6, x:-0.77, y: 0,    pz: 0     },
    { elem:6, x: 0.77, y: 0,    pz: 0     },
    { elem:1, x:-1.16, y: 1.03, pz: 0     },
    { elem:1, x:-1.16, y:-0.51, pz: 0.89  },
    { elem:1, x:-1.16, y:-0.51, pz:-0.89  },
    { elem:1, x: 1.16, y:-1.03, pz: 0     },
    { elem:1, x: 1.16, y: 0.51, pz: 0.89  },
    { elem:1, x: 1.16, y: 0.51, pz:-0.89  },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"covalent" },
    { a:0, b:2, order:1, type:"polar"    },
    { a:0, b:3, order:1, type:"polar"    },
    { a:0, b:4, order:1, type:"polar"    },
    { a:1, b:5, order:1, type:"polar"    },
    { a:1, b:6, order:1, type:"polar"    },
    { a:1, b:7, order:1, type:"polar"    },
  ],
};

const FeCl3: Molecule = {
  formula: "FeCl₃", nameIT: "Cloruro ferrico", nameEN: "Iron(III) chloride",
  geometry: "trigonal planar",
  descIT: "Fe³⁺ coordinato da tre Cl⁻. Acido di Lewis, catalizzatore in sintesi organica.",
  descEN: "Fe³⁺ coordinated by three Cl⁻. Lewis acid, catalyst in organic synthesis.",
  atoms: [
    { elem:26, x: 0,     y: 0,    pz:0 },
    { elem:17, x: 2.14,  y: 0,    pz:0 },
    { elem:17, x:-1.07,  y: 1.85, pz:0 },
    { elem:17, x:-1.07,  y:-1.85, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:0, b:2, order:1, type:"ionic" },
    { a:0, b:3, order:1, type:"ionic" },
  ],
};

const CuSO4: Molecule = {
  formula: "CuSO₄", nameIT: "Solfato di rame", nameEN: "Copper sulfate",
  geometry: "tetrahedral (SO₄²⁻)",
  descIT: "Cu²⁺ con ione solfato tetraedrico SO₄²⁻. Soluzione azzurra tipica in chimica.",
  descEN: "Cu²⁺ with tetrahedral sulfate SO₄²⁻. Classic blue solution in chemistry.",
  atoms: [
    { elem:29, x:-2.30, y: 0,    pz: 0     },
    { elem:16, x: 0,    y: 0,    pz: 0     },
    { elem:8,  x: 1.05, y: 0.60, pz: 0.74  },
    { elem:8,  x:-1.05, y: 0.60, pz:-0.74  },
    { elem:8,  x: 1.05, y:-0.80, pz:-0.44  },
    { elem:8,  x:-1.05, y:-0.80, pz: 0.44  },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:1, b:2, order:2, type:"polar" },
    { a:1, b:3, order:2, type:"polar" },
    { a:1, b:4, order:1, type:"polar" },
    { a:1, b:5, order:1, type:"polar" },
  ],
};

const AgNO3: Molecule = {
  formula: "AgNO₃", nameIT: "Nitrato d'argento", nameEN: "Silver nitrate",
  geometry: "planar (NO₃⁻)",
  descIT: "Ag⁺ con ione nitrato planare. Usato in fotografia e analisi chimica.",
  descEN: "Ag⁺ with planar nitrate ion. Used in photography and chemical analysis.",
  atoms: [
    { elem:47, x:-2.50, y: 0,    pz:0 },
    { elem:7,  x: 0,    y: 0,    pz:0 },
    { elem:8,  x: 1.24, y: 0,    pz:0 },
    { elem:8,  x:-0.62, y: 1.08, pz:0 },
    { elem:8,  x:-0.62, y:-1.08, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic"  },
    { a:1, b:2, order:2, type:"polar"  },
    { a:1, b:3, order:1, type:"polar"  },
    { a:1, b:4, order:1, type:"polar"  },
  ],
};

const AuCl3: Molecule = {
  formula: "AuCl₃", nameIT: "Cloruro aurico", nameEN: "Gold(III) chloride",
  geometry: "trigonal planar",
  descIT: "Au³⁺ planare con tre Cl⁻. Catalizzatore in sintesi organica (catalisi aurea).",
  descEN: "Planar Au³⁺ with three Cl⁻. Catalyst in organic synthesis (gold catalysis).",
  atoms: [
    { elem:79, x: 0,    y: 0,    pz:0 },
    { elem:17, x: 2.24, y: 0,    pz:0 },
    { elem:17, x:-1.12, y: 1.94, pz:0 },
    { elem:17, x:-1.12, y:-1.94, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:0, b:2, order:1, type:"ionic" },
    { a:0, b:3, order:1, type:"ionic" },
  ],
};

const PbO2: Molecule = {
  formula: "PbO₂", nameIT: "Diossido di piombo", nameEN: "Lead dioxide",
  geometry: "linear",
  descIT: "Pb⁴⁺ con due O²⁻. Elettrodo positivo nelle batterie al piombo-acido.",
  descEN: "Pb⁴⁺ with two O²⁻. Positive electrode in lead-acid batteries.",
  atoms: [
    { elem:82, x: 0,    y:0, pz:0 },
    { elem:8,  x:-1.94, y:0, pz:0 },
    { elem:8,  x: 1.94, y:0, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"ionic" },
    { a:0, b:2, order:2, type:"ionic" },
  ],
};

const HNO3: Molecule = {
  formula: "HNO₃", nameIT: "Acido nitrico", nameEN: "Nitric acid",
  geometry: "planar",
  descIT: "Struttura planare. Legame N=O con risonanza e gruppo O–H acido.",
  descEN: "Planar structure. N=O bond with resonance and acidic O–H group.",
  atoms: [
    { elem:7, x: 0,    y: 0,    pz:0 },
    { elem:8, x: 1.10, y: 0.60, pz:0 },
    { elem:8, x: 1.10, y:-0.60, pz:0 },
    { elem:8, x:-1.20, y: 0,    pz:0 },
    { elem:1, x:-1.65, y: 0.82, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
    { a:3, b:4, order:1, type:"polar" },
  ],
};

// ─── Index: element Z → list of molecules ────────────────────────────────────

export const MOLECULES_BY_Z: Record<number, Molecule[]> = {
  1:  [H2, H2O, HCl],
  6:  [CH4, CO2, CO, C2H6],
  7:  [N2, NH3, HNO3],
  8:  [O2, H2O, CO2, SO2],
  9:  [F2, HCl],
  11: [NaCl, NaOH],
  12: [MgO],
  13: [AlCl3],
  14: [SiO2, CH4],
  15: [H3PO4, NH3],
  16: [H2S, SO2, H2SO4],
  17: [Cl2, HCl, NaCl],
  19: [KCl],
  20: [CaCO3],
  26: [FeCl3],
  29: [CuSO4],
  47: [AgNO3],
  79: [AuCl3],
  82: [PbO2],
};
