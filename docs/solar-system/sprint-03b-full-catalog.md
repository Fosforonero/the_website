# Sprint 03B — Full Catalog Architecture

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Prerequisite:** Sprint 03A must be complete and all its acceptance criteria must pass before starting 03B.

**Goal:** Implement the progressive catalog infrastructure that allows all known Solar System objects to be browsed and rendered, using JPL SBDB for bulk small-body data, JPL Horizons for precision vectors on selected bodies, Three.js `Points`/`InstancedMesh` for scalable rendering, and a search-first UX. CelesTrak/SGP4 artificial satellites are explicitly Sprint 04.

**Architecture:** Static pre-generated SBDB snapshots in `public/lab/solar-system/catalog/` power instant CatalogLayer load. A Next.js API proxy enables live SBDB search and on-demand Horizons vectors for user-selected bodies. The Three.js scene gains one `Points` object per active catalog category (never individual meshes). The physical realism foundation from 03A (reference frames, data quality labels, scale disclaimers) is reused directly.

**Tech Stack:** Next.js App Router, TypeScript, React Three Fiber, Three.js, JPL SBDB Query API, JPL Horizons API, tsx scripts, Keplerian solver (Sprint 02).

---

## Catalog Scope

| Category | Source | Target count | Rendering |
|----------|--------|-------------|-----------|
| Near-Earth Objects (NEO) | SBDB `sb-group=neo` | ~35 000 | `THREE.Points` |
| Main Belt asteroids top-5000 | SBDB `sb-group=mba` sorted by H | 5 000 | `THREE.Points` |
| Comets | SBDB `sb-kind=c` | ~4 000 | `THREE.Points` |
| Trans-Neptunian Objects (TNO) | SBDB `sb-group=tno` | ~4 000 | `THREE.Points` |
| Centaurs | SBDB `sb-class=Cen` | ~700 | `THREE.Points` |
| Spacecraft | Horizons (selected) | future | individual mesh |
| Artificial satellites | CelesTrak/SGP4 | Sprint 04 | InstancedMesh |

---

## Architecture Decisions (03B specific)

### 1. CatalogLayer and scale consistency

The `CatalogLayer` must respect the **same scale mode system** introduced in 03A. When the user is in `real-log` distance mode, catalog object positions must use the same `scaleDistance()` function as MVP bodies. When `visible` radius mode is active, catalog objects are rendered as fixed-size points (their physical radius is not large enough for the visible mode to matter — they are always at the minimum marker size).

The data quality label for all SBDB catalog objects is `"catalog-keplerian"` (from `lib/solar-system/data-quality.ts` introduced in 03A). This must appear in the inspector when a catalog body is selected.

### 2. Position recompute throttle

Computing positions for 35 000 NEOs on every RAF frame would be slow. Strategy:
- Compute on load (once per chunk)
- Recompute on epoch change **only if the layer is visible** and epoch has advanced **> 1 simulated day** since last compute
- Use a `useRef` for `lastComputedEpoch`
- Recomputation runs in the main thread but is gated; for Sprint 03B this is acceptable since it is a one-time cost per "play" tick that crosses the 1-day threshold

### 3. Horizons on-demand vector for selected catalog body

When the user selects a body from the catalog search (not a curated MVP body), the inspector fires a fetch to `/api/solar/horizons?id=<spkid>&date=<iso>`. The server returns the Cartesian vector. The scene temporarily places a distinct "precision marker" sphere at the Horizons position alongside the `Points` layer. This makes the Horizons precision improvement visible.

The precision marker sphere uses a different visual style from MVP bodies (dashed ring, "live" badge in inspector) and is removed when the user deselects the body.

### 4. Search integration with reference frame

Search results from SBDB include orbital elements. The client computes a Keplerian position from those elements (same solver as the catalog layer) and flies the camera to that body. This is consistent with 03A's reference frame documentation.

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `lib/solar-system/catalog.ts` | `CatalogEntry`, `CatalogCategory`, `CatalogMeta`, `decodeCatalogChunk()` |
| `lib/solar-system/catalog-filter.ts` | Pure filter functions, `catalogCategoryLabel()` |
| `app/api/solar/catalog/search/route.ts` | SBDB live search proxy |
| `app/api/solar/horizons/route.ts` | Horizons vector proxy (1h cache) |
| `scripts/solar-system/fetch-catalog.ts` | SBDB snapshot fetch script |
| `components/lab/solar-system-catalog-layer.tsx` | Three.js `Points` per catalog category |
| `components/lab/solar-system-search.tsx` | Search bar with SBDB autocomplete |

### Generated static assets

| File | Contents |
|------|----------|
| `public/lab/solar-system/catalog/manifest.json` | Retrieval dates, counts, source URLs |
| `public/lab/solar-system/catalog/neo.json` | All NEOs with orbital elements |
| `public/lab/solar-system/catalog/mba-top5000.json` | Top 5 000 MBA by H magnitude |
| `public/lab/solar-system/catalog/comets.json` | All comets |
| `public/lab/solar-system/catalog/tnos.json` | All TNOs |
| `public/lab/solar-system/catalog/centaurs.json` | All Centaurs |

### Modified files

