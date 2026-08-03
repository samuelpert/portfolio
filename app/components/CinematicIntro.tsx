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
    // GTA-VI-style paced scroll: while the intro is pinned, wheel input is
    // intercepted and queued, then drained at a capped rate so the full
    // fall-in can never take less than this many seconds — a hard flick
    // rides the whole plunge instead of skipping it. Touch/scrollbar input
    // bypasses this and is caught by the raw-scroll blackout floor below.
    const MIN_INTRO_SECONDS = 2.8;
    let pendingScroll = 0;
    // True once we've jumped the (fully black) viewport to the top of the
    // site. While snapped the blackout fades out on its own CSS transition
    // instead of being scroll-driven.
    let snapped = false;

    // Cached section geometry. The section's offsetTop/offsetHeight only change
    // on layout (resize), never on scroll — and `rect.top` is just
    // `secTop - window.scrollY`. Measuring once per resize instead of calling
    // getBoundingClientRect() in the wheel handler and twice more per frame
    // removes a forced synchronous layout from every one of those calls. That
    // matters most on trackpads, where Chrome fires wheel events faster than
    // the frame rate.
    let secTop = 0;
    let secHeight = 0;
    let vh = 0;

    const measure = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      secTop = sec.offsetTop;
      secHeight = sec.offsetHeight;
      vh = window.innerHeight;
    };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };

    const onScroll = () => {
      const total = secHeight - vh;
      const scrolled = Math.min(Math.max(window.scrollY - secTop, 0), total);
      target = total > 0 ? scrolled / total : 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom, not scrolling
      const total = secHeight - vh;
      const top = secTop - window.scrollY; // === rect.top, without the layout
      const pinned = top <= 0 && top + secHeight - vh > 1;
      if (!pinned) {
        pendingScroll = 0;
        return;
      }
      e.preventDefault();
      // Normalize deltaMode (0 = pixels, 1 = lines, 2 = pages).
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= vh;
      pendingScroll += dy;
      // Never queue more than what's left of the intro (either direction), so
      // momentum doesn't keep pushing after the handoff.
      const scrolled = Math.min(Math.max(-top, 0), total);
      pendingScroll = Math.max(
        -scrolled - 10,
        Math.min(total - scrolled + 10, pendingScroll)
      );
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    // Last values actually written to the DOM. This loop runs for the life of
    // the page, so once the intro is behind you `progress` is pinned at 1 and
    // every frame would otherwise re-write the same handful of style strings
    // forever — each write invalidating style for that element. Skipping no-op
    // writes makes the post-intro loop essentially free.
    let wTopT = "";
    let wTopO = "";
    let wBotT = "";
    let wBotO = "";
    let wHintO = "";
    let wVeilO = "";
    let wBlackO = "";
    let wBlackTrans = "";

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
      const titleOpacity = String(Math.max(0, 1 - p * 2.1));
      const scale = 1 + p * 1.8;
      const shiftX = ccx * 34;
      if (topRef.current) {
        const ty = 15 - p * 55;
        const t =
          "translate(-50%, " + ty + "vh) translateX(" + shiftX + "px) scale(" + scale + ")";
        if (t !== wTopT) topRef.current.style.transform = wTopT = t;
        if (titleOpacity !== wTopO)
          topRef.current.style.opacity = wTopO = titleOpacity;
      }
      if (botRef.current) {
        const ty = 76 + p * 52;
        const t =
          "translate(-50%, " + ty + "vh) translateX(" + shiftX + "px) scale(" + scale + ")";
        if (t !== wBotT) botRef.current.style.transform = wBotT = t;
        if (titleOpacity !== wBotO)
          botRef.current.style.opacity = wBotO = titleOpacity;
      }
      if (hintRef.current) {
        const o = String(Math.max(0, 1 - p * 5));
        if (o !== wHintO) hintRef.current.style.opacity = wHintO = o;
      }

      // "Past the event horizon": a warm void glows in as we plunge (0.5→0.82),
      // then a pure-black blackout completes (0.82→1.0). By p≈1 the screen is
      // fully black — exactly matching the portfolio's black background — so the
      // sticky intro hands off to the scrolling page with no visible seam (the
      // Hero just emerges from the dark, like the prototype's fade-in).
      if (veilRef.current) {
        const o = String(Math.max(0, Math.min(1, (p - 0.5) / 0.32)));
        if (o !== wVeilO) veilRef.current.style.opacity = wVeilO = o;
      }
      // The blackout is floored by the RAW scroll position, not just the
      // smoothed progress: on a fast flick the smoothed value lags, and the
      // sticky section would unpin while the transition is still half-visible,
      // scrolling the unfinished intro away. The raw floor completes at 0.95 —
      // before the unpin at 1.0 — so the handoff is always black-on-black.
      const black = Math.max(
        0,
        Math.min(1, Math.max((p - 0.82) / 0.18, (target - 0.8) / 0.15))
      );
      const bo = blackoutRef.current;
      if (bo && !snapped) {
        if (wBlackTrans !== "none") bo.style.transition = wBlackTrans = "none";
        const o = String(black);
        if (o !== wBlackO) bo.style.opacity = wBlackO = o;
      }

      // The zoom handoff: once the screen is fully black and the intro is
      // fully scrolled, silently jump the viewport to the top of the site and
      // fade from black while the Hero zooms in. Without this the site slides
      // up from below like normal page scrolling — with it, the site emerges
      // in place, continuing the fall-in zoom.
      if (!snapped && target >= 0.999 && black >= 1) {
        snapped = true;
        const siteTop = secTop + secHeight;
        if (window.scrollY < siteTop) {
          window.scrollTo({ top: siteTop, behavior: "instant" });
        }
        if (bo) {
          bo.style.transition = wBlackTrans = "opacity 1s ease";
          bo.style.opacity = wBlackO = "0";
        }
        if (!enteredFired) {
          enteredFired = true;
          onEnterRef.current?.();
        }
      }

      // Scrolled back up into the intro (the veil is already near-opaque at
      // this point, so resuming the scroll-driven blackout doesn't flash).
      if (snapped && target < 0.85) {
        snapped = false;
      }

      // Pause the WebGPU raymarch once we've fully fallen in (saves GPU while
      // the user browses the site); resume if they scroll back up.
      const shouldPause = p >= 0.999;
      if (shouldPause !== holePaused) {
        holePaused = shouldPause;
        holeControl.current?.setPaused(shouldPause);
      }

      // Also trigger off the raw scroll so a fast flick past the intro still
      // starts the Hero animation immediately.
      if (!enteredFired && (p > 0.85 || target > 0.95)) {
        enteredFired = true;
        onEnterRef.current?.();
      }
    };

    let lastTime = performance.now();
    const loop = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      lastTime = now;

      // Drain queued wheel input at a capped rate — this is what paces the
      // plunge. The cap is the full intro distance over MIN_INTRO_SECONDS.
      // Uses wall-clock dt (not the smoothing-capped one) so dropped frames
      // don't slow the drain below the intended pace.
      if (pendingScroll !== 0) {
        const total = secHeight - vh;
        if (total > 0) {
          const maxRate = total / MIN_INTRO_SECONDS; // px per second
          const step =
            Math.sign(pendingScroll) *
            Math.min(Math.abs(pendingScroll), maxRate * Math.min(rawDt, 0.25));
          window.scrollBy({ top: step, behavior: "instant" });
          pendingScroll -= step;
          if (Math.abs(pendingScroll) < 0.5) pendingScroll = 0;
          // Pick up the new position this same frame. Now that onScroll reads
          // only window.scrollY against cached geometry, this no longer forces
          // a layout right after the scroll write — the frame is a clean
          // read-then-write instead of read/write/read/write.
          onScroll();
        } else {
          pendingScroll = 0;
        }
      }

      // Gap-adaptive, framerate-independent smoothing. Slow scrolls keep the
      // old gentle feel (base rate ≈ the previous 0.09/frame at 60fps), but
      // when a fast flick opens a big gap the rate ramps up so the plunge and
      // blackout finish before the sticky section unpins, instead of the
      // transition getting cut off mid-way.
      const gap = target - progress;
      const rate = 6 + Math.abs(gap) * 16;
      progress += gap * (1 - Math.exp(-rate * dt));
      // Snap when close so progress actually reaches 1 and pauses the GPU.
      if (Math.abs(target - progress) < 0.0005) progress = target;

      cam.x += (pointer.x - cam.x) * 0.045;
      cam.y += (pointer.y - cam.y) * 0.045;
      // Hand the smoothed progress to the star simulation so it does the
      // fall-in warp behind the black hole.
      starFlow.progress = progress;
      applyTransforms();
      raf = requestAnimationFrame(loop);
    };

    measure();
    onScroll();
    // Page loaded (or refreshed) already past the intro: skip the transition
    // entirely — no blackout, no snap, respect the restored scroll position.
    if (target >= 0.999) {
      progress = target;
      snapped = true;
      enteredFired = true;
      onEnterRef.current?.();
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Must be non-passive: the intro consumes wheel input while pinned.
    window.addEventListener("wheel", onWheel, { passive: false });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
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
    // The glow pulse lives on `.introTitle::before` (see globals.css) so it
    // animates opacity instead of text-shadow.
  };

  return (
    <>
      {/*
        The blackout lives OUTSIDE the sticky section as a fixed overlay so it
        keeps covering the screen through the snap-to-site scroll jump — inside
        the section it would scroll away with it, exposing the jump.
      */}
      <div
        ref={blackoutRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          opacity: 0,
          pointerEvents: "none",
          background: "#000",
          // Promote: its opacity is written every frame during the plunge, and
          // an unpromoted full-viewport layer repaints on each change.
          willChange: "opacity",
        }}
      />
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
            // Same as the blackout: full-viewport, opacity animated per frame.
            willChange: "opacity",
          }}
        />

        <h1
          ref={topRef}
          className={`${exo2.className} introTitle`}
          data-text="SAMUEL'S"
          style={{ ...titleStyle, transform: "translate(-50%, 15vh)" }}
        >
          SAMUEL&apos;S
        </h1>
        <h1
          ref={botRef}
          className={`${exo2.className} introTitle`}
          data-text="SPACE"
          style={{ ...titleStyle, transform: "translate(-50%, 76vh)" }}
        >
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
    </>
  );
};

export default CinematicIntro;
