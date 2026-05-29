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
