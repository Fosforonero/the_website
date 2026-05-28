"use client";

import { useState, useRef, useEffect } from "react";

const FAQS = [
  {
    q: "Il plugin gratuito è davvero gratuito per sempre?",
    a: "Sì. La versione Free è GPLv2+ e rimarrà gratuita senza limitazioni nel tempo. Nessun trial, nessun lock-in. Le funzionalità PRO sono un'aggiunta opzionale, non una restrizione artificiale della versione base.",
  },
  {
    q: "I miei dati passano attraverso i server di SiteBrain?",
    a: "No. SiteBrain gira interamente sul tuo server WordPress. I contenuti indicizzati e le conversazioni restano sul tuo hosting. L'unica trasmissione esterna è verso il provider AI che hai scelto (OpenAI, Anthropic, OpenRouter) tramite la tua API key personale.",
  },
  {
    q: "Posso fare upgrade o downgrade dopo l'acquisto?",
    a: "Upgrade: sì, in qualsiasi momento — il credito residuo viene scalato proporzionalmente. Downgrade: contattaci a support@fosforonero.com e gestiamo manualmente il passaggio.",
  },
  {
    q: "Cosa include esattamente il piano Lifetime?",
    a: "Un pagamento unico dà accesso permanente a tutte le funzionalità del piano scelto, inclusi tutti gli aggiornamenti futuri per quella versione. Nessun rinnovo annuale, nessuna sorpresa in bolletta.",
  },
] as const;

function FAQItem({ faq, isOpen, onToggle }: { faq: typeof FAQS[number]; isOpen: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div style={{ borderBottom: "1px solid var(--color-rule)" }}>
      <button
        onClick={onToggle}
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          width:          "100%",
          textAlign:      "left",
          padding:        "clamp(18px,2.5vw,26px) 0",
          background:     "none",
          border:         "none",
          cursor:         "pointer",
          gap:            24,
        }}
      >
        <span
          style={{
            fontFamily:    "var(--font-sans)",
            fontSize:      "clamp(15px,1.8vw,18px)",
            fontWeight:    600,
            color:         "var(--color-ink)",
            letterSpacing: "-0.02em",
            lineHeight:    1.3,
          }}
        >
          {faq.q}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize:   20,
            color:      "var(--color-accent)",
            flexShrink: 0,
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            transform:  isOpen ? "rotate(45deg)" : "rotate(0deg)",
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          overflow:   "hidden",
          height:     height,
          transition: "height 0.30s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div ref={bodyRef} style={{ paddingBottom: "clamp(16px,2.5vw,28px)" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize:   "clamp(14px,1.6vw,16px)",
              color:      "var(--color-dim)",
              lineHeight: 1.7,
              margin:     0,
              maxWidth:   640,
            }}
          >
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SiteBrainFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {FAQS.map((faq, i) => (
        <FAQItem
          key={i}
          faq={faq}
          isOpen={open === i}
          onToggle={() => setOpen(open === i ? null : i)}
        />
      ))}
    </div>
  );
}