| File | Change |
|------|--------|
| `lib/solar-system/bodies.ts` | Add `"centaur"` and `"spacecraft"` to `SolarBodyCategory` |
| `lib/solar-system/i18n.ts` | Catalog UI strings, search placeholder, data quality labels |
| `components/lab/solar-system-scene.tsx` | Mount `CatalogLayer` components |
| `components/lab/solar-system-view.tsx` | Catalog layer state, toggles, search, Horizons integration |
| `components/lab/solar-system.css` | Search dropdown styles |
| `components/lab/solar-system-about-view.tsx` | SBDB sources, snapshot date, catalog coverage |
| `components/lab/solar-system-manual-view.tsx` | Catalog layer documentation |
| `scripts/solar-system/audit-orbits.ts` | Catalog chunk validation |
| `package.json` | Add `solar:fetch-catalog` script |

---

## Task 1: Catalog Data Model

**Files:**
- Modify: `lib/solar-system/bodies.ts`
- Create: `lib/solar-system/catalog.ts`
- Create: `lib/solar-system/catalog-filter.ts`

- [ ] **Step 1: Add `centaur` and `spacecraft` to `SolarBodyCategory`**

In `bodies.ts`, extend `SolarBodyCategory`:
```ts
export type SolarBodyCategory =
  | "star" | "planet" | "dwarf-planet" | "moon"
  | "asteroid" | "comet" | "tno"
  | "centaur"       // Centaur objects (between Jupiter and Neptune)
  | "spacecraft";   // Spacecraft with public ephemerides
```

Update `CATEGORY_BASE` and `CATEGORY_MIN` in `scales.ts` to include the new categories:
```ts
const CATEGORY_BASE: Record<SolarBodyCategory, number> = {
  // ... existing ...
  centaur: 0.015,
  spacecraft: 0.010,
};
const CATEGORY_MIN: Record<SolarBodyCategory, number> = {
  // ... existing ...
  centaur: 0.008,
  spacecraft: 0.007,
};
```

- [ ] **Step 2: Create `lib/solar-system/catalog.ts`**

```ts
/**
 * Catalog data model for SBDB-sourced Solar System small bodies.
 * These objects are NOT in the curated SOLAR_BODIES array.
 * Rendered as Points layers, not individual meshes.
 */

export type CatalogCategory =
  | "asteroid-neo"     // Near-Earth Objects (including PHAs)
  | "asteroid-mba"     // Main Belt Asteroids
  | "asteroid-other"   // Other asteroid classes
  | "comet"
  | "tno"
  | "centaur";

export type CatalogMeta = {
  source: "JPL SBDB Query API";
  url: string;
  retrievedAt: string;     // ISO date "YYYY-MM-DD"
  category: CatalogCategory;
  count: number;
  fields: string[];
};

export type CatalogEntry = {
  id: string;                       // SPK-ID from SBDB
  name: string;
  category: CatalogCategory;
  semiMajorAxisAu: number;          // a (AU)
  eccentricity: number;             // e
  inclinationDeg: number;           // i (deg)
  longitudeAscNodeDeg: number;      // om / Ω (deg)
  argPeriapsisDeg: number;          // w / ω (deg)
  meanAnomalyDeg: number;           // ma / M₀ at epoch (deg)
  epochJd: number;                  // reference epoch (JD)
  periodDays: number;               // per (days)
  diameterKm: number | null;        // d — null if unknown
  absoluteMagnitude: number | null; // H — null if unavailable
  isNEO: boolean;
  isPHA: boolean;
};

export type CatalogChunk = {
  meta: CatalogMeta;
  entries: CatalogEntry[];
};

// SBDB field order in the compact array-of-arrays format
const SBDB_FIELDS = [
  "id", "name", "a", "e", "i", "om", "w", "ma", "epoch_mjd",
  "per", "d", "H", "class", "neo", "pha",
] as const;
type F = typeof SBDB_FIELDS;
type RawRow = [
  string,        // id
  string,        // name
  number,        // a (AU)
  number,        // e
  number,        // i
  number,        // om
  number,        // w
  number,        // ma
  number,        // epoch_mjd
  number,        // per
  number | null, // d
  number | null, // H
  string,        // class
  boolean,       // neo
  boolean,       // pha
];

function classToCategory(cls: string, neo: boolean): CatalogCategory {
  if (neo) return "asteroid-neo";
  const c = cls.toUpperCase();
  if (c === "MBA" || c.startsWith("MB")) return "asteroid-mba";
  if (c === "TNO" || c === "KBO" || c === "SDO" || c === "DO" || c === "DET") return "tno";
  if (c === "CEN") return "centaur";
  if (c === "JFC" || c === "HTC" || c === "ETC" || c === "OCC" || c === "HYP" || c === "PAR") return "comet";
  return "asteroid-other";
}

/**
 * Decode a raw SBDB JSON chunk (array-of-arrays) into typed CatalogEntry[].
 * Call on the client after fetching the static JSON snapshot.
 */
export function decodeCatalogChunk(raw: {
  meta: Omit<CatalogMeta, "fields"> & { fields: string[] };
  data: unknown[][];
}): CatalogChunk {
  const entries: CatalogEntry[] = raw.data.map((row) => {
    const r = row as RawRow;
    return {
      id: String(r[0]),
      name: String(r[1]).trim(),
      category: classToCategory(String(r[12]), Boolean(r[13])),
      semiMajorAxisAu: Number(r[2]),
      eccentricity: Number(r[3]),
      inclinationDeg: Number(r[4]),
      longitudeAscNodeDeg: Number(r[5]),
      argPeriapsisDeg: Number(r[6]),
      meanAnomalyDeg: Number(r[7]),
      epochJd: Number(r[8]) + 2_400_000.5,  // MJD → JD
      periodDays: Number(r[9]),
      diameterKm: r[10] != null ? Number(r[10]) : null,
      absoluteMagnitude: r[11] != null ? Number(r[11]) : null,
      isNEO: Boolean(r[13]),
      isPHA: Boolean(r[14]),
    };
  });
  return { meta: raw.meta as CatalogMeta, entries };
}

void SBDB_FIELDS; // suppress unused
void (0 as unknown as F); // suppress unused
```

