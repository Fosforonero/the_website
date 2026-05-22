// SEO audit orchestrator. Run locally or in CI.
// Implements the technical checks described in docs/seo/governance.md.
//
// Usage:
//   pnpm seo:audit                       # audit http://localhost:3000
//   pnpm seo:audit -- --url=https://...  # audit a specific origin
//   pnpm seo:audit -- --json             # write JSON report to docs/seo/last-audit.json
//   pnpm seo:audit -- --update-baseline  # accept current result as new baseline
//
// Exit code 0 = no errors, 1 = at least one error (warnings don't fail).

import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";

type Severity = "error" | "warn" | "info";
type Finding = {
  severity: Severity;
  check: string;
  where: string;
  message: string;
  fix?: string;
};

type Args = {
  origin: string;
  writeJson: boolean;
  updateBaseline: boolean;
};

// NOTE: while "/" and "/en" serve the ComingSoon screen, ItemList JSON-LD is
// intentionally absent (no project list to enumerate). Restore "ItemList" in
// the expected types when reactivating the Landing.
const ROUTES_TO_AUDIT = [
  { path: "/", expectLdTypes: ["Organization", "Person"] },
  { path: "/en", expectLdTypes: ["Organization", "Person"] },
  { path: "/blog", expectLdTypes: ["Organization", "Person"] },
  { path: "/en/blog", expectLdTypes: ["Organization", "Person"] },
  { path: "/privacy", expectLdTypes: ["Organization", "Person"] },
  { path: "/en/privacy", expectLdTypes: ["Organization", "Person"] },
  { path: "/cookies", expectLdTypes: ["Organization", "Person"] },
  { path: "/en/cookies", expectLdTypes: ["Organization", "Person"] },
];

function parseArgs(argv: string[]): Args {
  const args: Args = {
    origin: "http://localhost:3000",
    writeJson: false,
    updateBaseline: false,
  };
  for (const a of argv) {
    if (a.startsWith("--url=")) args.origin = a.slice("--url=".length).replace(/\/$/, "");
    else if (a === "--json") args.writeJson = true;
    else if (a === "--update-baseline") args.updateBaseline = true;
  }
  return args;
}

async function fetchPage(url: string): Promise<{ status: number; html: string }> {
  const res = await fetch(url, { redirect: "manual" });
  const html = await res.text();
  return { status: res.status, html };
}

// ────────────────────────────────────────────────────────────────
// CHECKS
// ────────────────────────────────────────────────────────────────

function checkMeta($: cheerio.CheerioAPI, pageUrl: string): Finding[] {
  const findings: Finding[] = [];
  const where = pageUrl;

  const title = $("head > title").first().text().trim();
  if (!title) {
    findings.push({ severity: "error", check: "meta.title", where, message: "Missing <title>" });
  } else if (title.length < 30 || title.length > 65) {
    findings.push({
      severity: "warn",
      check: "meta.title.length",
      where,
      message: `Title length is ${title.length} (target 30–65)`,
      fix: `Currently: "${title}"`,
    });
  }

  const desc = $('head > meta[name="description"]').attr("content")?.trim() ?? "";
  if (!desc) {
    findings.push({
      severity: "error",
      check: "meta.description",
      where,
      message: "Missing <meta name=description>",
    });
  } else if (desc.length < 110 || desc.length > 165) {
    findings.push({
      severity: "warn",
      check: "meta.description.length",
      where,
      message: `Description length is ${desc.length} (target 110–165)`,
    });
  }

  if (!$('head > link[rel="canonical"]').attr("href")) {
    findings.push({
      severity: "error",
      check: "meta.canonical",
      where,
      message: "Missing <link rel=canonical>",
    });
  }

  for (const req of ["og:title", "og:description", "og:url", "og:image"] as const) {
    if (!$(`head > meta[property="${req}"]`).attr("content")) {
      findings.push({
        severity: "error",
        check: `meta.og.${req}`,
        where,
        message: `Missing <meta property="${req}">`,
      });
    }
  }

  const robots = $('head > meta[name="robots"]').attr("content") ?? "";
  if (/noindex/i.test(robots)) {
    findings.push({
      severity: "error",
      check: "meta.robots",
      where,
      message: `Robots noindex present: "${robots}"`,
    });
  }

  if (!$('head > meta[name="twitter:card"]').attr("content")) {
    findings.push({
      severity: "warn",
      check: "meta.twitter.card",
      where,
      message: "Missing twitter:card (suggest summary_large_image)",
    });
  }

  return findings;
}

