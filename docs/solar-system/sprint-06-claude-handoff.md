# Sprint 06 Claude Handoff — Catalog Object Inspection And Comet Detail

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selected SBDB catalog objects feel explorable and technically credible: camera focus, selected orbit path, orbital elements, data-quality disclosure, comet-tail visualization, and first-class inspector UX for asteroids/comets/TNOs.

**Architecture:** Keep dense catalog layers as `THREE.Points`. Do not render every catalog body as a mesh. When a user selects/searches one catalog object, promote only that object into an inspected state with one highlighted marker, one sampled orbit path, and detailed metadata. Comet tail visualization is a lightweight selected-object overlay derived from Sun direction, not a gas/dust physics simulation.

**Tech Stack:** Next.js App Router, TypeScript, React Three Fiber, Three.js, JPL SBDB/Horizons, existing SBDB catalog chunks, existing `pnpm solar:audit`.

---

## Read First

1. `docs/solar-system/governance.md`
2. `docs/solar-system/data-and-assets.md`
3. `docs/solar-system/micro-sprints-2026-05-31.md`
4. `docs/solar-system/sprint-05-claude-handoff.md`
5. `docs/solar-system/ultimate-simulator-roadmap.md`

## Current Baseline

Already done:

- SBDB catalog chunks for NEO, main belt, comets, TNOs, centaurs.
- Dense catalog rendering through `THREE.Points`.
- Search/autocomplete through `/api/solar/catalog/search`.
- JPL Horizons marker for selected search result.
- Selected catalog orbit path exists in early form.
- Camera focus on selected curated bodies and Horizons marker.
- Real visualization maps for Earth/Moon/Mars/Mercury.
- IAU prime-meridian model for Earth/Moon/Mars/Mercury/Venus.

Known limitations:

- Mars/Mercury texture longitude offsets remain `not-verified`.
- Catalog objects are still mostly point markers.
- Comets do not have tails or activity indicators.
- Orbit path for selected catalog object needs UX and audit hardening.
- No N-body, no collision, no eclipse engine, no magnetic fields, no Planet X claims.

## Strict Scope

In scope:

- stronger selected catalog object state;
- selected object inspector with orbital elements;
- selected catalog orbit path made reliable and visibly distinct;
- selected comet tail pointing away from Sun;
- selected-object data-quality disclosure;
- mobile-friendly selected object panel behavior;
- audit checks and docs.

Out of scope:

- no N-body;
- no eclissi/transiti;
- no collision/explosion engine;
- no solar storm or magnetic field simulation;
- no Oort cloud model;
- no Planet X / Planet Nine detection claim;
- no rendering all catalog orbits at once;
- no new massive texture batch.

## Task 0 — Baseline Verification

- [ ] Run:

```bash
git status --short
git log --oneline -8
pnpm solar:audit
pnpm tsc --noEmit
pnpm build
```

- [ ] Expected:
  - audit passes;
  - typecheck passes;
  - build passes;
  - Solar System screenshots/docs may be untracked; do not delete them unless explicitly asked.

## Task 1 — Selected Catalog Object State

**Files:**

- Modify: `components/lab/solar-system-view.tsx`
- Modify: `components/lab/solar-system-search.tsx`
- Modify: `lib/solar-system/catalog.ts`

- [ ] Ensure search selection stores the full selected catalog object when possible, not only the Horizons marker.

- [ ] If live SBDB search does not return full orbital elements, fetch/derive them from:
  - matching static catalog layer if loaded;
  - or SBDB object endpoint if needed;
  - or show "orbit path unavailable" honestly.

- [ ] Add a clear selected-catalog state shape:

```ts
type SelectedCatalogObject = {
  entry: CatalogEntry | null;
  name: string;
  horizonsMarker?: HorizonsMarker | null;
  source: "sbdb-static" | "sbdb-live" | "horizons";
  orbitPathAvailable: boolean;
};
```

- [ ] Selecting a curated major body must clear selected catalog state.

- [ ] Selecting a catalog object must not change `selectedBodyId` to an invalid curated-body id.

## Task 2 — Inspector For Catalog Objects

**Files:**

- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`
- Modify: `components/lab/solar-system.css`

- [ ] Add a dedicated inspector section for selected catalog object:
  - display name;
  - category;
  - SBDB id/SPK id;
  - data source;
  - data quality;
  - epoch JD/date;
  - semi-major axis AU;
  - eccentricity;
  - inclination;
  - perihelion/aphelion estimate where possible;
  - absolute magnitude H;
  - diameter if known;
  - NEO/PHA flags where available.

- [ ] Keep text compact on desktop and mobile.

- [ ] If a field is unknown, show `—`, not fake values.

- [ ] Add bilingual labels IT/EN.

## Task 3 — Selected Orbit Path Hardening

**Files:**

- Modify: `lib/solar-system/ephemeris.ts`
- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `scripts/solar-system/audit-orbits.ts`

- [ ] Ensure selected catalog orbit path:
  - uses same Kepler math as catalog point position;
  - handles high eccentricity comets;
  - skips parabolic/hyperbolic or invalid entries with a clear UI note;
  - renders only one selected path at a time.

- [ ] Style selected catalog orbit path distinctly:
  - comets: cyan/blue, higher opacity;
  - NEO/asteroid: orange/white;
  - TNO/centaur: purple/desaturated.

- [ ] Audit must check:
  - `sampleCatalogEntryOrbitPath` exists;
  - selected catalog orbit component exists;
  - no code renders all catalog orbits at once.

## Task 4 — Comet Tail Visualization

**Files:**

- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `lib/solar-system/catalog.ts`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`

