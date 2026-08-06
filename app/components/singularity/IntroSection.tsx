import React from "react";
import BlackHoleCanvas, { BlackHoleControl } from "../BlackHoleCanvas";

/**
 * The fall-in. A 380vh (263vh on phones) section pins one screen of visuals and
 * hands its scroll progress to the controller as `--p`; from there the titles,
 * the star canvas, the veil and the raymarched camera all move together.
 *
 * Layering, back to front: stars (2D canvas) → black hole (WebGPU, screened
 * over the stars) → vignette → titles → hint/telemetry → the warm veil that
 * closes over everything as you cross the horizon.
 */
const IntroSection: React.FC<{
  control: React.MutableRefObject<BlackHoleControl | null>;
  onStatus: (ready: boolean) => void;
}> = ({ control, onStatus }) => (
  <section className="sg-intro" data-intro>
    <div className="sg-intro-pin">
      <canvas className="sg-intro-canvas" data-bh aria-hidden />

      <div className="sg-intro-gpu" data-gpu>
        <BlackHoleCanvas control={control} onStatus={onStatus} />
      </div>

      <div className="sg-intro-vignette" aria-hidden />

      <div className="sg-intro-titles">
        <h1 className="sg-title sg-title-top" data-text="SAMUEL&#8217;S">
          SAMUEL&#8217;S
        </h1>
        <div className="sg-title-bottom-wrap">
          <h1 className="sg-title sg-title-bottom" data-text="SPACE">
            SPACE
          </h1>
        </div>
      </div>

      <div className="sg-hint">
        <div className="sg-hint-inner">
          <span className="sg-hint-label sg-mono">Scroll to fall in</span>
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
            <path
              d="M7 1v13M1.5 9.5 7 15l5.5-5.5"
              stroke="oklch(0.82 0.13 72)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Distance to the horizon and infall velocity — both driven by --p. */}
      <div className="sg-intro-readout sg-mono" aria-hidden>
        <span>Gargantua</span>
        <span>
          r / r<span className="sg-sub">s</span> <b data-hr>12.0</b>
        </span>
        <span data-vel>v / c 0.02</span>
      </div>

      <div className="sg-intro-veil" aria-hidden />
    </div>
  </section>
);

export default IntroSection;
