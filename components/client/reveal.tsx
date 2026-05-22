"use client";

// Reveal — IntersectionObserver wrapper. Server-rendered initially with
// .fn-reveal (opacity:0); once the element enters the viewport we add .is-in
// and the CSS transition takes over. Single observer fires, then unobserves.
// Honours prefers-reduced-motion via the CSS rule in globals.css.

import { useEffect, useRef, useState, type ReactNode, type ElementType, type CSSProperties } from "react";

type Props = {
  children: ReactNode;
  /** Stagger in ms — applied via transition-delay. */
  delay?: number;
  /** Wrapper tag (default: div). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Custom IO threshold/rootMargin if you need it. */
  threshold?: number;
};

export function Reveal({
  children,
  delay = 0,
  as: As = "div",
  className = "",
  style,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          ob.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);

  return (
    <As
      ref={ref as never}
      className={`fn-reveal ${inView ? "is-in" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </As>
  );
}
