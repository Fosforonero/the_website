import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "10"), 20);

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "q must be ≥ 2 chars" }, { status: 400 });
  }

  const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(q)}&mb=-1&moid=1&neo=1&pha=1&nv=1&limit=${limit}&full-prec=0`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)" },
  });

  if (!res.ok) return NextResponse.json({ error: `SBDB ${res.status}` }, { status: 502 });

  type SbdbObj = { spkid?: string; full_name?: string; neo?: string; pha?: string; class?: string };
  const raw = await res.json() as { list?: SbdbObj[]; object?: SbdbObj; error?: string };

  if (raw.error) return NextResponse.json({ error: raw.error }, { status: 422 });

  const objects: SbdbObj[] = Array.isArray(raw.list) ? raw.list : raw.object ? [raw.object] : [];

  const results = objects.slice(0, limit).map((o) => ({
    id: o.spkid ?? "",
    name: (o.full_name ?? "").trim(),
    isNEO: o.neo === "Y",
    isPHA: o.pha === "Y",
    sbdbClass: o.class ?? "",
  }));

  return NextResponse.json({ results, source: "jpl-sbdb", dataQuality: "catalog-keplerian" });
}
