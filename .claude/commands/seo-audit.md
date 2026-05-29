---
description: "Audit SEO tecnico Fosforonero su pagine, MDX e structured data"
---

Esegui un audit SEO tecnico del sito Fosforonero seguendo `docs/seo/governance.md` e `.claude/agents/seo-auditor.md`.

Scope:

1. Leggi `docs/seo/governance.md`.
2. Controlla le route o i file MDX citati dall'utente. Se non sono citati, controlla le route principali e gli MDX modificati nel working tree.
3. Usa `pnpm seo:audit -- --url=https://www.fosforonero.com` per il baseline live quando serve.
4. Per contenuti blog, verifica frontmatter, title/excerpt length, heading hierarchy, link interni/esterni, draft status e parità IT/EN.
5. Se trovi problemi, proponi fix puntuali con file e riga. Non riscrivere copy senza conferma.

Output richiesto:

```markdown
# SEO audit — <scope> — <data ISO>

## OK
## Warning
## Errori
## Note editoriali
```
