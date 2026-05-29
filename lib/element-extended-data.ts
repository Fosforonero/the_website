/**
 * Extended element data: physical properties + Italian scientific descriptions.
 * Sources: IUPAC 2021, CRC Handbook of Chemistry and Physics (103rd ed.),
 * WebElements (webelements.com), NIST Chemistry WebBook.
 * All values at STP (0°C, 1 atm) unless noted.
 */

export type ElementState = "solid" | "liquid" | "gas" | "synthetic";
export type ElementBlock = "s" | "p" | "d" | "f";
/** Crystal structure at ambient conditions (25 °C, 1 atm).
 *  null = gas, liquid, synthetic, or no reliable data. */
export type CrystalStructure = "fcc" | "bcc" | "hcp" | "diamond" | "sc" | "other" | null;

export interface ElementExtended {
  /** Z — atomic number (key) */
  z: number;
  /** Electron configuration in standard notation */
  config: string;
  /** s / p / d / f block */
  block: ElementBlock;
  /** Physical state at 25 °C, 1 atm */
  state: ElementState;
  /** Electronegativity — Pauling scale (null if not applicable) */
  electronegativity: number | null;
  /** Van der Waals atomic radius (pm) */
  atomicRadius: number | null;
  /** First ionization energy (kJ/mol) */
  ionizationEnergy: number | null;
  /** Density at STP (g/cm³; gas at STP in g/L) */
  density: number | null;
  /** Melting point (K) */
  meltingPoint: number | null;
  /** Boiling point (K) */
  boilingPoint: number | null;
  /** Electron affinity (kJ/mol; positive = exothermic) */
  electronAffinity: number | null;
  /** Earth-crust abundance (mg/kg); null = trace/synthetic */
  crustAbundance: number | null;
  /** Year of discovery (null = antiquity) */
  discoveryYear: number | null;
  /** Discoverer(s) */
  discoverer: string | null;
  /** Concise Italian scientific description (~2 sentences, university level) */
  description: string;
  /** All known oxidation states (integers; empty for noble gases with no stable chemistry) */
  oxidationStates: number[];
  /** Most common / textbook oxidation state; null if ambiguous or noble gas */
  commonOxidation: number | null;
  /** 2–3 most abundant natural isotopes; empty for purely synthetic elements */
  isotopes: Isotope[];
  /** Single-bond covalent radius (pm); Alvarez 2008 / IUPAC */
  covalentRadius: number | null;
  /** Dominant crystal structure at ambient conditions; null for gases, liquids, synthetic */
  crystalStructure: CrystalStructure;
}

export interface Isotope {
  /** Mass number A = Z + N */
  massNumber: number;
  /** Natural abundance 0–100 %; null for trace / radioactive-only */
  abundance: number | null;
  /** Common Italian name (e.g. "deuterio", "uranio-235") */
  name?: string;
}

// ─── Data table ───────────────────────────────────────────────────────────────
// Columns: z, config, block, state, EN, atomR, IE1, density, Tm(K), Tb(K), EA, crust(mg/kg), year, discoverer, description
// oxidationStates / commonOxidation are merged separately via OX lookup below.

