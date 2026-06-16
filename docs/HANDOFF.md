# Fosforonero — Handoff

> Documento di passaggio tra sessioni. Aggiornato a fine sessione corrente.
> **Ultimo aggiornamento: 2026-06-16** (pubblicato articolo blog SplitVote, riorientamento portfolio)
>
> 🎯 **Prossima sessione: riconciliare `init` locale (ahead 20 / behind 274) con `origin/init` — i 20 commit Solar System vivono solo su disco. In alternativa: diagnosi stutter Buco Nero (mobile+desktop).**
>
> 🧠 **Direttiva permanente — modello IA per task**: usa sempre il modello più adatto.
> Opus per fisica/shader/correttezza, architettura, debug complesso, refactor
> multi-file, contenuti scientifici/SEO; Sonnet per implementazione di routine;
> Haiku per task meccanici; subagent read-only su modello economico (Opus solo per
> sintesi/verifica). In dubbio o se tocca fisica/correttezza/produzione → Opus.
> (Anche in `CLAUDE.md` e nella skill `fosforonero-compass`.)

---

## Sessione 2026-06-16 — stato finale

**Branch / git:** `init` locale, **ahead 20 / behind 274** vs `origin/init`. Working tree: screenshot audit untracked + `docs/periodic-table/pharmadive-integration-analysis.md`, non committati.

**Obiettivo sessione:** risolvere conflitti fitmesh residui, pubblicare i 2 articoli blog SplitVote (EN+IT), riorientare sul portfolio.

**File modificati/creati per area:**
- *Blog*: creati `content/blog/{it,en}/splitvote-arch…-nextjs-redis-supabase.mdx` → mergiati su `origin/init` (commit `71d49c5`), **LIVE in produzione**.
- *Cleanup git*: rimossi da `init` i 2 file fitmesh in conflitto `DU` (residuo stash pop); droppato `stash@{0}` (WIP fitmesh); eliminato branch remoto `feat/blog-splitvote`.
- *Docs*: questo handoff.

**Verifiche:** articoli IT+EN → **200** in prod, titolo presente nell'HTML (render reale). Scoperto: **Vercel deploya da `origin/init`** (non più `responsive`, ormai legacy, 379 commit indietro).

**Rischi / non fatto:**
- Forbice `init` locale 20/274: i **20 commit Solar System** (Sprint 05–06) vivono **solo su disco**, non in prod → a rischio.
- Branch remoto `responsive` morto, da cancellare.
- Branch `feat/blog-fitmesh-anello-fusione` (`817c57a`): articoli porting non mergiati, tono da rivedere.
- **Stutter Buco Nero** mobile+desktop non risolto (3 branch perf aperti: `fix/bh-auto-m2-perf`, `fix/bh-mobile-perf`, `fix/bh-webgpu-voldisk`).
- Maturità progetti: **Tavola Periodica > Sistema Solare > Buco Nero**.

**Prossimo passo:** ✅ Diagnosi stutter Buco Nero fatta → vedi `docs/black-hole-roadmap.md` §0.5. **Domani**: partire dal quick-win #1 (`preserveDrawingBuffer: true` → default `false`, attivo solo in cattura, `black-hole-scene.tsx:371`), poi #2 isteresi governor `setDpr`. Prima però **confermare con un trace Performance on-device** (non ancora fatto). Parallelo aperto: riconciliare `init` (lavoro Solar 20 commit solo su disco) su branch pulito da `origin/init`.

---

## Sessione 2026-06-10 — SEO/GEO Blog Phase 1 + 2

Branch: `fix/seo-blog` (tutti i commit pushati su `fix/seo-blog` **e** su `init`).

**Spedito in produzione (`init`):**

| Commit | Descrizione |
|---|---|
| `513f609` | feat(seo): expand `llms.txt` — 23 URL Lab (BH, Solar System, PT) con descrizioni |
| `549e284` | feat(blog): campo `updated` per `dateModified` in JSON-LD e OG modifiedTime |
| `1bfa0f0` | feat(blog): `CollectionPage` + `ItemList` sugli indici blog IT+EN |
| `2382b94` | fix(blog): 16 titoli accorciati a ≤63 char finali (era 71–78) IT+EN |
| `b8cd20b` | feat(blog): immagini OG per orbitali, spaghettificazione, stack-2026 (Playwright screenshots) |
| `14dff53` | feat(blog): espansi 4 post prodotto sottili (340→510w media) IT+EN |

