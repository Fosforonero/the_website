// GET /api/sitebrain/license/version
// Returns latest plugin version info + download URL.
// Validated: download_url must start with a trusted origin.

import { NextRequest, NextResponse } from "next/server";
import { findByKey, isValidKeyFormat, isLicenseValid } from "@/lib/sitebrain-license";

const TRUSTED_DOWNLOAD_ORIGIN = "https://fosforonero.com";
const CURRENT_VERSION = process.env.SB_PRO_VERSION ?? "1.0.2";
const PRO_DOWNLOAD_URL = process.env.SB_PRO_DOWNLOAD_URL ?? "";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get("x-sitebrain-license") ?? "";
  const siteUrl    = req.headers.get("x-sitebrain-site") ?? "";

  if (!isValidKeyFormat(authHeader)) {
    return NextResponse.json({ error: "Missing or invalid license header." }, { status: 401 });
  }

  const license = await findByKey(authHeader);
  if (!license || !isLicenseValid(license)) {
    return NextResponse.json({ error: "Invalid or expired license." }, { status: 403 });
  }

  // Validate download URL origin before serving it.
  const downloadUrl =
    PRO_DOWNLOAD_URL.startsWith(TRUSTED_DOWNLOAD_ORIGIN) ? PRO_DOWNLOAD_URL : "";

  return NextResponse.json({
    version: CURRENT_VERSION,
    tested_up_to: "6.8",
    requires: "6.0",
    requires_php: "8.0",
    download_url: downloadUrl,
    tier: license.tier,
    expires_at: license.expires_at,
  });
}
