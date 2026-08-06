/**
 * starField — the fly-through starfield behind the black hole.
 *
 * Stars live only in the intro: the canvas sits behind the WebGPU raymarcher so
 * the disc's `mix-blend-screen` has something real to composite over, and it
 * fades out with the plunge. Once you've fallen in, the content scrolls — there
 * is intentionally nothing animating behind the page.
 *
 * Depth travelled is a linear function of the intro's scroll progress, so the
 * warp is driven entirely by how fast you scroll: hold still and the stars only
 * drift, flick and they streak.
 */
import { clamp, SPREAD } from "@/app/components/singularity/engine";

interface Star {
  x: number;
  y: number;
  z: number;
}

export interface StarFieldOptions {
  /** Number of stars. Phones and reduced-motion get fewer. */
  count: number;
  /** Scales how hard scrolling streaks the stars (the motionIntensity slider). */
  intensity: number;
  reduced: boolean;
}

export interface StarField {
  /** Advance and draw one frame. `progress` is the intro's 0 → 1 fall-in. */
  draw(progress: number, camX: number, camY: number): void;
  dispose(): void;
}

export const createStarField = (
  canvas: HTMLCanvasElement,
  { count, intensity, reduced }: StarFieldOptions
): StarField | null => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const stars: Star[] = Array.from({ length: count }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 0.25 + Math.random() * 0.75,
  }));

  let w = 0;
  let h = 0;
  let lastFlow: number | null = null;

  // A ResizeObserver rather than reading clientWidth per frame: the draw runs
  // right after the scroll handler has written styles, so a size read there
  // would force a synchronous layout on every single frame of the plunge.
  const resize = () => {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch || (cw === w && ch === h)) return;
    w = cw;
    h = ch;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    draw(progress, camX, camY) {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, w, h);

      const flow = progress * SPREAD;
      let dScroll = flow - (lastFlow == null ? flow : lastFlow);
      lastFlow = flow;
      dScroll = clamp(dScroll, -0.5, 0.5) * intensity;
      const delta = (reduced ? 0.0006 : 0.0016) + dScroll; // idle drift + scroll
      const warp = !reduced && Math.abs(dScroll) > 0.004;

      const cx = w / 2;
      const cy = h / 2;
      const focal = Math.max(w, h) * 0.52;
      const px = camX * 0.55;
      const py = camY * 0.55;

      for (const s of stars) {
        const pz = s.z;
        s.z -= delta;
        let recycled = false;
        if (s.z <= 0.02) {
          s.z += 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          recycled = true;
        } else if (s.z > 1) {
          s.z -= 1;
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          recycled = true;
        }

        const sx = cx + ((s.x + px) / s.z) * focal;
        const sy = cy + ((s.y + py) / s.z) * focal;
        if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) continue;

        const depth = 1 - s.z;
        const size = depth * 2.3 + 0.5;
        const alpha = Math.min(1, 0.3 + depth * 1.1);

        // Streak from where the star was to where it is: the same star drawn as
        // a line instead of a dot is what reads as warp speed.
        if (warp && !recycled) {
          const ox = cx + ((s.x + px) / pz) * focal;
          const oy = cy + ((s.y + py) / pz) * focal;
          ctx.strokeStyle = "rgba(255,238,224," + alpha + ")";
          ctx.lineWidth = size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(255,245,235," + alpha + ")";
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, 6.2832);
          ctx.fill();
        }
      }
    },
    dispose() {
      ro.disconnect();
    },
  };
};
