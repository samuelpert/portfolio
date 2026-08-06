/**
 * Tuning constants and pure helpers for the Singularity scroll.
 *
 * Everything here is layout maths with no DOM in it. The two `Tuning` objects
 * are the only place the desktop and phone (mockup 1a) choreographies differ in
 * numbers — the structure of the animation is identical, so `Singularity.tsx`
 * reads one of these and never branches on viewport again.
 */

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** Smoothstep — the ease used for every reveal on the page. */
export const smooth = (t: number) => t * t * (3 - 2 * t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The mockup's `motionIntensity` slider (0–2), at the value the design was
 * signed off on. It scales two things: how far the project cards start off to
 * the side before sweeping in, and how hard scrolling streaks the stars. Raise
 * toward 1 for the full-width sweep; 0 pins the cards and stills the warp.
 */
export const MOTION_INTENSITY = 0.1;

/** Depth crossed by the starfield over one full intro scroll. */
export const SPREAD = 7;

/** The phone choreography kicks in below this width (matches singularity.css). */
export const MOBILE_QUERY = "(max-width: 767px)";

/** Mosaic cells, as fractions of the stage box, in card order. */
type Cell = { x: number; y: number; w: number; h: number };

export interface Tuning {
  /** Where the four cards land once they've settled. */
  mosaic: Cell[];
  /** Fraction of the chapter's scroll spent bringing cards onto the deck. */
  enterEnd: number;
  /** Fraction spent unfolding the deck into the mosaic afterwards. */
  settleWindow: number;
  /** Deck card size: min(deckMaxW, W * deckWidthFrac), height min(H * deckHeightFrac, w * deckAspect). */
  deckMaxW: number;
  deckWidthFrac: number;
  deckHeightFrac: number;
  deckAspect: number;
  /** Mosaic gutters, as fractions of the stage. */
  gapXFrac: number;
  gapYFrac: number;
  /** How far off to the side a card starts, as a fraction of stage width. */
  sweepFrac: number;
  /** How far below the deck a card starts, in px. */
  riseY: number;
  /** A card shows its description only once its cell is at least this big. */
  descMinH: number;
  descMinW: number;
  descMaxH: number;
  descCollapseH: number;
  /** Card titles shrink in the narrow mosaic cells. */
  titleNarrowW: number;
  titleNarrowSize: number;
  titleSize: number;
  /** Hero reveal: how far a word / the supporting block rises into place, in px. */
  wordRise: number;
  restRise: number;
  /** How much proper time slows by the bottom of the page (the τ clock). */
  dilRate: number;
  /** Stars: fewer on phones, fewer again when motion is reduced. */
  starCount: number;
  starCountReduced: number;
  /**
   * The comet's position. Desktop measures against the timeline track itself;
   * the phone measures against the whole (unpinned) section, which reaches the
   * end of the list a little sooner.
   */
  cometFromSection: boolean;
  cometProbe: number;
  /** Track padding the comet has to sit inside, and the per-row dot offset. */
  trackInset: number;
  rowDotOffset: number;
  rowFlareRange: number;
  /** τ readout precision. */
  tauDecimals: number;
}

export const DESKTOP: Tuning = {
  mosaic: [
    { x: 0, y: 0, w: 0.575, h: 0.56 },
    { x: 0.59, y: 0, w: 0.41, h: 0.34 },
    { x: 0.59, y: 0.36, w: 0.41, h: 0.64 },
    { x: 0, y: 0.58, w: 0.575, h: 0.42 },
  ],
  enterEnd: 0.74,
  settleWindow: 0.2,
  deckMaxW: 640,
  deckWidthFrac: 0.6,
  deckHeightFrac: 0.95,
  deckAspect: 0.84,
  gapXFrac: 0.012,
  gapYFrac: 0.012,
  sweepFrac: 0.7,
  riseY: 60,
  descMinH: 300,
  descMinW: 380,
  descMaxH: 160,
  descCollapseH: 120,
  titleNarrowW: 420,
  titleNarrowSize: 16.5,
  titleSize: 19,
  wordRise: 26,
  restRise: 18,
  dilRate: 0.88,
  starCount: 820,
  starCountReduced: 240,
  cometFromSection: false,
  cometProbe: 0.62,
  trackInset: 16,
  rowDotOffset: 11 - 8,
  rowFlareRange: 110,
  tauDecimals: 3,
};

export const MOBILE: Tuning = {
  mosaic: [
    { x: 0, y: 0, w: 0.56, h: 0.48 },
    { x: 0.58, y: 0, w: 0.42, h: 0.31 },
    { x: 0.58, y: 0.33, w: 0.42, h: 0.67 },
    { x: 0, y: 0.5, w: 0.56, h: 0.5 },
  ],
  enterEnd: 0.72,
  settleWindow: 0.22,
  deckMaxW: 330,
  deckWidthFrac: 0.94,
  deckHeightFrac: 0.96,
  deckAspect: 1.28,
  gapXFrac: 0.02,
  gapYFrac: 0.015,
  sweepFrac: 0.95,
  riseY: 40,
  descMinH: 330,
  descMinW: 300,
  descMaxH: 120,
  descCollapseH: 90,
  titleNarrowW: 220,
  titleNarrowSize: 11.5,
  titleSize: 14,
  wordRise: 22,
  restRise: 14,
  dilRate: 0.85,
  starCount: 420,
  starCountReduced: 140,
  cometFromSection: true,
  cometProbe: 0.78,
  trackInset: 12,
  rowDotOffset: 9 - 6,
  rowFlareRange: 90,
  tauDecimals: 1,
};

/** mm:ss with the given fractional precision — the proper-time readout. */
export const formatTau = (ms: number, decimals: number) => {
  const total = ms / 1000;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  const width = decimals > 0 ? 3 + decimals : 2;
  return (
    String(mins).padStart(2, "0") +
    ":" +
    secs.toFixed(decimals).padStart(width, "0")
  );
};
