// Site-wide constants. Single source of truth for URLs, defaults, locales.

export const site = {
  name: "Fosforonero",
  domain: "fosforonero.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fosforonero.com",
  email: "matteo@fosforonero.com",
  // Author / Person — keep this in sync with JSON-LD
  author: {
    name: "Matteo Pizzi",
    role: "Sviluppatore software",
    city: "Roma",
    country: "IT",
    since: 2017,
  },
  socials: {
    // GitHub temporaneamente nascosto su richiesta del proprietario.
    // I repository pubblici esistono ma non vogliamo linkarli dal sito.
    linkedin: "https://www.linkedin.com/in/matteo-pizzi-72a49321/",
    huggingface: "https://huggingface.co/Fosforonero",
    instagram: "https://www.instagram.com/fosforonero/",
  },
} as const;

export type Locale = "it" | "en";
export const locales: Locale[] = ["it", "en"];
export const defaultLocale: Locale = "it";

export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
};

// Hreflang map for sitemap/alternates
export function getLocalePath(locale: Locale, path = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean === "/" ? "/" : clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}