- [ ] **Step 3: Create `lib/solar-system/catalog-filter.ts`**

```ts
import type { CatalogEntry, CatalogCategory } from "./catalog";

export type CatalogFilterOptions = {
  categories?: Set<CatalogCategory>;
  minDiameterKm?: number;
  maxDiameterKm?: number;
  neoOnly?: boolean;
  phaOnly?: boolean;
  maxInclinationDeg?: number;
  maxEccentricity?: number;
  maxSemiMajorAxisAu?: number;
};

export function filterCatalog(entries: CatalogEntry[], opts: CatalogFilterOptions): CatalogEntry[] {
  return entries.filter((e) => {
    if (opts.categories && !opts.categories.has(e.category)) return false;
    if (opts.neoOnly && !e.isNEO) return false;
    if (opts.phaOnly && !e.isPHA) return false;
    if (opts.minDiameterKm != null && (e.diameterKm == null || e.diameterKm < opts.minDiameterKm)) return false;
    if (opts.maxDiameterKm != null && e.diameterKm != null && e.diameterKm > opts.maxDiameterKm) return false;
    if (opts.maxInclinationDeg != null && e.inclinationDeg > opts.maxInclinationDeg) return false;
    if (opts.maxEccentricity != null && e.eccentricity > opts.maxEccentricity) return false;
    if (opts.maxSemiMajorAxisAu != null && e.semiMajorAxisAu > opts.maxSemiMajorAxisAu) return false;
    return true;
  });
}

export function catalogCategoryLabel(cat: CatalogCategory, locale: "it" | "en"): string {
  const LABELS: Record<CatalogCategory, { it: string; en: string }> = {
    "asteroid-neo": { it: "Asteroidi NEO", en: "Near-Earth Objects" },
    "asteroid-mba": { it: "Fascia principale", en: "Main Belt" },
    "asteroid-other": { it: "Altri asteroidi", en: "Other Asteroids" },
    comet: { it: "Comete", en: "Comets" },
    tno: { it: "Oggetti trans-nettuniani", en: "Trans-Neptunian Objects" },
    centaur: { it: "Centauri", en: "Centaurs" },
  };
  return LABELS[cat][locale];
}
```

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add lib/solar-system/bodies.ts lib/solar-system/scales.ts lib/solar-system/catalog.ts lib/solar-system/catalog-filter.ts
git commit -m "feat(solar-system): catalog data model and filter utilities"
```

---

## Task 2: SBDB Catalog Fetch Script

**Files:**
- Create: `scripts/solar-system/fetch-catalog.ts`
- Modify: `package.json`

- [ ] **Step 1: Create output directory**

```bash
mkdir -p public/lab/solar-system/catalog
```

- [ ] **Step 2: Create `scripts/solar-system/fetch-catalog.ts`**

```ts
/**
 * Fetch Solar System catalog snapshots from JPL SBDB Query API.
 * Run: pnpm solar:fetch-catalog
 * Requires internet access. Writes to public/lab/solar-system/catalog/.
 * Courtesy: 1 request/second.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public/lab/solar-system/catalog");
const BASE_URL = "https://ssd-api.jpl.nasa.gov/sbdb_query.api";
const FIELDS = "spkid,full_name,a,e,i,om,w,ma,epoch_mjd,per,diameter,H,class,neo,pha";
const TODAY = new Date().toISOString().slice(0, 10);

type FetchJob = {
  filename: string;
  category: string;
  params: Record<string, string>;
  limit?: number;
};

const JOBS: FetchJob[] = [
  {
    filename: "neo.json",
    category: "asteroid-neo",
    params: { "sb-group": "neo", "sb-kind": "a", "fullname": "true" },
    limit: 40_000,
  },
  {
    filename: "mba-top5000.json",
    category: "asteroid-mba",
    params: { "sb-group": "mba", "sb-kind": "a", "fullname": "true", "sort": "H", "dir": "ASC" },
    limit: 5_000,
  },
  {
    filename: "comets.json",
    category: "comet",
    params: { "sb-kind": "c", "fullname": "true" },
  },
  {
    filename: "tnos.json",
    category: "tno",
    params: { "sb-group": "tno", "sb-kind": "a", "fullname": "true" },
  },
  {
    filename: "centaurs.json",
    category: "centaur",
    params: { "sb-class": "Cen", "sb-kind": "a", "fullname": "true" },
  },
];

async function fetchChunk(job: FetchJob): Promise<number> {
  const params = new URLSearchParams({
    ...job.params,
    fields: FIELDS,
    ...(job.limit ? { limit: String(job.limit) } : {}),
  });

  const url = `${BASE_URL}?${params}`;
  console.log(`Fetching ${job.filename} …`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)",
    },
  });

  if (!res.ok) throw new Error(`SBDB ${res.status} for ${job.filename}: ${await res.text()}`);

  const raw = (await res.json()) as { fields: string[]; data: unknown[][] };
  if (!raw.fields || !raw.data) throw new Error(`Unexpected SBDB shape for ${job.filename}`);

  const out = {
    meta: {
      source: "JPL SBDB Query API",
      url: BASE_URL,
      retrievedAt: TODAY,
      category: job.category,
      count: raw.data.length,
      fields: raw.fields,
    },
    data: raw.data,
  };

  writeFileSync(join(OUT_DIR, job.filename), JSON.stringify(out), "utf-8");
  const kb = Math.round(JSON.stringify(out).length / 1024);
  console.log(`  → ${raw.data.length} entries, ${kb} kB`);
  return raw.data.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const results: Array<{ filename: string; category: string; count: number }> = [];

  for (const job of JOBS) {
    const count = await fetchChunk(job);
    results.push({ filename: job.filename, category: job.category, count });
    await new Promise((r) => setTimeout(r, 1100)); // courtesy delay
  }

  const manifest = {
    retrievedAt: TODAY,
    source: "JPL SBDB Query API",
    sourceUrl: "https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html",
    chunks: results,
    disclaimer:
      "Positions computed from SBDB Keplerian orbital elements (HEC-J2000 frame). Not live JPL Horizons vectors. Accuracy: educational-keplerian.",
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  console.log("Manifest written.");
  console.log("✅ All catalog chunks fetched.");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Add script to `package.json`**

```json
"solar:fetch-catalog": "tsx scripts/solar-system/fetch-catalog.ts"
```

- [ ] **Step 4: Run script (requires internet)**

```bash
pnpm solar:fetch-catalog
```

Expected: 5 JSON files + `manifest.json` in `public/lab/solar-system/catalog/`.

- [ ] **Step 5: Verify + typecheck**

```bash
ls -lh public/lab/solar-system/catalog/
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add scripts/solar-system/fetch-catalog.ts package.json public/lab/solar-system/catalog/
git commit -m "feat(solar-system): SBDB catalog fetch script and static snapshots"
```

---

## Task 3: API Routes — SBDB Search and Horizons

**Files:**
- Create: `app/api/solar/catalog/search/route.ts`
- Create: `app/api/solar/horizons/route.ts`

- [ ] **Step 1: Create SBDB search route**

Create `app/api/solar/catalog/search/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "10"), 20);

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "q must be ≥ 2 chars" }, { status: 400 });
  }

  const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(q)}&mb=-1&moid=1&neo=1&pha=1&nv=1&limit=${limit}&full-prec=0`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)" },
  });

  if (!res.ok) return NextResponse.json({ error: `SBDB ${res.status}` }, { status: 502 });

  type SbdbObj = { spkid?: string; full_name?: string; neo?: string; pha?: string; class?: string };
  const raw = await res.json() as { list?: SbdbObj[]; object?: SbdbObj; error?: string };

  if (raw.error) return NextResponse.json({ error: raw.error }, { status: 422 });

  const objects: SbdbObj[] = Array.isArray(raw.list) ? raw.list : raw.object ? [raw.object] : [];

  const results = objects.slice(0, limit).map((o) => ({
    id: o.spkid ?? "",
    name: (o.full_name ?? "").trim(),
    isNEO: o.neo === "Y",
    isPHA: o.pha === "Y",
    sbdbClass: o.class ?? "",
  }));

  return NextResponse.json({ results, source: "jpl-sbdb", dataQuality: "catalog-keplerian" });
}
```

- [ ] **Step 2: Create Horizons vector route**

Create `app/api/solar/horizons/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const date = req.nextUrl.searchParams.get("date");

  if (!id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "id and date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const stopDate = new Date(date);
  stopDate.setDate(stopDate.getDate() + 1);
  const stop = stopDate.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    format: "json",
    COMMAND: `'${id}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "500@10",
    START_TIME: date,
    STOP_TIME: stop,
    STEP_SIZE: "1d",
    OUT_UNITS: "KM-S",
    VEC_TABLE: "2",
    REF_PLANE: "ECLIP",
    REF_SYSTEM: "J2000",
  });

  const res = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${params}`, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)" },
  });

  if (!res.ok) return NextResponse.json({ error: `Horizons ${res.status}` }, { status: 502 });

  const raw = await res.json() as { result?: string; error?: string };
  if (raw.error) return NextResponse.json({ error: raw.error }, { status: 422 });

  const text = raw.result ?? "";
  const soe = text.indexOf("$$SOE");
  const eoe = text.indexOf("$$EOE");
  if (soe === -1 || eoe === -1) {
    return NextResponse.json({ error: "Cannot parse Horizons output" }, { status: 502 });
  }

  const block = text.slice(soe + 5, eoe);
  const val = (label: string) => {
    const m = new RegExp(`${label}\\s*=\\s*([\\-+]?[0-9.E+\\-]+)`).exec(block);
    return m ? parseFloat(m[1]) : 0;
  };

  return NextResponse.json({
    id,
    date,
    positionKm: [val("X"), val("Y"), val("Z")] as [number, number, number],
    velocityKmS: [val("VX"), val("VY"), val("VZ")] as [number, number, number],
    referenceFrame: "HEC-J2000",
    source: "jpl-horizons",
    dataQuality: "sub-km",
    epochIso: `${date}T00:00:00Z`,
    cachedAt: new Date().toISOString(),
  });
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/solar/catalog/search/route.ts app/api/solar/horizons/route.ts
git commit -m "feat(solar-system): SBDB search and Horizons vector API routes"
```

---

## Task 4: CatalogLayer Three.js Component

**Files:**
- Create: `components/lab/solar-system-catalog-layer.tsx`

This component uses `THREE.Points` and computes positions with the Sprint 02 Keplerian solver embedded locally (no import from the server-only ephemeris.ts).

- [ ] **Step 1: Create `components/lab/solar-system-catalog-layer.tsx`**

```tsx
"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { CatalogEntry, CatalogCategory } from "@/lib/solar-system/catalog";
import type { ScaleDistanceMode } from "@/lib/solar-system/bodies";
import { scaleDistance, AU_KM } from "@/lib/solar-system/scales";

// Category colours (consistent with governance.md colour scheme)
const CATEGORY_COLOR: Record<CatalogCategory, THREE.Color> = {
  "asteroid-neo":   new THREE.Color("#ff6b35"),
  "asteroid-mba":   new THREE.Color("#8a9ba8"),
  "asteroid-other": new THREE.Color("#6b7c8a"),
  comet:            new THREE.Color("#a8d8f0"),
  tno:              new THREE.Color("#c8a8d8"),
  centaur:          new THREE.Color("#d8c8a8"),
};

// Inline Keplerian solver — avoids importing server-only ephemeris module
const J2000_JD = 2_451_545.0;
const UNIX_EPOCH_JD = 2_440_587.5;
const TWO_PI = 2 * Math.PI;

function solveKeplerCatalog(M: number, e: number): number {
  const Mn = ((M % TWO_PI) + TWO_PI) % TWO_PI;
  let E = e > 0.8 ? Math.PI : Mn;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

function computePositionAu(
  aAu: number, e: number, iDeg: number,
  OmegaDeg: number, omegaDeg: number, M: number
): [number, number, number] {
  const E = solveKeplerCatalog(M, e);
  const cosE = Math.cos(E), sinE = Math.sin(E);
  const oneMecosE = 1 - e * cosE;
  const r = aAu * oneMecosE;
  const cosNu = (cosE - e) / oneMecosE;
  const sinNu = (Math.sqrt(Math.max(0, 1 - e * e)) * sinE) / oneMecosE;
  const nu = Math.atan2(sinNu, cosNu);
  const opn = (omegaDeg * Math.PI) / 180 + nu;
  const iR = (iDeg * Math.PI) / 180;
  const OR = (OmegaDeg * Math.PI) / 180;
  const cO = Math.cos(OR), sO = Math.sin(OR), cI = Math.cos(iR), sI = Math.sin(iR);
  const cN = Math.cos(opn), sN = Math.sin(opn);
  return [
    r * (cO * cN - sO * sN * cI),
    r * (sO * cN + cO * sN * cI),
    r * sN * sI,
  ];
}

export type CatalogLayerProps = {
  entries: CatalogEntry[];
  category: CatalogCategory;
  epoch: Date;
  distanceMode: ScaleDistanceMode;
  visible: boolean;
};

export function CatalogLayer({ entries, category, epoch, distanceMode, visible }: CatalogLayerProps) {
  const lastComputedEpochRef = useRef<number>(0);
  const cachedPositionsRef = useRef<Float32Array>(new Float32Array(0));

  const color = CATEGORY_COLOR[category] ?? new THREE.Color(1, 1, 1);

  const positions = useMemo(() => {
    const epochMs = epoch.getTime();
    const jd = epochMs / 86_400_000 + UNIX_EPOCH_JD;

    // Throttle: only recompute if epoch changed by more than 1 day
    if (
      cachedPositionsRef.current.length > 0 &&
      Math.abs(epochMs - lastComputedEpochRef.current) < 86_400_000
    ) {
      return cachedPositionsRef.current;
    }

    const buf = new Float32Array(entries.length * 3);
    let n = 0;

    for (const e of entries) {
      if (e.eccentricity >= 1.0 || e.semiMajorAxisAu <= 0 || e.periodDays <= 0) continue;

      const M0 = (e.meanAnomalyDeg * Math.PI) / 180;
      const meanMotion = TWO_PI / e.periodDays;
      const daysSinceEpoch = jd - e.epochJd;
      const M = ((M0 + meanMotion * daysSinceEpoch) % TWO_PI + TWO_PI) % TWO_PI;

      const [xAu, yAu, zAu] = computePositionAu(
        e.semiMajorAxisAu, e.eccentricity, e.inclinationDeg,
        e.longitudeAscNodeDeg, e.argPeriapsisDeg, M
      );

      if (distanceMode === "compressed") {
        buf[n * 3]     = xAu;
        buf[n * 3 + 1] = yAu;
        buf[n * 3 + 2] = zAu;
      } else {
        const xKm = xAu * AU_KM;
        const yKm = yAu * AU_KM;
        const zKm = zAu * AU_KM;
        const magKm = Math.sqrt(xKm * xKm + yKm * yKm + zKm * zKm);
        if (magKm < 1) { n++; continue; }
        const renderMag = scaleDistance(magKm, distanceMode);
        const f = renderMag / magKm;
        buf[n * 3]     = xKm * f;
        buf[n * 3 + 1] = yKm * f;
        buf[n * 3 + 2] = zKm * f;
      }
      n++;
    }

    const slice = buf.slice(0, n * 3);
    cachedPositionsRef.current = slice;
    lastComputedEpochRef.current = epochMs;
    return slice;
  }, [entries, epoch, distanceMode]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  if (!visible || positions.length === 0) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

void J2000_JD;
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/lab/solar-system-catalog-layer.tsx
git commit -m "feat(solar-system): CatalogLayer Three.js Points renderer with position throttle"
```

---

## Task 5: Scene and View Integration

**Files:**
- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `components/lab/solar-system-view.tsx`

- [ ] **Step 1: Add catalog layer specs type and props to scene**

In `solar-system-scene.tsx`, add import:
```ts
import { CatalogLayer, type CatalogLayerProps } from "./solar-system-catalog-layer";
import type { CatalogCategory } from "@/lib/solar-system/catalog";
```

Add type:
```ts
export type CatalogLayerSpec = {
  category: CatalogCategory;
  entries: import("@/lib/solar-system/catalog").CatalogEntry[];
  visible: boolean;
};
```

Add to `SolarSystemSceneProps`:
```ts
catalogLayers?: CatalogLayerSpec[];
```

In `InnerScene`, after the `{/* Bodies */}` block, add:
```tsx
{/* Catalog layers — Three.js Points, never individual meshes */}
{props.catalogLayers?.map((layer) => (
  <CatalogLayer
    key={`catalog-${layer.category}`}
    entries={layer.entries}
    category={layer.category}
    epoch={epoch}
    distanceMode={distanceMode}
    visible={layer.visible}
  />
))}
```

- [ ] **Step 2: Add catalog state and loader to `solar-system-view.tsx`**

```ts
import type { CatalogCategory } from "@/lib/solar-system/catalog";
import { catalogCategoryLabel } from "@/lib/solar-system/catalog-filter";
import type { CatalogLayerSpec } from "./solar-system-scene";

