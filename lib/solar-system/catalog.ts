/**
 * Catalog data model for SBDB-sourced Solar System small bodies.
 * These objects are NOT in the curated SOLAR_BODIES array.
 * Rendered as Points layers, not individual meshes.
 */

export type CatalogCategory =
  | "asteroid-neo"
  | "asteroid-mba"
  | "asteroid-other"
  | "comet"
  | "tno"
  | "centaur";

export type CatalogMeta = {
  source: "JPL SBDB Query API";
  url: string;
  retrievedAt: string;
  category: CatalogCategory;
  count: number;
  fields: string[];
};

export type CatalogEntry = {
  id: string;
  name: string;
  category: CatalogCategory;
  semiMajorAxisAu: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeAscNodeDeg: number;
  argPeriapsisDeg: number;
  meanAnomalyDeg: number;
  epochJd: number;
  periodDays: number;
  diameterKm: number | null;
  absoluteMagnitude: number | null;
  isNEO: boolean;
  isPHA: boolean;
};

export type CatalogChunk = {
  meta: CatalogMeta;
  entries: CatalogEntry[];
};

type RawRow = [
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number | null,
  number | null,
  string,
  boolean,
  boolean,
];

function classToCategory(cls: string, neo: boolean): CatalogCategory {
  if (neo) return "asteroid-neo";
  const c = cls.toUpperCase();
  if (c === "MBA" || c.startsWith("MB")) return "asteroid-mba";
  if (c === "TNO" || c === "KBO" || c === "SDO" || c === "DO" || c === "DET") return "tno";
  if (c === "CEN") return "centaur";
  if (c === "JFC" || c === "HTC" || c === "ETC" || c === "OCC" || c === "HYP" || c === "PAR") return "comet";
  return "asteroid-other";
}

/**
 * Decode a raw SBDB JSON chunk (array-of-arrays) into typed CatalogEntry[].
 * Call on the client after fetching the static JSON snapshot.
 */
export function decodeCatalogChunk(raw: {
  meta: Omit<CatalogMeta, "fields"> & { fields: string[] };
  data: unknown[][];
}): CatalogChunk {
  const entries: CatalogEntry[] = raw.data.map((row) => {
    const r = row as RawRow;
    return {
      id: String(r[0]),
      name: String(r[1]).trim(),
      category: classToCategory(String(r[12]), Boolean(r[13])),
      semiMajorAxisAu: Number(r[2]),
      eccentricity: Number(r[3]),
      inclinationDeg: Number(r[4]),
      longitudeAscNodeDeg: Number(r[5]),
      argPeriapsisDeg: Number(r[6]),
      meanAnomalyDeg: Number(r[7]),
      epochJd: Number(r[8]) + 2_400_000.5,
      periodDays: Number(r[9]),
      diameterKm: r[10] != null ? Number(r[10]) : null,
      absoluteMagnitude: r[11] != null ? Number(r[11]) : null,
      isNEO: Boolean(r[13]),
      isPHA: Boolean(r[14]),
    };
  });
  return { meta: raw.meta as CatalogMeta, entries };
}
