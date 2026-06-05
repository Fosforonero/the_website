"use client";

import Link from "next/link";
import katex from "katex";

// ---------------------------------------------------------------------------
// Black-hole lab — about / methodology page (bilingual).
// Documents every equation actually used in the renderer and credits the
// real sources, in line with the project's "fail loud, never fake" rule.
// Equations are typeset with KaTeX.
// ---------------------------------------------------------------------------

type Locale = "it" | "en";

type Section = { heading: string; body: string[]; eqs?: { label: string; tex: string }[] };

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

function Tex({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  return <span className="bh-about__tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

const COPY: Record<Locale, Copy> = {
  it: {
    kicker: "Metodologia · Fosforonero Lab",
    title: "Buco nero: la fisica dietro la simulazione",
    intro: [
      "Questa pagina documenta esattamente quali equazioni governano la simulazione del buco nero e che cosa è fisicamente corretto, approssimato o di visualizzazione. Niente è inventato: dove usiamo una scorciatoia, lo dichiariamo.",
      "Il renderer integra il cammino dei fotoni nello spazio-tempo curvo di un buco nero di Schwarzschild (non rotante) direttamente in un fragment shader WebGL, in tempo reale.",
    ],
    sections: [
      {
        heading: "1. Lensing gravitazionale (geodetiche dei fotoni)",
        body: [
          "Per ogni pixel viene lanciato un raggio dalla camera e se ne integra la geodetica nulla nella metrica di Schwarzschild. La traiettoria della luce obbedisce all'equazione di Binet per i fotoni:",
          "Nel codice è integrata in forma vettoriale con un'accelerazione che curva il raggio verso la massa (velocity-Verlet). Il termine conservato h² è il quadrato del momento angolare del fotone.",
          "Da questo emergono correttamente la sfera fotonica, l'anello di Einstein e l'ombra centrale. L'unico errore residuo è numerico (passo finito), non fisico.",
        ],
        eqs: [
          { label: "Equazione di Binet (fotoni), u = 1/r", tex: "\\frac{d^2u}{d\\varphi^2} + u = 3M\\,u^2" },
          { label: "Accelerazione integrata (rₛ = 1, M = ½)", tex: "\\mathbf{a} = -\\tfrac{3}{2}\\,h^2\\,\\frac{\\mathbf{r}}{|\\mathbf{r}|^{5}}, \\qquad h^2 = |\\mathbf{r}\\times\\mathbf{v}|^2" },
          { label: "Orizzonte · sfera fotonica", tex: "r_h = r_s = 2M, \\qquad r_{\\mathrm{ph}} = 1.5\\,r_s" },
        ],
      },
      {
        heading: "2. Disco di accrescimento (modello a disco sottile)",
        body: [
          "Il disco usa il profilo del disco sottile di Shakura–Sunyaev: il flusso emesso scala come r⁻³ con una correzione che lo annulla all'ultima orbita circolare stabile (ISCO). La temperatura segue il flusso (Stefan–Boltzmann).",
          "Per un buco nero di Schwarzschild l'ISCO è a 3 rₛ. Il colore non è un gradiente scelto a mano, ma il vero colore di corpo nero della temperatura locale, calcolato lungo il locus planckiano.",
        ],
        eqs: [
          { label: "Flusso del disco (Shakura–Sunyaev)", tex: "F(r) \\propto r^{-3}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Temperatura locale", tex: "T(r) \\propto F(r)^{1/4}" },
          { label: "Bordo interno (ISCO, Schwarzschild)", tex: "r_{\\mathrm{in}} = r_{\\mathrm{ISCO}} = 3\\,r_s = 6M" },
          { label: "Colore", tex: "\\text{corpo nero}(T)\\;\\rightarrow\\;\\text{sRGB}" },
        ],
      },
      {
        heading: "3. Effetti relativistici (Doppler, redshift, spin)",
        body: [
          "La materia del disco orbita a velocità relativistiche: usiamo la velocità esatta dell'orbita circolare di Schwarzschild misurata localmente (0.5c all'ISCO).",
          "Il rapporto di frequenza totale g combina dilatazione gravitazionale e temporale con il Doppler longitudinale. Un corpo nero visto con fattore g resta un corpo nero a temperatura g·T, con intensità bolometrica ∝ g⁴: lo stesso g pilota luminosità e colore. Lo slider Spin aggiunge il frame-dragging in approssimazione di Lense–Thirring (non la metrica di Kerr completa).",
        ],
        eqs: [
          { label: "Velocità orbitale GR (locale)", tex: "v = \\sqrt{\\dfrac{M}{r - 2M}} \\;\\rightarrow\\; 0.5\\,c \\ \\text{(ISCO)}" },
          { label: "Fattore di frequenza totale", tex: "g = \\dfrac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\qquad \\beta = \\mathbf{v}\\cdot\\hat{\\mathbf{n}}_{\\mathrm{oss}}" },
          { label: "Beaming + colore (corpo nero)", tex: "I_{\\mathrm{oss}} \\propto g^{4}, \\qquad T_{\\mathrm{oss}} = g\\,T" },
          { label: "Frame-dragging approssimato (Lense–Thirring)", tex: "\\mathbf{a}_{\\mathrm{drag}} \\propto \\mathbf{v}\\times\\mathbf{B}_g, \\qquad \\mathbf{B}_g = \\dfrac{3(\\mathbf{J}\\cdot\\hat{\\mathbf{r}})\\,\\hat{\\mathbf{r}} - \\mathbf{J}}{r^{3}}" },
        ],
      },
      {
        heading: "4. Playground: dinamica dei corpi",
        body: [
          "Nel playground i corpi (pianeti, stelle, comete) si muovono nel potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce l'ISCO e la caduta relativistica verso l'orizzonte senza dover integrare le geodetiche complete.",
          "Le stelle che entrano nel raggio mareale vengono disgregate in uno stream di detriti (modello a particelle, non idrodinamica).",
        ],
        eqs: [
          { label: "Potenziale di Paczyński–Wiita", tex: "\\Phi(r) = -\\dfrac{GM}{r - r_s}" },
          { label: "Raggio mareale (disgregazione)", tex: "r_t \\simeq R_\\star\\left(\\dfrac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}" },
        ],
      },
      {
        heading: "5. Limiti: cosa NON è (onestà scientifica)",
        body: [
          "La base è un buco nero di Schwarzschild (non rotante). Lo slider Spin aggiunge il frame-dragging in approssimazione di Lense–Thirring, fisicamente motivato ma NON la metrica di Kerr completa. Il Gargantua di Interstellar usa la vera metrica di Kerr ray-tracciata offline (ore per fotogramma): qui è in tempo reale.",
          "Il disco è un modello stazionario otticamente spesso (Shakura–Sunyaev) con corpo nero e trasferimento relativistico; non risolve l'idrodinamica, l'autogravità né lo spessore. Le stelle di sfondo sono procedurali (il loro lensing è reale). Nel playground i corpi aggiunti non sono lensati.",
        ],
      },
    ],
    faqHeading: "Domande frequenti",
    faq: [
      {
        q: "Le equazioni usate sono reali e corrette?",
        a: "Sì per la geometria del lensing: l'integrazione delle geodetiche nulle nella metrica di Schwarzschild è fisica vera e riproduce correttamente sfera fotonica, anello di Einstein e ombra. Velocità orbitale GR, redshift gravitazionale e beaming relativistico (g⁴) usano le formule esatte; il colore del disco è il vero corpo nero della temperatura locale.",
      },
      {
        q: "È identica al buco nero di Interstellar?",
        a: "No. Interstellar (Gargantua) usa la metrica di Kerr di un buco nero rotante, calcolata offline. Questa simulazione è di Schwarzschild (non rotante) e gira in tempo reale; lo spin è un'approssimazione di Lense–Thirring.",
      },
      {
        q: "Cosa resta di visualizzazione e non di fisica?",
        a: "Le stelle di sfondo e le scale assolute di temperatura e luminosità sono parametri di visualizzazione; lo spin è frame-dragging approssimato e i corpi del playground non sono lensati. Profilo del disco, colore di corpo nero ed effetti relativistici sono fisicamente fondati.",
      },
    ],
    creditsHeading: "Crediti e fonti",
    credits: [
      { label: "Relatività generale (geodetiche)", detail: "Misner, Thorne & Wheeler, «Gravitation» (1973); B. Schutz, «A First Course in General Relativity»." },
      { label: "Disco sottile di accrescimento", detail: "Shakura, N. I. & Sunyaev, R. A. (1973), «Black holes in binary systems. Observational appearance», Astronomy & Astrophysics 24, 337–355." },
      { label: "Potenziale pseudo-newtoniano", detail: "Paczyński, B. & Wiita, P. J. (1980), «Thick accretion disks and supercritical luminosities», Astronomy & Astrophysics 88, 23." },
      { label: "Lensing di Interstellar / Gargantua", detail: "James, von Tunzelmann, Franklin & Thorne (2015), «Gravitational lensing by spinning black holes…», Classical and Quantum Gravity 32, 065001." },
      { label: "Tecnica di ray-marching geodetico real-time", detail: "Riferimenti pubblici: R. Antonelli, «Visualizing a black hole»; O. Seiskari; rossning92, «Rendering a Black Hole in WebGL»." },
      { label: "Colore di corpo nero → sRGB", detail: "Approssimazione del locus planckiano di Neil Bartlett, basata sui dati «What color is a blackbody» di Mitchell Charity." },
      { label: "Stack di rendering", detail: "Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX." },
      { label: "Sviluppo", detail: "Fosforonero — Matteo Pizzi (Roma)." },
    ],
    backToLab: "← Torna al Lab",
    openSim: "Apri la simulazione →",
  },
  en: {
    kicker: "Methodology · Fosforonero Lab",
    title: "Black hole: the physics behind the simulation",
    intro: [
      "This page documents exactly which equations drive the black-hole simulation and what is physically correct, approximated, or a visualization choice. Nothing is faked: wherever we take a shortcut, we say so.",
      "The renderer integrates photon paths through the curved spacetime of a Schwarzschild (non-rotating) black hole directly in a WebGL fragment shader, in real time.",
    ],
    sections: [
      {
        heading: "1. Gravitational lensing (photon geodesics)",
        body: [
          "For each pixel a camera ray is cast and its null geodesic is integrated in the Schwarzschild metric. The light path obeys the photon Binet equation:",
          "In code it is integrated in vector form with an acceleration that bends the ray toward the mass (velocity-Verlet). The conserved term h² is the square of the photon's angular momentum.",
          "This correctly yields the photon sphere, the Einstein ring and the central shadow. The only residual error is numerical (finite step), not physical.",
        ],
        eqs: [
          { label: "Photon Binet equation, u = 1/r", tex: "\\frac{d^2u}{d\\varphi^2} + u = 3M\\,u^2" },
          { label: "Acceleration integrated (rₛ = 1, M = ½)", tex: "\\mathbf{a} = -\\tfrac{3}{2}\\,h^2\\,\\frac{\\mathbf{r}}{|\\mathbf{r}|^{5}}, \\qquad h^2 = |\\mathbf{r}\\times\\mathbf{v}|^2" },
          { label: "Event horizon · photon sphere", tex: "r_h = r_s = 2M, \\qquad r_{\\mathrm{ph}} = 1.5\\,r_s" },
        ],
      },
      {
        heading: "2. Accretion disk (thin-disk model)",
        body: [
          "The disk uses the Shakura–Sunyaev thin-disk profile: emitted flux scales as r⁻³ with a correction that vanishes at the innermost stable circular orbit (ISCO). Temperature follows the flux (Stefan–Boltzmann).",
          "For a Schwarzschild black hole the ISCO sits at 3 rₛ. The color is not a hand-picked gradient but the true blackbody color of the local temperature, computed along the Planckian locus.",
        ],
        eqs: [
          { label: "Disk flux (Shakura–Sunyaev)", tex: "F(r) \\propto r^{-3}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Local temperature", tex: "T(r) \\propto F(r)^{1/4}" },
          { label: "Inner edge (ISCO, Schwarzschild)", tex: "r_{\\mathrm{in}} = r_{\\mathrm{ISCO}} = 3\\,r_s = 6M" },
          { label: "Color", tex: "\\text{blackbody}(T)\\;\\rightarrow\\;\\text{sRGB}" },
        ],
      },
      {
        heading: "3. Relativistic effects (Doppler, redshift, spin)",
        body: [
          "Disk matter orbits at relativistic speeds: we use the exact locally-measured Schwarzschild circular-orbit velocity (0.5c at the ISCO).",
          "The total frequency ratio g combines gravitational and time dilation with the longitudinal Doppler. A blackbody seen with factor g stays a blackbody at temperature g·T, with bolometric intensity ∝ g⁴: the same g drives brightness and color. The Spin slider adds frame dragging in the Lense–Thirring approximation (not the full Kerr metric).",
        ],
        eqs: [
          { label: "GR orbital velocity (local)", tex: "v = \\sqrt{\\dfrac{M}{r - 2M}} \\;\\rightarrow\\; 0.5\\,c \\ \\text{(ISCO)}" },
          { label: "Total frequency ratio", tex: "g = \\dfrac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\qquad \\beta = \\mathbf{v}\\cdot\\hat{\\mathbf{n}}_{\\mathrm{obs}}" },
          { label: "Beaming + color (blackbody)", tex: "I_{\\mathrm{obs}} \\propto g^{4}, \\qquad T_{\\mathrm{obs}} = g\\,T" },
          { label: "Approximate frame dragging (Lense–Thirring)", tex: "\\mathbf{a}_{\\mathrm{drag}} \\propto \\mathbf{v}\\times\\mathbf{B}_g, \\qquad \\mathbf{B}_g = \\dfrac{3(\\mathbf{J}\\cdot\\hat{\\mathbf{r}})\\,\\hat{\\mathbf{r}} - \\mathbf{J}}{r^{3}}" },
        ],
      },
      {
        heading: "4. Playground: body dynamics",
        body: [
          "In the playground the bodies (planets, stars, comets) move in the Paczyński–Wiita pseudo-Newtonian potential, which reproduces the ISCO and the relativistic plunge without integrating the full geodesics.",
          "Stars crossing the tidal radius are torn into a debris stream (a particle model, not hydrodynamics).",
        ],
        eqs: [
          { label: "Paczyński–Wiita potential", tex: "\\Phi(r) = -\\dfrac{GM}{r - r_s}" },
          { label: "Tidal radius (disruption)", tex: "r_t \\simeq R_\\star\\left(\\dfrac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}" },
        ],
      },
      {
        heading: "5. Limits: what it is NOT (scientific honesty)",
        body: [
          "The baseline is a Schwarzschild (non-rotating) black hole. The Spin slider adds Lense–Thirring frame dragging, physically motivated but NOT the full Kerr metric. Interstellar's Gargantua uses the true Kerr metric ray-traced offline (hours per frame): this is real time.",
          "The disk is a steady, optically-thick model (Shakura–Sunyaev) with blackbody emission and relativistic transfer; it does not solve hydrodynamics, self-gravity or thickness. Background stars are procedural (their lensing is real). In the playground the added bodies are not lensed.",
        ],
      },
    ],
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Are the equations used real and correct?",
        a: "Yes for the lensing geometry: integrating null geodesics in the Schwarzschild metric is real physics and correctly reproduces the photon sphere, Einstein ring and shadow. GR orbital velocity, gravitational redshift and relativistic beaming (g⁴) use the exact formulas; the disk color is the true blackbody color of the local temperature.",
      },
      {
        q: "Is it identical to Interstellar's black hole?",
        a: "No. Interstellar (Gargantua) uses the Kerr metric of a rotating black hole, computed offline. This simulation is Schwarzschild (non-rotating) and runs in real time; spin is a Lense–Thirring approximation.",
      },
      {
        q: "What is a visualization choice rather than physics?",
        a: "The background stars and the absolute temperature/brightness scales are visualization parameters; spin is approximate frame dragging and the playground bodies are not lensed. The disk profile, the blackbody color and the relativistic effects are physically grounded.",
      },
    ],
    creditsHeading: "Credits & sources",
    credits: [
      { label: "General relativity (geodesics)", detail: "Misner, Thorne & Wheeler, “Gravitation” (1973); B. Schutz, “A First Course in General Relativity”." },
      { label: "Thin accretion disk", detail: "Shakura, N. I. & Sunyaev, R. A. (1973), “Black holes in binary systems. Observational appearance”, Astronomy & Astrophysics 24, 337–355." },
      { label: "Pseudo-Newtonian potential", detail: "Paczyński, B. & Wiita, P. J. (1980), “Thick accretion disks and supercritical luminosities”, Astronomy & Astrophysics 88, 23." },
      { label: "Interstellar / Gargantua lensing", detail: "James, von Tunzelmann, Franklin & Thorne (2015), “Gravitational lensing by spinning black holes…”, Classical and Quantum Gravity 32, 065001." },
      { label: "Real-time geodesic ray-marching technique", detail: "Public references: R. Antonelli, “Visualizing a black hole”; O. Seiskari; rossning92, “Rendering a Black Hole in WebGL”." },
      { label: "Blackbody color → sRGB", detail: "Neil Bartlett's Planckian-locus approximation, based on Mitchell Charity's “What color is a blackbody” data." },
      { label: "Rendering stack", detail: "Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX." },
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
                    <Tex tex={e.tex} />
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
