# Sprint 03A — Physical Realism Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the physical and geometric foundation the Solar System Lab is missing before any large-scale catalog work. Without this layer the catalog would add thousands of visually false objects on top of already imprecise geometry. After this sprint, every rendered feature — orbit plane, axial orientation, lighting, scale mode — must be either physically accurate or explicitly disclosed as educational.

**Architecture:** Four new pure-TypeScript lib modules (reference frames, orbital elements spec, rotation model, lighting model) with no React dependencies. The scene gains axial-tilt-aware mesh orientation, equatorial ring geometry for Saturn and Uranus, physically motivated point-source lighting with a declared educational boost, an extended data-quality layer in the inspector, and an expanded audit suite. No new npm packages required beyond what already exists.

**Tech Stack:** TypeScript, React Three Fiber, Three.js, existing Keplerian solver (Sprint 02), existing scale helpers (Sprint 02).

---

## Audit: What Is Currently Wrong

| Issue | File | Impact |
|-------|------|--------|
| No axial tilt on any planet mesh | `solar-system-scene.tsx:164–218` | All planets rotate with poles pointing to ecliptic north (+Z). Visually wrong for Venus (177°), Uranus (98°), Saturn (27°). |
| No Saturn/Uranus rings | `solar-system-scene.tsx` | Saturn is the most visually distinctive body in the Solar System; missing rings breaks credibility. |
| Flat ambient light `intensity=0.18` | `solar-system-scene.tsx:287` | All bodies equally illuminated regardless of distance. Scientifically misleading. |
| `pointLight intensity=4 decay=1.8` | `solar-system-scene.tsx:288–293` | `decay=1.8` is not the physical inverse-square law (decay=2). Distance cap at 2000 units cuts off outer system. |
| No reference frame documentation | entire codebase | Inspector and docs do not state that positions are in HEC-J2000 ecliptic coordinates. |
| No rotation phase on bodies | `solar-system-scene.tsx` | Planet orientation is static regardless of epoch. No day/night terminator follows the sub-solar point. |
| Retrograde rotations undisclosed | `lib/solar-system/bodies.ts` | Venus (177° tilt = retrograde), Uranus (98°), Pluto (122°) are not modelled or labelled. |
| Scale mode `brightness` absent | `lib/solar-system/scales.ts` | No mode for luminosity/apparent magnitude scaling. Stars and bright bodies are all the same emissive intensity. |
| Inspector shows no reference frame | `solar-system-view.tsx` | User has no way to know what coordinate system positions are in. |

---

## Architecture: New Lib Modules

```
lib/solar-system/
  reference-frames.ts     ← coordinate system definitions, epoch, conversions (new)
  orbital-elements.ts     ← full element set spec, validation, documentation (new)
  rotation-model.ts       ← axial tilt data, sidereal rotation, retrograde flags (new)
  lighting-model.ts       ← sun luminosity, inverse-square helpers, mode types (new)
  scales.ts               ← extend with ScaleBrightnessMode, disclosure types (modify)
  bodies.ts               ← add axialTiltDeg, siderealRotationHours, rings (modify)
  i18n.ts                 ← add reference-frame, lighting, rotation UI strings (modify)
```

---

## Verified Physical Data

### Axial tilts and rotation (IAU 2015 / Seidelmann 2007)

| Body | Obliquity to ecliptic (°) | Sidereal rotation (h) | Retrograde |
|------|--------------------------|----------------------|-----------|
| Mercury | 0.034 | +1407.6 | No |
| Venus | 177.36 | −5832.5 | Yes |
| Earth | 23.439 | +23.934 | No |
| Mars | 25.189 | +24.623 | No |
| Jupiter | 3.128 | +9.925 | No |
| Saturn | 26.732 | +10.656 | No |
| Uranus | 97.774 | −17.240 | Yes (>90°) |
| Neptune | 28.322 | +16.110 | No |
| Moon | 6.687 | +655.720 | No (synchronous) |
| Pluto | 122.530 | −153.293 | Yes |

Sources: IAU WGCCRE 2015 report; JPL planetary fact sheets.

### Ring geometry (km from planet centre, equatorial plane)

| Planet | Inner radius (km) | Outer radius (km) | Notes |
|--------|------------------|------------------|-------|
| Saturn | 74 500 | 140 220 | Simplified; hides Cassini Division. Full model: D/C/B/A rings. |
| Uranus | 38 000 | 51 149 | Epsilon ring outer edge. Much dimmer than Saturn. |

---

## Task 1: Reference Frames Library

**Files:**
- Create: `lib/solar-system/reference-frames.ts`

- [ ] **Step 1: Create the module**

