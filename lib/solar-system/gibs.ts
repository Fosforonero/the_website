/**
 * NASA GIBS (Global Imagery Browse Services) helper.
 *
 * Provides a near-real-time global Earth image from real satellite data
 * (VIIRS Corrected Reflectance, True Color). The image is an actual satellite
 * photo, so it shows the REAL cloud state — but the global mosaic product is
 * refreshed DAILY, not hourly. That cadence is disclosed in the UI.
 *
 * Source: NASA EOSDIS Worldview Snapshots API (public, no API key).
 *   https://wvs.earthdata.nasa.gov/
 *
 * NASA imagery is generally free to use for educational purposes; credit NASA
 * EOSDIS GIBS / Worldview. We proxy the image through our own API route so the
 * texture is same-origin (WebGL-safe, no CORS taint) and cacheable.
 */

export const GIBS_LAYER = "VIIRS_NOAA20_CorrectedReflectance_TrueColor";
export const GIBS_SOURCE_URL = "https://wvs.earthdata.nasa.gov/";
export const GIBS_ATTRIBUTION =
  "NASA EOSDIS GIBS / Worldview — VIIRS (NOAA-20) Corrected Reflectance True Color";
export const GIBS_CADENCE = "daily" as const;

const GIBS_UA = "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)";

/** Build a Worldview Snapshot URL for a full-globe equirectangular image. */
export function buildGibsSnapshotUrl(
  dateIso: string,
  width = 2048,
  height = 1024
): string {
  const params = new URLSearchParams({
    REQUEST: "GetSnapshot",
    LAYERS: GIBS_LAYER,
    CRS: "EPSG:4326",
    TIME: dateIso,
    BBOX: "-90,-180,90,180",
    WIDTH: String(width),
    HEIGHT: String(height),
    FORMAT: "image/jpeg",
  });
  return `https://wvs.earthdata.nasa.gov/api/v1/snapshot?${params.toString()}`;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve the most recent date for which GIBS actually has imagery.
 * Probes a tiny image and reads the `data-present` response header.
 * Returns null if no date in the look-back window has data (fail loud — the
 * caller must then disclose that live imagery is unavailable, never fake it).
 */
export async function resolveLatestGibsDate(
  maxLookbackDays = 5
): Promise<string | null> {
  const now = new Date();
  for (let i = 0; i <= maxLookbackDays; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const date = isoDate(d);
    try {
      const res = await fetch(buildGibsSnapshotUrl(date, 8, 4), {
        headers: { "User-Agent": GIBS_UA },
        cache: "no-store",
      });
      if (res.ok && res.headers.get("data-present") !== "false") {
        return date;
      }
    } catch {
      // network hiccup — try the previous day
    }
  }
  return null;
}

/** Fetch the full-resolution proxied image bytes for a given date. */
export async function fetchGibsImage(
  dateIso: string,
  width = 2048,
  height = 1024
): Promise<Response> {
  return fetch(buildGibsSnapshotUrl(dateIso, width, height), {
    headers: { "User-Agent": GIBS_UA },
    cache: "no-store",
  });
}
