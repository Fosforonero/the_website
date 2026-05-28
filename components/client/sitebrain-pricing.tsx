"use client";

import { useState } from "react";

export interface SiteBrainPrices {
  pro:    { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
  studio: { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
  agency: { annual: { usd: string; eur: string }; lifetime: { usd: string; eur: string } };
}

type Billing  = "annual" | "lifetime";
type Currency = "usd" | "eur";
type PaidTier = "pro" | "studio" | "agency";

const DISPLAY: Record<Billing, Record<Currency, Record<PaidTier, { num: string; sym: string }>>> = {
  annual:   {
    usd: { pro: { num: "79",  sym: "$" }, studio: { num: "299", sym: "$" }, agency: { num: "499", sym: "$" } },
    eur: { pro: { num: "79",  sym: "€" }, studio: { num: "299", sym: "€" }, agency: { num: "499", sym: "€" } },
  },
  lifetime: {
    usd: { pro: { num: "199", sym: "$" }, studio: { num: "699", sym: "$" }, agency: { num: "999", sym: "$" } },
    eur: { pro: { num: "199", sym: "€" }, studio: { num: "699", sym: "€" }, agency: { num: "999", sym: "€" } },
  },
};

const SAVINGS: Record<Currency, Record<PaidTier, string>> = {
  usd: { pro: "vs 2yr: salvi $158", studio: "vs 2yr: salvi $598", agency: "vs 2yr: salvi $998" },
  eur: { pro: "vs 2yr: salvi €158", studio: "vs 2yr: salvi €598", agency: "vs 2yr: salvi €998" },
};

const TIERS = [
  {
    key:         "free" as const,
    name:        "Free",
    tagline:     "Per siti personali e test.",
    features:    [
      "RAG keyword search",
      "OpenAI · Anthropic · OpenRouter",
      "3 handoff lead / giorno",
      "Quick questions configurabili",
      "Temi colore base",
    ],
    highlighted: false,
    paid:        false,
  },
  {
    key:         "pro" as const,
    name:        "Pro",
    tagline:     "Per siti professionali che vogliono il massimo.",
    features:    [
      "RAG semantico + embeddings",
      "Upload documenti (PDF, DOCX, TXT)",
      "Handoff lead illimitati + contesto",
      "Statistiche avanzate",
      "WooCommerce integrato",
    ],
    highlighted: true,
    paid:        true,
  },
  {
    key:         "studio" as const,
    name:        "Studio",
    tagline:     "Per agenzie e siti multipli.",
    features:    [
      "Tutto di Pro",
      "Fino a 5 installazioni",
      "API access",
      "Audit log completo",
      "GDPR avanzato",
    ],
    highlighted: false,
    paid:        true,
  },
  {
    key:         "agency" as const,
    name:        "Agency",
    tagline:     "Scala illimitata, zero compromessi.",
    features:    [
      "Tutto di Studio",
      "Installazioni illimitate",
      "White-label widget",
      "Priorità supporto",
      "Accesso funzionalità beta",
    ],
    highlighted: false,
    paid:        true,
  },
] as const;

async function redirectToCheckout(priceId: string): Promise<void> {
  const res  = await fetch("/api/sitebrain/stripe/checkout", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ priceId }),
  });
  const data = (await res.json()) as { url?: string };
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Errore durante l'apertura del checkout. Riprova tra qualche secondo.");
  }
}

