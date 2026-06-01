# Claude Implementation Plan Prompt

Use this file as the starting prompt for a future Claude/Codex implementation session.

## Task

Create the first implementation plan for a new Fosforonero project named `solar-system`.

The goal is a new lab page:

- Italian: `/lab/sistema-solare`
- English: `/en/lab/solar-system`

It should become a real-time, date-aware Solar System observatory and later a physics sandbox.

This is a portfolio-grade project. It must show Matteo's technical capabilities clearly: scientific data integration, real-time 3D, performance optimization, bilingual product writing, SEO/GEO structure, source transparency and polished UI.

## Read First

Before planning, inspect:

- `docs/solar-system/README.md`
- `docs/solar-system/data-and-assets.md`
- `docs/solar-system/architecture-spec.md`
- `docs/solar-system/seo-manual-about-requirements.md`
- `components/lab/periodic-table-view.tsx`
- `components/lab/atom-scene.tsx`
- `components/lab/crystal-view-scene.tsx`
- `components/lab/molecule-scene.tsx`
- `app/lab/tavola-periodica/page.tsx`
- `app/en/lab/tavola-periodica/page.tsx`
- `app/lab/layout.tsx`
- `lib/site.ts`
- `app/sitemap.ts`

## Non-Negotiables

- Do not implement the whole final vision at once.
- Start with the MVP observatory.
- Keep real ephemeris mode separate from sandbox mode.
- Do not directly couple Solar System code to periodic table code.
- Do not load large catalogs in the first render.
- Do not render thousands of objects as individual React mesh nodes.
- Every real data point and texture/mesh must have a source record.
- Every scale exaggeration must be visible in the UI.
- Data and assets must come from open/public sources or sources whose terms allow reuse with attribution.
- Manual and about pages are required, not optional polish.
- Include the same Ko-fi support link used by the periodic table: `https://ko-fi.com/fosforonero`.
- SEO cannot be an afterthought; add metadata, structured data, sitemap entries and bilingual alternates with the feature.

## MVP Requirements

Build a first version with:

- Sun, 8 planets, Moon, Galilean moons, Titan, Enceladus, Triton, Pluto/Charon, Ceres, Vesta and a small comet/TNO set.
- date picker with "now";
- play/pause and speed multiplier;
- scale modes for distance and radius;
- real firmament background: catalog stars, constellation lines/labels and selected galaxies/deep-sky objects. Do not ship a random decorative starfield as the final background.
- selectable bodies;
- technical inspector with source, epoch, mass/radius if available, position, velocity if available;
- orbit trails;
- starfield;
- IT/EN routes;
- manual/about pages with real first-pass content, source citations and Ko-fi support section;
- JSON-LD and sitemap integration.

## Data Strategy For MVP

Preferred:

1. Create a static curated body catalog.
2. Add a normalized ephemeris adapter.
3. For first implementation, either:
   - use a small checked-in ephemeris sample generated from Horizons, or
   - create server-side route handlers with caching for Horizons vector queries.
4. Add a clear TODO for broader SBDB/CelesTrak integration.

Do not build CelesTrak artificial satellite support in MVP unless the base scene is already stable.

## Suggested File Layout

```txt
app/lab/sistema-solare/page.tsx
app/en/lab/solar-system/page.tsx
app/lab/sistema-solare/manuale/page.tsx
app/en/lab/solar-system/manual/page.tsx
app/lab/sistema-solare/about/page.tsx
app/en/lab/solar-system/about/page.tsx
components/lab/solar-system-view.tsx
components/lab/solar-system-scene.tsx
components/lab/firmament-layer.tsx
components/lab/solar-system.css
components/lab/solar-system-manual-view.tsx
components/lab/solar-system-about-view.tsx
lib/solar-system/bodies.ts
lib/solar-system/assets.ts
lib/solar-system/ephemeris.ts
lib/solar-system/firmament.ts
lib/solar-system/scales.ts
lib/solar-system/i18n.ts
```

Optional later:

```txt
app/api/solar-system/horizons/route.ts
app/api/solar-system/sbdb/route.ts
app/api/solar-system/celestrak/route.ts
lib/solar-system/tle.ts
lib/solar-system/sandbox-physics.ts
```

## Verification

After implementation:

- `pnpm typecheck`
- `pnpm build`
- inspect generated metadata for IT/EN routes
- inspect structured data scripts
- verify sitemap includes all six Solar System routes
- manual browser check on desktop and mobile
- verify that WebGL canvas is non-blank
- verify date change updates body positions or clearly updates the selected ephemeris snapshot
- verify manual/about contain real source citations and no placeholder sections
- verify Ko-fi support links work and open externally

## Open Questions For Matteo

- Should the first visual style be more "NASA mission control" or more cinematic "deep space observatory"?
- Should the first release include artificial satellites, or reserve them for phase 2?
- Should textures be downloaded/processed into the repo, or referenced through a manifest first and fetched later?
- How aggressive should the real-scale mode be on mobile?
