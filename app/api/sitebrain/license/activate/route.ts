// POST /api/sitebrain/license/activate
// Body: { license_key: string, site_url: string, plugin_version?: string }
// Called by the WordPress sitebrain-ai-pro add-on on activation.

import { NextRequest, NextResponse } from "next/server";
import {
  findByKey,
  activateSite,
  isValidKeyFormat,
  isLicenseValid,
  normaliseSiteUrl,
  tierFeatures,
} from "@/lib/sitebrain-license";

// Simple in-memory rate limiter — good enough for low-volume license ops.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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
    return NextResponse.json({ success: false, error: "Too many requests." }, { status: 429 });
  }

  let body: { license_key?: string; site_url?: string; plugin_version?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { license_key, site_url } = body;

  if (!license_key || typeof license_key !== "string") {
    return NextResponse.json({ success: false, error: "Missing license_key." }, { status: 400 });
  }
  if (!site_url || typeof site_url !== "string") {
    return NextResponse.json({ success: false, error: "Missing site_url." }, { status: 400 });
  }
  if (!isValidKeyFormat(license_key)) {
    return NextResponse.json({ success: false, error: "Invalid license key format." }, { status: 400 });
  }

  const license = await findByKey(license_key);

  if (!license) {
    return NextResponse.json({ success: false, error: "License not found." }, { status: 404 });
  }
  if (!isLicenseValid(license)) {
    return NextResponse.json(
      { success: false, error: "License is not active or has expired." },
      { status: 403 },
    );
  }

  const normalised = normaliseSiteUrl(site_url);
  const alreadyActivated = license.active_sites.includes(normalised);

  if (!alreadyActivated && license.active_sites.length >= license.max_sites) {
    return NextResponse.json(
      {
        success: false,
        error: `Site limit reached (${license.max_sites}). Deactivate another site first.`,
      },
      { status: 403 },
    );
  }

  await activateSite(license.id, site_url, license.active_sites);

  return NextResponse.json({
    success: true,
    tier: license.tier,
    expires_at: license.expires_at,
    features: tierFeatures(license.tier),
    max_sites: license.max_sites,
    active_sites: license.active_sites.length + (alreadyActivated ? 0 : 1),
  });
}
