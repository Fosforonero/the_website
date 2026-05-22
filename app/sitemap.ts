import type { MetadataRoute } from "next";
import { site, locales, defaultLocale, getLocalePath } from "@/lib/site";
import { getAllSlugs } from "@/lib/blog";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages: home + blog index, per locale
  const staticPaths = ["/", "/blog"];
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

  return [...staticEntries, ...postEntries];
}
