# Fosforonero — Handoff

> Documento di passaggio tra sessioni. Aggiornato a fine sessione corrente.
> **Ultimo aggiornamento: 2026-05-22**

---

## TL;DR — stato live in produzione

| Layer | Stato | Note |
|---|---|---|
| Dominio `fosforonero.com` | ✅ Vercel | apex → 307 a `www.fosforonero.com` |
| Dominio `www.fosforonero.com` | ✅ Vercel + SSL Let's Encrypt | canonical scelto da Vercel |
| DNS Namecheap | ✅ pulito (A `216.198.79.1` + CNAME `vercel-dns-017.com` + TXT Search Console) | conflitti vecchi (parking CNAME + URL Redirect) rimossi |
| Deploy production | ✅ branch `responsive`, ultimo commit `88e1d95` | promosso da Vercel UI |
| GA4 `G-K1QTXSDVD8` | ✅ attivo | hardcoded fallback nel codice + env var `NEXT_PUBLIC_GA_ID` su Vercel |
| Consent Mode v2 | ✅ default = denied | upgrade su accept dal banner |
| Cookie banner | ✅ EU/Garante-compliant | 3 CTA equivalenti, ESC = reject, footer "Preferenze cookie" |
| Pagine legali | ✅ `/privacy`, `/cookies` IT + EN | linkate dal footer |
| Search Console | ✅ TXT verificato | sitemap submit ancora da fare (vedi step 1 sotto) |
| Email forwarding Namecheap | ⏳ da configurare | guida in fondo |

> Nota: appena dopo la pulizia DNS può servire 5-60 min perché la cache dei resolver pubblici scada. Test pratico: `curl -I https://fosforonero.com/` da una rete diversa deve dare `HTTP/2 307`.

---

## Cosa è nel branch `responsive` (10 commit sopra `init`)

```
88e1d95  feat(analytics): hardcode GA Measurement ID G-K1QTXSDVD8 as production fallback
01272e7  feat: legal compliance (GA4 Consent Mode v2, cookie banner, privacy/cookies IT+EN)
e4c73e8  feat: add Chatbot AI WP plugin as third project + extended titles, audit=0/0
4e06cd1  feat: PHP/WP/SEO in stack, apple-icon 180, description polish, baseline=2warn
f425381  fix(layout): suppress hydration warning on <body> for browser extensions
6789a1b  feat(seo): daily audit governance + on-demand subagent + GH Actions workflow
90d75f9  feat: full EN translation + Orangee Academy teaching + responsive blog routes
31ecc12  feat: update socials (Instagram added, LinkedIn URL fixed, HF capitalised)
1c24ed2  feat: responsive layout (mobile-first) + mobile nav drawer
9fab8e1  chore: upgrade toolchain to latest (Next 16, Node 24, TS 6, Tailwind 4.3)
```

Tutti già pushati su `origin/responsive`. Production deploy su Vercel = `88e1d95`.

### Sintesi delle aree
- **Toolchain**: Next 16.2.6, React 19.2.6, TypeScript 6.0.3, Tailwind 4.3, Node 24 LTS (pin `.nvmrc`), pnpm 11.2.2 (`packageManager`).
- **Responsive (punto C + D bibbia)**: `clamp()` inline per scaling fluido + helper classi `.fn-*` in `globals.css` per media-query layout. Mobile nav drawer client component (`components/client/mobile-nav.tsx`) con focus trap, ESC, body scroll lock, `prefers-reduced-motion` rispettato.
- **EN**: dizionario `lib/i18n.ts` raffinato, 4 MDX tradotti (`stack-2026`, `fitmesh-primo-anno`, `galaxy-watch`, `splitvote` ⚠️ draft), route `/en/blog` + `/en/blog/[slug]`, hreflang simmetrici.
- **Progetti**: `lib/projects.ts` con FitMesh (LIVE), SplitVote (LIVE), Chatbot AI (BETA, `url?` opzionale).
- **Legal compliance**: tutto in `app/privacy`, `app/cookies`, `app/en/privacy`, `app/en/cookies` + `components/client/cookie-banner.tsx` + `lib/cookie-consent.ts` + `components/parts/footer.tsx`.
- **SEO governance**: `docs/seo/governance.md` (policy) + `.claude/agents/seo-auditor.md` (subagent on-demand) + `scripts/seo/audit.ts` (orchestratore) + `.github/workflows/seo-audit.yml` (cron daily 06:00 UTC). Baseline corrente: **0 errori, 0 warning** (`docs/seo/baseline.json`).
- **Social**: `lib/site.ts.socials` aggiornati (Instagram, LinkedIn corretto, HuggingFace capital). JSON-LD `sameAs` (Person + Organization) include i 4 link.
- **Apple icon**: `public/apple-icon.png` 180×180 generato da `pnpm gen:icons` (`scripts/generate-icons.ts`, dep `sharp`).

