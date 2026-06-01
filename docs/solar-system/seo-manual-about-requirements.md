# SEO, Manual And About Requirements

Status: required for first public release

The Solar System Lab is not only an educational feature. It is a technical portfolio piece for Fosforonero. The implementation must make engineering quality visible through the product itself and through crawlable supporting pages.

## Public Routes

Implement six public routes:

- `/lab/sistema-solare`
- `/en/lab/solar-system`
- `/lab/sistema-solare/manuale`
- `/en/lab/solar-system/manual`
- `/lab/sistema-solare/about`
- `/en/lab/solar-system/about`

All routes must have canonical URLs, hreflang alternates and sitemap entries.

## Metadata Requirements

Each route needs:

- concise, unique title;
- concise, search-oriented description;
- canonical URL;
- `it`, `en` and `x-default` alternates;
- Open Graph metadata;
- Twitter `summary_large_image`;
- index/follow robots unless intentionally withheld during preview;
- relevant keyword coverage without stuffing.

Suggested IT keyword clusters:

- simulatore sistema solare;
- sistema solare 3D;
- planetario WebGL;
- effemeridi NASA JPL;
- asteroidi comete satelliti;
- laboratorio astronomia online.

Suggested EN keyword clusters:

- solar system simulator;
- 3D solar system;
- WebGL orrery;
- NASA JPL ephemeris;
- asteroids comets satellites;
- online astronomy lab.

## Structured Data

Main app routes:

- `WebApplication`
- `BreadcrumbList`

Manual routes:

- `WebPage`
- `HowTo`
- `FAQPage`
- `BreadcrumbList`

About routes:

- `WebPage`
- `BreadcrumbList`

Use `Dataset` or `CreativeWork` only if each referenced source is represented accurately and without implying ownership.

## Manual Requirements

The manual must be bilingual and substantial at first release.

Required sections:

1. Overview: what the lab does and what data is real.
2. Navigation: camera, zoom, pan limits and selection.
3. Time controls: now, date picker, UTC/local handling, playback, speed.
4. Scale modes: distance, radius, educational exaggeration and real-scale limitations.
5. Body categories: planets, moons, dwarf planets, asteroids, comets, TNOs, spacecraft, artificial satellites.
6. Inspector: mass, radius, position, velocity, epoch, data source, visual asset source.
7. Visual confidence: real map, real mesh, procedural material, symbolic marker.
8. Sandbox: explain only when enabled; until then mark as roadmap.
9. Mobile/performance guidance.
10. FAQ with at least 5 questions.

The manual must link to:

- the app route;
- the about/sources route;
- source citations where useful;
- Ko-fi support link if a support CTA is included.

## About/Sources Requirements

The about page must be bilingual and should mirror the periodic table project's quality.

Required sections:

- Hero: project identity and purpose.
- Technical stack.
- Scientific data sources.
- Texture and 3D asset sources.
- Open data and license notes.
- Scientific limitations.
- Performance strategy.
- Roadmap.
- Support/donations.
- Other Fosforonero projects.

## Required Source Citations

At minimum, cite these if used:

- NASA/JPL Horizons: https://ssd.jpl.nasa.gov/horizons/
- Horizons API docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- JPL SBDB: https://ssd-api.jpl.nasa.gov/doc/sbdb.html
- JPL SBDB Query: https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html
- JPL Planetary Satellites: https://ssd.jpl.nasa.gov/sats/
- Minor Planet Center docs: https://minorplanetcenter.org/mpcops/documentation/
- CelesTrak GP data docs: https://celestrak.org/NORAD/documentation/gp-data-formats.php
- satellite.js: https://www.npmjs.com/package/satellite.js
- NASA 3D Resources: https://science.nasa.gov/3d-resources/
- JPL texture maps: https://space.jpl.nasa.gov/tmaps/
- USGS Astrogeology catalog: https://astrogeology.usgs.gov/search
- NASA media usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- USGS copyright FAQ: https://www.usgs.gov/faqs/are-usgs-reportspublications-copyrighted

Only cite sources actually used by the implementation. Do not pad the about page with unused references.

## Open/Public Data Policy

Use open, public, government, institutional or clearly reusable sources.

For every data/asset source record:

- source name;
- source URL;
- retrieval date;
- credit text;
- license or usage note;
- transformation notes if converted, resized or simplified.

For NASA/USGS/JPL materials:

- do not imply NASA/JPL/USGS endorsement;
- do not use NASA logos as decorative brand assets;
- retain credits and source links;
- distinguish scientific maps from visualization-only maps.

## Support / Donations

Include Ko-fi in:

- app inspector or toolbar as a compact support link;
- about page support section;
- optional manual footer/CTA.

Use:

- URL: `https://ko-fi.com/fosforonero`
- IT label: `Supporta su Ko-fi`
- EN label: `Support on Ko-fi`

Suggested IT copy:

> Questo laboratorio è gratuito, senza pubblicità e costruito con dati aperti o pubblici. Se ti è utile o vuoi sostenere lo sviluppo di nuovi strumenti scientifici interattivi, puoi offrire un caffè su Ko-fi.

Suggested EN copy:

> This lab is free, ad-free and built on open or public data. If it is useful to you or you want to support more interactive scientific tools, you can buy a coffee on Ko-fi.

## Portfolio Quality Bar

The first release should demonstrate:

- real data integration;
- technical source transparency;
- high-performance WebGL rendering;
- responsive interface;
- bilingual product content;
- SEO and structured data discipline;
- accessible controls and readable labels;
- honest limitations.

Avoid thin placeholder pages. If a section is not ready, ship a concise but truthful roadmap entry instead.