// Sliding pill toggle — works on dark backgrounds
function SlidingToggle<T extends string>({
  value,
  options,
  onChange,
  mono,
}: {
  value:   T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  mono?:   boolean;
}) {
  const isFirst = value === options[0]?.value;
  return (
    <div
      style={{
        position:   "relative",
        display:    "grid",
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        background: "rgba(255,255,255,0.07)",
        borderRadius: 100,
        border:     "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* sliding pill */}
      <div
        style={{
          position:   "absolute",
          top:        3,
          bottom:     3,
          left:       isFirst ? 3 : "50%",
          right:      isFirst ? "50%" : 3,
          background: "#fff",
          borderRadius: 100,
          transition: "left 0.22s cubic-bezier(0.4,0,0.2,1), right 0.22s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            position:   "relative",
            zIndex:     1,
            padding:    "9px 22px",
            border:     "none",
            background: "transparent",
            borderRadius: 100,
            cursor:     "pointer",
            fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
            fontSize:   mono ? 12 : 13,
            fontWeight: 600,
            color:      value === opt.value ? "#0A0A0A" : "rgba(255,255,255,0.45)",
            transition: "color 0.22s",
            letterSpacing: mono ? "0.05em" : "-0.01em",
            whiteSpace: "nowrap",
            textAlign:  "center",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SiteBrainPricing({ prices }: { prices: SiteBrainPrices }) {
  const [billing,  setBilling]  = useState<Billing>("annual");
  const [currency, setCurrency] = useState<Currency>("usd");
  const [loading,  setLoading]  = useState<PaidTier | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);

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
      {/* ── Toggles ──────────────────────────────────────────────────── */}
      <div
        style={{
          display:     "flex",
          gap:         12,
          marginBottom: "clamp(36px,5vw,60px)",
          flexWrap:    "wrap",
          alignItems:  "center",
        }}
      >
        <SlidingToggle
          value={billing}
          onChange={setBilling}
          options={[
            { value: "annual",   label: "Annuale" },
            { value: "lifetime", label: "Lifetime ⚡" },
          ]}
        />
        <SlidingToggle
          value={currency}
          onChange={setCurrency}
          mono
          options={[
            { value: "usd", label: "$ USD" },
            { value: "eur", label: "€ EUR" },
          ]}
        />
        {billing === "lifetime" && (
          <span
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      10,
              color:         "#00A341",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background:    "rgba(0,163,65,0.12)",
              padding:       "5px 12px",
              borderRadius:  100,
              border:        "1px solid rgba(0,163,65,0.3)",
            }}
          >
            ✓ Pagamento unico · nessun rinnovo
          </span>
        )}
      </div>

      {/* ── Cards ────────────────────────────────────────────────────── */}
      <div
        style={{
          display:               "grid",
          gridTemplateColumns:   "repeat(4, minmax(0, 1fr))",
          gap:                   16,
          alignItems:            "start",
          paddingTop:            20,
        }}
      >
        {TIERS.map((tier) => {
          const hl       = tier.highlighted;
          const isHov    = hovered === tier.key;
          const isLoad   = tier.paid && loading === tier.key;
          const priceNum = tier.paid ? DISPLAY[billing][currency][tier.key as PaidTier].num : null;
          const priceSym = tier.paid ? DISPLAY[billing][currency][tier.key as PaidTier].sym : null;
          const period   = tier.paid
            ? billing === "annual" ? "/anno" : "una tantum"
            : "GPL · gratis";

          return (
            <div
              key={tier.key}
              onMouseEnter={() => setHovered(tier.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background:   hl ? "#00A341" : "rgba(255,255,255,0.04)",
                border:       hl ? "none"    : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 20,
                padding:      "clamp(24px,3vw,36px)",
                display:      "flex",
                flexDirection:"column",
                position:     "relative",
                transition:   "transform 0.25s, box-shadow 0.25s",
                transform:    isHov && !hl ? "translateY(-4px)" : "none",
                boxShadow:    hl
                  ? "0 20px 60px rgba(0,163,65,0.30)"
                  : isHov
                  ? "0 12px 36px rgba(0,0,0,0.5)"
                  : "none",
              }}
            >
              {/* Popular badge */}
              {hl && (
                <div
                  style={{
                    position:      "absolute",
                    top:           -14,
                    left:          "50%",
                    transform:     "translateX(-50%)",
                    background:    "#fff",
                    color:         "#00A341",
                    fontFamily:    "var(--font-mono)",
                    fontSize:      10,
                    fontWeight:    700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding:       "5px 16px",
                    borderRadius:  100,
                    whiteSpace:    "nowrap",
                  }}
                >
                  ★ Più popolare
                </div>
              )}

              {/* Tier name */}
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color:         hl ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)",
                }}
              >
                {tier.name}
              </span>

              {/* Price */}
              <div
                style={{
                  display:     "flex",
                  alignItems:  "flex-start",
                  gap:         2,
                  marginTop:   16,
                  marginBottom: 2,
                }}
              >
                {priceNum ? (
                  <>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize:   18,
                        fontWeight: 500,
                        color:      hl ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.45)",
                        marginTop:  10,
                        lineHeight: 1,
                      }}
                    >
                      {priceSym}
                    </span>
                    <span
                      style={{
                        fontFamily:    "var(--font-sans)",
                        fontSize:      "clamp(52px,6.5vw,72px)",
                        fontWeight:    700,
                        color:         "#fff",
                        lineHeight:    1,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {priceNum}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontFamily:    "var(--font-sans)",
                      fontSize:      "clamp(44px,5.5vw,60px)",
                      fontWeight:    700,
                      color:         "#fff",
                      lineHeight:    1,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    Free
                  </span>
                )}
              </div>

              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      11,
                  color:         hl ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.30)",
                  letterSpacing: "0.06em",
                  marginBottom:  billing === "lifetime" && tier.paid ? 2 : 8,
                }}
              >
                {period}
              </span>

              {/* Lifetime savings */}
              {tier.paid && billing === "lifetime" && (
                <span
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      9,
                    color:         hl ? "rgba(255,255,255,0.75)" : "#00A341",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom:  8,
                  }}
                >
                  {SAVINGS[currency][tier.key as PaidTier]}
                </span>
              )}

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize:   13,
                  color:      hl ? "rgba(255,255,255,0.60)" : "rgba(255,255,255,0.30)",
                  lineHeight: 1.55,
                  margin:     "0 0 20px",
                }}
              >
                {tier.tagline}
              </p>

              {/* Features */}
              <ul
                style={{
                  listStyle:  "none",
                  padding:    0,
                  margin:     "0 0 24px",
                  flex:       1,
                  borderTop:  `1px solid ${hl ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      fontFamily:   "var(--font-sans)",
                      fontSize:     13,
                      color:        hl ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.50)",
                      padding:      "10px 0",
                      borderBottom: `1px solid ${hl ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)"}`,
                      display:      "flex",
                      alignItems:   "flex-start",
                      gap:          10,
                      lineHeight:   1.4,
                    }}
                  >
                    <span
                      style={{
                        color:      hl ? "#fff" : "#00A341",
                        flexShrink: 0,
                        fontSize:   11,
                        fontWeight: 700,
                        marginTop:  1,
                      }}
                    >
                      ✓
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.paid ? (
                <button
                  onClick={() => handleBuy(tier.key as PaidTier)}
                  disabled={!!loading}
                  style={{
                    display:      "block",
                    width:        "100%",
                    textAlign:    "center",
                    padding:      "13px 18px",
                    background:   hl ? "#fff" : "rgba(255,255,255,0.10)",
                    color:        hl ? "#00A341" : "#fff",
                    border:       hl ? "none" : "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    fontFamily:   "var(--font-sans)",
                    fontSize:     14,
                    fontWeight:   700,
                    cursor:       loading ? "wait" : "pointer",
                    opacity:      isLoad ? 0.6 : 1,
                    letterSpacing:"-0.01em",
                    transition:   "opacity 0.15s",
                  }}
                >
                  {isLoad ? "Apertura checkout…" : `Acquista ${tier.name}`}
                </button>
              ) : (
                <a
                  href="https://wordpress.org/plugins/sitebrain-ai/"
                  style={{
                    display:       "block",
                    textAlign:     "center",
                    padding:       "13px 18px",
                    background:    "rgba(255,255,255,0.08)",
                    color:         "#fff",
                    border:        "1px solid rgba(255,255,255,0.13)",
                    borderRadius:  12,
                    fontFamily:    "var(--font-sans)",
                    fontSize:      14,
                    fontWeight:    700,
                    textDecoration:"none",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Download gratuito
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p
        style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      10,
          color:         "rgba(255,255,255,0.22)",
          textAlign:     "center",
          marginTop:     28,
          letterSpacing: "0.06em",
        }}
      >
        Pagamento sicuro via Stripe · IVA inclusa per utenti EU · Lifetime: accesso permanente senza rinnovi
      </p>
    </div>
  );
}
