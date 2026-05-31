# Solar System Governance

Last updated: 2026-05-29

This file captures project decisions, verified bugs and non-negotiable development rules for the Fosforonero Solar System Lab.

## Product Intent

The Solar System Lab is a technical portfolio project. It must show high engineering quality, not just a visually pleasant space scene.

The product direction is:

- real-source astronomy lab;
- bilingual Italian/English experience;
- full SEO/GEO support;
- manual and about/sources pages like the periodic table project;
- transparent citations and scientific limitations;
- Ko-fi support link;
- eventually all known Solar System objects through a complete, queryable catalog.

## Current Strategic Direction

The project should evolve in this order:

1. Fix the existing MVP's orbital geometry, visual scales and documentation claims.
2. Add a reliable audit/test layer for orbital distances, visual radii and parent-child systems.
3. Introduce real ephemeris integration, starting with JPL Horizons for selected bodies.
4. Add a complete catalog architecture for all known Solar System objects.
5. Add artificial satellites through CelesTrak/SGP4.
6. Add real textures, meshes and progressive asset quality.
7. Add sandbox physics after the real-data observatory is trustworthy.

## Verified Bugs In Current Implementation

The following bugs were verified by reading the implementation and running numeric checks.

### 1. Incomplete orbital model

Current files:

- `lib/solar-system/bodies.ts`
- `lib/solar-system/ephemeris.ts`

The current solver uses only:

- semi-major axis;
- eccentricity;
- inclination;
- orbital period.

It does not use:

- mean anomaly at epoch;
- longitude of ascending node;
- argument of periapsis;
- epoch-specific orbital elements.

Effect: bodies are phase-aligned from an implicit anomaly and orbit orientation is too simplified. This is acceptable only as a temporary MVP approximation, not as a portfolio-grade observatory.

### 2. Orbit paths do not match computed positions

Current file:

- `components/lab/solar-system-scene.tsx`

The scene draws orbit paths using circular `ringGeometry` while positions are computed from eccentric Keplerian orbits. This makes high-eccentricity objects such as comets and TNOs visually wrong.

Required correction: orbit paths must be sampled from the same orbital math used for positions.

### 3. Moon systems are visually broken

Current issue:

- Moon/planet offsets are physically small compared with Solar System scale.
- The current renderer scales full heliocentric vectors, so local moon offsets collapse near their parent.
- In visible radius mode, many moons and parent planets are clamped to similar or identical sizes.

Observed numeric example:

- Earth visible radius: `0.0200`
- Moon visible radius: `0.0200`
- Earth-Moon compressed offset: about `0.0026`

Effect: the Moon cannot be visually separated from Earth. Similar issue applies to Io/Jupiter, Titan/Saturn and Charon/Pluto.

Required correction: render moon systems hierarchically with a clearly labeled local educational scale.

### 4. Visible radius mode destroys hierarchy

Current file:

- `lib/solar-system/scales.ts`

The `visible` radius mode clamps many bodies to `0.0200`, making very different bodies visually identical.

Observed affected bodies include:

- Mercury;
- Earth;
- Moon;
- Mars;
- Neptune;
- Pluto;
- Charon;
- Vesta;
- Halley;
- Sedna.

Required correction: use a category-aware/logarithmic visual radius scale that preserves ordering while keeping tiny bodies clickable.

### 5. Relative radius mode is not usable as a default

Current `relative` mode is closer to physical scale but makes many objects too small to inspect. It should remain available, but it needs:

- clearer UI naming;
- inspector disclosure;
- possibly a hybrid "educational visible" default.

### 6. Playback labels are ambiguous

Current file:

- `components/lab/solar-system-view.tsx`

The UI labels suggest clean units such as "1 year/hour", but the implementation increments milliseconds by a multiplier on a fixed interval. This should be replaced with explicit simulated days per real second or a properly labeled real-time multiplier.

### 7. Manual/about overstate current data coverage

Current files:

- `components/lab/solar-system-manual-view.tsx`
- `components/lab/solar-system-about-view.tsx`

The current firmament is a curated subset. Documentation must not claim all 88 constellations unless that dataset is actually complete and rendered.

Required wording: "curated subset of bright stars, recognizable constellations and selected deep-sky objects" until full sky coverage exists.

## Full Catalog Requirement

Matteo wants the project to eventually include **all known Solar System objects as of the current catalog date**.

This must be implemented as a **complete catalog browser**, not by rendering every object as a full 3D mesh.

### Catalog Scope

The target catalog should eventually include:

- Sun;
- planets;
- dwarf planets;
- all known natural satellites;
- asteroids;
- comets;
- centaurs;
- trans-Neptunian objects;
- Kuiper belt objects;
- spacecraft where public ephemerides exist;
- artificial satellites and orbital debris where public CelesTrak data exists.

### Data Sources

Use open, public or clearly reusable data sources:

- JPL Horizons for high-precision selected-body vectors;
- JPL SBDB/SBDB Query for asteroids, comets and TNO metadata;
- JPL planetary satellites resources for natural satellites;
- Minor Planet Center as secondary/advanced source for minor planet data;
- CelesTrak GP/TLE/OMM for artificial satellites;
- ESA Gaia/Hipparcos/Stellarium/OpenNGC for sky background and deep-sky objects.

