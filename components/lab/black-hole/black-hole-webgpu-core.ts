// Shared WebGPU math and uniform helpers used by both the full viewer and
// the headless playground background canvas.
import { BH_WGSL, UNIFORM_F32, UNIFORM_BYTES, U } from "./black-hole-wgsl";
export { BH_WGSL, UNIFORM_F32, UNIFORM_BYTES, U };

// ---------------------------------------------------------------------------
// Camera math
// ---------------------------------------------------------------------------
function dot3(a: [number,number,number], b: [number,number,number]) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
function cross3(a: [number,number,number], b: [number,number,number]): [number,number,number] {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}
function norm3(v: [number,number,number]): [number,number,number] {
  const len = Math.sqrt(dot3(v,v)) || 1;
  return [v[0]/len, v[1]/len, v[2]/len];
}
export function orbitCamera(az: number, el: number, dist: number) {
  const cosEl=Math.cos(el), sinEl=Math.sin(el), cosAz=Math.cos(az), sinAz=Math.sin(az);
  const camPos: [number,number,number] = [cosEl*sinAz*dist, sinEl*dist, cosEl*cosAz*dist];
  const fwd  = norm3([-camPos[0],-camPos[1],-camPos[2]]);
  const right= norm3(cross3(fwd,[0,1,0]));
  const up   = cross3(right,fwd) as [number,number,number];
  const back = norm3([camPos[0],camPos[1],camPos[2]]);
  return { camPos, right, up, backward: back };
}

// ---------------------------------------------------------------------------
// Uniform writer
// ---------------------------------------------------------------------------
export type UniformOpts = {
  w: number; h: number; time: number;
  spin: number; diskOn: boolean; diskBright: number;
  diskTemp: number; diskOuter: number; dopplerOn: boolean;
  exposure: number; steps: number;
  style: number; pureBlack: boolean; jets: boolean; jetStr: number;
  volDisk: boolean; volThick: number; volOpacity: number;
  skyOn: boolean; skyBright: number;
  az: number; el: number; dist: number;
};

export function writeUniforms(buf: Float32Array, opts: UniformOpts) {
  const { camPos, right, up, backward } = orbitCamera(opts.az, opts.el, opts.dist);
  const tanFov = Math.tan((45 * Math.PI) / 360);
  const aspect = opts.w / opts.h;

  buf[U.CAM_PX]=camPos[0]; buf[U.CAM_PY]=camPos[1]; buf[U.CAM_PZ]=camPos[2];
  buf[U.CAM_RX]=right[0];  buf[U.CAM_RY]=right[1];  buf[U.CAM_RZ]=right[2];
  buf[U.CAM_UX]=up[0];     buf[U.CAM_UY]=up[1];     buf[U.CAM_UZ]=up[2];
  buf[U.CAM_BX]=backward[0]; buf[U.CAM_BY]=backward[1]; buf[U.CAM_BZ]=backward[2];
  buf[U.RES_X]=opts.w;   buf[U.RES_Y]=opts.h;
  buf[U.TAN_FOV]=tanFov; buf[U.ASPECT]=aspect;
  buf[U.TIME]=opts.time; buf[U.SPIN]=opts.spin;
  buf[U.DISK_ON]=opts.diskOn?1:0; buf[U.DISK_BRIGHT]=opts.diskBright;
  buf[U.DISK_TEMP]=opts.diskTemp; buf[U.DISK_OUTER]=opts.diskOuter;
  buf[U.DOPPLER_ON]=opts.dopplerOn?1:0; buf[U.EXPOSURE]=opts.exposure;
  buf[U.STEPS]=opts.steps; buf[U.STYLE]=opts.style;
  buf[U.PURE_BLACK]=opts.pureBlack?1:0; buf[U.JETS]=opts.jets?1:0;
  buf[U.JET_STR]=opts.jetStr; buf[U.VOL_DISK]=opts.volDisk?1:0;
  buf[U.VOL_THICK]=opts.volThick; buf[U.VOL_OPACITY]=opts.volOpacity;
  buf[U.SKY_ON]=opts.skyOn?1:0; buf[U.SKY_BRIGHT]=opts.skyBright;
}

// ---------------------------------------------------------------------------
// GPU state type
// ---------------------------------------------------------------------------
export interface CoreGPU {
  device: GPUDevice;
  context: GPUCanvasContext;
  pipeline: GPURenderPipeline;
  uniformBuf: GPUBuffer;
  uniformData: Float32Array;
  sampler: GPUSampler;
  placeholderTex: GPUTexture;
}

export function makePlaceholderBindGroup(core: CoreGPU): GPUBindGroup {
  return core.device.createBindGroup({
    layout: core.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: core.uniformBuf } },
      { binding: 1, resource: core.sampler },
      { binding: 2, resource: core.placeholderTex.createView() },
    ],
  });
}

export function makeSkyBindGroup(core: CoreGPU, skyTex: GPUTexture): GPUBindGroup {
  return core.device.createBindGroup({
    layout: core.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: core.uniformBuf } },
      { binding: 1, resource: core.sampler },
      { binding: 2, resource: skyTex.createView() },
    ],
  });
}

// Initialise adapter → device → pipeline → sampler → placeholder texture.
// Returns null if WebGPU is unavailable or the shader fails to compile.
export async function initWebGPU(canvas: HTMLCanvasElement): Promise<CoreGPU | null> {
  const nav = navigator as Navigator & { gpu?: GPU };
  if (!nav.gpu) return null;
  const adapter = await nav.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) return null;
  let device: GPUDevice;
  try { device = await adapter.requestDevice(); } catch { return null; }

  const context = canvas.getContext("webgpu");
  if (!context) { device.destroy(); return null; }

  const format = nav.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "opaque" });

  const uniformBuf = device.createBuffer({
    size: UNIFORM_BYTES,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const shaderModule = device.createShaderModule({ code: BH_WGSL });
  const compInfo = await shaderModule.getCompilationInfo();
  if (compInfo.messages.some(m => m.type === "error")) {
    device.destroy(); return null;
  }

  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex:   { module: shaderModule, entryPoint: "vs" },
    fragment: { module: shaderModule, entryPoint: "fs", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });

  const sampler = device.createSampler({
    magFilter: "linear", minFilter: "linear",
    addressModeU: "repeat", addressModeV: "clamp-to-edge",
  });

  const placeholderTex = device.createTexture({
    size: [1, 1, 1], format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.writeTexture(
    { texture: placeholderTex },
    new Uint8Array([255, 255, 255, 255]),
    { bytesPerRow: 4 }, [1, 1, 1],
  );

  return { device, context, pipeline, uniformBuf,
           uniformData: new Float32Array(UNIFORM_F32), sampler, placeholderTex };
}
