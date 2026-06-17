"use client";

import React, { useEffect, useRef } from "react";
import { Exo_2, Space_Mono } from "next/font/google";
import BlackHoleCanvas, { BlackHoleControl } from "./BlackHoleCanvas";
import { starFlow } from "@/app/lib/starFlow";
import { registerStarCanvas } from "@/app/lib/starField";

const exo2 = Exo_2({ subsets: ["latin"], weight: ["200", "300", "500"] });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

/**
 * CinematicIntro
 *
 * Scroll-driven space intro ported from the "Samuel's Space Intro" prototype.
 * A tall section pins a full-screen visual layer (sticky); scroll progress 0→1
 * drives the SAMUEL'S / SPACE titles and the WebGPU black hole camera dolly
 * ("fall in"). The stars live ONLY here — this layer renders the star canvas
 * behind the black hole (so the disc's `mix-blend-screen` composites over real
 * stars) and the intro publishes its scroll progress to `starFlow` to drive the
 * fall-in warp. There is intentionally no starfield behind the portfolio: once
 * you've fallen in, the content itself scrolls, so the intro (and its stars)
 * simply scrolls away — nothing animates behind the page.
 */
const CinematicIntro: React.FC<{ onEnter?: () => void }> = ({ onEnter }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const starRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLHeadingElement>(null);
  const botRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const holeControl = useRef<BlackHoleControl | null>(null);

  // Keep the latest onEnter without re-running the effect.
  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;

  // Draw the starfield into this behind-the-black-hole canvas so the disc's
  // mix-blend-screen composites over real stars. These are the only stars on
  // the site — they live inside the intro and scroll away with it.
  useEffect(() => {
    const canvas = starRef.current;
    if (!canvas) return;
    return registerStarCanvas(canvas);
  }, []);

  useEffect(() => {
    let raf = 0;
    const pointer = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };
    let progress = 0;
    let target = 0;
    let enteredFired = false;
    let holePaused = false;

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };

    const onScroll = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      target = total > 0 ? scrolled / total : 0;
    };

    const applyTransforms = () => {
      const p = progress;
      const ccx = cam.x;
      const ccy = cam.y;

      // Dolly the 3D camera toward the singularity with a quadratic ease-in, so
      // the plunge starts gentle and accelerates into the hole — matching the
      // prototype's `1 + p*p*9` growth. It re-raymarches at native resolution,
      // so it stays sharp (no CSS upscaling of the canvas).
      const camEase = p * p;
      holeControl.current?.setCamera(camEase, ccx, ccy);
      if (topRef.current) {
        const s = 1 + p * 1.8;
        const ty = 15 - p * 55;
        topRef.current.style.transform =
          "translate(-50%, " + ty + "vh) translateX(" + ccx * 34 + "px) scale(" + s + ")";
        topRef.current.style.opacity = String(Math.max(0, 1 - p * 2.1));
      }
      if (botRef.current) {
        const s = 1 + p * 1.8;
        const ty = 76 + p * 52;
        botRef.current.style.transform =
          "translate(-50%, " + ty + "vh) translateX(" + ccx * 34 + "px) scale(" + s + ")";
        botRef.current.style.opacity = String(Math.max(0, 1 - p * 2.1));
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - p * 5));
      }

      // "Past the event horizon": a warm void glows in as we plunge (0.5→0.82),
      // then a pure-black blackout completes (0.82→1.0). By p≈1 the screen is
      // fully black — exactly matching the portfolio's black background — so the
      // sticky intro hands off to the scrolling page with no visible seam (the
      // Hero just emerges from the dark, like the prototype's fade-in).
      if (veilRef.current) {
        veilRef.current.style.opacity = String(
          Math.max(0, Math.min(1, (p - 0.5) / 0.32))
        );
      }
      if (blackoutRef.current) {
        blackoutRef.current.style.opacity = String(
          Math.max(0, Math.min(1, (p - 0.82) / 0.18))
        );
      }

      // Pause the WebGPU raymarch once we've fully fallen in (saves GPU while
      // the user browses the site); resume if they scroll back up.
      const shouldPause = p >= 0.999;
      if (shouldPause !== holePaused) {
        holePaused = shouldPause;
        holeControl.current?.setPaused(shouldPause);
      }

      if (!enteredFired && p > 0.85) {
        enteredFired = true;
        onEnterRef.current?.();
      }
    };

    const loop = () => {
      progress += (target - progress) * 0.09;
      cam.x += (pointer.x - cam.x) * 0.045;
      cam.y += (pointer.y - cam.y) * 0.045;
      // Hand the smoothed progress to the star simulation so it does the
      // fall-in warp behind the black hole.
      starFlow.progress = progress;
      applyTransforms();
      raf = requestAnimationFrame(loop);
    };

    onScroll();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: 0,
    margin: 0,
    zIndex: 2,
    color: "#fff",
    fontWeight: 200,
    letterSpacing: "0.45em",
    fontSize: "clamp(2.5rem, 9vw, 8rem)",
    lineHeight: 1,
    whiteSpace: "nowrap",
    paddingLeft: "0.45em",
    willChange: "transform, opacity",
    animation: "glowPulse 4.5s ease-in-out infinite",
  };

  return (
    <section ref={sectionRef} style={{ position: "relative", height: "300vh" }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, #0a0608 0%, #000 70%)",
        }}
      >
        <canvas
          ref={starRef}
          className="absolute inset-0 block h-full w-full"
          style={{ zIndex: 0 }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        >
          <BlackHoleCanvas control={holeControl} />
        </div>

        <div
          ref={veilRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            opacity: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(80% 70% at 50% 50%, rgba(20,6,2,.5) 0%, rgba(0,0,0,.96) 76%)",
          }}
        />

        <div
          ref={blackoutRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            opacity: 0,
            pointerEvents: "none",
            background: "#000",
          }}
        />

        <h1 ref={topRef} className={exo2.className} style={{ ...titleStyle, transform: "translate(-50%, 15vh)" }}>
          SAMUEL&apos;S
        </h1>
        <h1 ref={botRef} className={exo2.className} style={{ ...titleStyle, transform: "translate(-50%, 76vh)" }}>
          SPACE
        </h1>

        <div
          ref={hintRef}
          className={spaceMono.className}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "4vh",
            transform: "translateX(-50%)",
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.32em",
              color: "rgba(255,170,120,.85)",
              textTransform: "uppercase",
            }}
          >
            Scroll to fall in
          </span>
          <span
            style={{
              animation: "hintBob 1.8s ease-in-out infinite",
              color: "rgba(255,150,90,.9)",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            &#8595;
          </span>
        </div>
      </div>
    </section>
  );
};

export default CinematicIntro;
