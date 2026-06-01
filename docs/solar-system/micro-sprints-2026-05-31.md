# Solar System Micro-Sprints — 2026-05-31 Evening

Status: stabilization notes for closing tonight and restarting tomorrow.

Matteo's latest concern: the lab still does not feel physically trustworthy.
The visible symptoms are:

- selecting a planet/comet/asteroid should move the camera to that object;
- catalog objects do not expose visible orbit paths or time evolution clearly;
- distances and sizes feel wrong, especially for minor bodies;
- real textures are missing;
- atmospheres are missing or not scaled to their parent body;
- real-scale mode is not yet a usable all-body inspection mode;
- eclipses, collisions, explosions, solar storms and magnetic fields are not implemented;
- Planet X / Planet Nine should become a future model-search/scenario feature.

## Verified Current State

Implemented:

- curated major-body orbits with sampled orbit paths;
- dense SBDB catalog as point layers;
- JPL Horizons marker for selected search result;
- IAU pole orientation for a subset of major bodies;
- physical/reference disclosures in manual/about.

Not implemented or incomplete:

- camera focus on selection was missing before this note's micro-fix;
- catalog body orbit path display is missing;
- catalog body time evolution exists inside `CatalogLayer` positions but is not inspectable per selected object;
- all-body simultaneous real scale is not visually usable in the current renderer;
- texture maps are still procedural placeholders;
- atmosphere shells and atmosphere-to-body scale ratios are missing;
- eclipse/shadow/transit engine is missing;
- collision/explosion engine is missing;
- solar storm/space weather/magnetic field layers are missing;
- Oort cloud is not represented as a probabilistic distant reservoir;
- Planet X/Planet Nine search is not implemented.

## Tonight Scope Rule

Tonight only micro-sprints are allowed. Do not start large physics, texture or
catalog rewrites. The goal is to close obvious UX and honesty gaps without making
new scientific claims.

## Micro-Sprint A — Selection Focus

Goal: when a user selects a curated body or a Horizons search marker, the camera
targets that object.

Acceptance:

- selecting a planet from the left list moves the `OrbitControls` target to that body;
- selecting a moon targets the boosted educational moon position;
- selecting a search result targets the Horizons marker;
- `pnpm tsc --noEmit` passes;
- `pnpm solar:audit` passes.

## Micro-Sprint B — Scale Honesty Overlay

Goal: make the active scale mode impossible to misunderstand.

Acceptance:

- toolbar or inspector shows both distance scale and radius scale;
- `compressed + visible` says "educational, not real simultaneous scale";
- `compressed + relative` says "distance ratios and radius ratios preserved separately";
- `real-linear + real` should be disabled or labelled "not inspectable" until UX exists;
- manual/about IT+EN match the UI language.

## Micro-Sprint C — Catalog Selection Disclosure

Goal: selected SBDB/Horizons objects must explain what is real and what is not.

Acceptance:

- selected Horizons marker shows source, date, cache status, frame and data quality;
- selected catalog object states "catalog-keplerian point layer, not full mesh";
- if no orbit path is drawn for catalog object, UI says orbit path is not yet displayed;
- docs mention this as Sprint 05 candidate.

## Micro-Sprint D — Real Texture Sprint Plan Only

Goal: prepare texture work without downloading/processing large assets tonight.

Acceptance:

- create/extend asset manifest entries for first target bodies: Sun, Mercury,
  Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ceres, Vesta;
- source URLs and license/credit fields present;
- no claim that textures are integrated until files exist and render.

## Tomorrow Backlog

### Sprint 05 — Real Visual Assets And Atmospheres

- real NASA/USGS/JPL texture manifests;
- processed 1K/2K WebP tiers;
- atmosphere shell component for Earth, Venus, Mars, Titan and gas giants where appropriate;
- atmosphere scale ratio documented: atmosphere height vs body radius;
- source/asset confidence shown in inspector.

### Sprint 06 — Catalog Orbit Inspection

- select any SBDB object and draw its sampled orbit path;
- fly camera to catalog object and keep marker visible;
- show orbital elements and epoch;
- support comet tail direction relative to Sun for selected comets.

### Sprint 07 — Eclipse/Shadow/Transit Engine

- directional/point light shadow strategy or analytic umbra/penumbra geometry;
- Moon/Earth/Sun eclipse validation;
- transits for Mercury/Venus across the Sun in date-aware mode;
- UI labels: analytic approximation vs rendered shadow.

### Sprint 08 — Fields And Space Weather

- solar wind layer;
- Parker spiral / interplanetary magnetic field visualization;
- planetary magnetosphere approximations for Earth, Jupiter, Saturn, Uranus, Neptune;
- solar storm event layer from public NOAA/NASA sources if usable.

### Sprint 09 — Collisions And Explosions

- only in sandbox/playground mode, not real observatory mode;
- N-body collision detection;
- impact visualization;
- energy release estimate;
- accretion/fragmentation approximation with explicit model label.

### Sprint 10 — Oort Cloud And Planet X / Planet Nine

- Oort cloud as statistical/probabilistic reservoir, not individual complete catalog;
- hypothetical Planet Nine/Planet X scenario mode;
- run parameterized perturbation scenarios against TNO distributions;
- never claim discovery; label as hypothesis exploration/model search.

## Scientific Honesty Requirement

The project can become a portfolio-grade simulator only if every advanced feature
states its model level. Real data mode, educational visualization and hypothetical
playground mode must remain visibly distinct.