- [ ] For selected catalog object with category `comet`, render a tail:
  - starts at selected marker;
  - points away from the Sun;
  - length increases as heliocentric distance decreases;
  - opacity decreases with distance;
  - label it as visualization, not physical coma/dust simulation.

- [ ] Do not render tails for all comets in the catalog layer.

- [ ] Use simple geometry:
  - line/cone/sprite trail is acceptable;
  - no particle system needed in Sprint 06.

- [ ] Inspector text:
  - IT: "Coda visuale: direzione anti-solare; non simulazione gas/polvere."
  - EN: "Visual tail: anti-solar direction; not a gas/dust simulation."

## Task 5 — Camera And Selection UX

**Files:**

- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `components/lab/solar-system-search.tsx`

- [ ] Search result selection must:
  - set selected catalog object;
  - request Horizons marker;
  - focus camera on marker when available;
  - keep orbit path visible if orbital elements are available.

- [ ] Layer point click selection is optional for this sprint. If not implemented, document that catalog selection is search-first.

- [ ] Add "clear selected catalog object" button.

## Task 6 — Documentation And Honesty

**Files:**

- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`
- Modify: `docs/solar-system/governance.md`

- [ ] Update docs IT/EN:
  - catalog objects are search-first;
  - selected catalog object can show path/details;
  - dense layers remain points;
  - comet tail is visual anti-solar direction only;
  - no gas/dust physics;
  - no N-body/collision/eclipses yet.

- [ ] Add Sprint 06 completion status only after verification passes.

## Task 7 — Final Verification

- [ ] Run:

```bash
pnpm solar:audit
pnpm tsc --noEmit
pnpm build
```

- [ ] Browser verify:
  - `/lab/sistema-solare` desktop;
  - `/en/lab/solar-system` desktop;
  - mobile 390px;
  - search and select a comet;
  - search and select an asteroid/NEO;
  - selected orbit path visible;
  - comet tail visible only for comet;
  - `/lab/tavola-periodica` no regression.

## Final Report Required

Claude must report:

1. commit hash;
2. files changed;
3. selected catalog object UX behavior;
4. comet tail behavior and limitations;
5. audit/typecheck/build results;
6. browser verification;
7. remaining limitations;
8. proposed next sprint.

## Recommended Next Sprint

Sprint 07 should be either:

- analytic eclipse/transit model for Sun-Earth-Moon and Mercury/Venus transits; or
- empirical Mars/Mercury texture alignment verification if visual surface orientation remains a concern.

---

## Session Handoff — 2026-06-01 sera (planning, codice non iniziato)

**Branch / git:** ancora su `feat/pt-chembl-layer` (behind `origin/init` di 1). Lavoro Solar System (docs, screenshot, `app/api/solar/earth-imagery/`, `lib/solar-system/gibs.ts`) untracked nel working tree. **Il branch pulito NON è ancora stato creato.**

**Obiettivo sessione:** kickoff Sprint 06 in modalità "plan prima". Letto i 6 doc, mappato lo stato del codice, lanciato verifiche iniziali, prodotto e fatto approvare il piano. Nessuna modifica al codice.

**File modificati/creati:**
- Docs: questo file (`sprint-06-claude-handoff.md`) — aggiunto questo blocco di handoff. Nessun altro file toccato.

**Verifiche eseguite:** `pnpm solar:audit` ✅ PASS (snapshot OK: NEO 41.780, MBA 5.000, comete 4.065, TNO 6.044, centauri 1.023); `pnpm tsc --noEmit` ✅ PASS. `pnpm build` NON lanciato (rimandato a verifica finale).

**Stato Sprint 06:** ~25% (solo fondamenta preesistenti). Pronto: `CatalogEntry` con tutti i campi orbitali, Kepler solver + `sampleOrbitPath` curato, marker Horizons, layer Points, i18n, CSS inspector. Da fare: stato `SelectedCatalogObject`, inspector catalogo, `sampleCatalogEntryOrbitPath` + orbita selezionata, coda cometa, camera focus, audit/docs.

**Rischi residui:** comete con `e ≥ 1` scartate dal layer → serve disclosure onesta "orbit path non disponibile". Branch base da sistemare prima di committare (no mix con Periodic Table).

**Prossimo passo:** Step 0 del piano — `git checkout -b feat/solar-sprint-06 origin/init`, poi Step 1 (stato `SelectedCatalogObject`) via `subagent-driven-development`. Piano completo approvato nei task 1-7 sopra.
