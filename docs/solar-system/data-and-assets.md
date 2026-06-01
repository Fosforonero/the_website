# Solar System Data And Asset Sources

Last verified: 2026-05-29

This file separates scientific data, visual textures, 3D meshes and legal/license notes. They should not be treated as one source. In most cases, the source that gives accurate orbital data is not the source that gives the best visual texture.

## Primary Scientific Data

### JPL Horizons

Use for current, historical and future positions of planets, natural satellites, spacecraft, asteroids and comets.

- Source: https://ssd.jpl.nasa.gov/horizons/
- API docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- Best use: Cartesian state vectors (`EPHEM_TYPE=VECTORS`) for date-aware rendering.
- Notes: Horizons supports planets, the Sun, natural satellites, spacecraft, dynamical points, asteroids and comets. It should be the source of truth for the MVP.

### JPL Small-Body Database

Use for asteroids, comets and trans-Neptunian objects.

- SBDB API: https://ssd-api.jpl.nasa.gov/doc/sbdb.html
- SBDB Query API: https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html
- Best use: catalog metadata, orbit class, physical properties, identifiers and filtering.
- Notes: use SBDB for catalog/search and Horizons for exact rendered positions when possible.

### Minor Planet Center

Use as secondary/advanced source for minor planet orbital data.

- MPC docs: https://minorplanetcenter.org/mpcops/documentation/
- Orbits API: https://minorplanetcenter.org/mpcops/documentation/orbits-api/
- Best use: large-scale minor planet ingestion or comparison with JPL data.
- Notes: do not start here for the MVP unless JPL coverage is insufficient.

### JPL Planetary Satellites

Use for natural satellite systems and references.

- Source: https://ssd.jpl.nasa.gov/sats/
- Best use: natural satellite coverage, observation data and JPL satellite ephemeris context.

### CelesTrak GP/TLE/OMM

Use for artificial Earth satellites.

- Current data/docs: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- Best use: public satellite groups in JSON/OMM or TLE/3LE formats.
- Runtime propagation: `satellite.js` with SGP4/SDP4.
- Library: https://www.npmjs.com/package/satellite.js
- Notes: artificial satellites should be phase 2 or 3, not MVP. They require aggressive filtering and instanced rendering.

### NASA Exoplanet Archive

Use only if the lab expands beyond the Solar System.

- API docs: https://exoplanetarchive.ipac.caltech.edu/docs/program_interfaces.html
- Best use: exoplanet catalog mode, not the Solar System MVP.

### ESA Gaia

Use for star background/catalog work, not textured stars.

- Gaia DR3 summary: https://www.cosmos.esa.int/web/gaia/dr3
- Best use: real star positions, brightness and color approximations.
- Notes: individual stars do not have real surface texture maps. Render stars procedurally from spectral/color data.

### Hipparcos / Stellarium Sky Cultures

Use for the real firmament layer when a compact browser-ready dataset is needed.

- Hipparcos catalog context: https://www.cosmos.esa.int/web/hipparcos/catalogues
- Stellarium sky cultures repository: https://github.com/Stellarium/stellarium/tree/master/skycultures
- Best use: naked-eye/bright star positions, magnitudes, Bayer/Flamsteed names, constellation line art and localized constellation names.
- Notes: Gaia is massive and should be preprocessed. For Sprint 01/02, use a curated bright-star subset and constellation line dataset, then document the source and transformation.

### Deep-Sky Object Catalogs

Use for galaxies, nebulae and clusters visible in the rendered sky background.

- OpenNGC: https://github.com/mattiaverga/OpenNGC
- Messier catalog reference: https://messier.seds.org/
- Best use: selected galaxies and deep-sky markers such as Andromeda (M31), Triangulum (M33), Orion Nebula (M42), Pleiades (M45).
- Notes: render as labeled sprites/markers or subtle billboards, not as random decorative blobs. Record source and visual confidence.

## Physics And Simulation References

These sources guide the future playground physics engine. They are not visual
assets and must not be treated as direct catalog data.

### N-body Simulation Background

- Wikipedia overview: https://en.wikipedia.org/wiki/N-body_simulation
- Best use: terminology overview for N-body simulation, direct integration,
  tree methods, particle-mesh methods and computational complexity.
- Notes: useful for orientation, but not authoritative enough for implementation
  claims. Prefer peer-reviewed papers and official docs below.

### N-body Physics / Gravity Engine

- Blog: https://nbodyphysics.com/blog/
- Best use: architecture inspiration for separating physical propagation from
  rendering, scale conversion and mixed orbit/ephemeris concepts.
- Notes: it is Unity-oriented and should not dictate the web architecture.

### Luna Browser Space Simulator

- App: https://luna.watermelonson.com/
- Best use: UX/product benchmark for a browser-first gravity sandbox, quick object
  creation and low-friction experimentation.
- Notes: do not treat as a scientific data source. Use only as inspiration for
  interaction flow, immediacy and approachable sandbox controls.

### REBOUND

- Paper: https://www.aanda.org/articles/aa/abs/2012/01/aa18085-11/aa18085-11.html
- Docs: https://rebound.readthedocs.io/
- Best use: reference implementation and terminology for gravitational N-body
  simulation, integrators, collision handling and validation patterns.
- Notes: check license compatibility before using code directly. For now, treat
  REBOUND as a scientific reference.

### IAS15 Integrator

- Paper: https://arxiv.org/abs/1409.4779
- Best use: reference for high-order adaptive gravitational integration and
  close-encounter accuracy.
