import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { CookieSettingsLink } from "@/components/client/cookie-settings-link";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 86400;

const LAST_UPDATED = "2026-05-22";

export const metadata: Metadata = {
  title: "Cookie Policy — utilizzo dei cookie",
  description: `Elenco dei cookie utilizzati da ${site.name} (necessari e analytics Google Analytics 4 in Consent Mode v2), finalità, durata e modalità di gestione del consenso.`,
  alternates: {
    canonical: "/cookies",
    languages: { it: "/cookies", en: "/en/cookies", "x-default": "/cookies" },
  },
  robots: { index: true, follow: true },
};

export default function CookiesPageIT() {
  const t = getDictionary("it");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav locale="it" />
      <main
        id="main"
        style={{
          flex: 1,
          padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 64px) clamp(64px, 12vw, 120px)",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Pill background="var(--color-accent-soft)" color="var(--color-accent)">
          § LEGAL — COOKIE
        </Pill>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(34px, 6vw, 56px)",
            fontWeight: 600,
            color: "var(--color-ink)",
            margin: "clamp(14px, 2.5vw, 20px) 0 12px",
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
          }}
        >
          {t.legal.cookieTitle}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--color-dim)",
            margin: "0 0 32px",
            letterSpacing: "0.08em",
          }}
        >
          {t.legal.lastUpdated(LAST_UPDATED)}
        </p>

        <article className="prose">
          <h2>1. Cosa sono i cookie</h2>
          <p>
            I <em>cookie</em> sono piccoli file di testo che i siti web salvano sul tuo dispositivo per memorizzare informazioni utili al funzionamento o all’esperienza utente. Tecnologie equivalenti (es. <em>localStorage</em>) sono trattate alla pari dei cookie.
          </p>

          <h2>2. Cookie utilizzati da {site.name}</h2>
          <p>
            Distinguiamo i cookie in due categorie. La prima (necessari) è sempre attiva perché indispensabile al funzionamento del sito. La seconda (analitici) si attiva solo dopo il tuo consenso esplicito.
          </p>

          <h3>2.1 Necessari (sempre attivi)</h3>
          <ul>
            <li>
              <strong><code>fn-cookie-consent-v1</code></strong> — <em>localStorage</em>. Memorizza la tua scelta sul banner cookie. Senza questo non potremmo ricordare se hai accettato o rifiutato. Durata: persistente sul tuo dispositivo finché non lo elimini. Dominio: {site.domain}.
            </li>
          </ul>

          <h3>2.2 Analitici (con consenso)</h3>
          <p>
            Utilizziamo <strong>Google Analytics 4</strong> in modalità <em>Consent Mode v2</em>: i cookie sotto vengono installati <strong>solo se hai espressamente accettato</strong> tramite il banner. Senza consenso, GA4 invia segnali aggregati senza identificatori persistenti (modalità <em>ping</em>).
          </p>
          <ul>
            <li><strong><code>_ga</code></strong> — Google. Identificatore univoco anonimizzato. Durata: 24 mesi. Finalità: distinguere gli utenti.</li>
            <li><strong><code>_ga_&lt;ID&gt;</code></strong> — Google. Stato della sessione GA4. Durata: 24 mesi.</li>
          </ul>

          <h2>3. Come gestire le tue preferenze</h2>
          <p>
            Puoi rivedere o modificare la tua scelta in qualsiasi momento utilizzando il pulsante qui sotto: si riaprirà il banner cookie con le tue impostazioni attuali.
          </p>
          <p>
            <CookieSettingsLink
              className="fn-link-underline"
              style={{
                color: "var(--color-accent)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Apri le preferenze cookie →
            </CookieSettingsLink>
          </p>

          <h2>4. Come gestire i cookie dal browser</h2>
          <p>Tutti i principali browser permettono di visualizzare, eliminare e bloccare i cookie:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" rel="noopener noreferrer" target="_blank">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" rel="noopener noreferrer" target="_blank">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" rel="noopener noreferrer" target="_blank">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/microsoft-edge" rel="noopener noreferrer" target="_blank">Microsoft Edge</a></li>
          </ul>

          <h2>5. Opt-out specifico Google Analytics</h2>
          <p>
            Puoi disattivare il tracciamento GA4 su <strong>tutti</strong> i siti installando l’estensione ufficiale Google:{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">tools.google.com/dlpage/gaoptout</a>.
          </p>

          <h2>6. Aggiornamenti</h2>
          <p>
            Se aggiorniamo le tecnologie tracciate o le categorie di cookie, lo segnaleremo qui e riproporremo il banner di consenso. Il numero di versione del consenso ({"v1"}) ti garantisce che la tua scelta è valida solo per la versione corrente.
          </p>

          <hr />
          <p style={{ fontSize: "0.9em", color: "var(--color-dim)" }}>
            <em>Per la disciplina completa del trattamento dei dati personali, consulta la nostra Privacy Policy.</em>
          </p>
        </article>
      </main>
      <Footer locale="it" />
    </div>
  );
}
