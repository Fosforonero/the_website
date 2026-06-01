import { NextResponse } from "next/server";
import {
  resolveLatestGibsDate,
  GIBS_ATTRIBUTION,
  GIBS_SOURCE_URL,
  GIBS_LAYER,
  GIBS_CADENCE,
} from "@/lib/solar-system/gibs";

// Refresh the resolved metadata daily (the product itself is a daily mosaic).
export const revalidate = 21600; // 6h: re-check for a newer available date

/**
 * Returns metadata about the latest available near-real-time Earth imagery.
 * The texture itself is served (proxied, WebGL-safe, same-origin) from
 * /api/solar/earth-imagery/texture?date=YYYY-MM-DD.
 *
 * Honesty: this is a DAILY global mosaic, not hourly. If GIBS has no recent
 * data we say so — we never fabricate a date or image.
 */
export async function GET() {
  const date = await resolveLatestGibsDate();

  if (!date) {
    return NextResponse.json(
      {
        available: false,
        source: GIBS_ATTRIBUTION,
        sourceUrl: GIBS_SOURCE_URL,
        cadence: GIBS_CADENCE,
        error: "No recent GIBS imagery available",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    available: true,
    date,
    layer: GIBS_LAYER,
    source: GIBS_ATTRIBUTION,
    sourceUrl: GIBS_SOURCE_URL,
    cadence: GIBS_CADENCE,
    textureUrl: `/api/solar/earth-imagery/texture?date=${date}`,
  });
}
