"use client";

import Link from "next/link";
import katex from "katex";

// ---------------------------------------------------------------------------
// Black-hole lab — about / methodology page (bilingual, graduate level).
// Documents the mathematics and physics actually used in the renderer, with
// rigorous derivations and citations to international university sources, in
// line with the project's "fail loud, never fake" rule. Typeset with KaTeX.
// ---------------------------------------------------------------------------

type Locale = "it" | "en";

type Section = { heading: string; body: string[]; eqs?: { label: string; tex: string }[] };
type Ref = { cite: string; url?: string };

type Copy = {
  kicker: string;
  title: string;
  intro: string[];
  sections: Section[];
  openHeading: string;
  open: string[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  refsHeading: string;
  refs: Ref[];
  backToLab: string;
  openSim: string;
};

function Tex({ tex, display = true }: { tex: string; display?: boolean }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
  return <span className="bh-about__tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

const COPY: Record<Locale, Copy> = {
  it: {
    kicker: "Metodologia · livello graduate · Fosforonero Lab",
    title: "Buco nero: derivazione matematica e fisica",
    intro: [
      "Questa pagina ricostruisce, a livello universitario avanzato, le equazioni che governano la simulazione: dalla metrica di Schwarzschild alle geodetiche nulle, dal disco di accrescimento relativistico al trasporto radiativo invariante. Dichiariamo esplicitamente cosa è esatto, cosa è approssimato e cosa è scelta di visualizzazione.",
      "Tutto è in unità geometrizzate G = c = 1; nel renderer fissiamo il raggio di Schwarzschild rₛ = 2M = 1.",
    ],
    sections: [
      {
        heading: "1. Metrica di Schwarzschild e geodetiche nulle",
        body: [
          "La geometria esterna a una massa sferica non rotante è la soluzione di Schwarzschild del vuoto delle equazioni di Einstein. Nelle coordinate (t, r, θ, φ):",
          "I vettori di Killing temporale e azimutale forniscono due integrali primi del moto — energia E e momento angolare L per unità di massa — lungo ogni geodetica affine:",
          "Per un fotone (geodetica nulla) la condizione gᵤᵥ ẋᵘẋᵛ = 0 si riduce, nel piano equatoriale, a un'equazione radiale con potenziale efficace. Ponendo u = 1/r si ottiene l'equazione orbitale, la cui derivata è l'equazione di Binet per i fotoni:",
          "Il parametro d'impatto è b = L/E. La sfera fotonica (orbita circolare instabile dei fotoni) è a r = 3M = 1.5 rₛ, e l'ombra osservata corrisponde al parametro d'impatto critico bᵪ = 3√3·M. Il renderer integra numericamente la forma vettoriale equivalente di questa geodetica (velocity-Verlet), riproducendo lensing, anello di Einstein, sfera fotonica e ombra. (Carroll; Kokkotas, Univ. Tübingen; Hirata, Ohio State.)",
        ],
        eqs: [
          { label: "Elemento di linea di Schwarzschild", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Quantità conservate (vettori di Killing)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\,\\dot\\varphi" },
          { label: "Equazione orbitale dei fotoni e sua derivata (Binet)", tex: "\\left(\\frac{du}{d\\varphi}\\right)^{2} = \\frac{1}{b^{2}} - (1-2Mu)\\,u^{2} \\;\\Longrightarrow\\; \\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}" },
          { label: "Sfera fotonica e parametro d'impatto critico (ombra)", tex: "r_{\\mathrm{ph}} = 3M = 1.5\\,r_s, \\qquad b_c = 3\\sqrt{3}\\,M" },
        ],
      },
      {
        heading: "2. Disco di accrescimento relativistico",
        body: [
          "Il disco sottile, otticamente spesso, segue il modello di Shakura–Sunyaev nella sua versione relativistica di Novikov–Thorne, con condizione di stress nullo all'ultima orbita circolare stabile (ISCO). Il flusso emesso localmente e la temperatura efficace (Stefan–Boltzmann) sono:",
          "Per Schwarzschild l'ISCO è a rᵢₛ𝒸ₒ = 6M = 3 rₛ. Ogni anello irraggia come un corpo nero alla sua temperatura locale: il colore è quindi il vero colore di corpo nero T → sRGB lungo il locus planckiano, non un gradiente arbitrario. Il primo calcolo dell'immagine di un disco siffatto risale a Luminet (1979). (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
        ],
        eqs: [
          { label: "Flusso del disco (Novikov–Thorne / Shakura–Sunyaev)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Temperatura efficace", tex: "T_{\\mathrm{eff}}(r) = \\left(\\frac{F(r)}{\\sigma}\\right)^{1/4}" },
          { label: "Bordo interno (ISCO, Schwarzschild)", tex: "r_{\\mathrm{in}} = r_{\\mathrm{ISCO}} = 6M = 3\\,r_s" },
        ],
      },
      {
        heading: "3. Trasporto radiativo ed effetti relativistici",
        body: [
          "Lungo un raggio, la quantità Iᵥ/ν³ è invariante (teorema di Liouville per i fotoni). Definito il fattore di redshift g = νₒₛₛ/νₑₘ, per un emettitore in orbita circolare g combina la dilatazione gravitazionale e temporale con il Doppler longitudinale.",
          "Un corpo nero visto con fattore g resta un corpo nero a temperatura g·T (invarianza Doppler dello spettro di Planck), con intensità bolometrica che scala come g⁴. Lo stesso g pilota quindi luminosità e colore: il lato del disco in avvicinamento è più luminoso e più blu (beaming relativistico), quello in allontanamento più scuro e più rosso. (Luminet 1979; Vincent et al. 2011, GYOTO.)",
        ],
        eqs: [
          { label: "Invariante di Liouville", tex: "\\frac{I_\\nu}{\\nu^{3}} = \\text{costante lungo il raggio}" },
          { label: "Velocità orbitale GR e fattore di redshift", tex: "v = \\sqrt{\\frac{M}{r-2M}}, \\qquad g = \\frac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\quad \\beta = \\mathbf v\\cdot\\hat{\\mathbf n}_{\\mathrm{oss}}" },
          { label: "Beaming bolometrico e colore (corpo nero)", tex: "I_{\\mathrm{oss}} = g^{4}\\,I_{\\mathrm{em}}, \\qquad B_\\nu(T)\\big|_{g} = B_\\nu(g\\,T)" },
        ],
      },
      {
        heading: "4. Rotazione: Kerr e frame-dragging",
        body: [
          "Un buco nero realistico ruota: la metrica corretta è quella di Kerr, in cui il trascinamento dei sistemi inerziali (frame-dragging) ha velocità angolare ω = −g_{tφ}/g_{φφ}. Il renderer non integra Kerr; lo slider Spin aggiunge il frame-dragging in approssimazione di campo gravitomagnetico di dipolo (Lense–Thirring), fisicamente motivato ma NON la metrica di Kerr completa.",
          "Il celebre Gargantua di Interstellar usa la vera metrica di Kerr ray-tracciata offline (James, von Tunzelmann, Franklin & Thorne 2015). Codici di ray-tracing GR completi e pubblici (es. GYOTO) integrano Kerr ma non in tempo reale nel browser.",
        ],
        eqs: [
          { label: "Velocità angolare di frame-dragging (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{campo lontano}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Approssimazione Lense–Thirring usata", tex: "\\mathbf a_{\\mathrm{drag}} \\propto \\mathbf v\\times\\mathbf B_g, \\qquad \\mathbf B_g = \\frac{3(\\mathbf J\\cdot\\hat{\\mathbf r})\\,\\hat{\\mathbf r} - \\mathbf J}{r^{3}}" },
        ],
      },
      {
        heading: "5. Playground: dinamica dei corpi",
        body: [
          "Nel playground i corpi (pianeti con lune, stelle, comete) si muovono nel potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce esattamente l'ISCO a 6M e la caduta relativistica verso l'orizzonte senza dover integrare le geodetiche complete — un compromesso standard nei modelli N-corpi/accrescimento.",
          "Le lune sono integrate come problema ristretto: sentono sia il buco nero sia il pianeta ospite (entro la sfera di Hill). Le stelle che attraversano il raggio mareale vengono disgregate in uno stream di detriti (modello a particelle, non idrodinamica). (Paczyński–Wiita 1980.)",
        ],
        eqs: [
          { label: "Potenziale di Paczyński–Wiita", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Raggio mareale (disgregazione stellare)", tex: "r_t \\simeq R_\\star\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}" },
        ],
      },
      {
        heading: "6. Limiti: cosa NON è (onestà scientifica)",
        body: [
          "La base è Schwarzschild (non rotante); lo spin è approssimato (Lense–Thirring), non Kerr. Il disco è stazionario e otticamente spesso: non risolve idrodinamica MHD, autogravità, spessore verticale né polarizzazione. Le stelle di sfondo sono procedurali (il loro lensing, però, è reale). Nel playground i corpi aggiunti non sono lensati e l'integrazione è pseudo-newtoniana, non geodetica completa.",
        ],
      },
    ],
    openHeading: "Soluzioni open: cosa possiamo (e non possiamo) integrare",
    open: [
      "Esistono ottimi codici di ray-tracing relativistico open source — GYOTO (Observatoire de Paris), RAPTOR, ipole, grtrans, Blacklight — e l'implementazione aperta del metodo di Luminet. Sono però codici offline (C/C++/Python) che calcolano singoli fotogrammi in minuti/ore: non sono eseguibili in tempo reale in un fragment shader WebGL nel browser.",
      "Quello che integriamo davvero sono le loro formulazioni fisico-matematiche: la geodetica di Schwarzschild, il disco di Novikov–Thorne, il fattore g e l'invariante Iᵥ/ν³, il colore di corpo nero. Il nostro shader le reimplementa in GLSL e le cita; non incorpora il codice esterno. Dichiararlo è parte della regola \"fail loud, never fake\".",
    ],
    faqHeading: "Domande frequenti",
    faq: [
      {
        q: "Le equazioni usate sono reali e corrette?",
        a: "Sì per la geometria del lensing: l'integrazione delle geodetiche nulle nella metrica di Schwarzschild è esatta e riproduce sfera fotonica, anello di Einstein e ombra (parametro d'impatto critico 3√3 M). Velocità orbitale GR, redshift, invariante di Liouville e beaming bolometrico g⁴ usano le formule esatte; il colore è il vero corpo nero della temperatura locale.",
      },
      {
        q: "È identica al buco nero di Interstellar?",
        a: "No. Gargantua usa la metrica di Kerr (rotante) ray-tracciata offline. Qui la base è Schwarzschild in tempo reale; lo spin è un'approssimazione di Lense–Thirring.",
      },
      {
        q: "Posso integrare GYOTO o un codice GR completo?",
        a: "Non in tempo reale nel browser: sono codici offline. Reimplementiamo le loro formulazioni in GLSL e le citiamo. Per immagini scientifiche di precisione si usano proprio quei codici.",
      },
    ],
    refsHeading: "Bibliografia e fonti",
    refs: [
      { cite: "S. M. Carroll, «Lecture Notes on General Relativity» — geodetiche di Schwarzschild (Caltech).", url: "https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html" },
      { cite: "K. Kokkotas, «Particle Trajectories & The Classical Tests», corso di Relatività Generale, Universität Tübingen.", url: "https://www.tat.physik.uni-tuebingen.de/~kokkotas/Teaching/GTR_files/GTR2018_3b.pdf" },
      { cite: "C. Hirata, «Geodesics in the Schwarzschild geometry», ph6820, The Ohio State University.", url: "https://hirata10.github.io/ph6820/lec17_bh_trajectories.pdf" },
      { cite: "J.-P. Luminet (1979), «Image of a spherical black hole with thin accretion disk», Astronomy & Astrophysics 75, 228.", url: "https://ui.adsabs.harvard.edu/abs/1979A%26A....75..228L/abstract" },
      { cite: "N. I. Shakura & R. A. Sunyaev (1973), «Black holes in binary systems», Astronomy & Astrophysics 24, 337." },
      { cite: "I. D. Novikov & K. S. Thorne (1973), «Astrophysics of Black Holes», in Black Holes (Les Houches)." },
      { cite: "B. Paczyński & P. J. Wiita (1980), «Thick accretion disks and supercritical luminosities», Astronomy & Astrophysics 88, 23." },
      { cite: "O. James, E. von Tunzelmann, P. Franklin & K. S. Thorne (2015), «Gravitational lensing by spinning black holes… Interstellar», Classical and Quantum Gravity 32, 065001.", url: "https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
      { cite: "F. H. Vincent et al. (2011), «GYOTO: a new general relativistic ray-tracing code», Classical and Quantum Gravity 28, 225011.", url: "https://arxiv.org/abs/1109.4769" },
      { cite: "C. W. Misner, K. S. Thorne & J. A. Wheeler, «Gravitation» (1973)." },
      { cite: "Colore di corpo nero → sRGB: approssimazione del locus planckiano di N. Bartlett (dati di M. Charity)." },
      { cite: "Stack: Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX. Sviluppo: Fosforonero — Matteo Pizzi (Roma)." },
    ],
    backToLab: "← Torna al Lab",
    openSim: "Apri la simulazione →",
  },
  en: {
    kicker: "Methodology · graduate level · Fosforonero Lab",
    title: "Black hole: mathematical and physical derivation",
    intro: [
      "This page reconstructs, at advanced-university level, the equations driving the simulation: from the Schwarzschild metric to null geodesics, from the relativistic accretion disk to invariant radiative transfer. We state explicitly what is exact, what is approximated and what is a visualization choice.",
      "Everything is in geometrized units G = c = 1; in the renderer we fix the Schwarzschild radius rₛ = 2M = 1.",
    ],
    sections: [
      {
        heading: "1. Schwarzschild metric and null geodesics",
        body: [
          "The exterior geometry of a non-rotating spherical mass is the vacuum Schwarzschild solution of Einstein's equations. In coordinates (t, r, θ, φ):",
          "The timelike and azimuthal Killing vectors yield two first integrals of motion — energy E and angular momentum L per unit mass — along every affine geodesic:",
          "For a photon (null geodesic) the condition gᵤᵥ ẋᵘẋᵛ = 0 reduces, in the equatorial plane, to a radial equation with an effective potential. Setting u = 1/r gives the orbit equation, whose derivative is the photon Binet equation:",
          "The impact parameter is b = L/E. The photon sphere (unstable circular photon orbit) is at r = 3M = 1.5 rₛ, and the observed shadow corresponds to the critical impact parameter bᵪ = 3√3·M. The renderer numerically integrates the equivalent vector form of this geodesic (velocity-Verlet), reproducing lensing, the Einstein ring, the photon sphere and the shadow. (Carroll; Kokkotas, Univ. Tübingen; Hirata, Ohio State.)",
        ],
        eqs: [
          { label: "Schwarzschild line element", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Conserved quantities (Killing vectors)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\,\\dot\\varphi" },
          { label: "Photon orbit equation and its derivative (Binet)", tex: "\\left(\\frac{du}{d\\varphi}\\right)^{2} = \\frac{1}{b^{2}} - (1-2Mu)\\,u^{2} \\;\\Longrightarrow\\; \\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}" },
          { label: "Photon sphere and critical impact parameter (shadow)", tex: "r_{\\mathrm{ph}} = 3M = 1.5\\,r_s, \\qquad b_c = 3\\sqrt{3}\\,M" },
        ],
      },
      {
        heading: "2. Relativistic accretion disk",
        body: [
          "The thin, optically-thick disk follows the Shakura–Sunyaev model in its relativistic Novikov–Thorne version, with a zero-stress boundary condition at the innermost stable circular orbit (ISCO). The locally emitted flux and the effective (Stefan–Boltzmann) temperature are:",
          "For Schwarzschild the ISCO is at rᵢₛ𝒸ₒ = 6M = 3 rₛ. Each annulus radiates as a blackbody at its local temperature: the color is therefore the true blackbody color T → sRGB along the Planckian locus, not an arbitrary gradient. The first computed image of such a disk is due to Luminet (1979). (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
        ],
        eqs: [
          { label: "Disk flux (Novikov–Thorne / Shakura–Sunyaev)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Effective temperature", tex: "T_{\\mathrm{eff}}(r) = \\left(\\frac{F(r)}{\\sigma}\\right)^{1/4}" },
          { label: "Inner edge (ISCO, Schwarzschild)", tex: "r_{\\mathrm{in}} = r_{\\mathrm{ISCO}} = 6M = 3\\,r_s" },
        ],
      },
      {
        heading: "3. Radiative transfer and relativistic effects",
        body: [
          "Along a ray, the quantity Iᵥ/ν³ is invariant (Liouville's theorem for photons). With the redshift factor g = νₒᵦₛ/νₑₘ, for an emitter on a circular orbit g combines gravitational and time dilation with the longitudinal Doppler.",
          "A blackbody seen with factor g remains a blackbody at temperature g·T (Doppler invariance of the Planck spectrum), with bolometric intensity scaling as g⁴. The same g thus drives brightness and color: the approaching side of the disk is brighter and bluer (relativistic beaming), the receding side darker and redder. (Luminet 1979; Vincent et al. 2011, GYOTO.)",
        ],
        eqs: [
          { label: "Liouville invariant", tex: "\\frac{I_\\nu}{\\nu^{3}} = \\text{constant along the ray}" },
          { label: "GR orbital velocity and redshift factor", tex: "v = \\sqrt{\\frac{M}{r-2M}}, \\qquad g = \\frac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\quad \\beta = \\mathbf v\\cdot\\hat{\\mathbf n}_{\\mathrm{obs}}" },
          { label: "Bolometric beaming and color (blackbody)", tex: "I_{\\mathrm{obs}} = g^{4}\\,I_{\\mathrm{em}}, \\qquad B_\\nu(T)\\big|_{g} = B_\\nu(g\\,T)" },
        ],
      },
      {
        heading: "4. Rotation: Kerr and frame dragging",
        body: [
          "A realistic black hole rotates: the correct metric is Kerr, where the dragging of inertial frames (frame dragging) has angular velocity ω = −g_{tφ}/g_{φφ}. The renderer does not integrate Kerr; the Spin slider adds frame dragging in a gravitomagnetic dipole (Lense–Thirring) approximation — physically motivated but NOT the full Kerr metric.",
          "Interstellar's Gargantua uses the true Kerr metric ray-traced offline (James, von Tunzelmann, Franklin & Thorne 2015). Full public GR ray-tracing codes (e.g. GYOTO) integrate Kerr, but not in real time in the browser.",
        ],
        eqs: [
          { label: "Frame-dragging angular velocity (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{far field}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Lense–Thirring approximation used", tex: "\\mathbf a_{\\mathrm{drag}} \\propto \\mathbf v\\times\\mathbf B_g, \\qquad \\mathbf B_g = \\frac{3(\\mathbf J\\cdot\\hat{\\mathbf r})\\,\\hat{\\mathbf r} - \\mathbf J}{r^{3}}" },
        ],
      },
      {
        heading: "5. Playground: body dynamics",
        body: [
          "In the playground the bodies (planets with moons, stars, comets) move in the Paczyński–Wiita pseudo-Newtonian potential, which exactly reproduces the ISCO at 6M and the relativistic plunge without integrating the full geodesics — a standard compromise in N-body / accretion models.",
          "Moons are integrated as a restricted problem: they feel both the black hole and the host planet (within its Hill sphere). Stars crossing the tidal radius are torn into a debris stream (a particle model, not hydrodynamics). (Paczyński–Wiita 1980.)",
        ],
        eqs: [
          { label: "Paczyński–Wiita potential", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Tidal radius (stellar disruption)", tex: "r_t \\simeq R_\\star\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}" },
        ],
      },
      {
        heading: "6. Limits: what it is NOT (scientific honesty)",
        body: [
          "The baseline is Schwarzschild (non-rotating); spin is approximate (Lense–Thirring), not Kerr. The disk is steady and optically thick: it does not solve MHD hydrodynamics, self-gravity, vertical thickness or polarization. Background stars are procedural (their lensing, however, is real). In the playground the added bodies are not lensed and the integration is pseudo-Newtonian, not full-geodesic.",
        ],
      },
    ],
    openHeading: "Open solutions: what we can (and cannot) integrate",
    open: [
      "Excellent open-source relativistic ray-tracing codes exist — GYOTO (Observatoire de Paris), RAPTOR, ipole, grtrans, Blacklight — and an open implementation of Luminet's method. But they are offline codes (C/C++/Python) computing single frames in minutes/hours: they cannot run in real time inside a WebGL fragment shader in the browser.",
      "What we genuinely integrate are their physical–mathematical formulations: the Schwarzschild geodesic, the Novikov–Thorne disk, the g factor and the Iᵥ/ν³ invariant, the blackbody color. Our shader reimplements them in GLSL and cites them; it does not embed the external code. Stating this is part of the \"fail loud, never fake\" rule.",
    ],
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Are the equations used real and correct?",
        a: "Yes for the lensing geometry: integrating null geodesics in the Schwarzschild metric is exact and reproduces the photon sphere, Einstein ring and shadow (critical impact parameter 3√3 M). GR orbital velocity, redshift, the Liouville invariant and bolometric g⁴ beaming use the exact formulas; the color is the true blackbody color of the local temperature.",
      },
      {
        q: "Is it identical to Interstellar's black hole?",
        a: "No. Gargantua uses the Kerr (rotating) metric ray-traced offline. Here the baseline is Schwarzschild in real time; spin is a Lense–Thirring approximation.",
      },
      {
        q: "Can I integrate GYOTO or a full GR code?",
        a: "Not in real time in the browser: those are offline codes. We reimplement their formulations in GLSL and cite them. Precision scientific images do use exactly those codes.",
      },
    ],
    refsHeading: "References & sources",
    refs: [
      { cite: "S. M. Carroll, “Lecture Notes on General Relativity” — Schwarzschild geodesics (Caltech).", url: "https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html" },
      { cite: "K. Kokkotas, “Particle Trajectories & The Classical Tests”, General Relativity course, Universität Tübingen.", url: "https://www.tat.physik.uni-tuebingen.de/~kokkotas/Teaching/GTR_files/GTR2018_3b.pdf" },
      { cite: "C. Hirata, “Geodesics in the Schwarzschild geometry”, ph6820, The Ohio State University.", url: "https://hirata10.github.io/ph6820/lec17_bh_trajectories.pdf" },
      { cite: "J.-P. Luminet (1979), “Image of a spherical black hole with thin accretion disk”, Astronomy & Astrophysics 75, 228.", url: "https://ui.adsabs.harvard.edu/abs/1979A%26A....75..228L/abstract" },
      { cite: "N. I. Shakura & R. A. Sunyaev (1973), “Black holes in binary systems”, Astronomy & Astrophysics 24, 337." },
      { cite: "I. D. Novikov & K. S. Thorne (1973), “Astrophysics of Black Holes”, in Black Holes (Les Houches)." },
      { cite: "B. Paczyński & P. J. Wiita (1980), “Thick accretion disks and supercritical luminosities”, Astronomy & Astrophysics 88, 23." },
      { cite: "O. James, E. von Tunzelmann, P. Franklin & K. S. Thorne (2015), “Gravitational lensing by spinning black holes… Interstellar”, Classical and Quantum Gravity 32, 065001.", url: "https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
      { cite: "F. H. Vincent et al. (2011), “GYOTO: a new general relativistic ray-tracing code”, Classical and Quantum Gravity 28, 225011.", url: "https://arxiv.org/abs/1109.4769" },
      { cite: "C. W. Misner, K. S. Thorne & J. A. Wheeler, “Gravitation” (1973)." },
      { cite: "Blackbody color → sRGB: N. Bartlett's Planckian-locus approximation (data by M. Charity)." },
      { cite: "Stack: Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX. Development: Fosforonero — Matteo Pizzi (Rome, Italy)." },
    ],
    backToLab: "← Back to Lab",
    openSim: "Open the simulation →",
  },
};

export function BlackHoleAboutView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const simHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";
  const labHref = locale === "it" ? "/lab" : "/en/lab";

  return (
    <div className="bh-about-page">
      <article className="bh-about">
        <header className="bh-about__head">
          <span className="bh-about__kicker">{t.kicker}</span>
          <h1 className="bh-about__title">{t.title}</h1>
          {t.intro.map((p, i) => (
            <p key={i} className="bh-about__intro">{p}</p>
          ))}
          <div className="bh-about__actions">
            <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
            <Link href={labHref} className="bh-about__link">{t.backToLab}</Link>
          </div>
        </header>

        {t.sections.map((s, i) => (
          <section key={i} className="bh-about__section">
            <h2>{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.eqs && (
              <div className="bh-about__eqs">
                {s.eqs.map((e, k) => (
                  <div key={k} className="bh-about__eq">
                    <span className="bh-about__eq-label">{e.label}</span>
                    <Tex tex={e.tex} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="bh-about__section">
          <h2>{t.openHeading}</h2>
          {t.open.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section className="bh-about__section">
          <h2>{t.faqHeading}</h2>
          {t.faq.map((f, i) => (
            <div key={i} className="bh-about__faq">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <section className="bh-about__section">
          <h2>{t.refsHeading}</h2>
          <ol className="bh-about__refs">
            {t.refs.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.cite}</a>
                ) : (
                  r.cite
                )}
              </li>
            ))}
          </ol>
        </section>

        <footer className="bh-about__foot">
          <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
        </footer>
      </article>
    </div>
  );
}
