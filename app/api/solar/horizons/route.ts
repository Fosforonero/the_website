import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const date = req.nextUrl.searchParams.get("date");

  if (!id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "id and date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const stopDate = new Date(date);
  stopDate.setDate(stopDate.getDate() + 1);
  const stop = stopDate.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    format: "json",
    COMMAND: `'${id}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "500@10",
    START_TIME: date,
    STOP_TIME: stop,
    STEP_SIZE: "1d",
    OUT_UNITS: "KM-S",
    VEC_TABLE: "2",
    REF_PLANE: "ECLIP",
    REF_SYSTEM: "J2000",
  });

  const res = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${params}`, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "Fosforonero-Lab/1.0 (lab.fosforonero.com; hello@fosforonero.com)" },
  });

  if (!res.ok) return NextResponse.json({ error: `Horizons ${res.status}` }, { status: 502 });

  const raw = await res.json() as { result?: string; error?: string };
  if (raw.error) return NextResponse.json({ error: raw.error }, { status: 422 });

  if (!raw.result) {
    return NextResponse.json({ error: "No result in Horizons response" }, { status: 502 });
  }

  const text: string = raw.result;
  const soe = text.indexOf("$$SOE");
  const eoe = text.indexOf("$$EOE");
  if (soe === -1 || eoe === -1) {
    return NextResponse.json({ error: "Cannot parse Horizons output" }, { status: 502 });
  }

  const block = text.slice(soe + 5, eoe);
  const val = (label: string) => {
    const m = new RegExp(`${label}\\s*=\\s*([\\-+]?[0-9.E+\\-]+)`).exec(block);
    return m && m[1] ? parseFloat(m[1]) : 0;
  };

  return NextResponse.json({
    id,
    date,
    positionKm: [val("X"), val("Y"), val("Z")] as [number, number, number],
    velocityKmS: [val("VX"), val("VY"), val("VZ")] as [number, number, number],
    referenceFrame: "HEC-J2000",
    source: "jpl-horizons",
    dataQuality: "sub-km",
    epochIso: `${date}T00:00:00Z`,
    cachedAt: new Date().toISOString(),
  });
}
