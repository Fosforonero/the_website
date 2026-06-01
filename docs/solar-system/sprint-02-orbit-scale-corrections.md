# Solar System Orbit And Scale Correction Sprint

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:systematic-debugging` first, then `superpowers:executing-plans` or `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Solar System Lab's orbital geometry, body sizes, moon placement and documentation claims so the viewer behaves like a trustworthy technical observatory rather than a decorative orrery.

**Architecture:** Keep the existing Solar System module, but replace the MVP shortcuts that are causing visual bugs: incomplete Keplerian elements, circular orbit rings, global-only scaling for moons and radius clamping that makes many bodies the same size. Add diagnostic checks so future changes do not regress orbital distance, parent-child placement or visual-size ordering.

**Tech Stack:** Next.js App Router, TypeScript, React Three Fiber, Three.js, local `tsx` diagnostics, existing `pnpm typecheck` and `pnpm build`.

---

## Verified Problems

These are not guesses; they were found by reading the implementation and running numeric checks.

1. **Bodies do not have enough orbital elements.**  
   `lib/solar-system/ephemeris.ts` only uses `semiMajorAxisKm`, `eccentricity`, `inclinationDeg` and `orbitalPeriodDays`. It does not use mean anomaly at epoch, longitude of ascending node or argument/longitude of periapsis. Result: all bodies are phase-aligned from the same implicit anomaly and orbital orientation is oversimplified.

2. **Orbit rings are circular but positions are elliptical.**  
   `components/lab/solar-system-scene.tsx` draws `ringGeometry` at radius `a`, while the solver positions eccentric bodies on ellipses with focus offset. For comets/TNOs this is visibly wrong.

3. **Moon placement is visually broken by global scaling.**  
   Moon positions are added in km correctly, then the whole heliocentric vector is scaled from the Sun. In compressed mode the Earth-Moon offset is about `0.0026` render units, while both Earth and Moon are clamped to `0.0200`, so the Moon is swallowed by Earth visually. Same issue for Io/Jupiter, Titan/Saturn and Charon/Pluto.

4. **Visible radius mode destroys size hierarchy.**  
   `scaleRadius(..., "visible")` clamps many bodies to the same minimum `0.02`. Numeric check showed Earth, Moon, Mercury, Mars, Neptune, Pluto, Charon, Vesta, Halley and Sedna all rendering at `0.0200` in visible mode. This is why sizes feel wrong.

5. **Relative radius mode is physically meaningful but not usable.**  
   Earth becomes `0.00457` while Sun is `0.5`; many smaller objects become nearly invisible. This mode needs clearer naming and/or a hybrid fallback.

6. **Playback labels and implementation are ambiguous.**  
   UI labels say `×365 (1 anno/ora)` but the code increments epoch by `speedMultiplier * 100 ms` every `100 ms`, which is a multiplier over real milliseconds, not a clean "simulated days per real second/hour" model.

7. **Manual/about overstate some data.**  
   The manual says all 88 constellations, but the current `firmament.ts` contains a small curated subset. Documentation must describe the current subset honestly.

## Evidence Commands

The current implementation compiled:

```bash
pnpm typecheck
pnpm build
```

Numeric audit command used:

```bash
pnpm exec tsx -e "import { SOLAR_BODIES } from './lib/solar-system/bodies'; import { getBodyStatesForDate } from './lib/solar-system/ephemeris'; import { scaleDistance, scaleRadius, AU_KM } from './lib/solar-system/scales'; const date=new Date('2026-05-29T00:00:00Z'); const states=getBodyStatesForDate(date); const by=new Map(states.map(s=>[s.id,s])); const ids=['sun','mercury','venus','earth','moon','mars','jupiter','io','saturn','titan','neptune','pluto','charon','halley','sedna']; for (const id of ids){ const b=SOLAR_BODIES.find(x=>x.id===id)!; const s=by.get(id)!; const d=Math.hypot(...s.positionKm as [number,number,number]); const parent=b.parentId ? by.get(b.parentId) : undefined; const pd=parent?Math.hypot(s.positionKm[0]-parent.positionKm[0],s.positionKm[1]-parent.positionKm[1],s.positionKm[2]-parent.positionKm[2]):d; console.log(id.padEnd(8), 'sunAU=',(d/AU_KM).toFixed(4), 'parentKm=',Math.round(pd).toLocaleString(), 'visR=',scaleRadius(b.radiusKm,'visible').toFixed(4), 'relR=',scaleRadius(b.radiusKm,'relative').toFixed(5), 'comp=',scaleDistance(d,'compressed').toFixed(3), 'log=',scaleDistance(d,'real-log').toFixed(3)); }"
```

