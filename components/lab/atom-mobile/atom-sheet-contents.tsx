"use client";
import type { ReactNode } from "react";

export type AtomSheetKind = "info" | "views" | "tools" | "orbital";

export type ViewItem = {
  id: string;
  title: string;
  desc: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function AtomSheetContents(props: {
  kind: AtomSheetKind;
  infoContent?: ReactNode;
  views?: ViewItem[];
  toolsContent?: ReactNode;
  orbitalContent?: ReactNode;
}): ReactNode {
  if (props.kind === "info") {
    return <div className="pt-atomm-info-body">{props.infoContent}</div>;
  }
  if (props.kind === "views") {
    return (
      <div className="pt-atomm-list">
        {props.views?.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`pt-atomm-listrow${v.active ? " pt-atomm-listrow--active" : ""}`}
            disabled={v.disabled}
            onClick={v.onSelect}
          >
            <span className="pt-atomm-listrow__ic" aria-hidden="true">
              {v.icon}
            </span>
            <span className="pt-atomm-listrow__tx">
              <span className="pt-atomm-listrow__t">{v.title}</span>
              <span className="pt-atomm-listrow__d">{v.desc}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }
  if (props.kind === "tools") {
    return <div className="pt-atomm-tools">{props.toolsContent}</div>;
  }
  return <div className="pt-atomm-orbital">{props.orbitalContent}</div>;
}
