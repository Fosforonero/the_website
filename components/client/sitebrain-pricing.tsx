"use client";

import { useState } from "react";

export interface SiteBrainPrices {
  pro: { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
  studio: { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
  agency: { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
}

type Billing = "annual" | "lifetime";
type Currency = "usd" | "eur";
type PaidTier = "pro" | "studio" | "agency";

const DISPLAY: Record<Billing, Record<Currency, Record<PaidTier, string>>> = {
  annual:   { usd: { pro: "$79",  studio: "$299", agency: "$499" }, eur: { pro: "€79",  studio: "€299", agency: "€499" } },
  lifetime: { usd: { pro: "$199", studio: "$699", agency: "$999" }, eur: { pro: "€199", studio: "€699", agency: "€999" } },
};

const TIERS = [
  {
    key:          "free" as const,
    name:         "Free",
    tagline:      "Per siti personali e test.",
    features:     ["RAG keyword search", "OpenAI · Anthropic · OpenRouter", "Handoff lead (3/giorno)", "Quick questions configurabili", "Temi colore base"],
    highlight:    false,
    paid:         false,
  },
  {
    key:          "pro" as const,
    name:         "Pro",
    tagline:      "Per siti professionali.",
    features:     ["RAG semantico + embeddings", "Upload documenti (PDF, DOCX, TXT, MD)", "Handoff lead illimitati + contesto chat", "Statistiche avanzate", "WooCommerce integrato"],
    highlight:    true,
    paid:         true,
  },
  {
    key:          "studio" as const,
    name:         "Studio",
    tagline:      "Per agenzie e siti multipli.",
    features:     ["Tutto di Pro", "Fino a 5 installazioni", "API access", "Audit log completo", "GDPR avanzato"],
    highlight:    false,
    paid:         true,
  },
  {
    key:          "agency" as const,
    name:         "Agency",
    tagline:      "Installazioni illimitate.",
    features:     ["Tutto di Studio", "Installazioni illimitate", "White-label widget", "Priorità supporto", "Accesso funzionalità beta"],
    highlight:    false,
    paid:         true,
  },
] as const;

async function redirectToCheckout(priceId: string): Promise<void> {
  const res = await fetch("/api/sitebrain/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });
  const data = (await res.json()) as { url?: string };
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Errore durante l'apertura del checkout. Riprova tra qualche secondo.");
  }
}

const toggle: React.CSSProperties = {
  display: "flex",
  background: "var(--color-surface)",
  borderRadius: 8,
  padding: 3,
  border: "1px solid var(--color-rule)",
};

function ToggleBtn({
  active,
  onClick,
  children,
  mono,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: mono ? 12 : 13,
        fontWeight: 600,
        background: active ? "var(--color-ink)" : "transparent",
        color: active ? "#fff" : "var(--color-dim)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

export function SiteBrainPricing({ prices }: { prices: SiteBrainPrices }) {
  const [billing, setBilling] = useState<Billing>("annual");
  const [currency, setCurrency] = useState<Currency>("usd");
  const [loading, setLoading] = useState<PaidTier | null>(null);

  const handleBuy = async (tier: PaidTier) => {
    const priceId = prices[tier][billing][currency];
    setLoading(tier);
    try {
      await redirectToCheckout(priceId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* ── Toggles ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: "clamp(28px, 4vw, 48px)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={toggle}>
          <ToggleBtn active={billing === "annual"}   onClick={() => setBilling("annual")}>Annuale</ToggleBtn>
          <ToggleBtn active={billing === "lifetime"} onClick={() => setBilling("lifetime")}>Lifetime</ToggleBtn>
        </div>

        <div style={toggle}>
          <ToggleBtn mono active={currency === "usd"} onClick={() => setCurrency("usd")}>$ USD</ToggleBtn>
          <ToggleBtn mono active={currency === "eur"} onClick={() => setCurrency("eur")}>€ EUR</ToggleBtn>
        </div>

        {billing === "lifetime" && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#00A341",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Pagamento unico · nessun rinnovo
          </span>
        )}
      </div>

      {/* ── Cards ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        {TIERS.map((tier) => {
          const priceDisplay =
            tier.paid
              ? DISPLAY[billing][currency][tier.key as PaidTier]
              : "Gratis";
          const period =
            tier.paid
              ? billing === "annual" ? "/anno" : "una tantum"
              : "GPL";
          const isLoading = tier.paid && loading === tier.key;

          return (
            <div
              key={tier.key}
              style={{
                background:   tier.highlight ? "var(--color-ink)" : "var(--color-card)",
                border:       tier.highlight ? "none" : "1px solid var(--color-rule)",
                borderLeft:   `4px solid ${tier.highlight ? "#00A341" : "var(--color-rule)"}`,
                borderRadius: 14,
                padding:      "clamp(22px, 3vw, 32px)",
                display:      "flex",
                flexDirection:"column",
                height:       "100%",
                boxSizing:    "border-box",
              }}
            >
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      10,
                  letterSpacing: "0.18em",
                  color:         tier.highlight ? "rgba(255,255,255,0.45)" : "var(--color-dim)",
                  textTransform: "uppercase",
                }}
              >
                {tier.name}
              </span>

              <div
                style={{
                  display:     "flex",
                  alignItems:  "baseline",
                  gap:         4,
                  marginTop:   10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily:    "var(--font-sans)",
                    fontSize:      "clamp(30px, 4vw, 42px)",
                    fontWeight:    700,
                    color:         tier.highlight ? "#fff" : "var(--color-ink)",
                    letterSpacing: "-0.03em",
                    lineHeight:    1,
                  }}
                >
                  {priceDisplay}
                </span>
                <span
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      11,
                    color:         tier.highlight ? "rgba(255,255,255,0.45)" : "var(--color-dim)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {period}
                </span>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize:   12.5,
                  color:      tier.highlight ? "rgba(255,255,255,0.52)" : "var(--color-dim)",
                  margin:     "0 0 20px",
                  lineHeight: 1.45,
                }}
              >
                {tier.tagline}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      fontFamily:   "var(--font-sans)",
                      fontSize:     13,
                      color:        tier.highlight ? "rgba(255,255,255,0.80)" : "var(--color-ink-2)",
                      padding:      "7px 0",
                      borderBottom: `1px solid ${tier.highlight ? "rgba(255,255,255,0.07)" : "var(--color-rule)"}`,
                      display:      "flex",
                      alignItems:   "flex-start",
                      gap:          9,
                    }}
                  >
                    <span style={{ color: "#00A341", flexShrink: 0, fontSize: 10, marginTop: 2, fontWeight: 700 }}>
                      ✓
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              {tier.paid ? (
                <button
                  onClick={() => handleBuy(tier.key as PaidTier)}
                  disabled={!!loading}
                  style={{
                    display:    "block",
                    width:      "100%",
                    textAlign:  "center",
                    padding:    "11px 18px",
                    background: tier.highlight ? "#00A341" : "var(--color-surface)",
                    color:      tier.highlight ? "#fff" : "var(--color-ink)",
                    border:     tier.highlight ? "none" : "1px solid var(--color-rule)",
                    borderRadius: 8,
                    fontFamily: "var(--font-sans)",
                    fontSize:   14,
                    fontWeight: 600,
                    cursor:     loading ? "wait" : "pointer",
                    opacity:    isLoading ? 0.6 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {isLoading ? "Apertura checkout…" : `Acquista ${tier.name}`}
                </button>
              ) : (
                <a
                  href="https://wordpress.org/plugins/sitebrain-ai/"
                  style={{
                    display:      "block",
                    textAlign:    "center",
                    padding:      "11px 18px",
                    background:   "var(--color-surface)",
                    color:        "var(--color-ink)",
                    border:       "1px solid var(--color-rule)",
                    borderRadius: 8,
                    fontFamily:   "var(--font-sans)",
                    fontSize:     14,
                    fontWeight:   600,
                    textDecoration: "none",
                  }}
                >
                  Download gratuito
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