---

## Task 1: Add A Repeatable Solar System Audit Script

**Files:**

- Create: `scripts/solar-system/audit-orbits.ts`
- Modify: `package.json`

- [ ] **Step 1: Create the audit script**

The script must print and validate:

- Sun distance from origin;
- each body's parent distance;
- heliocentric AU distance;
- visible radius;
- relative radius;
- rendered parent-child separation in each scale mode;
- warnings when a moon's rendered separation is less than `3 * max(parentRadius, moonRadius)`.

- [ ] **Step 2: Add package script**

Add:

```json
"solar:audit": "tsx scripts/solar-system/audit-orbits.ts"
```

- [ ] **Step 3: Run audit**

```bash
pnpm solar:audit
```

Expected before fixes: the script reports warnings for Moon/Earth, Io/Jupiter, Titan/Saturn and Charon/Pluto, plus size hierarchy warnings.

- [ ] **Step 4: Commit**

```bash
git add scripts/solar-system/audit-orbits.ts package.json
git commit -m "test: add solar system orbit audit"
```

---

## Task 2: Expand Orbital Elements And Solver

**Files:**

- Modify: `lib/solar-system/bodies.ts`
- Modify: `lib/solar-system/ephemeris.ts`
- Modify: `components/lab/solar-system-about-view.tsx`
- Modify: `components/lab/solar-system-manual-view.tsx`

- [ ] **Step 1: Extend `SolarBody` orbital fields**

Add optional fields:

```ts
epochJd?: number;
meanAnomalyDeg?: number;
longitudeOfAscendingNodeDeg?: number;
argumentOfPeriapsisDeg?: number;
longitudeOfPeriapsisDeg?: number;
```

Use one consistent convention:

- prefer `meanAnomalyDeg`, `longitudeOfAscendingNodeDeg`, `argumentOfPeriapsisDeg`;
- if source data provides longitude of periapsis instead, derive `argumentOfPeriapsisDeg = longitudeOfPeriapsisDeg - longitudeOfAscendingNodeDeg`.

- [ ] **Step 2: Populate at least major bodies**

Populate J2000-style elements for:

- Mercury, Venus, Earth, Mars;
- Jupiter, Saturn, Uranus, Neptune;
- Pluto, Ceres, Vesta;
- Halley, 67P;
- Eris, Haumea, Makemake, Sedna;
- major moons if reliable static elements are available.

Keep source IDs accurate. If exact elements are not verified for a body, keep the existing approximated fields but mark the UI/manual as "approximate MVP element".

- [ ] **Step 3: Implement full 3D Kepler rotation**

Replace the simplified `keplerToXyz` rotation with the standard perifocal-to-ecliptic rotation:

```ts
x = r * (cosΩ * cos(ω + ν) - sinΩ * sin(ω + ν) * cosi)
y = r * (sinΩ * cos(ω + ν) + cosΩ * sin(ω + ν) * cosi)
z = r * (sin(ω + ν) * sini)
```

Where:

- `Ω` = longitude of ascending node;
- `ω` = argument of periapsis;
- `ν` = true anomaly;
- `i` = inclination.

- [ ] **Step 4: Use epoch-specific mean anomaly**

Compute:

```ts
const meanMotion = twoPi / orbitalPeriodDays;
const M = meanAnomalyAtEpoch + meanMotion * daysSinceBodyEpoch;
```

Do not assume all bodies start at `M = 0` at J2000.

- [ ] **Step 5: Preserve parent-child composition**

The solver can still return world-space `positionKm`, but it must also expose local position for child rendering:

```ts
export type BodyState = {
  id: string;
  positionKm: [number, number, number];
  localPositionKm?: [number, number, number];
  parentId: string | null;
  epochIso: string;
  source: "mvp-orbital-elements" | "jpl-horizons";
};
```

- [ ] **Step 6: Update manual/about honesty**

Update text to say:

- Sprint 02 uses fuller Keplerian elements for visual orbit geometry;
- it is still not live JPL Horizons precision;
- JPL vector integration remains the future precision layer.

- [ ] **Step 7: Run checks**

```bash
pnpm typecheck
pnpm solar:audit
```

- [ ] **Step 8: Commit**

```bash
git add lib/solar-system/bodies.ts lib/solar-system/ephemeris.ts components/lab/solar-system-about-view.tsx components/lab/solar-system-manual-view.tsx
git commit -m "fix: improve solar system orbital elements"
```

---

## Task 3: Replace Circular Rings With Sampled Orbit Paths

**Files:**

- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `lib/solar-system/ephemeris.ts`

