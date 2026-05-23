// Submit the full sitemap to IndexNow (Bing/Yandex/Yep/Seznam/Naver).
// Reads the live sitemap.xml so we always send the current canonical URLs.
//
// Usage:
//   pnpm seo:indexnow                                   # submit live sitemap
//   pnpm seo:indexnow -- --url=https://www.fosforonero.com/blog/new  # single URL
//   pnpm seo:indexnow -- --site=https://www.fosforonero.com  # override sitemap host
//
// Exit code 0 on success (200 / 202), 1 on failure.

import { pingIndexNow, INDEXNOW_HOST, INDEXNOW_KEY_LOCATION } from "../../lib/indexnow";
import { site } from "../../lib/site";

type Args = {
  siteOrigin: string;
  singleUrl?: string;
};

function parseArgs(argv: string[]): Args {
  const out: Args = { siteOrigin: site.url };
  for (const a of argv) {
    if (a.startsWith("--site=")) out.siteOrigin = a.slice("--site=".length).replace(/\/$/, "");
    else if (a.startsWith("--url=")) out.singleUrl = a.slice("--url=".length);
  }
  return out;
}

async function urlsFromSitemap(origin: string): Promise<string[]> {
  const res = await fetch(`${origin}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap fetch failed (HTTP ${res.status})`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]!.trim());
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  console.log(`IndexNow host:       ${INDEXNOW_HOST}`);
  console.log(`IndexNow key file:   ${INDEXNOW_KEY_LOCATION}`);
  console.log(`Site origin:         ${args.siteOrigin}`);

  let urls: string[];
  if (args.singleUrl) {
    urls = [args.singleUrl];
  } else {
    urls = await urlsFromSitemap(args.siteOrigin);
  }

  // Filter URLs to declared host (IndexNow rejects mixed hosts).
  const filtered = urls.filter((u) => {
    try {
      return new URL(u).hostname === INDEXNOW_HOST;
    } catch {
      return false;
    }
  });

  if (filtered.length !== urls.length) {
    console.log(
      `Skipped ${urls.length - filtered.length} URL(s) not on host ${INDEXNOW_HOST}`,
    );
  }
  console.log(`Submitting ${filtered.length} URL(s):`);
  for (const u of filtered) console.log(`  · ${u}`);

  const result = await pingIndexNow(filtered);
  console.log("");
  console.log(`Response: ${result.status} — ${result.message}`);

  process.exit(result.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
