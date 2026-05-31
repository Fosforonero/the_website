// Real-world applications of chemical elements — curated static dataset v0.
// Sources: PubChem (pubchem.ncbi.nlm.nih.gov). All claims are fact-checked.
// Medical entries: educational context only, not medical advice.
// DO NOT add entries without a verifiable source URL.

export type AppCategory = "medicine" | "biology" | "material" | "daily-life";

export interface ElementApplication {
  titleIT: string;
  titleEN: string;
  descIT: string;
  descEN: string;
  category: AppCategory;
  /** Triggers the medical disclaimer in the UI. */
  isMedical: boolean;
  sourceLabel: string;
  sourceUrl: string;
  /** Molecule name for future PubChem viewer link (Phase 2 roadmap). */
  relatedMolecule?: string;
}

// Keyed by atomic number Z. Each element may have 1–3 entries (max 3 for v0).
export const APPLICATIONS: Record<number, ElementApplication[]> = {
  // Li — Z=3
  3: [{
    titleIT: "Carbonato di litio — psichiatria",
    titleEN: "Lithium carbonate — psychiatry",
    descIT: "Stabilizza l'umore nel disturbo bipolare. Introdotto nel 1949 da John Cade, il carbonato di litio (Li₂CO₃) è ancora un trattamento di prima linea approvato dalle principali agenzie regolatorie.",
    descEN: "Stabilises mood in bipolar disorder. Introduced in 1949 by John Cade, lithium carbonate (Li₂CO₃) remains an approved first-line treatment by major regulatory agencies.",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 11125",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/11125",
    relatedMolecule: "lithium carbonate",
  }],

  // F — Z=9
  9: [{
    titleIT: "Fluoruro e salute dentale",
    titleEN: "Fluoride and dental health",
    descIT: "Il fluoruro di sodio (NaF) rinforza lo smalto incorporandosi nell'idrossiapatite come fluoroapatite, aumentando la resistenza agli acidi batterici responsabili delle carie.",
    descEN: "Sodium fluoride (NaF) strengthens enamel by incorporating into the hydroxyapatite lattice as fluorapatite, increasing resistance to the bacterial acids that cause tooth decay.",
    category: "daily-life",
    isMedical: false,
    sourceLabel: "PubChem CID 5245",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/5245",
    relatedMolecule: "sodium fluoride",
  }],

  // Na — Z=11
  11: [{
    titleIT: "Soluzione fisiologica e bicarbonato",
    titleEN: "Saline solution and bicarbonate",
    descIT: "Il cloruro di sodio 0.9% (NaCl) è la soluzione fisiologica usata per fleboclisi e irrigazioni. Il bicarbonato di sodio (NaHCO₃) è un antiacido e tampone plasmatico fondamentale.",
    descEN: "0.9% sodium chloride (NaCl) is physiological saline used for IV infusions and irrigation. Sodium bicarbonate (NaHCO₃) is a key antacid and plasma buffer.",
    category: "medicine",
    isMedical: false,
    sourceLabel: "PubChem CID 5234",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/5234",
    relatedMolecule: "sodium chloride",
  }],

  // K — Z=19
  19: [{
    titleIT: "Cloruro di potassio — elettroliti",
    titleEN: "Potassium chloride — electrolytes",
    descIT: "Il cloruro di potassio (KCl) reintegra il potassio in caso di ipokaliemia. Il potassio è essenziale per il potenziale d'azione nervoso e muscolare tramite la pompa Na⁺/K⁺-ATPasi.",
    descEN: "Potassium chloride (KCl) replenishes potassium in hypokalaemia. Potassium is essential for nerve and muscle action potentials via the Na⁺/K⁺-ATPase pump.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 4873",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/4873",
    relatedMolecule: "potassium chloride",
  }],

  // Ca — Z=20
  20: [{
    titleIT: "Carbonato di calcio — antiacido e ossa",
    titleEN: "Calcium carbonate — antacid and bones",
    descIT: "Il carbonato di calcio (CaCO₃) è l'antiacido da banco più diffuso. Il calcio è il minerale più abbondante nel corpo umano: il 99% si trova nelle ossa e nei denti come idrossiapatite.",
    descEN: "Calcium carbonate (CaCO₃) is the most common OTC antacid. Calcium is the most abundant mineral in the human body: 99% is stored in bones and teeth as hydroxyapatite.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 10112",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/10112",
    relatedMolecule: "calcium carbonate",
  }],

  // Fe — Z=26
  26: [{
    titleIT: "Emoglobina e integratori di ferro",
    titleEN: "Haemoglobin and iron supplements",
    descIT: "Il ferro è il centro attivo del gruppo eme nell'emoglobina, la proteina che trasporta l'ossigeno nel sangue. Il solfato ferroso (FeSO₄) è il trattamento standard per l'anemia sideropenica.",
    descEN: "Iron is the active centre of the haem group in haemoglobin, the protein that transports oxygen in blood. Ferrous sulfate (FeSO₄) is the standard treatment for iron-deficiency anaemia.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 24393",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/24393",
    relatedMolecule: "ferrous sulfate",
  }],

  // Ag — Z=47
  47: [{
    titleIT: "Sulfadiazina argentica — ustioni",
    titleEN: "Silver sulfadiazine — burns",
    descIT: "La crema 1% di sulfadiazina argentica è lo standard di cura per le ustioni di secondo grado. Gli ioni Ag⁺ rilasciati danneggiano la membrana batterica, esercitando un'azione antibatterica ad ampio spettro.",
    descEN: "1% silver sulfadiazine cream is the standard of care for second-degree burns. Released Ag⁺ ions damage bacterial cell membranes, providing broad-spectrum antibacterial action.",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 441244",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/441244",
    relatedMolecule: "silver sulfadiazine",
  }],

  // I — Z=53
  53: [{
    titleIT: "Ormoni tiroidei e antisettici",
    titleEN: "Thyroid hormones and antiseptics",
    descIT: "Lo iodio è essenziale per la sintesi degli ormoni tiroidei T3 e T4; la carenza causa gozzo e ipotiroidismo. La soluzione di Lugol (I₂/KI) è un classico antisettico. I mezzi di contrasto iodati sono usati in diagnostica RX e TC.",
    descEN: "Iodine is essential for thyroid hormone T3 and T4 synthesis; deficiency causes goitre and hypothyroidism. Lugol's solution (I₂/KI) is a classic antiseptic. Iodinated contrast agents are used in X-ray and CT imaging.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 807",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/807",
  }],

  // Pt — Z=78
  78: [{
    titleIT: "Cisplatino — chemioterapia",
    titleEN: "Cisplatin — chemotherapy",
    descIT: "Il cisplatino (cis-[PtCl₂(NH₃)₂]) è tra i farmaci antitumorali più usati al mondo. Si lega al DNA delle cellule tumorali formando addotti che bloccano la replicazione. Approvato dalla FDA nel 1978.",
    descEN: "Cisplatin (cis-[PtCl₂(NH₃)₂]) is among the most widely used anticancer drugs worldwide. It binds cancer cell DNA, forming adducts that block replication. FDA-approved in 1978.",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 5702198",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/5702198",
    relatedMolecule: "cisplatin",
  }],

  // Au — Z=79
  79: [{
    titleIT: "Auranofin — artrite reumatoide",
    titleEN: "Auranofin — rheumatoid arthritis",
    descIT: "L'auranofin è un composto organometallico dell'oro approvato per l'artrite reumatoide. Inibisce la tioredossina reduttasi, riducendo lo stress ossidativo e l'infiammazione sistemica. Approvato FDA nel 1985.",
    descEN: "Auranofin is an organometallic gold compound approved for rheumatoid arthritis. It inhibits thioredoxin reductase, reducing oxidative stress and systemic inflammation. FDA-approved in 1985.",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 2723796",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/2723796",
    relatedMolecule: "auranofin",
  }],
};