- [ ] **Step 1: Export an orbit sampler**

Add:

```ts
export function sampleOrbitPath(bodyId: string, samples = 256): Array<[number, number, number]>
```

For a body with orbital data, sample one full orbit in local parent-relative coordinates using the same solver math as `getBodyStatesForDate`.

- [ ] **Step 2: Replace `OrbitRing`**

Replace `ringGeometry` with a `lineLoop`/`lineSegments` generated from sampled orbit points.

Requirements:

- eccentric orbits render as ellipses;
- inclined orbits are visibly inclined;
- retrograde/high-inclination comets do not appear as simple flat circles;
- orbit path and body position are generated by the same math.

- [ ] **Step 3: Render moon orbit paths conditionally**

Do not draw all moon orbits at full scene scale by default. Draw moon orbit paths when:

- the moon is selected;
- the parent planet is selected;
- or a "moon systems" toggle is enabled.

- [ ] **Step 4: Run checks**

```bash
pnpm typecheck
pnpm solar:audit
```

- [ ] **Step 5: Commit**

```bash
git add lib/solar-system/ephemeris.ts components/lab/solar-system-scene.tsx
git commit -m "fix: render sampled solar system orbit paths"
```

---

## Task 4: Fix Radius Scaling

**Files:**

- Modify: `lib/solar-system/scales.ts`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`
- Modify: `components/lab/solar-system-manual-view.tsx`

- [ ] **Step 1: Replace flat minimum clamp**

`visible` mode must not make Earth, Moon, Pluto, Vesta and Halley the same radius.

Implement a category-aware logarithmic visual scale:

```ts
export function scaleRadius(km: number, mode: ScaleRadiusMode, category?: SolarBodyCategory): number
```

Suggested behavior:

- Sun: largest but capped;
- gas giants: clearly larger than ice giants;
- ice giants: larger than rocky planets;
- rocky planets: larger than moons/dwarf planets;
- asteroids/comets: visible markers but smaller than dwarf planets;
- minimum marker size only for clickability, not presented as physical radius.

- [ ] **Step 2: Rename UI labels**

Change labels to reduce confusion:

- IT: `Visibile educativa`, `Relativa reale`
- EN: `Educational visible`, `Physical relative`

- [ ] **Step 3: Add inspector disclosure**

In the inspector show:

- real radius in km;
- active radius scale mode;
- a short note that visual radius is scaled independently from orbital distance.

- [ ] **Step 4: Validate ordering**

`pnpm solar:audit` must pass these ordering checks:

- Sun visual radius > Jupiter;
- Jupiter > Neptune;
- Neptune > Earth;
- Earth > Moon;
- Moon > Vesta;
- Pluto > Charon;
- Ceres > Halley.

- [ ] **Step 5: Run checks**

```bash
pnpm typecheck
pnpm solar:audit
```

- [ ] **Step 6: Commit**

```bash
git add lib/solar-system/scales.ts components/lab/solar-system-view.tsx lib/solar-system/i18n.ts components/lab/solar-system-manual-view.tsx
git commit -m "fix: correct solar system visual radius scaling"
```

---

## Task 5: Fix Moon And Satellite Rendering Scale

**Files:**

- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `lib/solar-system/scales.ts`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`

- [ ] **Step 1: Add local satellite scale helper**

Add:

```ts
export function scaleSatelliteOffsetKm(km: number, parentId: string, distanceMode: ScaleDistanceMode): number
```

Purpose: render moon systems legibly without pretending those offsets are globally to scale.

Acceptance:

- Moon is visibly separated from Earth in `visible` radius mode;
- Io/Europa/Ganymede/Callisto are visibly separated from Jupiter when Jupiter or those moons are selected;
- Charon is visibly separated from Pluto when Pluto/Charon is selected.

- [ ] **Step 2: Render child systems hierarchically**

In the scene:

- render parent heliocentric position first;
- render child local offset around the already-scaled parent position;
- apply satellite offset boost only to local moon offsets;
- label this mode as educational/local satellite scale.

- [ ] **Step 3: Add UI disclosure**

Add copy:

- IT: `Le lune usano una scala locale aumentata per restare leggibili.`
- EN: `Moons use an expanded local scale so they remain readable.`

- [ ] **Step 4: Audit separation**

`pnpm solar:audit` must pass:

- Earth-Moon rendered separation >= `3 * max(earthVisualRadius, moonVisualRadius)`;
- Jupiter-Io rendered separation >= `3 * max(jupiterVisualRadius, ioVisualRadius)`;
- Pluto-Charon rendered separation >= `3 * max(plutoVisualRadius, charonVisualRadius)`.