const CATALOG_FILES: Partial<Record<CatalogCategory, string>> = {
  "asteroid-neo": "neo.json",
  "asteroid-mba": "mba-top5000.json",
  comet:          "comets.json",
  tno:            "tnos.json",
  centaur:        "centaurs.json",
};

const [catalogEntries, setCatalogEntries] = useState<
  Map<CatalogCategory, import("@/lib/solar-system/catalog").CatalogEntry[]>
>(new Map());
const [visibleCatalog, setVisibleCatalog] = useState<Set<CatalogCategory>>(new Set());

async function loadCatalogLayer(cat: CatalogCategory) {
  if (catalogEntries.has(cat)) return;
  const file = CATALOG_FILES[cat];
  if (!file) return;
  try {
    const res = await fetch(`/lab/solar-system/catalog/${file}`);
    if (!res.ok) return;
    const { decodeCatalogChunk } = await import("@/lib/solar-system/catalog");
    const chunk = decodeCatalogChunk(await res.json());
    setCatalogEntries((prev) => new Map(prev).set(cat, chunk.entries));
  } catch (e) {
    console.error("Failed to load catalog layer:", cat, e);
  }
}

function toggleCatalogLayer(cat: CatalogCategory) {
  setVisibleCatalog((prev) => {
    const next = new Set(prev);
    if (next.has(cat)) { next.delete(cat); }
    else { next.add(cat); loadCatalogLayer(cat); }
    return next;
  });
}
```

Build the `catalogLayers` prop:
```ts
const catalogLayerSpecs: CatalogLayerSpec[] = Array.from(catalogEntries.entries()).map(
  ([category, entries]) => ({ category, entries, visible: visibleCatalog.has(category) })
);
```

Pass to scene: `catalogLayers={catalogLayerSpecs}`.

- [ ] **Step 3: Add catalog toggle buttons to toolbar**

```tsx
{/* Catalog layer toggles (desktop only) */}
<div className="solar-toolbar__sep solar-toolbar__hide-sm" />
{(Object.keys(CATALOG_FILES) as CatalogCategory[]).map((cat) => {
  const count = catalogEntries.get(cat)?.length;
  const active = visibleCatalog.has(cat);
  return (
    <button
      key={cat}
      className={`solar-control solar-toolbar__hide-sm${active ? " solar-control--active" : ""}`}
      onClick={() => toggleCatalogLayer(cat)}
    >
      {catalogCategoryLabel(cat, locale)}
      {count !== undefined && ` (${count.toLocaleString()})`}
    </button>
  );
})}
```

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-scene.tsx components/lab/solar-system-view.tsx
git commit -m "feat(solar-system): integrate CatalogLayer into scene with on-demand loading"
```

