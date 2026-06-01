# Solar System MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first public, bilingual Solar System Lab MVP for Fosforonero: a date-aware 3D observatory with real-source body data, a real firmament layer, SEO-ready routes, manual/about pages, source citations and Ko-fi support.

**Architecture:** Create a new lab module independent from the periodic table, reusing only established project patterns: full-screen lab routes, client-only WebGL dynamic import, bilingual server-rendered manual/about pages, JSON-LD and sitemap integration. Use a curated static body catalog plus deterministic local ephemeris placeholders first, with the adapter boundary ready for JPL Horizons integration.

**Tech Stack:** Next.js App Router, React, TypeScript, Three.js, React Three Fiber, Drei, CSS modules/global lab CSS, JSON-LD, existing `site` metadata helpers.

---

## Sprint Boundary

This sprint does **not** implement every future feature. It creates the first credible public foundation:

- app routes in IT/EN;
- WebGL Solar System scene with curated bodies;
- real sky background with catalog stars, constellation lines/names and selected galaxies/deep-sky objects;
- date/time controls and scale controls;
- selected-body inspector;
- manual/about pages with real first-pass content;
- source citations and open-data policy;
- Ko-fi support links;
- sitemap and SEO metadata.

Out of scope for Sprint 01:

- live JPL Horizons API route;
- full asteroid/comet/TNO database;
- CelesTrak artificial satellites;
- sandbox physics for added planets, stars or black holes;
- downloading final production texture packs.
- full Gaia-scale star catalog; Sprint 01 uses a compact bright-star/deep-sky subset.

Those are planned as later sprints.

## Read Before Coding

Claude must read these files first:

- `docs/solar-system/README.md`
- `docs/solar-system/data-and-assets.md`
- `docs/solar-system/architecture-spec.md`
- `docs/solar-system/seo-manual-about-requirements.md`
- `docs/solar-system/asset-manifest-template.md`
- `components/lab/periodic-table-view.tsx`
- `components/lab/periodic-table-manual-view.tsx`
- `components/lab/periodic-table-about-view.tsx`
- `app/lab/tavola-periodica/page.tsx`
- `app/en/lab/tavola-periodica/page.tsx`
- `app/sitemap.ts`

## Files To Create

- `lib/solar-system/bodies.ts`  
  Curated body catalog, categories, physical data, citation references and initial orbital parameters.

- `lib/solar-system/assets.ts`  
  Asset source manifest with fallback materials and license/source notes.

- `lib/solar-system/ephemeris.ts`  
  Pure TypeScript date-to-position adapter for MVP. It should use simple orbital elements for visual positions and expose a clean boundary for future JPL Horizons vectors.

- `lib/solar-system/firmament.ts`  
  Compact real sky dataset for Sprint 01: bright stars, constellation line segments, constellation labels and selected deep-sky objects, with source metadata.

- `lib/solar-system/scales.ts`  
  Distance/radius scaling helpers for render transforms.

- `lib/solar-system/i18n.ts`  
  IT/EN UI copy, manual content, about content, source labels and SEO strings.

- `components/lab/solar-system-scene.tsx`  
  Client-only React Three Fiber scene.

- `components/lab/firmament-layer.tsx`  
  Real sky background renderer. It must not use random decorative stars as the production layer.

- `components/lab/solar-system-view.tsx`  
  Client UI shell: toolbar, date controls, scale controls, object browser, inspector and Ko-fi link.

- `components/lab/solar-system-manual-view.tsx`  
  Server/client-safe manual view matching the quality of the periodic table manual.

- `components/lab/solar-system-about-view.tsx`  
  About/sources view with stack, sources, limitations, roadmap, Ko-fi and related projects.

- `components/lab/solar-system.css`  
  Independent lab styling. Do not reuse periodic-table class names except for generic loading text if necessary.

- `app/lab/sistema-solare/page.tsx`
- `app/en/lab/solar-system/page.tsx`
- `app/lab/sistema-solare/manuale/page.tsx`
- `app/en/lab/solar-system/manual/page.tsx`
- `app/lab/sistema-solare/about/page.tsx`
- `app/en/lab/solar-system/about/page.tsx`

