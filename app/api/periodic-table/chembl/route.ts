import { NextRequest, NextResponse } from "next/server";

// EBI can be slow (~8s); ensure Vercel function stays alive long enough
export const maxDuration = 20;

// ChEMBL REST API — CC BY-SA 3.0 Unported — EMBL-EBI
const CHEMBL_BASE = "https://www.ebi.ac.uk/chembl/api/data";
const FETCH_TIMEOUT_MS = 15000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export interface ChEMBLIndication {
  meshHeading: string;
  efoTerm: string | null;
  maxPhaseForInd: number | null;
}

export interface ChEMBLMechanism {
  mechanismOfAction: string;
  actionType: string | null;
}

export interface ChEMBLDrugInfo {
  chemblId: string;
  maxPhase: number | null;
  indications: ChEMBLIndication[];
  mechanisms: ChEMBLMechanism[];
  chemblUrl: string;
}

// Simple in-memory cache (per-instance; Vercel serverless creates fresh instances,
// so effective TTL is request lifetime + warm instance reuse).
const cache = new Map<string, { data: ChEMBLDrugInfo; ts: number }>();

function isCacheValid(ts: number): boolean {
  return Date.now() - ts < CACHE_TTL_MS;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchIndications(chemblId: string): Promise<ChEMBLIndication[]> {
  try {
    const url = `${CHEMBL_BASE}/drug_indication?molecule_chembl_id=${chemblId}&format=json&limit=5&order_by=-max_phase_for_ind`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items: ChEMBLIndication[] = (data.drug_indications ?? []).map((i: Record<string, unknown>) => ({
      meshHeading: String(i.mesh_heading ?? ""),
      efoTerm: i.efo_term != null ? String(i.efo_term) : null,
      maxPhaseForInd: i.max_phase_for_ind != null ? Number(i.max_phase_for_ind) : null,
    }));
    // Deduplicate by meshHeading (ChEMBL can return duplicates with different refs)
    const seen = new Set<string>();
    return items.filter(ind => {
      if (seen.has(ind.meshHeading)) return false;
      seen.add(ind.meshHeading);
      return true;
    }).slice(0, 3);
  } catch { return []; }
}

async function fetchMechanisms(chemblId: string): Promise<ChEMBLMechanism[]> {
  try {
    const url = `${CHEMBL_BASE}/mechanism?molecule_chembl_id=${chemblId}&format=json&limit=5`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items: ChEMBLMechanism[] = (data.mechanisms ?? []).map((m: Record<string, unknown>) => ({
      mechanismOfAction: String(m.mechanism_of_action ?? ""),
      actionType: m.action_type != null ? String(m.action_type) : null,
    }));
    // Deduplicate by mechanismOfAction
    const seen = new Set<string>();
    return items.filter(m => {
      if (seen.has(m.mechanismOfAction)) return false;
      seen.add(m.mechanismOfAction);
      return true;
    }).slice(0, 2);
  } catch { return []; }
}

async function fetchMaxPhase(chemblId: string): Promise<number | null> {
  try {
    const url = `${CHEMBL_BASE}/molecule/${chemblId}?format=json&only=max_phase`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.max_phase != null ? Number(data.max_phase) : null;
  } catch { return null; }
}

// Validate chemblId format to prevent injection
function isValidChEMBLId(id: string): boolean {
  return /^CHEMBL\d{1,8}$/.test(id);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const chemblId = req.nextUrl.searchParams.get("chemblId") ?? "";

  if (!isValidChEMBLId(chemblId)) {
    return NextResponse.json({ error: "invalid_chembl_id" }, { status: 400 });
  }

  const cached = cache.get(chemblId);
  if (cached && isCacheValid(cached.ts)) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=86400" },
    });
  }

  const [indications, mechanisms, maxPhase] = await Promise.all([
    fetchIndications(chemblId),
    fetchMechanisms(chemblId),
    fetchMaxPhase(chemblId),
  ]);

  // All three returned empty — EBI is likely down
  if (indications.length === 0 && mechanisms.length === 0 && maxPhase === null) {
    return NextResponse.json({ error: "chembl_unavailable" }, { status: 503 });
  }

  const result: ChEMBLDrugInfo = {
    chemblId,
    maxPhase,
    indications,
    mechanisms,
    chemblUrl: `https://www.ebi.ac.uk/chembl/compound_report_card/${chemblId}/`,
  };

  cache.set(chemblId, { data: result, ts: Date.now() });

  return NextResponse.json(result, {
    headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=86400" },
  });
}