---

## Cosa fare domani — in ordine di urgenza

### 1. Search Console — submit sitemap (~2 min)
- Apri [search.google.com/search-console](https://search.google.com/search-console)
- Property `fosforonero.com` (già verificata via TXT) → menu sinistro **Sitemaps**
- Aggiungi: `sitemap.xml` (path relativo) → **Submit**
- Ripeti se vuoi su Bing Webmaster Tools ([bing.com/webmasters](https://www.bing.com/webmasters))

### 2. Email forwarding Namecheap (~5 min)
Su [ap.www.namecheap.com](https://ap.www.namecheap.com) → Domain List → `fosforonero.com` → **Manage** → tab **Email Forwarding**:

| Alias                    | Destinazione           |
|--------------------------|------------------------|
| `matteo`                 | `mat.pizzi@gmail.com`  |
| `info`                   | `mat.pizzi@gmail.com`  |
| `hello`                  | `mat.pizzi@gmail.com`  |
| `*` (catch-all)          | `mat.pizzi@gmail.com`  |

Attiva "Free Email Forwarding" (Namecheap aggiunge automaticamente gli MX records di `freemail.namecheap.com`).

### 3. Audit prod + Lighthouse (10 min)
Quando la cache DNS è propagata ovunque:
```bash
pnpm seo:audit -- --url=https://www.fosforonero.com
pnpm seo:audit -- --url=https://www.fosforonero.com --json --update-baseline
```
E un Lighthouse run remoto:
```bash
pnpm dlx lighthouse https://www.fosforonero.com --view --output=html --output-path=./.lighthouse-prod.html
```
Target da `docs/seo/governance.md`: Performance ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO 100, LCP ≤ 2.5s, CLS ≤ 0.1.

### 4. Verifica banner + GA in browser (5 min)
- Apri `https://fosforonero.com` in incognito (Chrome, estensioni off)
- DevTools → Application → Local Storage → cerca `fn-cookie-consent-v1` (deve essere assente al primo accesso)
- Banner visibile in basso a sinistra (desktop) o full-width bottom (mobile)
- Click **Accept all** → `_ga` cookie compare → GA Real-Time mostra 1 utente in <30 sec
- Refresh → banner non riappare; click **Preferenze cookie** nel footer → banner riapre

### 5. Decisioni di copy / contenuto in sospeso

#### 5a. Screenshot reali dei progetti ⚠️ richiesta esplicita
Oggi `ProjectCard` usa mock SVG inventati (`fitmesh-mock.tsx`, `splitvote-mock.tsx`, `chatbot-mock.tsx`). Vanno sostituiti con screenshot reali. Serve da te:
- `FitMesh` → screenshot dashboard / app, 16:10, ~1200×750, WebP o PNG
- `SplitVote` → screenshot pagina principale / poll
- `Chatbot WP` → screenshot widget in contesto WordPress

Salvali in `public/projects/<slug>.webp` e segnala — modifico `ProjectCard` per renderizzare `<Image>` Next ottimizzato + estendo `Project.imageSrc?` in `lib/projects.ts`.

#### 5b. Articoli blog da rivedere ⚠️ richiesta esplicita
| Slug                                          | Stato      | Azione |
|----------------------------------------------|------------|--------|
| `stack-2026`                                  | **live**   | sembra coerente, ma da rileggere |
| `fitmesh-primo-anno-produzione`               | **live**   | dimmi se ci sono claim sbagliati o numeri inventati |
| `galaxy-watch-android-senza-samsung-health`   | **live**   | tecnico generico, controllo te |
| `splitvote-niente-account`                    | **draft**  | premise falsa (SplitVote HA account), va riscritto da zero |

Il blog loader (`lib/blog.ts`) ora capisce `draft: true` nel frontmatter e nasconde il post in produzione. Puoi marcare altri post draft semplicemente aggiungendo quella riga.

#### 5c. Decisione Orangee Academy
Rimosso da tutto il codice (`site.ts`, `jsonld.ts`, `i18n.ts`, `landing.tsx`) come da tua richiesta. Quando decidi se reintegrarlo o no, mi dici e in 5 minuti torna come prima (riferimento al commit `90d75f9` per il diff esatto).

#### 5d. Decisione HuggingFace
Skipped per ora (focus sul deploy). Roadmap proposta:
1. Dataset open-source `italian-ecommerce-intents`
2. Space Gradio demo chatbot italiano (sinergia col plugin WP)
3. Fine-tune classifier intent IT

Quando vuoi partire, ho skill dedicate (`huggingface-skills:huggingface-datasets`, `huggingface-gradio`).

### 6. Optional / nice-to-have
- **Connect Vercel MCP a Claude** (Settings → Connectors → Vercel → Connect, OAuth ~30 sec). Sblocca: che io faccia monitoring deployments + env vars + Lighthouse runs senza dover chiederti screenshot.
- **GA Stream URL alignment**: oggi la property GA ha Stream URL `https://www.fosforonero.com` (con www). Se Vercel canonical resta `www`, è già allineato. Se cambi canonical ad apex, aggiorna anche GA (Admin → Data Streams → Web → URL).
- **Vercel Analytics free tier** (alternativa/aggiunta a GA, cookie-less, no banner richiesto). Chiedimelo se vuoi attivarlo.

---

## Quick reference — comandi che useremo domani

```bash
# Dev locale (Node 24 + pnpm 11)
nvm use 24
pnpm install
pnpm dev                                            # http://localhost:3000

# Verifiche
pnpm typecheck
pnpm lint
pnpm seo:audit                                       # audit locale
pnpm seo:audit -- --url=https://www.fosforonero.com  # audit prod
pnpm build                                           # build prod (deve fare 19 routes)

# Asset
pnpm gen:icons                                       # rigenera apple-icon.png da public/icon.svg
```

---

## Convenzioni da rispettare (riepilogo veloce dal CLAUDE_CODE_PROMPT.md)

1. **Niente copy inventata**. Se serve testo nuovo, chiedere a Matteo prima.
2. **Niente visual inventati**. Usare screenshot reali dei prodotti.
3. **Server Component by default**. `"use client"` solo se inevitabile (state/effects/listeners).
4. **No `style={{}}` su nuovo codice** — preferire Tailwind classes. Il codice esistente è inline per matchare il mockup 1:1.
5. **`noUncheckedIndexedAccess` on** — gestire `undefined` su `array[i]`.
6. **Niente librerie nuove** senza chiedere.
7. **Niente font esterni** oltre a Space Grotesk + JetBrains Mono.
8. **Niente icone library** — SVG inline.
9. **Niente analytics aggiuntive** senza chiedere (GA4 + Consent Mode v2 è già configurato).

---

## File di reference

- `CLAUDE_CODE_PROMPT.md` — bibbia originale di Matteo (todo iniziale + convenzioni)
- `README.md` — quickstart + stack + check-list SEO/Performance/A11y
- `docs/seo/governance.md` — policy SEO sempre attiva (soglie meta, JSON-LD, performance)
- `docs/seo/baseline.json` — snapshot accettato corrente (0/0)
- `.claude/agents/seo-auditor.md` — subagent SEO on-demand
- `.github/workflows/seo-audit.yml` — daily audit (cron 06:00 UTC, apre issue su regression)
- `_design_reference/Fosforonero.html` — mockup approvato V6 Cool Studio (da consultare quando in dubbio)