**Immagini OG aggiunte via Playwright screenshot (produzione):**

| Post | Immagine | Sorgente |
|---|---|---|
| `orbitali-atomici-visualizzati` | `public/blog/tavola-periodica/orbitali-atomici-inspector.jpg` | PT Inspector orbitali 2pz Fosforo |
| `spaghettificazione-disruzione-mareale` | `public/blog/buco-nero/spaghettificazione-playground-tde.jpg` | BH Playground con disco + debris |
| `stack-2026` | `public/blog/buco-nero/buco-nero-webgl-nextjs.jpg` | BH WebGL @60fps M2 Pro |

**Post espansi (Task 6 — thin posts → ≥480 parole):**

| Post | IT → finale | EN → finale | Sezione aggiunta |
|---|---|---|---|
| `splitvote-account-opzionali` | 314→485w | 492w | "Come funziona senza account, in pratica" — token URL + localStorage, no PII |
| `stack-2026` | 340→514w | 544w | "Cosa produce questo stack in pratica" — BH, FitMesh, Supabase concreti |
| `galaxy-watch-android-senza-samsung-health` | 326→563w | 593w | "Perché Health Connect cambia tutto" — hub unificato, vendor-neutral |
| `fitmesh-primo-anno-produzione` | 343→548w | 564w | "Un anno di maintenance" — WearOS API churn, Play Store, dipendenze |

**Ancora mancanti (⚠️ servono screenshot reali da Matteo):**

| Post | Cosa serve |
|---|---|
| `fitmesh-primo-anno-produzione` | screenshot dashboard/app FitMesh (16:9, ≥1200w) |
| `galaxy-watch-android-senza-samsung-health` | screenshot Galaxy Watch / Wear OS UI |
| `splitvote-account-opzionali` | screenshot poll in app SplitVote |

Salvarli in `public/blog/<progetto>/<slug>.jpg`, poi aggiungere `image` e `imageAlt` nel frontmatter IT+EN. Niente inventati.

### ▶ Coda aperta — prossima sessione

**Priorità 1 — BH UX F1 (in attesa verifica device):**
- Il selettore disco unificato (`diskMode: "off"|"thin"|"vol"|"particles"`) è in `fix/bh-auto-m2-perf` commit `7195741`.
- Prima del merge su `init`: test su device reale (mobile + desktop) che i 4 stati funzionino, poi `git push origin fix/bh-auto-m2-perf:init`.
- **F1 restante:** cielo selector (Procedurale/Reale/Nero → un `<select>`), grouping controlli in sezioni Fisica/Aspetto/Qualità.
- **F2:** unificare label e UX tra WebGL / WebGPU / Playground.

**Priorità 2 — Screenshot prodotto:**
- 3 post blog mancano ancora di immagine OG (vedi tabella sopra).

**Priorità 3 — SEO Phase 3 (FAQ schema):**
- Aggiungere `FAQPage` JSON-LD ai post scientifici con vere domande/risposte (orbitali, spaghettificazione, buco nero nel browser).
- Candidati: già hanno sezioni Q&A o spiegazioni step-by-step.

---

## Sessione 2026-06-09 — Buco Nero perf/UX + About Tavola Periodica

Branch: `fix/bh-auto-m2-perf` (tutti i commit sotto già pushati su `fix/bh-auto-m2-perf` **e** su `init`).

**Spedito in produzione (`init`):**

