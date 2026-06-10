# Istruzioni progetto Fosforonero

## Commit
Quando crei un commit git, usa SEMPRE questa riga di co-authorship al posto di quella di default di Claude:

```
Co-Authored-By: Fosforonero <hello@fosforonero.com>
```

Non includere mai "Co-Authored-By: Claude Sonnet" o varianti con il nome del modello AI.

## Contesto progetto
Per stato attuale, decisioni e roadmap usa `docs/HANDOFF.md` e `README.md`.
`CLAUDE_CODE_PROMPT.md` è un brief storico: leggilo solo se serve recuperare il
contesto iniziale del progetto, non caricarlo in ogni sessione.

## Routine token
- Usa `/handoff` prima di `/compact`, `/clear` o cambio sessione.
- Scope stretto: cita file, obiettivo e formato output quando chiedi analisi.
- Non leggere build output o dipendenze generate: `.claude/settings.json` le
  blocca esplicitamente.

## Qualità
Fail loud, never fake: se mancano credenziali, dati, URL o asset reali, fermati
e dichiaralo. Non inventare metriche, screenshot, testimonial o claim.

## Modello IA per task
Usa SEMPRE il modello più adatto al compito, non uno fisso:
- **Opus** — fisica/shader/correttezza scientifica, architettura, debugging
  complesso, refactor multi-file, contenuti scientifici/SEO, decisioni di design.
- **Sonnet** — implementazione di routine, edit standard, wiring UI, copy non critico.
- **Haiku** — task meccanici (rinomine, grep/lookup, fix di una riga, formattazione).
- **Subagent read-only** (Explore/audit/ricerca parallela) — modello economico per
  il fan-out; Opus solo per la sintesi/verifica critica dei risultati.
- In dubbio, o se il task tocca fisica/correttezza/produzione → **Opus**.

## SEO — regole sempre attive

Ogni volta che scrivi o modifichi un blog post, una pagina web o qualsiasi
contenuto pubblicabile, applica **prima di fare commit**:

### Nuovo blog post (IT + EN)
- `title`: 30–65 caratteri finali (dopo template ` · Fosforonero`)
- `excerpt`: 80–160 caratteri (diventa meta description)
- `image`: obbligatoria — path `public/blog/<progetto>/<slug>.jpg`, asset reale
- `imageAlt`: ≥ 10 parole descrittive, tradotto in entrambe le lingue
- `tag`: 1 tag primario
- `date`: ISO `YYYY-MM-DD`
- Corpo: ≥ 480 parole
- Parità IT ↔ EN: stessi campi frontmatter, stesso path `image`, `imageAlt` tradotto
- Se modifichi contenuto esistente: aggiungi/aggiorna `updated: "YYYY-MM-DD"`
- Inizia sempre con `draft: true`; rimuovilo solo quando l'articolo è completo

### Nuova pagina web
- `title`: 30–65 caratteri, `description`: 110–165 caratteri
- `og:image` presente (1200×630)
- `canonical` + `hreflang` IT↔EN simmetrico
- JSON-LD schema appropriato al tipo di pagina (vedi `docs/seo/governance.md`)

### Post-publish (dopo merge su `init`)
```bash
pnpm seo:audit -- --url=https://fosforonero.com/blog/<slug>
pnpm seo:indexnow -- --url=https://www.fosforonero.com/blog/<slug>
# ripetere per versione EN
```

Regole complete e soglie numeriche: `docs/seo/governance.md`.

## Branch strategy — Tavola Periodica vs Solar System
Il branch locale `init` può contenere lavoro Solar System ahead o uncommitted.
Per sprint Tavola Periodica:
1. Controlla sempre `git status --short --branch` prima di iniziare.
2. Se `init` è ahead o ha modifiche Solar System → crea branch pulito:
   `git checkout -b fix/pt-<slug> origin/init`
3. Committa solo file Periodic Table sul branch pulito.
4. Pubblica con `git push origin fix/pt-<slug>`, poi:
   `git push origin origin/fix/pt-<slug>:init`
5. NON usare il branch locale `init` per push finché contiene Solar System ahead/uncommitted.
