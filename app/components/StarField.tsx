"use client";

import React, { useEffect, useRef } from "react";

/**
 * StarField
 *
 * Site-wide starfield — the 2D perspective stars from the intro, promoted to a
 * fixed background behind the whole page (replaces the old R3F StarBackground).
 * Idle-drifts at rest and streaks with scroll velocity, so the same stars you
 * fall through in the intro sit behind the portfolio too.
 */
const STAR_COUNT = 820;
const WARP = 2.0; // how hard scrolling streaks the stars

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    const pointer = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };
    let lastScrollY = window.scrollY;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: 0.25 + Math.random() * 0.75,
    }));

    const onResize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };

    const draw = () => {
      cam.x += (pointer.x - cam.x) * 0.045;
      cam.y += (pointer.y - cam.y) * 0.045;

      const sy = window.scrollY;
      let dScroll = ((sy - lastScrollY) / window.innerHeight) * WARP;
      lastScrollY = sy;
      dScroll = Math.max(-0.5, Math.min(0.5, dScroll));
      const delta = 0.0016 + dScroll; // idle drift + scroll-driven advance
      const warp = Math.abs(dScroll) > 0.004;

      ctx.clearRect(0, 0, w, h);
      const focal = Math.max(w, h) * 0.52;
      const px = cam.x * 0.55;
      const py = cam.y * 0.55;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const pz = s.z;
        s.z -= delta;
        let recycled = false;
        if (s.z <= 0.02) {
          s.z += 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          recycled = true;
        } else if (s.z > 1.0) {
          s.z -= 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          recycled = true;
        }

        const sx = cx + ((s.x + px) / s.z) * focal;
        const syy = cy + ((s.y + py) / s.z) * focal;
        if (sx < -60 || sx > w + 60 || syy < -60 || syy > h + 60) continue;
        const depth = 1 - s.z;
        const size = depth * 2.3 + 0.5;
        const alpha = Math.min(1, 0.3 + depth * 1.1);

        if (warp && !recycled) {
          const ox = cx + ((s.x + px) / pz) * focal;
          const oy = cy + ((s.y + py) / pz) * focal;
          ctx.strokeStyle = "rgba(255,238,224," + alpha + ")";
          ctx.lineWidth = size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(sx, syy);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(255,245,235," + alpha + ")";
          ctx.beginPath();
          ctx.arc(sx, syy, size, 0, 6.2832);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 block h-full w-full"
    />
  );
};

export default StarField;
