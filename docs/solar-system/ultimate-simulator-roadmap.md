# Solar System Ultimate Simulator Roadmap

Status: long-term product and engineering target.

This document records Matteo's requirement for the Solar System Lab to become a
serious technical simulator, not only a visual catalog. It must support the real
Solar System as an observatory and a separate playground where users can insert
new bodies and inspect the physical consequences.

The governing rule: the app must never pretend that a model is more complete than
it is. Every physics layer needs a visible model label, data source label and
validation check.

## Product Benchmarks

Use NASA Eyes as a reference benchmark for scope and interaction quality, not as
a source to copy blindly:

- NASA Eyes on the Solar System:
  https://eyes.nasa.gov/apps/solar-system/#/home
- NASA/JPL article on the web version and interaction model:
  https://www.jpl.nasa.gov/news/explore-the-solar-system-with-nasas-new-and-improved-3d-eyes/
- NASA Science Eyes overview:
  https://science.nasa.gov/eyes/
- Luna browser space simulator:
  https://luna.watermelonson.com/

Benchmark ideas worth studying:

- browser-based 3D exploration that works without a native app;
- timeline that can rewind/fast-forward across past, present and future;
- spacecraft/mission storytelling, including fly-along views;
- curated guided events for famous encounters, flybys, landings and mission
  phases;
- separate specialized apps for Solar System, asteroids, Earth, exoplanets and
  mission communications;
- lightweight mission models optimized for the web;
- educational framing around real NASA data and imagery.
- immediate sandbox feel: quick start, playful object creation, gravity controls
  and low-friction experimentation directly in the browser.

Fosforonero should not try to be a NASA clone. The differentiator should be:

- open-source/data-provenance transparency in the UI;
- bilingual Italian/English documentation;
- explicit scientific limitation labels;
- developer-portfolio quality code and architecture notes;
- future playground physics that is clearly separated from real ephemeris mode.

## Target Experience

The final experience should support two clearly separated modes.

### 1. Real Solar System Observatory

- Current-date and calendar-date Solar System view.
- Planets, dwarf planets, moons, asteroids, comets, TNOs, centaurs, spacecraft,
  artificial satellites and orbital debris where public data exists.
- Newly discovered comets and asteroids discoverable through live search or
  scheduled catalog refresh.
- Catalog snapshot date, source URL, orbit epoch, uncertainty and data-quality
  label shown in the inspector.
- Real firmament: stars, constellation lines/names, galaxies and deep-sky
  objects from astronomical catalogs, not random decorative points.
- Guided event mode inspired by NASA Eyes: major flybys, landings, mission
  phases, comet perihelia, eclipses/transits once those models exist.

### 2. Physics Playground

- Add or import bodies: planet, moon, asteroid, comet, star, white dwarf, neutron
  star, pulsar, magnetar, black hole, test particle and user-defined object.
- Quasar presets may exist only as explicitly extragalactic/hypothetical demos,
  because a quasar is an active galactic nucleus, not a body that belongs inside
  the Solar System.
- Editable parameters: mass, radius, density, composition, albedo, emissivity,
  temperature, spin, axial tilt, position, velocity and optional atmosphere.
- Visual feedback: orbit evolution, close encounters, escape/capture, collision,
  accretion, tidal disruption, Roche limit, heating and basic habitability ranges.
- Scenario management: save, reset, compare, share and export scenario JSON.

## Physics Scope

### N-body Physics References

Use these references when designing the playground physics engine. They are not
all implementation dependencies; some are scientific or architectural references.

Background:

- Wikipedia, "N-body simulation":
  https://en.wikipedia.org/wiki/N-body_simulation
  Use only as a general orientation page. Do not cite it as the primary authority
  for formulas, algorithms or implementation claims.
- N-body Physics / Gravity Engine blog:
  https://nbodyphysics.com/blog/
  Useful for product/architecture ideas such as keeping propagation separate from
  rendering, separating physical scale from display scale and mixing Kepler,
  SGP4, ephemeris and N-body concepts. Treat it as a benchmark, not as a source
  of truth for this codebase.
- Luna, "Free Browser Space Simulator / Gravity & Solar System Sandbox":
  https://luna.watermelonson.com/
  Useful as a UX benchmark for a browser-first gravity sandbox: fast entry, direct
  manipulation, playful experimentation and approachable controls. Treat it as a
  product reference, not as a scientific authority.

