/**
 * Raymarching shader for black hole visualization using Three.js TSL.
 */

import {
  vec2,
  vec3,
  vec4,
  float,
  Fn,
  length,
  normalize,
  cross,
  dot,
  sin,
  cos,
  atan,
  asin,
  sqrt,
  pow,
  fract,
  clamp,
  smoothstep,
  mix,
  floor,
  step,
  sign,
  Loop,
  Break,
  If,
  screenUV
} from 'three/tsl';

// Hash functions for pseudo-random number generation
const hash21 = Fn(([p]) => {
  const n = sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453);
  return fract(n);
});

const hash31 = Fn(([p]) => {
  const n = sin(dot(p, vec3(127.1, 311.7, 74.7))).mul(43758.5453);
  return fract(n);
});

const hash22 = Fn(([p]) => {
  const px = fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));
  const py = fract(sin(dot(p, vec2(269.5, 183.3))).mul(43758.5453));
  return vec2(px, py);
});

// 3D value noise
const noise3D = Fn(([p]) => {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(float(3.0).sub(f.mul(2.0)));

  const a = hash31(i);
  const b = hash31(i.add(vec3(1, 0, 0)));
  const c = hash31(i.add(vec3(0, 1, 0)));
  const d = hash31(i.add(vec3(1, 1, 0)));
  const e = hash31(i.add(vec3(0, 0, 1)));
  const f2 = hash31(i.add(vec3(1, 0, 1)));
  const g = hash31(i.add(vec3(0, 1, 1)));
  const h = hash31(i.add(vec3(1, 1, 1)));

  return mix(
    mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
    mix(mix(e, f2, u.x), mix(g, h, u.x), u.y),
    u.z
  );
});

// Fractal Brownian Motion - 4 octaves of layered noise
const fbm = Fn(([p, lacunarity, persistence]) => {
  const value = float(0.0).toVar();
  const amplitude = float(0.5).toVar();
  const pos = p.toVar();

  value.addAssign(noise3D(pos).mul(amplitude));
  pos.mulAssign(lacunarity);
  amplitude.mulAssign(persistence);

  value.addAssign(noise3D(pos).mul(amplitude));
  pos.mulAssign(lacunarity);
  amplitude.mulAssign(persistence);

  value.addAssign(noise3D(pos).mul(amplitude));

  return value;
});

// Compact blackbody color lookup using 11 key temperature points (CIE 1931 2-deg, sRGB)
// Reduced from 120 entries for GPU performance — linear interpolation between key points
const BB_TEMPS = [1000, 2000, 3000, 4000, 5000, 6500, 8000, 10000, 15000, 25000, 40000];
const BB_R =     [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.7874, 0.6268, 0.4749, 0.3917, 0.3563];
const BB_G =     [0.0337, 0.2647, 0.487, 0.6636, 0.7992, 0.9436, 0.8187, 0.7039, 0.5824, 0.5083, 0.4745];
const BB_B =     [0.0, 0.0033, 0.1411, 0.3583, 0.6045, 0.9621, 1.0, 1.0, 1.0, 1.0, 1.0];

// Convert temperature to RGB using compact lookup with linear interpolation
const blackbodyColor = Fn(([tempK]) => {
  const temp = clamp(tempK, float(1000.0), float(40000.0));

  const r = float(0.0).toVar();
  const g = float(0.0).toVar();
  const b = float(0.0).toVar();

  for (let i = 0; i < BB_TEMPS.length - 1; i++) {
    const tLow = float(BB_TEMPS[i]);
    const tHigh = float(BB_TEMPS[i + 1]);

    const inRange = step(tLow, temp).mul(step(temp, tHigh));
    const t = temp.sub(tLow).div(tHigh.sub(tLow));

    r.addAssign(mix(float(BB_R[i]), float(BB_R[i + 1]), t).mul(inRange));
    g.addAssign(mix(float(BB_G[i]), float(BB_G[i + 1]), t).mul(inRange));
    b.addAssign(mix(float(BB_B[i]), float(BB_B[i + 1]), t).mul(inRange));
  }

  return vec3(r, g, b);
});

