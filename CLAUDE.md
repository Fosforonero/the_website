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
