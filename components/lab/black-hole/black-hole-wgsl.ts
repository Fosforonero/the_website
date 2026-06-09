// ---------------------------------------------------------------------------
// Kerr black-hole renderer — WGSL (WebGPU)
// ---------------------------------------------------------------------------
// Full-featured port: exact Kerr null geodesics (Kerr–Schild Hamiltonian),
// thin disk + volumetric disk, relativistic Doppler, procedural/real-sky
// background (Starless mode + NASA texture), relativistic jets, pure-black
// preset, ACES tone map.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Uniform buffer layout — 160 bytes = 40 × f32, all f32 (no padding issues).
// ---------------------------------------------------------------------------
export const UNIFORM_F32   = 40;
export const UNIFORM_BYTES = UNIFORM_F32 * 4; // 160

// Offsets (f32 index) — must match WGSL struct below.
export const U = {
  CAM_PX: 0,  CAM_PY: 1,  CAM_PZ: 2,               // cam_pos.xyz
  CAM_RX: 4,  CAM_RY: 5,  CAM_RZ: 6,               // cam_r.xyz
  CAM_UX: 8,  CAM_UY: 9,  CAM_UZ: 10,              // cam_u.xyz
  CAM_BX: 12, CAM_BY: 13, CAM_BZ: 14,              // cam_b.xyz (backward)
  RES_X: 16,  RES_Y: 17,  TAN_FOV: 18, ASPECT: 19,
  TIME: 20,   SPIN: 21,   DISK_ON: 22, DISK_BRIGHT: 23,
  DISK_TEMP: 24, DISK_OUTER: 25, DOPPLER_ON: 26, EXPOSURE: 27,
  STEPS: 28,  STYLE: 29,  PURE_BLACK: 30, JETS: 31,
  JET_STR: 32, VOL_DISK: 33, VOL_THICK: 34, VOL_OPACITY: 35,
  SKY_ON: 36, SKY_BRIGHT: 37,
  RINGDOWN: 38,
  // 39: padding
} as const;

