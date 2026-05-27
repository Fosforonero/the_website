// POST /api/sitebrain/license/deactivate
// Body: { license_key: string, site_url: string }

import { NextRequest, NextResponse } from "next/server";
import {
  findByKey,
  deactivateSite,
  isValidKeyFormat,
  normaliseSiteUrl,
} from "@/lib/sitebrain-license";

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

  let body: { license_key?: string; site_url?: string };
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

  const normalised = normaliseSiteUrl(site_url);
  if (!license.active_sites.includes(normalised)) {
    // Idempotent — site was already not activated, return success.
    return NextResponse.json({ success: true });
  }

  await deactivateSite(license.id, site_url, license.active_sites);

  return NextResponse.json({ success: true });
}
