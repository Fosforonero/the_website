"use client";

import Link from "next/link";
import { FAQ } from "./black-hole/faq-data";

// ---------------------------------------------------------------------------
// Standalone bilingual FAQ view. The Q&A data lives in ./black-hole/faq-data
// (a plain, non-'use client' module) so the server page wrappers can read the
// actual values for the FAQPage JSON-LD.
// ---------------------------------------------------------------------------

type Locale = "it" | "en";

const COPY = {
  it: {
    kicker: "Fosforonero Lab",
    title: "Buco nero · Domande frequenti",
    intro: "Risposte brevi e oneste alle domande che si fanno tutti. Per le derivazioni complete con le equazioni, ogni risposta rimanda alla pagina delle equazioni.",
    more: "Approfondisci",
    about: "Equazioni e crediti →",
    sim: "Apri la simulazione →",
    back: "← Torna al Lab",
    kofi: "Questo laboratorio è gratuito, senza pubblicità e costruito con la fisica vera. Se ti è utile, puoi offrirmi un caffè.",
    kofiBtn: "Supporta su Ko-fi",
  },
  en: {
    kicker: "Fosforonero Lab",
    title: "Black hole · Frequently asked questions",
    intro: "Short, honest answers to the questions everyone asks. For the full derivations with equations, each answer links to the equations page.",
    more: "Read more",
    about: "Equations & credits →",
    sim: "Open the simulation →",
    back: "← Back to the Lab",
    kofi: "This lab is free, ad-free and built on real physics. If it is useful to you, you can buy me a coffee.",
    kofiBtn: "Support on Ko-fi",
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
            <Link
              href={locale === "it" ? "/en/lab/black-hole/faq" : "/lab/buco-nero/faq"}
              className="bh-about__link"
              hrefLang={locale === "it" ? "en" : "it"}
            >
              {locale === "it" ? "English" : "Italiano"}
            </Link>
          </div>
        </header>

        <section className="bh-faq">
          {items.map((f, i) => (
            <details key={i} className="bh-faq__item" open={i === 0}>
              <summary className="bh-faq__q">
                <h2>{f.q}</h2>
              </summary>
              <div className="bh-faq__a">
                <p>{f.a}</p>
                {f.sec ? (
                  <Link href={`${aboutHref}#s${f.sec}`} className="bh-about__more">
                    {t.more} →
                  </Link>
                ) : null}
              </div>
            </details>
          ))}
        </section>

        <div className="bh-kofi">
          <p>{t.kofi}</p>
          <a href="https://ko-fi.com/fosforonero" target="_blank" rel="noopener noreferrer" className="bh-kofi__btn">
            ☕ {t.kofiBtn}
          </a>
        </div>

        <footer className="bh-about__foot">
          <Link href={aboutHref} className="bh-about__cta">{t.about}</Link>
          <Link href={labHref} className="bh-about__link" style={{ marginLeft: 12 }}>{t.back}</Link>
        </footer>
      </article>
    </div>
  );
}
