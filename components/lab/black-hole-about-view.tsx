"use client";

import Link from "next/link";

// ---------------------------------------------------------------------------
// Black-hole lab — about / methodology page (bilingual).
// Documents every equation actually used in the renderer and credits the
// real sources, in line with the project's "fail loud, never fake" rule.
// ---------------------------------------------------------------------------

type Locale = "it" | "en";

type Section = { heading: string; body: string[]; eqs?: { label: string; eq: string }[] };

type Copy = {
  kicker: string;
  title: string;
  intro: string[];
  sections: Section[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  creditsHeading: string;
  credits: { label: string; detail: string }[];
  backToLab: string;
  openSim: string;
};

const COPY: Record<Locale, Copy> = {
  it: {
    kicker: "Metodologia · Fosforonero Lab",
    title: "Buco nero: la fisica dietro la simulazione",
    intro: [
      "Questa pagina documenta esattamente quali equazioni governano la simulazione del buco nero e che cosa è fisicamente corretto, approssimato o artistico. Niente è inventato: dove usiamo una scorciatoia, lo dichiariamo.",
      "Il renderer integra il cammino dei fotoni nello spazio-tempo curvo di un buco nero di Schwarzschild (non rotante) direttamente in un fragment shader WebGL, in tempo reale.",
    ],
    sections: [
      {
        heading: "1. Lensing gravitazionale (geodetiche dei fotoni)",
        body: [
          "Per ogni pixel viene lanciato un raggio dalla camera e se ne integra la geodetica nulla nella metrica di Schwarzschild. La traiettoria della luce obbedisce all'equazione di Binet per i fotoni:",
          "Nel codice questa equazione è integrata in forma vettoriale con un'accelerazione che curva il raggio verso la massa, usando un integratore velocity-Verlet. Il termine conservato h² è il quadrato del momento angolare del fotone.",
          "Da questo emergono correttamente la sfera fotonica a 1.5 rₛ, l'anello di Einstein delle stelle di sfondo e l'ombra centrale. L'unico errore residuo è numerico (passo d'integrazione finito), non fisico.",
        ],
        eqs: [
          { label: "Equazione di Binet (fotoni), u = 1/r", eq: "d²u/dφ² + u = 3M·u²" },
          { label: "Accelerazione integrata nel renderer (rₛ = 1, M = ½)", eq: "a = −1.5 · h² · r / |r|⁵ ,  h² = |r × v|²" },
          { label: "Orizzonte degli eventi · sfera fotonica", eq: "r_h = rₛ = 2M ,  r_ph = 1.5 rₛ" },
        ],
      },
      {
        heading: "2. Disco di accrescimento (modello a disco sottile)",
        body: [
          "Il disco usa il profilo del disco sottile di Shakura–Sunyaev: il flusso emesso scala come r⁻³ con una correzione di bordo interno che lo annulla all'ultima orbita circolare stabile (ISCO). La temperatura segue il flusso secondo la legge di Stefan–Boltzmann.",
          "Per un buco nero di Schwarzschild l'ISCO è a 3 rₛ (= 6M): è il bordo interno del disco. Il colore non è un gradiente scelto a mano, ma il vero colore di corpo nero della temperatura locale, calcolato lungo il locus planckiano.",
        ],
        eqs: [
          { label: "Flusso del disco (Shakura–Sunyaev)", eq: "F(r) ∝ r⁻³ · (1 − √(r_in / r))" },
          { label: "Temperatura locale", eq: "T(r) ∝ F(r)^¼" },
          { label: "Bordo interno (ISCO, Schwarzschild)", eq: "r_in = r_ISCO = 3 rₛ = 6M" },
          { label: "Colore", eq: "corpo nero T → sRGB (locus planckiano)" },
        ],
      },
      {
        heading: "3. Effetti relativistici (Doppler e redshift)",
        body: [
          "La materia del disco orbita a velocità relativistiche. Usiamo la velocità esatta dell'orbita circolare di Schwarzschild misurata localmente: all'ISCO vale esattamente 0.5c.",
          "Il rapporto di frequenza totale g (osservata/emessa) combina dilatazione gravitazionale e temporale dell'orologio in orbita con il Doppler longitudinale. Lo stesso fattore g pilota sia il beaming relativistico (la luminosità) sia lo spostamento di colore (legge di Wien): il lato in avvicinamento è più luminoso e più blu, quello in allontanamento più scuro e più rosso.",
        ],
        eqs: [
          { label: "Velocità orbitale GR (locale)", eq: "v = √(M / (r − 2M))  →  0.5c all'ISCO" },
          { label: "Fattore di frequenza totale", eq: "g = √(1 − 3M/r) / (1 − β) ,  β = v·n̂_oss" },
          { label: "Beaming relativistico", eq: "I_oss ∝ g³" },
          { label: "Spostamento di colore (Wien)", eq: "T_oss = T · g" },
        ],
      },
      {
        heading: "4. Limiti: cosa NON è (onestà scientifica)",
        body: [
          "È un buco nero di Schwarzschild, cioè NON rotante. Il celebre Gargantua di Interstellar usa la metrica di Kerr (rotante) con frame-dragging, ray-tracciata offline (ore per fotogramma): qui è un'approssimazione in tempo reale.",
          "Il modello di emissione del disco è ispirato a Shakura–Sunyaev ma non è un trasporto radiativo: turbolenza e dettaglio sono procedurali. Le stelle di sfondo sono procedurali (il loro lensing, però, è reale). Non sono modellati spessore del disco, opacità, getti o immagini di ordine superiore oltre il primo impatto.",
        ],
      },
    ],
    faqHeading: "Domande frequenti",
    faq: [
      {
        q: "Le equazioni usate sono reali e corrette?",
        a: "Sì per la geometria del lensing: l'integrazione delle geodetiche nulle nella metrica di Schwarzschild è fisica vera e riproduce correttamente sfera fotonica, anello di Einstein e ombra. Redshift gravitazionale, velocità orbitale GR e beaming relativistico usano le formule esatte. Il colore del disco è il vero corpo nero della temperatura locale.",
      },
      {
        q: "È identica al buco nero di Interstellar?",
        a: "No. Interstellar (Gargantua) usa la metrica di Kerr di un buco nero rotante, calcolata offline. Questa simulazione è di Schwarzschild (non rotante) e gira in tempo reale nel browser.",
      },
      {
        q: "Cosa è artistico e non fisico?",
        a: "La turbolenza del disco, le stelle di sfondo e le scale assolute di luminosità e temperatura sono parametri visivi. Il profilo radiale, il colore di corpo nero e gli effetti relativistici sono invece fisicamente fondati.",
      },
    ],
    creditsHeading: "Crediti e fonti",
    credits: [
      { label: "Relatività generale (geodetiche)", detail: "Misner, Thorne & Wheeler, «Gravitation» (1973); B. Schutz, «A First Course in General Relativity»." },
      { label: "Disco sottile di accrescimento", detail: "Shakura, N. I. & Sunyaev, R. A. (1973), «Black holes in binary systems. Observational appearance», Astronomy & Astrophysics 24, 337–355." },
      { label: "Lensing di Interstellar / Gargantua", detail: "James, von Tunzelmann, Franklin & Thorne (2015), «Gravitational lensing by spinning black holes…», Classical and Quantum Gravity 32, 065001." },
      { label: "Tecnica di ray-marching geodetico real-time", detail: "Riferimenti pubblici: R. Antonelli, «Visualizing a black hole»; O. Seiskari; rossning92, «Rendering a Black Hole in WebGL»." },
      { label: "Colore di corpo nero → sRGB", detail: "Approssimazione del locus planckiano di Neil Bartlett, basata sui dati «What color is a blackbody» di Mitchell Charity." },
      { label: "Stack di rendering", detail: "Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing." },
      { label: "Sviluppo", detail: "Fosforonero — Matteo Pizzi (Roma)." },
    ],
    backToLab: "← Torna al Lab",
    openSim: "Apri la simulazione →",
  },
  en: {
    kicker: "Methodology · Fosforonero Lab",
    title: "Black hole: the physics behind the simulation",
    intro: [
      "This page documents exactly which equations drive the black-hole simulation and what is physically correct, approximated, or artistic. Nothing is faked: wherever we take a shortcut, we say so.",
      "The renderer integrates photon paths through the curved spacetime of a Schwarzschild (non-rotating) black hole directly in a WebGL fragment shader, in real time.",
    ],
    sections: [
      {
        heading: "1. Gravitational lensing (photon geodesics)",
        body: [
          "For each pixel a camera ray is cast and its null geodesic is integrated in the Schwarzschild metric. The light path obeys the photon Binet equation:",
          "In code this is integrated in vector form with an acceleration that bends the ray toward the mass, using a velocity-Verlet integrator. The conserved term h² is the square of the photon's angular momentum.",
          "This correctly yields the photon sphere at 1.5 rₛ, the Einstein ring of background stars and the central shadow. The only residual error is numerical (finite step size), not physical.",
        ],
        eqs: [
          { label: "Photon Binet equation, u = 1/r", eq: "d²u/dφ² + u = 3M·u²" },
          { label: "Acceleration integrated in the renderer (rₛ = 1, M = ½)", eq: "a = −1.5 · h² · r / |r|⁵ ,  h² = |r × v|²" },
          { label: "Event horizon · photon sphere", eq: "r_h = rₛ = 2M ,  r_ph = 1.5 rₛ" },
        ],
      },
      {
        heading: "2. Accretion disk (thin-disk model)",
        body: [
          "The disk uses the Shakura–Sunyaev thin-disk profile: emitted flux scales as r⁻³ with an inner-edge correction that vanishes at the innermost stable circular orbit (ISCO). Temperature follows the flux via the Stefan–Boltzmann law.",
          "For a Schwarzschild black hole the ISCO sits at 3 rₛ (= 6M): that is the disk's inner edge. The color is not a hand-picked gradient but the true blackbody color of the local temperature, computed along the Planckian locus.",
        ],
        eqs: [
          { label: "Disk flux (Shakura–Sunyaev)", eq: "F(r) ∝ r⁻³ · (1 − √(r_in / r))" },
          { label: "Local temperature", eq: "T(r) ∝ F(r)^¼" },
          { label: "Inner edge (ISCO, Schwarzschild)", eq: "r_in = r_ISCO = 3 rₛ = 6M" },
          { label: "Color", eq: "blackbody T → sRGB (Planckian locus)" },
        ],
      },
      {
        heading: "3. Relativistic effects (Doppler & redshift)",
        body: [
          "Disk matter orbits at relativistic speeds. We use the exact locally-measured Schwarzschild circular-orbit velocity: at the ISCO it is exactly 0.5c.",
          "The total frequency ratio g (observed/emitted) combines the gravitational and time-dilation of the orbiting clock with the longitudinal Doppler. The same g drives both relativistic beaming (brightness) and the color shift (Wien's law): the approaching side is brighter and bluer, the receding side darker and redder.",
        ],
        eqs: [
          { label: "GR orbital velocity (local)", eq: "v = √(M / (r − 2M))  →  0.5c at the ISCO" },
          { label: "Total frequency ratio", eq: "g = √(1 − 3M/r) / (1 − β) ,  β = v·n̂_obs" },
          { label: "Relativistic beaming", eq: "I_obs ∝ g³" },
          { label: "Color shift (Wien)", eq: "T_obs = T · g" },
        ],
      },
      {
        heading: "4. Limits: what it is NOT (scientific honesty)",
        body: [
          "It is a Schwarzschild black hole, i.e. NON-rotating. The famous Gargantua from Interstellar uses the Kerr (rotating) metric with frame-dragging, ray-traced offline (hours per frame): this is a real-time approximation.",
          "The disk emission model is Shakura–Sunyaev-inspired but is not radiative transfer: turbulence and detail are procedural. Background stars are procedural (their lensing, however, is real). Disk thickness, opacity, jets and higher-order images beyond the first intersection are not modeled.",
        ],
      },
    ],
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Are the equations used real and correct?",
        a: "Yes for the lensing geometry: integrating null geodesics in the Schwarzschild metric is real physics and correctly reproduces the photon sphere, Einstein ring and shadow. Gravitational redshift, GR orbital velocity and relativistic beaming use the exact formulas. The disk color is the true blackbody color of the local temperature.",
      },
      {
        q: "Is it identical to Interstellar's black hole?",
        a: "No. Interstellar (Gargantua) uses the Kerr metric of a rotating black hole, computed offline. This simulation is Schwarzschild (non-rotating) and runs in real time in the browser.",
      },
      {
        q: "What is artistic rather than physical?",
        a: "The disk turbulence, the background stars and the absolute brightness/temperature scales are visual parameters. The radial profile, the blackbody color and the relativistic effects are physically grounded.",
      },
    ],
    creditsHeading: "Credits & sources",
    credits: [
      { label: "General relativity (geodesics)", detail: "Misner, Thorne & Wheeler, “Gravitation” (1973); B. Schutz, “A First Course in General Relativity”." },
      { label: "Thin accretion disk", detail: "Shakura, N. I. & Sunyaev, R. A. (1973), “Black holes in binary systems. Observational appearance”, Astronomy & Astrophysics 24, 337–355." },
      { label: "Interstellar / Gargantua lensing", detail: "James, von Tunzelmann, Franklin & Thorne (2015), “Gravitational lensing by spinning black holes…”, Classical and Quantum Gravity 32, 065001." },
      { label: "Real-time geodesic ray-marching technique", detail: "Public references: R. Antonelli, “Visualizing a black hole”; O. Seiskari; rossning92, “Rendering a Black Hole in WebGL”." },
      { label: "Blackbody color → sRGB", detail: "Neil Bartlett's Planckian-locus approximation, based on Mitchell Charity's “What color is a blackbody” data." },
      { label: "Rendering stack", detail: "Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing." },
      { label: "Development", detail: "Fosforonero — Matteo Pizzi (Rome, Italy)." },
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
                  <code className="bh-about__eq-formula">{e.eq}</code>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

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
        <h2>{t.creditsHeading}</h2>
        <dl className="bh-about__credits">
          {t.credits.map((c, i) => (
            <div key={i} className="bh-about__credit">
              <dt>{c.label}</dt>
              <dd>{c.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="bh-about__foot">
        <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
      </footer>
    </article>
    </div>
  );
}
