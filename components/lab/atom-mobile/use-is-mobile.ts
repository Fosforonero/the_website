"use client";
import { useEffect, useState } from "react";

/**
 * Solo per LOGICA non-visiva (es. registrare listener, evitare drag handler su desktop).
 * NON usare per decidere quale markup montare: il markup desktop/mobile è sempre
 * presente nel DOM e nascosto via CSS media query (no flash, no CLS, SSR corretto).
 */
export function useIsMobile(query = "(max-width: 680px)"): boolean {
  const [isMobile, setIsMobile] = useState(false); // SSR/first paint = false, aggiornato dopo mount
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return isMobile;
}
