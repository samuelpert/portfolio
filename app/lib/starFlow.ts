/**
 * starFlow — shared scroll state for the intro starfield.
 *
 * CinematicIntro publishes its smoothed scroll progress here every frame, and
 * the star simulation (app/lib/starField) reads it to drive the dramatic
 * "fall-in" warp during the intro.
 */
export const starFlow = {
  /** Intro scroll progress, 0 (top) → 1 (fallen in). Smoothed by CinematicIntro. */
  progress: 0,
};

/** Total depth crossed over a full intro scroll (warp intensity). */
export const SPREAD = 7;