// Procedural star field using grid-based placement
const createStarField = (uniforms) => Fn(([rayDir]) => {
  const theta = atan(rayDir.z, rayDir.x);
  const phi = asin(clamp(rayDir.y, float(-1.0), float(1.0)));

  const gridScale = float(60.0).div(uniforms.starSize);
  const scaledCoord = vec2(theta, phi).mul(gridScale);
  const cell = floor(scaledCoord);
  const cellUV = fract(scaledCoord);

  const cellHash = hash21(cell);
  const starProb = step(float(1.0).sub(uniforms.starDensity), cellHash);

  const starPos = hash22(cell.add(42.0)).mul(0.8).add(0.1);
  const distToStar = length(cellUV.sub(starPos));

  const baseSizeVar = hash21(cell.add(100.0)).mul(0.03).add(0.01);
  const finalStarSize = baseSizeVar.mul(uniforms.starSize);

  const starCore = smoothstep(finalStarSize, float(0.0), distToStar);
  const starGlow = smoothstep(finalStarSize.mul(3.0), float(0.0), distToStar).mul(0.3);
  const starIntensity = starCore.add(starGlow).mul(starProb);

  const colorTemp = hash21(cell.add(200.0));
  const starColor = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.8), colorTemp);

  return starColor.mul(starIntensity).mul(uniforms.starBrightness);
});

// Procedural nebula clouds - two FBM layers
const createNebulaField = (uniforms) => Fn(([rayDir]) => {
  const noisePos1 = rayDir.mul(uniforms.nebula1Scale);
  const n1 = fbm(noisePos1, float(2.0), float(0.5)).mul(2.0).sub(1.0);
  const layer1 = clamp(n1.add(uniforms.nebula1Density), float(0.0), float(1.0));
  const color1 = uniforms.nebula1Color.mul(layer1).mul(uniforms.nebula1Brightness);

  const noisePos2 = rayDir.mul(uniforms.nebula2Scale);
  const n2 = fbm(noisePos2, float(2.0), float(0.5)).mul(2.0).sub(1.0);
  const layer2 = clamp(n2.add(uniforms.nebula2Density), float(0.0), float(1.0));
  const color2 = uniforms.nebula2Color.mul(layer2).mul(uniforms.nebula2Brightness);

  return color1.add(color2);
});

