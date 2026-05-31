// PubChem REST API integration — no API key required, CORS-permissive
// Docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
// Usage: fetchMoleculeFromPubChem("caffeine") → PubChemFetchResult

import type { Molecule, BondType, BondOrder } from "./molecules-data";

export type PubChemFetchResult =
  | { ok: true;  mol: Molecule; is2D?: boolean }
  | { ok: false; reason: "notfound" | "networkerror" };
import { EXTENDED } from "./element-extended-data";
import { ELEMENTS } from "./elements-data";

// ─── PubChem JSON schema (partial) ───────────────────────────────────────────

interface PCConformer { x: number[]; y: number[]; z?: number[] }
interface PCCoords    { type: number[]; aid: number[]; conformers: PCConformer[] }
interface PCCompound  {
  atoms:  { aid: number[]; element: number[] };
  bonds?: { aid1: number[]; aid2: number[]; order: number[] };
  coords?: PCCoords[];
}
interface PCResponse  { PC_Compounds: PCCompound[] }

// ─── Bond type heuristic ─────────────────────────────────────────────────────

function bondType(elemA: number, elemB: number, order: number): BondType {
  if (order > 1) return "covalent";
  const enA = EXTENDED[elemA]?.electronegativity ?? null;
  const enB = EXTENDED[elemB]?.electronegativity ?? null;
  if (enA === null || enB === null) return "covalent";
  const diff = Math.abs(enA - enB);
  if (diff >= 1.7) return "ionic";
  if (diff >= 0.4) return "polar";
  return "covalent";
}

// ─── Hill-order molecular formula builder ────────────────────────────────────

// Complete Z → symbol lookup derived from the project's elements table (all 118).
const SYMBOLS: Record<number, string> = Object.fromEntries(ELEMENTS.map(e => [e.z, e.sym]));

function buildFormula(elements: number[]): string {
  const counts: Record<number, number> = {};
  for (const e of elements) counts[e] = (counts[e] ?? 0) + 1;
  const hillOrder = [6, 1]; // C then H first
  let formula = "";
  const done = new Set<number>();
  for (const z of hillOrder) {
    if (counts[z]) {
      formula += (SYMBOLS[z] ?? `Z${z}`) + (counts[z]! > 1 ? counts[z] : "");
      done.add(z);
    }
  }
  for (const [zStr, n] of Object.entries(counts).sort(([a], [b]) => +a - +b)) {
    const z = +zStr;
    if (!done.has(z)) formula += (SYMBOLS[z] ?? `Z${z}`) + (n > 1 ? n : "");
  }
  return formula;
}

// ─── Main fetcher ─────────────────────────────────────────────────────────────

export async function fetchMoleculeFromPubChem(name: string): Promise<PubChemFetchResult> {
  const encoded = encodeURIComponent(name.trim());
  if (!encoded) return { ok: false, reason: "notfound" };

  // Try 3D conformer first, fall back to 2D
  let data: PCResponse | null = null;
  let hadNetworkError = false;
  let usedFallback2D = false;
  for (const suffix of ["?record_type=3d", ""]) {
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/record/JSON${suffix}`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (res.ok) {
        data = (await res.json()) as PCResponse;
        if (suffix === "") usedFallback2D = true;
        break;
      }
      if (res.status !== 404) hadNetworkError = true;
    } catch { hadNetworkError = true; }
  }
  if (!data?.PC_Compounds?.[0]) {
    return { ok: false, reason: hadNetworkError ? "networkerror" : "notfound" };
  }

  const compound = data.PC_Compounds[0]!;
  const elements = compound.atoms.element;
  const aids     = compound.atoms.aid;

  // Pick coordinate set (prefer 3D, type=2 means 3D in PubChem)
  const coordSet  = compound.coords?.find(c => c.type.includes(2)) ?? compound.coords?.[0];
  const conformer = coordSet?.conformers?.[0];
  if (!conformer) return { ok: false, reason: "notfound" };

  const xs = conformer.x;
  const ys = conformer.y;
  const zs = conformer.z ?? xs.map(() => 0);

  // Build aid→index map (PubChem aid is 1-based but not always sequential)
  const aidToIdx = new Map<number, number>();
  (coordSet?.aid ?? aids).forEach((aid, i) => aidToIdx.set(aid, i));

  // Centre at origin
  const cx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const cy = ys.reduce((s, y) => s + y, 0) / ys.length;
  const cz = zs.reduce((s, z) => s + z, 0) / zs.length;

  // PubChem coords are in Å; 0.88 gives visually comfortable scaling in our units
  const SCALE = 0.88;

  const atoms = elements.map((elem, i) => ({
    elem,
    x:  (xs[i]! - cx) * SCALE,
    y:  (ys[i]! - cy) * SCALE,
    pz: (zs[i]! - cz) * SCALE,
  }));

  const bonds: Array<{ a: number; b: number; order: BondOrder; type: BondType }> =
    (compound.bonds?.aid1 ?? []).map((_, i) => {
      const rawA   = compound.bonds!.aid1[i]!;
      const rawB   = compound.bonds!.aid2[i]!;
      const idxA   = aidToIdx.get(rawA) ?? rawA - 1;
      const idxB   = aidToIdx.get(rawB) ?? rawB - 1;
      const rawOrd = compound.bonds!.order[i] ?? 1;
      const order  = (rawOrd >= 1 && rawOrd <= 3 ? rawOrd : 1) as BondOrder;
      const elemA  = elements[idxA] ?? 6;
      const elemB  = elements[idxB] ?? 6;
      return { a: idxA, b: idxB, order, type: bondType(elemA, elemB, order) };
    });

  return {
    ok: true,
    is2D: usedFallback2D,
    mol: {
      formula:  buildFormula(elements),
      nameIT:   name,
      nameEN:   name,
      geometry: "pubchem",
      atoms,
      bonds,
      descIT: "",
      descEN: "",
    },
  };
}