type ElementRaw = Omit<ElementExtended, "oxidationStates" | "commonOxidation" | "isotopes" | "covalentRadius" | "crystalStructure">;
const RAW: ElementRaw[] = [
  { z:1,   config:"1s¹",                  block:"s", state:"gas",       electronegativity:2.20, atomicRadius:120, ionizationEnergy:1312.0, density:0.0899, meltingPoint:14.0,   boilingPoint:20.3,    electronAffinity:72.8,  crustAbundance:1400,   discoveryYear:1766, discoverer:"Henry Cavendish",       description:"Elemento più leggero e abbondante dell'universo (≈75% della massa barionica). Alimenta le reazioni di fusione stellare e costituisce la base delle molecole organiche; l'elettrolisi dell'acqua ne è la principale fonte industriale." },
  { z:2,   config:"1s²",                  block:"s", state:"gas",       electronegativity:null, atomicRadius:140, ionizationEnergy:2372.3, density:0.1785, meltingPoint:0.95,   boilingPoint:4.2,     electronAffinity:-48,   crustAbundance:0.008,  discoveryYear:1868, discoverer:"Pierre Janssen / Norman Lockyer", description:"Gas nobile con il secondo punto di ebollizione più basso di qualsiasi sostanza (4,22 K). Prodotto primordiale del Big Bang e dalla fusione dell'idrogeno nelle stelle; usato come refrigerante in superconduttori e acceleratori di particelle." },
  { z:3,   config:"[He] 2s¹",             block:"s", state:"solid",     electronegativity:0.98, atomicRadius:182, ionizationEnergy:520.2,  density:0.534,  meltingPoint:453.7,  boilingPoint:1615.0,  electronAffinity:59.6,  crustAbundance:20,     discoveryYear:1817, discoverer:"Johan August Arfwedson",  description:"Metallo alcalino più leggero (ρ = 0,534 g/cm³), galleggia sull'acqua. Fondamentale per le batterie agli ioni di litio che alimentano l'elettronica moderna; il suo carbonato è usato in psichiatria come stabilizzante dell'umore." },
  { z:4,   config:"[He] 2s²",             block:"s", state:"solid",     electronegativity:1.57, atomicRadius:153, ionizationEnergy:899.5,  density:1.848,  meltingPoint:1560.0, boilingPoint:2742.0,  electronAffinity:-48,   crustAbundance:2.8,    discoveryYear:1798, discoverer:"Louis-Nicolas Vauquelin", description:"Metallo leggero con alto punto di fusione e ottima rigidità. Usato nelle leghe aerospaziali e nucleari per la bassa sezione d'urto ai neutroni; altamente tossico se inalato in forma di polvere o vapore." },
  { z:5,   config:"[He] 2s² 2p¹",         block:"p", state:"solid",     electronegativity:2.04, atomicRadius:192, ionizationEnergy:800.6,  density:2.340,  meltingPoint:2349.0, boilingPoint:4200.0,  electronAffinity:26.7,  crustAbundance:10,     discoveryYear:1808, discoverer:"Humphry Davy / Gay-Lussac & Thénard", description:"Metalloide con struttura cristallina ad icosaedro molto dura (9,3 Mohs). Il nitruro di boro cubico rivaleggia col diamante; il boro-10 assorbe efficientemente i neutroni termici, impiego cruciale nelle barre di controllo dei reattori nucleari." },
  { z:6,   config:"[He] 2s² 2p²",         block:"p", state:"solid",     electronegativity:2.55, atomicRadius:170, ionizationEnergy:1086.5, density:2.267,  meltingPoint:3823.0, boilingPoint:4098.0,  electronAffinity:121.8, crustAbundance:200,    discoveryYear:null, discoverer:"Antichità",               description:"Base chimica della vita: i quattro elettroni di valenza permettono legami covalenti multipli in geometrie ibride sp, sp², sp³. Esiste in allotropi con proprietà radicalmente diverse: grafite conduttrice, diamante isolante ultra-duro, fullereni e nanotubi a geometria molecolare." },
  { z:7,   config:"[He] 2s² 2p³",         block:"p", state:"gas",       electronegativity:3.04, atomicRadius:155, ionizationEnergy:1402.3, density:1.2506, meltingPoint:63.2,   boilingPoint:77.4,    electronAffinity:-7,    crustAbundance:19000,  discoveryYear:1772, discoverer:"Daniel Rutherford",       description:"Costituisce il 78,1% dell'atmosfera terrestre come N₂ (triplo legame fortissimo, ΔH = 945 kJ/mol). Il ciclo dell'azoto fissa N₂ atmosferico in ammoniaca tramite il processo Haber-Bosch, fondamentale per i fertilizzanti e quindi per l'alimentazione globale." },
  { z:8,   config:"[He] 2s² 2p⁴",         block:"p", state:"gas",       electronegativity:3.44, atomicRadius:152, ionizationEnergy:1313.9, density:1.4290, meltingPoint:54.4,   boilingPoint:90.2,    electronAffinity:141.0, crustAbundance:461000, discoveryYear:1774, discoverer:"Joseph Priestley / Carl Scheele", description:"Secondo elemento più abbondante nella crosta terrestre (46,1%). L'alta elettronegatività genera il legame a idrogeno nell'acqua e nelle biomolecole; la respirazione aerobica utilizza O₂ come accettore finale di elettroni nella catena di trasporto mitocondriale." },
  { z:9,   config:"[He] 2s² 2p⁵",         block:"p", state:"gas",       electronegativity:3.98, atomicRadius:147, ionizationEnergy:1681.0, density:1.6960, meltingPoint:53.5,   boilingPoint:85.0,    electronAffinity:328.2, crustAbundance:585,    discoveryYear:1886, discoverer:"Henri Moissan",           description:"Elemento con la più alta elettronegatività (3,98) e il legame C–F più forte tra gli elementi (544 kJ/mol). Il fluoruro idrico è precursore del teflon e degli idrofluorocarburi; i fluoruri sono essenziali in medicina nucleare e in odontoiatria preventiva." },
  { z:10,  config:"[He] 2s² 2p⁶",         block:"p", state:"gas",       electronegativity:null, atomicRadius:154, ionizationEnergy:2080.7, density:0.9002, meltingPoint:24.6,   boilingPoint:27.1,    electronAffinity:-116,  crustAbundance:0.005,  discoveryYear:1898, discoverer:"William Ramsay / Morris Travers", description:"Gas nobile con configurazione ottetto completo, praticamente inerte. Le lampade al neon sfruttano le transizioni elettroniche nell'infrarosso visibile (630–640 nm); in cosmologia è tracciante dell'attività vulcanica e della differenziazione mantle–crosta." },
  { z:11,  config:"[Ne] 3s¹",             block:"s", state:"solid",     electronegativity:0.93, atomicRadius:227, ionizationEnergy:495.8,  density:0.968,  meltingPoint:370.9,  boilingPoint:1156.0,  electronAffinity:52.8,  crustAbundance:23600,  discoveryYear:1807, discoverer:"Humphry Davy",            description:"Metallo alcalino molle che reagisce vivacemente con l'acqua producendo idrogeno. Il meccanismo Na⁺/K⁺-ATPasi — che sfrutta il gradiente di Na⁺ attraverso la membrana cellulare — è il principale responsabile del potenziale d'azione neuronale." },
  { z:12,  config:"[Ne] 3s²",             block:"s", state:"solid",     electronegativity:1.31, atomicRadius:173, ionizationEnergy:737.7,  density:1.738,  meltingPoint:923.0,  boilingPoint:1363.0,  electronAffinity:-40,   crustAbundance:23300,  discoveryYear:1755, discoverer:"Joseph Black",            description:"Metallo alcalino-terroso più leggero dei metalli strutturali comuni. Il magnesio è al centro del gruppo porfirinico della clorofilla; le sue leghe (es. AZ31) sono usate in automotive e aerospazio per il miglior rapporto resistenza/peso." },
  { z:13,  config:"[Ne] 3s² 3p¹",         block:"p", state:"solid",     electronegativity:1.61, atomicRadius:184, ionizationEnergy:577.5,  density:2.699,  meltingPoint:933.5,  boilingPoint:2792.0,  electronAffinity:42.5,  crustAbundance:82300,  discoveryYear:1825, discoverer:"Hans Christian Ørsted",   description:"Terzo elemento più abbondante nella crosta terrestre, principale metallo strutturale per leggerezza e resistenza alla corrosione (strato passivo di Al₂O₃). La sua produzione elettrolitica (processo Hall-Héroult) richiede enormi quantità di energia elettrica." },
  { z:14,  config:"[Ne] 3s² 3p²",         block:"p", state:"solid",     electronegativity:1.90, atomicRadius:210, ionizationEnergy:786.5,  density:2.329,  meltingPoint:1687.0, boilingPoint:3538.0,  electronAffinity:133.6, crustAbundance:282000, discoveryYear:1824, discoverer:"Jöns Jacob Berzelius",    description:"Secondo elemento più abbondante della crosta (28,2%) e fondamento dell'industria dei semiconduttori. Il silicio monocristallino (grado solare) con larghezza di banda 1,12 eV è il materiale dominante nelle celle fotovoltaiche e nei chip CMOS." },
  { z:15,  config:"[Ne] 3s² 3p³",         block:"p", state:"solid",     electronegativity:2.19, atomicRadius:180, ionizationEnergy:1011.8, density:1.823,  meltingPoint:317.3,  boilingPoint:550.0,   electronAffinity:72.0,  crustAbundance:1050,   discoveryYear:1669, discoverer:"Hennig Brand",            description:"Elemento essenziale per la vita: forma lo scheletro fosfodiesterico del DNA/RNA e l'ATP. La forma allotropica bianca è altamente tossica e piroforica; il fosforo rosso è stabile e usato nei fiammiferi di sicurezza." },
  { z:16,  config:"[Ne] 3s² 3p⁴",         block:"p", state:"solid",     electronegativity:2.58, atomicRadius:180, ionizationEnergy:999.6,  density:2.067,  meltingPoint:388.4,  boilingPoint:717.8,   electronAffinity:200.4, crustAbundance:350,    discoveryYear:null, discoverer:"Antichità",               description:"Elemento polivalente con sei allotropi; lo zolfo rombico (S₈) è la forma stabile a temperatura ambiente. Essenziale per i legami disolfuro (-S-S-) nelle proteine, per l'acido solforico (prodotto chimico più prodotto al mondo) e nella vulcanizzazione della gomma." },
  { z:17,  config:"[Ne] 3s² 3p⁵",         block:"p", state:"gas",       electronegativity:3.16, atomicRadius:175, ionizationEnergy:1251.2, density:3.2140, meltingPoint:171.7,  boilingPoint:239.1,   electronAffinity:349.0, crustAbundance:145,    discoveryYear:1774, discoverer:"Carl Scheele",            description:"Alogeno biatomico giallo-verdastro, potente ossidante e disinfettante. Il cloro è usato per la potabilizzazione dell'acqua (in forma di ClO⁻ ipoclorito) e come precursore di PVC e policarbonati; il Cl⁻ è il principale anione extracellulare nei vertebrati." },
  { z:18,  config:"[Ne] 3s² 3p⁶",         block:"p", state:"gas",       electronegativity:null, atomicRadius:188, ionizationEnergy:1520.6, density:1.7837, meltingPoint:83.8,   boilingPoint:87.3,    electronAffinity:-96,   crustAbundance:3.5,    discoveryYear:1894, discoverer:"Lord Rayleigh / William Ramsay", description:"Gas nobile più abbondante dell'atmosfera terrestre (0,93%). Inerte chimicamente, usato come gas di schermatura in saldatura TIG/MIG e nei sistemi laser ad eccimeri; tracciante ambientale per studiare il rimescolamento degli strati atmosferici." },
  { z:19,  config:"[Ar] 4s¹",             block:"s", state:"solid",     electronegativity:0.82, atomicRadius:275, ionizationEnergy:418.8,  density:0.862,  meltingPoint:336.5,  boilingPoint:1032.0,  electronAffinity:48.4,  crustAbundance:20900,  discoveryYear:1807, discoverer:"Humphry Davy",            description:"Metallo alcalino con il più basso potenziale di ionizzazione dopo il cesio. Il canale ionico K⁺ è determinante per il potenziale di membrana neuronale; il ⁴⁰K (0,012% naturale) è principale fonte di calore radiogenico nel mantello terrestre." },
  { z:20,  config:"[Ar] 4s²",             block:"s", state:"solid",     electronegativity:1.00, atomicRadius:231, ionizationEnergy:589.8,  density:1.550,  meltingPoint:1115.0, boilingPoint:1757.0,  electronAffinity:-186,  crustAbundance:41500,  discoveryYear:1808, discoverer:"Humphry Davy",            description:"Quinto elemento più abbondante nella crosta terrestre (4,15%). Il calcio è fondamentale per la mineralizzazione ossea (idrossiapatite Ca₅(PO₄)₃OH) e per la trasmissione sinaptica come secondo messaggero intracellulare." },
  { z:21,  config:"[Ar] 3d¹ 4s²",         block:"d", state:"solid",     electronegativity:1.36, atomicRadius:211, ionizationEnergy:633.1,  density:2.985,  meltingPoint:1814.0, boilingPoint:3109.0,  electronAffinity:18.1,  crustAbundance:22,     discoveryYear:1879, discoverer:"Lars Fredrik Nilson",     description:"Primo elemento del blocco d (metalli di transizione). Lo scandio migliora le leghe di alluminio per aerospazio (es. 7075+Sc); la sua rarità deriva dall'impossibilità di concentrarlo in minerali propri per ragioni geochiniche." },
  { z:22,  config:"[Ar] 3d² 4s²",         block:"d", state:"solid",     electronegativity:1.54, atomicRadius:187, ionizationEnergy:658.8,  density:4.507,  meltingPoint:1941.0, boilingPoint:3560.0,  electronAffinity:7.6,   crustAbundance:5650,   discoveryYear:1791, discoverer:"William Gregor",          description:"Metallo di transizione con ottimo rapporto resistenza/peso e biocompatibilità. Il grado medico (Ti-6Al-4V) è lo standard per impianti ortopedici e dentali; il TiO₂ (biossido di titanio) è il pigmento bianco più usato al mondo." },
  { z:23,  config:"[Ar] 3d³ 4s²",         block:"d", state:"solid",     electronegativity:1.63, atomicRadius:179, ionizationEnergy:650.9,  density:6.110,  meltingPoint:2183.0, boilingPoint:3680.0,  electronAffinity:50.6,  crustAbundance:120,    discoveryYear:1801, discoverer:"Andrés Manuel del Río / Nils Gabriel Sefström", description:"Metallo di transizione duro e resistente all'usura. Il V₂O₅ è catalizzatore nel processo Contact per la produzione di H₂SO₄; in metallurgia il vanadio aggiunto all'acciaio (0,1–1%) ne aumenta notevolmente durezza e resistenza all'urto." },
  { z:24,  config:"[Ar] 3d⁵ 4s¹",         block:"d", state:"solid",     electronegativity:1.66, atomicRadius:189, ionizationEnergy:652.9,  density:7.190,  meltingPoint:2180.0, boilingPoint:2944.0,  electronAffinity:64.3,  crustAbundance:102,    discoveryYear:1798, discoverer:"Louis-Nicolas Vauquelin", description:"Presenta configurazione anomala ([Ar] 3d⁵ 4s¹) per la stabilità del guscio d semi-pieno. Fondamentale per le leghe inossidabili (acciaio AISI 304: 18% Cr, 8% Ni); lo strato passivante Cr₂O₃ conferisce eccellente resistenza alla corrosione." },
  { z:25,  config:"[Ar] 3d⁵ 4s²",         block:"d", state:"solid",     electronegativity:1.55, atomicRadius:197, ionizationEnergy:717.3,  density:7.470,  meltingPoint:1519.0, boilingPoint:2334.0,  electronAffinity:-50,   crustAbundance:950,    discoveryYear:1774, discoverer:"Johan Gottlieb Gahn",     description:"Metallo di transizione essenziale in siderurgia come deossidante e desolfurante dell'acciaio. Il MnO₂ è l'elettrodo catodico delle pile Leclanché; il manganese è cofattore della superossido-dismutasi mitocondriale, enzima antiossidante cellulare." },
  { z:26,  config:"[Ar] 3d⁶ 4s²",         block:"d", state:"solid",     electronegativity:1.83, atomicRadius:194, ionizationEnergy:762.5,  density:7.874,  meltingPoint:1811.0, boilingPoint:3134.0,  electronAffinity:15.7,  crustAbundance:56300,  discoveryYear:null, discoverer:"Antichità",               description:"Metallo più abbondante del pianeta (32,1% della massa terrestre totale). Il nucleo Fe-Ni genera il campo magnetico terrestre per geodinamo; l'emoglobina sfrutta lo ione Fe²⁺ nel gruppo eme per trasportare O₂ nel sangue." },
  { z:27,  config:"[Ar] 3d⁷ 4s²",         block:"d", state:"solid",     electronegativity:1.88, atomicRadius:192, ionizationEnergy:760.4,  density:8.900,  meltingPoint:1768.0, boilingPoint:3200.0,  electronAffinity:63.7,  crustAbundance:25,     discoveryYear:1739, discoverer:"Georg Brandt",            description:"Metallo ferromagnetico con alta durezza e resistenza a temperature elevate. Il ⁶⁰Co è sorgente gamma standard in radioterapia; il cobalto è cofattore della vitamina B₁₂ (cianocobalamina), essenziale per la sintesi del DNA nei vertebrati." },
  { z:28,  config:"[Ar] 3d⁸ 4s²",         block:"d", state:"solid",     electronegativity:1.91, atomicRadius:163, ionizationEnergy:737.1,  density:8.908,  meltingPoint:1728.0, boilingPoint:3003.0,  electronAffinity:112.0, crustAbundance:84,     discoveryYear:1751, discoverer:"Axel Fredrik Cronstedt",  description:"Metallo di transizione ferromagnetico fino a 358°C (temperatura di Curie). Le superleghe a base Ni (es. Inconel 718) operano nei motori a reazione fino a 1000°C; il catalizzatore Ni di Raney è usato nell'idrogenazione industriale dei grassi vegetali." },
  { z:29,  config:"[Ar] 3d¹⁰ 4s¹",        block:"d", state:"solid",     electronegativity:1.90, atomicRadius:140, ionizationEnergy:745.5,  density:8.960,  meltingPoint:1358.0, boilingPoint:2835.0,  electronAffinity:119.2, crustAbundance:60,     discoveryYear:null, discoverer:"Antichità",               description:"Metallo con la migliore conduttività elettrica tra i comuni (59,6 MS/m). La configurazione anomala [Ar] 3d¹⁰ 4s¹ conferisce mobilità all'elettrone 4s; il rame è essenziale come cofattore della citocromo c ossidasi e della ceruloplasmina." },
  { z:30,  config:"[Ar] 3d¹⁰ 4s²",        block:"d", state:"solid",     electronegativity:1.65, atomicRadius:139, ionizationEnergy:906.4,  density:7.133,  meltingPoint:692.7,  boilingPoint:1180.0,  electronAffinity:-58,   crustAbundance:70,     discoveryYear:null, discoverer:"Antichità",               description:"Metallo di transizione con subguscio d completamente pieno, chimicamente simile ai metalli del blocco p. Il solfuro di zinco (ZnS) è luminoforo di base; lo Zn²⁺ è cofattore di oltre 300 enzimi, tra cui la carbossipeptidasi e le DNA-polimerasi." },
  { z:31,  config:"[Ar] 3d¹⁰ 4s² 4p¹",    block:"p", state:"solid",     electronegativity:1.81, atomicRadius:187, ionizationEnergy:578.8,  density:5.907,  meltingPoint:302.9,  boilingPoint:2477.0,  electronAffinity:28.9,  crustAbundance:19,     discoveryYear:1875, discoverer:"Paul Emile Lecoq de Boisbaudran", description:"Metallo post-transizione previsto da Mendeleev come 'eka-alluminio' prima della scoperta. Il nitruro di gallio (GaN) è il materiale base dei LED blu (Nobel Fisica 2014) e dei diodi laser per Blu-ray; il MOCVD su substrati di zaffiro ne consente la crescita epitassiale." },
  { z:32,  config:"[Ar] 3d¹⁰ 4s² 4p²",    block:"p", state:"solid",     electronegativity:2.01, atomicRadius:211, ionizationEnergy:762.0,  density:5.323,  meltingPoint:1211.4, boilingPoint:3106.0,  electronAffinity:119.0, crustAbundance:1.5,    discoveryYear:1886, discoverer:"Clemens Winkler",         description:"Metalloide semiconduttore previsto da Mendeleev come 'eka-silicio'. Il germanio fu il materiale del primo transistor (Shockley, Bardeen, Brattain, 1947); oggi è usato principalmente in fibra ottica (GeO₂) e come substrato per celle fotovoltaiche multi-giunzione ad alta efficienza." },
  { z:33,  config:"[Ar] 3d¹⁰ 4s² 4p³",    block:"p", state:"solid",     electronegativity:2.18, atomicRadius:185, ionizationEnergy:947.0,  density:5.776,  meltingPoint:1090.0, boilingPoint:887.0,   electronAffinity:78.2,  crustAbundance:1.8,    discoveryYear:null, discoverer:"Antichità",               description:"Metalloide tossico noto sin dall'antichità come veleno (As₂O₃). L'arseniuro di gallio (GaAs) è semiconduttore ad alta mobilità elettronica per circuiti RF e celle solari di terza generazione; l'arsenico inorganico è cancerogeno di classe 1 (IARC)." },
  { z:34,  config:"[Ar] 3d¹⁰ 4s² 4p⁴",    block:"p", state:"solid",     electronegativity:2.55, atomicRadius:190, ionizationEnergy:941.0,  density:4.809,  meltingPoint:494.0,  boilingPoint:958.0,   electronAffinity:195.0, crustAbundance:0.05,   discoveryYear:1817, discoverer:"Jöns Jacob Berzelius",    description:"Calcogeno raro con proprietà fotoconduttive utilizzate nella reprografia (fotocopiatrici al selenio). Il seleniuro di cadmio (CdSe) è la base dei quantum dot per display QLED; il selenio è oligoelemento essenziale nei vertebrati come cofattore della glutatione perossidasi." },
  { z:35,  config:"[Ar] 3d¹⁰ 4s² 4p⁵",    block:"p", state:"liquid",    electronegativity:2.96, atomicRadius:185, ionizationEnergy:1139.9, density:3.102,  meltingPoint:265.9,  boilingPoint:332.0,   electronAffinity:324.5, crustAbundance:2.4,    discoveryYear:1826, discoverer:"Antoine Jérôme Balard",   description:"Uno dei soli due elementi liquidi a temperatura ambiente (insieme al mercurio). Il 80% della produzione mondiale di bromo è impiegata come bromurato ritardante di fiamma nei materiali plastici; il bromuro d'argento (AgBr) era il sensore fotosensibile della fotografia analogica." },
  { z:36,  config:"[Ar] 3d¹⁰ 4s² 4p⁶",    block:"p", state:"gas",       electronegativity:null, atomicRadius:202, ionizationEnergy:1350.8, density:3.7493, meltingPoint:115.8,  boilingPoint:119.9,   electronAffinity:-96,   crustAbundance:0.001,  discoveryYear:1898, discoverer:"William Ramsay / Morris Travers", description:"Gas nobile con la più alta energia di ionizzazione degli elementi del quarto periodo. Il kripton-85 (fissione nucleare) è tracciante per monitoraggio di impianti nucleari; le lampade a scarica al kripton forniscono luce bianca di elevata qualità cromatica (CRI > 95)." },
  { z:37,  config:"[Kr] 5s¹",             block:"s", state:"solid",     electronegativity:0.82, atomicRadius:303, ionizationEnergy:403.0,  density:1.532,  meltingPoint:312.5,  boilingPoint:961.0,   electronAffinity:46.9,  crustAbundance:90,     discoveryYear:1861, discoverer:"Robert Bunsen / Gustav Kirchhoff", description:"Metallo alcalino con il secondo potenziale di ionizzazione più basso. Il ⁸⁷Rb si decade in ⁸⁷Sr (T½ = 48,8 Ga), sistema di datazione radiometrica per rocce antiche; gli atomi di Rb freddi laser sono usati nei condensati di Bose-Einstein." },
  { z:38,  config:"[Kr] 5s²",             block:"s", state:"solid",     electronegativity:0.95, atomicRadius:249, ionizationEnergy:549.5,  density:2.640,  meltingPoint:1050.0, boilingPoint:1655.0,  electronAffinity:-5,    crustAbundance:370,    discoveryYear:1790, discoverer:"Adair Crawford",          description:"Metallo alcalino-terroso con luminescenza caratteristica in rosso carminio (λ = 606 nm). Il ⁹⁰Sr (prodotto di fissione, T½ = 28,8 a) si sostituisce chimicamente al calcio nell'osso; il titanato di bario-stronzio (BST) è dielettrico per condensatori DRAM." },
  { z:39,  config:"[Kr] 4d¹ 5s²",         block:"d", state:"solid",     electronegativity:1.22, atomicRadius:219, ionizationEnergy:600.0,  density:4.469,  meltingPoint:1799.0, boilingPoint:3609.0,  electronAffinity:29.6,  crustAbundance:33,     discoveryYear:1794, discoverer:"Johan Gadolin",           description:"Metallo dei lantanoidi 'leggero' usato in leghe ad alta resistenza. L'ossido di ittrio stabilizzato con zirconia (YSZ) è l'elettrolita solido per celle a combustibile ad ossido solido (SOFC); i granati YAG:Nd³⁺ sono il mezzo attivo dei laser industriali Nd:YAG." },
  { z:40,  config:"[Kr] 4d² 5s²",         block:"d", state:"solid",     electronegativity:1.33, atomicRadius:186, ionizationEnergy:640.1,  density:6.506,  meltingPoint:2128.0, boilingPoint:4682.0,  electronAffinity:41.1,  crustAbundance:165,    discoveryYear:1824, discoverer:"Jöns Jacob Berzelius",    description:"Metallo duro con bassa sezione d'urto per i neutroni termici (0,18 barn), indispensabile nel rivestimento delle barre di combustibile dei reattori nucleari (Zircaloy). Resiste alla corrosione grazie allo strato passivante di ZrO₂; il carburo ZrC raggiunge 3540°C di punto di fusione." },
  { z:41,  config:"[Kr] 4d⁴ 5s¹",         block:"d", state:"solid",     electronegativity:1.60, atomicRadius:207, ionizationEnergy:652.1,  density:8.570,  meltingPoint:2750.0, boilingPoint:5017.0,  electronAffinity:86.1,  crustAbundance:20,     discoveryYear:1801, discoverer:"Charles Hatchett",        description:"Metallo refrattario con configurazione anomala [Kr] 4d⁴ 5s¹. Aggiunto in piccole quantità (0,1–0,3%) all'acciaio inox lo stabilizza contro la corrosione intergranulare; il NbTi e Nb₃Sn sono i superconduttori più utilizzati nei magneti degli acceleratori e degli MRI." },
  { z:42,  config:"[Kr] 4d⁵ 5s¹",         block:"d", state:"solid",     electronegativity:2.16, atomicRadius:209, ionizationEnergy:684.3,  density:10.22,  meltingPoint:2896.0, boilingPoint:4912.0,  electronAffinity:71.9,  crustAbundance:1.2,    discoveryYear:1781, discoverer:"Carl Wilhelm Scheele",    description:"Metallo refrattario con configurazione anomala (stabilità del subguscio 4d⁵). Aggiunto all'acciaio aumenta la durabilità ad alta temperatura (acciai inox 316); il disolfuro MoS₂ è un lubrificante solido d'alta prestazione e catalizzatore per HDS del petrolio." },
  { z:43,  config:"[Kr] 4d⁵ 5s²",         block:"d", state:"solid",     electronegativity:1.90, atomicRadius:209, ionizationEnergy:702.0,  density:11.50,  meltingPoint:2430.0, boilingPoint:4538.0,  electronAffinity:53,    crustAbundance:null,   discoveryYear:1937, discoverer:"Carlo Perrier / Emilio Segrè", description:"Primo elemento sintetizzato artificialmente (1937, ciclotrone di Berkeley). Tutti gli isotopi sono radioattivi; il ⁹⁹ᵐTc (T½ = 6,01 h) è il radionuclide più usato in medicina nucleare diagnostica (scintigrafia ossea, SPECT) grazie all'emissione gamma a 140 keV." },
  { z:44,  config:"[Kr] 4d⁷ 5s¹",         block:"d", state:"solid",     electronegativity:2.20, atomicRadius:207, ionizationEnergy:710.2,  density:12.37,  meltingPoint:2607.0, boilingPoint:4423.0,  electronAffinity:101.3, crustAbundance:0.001,  discoveryYear:1844, discoverer:"Karl Ernst Claus",        description:"Metallo del gruppo del platino con alto punto di fusione e durezza eccellente. Il catalizzatore Ru/Al₂O₃ è usato nell'ammoniaca (processo Kellogg Ammonia Casale); il complesso Ru(bpy)₃²⁺ è fotosensibilizzatore nei sistemi di splitting dell'acqua solare." },
  { z:45,  config:"[Kr] 4d⁸ 5s¹",         block:"d", state:"solid",     electronegativity:2.28, atomicRadius:195, ionizationEnergy:719.7,  density:12.41,  meltingPoint:2237.0, boilingPoint:3968.0,  electronAffinity:109.7, crustAbundance:0.0002, discoveryYear:1803, discoverer:"William Hyde Wollaston",  description:"Metallo del platino con eccellente biocompatibilità. I complessi di Rh(III) sono catalizzatori enantiosettivi per la sintesi asimmetrica; il rodio è componente critico delle marmitte catalitiche (13–15% Rh) per l'ossidazione degli NOₓ a N₂." },
  { z:46,  config:"[Kr] 4d¹⁰",             block:"d", state:"solid",     electronegativity:2.20, atomicRadius:202, ionizationEnergy:804.4,  density:12.02,  meltingPoint:1828.0, boilingPoint:3236.0,  electronAffinity:53.7,  crustAbundance:0.015,  discoveryYear:1803, discoverer:"William Hyde Wollaston",  description:"Unico metallo con configurazione elettronica senza elettroni 5s ([Kr]4d¹⁰). Il palladio assorbe fino a 900 volte il proprio volume di H₂ a temperatura ambiente; catalizzatore chiave nel cross-coupling C-C (Heck, Suzuki, Nobel 2010) per sintesi di farmaci." },
  { z:47,  config:"[Kr] 4d¹⁰ 5s¹",        block:"d", state:"solid",     electronegativity:1.93, atomicRadius:172, ionizationEnergy:731.0,  density:10.49,  meltingPoint:1235.1, boilingPoint:2435.0,  electronAffinity:125.6, crustAbundance:0.075,  discoveryYear:null, discoverer:"Antichità",               description:"Metallo con la più alta conduttività elettrica (63,0 MS/m) e termica (429 W/m·K) tra tutti gli elementi. Antimicrobico naturale (effetto oligodinamico); le nanoparticelle Ag (AgNPs, 1–100 nm) sono studiate come agenti antibatterici nei dispositivi medici." },
  { z:48,  config:"[Kr] 4d¹⁰ 5s²",        block:"d", state:"solid",     electronegativity:1.69, atomicRadius:158, ionizationEnergy:867.8,  density:8.650,  meltingPoint:594.2,  boilingPoint:1040.0,  electronAffinity:-68,   crustAbundance:0.15,   discoveryYear:1817, discoverer:"Friedrich Stromeyer",     description:"Metallo tossico con interessanti proprietà optoelettroniche. Il telloruro di cadmio (CdTe) è il secondo materiale fotovoltaico per quota di mercato globale (efficienza record 22,1%); il CdSe è la base dei quantum dot per display e bioimaging; classificato cancerogeno di classe 1 (IARC)." },
  { z:49,  config:"[Kr] 4d¹⁰ 5s² 5p¹",    block:"p", state:"solid",     electronegativity:1.78, atomicRadius:193, ionizationEnergy:558.3,  density:7.310,  meltingPoint:429.8,  boilingPoint:2345.0,  electronAffinity:28.9,  crustAbundance:0.25,   discoveryYear:1863, discoverer:"Ferdinand Reich / Hieronymus Richter", description:"Metallo post-transizione morbido; 'piange' piasticamente sotto sforzo (tin cry). Oltre il 70% della produzione mondiale di indio è consumata come ITO (ossido di indio e stagno) negli strati trasparenti conduttori di display LCD/OLED e touchscreen." },
  { z:50,  config:"[Kr] 4d¹⁰ 5s² 5p²",    block:"p", state:"solid",     electronegativity:1.96, atomicRadius:217, ionizationEnergy:708.6,  density:7.265,  meltingPoint:505.1,  boilingPoint:2875.0,  electronAffinity:107.3, crustAbundance:2.3,    discoveryYear:null, discoverer:"Antichità",               description:"Elemento con il maggior numero di isotopi stabili naturali (10). L'allotropo bianco (β-Sn) è conduttore metallico; sotto 13,2°C si trasforma lentamente nel friabile α-Sn (tin pest). Principale metallo delle saldature nei circuiti elettronici (leghe Sn-Ag-Cu RoHS-compliant)." },
  { z:51,  config:"[Kr] 4d¹⁰ 5s² 5p³",    block:"p", state:"solid",     electronegativity:2.05, atomicRadius:206, ionizationEnergy:834.0,  density:6.697,  meltingPoint:903.9,  boilingPoint:1860.0,  electronAffinity:101.0, crustAbundance:0.2,    discoveryYear:null, discoverer:"Antichità",               description:"Metalloide noto sin dall'antichità come cosmetico (kohl). L'antimoniuro di indio (InSb) è semiconduttore a banda stretta per rilevatori infrarossi; Sb₂O₃ è catalizzatore industriale per la produzione di PET (polietilentereftalato) e ritardante di fiamma." },
  { z:52,  config:"[Kr] 4d¹⁰ 5s² 5p⁴",    block:"p", state:"solid",     electronegativity:2.10, atomicRadius:206, ionizationEnergy:869.3,  density:6.240,  meltingPoint:722.7,  boilingPoint:1261.0,  electronAffinity:190.2, crustAbundance:0.001,  discoveryYear:1782, discoverer:"Franz-Joseph Müller von Reichenstein", description:"Metalloide raro con proprietà di semiconduttore. Il tellururo di bismuto (Bi₂Te₃) è il materiale termoelettrico standard per la refrigerazione a effetto Peltier (ZT ≈ 1 a 300 K); il tellururo di cadmio (CdTe) è usato nelle celle fotovoltaiche thin-film." },
  { z:53,  config:"[Kr] 4d¹⁰ 5s² 5p⁵",    block:"p", state:"solid",     electronegativity:2.66, atomicRadius:198, ionizationEnergy:1008.4, density:4.933,  meltingPoint:386.9,  boilingPoint:457.5,   electronAffinity:295.2, crustAbundance:0.45,   discoveryYear:1811, discoverer:"Bernard Courtois",        description:"Alogeno solido a temperatura ambiente con vapori viola caratteristici. Essenziale per la sintesi degli ormoni tiroidei (tiroxina T₄ e triiodotironina T₃); la carenza di iodio è la principale causa prevenibile di ritardo mentale nel mondo (cretinismo)." },
  { z:54,  config:"[Kr] 4d¹⁰ 5s² 5p⁶",    block:"p", state:"gas",       electronegativity:2.60, atomicRadius:216, ionizationEnergy:1170.4, density:5.8971, meltingPoint:161.4,  boilingPoint:165.1,   electronAffinity:-77,   crustAbundance:3e-5,   discoveryYear:1898, discoverer:"William Ramsay / Morris Travers", description:"Gas nobile del quinto periodo, primo a formare composti stabili (XeF₂, 1962). Il laser a eccimeri XeF emette a 351 nm (UV); lo ¹²⁹Xe NMR iperpolarizzato è impiegato in imaging polmonare ad alta sensibilità; i motori ionici a ioni Xe sono lo standard per propulsione spaziale." },
  { z:55,  config:"[Xe] 6s¹",             block:"s", state:"solid",     electronegativity:0.79, atomicRadius:343, ionizationEnergy:375.7,  density:1.873,  meltingPoint:301.6,  boilingPoint:944.0,   electronAffinity:45.5,  crustAbundance:3,      discoveryYear:1860, discoverer:"Robert Bunsen / Gustav Kirchhoff", description:"Metallo alcalino con la più bassa elettronegatività (0,79) e il più alto raggio atomico tra i metalli. Il ¹³³Cs è lo standard primario di frequenza per la definizione del secondo SI (oscillazioni iperfini 9.192.631.770 Hz); l'orologio atomico al cesio ha un'accuratezza di 10⁻¹⁶." },
  { z:56,  config:"[Xe] 6s²",             block:"s", state:"solid",     electronegativity:0.89, atomicRadius:268, ionizationEnergy:502.9,  density:3.510,  meltingPoint:1000.0, boilingPoint:2143.0,  electronAffinity:14.0,  crustAbundance:425,    discoveryYear:1808, discoverer:"Humphry Davy",            description:"Metallo alcalino-terroso morbido con reattività elevata in acqua. Il titanato di bario (BaTiO₃) è ferroelettrico piezoe con costante dielettrica ε ≈ 10.000 a Tc = 120°C; il solfato BaSO₄ è opaco ai raggi X e usato come mezzo di contrasto nelle radiografie gastrointestinali." },
  { z:57,  config:"[Xe] 5d¹ 6s²",         block:"f", state:"solid",     electronegativity:1.10, atomicRadius:240, ionizationEnergy:538.1,  density:6.145,  meltingPoint:1193.0, boilingPoint:3737.0,  electronAffinity:48,    crustAbundance:39,     discoveryYear:1839, discoverer:"Carl Gustaf Mosander",    description:"Primo elemento della serie dei lantanidi, manca della configurazione 4f tipica del gruppo. L'ossido La₂O₃ stabilizza la zirconia per le celle SOFC e migliora la qualità degli obiettivi ottici (lenti 'lanthanum crown'); il nichel-idruro metallico LaₓNiHₙ è il catodo delle batterie NiMH." },
  { z:58,  config:"[Xe] 4f¹ 5d¹ 6s²",     block:"f", state:"solid",     electronegativity:1.12, atomicRadius:235, ionizationEnergy:534.4,  density:6.770,  meltingPoint:1068.0, boilingPoint:3716.0,  electronAffinity:50,    crustAbundance:66.5,   discoveryYear:1803, discoverer:"Jöns Jacob Berzelius / Wilhelm Hisinger", description:"Lantanide più abbondante nella crosta (66,5 ppm). Il Ce⁴⁺/Ce³⁺ (E° = +1,72 V) è il sistema redox usato nelle marmitte catalitiche (TWC) come serbatoio di ossigeno (oxygen storage capacity); il CeO₂ è abrasivo per la lucidatura del vetro ottico." },
  { z:59,  config:"[Xe] 4f³ 6s²",         block:"f", state:"solid",     electronegativity:1.13, atomicRadius:239, ionizationEnergy:527.0,  density:6.773,  meltingPoint:1208.0, boilingPoint:3793.0,  electronAffinity:50,    crustAbundance:9.2,    discoveryYear:1885, discoverer:"Carl Auer von Welsbach",  description:"Lantanide con configurazione 4f³ che conferisce intenso paramagnetismo. I magneti Nd₂Fe₁₄B di classe N52 (produzione limitata di Pr al posto di Nd: Pr₂Fe₁₄B) hanno proprietà magnetiche comparabili; il praseodimio colora il vetro giallo-verde (lenti protettive di saldatura)." },
  { z:60,  config:"[Xe] 4f⁴ 6s²",         block:"f", state:"solid",     electronegativity:1.14, atomicRadius:229, ionizationEnergy:533.1,  density:7.007,  meltingPoint:1297.0, boilingPoint:3347.0,  electronAffinity:50,    crustAbundance:41.5,   discoveryYear:1885, discoverer:"Carl Auer von Welsbach",  description:"Lantanide con forte anisotropia magnetocristallina. I magneti Nd₂Fe₁₄B contengono Nd come componente principale (~27%); l'ossido Nd₂O₃ è dopante nei laser YAG per emissione a 1064 nm; tracciante geologico nelle croste oceaniche per la ridotta mobilità in soluzione." },
  { z:61,  config:"[Xe] 4f⁵ 6s²",         block:"f", state:"solid",     electronegativity:1.13, atomicRadius:236, ionizationEnergy:540.0,  density:7.264,  meltingPoint:1315.0, boilingPoint:3273.0,  electronAffinity:50,    crustAbundance:null,   discoveryYear:1945, discoverer:"Jacob A. Marinsky / Lawrence E. Glendenin", description:"Unico lantanide senza isotopi stabili; tutti i 147Pm sono radioattivi (T½ massimo = 17,7 a per ¹⁴⁵Pm). Il ¹⁴⁷Pm emettitore β è usato come sorgente di spessimetri industriali e in pacemaker di vecchia generazione; esiste in tracce nella crosta come prodotto di fissione spontanea dell'U." },
  { z:62,  config:"[Xe] 4f⁶ 6s²",         block:"f", state:"solid",     electronegativity:1.17, atomicRadius:229, ionizationEnergy:544.5,  density:7.520,  meltingPoint:1345.0, boilingPoint:2067.0,  electronAffinity:50,    crustAbundance:7.05,   discoveryYear:1879, discoverer:"Paul Emile Lecoq de Boisbaudran", description:"Lantanide paramagnetico con elevato momento magnetico. Il SmCo₅ e Sm₂Co₁₇ sono magneti permanenti ad alte prestazioni con eccellente stabilità termica fino a 350°C; il ¹⁵³Sm è usato in radioterapia palliativa delle metastasi ossee." },
  { z:63,  config:"[Xe] 4f⁷ 6s²",         block:"f", state:"solid",     electronegativity:1.20, atomicRadius:233, ionizationEnergy:547.1,  density:5.243,  meltingPoint:1099.0, boilingPoint:1802.0,  electronAffinity:50,    crustAbundance:2.0,    discoveryYear:1901, discoverer:"Eugène-Anatole Demarçay", description:"Lantanide con configurazione 4f⁷ semi-piena (massima stabilità di spin). Il Eu³⁺ e Eu²⁺ sono i principali attivatori di luminescenza rossa e blu nei fosfori LED-bianchi; il Eu(III)-EDTA è sonda fluorescente in bioanalisi per immunosaggio in time-resolved fluorescence." },
  { z:64,  config:"[Xe] 4f⁷ 5d¹ 6s²",     block:"f", state:"solid",     electronegativity:1.20, atomicRadius:237, ionizationEnergy:593.4,  density:7.900,  meltingPoint:1585.0, boilingPoint:3546.0,  electronAffinity:50,    crustAbundance:6.2,    discoveryYear:1880, discoverer:"Jean Charles Galissard de Marignac", description:"Lantanide con la maggiore sezione d'urto termica-neutronica naturale (49.000 barn). Usato nei reattori nucleari come assorbitore-bruciabile di neutroni (burnable poison GdO₂-UO₂); il Gd³⁺ (7 elettroni spaiati) è l'agente di contrasto MRI più diffuso (Gd-DTPA, relaxività elevata)." },
  { z:65,  config:"[Xe] 4f⁹ 6s²",         block:"f", state:"solid",     electronegativity:1.22, atomicRadius:221, ionizationEnergy:565.8,  density:8.229,  meltingPoint:1629.0, boilingPoint:3503.0,  electronAffinity:50,    crustAbundance:1.2,    discoveryYear:1843, discoverer:"Carl Gustaf Mosander",    description:"Lantanide raro con applicazioni nei magneti avanzati. Il terbio è dopante in magnetostrittivi Terfenol-D (Tb₀.₃Dy₀.₇Fe₂), materiale con il più alto coefficiente di magnetostrizione al mondo (1500 ppm); Tb³⁺ è attivatore verde nei fosfori per display ad alta efficienza." },
  { z:66,  config:"[Xe] 4f¹⁰ 6s²",        block:"f", state:"solid",     electronegativity:1.23, atomicRadius:229, ionizationEnergy:573.0,  density:8.550,  meltingPoint:1680.0, boilingPoint:2840.0,  electronAffinity:50,    crustAbundance:5.2,    discoveryYear:1886, discoverer:"Paul Emile Lecoq de Boisbaudran", description:"Lantanide con il più alto momento magnetico di qualsiasi elemento (10,6 μB). Il disprosio è aggiunto ai magneti Nd-Fe-B (Dy₂Fe₁₄B) per mantenerne le proprietà a temperature elevate (autovetture elettriche); usato nei dosimetri termoluminescenti (TLD-dosimetry)." },
  { z:67,  config:"[Xe] 4f¹¹ 6s²",        block:"f", state:"solid",     electronegativity:1.24, atomicRadius:216, ionizationEnergy:581.0,  density:8.795,  meltingPoint:1734.0, boilingPoint:2993.0,  electronAffinity:50,    crustAbundance:1.3,    discoveryYear:1878, discoverer:"Marc Delafontaine / Louis Soret", description:"Lantanide con il maggiore momento magnetico tra i lantanidi dopo il terbio. Il ¹⁶⁶Ho in forma di microsfera (SIR-Spheres modificate) è usato in radioterapia interna selettiva (SIRT) dei tumori epatici; i complessi Ho³⁺ sono utilizzati come standard di calibrazione in spettroscopia UV-Vis." },
  { z:68,  config:"[Xe] 4f¹² 6s²",        block:"f", state:"solid",     electronegativity:1.24, atomicRadius:235, ionizationEnergy:589.3,  density:9.066,  meltingPoint:1802.0, boilingPoint:3141.0,  electronAffinity:50,    crustAbundance:3.5,    discoveryYear:1843, discoverer:"Carl Gustaf Mosander",    description:"Lantanide con applicazioni ottiche e medicali. Il laser Er:YAG (2940 nm) coincide con il massimo di assorbimento dell'acqua tissutale, fondamentale in dermatologia e chirurgia laser dei tessuti molli; Er³⁺ è dopante negli amplificatori ottici in fibra (EDFA) per telecomunicazioni a 1550 nm." },
  { z:69,  config:"[Xe] 4f¹³ 6s²",        block:"f", state:"solid",     electronegativity:1.25, atomicRadius:227, ionizationEnergy:596.7,  density:9.321,  meltingPoint:1818.0, boilingPoint:2223.0,  electronAffinity:50,    crustAbundance:0.52,   discoveryYear:1879, discoverer:"Per Teodor Cleve",        description:"Secondo lantanide più raro (dopo il prometio); l'unico con configurazione 4f¹³ che ha solo un isotopo naturale stabile (¹⁶⁹Tm). Il ¹⁷⁰Tm (T½ = 128,6 d) è sorgente portatile di raggi X per radiografia industriale; il tulio migliora le proprietà magnetiche di magneti CoPt ad alta temperatura." },
  { z:70,  config:"[Xe] 4f¹⁴ 6s²",        block:"f", state:"solid",     electronegativity:1.10, atomicRadius:242, ionizationEnergy:603.4,  density:6.965,  meltingPoint:1097.0, boilingPoint:1469.0,  electronAffinity:50,    crustAbundance:3.2,    discoveryYear:1878, discoverer:"Jean Charles Galissard de Marignac", description:"Lantanide con subguscio 4f pieno (4f¹⁴), comportamento chimico simile all'europio. Lo Yb³⁺/Yb²⁺ ha un potenziale simile a quello del Ca²⁺ per sonde biologiche; i laser Yb:YAG (1030 nm) sono tra i più efficienti sistemi laser a stato solido per applicazioni industriali ad alta potenza." },
  { z:71,  config:"[Xe] 4f¹⁴ 5d¹ 6s²",    block:"d", state:"solid",     electronegativity:1.27, atomicRadius:221, ionizationEnergy:523.5,  density:9.840,  meltingPoint:1936.0, boilingPoint:3675.0,  electronAffinity:50,    crustAbundance:0.8,    discoveryYear:1907, discoverer:"Georges Urbain / Carl Auer von Welsbach", description:"Ultimo dei lantanidi e il più denso e duro della serie. Il lutezio è usato come matrice per scintillatori PET (Lu₂SiO₅:Ce, LSO) grazie all'alta densità (9,4 g/cm³) e al corto cammino libero medio dei fotoni 511 keV; il ¹⁷⁷Lu è radionuclide terapeutico per PRRT dei tumori neuroendocrini." },
  { z:72,  config:"[Xe] 4f¹⁴ 5d² 6s²",    block:"d", state:"solid",     electronegativity:1.30, atomicRadius:212, ionizationEnergy:658.5,  density:13.31,  meltingPoint:2506.0, boilingPoint:4876.0,  electronAffinity:0,     crustAbundance:3.0,    discoveryYear:1923, discoverer:"Dirk Coster / Georg von Hevesy", description:"Metallo del blocco d con dimensioni quasi identiche allo zirconio (contrazione lantanidica). Il HfO₂ ad alta costante dielettrica (κ ≈ 25) sostituisce il SiO₂ nel gate oxide dei transistor CMOS avanzati (nodo < 45 nm); l'afnio è usato negli elettrodi dei plasma cutter per la resistenza termica." },
  { z:73,  config:"[Xe] 4f¹⁴ 5d³ 6s²",    block:"d", state:"solid",     electronegativity:1.50, atomicRadius:217, ionizationEnergy:761.0,  density:16.65,  meltingPoint:3290.0, boilingPoint:5731.0,  electronAffinity:31,    crustAbundance:2.0,    discoveryYear:1802, discoverer:"Anders Gustav Ekeberg",   description:"Metallo refrattario con eccellente biocompatibilità e resistenza alla corrosione. Il Ta₂O₅ (κ = 25–27) è dielettrico per condensatori tantalio negli apparecchi elettronici portatili; il tantal è usato nei condensatori delle schede madri per la sua stabilità a grande temperatura." },
  { z:74,  config:"[Xe] 4f¹⁴ 5d⁴ 6s²",    block:"d", state:"solid",     electronegativity:2.36, atomicRadius:210, ionizationEnergy:770.0,  density:19.25,  meltingPoint:3695.0, boilingPoint:5828.0,  electronAffinity:78.6,  crustAbundance:1.25,   discoveryYear:1783, discoverer:"Juan José & Fausto Elhuyar", description:"Elemento con il più alto punto di fusione (3695 K) di tutti i metalli puri. Il filamento delle lampade a incandescenza (W) sfrutta questa proprietà; i carburi WC (durezza 9,5 Mohs) dominano l'industria degli utensili da taglio e delle piastre antiusura." },
  { z:75,  config:"[Xe] 4f¹⁴ 5d⁵ 6s²",    block:"d", state:"solid",     electronegativity:1.90, atomicRadius:217, ionizationEnergy:760.0,  density:21.02,  meltingPoint:3459.0, boilingPoint:5869.0,  electronAffinity:14.5,  crustAbundance:7e-4,   discoveryYear:1925, discoverer:"Walter Noddack / Ida Tacke / Otto Berg", description:"Metallo refrattario con densità tra le più elevate (21 g/cm³). Il Re è aggiunto alle superleghe Ni (5–6%) per mantenere la stabilità microsstrutturale nelle pale dei motori a reazione ad alte temperature; catalizzatori Re-Pt/Al₂O₃ sono usati nel reforming catalitico della benzina." },
  { z:76,  config:"[Xe] 4f¹⁴ 5d⁶ 6s²",    block:"d", state:"solid",     electronegativity:2.20, atomicRadius:216, ionizationEnergy:840.0,  density:22.59,  meltingPoint:3306.0, boilingPoint:5285.0,  electronAffinity:106.1, crustAbundance:1.5e-3, discoveryYear:1804, discoverer:"Smithson Tennant",        description:"Elemento più denso di qualsiasi altro (22,59 g/cm³), due volte più del piombo. Il tetraossido OsO₄ è agente di colorazione in microscopia elettronica (osmiofilico); l'osmio è il metallo più duro del gruppo del platino e viene legato all'iridio per punte di penne stilografiche." },
  { z:77,  config:"[Xe] 4f¹⁴ 5d⁷ 6s²",    block:"d", state:"solid",     electronegativity:2.20, atomicRadius:202, ionizationEnergy:880.0,  density:22.56,  meltingPoint:2719.0, boilingPoint:4701.0,  electronAffinity:151.0, crustAbundance:1e-3,   discoveryYear:1803, discoverer:"Smithson Tennant",        description:"Metallo del platino con la più alta resistenza alla corrosione di qualsiasi elemento. Il limite K/Pg (65 Ma) è arricchito di Ir per l'evento di impatto meteoritico; i complessi Ir(III)-ppy sono fotoemettitori fosforescentl OLED ad alta efficienza quantistica (ηPL > 0,95)." },
  { z:78,  config:"[Xe] 4f¹⁴ 5d⁹ 6s¹",    block:"d", state:"solid",     electronegativity:2.28, atomicRadius:209, ionizationEnergy:870.4,  density:21.45,  meltingPoint:2041.4, boilingPoint:4098.0,  electronAffinity:205.3, crustAbundance:0.005,  discoveryYear:null, discoverer:"Antichità",               description:"Metallo nobile con configurazione anomala [Xe] 4f¹⁴ 5d⁹ 6s¹. Catalizzatore essenziale per marmitta catalitica (ossidazione CO, HC e riduzione NOₓ); il cisplatino (cis-[Pt(NH₃)₂Cl₂]) è chemioterapico antitumorale tra i più usati al mondo (testicolare, ovarico, polmonare)." },
  { z:79,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s¹",   block:"d", state:"solid",     electronegativity:2.54, atomicRadius:166, ionizationEnergy:890.1,  density:19.32,  meltingPoint:1337.3, boilingPoint:3129.0,  electronAffinity:222.8, crustAbundance:0.004,  discoveryYear:null, discoverer:"Antichità",               description:"Metallo nobile con configurazione [Xe] 4f¹⁴ 5d¹⁰ 6s¹; l'effetto relativistico contrae il 6s rendendolo energeticamente stabile. Il colore giallo è causato dall'assorbimento di fotoni blu per transizione 5d→6sp interbanda; usato come standard monetario internazionale (gold standard) fino al 1971." },
  { z:80,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s²",   block:"d", state:"liquid",    electronegativity:2.00, atomicRadius:209, ionizationEnergy:1007.1, density:13.534, meltingPoint:234.3,  boilingPoint:630.0,   electronAffinity:-48,   crustAbundance:0.085,  discoveryYear:null, discoverer:"Antichità",               description:"Unico metallo liquido a temperatura ambiente; la contrazione relativistica del 6s stabilizza il Hg²⁺ e abbassa il punto di fusione. Il vapore di mercurio emette l'intensa riga a 253,7 nm (UV) nelle lampade germicide; altamente neurotossico per bioaccumulo nei tessuti nervosi." },
  { z:81,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", block:"p", state:"solid",  electronegativity:1.62, atomicRadius:196, ionizationEnergy:589.4,  density:11.85,  meltingPoint:577.0,  boilingPoint:1746.0,  electronAffinity:19.2,  crustAbundance:0.85,   discoveryYear:1861, discoverer:"William Crookes",         description:"Metallo post-transizione tossico; il Tl⁺ ha raggio ionico simile al K⁺ interferendo con la pompa sodio-potassio. Il solfuro Tl₂S e il seleniuro TlSe sono fotoconduttori per imaging a infrarosso; i rivelatori NaI(Tl) sono gli scintillatori gamma più usati in medicina nucleare." },
  { z:82,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", block:"p", state:"solid",  electronegativity:2.33, atomicRadius:202, ionizationEnergy:715.6,  density:11.34,  meltingPoint:600.6,  boilingPoint:2022.0,  electronAffinity:35.1,  crustAbundance:14,     discoveryYear:null, discoverer:"Antichità",               description:"Metallo post-transizione con gli isotopi radiogenici più utilizzati in geochimica (²⁰⁶Pb, ²⁰⁷Pb, ²⁰⁸Pb da U e Th). La produzione dell'acido solfurico da piombo tetrarile (piombo tetraetile, antidetonante) è stata proibita per neurotossicità; la lastra di piombo assorbe radiazioni γ grazie all'alta Z." },
  { z:83,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", block:"p", state:"solid",  electronegativity:2.02, atomicRadius:207, ionizationEnergy:703.0,  density:9.747,  meltingPoint:544.6,  boilingPoint:1837.0,  electronAffinity:91.2,  crustAbundance:0.009,  discoveryYear:null, discoverer:"Antichità",               description:"Metallo post-transizione più pesante con isotopi quasi-stabili (²⁰⁹Bi, T½ = 2×10¹⁹ a). Praticamente non tossico tra i metalli pesanti; il subsalicilato di bismuto è antiacido (Pepto-Bismol); il Bi₂Te₃ è il principale termoelettrico per la refrigerazione a effetto Peltier a bassa temperatura." },
  { z:84,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", block:"p", state:"solid",  electronegativity:2.00, atomicRadius:197, ionizationEnergy:812.1,  density:9.320,  meltingPoint:527.0,  boilingPoint:1235.0,  electronAffinity:183.3, crustAbundance:2e-10,  discoveryYear:1898, discoverer:"Marie & Pierre Curie",    description:"Primo elemento scoperto da Marie Curie (1898). Altamente radioattivo (²¹⁰Po, T½ = 138,4 d, emettitore α puro); i livelli di Po nell'atmosfera dipendono dal decadimento del ²²²Rn; il ²¹⁰Po è il principale contribuente alla dose da fumo di tabacco." },
  { z:85,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", block:"p", state:"solid",  electronegativity:2.20, atomicRadius:202, ionizationEnergy:920.0,  density:null,   meltingPoint:575.0,  boilingPoint:610.0,   electronAffinity:270.1, crustAbundance:3e-10,  discoveryYear:1940, discoverer:"Dale Corson / Kenneth Ross MacKenzie / Emilio Segrè", description:"Alogeno più raro della crosta terrestre (< 1 g totale); tutti gli isotopi sono radioattivi. L'²¹¹At (T½ = 7,21 h) è promettente in radioterapia α-targeted per tumori; la sua chimica è intermedia tra quella degli alogeni e dei metalli post-transizione." },
  { z:86,  config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", block:"p", state:"gas",   electronegativity:null, atomicRadius:220, ionizationEnergy:1037.0, density:9.7300, meltingPoint:202.0,  boilingPoint:211.5,   electronAffinity:-68,   crustAbundance:4e-13,  discoveryYear:1900, discoverer:"Friedrich Ernst Dorn",    description:"Gas nobile radioattivo; principale prodotto del decadimento del ²²⁶Ra. Il ²²²Rn (T½ = 3,8 d) si accumula negli edifici a contatto con suoli granitici costituendo il secondo fattore di rischio polmonare dopo il fumo; il radon è utilizzato come precursore del tracciante ²¹⁸Po in studi di trasporto atmosferico." },
  { z:87,  config:"[Rn] 7s¹",             block:"s", state:"solid",     electronegativity:0.70, atomicRadius:348, ionizationEnergy:380.0,  density:null,   meltingPoint:300.0,  boilingPoint:950.0,   electronAffinity:47,    crustAbundance:1e-18,  discoveryYear:1939, discoverer:"Marguerite Perey",        description:"Metallo alcalino con la più bassa elettronegatività conosciuta (0,70); altamente radioattivo (²²³Fr, T½ = 21,8 min). Esiste solo in tracce come prodotto del decadimento dell'actinio-227; di interesse teorico per la chimica dei superpesanti nella tavola periodica." },
  { z:88,  config:"[Rn] 7s²",             block:"s", state:"solid",     electronegativity:0.89, atomicRadius:283, ionizationEnergy:509.3,  density:5.000,  meltingPoint:973.0,  boilingPoint:1413.0,  electronAffinity:10.0,  crustAbundance:9e-7,   discoveryYear:1898, discoverer:"Marie & Pierre Curie",    description:"Metallo alcalino-terroso radioattivo scoperto da Marie e Pierre Curie. Il ²²⁶Ra (T½ = 1600 a, emettitore α) era usato in radioterapia prima della disponibilità del ⁶⁰Co; il ²²³Ra (Xofigo®) è approvato FDA per il trattamento delle metastasi ossee da carcinoma prostatico." },
  { z:89,  config:"[Rn] 6d¹ 7s²",         block:"f", state:"solid",     electronegativity:1.10, atomicRadius:260, ionizationEnergy:499.0,  density:10.07,  meltingPoint:1323.0, boilingPoint:3471.0,  electronAffinity:33,    crustAbundance:5.5e-10, discoveryYear:1899, discoverer:"André-Louis Debierne",   description:"Elemento radioattivo capostipite della serie degli attinidi. Tutti gli isotopi sono radioattivi; l'²²⁷Ac (T½ = 21,8 a, β/γ) è prodotto nei reattori neutronici per produzione di ²²⁵Ac, radionuclide terapeutico in radioterapia locoregionale targeted dei tumori neuroendocrini." },
  { z:90,  config:"[Rn] 6d² 7s²",         block:"f", state:"solid",     electronegativity:1.30, atomicRadius:237, ionizationEnergy:587.0,  density:11.72,  meltingPoint:2115.0, boilingPoint:5061.0,  electronAffinity:null,  crustAbundance:9.6,    discoveryYear:1828, discoverer:"Jöns Jacob Berzelius",    description:"Actinide fertile (non fissile) con abbondanza in crosta simile al piombo. Il ²³²Th si converte in ²³³U per cattura neutronica (ciclo del torio); i reattori al torio fuso (TMSR) promettono maggiore sicurezza intrinseca e minor produzione di attinidi minori rispetto al ciclo uranio-plutonio." },
  { z:91,  config:"[Rn] 5f² 6d¹ 7s²",     block:"f", state:"solid",     electronegativity:1.50, atomicRadius:243, ionizationEnergy:568.0,  density:15.37,  meltingPoint:1841.0, boilingPoint:4300.0,  electronAffinity:null,  crustAbundance:1.4e-6, discoveryYear:1917, discoverer:"Lise Meitner / Otto Hahn", description:"Actinide raro e tossico; il ²³¹Pa (T½ = 32.760 a, α) è precursore del ciclo del torio. Presente in tracce nell'uranio naturale come prodotto del ²³⁵U; il rapporto ²³¹Pa/²³⁰Th è usato come orologio geochimico oceanico per la circolazione termoalina." },
  { z:92,  config:"[Rn] 5f³ 6d¹ 7s²",     block:"f", state:"solid",     electronegativity:1.38, atomicRadius:240, ionizationEnergy:597.6,  density:18.95,  meltingPoint:1405.3, boilingPoint:4404.0,  electronAffinity:14,    crustAbundance:2.7,    discoveryYear:1789, discoverer:"Martin Heinrich Klaproth", description:"Attinide fissile (²³⁵U, 0,72%) e fertile (²³⁸U, 99,27%); combustibile dei reattori nucleari. La fissione indotta del ²³⁵U libera ≈ 200 MeV/atomo; il decadimento radioattivo di U e Th nel mantello è responsabile di circa il 50% del flusso di calore geotermico terrestre." },
  { z:93,  config:"[Rn] 5f⁴ 6d¹ 7s²",     block:"f", state:"solid",     electronegativity:1.36, atomicRadius:221, ionizationEnergy:604.5,  density:20.25,  meltingPoint:912.0,  boilingPoint:4175.0,  electronAffinity:null,  crustAbundance:null,   discoveryYear:1940, discoverer:"Edwin McMillan / Philip Abelson", description:"Primo elemento transuranico sintetizzato (1940, Berkeley). Il ²³⁷Np (T½ = 2,14 Ma) è prodotto nei reattori ad alta fluenza neutronica da ²³⁸U; precursore del ²³³U nel ciclo del torio; la sua abbondanza nei rifiuti nucleari ne complica il trattamento a lungo termine." },
  { z:94,  config:"[Rn] 5f⁶ 7s²",         block:"f", state:"solid",     electronegativity:1.28, atomicRadius:243, ionizationEnergy:584.7,  density:19.84,  meltingPoint:912.5,  boilingPoint:3505.0,  electronAffinity:null,  crustAbundance:null,   discoveryYear:1940, discoverer:"Glenn Seaborg et al.",    description:"Actinide fissile chiave nelle armi nucleari e nei reattori nucleari. Il ²³⁹Pu (T½ = 24.110 a, fissile) è prodotto da ²³⁸U nei reattori; il ²³⁸Pu (T½ = 87,7 a, α puro) alimenta i generatori termoelettrici a radioisotopi (RTG) delle sonde spaziali Voyager e Cassini." },
  { z:95,  config:"[Rn] 5f⁷ 7s²",         block:"f", state:"solid",     electronegativity:1.30, atomicRadius:244, ionizationEnergy:578.0,  density:13.67,  meltingPoint:1449.0, boilingPoint:2880.0,  electronAffinity:null,  crustAbundance:null,   discoveryYear:1944, discoverer:"Glenn Seaborg et al.",    description:"Actinide con configurazione 5f⁷ semi-piena (stabilità di spin massima). L'²⁴¹Am (T½ = 432,2 a) è la sorgente alfa-gamma nei rivelatori di fumo ionici; l'²⁴³Am è precursore del ²⁴²Cm e ²⁴⁴Cm usati come sorgenti compatte di neutroni in analisi chimiche in loco." },
  { z:96,  config:"[Rn] 5f⁷ 6d¹ 7s²",     block:"f", state:"solid",     electronegativity:1.30, atomicRadius:245, ionizationEnergy:581.0,  density:13.51,  meltingPoint:1613.0, boilingPoint:3383.0,  electronAffinity:null,  crustAbundance:null,   discoveryYear:1944, discoverer:"Glenn Seaborg et al.",    description:"Actinide radioattivo intenzamente luminescente nel buio (α intenso). Il ²⁴⁴Cm (T½ = 18,1 a) è sorgente nei generatori RTG (2,8 W/g di potenza termica); il ²⁴²Cm è precursore del ²⁴²Pu nelle trasmutazioni nucleari dei rifiuti radioattivi; scoperto nel 1944 ma annunciato solo nel 1947." },
  { z:97,  config:"[Rn] 5f⁹ 7s²",         block:"f", state:"solid",     electronegativity:1.30, atomicRadius:244, ionizationEnergy:601.0,  density:14.78,  meltingPoint:1259.0, boilingPoint:2900.0,  electronAffinity:null,  crustAbundance:null,   discoveryYear:1949, discoverer:"Stanley Thompson et al.", description:"Actinide transuranico sintetizzato per la prima volta al ciclotrone di Berkeley irradiando ²⁴¹Am con particelle α. Tutti gli isotopi sono radioattivi; ²⁴⁹Bk (T½ = 330 d) è il precursore usato per sintetizzare il californio; ha esclusiva rilevanza scientifica nel completamento della serie degli attinidi." },
  { z:98,  config:"[Rn] 5f¹⁰ 7s²",        block:"f", state:"solid",     electronegativity:1.30, atomicRadius:245, ionizationEnergy:608.0,  density:15.10,  meltingPoint:1173.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1950, discoverer:"Stanley Thompson et al.", description:"Actinide transuranico; il ²⁵²Cf (T½ = 2,645 a) è la più intensa sorgente di neutroni portatile artificialmente prodotta (2,3×10¹² n/s per μg). Usato nel trattamento del cancro cervicale con brachiterapia; applicazioni in analisi per attivazione neutronica e avviamento di reattori nucleari." },
  { z:99,  config:"[Rn] 5f¹¹ 7s²",        block:"f", state:"solid",     electronegativity:1.30, atomicRadius:245, ionizationEnergy:619.0,  density:null,   meltingPoint:1133.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1952, discoverer:"Los Alamos / Argonne / Oak Ridge teams", description:"Scoperto nei detriti del test termonucleare 'Ivy Mike' (1952) analizzando le ceneri radioattive raccolte in volo. Prodotto in quantità molto limitate per bombardamento neutronico multiplo di ²³⁸U in reattori ad alta fluenza; ha utilità esclusivamente scientifica nella fisica nucleare." },
  { z:100, config:"[Rn] 5f¹² 7s²",        block:"f", state:"solid",     electronegativity:1.30, atomicRadius:245, ionizationEnergy:627.0,  density:null,   meltingPoint:1800.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1952, discoverer:"Los Alamos team",         description:"Actinide sintetizzato con il fisico Enrico Fermi nel nome. Prodotto anche esso nei test nucleari del 1952; la sintesi in laboratorio richiede irraggiamento prolungato di ²³⁹Pu o ²⁴²Cm; viene prodotto in quantità dell'ordine dei picogrammi e studiato per le proprietà chimiche degli ultimi attinidi." },
  { z:101, config:"[Rn] 5f¹³ 7s²",        block:"f", state:"solid",     electronegativity:1.30, atomicRadius:246, ionizationEnergy:635.0,  density:null,   meltingPoint:1100.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1955, discoverer:"Gregory Choppin et al.",  description:"Primo elemento sintetizzato un atomo alla volta (1955, Lawrence Berkeley). Il ²⁵⁶Md (T½ = 78,1 min) decade per fissione spontanea; la chimica del Md³⁺/Md²⁺ in soluzione è oggetto di ricerca per comprendere le irregolarità degli attinidi tardi." },
  { z:102, config:"[Rn] 5f¹⁴ 7s²",        block:"f", state:"solid",     electronegativity:1.30, atomicRadius:246, ionizationEnergy:642.0,  density:null,   meltingPoint:1100.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1958, discoverer:"Albert Ghiorso et al.",   description:"Attinide con subguscio 5f completamente pieno; il No²⁺ è notevolmente stabile rispetto agli altri attinidi pesanti (configurazione 5f¹⁴ favorevole). Il ²⁵⁴No (T½ = 51 s) è prodotto per fusione di ²⁴⁸Cm con ¹²C; la chimica di soluzione è studiata per separazione degli attinidi nei rifiuti nucleari." },
  { z:103, config:"[Rn] 5f¹⁴ 7s² 7p¹",    block:"d", state:"solid",     electronegativity:null, atomicRadius:246, ionizationEnergy:470.0,  density:null,   meltingPoint:1900.0, boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1961, discoverer:"Albert Ghiorso et al.",   description:"Ultimo degli attinidi e primo dei transattinidi superpesanti; il ²⁶²Lr (T½ = 3,6 h) è l'isotopo più stabile. La configurazione fondamentale è oggetto di dibattito ([Rn] 5f¹⁴ 7s² 7p¹ vs [Rn] 5f¹⁴ 6d¹ 7s²); calcolata tramite metodi relativistici Dirac-Fock." },
  { z:104, config:"[Rn] 5f¹⁴ 6d² 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:580.0,  density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1966, discoverer:"Dubna team / Berkeley team", description:"Primo elemento superpesante (transattinide); omolgo del Hf nel gruppo 4. I calcoli relativistici prevedono significative deviazioni dal comportamento di Hf e Zr per effetti di contrazione relativistica dei gusci 6d/7s; sintetizzato per fusione di ²⁴⁹Cf con ¹²C." },
  { z:105, config:"[Rn] 5f¹⁴ 6d³ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1970, discoverer:"Dubna team / Berkeley team", description:"Transattinide del gruppo 5, omolgo del Ta. Esperimenti in fase acquosa dimostrano il comportamento simile a Nb e Ta (formazione di DbOF₅²⁻); il ²⁶⁸Db (T½ = 16 h) consente studi di chimica in soluzione su singolo atomo; prodotto per fusione di ²⁴⁹Cf con ¹⁵N." },
  { z:106, config:"[Rn] 5f¹⁴ 6d⁴ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1974, discoverer:"Dubna team / Berkeley team", description:"Transattinide del gruppo 6, omolgo del Mo e W. Il ²⁶⁹Sg volatilizza come SgO₂Cl₂ in modo analogo al WO₂Cl₂, confermando le previsioni relativistiche; sintetizzato per fusione di ²⁴⁹Cf con ¹⁸O." },
  { z:107, config:"[Rn] 5f¹⁴ 6d⁵ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1981, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 7, omolgo del Re. Il ²⁷⁰Bh forma BhO₃Cl volatile in condizioni ossidanti, analogamente al ReO₃Cl; la produzione avviene per fusione di ²⁰⁹Bi con ⁵⁴Cr alla GSI di Darmstadt." },
  { z:108, config:"[Rn] 5f¹⁴ 6d⁶ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1984, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 8, omolgo dell'Os. Previsto tra i metalli più densi se disponibile in quantità macroscopica (ρ calcolata ≈ 40 g/cm³); sintetizzato dalla fusione di ²⁰⁸Pb con ⁵⁸Fe alla GSI; il ²⁶⁹Hs volatilizza come HsO₄ tetraossido." },
  { z:109, config:"[Rn] 5f¹⁴ 6d⁷ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1982, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 9, omolgo dell'Ir. Sintetizzato dalla fusione di ²⁰⁹Bi con ⁵⁸Fe; il ²⁷⁸Mt (T½ ≈ 7,6 s) decade per fissione spontanea o emissione α; la chimica è sconosciuta per la brevità di vita degli isotopi disponibili." },
  { z:110, config:"[Rn] 5f¹⁴ 6d⁸ 7s²",    block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1994, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 10, omolgo del Pt. I calcoli relativistici prevedono configurazione fondamentale 6d⁸ 7s² con possibile preferenza per la forma Ds²⁺; prodotto per fusione di ²⁰⁸Pb con ⁶²Ni; T½ ≈ 11 s per il ²⁸¹Ds." },
  { z:111, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s¹",   block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1994, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 11, omolgo dell'Au. La configurazione anomala 6d¹⁰ 7s¹ è analoga a quella dell'Au (5d¹⁰ 6s¹); gli effetti relativistici sono estremamente pronunciati e potrebbero conferirgli proprietà metalliche inusuali; ²⁸¹Rg (T½ ≈ 26 s)." },
  { z:112, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s²",   block:"d", state:"solid",     electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1996, discoverer:"Gesellschaft für Schwerionenforschung (GSI)", description:"Transattinide del gruppo 12, omolgo dello Hg. Gli effetti relativistici sulla coppia 7s² lo renderebbero probabilmente un gas nobile metallico a temperatura ambiente (Tm ≈ 10°C secondo calcoli DFT); copernicio è stato il primo superpesante con nome IUPAC approvato; ²⁸⁵Cn (T½ ≈ 29 s)." },
  { z:113, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:2004, discoverer:"RIKEN (Giappone)",        description:"Primo elemento sintetizzato in Asia (RIKEN, 2004); il nome 'nihonium' richiama il Giappone (Nihon). Scoperto per fusione di ²⁰⁹Bi con ⁷⁰Zn; solo tre eventi di sintesi in oltre 9 anni di irraggiamento prima della conferma IUPAC nel 2016; ²⁸⁶Nh (T½ ≈ 9,5 s)." },
  { z:114, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:1999, discoverer:"JINR/LLNL",               description:"Omolgo del Pb nel gruppo 14; previsto nell'isola di stabilità relativa (Z=114, N=184). Il ²⁸⁹Fl (T½ ≈ 2,6 s) è relativamente longevo rispetto agli elementi vicini; gli effetti relativistici potrebbero renderlo un gas nobile metallico; sintetizzato per fusione di ²⁴⁴Pu con ⁴⁸Ca." },
  { z:115, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:2003, discoverer:"JINR/LLNL",               description:"Omolgo del Bi nel gruppo 15; prodotto per fusione di ²⁴³Am con ⁴⁸Ca. Il ²⁸⁸Mc (T½ ≈ 173 ms) decade per emissione α verso il ²⁸⁴Nh; le proprietà chimiche sono attese intermedie tra Bi e i gas nobili metallici; confermato IUPAC nel 2016 con il nome moscovio." },
  { z:116, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:2000, discoverer:"JINR/LLNL",               description:"Omolgo del Po nel gruppo 16; prodotto per fusione di ²⁴⁸Cm con ⁴⁸Ca. Il ²⁹³Lv (T½ ≈ 61 ms) è l'isotopo più longevo; gli effetti relativistici potrebbero rendere Lv un semimetallo; il nome 'livermorio' onora il Lawrence Livermore National Laboratory." },
  { z:117, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:2010, discoverer:"JINR/ORNL",               description:"Alogeno più pesante conosciuto; omolgo dell'At nel gruppo 17. Sintetizzato nel 2010 per fusione di ²⁴⁹Bk con ⁴⁸Ca; il berchelio-249 usato come bersaglio era stato prodotto in 250 giorni nel reattore ad alto flusso neutronico (HFIR) dell'ORNL; ²⁹⁴Ts (T½ ≈ 51 ms)." },
  { z:118, config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", block:"p", state:"solid",  electronegativity:null, atomicRadius:null, ionizationEnergy:null,   density:null,   meltingPoint:null,   boilingPoint:null,    electronAffinity:null,  crustAbundance:null,   discoveryYear:2002, discoverer:"JINR/LLNL",               description:"Elemento più pesante sintetizzato; omolgo del Rn nel gruppo 18 (gas nobili). Nonostante la configurazione di gas nobile, i calcoli relativistici prevedono reattività non nulla e probabile stato solido; prodotto per fusione di ²⁴⁹Cf con ⁴⁸Ca; ²⁹⁴Og (T½ ≈ 0,9 ms), confermato IUPAC nel 2016." },
];

// ─── Oxidation states lookup [states[], commonOxidation] ─────────────────────
// Sources: IUPAC Red Book 2005, CRC Handbook 103rd ed., WebElements.
// Synthetic/transactinide values are predicted from periodic trends.
const OX: Record<number, [number[], number | null]> = {
    1: [[-1, 1],          1],   // H
    2: [[],            null],   // He
    3: [[1],              1],   // Li
    4: [[2],              2],   // Be
    5: [[3],              3],   // B
    6: [[-4, 2, 4],       4],   // C
    7: [[-3, 3, 5],      -3],   // N
    8: [[-2, -1],        -2],   // O
    9: [[-1],            -1],   // F
   10: [[],            null],   // Ne
   11: [[1],              1],   // Na
   12: [[2],              2],   // Mg
   13: [[3],              3],   // Al
   14: [[-4, 4],          4],   // Si
   15: [[-3, 3, 5],       5],   // P
   16: [[-2, 4, 6],      -2],   // S
   17: [[-1, 1, 3, 5, 7],-1],   // Cl
   18: [[],            null],   // Ar
   19: [[1],              1],   // K
   20: [[2],              2],   // Ca
   21: [[3],              3],   // Sc
   22: [[2, 3, 4],        4],   // Ti
   23: [[2, 3, 4, 5],     5],   // V
   24: [[2, 3, 6],        3],   // Cr
   25: [[2, 4, 7],        2],   // Mn
   26: [[2, 3],           3],   // Fe
   27: [[2, 3],           2],   // Co
   28: [[2, 3],           2],   // Ni
   29: [[1, 2],           2],   // Cu
   30: [[2],              2],   // Zn
   31: [[3],              3],   // Ga
   32: [[2, 4],           4],   // Ge
   33: [[-3, 3, 5],       3],   // As
   34: [[-2, 4, 6],      -2],   // Se
   35: [[-1, 1, 3, 5],   -1],   // Br
   36: [[2],           null],   // Kr (KrF2 only)
   37: [[1],              1],   // Rb
   38: [[2],              2],   // Sr
   39: [[3],              3],   // Y
   40: [[4],              4],   // Zr
   41: [[3, 5],           5],   // Nb
   42: [[4, 6],           6],   // Mo
   43: [[4, 7],           7],   // Tc
   44: [[3, 4],           4],   // Ru
   45: [[3],              3],   // Rh
   46: [[2, 4],           2],   // Pd
   47: [[1],              1],   // Ag
   48: [[2],              2],   // Cd
   49: [[3],              3],   // In
   50: [[2, 4],           4],   // Sn
   51: [[-3, 3, 5],       3],   // Sb
   52: [[-2, 4, 6],      -2],   // Te
   53: [[-1, 1, 5, 7],   -1],   // I
   54: [[2, 4, 6],     null],   // Xe
   55: [[1],              1],   // Cs
   56: [[2],              2],   // Ba
   57: [[3],              3],   // La
   58: [[3, 4],           3],   // Ce
   59: [[3, 4],           3],   // Pr
   60: [[3],              3],   // Nd
   61: [[3],              3],   // Pm
   62: [[2, 3],           3],   // Sm
   63: [[2, 3],           3],   // Eu
   64: [[3],              3],   // Gd
   65: [[3, 4],           3],   // Tb
   66: [[3],              3],   // Dy
   67: [[3],              3],   // Ho
   68: [[3],              3],   // Er
   69: [[3],              3],   // Tm
   70: [[2, 3],           3],   // Yb
   71: [[3],              3],   // Lu
   72: [[4],              4],   // Hf
   73: [[5],              5],   // Ta
   74: [[4, 6],           6],   // W
   75: [[4, 7],           7],   // Re
   76: [[4, 8],           4],   // Os
   77: [[3, 4],           3],   // Ir
   78: [[2, 4],           2],   // Pt
   79: [[1, 3],           3],   // Au
   80: [[1, 2],           2],   // Hg
   81: [[1, 3],           1],   // Tl
   82: [[2, 4],           2],   // Pb
   83: [[3, 5],           3],   // Bi
   84: [[2, 4],           4],   // Po
   85: [[-1, 1, 3, 5],   -1],   // At
   86: [[2],           null],   // Rn
   87: [[1],              1],   // Fr
   88: [[2],              2],   // Ra
   89: [[3],              3],   // Ac
   90: [[4],              4],   // Th
   91: [[5],              5],   // Pa
   92: [[3, 4, 5, 6],     6],   // U
   93: [[3, 4, 5, 6],     5],   // Np
   94: [[3, 4, 5, 6],     4],   // Pu
   95: [[3, 4, 5, 6],     3],   // Am
   96: [[3],              3],   // Cm
   97: [[3, 4],           3],   // Bk
   98: [[3],              3],   // Cf
   99: [[3],              3],   // Es
  100: [[3],              3],   // Fm
  101: [[2, 3],           3],   // Md
  102: [[2, 3],           2],   // No
  103: [[3],              3],   // Lr
  104: [[4],              4],   // Rf
  105: [[5],              5],   // Db
  106: [[6],              6],   // Sg
  107: [[7],              7],   // Bh
  108: [[8],              8],   // Hs
  109: [[],            null],   // Mt
  110: [[],            null],   // Ds
  111: [[],            null],   // Rg
  112: [[2],              2],   // Cn (predicted)
  113: [[1, 3],           1],   // Nh (predicted)
  114: [[2],              2],   // Fl (predicted)
  115: [[1, 3],           1],   // Mc (predicted)
  116: [[2, 4],           2],   // Lv (predicted)
  117: [[-1, 1, 3, 5], null],   // Ts (predicted)
  118: [[0, 2, 4],     null],   // Og (predicted)
};

// ─── Isotopes lookup: [massNumber, abundance%, name?][] ───────────────────────
// Sources: IUPAC 2021 atomic weights, NUBASE2020. Abundance in %; null = trace/radioactive.
// Only natural elements with meaningful natural abundance are listed.
// Monoisotopic: single entry at 100%. Synthetic (Z 43,61,84-89,93-118): absent (→ []).
const ISO: Record<number, [number, number | null, string?][]> = {
  1:  [[1, 99.985, "prozio"], [2, 0.015, "deuterio"], [3, null, "trizio"]],
  2:  [[4, 99.9998], [3, 0.0002]],
  3:  [[7, 92.5], [6, 7.5]],
  4:  [[9, 100]],
  5:  [[11, 80.1], [10, 19.9]],
  6:  [[12, 98.93], [13, 1.07], [14, null, "carbonio-14"]],
  7:  [[14, 99.64], [15, 0.36]],
  8:  [[16, 99.76], [18, 0.20], [17, 0.04]],
  9:  [[19, 100]],
  10: [[20, 90.48], [22, 9.25], [21, 0.27]],
  11: [[23, 100]],
  12: [[24, 78.99], [26, 11.01], [25, 10.00]],
  13: [[27, 100]],
  14: [[28, 92.23], [29, 4.67], [30, 3.10]],
  15: [[31, 100]],
  16: [[32, 94.99], [34, 4.25], [33, 0.75]],
  17: [[35, 75.77], [37, 24.23]],
  18: [[40, 99.60], [36, 0.34], [38, 0.06]],
  19: [[39, 93.26], [41, 6.73], [40, 0.01, "potassio-40"]],
  20: [[40, 96.94], [44, 2.09], [42, 0.65]],
  21: [[45, 100]],
  22: [[48, 73.72], [46, 8.25], [47, 7.44]],
  23: [[51, 99.75], [50, 0.25]],
  24: [[52, 83.79], [53, 9.50], [50, 4.35]],
  25: [[55, 100]],
  26: [[56, 91.75], [54, 5.85], [57, 2.12]],
  27: [[59, 100]],
  28: [[58, 68.08], [60, 26.22], [62, 3.63]],
  29: [[63, 69.15], [65, 30.85]],
  30: [[64, 48.60], [66, 27.90], [68, 18.75]],
  31: [[69, 60.11], [71, 39.89]],
  32: [[74, 36.73], [72, 27.54], [70, 20.57]],
  33: [[75, 100]],
  34: [[80, 49.61], [78, 23.77], [76, 9.37]],
  35: [[79, 50.69], [81, 49.31]],
  36: [[84, 56.99], [86, 17.28], [82, 11.58]],
  37: [[85, 72.17], [87, 27.83]],
  38: [[88, 82.58], [86, 9.86], [87, 7.00]],
  39: [[89, 100]],
  40: [[90, 51.45], [94, 17.38], [92, 17.15]],
  41: [[93, 100]],
  42: [[98, 24.39], [96, 16.67], [95, 15.84]],
  // 43: Tc — no stable natural isotopes
  44: [[102, 31.55], [104, 18.62], [101, 17.06]],
  45: [[103, 100]],
  46: [[106, 27.33], [108, 26.46], [105, 22.33]],
  47: [[107, 51.84], [109, 48.16]],
  48: [[114, 28.73], [112, 24.13], [111, 12.80]],
  49: [[115, 95.71], [113, 4.29]],
  50: [[120, 32.58], [118, 24.22], [116, 14.54]],
  51: [[121, 57.21], [123, 42.79]],
  52: [[130, 34.49], [128, 31.74], [126, 18.84]],
  53: [[127, 100]],
  54: [[132, 26.89], [129, 26.44], [131, 21.18]],
  55: [[133, 100]],
  56: [[138, 71.70], [137, 11.23], [136, 7.85]],
  57: [[139, 99.91], [138, 0.09]],
  58: [[140, 88.45], [142, 11.11], [138, 0.25]],
  59: [[141, 100]],
  60: [[142, 27.20], [144, 23.80], [146, 17.19]],
  // 61: Pm — no stable natural isotopes
  62: [[152, 26.75], [154, 22.75], [147, 14.99]],
  63: [[153, 52.19], [151, 47.81]],
  64: [[158, 24.84], [160, 21.86], [156, 20.47]],
  65: [[159, 100]],
  66: [[164, 28.18], [162, 25.48], [163, 24.90]],
  67: [[165, 100]],
  68: [[166, 33.61], [168, 26.78], [170, 14.93]],
  69: [[169, 100]],
  70: [[174, 31.83], [172, 21.68], [173, 16.10]],
  71: [[175, 97.40], [176, 2.60]],
  72: [[180, 35.08], [178, 27.28], [177, 18.60]],
  73: [[181, 99.99], [180, 0.01]],
  74: [[184, 30.64], [186, 28.43], [182, 26.50]],
  75: [[187, 62.60], [185, 37.40]],
  76: [[192, 40.93], [190, 26.26], [188, 13.24]],
  77: [[193, 62.70], [191, 37.30]],
  78: [[195, 33.83], [194, 32.97], [196, 25.24]],
  79: [[197, 100]],
  80: [[202, 29.86], [200, 23.10], [198, 10.02]],
  81: [[205, 70.48], [203, 29.52]],
  82: [[208, 52.40], [206, 24.10], [207, 22.10]],
  83: [[209, 100]],
  // 84–89: Po, At, Rn, Fr, Ra, Ac — trace/radioactive, no significant natural abundance
  90: [[232, 100]],
  91: [[231, 100]],
  92: [[238, 99.27], [235, 0.72, "uranio-235"], [234, 0.005]],
  // 93–118: synthetic elements
};

// ─── Covalent radius lookup (pm) — Alvarez 2008 Dalton Trans. ─────────────────
// Single-bond covalent radii. null for elements with no reliable measurement.
const COV: Record<number, number> = {
  1:31,  2:28,  3:128, 4:96,  5:84,  6:77,  7:71,  8:66,  9:57,  10:58,
  11:166,12:141,13:121,14:111,15:107,16:105,17:102,18:106,
  19:203,20:176,21:170,22:160,23:153,24:139,25:161,26:152,27:150,28:124,29:132,30:122,
  31:122,32:122,33:119,34:120,35:120,36:116,
  37:220,38:195,39:190,40:175,41:164,42:154,43:147,44:146,45:142,46:139,47:145,48:144,
  49:142,50:139,51:139,52:138,53:139,54:140,
  55:244,56:215,57:207,58:204,59:203,60:201,61:199,62:198,63:198,64:196,65:194,
  66:192,67:192,68:189,69:190,70:187,71:187,
  72:175,73:170,74:162,75:151,76:144,77:141,78:136,79:136,80:132,
  81:145,82:146,83:148,84:140,85:150,86:150,
  87:260,88:221,89:215,90:206,91:200,92:196,93:190,94:187,95:180,96:169,
  // Bk–Og: no reliable data
};

// ─── Crystal structure lookup ─────────────────────────────────────────────────
// Dominant ambient-conditions structure. null = gas, liquid, synthetic, or unknown.
// Sources: CRC Handbook 103rd ed., WebElements, crystallography.net / ICSD.
// Note: some elements have multiple polymorphs; listed structure is the α-form at STP.
const CRYSTAL: Record<number, CrystalStructure> = {
  // Period 2
  3:"bcc",  4:"hcp",  5:"other",   6:"diamond",
  10:"fcc",
  // Period 3
  11:"bcc", 12:"hcp", 13:"fcc", 14:"diamond", 15:"other", 16:"other",
  18:"fcc",
  // Period 4
  19:"bcc", 20:"fcc", 21:"hcp", 22:"hcp",  23:"bcc",  24:"bcc",  25:"other",
  26:"bcc", 27:"hcp", 28:"fcc", 29:"fcc",  30:"hcp",
  31:"other", 32:"diamond", 33:"other", 34:"other",
  36:"fcc",
  // Period 5
  37:"bcc", 38:"fcc", 39:"hcp", 40:"hcp",  41:"bcc",  42:"bcc",  43:"hcp",
  44:"hcp", 45:"fcc", 46:"fcc", 47:"fcc",  48:"hcp",
  49:"other", 50:"other", 51:"other", 52:"other", 53:"other",
  54:"fcc",
  // Period 6
  55:"bcc", 56:"bcc",
  57:"hcp", 58:"fcc", 59:"hcp", 60:"hcp",  61:"hcp",  62:"other", 63:"bcc",
  64:"hcp", 65:"hcp", 66:"hcp", 67:"hcp",  68:"hcp",  69:"hcp",  70:"fcc", 71:"hcp",
  72:"hcp", 73:"bcc", 74:"bcc", 75:"hcp",  76:"hcp",  77:"fcc",  78:"fcc", 79:"fcc",
  // Hg(80) = liquid at STP → null
  81:"hcp", 82:"fcc", 83:"other", 84:"sc",
  // At(85), Rn(86) → null
  // Period 7
  87:"bcc", 88:"bcc", 89:"fcc", 90:"fcc",
  91:"other", 92:"other", 93:"other", 94:"other",
  95:"hcp",  96:"hcp",  97:"hcp",  98:"hcp",
  // Z=99–118: synthetic/transient → null
};

// ─── Map indexed by Z ─────────────────────────────────────────────────────────
export const EXTENDED: Record<number, ElementExtended> = Object.fromEntries(
  RAW.map(e => {
    const [oxidationStates, commonOxidation] = OX[e.z] ?? [[], null];
    const isotopes: Isotope[] = (ISO[e.z] ?? []).map(([massNumber, abundance, name]) => ({
      massNumber, abundance, ...(name !== undefined ? { name } : {}),
    }));
    const covalentRadius = COV[e.z] ?? null;
    const crystalStructure = CRYSTAL[e.z] ?? null;
    return [e.z, { ...e, oxidationStates, commonOxidation, isotopes, covalentRadius, crystalStructure }];
  })
);

// ─── Thematic property definitions ───────────────────────────────────────────

export type ThematicProperty =
  | "electronegativity"
  | "atomicRadius"
  | "covalentRadius"
  | "ionizationEnergy"
  | "density"
  | "meltingPoint"
  | "boilingPoint"
  | "electronAffinity"
  | "crustAbundance"
  | "state"
  | "block"
  | "none";

export const THEMATIC_PROPERTIES: {
  key: ThematicProperty;
  label: string;
  unit: string;
  description: string;
  logScale?: boolean;
}[] = [
  { key: "none",              label: "Categoria",          unit: "",        description: "Colore per categoria chimica" },
  { key: "electronegativity", label: "Elettronegatività",  unit: "Pauling", description: "Scala di Pauling (0,79 – 3,98)" },
  { key: "atomicRadius",      label: "Raggio atomico",     unit: "pm",      description: "Raggio di van der Waals (pm)" },
  { key: "ionizationEnergy",  label: "Ionizzazione I",     unit: "kJ/mol",  description: "Prima energia di ionizzazione (kJ/mol)" },
  { key: "density",           label: "Densità",            unit: "g/cm³",   description: "Densità a condizioni standard (g/cm³)" },
  { key: "meltingPoint",      label: "Fusione",            unit: "K",       description: "Temperatura di fusione (K)" },
  { key: "boilingPoint",      label: "Ebollizione",        unit: "K",       description: "Temperatura di ebollizione (K)" },
  { key: "electronAffinity",  label: "Affinità e⁻",        unit: "kJ/mol",  description: "Affinità elettronica (kJ/mol; positivo = esotermica)" },
  { key: "crustAbundance",    label: "Abbondanza crosta",  unit: "mg/kg",   description: "Abbondanza nella crosta terrestre (scala logaritmica)", logScale: true },
  { key: "state",             label: "Stato fisico",       unit: "",        description: "Stato a 25°C, 1 atm" },
  { key: "block",             label: "Blocco elettronico", unit: "",        description: "Blocco s, p, d o f della configurazione" },
];

// Discrete palette for state and block views
export const STATE_COLOR: Record<ElementState, string> = {
  solid:     "#3b82f6",
  liquid:    "#ef4444",
  gas:       "#22c55e",
  synthetic: "#a855f7",
};

export const BLOCK_COLOR: Record<ElementBlock, string> = {
  s: "#f97316",
  p: "#22c55e",
  d: "#3b82f6",
  f: "#ec4899",
};