```ts
/**
 * Reference frame definitions for the Solar System Lab.
 *
 * All positions produced by ephemeris.ts use Heliocentric Ecliptic J2000.0.
 *
 * Frame definition:
 *   Origin  : Solar System Barycentre (≈ Sun for this lab)
 *   xy-plane: Mean ecliptic at J2000.0
 *   x-axis  : Direction of mean vernal equinox at J2000.0
 *   z-axis  : Ecliptic north pole
 *   Units   : km
 *   Epoch   : J2000.0 = 2000-Jan-01 12:00:00 TT = JD 2451545.0
 *
 * This is NOT the same as ICRF / equatorial J2000.
 * Conversion to equatorial (ICRF): rotate by obliquity of the ecliptic.
 */

export const REFERENCE_FRAME = {
  id: "HEC-J2000",
  name: {
    it: "Eclittica eliocentrica J2000.0",
    en: "Heliocentric Ecliptic J2000.0",
  },
  epoch: {
    label: "J2000.0",
    jd: 2_451_545.0,
    iso: "2000-01-01T12:00:00Z",
  },
  origin: {
    it: "Baricentro del Sistema Solare (approssimato al Sole)",
    en: "Solar System Barycentre (approximated to the Sun)",
  },
  xyPlane: {
    it: "Piano dell'eclittica a J2000.0",
    en: "Mean ecliptic plane at J2000.0",
  },
  xAxis: {
    it: "Equinozio di primavera a J2000.0",
    en: "Mean vernal equinox at J2000.0",
  },
  units: "km",
  disclaimer: {
    it: "Le posizioni sono calcolate da elementi kepleriani nel frame HEC-J2000, non da integrazioni numeriche. Precisione: pochi milioni di km su scale di anni.",
    en: "Positions are computed from Keplerian elements in the HEC-J2000 frame, not from numerical integrations. Accuracy: a few million km over multi-year timescales.",
  },
} as const;

/** Obliquity of the ecliptic at J2000.0 (IAU 2006, degrees). */
export const ECLIPTIC_OBLIQUITY_DEG = 23.43929111;

/**
 * Rotate a position vector from heliocentric ecliptic J2000.0
 * to heliocentric equatorial J2000.0 (ICRF approximation).
 * This is a rotation by −obliquity around the x-axis.
 */
export function eclipticToEquatorialJ2000(
  pos: [number, number, number]
): [number, number, number] {
  const eps = (ECLIPTIC_OBLIQUITY_DEG * Math.PI) / 180;
  const c = Math.cos(eps);
  const s = Math.sin(eps);
  return [
    pos[0],
    c * pos[1] - s * pos[2],
    s * pos[1] + c * pos[2],
  ];
}

/**
 * Three.js uses a Y-up, right-hand coordinate system.
 * Our ecliptic frame has Z as the ecliptic north pole.
 * Mapping: Three.js Y ← ecliptic Z, Three.js Z ← −ecliptic Y.
 * The scene renderer must apply this remapping consistently.
 * In practice: position vectors are passed directly (x,y,z → x,z,−y)
 * OR we keep the ecliptic frame and accept that the ecliptic plane is XZ in Three.js.
 *
 * Current convention in this codebase (Sprint 01/02):
 *   The scene renders positions as (x, y, z) → Three.js (x, y, z) directly.
 *   The ecliptic plane appears as the XY plane in Three.js (y ≈ 0 for low-inclination orbits).
 *   The ecliptic north pole is +Z in our frame and +Z in Three.js.
 *   This is consistent but means Three.js Y is NOT "up" in the ecliptic sense.
 *
 * Do NOT change this mapping without updating all scale, orbit, and rotation code.
 */
export const SCENE_FRAME_NOTE =
  "In the Three.js scene: ecliptic X→sceneX, eclipticY→sceneY, eclipticZ→sceneZ. " +
  "The ecliptic plane is approximately the scene XY plane. " +
  "The ecliptic north pole is scene +Z.";
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add lib/solar-system/reference-frames.ts
git commit -m "feat(solar-system): reference frame definitions HEC-J2000"
```

---

## Task 2: Rotation Model Library

**Files:**
- Create: `lib/solar-system/rotation-model.ts`
- Modify: `lib/solar-system/bodies.ts`

- [ ] **Step 1: Add rotation fields to `SolarBody` in `bodies.ts`**

After the `argumentOfPeriapsisDeg?` field in `SolarBody`, add:
```ts
  /** Obliquity (axial tilt) to the ecliptic plane, degrees. 0 = pole parallel to ecliptic north. */
  axialTiltDeg?: number;
  /**
   * Sidereal rotation period in hours.
   * Positive = prograde (same direction as orbital motion).
   * Negative = retrograde (Venus, Uranus sense, Pluto).
   */
  siderealRotationHours?: number;
  /** Inner edge of ring system, km from body centre. Only Saturn and Uranus. */
  ringInnerKm?: number;
  /** Outer edge of ring system, km from body centre. */
  ringOuterKm?: number;
```

- [ ] **Step 2: Populate rotation data in body entries**

For each body that has data, add the fields. Use the verified values from the table above.

**Mercury** — after `argumentOfPeriapsisDeg: 29.118`:
```ts
    axialTiltDeg: 0.034,
    siderealRotationHours: 1407.6,
```

**Venus** — after `argumentOfPeriapsisDeg: 55.095`:
```ts
    axialTiltDeg: 177.36,
    siderealRotationHours: -5832.5,
```

**Earth** — after `argumentOfPeriapsisDeg: 102.930`:
```ts
    axialTiltDeg: 23.439,
    siderealRotationHours: 23.934,
```

**Mars** — after `argumentOfPeriapsisDeg: 286.369`:
```ts
    axialTiltDeg: 25.189,
    siderealRotationHours: 24.623,
```

**Jupiter** — after `argumentOfPeriapsisDeg: 273.982`:
```ts
    axialTiltDeg: 3.128,
    siderealRotationHours: 9.925,
```

**Saturn** — after `argumentOfPeriapsisDeg: 339.221`:
```ts
    axialTiltDeg: 26.732,
    siderealRotationHours: 10.656,
    ringInnerKm: 74_500,
    ringOuterKm: 140_220,
```

**Uranus** — after `argumentOfPeriapsisDeg: 98.472`:
```ts
    axialTiltDeg: 97.774,
    siderealRotationHours: -17.240,
    ringInnerKm: 38_000,
    ringOuterKm: 51_149,
```

**Neptune** — after `argumentOfPeriapsisDeg: 274.898`:
```ts
    axialTiltDeg: 28.322,
    siderealRotationHours: 16.110,
```

**Moon** — after `argumentOfPeriapsisDeg: 318.150`:
```ts
    axialTiltDeg: 6.687,
    siderealRotationHours: 655.720,
```

