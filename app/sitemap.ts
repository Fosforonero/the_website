import type { MetadataRoute } from "next";
import { site, locales, defaultLocale, getLocalePath } from "@/lib/site";
import { getAllSlugs } from "@/lib/blog";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages: home + blog index + legal pages + instagram, per locale
  // Periodic table is excluded here because EN slug differs (/en/lab/periodic-table ≠ /en/lab/tavola-periodica)
  const staticPaths = [
    "/",
    "/blog",
    "/privacy",
    "/cookies",
    "/instagram",
  ];
  // One entry per locale per path so both IT and EN URLs appear explicitly.
  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((p) =>
    locales.map((locale) => ({
      url: `${site.url}${getLocalePath(locale, p)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}${getLocalePath(l, p)}`]),
        ),
      },
    }))
  );

  // Periodic table: IT and EN slugs differ, so each locale is listed explicitly.
  const periodicTableEntries: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/lab/tavola-periodica`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica`,
          en: `${site.url}/en/lab/periodic-table`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/periodic-table`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica`,
          en: `${site.url}/en/lab/periodic-table`,
        },
      },
    },
    {
      url: `${site.url}/lab/tavola-periodica/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica/about`,
          en: `${site.url}/en/lab/periodic-table/about`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/periodic-table/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica/about`,
          en: `${site.url}/en/lab/periodic-table/about`,
        },
      },
    },
  ];

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
          en: `${site.url}/en/lab/periodic-table/manual`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/periodic-table/manual`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          it: `${site.url}/lab/tavola-periodica/manuale`,
          en: `${site.url}/en/lab/periodic-table/manual`,
        },
      },
    },
  ];

  const solarSystemEntries: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/lab/sistema-solare`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare`,
          en: `${site.url}/en/lab/solar-system`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/solar-system`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare`,
          en: `${site.url}/en/lab/solar-system`,
        },
      },
    },
    {
      url: `${site.url}/lab/sistema-solare/manuale`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare/manuale`,
          en: `${site.url}/en/lab/solar-system/manual`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/solar-system/manual`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare/manuale`,
          en: `${site.url}/en/lab/solar-system/manual`,
        },
      },
    },
    {
      url: `${site.url}/lab/sistema-solare/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare/about`,
          en: `${site.url}/en/lab/solar-system/about`,
        },
      },
    },
    {
      url: `${site.url}/en/lab/solar-system/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          it: `${site.url}/lab/sistema-solare/about`,
          en: `${site.url}/en/lab/solar-system/about`,
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

  return [...staticEntries, ...periodicTableEntries, ...identityEntry, ...manualEntry, ...solarSystemEntries, ...postEntries];
}
