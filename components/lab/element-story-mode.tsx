"use client";

import { useState, useCallback } from "react";
import type { Locale } from "@/lib/site";

// ─── Story content ────────────────────────────────────────────────────────────

interface StorySlide {
  icon: string;
  titleIT: string;
  titleEN: string;
  textIT: string;
  textEN: string;
  sourceIT?: string;
  sourceEN?: string;
}

interface ElementStory {
  slides: StorySlide[];
}

// MIT CUA = MIT-Harvard Center for Ultracold Atoms (cua.mit.edu)
// Caltech IQIM = Institute for Quantum Information and Matter (iqim.caltech.edu)

const STORIES: Record<number, ElementStory> = {
  // ── Hydrogen Z=1 ──────────────────────────────────────────────────────────
  1: { slides: [
    { icon: "💫", titleIT: "Origine cosmica", titleEN: "Cosmic origin",
      textIT: "L'idrogeno è nato 380.000 anni dopo il Big Bang, quando l'universo si raffredda abbastanza da permettere ai protoni di catturare elettroni. Costituisce il 75% della massa barionica dell'universo.",
      textEN: "Hydrogen formed 380,000 years after the Big Bang, when the universe cooled enough for protons to capture electrons. It makes up 75% of the baryonic mass of the universe." },
    { icon: "⚛️", titleIT: "L'atomo più semplice", titleEN: "The simplest atom",
      textIT: "Un solo protone e un elettrone. Le equazioni di Schrödinger per l'idrogeno sono l'unico sistema atomico risolvibile esattamente: gli orbitali s, p, d, f sono le soluzioni analitiche di questo sistema.",
      textEN: "One proton, one electron. The Schrödinger equation for hydrogen is the only atomic system with an exact analytical solution: s, p, d, f orbitals are those solutions.",
      sourceIT: "Ref: Schrödinger, E. (1926). Annalen der Physik, 384(4), 361–376.",
      sourceEN: "Ref: Schrödinger, E. (1926). Annalen der Physik, 384(4), 361–376." },
    { icon: "🔬", titleIT: "BEC e fisica quantistica", titleEN: "BEC and quantum physics",
      textIT: "Il gruppo di Wolfgang Ketterle al MIT CUA ha ottenuto per la prima volta un condensato di Bose-Einstein con atomi di sodio (1995). L'idrogeno è la guida teorica per capire tutti gli altri elementi.",
      textEN: "Wolfgang Ketterle's group at MIT CUA first achieved Bose-Einstein condensation with sodium atoms (1995). Hydrogen is the theoretical blueprint for understanding all other elements.",
      sourceIT: "Ketterle, W. et al. (1995). Phys. Rev. Lett. 75, 3969.",
      sourceEN: "Ketterle, W. et al. (1995). Phys. Rev. Lett. 75, 3969." },
    { icon: "🌟", titleIT: "Nel tuo corpo", titleEN: "In your body",
      textIT: "Il 60% degli atomi nel corpo umano sono idrogeno. Ogni molecola d'acqua in te è composta per 2/3 da atomi di idrogeno.",
      textEN: "60% of atoms in the human body are hydrogen. Every water molecule in you is two-thirds hydrogen atoms." },
  ]},

  // ── Helium Z=2 ────────────────────────────────────────────────────────────
  2: { slides: [
    { icon: "☀️", titleIT: "Scoperto nel sole", titleEN: "Discovered in the Sun",
      textIT: "L'elio fu identificato nella spettroscopia solare da Norman Lockyer nel 1868, 27 anni prima di essere isolato in laboratorio. Il nome viene da Helios, dio greco del sole.",
      textEN: "Helium was identified in the solar spectrum by Norman Lockyer in 1868, 27 years before it was isolated in the lab. The name comes from Helios, Greek god of the Sun." },
    { icon: "❄️", titleIT: "Il più freddo dell'universo", titleEN: "The coldest substance",
      textIT: "Elio-4 diventa superfluido a 2.17 K (−271°C): fluisce senza attrito, sale lungo le pareti dei contenitori, ha conduttività termica infinita. È il comportamento della materia obbediente alla meccanica quantistica.",
      textEN: "Helium-4 becomes superfluid at 2.17 K (−271°C): it flows without friction, climbs container walls, has infinite thermal conductivity. It's quantum mechanics made visible in bulk matter." },
    { icon: "⚛️", titleIT: "Gas nobile assoluto", titleEN: "The absolute noble gas",
      textIT: "Configurazione 1s²: i due elettroni nell'orbitale 1s completano la shell in modo perfettamente stabile. L'elio non forma mai legami chimici in condizioni normali.",
      textEN: "Configuration 1s²: two electrons in the 1s orbital form a perfectly stable closed shell. Helium never forms chemical bonds under normal conditions." },
    { icon: "🔭", titleIT: "Fusione stellare", titleEN: "Stellar fusion",
      textIT: "Il Sole brucia 600 milioni di tonnellate di idrogeno ogni secondo, convertendolo in elio tramite fusione nucleare (ciclo p-p). Il 28% della massa solare è già diventata elio.",
      textEN: "The Sun burns 600 million tons of hydrogen per second, converting it to helium via nuclear fusion (p-p chain). 28% of the Sun's mass is already helium." },
  ]},

  // ── Lithium Z=3 ──────────────────────────────────────────────────────────
  3: { slides: [
    { icon: "⚖️", titleIT: "Il metallo più leggero", titleEN: "The lightest metal",
      textIT: "Il litio (densità 0,534 g/cm³) è il metallo più leggero: galleggia sull'acqua, con cui reagisce producendo LiOH e H₂. La configurazione [He] 2s¹ — un solo elettrone di valenza nella shell esterna — lo rende altamente reattivo e tipico degli alcalini.",
      textEN: "Lithium (density 0.534 g/cm³) is the lightest metal: it floats on water, reacting to produce LiOH and H₂. Its [He] 2s¹ configuration — one valence electron in the outer shell — makes it highly reactive and typical of alkali metals.",
      sourceIT: "RSC Periodic Table; NIST WebBook (lithium).",
      sourceEN: "RSC Periodic Table; NIST WebBook (lithium)." },
    { icon: "💥", titleIT: "Nato nel Big Bang", titleEN: "Born in the Big Bang",
      textIT: "Insieme a idrogeno ed elio, il litio è uno dei tre elementi prodotti dalla nucleosintesi del Big Bang, nei primi tre minuti dell'universo. Il litio-7 costituisce il 92,5% del litio naturale; il litio-6 il restante 7,5%. La quantità prevista dal modello standard cosmologico è ancora oggetto di studio (il cosiddetto 'problema del litio').",
      textEN: "Together with hydrogen and helium, lithium is one of three elements produced in Big Bang nucleosynthesis, in the universe's first three minutes. Lithium-7 makes up 92.5% of natural lithium; lithium-6 the remaining 7.5%. The quantity predicted by the standard cosmological model is still under study (the 'lithium problem').",
      sourceIT: "Particle Data Group; Fields, B.D. (2011). Annu. Rev. Nucl. Part. Sci. 61:47–68.",
      sourceEN: "Particle Data Group; Fields, B.D. (2011). Annu. Rev. Nucl. Part. Sci. 61:47–68." },
    { icon: "🔋", titleIT: "Batterie agli ioni di litio", titleEN: "Lithium-ion batteries",
      textIT: "Il litio ha il potenziale elettrochimico standard più negativo (−3,04 V) tra tutti i metalli: ideale per celle ad alta tensione. Le batterie Li-ion sviluppate da John Goodenough, M. Stanley Whittingham e Akira Yoshino hanno reso possibile l'elettronica portatile e i veicoli elettrici. Premio Nobel per la Chimica 2019.",
      textEN: "Lithium has the most negative standard electrochemical potential (−3.04 V) of all metals: ideal for high-voltage cells. Li-ion batteries developed by Goodenough, Whittingham and Yoshino made portable electronics and electric vehicles possible. Nobel Prize in Chemistry 2019.",
      sourceIT: "Comitato Nobel per la Chimica, 2019; Whittingham, M.S. (1976). Science 192:1126.",
      sourceEN: "Nobel Committee for Chemistry, 2019; Whittingham, M.S. (1976). Science 192:1126." },
    { icon: "🧠", titleIT: "Uso in medicina", titleEN: "Medical use",
      textIT: "Il carbonato di litio è impiegato in psichiatria come stabilizzatore dell'umore, in uso clinico dal 1949 (Cade, Med. J. Aust.). Il meccanismo d'azione non è completamente compreso: tra le ipotesi vi sono l'inibizione della GSK-3β e l'effetto sui secondi messaggeri fosfoinositolo.",
      textEN: "Lithium carbonate is used in psychiatry as a mood stabilizer, in clinical use since 1949 (Cade, Med. J. Aust.). Its mechanism of action is not completely understood; proposed mechanisms include GSK-3β inhibition and effects on phosphoinositol second messengers.",
      sourceIT: "Cade, J.F.J. (1949). Med. J. Aust. 2(10):349–352; Phiel, C.J. & Klein, P.S. (2001). Annu. Rev. Pharmacol. Toxicol. 41:789–813.",
      sourceEN: "Cade, J.F.J. (1949). Med. J. Aust. 2(10):349–352; Phiel, C.J. & Klein, P.S. (2001). Annu. Rev. Pharmacol. Toxicol. 41:789–813." },
  ]},

  // ── Carbon Z=6 ────────────────────────────────────────────────────────────
  6: { slides: [
    { icon: "⭐", titleIT: "Forgiato nelle stelle", titleEN: "Forged in stars",
      textIT: "Il carbonio si forma nelle stelle giganti attraverso il processo triple-alpha: tre nuclei di elio si uniscono formando un nucleo di carbonio-12. Senza questa reazione, la vita sarebbe impossibile.",
      textEN: "Carbon forms in giant stars through the triple-alpha process: three helium nuclei fuse into a carbon-12 nucleus. Without this reaction, life would be impossible." },
    { icon: "🔗", titleIT: "Il backbone della vita", titleEN: "The backbone of life",
      textIT: "Il carbonio può formare 4 legami covalenti in geometrie diverse (tetraedrica, planare, lineare), creando catene e anelli di lunghezza arbitraria. Questa versatilità unica è la base di 10 milioni di composti organici noti.",
      textEN: "Carbon forms 4 covalent bonds in different geometries (tetrahedral, planar, linear), creating chains and rings of arbitrary length. This unique versatility underlies 10 million known organic compounds." },
    { icon: "💎", titleIT: "Allotropi estremi", titleEN: "Extreme allotropes",
      textIT: "Diamante (il materiale più duro), grafite (conduttore, usata nelle matite), grafene (un foglio monoatomico 200 volte più resistente dell'acciaio), fullereni (C₆₀, strutture sferiche). Stesso elemento, proprietà radicalmente diverse.",
      textEN: "Diamond (hardest material), graphite (conductor, used in pencils), graphene (monatomic sheet 200× stronger than steel), fullerenes (C₆₀, spherical cages). Same element, radically different properties." },
    { icon: "⏰", titleIT: "Orologio cosmico", titleEN: "Cosmic clock",
      textIT: "Il carbonio-14 (¹⁴C) decade con emivita di 5.730 anni. Ogni organismo vivente ne assorbe in continuazione tramite il CO₂; alla morte l'assorbimento cessa e il decadimento diventa un orologio: la radiodatazione al carbonio.",
      textEN: "Carbon-14 (¹⁴C) decays with a half-life of 5,730 years. Every living organism absorbs it continuously through CO₂; at death absorption stops and the decay becomes a clock: radiocarbon dating." },
  ]},

  // ── Nitrogen Z=7 ─────────────────────────────────────────────────────────
  7: { slides: [
    { icon: "🌬️", titleIT: "L'aria che respiri", titleEN: "The air you breathe",
      textIT: "Il 78% dell'atmosfera terrestre è azoto molecolare N₂. Il legame triplo N≡N (945 kJ/mol) è uno dei legami più forti in chimica — per questo N₂ è quasi inerte nonostante l'azoto sia fondamentale alla vita.",
      textEN: "78% of Earth's atmosphere is molecular nitrogen N₂. The triple bond N≡N (945 kJ/mol) is one of the strongest in chemistry — which is why N₂ is nearly inert despite nitrogen being essential to life." },
    { icon: "🌱", titleIT: "Il ciclo dell'azoto", titleEN: "The nitrogen cycle",
      textIT: "Piante e animali non possono usare N₂ direttamente. Batteri azotofissatori (Rhizobium) convertono N₂ in NH₃ (ammoniaca), che diventa fertilizzante. Il processo Haber-Bosch industriale replica questa reazione, nutriendo metà dell'umanità.",
      textEN: "Plants and animals cannot use N₂ directly. Nitrogen-fixing bacteria (Rhizobium) convert N₂ to NH₃ (ammonia), which becomes fertilizer. The industrial Haber-Bosch process replicates this reaction, feeding half of humanity." },
    { icon: "❄️", titleIT: "Azoto liquido", titleEN: "Liquid nitrogen",
      textIT: "Bolle a −196°C (77 K) a pressione atmosferica. Usato per criogenica, conservazione di campioni biologici, raffreddamento di superconduttori, e — meno scientificamente — cocktail fumanti nei bar.",
      textEN: "Boils at −196°C (77 K) at atmospheric pressure. Used for cryogenics, preserving biological samples, cooling superconductors, and — less scientifically — smoke effects in fancy cocktails." },
    { icon: "💥", titleIT: "Esplosivi e DNA", titleEN: "Explosives and DNA",
      textIT: "L'azoto è paradossalmente fondamentale sia alla vita (nei nucleotidi del DNA, A-T-G-C, negli amminoacidi) sia agli esplosivi (nitroglicerina, TNT, RDX contengono tutti gruppi -NO₂ che rilasciano N₂ e liberano enorme energia).",
      textEN: "Nitrogen is paradoxically central both to life (in DNA nucleotides A-T-G-C, in amino acids) and to explosives (nitroglycerin, TNT, RDX all contain -NO₂ groups that release N₂ and enormous energy)." },
  ]},

  // ── Oxygen Z=8 ───────────────────────────────────────────────────────────
  8: { slides: [
    { icon: "🔥", titleIT: "Ossidante universale", titleEN: "Universal oxidizer",
      textIT: "L'ossigeno è l'elemento più abbondante nella crosta terrestre (46% in massa). La sua elevata elettronegatività (3.44 sulla scala Pauling) lo rende il principale agente ossidante — fondamentale per la combustione e la respirazione cellulare.",
      textEN: "Oxygen is the most abundant element in Earth's crust (46% by mass). Its high electronegativity (3.44 on the Pauling scale) makes it the principal oxidizing agent — essential for combustion and cellular respiration." },
    { icon: "🫁", titleIT: "Respirazione cellulare", titleEN: "Cellular respiration",
      textIT: "I mitocondri usano O₂ come accettore finale nella catena di trasporto degli elettroni (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP). Ogni cellula del corpo usa ossigeno ogni secondo per produrre energia.",
      textEN: "Mitochondria use O₂ as the final electron acceptor in the electron transport chain (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP). Every cell in your body uses oxygen every second to produce energy." },
    { icon: "🛡️", titleIT: "L'ozono e lo scudo UV", titleEN: "Ozone and the UV shield",
      textIT: "L'ozono (O₃) è un allotropo dell'ossigeno presente nella stratosfera (15–35 km). Assorbe il 97–99% dei raggi UV-B solari nocivi. La molecola è instabile — un equilibrio dinamico tra formazione e distruzione.",
      textEN: "Ozone (O₃) is an oxygen allotrope in the stratosphere (15–35 km). It absorbs 97–99% of harmful solar UV-B radiation. The molecule is unstable — a dynamic equilibrium between formation and destruction." },
    { icon: "💧", titleIT: "Perché l'acqua è liquida", titleEN: "Why water is liquid",
      textIT: "L'ossigeno in H₂O forma ponti idrogeno con molecole vicine (O è molto elettronegativo, H è parzialmente positivo). Questi legami mantengono l'acqua liquida a temperatura ambiente, anche se molecole simili (H₂S, H₂Se) sono gas.",
      textEN: "Oxygen in H₂O forms hydrogen bonds with neighboring molecules (O is highly electronegative, H is partially positive). These bonds keep water liquid at room temperature, even though similar molecules (H₂S, H₂Se) are gases." },
  ]},

  // ── Neon Z=10 ────────────────────────────────────────────────────────────
  10: { slides: [
    { icon: "💡", titleIT: "Le insegne al neon", titleEN: "Neon signs",
      textIT: "Georges Claude presentò i primi tubi al neon commerciali all'Esposizione di Parigi del 1910. Quando la corrente attraversa il gas Ne a bassa pressione, gli atomi eccitati emettono fotoni nel rosso-arancio (~585–703 nm). Ogni gas nobile produce uno spettro diverso: l'argon dà violetto, il kripto verde. Il 'neon colorato' usa spesso argon con vapori di mercurio o altri gas.",
      textEN: "Georges Claude first demonstrated commercial neon tubes at the Paris Exposition of 1910. Current through Ne gas at low pressure excites atoms that emit red-orange photons (~585–703 nm). Each noble gas produces a different spectrum: argon gives violet, krypton green. 'Coloured neon' often uses argon with mercury vapour or other gases.",
      sourceIT: "Claude, G. (1910). Brevet français 363,423; NIST Atomic Spectra Database.",
      sourceEN: "Claude, G. (1910). French Patent 363,423; NIST Atomic Spectra Database." },
    { icon: "⚛️", titleIT: "Gas nobile perfetto", titleEN: "The perfect noble gas",
      textIT: "Il neon ha configurazione 1s²2s²2p⁶ — l'ottetto completo. Con tutte le orbite di valenza piene, non forma nessun composto chimico stabile in condizioni normali. È l'unico gas nobile — insieme all'elio — per cui non esiste nemmeno un composto eccezionale documentato in laboratorio a pressione normale.",
      textEN: "Neon has configuration 1s²2s²2p⁶ — the complete octet. With all valence orbitals filled, it forms no stable chemical compounds under normal conditions. It is the only noble gas — along with helium — for which not even an exceptional compound has been documented in the lab at normal pressure.",
      sourceIT: "RSC Periodic Table; Grochala, W. (2007). Chem. Soc. Rev. 36:1632–1655.",
      sourceEN: "RSC Periodic Table; Grochala, W. (2007). Chem. Soc. Rev. 36:1632–1655." },
    { icon: "🔬", titleIT: "Scoperta e gas nobili", titleEN: "Discovery and noble gases",
      textIT: "Il neon fu isolato da William Ramsay e Morris Travers nel 1898 per distillazione frazionata dell'aria liquida, poche settimane dopo kripto e xeno. Il nome viene dal greco νέος (neos, 'nuovo'). Ramsay aveva già scoperto argon (1894, Nobel 1904) ed elio (1895): la famiglia dei gas nobili trasformò la comprensione della tavola periodica.",
      textEN: "Neon was isolated by William Ramsay and Morris Travers in 1898 by fractional distillation of liquid air, a few weeks after krypton and xenon. The name comes from Greek νέος (neos, 'new'). Ramsay had already discovered argon (1894, Nobel 1904) and helium (1895): the noble gas family transformed understanding of the periodic table.",
      sourceIT: "Ramsay, W. & Travers, M. (1898). Proc. R. Soc. Lond. 63:437–440; Nobel Committee 1904.",
      sourceEN: "Ramsay, W. & Travers, M. (1898). Proc. R. Soc. Lond. 63:437–440; Nobel Committee 1904." },
    { icon: "🔴", titleIT: "Laser He-Ne", titleEN: "He-Ne laser",
      textIT: "Il laser He-Ne fu il primo laser a funzionamento continuo, realizzato da Ali Javan al Bell Labs nel 1960. Il neon è il mezzo attivo: gli atomi di He, eccitati dalla scarica, trasferiscono energia ai livelli metastabili del Ne, producendo emissione stimolata a 632,8 nm (rosso). Rimane il laser di riferimento per la metrologia ottica.",
      textEN: "The He-Ne laser was the first continuously operating laser, built by Ali Javan at Bell Labs in 1960. Neon is the active medium: He atoms excited by the discharge transfer energy to metastable Ne levels, producing stimulated emission at 632.8 nm (red). It remains the reference laser for optical metrology.",
      sourceIT: "Javan, A., Bennett, W.R. & Herriott, D.R. (1961). Phys. Rev. Lett. 6:106–110.",
      sourceEN: "Javan, A., Bennett, W.R. & Herriott, D.R. (1961). Phys. Rev. Lett. 6:106–110." },
  ]},

  // ── Sodium Z=11 ──────────────────────────────────────────────────────────
  11: { slides: [
    { icon: "⚡", titleIT: "Il metallo che esplode", titleEN: "The exploding metal",
      textIT: "Il sodio reagisce violentemente con l'acqua: 2Na + 2H₂O → 2NaOH + H₂↑ + calore. L'idrogeno si incendia. Eppure questo stesso elemento è fondamentale per la vita — il paradosso dei metalli alcalini.",
      textEN: "Sodium reacts violently with water: 2Na + 2H₂O → 2NaOH + H₂↑ + heat. The hydrogen ignites. Yet this same element is essential for life — the paradox of alkali metals." },
    { icon: "🧠", titleIT: "Impulsi nervosi", titleEN: "Nerve impulses",
      textIT: "I neuroni usano pompe Na⁺/K⁺ per mantenere una differenza di potenziale (-70 mV). Un segnale nervoso è un'onda di canali Na⁺ che si aprono in sequenza, permettendo a Na⁺ di entrare nella cellula e invertire la polarità.",
      textEN: "Neurons use Na⁺/K⁺ pumps to maintain a potential difference (−70 mV). A nerve signal is a wave of Na⁺ channels opening in sequence, allowing Na⁺ to rush in and reverse polarity." },
    { icon: "🔬", titleIT: "BEC al MIT", titleEN: "BEC at MIT",
      textIT: "Il laboratorio Ketterle al MIT CUA ha realizzato il primo condensato di Bose-Einstein con atomi di sodio raffreddati a 170 nanokelvin (1995). Premio Nobel per la Fisica 2001.",
      textEN: "Ketterle's lab at MIT CUA created the first Bose-Einstein condensate with sodium atoms cooled to 170 nanokelvin (1995). Nobel Prize in Physics 2001.",
      sourceIT: "Davis, K.B. et al. (1995). Phys. Rev. Lett. 75, 3969. MIT CUA.",
      sourceEN: "Davis, K.B. et al. (1995). Phys. Rev. Lett. 75, 3969. MIT CUA." },
    { icon: "🍽️", titleIT: "Sale da cucina", titleEN: "Table salt",
      textIT: "NaCl: il cristallo cubico più famoso. Il Na⁺ cede il suo unico elettrone di valenza al Cl⁻, formando un legame ionico. Il cloruro di sodio era così prezioso nell'antichità che i soldati romani ricevevano parte della paga in sale (da cui: salario).",
      textEN: "NaCl: the most famous cubic crystal. Na⁺ donates its single valence electron to Cl⁻, forming an ionic bond. Sodium chloride was so precious in antiquity that Roman soldiers received part of their pay in salt (from which: salary)." },
  ]},

  // ── Magnesium Z=12 ───────────────────────────────────────────────────────
  12: { slides: [
    { icon: "🌿", titleIT: "Il verde della fotosintesi", titleEN: "The green of photosynthesis",
      textIT: "Il magnesio è lo ione al centro dell'anello porfirinico della clorofilla — l'unico caso in biochimica di un metallo diverso dal ferro al centro di un macrociclo porfirinico naturale. Senza Mg²⁺ nella clorofilla, la fotosintesi non avviene.",
      textEN: "Magnesium is the ion at the centre of chlorophyll's porphyrin ring — the only case in biochemistry of a non-iron metal at the centre of a natural porphyrin macrocycle. Without Mg²⁺ in chlorophyll, photosynthesis does not occur.",
      sourceIT: "RSC Periodic Table; Nelson & Cox, Lehninger Principles of Biochemistry (7ª ed.).",
      sourceEN: "RSC Periodic Table; Nelson & Cox, Lehninger Principles of Biochemistry (7th ed.)." },
    { icon: "⚡", titleIT: "Cofattore universale", titleEN: "Universal cofactor",
      textIT: "Il magnesio è cofattore di oltre 300 enzimi. L'ATP biologicamente attivo esiste quasi sempre come complesso Mg-ATP²⁻: lo ione Mg²⁺ stabilizza i gruppi fosfato e facilita il trasferimento del fosfato nelle reazioni enzimatiche. Nel muscolo, ogni contrazione dipende da questo complesso.",
      textEN: "Magnesium is a cofactor for over 300 enzymes. Biologically active ATP exists almost always as the Mg-ATP²⁻ complex: Mg²⁺ stabilises the phosphate groups and facilitates phosphate transfer in enzymatic reactions. Every muscle contraction depends on this complex.",
      sourceIT: "IUPAC; Quamme, G.A. (1997). Kidney Int. 52:1180–1195.",
      sourceEN: "IUPAC; Quamme, G.A. (1997). Kidney Int. 52:1180–1195." },
    { icon: "✈️", titleIT: "Leghe strutturali leggere", titleEN: "Lightweight structural alloys",
      textIT: "Il magnesio (densità 1,74 g/cm³, circa 2/3 dell'alluminio) è il metallo strutturale più leggero. Le leghe Mg-Al-Zn (serie AZ) sono usate in aeronautica, automotive e nei telai degli smartphone. La perdita di peso rispetto all'acciaio supera il 75%.",
      textEN: "Magnesium (density 1.74 g/cm³, about 2/3 that of aluminium) is the lightest structural metal. Mg-Al-Zn alloys (AZ series) are used in aerospace, automotive, and smartphone frames. Weight reduction versus steel exceeds 75%.",
      sourceIT: "RSC; ASM Metals Handbook Vol. 2 (Light Metals and Alloys).",
      sourceEN: "RSC; ASM Metals Handbook Vol. 2 (Light Metals and Alloys)." },
    { icon: "🔥", titleIT: "Combustione impossibile da spegnere", titleEN: "Combustion impossible to stop",
      textIT: "Il magnesio brucia in aria con una fiamma bianca intensa (temperatura di fiamma ~3100°C), emettendo radiazione UV visibile. Arde anche in CO₂ e N₂: non si può spegnere con estintori ordinari. Questa proprietà lo rendeva indispensabile nei razzi illuminanti e nelle prime fotografie a flash del XIX secolo.",
      textEN: "Magnesium burns in air with an intense white flame (flame temperature ~3,100°C), emitting UV radiation. It burns even in CO₂ and N₂: ordinary extinguishers cannot stop it. This property made it indispensable in signal flares and 19th-century flash photography.",
      sourceIT: "NIST WebBook; RSC Periodic Table.",
      sourceEN: "NIST WebBook; RSC Periodic Table." },
  ]},

  // ── Aluminium Z=13 ───────────────────────────────────────────────────────
  13: { slides: [
    { icon: "🌍", titleIT: "Il metallo più abbondante", titleEN: "The most abundant metal",
      textIT: "L'alluminio è il metallo più abbondante nella crosta terrestre (circa 8% in massa, terzo elemento in assoluto dopo O e Si). Esiste quasi esclusivamente in composti — ossidi e silicati — e non si trova mai allo stato nativo in natura.",
      textEN: "Aluminium is the most abundant metal in Earth's crust (about 8% by mass, third element overall after O and Si). It exists almost entirely in compounds — oxides and silicates — and is never found in native form in nature.",
      sourceIT: "USGS Mineral Resources Program; RSC Periodic Table.",
      sourceEN: "USGS Mineral Resources Program; RSC Periodic Table." },
    { icon: "👑", titleIT: "Un tempo più prezioso dell'oro", titleEN: "Once more precious than gold",
      textIT: "Prima del processo Hall-Héroult (1886), l'alluminio era più costoso dell'oro e dell'argento, ottenibile solo per riduzione chimica. Napoleone III riservava le posate di alluminio agli ospiti più illustri — quelle d'oro e argento erano per gli altri.",
      textEN: "Before the Hall-Héroult process (1886), aluminium was more expensive than gold and silver, obtainable only by chemical reduction. Napoleon III reserved aluminium cutlery for his most distinguished guests — gold and silver cutlery was for others.",
      sourceIT: "RSC; resoconto storico, Esposizione Universale di Parigi 1855.",
      sourceEN: "RSC; historical record, Paris Universal Exposition 1855." },
    { icon: "⚡", titleIT: "Il processo Hall-Héroult (1886)", titleEN: "The Hall-Héroult process (1886)",
      textIT: "Charles Martin Hall (USA) e Paul Héroult (Francia) scoprirono indipendentemente nel 1886 che l'ossido Al₂O₃ disciolto in criolite fusa poteva essere ridotto elettroliticamente a 950–980°C. Entrambi avevano 23 anni. Questa scoperta simultanea trasformò l'alluminio da rarità a materiale di massa.",
      textEN: "Charles Martin Hall (USA) and Paul Héroult (France) independently discovered in 1886 that Al₂O₃ dissolved in molten cryolite could be electrolytically reduced at 950–980°C. Both were 23 years old. This simultaneous discovery transformed aluminium from a curiosity to a mass material.",
      sourceIT: "Hall, C.M. (1886). US Patent 400,766; Héroult, P. (1886). Brevetto Francese 175,711.",
      sourceEN: "Hall, C.M. (1886). US Patent 400,766; Héroult, P. (1886). French Patent 175,711." },
    { icon: "♻️", titleIT: "Riciclo infinito", titleEN: "Infinite recycling",
      textIT: "Riciclare l'alluminio richiede solo il 5% dell'energia necessaria per la produzione primaria via elettrolisi. L'alluminio può essere rifuso infinite volte senza degradazione delle proprietà meccaniche. Il riciclo dell'alluminio evita ogni anno oltre 90 milioni di tonnellate di CO₂ equivalente a livello globale.",
      textEN: "Recycling aluminium requires only 5% of the energy needed for primary electrolytic production. Aluminium can be remelted indefinitely without degradation of mechanical properties. Global aluminium recycling avoids over 90 million tonnes of CO₂-equivalent per year.",
      sourceIT: "International Aluminium Institute (IAI), 2021 Annual Report.",
      sourceEN: "International Aluminium Institute (IAI), 2021 Annual Report." },
  ]},

  // ── Silicon Z=14 ─────────────────────────────────────────────────────────
  14: { slides: [
    { icon: "💻", titleIT: "La rivoluzione digitale", titleEN: "The digital revolution",
      textIT: "Il silicio è il secondo elemento più abbondante nella crosta terrestre (28%). La sua struttura elettronica (semiconductore con gap di 1.12 eV) lo rende perfetto per transistor MOSFET — 3 miliardi di transistor in un chip moderno.",
      textEN: "Silicon is the second most abundant element in Earth's crust (28%). Its electronic structure (semiconductor with a 1.12 eV band gap) makes it ideal for MOSFET transistors — 3 billion transistors in a modern chip." },
    { icon: "💎", titleIT: "Struttura diamante", titleEN: "Diamond structure",
      textIT: "Il silicio cristallizza nella struttura del diamante: ogni atomo forma 4 legami covalenti tetraedrici sp³. Questa struttura rigida è responsabile sia delle proprietà meccaniche sia della gap di banda del semiconductore.",
      textEN: "Silicon crystallizes in the diamond structure: each atom forms 4 tetrahedral sp³ covalent bonds. This rigid structure is responsible for both its mechanical properties and its semiconductor band gap." },
    { icon: "🌞", titleIT: "Celle solari", titleEN: "Solar cells",
      textIT: "L'effetto fotovoltaico nel silicio: un fotone con energia > 1.12 eV eccita un elettrone dalla banda di valenza alla banda di conduzione. Il campo elettrico p-n separa la coppia elettrone-lacuna, generando corrente.",
      textEN: "The photovoltaic effect in silicon: a photon with energy > 1.12 eV excites an electron from the valence to conduction band. The p-n electric field separates the electron-hole pair, generating current." },
    { icon: "🏖️", titleIT: "Sabbia e vetro", titleEN: "Sand and glass",
      textIT: "La sabbia è SiO₂ (quarzo). Sciogliendola a 1700°C e raffreddandola rapidamente si ottiene vetro amorfo. Il silicio e l'ossigeno insieme formano il 74% della crosta terrestre attraverso i silicati.",
      textEN: "Sand is SiO₂ (quartz). Melting it at 1700°C and cooling rapidly yields amorphous glass. Silicon and oxygen together make up 74% of Earth's crust through silicates." },
  ]},

  // ── Phosphorus Z=15 ──────────────────────────────────────────────────────
  15: { slides: [
    { icon: "🧬", titleIT: "Il backbone del DNA", titleEN: "The backbone of DNA",
      textIT: "Il DNA è una catena di nucleotidi tenuti insieme da legami fosfodiestere: il gruppo fosfato (PO₄³⁻) collega il carbonio 3′ di uno zucchero al carbonio 5′ del successivo. Senza fosforo, non esiste struttura ereditaria possibile basata su acidi nucleici.",
      textEN: "DNA is a chain of nucleotides held together by phosphodiester bonds: the phosphate group (PO₄³⁻) links the 3′ carbon of one sugar to the 5′ of the next. Without phosphorus, no hereditary structure based on nucleic acids is possible.",
      sourceIT: "Watson, J.D. & Crick, F.H.C. (1953). Nature 171:737–738; IUPAC.",
      sourceEN: "Watson, J.D. & Crick, F.H.C. (1953). Nature 171:737–738; IUPAC." },
    { icon: "⚡", titleIT: "ATP: la moneta energetica", titleEN: "ATP: the energy currency",
      textIT: "L'ATP (adenosina trifosfato) immagazzina energia nei legami pirofosfato ad alta energia (ΔG° ≈ −30,5 kJ/mol per idrolisi). Ogni cellula rigenera il proprio peso in ATP ogni giorno tramite la catena respiratoria: il fosforo è letteralmente il vettore dell'energia biologica.",
      textEN: "ATP (adenosine triphosphate) stores energy in high-energy pyrophosphate bonds (ΔG° ≈ −30.5 kJ/mol for hydrolysis). Every cell turns over its own weight in ATP each day through the respiratory chain: phosphorus is literally the carrier of biological energy.",
      sourceIT: "Nelson & Cox, Lehninger Principles of Biochemistry (8ª ed.); NIST.",
      sourceEN: "Nelson & Cox, Lehninger Principles of Biochemistry (8th ed.); NIST." },
    { icon: "🌾", titleIT: "Il nutriente limitante", titleEN: "The limiting nutrient",
      textIT: "Il fosforo è un nutriente limitante per l'agricoltura: non ha forma gassosa nel ciclo biogeochimico (a differenza di C e N) ed è estratto da rocce fosfatiche (apatite) finite. Le riserve mondiali — concentrate in pochi paesi — sono una delle questioni strategiche della sicurezza alimentare globale.",
      textEN: "Phosphorus is a limiting nutrient in agriculture: unlike C and N it has no gaseous form in the biogeochemical cycle, and is mined from finite phosphate rocks (apatite). World reserves — concentrated in few countries — are one of the strategic issues in global food security.",
      sourceIT: "Cordell, D. et al. (2009). Glob. Environ. Change 19(2):292–305; RSC.",
      sourceEN: "Cordell, D. et al. (2009). Glob. Environ. Change 19(2):292–305; RSC." },
    { icon: "🔆", titleIT: "Scoperto con l'urina", titleEN: "Discovered with urine",
      textIT: "Il fosforo bianco (P₄) si ossida spontaneamente all'aria emettendo luce fredda (chemioluminescenza) e si infiamma a circa 34°C. Fu scoperto da Hennig Brand nel 1669 distillando urina — è il primo elemento chimico isolato con un metodo sperimentale documentato.",
      textEN: "White phosphorus (P₄) oxidises spontaneously in air, emitting cold light (chemiluminescence) and igniting at about 34°C. Discovered by Hennig Brand in 1669 by distilling urine — it is the first chemical element isolated by a documented experimental method.",
      sourceIT: "RSC; Brand (1669), riportato in Boyle, R. Aerial Noctiluca (1680).",
      sourceEN: "RSC; Brand (1669), reported in Boyle, R. Aerial Noctiluca (1680)." },
  ]},

  // ── Sulfur Z=16 ──────────────────────────────────────────────────────────
  16: { slides: [
    { icon: "🌋", titleIT: "L'elemento del fuoco antico", titleEN: "The ancient fire element",
      textIT: "Lo zolfo è uno dei pochi elementi noti nell'antichità, citato nella Bibbia come 'zolfo e fuoco' e conosciuto dai greci come θεῖον. Si trova allo stato nativo vicino a vulcani e sorgenti idrotermali. In forma elementare esiste nell'allotropo S₈ — una corona di 8 atomi — stabile a temperatura ambiente.",
      textEN: "Sulphur is one of the few elements known since antiquity, cited in the Bible as 'fire and brimstone' and known to the Greeks as θεῖον. Found natively near volcanoes and hydrothermal vents. In elemental form it exists as the S₈ allotrope — a ring of 8 atoms — stable at room temperature.",
      sourceIT: "RSC Periodic Table; IUPAC.",
      sourceEN: "RSC Periodic Table; IUPAC." },
    { icon: "🛞", titleIT: "Vulcanizzazione della gomma", titleEN: "Rubber vulcanisation",
      textIT: "Charles Goodyear (1839) scoprì che aggiungendo zolfo alla gomma naturale e riscaldando si formano ponti polisolfuro (-Sₓ-) tra le catene di poliisoprene, trasformando un materiale instabile in gomma elastica e resistente. Senza vulcanizzazione non esistono pneumatici, guarnizioni o tubi flessibili.",
      textEN: "Charles Goodyear (1839) found that adding sulphur to natural rubber and heating creates polysulphide bridges (-Sₓ-) between polyisoprene chains, turning an unstable material into elastic, durable rubber. Without vulcanisation there are no tyres, seals, or flexible hoses.",
      sourceIT: "Goodyear, C. (1844). US Patent 3,633; RSC.",
      sourceEN: "Goodyear, C. (1844). US Patent 3,633; RSC." },
    { icon: "🧬", titleIT: "Amminoacidi solforati", titleEN: "Sulphur-containing amino acids",
      textIT: "La cisteina e la metionina sono gli unici amminoacidi proteinogenici contenenti zolfo. Il legame disolfuro (-S-S-) tra due cisteine è un legame covalente che determina la struttura terziaria e quaternaria delle proteine: cheratina dei capelli, insulina, anticorpi dipendono tutti da questo legame.",
      textEN: "Cysteine and methionine are the only sulphur-containing proteinogenic amino acids. The disulphide bond (-S-S-) between two cysteines is a covalent bond that determines the tertiary and quaternary structure of proteins: hair keratin, insulin, and antibodies all depend on it.",
      sourceIT: "Stryer, L. Biochemistry (8ª ed.); IUPAC.",
      sourceEN: "Stryer, L. Biochemistry (8th ed.); IUPAC." },
    { icon: "🏭", titleIT: "Il composto più prodotto al mondo", titleEN: "The world's most-produced compound",
      textIT: "L'acido solforico (H₂SO₄) è il composto chimico prodotto in quantità maggiore al mondo, con circa 265 milioni di tonnellate per anno. Serve principalmente alla produzione di fertilizzanti fosfatici, ma anche in raffinerie, batterie al piombo e sintesi chimica. La sua produzione è un indicatore macroeconomico dell'industria di un paese.",
      textEN: "Sulphuric acid (H₂SO₄) is the world's most-produced chemical compound, at about 265 million tonnes per year. Primarily used for phosphate fertiliser production, but also in refineries, lead-acid batteries, and chemical synthesis. Its production volume is a macroeconomic indicator of a country's industrial output.",
      sourceIT: "USGS; IHS Markit Chemical Economics Handbook; RSC.",
      sourceEN: "USGS; IHS Markit Chemical Economics Handbook; RSC." },
  ]},

  // ── Chlorine Z=17 ────────────────────────────────────────────────────────
  17: { slides: [
    { icon: "🌊", titleIT: "L'anione del mare", titleEN: "The ocean's anion",
      textIT: "Lo ione cloruro (Cl⁻) è l'anione più abbondante nell'acqua di mare (circa 19 g/L, il 55% degli anioni disciolti). Insieme a Na⁺, forma la salinità oceanica rimasta notevolmente costante per centinaia di milioni di anni.",
      textEN: "The chloride ion (Cl⁻) is the most abundant anion in seawater (about 19 g/L, 55% of dissolved anions). Together with Na⁺, it makes up the ocean salinity that has remained remarkably constant for hundreds of millions of years.",
      sourceIT: "RSC; Millero, F.J. (1974). Geochim. Cosmochim. Acta 38(10):1651–1656.",
      sourceEN: "RSC; Millero, F.J. (1974). Geochim. Cosmochim. Acta 38(10):1651–1656." },
    { icon: "💧", titleIT: "Disinfezione dell'acqua", titleEN: "Water disinfection",
      textIT: "La clorazione dell'acqua potabile su scala civile fu introdotta nel 1908 (Jersey City, USA). Il cloro reagisce con l'acqua formando acido ipocloroso (HOCl), che inattiva i patogeni danneggiando le membrane cellulari batteriche. L'OMS stima che la disinfezione dell'acqua abbia salvato centinaia di milioni di vite.",
      textEN: "Chlorination of drinking water at a civic scale was introduced in 1908 (Jersey City, USA). Chlorine reacts with water to form hypochlorous acid (HOCl), which inactivates pathogens by disrupting bacterial cell membranes. WHO estimates water disinfection has saved hundreds of millions of lives.",
      sourceIT: "WHO Technical Brief on Chlorination; Baker, M.N. (1948). The Quest for Pure Water.",
      sourceEN: "WHO Technical Brief on Chlorination; Baker, M.N. (1948). The Quest for Pure Water." },
    { icon: "🔬", titleIT: "Scoperta e storia", titleEN: "Discovery and history",
      textIT: "Il cloro gas (Cl₂) fu isolato da Carl Wilhelm Scheele nel 1774 e identificato come elemento da Humphry Davy nel 1810. Il suo impiego come agente chimico militare nella Prima Guerra Mondiale (Ypres, 1915) spinse la comunità internazionale verso il Protocollo di Ginevra del 1925, che proibì gli agenti chimici in guerra.",
      textEN: "Chlorine gas (Cl₂) was isolated by Carl Wilhelm Scheele in 1774 and identified as an element by Humphry Davy in 1810. Its use as a military chemical agent in World War I (Ypres, 1915) drove the international community toward the 1925 Geneva Protocol, banning chemical warfare agents.",
      sourceIT: "RSC; Scheele (1774); Protocollo di Ginevra (1925).",
      sourceEN: "RSC; Scheele (1774); Geneva Protocol (1925)." },
    { icon: "🧪", titleIT: "PVC e farmaceutica", titleEN: "PVC and pharmaceuticals",
      textIT: "Il cloruro di polivinile (PVC) è il terzo polimero sintetico più prodotto al mondo. Il cloro è coinvolto nella sintesi di circa il 25–30% dei farmaci moderni, sia come reagente intermedio sia come parte della struttura molecolare finale (es. amoxicillina).",
      textEN: "Polyvinyl chloride (PVC) is the world's third most-produced synthetic polymer. Chlorine is involved in the synthesis of about 25–30% of modern pharmaceuticals, either as an intermediate reagent or as part of the final molecular structure (e.g., amoxicillin).",
      sourceIT: "Eurochlor; European Chemical Industry Council (Cefic).",
      sourceEN: "Eurochlor; European Chemical Industry Council (Cefic)." },
  ]},

  // ── Potassium Z=19 ───────────────────────────────────────────────────────
  19: { slides: [
    { icon: "⚡", titleIT: "La pompa Na⁺/K⁺", titleEN: "The Na⁺/K⁺ pump",
      textIT: "La Na⁺/K⁺-ATPasi è una proteina di membrana presente in ogni cellula animale: ogni ciclo espelle 3 Na⁺ e importa 2 K⁺ consumando 1 ATP. Il risultato è un gradiente elettrochimico — alta [K⁺] intracellulare (~140 mM), alta [Na⁺] extracellulare (~145 mM) — che genera il potenziale di riposo (−70 mV). Jens Skou ricevette il Nobel per la Chimica 1997.",
      textEN: "The Na⁺/K⁺-ATPase is a membrane protein in every animal cell: each cycle expels 3 Na⁺ and imports 2 K⁺ consuming 1 ATP. The result is an electrochemical gradient — high intracellular [K⁺] (~140 mM), high extracellular [Na⁺] (~145 mM) — generating the resting potential (−70 mV). Jens Skou received the Nobel Prize in Chemistry 1997.",
      sourceIT: "Skou, J.C. (1957). Biochim. Biophys. Acta 23:394–401; Nobel Committee, Chemistry 1997.",
      sourceEN: "Skou, J.C. (1957). Biochim. Biophys. Acta 23:394–401; Nobel Committee, Chemistry 1997." },
    { icon: "❤️", titleIT: "Il potassio nel cuore", titleEN: "Potassium in the heart",
      textIT: "I canali K⁺ cardiaci (IKr, IKs) controllano la repolarizzazione del potenziale d'azione miocardico. Un'iperkaliemia (> 5,5 mEq/L) blocca questa repolarizzazione e può causare aritmie fatali — per questo è un'emergenza medica. Al contrario, l'ipokaliemia aumenta il rischio di fibrillazione ventricolare.",
      textEN: "Cardiac K⁺ channels (IKr, IKs) drive repolarisation of the myocardial action potential. Hyperkalaemia (> 5.5 mEq/L) disrupts repolarisation and can cause fatal arrhythmias — making it a medical emergency. Conversely, hypokalaemia increases the risk of ventricular fibrillation.",
      sourceIT: "Sanguinetti, M.C. & Jurkiewicz, N.K. (1990). J. Gen. Physiol. 96:195–215; UpToDate, Hyperkalemia.",
      sourceEN: "Sanguinetti, M.C. & Jurkiewicz, N.K. (1990). J. Gen. Physiol. 96:195–215; UpToDate, Hyperkalemia." },
    { icon: "☢️", titleIT: "K-40: sei radioattivo", titleEN: "K-40: you are radioactive",
      textIT: "Il potassio-40 (⁴⁰K) è un isotopo naturale radioattivo (abbondanza 0,0117%) con emivita di 1,25 miliardi di anni. Il corpo umano contiene ~140 g di K, di cui ~17 mg è ⁴⁰K — che produce circa 4.400 disintegrazioni al secondo nel tuo corpo. Il calore interno della Terra è parzialmente generato dal suo decadimento.",
      textEN: "Potassium-40 (⁴⁰K) is a naturally occurring radioactive isotope (abundance 0.0117%) with a half-life of 1.25 billion years. The human body contains ~140 g of K, of which ~17 mg is ⁴⁰K — producing about 4,400 disintegrations per second inside you. Earth's internal heat is partially generated by its decay.",
      sourceIT: "NIST WebBook; Firestone, R.B. (1999). Table of Isotopes; IAEA Nuclear Data.",
      sourceEN: "NIST WebBook; Firestone, R.B. (1999). Table of Isotopes; IAEA Nuclear Data." },
    { icon: "🌱", titleIT: "NPK: nutriente delle piante", titleEN: "NPK: plant nutrient",
      textIT: "Il simbolo K nelle etichette NPK dei fertilizzanti indica il potassio — uno dei tre macronutrienti principali. K attiva oltre 60 enzimi, regola l'apertura degli stomi (e quindi l'evapotraspirazione) e migliora la tolleranza alla siccità. I sali potassici (principalmente KCl, silvite) sono estratti da depositi evaporitici; Canada, Russia e Bielorussia controllano la maggior parte delle riserve mondiali.",
      textEN: "The K symbol in NPK fertiliser labels stands for potassium — one of the three primary macronutrients. K activates over 60 enzymes, regulates stomatal opening (and thus evapotranspiration) and improves drought tolerance. Potassium salts (mainly KCl, sylvite) are mined from evaporite deposits; Canada, Russia and Belarus hold most world reserves.",
      sourceIT: "IFA (International Fertilizer Association); Marschner, H. (1995). Mineral Nutrition of Higher Plants. Academic Press.",
      sourceEN: "IFA (International Fertilizer Association); Marschner, H. (1995). Mineral Nutrition of Higher Plants. Academic Press." },
  ]},

  // ── Calcium Z=20 ─────────────────────────────────────────────────────────
  20: { slides: [
    { icon: "🦴", titleIT: "Ossa e idrossiapatite", titleEN: "Bones and hydroxyapatite",
      textIT: "Il 99% del calcio del corpo umano (~1 kg) è nelle ossa e nei denti come idrossiapatite [Ca₁₀(PO₄)₆(OH)₂]. Il tessuto osseo non è inerte: gli osteoblasti costruiscono nuovo osso, gli osteoclasti ne riassorbono vecchio. Questo rimodellamento continuo sostituisce l'intero scheletro adulto in circa 10 anni.",
      textEN: "99% of calcium in the human body (~1 kg) is in bones and teeth as hydroxyapatite [Ca₁₀(PO₄)₆(OH)₂]. Bone tissue is not inert: osteoblasts build new bone while osteoclasts resorb old. This continuous remodelling replaces the entire adult skeleton in about 10 years.",
      sourceIT: "Weiner, S. & Wagner, H.D. (1998). Annu. Rev. Mater. Sci. 28:271–298; RSC Periodic Table.",
      sourceEN: "Weiner, S. & Wagner, H.D. (1998). Annu. Rev. Mater. Sci. 28:271–298; RSC Periodic Table." },
    { icon: "📡", titleIT: "Secondo messaggero cellulare", titleEN: "Cellular second messenger",
      textIT: "Lo ione Ca²⁺ è uno dei secondi messaggeri più versatili della cellula. La sua concentrazione citosolica a riposo è ~100 nM — 10.000 volte inferiore a quella extracellulare (~2 mM). Un picco di Ca²⁺, rilasciato dal reticolo endoplasmatico o dall'esterno, innesca la contrazione muscolare, la secrezione di neurotrasmettitori e la divisione cellulare.",
      textEN: "The Ca²⁺ ion is one of the cell's most versatile second messengers. Its resting cytosolic concentration is ~100 nM — 10,000-fold lower than extracellular (~2 mM). A Ca²⁺ spike, released from the endoplasmic reticulum or from outside, triggers muscle contraction, neurotransmitter secretion and cell division.",
      sourceIT: "Berridge, M.J., Lipp, P. & Bootman, M.D. (2000). Nat. Rev. Mol. Cell Biol. 1:11–21.",
      sourceEN: "Berridge, M.J., Lipp, P. & Bootman, M.D. (2000). Nat. Rev. Mol. Cell Biol. 1:11–21." },
    { icon: "🏗️", titleIT: "Calcare, calce e cemento", titleEN: "Limestone, lime and cement",
      textIT: "Il carbonato di calcio (CaCO₃) è tra i minerali più abbondanti della crosta terrestre: forma calcare, marmo, gusci e coralli. Calcinato a ~900°C produce calce viva (CaO). La calce spenta Ca(OH)₂ con argilla e gesso è la base del cemento Portland — il materiale costruttivo più prodotto al mondo (~4 miliardi di tonnellate/anno).",
      textEN: "Calcium carbonate (CaCO₃) is among the most abundant minerals in Earth's crust, forming limestone, marble, shells and corals. Calcined at ~900°C it yields quicklime (CaO). Slaked lime Ca(OH)₂ with clay and gypsum is the basis of Portland cement — the world's most-produced construction material (~4 billion tonnes/year).",
      sourceIT: "USGS Mineral Commodity Summaries; RSC Periodic Table.",
      sourceEN: "USGS Mineral Commodity Summaries; RSC Periodic Table." },
    { icon: "🌊", titleIT: "Il ciclo geologico del calcio", titleEN: "The geological calcium cycle",
      textIT: "Il calcio si muove tra rocce, oceano e atmosfera: il CO₂ atmosferico dissolve i carbonati rocciosi, portando Ca²⁺ agli oceani dove precipita come gusci biologici e sedimenta. Questo ciclo carbonato-silicato funziona da termostato climatico naturale su scale di milioni di anni, tamponando le variazioni di CO₂ atmosferico.",
      textEN: "Calcium cycles between rocks, ocean and atmosphere: atmospheric CO₂ dissolves rock carbonates, carrying Ca²⁺ to the oceans where it precipitates as biological shells and sediments. This carbonate-silicate cycle acts as a natural climate thermostat on million-year timescales, buffering atmospheric CO₂ variations.",
      sourceIT: "Berner, R.A. (2004). The Phanerozoic Carbon Cycle. Oxford University Press; RSC.",
      sourceEN: "Berner, R.A. (2004). The Phanerozoic Carbon Cycle. Oxford University Press; RSC." },
  ]},

  // ── Iron Z=26 ─────────────────────────────────────────────────────────────
  26: { slides: [
    { icon: "💥", titleIT: "Fine di una stella", titleEN: "End of a star",
      textIT: "Il ferro si forma solo nelle stelle di massa > 8 masse solari, come prodotto finale della fusione nucleare a stadi. La sintesi del ferro assorbe energia (invece di liberarla): quando il nucleo diventa ferro puro, la fusione si ferma e la stella collassa in supernova.",
      textEN: "Iron forms only in stars heavier than 8 solar masses, as the final product of staged nuclear fusion. Iron synthesis absorbs energy (instead of releasing it): when the core becomes pure iron, fusion stops and the star collapses into a supernova." },
    { icon: "🧲", titleIT: "Ferromagnetismo", titleEN: "Ferromagnetism",
      textIT: "Il ferro è ferromagnetico grazie agli elettroni spaiati negli orbitali 3d (configurazione [Ar] 3d⁶ 4s²). I momenti magnetici si allineano spontaneamente in domini di Weiss. Sopra la temperatura di Curie (770°C) il ferromagnetismo scompare.",
      textEN: "Iron is ferromagnetic due to unpaired electrons in 3d orbitals (configuration [Ar] 3d⁶ 4s²). Magnetic moments spontaneously align in Weiss domains. Above the Curie temperature (770°C) ferromagnetism vanishes." },
    { icon: "🩸", titleIT: "Il sangue rosso", titleEN: "Red blood",
      textIT: "L'emoglobina contiene 4 gruppi eme, ciascuno con un atomo di Fe²⁺ al centro. L'ossigeno si lega all'Fe²⁺ cambiando il colore dell'emoglobina da viola (deossigenata) a rosso brillante (ossigenata). Nel corpo umano ci sono 4 grammi di ferro.",
      textEN: "Hemoglobin contains 4 heme groups, each with one Fe²⁺ at the center. Oxygen binds to Fe²⁺, changing hemoglobin color from purple (deoxygenated) to bright red (oxygenated). The human body contains 4 grams of iron." },
    { icon: "🌍", titleIT: "Il nucleo terrestre", titleEN: "Earth's core",
      textIT: "Il nucleo interno della Terra è una sfera solida di ferro-nichel (raggio 1.220 km) a 5.700°C e 360 GPa di pressione. La rotazione differenziale rispetto al mantello genera il campo magnetico terrestre per effetto dinamo.",
      textEN: "Earth's inner core is a solid iron-nickel sphere (radius 1,220 km) at 5,700°C and 360 GPa pressure. Its differential rotation relative to the mantle generates Earth's magnetic field via the dynamo effect." },
  ]},

  // ── Copper Z=29 ──────────────────────────────────────────────────────────
  29: { slides: [
    { icon: "⚡", titleIT: "Il miglior conduttore pratico", titleEN: "The best practical conductor",
      textIT: "Il rame ha la seconda miglior conducibilità elettrica tra i metalli (dopo l'argento, 97% della sua conducibilità) ma è molto più economico. La configurazione elettronica anomala [Ar] 3d¹⁰ 4s¹ (non [Ar] 3d⁹ 4s²) riflette la stabilità extra del 3d pieno.",
      textEN: "Copper has the second-best electrical conductivity of any metal (after silver, at 97% of its conductivity) but is far cheaper. Its anomalous configuration [Ar] 3d¹⁰ 4s¹ (not [Ar] 3d⁹ 4s²) reflects the extra stability of a filled 3d shell." },
    { icon: "🏺", titleIT: "L'Età del Bronzo", titleEN: "The Bronze Age",
      textIT: "Il rame è stato il primo metallo lavorato dall'uomo (9000 a.C.). Legato con stagno (10%) forma il bronzo: più duro, più resistente alla corrosione. L'invenzione del bronzo ha definito un'era della civiltà umana.",
      textEN: "Copper was the first metal worked by humans (9000 BC). Alloyed with tin (10%) it forms bronze: harder, more corrosion-resistant. The invention of bronze defined an era of human civilization." },
    { icon: "🦠", titleIT: "Effetto oligodinamico", titleEN: "Oligodynamic effect",
      textIT: "Gli ioni Cu²⁺ sono tossici per batteri e funghi anche a concentrazioni di pochi ppb. Il rame inattiva le proteine dei patogeni legandosi ai gruppi tiolici (-SH). Le superfici di rame in ospedali riducono le infezioni del 40%.",
      textEN: "Cu²⁺ ions are toxic to bacteria and fungi even at a few ppb. Copper inactivates pathogen proteins by binding to thiol groups (-SH). Copper surfaces in hospitals reduce infections by 40%." },
    { icon: "🔵", titleIT: "Il sangue blu", titleEN: "Blue blood",
      textIT: "I polpi, calamari e molti crostacei usano l'emocianina invece dell'emoglobina: contiene Cu²⁺ invece di Fe²⁺. L'emocianina ossidata è di colore blu-verde intenso — da qui l'espressione 'sangue blu'.",
      textEN: "Octopuses, squids and many crustaceans use hemocyanin instead of hemoglobin: it contains Cu²⁺ instead of Fe²⁺. Oxidized hemocyanin is deep blue-green — hence the expression 'blue blood'." },
  ]},

  // ── Zinc Z=30 ────────────────────────────────────────────────────────────
  30: { slides: [
    { icon: "🛡️", titleIT: "Galvanizzazione", titleEN: "Galvanisation",
      textIT: "Immergendo l'acciaio in zinco fuso a circa 450°C si forma uno strato di leghe Zn-Fe che protegge dalla corrosione per sacrificio anodico: lo zinco si ossida preferibilmente al ferro. Circa il 55% della produzione mondiale di zinco è destinata alla galvanizzazione di acciaio per costruzioni, automobili e infrastrutture.",
      textEN: "Dipping steel in molten zinc at about 450°C forms a Zn-Fe alloy layer that protects against corrosion by anodic sacrifice: zinc oxidises preferentially over iron. About 55% of world zinc production goes to galvanising steel for construction, automotive, and infrastructure.",
      sourceIT: "International Zinc Association; RSC Periodic Table.",
      sourceEN: "International Zinc Association; RSC Periodic Table." },
    { icon: "🧬", titleIT: "Zinc finger e biologia", titleEN: "Zinc fingers and biology",
      textIT: "Lo zinco è cofattore essenziale di oltre 300 enzimi (alcol deidrogenasi, anidrasi carbonica). I 'zinc finger' sono domini proteici nei fattori di trascrizione che usano Zn²⁺ coordinato a 4 residui (Cys/His) per riconoscere e legare sequenze specifiche del DNA — uno dei meccanismi di regolazione genica più diffusi negli eucarioti.",
      textEN: "Zinc is an essential cofactor of over 300 enzymes (alcohol dehydrogenase, carbonic anhydrase). 'Zinc fingers' are protein domains in transcription factors that use Zn²⁺ coordinated to 4 residues (Cys/His) to recognise and bind specific DNA sequences — one of the most widespread gene-regulation mechanisms in eukaryotes.",
      sourceIT: "Klug, A. (2010). Annu. Rev. Biochem. 79:213–231; IUPAC.",
      sourceEN: "Klug, A. (2010). Annu. Rev. Biochem. 79:213–231; IUPAC." },
    { icon: "🏺", titleIT: "Metallurgia antica", titleEN: "Ancient metallurgy",
      textIT: "La metallurgia dello zinco fu sviluppata in India attorno al IX secolo d.C. (sito di Zawar, Rajasthan) attraverso distillazione da minerali di calamina, secoli prima che in Europa. L'ottone (lega Cu-Zn) era già prodotto nell'antichità con il processo di cementazione, senza isolare lo zinco metallico.",
      textEN: "Zinc metallurgy was developed in India around the 9th century CE (Zawar, Rajasthan) by distillation from calamine ores, centuries before Europe. Brass (Cu-Zn alloy) was already produced in antiquity by the cementation process, without isolating metallic zinc.",
      sourceIT: "Hegde, R.V. (2000). Indian J. History Sci. 35(2):115–151; RSC.",
      sourceEN: "Hegde, R.V. (2000). Indian J. History Sci. 35(2):115–151; RSC." },
    { icon: "🌿", titleIT: "Carenza e nutrizione", titleEN: "Deficiency and nutrition",
      textIT: "La carenza di zinco — stimata dall'OMS in circa 2 miliardi di persone nelle regioni in via di sviluppo — causa ritardo nella crescita, compromissione immunitaria e rallentamento della cicatrizzazione. La supplementazione con Zn è tra gli interventi nutrizionali più efficaci per bambini con diete prevalentemente a base di cereali.",
      textEN: "Zinc deficiency — estimated by WHO at about 2 billion people in developing regions — causes growth retardation, impaired immune function, and slower wound healing. Zinc supplementation is among the most effective nutritional interventions for children on predominantly cereal-based diets.",
      sourceIT: "WHO (2002). The World Health Report; Prasad, A.S. (2013). Nutrients 5(7):2899–2932.",
      sourceEN: "WHO (2002). The World Health Report; Prasad, A.S. (2013). Nutrients 5(7):2899–2932." },
  ]},

  // ── Silver Z=47 ──────────────────────────────────────────────────────────
  47: { slides: [
    { icon: "⚡", titleIT: "Il miglior conduttore", titleEN: "The best conductor",
      textIT: "L'argento ha la conducibilità elettrica più alta tra tutti gli elementi a temperatura ambiente (6,30×10⁷ S/m), superiore anche al rame. La configurazione elettronica anomala [Kr] 4d¹⁰ 5s¹ — come per Cu e Au — riflette la stabilità extra del sottolivello d completamente riempito.",
      textEN: "Silver has the highest electrical conductivity of any element at room temperature (6.30×10⁷ S/m), surpassing even copper. Its anomalous configuration [Kr] 4d¹⁰ 5s¹ — as in Cu and Au — reflects the extra stability of a completely filled d subshell.",
      sourceIT: "NIST WebBook; RSC Periodic Table.",
      sourceEN: "NIST WebBook; RSC Periodic Table." },
    { icon: "📷", titleIT: "Fotografia analogica", titleEN: "Analogue photography",
      textIT: "Il bromuro d'argento (AgBr) è fotosensibile: i fotoni eccitano gli elettroni liberando atomi di Ag metallico (immagine latente). Lo sviluppo chimico amplifica questo segnale di fattori superiori a 10⁸. La fotografia analogica ha usato questo principio per 150 anni, fino all'avvento del sensore digitale.",
      textEN: "Silver bromide (AgBr) is photosensitive: photons excite electrons, releasing metallic Ag atoms (latent image). Chemical development amplifies this signal by factors exceeding 10⁸. Analogue photography used this principle for 150 years, until digital sensors replaced it.",
      sourceIT: "Mees, C.E.K. (1954). The Theory of the Photographic Process; RSC.",
      sourceEN: "Mees, C.E.K. (1954). The Theory of the Photographic Process; RSC." },
    { icon: "🦠", titleIT: "Effetto antimicrobico", titleEN: "Antimicrobial effect",
      textIT: "Gli ioni Ag⁺ sono battericidi efficaci a concentrazioni dell'ordine dei nanogrammi per litro, interagendo con i gruppi tiolici (-SH) delle proteine batteriche e denaturandole. Le superfici di argento in ambito clinico e le nanoparticelle di Ag nei tessuti antimicrobici sfruttano questo effetto.",
      textEN: "Ag⁺ ions are effective bactericides at nanogram-per-litre concentrations, interacting with and denaturing bacterial proteins at thiol (-SH) groups. Silver surfaces in clinical settings and Ag nanoparticles in antimicrobial fabrics exploit this effect.",
      sourceIT: "Russell, A.D. & Hugo, W.B. (1994). Prog. Med. Chem. 31:351–370; RSC.",
      sourceEN: "Russell, A.D. & Hugo, W.B. (1994). Prog. Med. Chem. 31:351–370; RSC." },
    { icon: "🪙", titleIT: "Il metallo monetario", titleEN: "The monetary metal",
      textIT: "L'argento ha sostenuto i sistemi monetari mondiali per millenni. Il termine 'sterling' (argento al 92,5% di purezza) deriva dall'Hansa medievale. Il dollaro americano discende dal tallero di Boemia (Joachimsthaler, 1519) — una moneta d'argento — attraverso il peso spagnolo.",
      textEN: "Silver has underpinned monetary systems for millennia. The term 'sterling' (92.5% purity silver) derives from the medieval Hanseatic league. The US dollar traces back to the Bohemian thaler (Joachimsthaler, 1519) — a silver coin — via the Spanish peso.",
      sourceIT: "RSC; fonti numismatiche storiche.",
      sourceEN: "RSC; historical numismatic records." },
  ]},

  // ── Iodine Z=53 ──────────────────────────────────────────────────────────
  53: { slides: [
    { icon: "🦋", titleIT: "La tiroide e gli ormoni", titleEN: "The thyroid and hormones",
      textIT: "La tiroide incorpora iodio nella tiroxina (T₄, 4 atomi di I) e nella triiodotironina (T₃, 3 atomi di I). Questi ormoni regolano il metabolismo basale, la crescita e lo sviluppo neurologico. La carenza di iodio in gravidanza causa deficit cognitivo nel neonato (cretinismo endemico).",
      textEN: "The thyroid incorporates iodine into thyroxine (T₄, 4 I atoms) and triiodothyronine (T₃, 3 I atoms). These hormones regulate basal metabolism, growth, and neurological development. Iodine deficiency in pregnancy causes cognitive impairment in the newborn (endemic cretinism).",
      sourceIT: "WHO; Zimmermann, M.B. (2009). Endocr. Rev. 30(4):376–408.",
      sourceEN: "WHO; Zimmermann, M.B. (2009). Endocr. Rev. 30(4):376–408." },
    { icon: "🧂", titleIT: "Sale iodato e sanità pubblica", titleEN: "Iodised salt and public health",
      textIT: "La carenza di iodio è stata la principale causa prevenibile di deficit cognitivo nel mondo. L'iodizzazione del sale (aggiunta di KIO₃ o KI in dosi di 20–40 mg/kg) è una delle misure di sanità pubblica più semplici ed efficaci mai implementate, oggi attiva in oltre 130 paesi.",
      textEN: "Iodine deficiency has been the world's leading preventable cause of cognitive impairment. Salt iodisation (adding KIO₃ or KI at 20–40 mg/kg) is one of the simplest and most cost-effective public health measures ever implemented, now active in over 130 countries.",
      sourceIT: "WHO/UNICEF/ICCIDD (2007). Assessment of Iodine Deficiency Disorders.",
      sourceEN: "WHO/UNICEF/ICCIDD (2007). Assessment of Iodine Deficiency Disorders." },
    { icon: "☢️", titleIT: "I-131 e medicina nucleare", titleEN: "I-131 and nuclear medicine",
      textIT: "Lo iodio-131 (t₁/₂ = 8,02 giorni, emissione β⁻ e γ) è usato in medicina nucleare sia per la diagnosi (scintigrafia tiroidea) sia per la terapia del carcinoma tiroideo differenziato e dell'ipertiroidismo. La tiroide concentra selettivamente lo iodio: questo rende il trattamento altamente mirato.",
      textEN: "Iodine-131 (t₁/₂ = 8.02 days, β⁻ and γ emission) is used in nuclear medicine for both diagnosis (thyroid scintigraphy) and therapy of differentiated thyroid carcinoma and hyperthyroidism. The thyroid selectively concentrates iodine, making the treatment highly targeted.",
      sourceIT: "IAEA Safety Reports; NIST; Mazzaferri, E.L. (1997). N. Engl. J. Med. 338(5):297–306.",
      sourceEN: "IAEA Safety Reports; NIST; Mazzaferri, E.L. (1997). N. Engl. J. Med. 338(5):297–306." },
    { icon: "🔵", titleIT: "Il test dell'amido", titleEN: "The starch test",
      textIT: "Lo iodio molecolare (I₂) forma con l'amilosio dell'amido un complesso di inclusione blu-nero intenso (λmax ≈ 620 nm): I₂ entra nelle eliche dell'amilosio stabilizzato da interazioni di van der Waals. È uno dei test colorimetrici più antichi e selettivi della chimica analitica.",
      textEN: "Molecular iodine (I₂) forms a deep blue-black inclusion complex with starch amylose (λmax ≈ 620 nm): I₂ enters the amylose helices stabilised by van der Waals interactions. It is one of the oldest and most selective colorimetric tests in analytical chemistry.",
      sourceIT: "RSC; Rendleman, J.A. (1992). Carbohydrate Polymers 17(3):229–242.",
      sourceEN: "RSC; Rendleman, J.A. (1992). Carbohydrate Polymers 17(3):229–242." },
  ]},

  // ── Xenon Z=54 ───────────────────────────────────────────────────────────
  54: { slides: [
    { icon: "💤", titleIT: "Anestesia con lo xeno", titleEN: "Xenon anaesthesia",
      textIT: "Lo xeno è un anestetico completo approvato per uso clinico in Europa. Agisce principalmente come antagonista dei recettori NMDA e modulatore dei recettori GABA-A. Vantaggi: induzione rapida, recovery veloce, nessun metabolismo epatico, minima depressione cardiaca. È preferito in cardiochirurgia dove la stabilità emodinamica è critica, nonostante il costo elevato della separazione criogenica.",
      textEN: "Xenon is a complete anaesthetic approved for clinical use in Europe. It acts primarily as an NMDA receptor antagonist and GABA-A receptor modulator. Advantages: rapid induction, fast recovery, no hepatic metabolism, minimal cardiac depression. Preferred in cardiac surgery where haemodynamic stability is critical, despite the high cost of cryogenic separation.",
      sourceIT: "Wappler, F. et al. (2007). J. Cardiothorac. Vasc. Anesth. 21(5):636–646; Franks, N.P. et al. (1998). Nature 396:324–326.",
      sourceEN: "Wappler, F. et al. (2007). J. Cardiothorac. Vasc. Anesth. 21(5):636–646; Franks, N.P. et al. (1998). Nature 396:324–326." },
    { icon: "🚀", titleIT: "Propulsione ionica", titleEN: "Ion propulsion",
      textIT: "I motori ionici a griglia usano Xe come propellente: gli atomi vengono ionizzati (Xe → Xe⁺ + e⁻) e accelerati da campi elettrici a velocità > 30 km/s. L'impulso specifico (Isp ~ 3.000–10.000 s) è circa 10 volte quello di un razzo chimico. La sonda Dawn (NASA, 2007) ha raggiunto Vesta e Cerere con motori a xeno; SMART-1 (ESA, 2003) li ha usati per l'inserimento in orbita lunare.",
      textEN: "Gridded ion thrusters use Xe as propellant: atoms are ionised (Xe → Xe⁺ + e⁻) and accelerated by electric fields to >30 km/s. Specific impulse (Isp ~ 3,000–10,000 s) is about 10× that of a chemical rocket. The Dawn spacecraft (NASA, 2007) reached Vesta and Ceres using xenon engines; SMART-1 (ESA, 2003) used them for lunar orbit insertion.",
      sourceIT: "Rayman, M.D. et al. (2006). Acta Astronautica 58(11):605–620; ESA SMART-1 mission report.",
      sourceEN: "Rayman, M.D. et al. (2006). Acta Astronautica 58(11):605–620; ESA SMART-1 mission report." },
    { icon: "🌑", titleIT: "Rivelatori di materia oscura", titleEN: "Dark matter detectors",
      textIT: "Lo xeno liquido (−108°C, densità 2,96 g/cm³) è il bersaglio preferito nei rivelatori di materia oscura più sensibili al mondo. Esperimenti come XENON1T (Gran Sasso, ~1 t di Xe liquido) e LUX-ZEPLIN (2 t) rilevano scintillazione e ionizzazione da possibili collisioni di WIMP con i nuclei di Xe. Finora nessun segnale: i limiti superiori sulla sezione d'urto WIMP-nucleone sono i più stringenti mai misurati.",
      textEN: "Liquid xenon (−108°C, density 2.96 g/cm³) is the preferred target in the world's most sensitive dark matter detectors. Experiments such as XENON1T (Gran Sasso, ~1 t liquid Xe) and LUX-ZEPLIN (2 t) detect scintillation and ionisation from potential WIMP-nucleus collisions. No signal so far: the upper limits on WIMP-nucleon cross-section are the most stringent ever measured.",
      sourceIT: "XENON Collaboration (2018). Phys. Rev. Lett. 121, 111302; LZ Collaboration (2022). Phys. Rev. Lett. 131, 041002.",
      sourceEN: "XENON Collaboration (2018). Phys. Rev. Lett. 121, 111302; LZ Collaboration (2022). Phys. Rev. Lett. 131, 041002." },
    { icon: "🧪", titleIT: "Il primo gas nobile reattivo", titleEN: "The first reactive noble gas",
      textIT: "Per decenni si credeva che i gas nobili non potessero formare composti. Nel 1962 Neil Bartlett sintetizzò XePtF₆ dopo aver osservato che PtF₆ era abbastanza ossidante da ionizzare O₂. In pochi mesi furono sintetizzati XeF₂, XeF₄ e XeF₆. La scoperta rivoluzionò la teoria del legame chimico e aprì la chimica dei gas nobili come campo di ricerca.",
      textEN: "For decades noble gases were believed incapable of forming compounds. In 1962 Neil Bartlett synthesised XePtF₆ after observing that PtF₆ was oxidising enough to ionise O₂. Within months XeF₂, XeF₄ and XeF₆ were synthesised. The discovery revolutionised bonding theory and opened noble gas chemistry as an independent research field.",
      sourceIT: "Bartlett, N. (1962). Proc. Chem. Soc. Lond. 218; Hyman, H.H. ed. (1963). Noble Gas Compounds. Univ. of Chicago Press.",
      sourceEN: "Bartlett, N. (1962). Proc. Chem. Soc. Lond. 218; Hyman, H.H. ed. (1963). Noble Gas Compounds. Univ. of Chicago Press." },
  ]},

  // ── Platinum Z=78 ────────────────────────────────────────────────────────
  78: { slides: [
    { icon: "🚗", titleIT: "Catalisi eterogenea", titleEN: "Heterogeneous catalysis",
      textIT: "Il platino è il catalizzatore eterogeneo per eccellenza. Nel convertitore catalitico dell'automobile (diffuso dagli anni '70), Pt e Pd ossidano CO e idrocarburi incombusti e riducono gli ossidi di azoto NOₓ. La superficie del Pt adsorbisce le molecole, abbassando l'energia di attivazione. Un convertitore moderno contiene 3–7 grammi di metalli del gruppo del platino.",
      textEN: "Platinum is the heterogeneous catalyst par excellence. In the automotive catalytic converter (widespread from the 1970s), Pt and Pd oxidise CO and unburnt hydrocarbons and reduce nitrogen oxides NOₓ. The Pt surface adsorbs molecules, lowering activation energy. A modern converter contains 3–7 grams of platinum-group metals.",
      sourceIT: "Heck, R.M. & Farrauto, R.J. (2001). Appl. Catal. A: General 221(1–2):443–457; RSC Periodic Table.",
      sourceEN: "Heck, R.M. & Farrauto, R.J. (2001). Appl. Catal. A: General 221(1–2):443–457; RSC Periodic Table." },
    { icon: "💊", titleIT: "Cisplatino e chemioterapia", titleEN: "Cisplatin and chemotherapy",
      textIT: "Il cis-diaminodicloroplatino(II) — cisplatino [cis-PtCl₂(NH₃)₂] — fu sintetizzato per la prima volta nel 1845 (sale di Peyrone). La sua attività antitumorale fu scoperta accidentalmente da Barnett Rosenberg nel 1965: il Pt forma legami crociati covalenti intracatena con la guanina del DNA, bloccando la replicazione e inducendo apoptosi. È ancora un cardine della terapia dei tumori di testicolo, ovaio e polmone.",
      textEN: "cis-Diaminedichloroplatinum(II) — cisplatin [cis-PtCl₂(NH₃)₂] — was first synthesised in 1845 (Peyrone's salt). Its anti-tumour activity was accidentally discovered by Barnett Rosenberg in 1965: Pt forms intrastrand covalent cross-links with DNA guanine, blocking replication and inducing apoptosis. It remains a cornerstone of testicular, ovarian and lung cancer therapy.",
      sourceIT: "Rosenberg, B. et al. (1969). Nature 222:385–386; RSC Periodic Table; IUPAC.",
      sourceEN: "Rosenberg, B. et al. (1969). Nature 222:385–386; RSC Periodic Table; IUPAC." },
    { icon: "⚖️", titleIT: "Lo standard del chilogrammo", titleEN: "The kilogram standard",
      textIT: "Dal 1889 al 2019, il chilogrammo era definito dalla massa del Prototipo Internazionale del Kilogrammo (IPK) — un cilindro di lega platino-iridio (90% Pt, 10% Ir) custodito al BIPM di Sèvres (Francia). La scelta del Pt-Ir non era arbitraria: durezza, inerzia chimica e stabilità dimensionale erano insuperabili. Dal 2019 il kg è ridefinito dalla costante di Planck.",
      textEN: "From 1889 to 2019, the kilogram was defined by the International Prototype of the Kilogram (IPK) — a platinum-iridium alloy cylinder (90% Pt, 10% Ir) kept at the BIPM in Sèvres, France. The choice of Pt-Ir was not arbitrary: hardness, chemical inertness and dimensional stability were unmatched. Since 2019 the kg is redefined by the Planck constant.",
      sourceIT: "BIPM; Mohr, P.J. et al. (2018). Rev. Mod. Phys. 90, 025004 (CODATA 2018).",
      sourceEN: "BIPM; Mohr, P.J. et al. (2018). Rev. Mod. Phys. 90, 025004 (CODATA 2018)." },
    { icon: "🪙", titleIT: "Scoperta e resistenza chimica", titleEN: "Discovery and chemical resistance",
      textIT: "Il platino — dalla parola spagnola platina ('piccolo argento') — fu descritto da Antonio de Ulloa nel 1748 durante una missione geodetica in Sudamerica. La sua resistenza chimica estrema (non reagisce con HNO₃, HCl, H₂SO₄ separati) rendeva impossibile la lavorazione ai metallurghi europei. Solo la miscela regia (HNO₃ + HCl 1:3) riesce a dissolverlo.",
      textEN: "Platinum — from the Spanish word platina ('little silver') — was described by Antonio de Ulloa in 1748 during a geodetic mission in South America. Its extreme chemical resistance (unreactive with separate HNO₃, HCl, H₂SO₄) made it impossible for European metallurgists to work. Only aqua regia (HNO₃ + HCl 1:3) can dissolve it.",
      sourceIT: "de Ulloa, A. (1748). Relación Histórica del Viaje a la América Meridional; Weeks, M.E. (1968). Discovery of the Elements. 7th ed.; RSC.",
      sourceEN: "de Ulloa, A. (1748). Relación Histórica del Viaje a la América Meridional; Weeks, M.E. (1968). Discovery of the Elements. 7th ed.; RSC." },
  ]},

  // ── Gold Z=79 ────────────────────────────────────────────────────────────
  79: { slides: [
    { icon: "✨", titleIT: "Il metallo nobile per eccellenza", titleEN: "The noblest metal",
      textIT: "L'oro è il metallo meno reattivo: non ossida, non corrode, non reagisce con acidi normali. Occorre la miscela regia (HNO₃ + 3HCl) per dissolverlo. Questa inerzia chimica è il motivo per cui l'oro dura millenni.",
      textEN: "Gold is the least reactive metal: it doesn't oxidize, corrode, or react with normal acids. It requires aqua regia (HNO₃ + 3HCl) to dissolve. This chemical inertness is why gold lasts millennia." },
    { icon: "⚡", titleIT: "Effetti relativistici", titleEN: "Relativistic effects",
      textIT: "Il colore giallo dell'oro è una conseguenza della relatività speciale. Gli elettroni 6s viaggiano così veloce (58% della velocità della luce) che la loro massa relativistica aumenta, contraendo l'orbitale e abbassando la gap tra le bande s e d — assorbendo il blu.",
      textEN: "Gold's yellow color is a consequence of special relativity. Its 6s electrons travel so fast (58% of light speed) that their relativistic mass increases, contracting the orbital and lowering the s-d band gap — absorbing blue light." },
    { icon: "🌌", titleIT: "Creato nelle fusioni di stelle di neutroni", titleEN: "Created in neutron star mergers",
      textIT: "L'oro non si forma nelle supernove ordinarie: ha bisogno della nucleosintesi rapida (processo-r) che avviene quando due stelle di neutroni si fondono. Nel 2017 l'interferometro LIGO ha rilevato tali fusioni, confermando la produzione di elementi pesanti.",
      textEN: "Gold isn't formed in ordinary supernovae: it needs rapid nucleosynthesis (r-process) occurring when two neutron stars merge. In 2017 the LIGO interferometer detected such mergers, confirming production of heavy elements." },
    { icon: "💉", titleIT: "Medicina e nanotecnologia", titleEN: "Medicine and nanotechnology",
      textIT: "Le nanoparticelle d'oro (10–100 nm) assorbono e rilasciano luce nell'infrarosso vicino, riscaldando i tessuti tumorali in modo selettivo (fototermoterapia). Caltech ha pionierato ricerche sulle nanoparticelle d'oro per diagnosi e terapia del cancro.",
      textEN: "Gold nanoparticles (10–100 nm) absorb and re-emit near-infrared light, selectively heating tumor tissue (photothermal therapy). Caltech has pioneered research on gold nanoparticles for cancer diagnosis and therapy.",
      sourceIT: "Ref: Caltech Materials and Process Simulation Center; Kavli Nanoscience Institute.",
      sourceEN: "Ref: Caltech Materials and Process Simulation Center; Kavli Nanoscience Institute." },
  ]},

  // ── Mercury Z=80 ─────────────────────────────────────────────────────────
  80: { slides: [
    { icon: "💧", titleIT: "L'unico metallo liquido", titleEN: "The only liquid metal",
      textIT: "Il mercurio fonde a −38,83°C — unico metallo liquido a temperatura ambiente (il gallio fonde a +29,8°C, quindi non a TA standard). La debolezza del legame metallico nel mercurio è spiegata da effetti relativistici: gli elettroni 6s si contraggono, riducendo la disponibilità per il legame metallico.",
      textEN: "Mercury melts at −38.83°C — the only metal liquid at room temperature (gallium melts at +29.8°C, so not at standard RT). The weak metallic bonding in mercury is explained by relativistic effects: the 6s electrons contract, reducing availability for metallic bonding.",
      sourceIT: "NIST WebBook; Norrby, L.J. (1991). J. Chem. Ed. 68(2):110–113.",
      sourceEN: "NIST WebBook; Norrby, L.J. (1991). J. Chem. Ed. 68(2):110–113." },
    { icon: "🌡️", titleIT: "Barometri e misura", titleEN: "Barometers and measurement",
      textIT: "Evangelista Torricelli (1643) usò il mercurio per creare il primo barometro: una colonna di Hg da 760 mm bilancia la pressione atmosferica (1 atm). L'alta densità del mercurio (13,53 g/cm³) fu determinante: una colonna d'acqua equivalente avrebbe richiesto circa 10 metri.",
      textEN: "Evangelista Torricelli (1643) used mercury to create the first barometer: a 760 mm Hg column balances atmospheric pressure (1 atm). Mercury's high density (13.53 g/cm³) was decisive: an equivalent water column would have required about 10 metres.",
      sourceIT: "Torricelli, E. (1644). Lettera a Michelangelo Ricci; RSC.",
      sourceEN: "Torricelli, E. (1644). Letter to Michelangelo Ricci; RSC." },
    { icon: "⚛️", titleIT: "Prima superconduttività", titleEN: "First superconductivity",
      textIT: "Heike Kamerlingh Onnes (1911) scoprì che raffreddando il mercurio a 4,2 K la resistenza elettrica crollava a zero — la prima osservazione sperimentale di superconduttività. Il fenomeno quantistico macroscopico rimase senza spiegazione teorica fino alla teoria BCS nel 1957. Nobel per la Fisica 1913.",
      textEN: "Heike Kamerlingh Onnes (1911) found that cooling mercury to 4.2 K caused electrical resistance to drop to zero — the first experimental observation of superconductivity. The macroscopic quantum phenomenon remained unexplained until BCS theory in 1957. Nobel Prize in Physics 1913.",
      sourceIT: "Onnes, H.K. (1911). Comm. Phys. Lab. Univ. Leiden, Suppl. 29; RSC.",
      sourceEN: "Onnes, H.K. (1911). Comm. Phys. Lab. Univ. Leiden, Suppl. 29; RSC." },
    { icon: "🔬", titleIT: "Tossicologia e bioaccumulo", titleEN: "Toxicology and bioaccumulation",
      textIT: "Il metilmercurio (CH₃Hg⁺), prodotto dai batteri anaerobici nei sedimenti acquatici, si bioaccumula nella catena alimentare e si biomagnifica nei pesci predatori. Il disastro di Minamata (Giappone, 1956–1968), causato da scarichi industriali di Hg, portò alle prime normative internazionali sistematiche sui metalli pesanti.",
      textEN: "Methylmercury (CH₃Hg⁺), produced by anaerobic bacteria in aquatic sediments, bioaccumulates along the food chain and biomagnifies in predatory fish. The Minamata disaster (Japan, 1956–1968), caused by industrial Hg discharge, led to the first systematic international regulations on heavy metals.",
      sourceIT: "Harada, M. (1995). Crit. Rev. Toxicol. 25(1):1–24; Convenzione di Minamata UNEP (2013).",
      sourceEN: "Harada, M. (1995). Crit. Rev. Toxicol. 25(1):1–24; UNEP Minamata Convention (2013)." },
  ]},

  // ── Lead Z=82 ────────────────────────────────────────────────────────────
  82: { slides: [
    { icon: "⚛️", titleIT: "Nucleo doppiamente magico", titleEN: "Doubly magic nucleus",
      textIT: "Il piombo-208 (²⁰⁸Pb) è il nucleo stabile più pesante in natura. Ha 82 protoni e 126 neutroni — entrambi 'numeri magici' della fisica nucleare (livelli energetici completamente riempiti nel modello a shell). Questa doppia magia lo rende eccezionalmente stabile.",
      textEN: "Lead-208 (²⁰⁸Pb) is the heaviest stable nucleus in nature. It has 82 protons and 126 neutrons — both 'magic numbers' in nuclear physics (completely filled energy levels in the shell model). This double magic makes it exceptionally stable.",
      sourceIT: "Mayer, M.G. & Jensen, J.H.D. (1955). Elementary Theory of Nuclear Shell Structure (Nobel 1963); IUPAC.",
      sourceEN: "Mayer, M.G. & Jensen, J.H.D. (1955). Elementary Theory of Nuclear Shell Structure (Nobel 1963); IUPAC." },
    { icon: "🏛️", titleIT: "Roma e le tubature", titleEN: "Rome and the pipes",
      textIT: "I Romani usavano il piombo su larga scala per tubature (fistulae plumbeae), rivestimenti di vasche e utensili. Il nome Pb deriva dal latino plumbum, radice di 'plombatura' e 'piombo'. La tossicità del Pb era ignota; la ricerca storica studia tuttora il suo possibile impatto sulla salute pubblica romana.",
      textEN: "Romans used lead extensively for pipes (fistulae plumbeae), tank linings, and utensils. The symbol Pb derives from the Latin plumbum, root of 'plumbing'. Lead toxicity was unknown to them; historical research continues to study its possible impact on Roman public health.",
      sourceIT: "Nriagu, J.O. (1983). Lead and Lead Poisoning in Antiquity. Wiley-Interscience; RSC.",
      sourceEN: "Nriagu, J.O. (1983). Lead and Lead Poisoning in Antiquity. Wiley-Interscience; RSC." },
    { icon: "☢️", titleIT: "Schermatura dalle radiazioni", titleEN: "Radiation shielding",
      textIT: "L'elevata densità del piombo (11,34 g/cm³) e il suo alto numero atomico (Z=82) lo rendono un efficace assorbitore di raggi γ e X: i numerosi elettroni interni interagiscono con i fotoni ad alta energia tramite effetto fotoelettrico e diffusione Compton. Usato in schermature, grembiuli radiologici e contenitori per sorgenti radioattive.",
      textEN: "Lead's high density (11.34 g/cm³) and high atomic number (Z=82) make it an effective absorber of γ and X radiation: its many inner electrons interact with high-energy photons through the photoelectric effect and Compton scattering. Used in shields, radiological aprons, and radioactive source containers.",
      sourceIT: "NIST XCOM Photon Cross Sections Database; RSC.",
      sourceEN: "NIST XCOM Photon Cross Sections Database; RSC." },
    { icon: "🚗", titleIT: "Benzina con piombo", titleEN: "Leaded petrol",
      textIT: "Il tetraetile di piombo (TEL) fu aggiunto alla benzina dal 1921 per aumentare il numero di ottano ed evitare la detonazione nei motori. La sua eliminazione globale — completata intorno al 2021 — ha ridotto le concentrazioni di Pb nel sangue della popolazione mondiale di oltre il 75%, uno dei più grandi successi della politica ambientale del XX secolo.",
      textEN: "Tetraethyl lead (TEL) was added to petrol from 1921 to increase octane number and prevent engine knock. Its global phase-out — completed around 2021 — reduced blood lead concentrations in the world population by over 75%, one of the greatest environmental policy successes of the 20th century.",
      sourceIT: "UNEP Partnership for Clean Fuels and Vehicles; Nriagu, J.O. (1990). Science 247(4944):859–862.",
      sourceEN: "UNEP Partnership for Clean Fuels and Vehicles; Nriagu, J.O. (1990). Science 247(4944):859–862." },
  ]},

  // ── Uranium Z=92 ─────────────────────────────────────────────────────────
  92: { slides: [
    { icon: "☢️", titleIT: "L'elemento più pesante naturale", titleEN: "The heaviest natural element",
      textIT: "L'uranio (Z=92) è l'elemento più pesante prodotto in abbondanza nelle supernove. Gli elementi più pesanti (Np, Pu, Am…) sono sintetici o esistono solo in tracce. L'uranio-238 ha un'emivita di 4.47 miliardi di anni.",
      textEN: "Uranium (Z=92) is the heaviest element produced abundantly in supernovae. Heavier elements (Np, Pu, Am…) are synthetic or exist only in traces. Uranium-238 has a half-life of 4.47 billion years." },
    { icon: "⚛️", titleIT: "Fissione nucleare", titleEN: "Nuclear fission",
      textIT: "¹⁴U-235 (0.7% dell'uranio naturale) può essere diviso da un neutrone lento: ²³⁵U + n → ⁹²Kr + ¹⁴¹Ba + 3n + 200 MeV. Quei 3 neutroni possono dividere altri nuclei → reazione a catena. Un kg di ²³⁵U = 20 kilotonnellate di TNT.",
      textEN: "²³⁵U (0.7% of natural uranium) splits when hit by a slow neutron: ²³⁵U + n → ⁹²Kr + ¹⁴¹Ba + 3n + 200 MeV. Those 3 neutrons can split more nuclei → chain reaction. 1 kg of ²³⁵U = 20 kilotons of TNT." },
    { icon: "🔬", titleIT: "Configurazione quantistica complessa", titleEN: "Complex quantum configuration",
      textIT: "L'uranio ha 92 elettroni distribuiti in orbitali fino a 5f. Gli orbitali f (7 suborbitali, max 14 elettroni) sono tridimensionalmente complessi, con forme a 8 lobi. I lantanidi (4f) e attinidi (5f) devono le loro proprietà uniche a questi orbitali.",
      textEN: "Uranium has 92 electrons filling orbitals up to 5f. The f orbitals (7 suborbitals, max 14 electrons) are 3D-complex, with 8-lobe shapes. Lanthanides (4f) and actinides (5f) owe their unique properties to these orbitals." },
    { icon: "⚡", titleIT: "20% dell'elettricità mondiale", titleEN: "20% of world electricity",
      textIT: "I reattori nucleari commerciali (pressurizzati a 155 bar, 325°C) usano uranio arricchito (3–5% di U-235). Producono il 10% dell'elettricità mondiale senza emissioni di CO₂ durante l'operazione.",
      textEN: "Commercial nuclear reactors (pressurized at 155 bar, 325°C) use enriched uranium (3–5% U-235). They produce 10% of world electricity with zero CO₂ emissions during operation." },
  ]},
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ElementStoryMode({
  z, locale, onClose,
}: {
  z: number;
  locale: Locale;
  onClose: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const story = STORIES[z];

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => {
    if (!story) return;
    if (slide < story.slides.length - 1) setSlide(s => s + 1);
    else onClose();
  }, [story, slide, onClose]);

  if (!story) return (
    <div className="pt-story-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="pt-story-card" onClick={e => e.stopPropagation()}>
        <p className="pt-story-unavailable">
          {locale === "en" ? "Story not yet available for this element." : "Storia non ancora disponibile per questo elemento."}
        </p>
        <button className="pt-story-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );

  const current = story.slides[slide]!;
  const isLast  = slide === story.slides.length - 1;

  return (
    <div className="pt-story-overlay" onClick={onClose} role="dialog" aria-modal aria-label={locale === "en" ? "Element story" : "Storia dell'elemento"}>
      <div className="pt-story-card" onClick={e => e.stopPropagation()}>
        <div className="pt-story-progress">
          {story.slides.map((_, i) => (
            <button
              key={i}
              className={`pt-story-pip${i === slide ? " active" : i < slide ? " done" : ""}`}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button className="pt-story-close" onClick={onClose} aria-label="Chiudi">✕</button>

        <div className="pt-story-icon" aria-hidden="true">{current.icon}</div>
        <h3 className="pt-story-title">
          {locale === "en" ? current.titleEN : current.titleIT}
        </h3>
        <p className="pt-story-text">
          {locale === "en" ? current.textEN : current.textIT}
        </p>
        {(current.sourceIT ?? current.sourceEN) && (
          <p className="pt-story-source">
            {locale === "en" ? current.sourceEN : current.sourceIT}
          </p>
        )}

        <div className="pt-story-nav">
          {slide > 0 && (
            <button className="pt-story-btn pt-story-btn--prev" onClick={prev} aria-label="Precedente">←</button>
          )}
          <button className="pt-story-btn pt-story-btn--next" onClick={next} aria-label={isLast ? (locale === "en" ? "Close" : "Chiudi") : "Prossimo"}>
            {isLast ? (locale === "en" ? "Fine ✓" : "Fine ✓") : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
