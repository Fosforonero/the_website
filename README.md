# Fosforonero — sito istituzionale

Sito statico (Next.js 15 + App Router) per lo studio indipendente di Matteo Pizzi.

---

## Quick start

```bash
pnpm install         # or: npm install / yarn install
cp .env.example .env.local
pnpm dev             # http://localhost:3000
```

Build di produzione:

```bash
pnpm build
pnpm start
```

Type-check + lint:

```bash
pnpm typecheck
pnpm lint
```

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | RSC by default; minimal client JS; built-in metadata/sitemap/OG. |
| Language | **TypeScript strict** | `noUncheckedIndexedAccess`, `strict: true`. |
| Styling | **Tailwind CSS v4** (CSS-first) | `@theme` block in `app/globals.css`; no JS config. |
| Fonts | **`next/font`** (Space Grotesk + JetBrains Mono) | Self-hosted, zero CLS. |
| Blog | **MDX in repo** (`next-mdx-remote`) | Statically rendered. No CMS, no infra. |
| i18n | **Route-based** (`/` IT, `/en` EN) | Dictionary-based, zero runtime deps. |
| SEO | **Metadata API + JSON-LD + sitemap + robots + manifest + OG image** | Full coverage. |
| Hosting | **Vercel** | Edge, ISR, automatic OG image generation. |

---

## Struttura

```
.
├── app/
│   ├── layout.tsx              ← root layout · fonts · Organization+Person JSON-LD
│   ├── page.tsx                ← IT home
│   ├── globals.css             ← tokens + animazioni + .prose
│   ├── sitemap.ts              ← /sitemap.xml (statico)
│   ├── robots.ts               ← /robots.txt
│   ├── manifest.ts             ← /manifest.webmanifest
│   ├── opengraph-image.tsx     ← OG image dinamica (1200×630) generata su Edge
│   ├── not-found.tsx
│   ├── en/
│   │   ├── layout.tsx          ← EN-specific metadata
│   │   └── page.tsx
│   └── blog/
│       ├── page.tsx            ← /blog
│       └── [slug]/page.tsx     ← /blog/<slug>  (statico via generateStaticParams)
│
├── components/
│   ├── landing.tsx             ← composizione completa della home
│   ├── client/
│   │   └── reveal.tsx          ← "use client" · IntersectionObserver reveal
│   └── parts/                  ← componenti server-rendered
│       ├── nav.tsx
│       ├── p15-box.tsx         ← glyph P¹⁵
│       ├── pill.tsx
│       ├── rotating-word.tsx   ← 3-word CSS rotator (RSC)
│       ├── tech-ticker.tsx     ← CSS marquee (RSC)
│       ├── cursor.tsx
│       ├── project-card.tsx
│       ├── blog-row.tsx
│       ├── fitmesh-mock.tsx    ← mini-mock dell'app FitMesh
│       └── splitvote-mock.tsx  ← mini-mock di SplitVote
│
├── content/
│   └── blog/
│       ├── it/*.mdx            ← 4 articoli di esempio
│       └── en/*.mdx            ← 1 placeholder (da tradurre)
│
├── lib/
│   ├── site.ts                 ← config sito + locales + helpers
│   ├── i18n.ts                 ← dictionary IT/EN
│   ├── projects.ts             ← catalogo progetti (FitMesh, SplitVote)
│   ├── blog.ts                 ← lettore MDX (gray-matter + reading-time)
│   └── jsonld.ts               ← builder JSON-LD (Org / Person / ItemList / BlogPosting)
│
├── public/
│   └── icon.svg                ← favicon (P¹⁵ glyph)
│
├── mdx-components.tsx          ← override globale componenti MDX
├── _design_reference/          ← mockup HTML approvato (da non distribuire)
└── …configs (tsconfig, next.config.ts, postcss.config.mjs, .env.example, …)
```

---

## SEO check-list (già implementata)

- ✅ Metadata API: `title` con template, `description`, `openGraph`, `twitter`, `robots`, `icons`, `manifest`
- ✅ `alternates.languages` con `it`/`en`/`x-default` — hreflang corretti per Google
- ✅ `sitemap.xml` statico (incluse traduzioni come `xhtml:link` via `alternates`)
- ✅ `robots.txt` con sitemap reference
- ✅ Web App Manifest
- ✅ OG image dinamica 1200×630 generata su Edge
- ✅ JSON-LD: `Organization`, `Person` (root), `ItemList` (home), `BlogPosting` (articoli)
- ✅ Canonical URLs su ogni pagina
- ✅ `lang="it"` su `<html>` (override per EN in handoff a Claude Code)

## Performance check-list

- ✅ Server Components ovunque possibile (1 sola Client Component: `<Reveal>`)
- ✅ Font self-hosted via `next/font` (zero CLS, no FOIT)
- ✅ Animazioni CSS-only dove possibile (rotating word, ticker)
- ✅ `force-static` su sitemap/robots
- ✅ `revalidate: 3600` su home/blog (ISR ogni ora)
- ✅ Aggressive cache headers su asset statici (favicon, OG)

## Accessibility check-list

- ✅ Skip link (`<a class="skip-link">` in `app/layout.tsx`)
- ✅ `:focus-visible` con outline accent (3px offset)
- ✅ `prefers-reduced-motion: reduce` disabilita tutte le animazioni
- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- ✅ `aria-label` sui link nav e logo
- ✅ Stato interactive solo su elementi `<a>`/`<button>` (no `<div onClick>`)

---

## Deploy su Vercel

1. Push del repo su GitHub
2. Import del progetto da [vercel.com/new](https://vercel.com/new)
3. Setta env `NEXT_PUBLIC_SITE_URL=https://fosforonero.com`
4. Connetti il dominio
5. Deploy

ISR (`revalidate: 3600`) e statiche sono out-of-the-box. La OG image gira su Edge runtime.

---

## Note design

L'estetica è quella della **variante 06 "Cool Studio"** approvata nel mockup. I file di riferimento sono in `_design_reference/`:

- `Fosforonero.html` — preview HTML standalone
- `variant-cool.jsx` — componente sorgente del mockup
- `shared.jsx` — primitive condivise (P¹⁵, mock progetti, animazioni)

Quando in dubbio sulle proporzioni o sui dettagli, **apri quel mockup nel browser** e confronta.

---

## TODO per Claude Code

Lista delle cose che potrebbero servire ma che non ho ancora cablato (le trovi nel **`CLAUDE_CODE_PROMPT.md`** dettagliato).
