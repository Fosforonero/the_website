# Sprint 03B Claude Handoff — Full Catalog Observatory

> **For Claude:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Work task-by-task, commit after each coherent task, and report verification output at the end.

**Goal:** Implement the full catalog architecture for the Solar System Lab: progressive SBDB catalog chunks, live SBDB search, on-demand JPL Horizons marker for selected bodies, and `THREE.Points` rendering for dense minor-body layers.

**Primary plan to execute:** `docs/solar-system/sprint-03b-full-catalog.md`

**Read first, in this order:**

1. `docs/solar-system/governance.md`
2. `docs/solar-system/architecture-spec.md`
3. `docs/solar-system/data-and-assets.md`
4. `docs/solar-system/ultimate-simulator-roadmap.md`
5. `docs/solar-system/sprint-03b-full-catalog.md`

## Context

Sprint 03A is complete. The current Solar System Lab has:

- curated major-body dataset;
- Keplerian positions with full orbital elements for curated bodies;
- visible/relative radius scale modes;
- axial tilt and rotation direction disclosures;
- physical/educational lighting modes;
- Saturn/Uranus ring geometry;
- `pnpm solar:audit` coverage for orbital/scale/rotation/ring checks.

Claude must not rewrite the existing physics/visual foundation unless a 03B task explicitly requires a small integration change.

## Non-Negotiable Scope

### In Scope

- `lib/solar-system/catalog.ts` data model for SBDB catalog chunks.
- `scripts/solar-system/fetch-catalog.ts` to generate static catalog snapshots.
- `public/lab/solar-system/catalog/*.json` generated chunks and manifest.
- `app/api/solar/catalog/search/route.ts` live SBDB search proxy.
- `app/api/solar/horizons/route.ts` on-demand Horizons vector proxy.
- `components/lab/solar-system-catalog-layer.tsx` using `THREE.Points`, not one React mesh per body.
- Search/autocomplete UI for catalog bodies.
- Layer toggles for NEO, main-belt asteroids, comets, TNOs and centaurs.
- Inspector/source disclosure for catalog objects and Horizons marker.
- Manual/about updates in Italian and English.
- Audit updates validating catalog files, schema, counts and no-regression of 03A checks.

### Out Of Scope

- No N-body physics implementation in Sprint 03B.
- No thermodynamics, chemistry/material simulation or relativity implementation.
- No black holes, pulsars, magnetars, quasars or playground UI yet.
- No CelesTrak/SGP4 artificial satellites yet.
- No real texture sprint yet, unless a tiny asset/source label is required by the catalog UI.
- Do not merge real observatory mode with future playground mode.

NASA Eyes, Luna, N-body Physics and REBOUND are benchmarks/references only in this sprint. They should influence architecture discipline and UX direction, not become dependencies or copied UI.

## Required Architecture Rules

- Real observatory data and future sandbox physics must remain separate.
- Dense catalog bodies must render as `THREE.Points`, `InstancedMesh`, buffer geometry or equivalent. Never render tens of thousands of React meshes.
- Catalog chunks must load progressively, only when the user enables a layer or selects/searches an object.
- Catalog position recompute must be throttled. Recompute only when the layer is visible and simulated epoch changes by more than one simulated day.
- The first viewport must remain readable. Major planets/moons stay the main visual anchors.
- Every catalog object must expose source, retrieved date, epoch, reference frame and data-quality label.
- Search must support newly discovered or rarely used objects through SBDB live query when possible.
- Horizons marker must be visually distinct from catalog-keplerian points and labelled as on-demand precision data.

## Data Quality Labels

Use explicit labels in code/UI:

- `mvp-keplerian`: curated static orbital elements.
- `catalog-keplerian`: SBDB static/live orbital elements, calculated client-side.
- `jpl-horizons-cached`: server-fetched Horizons vector cached by the app.
- `jpl-horizons-live`: only if the code genuinely fetches fresh Horizons data for that request.

Do not claim "real-time NASA precision" globally. Only the selected Horizons marker can claim higher precision, and only with its source/date/cache status.

## Recommended Task Order

1. Add catalog/data-quality types and pure decode/filter helpers.
2. Add tests or audit checks for decoding SBDB-style rows and category mapping.
3. Add catalog fetch script and `solar:fetch-catalog` package script.
4. Generate initial catalog chunks and manifest.
5. Add SBDB search API route with input validation and error handling.
6. Add Horizons vector API route with cache and parser validation.
7. Add `CatalogLayer` as a focused Three.js points component.
8. Integrate layer state/toggles into `solar-system-view.tsx`.
9. Add search/autocomplete and selected catalog-body inspector path.
10. Add Horizons precision marker path for selected search result.
11. Update IT/EN manual and about/source pages.
12. Extend `pnpm solar:audit`.
13. Verify desktop, mobile and periodic-table no-regression.

## Verification Required

Claude must run and report:

```bash
pnpm solar:audit
pnpm typecheck
pnpm build
```

If catalog fetching requires network and fails because of API/rate/network issues, Claude must:

- keep the script implemented;
- document the exact failing request/status;
- avoid committing fake scientific data;
- commit only a small fixture if needed for tests, clearly labelled as fixture data.

Browser verification required:

- `/lab/sistema-solare` desktop: scene loads, existing major bodies still render, catalog toggles visible.
- `/en/lab/solar-system` desktop: English labels correct.
- Mobile width around 390px: toolbar/search/layer toggles do not cover the canvas unusably.
- `/lab/tavola-periodica`: periodic table still works and is visually unaffected.

## Final Report Format

Claude should reply with:

1. commit hash;
2. files changed summary;
3. catalog counts by chunk;
4. API routes added and tested;
5. audit/typecheck/build result;
6. browser verification result;
7. remaining limitations and proposed Sprint 04.

## Expected Sprint 04 After 03B

Sprint 04 should be reference-frame and precision cleanup:

- IAU WGCCRE pole RA/Dec;
- per-body pole azimuth instead of scene-X-only tilt;
- better barycenter/reference-frame disclosure;
- precession/nutation where useful;
- start CelesTrak/SGP4 only if 03B is stable.
