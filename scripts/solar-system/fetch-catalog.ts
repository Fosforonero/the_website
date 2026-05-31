/**
 * Fetch Solar System catalog snapshots from JPL SBDB Query API.
 * Run: pnpm solar:fetch-catalog
 * Requires internet access. Writes to public/lab/solar-system/catalog/.
 * Courtesy: 1 request/second delay between requests.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public/lab/solar-system/catalog");
const BASE_URL = "https://ssd-api.jpl.nasa.gov/sbdb_query.api";
const FIELDS = "spkid,full_name,a,e,i,om,w,ma,epoch_mjd,per,diameter,H,class,neo,pha";
const TODAY = new Date().toISOString().slice(0, 10);

type FetchJob = {
  filename: string;
  category: string;
  params: Record<string, string>;
  limit?: number;
};

const JOBS: FetchJob[] = [
  {
    filename: "mba-top5000.json",
    category: "asteroid-mba",
    // Default order is by numbered designation (Ceres first), which gives the largest/most-studied MBAs.
    // sort+dir params are not supported together in this API version; omit them.
    params: { "sb-kind": "a", "sb-class": "MBA" },
    limit: 5_000,
  },
  {
    filename: "comets.json",
    category: "comet",
    params: { "sb-kind": "c" },
  },
  {
    filename: "tnos.json",
    category: "tno",
    params: { "sb-kind": "a", "sb-class": "TNO" },
  },
  {
    filename: "centaurs.json",
    category: "centaur",
    params: { "sb-kind": "a", "sb-class": "CEN" },
  },
];

async function fetchChunk(job: FetchJob): Promise<number> {
  const params = new URLSearchParams({
    ...job.params,
    fields: FIELDS,
    ...(job.limit ? { limit: String(job.limit) } : {}),
  });

  const url = `${BASE_URL}?${params}`;
  console.log(`Fetching ${job.filename} …`);
  console.log(`  URL: ${url}`);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)",
    },
  });

  if (!res.ok) throw new Error(`SBDB ${res.status} for ${job.filename}: ${await res.text()}`);

  const raw = (await res.json()) as { fields: string[]; data: unknown[][] };
  if (!raw.fields || !raw.data) throw new Error(`Unexpected SBDB shape for ${job.filename}`);

  const out = {
    meta: {
      source: "JPL SBDB Query API",
      url: BASE_URL,
      retrievedAt: TODAY,
      category: job.category,
      count: raw.data.length,
      fields: raw.fields,
    },
    data: raw.data,
  };

  writeFileSync(join(OUT_DIR, job.filename), JSON.stringify(out), "utf-8");
  const kb = Math.round(JSON.stringify(out).length / 1024);
  console.log(`  → ${raw.data.length} entries, ${kb} kB`);
  return raw.data.length;
}

async function fetchNeoComplete(): Promise<number> {
  const NEO_CLASSES = "APO,ATE,AMO,IEO";
  const CHUNK = 10_000;
  const allData: unknown[][] = [];
  let fields: string[] = [];
  let offset = 0;

  console.log("Fetching NEOs (paginated)…");

  while (true) {
    const params = new URLSearchParams({
      "sb-kind": "a",
      "sb-class": NEO_CLASSES,
      fields: FIELDS,
      limit: String(CHUNK),
      "limit-from": String(offset),
    });
    const url = `${BASE_URL}?${params}`;
    console.log(`  page offset=${offset} …`);

    const res = await fetch(url, {
      headers: { "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)" },
    });

    if (!res.ok) throw new Error(`SBDB NEO ${res.status}: ${await res.text()}`);
    const raw = (await res.json()) as { fields: string[]; data: unknown[][] };
    if (!raw.fields || !raw.data) throw new Error("Unexpected SBDB shape for NEO page");

    if (fields.length === 0) fields = raw.fields;
    allData.push(...raw.data);
    console.log(`  → page has ${raw.data.length} entries (total so far: ${allData.length})`);

    if (raw.data.length < CHUNK) break; // last page
    offset += CHUNK;
    await new Promise((r) => setTimeout(r, 1100));
  }

  const out = {
    meta: {
      source: "JPL SBDB Query API",
      url: BASE_URL,
      retrievedAt: TODAY,
      category: "asteroid-neo",
      count: allData.length,
      fields,
    },
    data: allData,
  };

  writeFileSync(join(OUT_DIR, "neo.json"), JSON.stringify(out), "utf-8");
  const kb = Math.round(JSON.stringify(out).length / 1024);
  console.log(`neo.json → ${allData.length} entries, ${kb} kB`);
  return allData.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const results: Array<{ filename: string; category: string; count: number }> = [];
  const failed: Array<{ filename: string; error: string }> = [];

  // Fetch NEOs with pagination first (removes the 10k cap from Sprint 03B)
  try {
    const neoCount = await fetchNeoComplete();
    results.push({ filename: "neo.json", category: "asteroid-neo", count: neoCount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`✗ Failed: neo.json — ${msg}`);
    failed.push({ filename: "neo.json", error: msg });
  }
  await new Promise((r) => setTimeout(r, 1100)); // courtesy delay before next request

  for (const job of JOBS) {
    try {
      const count = await fetchChunk(job);
      results.push({ filename: job.filename, category: job.category, count });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`✗ Failed: ${job.filename} — ${msg}`);
      failed.push({ filename: job.filename, error: msg });
    }
    await new Promise((r) => setTimeout(r, 1100)); // courtesy delay
  }

  const manifest = {
    retrievedAt: TODAY,
    source: "JPL SBDB Query API",
    sourceUrl: "https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html",
    chunks: results,
    failed: failed.length > 0 ? failed : undefined,
    disclaimer:
      "Positions computed from SBDB Keplerian orbital elements (HEC-J2000 frame). Not live JPL Horizons vectors. Accuracy: educational-keplerian.",
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  console.log("Manifest written.");

  if (failed.length === 0) {
    console.log("✅ All catalog chunks fetched.");
  } else {
    console.log(`✅ Catalog fetched with ${results.length} successful, ${failed.length} failed.`);
    console.log(`Failed chunks: ${failed.map((f) => f.filename).join(", ")}`);
    // +1 for neo.json which is handled separately
    process.exit(failed.length === JOBS.length + 1 ? 1 : 0);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