## Files To Modify

- `app/sitemap.ts`  
  Add all six Solar System routes with IT/EN alternates.

- `lib/projects.ts`  
  Add Solar System Lab only if the project listing should expose work-in-progress labs immediately. If not, leave for a later launch sprint.

## Shared Constants

Use these names consistently:

```ts
export type SolarBodyCategory =
  | "star"
  | "planet"
  | "dwarf-planet"
  | "moon"
  | "asteroid"
  | "comet"
  | "tno";

export type ScaleDistanceMode = "compressed" | "real-log" | "inner-system";
export type ScaleRadiusMode = "visible" | "relative";

export type SolarBody = {
  id: string;
  name: { it: string; en: string };
  category: SolarBodyCategory;
  parentId: string | null;
  radiusKm: number;
  massKg?: number;
  semiMajorAxisKm?: number;
  orbitalPeriodDays?: number;
  eccentricity?: number;
  inclinationDeg?: number;
  color: string;
  sourceIds: string[];
  assetId?: string;
};

export type BodyState = {
  id: string;
  positionKm: [number, number, number];
  velocityKmS?: [number, number, number];
  epochIso: string;
  source: "mvp-orbital-elements" | "jpl-horizons";
};

export type FirmamentStar = {
  id: string;
  name?: string;
  raDeg: number;
  decDeg: number;
  magnitude: number;
  colorIndex?: number;
  sourceIds: string[];
};

export type ConstellationLine = {
  constellationId: string;
  fromStarId: string;
  toStarId: string;
  sourceIds: string[];
};

export type DeepSkyObject = {
  id: string;
  name: string;
  kind: "galaxy" | "nebula" | "cluster";
  raDeg: number;
  decDeg: number;
  magnitude?: number;
  sourceIds: string[];
};
```

## Curated MVP Body Set

Include at least:

- Sun;
- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune;
- Moon;
- Io, Europa, Ganymede, Callisto;
- Titan, Enceladus;
- Triton;
- Pluto, Charon;
- Ceres, Vesta;
- Halley, 67P;
- Eris, Haumea, Makemake, Sedna.

Every body must have at least one `sourceIds` entry.

---

## Task 1: Create Solar System Data Layer

**Files:**

- Create: `lib/solar-system/bodies.ts`
- Create: `lib/solar-system/assets.ts`
- Create: `lib/solar-system/ephemeris.ts`
- Create: `lib/solar-system/firmament.ts`
- Create: `lib/solar-system/scales.ts`

- [ ] **Step 1: Create source registry in `bodies.ts`**

Add a source registry with stable IDs:

```ts
export const SOLAR_SOURCES = {
  nasaJplHorizons: {
    label: "NASA/JPL Horizons",
    url: "https://ssd.jpl.nasa.gov/horizons/",
    usage: "Ephemerides and Solar System body vectors.",
  },
  horizonsApi: {
    label: "NASA/JPL Horizons API",
    url: "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    usage: "Future server-side vector queries.",
  },
  jplSbdb: {
    label: "JPL Small-Body Database",
    url: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
    usage: "Asteroid, comet and trans-Neptunian object metadata.",
  },
  jplSatellites: {
    label: "JPL Planetary Satellites",
    url: "https://ssd.jpl.nasa.gov/sats/",
    usage: "Natural satellite reference data.",
  },
  nasaMedia: {
    label: "NASA Images and Media Guidelines",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    usage: "NASA media reuse and attribution policy.",
  },
  usgsAstrogeology: {
    label: "USGS Astrogeology",
    url: "https://astrogeology.usgs.gov/search",
    usage: "Planetary map and mosaic source for later texture processing.",
  },
  esaGaia: {
    label: "ESA Gaia DR3",
    url: "https://www.cosmos.esa.int/web/gaia/dr3",
    usage: "Reference source for future high-density star catalog layers.",
  },
  hipparcos: {
    label: "ESA Hipparcos Catalogues",
    url: "https://www.cosmos.esa.int/web/hipparcos/catalogues",
    usage: "Compact bright-star source for browser-ready firmament rendering.",
  },
  stellariumSkyCultures: {
    label: "Stellarium Sky Cultures",
    url: "https://github.com/Stellarium/stellarium/tree/master/skycultures",
    usage: "Constellation line and sky-culture metadata reference.",
  },
  openNgc: {
    label: "OpenNGC",
    url: "https://github.com/mattiaverga/OpenNGC",
    usage: "Open catalog for galaxies, nebulae and star clusters.",
  },
} as const;
```

