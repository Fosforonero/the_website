# Bussola Solar System Lab

> File di orientamento rapido: dove siamo, cosa fare nella prossima sessione, cosa NON fare.
> Per il dettaglio tecnico vedi `sprint-06-claude-handoff.md`; per le regole vedi `governance.md`.

Ultimo aggiornamento: 2026-06-01 sera

## Dove siamo

- Sprint attivo: **06 — Catalog Object Inspection And Comet Detail**. Stato: ~25% (solo fondamenta preesistenti, codice sprint non ancora scritto).
- Branch: **`feat/solar-sprint-06`** (allineato a `origin/init`, già pushato).
- Verifiche verdi: `solar:audit` ✅ · `tsc --noEmit` ✅ · `build` ✅.
- Piano completo approvato: Task 0–7 in `sprint-06-claude-handoff.md`.

## Next step domani (in ordine)

1. **Sei già sul branch giusto** (`feat/solar-sprint-06`). Conferma con `git status -sb`; gli screenshot al root restano untracked, ignorali.
2. **Step 1 — Stato `SelectedCatalogObject`**: estendi `SearchResult` per portare l'entry catalogo completa; nuovo state `{ entry, name, horizonsMarker, source, orbitPathAvailable }` in `solar-system-view.tsx`; selezione corpo curato ↔ catalogo si escludono. File: `lib/solar-system/catalog.ts`, `components/lab/solar-system-view.tsx`, `components/lab/solar-system-search.tsx`.
3. **Step 2 — Inspector catalogo**: campi a/e/i, perihelion/aphelion (`a(1∓e)`), epoch, H, diametro, NEO/PHA, source, data quality. Campi ignoti → `—`. ~12 label IT/EN in `i18n.ts`.
4. **Step 3 — `sampleCatalogEntryOrbitPath`** (stesso Kepler del catalog layer) + orbita selezionata singola, stile per categoria; skip onesto per `e ≥ 1`.
5. **Step 4 — Coda cometa** anti-Sole (solo cometa selezionata) + disclosure "non simulazione gas/polvere".
6. **Step 5 — Camera focus** su marker/selezione + bottone "clear selected object".
7. **Step 6–7 — Docs IT/EN + governance + audit checks + verifica finale** (audit/tsc/build + browser desktop/mobile/EN, no regression Tavola Periodica).

Esegui task-by-task con `superpowers:subagent-driven-development`.

## Anti-goal (NON fare in Sprint 06)

- Niente N-body, eclissi/transiti, collisioni/esplosioni, tempeste solari, campi magnetici, Oort cloud, Planet X.
- Niente rendering di tutte le orbite catalogo insieme (una sola alla volta).
- Niente nuovo batch massivo di texture.
- Niente mix con file Periodic Table sul branch.

## Rischi aperti

- Comete con `e ≥ 1` (paraboliche/iperboliche) scartate dal layer → serve disclosure onesta "orbit path non disponibile", non valori finti.
- Mars/Mercury texture longitude offset ancora `not-verified` (eredità sprint precedenti, fuori scope 06).