**Pluto** — after `argumentOfPeriapsisDeg: 224.067`:
```ts
    axialTiltDeg: 122.530,
    siderealRotationHours: -153.293,
```

- [ ] **Step 3: Create `lib/solar-system/rotation-model.ts`**

```ts
/**
 * Rotation model helpers for Solar System bodies.
 *
 * Computes the current rotation phase of a body at a given epoch,
 * and returns a Three.js Euler or quaternion for mesh orientation.
 *
 * Limitations (documented):
 * - Axial tilt is applied as a rotation around the scene X-axis.
 *   This is an approximation: the true pole RA/Dec from IAU WGCCRE
 *   is not yet implemented. The obliquity magnitude is correct;
 *   the pole azimuth direction is not.
 * - Rotation phase (sub-solar point) is computed from sidereal period
 *   and epoch, but precession and nutation are not modelled.
 */

import type { SolarBody } from "./bodies";

export type BodyOrientation = {
  /** Axial tilt rotation angle around scene X-axis (radians). */
  tiltAroundXRad: number;
  /** Current rotation phase around the tilted pole (radians). */
  rotationPhaseRad: number;
  /** Is the rotation retrograde? */
  isRetrograde: boolean;
  /** Disclosure text key for this orientation model. */
  accuracyNote: "axial-tilt-approximate" | "not-modelled";
};

/** J2000.0 reference epoch in Unix milliseconds */
const J2000_MS = 946_728_000_000; // 2000-01-01T12:00:00Z

export function getBodyOrientation(
  body: SolarBody,
  epochMs: number
): BodyOrientation {
  if (body.axialTiltDeg === undefined || body.siderealRotationHours === undefined) {
    return {
      tiltAroundXRad: 0,
      rotationPhaseRad: 0,
      isRetrograde: false,
      accuracyNote: "not-modelled",
    };
  }

  const tiltRad = (body.axialTiltDeg * Math.PI) / 180;
  const isRetrograde = body.siderealRotationHours < 0;

  // Elapsed time since J2000 in hours
  const elapsedHours = (epochMs - J2000_MS) / 3_600_000;

  // Rotation phase: full rotations since J2000
  const rotationPeriodHours = Math.abs(body.siderealRotationHours);
  const phaseRaw = (elapsedHours / rotationPeriodHours) * 2 * Math.PI;
  const phase = isRetrograde ? -phaseRaw : phaseRaw;
  const rotationPhaseRad = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  return {
    tiltAroundXRad: tiltRad,
    rotationPhaseRad,
    isRetrograde,
    accuracyNote: "axial-tilt-approximate",
  };
}

/**
 * Human-readable disclosure for the rotation accuracy of a body.
 */
export const ROTATION_ACCURACY_NOTES = {
  "axial-tilt-approximate": {
    it: "Inclinazione assiale reale (IAU 2015). Azimut del polo approssimato — non usa RA/Dec IAU WGCCRE.",
    en: "Real axial tilt (IAU 2015). Pole azimuth approximated — does not use IAU WGCCRE RA/Dec.",
  },
  "not-modelled": {
    it: "Rotazione non modellata per questo corpo.",
    en: "Rotation not modelled for this body.",
  },
} as const;

/**
 * Whether a body has retrograde rotation.
 * Retrograde is defined as axialTiltDeg > 90° OR siderealRotationHours < 0.
 */
export function isRetrogradRotation(body: SolarBody): boolean {
  if (body.siderealRotationHours !== undefined) {
    return body.siderealRotationHours < 0;
  }
  if (body.axialTiltDeg !== undefined) {
    return body.axialTiltDeg > 90;
  }
  return false;
}
```

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add lib/solar-system/rotation-model.ts lib/solar-system/bodies.ts
git commit -m "feat(solar-system): axial tilt and sidereal rotation data for major bodies"
```

---

## Task 3: Lighting Model Library

**Files:**
- Create: `lib/solar-system/lighting-model.ts`
- Modify: `lib/solar-system/scales.ts` (add `ScaleBrightnessMode`)

- [ ] **Step 1: Add `ScaleBrightnessMode` to `scales.ts`**

After `ScaleRadiusMode` export, add:
```ts
/**
 * Brightness/luminosity scaling modes.
 *
 * - `physical`    : pointLight intensity decreases as 1/r² from the Sun.
 *                   Outer system planets are very dim. Accurate.
 * - `educational` : pointLight boosted so all major bodies are visible.
 *                   Boost factor declared in UI and inspector. Not physically accurate.
 */
export type ScaleBrightnessMode = "physical" | "educational";
```

Also add to `ScaleDistanceMode` export a note comment:
```ts
// Note: The three scale modes are independent.
// Distance mode does not affect radius mode, and neither affects brightness mode.
// Each combination must be disclosed in the inspector.
```

- [ ] **Step 2: Create `lib/solar-system/lighting-model.ts`**

```ts
/**
 * Sun-based lighting model for the Solar System Lab.
 *
 * Physical model:
 *   Solar luminosity L☉ = 3.828 × 10²⁶ W
 *   Irradiance at distance r AU: E = 1361 / r²  W/m²
 *   This is the inverse-square law.
 *
 * Three.js pointLight with decay=2 approximates the inverse-square law.
 * The intensity parameter is the luminous power at 1 render unit.
 *
 * Two declared modes:
 *   physical    — decay=2, no ambient, distant planets are dim
 *   educational — decay=2 + ambient boost, outer planets visible
 *
 * The educational boost is NOT a physical parameter. It must be disclosed
 * in the UI whenever active. The inspector should show which mode is active.
 */

