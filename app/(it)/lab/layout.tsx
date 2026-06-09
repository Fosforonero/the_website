import type { ReactNode } from "react";

// Lab pages are full-screen WebGL experiences — no nav/footer wrapper.
export default function LabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