| Commit | Descrizione |
|---|---|
| `f8104bf` | fix(e11): route groups `app/(it)` + `app/(en)` → `<html lang>` corretto per locale |
| `e5f9b11` | feat(blog): share bar (X, LinkedIn, copia link) negli articoli |
| `ed538ae` | feat(blog): view count via Upstash Redis (⚠️ serve `UPSTASH_REDIS_REST_URL` + `_TOKEN` su Vercel, altrimenti invisibile) |
| `54a7e78` | perf(bh): fix lentezza disco volumetrico — WGSL over-stepping (footprint-gating) + DPR vol-aware |
| `3659343` | fix(pt): atom-view mobile, chrome morta al tap (paint-order canvas) → `z-index` chrome |
| `0214463` | perf(bh-webgpu): disco volumetrico OFF di default |
| `623b0df` | feat(pt): About a livello Buco Nero — FAQ + JSON-LD (TechArticle + FAQPage) |
| `7101194` | fix(pt): inspector orbitali, `×` collassa il popup (non esce) su mobile |
| `0e24f0d` | fix(pt): inspector orbitali mobile — popup chiudibile sopra la tab bar, griglia ridondante nascosta |
| `ed14bf1` | fix(bh-playground): particelle co-rotanti + puntiformi |
| `ada318f` | feat(bh): photon ring analitico a LOW (dichiarato) — WebGL + WebGPU |
| `82afad5` | feat(bh-playground): toggle disco particelle + corpi cadono meno facilmente (star 0.94, comet 0.72) |
| `f9ce667` | feat(bh): toggle disco particelle anche sul simulatore WebGL principale |
| `49d9720` | docs(bh): About FAQ — differenza getti vs vento del disco (IT+EN) |

**Verifiche:** `tsc --noEmit` ✅ e `build` ✅ a ogni commit. NON verificabile headless: resa GPU/perf reale → **da confermare sul device** (FPS buco nero, fix touch tavola periodica mobile).

**Decisioni:** vol disk è la feature più pesante → off di default ovunque; photon ring a low = anello analitico dichiarato (`uSteps/u.steps < 200`); il lensing esterno netto è fisico (secondo immagine / anello di Einstein), non un bug; il cielo reale è già campionato senza cuciture (`RepeatWrapping`); il vento è gated off, NON è causa di lentezza.

