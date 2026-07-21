"use client";

import React, { useRef, useEffect, useState } from "react";

/**
 * BlackHoleCanvas
 *
 * Mounts the tuned WebGPU raymarched black hole (ported from the standalone
 * `webgpu-black-hole` project) into a self-sizing box. It is a *passive* visual:
 * a fixed camera, bloom post-processing, no OrbitControls — the parent
 * (CinematicIntro) scales the whole box via CSS to create the "fall in" effect.
 *
 * `control` lets the parent pause/resume the render loop (e.g. once the user has
 * scrolled past the intro) so we don't keep raymarching off-screen.
 */

export interface BlackHoleControl {
  setPaused: (paused: boolean) => void;
  /** Drive the camera from scroll: progress 0→1 dollies in, px/py add pointer parallax. */
  setCamera: (progress: number, px: number, py: number) => void;
}

// Tuned defaults copied from webgpu-black-hole/main.js (defaultConfig).
// Stars + nebula are disabled here on purpose: the surrounding 2D star-warp
// canvas is THE starfield, and mix-blend-screen keeps the disc clean. Flip these
// back to `true` if you want the WebGPU background stars/nebula inside the disc.
const BLACK_HOLE_CONFIG = {
  blackHoleMass: 0.4,
  diskInnerRadius: 4.1,
  diskOuterRadius: 14.5,
  diskTemperature: 49.78,
  temperatureFalloff: 5.22,
  diskBrightness: 5,
  diskRotationSpeed: -8.7,
  turbulenceScale: 1.81,
  turbulenceStretch: 0.75,
  turbulenceSharpness: 7.4,
  turbulenceCycleTime: 5,
  turbulenceLacunarity: 3,
  turbulencePersistence: 0.8,
  diskEdgeSoftnessInner: 0.18,
  diskEdgeSoftnessOuter: 0.5,
  gravitationalLensing: 2.4,
  dopplerStrength: 1.0,
  stepSize: 1,
  starsEnabled: false,
  starBackgroundColor: "#000000",
  starDensity: 0.1,
  starSize: 1.2,
  starBrightness: 0.1,
  nebulaEnabled: false,
  nebula1Scale: 2,
  nebula1Density: 0.5,
  nebula1Brightness: 0.01,
  nebula1Color: "#071f44",
  nebula2Scale: 5.5,
  nebula2Density: 0.05,
  nebula2Brightness: 0.21,
  nebula2Color: "#010615",
};

const BLOOM = { strength: 0.68, radius: 0.2, threshold: 0.4 };

interface Props {
  control?: React.MutableRefObject<BlackHoleControl | null>;
}

const BlackHoleCanvas: React.FC<Props> = ({ control }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any = null;
    let resizeHandler: (() => void) | null = null;

    async function init() {
      const container = containerRef.current;
      if (!container) return;

      if (!navigator.gpu) {
        setError("WebGPU is not supported in this browser.");
        return;
      }

      try {
        const THREE = await import("three/webgpu");
        const { pass } = await import("three/tsl");
        const { bloom } = await import(
          "three/examples/jsm/tsl/display/BloomNode.js"
        );
        const { BlackHoleSimulation } = await import(
          "./blackhole/BlackHoleSimulation"
        );

        if (cancelled) return;

        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;

        // MSAA is pointless here (the whole frame is one raymarched quad, no
        // geometric edges) and a capped pixel ratio keeps the per-pixel
        // raymarch affordable on retina displays — bloom softens the result
        // anyway, so the lower internal resolution is not visible.
        renderer = new THREE.WebGPURenderer({ antialias: false });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        Object.assign(renderer.domElement.style, {
          width: "100%",
          height: "100%",
          display: "block",
        });
        container.appendChild(renderer.domElement);

        await renderer.init();
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);

        // Camera dolly path — the "fall in". progress 0 → 1 flies the camera from
        // a wide shot toward the disc, re-raymarched every frame at native
        // resolution (so it stays sharp, unlike CSS-scaling the canvas).
        const CAM_FAR = { x: 0, y: -5, z: 20 };
        // Dives in past the disc's inner edge, almost to the horizon — the
        // "inside the black hole" plunge. The darkening veil in CinematicIntro
        // masks the final, most extreme frames.
        const CAM_NEAR = { x: 0, y: -0.4, z: 1.4 };
        let camProgress = 0;
        let camPx = 0;
        let camPy = 0;

        const simulation = new BlackHoleSimulation(scene, BLACK_HOLE_CONFIG);
        simulation.createBlackHole();
        simulation.onResize(w, h);

        const applyCamera = () => {
          const p = camProgress;
          camera.position.set(
            CAM_FAR.x + (CAM_NEAR.x - CAM_FAR.x) * p + camPx * 3,
            CAM_FAR.y + (CAM_NEAR.y - CAM_FAR.y) * p + camPy * 2,
            CAM_FAR.z + (CAM_NEAR.z - CAM_FAR.z) * p
          );
          camera.lookAt(0, 0, 0);
          // Widen the FOV and roll the view as we plunge — the tunnel-vertigo
          // cues that sell "falling inside" rather than zooming a flat image.
          const u = simulation.uniforms;
          if (u) {
            u.cameraFovScale.value = 1 - p * 0.45;
            u.cameraRoll.value = p * 0.3;
          }
        };
        applyCamera();

        // Bloom post-processing (matches the standalone's tuned look)
        const post = new THREE.PostProcessing(renderer);
        const scenePass = pass(scene, camera);
        const scenePassColor = scenePass.getTextureNode();
        const bloomPass = bloom(scenePassColor);
        bloomPass.threshold.value = BLOOM.threshold;
        bloomPass.strength.value = BLOOM.strength;
        bloomPass.radius.value = BLOOM.radius;
        post.outputNode = scenePassColor.add(bloomPass);

        const clock = new THREE.Clock();
        // Cap the raymarch at ~60fps: on 120Hz displays (ProMotion) rAF fires
        // every frame, which doubles GPU load for no visible gain here.
        let lastFrameTime = 0;
        const renderFrame = () => {
          const now = performance.now();
          if (now - lastFrameTime < 15) return;
          lastFrameTime = now;
          const delta = Math.min(clock.getDelta(), 0.033);
          applyCamera();
          simulation.update(delta, camera);
          post.render();
        };

        const start = () => renderer.setAnimationLoop(renderFrame);
        const stop = () => renderer.setAnimationLoop(null);
        start();

        if (control) {
          control.current = {
            setPaused: (p: boolean) => (p ? stop() : start()),
            setCamera: (progress: number, px: number, py: number) => {
              camProgress = progress;
              camPx = px;
              camPy = py;
            },
          };
        }

        resizeHandler = () => {
          const cw = container.clientWidth;
          const ch = container.clientHeight;
          if (!cw || !ch) return;
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
          renderer.setSize(cw, ch);
          simulation.onResize(cw, ch);
        };
        window.addEventListener("resize", resizeHandler);
      } catch (err) {
        console.error("Black hole initialization failed:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    init();

    return () => {
      cancelled = true;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (control) control.current = null;
      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose?.();
        const el = renderer.domElement;
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    };
  }, [control]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff8a6b",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default BlackHoleCanvas;