// Accretion disk color with blackbody temperature, Doppler beaming, and turbulence
const createAccretionDiskColor = (uniforms) => Fn(([hitR, hitAngle, time, rayDir]) => {
  const innerR = uniforms.diskInnerRadius;
  const outerR = uniforms.diskOuterRadius;
  const normR = clamp(hitR.sub(innerR).div(outerR.sub(innerR)), float(0.0), float(1.0));

  // Temperature profile: T(r) = T_peak × (r_inner / r)^α
  // Inner disk is hotter (more gravitational energy released)
  // Standard thin disk model uses α ≈ 0.75
  const peakTempK = uniforms.diskTemperature.mul(1000.0);
  const tempK = peakTempK.mul(pow(innerR.div(hitR), uniforms.temperatureFalloff));
  const diskColor = blackbodyColor(tempK).toVar('diskColor');

  // Doppler beaming: D = 1/(1 - β·cos(θ)), brightness ∝ D³
  const rotationSign = sign(uniforms.diskRotationSpeed);
  const velocityDir = vec3(
    sin(hitAngle).negate().mul(rotationSign),
    float(0.0),
    cos(hitAngle).mul(rotationSign)
  );
  const velocityMagnitude = float(1.0).div(sqrt(hitR.div(innerR)));
  const beta = velocityMagnitude.mul(0.3);
  const cosTheta = dot(velocityDir, rayDir);
  const dopplerFactor = float(1.0).div(float(1.0).sub(beta.mul(cosTheta)));
  const dopplerBoost = pow(dopplerFactor, float(3.0).mul(uniforms.dopplerStrength));
  diskColor.mulAssign(clamp(dopplerBoost, float(0.1), float(5.0)));

  // Edge falloff
  const edgeFalloff = smoothstep(float(0.0), uniforms.diskEdgeSoftnessInner, normR)
    .mul(smoothstep(float(1.0), float(1.0).sub(uniforms.diskEdgeSoftnessOuter), normR));

  // Turbulent ring pattern with cyclic time to prevent winding artifacts
  const ringOpacity = float(1.0).toVar('ringOpacity');
  const cycleLength = uniforms.turbulenceCycleTime;
  const cyclicTime = time.mod(cycleLength);
  const blendFactor = cyclicTime.div(cycleLength);

  // Keplerian rotation: inner regions rotate faster (ω ∝ r^-1.5)
  const keplerianPhase1 = cyclicTime.mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
  const keplerianPhase2 = cyclicTime.add(cycleLength).mul(uniforms.diskRotationSpeed).div(pow(hitR, float(1.5)));
  const rotatedAngle1 = hitAngle.add(keplerianPhase1);
  const rotatedAngle2 = hitAngle.add(keplerianPhase2);

  // Anisotropic noise sampling: radial creates rings, azimuthal creates arcs
  const noiseCoord1 = vec3(
    hitR.mul(uniforms.turbulenceScale),
    cos(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1)),
    sin(rotatedAngle1).div(uniforms.turbulenceStretch.max(0.1))
  );
  const noiseCoord2 = vec3(
    hitR.mul(uniforms.turbulenceScale),
    cos(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1)),
    sin(rotatedAngle2).div(uniforms.turbulenceStretch.max(0.1))
  );

  const turbulence1 = fbm(noiseCoord1, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
  const turbulence2 = fbm(noiseCoord2, uniforms.turbulenceLacunarity, uniforms.turbulencePersistence);
  const turbulence = mix(turbulence2, turbulence1, blendFactor);
  ringOpacity.assign(pow(clamp(turbulence, float(0.0), float(1.0)), uniforms.turbulenceSharpness));

  const finalOpacity = ringOpacity.mul(edgeFalloff);
  const finalColor = diskColor.mul(uniforms.diskBrightness);
  return vec4(finalColor, finalOpacity);
});