### ▶ Coda aperta — ripartire da qui domani
1. **Cielo reale WebGL slavato** vs WebGPU → allineare post-processing (esposizione/tonemap) tra GLSL e WGSL. (`black-hole-shader.ts` `starField` vs `black-hole-wgsl.ts`)
2. **Disco particellare "non corretto"** → serve dettaglio utente (rado/spesso/colore/rotazione) prima di intervenire. "Miglioralo" sul simulatore principale: direzione da confermare.
3. **Toggle code stelle (tidal stream)** nel playground (il toggle disco di sfondo c'è già).
4. **Vento**: rinforzare visibilità (emissione troppo debole) + esporre toggle sulle pagine principali (ora solo playground).
5. **Migliorie resa** getti (più collimati/luminescenti) + vento (cono strutturato) — entrambi oggi stilizzati/"finti", dichiarati.
6. Opz.: ringdown — abbassare il fattore `0.7` se l'anello risulta troppo acceso.

---

## Sessione 2026-06-04 — Mobile Atom-View IA Redesign

Branch: `fix/pt-mobile-atom-ia` (pushed, ahead di `origin/init` di 10 commit).

**Sprint completato:** rifondazione chrome mobile atom view della Tavola Periodica.

| Commit | Descrizione |
|---|---|
| `d4f8f95` | feat: SSR-safe useIsMobile hook |
| `a9369c6` | feat: scaffold mobile chrome components |
| `fbc2795` | feat: CSS render-both mobile atom IA |
| `5fa85d9` | feat: sheet state + invariants |
| `f1d4b58` | feat: bottom-sheet accessibile + sheet contents |
| `2e04bc2` | feat: wire mobile chrome into view |
| `a84d8c5` | feat: takeovers, landscape, CSS cleanup |
| `8615558` | fix: InfoPanel/TempControl mobile, ref warning, :has() header |

**Verifiche passate:** `tsc --noEmit` ✅ · `build` ✅ · `seo:audit 0/0` ✅ · lint no nuovi errori ✅. Browser: 390px portrait, 844×390 landscape, 1440px desktop invariato, table view no regression.

**Prossimo step:** push del branch su `init` (o PR), poi ripartire da Solar System Sprint 06 (bussola in `docs/solar-system/bussola.md`, piano in `docs/superpowers/plans/2026-06-03-mobile-atom-ia.md`).

---

## Sessione 2026-05-31 — stato finale

### Tavola Periodica — chiusa e pushata

Branch `init` sincronizzato con `origin/init`. Ultimo commit Periodic Table:

```txt
5d9104a feat(periodic-table): add premium local molecule dataset v2
```

Commit di supporto successivo:

```txt
6a514fd chore: ignore local visual audit screenshots
```

Sprint completati oggi:

| Area | Commit | Stato |
|---|---:|---|
| Mobile UX 1 — controlli portrait + temperature control | `e74d9e0` | Pushato |
| Mobile UX 2 — Orbital Inspector bottom sheet, close, nucleus overlay | `d2711b6` | Pushato |
| Mobile UX 3 — tap targets, font floor, PubChem 2D note | `e493288` | Pushato |
| Mobile UX cleanup — touch target residui | `3514bdb` | Pushato |
| Crystal UX Pass v1 — CN/APF, overlay struttura, legenda mobile | `f1aee4f` | Pushato |
| Molecule Dataset Premium v2 — cisplatin, Li2CO3, N2O, ZnO, FeSO4, benzene | `5d9104a` | Pushato |
| Screenshot ignore patterns | `6a514fd` | Pushato |

Stato funzionale Tavola Periodica:

- Mobile portrait ora ha controlli principali visibili, temperatura accessibile, Orbital Inspector chiudibile e touch target ripuliti.
- Crystal View mostra nome struttura, CN e APF; legenda compatta visibile su mobile.
- Applications v1 copre 23 elementi e collega le molecole correlate al viewer.
- Molecule Dataset v2 riduce dipendenza da PubChem per casi chiave: Pt/cisplatin, Li/lithium carbonate, N/nitrous oxide, Zn/zinc oxide, Fe/ferrous sulfate, C/benzene.
- PharmaDive/Moore Metrics escluso dal core: usare dati curati, PubChem, in futuro eventuale audit ChEMBL/RCSB PDB.
- URL inglese canonico tavola: `/en/lab/periodic-table`; vecchio `/en/lab/tavola-periodica` redirige permanentemente.

### Tavola Periodica — prossimo riavvio consigliato

1. **Fix mobile overlay Material View / temperature control** osservato su screenshot utente:
   - Scenario: mobile portrait, elemento Mercurio (`Hg`, Z=80), Material View attiva, temperatura circa `-45 °C`.
   - Sintomo: `MaterialLegend` ("particelle ordinate...", disclaimer modello concettuale) e `TemperatureControl` si sovrappongono; il controllo temperatura invade l'area sopra l'InfoPanel e crea collisione visiva con testo/canvas.
   - Ipotesi root cause: MaterialLegend è ancora dockata bottom-left mentre TemperatureControl è centrato/bottom in portrait; InfoPanel inizia sotto senza riservare spazio per entrambi. Serve layout mobile esclusivo per Material View: o legenda collassata/nascosta in portrait, o temperature control dockato in sheet/pill senza overlap, o z-index/spacing dedicato.
   - Sprint consigliato: `Mobile Material Overlay Fix`, Sonnet, CSS/JSX mirato, test 375/390/412 portrait su Hg + Fe, dark/light.
2. **Smoke test Molecule Dataset v2** su produzione:
   - Pt -> Applications -> cisplatin locale, no badge PubChem.
   - Li -> lithium carbonate locale.
   - N -> nitrous oxide locale.
   - Zn -> zinc oxide locale.
   - Fe -> ferrous sulfate locale.
   - C -> benzene locale, ball-stick e space-filling.
3. **Aggiornare `docs/periodic-table/governance.md`** con gli sprint completati il 2026-05-31. Il documento contiene ancora alcune righe stale: canonical EN vecchio, Applications panel v0, molecole premium non aggiornate.
4. Dopo smoke/governance, scegliere uno sprint:
   - Molecule Dataset v3: XeF4, PCl5, ethanol, acetic acid.
   - Crystal UX v2: site-coloring, single-cell/extended-lattice toggle, reset camera.
   - ChEMBL audit read-only.

### Solar System — separato, non toccare da sprint Tavola

Il Solar System resta aperto in un altro contesto/agente. A fine controllo locale risultavano modifiche non committate in:

- `components/lab/solar-system-scene.tsx`
- `docs/solar-system/governance.md`
- vari file nuovi in `docs/solar-system/`

Regola per domani: non fare cleanup, commit o revert su questi file dalla sessione Tavola Periodica.

---

## Sessione 2026-05-28 — stato finale

### Tavola periodica — SEO, contenuti e documentazione
- **Manuale pubblico bilingue aggiunto**:
  - IT: `/lab/tavola-periodica/manuale`
  - EN: `/en/lab/tavola-periodica/manual`
  - Include metadata SEO, canonical, hreflang, OG image, JSON-LD `WebPage`,
    `HowTo`, `FAQPage`, `BreadcrumbList`.
- **About tavola periodica rifinito**: metadata accorciati nelle soglie SEO,
  link al manuale aggiunto nella nav, fonti/roadmap ancora server-rendered.
- **Pagina principale tavola periodica**: aggiunto JSON-LD `WebApplication`
  su IT/EN, metadata description accorciate, link `manuale/manual` nel menu.
- **Sitemap aggiornata** con manuale IT/EN e alternates reciproci.
- **`/llms.txt` aggiunto** per GEO/AI crawler con home, blog, lab, manuale,
  about tavola e autore.

### Articoli blog in bozza
- Aggiunte 4 bozze MDX (`draft: true`, visibili in dev/preview, nascoste in
  produzione):
  - `content/blog/it/tavola-periodica-interattiva-idea.mdx`
  - `content/blog/it/tavola-periodica-webgl-sviluppo.mdx`
  - `content/blog/en/tavola-periodica-interattiva-idea.mdx`
  - `content/blog/en/tavola-periodica-webgl-sviluppo.mdx`
- Aggiunti screenshot reali 1200×630 in `public/blog/tavola-periodica/`:
  - `tavola-periodica-interattiva-3d.png`
  - `modello-atomo-fosforo-webgl.png`
- `lib/blog.ts`, blog post metadata e `BlogPosting` JSON-LD supportano ora
  `image` e `imageAlt` nel frontmatter.

### Landing completa aggiornata
- La home completa esiste in:
  - `/preview`
  - `/en/preview`
- Aggiornata con ultime info:
  - metriche: `04` progetti
  - stack: `Next · AI · 3D`
  - status: `03 LIVE · LAB · APP · TOOLING`
  - copy Tavola Periodica aggiornato con manuale, fonti, heatmap,
    ossidazioni, mobile e modelli atomici.
  - copy SiteBrain aggiornato come WIP realistico.
  - sezione blog preview mostra 6 articoli, inclusi i 2 draft della tavola.
- Controllo visivo fatto su desktop e mobile: layout OK.

### Claude Code / token hygiene
- Aggiunto `.claude/settings.json` con deny su `.env`, `.vercel`,
  `node_modules`, `.next`, `build`, `dist`, `coverage`.
- Aggiunti slash command:
  - `.claude/commands/handoff.md`
  - `.claude/commands/seo-audit.md`
- Aggiunto hook `scripts/claude/prevent-generated-edits.mjs`.
- `CLAUDE.md` aggiornato con routine token e regola “fail loud, never fake”.

### Verifiche eseguite
- `pnpm typecheck` ✅
- `pnpm build` ✅
- `pnpm seo:audit -- --url=http://localhost:3000` ✅
  - 0 errori
  - 2 warning preesistenti su slug SplitVote IT/EN
- `pnpm lint` ❌ ancora rosso per problemi preesistenti:
  - `app/sitebrain/success/page.tsx`: apostrofo non escapato
  - `components/lab/atom-scene.tsx`: `Math.random`/refs durante render
  - `components/lab/periodic-table-view.tsx`: `setState` sincrono in effect

### Stato git
- Branch corrente: `init`
- Molti file modificati/non tracciati non sono ancora committati.
- Non è stato fatto push.

---

## Domani — checklist consigliata

### 1. Review visuale
- [ ] Aprire `http://localhost:3000/preview`
- [ ] Aprire `http://localhost:3000/en/preview`
- [ ] Controllare progetti, blog, copy Tavola Periodica, SiteBrain e mobile.
- [ ] Aprire manuale:
  - `/lab/tavola-periodica/manuale`
  - `/en/lab/tavola-periodica/manual`

### 2. Decidere pubblicazione
- Opzione A: **tenere welcome/Coming Soon** su `/` e `/en`, lasciando la
  landing completa in preview.
- Opzione B: **swap preview → home**:
  1. `app/page.tsx`: usare `Landing` + `getAllPosts("it")`
  2. `app/en/page.tsx`: usare `Landing` + `getAllPosts("en")`
  3. riattivare `projectsListLd` sulla home
  4. aggiornare `scripts/seo/audit.ts` aspettandosi `ItemList` su `/` e `/en`
  5. decidere se rimuovere `/preview` o lasciarlo `noindex`

### 3. Prima del deploy
- [ ] Sistemare o accettare temporaneamente `pnpm lint` rosso.
- [ ] Decidere se pubblicare i due articoli tavola: togliere `draft: true`
      solo quando copy e immagini sono approvati.
- [ ] Commit ordinato su `init`.
- [ ] Push su GitHub.
- [ ] Vercel deploy/production check.
>
> ✅ **SITO LIVE su https://fosforonero.com** (Coming Soon mode).
> Tutte le 10 route (`/`, `/en`, `/blog`, `/en/blog`, `/privacy`, `/cookies`,
> `/sitemap.xml`, `/robots.txt`, `/apple-icon.png`, `/opengraph-image`)
> servono 200. GA `G-K1QTXSDVD8` attivo con Consent Mode v2 default = denied.
>
> ⚠️ **La home `/` e `/en` servono una pagina Coming Soon** con email CTA +
> 3 pill social (LinkedIn, Hugging Face, Instagram) + 2 pill progetti
> live (FitMesh, SplitVote) + micro footer legale. Il Landing completo
> è pronto nel codice ma temporaneamente disattivato — vedi sezione
> "Coming Soon mode" sotto.
>
> ⚠️ **GitHub link rimossi** da `lib/site.ts.socials` (e quindi anche dal
> JSON-LD `sameAs`) su richiesta del proprietario.

---

## ⚠️ Vercel "Framework Preset" trap — leggere SEMPRE prima di toccare Vercel

Bug subdolo che ha fatto perdere ~1h alla sessione 1: il progetto Vercel
fu creato con **Framework Preset = `Other`** invece di `Next.js`. Sintomo:
tutte le route App Router rispondevano 404, ma gli asset in `/public/*`
funzionavano (es. `/apple-icon.png` → 200). Vercel non runnava `next build`
e pubblicava solo il contenuto static di `/public/`.

**Fix**: Project → Settings → Build and Deployment → Framework Settings →
**Framework Preset** dropdown → **Next.js** → Save → Redeploy.

Lasciando Framework Preset = Next.js, gli altri campi (Build/Output/Install
Command) **vanno lasciati vuoti**: Vercel autocompleta i defaults corretti.

Se domani vedi 404 su `/` ma 200 su `/icon.svg` o `/apple-icon.png`,
questo è il primo posto da guardare.

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

## Coming Soon mode

Da `app/page.tsx` e `app/en/page.tsx`, la home renderizza
`<ComingSoon locale={...} />` (`components/parts/coming-soon.tsx`) invece di
`<Landing>`. Gli import di `Landing`, `getAllPosts`, `projectsListLd`
restano nel file come commento, pronti da scommentare. Le route
`/blog`, `/blog/[slug]`, `/en/blog`, `/en/blog/[slug]`, `/privacy`,
`/cookies` continuano a funzionare normalmente — il blog è raggiunto da
un link discreto nel footer della coming soon.

### Per riaccendere il sito completo
1. `app/page.tsx`: ripristina `Landing` + `projectsListLd` (commenti già pronti)
2. `app/en/page.tsx`: stessa cosa
3. `scripts/seo/audit.ts`: aggiungi di nuovo `"ItemList"` agli `expectLdTypes` di `/` e `/en`
4. `pnpm seo:audit -- --json --update-baseline` per ricalibrare il baseline
5. Commit e push: `feat: reactivate full landing (coming soon retired)`

### GitHub temporaneamente rimosso
- `lib/site.ts.socials` non contiene più la chiave `github`
- La `<Landing>` contact section e la `<ComingSoon>` social list mostrano
  solo LinkedIn, Hugging Face, Instagram
- JSON-LD `sameAs` di Person/Organization è automaticamente più corto
- Per ripristinare: in `lib/site.ts` ri-aggiungi
  `github: "https://github.com/fosforonero"` e in `components/landing.tsx`
  ri-aggiungi la riga `["GitHub", "github.com/fosforonero", site.socials.github]`

---

## Cosa è nel branch `responsive` (11+ commit sopra `init`)

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
| `splitvote-account-opzionali`                 | **live**   | riscritto 23-05-2026: si vota senza account, account opzionale per chi crea poll |

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
- `docs/black-hole-roadmap.md` — roadmap simulatore buco nero: bug aperto (photon ring), rifiniture in sospeso, versione WebGPU separata, C#/Unity Steam, articolo blog da scrivere