export type ScaleBrightnessMode = "physical" | "educational";

export type LightingConfig = {
  mode: ScaleBrightnessMode;
  /** Point light intensity at the Sun's position. */
  sunIntensity: number;
  /** Point light physical decay exponent (2 = inverse square). */
  sunDecay: number;
  /** Maximum distance for the point light (render units). 0 = unlimited. */
  sunDistance: number;
  /** Ambient light intensity. 0 in physical mode. */
  ambientIntensity: number;
  /** Ambient light color (hex). */
  ambientColor: string;
};

/**
 * Physical mode: true inverse-square falloff, no artificial ambient.
 * Neptune at ~30 AU receives ~1/900 the irradiance of Earth.
 * Very dark outer system — correct but potentially hard to see.
 */
export const PHYSICAL_LIGHTING: LightingConfig = {
  mode: "physical",
  sunIntensity: 3.0,
  sunDecay: 2,
  sunDistance: 0,    // unlimited
  ambientIntensity: 0,
  ambientColor: "#000000",
};

/**
 * Educational mode: inverse-square falloff + small ambient boost.
 * Outer planets remain visible. Not physically accurate.
 * Must be disclosed wherever active.
 */
export const EDUCATIONAL_LIGHTING: LightingConfig = {
  mode: "educational",
  sunIntensity: 3.0,
  sunDecay: 2,
  sunDistance: 0,
  ambientIntensity: 0.08,
  ambientColor: "#0a1828",
};

export function getLightingConfig(mode: ScaleBrightnessMode): LightingConfig {
  return mode === "physical" ? PHYSICAL_LIGHTING : EDUCATIONAL_LIGHTING;
}

export const LIGHTING_DISCLOSURE = {
  physical: {
    it: "Illuminazione fisica: intensità solare con legge quadratica inversa (1/r²). I pianeti esterni sono scuri come nella realtà.",
    en: "Physical lighting: solar intensity follows inverse-square law (1/r²). Outer planets are as dark as in reality.",
  },
  educational: {
    it: "Illuminazione educativa: luce solare 1/r² con boost ambientale dichiarato per rendere visibili i pianeti esterni.",
    en: "Educational lighting: solar 1/r² with declared ambient boost to keep outer planets visible.",
  },
} as const;
```

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add lib/solar-system/lighting-model.ts lib/solar-system/scales.ts
git commit -m "feat(solar-system): lighting model library with physical and educational modes"
```

---

## Task 4: Apply Axial Tilt and Rotation to Scene

**Files:**
- Modify: `components/lab/solar-system-scene.tsx`

This replaces the static mesh orientation with a `<group>` wrapper that applies axial tilt (rotation around scene X) and current rotation phase (rotation around the tilted Y/pole axis).

- [ ] **Step 1: Import rotation model in scene**

Add to imports:
```ts
import { getBodyOrientation } from "@/lib/solar-system/rotation-model";
```

Add to props of `SolarSystemSceneProps` and `BodyMeshProps`:
```ts
// In SolarSystemSceneProps (already has epoch):
// no change needed — epoch is already passed

// In BodyMeshProps, add:
epochMs: number;
```

- [ ] **Step 2: Apply orientation in `BodyMesh`**

In `BodyMesh`, after the position computation and before the return, add:
```ts
const orientation = getBodyOrientation(body, epochMs);
```

Replace the current `<group position={[scaledX, scaledY, scaledZ]}>` with:
```tsx
<group position={[scaledX, scaledY, scaledZ]}>
  {/* Tilt group: axial inclination relative to ecliptic */}
  <group rotation={[orientation.tiltAroundXRad, 0, 0]}>
    {/* Rotation group: current spin phase around tilted pole */}
    <group rotation={[0, orientation.rotationPhaseRad, 0]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        scale={displayR}
      >
        <sphereGeometry args={[1, 32, 32]} />
        {isSun ? (
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            roughness={0.9}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.75}
            metalness={0.02}
            emissive={isSelected ? color : new THREE.Color(0, 0, 0)}
            emissiveIntensity={isSelected ? 0.15 : 0}
          />
        )}
      </mesh>
    </group>

    {/* Rings — in equatorial plane (perpendicular to rotated Y axis) */}
    {body.ringInnerKm !== undefined && body.ringOuterKm !== undefined && (
      <RingSystem
        body={body}
        radiusMode={radiusMode}
        distanceMode={distanceMode}
      />
    )}

    {/* Selected highlight ring — in equatorial plane */}
    {isSelected && (
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[displayR * 1.25, displayR * 1.45, 64]} />
        <meshBasicMaterial color="#ffd860" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    )}
  </group>

  {/* Body label — above the tilted group */}
  {labelsVisible && (
    <Html position={[0, displayR * 1.6, 0]} occlude={false} style={{ pointerEvents: "none" }}>
      <span className={isSelected ? "solar-body-label solar-body-label--selected" : "solar-body-label"}>
        {body.name.en}
      </span>
    </Html>
  )}
</group>
```

- [ ] **Step 3: Pass `epochMs` to `BodyMesh` in `InnerScene`**

In the `{/* Bodies */}` map block, add `epochMs={epoch.getTime()}` to each `<BodyMesh>`.

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-scene.tsx
git commit -m "feat(solar-system): apply axial tilt and rotation phase to planet meshes"
```

---

## Task 5: Saturn and Uranus Rings

**Files:**
- Modify: `components/lab/solar-system-scene.tsx` (add `RingSystem` component)

Rings lie in the body's equatorial plane. Because rings are inside the axial-tilt `<group>`, they automatically inherit the planet's tilt — no additional rotation needed.

- [ ] **Step 1: Add `RingSystem` component before `BodyMesh`**

```tsx
// ---------------------------------------------------------------------------
// Ring system (Saturn, Uranus) — rendered in equatorial plane
// ---------------------------------------------------------------------------