- Notes: candidate model for future high-fidelity/WASM/server-side physics, not
  required for the first browser playground.

### WHFast Integrator

- Paper: https://academic.oup.com/mnras/article/452/1/376/1748797
- Best use: reference for long-term symplectic integration of planetary systems.
- Notes: useful when evaluating long-duration Solar System stability scenarios.

### Barnes-Hut Algorithm

- Paper: https://www.nature.com/articles/324446a0
- Best use: reference for reducing large-N force calculations from direct
  pairwise complexity toward tree-based approximation.
- Notes: future optimization only. The first playground should stay direct
  pairwise for clarity and validation.

### Gravitational Million-Body Problem

- Cambridge University Press:
  https://www.cambridge.org/core/books/gravitational-millionbody-problem/AFA2C2F4821B5FEF991A22470E889C22
- Best use: advanced theoretical reference for gravitational dynamics, stellar
  systems and large N-body problems.

### JPL Horizons Manual

- Manual: https://ssd.jpl.nasa.gov/horizons/manual.html
- Best use: authoritative real-ephemeris baseline for comparing simulated
  positions/velocities against Solar System vectors.
- Notes: the sandbox can simulate hypothetical states, but the observatory should
  prefer Horizons-derived vectors for real bodies.

## Texture And Visual Asset Sources

### NASA 3D Resources

Use for spacecraft, probes, mission assets and some textured models.

- Source: https://www.nasa.gov/stem-content/nasa-3d-resources/
- New NASA Science 3D hub: https://science.nasa.gov/3d-resources/
- Best use: spacecraft and educational 3D models.
- Notes: verify each asset format. Some NASA models are STL or OBJ without usable textures.

### JPL Planetary Texture Maps

Use for simple planet texture maps where available.

- Source: https://space.jpl.nasa.gov/tmaps/
- Best use: quick WebGL planet textures.
- Notes: JPL states many maps are stitched from spacecraft images but are not for scientific analysis. Treat them as visualization textures.

### USGS Astrogeology / Astropedia

Use for higher-quality planetary maps and mosaics.

- Search/catalog: https://astrogeology.usgs.gov/search
- Example Mars products: https://astrogeology.usgs.gov/search/map/mars-viking-global-products
- Example Vesta mosaic: https://astrogeology.usgs.gov/search/map/vesta_dawn_fc_hamo_global_mosaic_60m
- Best use: Moon, Mars, Mercury, Venus, Vesta, Ceres and other mapped bodies.
- Notes: products may be GeoTIFF or scientific map formats. A preprocessing step may be needed to convert to web-ready WebP/JPEG/PNG equirectangular textures.

### NASA Scientific Visualization Studio

Use for Sun/Earth visualizations and high-quality public science imagery.

- NASA data entry page: https://science.nasa.gov/learn/entry-points-to-nasa-data/
- Best use: Earth, Sun, heliophysics and space visualization assets.
- Notes: for the Sun, prefer procedural shaders plus optional SDO-derived visual layers. There is no stable "real texture" for all stars.

### JPL Radar Asteroid Shape Models

Use for selected asteroid meshes.

- Source: https://echo.jpl.nasa.gov/asteroids/shapes/shapes.html
- Best use: selected real asteroid shapes such as Itokawa and other radar-modeled bodies.
- Notes: texture availability varies. Many asteroid meshes should use procedural rocky materials.

## Practical Asset Policy

Use a tiered visual strategy:

1. Real texture/map when a credible NASA/JPL/USGS product exists.
2. Real mesh with procedural material when shape exists but texture does not.
3. Procedural material when no reliable surface map exists.
4. Symbolic point/marker for tiny or catalog-only objects.

For the firmament:

1. Stars must come from a real catalog with right ascension, declination, magnitude and color/spectral approximation when available.
2. Constellation lines must come from a documented sky-culture/asterism dataset.
3. Galaxies/deep-sky objects must come from a documented catalog such as OpenNGC/Messier-derived data.
4. A procedural/random starfield may be used only as a temporary development fallback and must not ship as the claimed real sky.

Never imply that a procedural or artist-enhanced material is a scientific surface texture. The UI should label asset source and confidence.

## License Notes

- NASA imagery and media are generally usable under NASA media guidelines, but NASA identifiers/logos are not public-domain branding assets and endorsement must not be implied.
- NASA media guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- USGS-authored data and information are generally U.S. public domain, but verify metadata for third-party images or overlays.
- USGS copyright FAQ: https://www.usgs.gov/faqs/are-usgs-reportspublications-copyrighted
- Always store source URL, credit text, retrieval date and transformation notes for every texture/mesh.

## Data Reality Check

"All objects in the Solar System" is not a fixed, small set.

Recommended interpretation:

- MVP renders a curated body list.
- Search can query broader catalogs.
- Dense catalogs render as filtered point clouds or instanced markers.
- Full datasets are never loaded into the first viewport.

Known scale as of verification:

- JPL Horizons documents availability for more than 1.4 million asteroids, thousands of comets, hundreds of natural satellites, all planets, the Sun, spacecraft and dynamical points.
- CelesTrak artificial satellite catalogs can include thousands to tens of thousands of public orbital objects depending on group/filter.

Firmament scale:

- Gaia contains far more stars than should be loaded into the first viewport.
- MVP should use a compact curated bright-star dataset; later versions can add magnitude thresholds and progressive loading.