---

## Task 6: Search Component

**Files:**
- Create: `components/lab/solar-system-search.tsx`
- Modify: `components/lab/solar-system.css`
- Modify: `components/lab/solar-system-view.tsx`

- [ ] **Step 1: Create `components/lab/solar-system-search.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";

export type SearchResult = {
  id: string;
  name: string;
  isNEO: boolean;
  isPHA: boolean;
  sbdbClass: string;
};

type Props = {
  locale: "it" | "en";
  placeholder: string;
  onSelect: (result: SearchResult) => void;
};

export function SolarSystemSearch({ locale, placeholder, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/solar/catalog/search?q=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json() as { results: SearchResult[] };
          setResults(data.results ?? []);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  return (
    <div className="solar-search">
      <input
        type="search"
        className="solar-control solar-search__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => results.length > 0 && setOpen(true)}
        aria-label={placeholder}
      />
      {loading && <span className="solar-search__spinner" aria-hidden>…</span>}
      {open && results.length > 0 && (
        <ul className="solar-search__dropdown" role="listbox">
          {results.map((r) => (
            <li
              key={r.id}
              role="option"
              className="solar-search__option"
              onMouseDown={() => { onSelect(r); setQuery(""); setOpen(false); }}
            >
              <span className="solar-search__name">{r.name}</span>
              {r.isPHA && <span className="solar-search__tag solar-search__tag--pha">PHA</span>}
              {r.isNEO && !r.isPHA && <span className="solar-search__tag solar-search__tag--neo">NEO</span>}
              <span className="solar-search__class">{r.sbdbClass}</span>
            </li>
          ))}
        </ul>
      )}
      {void locale}
    </div>
  );
}
```