- [ ] **Step 2: Add curated `SOLAR_BODIES`**

Create a typed array using the shared `SolarBody` type. For Sprint 01, use approximate physical/orbital values sufficient for visualization. Do not claim high-precision ephemeris until Horizons integration is implemented.

- [ ] **Step 3: Create `assets.ts` manifest**

Add fallback materials for each body category and source-aware asset entries:

```ts
export type SolarAssetConfidence = "real-map" | "real-mesh" | "procedural" | "symbolic";

export type SolarAsset = {
  id: string;
  bodyId: string;
  confidence: SolarAssetConfidence;
  fallbackMaterial: "star" | "rocky" | "gas-giant" | "icy" | "comet";
  sourceUrl: string;
  credit: string;
  retrievedAt: string;
  licenseNote: string;
};
```

- [ ] **Step 4: Create `ephemeris.ts`**

Implement a pure function:

```ts
export function getBodyStatesForDate(date: Date): BodyState[] {
  // For Sprint 01, compute simple circular/elliptical educational positions from local orbital elements.
  // The function boundary must allow replacement with JPL Horizons vectors later.
}
```

Expected behavior:

- Sun stays at origin.
- Bodies with `semiMajorAxisKm` orbit their parent approximately.
- Moons orbit their parent position.
- `epochIso` is `date.toISOString()`.
- `source` is `"mvp-orbital-elements"`.

- [ ] **Step 5: Create `firmament.ts`**

Create a compact real-sky dataset for Sprint 01:

- at least 40 bright named stars with RA/Dec/magnitude;
- at least 8 recognizable constellations with line segments;
- at least 6 deep-sky objects including Andromeda/M31, Triangulum/M33, Orion Nebula/M42 and Pleiades/M45;
- every entry must include `sourceIds`.

Do not generate random star positions for production data. If a temporary fallback is used in development, name it explicitly as `DEVELOPMENT_RANDOM_STARS_FALLBACK` and do not render it by default.

- [ ] **Step 6: Create `scales.ts`**

Implement:

```ts
export function scaleDistance(km: number, mode: ScaleDistanceMode): number
export function scaleRadius(km: number, mode: ScaleRadiusMode): number
```

Expected behavior:

- `compressed`: useful default for full Solar System view.
- `real-log`: log scale for large distances.
- `inner-system`: expands inner planets.
- `visible`: all bodies remain selectable.
- `relative`: preserves rough radius ordering without making small bodies invisible.

- [ ] **Step 7: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: no new TypeScript errors from `lib/solar-system/*`.

- [ ] **Step 8: Commit**

```bash
git add lib/solar-system
git commit -m "feat: add solar system data and firmament layer"
```

---

## Task 2: Build WebGL Scene Foundation

**Files:**

- Create: `components/lab/solar-system-scene.tsx`
- Create: `components/lab/firmament-layer.tsx`
- Create: `components/lab/solar-system.css`

- [ ] **Step 1: Create `SolarSystemScene` props**

```ts
export type SolarSystemSceneProps = {
  epoch: Date;
  selectedBodyId: string;
  distanceMode: ScaleDistanceMode;
  radiusMode: ScaleRadiusMode;
  onSelectBody: (id: string) => void;
  labelsVisible: boolean;
  constellationsVisible: boolean;
  deepSkyVisible: boolean;
};
```

