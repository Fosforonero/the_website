// SiteBrain AI license server — Supabase-backed helpers.
// Table: sitebrain_licenses (create via Supabase SQL editor, see SQL below).
//
// CREATE TABLE sitebrain_licenses (
//   id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
//   license_key  text        UNIQUE NOT NULL,
//   tier         text        NOT NULL CHECK (tier IN ('pro','studio','agency')),
//   max_sites    int         NOT NULL DEFAULT 1,
//   active_sites jsonb       NOT NULL DEFAULT '[]',
//   customer_email text      NOT NULL,
//   stripe_subscription_id text,
//   stripe_customer_id     text,
//   expires_at   timestamptz,
//   status       text        NOT NULL DEFAULT 'active'
//                            CHECK (status IN ('active','expired','cancelled','suspended')),
//   created_at   timestamptz NOT NULL DEFAULT now(),
//   updated_at   timestamptz NOT NULL DEFAULT now()
// );
// CREATE INDEX ON sitebrain_licenses (license_key);
// CREATE INDEX ON sitebrain_licenses (stripe_subscription_id);

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.SB_SUPABASE_URL!,
  process.env.SB_SUPABASE_SERVICE_ROLE_KEY!,
);

const TABLE = "sitebrain_licenses";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LicenseTier = "pro" | "studio" | "agency";
export type LicenseStatus = "active" | "expired" | "cancelled" | "suspended";

export interface License {
  id: string;
  license_key: string;
  tier: LicenseTier;
  max_sites: number;
  active_sites: string[];
  customer_email: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  expires_at: string | null;
  status: LicenseStatus;
  created_at: string;
  updated_at: string;
}

// ─── Key generation ───────────────────────────────────────────────────────────

const TIER_PREFIX: Record<LicenseTier, string> = {
  pro: "PRO",
  studio: "STU",
  agency: "AGE",
};

export function generateKey(tier: LicenseTier): string {
  const prefix = TIER_PREFIX[tier];
  const part1 = randomBytes(4).toString("hex").toUpperCase();
  const part2 = randomBytes(4).toString("hex").toUpperCase();
  const part3 = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${part1}-${part2}-${part3}`;
}

export function isValidKeyFormat(key: string): boolean {
  return /^(PRO|STU|AGE)-[0-9A-F]{8}-[0-9A-F]{8}-[0-9A-F]{8}$/.test(key);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function findByKey(key: string): Promise<License | null> {
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .eq("license_key", key)
    .single();
  return data ?? null;
}

export async function findBySubscription(
  subscriptionId: string,
): Promise<License | null> {
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .single();
  return data ?? null;
}

export async function createLicense(params: {
  tier: LicenseTier;
  customerEmail: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  expiresAt?: Date;
}): Promise<License> {
  const maxSites: Record<LicenseTier, number> = { pro: 1, studio: 5, agency: 9999 };
  const key = generateKey(params.tier);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      license_key: key,
      tier: params.tier,
      max_sites: maxSites[params.tier],
      active_sites: [],
      customer_email: params.customerEmail,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      stripe_customer_id: params.stripeCustomerId ?? null,
      expires_at: params.expiresAt?.toISOString() ?? null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw new Error(`createLicense: ${error.message}`);
  return data;
}

export async function activateSite(
  licenseId: string,
  siteUrl: string,
  currentSites: string[],
): Promise<void> {
  const normalised = normaliseSiteUrl(siteUrl);
  const updated = [...new Set([...currentSites, normalised])];
  await supabase
    .from(TABLE)
    .update({ active_sites: updated, updated_at: new Date().toISOString() })
    .eq("id", licenseId);
}

export async function deactivateSite(
  licenseId: string,
  siteUrl: string,
  currentSites: string[],
): Promise<void> {
  const normalised = normaliseSiteUrl(siteUrl);
  const updated = currentSites.filter((s) => s !== normalised);
  await supabase
    .from(TABLE)
    .update({ active_sites: updated, updated_at: new Date().toISOString() })
    .eq("id", licenseId);
}

export async function updateStatus(
  licenseId: string,
  status: LicenseStatus,
): Promise<void> {
  await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", licenseId);
}

export async function extendExpiry(
  licenseId: string,
  newExpiry: Date,
): Promise<void> {
  await supabase
    .from(TABLE)
    .update({
      expires_at: newExpiry.toISOString(),
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", licenseId);
}

export async function disableBySubscription(
  subscriptionId: string,
): Promise<void> {
  await supabase
    .from(TABLE)
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function normaliseSiteUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.toLowerCase().trim();
  }
}

export function isLicenseValid(license: License): boolean {
  if (license.status !== "active") return false;
  if (license.expires_at && new Date(license.expires_at) < new Date()) return false;
  return true;
}

export function tierFeatures(tier: LicenseTier): string[] {
  const base = ["full_rag", "documents", "handoff_pro", "advanced_stats"];
  const multiSite = [...base, "api_access", "audit_logs", "gdpr_advanced", "multi_site"];
  if (tier === "agency") return [...multiSite, "unlimited_sites"];
  if (tier === "studio") return multiSite;
  return base;
}
