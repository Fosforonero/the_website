// JSON-LD builders. Used by app/layout.tsx (Organization + Person on all
// pages) and by blog post pages (BlogPosting). Returns plain objects — caller
// renders as <script type="application/ld+json">.

import { site } from "./site";
import { projects } from "./projects";
import type { BlogPostMeta } from "./blog";
import type { InstaPost } from "./instagram";

/** WebSite — declares the brand/site entity to Google. Without an internal
 *  search endpoint we skip SearchAction (Google ignores it without a real
 *  search URL pattern, and we don't have one). */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: ["it-IT", "en-US"],
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

/** BreadcrumbList — wire on deep pages (blog post, legal) for rich result
 *  breadcrumb in SERPs. Pass plain {name, url} items in display order. */
export function breadcrumbLd(items: ReadonlyArray<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    founder: {
      "@type": "Person",
      name: site.author.name,
    },
    foundingDate: String(site.author.since),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.author.city,
      addressCountry: site.author.country,
    },
    sameAs: Object.values(site.socials),
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.author.name,
    url: site.url,
    jobTitle: site.author.role,
    worksFor: { "@type": "Organization", name: site.name, url: site.url },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.author.city,
      addressCountry: site.author.country,
    },
    sameAs: Object.values(site.socials),
  };
}

export function projectsListLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${site.name} — Projects`,
    itemListElement: projects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: p.url,
      name: p.name,
    })),
  };
}

/** CollectionPage + ItemList for the blog index — describes the article
 *  collection (position, title, URL, dates, author) so search/AI can read the
 *  list as a structured set, not just a page of links. */
export function blogIndexLd(posts: ReadonlyArray<BlogPostMeta>, locale: "it" | "en") {
  const base = locale === "it" ? `${site.url}/blog` : `${site.url}/${locale}/blog`;
  const author = { "@type": "Person", name: site.author.name, url: site.url };
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": base,
    url: base,
    name: locale === "it" ? "Blog · Note tecniche" : "Blog · Technical notes",
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: site.url, name: site.name },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${base}/${post.slug}`,
        item: {
          "@type": "BlogPosting",
          headline: post.title,
          url: `${base}/${post.slug}`,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          author,
        },
      })),
    },
  };
}

/** ImageGallery — declares the photography wall and each photo as an
 *  ImageObject, so search/AI engines can surface the individual images and
 *  understand the page is a photo collection (GEO image discovery). */
export function instagramGalleryLd(posts: ReadonlyArray<InstaPost>, locale: "it" | "en") {
  const url = locale === "it" ? `${site.url}/instagram` : `${site.url}/${locale}/instagram`;
  const trunc = (s: string, n = 200) => {
    const cp = Array.from(s.replace(/\s+/g, " ").trim());
    return cp.length > n ? cp.slice(0, n).join("") + "…" : cp.join("");
  };
  const author = { "@type": "Person", name: site.author.name, url: site.url };
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": url,
    url,
    name:
      locale === "it"
        ? `Fotografia — ${site.author.name}`
        : `Photography — ${site.author.name}`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: site.url, name: site.name },
    author,
    associatedMedia: posts
      .filter((p) => p.image)
      .map((p) => ({
        "@type": "ImageObject",
        contentUrl: `${site.url}${p.image}`,
        uploadDate: p.date,
        ...(p.caption ? { caption: trunc(p.caption), name: trunc(p.caption, 80) } : null),
        creator: author,
        ...(p.permalink ? { sameAs: p.permalink } : null),
      })),
  };
}

export function blogPostingLd(post: BlogPostMeta) {
  const url = `${site.url}${post.locale === "it" ? "" : "/" + post.locale}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: post.locale,
    url,
    image: post.image ? `${site.url}${post.image}` : `${site.url}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: site.author.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` },
    },
  };
}