- [ ] **Step 2: Implement scene canvas**

Use:

- `Canvas` from `@react-three/fiber`;
- `OrbitControls` from `@react-three/drei`;
- `EffectComposer` and `Bloom` from `@react-three/postprocessing`;
- `InstancedMesh` or mapped meshes only for the small MVP body count.

The scene must render:

- real catalog stars from `firmament.ts`;
- constellation lines and labels when enabled;
- selected deep-sky object markers for galaxies/nebulae/clusters;
- Sun emissive sphere;
- body spheres;
- orbit rings for bodies with `semiMajorAxisKm`;
- labels for selected body and major planets;
- click selection.

- [ ] **Step 3: Implement `FirmamentLayer`**

`FirmamentLayer` must:

- convert RA/Dec to a unit sphere position;
- use star magnitude to vary point size/opacity;
- use color index or a simple temperature approximation for color when available;
- render constellation lines from `ConstellationLine`;
- render selected deep-sky object markers;
- expose props for `constellationsVisible`, `deepSkyVisible` and `labelsVisible`.

Do not use Drei `Stars` as the production background. It may remain only as a temporary development fallback if clearly named and disabled by default.

- [ ] **Step 4: Add accessible loading state**

Use a simple text loading fallback from the parent dynamic import:

```tsx
<div className="solar-loading">...</div>
```

- [ ] **Step 5: Add CSS foundation**

Create independent classes:

- `.solar-root`
- `.solar-toolbar`
- `.solar-canvas-wrap`
- `.solar-inspector`
- `.solar-browser`
- `.solar-control`
- `.solar-kofi`
- `.solar-loading`
- `.solar-firmament-label`
- `.solar-deep-sky-label`

The visual direction should be technical observatory: dark, precise, high-contrast, not a marketing hero.

- [ ] **Step 6: Run typecheck**

```bash
pnpm typecheck
```

Expected: scene compiles without JSX/Three type errors.

- [ ] **Step 7: Commit**

```bash
git add components/lab/solar-system-scene.tsx components/lab/firmament-layer.tsx components/lab/solar-system.css
git commit -m "feat: add solar system WebGL scene and real firmament"
```

---

## Task 3: Build Main Interactive View

**Files:**

- Create: `components/lab/solar-system-view.tsx`
- Create: `lib/solar-system/i18n.ts`

- [ ] **Step 1: Add i18n structure**

Create copy for:

- title/subtitle;
- date controls;
- scale controls;
- body categories;
- inspector labels;
- source/epoch labels;
- asset confidence labels;
- firmament labels and toggles;
- constellation/deep-sky source labels;
- Ko-fi support labels.

Use:

```ts
export type SolarLocale = "it" | "en";

export const SOLAR_UI = {
  it: {
    title: "Sistema Solare",
    subtitle: "Osservatorio 3D con dati aperti e fonti dichiarate",
    support: "Supporta su Ko-fi",
  },
  en: {
    title: "Solar System",
    subtitle: "3D observatory with open data and cited sources",
    support: "Support on Ko-fi",
  },
} as const;
```

- [ ] **Step 2: Create dynamic scene import**

In `solar-system-view.tsx`, dynamically import the scene with `ssr: false`.

- [ ] **Step 3: Add state**

Include:

- selected body;
- epoch date;
- play/pause;
- speed multiplier;
- distance mode;
- radius mode;
- category filter;
- labels visible.
- constellations visible;
- deep-sky objects visible.

- [ ] **Step 4: Add toolbar**

Required controls:

- now button;
- date input;
- play/pause;
- speed selector;
- distance mode selector;
- radius mode selector;
- label toggle;
- constellation toggle;
- galaxies/deep-sky toggle;
- Ko-fi link.

Ko-fi URL:

```ts
const KOFI_URL = "https://ko-fi.com/fosforonero";
```

- [ ] **Step 5: Add object browser**

Show grouped body buttons by category. Selection updates the inspector and scene.

- [ ] **Step 6: Add inspector**

