# Sprint 05 Claude Handoff — Real Visual Assets, Atmospheres, Catalog Focus

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Solar System Lab visually more trustworthy by adding the first real texture pipeline, atmosphere shells for bodies with documented atmospheres, and better selected catalog-object UX without claiming full physical simulation.

**Architecture:** Keep observatory mode separate from future sandbox mode. Use an asset manifest and local optimized texture files for a small first body set. Add atmosphere rendering as a lightweight layer tied to known physical atmosphere heights, but clearly label it as visualization. Improve selected catalog/Horizons objects by flying to them, showing their source/epoch/data quality, and drawing a sampled orbit path for the selected object only.

**Tech Stack:** Next.js App Router, TypeScript, React Three Fiber, Three.js, JPL SBDB/Horizons, NASA/USGS/JPL texture sources, existing `pnpm solar:audit`.

---

## Read First

1. `docs/solar-system/governance.md`
2. `docs/solar-system/micro-sprints-2026-05-31.md`
3. `docs/solar-system/data-and-assets.md`
4. `docs/solar-system/asset-manifest-template.md`
5. `docs/solar-system/ultimate-simulator-roadmap.md`

## Current Baseline

Already done:

- Sprint 03B: SBDB catalog layers and Horizons marker.
- Sprint 04: IAU WGCCRE pole vectors for major bodies.
- Micro-sprint: camera focus on selected curated body and Horizons marker.
- Micro-sprint: scale honesty notes and preliminary texture manifest fields.

Still not done:

- real texture rendering;
- atmosphere shells;
- selected catalog object orbit path;
- all-body real-scale simultaneous visual mode;
- eclissi, collisioni, tempeste solari, campi magnetici, N-body, Planet X.

## Strict Scope For Today

In scope:

- real texture pipeline for a small first body set;
- local texture files under `public/lab/solar-system/textures/`;
- texture manifest metadata with source, credit, retrieval date and confidence;
- material application in `BodyMesh`;
- atmosphere shell component for selected bodies;
- selected catalog/Horizons orbit path for one object at a time;
- manual/about IT+EN updates;
- audit/typecheck/build/browser verification.

Out of scope:

- no N-body;
- no collision/explosion engine;
- no eclipse engine;
- no magnetic-field engine;
- no solar storm engine;
- no Oort cloud implementation;
- no Planet X discovery claims;
- no real-scale-all-objects mode unless it is only a labelled preview/disclosure.

## Task 0 — Verify Repository State

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
  - any untracked screenshots/docs are not deleted unless explicitly requested.

## Task 1 — Texture Manifest And Local Asset Policy

**Files:**

- Modify: `lib/solar-system/assets.ts`
- Create if needed: `public/lab/solar-system/textures/README.md`
- Modify: `docs/solar-system/data-and-assets.md`

- [ ] Confirm `SolarAsset` supports:
  - `textureUrl` or local equivalent;
  - `plannedTextureUrl`;
  - source URL;
  - credit;
  - retrieved date;
  - confidence label.

- [ ] Add first integration targets only:
  - Sun visual layer: NASA SDO/SVS, labelled visualization, not fixed surface texture.
  - Earth: NASA Blue Marble.
  - Moon: NASA/USGS/LRO WAC.
  - Mars: USGS/NASA Viking MDIM.
  - Mercury: MESSENGER/USGS.

- [ ] Do not add Jupiter/Saturn/Uranus/Neptune textures unless source images are downloaded, converted, credited and verified.

- [ ] Add `public/lab/solar-system/textures/README.md` explaining:
  - source URL;
  - conversion command/tool used;
  - output resolution;
  - license/credit note;
  - retrieved date.

## Task 2 — Integrate Real Textures In BodyMesh

**Files:**

- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `lib/solar-system/assets.ts`

- [ ] Use `useTexture` from Drei or `THREE.TextureLoader` safely inside a small `BodyMaterial` helper.

- [ ] Apply real textures only when a local texture path exists.

- [ ] Fallback stays current procedural color if texture missing.

- [ ] Inspector must show:
  - `real-map` when texture is real;
  - `procedural` when fallback;
  - source/credit in existing asset section or about page.

- [ ] Acceptance:
  - Earth/Moon/Mars/Mercury render with actual texture when files exist;
  - no broken network texture loading from third-party URLs during render;
  - no hydration issues.

## Task 3 — Atmosphere Shells

**Files:**

- Modify: `lib/solar-system/bodies.ts`
- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`

- [ ] Add optional fields to `SolarBody`:

```ts
atmosphereHeightKm?: number;
atmosphereLabel?: {
  it: string;
  en: string;
};
```

- [ ] Populate conservative initial bodies:
  - Earth: visual atmosphere shell, scale from atmosphere height around 100 km for display, with note that atmosphere has no hard edge.
  - Venus: dense atmosphere shell.
  - Mars: thin atmosphere shell.
  - Titan if present in body catalog.

- [ ] Render atmosphere as transparent sphere slightly larger than body display radius:
  - physical ratio when radius mode permits;
  - minimum visual halo for legibility, disclosed as visualization.

- [ ] Inspector disclosure:
  - atmosphere present;
  - height/model note;
  - "visual shell, not full atmospheric physics".

## Task 4 — Selected Catalog Object Orbit Path

**Files:**

- Modify: `lib/solar-system/catalog.ts`
- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `components/lab/solar-system-view.tsx`

- [ ] When user selects a SBDB/Horizons search result, keep the selected `CatalogEntry` or enough orbital elements in state.

- [ ] Add a sampled orbit path for the selected catalog object only.

- [ ] Use the same Kepler math used by `CatalogLayer` positions.

- [ ] Do not draw orbit paths for all 41k NEOs.

- [ ] Inspector must say:
  - selected path is computed from SBDB catalog-keplerian elements;
  - Horizons marker is precision position for selected date;
  - path may diverge for perturbed/high-uncertainty objects.

## Task 5 — Scale And Realism Disclosure Cleanup

**Files:**

- Modify: `components/lab/solar-system-view.tsx`
- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`

- [ ] Make these statements unambiguous:
  - the default view is not simultaneous real scale;
  - distance and radius ratios can be correct separately;
  - dense catalog objects are point markers, not physical-size meshes;
  - atmospheres are visual shells, not fluid/thermodynamic simulation;
  - real textures are visualization maps, not always scientific measurement layers.

- [ ] Remove or update any stale "Sprint 01/Sprint 02 planned" references that conflict with current state.

## Task 6 — Audit And Verification

**Files:**

- Modify: `scripts/solar-system/audit-orbits.ts`

- [ ] Add audit checks:
  - texture manifest has source/credit/retrieved date for integrated local textures;
  - no `real-map` asset points to missing local file;
  - atmosphere bodies have positive `atmosphereHeightKm`;
  - no claim that atmosphere physics/eclipses/collisions are implemented.

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
  - `/lab/tavola-periodica` no regression.

## Final Report Required

Claude must report:

1. commit hash;
2. texture files added and their source/credit;
3. bodies with real textures;
4. bodies with atmosphere shells;
5. selected catalog orbit path behavior;
6. audit/typecheck/build results;
7. browser verification;
8. remaining limitations;
9. next sprint proposal.

## Next Sprint After This

Recommended Sprint 06:

- selected catalog object details and orbit inspection;
- comet tail direction relative to Sun;
- first analytic eclipse/transit model;
- only after that, start N-body/playground architecture.
