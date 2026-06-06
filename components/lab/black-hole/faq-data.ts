// Black-hole FAQ data — a PLAIN (non-'use client') module so both the client
// FAQ view and the server pages (FAQPage JSON-LD) can read the actual values.
// Importing data from a 'use client' module into a Server Component yields a
// client-reference proxy, not the data — which broke the FAQ page prerender.
export type FaqItem = { q: string; a: string; sec?: number };
export type FaqLocale = "it" | "en";

export const FAQ: Record<FaqLocale, FaqItem[]> = {
  it: [
    {
      q: "Cos'è un buco nero?",
      a: "Un buco nero è una regione di spazio-tempo dove la gravità è così intensa che nulla, nemmeno la luce, può sfuggire una volta superato l'orizzonte degli eventi. Si forma quando una grande massa viene compressa in un volume piccolissimo. In questa simulazione ne vedi l'effetto reale: la luce che gli passa accanto viene deviata (lensing gravitazionale) e attorno all'ombra centrale compare l'anello di fotoni.",
    },
    {
      q: "Cosa succede se cadi in un buco nero?",
      a: "Visto da lontano, sembreresti rallentare e arrossire fino a «congelarti» sull'orizzonte (dilatazione gravitazionale del tempo). Per te, localmente, attraverseresti l'orizzonte senza nulla di speciale — ma la differenza di gravità tra testa e piedi ti stirerebbe: la «spaghettificazione», che nel Playground puoi vedere applicata alle stelle.",
    },
    {
      q: "Si può vedere un buco nero?",
      a: "Non direttamente — è nero — ma se ne vede l'ombra stagliata contro la luce del gas caldo che gli orbita attorno (il disco di accrescimento) e contro le stelle di sfondo deformate dal lensing. È così che l'Event Horizon Telescope ha fotografato M87* e Sgr A*: la modalità «EHT» della simulazione imita quell'immagine.",
    },
    {
      q: "È una simulazione vera o un effetto grafico?",
      a: "È una simulazione vera. Per ogni pixel risolviamo numericamente la geodetica nulla esatta della metrica (Schwarzschild, e Kerr con lo spin): lensing gravitazionale, sfera fotonica, ombra e photon ring nascono dal calcolo della relatività generale, non da trucchi grafici. Tracciamo i raggi dalla camera all'indietro, ma in RG i cammini della luce sono reversibili, quindi l'immagine è esattamente quella che produrrebbe la luce reale.",
      sec: 1,
    },
    {
      q: "La massa del buco nero influenza la griglia spazio-tempo?",
      a: "No, ed è corretto che non la influenzi. La geometria, misurata in unità di raggio di Schwarzschild rₛ, è identica per ogni massa: i buchi neri sono scale-invariant. La massa cambia solo la scala assoluta (rₛ vale 30 km o un'unità astronomica) e il colore del disco. A deformare la griglia è invece lo spin: il frame-dragging la attorciglia.",
      sec: 7,
    },
    {
      q: "Lo spin è la metrica di Kerr vera o un'approssimazione?",
      a: "È la metrica di Kerr esatta. Con lo slider Spin integriamo le geodetiche nulle esatte di Kerr in tempo reale (in forma di Kerr–Schild cartesiana, senza singolarità di coordinate). Ne emergono l'ombra asimmetrica, il photon ring spostato e schiacciato e il trascinamento dei sistemi inerziali — la stessa metrica del Gargantua di Interstellar.",
      sec: 6,
    },
    {
      q: "Il disco di accrescimento cambia con lo spin?",
      a: "Sì. Il bordo interno è l'ISCO prograda di Kerr (formula di Bardeen): si stringe verso il buco man mano che lo spin aumenta, e con esso l'anello caldo. Il Doppler e il redshift seguono la metrica di Kerr esatta, e il profilo radiale del flusso è quello relativistico di disco sottile (Novikov–Thorne) con quel bordo interno dipendente dallo spin.",
      sec: 3,
    },
    {
      q: "Le dimensioni di stella e buco nero sono in scala?",
      a: "No: nel playground sono compresse per renderle visibili insieme. Il rapporto reale dipende interamente dalla massa: attorno a un buco nero stellare (~10 M☉, rₛ≈30 km) una stella è migliaia di volte più grande dell'orizzonte; attorno a uno supermassiccio (Gargantua) l'orizzonte supera di gran lunga ogni stella.",
      sec: 8,
    },
    {
      q: "C'è fisica del plasma reale (campi magnetici, sincrotrone)?",
      a: "No. Il disco emette come un corpo nero alla sua temperatura, con turbolenza procedurale per la struttura del gas; mancano del tutto il plasma magnetizzato, l'emissione di sincrotrone e la polarizzazione — richiederebbero una soluzione GRMHD, fattibile solo offline. Il lato termico e il trasporto radiativo relativistico (redshift, beaming) sono invece corretti.",
      sec: 3,
    },
    {
      q: "È identico al buco nero di Interstellar?",
      a: "È la stessa metrica di Kerr. La differenza è il calcolo: il Gargantua di Interstellar è stato ray-tracciato offline (ore per fotogramma), qui gira in tempo reale nel browser. Anche il disco di Interstellar è un modello artistico (niente plasma), come il nostro.",
      sec: 6,
    },
    {
      q: "Posso fidarmi delle equazioni?",
      a: "Sì per il lensing e per le orbite: l'integrazione delle geodetiche (nulle e di tipo-tempo) è esatta e riproduce sfera fotonica, anello di Einstein, ombra, ISCO e precessione del periastro. Tutto ciò che è approssimato — profilo del disco, turbolenza procedurale, getti stilizzati, corpi non lensati nel playground — è dichiarato apertamente.",
      sec: 11,
    },
    {
      q: "Qual è la differenza tra la demo «Orbite» e il «Playground»?",
      a: "La demo «Orbite» integra la geodetica di tipo-tempo esatta di Schwarzschild per un singolo corpo (precessione e ISCO esatti, con diagnostica di conservazione). Il Playground usa il potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce gli effetti di campo forte ma permette la gravità reciproca a N-corpi e la disgregazione mareale — un compromesso esattezza/interattività.",
      sec: 8,
    },
    {
      q: "Perché lo spazio è nero invece che pieno di stelle luminose?",
      a: "È il paradosso di Olbers: il cielo profondo è quasi nero e solo le stelle discrete brillano. Manteniamo un fondo prossimo allo zero proprio per questo — e la luce di sfondo che vedete attorno al buco è comunque lensata davvero dalla curvatura.",
      sec: 10,
    },
    {
      q: "Che differenza c'è tra la vista normale e «Cielo reale»?",
      a: "Cambia solo il cielo di sfondo, non la fisica: lensing, disco, ombra e photon ring sono identici. La vista normale è «cinematografica»: cielo quasi nero (paradosso di Olbers) con poche stelle discrete, così l'attenzione resta sul buco nero. «Cielo reale» usa una vera foto astronomica di tutto il cielo — la NASA «Deep Star Maps 2020» (Goddard SVS, dominio pubblico), costruita da cataloghi stellari reali (Gaia/Tycho) con la banda diffusa della Via Lattea — proiettata sulla sfera celeste e campionata con la direzione del raggio GIÀ deviata dal buco: così la vera Via Lattea viene davvero spalmata e incurvata attorno all'ombra. Se la foto non è disponibile, si ricade su un cielo procedurale strutturato (banda con bande di polvere, rigonfiamento, nebulose). In cambio carica un'immagine da alcuni MB.",
      sec: 10,
    },
    {
      q: "Perché su mobile ogni tanto rallenta?",
      a: "Il ray-tracing delle geodetiche di Kerr è pesante: ogni pixel integra la traiettoria del fotone, e il fragment shader gira sulla GPU del telefono. Se va a scatti, abbassa il preset Qualità (Media o Bassa): riduce i passi d'integrazione e la risoluzione.",
    },
    {
      q: "Come avete scelto i colori del disco?",
      a: "Non sono inventati. Ogni anello del disco ha una temperatura (dal flusso relativistico di disco sottile via Stefan–Boltzmann) e mostriamo il vero colore di corpo nero di quella temperatura (locus planckiano → sRGB), poi spostato dal redshift gravitazionale e dal Doppler relativistico.",
      sec: 4,
    },
    {
      q: "Il Sole diventerà un buco nero?",
      a: "No. Solo stelle molto più massicce del Sole (oltre ~20 volte la sua massa) collassano in buchi neri. Il Sole, tra circa 5 miliardi di anni, diventerà una gigante rossa e poi una nana bianca — mai un buco nero.",
    },
    {
      q: "Il tempo rallenta vicino a un buco nero?",
      a: "Sì. Più ci si avvicina all'orizzonte, più il tempo scorre lento rispetto a un osservatore lontano: è la dilatazione gravitazionale del tempo, l'effetto reso celebre da Interstellar. La demo «Orbite» mostra la velocità misurata e il redshift legati a questo, e all'orizzonte un oggetto appare «congelarsi».",
    },
    {
      q: "Cosa c'è dentro un buco nero?",
      a: "La relatività generale prevede una singolarità centrale, dove la curvatura diventa infinita e la teoria stessa smette di valere. Cosa accada davvero lì richiederebbe una teoria quantistica della gravità che ancora non abbiamo. Questa simulazione modella solo l'esterno dell'orizzonte, dove la fisica è ben definita e verificabile.",
    },
    {
      q: "Cos'è la radiazione di Hawking e i buchi neri «muoiono»?",
      a: "Stephen Hawking previde che i buchi neri non siano del tutto neri: emettono una debolissima radiazione termica ed evaporano lentamente. Per i buchi neri reali è minuscola (sono più freddi del fondo cosmico), ma in tempi enormi li farebbe sparire. Il pannello «Scala reale» calcola la temperatura di Hawking e il tempo di evaporazione per la massa che scegli.",
    },
  ],
  en: [
    {
      q: "What is a black hole?",
      a: "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. It forms when a large mass is compressed into a tiny volume. This simulation shows its real effect: light passing nearby is bent (gravitational lensing) and a photon ring appears around the central shadow.",
    },
    {
      q: "What happens if you fall into a black hole?",
      a: "Seen from far away, you would appear to slow down and redden until you «freeze» at the horizon (gravitational time dilation). For you, locally, crossing the horizon feels unremarkable — but the difference in gravity between your head and feet would stretch you: «spaghettification», which you can watch applied to stars in the Playground.",
    },
    {
      q: "Can you actually see a black hole?",
      a: "Not directly — it's black — but you can see its shadow silhouetted against the hot gas orbiting it (the accretion disk) and against background stars warped by lensing. That is how the Event Horizon Telescope photographed M87* and Sgr A*: the simulation's «EHT» mode mimics that image.",
    },
    {
      q: "Is it a real simulation or a graphical effect?",
      a: "It is a real simulation. For every pixel we numerically solve the metric's exact null geodesic (Schwarzschild, and Kerr with spin): gravitational lensing, the photon sphere, the shadow and the photon ring all emerge from the general-relativity calculation, not from tricks. We trace rays from the camera backwards, but light paths in GR are reversible, so the image is exactly the one real light would produce.",
      sec: 1,
    },
    {
      q: "Does the black hole's mass affect the spacetime grid?",
      a: "No, and it correctly shouldn't. The geometry, measured in Schwarzschild radii rₛ, is identical for every mass: black holes are scale-invariant. Mass only changes the absolute scale (rₛ being 30 km or an astronomical unit) and the disk colour. What does deform the grid is spin: frame-dragging twists it.",
      sec: 7,
    },
    {
      q: "Is the spin the true Kerr metric or an approximation?",
      a: "It is the exact Kerr metric. With the Spin slider we integrate the exact Kerr null geodesics in real time (in Cartesian Kerr–Schild form, with no coordinate singularity). The asymmetric shadow, the displaced and flattened photon ring and the dragging of inertial frames all emerge — the same metric as Interstellar's Gargantua.",
      sec: 6,
    },
    {
      q: "Does the accretion disk change with spin?",
      a: "Yes. The inner edge is the prograde Kerr ISCO (Bardeen's formula): it shrinks toward the hole as spin increases, so the hot ring tightens. The Doppler and redshift follow the exact Kerr metric, and the radial flux is the relativistic thin-disk (Novikov–Thorne) profile with that spin-dependent inner edge.",
      sec: 3,
    },
    {
      q: "Are the star and black-hole sizes to scale?",
      a: "No: in the playground they are compressed so both are visible. The real ratio depends entirely on mass: around a stellar-mass hole (~10 M☉, rₛ≈30 km) a star is thousands of times larger than the horizon; around a supermassive one (Gargantua) the horizon dwarfs any star.",
      sec: 8,
    },
    {
      q: "Is there real plasma physics (magnetic fields, synchrotron)?",
      a: "No. The disk emits as a blackbody at its temperature, with procedural turbulence for the gas structure; magnetized plasma, synchrotron emission and polarization are entirely absent — they would need a GRMHD solution, feasible only offline. The thermal side and the relativistic radiative transfer (redshift, beaming) are correct.",
      sec: 3,
    },
    {
      q: "Is it identical to Interstellar's black hole?",
      a: "It is the same Kerr metric. The difference is the computation: Interstellar's Gargantua was ray-traced offline (hours per frame); this runs in real time in the browser. Interstellar's disk is an artistic model too (no plasma), like ours.",
      sec: 6,
    },
    {
      q: "Can I trust the equations?",
      a: "Yes for the lensing and the orbits: integrating the geodesics (null and timelike) is exact and reproduces the photon sphere, Einstein ring, shadow, ISCO and periastron precession. Everything approximated — disk profile, procedural turbulence, stylized jets, un-lensed playground bodies — is stated openly.",
      sec: 11,
    },
    {
      q: "What is the difference between the «Orbits» demo and the «Playground»?",
      a: "The «Orbits» demo integrates the exact Schwarzschild timelike geodesic for a single body (exact precession and ISCO, with a conservation diagnostic). The Playground uses the Paczyński–Wiita pseudo-Newtonian potential, which reproduces strong-field effects but allows mutual N-body gravity and tidal disruption — an exactness/interactivity trade-off.",
      sec: 8,
    },
    {
      q: "Why is space black instead of full of bright stars?",
      a: "It is Olbers' paradox: the deep sky is nearly black and only discrete stars glow. We keep a near-zero floor for exactly this reason — and the background light you see around the hole is genuinely lensed by the curvature.",
      sec: 10,
    },
    {
      q: "What's the difference between the normal view and «Real sky»?",
      a: "Only the background sky changes, not the physics: lensing, disk, shadow and photon ring are identical. The normal view is «cinematic»: a near-black sky (Olbers' paradox) with a few discrete stars, so attention stays on the black hole. «Real sky» uses a genuine all-sky astronomical photo — NASA's «Deep Star Maps 2020» (Goddard SVS, public domain), built from real star catalogs (Gaia/Tycho) with the Milky Way's diffuse band — projected onto the celestial sphere and sampled with the ALREADY-lensed ray direction: so the real Milky Way is genuinely smeared and curved around the shadow. If the photo isn't available it falls back to a structured procedural sky (dust-laned band, bulge, nebulae). In return it loads a few-MB image.",
      sec: 10,
    },
    {
      q: "Why does it sometimes slow down on mobile?",
      a: "Ray-tracing Kerr geodesics is heavy: each pixel integrates the photon's path, and the fragment shader runs on the phone's GPU. If it stutters, lower the Quality preset (Medium or Low): it reduces the integration steps and the resolution.",
    },
    {
      q: "How did you choose the disk colours?",
      a: "They are not invented. Each ring of the disk has a temperature (from the relativistic thin-disk flux via Stefan–Boltzmann) and we show the true blackbody colour of that temperature (Planckian locus → sRGB), then shifted by gravitational redshift and relativistic Doppler.",
      sec: 4,
    },
    {
      q: "Will the Sun become a black hole?",
      a: "No. Only stars much heavier than the Sun (more than ~20 times its mass) collapse into black holes. In about 5 billion years the Sun will become a red giant and then a white dwarf — never a black hole.",
    },
    {
      q: "Does time slow down near a black hole?",
      a: "Yes. The closer you get to the horizon, the slower time runs relative to a distant observer: gravitational time dilation, the effect made famous by Interstellar. The «Orbits» demo shows the measured speed and redshift tied to this, and at the horizon an object appears to «freeze».",
    },
    {
      q: "What is inside a black hole?",
      a: "General relativity predicts a central singularity, where curvature becomes infinite and the theory itself breaks down. What actually happens there would need a quantum theory of gravity we do not yet have. This simulation models only the outside of the horizon, where the physics is well-defined and testable.",
    },
    {
      q: "What is Hawking radiation, and do black holes «die»?",
      a: "Stephen Hawking predicted that black holes are not entirely black: they emit a very faint thermal radiation and slowly evaporate. For real black holes it is tiny (they are colder than the cosmic background), but over immense timescales it would make them disappear. The «Real scale» panel computes the Hawking temperature and evaporation time for the mass you choose.",
    },
  ],
};
