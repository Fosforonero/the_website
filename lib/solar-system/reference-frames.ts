/**
 * Reference frame definitions for the Solar System Lab.
 *
 * All positions produced by lib/solar-system/ephemeris.ts use the
 * Heliocentric Ecliptic J2000.0 frame (HEC-J2000).
 *
 * What is HEC-J2000:
 *   Origin : Solar System Barycentre (approximated to the Sun in this lab)
 *   xy-plane: Mean ecliptic plane at J2000.0
 *   x-axis  : Direction of mean vernal equinox (Aries) at J2000.0
 *   z-axis  : Ecliptic north pole
 *   Units   : kilometres
 *   Epoch   : J2000.0 = 2000-Jan-01 12:00:00 TT = JD 2451545.0
 *
 * What HEC-J2000 is NOT:
 *   It is NOT the ICRF / equatorial J2000 frame (used by SIMBAD, Gaia, etc.).
 *   Conversion to equatorial requires a ~23.44° rotation around x (obliquity).
 *
 * What is approximated in this lab:
 *   - The origin is the Sun, not the true Solar System Barycentre.
 *   - Positions are Keplerian, not numerically integrated.
 *   - Planetary pole orientations use IAU 2015 obliquity but not full
 *     IAU WGCCRE RA/Dec for each pole (implemented in Sprint 04).
 *
 * What will be improved in Sprint 04:
 *   - IAU WGCCRE pole RA/Dec for precise axial orientation per body.
 *   - Precession and nutation of rotation axes.
 *   - Optional barycentric origin for multi-body systems.
 */

export const REFERENCE_FRAME = {
  id: "HEC-J2000",
  name: {
    it: "Eclittica Eliocentrica J2000.0",
    en: "Heliocentric Ecliptic J2000.0",
  },
  epoch: {
    label: "J2000.0",
    jd: 2_451_545.0,
    iso: "2000-01-01T12:00:00Z",
    description: {
      it: "J2000.0 = 1 gennaio 2000 ore 12:00:00 TT (Terrestrial Time) = JD 2451545.0",
      en: "J2000.0 = 1 January 2000 12:00:00 TT (Terrestrial Time) = JD 2451545.0",
    },
  },
  origin: {
    it: "Baricentro del Sistema Solare (approssimato al Sole in questo laboratorio)",
    en: "Solar System Barycentre (approximated to the Sun in this lab)",
  },
  xyPlane: {
    it: "Piano dell'eclittica medio a J2000.0",
    en: "Mean ecliptic plane at J2000.0",
  },
  xAxis: {
    it: "Equinozio di primavera medio a J2000.0 (direzione dell'Ariete)",
    en: "Mean vernal equinox at J2000.0 (direction of Aries)",
  },
  zAxis: {
    it: "Polo nord dell'eclittica",
    en: "Ecliptic north pole",
  },
  units: "km",
  abbreviation: "HEC-J2000",
  disclaimer: {
    it: "Posizioni calcolate da elementi kepleriani. Precisione: pochi milioni di km su scale di anni. Non sono vettori live JPL Horizons.",
    en: "Positions computed from Keplerian elements. Accuracy: a few million km over multi-year timescales. Not live JPL Horizons vectors.",
  },
  approximations: {
    it: [
      "Origine al Sole, non al vero baricentro del Sistema Solare.",
      "Orientamento del polo planetario: obliquità IAU 2015 corretta, azimut del polo approssimato (RA/Dec IAU WGCCRE in Sprint 04).",
      "Precessione e nutazione degli assi non modellate.",
    ],
    en: [
      "Origin at the Sun, not the true Solar System Barycentre.",
      "Planetary pole orientation: IAU 2015 obliquity correct; pole azimuth approximated (IAU WGCCRE RA/Dec in Sprint 04).",
      "Precession and nutation of rotation axes not modelled.",
    ],
  },
} as const;

/** IAU 2006 obliquity of the ecliptic at J2000.0 (degrees). */
export const ECLIPTIC_OBLIQUITY_DEG = 23.43929111;

/**
 * Rotate a 3-vector from Heliocentric Ecliptic J2000.0 to
 * Heliocentric Equatorial J2000.0 (ICRF approximation).
 * Rotation: −obliquity around x-axis.
 */
export function eclipticToEquatorialJ2000(
  pos: [number, number, number]
): [number, number, number] {
  const eps = (ECLIPTIC_OBLIQUITY_DEG * Math.PI) / 180;
  const c = Math.cos(eps);
  const s = Math.sin(eps);
  return [pos[0], c * pos[1] - s * pos[2], s * pos[1] + c * pos[2]];
}

/**
 * Three.js scene frame note.
 *
 * The scene renders positions with direct component mapping:
 *   ecliptic x → scene x
 *   ecliptic y → scene y
 *   ecliptic z → scene z
 *
 * In Three.js (Y-up), the ecliptic plane appears as the XY plane.
 * The ecliptic north pole is scene +Z.
 * This is consistent but unusual — Y is NOT "up" in the astronomical sense.
 *
 * Do NOT change this mapping without updating ephemeris.ts, scales.ts,
 * orbit path rendering and all axial tilt logic.
 */
export const SCENE_COORD_NOTE =
  "Scene frame: ecliptic x→sceneX, y→sceneY, z→sceneZ. " +
  "Ecliptic plane ≈ scene XY. Ecliptic north pole = scene +Z.";
