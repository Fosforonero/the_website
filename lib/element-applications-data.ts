// Real-world applications of chemical elements — curated static dataset v1.
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
  /** Molecule name for PubChem viewer link. */
  relatedMolecule?: string;
}

// Keyed by atomic number Z. Each element may have 1–3 entries (max 3).
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

  // C — Z=6
  6: [{
    titleIT: "Aspirina — analgesico e antinfiammatorio",
    titleEN: "Aspirin — analgesic and anti-inflammatory",
    descIT: "L'acido acetilsalicilico (C₉H₈O₄) inibisce le COX-1 e COX-2, riducendo dolore, febbre e infiammazione. Introdotto da Bayer nel 1899, è ancora uno dei farmaci più usati al mondo.",
    descEN: "Acetylsalicylic acid (C₉H₈O₄) inhibits COX-1 and COX-2, reducing pain, fever and inflammation. Introduced by Bayer in 1899, it remains one of the most widely used drugs worldwide.",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 2244",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/2244",
    relatedMolecule: "aspirin",
  }],

  // N — Z=7
  7: [{
    titleIT: "Protossido d'azoto — anestesia",
    titleEN: "Nitrous oxide — anaesthesia",
    descIT: "Il protossido d'azoto (N₂O) è un anestetico per via inalatoria usato in odontoiatria e in sala parto. È anche un propellente alimentare (E942) e un potente gas serra con GWP di 273 (100 anni).",
    descEN: "Nitrous oxide (N₂O) is an inhalation anaesthetic used in dentistry and obstetrics. It is also a food propellant (E942) and a potent greenhouse gas with a GWP of 273 (100 years).",
    category: "medicine",
    isMedical: true,
    sourceLabel: "PubChem CID 948",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/948",
    relatedMolecule: "nitrous oxide",
  }],

  // O — Z=8
  8: [{
    titleIT: "Ossigenoterapia e respirazione cellulare",
    titleEN: "Oxygen therapy and cellular respiration",
    descIT: "L'ossigeno medicale (O₂ ≥99,5%) è somministrato in caso di insufficienza respiratoria, BPCO e durante anestesia. È l'accettore terminale di elettroni nella catena respiratoria mitocondriale.",
    descEN: "Medical oxygen (O₂ ≥99.5%) is administered in respiratory failure, COPD and during anaesthesia. It is the terminal electron acceptor in the mitochondrial respiratory chain.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 977",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/977",
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

  // Mg — Z=12
  12: [{
    titleIT: "Idrossido di magnesio — antiacido e cofattore",
    titleEN: "Magnesium hydroxide — antacid and cofactor",
    descIT: "Il latte di magnesia (Mg(OH)₂) neutralizza l'eccesso di acido gastrico ed è usato come antiacido e lassativo osmotico. Il magnesio è cofattore di oltre 300 enzimi ed essenziale per la sintesi di ATP.",
    descEN: "Milk of magnesia (Mg(OH)₂) neutralises excess gastric acid and is used as an antacid and osmotic laxative. Magnesium is a cofactor for over 300 enzymes and essential for ATP synthesis.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 14791",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/14791",
    relatedMolecule: "magnesium hydroxide",
  }],

  // Al — Z=13
  13: [{
    titleIT: "Idrossido di alluminio — antiacido e adiuvante vaccinale",
    titleEN: "Aluminium hydroxide — antacid and vaccine adjuvant",
    descIT: "L'idrossido di alluminio (Al(OH)₃) neutralizza l'HCl gastrico in eccesso. I sali di alluminio (alum) sono i più comuni adiuvanti vaccinali, amplificando la risposta immunitaria agli antigeni.",
    descEN: "Aluminium hydroxide (Al(OH)₃) neutralises excess gastric HCl. Aluminium salts (alum) are the most common vaccine adjuvants, amplifying the immune response to antigens.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 73981",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/73981",
    relatedMolecule: "aluminum hydroxide",
  }],

  // Si — Z=14
  14: [{
    titleIT: "Silicio — semiconduttori e vetro",
    titleEN: "Silicon — semiconductors and glass",
    descIT: "Il biossido di silicio (SiO₂, silice) è la base del vetro e della ceramica. Il silicio elementare ultra-puro (>99,9999%) è il materiale fondamentale per chip, celle solari e transistor.",
    descEN: "Silicon dioxide (SiO₂, silica) is the basis of glass and ceramics. Ultra-pure elemental silicon (>99.9999%) is the foundational material for chips, solar cells and transistors.",
    category: "material",
    isMedical: false,
    sourceLabel: "PubChem CID 24261",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/24261",
  }],

  // Cl — Z=17
  17: [{
    titleIT: "Cloro — disinfezione acqua e PVC",
    titleEN: "Chlorine — water disinfection and PVC",
    descIT: "Il cloro (0.2–1 mg/L) è aggiunto agli acquedotti per eliminare batteri e virus patogeni. Il cloruro di polivinile (PVC), prodotto dal cloruro di vinile, è il terzo polimero sintetico più prodotto al mondo.",
    descEN: "Chlorine (0.2–1 mg/L) is added to water supplies to eliminate pathogenic bacteria and viruses. Polyvinyl chloride (PVC), produced from vinyl chloride, is the world's third most produced synthetic polymer.",
    category: "daily-life",
    isMedical: false,
    sourceLabel: "PubChem CID 24016",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/24016",
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

  // Ti — Z=22
  22: [{
    titleIT: "Biossido di titanio — filtro UV e impianti",
    titleEN: "Titanium dioxide — UV filter and implants",
    descIT: "Il TiO₂ è il pigmento bianco più usato al mondo (vernici, plastica, carta) e filtro UV fisico nelle creme solari. Il titanio metallico, biocompatibile e inerte, è impiegato in impianti dentali e protesi ortopediche.",
    descEN: "TiO₂ is the world's most used white pigment (paints, plastics, paper) and a physical UV filter in sunscreens. Metallic titanium, biocompatible and inert, is used in dental implants and orthopaedic prostheses.",
    category: "material",
    isMedical: false,
    sourceLabel: "PubChem CID 26042",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/26042",
    relatedMolecule: "titanium dioxide",
  }],

  // Co — Z=27
  27: [{
    titleIT: "Vitamina B12 — cobalamina",
    titleEN: "Vitamin B12 — cobalamin",
    descIT: "Il cobalto è l'atomo centrale della vitamina B12 (cobalamina), essenziale per la sintesi del DNA e la formazione dei globuli rossi. La carenza provoca anemia megaloblastica e danni neurologici.",
    descEN: "Cobalt is the central atom of vitamin B12 (cobalamin), essential for DNA synthesis and red blood cell formation. Deficiency causes megaloblastic anaemia and neurological damage.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 24756",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/24756",
  }],

  // Cu — Z=29
  29: [{
    titleIT: "Rame — enzimi e solfato di rame",
    titleEN: "Copper — enzymes and copper sulfate",
    descIT: "Il solfato di rame (CuSO₄) è un fungicida/algicida usato in agricoltura (soluzione bordolese) e nel trattamento delle acque. Il rame è il sito catalitico della citocromo c ossidasi nella catena respiratoria mitocondriale.",
    descEN: "Copper sulfate (CuSO₄) is a fungicide/algicide used in agriculture (Bordeaux mixture) and water treatment. Copper is the catalytic site of cytochrome c oxidase in the mitochondrial respiratory chain.",
    category: "biology",
    isMedical: false,
    sourceLabel: "PubChem CID 24462",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/24462",
    relatedMolecule: "copper sulfate",
  }],

  // Zn — Z=30
  30: [{
    titleIT: "Ossido di zinco — dermatologia e filtro UV",
    titleEN: "Zinc oxide — dermatology and UV filter",
    descIT: "L'ossido di zinco (ZnO) è un filtro solare fisico ad ampio spettro e un agente topico antipruritico e cicatrizzante. Lo zinco è cofattore della carbossipeptidasi e del superossido dismutasi (SOD), enzima antiossidante.",
    descEN: "Zinc oxide (ZnO) is a broad-spectrum physical sunscreen and a topical anti-itch and wound-healing agent. Zinc is a cofactor of carboxypeptidase and superoxide dismutase (SOD), an antioxidant enzyme.",
    category: "daily-life",
    isMedical: false,
    sourceLabel: "PubChem CID 14806",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/14806",
    relatedMolecule: "zinc oxide",
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

  // Hg — Z=80
  80: [{
    titleIT: "Mercurio — strumenti storici e tossicologia",
    titleEN: "Mercury — historical instruments and toxicology",
    descIT: "Il mercurio fu usato in termometri, barometri e lampade fluorescenti per la sua fluidità a temperatura ambiente. Altamente tossico per il sistema nervoso, il suo uso è progressivamente vietato dalla Convenzione di Minamata (2013).",
    descEN: "Mercury was used in thermometers, barometers and fluorescent lamps for its room-temperature fluidity. Highly toxic to the nervous system, its use is progressively banned by the Minamata Convention (2013).",
    category: "material",
    isMedical: false,
    sourceLabel: "PubChem CID 23931",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/23931",
  }],

  // Pb — Z=82
  82: [{
    titleIT: "Piombo — schermatura radiazioni",
    titleEN: "Lead — radiation shielding",
    descIT: "La densità del piombo (11.3 g/cm³) lo rende efficace schermo contro raggi X e gamma: grembiuli e pareti piombate proteggono il personale in radiologia. Il suo impiego richiede gestione attenta per l'elevata tossicità.",
    descEN: "Lead's density (11.3 g/cm³) makes it an effective shield against X-rays and gamma rays: lead aprons and walls protect personnel in radiology. Its use requires careful management due to high toxicity.",
    category: "material",
    isMedical: false,
    sourceLabel: "PubChem CID 5352425",
    sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/compound/5352425",
  }],
};
