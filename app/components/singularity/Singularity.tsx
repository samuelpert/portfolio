"use client";

import React, { useCallback, useEffect, useRef } from "react";
import IntroSection from "./IntroSection";
import HeroSection from "./HeroSection";
import ProjectsSection from "./ProjectsSection";
import TimelineSection from "./TimelineSection";
import ContactSection from "./ContactSection";
import StageHud from "./StageHud";
import { BlackHoleControl } from "../BlackHoleCanvas";
import { createStarField, StarField } from "@/app/lib/starField";
import { phaseNames } from "@/app/data";
import {
  clamp,
  DESKTOP,
  formatTau,
  lerp,
  MOBILE,
  MOBILE_QUERY,
  MOTION_INTENSITY,
  smooth,
  Tuning,
} from "./engine";

/**
 * Singularity — the whole page, and the single loop that animates it.
 *
 * Every section below renders once and never re-renders; all motion is written
 * imperatively from one requestAnimationFrame loop that reads `window.scrollY`
 * and nothing else. That is deliberate:
 *
 *  - Scroll position maps DIRECTLY to progress, with no smoothing in between.
 *    A smoothed value lags behind a hard flick, which is how a sticky section
 *    can unpin while its transition is still half-played. Here the plunge is
 *    exactly where the scrollbar is, so it can't be outrun.
 *  - Layout is measured once per resize into `geo`, never inside the loop, and
 *    every style write goes through `setStyle`, which drops writes that
 *    wouldn't change anything. A frame where nothing moved costs nothing.
 *
 * The section components own the markup; this file finds the pieces it drives
 * by data-attribute, the same way the mockup does.
 */
