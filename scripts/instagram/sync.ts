// Instagram wall sync — Fase 1 (single-tenant, your own account).
//
// Fetches the latest media from @fosforonero via the Instagram Graph API,
// downloads each image into /public/instagram/<id>.webp (the CDN urls expire,
// so we persist them), extracts a dominant colour for the hover halo, and
// rewrites content/instagram/posts.json in the shape lib/instagram.ts expects.
//
// Usage:
//   pnpm ig:sync                 # sync newest 24 posts
//   pnpm ig:sync -- --limit=12   # sync newest 12
//   pnpm ig:sync -- --refresh    # also refresh+print the long-lived token
//
// Credentials live in .env.local (gitignored) — never in the repo, never in
// chat. Fails loud if they're missing (no silent fallback, no fake data).

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  fetchUserMedia,
  pickImageUrl,
  refreshLongLivedToken,
  type IgMedia,
} from "../../lib/instagram-graph";
import type { InstaPost, InstaType } from "../../lib/instagram";

// Node 24: load .env.local natively, no dotenv dependency.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"));
} catch {
  // No .env.local — the explicit checks below produce a clearer message.
}

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public", "instagram");
const JSON_FILE = path.join(ROOT, "content", "instagram", "posts.json");

function parseArgs(argv: string[]) {
  let limit = 24;
  let refresh = false;
  let debug = false;
  // Videos are excluded by default (still photos read best in the wall). The
  // future plugin will expose this as a toggle; here it's --include-videos.
  let includeVideos = false;
  for (const a of argv) {
    if (a.startsWith("--limit=")) limit = Math.max(1, parseInt(a.slice(8), 10) || 24);
    else if (a === "--refresh") refresh = true;
    else if (a === "--debug") debug = true;
    else if (a === "--include-videos") includeVideos = true;
  }
  return { limit, refresh, debug, includeVideos };
}

/** Print only the SHAPE of the token, never the value, to debug parse errors. */
function diagnoseToken(raw: string | undefined) {
  if (!raw) {
    console.log("\nINSTAGRAM_ACCESS_TOKEN: ASSENTE\n");
    return;
  }
  const flags = [
    raw !== raw.trim() && "spazi/whitespace ai bordi",
    /["']/.test(raw) && "contiene virgolette",
    /\s/.test(raw.trim()) && "contiene spazi/interruzioni interne",
    !raw.startsWith("IGAA") && "NON inizia con 'IGAA' (token IG validi iniziano così)",
  ].filter(Boolean);
  console.log(
    `\nForma del token (valore nascosto):\n` +
      `  lunghezza: ${raw.length}  (un token IG valido è ~150–250 char)\n` +
      `  primi 4:   ${JSON.stringify(raw.slice(0, 4))}\n` +
      `  ultimi 2:  ${JSON.stringify(raw.slice(-2))}\n` +
      `  problemi:  ${flags.length ? flags.join("; ") : "nessuno rilevato"}\n`,
  );
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(
      `\n✗ Manca ${name} in .env.local.\n` +
        `  Genera i valori dalla dashboard Meta (prodotto Instagram → genera token)\n` +
        `  e mettili in .env.local (vedi .env.example). Non committarli.\n`,
    );
    process.exit(1);
  }
  return v;
}

const TYPE_MAP: Record<IgMedia["media_type"], InstaType> = {
  IMAGE: "image",
  VIDEO: "video",
  CAROUSEL_ALBUM: "carousel",
};

/** Resize to 1px and read the pixel → "#rrggbb" for the hover halo. */
async function dominantColour(buf: Buffer): Promise<string> {
  const { data } = await sharp(buf)
    .resize(1, 1, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const r = data[0] ?? 0;
  const g = data[1] ?? 0;
  const b = data[2] ?? 0;
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download fallito (${res.status}) per ${url.slice(0, 80)}…`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const { limit, refresh, debug, includeVideos } = parseArgs(process.argv.slice(2));
  if (debug) {
    diagnoseToken(process.env.INSTAGRAM_ACCESS_TOKEN);
    return;
  }
  const token = requireEnv("INSTAGRAM_ACCESS_TOKEN");
  // Optional: "me" (the token's own account) works without it.
  const userId = process.env.INSTAGRAM_USER_ID || "me";

  if (refresh) {
    const { token: fresh, expiresInSeconds } = await refreshLongLivedToken(token);
    const days = Math.round(expiresInSeconds / 86400);
    console.log(`\n↻ Token rinnovato, valido ~${days} giorni. Nuovo valore:\n${fresh}\n`);
    console.log("  Aggiorna INSTAGRAM_ACCESS_TOKEN in .env.local con questo valore.\n");
    return;
  }

  // Over-fetch a little when excluding videos so we still land ~`limit` photos.
  console.log(`\n→ Fetch degli ultimi ${limit} post da Instagram…`);
  const raw = await fetchUserMedia(token, includeVideos ? limit : limit * 2, userId);
  const media = (includeVideos ? raw : raw.filter((m) => m.media_type !== "VIDEO")).slice(
    0,
    limit,
  );
  const videosSkipped = raw.length - media.length;
  console.log(
    `  ${media.length} post da pubblicare` +
      (includeVideos ? "" : ` (${videosSkipped} video esclusi — usa --include-videos per tenerli)`),
  );

  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const posts: InstaPost[] = [];
  let downloaded = 0;
  let skipped = 0;

  for (const m of media) {
    const imgUrl = pickImageUrl(m);
    let image: string | null = null;
    let halo = "#00A341"; // brand phosphor fallback

    if (imgUrl) {
      try {
        const raw = await downloadImage(imgUrl);
        const webp = await sharp(raw)
          .rotate() // honour EXIF orientation
          .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        await fs.writeFile(path.join(PUBLIC_DIR, `${m.id}.webp`), webp);
        halo = await dominantColour(raw);
        image = `/instagram/${m.id}.webp`;
        downloaded++;
      } catch (err) {
        console.warn(`  ⚠ ${m.id}: immagine non scaricata (${(err as Error).message})`);
        skipped++;
      }
    } else {
      skipped++;
    }

    posts.push({
      id: m.id,
      caption: m.caption?.trim() ?? "",
      date: m.timestamp.slice(0, 10), // yyyy-mm-dd
      permalink: m.permalink,
      image,
      type: TYPE_MAP[m.media_type],
      size: "1x1",
      halo,
    });
  }

  await fs.mkdir(path.dirname(JSON_FILE), { recursive: true });
  await fs.writeFile(JSON_FILE, JSON.stringify(posts, null, 2) + "\n", "utf8");

  console.log(
    `\n✓ Fatto: ${posts.length} post scritti in content/instagram/posts.json\n` +
      `  immagini scaricate: ${downloaded}, saltate: ${skipped}\n` +
      `  → apri /instagram in dev per vedere il wall.\n`,
  );
}

main().catch((err) => {
  console.error(`\n✗ Sync fallito: ${(err as Error).message}\n`);
  process.exit(1);
});
