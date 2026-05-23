# Claude Code — istruzioni per Fosforonero

> ⚠️ **DOCUMENTO STORICO — brief iniziale dello scaffold (gennaio 2026).**
> Quasi tutti i task elencati in "Cosa DEVI completare" sono **stati fatti**
> (vedi check di stato sotto). Per lo stato attuale del progetto, le decisioni
> prese e i prossimi passi, fai sempre riferimento a **`docs/HANDOFF.md`** e
> alla **`README.md`**. Questo file serve come contesto di provenienza del
> progetto e come riferimento ai principi originali (tono copy, design system,
> convenzioni di codice) che restano validi.
>
> **Aggiornamenti rispetto al brief originale**:
> - Next.js 15 → **Next.js 16** (Turbopack)
> - "Niente Google Analytics" → ora **GA4 + Consent Mode v2** (richiesto dal
>   proprietario, con cookie banner GDPR-compliant)
> - Aggiunti: cookie banner, privacy/cookies policy IT+EN, IndexNow,
>   security headers, /identita brand page, PostNav (prev/next + correlati),
>   BreadcrumbList JSON-LD, gallery Instagram

Questo è lo scaffold del sito istituzionale di **Fosforonero**, lo studio indipendente di Matteo Pizzi. Il design è stato approvato in fase di mockup; quello che trovi qui è già un'impalcatura Next.js 16 funzionante che implementa la variante **"Cool Studio"** approvata.

## Cosa ti serve sapere subito

- **Stack**: Next.js 15 App Router · React 19 · TypeScript strict · Tailwind v4 · MDX in repo per il blog.
- **Locale**: IT default a `/`, EN a `/en` (route-based, dictionary in `lib/i18n.ts`).
- **Riferimento visivo**: `_design_reference/Fosforonero.html` (apri nel browser, è autonomo). Tutto deve restare allineato a quello.
- **Tono copy**: sobrio, professionale, tecnico quanto basta. **Niente affermazioni inventate** (es. non aggiungere conteggi utenti, claim di "qualità", testimonial). Se devi scrivere copy nuova, chiedi a Matteo prima.
- **Aesthetic**: bianco quasi puro (`#FBFBFA`), charcoal sharp (`#0A0A0A`), accent verde phosphor (`#00A341`) come dettaglio chirurgico. **Niente gradients viola-rosa**, niente glassmorphism aggiuntivo.

## Come iniziare

```bash
cd "/Volumes/LOS ANGELES/Matteo/Dev Roba Mia/Fosforonero_website"
pnpm install        # crea node_modules
cp .env.example .env.local
pnpm dev
```

Apri `http://localhost:3000` e confronta con `_design_reference/Fosforonero.html` aperto in un'altra tab.

## Cosa è già fatto (NON rifare da zero)