function checkHreflang($: cheerio.CheerioAPI, pageUrl: string): Finding[] {
  const findings: Finding[] = [];
  const alts = $('head > link[rel="alternate"][hreflang]');
  if (alts.length === 0) {
    findings.push({
      severity: "error",
      check: "hreflang.missing",
      where: pageUrl,
      message: "No hreflang alternates declared",
    });
    return findings;
  }
  const langs = new Set<string>();
  alts.each((_, el) => {
    const lang = $(el).attr("hreflang");
    const href = $(el).attr("href");
    if (lang) langs.add(lang);
    if (lang && !href) {
      findings.push({
        severity: "error",
        check: "hreflang.href",
        where: pageUrl,
        message: `hreflang="${lang}" without href`,
      });
    }
  });
  for (const required of ["it", "en"]) {
    if (!langs.has(required)) {
      findings.push({
        severity: "error",
        check: "hreflang.locale",
        where: pageUrl,
        message: `Missing hreflang="${required}"`,
      });
    }
  }
  return findings;
}

function checkStructuredData(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  expectTypes: string[],
): Finding[] {
  const findings: Finding[] = [];
  const blocks = $('script[type="application/ld+json"]');
  const seenTypes = new Set<string>();

  blocks.each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      findings.push({
        severity: "error",
        check: "ld.invalidJson",
        where: pageUrl,
        message: `Invalid JSON in <script type=application/ld+json>: ${(e as Error).message}`,
      });
      return;
    }
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    for (const obj of arr) {
      if (!obj || typeof obj !== "object") continue;
      const o = obj as Record<string, unknown>;
      if (o["@context"] !== "https://schema.org") {
        findings.push({
          severity: "warn",
          check: "ld.context",
          where: pageUrl,
          message: `Expected @context=https://schema.org, got "${String(o["@context"])}"`,
        });
      }
      const t = o["@type"];
      if (typeof t === "string") seenTypes.add(t);
    }
  });

  for (const t of expectTypes) {
    if (!seenTypes.has(t)) {
      findings.push({
        severity: "error",
        check: "ld.missingType",
        where: pageUrl,
        message: `Expected @type=${t} not found on this page`,
      });
    }
  }
  return findings;
}

async function checkPage(
  origin: string,
  route: { path: string; expectLdTypes: string[] },
): Promise<Finding[]> {
  const url = `${origin}${route.path}`;
  const findings: Finding[] = [];
  try {
    const { status, html } = await fetchPage(url);
    if (status !== 200) {
      findings.push({
        severity: "error",
        check: "http.status",
        where: url,
        message: `Expected 200, got ${status}`,
      });
      return findings;
    }
    const $ = cheerio.load(html);
    findings.push(...checkMeta($, url));
    findings.push(...checkHreflang($, url));
    findings.push(...checkStructuredData($, url, route.expectLdTypes));
  } catch (e) {
    findings.push({
      severity: "error",
      check: "http.fetch",
      where: url,
      message: `Fetch failed: ${(e as Error).message}`,
    });
  }
  return findings;
}

async function checkSitemap(origin: string): Promise<Finding[]> {
  const url = `${origin}/sitemap.xml`;
  const findings: Finding[] = [];
  try {
    const { status, html } = await fetchPage(url);
    if (status !== 200) {
      findings.push({
        severity: "error",
        check: "sitemap.status",
        where: url,
        message: `Sitemap returned ${status}`,
      });
      return findings;
    }
    const urlCount = (html.match(/<url>/g) ?? []).length;
    if (urlCount === 0) {
      findings.push({
        severity: "error",
        check: "sitemap.empty",
        where: url,
        message: "Sitemap has no <url> entries",
      });
    }
  } catch (e) {
    findings.push({
      severity: "error",
      check: "sitemap.fetch",
      where: url,
      message: `Sitemap fetch failed: ${(e as Error).message}`,
    });
  }
  return findings;
}

async function checkRobots(origin: string): Promise<Finding[]> {
  const url = `${origin}/robots.txt`;
  const findings: Finding[] = [];
  try {
    const { status, html } = await fetchPage(url);
    if (status !== 200) {
      findings.push({
        severity: "error",
        check: "robots.status",
        where: url,
        message: `robots.txt returned ${status}`,
      });
      return findings;
    }
    if (/disallow:\s*\/?sitemap\.xml/i.test(html)) {
      findings.push({
        severity: "error",
        check: "robots.blocksSitemap",
        where: url,
        message: "robots.txt disallows /sitemap.xml",
      });
    }
  } catch (e) {
    findings.push({
      severity: "error",
      check: "robots.fetch",
      where: url,
      message: `robots.txt fetch failed: ${(e as Error).message}`,
    });
  }
  return findings;
}

