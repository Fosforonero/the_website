// ---------------------------------------------------------------------------
// Kerr black-hole renderer — WGSL (WebGPU)
// ---------------------------------------------------------------------------
// MVP: symplectic-Euler geodesic (same physics as WebGL "medium"), thin
// accretion disk with Page–Thorne flux + exact Kerr Doppler, procedural
// cinematic starfield.  No volumetric disk, no jets, no real-sky texture.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Uniform buffer layout (128 bytes = 32 × f32).
// All f32 to avoid vec3/mat alignment padding in WGSL uniform blocks.
// JS side: new Float32Array(32), fill with writeUniforms(), upload via
//   device.queue.writeBuffer(buf, 0, data).
// ---------------------------------------------------------------------------
export const UNIFORM_F32 = 32; // element count
export const UNIFORM_BYTES = UNIFORM_F32 * 4;

// Offsets (in f32 units) — keep in sync with the WGSL struct below.
export const U = {
  // vec4f cam_pos  → [0..3]
  CAM_PX: 0, CAM_PY: 1, CAM_PZ: 2,
  // vec4f cam_r   → [4..7]
  CAM_RX: 4, CAM_RY: 5, CAM_RZ: 6,
  // vec4f cam_u   → [8..11]
  CAM_UX: 8, CAM_UY: 9, CAM_UZ: 10,
  // vec4f cam_b   → [12..15]  (backward = -forward)
  CAM_BX: 12, CAM_BY: 13, CAM_BZ: 14,
  // scalars
  RES_X: 16, RES_Y: 17, TAN_FOV: 18, ASPECT: 19,
  TIME: 20, SPIN: 21, DISK_ON: 22, DISK_BRIGHT: 23,
  DISK_TEMP: 24, DISK_OUTER: 25, DOPPLER_ON: 26, EXPOSURE: 27,
  STEPS: 28,
  // 29..31: padding
} as const;

