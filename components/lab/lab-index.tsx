import Link from "next/link";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import type { Locale } from "@/lib/site";

// ---------------------------------------------------------------------------
// Lab hub — landing page linking the interactive experiments.
// ---------------------------------------------------------------------------

type Exp = {
  title: string;
  tag: string;
  desc: string;
  href: string;
  links: { label: string; href: string }[];
  accent: string;
};

const COPY: Record<Locale, { kicker: string; title: string; intro: string; exps: Exp[] }> = {
  it: {
    kicker: "Fosforonero Lab",
    title: "Esperimenti interattivi",
    intro:
      "Strumenti scientifici interattivi nel browser, costruiti con dati aperti e fisica reale dichiarata. Gratuiti, senza pubblicità.",
    exps: [
      {
        title: "Tavola Periodica",
        tag: "Chimica",
        desc: "Tavola periodica interattiva: proprietà degli elementi, modelli atomici 3D, cristalli e molecole.",
        href: "/lab/tavola-periodica",
        links: [
          { label: "Apri", href: "/lab/tavola-periodica" },
          { label: "Manuale", href: "/lab/tavola-periodica/manuale" },
          { label: "Fonti", href: "/lab/tavola-periodica/about" },
        ],
        accent: "#7fd0c0",
      },
      {
        title: "Sistema Solare",
        tag: "Astronomia",
        desc: "Osservatorio 3D WebGL: pianeti, lune, comete e asteroidi con orbite kepleriane e stelle reali dal catalogo Hipparcos.",
        href: "/lab/sistema-solare",
        links: [
          { label: "Apri", href: "/lab/sistema-solare" },
          { label: "Manuale", href: "/lab/sistema-solare/manuale" },
          { label: "Fonti", href: "/lab/sistema-solare/about" },
        ],
        accent: "#7aa0c0",
      },
      {
        title: "Buco Nero",
        tag: "Relatività",
        desc: "Lensing gravitazionale di Schwarzschild in tempo reale: geodetiche dei fotoni, disco di accrescimento, photon ring. Più un playground gravitazionale.",
        href: "/lab/buco-nero",
        links: [
          { label: "Apri", href: "/lab/buco-nero" },
          { label: "Playground", href: "/lab/buco-nero/playground" },
          { label: "Equazioni", href: "/lab/buco-nero/about" },
        ],
        accent: "#ff8a3c",
      },
    ],
  },
  en: {
    kicker: "Fosforonero Lab",
    title: "Interactive experiments",
    intro:
      "Interactive science tools in the browser, built on open data and disclosed real physics. Free, no ads.",
    exps: [
      {
        title: "Periodic Table",
        tag: "Chemistry",
        desc: "Interactive periodic table: element properties, 3D atomic models, crystals and molecules.",
        href: "/en/lab/periodic-table",
        links: [
          { label: "Open", href: "/en/lab/periodic-table" },
          { label: "Manual", href: "/en/lab/periodic-table/manual" },
          { label: "Sources", href: "/en/lab/periodic-table/about" },
        ],
        accent: "#7fd0c0",
      },
      {
        title: "Solar System",
        tag: "Astronomy",
        desc: "3D WebGL observatory: planets, moons, comets and asteroids with Keplerian orbits and real stars from the Hipparcos catalog.",
        href: "/en/lab/solar-system",
        links: [
          { label: "Open", href: "/en/lab/solar-system" },
          { label: "Manual", href: "/en/lab/solar-system/manual" },
          { label: "Sources", href: "/en/lab/solar-system/about" },
        ],
        accent: "#7aa0c0",
      },
      {
        title: "Black Hole",
        tag: "Relativity",
        desc: "Real-time Schwarzschild gravitational lensing: photon geodesics, accretion disk, photon ring. Plus a gravitational playground.",
        href: "/en/lab/black-hole",
        links: [
          { label: "Open", href: "/en/lab/black-hole" },
          { label: "Playground", href: "/en/lab/black-hole/playground" },
          { label: "Equations", href: "/en/lab/black-hole/about" },
        ],
        accent: "#ff8a3c",
      },
    ],
  },
};

export function LabIndex({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <>
      <Nav locale={locale} />
      <main className="lab-hub">
        <header className="lab-hub__head">
          <span className="lab-hub__kicker">{t.kicker}</span>
          <h1 className="lab-hub__title">{t.title}</h1>
          <p className="lab-hub__intro">{t.intro}</p>
        </header>

        <div className="lab-hub__grid">
          {t.exps.map((e) => (
            <article key={e.title} className="lab-card" style={{ ["--accent" as string]: e.accent }}>
              <Link href={e.href} className="lab-card__main">
                <span className="lab-card__tag">{e.tag}</span>
                <h2 className="lab-card__title">{e.title}</h2>
                <p className="lab-card__desc">{e.desc}</p>
              </Link>
              <div className="lab-card__links">
                {e.links.map((l) => (
                  <Link key={l.href} href={l.href} className="lab-card__link">
                    {l.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
