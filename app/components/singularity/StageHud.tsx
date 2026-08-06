import React from "react";
import { chapters } from "@/app/data";

/**
 * The stage bar: where you are in the fall, and how far through each chapter.
 *
 * It doubles as the site's navigation — there is no other nav — so the cells
 * are links to their chapters; the controller intercepts the clicks to scroll
 * smoothly instead of jumping.
 */
const StageHud: React.FC = () => (
  <div className="sg-hud">
    <nav className="sg-hud-stages sg-mono" aria-label="Chapters">
      {chapters.map((c, i) => (
        <a className="sg-stage-link" data-stage href={`#${c.id}`} key={c.id}>
          <span>
            <span className="sg-label-long">{c.long}</span>
            <span className="sg-label-short">{c.short}</span>
          </span>
          <span className="sg-stage-bar" aria-hidden>
            <span
              className={
                // 03 is the blue chapter — time dilation, not the disk.
                i === 2 ? "sg-stage-fill sg-stage-fill-blue" : "sg-stage-fill"
              }
              data-fill
            />
          </span>
        </a>
      ))}
    </nav>

    <div className="sg-hud-read sg-mono" aria-hidden>
      <span className="sg-hud-phase" data-phase>
        Infalling
      </span>
      <span className="sg-hud-metrics">
        <span>
          r / r<span className="sg-sub">s</span>{" "}
          <span className="sg-hud-r" data-r>
            1.000
          </span>
        </span>
        <span>
          &#964;{" "}
          <span className="sg-hud-tau" data-tau>
            00:00.000
          </span>
        </span>
        <span className="sg-hud-dil" data-dilfac>
          dt&#8242; / dt 1.00
        </span>
      </span>
    </div>
  </div>
);

export default StageHud;
