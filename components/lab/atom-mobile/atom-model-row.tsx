"use client";
import type { ReactNode } from "react";

export type Chip = { id: string; label: ReactNode; active: boolean; dotColor?: string };

export function AtomModelRow({
  mode,
  chips,
  onSelect,
}: {
  mode: "models" | "orbitals";
  chips: Chip[];
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`pt-atomm-row${mode === "models" ? " pt-atomm-row--models" : " pt-atomm-row--orbitals"}`}
      role="group"
      aria-label={mode === "models" ? "Modelli atomici" : "Orbitali"}
    >
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`pt-atomm-chip${c.active ? " pt-atomm-chip--active" : ""}`}
          onClick={() => onSelect(c.id)}
          aria-pressed={c.active}
        >
          {c.dotColor && <span className="pt-atomm-chip__dot" style={{ background: c.dotColor }} aria-hidden="true" />}
          {c.label}
        </button>
      ))}
    </div>
  );
}