- [ ] **Step 2: Add CSS to `components/lab/solar-system.css`**

```css
.solar-search { position: relative; }
.solar-search__input { min-width: 160px; }
.solar-search__spinner { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: #4a7090; pointer-events: none; }
.solar-search__dropdown { position: absolute; top: 100%; left: 0; min-width: 260px; background: #080e18; border: 1px solid #1a3050; border-radius: 4px; list-style: none; margin: 2px 0 0; padding: 4px 0; z-index: 200; max-height: 260px; overflow-y: auto; }
.solar-search__option { display: flex; align-items: center; gap: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.72rem; color: #c0d8f0; }
.solar-search__option:hover { background: #1a3050; }
.solar-search__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.solar-search__tag { font-size: 0.60rem; padding: 1px 4px; border-radius: 2px; font-weight: 600; flex-shrink: 0; }
.solar-search__tag--pha { background: #5a1010; color: #ffc0b0; }
.solar-search__tag--neo { background: #0d3a0d; color: #a0f0a0; }
.solar-search__class { font-size: 0.60rem; color: #4a7090; flex-shrink: 0; }
```

- [ ] **Step 3: Wire search into view**

```ts
import { SolarSystemSearch, type SearchResult } from "./solar-system-search";
```

Add handler:
```ts
function handleSearchSelect(result: SearchResult) {
  // Log to console for Sprint 03B; full Horizons wiring in Task 7
  console.info("Selected catalog body:", result.id, result.name);
}
```

