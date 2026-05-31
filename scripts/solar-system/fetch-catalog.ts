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
    filename: "neo.json",
    category: "asteroid-neo",
    params: { "group": "neo", "kind": "a", "fullname": "true" },
    limit: 40_000,
  },
  {
    filename: "mba-top5000.json",
    category: "asteroid-mba",
    params: { "group": "mba", "kind": "a", "fullname": "true", "sort": "H", "dir": "ASC" },
    limit: 5_000,
  },
  {
    filename: "comets.json",
    category: "comet",
    params: { "kind": "c", "fullname": "true" },
  },
  {
    filename: "tnos.json",
    category: "tno",
    params: { "group": "tno", "kind": "a", "fullname": "true" },
  },
  {
    filename: "centaurs.json",
    category: "centaur",
    params: { "class": "Cen", "kind": "a", "fullname": "true" },
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

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const results: Array<{ filename: string; category: string; count: number }> = [];
  const failed: Array<{ filename: string; error: string }> = [];

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
    process.exit(failed.length === JOBS.length ? 1 : 0);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
