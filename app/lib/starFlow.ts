/**
 * starFlow — shared scroll state for the ONE site-wide starfield.
 *
 * CinematicIntro publishes its smoothed scroll progress here every frame, and
 * StarField reads it to drive the dramatic "fall-in" warp during the intro and
 * the gentle drift afterwards — all from a single canvas, so the same stars you
 * fall through in the intro carry seamlessly into the portfolio (no second
 * canvas, no pop at the handoff).
 */
export const starFlow = {
  /** Intro scroll progress, 0 (top) → 1 (fallen in). Smoothed by CinematicIntro. */
  progress: 0,
};

/** Total depth crossed over a full intro scroll (warp intensity). */
export const SPREAD = 7;