Add to toolbar:
```tsx
<SolarSystemSearch
  locale={locale}
  placeholder={t.searchPlaceholder}
  onSelect={handleSearchSelect}
/>
```

- [ ] **Step 4: Add `searchPlaceholder` to both locales in i18n.ts**

IT: `searchPlaceholder: "Cerca corpo celeste…"`
EN: `searchPlaceholder: "Search catalog…"`

- [ ] **Step 5: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add components/lab/solar-system-search.tsx components/lab/solar-system.css components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "feat(solar-system): catalog search bar with SBDB live autocomplete"
```

---

## Task 7: Horizons On-Demand Inspector Integration

When a search result is selected, fetch its Horizons position and show it in the inspector with a `dataQuality: "sub-km"` badge.

**Files:**
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `components/lab/solar-system-scene.tsx`

- [ ] **Step 1: Add horizons marker state to view**

```ts
type HorizonsMarker = {
  id: string;
  name: string;
  positionKm: [number, number, number];
  velocityKmS: [number, number, number];
  dataQuality: "sub-km";
  epochIso: string;
  referenceFrame: string;
  source: "jpl-horizons";
};

const [horizonsMarker, setHorizonsMarker] = useState<HorizonsMarker | null>(null);
```

Update `handleSearchSelect`:
```ts
async function handleSearchSelect(result: SearchResult) {
  const date = new Date(epoch).toISOString().slice(0, 10);
  try {
    const res = await fetch(`/api/solar/horizons?id=${encodeURIComponent(result.id)}&date=${date}`);
    if (!res.ok) return;
    const data = await res.json() as HorizonsMarker;
    setHorizonsMarker({ ...data, name: result.name });
  } catch (e) {
    console.error("Horizons fetch failed:", e);
  }
}
```

Pass marker to scene: `horizonsMarker={horizonsMarker}`.

- [ ] **Step 2: Add Horizons marker mesh to scene**

Add to `SolarSystemSceneProps`:
```ts
horizonsMarker?: {
  name: string;
  positionKm: [number, number, number];
} | null;
```

In `InnerScene`, after catalog layers:
```tsx
{/* Horizons precision marker for selected catalog body */}
{props.horizonsMarker && (() => {
  const [x, y, z] = scalePositionVector(props.horizonsMarker.positionKm, distanceMode);
  return (
    <group position={[x, y, z]}>
      <mesh scale={0.035}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.055, 32]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html position={[0, 0.07, 0]} occlude={false} style={{ pointerEvents: "none" }}>
        <span className="solar-body-label solar-body-label--selected" style={{ color: "#00ffcc" }}>
          {props.horizonsMarker.name} (Horizons)
        </span>
      </Html>
    </group>
  );
})()}
```

- [ ] **Step 3: Show marker in inspector**

When `horizonsMarker` is set, show a dedicated inspector section:
```tsx
{horizonsMarker && (
  <div className="solar-inspector__row" style={{ flexDirection: "column", gap: 3 }}>
    <span className="solar-inspector__label">{locale === "it" ? "Corpo selezionato (Horizons)" : "Selected body (Horizons)"}</span>
    <span className="solar-inspector__value">{horizonsMarker.name}</span>
    <span style={{ fontSize: "0.60rem", color: "#00ffcc" }}>
      {locale === "it" ? "Precisione: sub-km (JPL Horizons live)" : "Accuracy: sub-km (JPL Horizons live)"}
    </span>
    <span style={{ fontSize: "0.60rem", color: "#4a7090" }}>Frame: {horizonsMarker.referenceFrame}</span>
    <button
      className="solar-control"
      style={{ marginTop: 4, fontSize: "0.65rem" }}
      onClick={() => setHorizonsMarker(null)}
    >
      {locale === "it" ? "Rimuovi marcatore" : "Clear marker"}
    </button>
  </div>
)}
```

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-view.tsx components/lab/solar-system-scene.tsx
git commit -m "feat(solar-system): Horizons on-demand precision marker for searched bodies"
```