export const BH_WGSL = /* wgsl */ `
// ── bindings ─────────────────────────────────────────────────────────────────
struct Uniforms {
  cam_pos    : vec4f,
  cam_r      : vec4f,
  cam_u      : vec4f,
  cam_b      : vec4f,
  res_x      : f32, res_y     : f32, tan_fov    : f32, aspect     : f32,
  time       : f32, spin      : f32, disk_on    : f32, disk_bright: f32,
  disk_temp  : f32, disk_outer: f32, doppler_on : f32, exposure   : f32,
  steps      : f32, style     : f32, pure_black : f32, jets       : f32,
  jet_str    : f32, vol_disk  : f32, vol_thick  : f32, vol_opacity: f32,
  sky_on     : f32, sky_bright: f32, ringdown   : f32, _p1        : f32,
}
@group(0) @binding(0) var<uniform> u      : Uniforms;
@group(0) @binding(1) var          sky_samp: sampler;
@group(0) @binding(2) var          sky_tex : texture_2d<f32>;

// ── vertex: fullscreen triangle ───────────────────────────────────────────────
struct VOut { @builtin(position) pos: vec4f }
@vertex fn vs(@builtin(vertex_index) vid: u32) -> VOut {
  let x = select(-1.0, 3.0, vid == 1u);
  let y = select(-1.0, 3.0, vid == 2u);
  return VOut(vec4f(x, y, 0., 1.));
}

// ── disk flux (Novikov–Thorne) ────────────────────────────────────────────────
fn diskFlux(rd: f32, rIn: f32) -> f32 {
  if (rd <= rIn) { return 0.; }
  let x = rIn / rd;
  return x*x*x * (1. - sqrt(x));
}

// ── hashes / gradient noise ───────────────────────────────────────────────────
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
  let fv = f*f*f*(f*(f*6.-15.)+10.);
  let a = dot(grad2(i+vec2f(0.,0.)), f-vec2f(0.,0.));
  let b = dot(grad2(i+vec2f(1.,0.)), f-vec2f(1.,0.));
  let c = dot(grad2(i+vec2f(0.,1.)), f-vec2f(0.,1.));
  let d = dot(grad2(i+vec2f(1.,1.)), f-vec2f(1.,1.));
  return .5 + .5*mix(mix(a,b,fv.x), mix(c,d,fv.x), fv.y);
}

// ── background star field ─────────────────────────────────────────────────────
fn starField(d: vec3f) -> vec3f {
  if (u.pure_black > .5) { return vec3f(0.); }

  // NASA equirectangular sky (same texture lensed by the geodesic direction)
  if (u.sky_on > .5) {
    let lon = atan2(d.z, d.x);
    let lat = asin(clamp(d.y, -1., 1.));
    let uv  = vec2f(lon * 0.15915494 + 0.5, 0.5 - lat * 0.31830989);
    var sky = textureSampleLevel(sky_tex, sky_samp, uv, 0.0).rgb;
    sky     = pow(sky, vec3f(1.4));
    let lum = dot(sky, vec3f(0.299, 0.587, 0.114));
    sky     = max(mix(vec3f(lum), sky, 1.5), vec3f(0.));
    return sky * u.sky_bright;
  }

  var col  = vec3f(0.00012, 0.00014, 0.00022);
  let sl   = u.style > .5;
  let band = exp(-pow(d.y * select(5.5, 3., sl), 2.));
  col += vec3f(0.0035, 0.004, 0.007) * band;

  var band2 = 0.;
  if (sl) {
    // Structured galactic plane: FBM filaments + dark dust lanes
    let az  = atan2(d.z, d.x);
    var galV = vec2f(az * 2.4, d.y * 7.);
    let rr  = mat2x2f(vec2f(0.80,-0.60), vec2f(0.60,0.80));
    var n   = 0.; var amp = 0.5;
    for (var o: i32 = 0; o < 5; o++) { n += amp*gnoise(galV); galV = rr*galV*2.03+5.1; amp *= .5; }
    n = pow(clamp(n, 0., 1.), 1.35);
    let dust  = smoothstep(0.40, 0.80, gnoise(vec2f(az*3.3, d.y*5.5)+23.));
    band2     = band * n * (1. - 0.85*dust);
    let mwCol = mix(vec3f(0.020,0.024,0.040), vec3f(0.075,0.060,0.045), band);
    col += mwCol * band2 * 0.45;
    let core  = exp(-pow(az*0.8, 2.))*band;
    col += vec3f(0.090,0.066,0.046)*core*(1.-0.6*dust)*0.8;
    // Nebulae
    var ng  = vec2f(az*1.3, d.y*3.2)+41.;
    var neb = 0.; var na = 0.55;
    for (var o: i32 = 0; o < 3; o++) { neb += na*gnoise(ng); ng = rr*ng*2.1+2.3; na *= .5; }
    neb = pow(clamp(neb, 0., 1.), 3.);
    let tint   = gnoise(vec2f(az*0.7, d.y*1.6)+7.);
    let nebCol = mix(vec3f(0.16,0.04,0.07), vec3f(0.04,0.07,0.16), tint);
    col += nebCol*neb*band*(1.-0.55*dust)*1.1;
  }

  // Star layers: 2 (cinematic) or 4 (Starless, dense band layers added)
  let layers = select(2i, 4i, sl);
  for (var k: i32 = 0; k < 4; k++) {
    if (k >= layers) { break; }
    let dense = k >= 2;
    var scale: f32;
    if      (k == 0) { scale = 230.; }
    else if (k == 1) { scale = 95.; }
    else if (k == 2) { scale = 520.; }
    else             { scale = 900.; }
    var thr: f32;
    if (dense) { thr = select(0.85, 0.88, k == 2); }
    else       { thr = select(0.985, 0.965, sl); }
    let gv  = d * scale;
    let id  = floor(gv);
    let h   = hash31(id);
    if (h > thr) {
      let f       = fract(gv) - .5;
      let star    = smoothstep(.5, 0., length(f));
      let tw      = .7 + .3*sin(u.time*2. + h*40.);
      let mag     = pow((h - thr) / (1. - thr), 2.);
      let sc      = mix(vec3f(1.,.9,.8), vec3f(.8,.9,1.), hash31(id+7.));
      let w       = select(1., band2*2.4, dense);
      let bright_s = select(2., 1.5, dense);
      col += sc*star*mag*tw*bright_s*w;
    }
  }
  return col;
}

// ── blackbody: T (K) → linear sRGB (Planckian locus approx.) ─────────────────
fn blackbody(kelvin: f32) -> vec3f {
  let t = clamp(kelvin, 1000., 40000.);
  var m: mat3x3f;
  if (t <= 6500.) {
    m = mat3x3f(
      vec3f(0.,                  -2902.1955373783176,-8257.7997278925690),
      vec3f(0.,                   1669.5803561666639, 2575.2827530017594),
      vec3f(1.,                   1.3302673723350029, 1.8993753891711275));
  } else {
    m = mat3x3f(
      vec3f( 1745.0425298314172, 1216.6168361476490,-8257.7997278925690),
      vec3f(-2666.3474220535695,-2173.1012343082230, 2575.2827530017594),
      vec3f( 0.55995389139931482, 0.70381203140554553, 1.8993753891711275));
  }
  let c = clamp(m[0] / (vec3f(t) + m[1]) + m[2], vec3f(0.), vec3f(1.));
  return mix(c, vec3f(1.), smoothstep(1000., 0., t));
}

// ── ACES filmic tone map (Narkowicz) ──────────────────────────────────────────
fn acesFilmic(x: vec3f) -> vec3f {
  let a=2.51; let b=0.03; let c=2.43; let d=0.59; let e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), vec3f(0.), vec3f(1.));
}

// ── Kerr metric (Kerr–Schild Cartesian, spin axis +Y, M = ½) ─────────────────
fn kerrR(p: vec3f, a: f32) -> f32 {
  let t  = dot(p,p) - a*a;
  let r2 = .5*(t + sqrt(t*t + 4.*a*a*p.y*p.y));
  return sqrt(max(r2, 1e-8));
}
fn kerrHq(p: vec3f, ps: vec3f, a: f32) -> f32 {
  let r=kerrR(p,a); let r2=r*r;
  let f  = (r2*r)/(r2*r2 + a*a*p.y*p.y);
  let inv = 1./(r2+a*a);
  let ks = vec3f((r*p.x+a*p.z)*inv, p.y/r, (r*p.z-a*p.x)*inv);
  let kap = 1.+dot(ks,ps);
  return dot(ps,ps)-1.-f*kap*kap;
}
fn kerrISCO(chi: f32) -> f32 {
  let a  = clamp(chi,0.,0.999);
  let z1 = 1.+pow(1.-a*a,1./3.)*(pow(1.+a,1./3.)+pow(1.-a,1./3.));
  let z2 = sqrt(3.*a*a+z1*z1);
  let xi = 3.+z2-sqrt(max((3.-z1)*(3.+z1+2.*z2),0.));
  return .5*xi;
}
fn kerrVel(p: vec3f, ps: vec3f, a: f32) -> vec3f {
  let r=kerrR(p,a); let r2=r*r;
  let f  = (r2*r)/(r2*r2+a*a*p.y*p.y);
  let inv = 1./(r2+a*a);
  let ks = vec3f((r*p.x+a*p.z)*inv, p.y/r, (r*p.z-a*p.x)*inv);
  return ps - f*(1.+dot(ks,ps))*ks;
}
fn kerrKick(p: vec3f, ps: vec3f, a: f32) -> vec3f {
  let e = 1e-3;
  let g = vec3f(
    kerrHq(p+vec3f(e,0.,0.),ps,a)-kerrHq(p-vec3f(e,0.,0.),ps,a),
    kerrHq(p+vec3f(0.,e,0.),ps,a)-kerrHq(p-vec3f(0.,e,0.),ps,a),
    kerrHq(p+vec3f(0.,0.,e),ps,a)-kerrHq(p-vec3f(0.,0.,e),ps,a));
  return -(0.25/e)*g;
}

// ── Kerr Doppler factor for prograde circular orbit emitter ───────────────────
fn kerrDoppler(rd: f32, ps_at_hit: vec3f, hit: vec3f) -> f32 {
  let X   = 2.*rd; let aM = u.spin;
  let Om  = 1./(pow(X,1.5)+aM);
  let gtt = -(1.-2./X);
  let gtp = -2.*aM/X;
  let gpp = X*X + aM*aM + 2.*aM*aM/X;
  let nrm = -(gtt + 2.*Om*gtp + Om*Om*gpp);
  let ut  = 1./sqrt(max(nrm,1e-4));
  let lam = 2.*(hit.x*ps_at_hit.z - hit.z*ps_at_hit.x);
  return 1./(ut*max(1.-Om*lam,1e-3));
}

// ── main ─────────────────────────────────────────────────────────────────────
@fragment fn fs(in: VOut) -> @location(0) vec4f {
  let px  = (in.pos.x/u.res_x*2.-1.) * u.aspect * u.tan_fov;
  let py  = (1.-in.pos.y/u.res_y*2.) * u.tan_fov;
  var dir = normalize(u.cam_r.xyz*px + u.cam_u.xyz*py - u.cam_b.xyz);
  var pos = u.cam_pos.xyz;

  let Lvec = cross(pos, dir);
  let h2   = dot(Lvec, Lvec);

  let kerrA = u.spin * .5;
  let rHor  = .5*(1.+sqrt(max(1.-u.spin*u.spin, 0.)));
  let rIn   = kerrISCO(u.spin);

  var ps      = dir;
  var color   = vec3f(0.);
  var done    = false;
  var accCol  = vec3f(0.);
  var accA    = 0.;

  // Per-pixel jitter: offset the ray start by a random fraction of the first
  // step so volumetric samples don't align across pixels → staircase → noise.
  // Hash is purely spatial; converts structured aliasing to high-freq grain.
  if (u.vol_disk > .5) {
    let jit = fract(sin(dot(in.pos.xy, vec2f(127.1, 311.7))) * 43758.5453);
    let r0  = kerrR(pos, kerrA);
    let dt0 = clamp(r0 * .10, .02, .9) * jit;
    let ps0 = ps + dt0 * kerrKick(pos, ps, kerrA);
    pos += kerrVel(pos, ps0, kerrA) * dt0;
    ps   = ps0;
  }
  var jetAccum  = vec3f(0.);
  var diskXings: i32 = 0; // disk-plane crossings (≥2 = returning radiation / photon ring)

  // Pre-advance to the influence sphere
  let R_far = 34.;
  let b1    = dot(pos, dir);
  if (length(pos) > R_far) {
    if (b1 >= 0. || h2 > R_far*R_far) {
      color = starField(normalize(dir));
      done = true;
    } else {
      let disc = b1*b1 - (dot(pos,pos) - R_far*R_far);
      pos += dir * (-b1 - sqrt(disc));
    }
  }

  for (var i: i32 = 0; i < 400 && !done; i++) {
    if (i >= i32(u.steps)) { break; }
    let r = kerrR(pos, kerrA);

    if (r < rHor + 0.02) {
      color = accCol; done = true;
    } else if (r > 60. && dot(pos,ps) > 0.) {
      color = accCol + (1.-accA)*starField(normalize(ps)); done = true;
    } else {
      var dt = clamp(r*.10, .02, .9);
      if (r < 6.) { dt = min(dt, .016+.045*(r-1.)); }
      // Refine step near the disk plane to prevent volumetric staircase artifacts
      if (u.vol_disk > .5 && abs(pos.y) < 1.2) { dt = min(dt, 0.035); }

      // Symplectic Euler
      let psNext  = ps + dt*kerrKick(pos, ps, kerrA);
      let vel     = kerrVel(pos, psNext, kerrA);
      let posNext = pos + vel*dt;

      // ── Jets (optically-thin, accumulated along lensed ray) ───────────────
      if (u.jets > .5) {
        let rho  = length(pos.xz);
        let ay   = abs(pos.y);
        if (ay > 1.4 && ay < 26.) {
          let coneR = 0.18 + 0.13*ay;
          let prof  = exp(-(rho*rho)/(coneR*coneR));
          let fade  = exp(-ay*0.085)*(1.-exp(-(ay-1.4)*1.5));
          jetAccum += vec3f(0.45,0.65,1.) * (prof*fade*u.jet_str*dt);
        }
      }

      // ── Thin disk: equatorial plane crossing ──────────────────────────────
      if (u.disk_on > .5 && u.vol_disk < .5 && pos.y*posNext.y < 0.) {
        let tt  = pos.y/(pos.y-posNext.y);
        let hit = mix(pos, posNext, tt);
        let rd  = kerrR(hit, kerrA);
        if (rd > rIn && rd < u.disk_outer) {
          diskXings += 1;
          let flux = diskFlux(rd, rIn);
          let T    = u.disk_temp * pow(flux, .25);
          let g    = select(1., min(kerrDoppler(rd, ps, hit), 3.0), u.doppler_on > .5);
          let Tobs = T*g;
          var bright = u.disk_bright * pow(Tobs/u.disk_temp, 4.);
          let outer  = 1.-smoothstep(u.disk_outer*.28, u.disk_outer*.82, rd);
          bright *= outer*outer*outer;
          bright *= 1.+1.3*smoothstep(rIn*3., rIn*1.25, rd);
          // FBM turbulence
          let omega = u.time*1.4/pow(rd,1.5);
          let ca=cos(omega); let sa=sin(omega);
          let q0   = mat2x2f(vec2f(ca,-sa),vec2f(sa,ca)) * hit.xz;
          let foot = length(hit-u.cam_pos.xyz)*u.tan_fov*.0035/max(abs(dir.y),.05);
          let rotm = mat2x2f(vec2f(.80,-.60),vec2f(.60,.80));
          var p    = q0*.6;
          let warp = vec2f(gnoise(p+3.1),gnoise(p+7.7))-.5;
          p += .7*warp;
          var turb = 0.;
          turb += .50*mix(.5,gnoise(p), 1.-smoothstep(.45,.9,foot*.6));   p=rotm*p*2.+11.5;
          turb += .28*mix(.5,gnoise(p), 1.-smoothstep(.45,.9,foot*1.2));  p=rotm*p*2.+4.7;
          turb += .15*mix(.5,gnoise(p+vec2f(u.time*.09,-u.time*.06)),    1.-smoothstep(.45,.9,foot*2.4)); p=rotm*p*2.+19.2;
          turb += .07*mix(.5,gnoise(p+vec2f(-u.time*.13,u.time*.11)),    1.-smoothstep(.45,.9,foot*4.8));
          turb   = pow(clamp(turb,0.,1.),1.25);
          bright *= .20+1.7*turb;
          var dcol: vec3f;
          if (u.pure_black > .5) { dcol = vec3f(1.,0.42,0.12)*bright; }
          else                   { dcol = blackbody(Tobs)*bright; }
          let alpha = clamp(bright*1.1/max(abs(vel.y),.07), 0.,1.);
          accCol += (1.-accA)*alpha*dcol;
          accA   += (1.-accA)*alpha;
          if (accA > .97) { color=accCol; done=true; }
        }
      }

      // ── Volumetric 3D disk ────────────────────────────────────────────────
      if (u.disk_on > .5 && u.vol_disk > .5 && !done && accA < .99) {
        let mid = (pos+posNext)*.5;
        let rho = length(mid.xz);
        if (rho > rIn && rho < u.disk_outer) {
          let flux  = diskFlux(rho, rIn);
          let T     = u.disk_temp*pow(flux,.25);
          let HoR   = clamp(u.vol_thick*sqrt(pow(flux,.25)*rho)*0.22, 0.008, 0.18);
          let Hh    = HoR*rho;
          let zr    = mid.y/Hh;
          if (abs(zr) < 1.5) {
            let dens   = exp(-.5*zr*zr);
            let radial = 1.-smoothstep(u.disk_outer*.28, u.disk_outer*.82, rho);
            let dens2  = dens*radial*radial*radial;
            // Project mid to equatorial plane for Doppler: off-plane lam gives extreme values
            let g      = select(1., min(kerrDoppler(rho, ps, vec3f(mid.x, 0., mid.z)), 3.0), u.doppler_on > .5);
            let Tobs   = T*g;
            let om2   = u.time*1.4/pow(rho,1.5);
            let ca2=cos(om2); let sa2=sin(om2);
            let rotm2 = mat2x2f(vec2f(0.80,-0.60),vec2f(0.60,0.80));
            // Low spatial frequency (0.30) keeps blobs broad → no fine rings when lensed
            var pv    = mat2x2f(vec2f(ca2,-sa2),vec2f(sa2,ca2)) * mid.xz * 0.30;
            // Gentle domain warp — large streaks, no high-freq ripples
            let wv  = vec2f(gnoise(pv+3.1), gnoise(pv+7.7)) - 0.5;
            pv += 0.30*wv;
            // FBM: 2 octaves only (fine octaves cause lensed ring artifacts)
            var turb2 = 0.;
            turb2 += 0.60*gnoise(pv);                pv = rotm2*pv*2.03+11.5;
            turb2 += 0.40*gnoise(pv);
            // Mild azimuthal asymmetry via cos of orbital phase (no atan2 singularity)
            let orb_x  = ca2*mid.x + sa2*mid.z;
            let wave   = 0.75 + 0.25 * (select(0., orb_x/rho, rho > 0.05));
            let tb     = clamp(0.30 + 0.90*turb2*wave, 0., 1.60);
            let ds   = dt*length(vel);
            let dtau = u.vol_opacity*dens2*ds;
            var jv: vec3f;
            if (u.pure_black > .5) { jv = vec3f(1.,0.42,0.12)*(u.disk_bright*0.12*tb*dens2*ds); }
            else                   { jv = blackbody(Tobs)*(u.disk_bright*0.12*tb*dens2*ds); }
            accCol += (1.-accA)*jv;
            accA   += (1.-accA)*(1.-exp(-dtau));
            if (accA > .99) { color=accCol; done=true; }
          }
        }
      }

      // ── Thin veil (warm glow near disk plane, sky only) ───────────────────
      if (u.disk_on > .5 && u.vol_disk < .5 && u.pure_black < .5 && !done) {
        let ya = abs(pos.y);
        if (ya < .55) {
          let rv = kerrR(pos, kerrA);
          if (rv > rIn && rv < u.disk_outer) {
            let vfl  = diskFlux(rv, rIn);
            let vert = exp(-(ya*ya)/.040);
            let ov   = 1.-smoothstep(u.disk_outer*.32, u.disk_outer, rv);
            accCol  += (1.-accA)*vec3f(1.,.62,.32)*(vfl*ov*ov)*vert*dt*u.disk_bright*.020;
          }
        }
      }

      pos=posNext; ps=psNext; dir=normalize(vel);
    }
  }

  if (!done) { color = accCol+(1.-accA)*starField(normalize(dir)); }
  color += jetAccum;

  // QNM ringdown: boost photon ring contribution (returning radiation = diskXings ≥ 2).
  // The ringdown uniform carries the damped-sinusoid amplitude A(t) = exp(−γt)·cos(ω_R·t),
  // computed in JS from tabulated Kerr l=2 quasi-normal mode frequencies.
  if (u.ringdown != 0. && diskXings >= 2) { color *= 1. + .7 * u.ringdown; }

  // Exposure + ACES + gamma + dither
  var col = acesFilmic(color * u.exposure);
  col = pow(col, vec3f(1./2.2));
  col += (hash21(in.pos.xy+fract(u.time)*17.)-.5)/255.;
  return vec4f(col, 1.);
}
`;
