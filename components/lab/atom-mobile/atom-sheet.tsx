"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function AtomSheet({
  open,
  title,
  onClose,
  children,
  returnFocusRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  returnFocusRef?: React.RefObject<HTMLElement>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const savedReturnFocus = returnFocusRef?.current ?? null;

    const getFocusables = () =>
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    getFocusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = getFocusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (savedReturnFocus ?? prevFocus)?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <>
      <div
        className={`pt-atomm-scrim${open ? " pt-atomm-scrim--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`pt-atomm-sheet${open ? " pt-atomm-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="pt-atomm-sheet__grab" />
        <div className="pt-atomm-sheet__head">
          <h3 className="pt-atomm-sheet__title">{title}</h3>
          <button
            type="button"
            className="pt-atomm-sheet__x"
            onClick={onClose}
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>
        <div className="pt-atomm-sheet__body">{children}</div>
      </div>
    </>
  );
}
