import type { MetadataRoute } from "next";
import { site, locales, defaultLocale, getLocalePath } from "@/lib/site";
import { getAllSlugs } from "@/lib/blog";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages: home + blog index + legal pages + instagram, per locale
  const staticPaths = [
    "/",
    "/blog",
    "/privacy",
    "/cookies",
    "/instagram",
    "/lab/tavola-periodica",
    "/lab/tavola-periodica/about",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${site.url}${getLocalePath(defaultLocale, p)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site.url}${getLocalePath(l, p)}`]),
      ),
    },
  }));

  // Identity page — slug differs per locale (identita / identity), so it
  // can't use the shared staticPaths loop and is declared explicitly.
  const identityEntry: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/identita`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          it: `${site.url}/identita`,
          en: `${site.url}/en/identity`,
        },
      },
    },
  ];

  const manualEntry: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/lab/tavola-periodica/manuale`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica/manuale`,
          en: `${site.url}/en/lab/tavola-periodica/manual`,
        },
      },
    },
  ];

  // Blog posts — separate per locale (slugs may differ across languages)
  const postEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    const slugs = await getAllSlugs(locale);
    for (const slug of slugs) {
      postEntries.push({
        url: `${site.url}${getLocalePath(locale, `/blog/${slug}`)}`,
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return [...staticEntries, ...identityEntry, ...manualEntry, ...postEntries];
}