Show:

- localized body name;
- category;
- parent;
- radius;
- mass when available;
- current epoch;
- source labels;
- asset confidence;
- firmament source summary;
- link to about/sources page;
- Ko-fi compact support link.

- [ ] **Step 7: Run typecheck**

```bash
pnpm typecheck
```

Expected: no new type errors from view/i18n.

- [ ] **Step 8: Commit**

```bash
git add components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "feat: add solar system interactive view"
```

---

## Task 4: Add App Routes With SEO And JSON-LD

**Files:**

- Create: `app/lab/sistema-solare/page.tsx`
- Create: `app/en/lab/solar-system/page.tsx`

- [ ] **Step 1: Create Italian route**

Add:

- metadata title;
- description;
- canonical;
- hreflang alternates;
- Open Graph;
- Twitter card;
- robots index/follow;
- JSON-LD `WebApplication` and `BreadcrumbList`;
- import `components/lab/solar-system.css`;
- render `<SolarSystemView locale="it" />`.

- [ ] **Step 2: Create English route**

Same as Italian route, localized:

- canonical `/en/lab/solar-system`;
- alternate to `/lab/sistema-solare`;
- render `<SolarSystemView locale="en" />`.

- [ ] **Step 3: Run build-level route check**

```bash
pnpm typecheck
```

Expected: routes compile.

- [ ] **Step 4: Commit**

```bash
git add app/lab/sistema-solare/page.tsx app/en/lab/solar-system/page.tsx
git commit -m "feat: add solar system lab routes"
```

---

## Task 5: Add Manual Pages

**Files:**

- Create: `components/lab/solar-system-manual-view.tsx`
- Create: `app/lab/sistema-solare/manuale/page.tsx`
- Create: `app/en/lab/solar-system/manual/page.tsx`

- [ ] **Step 1: Implement manual content**

Manual sections must include:

1. Overview.
2. Navigation.
3. Time controls.
4. Scale modes.
5. Body categories.
6. Inspector fields.
7. Visual confidence labels.
8. Firmament layer: catalog stars, constellations, galaxies/deep-sky objects and source limitations.
9. Sandbox roadmap.
10. Mobile/performance.
11. FAQ with at least 5 questions.

- [ ] **Step 2: Add manual view layout**

Follow the periodic table manual pattern:

- top nav back to app;
- link to about;
- hero;
- table of contents;
- sections;
- FAQ grid;
- optional Ko-fi CTA.

- [ ] **Step 3: Add metadata and JSON-LD**

Both manual routes require:

- `WebPage`;
- `HowTo`;
- `FAQPage`;
- `BreadcrumbList`;
- canonical/hreflang alternates.

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

