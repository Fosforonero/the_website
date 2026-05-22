import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: "Pagina non trovata · 404" };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--color-dim)",
          letterSpacing: "0.32em",
        }}
      >
        404 · NOT FOUND
      </div>
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 72,
          fontWeight: 600,
          letterSpacing: "-0.04em",
          margin: 0,
        }}
      >
        Pagina non trovata.
      </h1>
      <p style={{ color: "var(--color-dim)", fontSize: 18, maxWidth: 460, textAlign: "center" }}>
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 12,
          padding: "12px 22px",
          background: "var(--color-ink)",
          color: "#fff",
          borderRadius: 10,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Torna alla home →
      </Link>
      <div style={{ marginTop: 30, fontSize: 12, color: "var(--color-dim)" }}>{site.name}</div>
    </main>
  );
}