---

## Task 8: Documentation and Audit

**Files:**
- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`
- Modify: `scripts/solar-system/audit-orbits.ts`

- [ ] **Step 1: Add catalog section to manual (IT + EN)**

Add section "Livelli catalogo / Catalog layers":

**IT:**
```
Livelli catalogo: il laboratorio carica corpi dal JPL Small-Body Database (SBDB) per asteroidi NEO, fascia principale, comete, TNO e centauri. I toggle nella barra degli strumenti attivano ogni livello. I corpi del catalogo sono renderizzati come punti per supportare decine di migliaia di oggetti senza problemi di performance.

Posizioni catalogo: calcolate da elementi orbitali kepleriani SBDB nel frame HEC-J2000. Non sono vettori live JPL Horizons. La data di snapshot è visibile nell'ispettore quando è attivo un livello catalogo.

Ricerca: la barra di ricerca interroga JPL SBDB in tempo reale. Selezionando un risultato viene richiesta la posizione di precisione a JPL Horizons e visualizzata come marcatore teal (sub-km).

Qualità dei dati catalogo: tutti i corpi SBDB hanno qualità "catalog-keplerian" — accettabile per visualizzazione educativa, non per navigazione.
```

**EN:**
```
Catalog layers: the lab loads bodies from the JPL Small-Body Database (SBDB) for NEO asteroids, main belt, comets, TNOs and centaurs. Toolbar toggles enable each layer. Catalog bodies are rendered as points to support tens of thousands of objects without performance issues.

Catalog positions: computed from SBDB Keplerian orbital elements in the HEC-J2000 frame. Not live JPL Horizons vectors. The snapshot date is visible in the inspector when a catalog layer is active.

Search: the search bar queries JPL SBDB in real time. Selecting a result requests a precision position from JPL Horizons and displays it as a teal marker (sub-km accuracy).

Catalog data quality: all SBDB bodies carry "catalog-keplerian" quality — acceptable for educational visualization, not for navigation.
```

- [ ] **Step 2: Update about page**

Add SBDB to the data sources section with: URL, snapshot date (from manifest), count, orbital element coverage, limitations.

Update limitations section:
- Catalog positions: SBDB Keplerian elements; not live vectors; accuracy degrades for highly perturbed objects
- Selected body precision: JPL Horizons vectors cached 1 hour; accurate within sub-km at query time
- Catalog coverage: based on SBDB snapshot at retrieval date; does not auto-refresh

- [ ] **Step 3: Extend audit for catalog file validation**

Add to `scripts/solar-system/audit-orbits.ts`:

```ts
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const CATALOG_DIR = join(process.cwd(), "public/lab/solar-system/catalog");
const REQUIRED = ["neo.json", "mba-top5000.json", "comets.json", "tnos.json", "centaurs.json", "manifest.json"];

console.log("\n--- Catalog snapshot validation ---");
for (const file of REQUIRED) {
  const path = join(CATALOG_DIR, file);
  if (!existsSync(path)) {
    console.log(`  [WARN] Missing: ${file} — run pnpm solar:fetch-catalog`);
    warnings++;
  } else {
    const raw = JSON.parse(readFileSync(path, "utf-8")) as { meta?: { count: number; retrievedAt: string }; chunks?: unknown[] };
    const count = raw.meta?.count ?? (raw.chunks as unknown[])?.length ?? "?";
    const date = raw.meta?.retrievedAt ?? "—";
    const kb = Math.round(readFileSync(path).length / 1024);
    console.log(`    OK  ${file.padEnd(24)} ${String(kb).padStart(6)} kB  count=${count}  retrieved=${date}`);
  }
}
```

- [ ] **Step 4: Run full verification**

```bash
pnpm solar:audit
pnpm typecheck
pnpm build
```

All must pass.

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-manual-view.tsx components/lab/solar-system-about-view.tsx scripts/solar-system/audit-orbits.ts
git commit -m "docs(solar-system): Sprint 03B catalog documentation and audit validation"
```

---

## Acceptance Criteria Sprint 03B

- [ ] `pnpm solar:audit` passes — including catalog snapshot validation
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] NEO, MBA, comet, TNO, centaur layers render as `THREE.Points` when toggled (never individual React meshes)
- [ ] Catalog positions use the same `ScaleDistanceMode` as MVP bodies — consistent across all layers
- [ ] Catalog body data quality shown as `catalog-keplerian` in inspector disclosure
- [ ] SBDB search returns results; selecting a result shows a Horizons marker with `sub-km` accuracy badge
- [ ] Horizons marker uses `referenceFrame: "HEC-J2000"` — consistent with 03A documentation
- [ ] Position recompute throttle: CatalogLayer does not recompute more than once per simulated day
- [ ] Catalog toggles hidden on mobile (`.solar-toolbar__hide-sm`)
- [ ] Manual documents catalog layer behavior, snapshot date, data quality
- [ ] About page lists SBDB source with retrieval date and limitations
- [ ] Tavola periodica unaffected

---

## Out of Scope for Sprint 03B

| Feature | Sprint |
|---------|--------|
| CelesTrak/SGP4 artificial satellites | 04 |
| Real textures (NASA/USGS) | 05 |
| Spacecraft ephemerides | 05 |
| Ring divisions, ring shadows | 04 |
| IAU WGCCRE precise pole orientation | 04 |
| Magnitude-based LOD for Points (size by H) | 04 |
| Web Worker for catalog position computation | 04 |
| Catalog refresh automation | 04 |