Expected: manual routes compile.

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-manual-view.tsx app/lab/sistema-solare/manuale/page.tsx app/en/lab/solar-system/manual/page.tsx
git commit -m "feat: add solar system manual pages"
```

---

## Task 6: Add About/Sources Pages

**Files:**

- Create: `components/lab/solar-system-about-view.tsx`
- Create: `app/lab/sistema-solare/about/page.tsx`
- Create: `app/en/lab/solar-system/about/page.tsx`

- [ ] **Step 1: Implement about content**

Required sections:

- Hero: project purpose as a technical portfolio lab.
- Technical stack.
- Scientific data sources.
- Texture and 3D asset sources.
- Sky catalog sources: Gaia/Hipparcos, Stellarium sky cultures, OpenNGC/Messier references if used.
- Open data/license notes.
- Scientific limitations.
- Performance strategy.
- Roadmap.
- Support/donations.
- Other Fosforonero projects.

- [ ] **Step 2: Add source rendering**

Render links from `SOLAR_SOURCES`. Only show sources actually referenced by the MVP.

- [ ] **Step 3: Add Ko-fi support block**

Use the same URL:

```txt
https://ko-fi.com/fosforonero
```

IT label: `Supporta su Ko-fi`  
EN label: `Support on Ko-fi`

- [ ] **Step 4: Add metadata and JSON-LD**

Both about routes require:

- `WebPage`;
- `BreadcrumbList`;
- canonical/hreflang alternates.

- [ ] **Step 5: Run typecheck**

```bash
pnpm typecheck
```

Expected: about routes compile.

- [ ] **Step 6: Commit**

```bash
git add components/lab/solar-system-about-view.tsx app/lab/sistema-solare/about/page.tsx app/en/lab/solar-system/about/page.tsx
git commit -m "feat: add solar system about pages"
```

---

## Task 7: Add Sitemap Entries And Optional Project Listing

**Files:**

- Modify: `app/sitemap.ts`
- Optional modify: `lib/projects.ts`

- [ ] **Step 1: Add sitemap entries**

Add all six routes:

- `/lab/sistema-solare`
- `/en/lab/solar-system`
- `/lab/sistema-solare/manuale`
- `/en/lab/solar-system/manual`
- `/lab/sistema-solare/about`
- `/en/lab/solar-system/about`

Each route should include reciprocal language alternates.

- [ ] **Step 2: Decide project listing**

If exposing the MVP from the portfolio grid, add a `solar-system` entry to `lib/projects.ts`. If not ready for public home links, skip this step and leave the lab reachable by direct URL/sitemap only.

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: sitemap compiles.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts lib/projects.ts
git commit -m "feat: register solar system routes"
```

If `lib/projects.ts` was not modified:

```bash
git add app/sitemap.ts
git commit -m "feat: add solar system sitemap entries"
```

---

## Task 8: Final Verification

**Files:**

- No planned edits unless verification reveals issues.

- [ ] **Step 1: Typecheck**

```bash
pnpm typecheck
```

Expected: exit 0.

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 3: Start dev server**

```bash
pnpm dev
```

Expected: local Next dev server starts.

- [ ] **Step 4: Browser smoke test**

Open:

- `http://localhost:3000/lab/sistema-solare`
- `http://localhost:3000/en/lab/solar-system`
- `http://localhost:3000/lab/sistema-solare/manuale`
- `http://localhost:3000/en/lab/solar-system/manual`
- `http://localhost:3000/lab/sistema-solare/about`
- `http://localhost:3000/en/lab/solar-system/about`

Verify:

- WebGL canvas is non-blank;
- sky background is rendered from `firmament.ts`, not random Drei `Stars`;
- constellation and deep-sky toggles work;
- body selection updates inspector;
- date controls change displayed epoch;
- scale controls affect rendering;
- Ko-fi links open externally;
- manual/about pages have no placeholder content;
- source links are real;
- about/manual cite sky catalog sources used by the firmament layer;
- mobile viewport does not overlap controls/text.

- [ ] **Step 5: SEO smoke test**

Inspect page source or rendered DOM for:

- canonical;
- hreflang alternates;
- Open Graph tags;
- JSON-LD scripts;
- sitemap entries.

- [ ] **Step 6: Commit fixes**

If verification required fixes:

```bash
git add <changed-files>
git commit -m "fix: polish solar system MVP verification issues"
```

---

## Acceptance Criteria

Sprint 01 is complete only when:

- all six routes exist;
- app routes render a working 3D Solar System scene;
- app routes render a real firmament layer with catalog stars, constellation lines and selected deep-sky objects;
- manual/about pages exist in Italian and English with real content;
- source citations are present and tied to open/public data;
- Ko-fi support appears in the app/about/manual flow;
- sitemap includes all routes;
- metadata and JSON-LD exist;
- `pnpm typecheck` passes;
- `pnpm build` passes;
- desktop and mobile smoke tests have been performed.

## Next Sprint Preview

Sprint 02 should focus on real data integration:

- server-side Horizons query/cache route;
- snapshot generation for curated bodies;
- better orbit trails from sampled vectors;
- larger preprocessed sky catalog with magnitude thresholds and localized constellation names;
- first texture ingestion from NASA/JPL/USGS with manifest records;
- optional blog article announcing the technical lab.