Authoritative scientific/technical references:

- REBOUND paper: "REBOUND: an open-source multi-purpose N-body code for
  collisional dynamics", Astronomy & Astrophysics, 2012:
  https://www.aanda.org/articles/aa/abs/2012/01/aa18085-11/aa18085-11.html
- REBOUND documentation:
  https://rebound.readthedocs.io/
  Use as the main reference for integrator terminology, model separation and
  validation patterns. Check license compatibility before bundling any code.
- IAS15 paper: "IAS15: A fast, adaptive, high-order integrator for gravitational
  dynamics":
  https://arxiv.org/abs/1409.4779
  Reference for high-accuracy adaptive integration and close-encounter behavior.
- WHFast paper: "WHFast: a fast and unbiased implementation of a symplectic
  Wisdom-Holman integrator for long-term gravitational simulations":
  https://academic.oup.com/mnras/article/452/1/376/1748797
  Reference for long-term planetary-system integration.
- Barnes & Hut, "A hierarchical O(N log N) force-calculation algorithm", Nature,
  1986:
  https://www.nature.com/articles/324446a0
  Reference for tree-based approximation if the playground ever needs large-N
  performance beyond direct pairwise forces.
- Heggie & Hut, "The Gravitational Million-Body Problem", Cambridge University
  Press:
  https://www.cambridge.org/core/books/gravitational-millionbody-problem/AFA2C2F4821B5FEF991A22470E889C22
  Reference for gravitational dynamics, star clusters and advanced N-body
  concepts.
- JPL Horizons manual:
  https://ssd.jpl.nasa.gov/horizons/manual.html
  Use as the real-ephemeris baseline for comparing simulated states against
  authoritative Solar System vectors.

Implementation stance for this project:

- Start with direct Newtonian pairwise forces for small sandbox scenarios.
- Run physics in a Web Worker, never in React render cycles.
- Use a symplectic method such as Leapfrog/Velocity Verlet as the first browser
  implementation because it is understandable and testable.
- Add diagnostics before adding features: energy drift, angular momentum drift,
  center-of-mass drift and comparison against two-body analytic cases.
- Treat large-N algorithms such as Barnes-Hut as later optimizations, not as the
  first implementation.
- Do not claim REBOUND-grade precision unless using a validated equivalent model
  and passing explicit tests against known references.

### Orbital Mechanics

Initial engine:

- Newtonian gravity.
- N-body integration in a Web Worker.
- Symplectic or high-stability integrator for long runs.
- Collision detection using physical or selected visual radii.
- Center-of-mass and barycenter handling.

Validation:

- two-body Kepler orbit remains stable;
- total energy drift stays under a documented threshold;
- total angular momentum drift stays under a documented threshold;
- known major-body positions remain close to Horizons for short windows when
  initialized from Horizons vectors.

### Thermodynamics

Initial model:

- solar irradiance by distance;
- equilibrium temperature from albedo/emissivity;
- simple heat capacity/thermal inertia;
- optional greenhouse multiplier;
- comet sublimation trigger and coma/tail visualization near the Sun;
- tidal heating indicator for close massive-body interactions.

Validation:

- Earth equilibrium temperature approximation documented;
- Mercury/Mars/Jupiter relative irradiance ordering;
- comet activity increases as perihelion distance decreases;
- all thermal values display model level and uncertainty.

### Chemistry And Materials

Initial model:

- body composition classes: rocky, metallic, icy, gas giant, cometary, stellar,
  degenerate matter and black-hole placeholder;
- density consistency warnings when mass/radius/composition conflict;
- volatile inventory for comet/icy-body sublimation;
- atmosphere presence and simple gas/ice/plasma visual states.

Validation:

- density calculated from mass/radius;
- surface gravity and escape velocity calculated from mass/radius;
- impossible or extreme user inputs flagged rather than silently accepted.

### Relativity And Compact Objects

Initial model:

- Schwarzschild radius;
- gravitational time dilation approximation;
- light-bending/lensing visualization around compact objects;
- relativistic precession approximation for Mercury-like orbits;
- optional Kerr/frame-dragging approximation for rotating black holes only after
  the simpler Schwarzschild model is stable.

Validation:

- Schwarzschild radius matches `2GM/c^2`;
- Mercury perihelion correction is in the right order of magnitude;
- time dilation increases near higher mass/smaller radius objects;
- compact-object visualizations are labelled as approximations unless a real GR
  metric/geodesic solver is introduced.

