"use client";

import { useEffect, useState, type MutableRefObject } from "react";
import type { Diagnostics } from "./playground-physics";

// Polls diagRef at a throttled rate rather than re-rendering every R3F
// frame (60/s) — a dev diagnostic panel doesn't need frame-perfect numbers.
export function PlaygroundDebugOverlay({ diagRef }: { diagRef: MutableRefObject<Diagnostics | null> }) {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  useEffect(() => {
    const id = setInterval(() => setDiag(diagRef.current), 200);
    return () => clearInterval(id);
  }, [diagRef]);

  if (!diag) return <div className="bh-debug-overlay">bhDebug: waiting for first frame…</div>;

  const fmt = (n: number, d = 4) => n.toExponential(d);
  const v3 = (v: { x: number; y: number; z: number }) => `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;

  return (
    <div className="bh-debug-overlay">
      {`bodies: ${diag.bodyCount}   particles: ${diag.particleCount}
simDt: ${diag.simDt}   steps/frame: ${diag.stepsThisFrame}/${diag.requestedSteps}   slowdown: ${diag.slowdownFactor.toFixed(2)}x
energy: ${fmt(diag.energy)}
|L|: ${fmt(diag.angularMomentum.length())}   L: (${v3(diag.angularMomentum)})
p: (${v3(diag.momentum)})
barycenter: (${v3(diag.barycenter)})
`}
      {diag.bodies.map((b) => (
        <div key={b.id}>
          {`#${b.id} ${b.kind}${b.parentId !== null ? ` ←${b.parentId}` : ""}  `}
          {b.distToParent !== null && b.hillRadius !== null
            ? `d=${b.distToParent.toFixed(3)} hill=${b.hillRadius.toFixed(3)}  `
            : ""}
          {`aBH=${b.accFromBH.toExponential(2)} aOther=${b.accFromOthers.toExponential(2)}`}
        </div>
      ))}
    </div>
  );
}
