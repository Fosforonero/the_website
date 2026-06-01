# Solar System Architecture Spec

Status: draft for Claude implementation planning

Quality target: portfolio-grade. The finished lab should communicate technical depth immediately: accurate data provenance, high-performance rendering, careful UI systems, bilingual documentation and transparent scientific limitations.

Governance source: `docs/solar-system/governance.md`. It records verified bugs, user decisions and rules that must guide future Solar System work.

Reference benchmark: NASA Eyes on the Solar System
(`https://eyes.nasa.gov/apps/solar-system/#/home`). Use it to study navigation,
mission/event storytelling, timeline controls and spacecraft presentation. Do not
copy claims, assets or UI patterns unless the equivalent data/source/licensing is
implemented and cited.

## Product Shape

The Solar System Lab is a full-screen WebGL observatory with a technical control layer.

Default mode:

- current date/time;
- heliocentric Solar System view;
- realistic positions from cached ephemeris data;
- educational scaling for visibility;
- selectable bodies with a technical details panel.

The app must clearly separate real data mode from sandbox mode.

Long term, sandbox mode becomes a physics playground. The detailed target is
tracked in `docs/solar-system/ultimate-simulator-roadmap.md`; this architecture
must keep room for gravity, thermodynamics, material chemistry, relativity and
compact-object experiments without contaminating the real Solar System catalog.

## Main UI Regions

- Canvas: full-screen 3D scene, not framed inside a card.
- Top toolbar: date/time, playback, speed, scale mode, search.
- Left/compact object browser: categories and filters.
- Right inspector: selected body data, source, visual asset metadata.
- Bottom timeline: scrubber with current UTC/local date, optional event markers.
- Optional guided-events drawer: flybys, landings, mission phases, comet
  perihelia, eclipses/transits and historical/future highlights.

On mobile, collapse object browser and inspector into sheets. The canvas remains the main surface.

## Rendering Model

Use React Three Fiber and Three.js.

Recommended scene layers:

- `FirmamentLayer`: real catalog stars, constellation lines, constellation labels and selected galaxies/deep-sky objects. This replaces decorative random stars for production.
- `ReferenceGridLayer`: ecliptic plane, axes, AU rings.
- `MajorBodiesLayer`: Sun, planets, dwarf planets and large moons.
- `OrbitTrailsLayer`: current orbit paths and recent trails.
- `MinorBodiesLayer`: asteroids/comets/TNOs as points or instanced meshes.
- `CatalogLayer`: progressively loaded point/marker layer for all known catalog objects, never individual React meshes.
- `ArtificialSatellitesLayer`: Earth-orbiting points/instanced markers.
- `SandboxLayer`: user-added bodies and simulated trajectories.
- `PhysicsDiagnosticsLayer`: optional vectors, barycenter, energy drift,
  collision warnings, Roche limit markers and spacetime-grid visualization.
- `LabelsLayer`: distance-aware labels using Drei `Html` or sprite text.

Do not render thousands of objects as individual React mesh components. Use `InstancedMesh`, `Points`, custom buffer geometry or shader-based billboards.

The long-term requirement is to include all known Solar System objects through a search/filter/catalog architecture. This must not compromise the default scene's readability or browser performance.

## Data Flow

### Server/API layer

Add API routes or server utilities for:

- cached Horizons vector queries;
- SBDB object lookup/query;
- CelesTrak GP/TLE/OMM fetches;
- scheduled or scripted catalog refreshes for newly discovered comets/asteroids;
- guided event manifests for missions, flybys and notable Solar System events;
- asset manifest serving;
- optional precomputed ephemeris snapshots.

Do not call external scientific APIs directly from the render loop or first client render.

### Client layer

The client receives normalized data:

```ts
type BodyState = {
  id: string;
  name: string;
  category: "star" | "planet" | "dwarf-planet" | "moon" | "asteroid" | "comet" | "tno" | "spacecraft" | "satellite" | "sandbox";
  positionKm: [number, number, number];
  velocityKmS?: [number, number, number];
  radiusKm?: number;
  massKg?: number;
  source: string;
  epochIso: string;
};
```

Use a separate render transform:

```ts
type ScaleMode = {
  distance: "real-log" | "compressed" | "inner-system" | "real-linear";
  radius: "visible" | "relative" | "real";
  time: "realtime" | "accelerated" | "paused";
};
```

## MVP Body Set

Start with:

- Sun;
- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune;
- Moon;
- Galilean moons;
- Titan, Enceladus, Rhea, Iapetus;
- Triton;
- Pluto and Charon;
- Ceres and Vesta;
- Halley, 67P, Hale-Bopp or another well-known comet;
- Eris, Haumea, Makemake, Sedna or a small curated TNO set.

The exact set can be adjusted based on Horizons query stability and asset availability.

## Asset Manifest

Create a manifest before downloading assets:

```ts
type BodyAsset = {
  bodyId: string;
  textureUrl?: string;
  normalMapUrl?: string;
  meshUrl?: string;
  fallbackMaterial: "gas-giant" | "rocky" | "icy" | "metallic" | "comet" | "star";
  sourceUrl: string;
  credit: string;
  retrievedAt: string;
  scientificUse: "visualization" | "map-product" | "procedural";
};
```

Store processed web assets under `public/lab/solar-system/` only after source/credit entries exist.

## Sandbox Mode

Sandbox mode should be separate from real ephemeris mode.

Minimum sandbox controls:

- add body: planet, moon, asteroid, comet, star, white dwarf, neutron star,
  pulsar, magnetar, black hole or test particle;
- edit mass, radius, density, composition, albedo, emissivity, temperature,
  spin, axial tilt, initial position and initial velocity;
- pause/reset;
- trajectory preview;
- collision/escape indicators;
- model label: catalog-observatory, newtonian-nbody, thermo-approx,
  relativity-approx or hypothetical-playground.

Physics can start with a simple Newtonian integrator in a Web Worker. If the project later needs higher numerical fidelity, evaluate WASM or server-side REBOUND.

First implementation target:

- direct pairwise Newtonian forces for small user-created systems;
- Leapfrog/Velocity Verlet or equivalent symplectic integrator;
- fixed or bounded adaptive timestep with explicit stability warnings;
- diagnostics for energy drift, angular momentum drift and center-of-mass drift;
- two-body analytic validation and short-window comparison against Horizons
  vectors when initialized from real states.

Reference implementations and papers to study before implementation are listed
in `docs/solar-system/data-and-assets.md` and
`docs/solar-system/ultimate-simulator-roadmap.md`.

Advanced physics roadmap:

- Newtonian N-body gravity with conservation diagnostics;
- barycenter, collision, Roche-limit and tidal indicators;
- thermodynamic approximations for irradiance, equilibrium temperature,
  albedo/emissivity, thermal inertia and comet sublimation;
- chemistry/material classes for rocky, metallic, icy, gas, cometary, stellar,
  degenerate-matter and compact-object presets;
- relativity approximations for Schwarzschild radius, time dilation, light
  bending, relativistic precession and optional frame dragging;
- educational spacetime deformation grid, labelled separately from any real GR
  metric/geodesic solver.

## Performance Constraints

- Main scene should remain interactive on laptop and mobile.
- Use dynamic imports for WebGL.
- Use texture resolution tiers: 1K mobile, 2K desktop, optional 4K only on demand.
- Use lazy loading for minor body catalogs and satellite catalogs.
- Use progressive loading for complete catalogs; never load all known objects into the first render.
- Use object count caps per category until filters are applied.
- Keep physics/satellite propagation out of React render cycles.

## SEO And Documentation

Mirror the periodic table structure:

- metadata and canonical alternates for IT/EN;
- JSON-LD `WebApplication`;
- public manual in Italian and English;
- about/sources page in Italian and English;
- sitemap entries;
- source citations for scientific data, texture maps, 3D meshes, libraries and algorithms;
- source citations for star catalogs, constellation metadata and deep-sky object catalogs;
- a Ko-fi support section/link matching the periodic table lab;
- optional blog post later.

### Required Manual Content

The manual must include:

- what the Solar System Lab is and what it is not;
- navigation, camera controls and search;
- date/time controls, timezone/UTC explanation and playback speed;
- scale modes for distance, radius and time;
- body categories and filters;
- inspector fields and how to read source/epoch labels;
- visual asset confidence labels: real map, real mesh, procedural material, symbolic marker;
- sandbox mode explanation once enabled;
- performance/mobile notes;
- FAQ.

### Required About/Sources Content

The about page must include:

- project purpose as a Fosforonero technical portfolio lab;
- stack: Next.js, React, Three.js, React Three Fiber, Drei, TypeScript and any orbital/satellite/sky-catalog libraries used;
- data sources: JPL Horizons, JPL SBDB, JPL planetary satellites, MPC where used, CelesTrak where used, NASA/USGS asset sources;
- open-data/license notes and limitations;
- scientific limitations: visualization scale, ephemeris precision, TLE staleness, sky-catalog completeness, procedural textures;
- roadmap;
- support/donation section with `https://ko-fi.com/fosforonero`;
- links to other Fosforonero projects.

### Structured Data Targets

Use:

- `WebApplication` for the interactive lab route;
- `WebPage` for manual/about routes;
- `HowTo` for the manual where it describes usage steps;
- `FAQPage` for manual FAQ;
- `BreadcrumbList` for app/manual/about pages;
- `CreativeWork` or `Dataset` references only if useful and accurate for cited datasets.

## Risks

- External API availability and rate limits.
- Large texture payloads.
- Misleading "real scale" claims if radius/distance are visually exaggerated.
- Natural satellite hierarchy and barycenter handling.
- Artificial satellite staleness if TLEs are cached too long.
- User-created black holes/stars being confused with real objects.

Mitigation: expose data source, epoch, scale mode and confidence labels directly in the UI.