type RingSystemProps = {
  body: SolarBody;
  radiusMode: ScaleRadiusMode;
  distanceMode: ScaleDistanceMode;
};

function RingSystem({ body }: RingSystemProps) {
  if (body.ringInnerKm === undefined || body.ringOuterKm === undefined) return null;

  // Scale ring radii using the same distance→render-unit ratio as the body's visual radius.
  // We use a fixed physical-km-to-render-unit ratio anchored to the body's true radius.
  // This keeps rings proportional to the body regardless of the active radius scale mode.
  // Disclosure: ring scale follows the educational visual radius exaggeration.
  const bodyVisualR = scaleRadius(body.radiusKm, "visible", body.category);
  const physicalBodyR = body.radiusKm;
  const scale = bodyVisualR / physicalBodyR; // render units per km

  const innerR = body.ringInnerKm * scale;
  const outerR = body.ringOuterKm * scale;

  // Ring opacity: Saturn rings are prominent, Uranus rings are faint
  const opacity = body.id === "saturn" ? 0.75 : 0.35;
  const color = body.id === "saturn" ? "#c8b880" : "#7090a0";

  return (
    // rotation={[Math.PI/2,0,0]}: the ring lies flat in XZ (equatorial) plane.
    // The parent group already has axial tilt applied, so this is the equatorial plane.
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[innerR, outerR, 128]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Verify Saturn visual**

Start dev server and navigate to `/lab/sistema-solare`. Select Saturn. Verify:
- Rings are visible as a flat band around Saturn
- Rings are inclined at ~27° relative to the ecliptic plane (Saturn's axial tilt)
- Uranus rings are visible but fainter, inclined nearly 90° (Uranus tilt ~98°)

- [ ] **Step 3: Run typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/lab/solar-system-scene.tsx
git commit -m "feat(solar-system): Saturn and Uranus ring geometry in equatorial plane"
```

---

## Task 6: Physically-Motivated Lighting

**Files:**
- Modify: `components/lab/solar-system-scene.tsx`
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`

- [ ] **Step 1: Add `brightnessMode` to scene props**

In `SolarSystemSceneProps` and `InnerSceneProps`, add:
```ts
brightnessMode: ScaleBrightnessMode;
```

Import:
```ts
import type { ScaleBrightnessMode } from "@/lib/solar-system/scales";
import { getLightingConfig } from "@/lib/solar-system/lighting-model";
```

- [ ] **Step 2: Replace current lighting in `InnerScene`**

Find the current lighting block:
```tsx
<ambientLight intensity={0.18} color="#0a1520" />
<pointLight
  position={[0, 0, 0]}
  intensity={4}
  color="#fff8e8"
  distance={2000}
  decay={1.8}
/>
```

Replace with:
```tsx
{/* Lighting — driven by brightnessMode. See lib/solar-system/lighting-model.ts */}
{(() => {
  const cfg = getLightingConfig(brightnessMode);
  return (
    <>
      {cfg.ambientIntensity > 0 && (
        <ambientLight intensity={cfg.ambientIntensity} color={cfg.ambientColor} />
      )}
      <pointLight
        position={[0, 0, 0]}
        intensity={cfg.sunIntensity}
        color="#fff8e8"
        distance={cfg.sunDistance}
        decay={cfg.sunDecay}
      />
    </>
  );
})()}
```

- [ ] **Step 3: Add brightness mode to state in `solar-system-view.tsx`**

```ts
import type { ScaleBrightnessMode } from "@/lib/solar-system/scales";

const [brightnessMode, setBrightnessMode] = useState<ScaleBrightnessMode>("educational");
```

Add a brightness mode selector to the toolbar (beside distance and radius mode selectors):
```tsx
{/* Brightness mode */}
<label className="solar-control solar-toolbar__hide-sm">
  <span>{t.brightnessMode}</span>
  <select
    value={brightnessMode}
    onChange={(e) => setBrightnessMode(e.target.value as ScaleBrightnessMode)}
  >
    {(["educational", "physical"] as ScaleBrightnessMode[]).map((m) => (
      <option key={m} value={m}>{t.brightnessModes[m]}</option>
    ))}
  </select>
</label>
```

Pass `brightnessMode` to `SolarSystemScene`.

- [ ] **Step 4: Add i18n strings**

In `SOLAR_UI.it`:
```ts
brightnessMode: "Illuminazione",
brightnessModes: {
  educational: "Educativa (boost)",
  physical: "Fisica (1/r²)",
},
lightingNote: "Boost educativo attivo: i pianeti esterni sono più luminosi della realtà.",
physicalLightingNote: "Illuminazione fisica: legge quadratica inversa. I pianeti esterni sono scuri come nella realtà.",
```

In `SOLAR_UI.en`:
```ts
brightnessMode: "Lighting",
brightnessModes: {
  educational: "Educational (boost)",
  physical: "Physical (1/r²)",
},
lightingNote: "Educational boost active: outer planets are brighter than physically accurate.",
physicalLightingNote: "Physical lighting: inverse-square law. Outer planets are as dark as reality.",
```

- [ ] **Step 5: Add lighting disclosure to inspector**

In `solar-system-view.tsx` inspector section, below the epoch note, add:
```tsx
<p style={{ fontSize: "0.62rem", color: "#4a7090", lineHeight: 1.5, margin: 0 }}>
  {brightnessMode === "educational" ? t.lightingNote : t.physicalLightingNote}
</p>
```

- [ ] **Step 6: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add components/lab/solar-system-scene.tsx components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "feat(solar-system): physically-motivated lighting with educational/physical modes"
```

---

## Task 7: Scale Mode Refactoring and Disclosure

**Files:**
- Modify: `lib/solar-system/scales.ts`
- Modify: `lib/solar-system/i18n.ts`
- Modify: `components/lab/solar-system-view.tsx`

All three scale axes (distance, radius, brightness) must be independently selectable and each must have explicit UI disclosure. No combination of modes should be visually misleading without a declared explanation.

- [ ] **Step 1: Add scale mode documentation block to `scales.ts`**

Add after the imports at the top:
```ts
/**
 * Scale mode system — Sprint 03A.
 *
 * Three independent axes:
 *
 * Distance modes (ScaleDistanceMode):
 *   compressed   : 1 AU = 1 render unit. Linear, manageable scene size. Not to scale.
 *   real-log     : logarithmic. Preserves large-scale structure. Not to scale.
 *   inner-system : inner planets (< 2 AU) expanded ×3, outer compressed. Not to scale.
 *   [future] real-linear : true scale, 1 AU = 1 render unit. Solar system is ~100 000 AU across.
 *                          Most planets invisible at this scale.
 *
 * Radius modes (ScaleRadiusMode):
 *   visible  : educational log scale, category-aware. Bodies are FAR larger than real scale.
 *              Earth at 1 AU compressed → real radius would be < 0.00004 render units.
 *   relative : proportional to Sun. Still exaggerated vs distances; Sun ≈ 0.50 render units.
 *   [future] physical : real scale relative to distances. All planets invisible dots.
 *
 * Brightness modes (ScaleBrightnessMode):
 *   educational : ambient boost so all bodies visible. Not physically accurate.
 *   physical    : 1/r² falloff from Sun. Outer planets dark. Accurate.
 *
 * None of these combinations produce a "real scale" view unless stated.
 * The inspector must always show which modes are active.
 */
```

- [ ] **Step 2: Add `ScaleModeSet` type (optional: used by inspector)**

```ts
export type ScaleModeSet = {
  distance: ScaleDistanceMode;
  radius: ScaleRadiusMode;
  brightness: ScaleBrightnessMode;
};

export const SCALE_MODE_DISCLAIMERS: Record<ScaleDistanceMode, { it: string; en: string }> = {
  compressed: {
    it: "Distanza compressa (1 AU = 1 unità). Non in scala reale.",
    en: "Compressed distance (1 AU = 1 unit). Not to scale.",
  },
  "real-log": {
    it: "Distanza logaritmica. Preserva la struttura globale. Non in scala reale.",
    en: "Logarithmic distance. Preserves large-scale structure. Not to scale.",
  },
  "inner-system": {
    it: "Sistema interno espanso ×3. Non in scala reale.",
    en: "Inner system expanded ×3. Not to scale.",
  },
};

export const RADIUS_MODE_DISCLAIMERS: Record<ScaleRadiusMode, { it: string; en: string }> = {
  visible: {
    it: "Raggio visivo educativo (esagerato, dipendente dalla categoria). Non in scala reale.",
    en: "Educational visible radius (exaggerated, category-dependent). Not to scale.",
  },
  relative: {
    it: "Raggio proporzionale al Sole. Ancora esagerato rispetto alle distanze.",
    en: "Radius proportional to the Sun. Still exaggerated relative to distances.",
  },
};
```

- [ ] **Step 3: Update inspector in `solar-system-view.tsx` to show active scale modes**

In the inspector, replace the current radius mode disclosure row (added in Sprint 02) with a richer "Active scales" section:

```tsx
<div className="solar-inspector__divider" />
<div className="solar-inspector__row" style={{ flexDirection: "column", gap: 3 }}>
  <span className="solar-inspector__label">
    {locale === "it" ? "Scale attive" : "Active scales"}
  </span>
  <span style={{ fontSize: "0.60rem", color: "#4a7090" }}>
    {SCALE_MODE_DISCLAIMERS[distanceMode][locale]}
  </span>
  <span style={{ fontSize: "0.60rem", color: "#4a7090" }}>
    {RADIUS_MODE_DISCLAIMERS[radiusMode][locale]}
  </span>
</div>
```

Import `SCALE_MODE_DISCLAIMERS` and `RADIUS_MODE_DISCLAIMERS` from scales.ts.

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add lib/solar-system/scales.ts components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "feat(solar-system): explicit scale mode documentation and inspector disclosure"
```

---

## Task 8: Inspector Reference Frame and Data Quality

**Files:**
- Modify: `components/lab/solar-system-view.tsx`
- Modify: `lib/solar-system/i18n.ts`

The inspector must show: reference frame name, epoch, data source, position accuracy class.

- [ ] **Step 1: Import reference frame in view**

```ts
import { REFERENCE_FRAME } from "@/lib/solar-system/reference-frames";
import { MVP_KEPLERIAN_QUALITY } from "@/lib/solar-system/data-quality";
```

- [ ] **Step 2: Add reference frame row to inspector**

After the epoch row, add:
```tsx
<div className="solar-inspector__row">
  <span className="solar-inspector__label">
    {locale === "it" ? "Frame" : "Frame"}
  </span>
  <span className="solar-inspector__value" style={{ fontSize: "0.65rem" }}>
    {REFERENCE_FRAME.id}
  </span>
</div>

<div className="solar-inspector__row">
  <span className="solar-inspector__label">
    {locale === "it" ? "Precisione" : "Accuracy"}
  </span>
  <span className="solar-inspector__value" style={{ fontSize: "0.65rem", color: "#7aa0c0" }}>
    {MVP_KEPLERIAN_QUALITY.positionAccuracy}
  </span>
</div>
```

- [ ] **Step 3: Add frame note to i18n and inspector bottom**

In `SOLAR_UI.it`, add:
```ts
frameNote: "Frame: Eclittica Eliocentrica J2000.0 (HEC-J2000). Posizioni calcolate da elementi kepleriani, non da integrazione numerica.",
```

In `SOLAR_UI.en`, add:
```ts
frameNote: "Frame: Heliocentric Ecliptic J2000.0 (HEC-J2000). Positions computed from Keplerian elements, not numerical integration.",
```

Add below the epochNote paragraph in the inspector:
```tsx
<p style={{ fontSize: "0.60rem", color: "#4a7090", lineHeight: 1.5, margin: 0 }}>
  {t.frameNote}
</p>
```

- [ ] **Step 4: Run typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add components/lab/solar-system-view.tsx lib/solar-system/i18n.ts
git commit -m "feat(solar-system): reference frame and data quality in inspector"
```

---

## Task 9: Physical Realism Audit Extensions

**Files:**
- Modify: `scripts/solar-system/audit-orbits.ts`

The audit must verify the new physical realism properties.

- [ ] **Step 1: Add physical realism checks to audit**

Append to `audit-orbits.ts` before the summary:

```ts
import { getBodyOrientation } from "../../lib/solar-system/rotation-model";
import { isRetrogradRotation } from "../../lib/solar-system/rotation-model";

console.log("\n--- Axial tilt and rotation checks [sprint 03A spec] ---");

const TILT_CHECKS: Array<{ id: string; expectedTiltMin: number; expectedTiltMax: number }> = [
  { id: "earth",   expectedTiltMin: 23.0, expectedTiltMax: 24.0 },
  { id: "saturn",  expectedTiltMin: 26.0, expectedTiltMax: 28.0 },
  { id: "uranus",  expectedTiltMin: 96.0, expectedTiltMax: 99.0 },
  { id: "venus",   expectedTiltMin: 176.0, expectedTiltMax: 178.0 },
];

for (const check of TILT_CHECKS) {
  const body = bodyById.get(check.id);
  if (!body) { console.log(`  [WARN] body not found: ${check.id}`); warnings++; continue; }
  const tilt = body.axialTiltDeg ?? 0;
  const ok = tilt >= check.expectedTiltMin && tilt <= check.expectedTiltMax;
  console.log(`  ${ok ? "    OK" : " [WARN]"} ${check.id.padEnd(8)} axialTilt=${tilt.toFixed(3)}° (expected ${check.expectedTiltMin}–${check.expectedTiltMax}°)`);
  if (!ok) warnings++;
}

const RETROGRADE_BODIES = ["venus", "uranus", "pluto"];
console.log("\n--- Retrograde rotation checks ---");
for (const id of RETROGRADE_BODIES) {
  const body = bodyById.get(id);
  if (!body) { console.log(`  [WARN] body not found: ${id}`); warnings++; continue; }
  const isRetro = isRetrogradRotation(body);
  console.log(`  ${isRetro ? "    OK" : " [WARN]"} ${id.padEnd(8)} retrograde=${isRetro}`);
  if (!isRetro) warnings++;
}

const RING_BODIES = ["saturn", "uranus"];
console.log("\n--- Ring system checks ---");
for (const id of RING_BODIES) {
  const body = bodyById.get(id);
  if (!body) { console.log(`  [WARN] body not found: ${id}`); warnings++; continue; }
  const hasRings = body.ringInnerKm !== undefined && body.ringOuterKm !== undefined;
  const innerOk = hasRings && (body.ringInnerKm! > body.radiusKm);
  console.log(`  ${hasRings && innerOk ? "    OK" : " [WARN]"} ${id.padEnd(8)} rings=${hasRings} inner=${body.ringInnerKm ?? "—"} km outer=${body.ringOuterKm ?? "—"} km (radiusKm=${body.radiusKm})`);
  if (!hasRings || !innerOk) warnings++;
}
```

- [ ] **Step 2: Run audit**

```bash
pnpm solar:audit
```

Expected: all new checks pass (exit 0).

- [ ] **Step 3: Commit**

```bash
git add scripts/solar-system/audit-orbits.ts
git commit -m "test(solar-system): axial tilt, retrograde and ring system audit checks"
```

---

## Task 10: Manual and About Updates

**Files:**
- Modify: `components/lab/solar-system-manual-view.tsx`
- Modify: `components/lab/solar-system-about-view.tsx`

- [ ] **Step 1: Add reference frame section to manual (IT + EN)**

Add a new section "Sistema di riferimento / Reference frame":

**IT:**
```
Il laboratorio calcola le posizioni dei corpi nel sistema di riferimento Eclittica Eliocentrica J2000.0 (HEC-J2000). L'origine è il baricentro del Sistema Solare (approssimato al Sole). Il piano xy corrisponde al piano dell'eclittica a J2000.0; l'asse x punta verso l'equinozio di primavera.

Questo sistema non coincide con le coordinate equatoriali ICRF/J2000 (usate ad esempio da SIMBAD). La conversione richiede una rotazione di ~23.44° attorno all'asse x (obliquità dell'eclittica).

Le posizioni sono calcolate da elementi kepleriani, non da integrazioni numeriche. Precisione tipica: pochi milioni di km su scale di anni.
```

**EN:**
```
The lab computes body positions in the Heliocentric Ecliptic J2000.0 frame (HEC-J2000). Origin: Solar System Barycentre (approximated to the Sun). The xy-plane is the ecliptic at J2000.0; the x-axis points toward the vernal equinox.

This is not the same as equatorial ICRF/J2000 (used e.g. by SIMBAD). The conversion requires a rotation of ~23.44° around the x-axis (obliquity of the ecliptic).

Positions are computed from Keplerian elements, not numerical integrations. Typical accuracy: a few million km over multi-year timescales.
```

- [ ] **Step 2: Add axial tilt and rotation section to manual**

**IT:**
```
Inclinazione assiale e rotazione: i pianeti principali mostrano l'inclinazione assiale reale (obliquità rispetto all'eclittica, dati IAU 2015). Venere ruota in modo retrogrado (asse inclinato di 177°), così come Urano (98°) e Plutone (122°). La fase di rotazione (faccia illuminata/in ombra) segue il periodo siderale reale a partire dall'epoca J2000.

Nota tecnica: l'azimut del polo è approssimato. La direzione precisa del polo richiede RA/Dec IAU WGCCRE, non ancora implementati.
```

**EN:**
```
Axial tilt and rotation: major planets show their real axial inclination (obliquity to the ecliptic, IAU 2015 data). Venus rotates retrograde (177° tilt), as do Uranus (98°) and Pluto (122°). The rotation phase (lit/dark side) follows the real sidereal period from the J2000.0 epoch.

Technical note: the pole azimuth is approximated. Precise pole direction requires IAU WGCCRE RA/Dec values, not yet implemented.
```

- [ ] **Step 3: Add lighting section to manual**

**IT:**
```
Illuminazione: in modalità "Fisica (1/r²)" la luce solare segue la legge dell'inverso del quadrato della distanza. I pianeti esterni sono scuri come nella realtà. In modalità "Educativa (boost)" viene aggiunta una luce ambientale dichiarata per mantenere visibili tutti i pianeti. La modalità attiva è sempre indicata nell'ispettore.
```

**EN:**
```
Lighting: in "Physical (1/r²)" mode the solar illumination follows the inverse-square law. Outer planets are as dark as in reality. In "Educational (boost)" mode a declared ambient boost is added to keep all planets visible. The active mode is always shown in the inspector.
```

- [ ] **Step 4: Update about page — stack and limitations sections**

In the stack section, add the new libs:
- `lib/solar-system/reference-frames.ts` — HEC-J2000 frame documentation
- `lib/solar-system/rotation-model.ts` — IAU 2015 axial tilt and sidereal rotation
- `lib/solar-system/lighting-model.ts` — physical and educational lighting modes

In the limitations section, update to reflect Sprint 03A:
- Orbital positions: Keplerian elements in HEC-J2000 (not numerical integration; not live Horizons vectors yet)
- Axial tilt: magnitude correct (IAU 2015); pole azimuth direction approximated
- Rotation phase: computed from sidereal period since J2000; precession and nutation not modelled
- Rings: Saturn and Uranus rings in equatorial plane, simplified geometry (no Cassini Division, no ring divisions)
- Lighting: physical 1/r² available; default is educational boost mode (declared)

- [ ] **Step 5: Run typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Both must pass.

- [ ] **Step 6: Commit**

```bash
git add components/lab/solar-system-manual-view.tsx components/lab/solar-system-about-view.tsx
git commit -m "docs(solar-system): reference frames, axial tilt, lighting documentation"
```

---

## Task 11: Final Verification Sprint 03A

- [ ] **Step 1: Run full audit**

```bash
pnpm solar:audit
```

Expected: all checks pass — including the new axial tilt, retrograde, and ring system checks.

- [ ] **Step 2: Run typecheck and build**

```bash
pnpm typecheck
pnpm build
```

Both must pass with 0 errors.

- [ ] **Step 3: Browser desktop check at `/lab/sistema-solare`**

Verify visually:
- [ ] Saturn has rings inclined at ~27° to the ecliptic plane
- [ ] Uranus has faint rings inclined nearly edge-on (~98°)
- [ ] Venus tilt is visible (retrograde = "upside down" rotation relative to orbital direction)
- [ ] Earth's tilt ~23° is visible
- [ ] Switching to "Fisica (1/r²)" makes outer planets (Uranus, Neptune) noticeably darker
- [ ] Inspector shows `HEC-J2000`, position accuracy, lighting disclosure
- [ ] "Active scales" section in inspector shows distance + radius mode disclaimers
- [ ] Tavola periodica unaffected

- [ ] **Step 4: Browser mobile check**

- [ ] Lighting mode selector hidden on mobile (`.solar-toolbar__hide-sm`)
- [ ] Saturn rings visible on mobile when Saturn is selected

- [ ] **Step 5: Commit any polish**

```bash
git add <changed-files>
git commit -m "fix(solar-system): Sprint 03A visual polish"
```

---

## Acceptance Criteria Sprint 03A

- [ ] `pnpm solar:audit` passes — including axial tilt, retrograde and ring checks
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Saturn rings visible and correctly inclined
- [ ] Uranus rings visible and near edge-on
- [ ] Venus, Uranus, Pluto flagged as retrograde in inspector
- [ ] Physical lighting mode available and correctly darkens outer planets
- [ ] Inspector shows reference frame (HEC-J2000), position accuracy, active scale modes
- [ ] Manual documents: reference frame, axial tilt caveat, lighting modes, ring simplifications
- [ ] Tavola periodica unaffected

---

## What Is Not in Sprint 03A

| Feature | Sprint |
|---------|--------|
| IAU WGCCRE pole RA/Dec for precise pole orientation | 04 |
| Precession and nutation of rotation axes | 04 |
| Saturn ring divisions (Cassini Division, etc.) | 04 |
| Ring shadow on planet surface | 05 |
| Full catalog (SBDB) | 03B |
| JPL Horizons live vectors | 03B |
| CelesTrak/SGP4 | 04 |
| Textures | 05 |
