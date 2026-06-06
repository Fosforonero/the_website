"use client";

import Link from "next/link";

// ---------------------------------------------------------------------------
// Black-hole lab — standalone FAQ (bilingual). Real questions people ask,
// short honest answers, each linking to the relevant in-depth about section.
// The same data drives the FAQPage JSON-LD on the page wrappers.
// ---------------------------------------------------------------------------

export type FaqItem = { q: string; a: string; sec?: number };
type Locale = "it" | "en";

export const FAQ: Record<Locale, FaqItem[]> = {
  it: [
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
      a: "Sì. Il bordo interno è l'ISCO prograda di Kerr (formula di Bardeen): si stringe verso il buco man mano che lo spin aumenta. Il Doppler e il redshift seguono la metrica di Kerr. L'unica approssimazione rimasta è la forma del profilo radiale del flusso (calcolata per a=0 e riscalata sull'ISCO).",
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
      q: "Perché su mobile ogni tanto rallenta?",
      a: "Il ray-tracing delle geodetiche di Kerr è pesante: ogni pixel integra la traiettoria del fotone, e il fragment shader gira sulla GPU del telefono. Se va a scatti, abbassa il preset Qualità (Media o Bassa): riduce i passi d'integrazione e la risoluzione.",
    },
    {
      q: "Come avete scelto i colori del disco?",
      a: "Non sono inventati. Ogni anello del disco ha una temperatura (dal flusso di Page–Thorne via Stefan–Boltzmann) e mostriamo il vero colore di corpo nero di quella temperatura (locus planckiano → sRGB), poi spostato dal redshift gravitazionale e dal Doppler relativistico.",
      sec: 4,
    },
  ],
  en: [
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
      a: "Yes. The inner edge is the prograde Kerr ISCO (Bardeen's formula): it shrinks toward the hole as spin increases. The Doppler and redshift follow the Kerr metric. The only remaining approximation is the shape of the radial flux profile (computed for a=0 and rescaled to the ISCO).",
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
      q: "Why does it sometimes slow down on mobile?",
      a: "Ray-tracing Kerr geodesics is heavy: each pixel integrates the photon's path, and the fragment shader runs on the phone's GPU. If it stutters, lower the Quality preset (Medium or Low): it reduces the integration steps and the resolution.",
    },
    {
      q: "How did you choose the disk colours?",
      a: "They are not invented. Each ring of the disk has a temperature (from the Page–Thorne flux via Stefan–Boltzmann) and we show the true blackbody colour of that temperature (Planckian locus → sRGB), then shifted by gravitational redshift and relativistic Doppler.",
      sec: 4,
    },
  ],
};

const COPY = {
  it: {
    kicker: "Fosforonero Lab",
    title: "Buco nero · Domande frequenti",
    intro: "Risposte brevi e oneste alle domande che si fanno tutti. Per le derivazioni complete con le equazioni, ogni risposta rimanda alla pagina delle equazioni.",
    more: "Approfondisci",
    about: "Equazioni e crediti →",
    sim: "Apri la simulazione →",
    back: "← Torna al Lab",
  },
  en: {
    kicker: "Fosforonero Lab",
    title: "Black hole · Frequently asked questions",
    intro: "Short, honest answers to the questions everyone asks. For the full derivations with equations, each answer links to the equations page.",
    more: "Read more",
    about: "Equations & credits →",
    sim: "Open the simulation →",
    back: "← Back to the Lab",
  },
} as const;

export function BlackHoleFaqView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const items = FAQ[locale];
  const aboutHref = locale === "it" ? "/lab/buco-nero/about" : "/en/lab/black-hole/about";
  const simHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";
  const labHref = locale === "it" ? "/lab" : "/en/lab";

  return (
    <div className="bh-about-page">
      <article className="bh-about">
        <header className="bh-about__head">
          <span className="bh-about__kicker">{t.kicker}</span>
          <h1 className="bh-about__title">{t.title}</h1>
          <p className="bh-about__intro">{t.intro}</p>
          <div className="bh-about__actions">
            <Link href={simHref} className="bh-about__cta">{t.sim}</Link>
            <Link href={aboutHref} className="bh-about__link">{t.about}</Link>
          </div>
        </header>

        <section className="bh-about__section">
          {items.map((f, i) => (
            <div key={i} className="bh-about__faq">
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 6px" }}>{f.q}</h2>
              <p>{f.a}</p>
              {f.sec ? (
                <Link href={`${aboutHref}#s${f.sec}`} className="bh-about__more">
                  {t.more} →
                </Link>
              ) : null}
            </div>
          ))}
        </section>

        <footer className="bh-about__foot">
          <Link href={aboutHref} className="bh-about__cta">{t.about}</Link>
          <Link href={labHref} className="bh-about__link" style={{ marginLeft: 12 }}>{t.back}</Link>
        </footer>
      </article>
    </div>
  );
}