export const BH_WGSL = /* wgsl */ `
// ---------------------------------------------------------------------------
// Uniform struct (must match U offsets above)
// ---------------------------------------------------------------------------
struct Uniforms {
  cam_pos    : vec4f,   // .xyz = camera world position
  cam_r      : vec4f,   // .xyz = camera right
  cam_u      : vec4f,   // .xyz = camera up
  cam_b      : vec4f,   // .xyz = camera backward (= −forward)
  res_x      : f32, res_y     : f32, tan_fov    : f32, aspect     : f32,
  time       : f32, spin      : f32, disk_on    : f32, disk_bright : f32,
  disk_temp  : f32, disk_outer: f32, doppler_on : f32, exposure    : f32,
  steps      : f32, _p0       : f32, _p1        : f32, _p2         : f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

// ── vertex: fullscreen triangle ─────────────────────────────────────────────
struct VOut { @builtin(position) pos: vec4f }

@vertex fn vs(@builtin(vertex_index) vid: u32) -> VOut {
  let p = array<vec2f, 3>(vec2f(-1., -1.), vec2f(3., -1.), vec2f(-1., 3.));
  return VOut(vec4f(p[vid], 0., 1.));
}

// ── disk radial flux (Novikov–Thorne zero-torque inner boundary) ─────────────
fn diskFlux(rd: f32, rIn: f32) -> f32 {
  if (rd <= rIn) { return 0.; }
  let x = rIn / rd;
  return x * x * x * (1. - sqrt(x));
}

// ── hashes / gradient noise ──────────────────────────────────────────────────
fn hash21(p: vec2f) -> f32 {
  var q = fract(p * vec2f(123.34, 456.21));
  q += dot(q, q + 45.32);
  return fract(q.x * q.y);
}
fn hash31(p: vec3f) -> f32 {
  var q = fract(p * 0.3183099 + 0.1);
  q *= 17.;
  return fract(q.x * q.y * q.z * (q.x + q.y + q.z));
}
fn grad2(i: vec2f) -> vec2f {
  let a = hash21(i) * 6.2831853;
  return vec2f(cos(a), sin(a));
}
fn gnoise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p);
  let fv = f * f * f * (f * (f * 6. - 15.) + 10.);
  let a = dot(grad2(i + vec2f(0., 0.)), f - vec2f(0., 0.));
  let b = dot(grad2(i + vec2f(1., 0.)), f - vec2f(1., 0.));
  let c = dot(grad2(i + vec2f(0., 1.)), f - vec2f(0., 1.));
  let d = dot(grad2(i + vec2f(1., 1.)), f - vec2f(1., 1.));
  return .5 + .5 * mix(mix(a, b, fv.x), mix(c, d, fv.x), fv.y);
}

// ── cinematic starfield ───────────────────────────────────────────────────────
fn starField(d: vec3f) -> vec3f {
  var col = vec3f(0.00012, 0.00014, 0.00022);
  let band = exp(-pow(d.y * 5.5, 2.));
  col += vec3f(0.0035, 0.004, 0.007) * band;
  for (var k: i32 = 0; k < 2; k++) {
    let scale = select(230., 95., k == 1);
    let thr   = 0.985;
    let gv    = d * scale;
    let id    = floor(gv);
    let h     = hash31(id);
    if (h > thr) {
      let f    = fract(gv) - .5;
      let star = smoothstep(.5, 0., length(f));
      let tw   = .7 + .3 * sin(u.time * 2. + h * 40.);
      let mag  = pow((h - thr) / (1. - thr), 2.);
      let sc   = mix(vec3f(1., .9, .8), vec3f(.8, .9, 1.), hash31(id + 7.));
      col += sc * star * mag * tw * 2.;
    }
  }
  return col;
}

// ── blackbody: temperature (K) → linear sRGB (Planckian locus approx.) ───────
fn blackbody(kelvin: f32) -> vec3f {
  let t = clamp(kelvin, 1000., 40000.);
  var m: mat3x3f;
  if (t <= 6500.) {
    m = mat3x3f(
      vec3f(0.,                   -2902.1955373783176, -8257.7997278925690),
      vec3f(0.,                    1669.5803561666639,  2575.2827530017594),
      vec3f(1.,                    1.3302673723350029,  1.8993753891711275));
  } else {
    m = mat3x3f(
      vec3f( 1745.0425298314172, -2666.3474220535695,  0.55995389139931482),
      vec3f( 1216.6168361476490, -2173.1012343082230,  0.70381203140554553),
      vec3f(-8257.7997278925690,  2575.2827530017594,  1.8993753891711275));
  }
  // m[0]=a, m[1]=b, m[2]=c per channel; result = a/(t+b)+c
  let c = clamp(m[0] / (vec3f(t) + m[1]) + m[2], vec3f(0.), vec3f(1.));
  return mix(c, vec3f(1.), smoothstep(1000., 0., t));
}

// ── ACES filmic tone map (Narkowicz approximation) ───────────────────────────
fn acesFilmic(x: vec3f) -> vec3f {
  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), vec3f(0.), vec3f(1.));
}

// ── Kerr metric, Kerr–Schild Cartesian (spin axis +Y, M = ½) ─────────────────
fn kerrR(p: vec3f, a: f32) -> f32 {
  let t  = dot(p, p) - a * a;
  let r2 = .5 * (t + sqrt(t * t + 4. * a * a * p.y * p.y));
  return sqrt(max(r2, 1e-8));
}
fn kerrHq(p: vec3f, ps: vec3f, a: f32) -> f32 {
  let r   = kerrR(p, a); let r2 = r * r;
  let f   = (r2 * r) / (r2 * r2 + a * a * p.y * p.y);
  let inv = 1. / (r2 + a * a);
  let ks  = vec3f((r * p.x + a * p.z) * inv, p.y / r, (r * p.z - a * p.x) * inv);
  let kap = 1. + dot(ks, ps);
  return dot(ps, ps) - 1. - f * kap * kap;
}
fn kerrISCO(chi: f32) -> f32 {
  let a  = clamp(chi, 0., 0.999);
  let z1 = 1. + pow(1. - a * a, 1. / 3.) *
               (pow(1. + a, 1. / 3.) + pow(1. - a, 1. / 3.));
  let z2 = sqrt(3. * a * a + z1 * z1);
  let xi = 3. + z2 - sqrt(max((3. - z1) * (3. + z1 + 2. * z2), 0.));
  return .5 * xi;
}
fn kerrVel(p: vec3f, ps: vec3f, a: f32) -> vec3f {
  let r   = kerrR(p, a); let r2 = r * r;
  let f   = (r2 * r) / (r2 * r2 + a * a * p.y * p.y);
  let inv = 1. / (r2 + a * a);
  let ks  = vec3f((r * p.x + a * p.z) * inv, p.y / r, (r * p.z - a * p.x) * inv);
  return ps - f * (1. + dot(ks, ps)) * ks;
}
fn kerrKick(p: vec3f, ps: vec3f, a: f32) -> vec3f {
  let e = 1e-3;
  let g = vec3f(
    kerrHq(p + vec3f(e, 0., 0.), ps, a) - kerrHq(p - vec3f(e, 0., 0.), ps, a),
    kerrHq(p + vec3f(0., e, 0.), ps, a) - kerrHq(p - vec3f(0., e, 0.), ps, a),
    kerrHq(p + vec3f(0., 0., e), ps, a) - kerrHq(p - vec3f(0., 0., e), ps, a));
  return -(0.25 / e) * g;
}

// ── main ─────────────────────────────────────────────────────────────────────
@fragment fn fs(in: VOut) -> @location(0) vec4f {
  // Camera ray from fragment coordinate
  let px  = (in.pos.x / u.res_x * 2. - 1.) * u.aspect * u.tan_fov;
  let py  = (1. - in.pos.y / u.res_y * 2.) * u.tan_fov;
  var dir = normalize(u.cam_r.xyz * px + u.cam_u.xyz * py - u.cam_b.xyz);
  var pos = u.cam_pos.xyz;

  // Photon conserved angular momentum about the hole (flat-space)
  let Lvec = cross(pos, dir);
  let h2   = dot(Lvec, Lvec);

  let kerrA = u.spin * .5;
  let rHor  = .5 * (1. + sqrt(max(1. - u.spin * u.spin, 0.)));
  let rIn   = kerrISCO(u.spin);

  var ps     = dir;
  var color  = vec3f(0.);
  var done   = false;
  var accCol = vec3f(0.);
  var accA   = 0.;

  // Far from the hole spacetime is flat: analytically advance pos to the
  // influence sphere (r = R_far) so the geodesic budget is spent where
  // curvature matters.
  let R_far = 34.;
  let b1    = dot(pos, dir);
  if (length(pos) > R_far) {
    if (b1 >= 0. || h2 > R_far * R_far) {
      color = starField(normalize(dir));
      done = true;
    } else {
      let disc = b1 * b1 - (dot(pos, pos) - R_far * R_far);
      pos += dir * (-b1 - sqrt(disc));
    }
  }

  for (var i: i32 = 0; i < 400 && !done; i++) {
    if (i >= i32(u.steps)) { break; }
    let r = kerrR(pos, kerrA);

    if (r < rHor + 0.02) {
      // Absorbed by the event horizon
      color = accCol;
      done = true;
    } else if (r > 60. && dot(pos, ps) > 0.) {
      // Escaped to infinity
      color = accCol + (1. - accA) * starField(normalize(ps));
      done = true;
    } else {
      // Adaptive step: fine near the hole, coarse far away
      var dt = clamp(r * .10, .02, .9);
      if (r < 6.) { dt = min(dt, .016 + .045 * (r - 1.)); }

      // Symplectic Euler (kick then drift)
      let psNext  = ps + dt * kerrKick(pos, ps, kerrA);
      let vel     = kerrVel(pos, psNext, kerrA);
      let posNext = pos + vel * dt;

      // Accretion disk: thin equatorial plane (y = 0) crossing
      if (u.disk_on > .5 && pos.y * posNext.y < 0.) {
        let tt  = pos.y / (pos.y - posNext.y);
        let hit = mix(pos, posNext, tt);
        let rd  = kerrR(hit, kerrA);

        if (rd > rIn && rd < u.disk_outer) {
          let flux = diskFlux(rd, rIn);
          let T    = u.disk_temp * pow(flux, .25);

          // Exact Kerr Doppler/redshift for prograde circular orbit emitter:
          // g = 1 / [u^t (1 − Ω λ)]
          var g = 1.;
          if (u.doppler_on > .5) {
            let X   = 2. * rd; let aM = u.spin;
            let Om  = 1. / (pow(X, 1.5) + aM);
            let gtt = -(1. - 2. / X);
            let gtp = -2. * aM / X;
            let gpp = X * X + aM * aM + 2. * aM * aM / X;
            let nrm = -(gtt + 2. * Om * gtp + Om * Om * gpp);
            let ut  = 1. / sqrt(max(nrm, 1e-4));
            let lam = 2. * (hit.x * ps.z - hit.z * ps.x);
            g = 1. / (ut * max(1. - Om * lam, 1e-3));
          }
          let Tobs = T * g;

          // Surface brightness
          var bright = u.disk_bright * pow(Tobs / u.disk_temp, 4.);
          let outer  = 1. - smoothstep(u.disk_outer * .28, u.disk_outer * .82, rd);
          bright *= outer * outer * outer;
          bright *= 1. + 1.3 * smoothstep(rIn * 3., rIn * 1.25, rd);

          // Disk turbulence: Keplerian-rotating FBM (gradient noise, no facets)
          let omega = u.time * 1.4 / pow(rd, 1.5);
          let ca = cos(omega); let sa = sin(omega);
          let q0   = mat2x2f(vec2f(ca, -sa), vec2f(sa, ca)) * hit.xz;
          let foot = length(hit - u.cam_pos.xyz) * u.tan_fov * .0035 /
                     max(abs(dir.y), .05);
          let rotm  = mat2x2f(vec2f(.80, -.60), vec2f(.60, .80));
          var p     = q0 * .6;
          let warp  = vec2f(gnoise(p + 3.1), gnoise(p + 7.7)) - .5;
          p += .7 * warp;
          var turb  = 0.;
          turb += .50 * mix(.5, gnoise(p), 1. - smoothstep(.45, .9, foot * .6));
          p = rotm * p * 2. + 11.5;
          turb += .28 * mix(.5, gnoise(p), 1. - smoothstep(.45, .9, foot * 1.2));
          p = rotm * p * 2. + 4.7;
          turb += .15 * mix(.5, gnoise(p + vec2f( u.time * .09, -u.time * .06)),
                            1. - smoothstep(.45, .9, foot * 2.4));
          p = rotm * p * 2. + 19.2;
          turb += .07 * mix(.5, gnoise(p + vec2f(-u.time * .13,  u.time * .11)),
                            1. - smoothstep(.45, .9, foot * 4.8));
          turb   = pow(clamp(turb, 0., 1.), 1.25);
          bright *= .20 + 1.7 * turb;

          let dcol  = blackbody(Tobs) * bright;
          let alpha = clamp(bright * 1.1 / max(abs(vel.y), .07), 0., 1.);
          accCol += (1. - accA) * alpha * dcol;
          accA   += (1. - accA) * alpha;
          if (accA > .97) { color = accCol; done = true; }
        }
      }

      // Thin volumetric veil: warm glow within one scale-height of the disk,
      // giving the razor-thin disk a soft vertical halo (cheap, step-integrated).
      if (u.disk_on > .5 && !done) {
        let ya = abs(pos.y);
        if (ya < .55) {
          let rv = kerrR(pos, kerrA);
          if (rv > rIn && rv < u.disk_outer) {
            let vfl  = diskFlux(rv, rIn);
            let vert = exp(-(ya * ya) / .040);
            let ov   = 1. - smoothstep(u.disk_outer * .32, u.disk_outer, rv);
            let vcol = vec3f(1., .62, .32) * (vfl * ov * ov);
            accCol  += (1. - accA) * vcol * vert * dt * u.disk_bright * .020;
          }
        }
      }

      pos = posNext;
      ps  = psNext;
      dir = normalize(vel);
    }
  }

  if (!done) {
    color = accCol + (1. - accA) * starField(normalize(dir));
  }

  // Exposure + ACES tone map + gamma
  var col = color * u.exposure;
  col = acesFilmic(col);
  col = pow(col, vec3f(1. / 2.2));
  // Dither ±½ LSB to break 8-bit banding on smooth gradients
  col += (hash21(in.pos.xy + fract(u.time) * 17.) - .5) / 255.;

  return vec4f(col, 1.);
}
`;
