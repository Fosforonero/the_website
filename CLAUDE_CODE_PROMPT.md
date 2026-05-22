# Claude Code — istruzioni per Fosforonero

Questo è lo scaffold del sito istituzionale di **Fosforonero**, lo studio indipendente di Matteo Pizzi. Il design è stato approvato in fase di mockup; quello che trovi qui è già un'impalcatura Next.js 15 funzionante che implementa la variante **"Cool Studio"** approvata.

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

## Cosa DEVI completare

### A. Blog EN
- Tradurre i 4 articoli MDX da `content/blog/it/` a `content/blog/en/`. **Non inventare contenuto** — chiedi a Matteo se la traduzione automatica va bene, altrimenti placeholder.
- Replicare le route `app/en/blog/page.tsx` e `app/en/blog/[slug]/page.tsx` (copia da IT e cambia il locale a `"en"` nei chiamanti di `getDictionary`, `getAllPosts`, `getPost`, `getAllSlugs`, e la cartella `_design_reference/Fosforonero.html` da consultare per il tono).

### B. Apple touch icon
- Generare `public/apple-icon.png` 180×180 dal glyph SVG. Sono ok con `pnpm dlx sharp-cli ...` o uno script `scripts/generate-icons.ts`. Il manifest e il layout già lo referenziano.

### C. Responsive
- La landing è scritta in px fissi per matchare il mockup desktop. Devi rendere **tutto responsive** (mobile-first) preservando l'identità:
  - Hero h1: scala con `clamp(48px, 9vw, 128px)`
  - Grid metriche: 4→2 colonne sotto 768px
  - Project card: stacking dell'`<article>` interno sotto 900px
  - Nav: mobile menu con drawer (nuovo Client Component `components/client/mobile-nav.tsx`)
- Test su 375 / 768 / 1280 / 1920.

### D. Mobile nav
- Aggiungere `<MobileNav>` ("use client") con drawer + bottone hamburger. Visible solo `<768px`. Anim slide-in da destra. Hide bottoni desktop sotto 768px.

### E. Verifica accessibilità
- Run Axe DevTools o `pnpm lighthouse` localmente
- Tutti i contrasti devono passare AA. Il `--color-dim: #6B6B66` su `--color-bg: #FBFBFA` ha contrast ratio 4.5+ — verifica.
- Tab order coerente.
- Mobile drawer: trap focus + `Esc` per chiudere.

### F. Performance pre-deploy
- `pnpm build` deve completare senza warning.
- Run `pnpm lighthouse` (o usa PageSpeed Insights dopo deploy). Tutti i 4 score ≥95.
- Se il bundle JS supera 100KB sull'home, verifica che `<Reveal>` non si stia tirando dietro qualcosa di pesante.

### G. Deploy
- Push su GitHub
- Connetti a Vercel
- Set env vars: `NEXT_PUBLIC_SITE_URL=https://fosforonero.com`
- Configura il dominio in Vercel + DNS (Namecheap o Cloudflare)
- Verifica `https://fosforonero.com/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`
- Submit la sitemap a Google Search Console

### H. Optional (chiedi a Matteo)
- **Analytics**: Vercel Analytics built-in (free tier), o Plausible self-hosted. Niente Google Analytics.
- **Form contatti**: per ora `mailto:`. Se vuole un form, aggiungere route `/api/contact` con Resend o simile.
- **RSS feed**: `/feed.xml` per il blog (`app/feed.xml/route.ts`).
- **View Transitions**: Next 15 supporta nativamente le View Transitions per route transitions — testare su Chrome.

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