async function checkMdxFrontmatter(): Promise<Finding[]> {
  const findings: Finding[] = [];
  const root = path.join(process.cwd(), "content", "blog");
  let locales: string[] = [];
  try {
    locales = await fs.readdir(root);
  } catch {
    findings.push({
      severity: "warn",
      check: "mdx.dirMissing",
      where: root,
      message: "content/blog/ not found, skipping MDX checks",
    });
    return findings;
  }

  const slugsByLocale: Record<string, Set<string>> = {};

  for (const locale of locales) {
    const dir = path.join(root, locale);
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    slugsByLocale[locale] = new Set();
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      slugsByLocale[locale].add(slug);
      const fp = path.join(dir, file);
      const raw = await fs.readFile(fp, "utf8");
      const { data, content } = matter(raw);
      const where = `content/blog/${locale}/${file}`;

      for (const k of ["title", "excerpt", "date", "tag"]) {
        if (!data[k]) {
          findings.push({
            severity: "error",
            check: `mdx.frontmatter.${k}`,
            where,
            message: `Missing frontmatter "${k}"`,
          });
        }
      }
      const title = String(data.title ?? "");
      if (title && (title.length < 30 || title.length > 65)) {
        findings.push({
          severity: "warn",
          check: "mdx.title.length",
          where,
          message: `Title length ${title.length} (target 30–65)`,
        });
      }
      const excerpt = String(data.excerpt ?? "");
      if (excerpt && (excerpt.length < 80 || excerpt.length > 160)) {
        findings.push({
          severity: "warn",
          check: "mdx.excerpt.length",
          where,
          message: `Excerpt length ${excerpt.length} (target 80–160)`,
        });
      }
      const date = String(data.date ?? "");
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        findings.push({
          severity: "error",
          check: "mdx.date.format",
          where,
          message: `Date "${date}" not ISO YYYY-MM-DD`,
        });
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        findings.push({
          severity: "error",
          check: "mdx.slug.format",
          where,
          message: `Slug "${slug}" must be lowercase kebab-case`,
        });
      }
      if (/^#\s/m.test(content)) {
        findings.push({
          severity: "warn",
          check: "mdx.heading.h1",
          where,
          message: "Body uses an H1 (#); only H2/H3 allowed inside post body",
        });
      }
    }
  }

  // Slug parity: every IT slug should exist in EN, and vice versa
  const it = slugsByLocale["it"] ?? new Set();
  const en = slugsByLocale["en"] ?? new Set();
  for (const slug of it) {
    if (!en.has(slug)) {
      findings.push({
        severity: "warn",
        check: "mdx.slug.parity",
        where: `content/blog/it/${slug}.mdx`,
        message: `EN counterpart missing at content/blog/en/${slug}.mdx`,
      });
    }
  }
  for (const slug of en) {
    if (!it.has(slug)) {
      findings.push({
        severity: "warn",
        check: "mdx.slug.parity",
        where: `content/blog/en/${slug}.mdx`,
        message: `IT counterpart missing at content/blog/it/${slug}.mdx`,
      });
    }
  }

  return findings;
}

// ────────────────────────────────────────────────────────────────
// REPORT
// ────────────────────────────────────────────────────────────────

function summarise(findings: Finding[]): { errors: number; warnings: number } {
  return {
    errors: findings.filter((f) => f.severity === "error").length,
    warnings: findings.filter((f) => f.severity === "warn").length,
  };
}

function renderConsole(findings: Finding[]): string {
  const groups: Record<Severity, Finding[]> = { error: [], warn: [], info: [] };
  for (const f of findings) groups[f.severity].push(f);

  const lines: string[] = [];
  const sym: Record<Severity, string> = { error: "ERR ", warn: "WARN", info: "INFO" };
  for (const sev of ["error", "warn", "info"] as const) {
    for (const f of groups[sev]) {
      lines.push(`[${sym[sev]}] ${f.check} @ ${f.where} — ${f.message}`);
      if (f.fix) lines.push(`        ${f.fix}`);
    }
  }
  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  console.log(`SEO audit against ${args.origin}`);

  const findings: Finding[] = [];
  for (const route of ROUTES_TO_AUDIT) {
    findings.push(...(await checkPage(args.origin, route)));
  }
  findings.push(...(await checkSitemap(args.origin)));
  findings.push(...(await checkRobots(args.origin)));
  findings.push(...(await checkMdxFrontmatter()));

  const { errors, warnings } = summarise(findings);
  console.log(renderConsole(findings));
  console.log(`\nTotals: ${errors} errors, ${warnings} warnings`);

  if (args.writeJson) {
    const outDir = path.join(process.cwd(), "docs", "seo");
    await fs.mkdir(outDir, { recursive: true });
    const report = {
      ranAt: new Date().toISOString(),
      origin: args.origin,
      totals: { errors, warnings },
      findings,
    };
    await fs.writeFile(path.join(outDir, "last-audit.json"), JSON.stringify(report, null, 2));
    if (args.updateBaseline) {
      await fs.writeFile(path.join(outDir, "baseline.json"), JSON.stringify(report, null, 2));
      console.log("Baseline updated.");
    }
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
