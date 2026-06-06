import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";

// ---------------------------------------------------------------------------
// Final-stage ordered dithering. The renderer runs the post-processing in a
// 16-bit (HalfFloat) buffer, but the canvas is 8-bit: the *last* quantization
// to screen — after bloom — is where smooth gradients (the accretion disk)
// band. We add ±½ LSB of hash noise right before that quantization so the
// banding is broken into imperceptible noise. As the composer's last effect,
// this runs after Bloom and writes the final pixel.
// ---------------------------------------------------------------------------

class DitherEffectImpl extends Effect {
  constructor() {
    super(
      "DitherEffect",
      /* glsl */ `
      float ditherHash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        float n = ditherHash(gl_FragCoord.xy);
        outputColor = vec4(inputColor.rgb + (n - 0.5) / 255.0, inputColor.a);
      }
      `
    );
  }
}

export const DitherEffect = wrapEffect(DitherEffectImpl);