### Spacetime Visualization

Mass should be able to deform a visual reference grid in playground mode. This is
an educational visualization by default, not proof of a full general-relativity
solver. The UI must say whether the grid is:

- `educational-well`: visual potential well only;
- `schwarzschild-approx`: analytic compact-object approximation;
- `geodesic-solver`: future full ray/orbit integration, if ever implemented.

### Space Weather (Solar Wind And Magnetospheres) — DEFERRED

A dedicated, deferred layer for the solar wind, planetary magnetic fields and
their interactions. This is an **analytic/visualization** layer, never claimed as
a magnetohydrodynamic plasma solver.

Initial model:

- solar wind as radial outflow with parametric activity level;
- interplanetary magnetic field as an analytic Parker spiral;
- planetary dipole fields from published moment/polarity/tilt for magnetized
  bodies (Mercury, Earth, Jupiter, Saturn, Uranus, Neptune, Ganymede);
- magnetopause/bow-shock standoff from a pressure-balance approximation;
- schematic aurora ovals scaled by activity level;
- optional live activity mode from NOAA SWPC (DSCOVR/ACE), with retrieval time,
  source and data-quality labels and a labeled parametric fallback.

Model labels: `solar-wind-approx`, `dipole-field-approx`,
`magnetosphere-standoff-approx`, `aurora-schematic`.

Validation: solar-wind speed in ~300–800 km/s; Earth magnetopause ~10 R⊕ at
nominal pressure; Jupiter standoff ≫ Earth; unmagnetized bodies show no intrinsic
dipole; aurora intensity rises with storm level.

Full implementation plan: `docs/solar-system/handoff-solar-wind-magnetosphere.md`.

## Data Ingestion Targets

### Solar System Objects

- JPL Horizons: precision vectors for selected real bodies.
- JPL SBDB Query: asteroids, comets, TNOs, centaurs and discovery metadata.
- Minor Planet Center: secondary source for new discoveries and orbital elements.
- JPL planetary satellites: natural satellite metadata.
- CelesTrak GP/TLE/OMM: artificial satellites and orbital debris.

### Refresh Rules

- Static snapshots for first load and SEO-stable content.
- Live search for newly discovered or rarely used objects.
- Scheduled refresh script for catalog chunks.
- Every catalog file must include retrieval date, source URL, query parameters,
  object count and schema version.

## Suggested Sprint Sequence

1. Sprint 03B: progressive SBDB/Horizons catalog, search, dense point rendering.
2. Sprint 04: reference-frame precision, IAU WGCCRE pole RA/Dec, precession and
   per-body orientation improvements.
3. Sprint 05: real NASA/USGS textures and asset manifest quality labels.
4. Sprint 06: CelesTrak artificial satellites and SGP4 propagation.
5. Sprint 07: Newtonian N-body playground in a Web Worker.
6. Sprint 08: collisions, barycenters, Roche limits and tidal indicators.
7. Sprint 09: thermodynamics, comet activity and material-state model.
8. Sprint 10: relativity approximations and compact-object playground presets.
9. Sprint 11: spacetime-grid visualization and advanced scenario export.
10. Sprint 12 (DEFERRED — write-now / implement-later): solar wind, planetary
    magnetic fields and their interactions (magnetospheres, bow shock,
    magnetopause, aurorae, CME/storm events). Analytic/visualization layer only,
    not an MHD plasma solver. Full plan in
    `docs/solar-system/handoff-solar-wind-magnetosphere.md`.

## Non-Negotiable UX Rules

- Real objects and user-created objects must use different labels and visual
  styles.
- Real ephemeris mode must remain usable even if playground physics is disabled.
- A user-created black hole, quasar, pulsar or magnetar must never appear as a
  real Solar System catalog object.
- If a newly discovered comet is fetched live, the inspector must show the source,
  retrieval time and orbit uncertainty/data-quality label.
- Heavy physics must run outside React render cycles, preferably in a Web Worker
  or WASM module.

## Future Claude Instruction

When Claude receives a Solar System sprint after this document exists, it should:

1. Read `governance.md`, `architecture-spec.md` and this roadmap first.
2. Preserve the separation between observatory mode and playground mode.
3. Add model labels and validation checks before making physics claims.
4. Update manual/about pages in Italian and English whenever a physics model,
   data source or limitation changes.
