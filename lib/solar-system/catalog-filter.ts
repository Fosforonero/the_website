import type { CatalogEntry, CatalogCategory } from "./catalog";

export type CatalogFilterOptions = {
  categories?: Set<CatalogCategory>;
  minDiameterKm?: number;
  maxDiameterKm?: number;
  neoOnly?: boolean;
  phaOnly?: boolean;
  maxInclinationDeg?: number;
  maxEccentricity?: number;
  maxSemiMajorAxisAu?: number;
};

export function filterCatalog(entries: CatalogEntry[], opts: CatalogFilterOptions): CatalogEntry[] {
  return entries.filter((e) => {
    if (opts.categories && !opts.categories.has(e.category)) return false;
    if (opts.neoOnly && !e.isNEO) return false;
    if (opts.phaOnly && !e.isPHA) return false;
    if (opts.minDiameterKm != null && (e.diameterKm == null || e.diameterKm < opts.minDiameterKm)) return false;
    if (opts.maxDiameterKm != null && e.diameterKm != null && e.diameterKm > opts.maxDiameterKm) return false;
    if (opts.maxInclinationDeg != null && e.inclinationDeg > opts.maxInclinationDeg) return false;
    if (opts.maxEccentricity != null && e.eccentricity > opts.maxEccentricity) return false;
    if (opts.maxSemiMajorAxisAu != null && e.semiMajorAxisAu > opts.maxSemiMajorAxisAu) return false;
    return true;
  });
}

export function catalogCategoryLabel(cat: CatalogCategory, locale: "it" | "en"): string {
  const LABELS: Record<CatalogCategory, { it: string; en: string }> = {
    "asteroid-neo": { it: "Asteroidi NEO", en: "Near-Earth Objects" },
    "asteroid-mba": { it: "Fascia principale", en: "Main Belt" },
    "asteroid-other": { it: "Altri asteroidi", en: "Other Asteroids" },
    comet: { it: "Comete", en: "Comets" },
    tno: { it: "Oggetti trans-nettuniani", en: "Trans-Neptunian Objects" },
    centaur: { it: "Centauri", en: "Centaurs" },
  };
  return LABELS[cat][locale];
}
