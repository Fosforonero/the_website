# SEO Governance — Fosforonero

Standard sempre attivi per ogni contenuto e modifica del sito.
Letti dal subagent `seo-auditor` (`.claude/agents/seo-auditor.md`) e dal
workflow `.github/workflows/seo-audit.yml`.

## Principi

1. **Misurabile, non opinabile.** Ogni regola in questo file è verificabile in
   modo automatico da uno script o da Lighthouse. Niente "fai meglio".
2. **Conservativo prima di tutto.** L'audit segnala regressioni; non riscrive
   contenuto da solo. Le proposte di modifica restano in PR/issue, l'umano
   approva.
3. **Soglie esplicite.** Tutto è espresso come limite numerico. Se cambia, si
   aggiorna questo documento E lo script che lo verifica nella stessa PR.

## Regole tecniche (verificate ogni giorno dal workflow)

### Meta tags
| Campo | Regola | Severità |
|---|---|---|
| `<title>` | 30–65 caratteri, non vuoto, unico per pagina | error |
| `<meta name="description">` | 110–165 caratteri, non vuoto | error |
| `<meta name="description">` duplicato tra pagine | proibito | warn |
| `<link rel="canonical">` | presente su ogni pagina indicizzabile | error |
| `<link rel="alternate" hreflang>` | presente su home e blog, simmetrico IT↔EN | error |
| `<meta name="robots">` con `noindex` | proibito in produzione su pagine indexable | error |
| `og:title` / `og:description` / `og:image` / `og:url` | tutte presenti | error |
| `twitter:card` | `summary_large_image` | warn |

### Structured data (JSON-LD)
| Schema | Su quali pagine | Campi obbligatori |
|---|---|---|
| `WebSite` | tutte (root layout) | `name`, `url`, `inLanguage`, `publisher` |
| `Organization` | tutte (root layout) | `name`, `url`, `sameAs`, `address` |
| `Person` | tutte (root layout) | `name`, `url`, `jobTitle`, `worksFor`, `sameAs` |
| `ItemList` | home `/` e `/en` (Landing, NON ComingSoon) | `itemListElement[]` con `position`, `url`, `name` |
| `BlogPosting` | ogni post `/blog/<slug>`, `/en/blog/<slug>` | `headline`, `datePublished`, `author`, `inLanguage`, `mainEntityOfPage` |
| `BreadcrumbList` | blog post, `/identita`+`/en/identity`, `/privacy`+EN, `/cookies`+EN | `itemListElement[]` con `position`, `name`, `item` |
| Tutti | sempre | `@context: https://schema.org`, JSON valido |

### Performance (Lighthouse, mobile)
| Metrica | Soglia minima |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 100 |
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| TBT | ≤ 200ms |

Le stesse soglie su desktop sono ≥ 95 per Performance.

### Crawlabilità
- `sitemap.xml` raggiungibile, valido, con tutte le route indicizzabili
- `robots.txt` raggiungibile, NON blocca `/sitemap.xml`
- Nessun link interno rotto (`linkinator`, depth illimitato sui domini propri)
- Nessuna risposta 4xx/5xx sui link presenti nei post del blog

### Asset SEO
- `<img>` con `alt` non vuoto (eccezione: `aria-hidden="true"` per decorativi)
- Favicon `/icon.svg` raggiungibile
- OG image `/opengraph-image` raggiungibile, ~1200×630
- Apple touch icon `/apple-icon.png` raggiungibile (TODO punto B)

### Internazionalizzazione
- Ogni route IT esiste anche in EN (`/x` ↔ `/en/x`)
- Slug blog **possono differire** tra IT ed EN (es. `splitvote-account-opzionali`
  / `splitvote-optional-accounts`): in questo caso `alternates.languages` nel
  metadata della pagina deve dichiarare entrambi gli URL espliciti, e la
  sitemap deve includere `xhtml:link` reciproci. Verificato per la pagina
  identità (`/identita` ↔ `/en/identity`).
- `<html lang>` corretto per locale (riapertura prevista quando si introduce
  route group `[locale]`)

## Regole di contenuto (linee guida, non bloccanti)

