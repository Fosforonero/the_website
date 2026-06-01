# Handoff — Solar Wind, Magnetic Fields And Their Interactions

> **Status:** DEFERRED. Write-now / implement-later. Do **not** implement until the
> real-data observatory and the Newtonian playground are stable and Matteo
> explicitly schedules this sprint ("quando ci arriviamo").
>
> **For agentic workers:** when this sprint is activated, use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans` and
> read the governance + roadmap first. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add a scientifically-honest space-weather layer to the Solar System Lab:
the solar wind, planetary magnetic fields (magnetospheres), the interplanetary
magnetic field (IMF), and the interactions between them (bow shock, magnetopause,
aurorae, CME/storm impacts). Every element must carry a visible model label, a
data-source label and a validation check, exactly like every other physics layer.

**Hard rule (inherited from governance):** the app must never pretend the model is
more complete than it is. This is a **visualization + analytic-approximation**
layer, **not** a magnetohydrodynamics (MHD) plasma solver. Label it as such
everywhere.

---

## Read First

1. `docs/solar-system/governance.md`
2. `docs/solar-system/ultimate-simulator-roadmap.md`
3. `docs/solar-system/architecture-spec.md`
4. The most recent completed sprint handoff.

## Strict Scope (when activated)

In scope:

- **Solar wind field**: radial outflow from the Sun with speed/density that vary
  with a chosen activity level; visualized as direction + a scalar field, not a
  particle plasma simulation.
- **Interplanetary magnetic field (IMF)**: Parker spiral visualization (analytic),
  labeled `parker-spiral-approx`.
- **Planetary dipole fields**: simple tilted magnetic dipole per body that has one
  (Mercury, Earth, Jupiter, Saturn, Uranus, Neptune, Ganymede), using published
  dipole moment, polarity and tilt. Field lines rendered analytically.
- **Interaction structures (analytic, parametric)**: bow shock + magnetopause
  standoff distance from a pressure-balance approximation
  (solar-wind dynamic pressure vs planetary magnetic pressure), not from MHD.
- **Aurora ovals**: schematic high-latitude oval whose intensity scales with the
  chosen activity level; explicitly schematic.
- **Event mode**: discrete "CME / geomagnetic storm" presets that raise the
  activity level and visibly expand aurora / compress the magnetopause. Labeled
  as scenario, with date/source when tied to a real historical event.
- **Inspector + manual/about disclosure** in IT/EN.
- **Audit checks** asserting model labels exist and no MHD/"real plasma" claims.

Out of scope (do NOT implement here):

- no MHD / kinetic / PIC plasma solver;
- no real-time particle precipitation physics;
- no radiation-belt (Van Allen) particle dynamics engine;
- no claim of "real" or "physically complete" magnetosphere;
- no coupling into the N-body gravity integrator;
- no space-weather *forecasting* claims;
- no reentry / satellite-drag modeling.

## Model Labels (add to the governance honesty enum)

- `solar-wind-approx`: radial outflow + analytic IMF (Parker spiral), parametric
  activity level. No plasma transport solver.
- `dipole-field-approx`: tilted magnetic dipole from published moments. No
  multipole, no internal dynamo model.
- `magnetosphere-standoff-approx`: pressure-balance standoff distance only. Bow
  shock / magnetopause shapes are parametric surfaces, not solved.
- `aurora-schematic`: schematic oval driven by activity level, not by modeled
  particle flux.

Every UI element using these MUST show its label and a one-line plain-language
caveat in IT and EN.

## Data Sources (real, when activated)

- **NOAA SWPC** (Space Weather Prediction Center): real-time solar-wind speed,
  density, IMF Bz from DSCOVR/ACE — for an optional "live activity level" mode.
  - Products JSON: `https://services.swpc.noaa.gov/products/...`
- **NASA OMNIWeb / OMNI**: historical solar-wind + IMF for validating ranges.
- **IAU / published planetary magnetic dipole parameters**: dipole moment,
  polarity, tilt and offset per magnetized body (peer-reviewed values, cited).
- **NASA/ESA mission references** (Parker Solar Probe, ACE, Cluster, MMS) for
  documentation framing only — not as runtime dependencies.

Refresh rules mirror the catalog rules: any "live" space-weather value must show
retrieval time, source URL and a data-quality label. If live data is unavailable,
fall back to a labeled parametric activity level — never fabricate values.

## Validation Targets (must pass before claiming the model)

- Solar-wind speed default sits in the documented ~300–800 km/s range.
- Earth magnetopause standoff distance is ~10 Earth radii at nominal solar-wind
  pressure (order-of-magnitude check).
- Jupiter's magnetosphere standoff is dramatically larger than Earth's
  (qualitative ordering check), reflecting its far larger dipole moment.
- Unmagnetized bodies (Venus, Mars) show **no** intrinsic dipole; if any induced
  interaction is drawn it is labeled induced/atmospheric, not intrinsic.
- Aurora oval intensity increases when the activity/storm level increases.
- Every value displays its model label and uncertainty.

## Suggested Task Breakdown (when activated)

- [ ] Task 0 — Baseline verify (`pnpm solar:audit`, `tsc`, `build`).
- [ ] Task 1 — Add magnetic-dipole fields to `bodies.ts` for magnetized bodies
  (moment, polarity, tilt), all cited; `null` for unmagnetized bodies.
- [ ] Task 2 — `lib/solar-system/space-weather.ts`: Parker spiral, pressure-balance
  standoff, dipole field-line sampler, activity-level model. Pure functions,
  unit-tested.
- [ ] Task 3 — Scene layers: solar-wind direction field, IMF spiral, per-body
  dipole field lines, parametric bow-shock/magnetopause surfaces, aurora ovals.
  All toggleable, all off by default.
- [ ] Task 4 — Optional live activity mode via a NOAA SWPC proxy API route
  (server-side, cached), with honest disclosure and graceful fallback.
- [ ] Task 5 — Event presets (e.g. a labeled historical geomagnetic storm).
- [ ] Task 6 — Inspector + manual + about disclosure IT/EN; governance honesty
  enum updated.
- [ ] Task 7 — Audit checks for model labels and absence of MHD/"real plasma"
  claims; final `audit` + `tsc` + `build` + browser verification.

## Final Report Required (when activated)

Commit hash; files changed; which bodies got dipole fields; model labels added;
data sources actually wired vs parametric; validation results; audit/typecheck/
build; browser verification; remaining limitations; proposed next sprint.
