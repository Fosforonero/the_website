# Fosforonero — sito istituzionale

Sito statico (Next.js 16 + App Router) per lo studio indipendente di Matteo Pizzi.

> **🚀 Stato corrente del progetto**: vedi [`docs/HANDOFF.md`](docs/HANDOFF.md) — riepilogo deploy, GA, DNS, todo prossima sessione.

---

## Quick start

```bash
nvm use 24            # Node 24 LTS (vedi .nvmrc se presente, altrimenti install via nvm)
corepack enable       # abilita pnpm via Corepack (la versione la prende da packageManager in package.json)
pnpm install
cp .env.example .env.local
pnpm dev              # http://localhost:3000
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

SEO audit on-demand:

```bash
pnpm seo:audit                # contro localhost:3000 (dev server up)
pnpm seo:indexnow             # ping Bing/Yandex/Yep/Seznam/Naver con tutte le URL
```

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | RSC by default; minimal client JS; built-in metadata/sitemap/OG. |
| Language | **TypeScript strict** | `noUncheckedIndexedAccess`, `strict: true`. |
| Styling | **Tailwind CSS v4** (CSS-first) | `@theme` block in `app/globals.css`; no JS config. |
| Fonts | **`next/font`** (Space Grotesk + JetBrains Mono) | Self-hosted, zero CLS. |
| Blog | **MDX in repo** (`next-mdx-remote`) | Statically rendered. No CMS, no infra. |
| i18n | **Route-based** (`/` IT, `/en` EN) | Dictionary in `lib/i18n.ts`, zero runtime deps. |
| Analytics | **GA4 + Consent Mode v2** (`@next/third-parties/google`) | Default = denied; upgrade su accept dal cookie banner. |
| SEO | **Metadata API + JSON-LD (Org/Person/WebSite/ItemList/BlogPosting/BreadcrumbList) + sitemap + robots + manifest + OG image dinamica + IndexNow** | Full coverage. |
| Security | **Security headers in `next.config.ts`** (CSP-baseline, Permissions-Policy, Referrer-Policy, X-Content-Type-Options) | HSTS aggiunto auto da Vercel. |
| Hosting | **Vercel** | Edge runtime per OG image, ISR ogni ora sulle home. |
| Cron SEO | **GitHub Actions** | Daily audit + IndexNow ping, apre issue su regressione. |

---

## Struttura

```
.
├── app/
│   ├── layout.tsx              ← root layout · fonts · Consent Mode v2 · GA4 · WebSite+Org+Person JSON-LD
│   ├── page.tsx                ← IT home (attualmente ComingSoon, swap a Landing al go-live)
│   ├── globals.css             ← tokens + animazioni + .prose + responsive helpers + IG gallery
│   ├── sitemap.ts              ← /sitemap.xml (statico, include identità + post)
│   ├── robots.ts               ← /robots.txt
│   ├── manifest.ts             ← /manifest.webmanifest
│   ├── opengraph-image.tsx     ← OG image dinamica (1200×630) generata su Edge
│   ├── not-found.tsx
│   ├── identita/page.tsx       ← brand identity page IT (V0+V6, palette, tipografia, chimica)
│   ├── preview/page.tsx        ← Landing IT accessibile durante Coming Soon (noindex)
│   ├── privacy/page.tsx        ← Privacy Policy IT (GDPR)
│   ├── cookies/page.tsx        ← Cookie Policy IT
│   ├── instagram/page.tsx      ← gallery Instagram IT
│   ├── blog/
│   │   ├── page.tsx            ← /blog index
│   │   └── [slug]/page.tsx     ← /blog/<slug> (statico via generateStaticParams)
│   └── en/
│       ├── layout.tsx
│       ├── page.tsx            ← /en home (ComingSoon)
│       ├── identity/page.tsx   ← brand identity EN
│       ├── preview/page.tsx    ← Landing EN noindex
│       ├── privacy/page.tsx, cookies/page.tsx, instagram/page.tsx
│       └── blog/page.tsx + [slug]/page.tsx
│
├── components/
│   ├── landing.tsx             ← composizione completa della home (Nav · Hero · Metrics · Ticker · About · Projects · Blog · Contact · Footer)
│   ├── client/                 ← componenti "use client"
│   │   ├── reveal.tsx          ← IntersectionObserver reveal (scroll stagger)
│   │   ├── mobile-nav.tsx      ← drawer hamburger <768px con focus trap
│   │   ├── cookie-banner.tsx   ← GDPR banner (3 CTA equivalenti, ESC = reject)
│   │   ├── cookie-settings-link.tsx ← riapre il banner dal footer
│   │   └── instagram-gallery.tsx ← gallery elegante (hero 21:9 + grid 1:1)
│   ├── lab/
│   │   └── p15-variants.tsx    ← V6 Mono (typographic lockup) — V1-V5 rimossi
│   └── parts/                  ← componenti server-rendered
│       ├── nav.tsx             ← header sticky + link Identità
│       ├── footer.tsx          ← P15 mark + status + legal nav
│       ├── coming-soon.tsx     ← home temporanea (current state)
│       ├── identity-page.tsx   ← /identita page body (6 sezioni)
│       ├── post-nav.tsx        ← prev/next + correlati sotto ogni blog post
│       ├── p15-box.tsx         ← glyph V0 (boxed periodic-table tile) — supporta `negative`
│       ├── pill.tsx, rotating-word.tsx, tech-ticker.tsx, cursor.tsx
│       ├── project-card.tsx, blog-row.tsx
│       ├── fitmesh-mock.tsx, splitvote-mock.tsx, chatbot-mock.tsx
│       └── ...
│
├── content/
│   ├── blog/
│   │   ├── it/*.mdx            ← 4 articoli IT (stack, fitmesh, galaxy-watch, splitvote)
│   │   └── en/*.mdx            ← 4 articoli EN (stessi temi, tradotti)
│   └── instagram/posts.json    ← feed manuale (8 placeholder, da popolare)
│
├── lib/
│   ├── site.ts                 ← config sito + locales + helpers (NEXT_PUBLIC_SITE_URL)
│   ├── i18n.ts                 ← dictionary IT/EN (nav, hero, about, projects, blog, contact, footer, cookie, legal, comingSoon, instagram, identity)
│   ├── projects.ts             ← catalogo progetti (FitMesh, SplitVote, ChatbotWP)
│   ├── blog.ts                 ← lettore MDX + getAdjacentPosts + getRelatedPosts (HIDE_DRAFTS in prod)
│   ├── jsonld.ts               ← builder JSON-LD (Org/Person/WebSite/ItemList/BlogPosting/BreadcrumbList)
│   ├── cookie-consent.ts       ← helpers consent storage + gtag update
│   ├── indexnow.ts             ← protocollo IndexNow (Bing/Yandex/Yep/Seznam/Naver)
│   └── instagram.ts            ← loader server-only del feed JSON
│
├── public/
│   ├── icon.svg                ← favicon (P¹⁵ glyph)
│   ├── apple-icon.png          ← 180×180 generato via sharp
│   ├── BingSiteAuth.xml        ← Bing Webmaster verification
│   └── b6c7991c…txt            ← IndexNow key file
│
├── scripts/
│   ├── generate-icons.ts       ← genera apple-icon dal SVG (sharp)
│   └── seo/
│       ├── audit.ts            ← audit orchestrator (cheerio)
│       └── ping-indexnow.ts    ← submit sitemap URL a IndexNow
│
├── .github/workflows/
│   └── seo-audit.yml           ← cron daily (06:00 UTC) → audit + IndexNow ping + issue on regression
│
├── .claude/agents/
│   └── seo-auditor.md          ← subagent definition (audit on-demand)
│
├── docs/
│   ├── HANDOFF.md              ← stato per session passing
│   └── seo/
│       ├── governance.md       ← SEO policy
│       └── baseline.json       ← snapshot ultimo audit verde
│
├── mdx-components.tsx          ← override globale componenti MDX
└── …configs (tsconfig, next.config.ts con headers + security, postcss.config.mjs, .env.example, pnpm-workspace.yaml, …)
```

---

## SEO check-list (implementata)

- ✅ Metadata API: `title` con template, `description`, `openGraph`, `twitter`, `robots`, `icons`, `manifest`
- ✅ `alternates.languages` con `it`/`en`/`x-default` — hreflang corretti per Google
- ✅ `sitemap.xml` statico (inclusi blog post + pagina identità con alternates lingue)
- ✅ `robots.txt` con sitemap reference
- ✅ Web App Manifest
- ✅ OG image dinamica 1200×630 generata su Edge runtime
- ✅ JSON-LD globale: `WebSite`, `Organization`, `Person` (root layout)
- ✅ JSON-LD per-page: `ItemList` (home Landing), `BlogPosting` + `BreadcrumbList` (ogni post), `BreadcrumbList` (identità, privacy, cookies)
- ✅ Canonical URL su ogni pagina
- ✅ `<html lang>` per locale (IT default, EN su `/en`)
- ✅ IndexNow attivo (key `b6c7991c…`) per Bing/Yandex/Yep/Seznam/Naver
- ✅ Apple touch icon 180×180 (`public/apple-icon.png`)
- ✅ BingSiteAuth.xml in repo
- ✅ Internal linking: PostNav sotto ogni post (prev/next + correlati per tag)

## Performance check-list

- ✅ Server Components ovunque possibile (client island: `<Reveal>`, `<MobileNav>`, `<CookieBanner>`, `<InstagramGallery>`)
- ✅ Font self-hosted via `next/font` (zero CLS, no FOIT)
- ✅ Animazioni CSS-only (rotating word, ticker, reveal)
- ✅ `force-static` su sitemap/robots
- ✅ `revalidate: 3600` su home/blog (ISR ogni ora)
- ✅ Aggressive cache headers su asset statici (favicon, OG)
- ✅ `optimizePackageImports` per import tree-shaking aggressivo

## Privacy / GDPR check-list

- ✅ Consent Mode v2 default = denied (gtag prima di qualsiasi script)
- ✅ Cookie banner EU/Garante-compliant: 3 CTA equivalenti (Accetta / Rifiuta / Personalizza), ESC = rifiuta, focus trap
- ✅ Privacy Policy + Cookie Policy IT + EN linkate dal footer e dal micro-row Coming Soon
- ✅ Link "Preferenze cookie" persistente per riaprire il banner
- ✅ localStorage versioned (`fn-cookie-consent-v1`)
- ✅ GA4 IP-anonymized

## Security check-list

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()`
- ✅ `X-DNS-Prefetch-Control: on`
- ✅ `poweredByHeader: false`
- ✅ HSTS aggiunto automaticamente da Vercel

## Accessibility check-list

- ✅ Skip link (`<a class="skip-link">` in `app/layout.tsx`)
- ✅ `:focus-visible` con outline accent (3px offset)
- ✅ `prefers-reduced-motion: reduce` disabilita tutte le animazioni
- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`)
- ✅ `aria-label` su nav, logo, mobile menu, cookie banner
- ✅ Focus trap su mobile drawer + cookie banner
- ✅ Stato interactive solo su `<a>`/`<button>` (no `<div onClick>`)
- ✅ `aria-hidden="true"` su SVG decorativi

---

## Deploy su Vercel

1. Push del repo su GitHub
2. Import del progetto da [vercel.com/new](https://vercel.com/new)
3. **Framework Preset = Next.js** (CRITICO — se sta su "Other" tutte le route App Router servono 404; vedi `docs/HANDOFF.md` per il debrief)
4. Build/Output/Install Command: lasciare vuoti (defaults Vercel)
5. Set env `NEXT_PUBLIC_SITE_URL=https://www.fosforonero.com`
6. Set env `NEXT_PUBLIC_GA_ID=G-K1QTXSDVD8` (oppure lasciare vuoto e usare il fallback hardcoded)
7. Connetti il dominio (Namecheap → DNS A `216.198.79.65` apex + CNAME `vercel-dns-017.com` per www)
8. Promote manuale del primo deploy in Production
9. Submit `https://www.fosforonero.com/sitemap.xml` a Google Search Console + Bing Webmaster Tools

> **Auto-deploy**: il branch attivo è `responsive` (non `main`), quindi Vercel non auto-promuove. Per il go-live definitivo conviene rinominare `responsive → main` su GitHub.

---

## Note design

L'estetica è quella della **variante 06 "Cool Studio"** approvata nel mockup. Palette:

- Background `#FBFBFA`, Surface `#F4F4F1`, Card `#FFFFFF`
- Ink `#0A0A0A`, Ink 2 `#1F1F1F`, Dim `#6B6B66`
- Rule `#E7E7E2`
- Accent (phosphor green) `#00A341`, Accent-soft `#E6F7EC`

Pagina `/identita` (IT) o `/en/identity` (EN) per il brand book live con tutto il sistema visivo, le varianti logo (V0 boxed + V6 mono, positivo + negativo) e la chimica dietro al nome.

---

## TODO / followup

Il riferimento operativo è sempre **`docs/HANDOFF.md`** (sintesi di fine sessione con i prossimi passi). Per la SEO governance e i check automatici, **`docs/seo/governance.md`**. Per il brief originale dello scaffold (storico, ormai quasi tutto fatto), **`CLAUDE_CODE_PROMPT.md`**.