const Singularity: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const holeControl = useRef<BlackHoleControl | null>(null);
  // null while WebGPU is still initialising. Set from a child effect, which
  // runs before this one, so the loop polls it rather than reacting to it.
  const gpuStatus = useRef<boolean | null>(null);
  const handleStatus = useCallback((ready: boolean) => {
    gpuStatus.current = ready;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = <T extends HTMLElement>(sel: string) =>
      root.querySelector<T>(sel);
    const qa = <T extends HTMLElement>(sel: string) => [
      ...root.querySelectorAll<T>(sel),
    ];

    const el = {
      blackout: q("[data-blackout]")!,
      intro: q("[data-intro]")!,
      canvas: q<HTMLCanvasElement>("[data-bh]")!,
      hr: q("[data-hr]")!,
      vel: q("[data-vel]")!,
      hero: q("[data-hero]")!,
      words: qa("[data-word]"),
      rest: qa("[data-hero-rest]"),
      chaps: qa("[data-ch]"),
      stages: qa<HTMLAnchorElement>("[data-stage]"),
      fills: qa("[data-fill]"),
      stage: q("[data-f-stage]")!,
      cards: qa<HTMLAnchorElement>("[data-f-card]"),
      count: q("[data-f-count]")!,
      fphase: q("[data-f-phase]")!,
      maze: q("[data-maze]")!,
      ttrack: q("[data-ttrack]")!,
      tfill: q("[data-tfill]")!,
      comet: q("[data-comet]")!,
      rows: qa("[data-tl]"),
      tsec: q("[data-tsec]")!,
      phase: q("[data-phase]")!,
      rEl: q("[data-r]")!,
      tauEl: q("[data-tau]")!,
      dilfac: q("[data-dilfac]")!,
      work: q<HTMLAnchorElement>("[data-work]"),
    };

    const mq = window.matchMedia(MOBILE_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let T: Tuning = mq.matches ? MOBILE : DESKTOP;

    // ---- style writes -------------------------------------------------------
    // The loop re-derives every value each frame; most of them don't change
    // from one frame to the next, and an unchanged write still invalidates
    // style for that element. Remembering the last value makes an idle frame
    // free and a slow-scroll frame nearly so.
    const written = new WeakMap<HTMLElement, Record<string, string>>();
    const setStyle = (node: HTMLElement, prop: string, value: string) => {
      let rec = written.get(node);
      if (!rec) written.set(node, (rec = {}));
      if (rec[prop] === value) return;
      rec[prop] = value;
      node.style.setProperty(prop, value);
    };
    const setText = (node: HTMLElement, value: string) => {
      if (node.textContent !== value) node.textContent = value;
    };

    // ---- geometry -----------------------------------------------------------
    // Measured on resize only. Reading offsets inside the loop — after the loop
    // has written styles — forces a synchronous layout on every frame.
    const geo = {
      vh: 0,
      docTotal: 1,
      introTop: 0,
      introH: 0,
      chaps: [] as { top: number; h: number }[],
      mazeTop: 0,
      mazeH: 0,
      trackTop: 0,
      trackH: 0,
      tsecTop: 0,
      tsecH: 0,
      rowTops: [] as number[],
      stageW: 0,
      stageH: 0,
    };

    const measure = () => {
      const y = window.scrollY;
      const top = (node: HTMLElement) =>
        node.getBoundingClientRect().top + y;
      geo.vh = window.innerHeight;
      geo.introTop = top(el.intro);
      geo.introH = el.intro.offsetHeight;
      geo.chaps = el.chaps.map((c) => ({ top: top(c), h: c.offsetHeight }));
      geo.mazeTop = top(el.maze);
      geo.mazeH = el.maze.offsetHeight;
      geo.trackTop = top(el.ttrack);
      geo.trackH = el.ttrack.offsetHeight;
      geo.tsecTop = top(el.tsec);
      geo.tsecH = el.tsec.offsetHeight;
      geo.rowTops = el.rows.map(top);
      geo.stageW = el.stage.clientWidth;
      geo.stageH = el.stage.clientHeight;
      geo.docTotal = Math.max(
        1,
        document.documentElement.scrollHeight - geo.vh
      );
    };

    // ---- state --------------------------------------------------------------
    const ptr = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };
    let introOff = false;
    let snapped = false;
    let gpuPaused = false;
    let lastP = -1;
    let lastQ = -1;
    let lastCometY = -1;
    let tau = 0;
    let dil = 1;

    let field: StarField | null = createStarField(el.canvas, {
      count: reduced ? T.starCountReduced : T.starCount,
      intensity: MOTION_INTENSITY,
      reduced,
    });

    /**
     * No WebGPU means no black hole, and an intro with nothing in it is just
     * 380vh of empty scrolling — so drop it entirely and open on the hero.
     */
    const killIntro = () => {
      if (introOff) return;
      introOff = true;
      snapped = true;
      setStyle(el.intro, "display", "none");
      setStyle(el.blackout, "opacity", "0");
      setStyle(el.hero, "transition", "none");
      setStyle(el.hero, "opacity", "1");
      setStyle(el.hero, "transform", "none");
      for (const w of el.words) {
        setStyle(w, "opacity", "1");
        setStyle(w, "transform", "none");
      }
      for (const r of el.rest) {
        setStyle(r, "opacity", "1");
        setStyle(r, "transform", "none");
      }
      field?.dispose();
      field = null;
      window.scrollTo({ top: 0, behavior: "instant" });
      measure();
    };

    // ---- the intro ----------------------------------------------------------
    const runIntro = (st: number) => {
      const p = clamp(
        (st - geo.introTop) / Math.max(1, geo.introH - geo.vh),
        0,
        1
      );

      if (p !== lastP) {
        lastP = p;
        root.style.setProperty("--p", p.toFixed(4));
        const ep = smooth(p);
        setText(el.hr, (12 - 11.4 * ep).toFixed(1));
        setText(el.vel, "v / c " + (0.02 + 0.94 * Math.pow(p, 1.6)).toFixed(2));
      }

      // Quadratic ease-in on the camera dolly: the fall starts gently and
      // accelerates into the hole. Pointer parallax rides on top.
      cam.x += (ptr.x - cam.x) * 0.045;
      cam.y += (ptr.y - cam.y) * 0.045;
      holeControl.current?.setCamera(p * p, cam.x, cam.y);
      const paused = p >= 0.999;
      if (paused !== gpuPaused) {
        gpuPaused = paused;
        holeControl.current?.setPaused(paused);
      }

      // Emerge from inside the hole. At full blackout, silently jump the view
      // to the top of the site and fade up from black — the site continues the
      // fall-in in place instead of scrolling in from below.
      if (!snapped) {
        setStyle(el.blackout, "transition", "none");
        setStyle(
          el.blackout,
          "opacity",
          clamp((p - 0.78) / 0.2, 0, 1).toFixed(3)
        );
      }
      if (!snapped && p >= 0.99) {
        snapped = true;
        setStyle(el.blackout, "transition", "none");
        setStyle(el.blackout, "opacity", "1");
        const siteTop = geo.introTop + geo.introH;
        if (st < siteTop) window.scrollTo({ top: siteTop, behavior: "instant" });
        requestAnimationFrame(() => {
          setStyle(el.blackout, "transition", "opacity 1.4s ease");
          setStyle(el.blackout, "opacity", "0");
        });
      }
      if (snapped && p < 0.85) snapped = false;

      // Stars only exist inside the intro; once it's behind you the canvas is
      // faded out and there is nothing to draw.
      if (st <= geo.introTop + geo.introH) field?.draw(p, cam.x, cam.y);
    };

    // ---- the hero, revealed by scroll --------------------------------------
    const revealHero = (st: number) => {
      const ch1 = geo.chaps[0];
      if (!ch1) return;
      const qv = clamp((st - ch1.top) / Math.max(1, ch1.h - geo.vh), 0, 1);
      if (qv === lastQ) return;
      lastQ = qv;

      setStyle(el.hero, "opacity", "1");
      setStyle(el.hero, "transform", "none");

      const n = el.words.length;
      el.words.forEach((word, i) => {
        const wq = smooth(clamp((qv - (i / n) * 0.55) / 0.3, 0, 1));
        setStyle(word, "opacity", wq.toFixed(3));
        setStyle(
          word,
          "transform",
          "translateY(" + ((1 - wq) * T.wordRise).toFixed(1) + "px)"
        );
      });

      // Everything that isn't the headline follows it in, as one block.
      const rq = smooth(clamp((qv - 0.55) / 0.4, 0, 1));
      for (const r of el.rest) {
        setStyle(r, "opacity", rq.toFixed(3));
        setStyle(
          r,
          "transform",
          "translateY(" + ((1 - rq) * T.restRise).toFixed(1) + "px)"
        );
      }
    };

    // ---- the projects: deck sweep → mosaic ---------------------------------
    const layoutMaze = (st: number) => {
      const W = geo.stageW;
      const H = geo.stageH;
      if (!W || !H) return;

      const cp = clamp(
        (st - geo.mazeTop) / Math.max(1, geo.mazeH - geo.vh),
        0,
        1
      );
      const n = el.cards.length;
      // Cards arrive one per unit of `prog`; the last stretch of the chapter is
      // spent unfolding the finished deck into the mosaic.
      const prog = clamp(cp / T.enterEnd, 0, 1) * n;
      const finish = smooth(clamp((cp - T.enterEnd) / T.settleWindow, 0, 1));

      const dw = Math.min(T.deckMaxW, W * T.deckWidthFrac);
      const dh = Math.min(H * T.deckHeightFrac, dw * T.deckAspect);
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      const gx = W * T.gapXFrac;
      const gy = H * T.gapYFrac;

      let settled = 0;
      el.cards.forEach((card, i) => {
        const rv = clamp(prog - i, 0, 1);
        const en = smooth(rv);
        // Every card but the last settles as the next one arrives; the last one
        // waits for the whole deck to be in before the mosaic unfolds.
        const settle =
          i === n - 1 ? finish : smooth(clamp(prog - i - 0.72, 0, 1));
        if (settle > 0.9) settled++;

        const m = T.mosaic[i % T.mosaic.length];
        const mx = m.x * W;
        const my = m.y * H;
        const mw = m.w * W - gx;
        const mh = m.h * H - gy;
        const side = i % 2 ? 1 : -1;

        const x = lerp(
          dx + side * (1 - en) * W * T.sweepFrac * MOTION_INTENSITY,
          mx,
          settle
        );
        const y = lerp(dy + (1 - en) * T.riseY, my, settle);
        const w = lerp(dw, mw, settle);
        const h = lerp(dh, mh, settle);
        const scale = lerp(lerp(0.9, 1, en), 1, settle);
        const opacity = rv <= 0 ? 0 : Math.min(1, rv * 1.8);

        setStyle(card, "width", w.toFixed(1) + "px");
        setStyle(card, "height", h.toFixed(1) + "px");
        setStyle(
          card,
          "transform",
          "translate3d(" +
            x.toFixed(1) +
            "px," +
            y.toFixed(1) +
            "px,0) scale(" +
            scale.toFixed(3) +
            ")"
        );
        setStyle(card, "opacity", opacity.toFixed(3));
        setStyle(
          card,
          "filter",
          1 - en > 0.05 ? "blur(" + ((1 - en) * 5).toFixed(2) + "px)" : "none"
        );
        // In flight a card is above the settled ones; once it lands it drops
        // behind them so the mosaic's overlaps stack in reading order.
        setStyle(card, "z-index", String(settle > 0.02 ? 10 + i : 40 + i));
        setStyle(card, "pointer-events", opacity > 0.75 ? "auto" : "none");

        const desc = card.querySelector<HTMLElement>("[data-f-desc]");
        if (desc) {
          const room = h > T.descMinH && w > T.descMinW;
          setStyle(desc, "opacity", room ? "1" : (1 - settle).toFixed(2));
          setStyle(
            desc,
            "max-height",
            room
              ? T.descMaxH + "px"
              : ((1 - settle) * T.descCollapseH).toFixed(1) + "px"
          );
        }
        const title = card.querySelector<HTMLElement>("[data-f-title]");
        if (title) {
          setStyle(
            title,
            "font-size",
            (w < T.titleNarrowW ? T.titleNarrowSize : T.titleSize) + "px"
          );
        }
      });

      setText(
        el.count,
        String(clamp(Math.ceil(prog) || 1, 1, n)).padStart(2, "0")
      );
      setText(
        el.fphase,
        settled >= n ? "Mosaic locked" : settled > 0 ? "Assembling" : "Infalling"
      );
      setStyle(
        el.fphase,
        "color",
        settled > 0 ? "var(--sg-gold)" : "rgba(232,230,225,.4)"
      );
    };

    // ---- the timeline: a comet drawing the line ----------------------------
    const layoutComet = (st: number) => {
      const wh = Math.max(1, geo.trackH - T.trackInset);
      const probe = st + geo.vh * T.cometProbe;
      const prog = T.cometFromSection
        ? clamp((probe - geo.tsecTop) / Math.max(1, geo.tsecH), 0, 1)
        : clamp((probe - geo.trackTop) / wh, 0, 1);
      const y = prog * wh;
      if (y === lastCometY) return;
      lastCometY = y;

      setStyle(el.tfill, "height", y.toFixed(1) + "px");
      setStyle(el.comet, "transform", "translateY(" + y.toFixed(1) + "px)");
      setStyle(el.comet, "opacity", prog >= 1 ? "0" : "1");

      el.rows.forEach((row, i) => {
        const at = geo.rowTops[i] + T.rowDotOffset - geo.trackTop;
        const distance = Math.abs(at - y);
        const passed = y >= at - 4;
        const flare = clamp(1 - distance / T.rowFlareRange, 0, 1);

        setStyle(row, "opacity", passed ? "1" : (0.28 + flare * 0.45).toFixed(3));
        setStyle(row, "transform", passed ? "none" : "translateY(10px)");

        const heading = row.querySelector<HTMLElement>("h3");
        if (heading) {
          setStyle(
            heading,
            "color",
            flare > 0.5 ? "oklch(0.88 0.12 74)" : "var(--sg-fg)"
          );
        }
        const dot = row.querySelector<HTMLElement>("[data-dot]");
        if (dot) {
          setStyle(dot, "background", passed ? "var(--sg-gold)" : "var(--sg-bg)");
          setStyle(
            dot,
            "box-shadow",
            flare > 0.2
              ? "0 0 " + (18 * flare).toFixed(0) + "px oklch(0.82 0.13 72 / .9)"
              : "none"
          );
        }
      });
    };

    // ---- the stage bar ------------------------------------------------------
    const updateHud = (st: number, dt: number) => {
      const depth = clamp(st / geo.docTotal, 0, 1);
      dil = 1 - T.dilRate * depth;
      setText(el.rEl, Math.max(0.001, 1 - depth).toFixed(3));
      setText(el.dilfac, "dt' / dt " + dil.toFixed(2));
      tau += dt * dil;
      setText(el.tauEl, formatTau(tau, T.tauDecimals));

      // The probe sits a little above the middle of the screen: a chapter is
      // "current" once it owns that line, which is where the eye is.
      let active = -1;
      const probe = st + geo.vh * 0.55;
      geo.chaps.forEach((c, i) => {
        // The last chapter can never be scrolled past, so measuring it like
        // the others would leave its bar stalled around half full.
        const span =
          i === geo.chaps.length - 1 ? Math.max(1, c.h - geo.vh * 0.45) : c.h;
        const cp = clamp((probe - c.top) / span, 0, 1);
        if (el.fills[i]) {
          setStyle(el.fills[i], "width", (cp * 100).toFixed(1) + "%");
        }
        if (probe >= c.top && probe < c.top + c.h) active = i;
        setStyle(
          el.stages[i],
          "color",
          active === i ? "oklch(0.86 0.12 74)" : "var(--sg-faint)"
        );
      });
      setText(el.phase, active < 0 ? "Infalling" : phaseNames[active]);
    };

    // ---- loop ---------------------------------------------------------------
    let raf = 0;
    let last = performance.now();

    const tick = (dt: number) => {
      if (gpuStatus.current === false) killIntro();
      const st = window.scrollY;
      if (!introOff) {
        runIntro(st);
        revealHero(st);
      }
      updateHud(st, dt);
      layoutMaze(st);
      layoutComet(st);
    };

    const loop = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      tick(dt);
      raf = requestAnimationFrame(loop);
    };

    // ---- listeners ----------------------------------------------------------
    const onMove = (e: MouseEvent) => {
      ptr.x = e.clientX / window.innerWidth - 0.5;
      ptr.y = e.clientY / window.innerHeight - 0.5;
    };
    const onBreakpoint = () => {
      T = mq.matches ? MOBILE : DESKTOP;
      measure();
    };

    // Content settling (fonts, images) changes section offsets without ever
    // firing a resize, so watch the root box as well as the window.
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    window.addEventListener("resize", measure);
    window.addEventListener("mousemove", onMove, { passive: true });
    mq.addEventListener("change", onBreakpoint);

    const reveals = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.style.opacity = "1";
          node.style.transform = "none";
          reveals.unobserve(node);
        }),
      { threshold: 0.12 }
    );
    qa("[data-reveal]").forEach((node) => reveals.observe(node));

    const goTo = (index: number) => (ev: Event) => {
      ev.preventDefault();
      const c = geo.chaps[index];
      if (c) window.scrollTo({ top: c.top - 10, behavior: "smooth" });
    };
    const stageClicks = el.stages.map((s, i) => {
      const handler = goTo(i);
      s.addEventListener("click", handler);
      return handler;
    });
    const workClick = goTo(1);
    el.work?.addEventListener("click", workClick);

    measure();
    // Loaded (or refreshed, or deep-linked) already past the intro: the plunge
    // is over, so start on the far side of the handoff rather than fading up
    // from black at a scroll position the visitor never fell to.
    if (
      (window.scrollY - geo.introTop) / Math.max(1, geo.introH - geo.vh) >=
      0.999
    ) {
      snapped = true;
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      reveals.disconnect();
      field?.dispose();
      window.removeEventListener("resize", measure);
      window.removeEventListener("mousemove", onMove);
      mq.removeEventListener("change", onBreakpoint);
      el.stages.forEach((s, i) =>
        s.removeEventListener("click", stageClicks[i])
      );
      el.work?.removeEventListener("click", workClick);
    };
  }, []);

  return (
    <div className="sg-root" ref={rootRef}>
      {/* Fixed, and outside the sticky intro, so it keeps covering the screen
          through the scroll jump that hands off to the site. */}
      <div className="sg-blackout" data-blackout aria-hidden />

      <IntroSection control={holeControl} onStatus={handleStatus} />
      <HeroSection />
      <ProjectsSection />
      <TimelineSection />
      <ContactSection />
      <StageHud />
    </div>
  );
};

export default Singularity;
