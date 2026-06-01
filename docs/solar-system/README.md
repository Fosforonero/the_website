# Solar System Lab

Project codename: `solar-system`

Goal: build a new Fosforonero Lab experience for a real-time, date-aware Solar System simulator. The project must feel like a technical observatory and physics laboratory, not a decorative space page.

This project is part of Fosforonero's technical portfolio. It must visibly demonstrate engineering quality: scientific data handling, WebGL rendering, performance discipline, bilingual content architecture, SEO/GEO awareness, accessibility and source transparency.

Project decisions, verified bugs and non-negotiable development rules are tracked in `docs/solar-system/governance.md`. Read that file before planning or implementing new Solar System work.

The long-term physics playground target is tracked in
`docs/solar-system/ultimate-simulator-roadmap.md`.

NASA Eyes on the Solar System is a benchmark for interaction quality, mission
storytelling and timeline UX, not a source to copy without matching data and
citations: `https://eyes.nasa.gov/apps/solar-system/#/home`.

Luna is a benchmark for the immediacy of a browser-first gravity sandbox, not a
scientific data source: `https://luna.watermelonson.com/`.

## Scope

The Solar System Lab should eventually support:

- real-time or calendar-based positions for Solar System bodies;
- real firmament background based on astronomical catalogs: stars, constellation lines/names and selected galaxies/deep-sky objects, not decorative random stars;
- planets, dwarf planets, natural satellites, comets, asteroids, trans-Neptunian objects, spacecraft and artificial satellites;
- eventually all known Solar System objects through a complete, searchable, progressively loaded catalog;
- guided events inspired by NASA Eyes: flybys, landings, mission phases, comet
  perihelia and future eclipse/transit views when the underlying models exist;
- real/educational scale modes for distance, radius and speed;
- an interactive body inspector with physical, orbital and source metadata;
- a sandbox mode for adding artificial planets, asteroids, comets, stars, black
  holes, pulsars, magnetars and other hypothetical bodies;
- long-term physics layers for Newtonian gravity, thermodynamics,
  chemistry/material state, relativity and spacetime visualization;
- bilingual IT/EN routes, manual and source/about pages, matching the standard already used by the periodic table lab.
- public source citations and open/public data provenance for every scientific dataset and visual asset.
- a Ko-fi support/donation entry point, consistent with the periodic table lab.

## Recommended Build Order

1. MVP: date-aware orrery for major bodies.
2. Real firmament layer: catalog stars, constellation lines/names and selected galaxies/deep-sky objects.
3. Fix orbit geometry, radius scaling, moon systems and precision disclosures.
4. Minor bodies: selected asteroids, comets and TNOs.
5. Full catalog architecture for all known objects, loaded progressively.
6. Natural satellites: major moons first, full catalog through search/filter.
7. Artificial satellites: CelesTrak GP/TLE/OMM + SGP4 propagation.
8. Sandbox mode: user-created bodies and N-body experiment layer.
9. Thermodynamics, comet activity, material/chemistry labels and collision/tidal indicators.
10. Relativity approximations, compact-object presets and spacetime-grid visualization.
11. Asset refinement: real textures, maps, 3D meshes and procedural fallbacks.

## Reuse From Periodic Table

Reuse these patterns:

- `app/lab/*` full-screen layout with no site nav/footer wrapper.
- `dynamic(..., { ssr: false })` for WebGL scenes.
- React Three Fiber, Drei, Three.js and postprocessing already installed.
- right-side technical info panel, shareable URL state and persisted controls.
- bilingual routes, metadata, JSON-LD, manual page and about/sources page.

Do not reuse the periodic table CSS directly. Create separate files for Solar System naming, for example:

- `components/lab/solar-system-view.tsx`
- `components/lab/solar-system-scene.tsx`
- `components/lab/solar-system.css`
- `lib/solar-system/*`

The existing chemistry lab star background can be reused only as a temporary rendering technique. In the Solar System Lab, the production background must be backed by real star/deep-sky catalogs and constellation metadata.

## Route Proposal

- IT main: `/lab/sistema-solare`
- EN main: `/en/lab/solar-system`
- IT manual: `/lab/sistema-solare/manuale`
- EN manual: `/en/lab/solar-system/manual`
- IT about/sources: `/lab/sistema-solare/about`
- EN about/sources: `/en/lab/solar-system/about`

## Documentation Requirements

This lab must ship with:

- a bilingual manual, equivalent in quality and structure to the periodic table manual;
- a bilingual about/sources page, with technology stack, scientific sources, asset sources, roadmap, limitations and support section;
- source citations for every external scientific dataset, API, texture, mesh and visualization source;
- source citations for star catalogs, constellation datasets and deep-sky object catalogs;
- explicit labels for open/public-domain/government data, visualization-only textures and procedural materials;
- a Ko-fi donation link: `https://ko-fi.com/fosforonero`.

## SEO/GEO Requirements

Treat this as a high-value portfolio page.

Minimum requirements:

- optimized metadata for IT and EN;
- canonical and hreflang alternates;
- Open Graph and Twitter card metadata;
- JSON-LD `WebApplication`, `WebPage`, `HowTo`, `FAQPage`, `BreadcrumbList` where appropriate;
- sitemap entries for app, manual and about pages in both languages;
- crawlable manual/about pages rendered server-side;
- clear internal links from lab pages and, later, from the landing/projects section;
- no thin placeholder content at launch.

## Key Product Decision

Start as an accurate observatory, then add sandbox physics.

Reason: users first need a trustworthy real Solar System baseline. Once that exists, the sandbox can clearly label user-added bodies as simulated experiments rather than real ephemeris data.
