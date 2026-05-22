// JSON-LD builders. Used by app/layout.tsx (Organization + Person on all
// pages) and by blog post pages (BlogPosting). Returns plain objects — caller
// renders as <script type="application/ld+json">.

import { site } from "./site";
import { projects } from "./projects";
import type { BlogPostMeta } from "./blog";

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
    affiliation: {
      "@type": "EducationalOrganization",
      name: site.teaching.name,
      url: site.teaching.url,
    },
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

export function blogPostingLd(post: BlogPostMeta) {
  const url = `${site.url}${post.locale === "it" ? "" : "/" + post.locale}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: post.locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: site.author.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` },
    },
  };
}