// Main raymarching shader
export function createBlackHoleShader(uniforms) {
  const starField = createStarField(uniforms);
  const nebulaField = createNebulaField(uniforms);
  const accretionDiskColor = createAccretionDiskColor(uniforms);

  return Fn(() => {
    const rs = uniforms.blackHoleMass.mul(2.0); // Schwarzschild radius

    // Camera setup
    const uv = screenUV.sub(0.5).mul(2.0);
    const aspect = uniforms.resolution.x.div(uniforms.resolution.y);
    const screenPos = vec2(uv.x.mul(aspect), uv.y);

    const camPos = uniforms.cameraPosition;
    const camTarget = uniforms.cameraTarget;
    const camForward = normalize(camTarget.sub(camPos));
    // Tilting the up vector rolls the camera around the view axis (the intro
    // uses it for the fall-in vertigo).
    const roll = uniforms.cameraRoll;
    const worldUp = vec3(sin(roll), cos(roll), 0.0);
    const camRight = normalize(cross(worldUp, camForward));
    const camUp = cross(camForward, camRight);

    // < 1.0 widens the field of view (fall-in tunnel effect).
    const fov = uniforms.cameraFovScale;
    const rayDir = normalize(
      camForward.mul(fov)
        .add(camRight.mul(screenPos.x))
        .add(camUp.mul(screenPos.y))
    ).toVar('rayDir');

    // Ray state
    const rayPos = camPos.toVar('rayPos');
    const prevPos = camPos.toVar('prevPos');
    const color = vec3(0.0, 0.0, 0.0).toVar('color');
    const alpha = float(0.0).toVar('alpha');
    const escaped = float(0.0).toVar('escaped');
    const captured = float(0.0).toVar('captured');

    const innerR = uniforms.diskInnerRadius;
    const outerR = uniforms.diskOuterRadius;

    // Bounding sphere: everything visible (disk + meaningful lensing) happens
    // within this radius. Rays that miss it entirely are pure background and
    // pay one intersection test instead of the full march; rays that hit it
    // fast-forward straight to its surface before fine marching begins. This
    // makes all the empty-space pixels around the hole nearly free.
    const boundR = outerR.mul(1.15);
    const midpoint = dot(rayPos, rayDir);
    const centerDistSq = dot(rayPos, rayPos).sub(boundR.mul(boundR));
    const discriminant = midpoint.mul(midpoint).sub(centerDistSq);
    If(discriminant.lessThan(0.0), () => {
      escaped.assign(1.0);
    });
    const tEnter = midpoint.negate().sub(sqrt(discriminant.max(0.0))).max(0.0);
    rayPos.addAssign(rayDir.mul(tEnter));

    // Raymarching loop
    Loop(48, () => {
      If(escaped.greaterThan(0.5).or(captured.greaterThan(0.5)).or(alpha.greaterThan(0.99)), () => {
        Break();
      });

      const r = length(rayPos);

      // Captured by black hole
      If(r.lessThan(rs.mul(1.01)), () => {
        captured.assign(1.0);
        Break();
      });

      // Escaped: back outside the bounding sphere and moving away from the
      // hole — nothing left to hit. Much cheaper than marching to r > 100.
      If(r.greaterThan(boundR.mul(1.05)).and(dot(rayPos, rayDir).greaterThan(0.0)), () => {
        escaped.assign(1.0);
        Break();
      });

      // Adaptive step length: fine steps near the hole where light bends hard,
      // coarse steps far away where paths are nearly straight. Cuts the average
      // iterations per ray dramatically with no visible quality loss.
      const stepLen = uniforms.stepSize
        .mul(clamp(r.mul(0.18), float(1.0), float(4.0)))
        .toVar('stepLen');

      // Gravitational light bending: a = -rs/r² toward center
      const toCenter = rayPos.negate().div(r);
      const bendStrength = rs.div(r.mul(r)).mul(stepLen).mul(uniforms.gravitationalLensing);
      rayDir.addAssign(toCenter.mul(bendStrength));
      rayDir.assign(normalize(rayDir));

      prevPos.assign(rayPos);
      rayPos.addAssign(rayDir.mul(stepLen));

      // Disk plane intersection (Y = 0)
      const crossedPlane = prevPos.y.mul(rayPos.y).lessThan(0.0);

      If(crossedPlane.and(alpha.lessThan(0.99)), () => {
        const t = prevPos.y.negate().div(rayPos.y.sub(prevPos.y));
        const hitPos = mix(prevPos, rayPos, t);
        const hitR = sqrt(hitPos.x.mul(hitPos.x).add(hitPos.z.mul(hitPos.z)));
        const inDisk = hitR.greaterThan(innerR).and(hitR.lessThan(outerR));

        If(inDisk, () => {
          const hitAngle = atan(hitPos.z, hitPos.x);
          const diskResult = accretionDiskColor(hitR, hitAngle, uniforms.time, rayDir);

          // Front-to-back alpha compositing
          const remainingAlpha = float(1.0).sub(alpha);
          color.addAssign(diskResult.xyz.mul(diskResult.w).mul(remainingAlpha));
          alpha.addAssign(remainingAlpha.mul(diskResult.w));
        });
      });
    });

    If(captured.lessThan(0.5), () => {
      escaped.assign(1.0);
    });

    // Background for escaped rays
    If(escaped.greaterThan(0.5).and(alpha.lessThan(0.99)), () => {
      const bgColor = uniforms.starBackgroundColor.toVar('bgColor');

      If(uniforms.starsEnabled.greaterThan(0.5), () => {
        bgColor.addAssign(starField(rayDir));
      });

      If(uniforms.nebulaEnabled.greaterThan(0.5), () => {
        bgColor.addAssign(nebulaField(rayDir));
      });

      color.addAssign(bgColor.mul(float(1.0).sub(alpha)));
    });

    // Gamma correction
    const finalColor = pow(color, vec3(1.0 / 2.2));
    return vec4(finalColor, 1.0);
  })();
}