- **H1**: una sola per pagina, contiene la keyword primaria della pagina
- **H2-H3**: gerarchia coerente, niente salti `H1 → H4`
- **Internal linking**: ogni blog post ha almeno un link interno (a un altro
  post o a un progetto) e uno esterno qualificato. Il componente `PostNav`
  (`components/parts/post-nav.tsx`) aggiunge automaticamente prev/next +
  fino a 3 correlati per tag sotto ogni post — questi contano come
  internal linking strutturale.
- **Tag/categoria blog**: 1 tag primario per post (campo `tag` nel frontmatter)
- **Date frontmatter**: ISO `YYYY-MM-DD`, monotonicamente crescente nella history
- **Excerpt frontmatter**: 80–160 caratteri, è la base della meta description
- **Draft posts**: `draft: true` nel frontmatter nasconde il post in produzione
  (visibile solo in dev). Usalo finché un articolo non è verificato.

Queste linee guida le verifica il subagent `seo-auditor` su singoli file
quando glielo si chiede manualmente; il workflow daily NON le impone in
automatico (sono editoriali).

## Cosa fa il workflow giornaliero

`/.github/workflows/seo-audit.yml`, schedule `0 6 * * *` (~7-8 AM Roma).

1. Clone del repo, install deps
2. Build statico (`pnpm build`) per ottenere `/.next/` self-contained
3. Avvio Next in modalità `start` su `localhost:3000`
4. Esecuzione `pnpm seo:audit` (script in `scripts/seo/audit.ts`) contro
   l'istanza locale **o**, se il secret `SEO_AUDIT_URL` è settato, contro il
   sito in produzione
5. Confronto con `docs/seo/baseline.json` (snapshot ultimo audit verde)
6. Se ci sono regressioni rispetto al baseline → apre/aggiorna una GitHub
   issue con label `seo:regression` contenente il diff completo
7. Se nessuna regressione → eventuali issue aperte con quel label vengono
   chiuse automaticamente
8. Aggiorna `docs/seo/baseline.json` quando il main branch è verde

Il workflow è idempotente: lo si può lanciare manualmente
(`workflow_dispatch`) senza effetti collaterali.

## Quando aggiornare questo documento

- Cambia una soglia → aggiorna tabella + il check corrispondente nello stesso
  PR
- Nuovo tipo di pagina (es. landing prodotto) → estendi la tabella
  "Structured data" + crea un check dedicato
- Nuova lingua oltre IT/EN → estendi le regole hreflang e il checker

## Esecuzione manuale on-demand

```bash
# audit completo locale (richiede dev server up su :3000)
pnpm seo:audit

# audit di un singolo URL
pnpm seo:audit -- --url=https://fosforonero.com/blog/stack-2026

# update del baseline (usare con cautela, da fare quando si accetta una
# riduzione di score motivata)
pnpm seo:audit -- --update-baseline

# IndexNow — notifica Bing/Yandex/Yep/Seznam/Naver delle URL aggiornate
pnpm seo:indexnow                                        # tutte le URL del sitemap
pnpm seo:indexnow -- --url=https://www.fosforonero.com/blog/nuovo  # singola URL
```

## IndexNow

Il sito supporta il protocollo [IndexNow](https://www.indexnow.org/) per
notificare istantaneamente i motori di ricerca dei contenuti aggiornati.

- **Motori coperti**: Bing, Yandex, Yep, Seznam, Naver, DuckDuckGo (via Bing).
- **Google**: non supporta IndexNow (per Google resta il flusso classico
  Search Console + sitemap).
- **Chiave**: `b6c7991c983eeddfaa4cbf51d26f61eb` (32 hex, generata una volta).
  Validata via `public/<key>.txt` che contiene la stessa chiave.
- **Trigger automatico**: il workflow `.github/workflows/seo-audit.yml`
  pinga IndexNow ogni notte dopo un audit verde (skipped per audit locali
  per evitare di dichiarare host sbagliato).
- **Trigger manuale**: `pnpm seo:indexnow` dopo aver pubblicato contenuti
  significativi (nuovo post, nuovo progetto, restyling di una pagina).