### Rendering Rule

Never load or render all known objects as individual React meshes.

Use:

- server-side cache;
- preprocessed catalog chunks;
- search-first UX;
- category filters;
- magnitude/diameter/distance thresholds;
- `Points`, `InstancedMesh`, buffer geometry or shader billboards;
- Web Workers for parsing/filtering;
- progressive loading by category/viewport/search.

### UX Rule

The default scene should remain readable:

- major bodies are rendered as detailed spheres;
- selected catalog objects get orbit/detail/label;
- large catalog layers render as points/markers;
- the user must be able to turn each dense layer on/off;
- the inspector must show source, epoch and data quality.

## Physical Reality Status (Post Sprint 03A)

Three categories describe what is currently implemented.

### A — Physics genuinely respected

- Keplerian orbital elements (a, e, i, Ω, ω, M₀) from NASA/JPL Horizons — real values, not hand-crafted.
- Kepler's equation solved numerically (Newton–Raphson, convergence <1e-12), full perifocal-to-ecliptic rotation.
- Distance ratios in `compressed` mode — physically correct (1 AU = 1 render unit, linear).
- Radius ratios in `relative` mode — physically correct (proportional to the Sun).
- Physical 1/r² lighting in `physical` mode — `decay=2`, no ambient boost.
- Axial obliquity — IAU 2015 values (Earth 23.44°, Venus 177.36°, Uranus 97.77°, Pluto 119.6°).
- Sidereal rotation phase — computed from `siderealRotationHours` and elapsed time from J2000.0.
- Retrograde classification — explicit `rotationDirection` field, never inferred from tilt alone.
- Reference frame HEC-J2000 — defined, documented, and used consistently.
- Ring proportions — `ringInnerKm / radiusKm` and `ringOuterKm / radiusKm` ratios are physically correct.

### B — Physics approximated or educational (all disclosed in UI)

- Radius in `visible` mode — logarithmic category-based, not proportional to physical size. Disclosed.
- Moon distances — ~200× boost over compressed scale for legibility. Disclosed.
- Educational ambient lighting — non-physical boost, disclosed in inspector.
- Day/night side — Three.js shading on untextured spheres; no eclipse shadow casting.
- Axial tilt direction — applied as scene-X rotation (ecliptic approximation), not per-body orbital plane. Error < 3° for planets with inclination < 3°. Disclosed.
- Origin at Sun, not the true Solar System barycentre. Disclosed.
- Ring shading — `meshBasicMaterial`; rings receive no light from the Sun's PointLight and render at fixed colour regardless of viewing angle.

### C — Physics not yet implemented

- `massKg` — catalog display only; never read by the simulation.
- Newtonian gravity — no force or acceleration calculations between bodies.
- N-body integration — none; orbits are static Keplerian elements.
- Temperature — no fields, no calculations (surface, equilibrium, or irradiance-derived).
- Eclipses, shadows, transits — not implemented.
- `velocityKmS` — defined in `BodyState` type but never populated by `ephemeris.ts`.
- Relativistic corrections — none (including Mercury perihelion precession).
- Precession and nutation — not modelled (declared in `reference-frames.ts`).
- IAU WGCCRE pole RA/Dec — only obliquity magnitude is correct; pole azimuth direction deferred to Sprint 04.
- Surface gravity — not calculated or displayed.

## Scientific Honesty Rules

The UI, manual and about page must clearly disclose:

- whether positions are from live JPL vectors, cached JPL vectors, static elements or simplified educational elements;
- whether visual radius is physical, relative or educational;
- whether moon systems use a local expanded scale;
- whether textures are real maps, visualization-only maps, real meshes or procedural materials;
- catalog retrieval date;
- source URL and credit.

Do not use phrases like "real-time NASA/JPL precision" until the implementation actually queries or uses cached Horizons vectors for that body/date.

## SEO And Portfolio Rules

The Solar System Lab must keep the same quality bar as the periodic table:

- IT/EN app routes;
- IT/EN manual routes;
- IT/EN about/sources routes;
- canonical and hreflang alternates;
- sitemap entries;
- JSON-LD;
- manual with FAQ/HowTo structure;
- about page with stack, sources, roadmap, limitations and support section;
- Ko-fi support link: `https://ko-fi.com/fosforonero`.

This project is part of the site as a technical CV. Do not ship thin placeholder pages.

## Current Fix Plan

Sprint 02 (orbit/scale corrections): **COMPLETE.**
Sprint 03A (physical realism foundation): **COMPLETE.**

Next sprints, in order:
1. Sprint 03B: Full catalog architecture (SBDB + Horizons integration, InstancedMesh).
2. Sprint 04: IAU WGCCRE pole RA/Dec, per-body orbital plane tilt, precession/nutation.
3. Textures: Real NASA/USGS planetary maps.
4. JPL Horizons live integration for selected bodies.
5. Sandbox physics after the real-data observatory is trustworthy.

