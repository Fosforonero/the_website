"use client";
import type { ReactNode } from "react";

export type AtomTab = "info" | "views" | "orbital" | "tools";

type TabDef = { id: AtomTab; label: string; icon: ReactNode };

export function AtomTabBar({
  tabs,
  openSheet,
  inspectorActive,
  onTab,
}: {
  tabs: TabDef[];
  openSheet: Exclude<AtomTab, "orbital"> | null;
  inspectorActive: boolean;
  onTab: (tab: AtomTab) => void;
}) {
  return (
    <nav className="pt-atomm-tabbar" aria-label="Atom view">
      {tabs.map((t) => {
        const isOrbital = t.id === "orbital";
        const active = isOrbital ? inspectorActive : openSheet === t.id;
        const ariaProps = isOrbital
          ? { "aria-pressed": inspectorActive }
          : { "aria-expanded": openSheet === t.id, "aria-haspopup": "dialog" as const };
        return (
          <button
            key={t.id}
            type="button"
            className={`pt-atomm-tab${active ? " pt-atomm-tab--active" : ""}`}
            onClick={() => onTab(t.id)}
            {...ariaProps}
          >
            <span className="pt-atomm-tab__ic" aria-hidden="true">{t.icon}</span>
            <span className="pt-atomm-tab__lbl">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