- [ ] **Step 5: Run checks**

```bash
pnpm typecheck
pnpm solar:audit
```

- [ ] **Step 6: Commit**

```bash
git add components/lab/solar-system-scene.tsx lib/solar-system/scales.ts components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "fix: render moon systems with readable local scale"
```

---

## Task 6: Fix Time Playback Semantics

**Files:**

- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`
- Modify: `components/lab/solar-system-manual-view.tsx`

- [ ] **Step 1: Replace ambiguous speed math**

Use explicit simulated days per real second or real-time multiplier. Pick one and make UI match the code.

Recommended:

```ts
const SPEED_OPTIONS = [
  { key: "realtime", labelKey: "realtime", daysPerSecond: 1 / 86400 },
  { key: "day-per-second", labelKey: "dayPerSecond", daysPerSecond: 1 },
  { key: "month-per-second", labelKey: "monthPerSecond", daysPerSecond: 30 },
  { key: "year-per-second", labelKey: "yearPerSecond", daysPerSecond: 365 },
] as const;
```

Use `requestAnimationFrame` or a stable interval that computes delta time from wall-clock elapsed time, not fixed `speedMultiplier * 100`.

- [ ] **Step 2: Update labels**

Use labels like:

- IT: `1 giorno/sec`, `1 mese/sec`, `1 anno/sec`
- EN: `1 day/sec`, `1 month/sec`, `1 year/sec`

- [ ] **Step 3: Run checks**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/lab/solar-system-view.tsx lib/solar-system/i18n.ts components/lab/solar-system-manual-view.tsx
git commit -m "fix: clarify solar system time playback"
```

---

## Task 7: Fix Documentation Claims And Source Honesty

**Files:**

- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`
- Modify: `app/lab/sistema-solare/page.tsx`
- Modify: `app/en/lab/solar-system/page.tsx`

- [ ] **Step 1: Remove or qualify "real time" precision claims**

Until live Horizons exists, metadata and UI should say:

- IT: `posizioni calcolate da elementi orbitali pubblici`
- EN: `positions computed from public orbital elements`

Do not imply live NASA/JPL ephemerides.

- [ ] **Step 2: Correct firmament claims**

Replace any claim of "all 88 constellations" with:

- IT: `subset curato di stelle luminose, costellazioni riconoscibili e oggetti deep-sky`
- EN: `curated subset of bright stars, recognizable constellations and deep-sky objects`

- [ ] **Step 3: Add limitations section**

Manual/about must clearly state:

- orbital positions are educational approximations until Horizons integration;
- visual radii are scaled independently from distances;
- moon systems use local expanded scale;
- firmament is a curated subset;
- textures are procedural unless real texture manifest entries exist.

- [ ] **Step 4: Run checks**

```bash
pnpm typecheck
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-manual-view.tsx components/lab/solar-system-about-view.tsx app/lab/sistema-solare/page.tsx app/en/lab/solar-system/page.tsx
git commit -m "docs: correct solar system precision and scale claims"
```

---

## Task 8: Browser Verification And Polish

**Files:**

- Modify only files needed for verified issues.

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Check desktop**

Open:

```txt
http://localhost:3000/lab/sistema-solare
```

Verify:

- Earth/Moon are visually distinct;
- Jupiter/Galilean moons are visible when selected or parent selected;
- orbit paths match body positions;
- Halley/Pluto/Sedna paths are not simple circular rings;
- size hierarchy is readable;
- scale mode labels and inspector notes make sense;
- constellation/deep-sky toggles still work.

- [ ] **Step 3: Check mobile**

Use a mobile viewport. Verify:

- toolbar wraps without covering the whole canvas;
- left browser and right inspector do not make the scene unusable;
- labels do not dominate the screen;
- selected-body inspector remains readable.

- [ ] **Step 4: Final checks**

```bash
pnpm solar:audit
pnpm typecheck
pnpm build
```

Expected: all pass.

- [ ] **Step 5: Commit polish fixes**

```bash
git add <changed-files>
git commit -m "fix: polish solar system visual verification issues"
```

---

## Acceptance Criteria

This sprint is complete only when:

- `pnpm solar:audit` exists and passes;
- `pnpm typecheck` passes;
- `pnpm build` passes;
- orbit paths are sampled from the same orbital math as body positions;
- eccentric/high-inclination objects do not render with misleading circular rings;
- radius scaling preserves a recognizable size hierarchy;
- moons are visibly separated from parent bodies in the intended educational/local scale mode;
- UI and docs disclose that radii, moon offsets and distances are visualization scales;
- manual/about/metadata no longer overstate live JPL precision or all-constellation coverage.

