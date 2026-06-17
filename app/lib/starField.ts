/**
 * starField — the ONE star simulation, shared by every canvas that wants it.
 *
 * A single set of stars and a single animation loop are owned here. Any number
 * of full-viewport canvases can `registerStarCanvas`; each frame the loop
 * advances the stars once and draws the *identical* frame to every registered
 * canvas. That lets two canvases show the exact same field with zero drift:
 *   - a fixed page-background canvas (StarField), and
 *   - a canvas inside the cinematic intro, sitting behind the WebGPU black hole
 *     so the disc's `mix-blend-screen` has real stars to composite over.
 *
 * The warp is driven by `starFlow.progress` (the intro's fall-in) and, once
 * we've fallen in, by page-scroll velocity — so the stars you fall through in
 * the intro carry seamlessly into the portfolio.
 */
import { starFlow, SPREAD } from "./starFlow";

const STAR_COUNT = 820;
const WARP = 2.0; // how hard page scrolling streaks the stars after the intro

interface Star {
  x: number;
  y: number;
  z: number;
}

const contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D>();
let stars: Star[] | null = null;
let raf = 0;
let listening = false;

let w = 0;
let h = 0;
let cx = 0;
let cy = 0;
const pointer = { x: 0, y: 0 };
const cam = { x: 0, y: 0 };
let lastFlow: number | null = null;
let releaseScrollY = 0;

const ensureStars = () => {
  if (stars) return;
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 0.25 + Math.random() * 0.75,
  }));
};

const sizeCanvas = (canvas: HTMLCanvasElement) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = contexts.get(canvas);
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const onResize = () => {
  w = window.innerWidth;
  h = window.innerHeight;
  cx = w / 2;
  cy = h / 2;
  contexts.forEach((_ctx, canvas) => sizeCanvas(canvas));
};

const onMove = (e: MouseEvent) => {
  pointer.x = e.clientX / window.innerWidth - 0.5;
  pointer.y = e.clientY / window.innerHeight - 0.5;
};

const draw = () => {
  cam.x += (pointer.x - cam.x) * 0.045;
  cam.y += (pointer.y - cam.y) * 0.045;

  // Depth travelled is a LINEAR function of intro progress (the tuned fall-in);
  // once we've fallen in, the portfolio adds gentle scroll-velocity warp on top
  // of the SPREAD baseline so the seam stays continuous.
  const p = starFlow.progress;
  let flow: number;
  if (p < 0.999) {
    flow = p * SPREAD;
    releaseScrollY = window.scrollY; // anchor for the post-intro warp
  } else {
    flow =
      SPREAD + ((window.scrollY - releaseScrollY) / window.innerHeight) * WARP;
  }
  let dScroll = flow - (lastFlow == null ? flow : lastFlow);
  lastFlow = flow;
  dScroll = Math.max(-0.5, Math.min(0.5, dScroll));
  const delta = 0.0016 + dScroll; // idle drift + scroll-driven advance
  const warp = Math.abs(dScroll) > 0.004;

  const ctxs = Array.from(contexts.values());
  for (const ctx of ctxs) ctx.clearRect(0, 0, w, h);

  const focal = Math.max(w, h) * 0.52;
  const px = cam.x * 0.55;
  const py = cam.y * 0.55;
  const list = stars!;

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
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
      const stroke = "rgba(255,238,224," + alpha + ")";
      for (const ctx of ctxs) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(sx, syy);
        ctx.stroke();
      }
    } else {
      const fill = "rgba(255,245,235," + alpha + ")";
      for (const ctx of ctxs) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(sx, syy, size, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  raf = requestAnimationFrame(draw);
};

/**
 * Register a full-viewport canvas to receive the shared starfield. Returns an
 * unregister function (call it on unmount). The loop and window listeners spin
 * up on the first canvas and tear down when the last one leaves.
 */
export const registerStarCanvas = (canvas: HTMLCanvasElement): (() => void) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  ensureStars();
  contexts.set(canvas, ctx);

  if (!listening) {
    listening = true;
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);
  } else {
    sizeCanvas(canvas); // match the already-known viewport size
  }

  return () => {
    contexts.delete(canvas);
    if (contexts.size === 0) {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      listening = false;
      lastFlow = null;
    }
  };
};
