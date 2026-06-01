import { NextRequest, NextResponse } from "next/server";
import { fetchGibsImage, resolveLatestGibsDate } from "@/lib/solar-system/gibs";

// Cache the proxied image for a day; the underlying mosaic is daily.
export const revalidate = 86400;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Proxies the NASA GIBS global Earth image as a same-origin texture so it can
 * be uploaded to a WebGL material without a CORS taint. Daily-cadence product.
 */
export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("date");
  const date = requested && DATE_RE.test(requested)
    ? requested
    : await resolveLatestGibsDate();

  if (!date) {
    return NextResponse.json(
      { error: "No recent GIBS imagery available" },
      { status: 502 }
    );
  }

  const upstream = await fetchGibsImage(date, 2048, 1024);
  if (!upstream.ok || upstream.headers.get("data-present") === "false") {
    return NextResponse.json(
      { error: `GIBS ${upstream.status}`, date },
      { status: 502 }
    );
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      "X-Imagery-Date": date,
      "X-Imagery-Source": "NASA EOSDIS GIBS / Worldview",
    },
  });
}
