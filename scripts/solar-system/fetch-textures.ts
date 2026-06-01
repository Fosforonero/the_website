/**
 * fetch-textures.ts
 *
 * Downloads real NASA/USGS equirectangular planet textures, converts them to
 * 2048×1024 WebP and saves them to public/lab/solar-system/textures/.
 *
 * Usage:
 *   npx tsx scripts/solar-system/fetch-textures.ts
 *   npx tsx scripts/solar-system/fetch-textures.ts --dry-run
 *
 * Requirements: Node 18+ (native fetch), sharp ^0.34.5
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OUTPUT_DIR = path.join(
  process.cwd(),
  "public",
  "lab",
  "solar-system",
  "textures"
);

const DRY_RUN = process.argv.includes("--dry-run");

interface TextureTarget {
  body: string;
  outputFile: string;
  /** Primary URL, tried first */
  primaryUrl: string;
  /** Ordered fallback URLs, tried in sequence if primary fails */
  fallbackUrls: string[];
  credit: string;
  licenseNote: string;
  /** Target output dimensions */
  width: number;
  height: number;
}

const TARGETS: TextureTarget[] = [
  {
    body: "Earth",
    outputFile: "earth-2k.webp",
    // NASA Visible Earth — Blue Marble Next Generation (August 2004, 3x2048x1024)
    primaryUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74117/world.200408.3x5400x2700.jpg",
    fallbackUrls: [
      // Smaller Blue Marble 2048 variant
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg",
      // Three.js bundled NASA atmosphere texture
      "https://raw.githubusercontent.com/mrdoob/three.js/r157/examples/textures/planets/earth_atmos_2048.jpg",
    ],
    credit: "NASA Visible Earth / Blue Marble Next Generation",
    licenseNote:
      "NASA imagery is public domain for educational use; verify attribution requirements at visibleearth.nasa.gov.",
    width: 2048,
    height: 1024,
  },
  {
    body: "Mars",
    outputFile: "mars-2k.webp",
    // NASA Visible Earth — Mars surface mosaic (originally planned URL, now 404)
    primaryUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/36000/36299/mars_surface_map.jpg",
    fallbackUrls: [
      // NASA SVS global Mars color mosaic (Viking) — alternate path
      "https://svs.gsfc.nasa.gov/vis/a000000/a003200/a003229/mars.jpg",
      // three.js-planets repo — marsmap1k.jpg (NASA/USGS-derived, 525 KB)
      "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg",
    ],
    credit: "NASA / USGS Viking Orbiter — Mars surface mosaic (via threex.planets)",
    licenseNote:
      "NASA imagery is public domain for educational use; original data from NASA Viking Orbiter.",
    width: 2048,
    height: 1024,
  },
  {
    body: "Moon",
    outputFile: "moon-2k.webp",
    // NASA GSFC SVS — LRO LROC WAC mosaic (confirmed 200)
    primaryUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg",
    fallbackUrls: [
      // Three.js bundled NASA moon texture (512KB)
      "https://raw.githubusercontent.com/mrdoob/three.js/r157/examples/textures/planets/moon_1024.jpg",
    ],
    credit: "NASA GSFC SVS / LRO LROC WAC mosaic",
    licenseNote:
      "NASA imagery is public domain for educational use; verify attribution requirements at svs.gsfc.nasa.gov.",
    width: 2048,
    height: 1024,
  },
  {
    body: "Mercury",
    outputFile: "mercury-2k.webp",
    // NASA GSFC SVS — MESSENGER MDIS mosaic (HEAD returned 200 but GET may vary)
    primaryUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004869/mercury_new_mosaic_2k.jpg",
    fallbackUrls: [
      // three.js-planets repo — mercurymap.jpg (NASA/USGS-derived, 286 KB)
      "https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg",
    ],
    credit: "NASA GSFC SVS / MESSENGER MDIS mosaic (via threex.planets)",
    licenseNote:
      "NASA imagery is public domain for educational use; original data from NASA MESSENGER mission.",
    width: 2048,
    height: 1024,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "FosforoneroClaude/1.0 (https://fosforonero.com; educational use)",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(
      `Expected image content-type, got "${contentType}" — URL may be a redirect/page: ${url}`
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function tryDownload(
  target: TextureTarget
): Promise<{ buffer: Buffer; sourceUrl: string } | null> {
  const urls = [target.primaryUrl, ...target.fallbackUrls];
  for (const url of urls) {
    try {
      console.log(`  Trying: ${url}`);
      const buffer = await downloadBuffer(url);
      console.log(`  Downloaded ${(buffer.length / 1024).toFixed(0)} KB`);
      return { buffer, sourceUrl: url };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  FAILED: ${msg}`);
    }
  }
  return null;
}

async function convertToWebP(
  buffer: Buffer,
  outputPath: string,
  width: number,
  height: number
): Promise<number> {
  const meta = await sharp(buffer).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  const srcRatio = srcH > 0 ? srcW / srcH : 0;
  const tgtRatio = width / height;
  if (Math.abs(srcRatio - tgtRatio) > 0.05) {
    console.log(`  WARN: source ${srcW}x${srcH} (ratio ${srcRatio.toFixed(2)}) → target ${width}x${height} (${tgtRatio.toFixed(2)}) — fit:fill will distort`);
  } else {
    console.log(`  Source: ${srcW}x${srcH}`);
  }
  await sharp(buffer)
    .resize(width, height, { fit: "fill" })
    .webp({ quality: 85, effort: 4 })
    .toFile(outputPath);
  const stat = fs.statSync(outputPath);
  return stat.size;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`\n=== fetch-textures.ts ===`);
  console.log(`Output dir: ${OUTPUT_DIR}`);
  console.log(`Dry run:    ${DRY_RUN}\n`);

  if (!DRY_RUN) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results: {
    body: string;
    outputFile: string;
    success: boolean;
    sizeKB?: number;
    sourceUrl?: string;
    error?: string;
  }[] = [];

  for (const target of TARGETS) {
    console.log(`\n--- ${target.body} ---`);
    console.log(`Output:  ${target.outputFile}`);
    console.log(`Target:  ${target.width}x${target.height}`);

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would download from: ${target.primaryUrl}`);
      if (target.fallbackUrls.length > 0) {
        console.log(
          `[DRY RUN] Fallbacks: ${target.fallbackUrls.join(", ")}`
        );
      }
      results.push({ body: target.body, outputFile: target.outputFile, success: false });
      continue;
    }

    try {
      const downloaded = await tryDownload(target);
      if (!downloaded) {
        const err = `All URLs failed for ${target.body} — see logs above`;
        console.log(`  ERROR: ${err}`);
        results.push({
          body: target.body,
          outputFile: target.outputFile,
          success: false,
          error: err,
        });
        continue;
      }

      const outputPath = path.join(OUTPUT_DIR, target.outputFile);
      console.log(`  Converting to WebP ${target.width}x${target.height}...`);
      const sizeBytes = await convertToWebP(
        downloaded.buffer,
        outputPath,
        target.width,
        target.height
      );
      const sizeKB = Math.round(sizeBytes / 1024);
      console.log(`  Saved: ${outputPath} (${sizeKB} KB)`);
      results.push({
        body: target.body,
        outputFile: target.outputFile,
        success: true,
        sizeKB,
        sourceUrl: downloaded.sourceUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  FATAL ERROR: ${msg}`);
      results.push({
        body: target.body,
        outputFile: target.outputFile,
        success: false,
        error: msg,
      });
    }
  }

  // Summary
  console.log("\n=== Summary ===");
  for (const r of results) {
    if (DRY_RUN) {
      console.log(`  ${r.body}: [dry-run]`);
    } else if (r.success) {
      console.log(`  ${r.body}: OK — ${r.outputFile} (${r.sizeKB} KB)`);
    } else {
      console.log(`  ${r.body}: FAILED — ${r.error}`);
    }
  }

  const failed = results.filter((r) => !r.success && !DRY_RUN);
  if (failed.length > 0) {
    console.log(
      `\n${failed.length} texture(s) failed. Do NOT set localPath for these bodies.`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
