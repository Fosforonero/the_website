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
  lonePairs?: { x: number; y: number; z: number }[];
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
  lonePairs: [
    { x: 0, y: 0.67, z:  0.40 },
    { x: 0, y: 0.67, z: -0.40 },
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
  lonePairs: [{ x: 0, y: 1.05, z: 0 }],
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

const HF: Molecule = {
  formula: "HF", nameIT: "Fluoruro di idrogeno", nameEN: "Hydrogen fluoride",
  geometry: "linear",
  descIT: "Legame H–F il più polare tra i diatomici (ΔEN = 1,78). Densità elettronica fortemente spostata verso F. Fondamentale in chimica del fluoro.",
  descEN: "H–F bond: most polar of all diatomics (ΔEN = 1.78). Electron density strongly shifted toward F. Foundational in fluorine chemistry.",
  atoms: [
    { elem:1, x:-0.46, y:0, pz:0 },
    { elem:9, x: 0.46, y:0, pz:0 },
  ],
  bonds: [{ a:0, b:1, order:1, type:"polar" }],
};

const C2H2: Molecule = {
  formula: "C₂H₂", nameIT: "Acetilene", nameEN: "Acetylene",
  geometry: "linear",
  descIT: "Ibridazione sp: triplo legame C≡C (σ + 2π). Struttura lineare con due legami C–H colineari. Base della chimica degli alchini.",
  descEN: "sp hybridisation: triple C≡C bond (σ + 2π). Linear structure with two collinear C–H bonds. Basis of alkyne chemistry.",
  atoms: [
    { elem:1, x:-1.66, y:0, pz:0 },
    { elem:6, x:-0.60, y:0, pz:0 },
    { elem:6, x: 0.60, y:0, pz:0 },
    { elem:1, x: 1.66, y:0, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar"    },
    { a:1, b:2, order:3, type:"covalent" },
    { a:2, b:3, order:1, type:"polar"    },
  ],
};

const C2H4: Molecule = {
  formula: "C₂H₄", nameIT: "Etilene", nameEN: "Ethylene",
  geometry: "trigonal planar",
  descIT: "Ibridazione sp²: doppio legame C=C con geometria completamente planare. Tutti gli atomi giacciono sullo stesso piano. Monomero chiave per i polimeri (polietilene).",
  descEN: "sp² hybridisation: C=C double bond with fully planar geometry. All atoms lie in the same plane. Key monomer for polymers (polyethylene).",
  atoms: [
    { elem:6, x:-0.67, y: 0,    pz:0 },
    { elem:6, x: 0.67, y: 0,    pz:0 },
    { elem:1, x:-1.24, y: 0.92, pz:0 },
    { elem:1, x:-1.24, y:-0.92, pz:0 },
    { elem:1, x: 1.24, y: 0.92, pz:0 },
    { elem:1, x: 1.24, y:-0.92, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"covalent" },
    { a:0, b:2, order:1, type:"polar"    },
    { a:0, b:3, order:1, type:"polar"    },
    { a:1, b:4, order:1, type:"polar"    },
    { a:1, b:5, order:1, type:"polar"    },
  ],
};

const O3: Molecule = {
  formula: "O₃", nameIT: "Ozono", nameEN: "Ozone",
  geometry: "bent",
  descIT: "Geometria angolata (117°). Struttura di risonanza con due forme equivalenti: l'ordine 2+1 qui è una rappresentazione semplificata. La polarità reale (μ = 0,53 D) dipende dalle cariche formali di risonanza, non dall'EN — limite del modello semplificato.",
  descEN: "Bent geometry (117°). Resonance structure with two equivalent forms: the 2+1 order shown is a simplified representation. Real polarity (μ = 0.53 D) arises from formal charge distribution in resonance, not from EN — limit of the simplified model.",
  atoms: [
    { elem:8, x: 0,    y: 0.45, pz:0 },
    { elem:8, x:-1.09, y:-0.22, pz:0 },
    { elem:8, x: 1.09, y:-0.22, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:2, type:"covalent" },
    { a:0, b:2, order:1, type:"covalent" },
  ],
};

const BF3: Molecule = {
  formula: "BF₃", nameIT: "Trifluoruro di boro", nameEN: "Boron trifluoride",
  geometry: "trigonal planar",
  descIT: "Trigonale planare. Tre legami B–F altamente polari (ΔEN = 1,94) ma i dipoli si cancellano per simmetria: molecola apolare. Acido di Lewis con orbitale p vuoto sul boro.",
  descEN: "Trigonal planar. Three highly polar B–F bonds (ΔEN = 1.94) whose dipoles cancel by symmetry: nonpolar molecule. Lewis acid with empty p orbital on boron.",
  atoms: [
    { elem:5, x: 0,      y: 0,     pz:0 },
    { elem:9, x: 1.307,  y: 0,     pz:0 },
    { elem:9, x:-0.654,  y: 1.132, pz:0 },
    { elem:9, x:-0.654,  y:-1.132, pz:0 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
  ],
};

const SF6: Molecule = {
  formula: "SF₆", nameIT: "Esafluoruro di zolfo", nameEN: "Sulfur hexafluoride",
  geometry: "octahedral",
  descIT: "Ottaedro regolare. Sei legami S–F polari (ΔEN = 1,40) simmetricamente disposti: il dipolo molecolare è zero. Gas inerte e ottimo isolante elettrico.",
  descEN: "Regular octahedron. Six polar S–F bonds (ΔEN = 1.40) symmetrically arranged: zero molecular dipole. Inert gas and excellent electrical insulator.",
  atoms: [
    { elem:16, x: 0,     y: 0,     pz: 0     },
    { elem:9,  x: 1.564, y: 0,     pz: 0     },
    { elem:9,  x:-1.564, y: 0,     pz: 0     },
    { elem:9,  x: 0,     y: 1.564, pz: 0     },
    { elem:9,  x: 0,     y:-1.564, pz: 0     },
    { elem:9,  x: 0,     y: 0,     pz: 1.564 },
    { elem:9,  x: 0,     y: 0,     pz:-1.564 },
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },
    { a:0, b:2, order:1, type:"polar" },
    { a:0, b:3, order:1, type:"polar" },
    { a:0, b:4, order:1, type:"polar" },
    { a:0, b:5, order:1, type:"polar" },
    { a:0, b:6, order:1, type:"polar" },
  ],
};

// ─── Premium dataset v2 ───────────────────────────────────────────────────────

// Cisplatin — cis-[Pt(NH₃)₂Cl₂] — square planar, Pt(II) d⁸
// Bond lengths: Pt–Cl 2.32 Å, Pt–N 2.05 Å, N–H 1.02 Å (approximate)
const Cisplatin: Molecule = {
  formula: "Pt(NH₃)₂Cl₂", nameIT: "Cisplatino", nameEN: "Cisplatin",
  geometry: "square planar (cis)",
  descIT: "Geometria piana quadrata (Pt²⁺, d⁸). I due Cl sono adiacenti (90°, cis), non opposti. Farmaco antitumorale che forma addotti sul DNA bloccandone la replicazione.",
  descEN: "Square planar geometry (Pt²⁺, d⁸). The two Cl ligands are adjacent (90°, cis), not opposite. Anticancer drug that forms DNA adducts blocking replication.",
  atoms: [
    { elem:78, x:  0,     y:  0,     pz:  0     }, // 0 Pt
    { elem: 7, x:  0,     y:  2.05,  pz:  0     }, // 1 N₁
    { elem: 7, x:  2.05,  y:  0,     pz:  0     }, // 2 N₂
    { elem:17, x:  0,     y: -2.32,  pz:  0     }, // 3 Cl₁
    { elem:17, x: -2.32,  y:  0,     pz:  0     }, // 4 Cl₂
    { elem: 1, x:  0.62,  y:  2.65,  pz:  0.62  }, // 5 H₁a
    { elem: 1, x: -0.62,  y:  2.65,  pz:  0.62  }, // 6 H₁b
    { elem: 1, x:  0,     y:  2.65,  pz: -0.87  }, // 7 H₁c
    { elem: 1, x:  2.65,  y:  0.62,  pz:  0.62  }, // 8 H₂a
    { elem: 1, x:  2.65,  y: -0.62,  pz:  0.62  }, // 9 H₂b
    { elem: 1, x:  2.65,  y:  0,     pz: -0.87  }, // 10 H₂c
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },  // Pt–N₁
    { a:0, b:2, order:1, type:"polar" },  // Pt–N₂
    { a:0, b:3, order:1, type:"polar" },  // Pt–Cl₁
    { a:0, b:4, order:1, type:"polar" },  // Pt–Cl₂
    { a:1, b:5, order:1, type:"polar" },  // N₁–H
    { a:1, b:6, order:1, type:"polar" },
    { a:1, b:7, order:1, type:"polar" },
    { a:2, b:8, order:1, type:"polar" },  // N₂–H
    { a:2, b:9, order:1, type:"polar" },
    { a:2, b:10, order:1, type:"polar" },
  ],
};

// Li₂CO₃ — formula unit di sale ionico cristallino, non molecola discreta.
// Lo ione CO₃²⁻ è planare (D₃h, 120°). Le posizioni Li sono approssimate.
const Li2CO3: Molecule = {
  formula: "Li₂CO₃", nameIT: "Carbonato di litio", nameEN: "Lithium carbonate",
  geometry: "trigonal planar (CO₃²⁻)",
  descIT: "Formula unit di sale ionico cristallino — non è una molecola discreta. Lo ione carbonato CO₃²⁻ è triangolare planare (D₃h, 120°) per risonanza. Li⁺ e CO₃²⁻ si attraggono elettrostaticamente.",
  descEN: "Formula unit of an ionic crystal — not a discrete molecule. The carbonate ion CO₃²⁻ is trigonal planar (D₃h, 120°) due to resonance. Li⁺ and CO₃²⁻ attract each other electrostatically.",
  atoms: [
    { elem: 6, x:  0,     y:  0,     pz:  0    }, // 0 C
    { elem: 8, x:  1.30,  y:  0,     pz:  0    }, // 1 O₁
    { elem: 8, x: -0.65,  y:  1.13,  pz:  0    }, // 2 O₂
    { elem: 8, x: -0.65,  y: -1.13,  pz:  0    }, // 3 O₃
    { elem: 3, x:  0,     y:  0,     pz:  2.00 }, // 4 Li₁
    { elem: 3, x:  0,     y:  0,     pz: -2.00 }, // 5 Li₂
  ],
  bonds: [
    { a:0, b:1, order:1, type:"polar" },   // C–O₁ (risonanza)
    { a:0, b:2, order:1, type:"polar" },   // C–O₂
    { a:0, b:3, order:1, type:"polar" },   // C–O₃
    { a:4, b:1, order:1, type:"ionic" },   // Li₁–O₁
    { a:5, b:3, order:1, type:"ionic" },   // Li₂–O₃
  ],
};

// N₂O — lineare N≡N–O. Cariche formali e risonanza semplificate.
const NitrousOxide: Molecule = {
  formula: "N₂O", nameIT: "Protossido d'azoto", nameEN: "Nitrous oxide",
  geometry: "linear",
  descIT: "Lineare (N≡N–O). Struttura di risonanza dominante con triplo legame N–N e doppio N–O. Anestetico inalatorio (GAS ESILARANTE) e potente gas serra (GWP 273).",
  descEN: "Linear (N≡N–O). Dominant resonance structure with N–N triple bond and N–O double bond. Inhalation anaesthetic (laughing gas) and potent greenhouse gas (GWP 273).",
  atoms: [
    { elem:7, x:-1.13, y:0, pz:0 }, // 0 N terminale
    { elem:7, x: 0,    y:0, pz:0 }, // 1 N centrale
    { elem:8, x: 1.19, y:0, pz:0 }, // 2 O
  ],
  bonds: [
    { a:0, b:1, order:3, type:"covalent" }, // N≡N
    { a:1, b:2, order:2, type:"polar" },    // N–O
  ],
};

// ZnO — formula unit di solido ionico.
const ZincOxide: Molecule = {
  formula: "ZnO", nameIT: "Ossido di zinco", nameEN: "Zinc oxide",
  geometry: "diatomic (ionic)",
  descIT: "Formula unit di solido ionico (wurtzite o zincite). Zn²⁺ e O²⁻ si attraggono elettrostaticamente. Filtro UV fisico ad ampio spettro.",
  descEN: "Formula unit of an ionic solid (wurtzite or zincite). Zn²⁺ and O²⁻ attract electrostatically. Broad-spectrum physical UV filter.",
  atoms: [
    { elem:30, x:-0.985, y:0, pz:0 }, // Zn
    { elem: 8, x: 0.985, y:0, pz:0 }, // O
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
  ],
};

// FeSO₄ — forma anidra semplificata (non FeSO₄·7H₂O). Struttura identica a CuSO₄.
const FerrousSulfate: Molecule = {
  formula: "FeSO₄", nameIT: "Solfato ferroso", nameEN: "Ferrous sulfate",
  geometry: "tetrahedral (SO₄²⁻)",
  descIT: "Fe²⁺ (ferroso, non Fe³⁺ ferrico) con ione solfato tetraedrico SO₄²⁻. Forma anidra semplificata; il solfato commerciale è FeSO₄·7H₂O. Trattamento standard per l'anemia sideropenica.",
  descEN: "Fe²⁺ (ferrous, not ferric Fe³⁺) with tetrahedral sulfate SO₄²⁻. Simplified anhydrous form; commercial grade is FeSO₄·7H₂O. Standard treatment for iron-deficiency anaemia.",
  atoms: [
    { elem:26, x:-2.30, y: 0,    pz: 0     }, // Fe²⁺
    { elem:16, x: 0,    y: 0,    pz: 0     }, // S
    { elem: 8, x: 1.05, y: 0.60, pz: 0.74  }, // O₁
    { elem: 8, x:-1.05, y: 0.60, pz:-0.74  }, // O₂
    { elem: 8, x: 1.05, y:-0.80, pz:-0.44  }, // O₃
    { elem: 8, x:-1.05, y:-0.80, pz: 0.44  }, // O₄
  ],
  bonds: [
    { a:0, b:1, order:1, type:"ionic" },
    { a:1, b:2, order:2, type:"polar" },
    { a:1, b:3, order:2, type:"polar" },
    { a:1, b:4, order:1, type:"polar" },
    { a:1, b:5, order:1, type:"polar" },
  ],
};

// C₆H₆ — esagono planare D₆h. Legami Kekulé alternati (convenzionali).
// I legami C–C sono tutti equivalenti (1.40 Å) per risonanza.
const Benzene: Molecule = {
  formula: "C₆H₆", nameIT: "Benzene", nameEN: "Benzene",
  geometry: "hexagonal planar",
  descIT: "Anello aromatico planare D₆h. I sei legami C–C sono equivalenti (1.40 Å) per risonanza; l'alternanza singolo/doppio (Kekulé) è convenzionale. π delocalizzato su tutti i carboni.",
  descEN: "Planar aromatic ring D₆h. All six C–C bonds are equivalent (1.40 Å) due to resonance; the single/double alternation (Kekulé) is conventional. π system delocalised over all carbons.",
  atoms: [
    { elem:6, x: 1.40,  y:  0,    pz:0 }, // 0 C₁
    { elem:6, x: 0.70,  y:  1.21, pz:0 }, // 1 C₂
    { elem:6, x:-0.70,  y:  1.21, pz:0 }, // 2 C₃
    { elem:6, x:-1.40,  y:  0,    pz:0 }, // 3 C₄
    { elem:6, x:-0.70,  y: -1.21, pz:0 }, // 4 C₅
    { elem:6, x: 0.70,  y: -1.21, pz:0 }, // 5 C₆
    { elem:1, x: 2.49,  y:  0,    pz:0 }, // 6 H₁
    { elem:1, x: 1.245, y:  2.156,pz:0 }, // 7 H₂
    { elem:1, x:-1.245, y:  2.156,pz:0 }, // 8 H₃
    { elem:1, x:-2.49,  y:  0,    pz:0 }, // 9 H₄
    { elem:1, x:-1.245, y: -2.156,pz:0 }, // 10 H₅
    { elem:1, x: 1.245, y: -2.156,pz:0 }, // 11 H₆
  ],
  bonds: [
    { a:0, b:1, order:2, type:"covalent" }, // C₁=C₂ (Kekulé)
    { a:1, b:2, order:1, type:"covalent" }, // C₂–C₃
    { a:2, b:3, order:2, type:"covalent" }, // C₃=C₄
    { a:3, b:4, order:1, type:"covalent" }, // C₄–C₅
    { a:4, b:5, order:2, type:"covalent" }, // C₅=C₆
    { a:5, b:0, order:1, type:"covalent" }, // C₆–C₁
    { a:0, b:6,  order:1, type:"covalent" },
    { a:1, b:7,  order:1, type:"covalent" },
    { a:2, b:8,  order:1, type:"covalent" },
    { a:3, b:9,  order:1, type:"covalent" },
    { a:4, b:10, order:1, type:"covalent" },
    { a:5, b:11, order:1, type:"covalent" },
  ],
};

// ─── Index: element Z → list of molecules ────────────────────────────────────

export const MOLECULES_BY_Z: Record<number, Molecule[]> = {
  1:  [H2, H2O, HCl, HF],
  3:  [Li2CO3],
  5:  [BF3],
  6:  [CH4, CO2, CO, C2H6, C2H2, C2H4, Benzene],
  7:  [N2, NH3, HNO3, NitrousOxide],
  8:  [O2, H2O, CO2, SO2, O3],
  9:  [F2, HF, BF3, SF6],
  11: [NaCl, NaOH],
  12: [MgO],
  13: [AlCl3],
  14: [SiO2, CH4],
  15: [H3PO4, NH3],
  16: [H2S, SO2, H2SO4, SF6],
  17: [Cl2, HCl, NaCl],
  19: [KCl],
  20: [CaCO3],
  26: [FeCl3, FerrousSulfate],
  29: [CuSO4],
  30: [ZincOxide],
  47: [AgNO3],
  78: [Cisplatin],
  79: [AuCl3],
  82: [PbO2],
};
