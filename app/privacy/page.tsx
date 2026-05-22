import type { Metadata } from "next";
import { Nav } from "@/components/parts/nav";
import { Footer } from "@/components/parts/footer";
import { Pill } from "@/components/parts/pill";
import { getDictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 86400; // 24h

const LAST_UPDATED = "2026-05-22";

export const metadata: Metadata = {
  title: "Privacy Policy — informativa GDPR",
  description: `Come ${site.name} (${site.author.name}) tratta i dati personali secondo il Regolamento UE 2016/679 (GDPR). Dati raccolti, finalità, base giuridica e diritti.`,
  alternates: {
    canonical: "/privacy",
    languages: { it: "/privacy", en: "/en/privacy", "x-default": "/privacy" },
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPageIT() {
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
          § LEGAL — INFORMATIVA
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
          {t.legal.privacyTitle}
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
          <h2>1. Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento è <strong>{site.author.name}</strong>, sviluppatore indipendente operante con il nome di studio <strong>{site.name}</strong>, con sede a {site.author.city}, Italia.
            Contatto: <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>2. Dati personali trattati</h2>
          <p>Trattiamo le seguenti categorie di dati personali:</p>
          <ul>
            <li>
              <strong>Dati di navigazione</strong>: indirizzo IP, user agent, pagina richiesta, referrer, timestamp. Vengono registrati automaticamente dai log del nostro provider di hosting (Vercel) per finalità di sicurezza e di diagnosi tecnica. Conservazione massima: 30 giorni.
            </li>
            <li>
              <strong>Dati di audience aggregata</strong> via Google Analytics 4, attivati solo previo tuo consenso esplicito. Includono: pagine visitate, durata sessione, dispositivo, lingua, IP anonimizzato (gli ultimi ottetti sono troncati lato Google). Conservazione: 14 mesi.
            </li>
            <li>
              <strong>Comunicazioni via email</strong>: se ci scrivi a {site.email}, conserviamo il contenuto della tua email per il tempo necessario a rispondere e per gli obblighi documentali (massimo 24 mesi).
            </li>
          </ul>

          <h2>3. Finalità del trattamento</h2>
          <ul>
            <li>Fornire e mantenere operativo il sito web e i suoi contenuti.</li>
            <li>Garantire la sicurezza tecnica dei sistemi (mitigazione abusi, prevenzione frodi).</li>
            <li>Misurare l’audience in forma aggregata per migliorare il sito (analytics).</li>
            <li>Rispondere alle tue richieste se ci contatti via email.</li>
          </ul>

          <h2>4. Base giuridica</h2>
          <ul>
            <li><strong>Log tecnici</strong>: art. 6.1.f GDPR — legittimo interesse del titolare alla sicurezza e diagnostica.</li>
            <li><strong>Analytics</strong>: art. 6.1.a GDPR — consenso dell’interessato, raccolto tramite il banner cookie e revocabile in ogni momento dalle “Preferenze cookie” nel footer.</li>
            <li><strong>Comunicazioni email</strong>: art. 6.1.b GDPR — esecuzione di misure precontrattuali su tua richiesta.</li>
          </ul>

          <h2>5. Destinatari dei dati</h2>
          <p>I dati possono essere trattati dai seguenti soggetti, in qualità di responsabili del trattamento:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> (hosting e CDN) — <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">Privacy Policy Vercel</a></li>
            <li><strong>Google Ireland Ltd / Google LLC</strong> (Google Analytics 4, solo con consenso) — <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">Privacy Policy Google</a></li>
            <li><strong>Namecheap, Inc.</strong> (registrazione dominio + email forwarding) — <a href="https://www.namecheap.com/legal/general/privacy-policy/" rel="noopener noreferrer" target="_blank">Privacy Policy Namecheap</a></li>
          </ul>

          <h2>6. Trasferimenti extra-UE</h2>
          <p>
            Alcuni fornitori (Vercel, Google, Namecheap) sono basati negli Stati Uniti. I trasferimenti avvengono sulla base delle <em>Standard Contractual Clauses</em> della Commissione Europea (decisione 2021/914) e, dove applicabile, della certificazione <em>EU-US Data Privacy Framework</em>.
          </p>

          <h2>7. Periodo di conservazione</h2>
          <p>I dati sono conservati per il tempo strettamente necessario alle finalità per cui sono raccolti, e comunque non oltre i limiti indicati nella sezione 2.</p>

          <h2>8. I tuoi diritti</h2>
          <p>Ai sensi degli articoli 15-22 GDPR hai il diritto di:</p>
          <ul>
            <li>Accedere ai tuoi dati personali e ottenerne copia (art. 15).</li>
            <li>Chiederne la rettifica se inesatti (art. 16).</li>
            <li>Chiederne la cancellazione (art. 17).</li>
            <li>Chiederne la limitazione del trattamento (art. 18).</li>
            <li>Ricevere i dati in formato strutturato e portarli altrove (art. 20).</li>
            <li>Opporti al trattamento basato sul legittimo interesse (art. 21).</li>
            <li>Revocare il consenso in ogni momento, senza pregiudicare la liceità del trattamento basato sul consenso prima della revoca.</li>
          </ul>
          <p>Per esercitare i tuoi diritti scrivici a <a href={`mailto:${site.email}`}>{site.email}</a>. Risponderemo entro 30 giorni.</p>

          <h2>9. Reclamo all’Autorità di controllo</h2>
          <p>
            Hai inoltre diritto di proporre reclamo al <strong>Garante per la protezione dei dati personali</strong> (<a href="https://www.garanteprivacy.it" rel="noopener noreferrer" target="_blank">garanteprivacy.it</a>) se ritieni che il trattamento violi il GDPR.
          </p>

          <h2>10. Modifiche</h2>
          <p>Possiamo aggiornare questa informativa per riflettere cambiamenti normativi o operativi. La versione vigente è sempre disponibile a questo URL, con indicazione della data di ultimo aggiornamento.</p>

          <hr />
          <p style={{ fontSize: "0.9em", color: "var(--color-dim)" }}>
            <em>Questa pagina riassume le pratiche di trattamento dati. Non costituisce parere legale; in caso di dubbi specifici consulta un professionista del settore.</em>
          </p>
        </article>
      </main>
      <Footer locale="it" />
    </div>
  );
}
