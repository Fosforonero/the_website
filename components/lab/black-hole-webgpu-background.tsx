"use client";

import { useRef, useEffect, type MutableRefObject } from "react";
import {
  initWebGPU, writeUniforms, makePlaceholderBindGroup,
  type CoreGPU,
} from "./black-hole/black-hole-webgpu-core";

// ---------------------------------------------------------------------------
// Public handle: lets external code (e.g. the R3F CameraSync) update the
// WebGPU camera every frame without causing a React re-render.
// ---------------------------------------------------------------------------
export type WebGPUBgHandle = {
  setCamera: (az: number, el: number, dist: number) => void;
};

type Props = {
  spin: number;
  diskOn: boolean;
  dopplerOn: boolean;
  jetsOn: boolean;
  bgRef: MutableRefObject<WebGPUBgHandle | null>;
  style?: React.CSSProperties;
};

export function BlackHoleWebGPUBackground({ spin, diskOn, dopplerOn, jetsOn, bgRef, style }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const coreRef      = useRef<CoreGPU | null>(null);
  const bindGroupRef = useRef<GPUBindGroup | null>(null);
  const rafRef       = useRef(0);

  // Camera driven by CameraSync — updated every R3F frame via setCamera()
  const camRef  = useRef({ az: 0.0, el: 0.267, dist: 22.8 });

  // Mirror latest props into a ref so the RAF closure always reads fresh values
  // without depending on stale closures.
  const ctrlRef = useRef({ spin, diskOn, dopplerOn, jetsOn });
  ctrlRef.current = { spin, diskOn, dopplerOn, jetsOn };

  // Expose setCamera to parent
  useEffect(() => {
    bgRef.current = { setCamera: (az, el, dist) => { camRef.current = { az, el, dist }; } };
    return () => { bgRef.current = null; };
  }, [bgRef]);

  // WebGPU init + render loop
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    let destroyed = false;

    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const core = await initWebGPU(canvas);
      if (!core || destroyed) { core?.device.destroy(); return; }
      coreRef.current    = core;
      bindGroupRef.current = makePlaceholderBindGroup(core);

      let t0 = performance.now();
      function frame() {
        if (destroyed || !coreRef.current || !bindGroupRef.current) return;
        const core   = coreRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const time = (performance.now() - t0) / 1000;
        const { spin, diskOn, dopplerOn, jetsOn } = ctrlRef.current;
        const { az, el, dist } = camRef.current;

        writeUniforms(core.uniformData, {
          w: canvas.width, h: canvas.height, time,
          spin, diskOn,
          diskBright: 14 * (dopplerOn ? 1.0 : 0.38),
          diskTemp: 10500, diskOuter: 16, dopplerOn,
          exposure: 0.85, steps: 240,
          style: 0, pureBlack: false, jets: jetsOn, jetStr: 0.5,
          volDisk: false, volThick: 0.1, volOpacity: 0.08,
          skyOn: false, skyBright: 1.2,
          az, el, dist,
        });
        core.device.queue.writeBuffer(core.uniformBuf, 0, core.uniformData);

        const encoder = core.device.createCommandEncoder();
        const pass    = encoder.beginRenderPass({
          colorAttachments: [{
            view:       core.context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear", storeOp: "store",
          }],
        });
        pass.setPipeline(core.pipeline);
        pass.setBindGroup(0, bindGroupRef.current);
        pass.draw(3);
        pass.end();
        core.device.queue.submit([encoder.finish()]);
        rafRef.current = requestAnimationFrame(frame);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    void init();
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      coreRef.current?.device.destroy();
      coreRef.current    = null;
      bindGroupRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
    />
  );
}