| Area | Stato | File chiave |
|---|---|---|
| Config Next.js + TS strict + Tailwind v4 | ✅ | `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` |
| Layout root + font self-hosted | ✅ | `app/layout.tsx` |
| Tokens design (palette, animazioni, prose) | ✅ | `app/globals.css` |
| Home IT (`/`) — V6 Cool Studio | ✅ | `app/page.tsx`, `components/landing.tsx` |
| Home EN (`/en`) | ✅ scheletro | `app/en/page.tsx`, `app/en/layout.tsx` |
| Nav, hero, metrics, ticker, about, projects, blog teaser, contact, footer | ✅ | `components/landing.tsx` |
| Animazioni scroll (`<Reveal>`) | ✅ | `components/client/reveal.tsx` |
| Rotating word + tech ticker | ✅ CSS-only | `components/parts/{rotating-word,tech-ticker}.tsx` |
| P¹⁵ glyph + mock FitMesh/SplitVote | ✅ | `components/parts/{p15-box,fitmesh-mock,splitvote-mock}.tsx` |
| Blog index `/blog` + post `/blog/[slug]` (statico via `generateStaticParams`) | ✅ | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` |
| 4 articoli MDX di esempio (IT) | ✅ | `content/blog/it/*.mdx` |
| Loader MDX con frontmatter + reading time | ✅ | `lib/blog.ts` |
| Metadata + OG + Twitter | ✅ | `app/layout.tsx`, `app/en/layout.tsx` |
| JSON-LD: Org · Person · ItemList · BlogPosting | ✅ | `lib/jsonld.ts` |
| Sitemap + robots + manifest | ✅ | `app/{sitemap,robots,manifest}.ts` |
| OG image dinamica (1200×630, Edge runtime) | ✅ | `app/opengraph-image.tsx` |
| Favicon SVG (P¹⁵ glyph) | ✅ | `public/icon.svg` |
| `prefers-reduced-motion` + `:focus-visible` + skip link | ✅ | `app/globals.css` |

## Cosa DEVI completare — STATO

> Tutti gli item qui sotto sono stati affrontati nelle sessioni successive
> al brief. Il riepilogo è qui per memoria storica; per i task ancora
> aperti vedi sempre **`docs/HANDOFF.md`**.

### A. Blog EN — ✅ FATTO
- 4 articoli MDX in `content/blog/en/` (stack-2026, fitmesh, galaxy-watch, splitvote-optional-accounts)
- Route `app/en/blog/page.tsx` + `app/en/blog/[slug]/page.tsx` attive

### B. Apple touch icon — ✅ FATTO
- `public/apple-icon.png` 180×180 generato via `scripts/generate-icons.ts` (sharp)

### C. Responsive — ✅ FATTO
- `clamp()` ovunque + helper classes `.fn-*` in `globals.css` per i breakpoint 480/768/900/1280
- Testato su 375 / 768 / 1280 / 1920

### D. Mobile nav — ✅ FATTO
- `components/client/mobile-nav.tsx` con drawer, focus trap, ESC = chiudi, scroll lock

### E. Accessibilità — ✅ FATTO (gli essenziali)
- Skip link, focus-visible, prefers-reduced-motion ovunque
- Focus trap su mobile drawer + cookie banner
- Semantic HTML completo
- Da fare di nuovo in pre-go-live (sessione 3): Lighthouse audit + axe scan sulla `/preview` (Landing)

### F. Performance pre-deploy — ⏳ PARZIALE
- `pnpm build` pulito ✅
- Lighthouse vero su `/preview` da rifare prima del go-live (sessione 3)

### G. Deploy — ✅ FATTO (sito live in Coming Soon mode)
- Su Vercel · branch `responsive` · dominio `fosforonero.com` (apex 307 → www)
- ⚠️ Vedi `docs/HANDOFF.md` per il **"Vercel Framework Preset trap"** — bug subdolo da non ripetere

### H. Optional — DECISIONI PRESE
- **Analytics**: GA4 (richiesto dal proprietario), NON Vercel Analytics. Vercel Analytics resta un'opzione futura come secondo segnale cookie-less.
- **Form contatti**: rimasto `mailto:` (decisione: non vogliamo gestire infrastruttura form per ora)
- **RSS feed**: non implementato (non richiesto)
- **View Transitions**: non implementato (Next 16 supporta, ma per il design attuale non porta valore)

### Nuove cose aggiunte rispetto al brief
- **Cookie banner GDPR + Consent Mode v2** (richiesto dal proprietario per la conformità EU)
- **Privacy + Cookie Policy IT + EN** (`/privacy`, `/cookies` + EN)
- **Pagina `/identita` + `/en/identity`** — brand identity page pubblica con il sistema visivo, varianti logo (V0 + V6 positivo/negativo), palette, tipografia, chimica dietro al nome
- **PostNav** sotto ogni post (prev/next chronological + 3 correlati per tag)
- **BreadcrumbList JSON-LD** su tutte le deep pages
- **IndexNow** (Bing/Yandex/Yep/Seznam/Naver) + GitHub Actions cron daily
- **Security headers** in `next.config.ts`
- **Instagram gallery** elegante (`/instagram`)
- **Coming Soon** temporanea sulla home (sostituirà la Landing al go-live)

## Convenzioni che devi mantenere

1. **Server Component by default.** Aggiungi `"use client"` solo se serve (state/effects/listeners). Attualmente solo `Reveal` è client.
2. **No `style={{}}` prop in nuovi file se evitabile** — preferisci Tailwind classes. (Per ora i componenti esistenti usano inline styles per matchare 1:1 il mockup; non serve riscriverli, ma per **nuovo** codice usa Tailwind.)
3. **Tipi stretti.** `noUncheckedIndexedAccess` è on: `array[0]` può essere `undefined`. Gestisci.
4. **Nessun import circolare.** `lib/` non importa da `components/`.
5. **Niente `any`.** Se Hai `unknown`, restringi con type guard.
6. **Niente librerie superflue.** Ho deliberatamente evitato framer-motion, gsap, ecc. — la performance vale più dell'effetto. Se serve un'animazione complessa, prima parla con Matteo.
7. **Niente font esterni oltre a Space Grotesk + JetBrains Mono** già configurati.
8. **Niente icone library.** Se serve un'icona, usa SVG inline.

## Verifiche prima di considerarti "fatto"

```bash
pnpm typecheck    # zero errori
pnpm lint         # zero warning
pnpm build        # build pulito
```

E poi:

- [ ] Home `/` rende e matcha il mockup `_design_reference/Fosforonero.html`
- [ ] Home `/en` rende con copy in inglese
- [ ] `/blog` lista i 4 articoli IT
- [ ] `/blog/<slug>` rende ogni articolo con `<MDXRemote>`
- [ ] `view-source:` mostra JSON-LD valido (testa su [validator.schema.org](https://validator.schema.org/))
- [ ] `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` rendono
- [ ] OG image `/opengraph-image` rende
- [ ] Lighthouse mobile ≥95 su tutti i 4 score
- [ ] Test responsive su Chrome DevTools 375 / 768 / 1280
- [ ] Axe scan = zero violazioni critiche
- [ ] `prefers-reduced-motion` disabilita tutte le animazioni (test in DevTools)

## Quando hai dubbi

1. Apri `_design_reference/Fosforonero.html` e confronta visivamente
2. Cerca su `lib/i18n.ts` se la stringa è già localizzata
3. Cerca su `lib/projects.ts` se è un dato del progetto
4. Chiedi a Matteo prima di inventare nuova copy o nuovi claim
