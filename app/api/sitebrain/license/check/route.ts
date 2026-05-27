// POST /api/sitebrain/license/check
// Body: { license_key: string, site_url: string }
// Called periodically by the plugin (every ~12h) to validate the license.

import { NextRequest, NextResponse } from "next/server";
import {
  findByKey,
  isValidKeyFormat,
  isLicenseValid,
  normaliseSiteUrl,
  tierFeatures,
} from "@/lib/sitebrain-license";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ valid: false, error: "Too many requests." }, { status: 429 });
  }

  let body: { license_key?: string; site_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { license_key, site_url } = body;

  if (!license_key || !site_url || !isValidKeyFormat(license_key)) {
    return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
  }

  const license = await findByKey(license_key);

  if (!license || !isLicenseValid(license)) {
    return NextResponse.json({ valid: false, tier: null });
  }

  const normalised = normaliseSiteUrl(site_url);
  const siteRegistered = license.active_sites.includes(normalised);

  if (!siteRegistered) {
    return NextResponse.json({
      valid: false,
      error: "This site is not registered for this license.",
    });
  }

  return NextResponse.json({
    valid: true,
    tier: license.tier,
    expires_at: license.expires_at,
    features: tierFeatures(license.tier),
  });
}
