import React from "react";
import { copy, timeline } from "@/app/data";

/**
 * 03 Time dilation — the history, drawn by a comet.
 *
 * The rail fills and the comet falls as you scroll; each row lights as the
 * comet passes it and flares brightest at closest approach. Rows start dimmed
 * and offset, so the section reads as unwritten until you get there.
 */
const TimelineSection: React.FC = () => (
  <section className="sg-ch3" data-ch data-tsec id="ch3">
    <div className="sg-ch3-inner">
      <div className="sg-eyebrow sg-eyebrow-blue sg-mono">
        03 &nbsp;Time dilation
      </div>
      <h2 className="sg-h2">
        One hour here,
        <br />
        <span className="sg-accent">seven years out there</span>
      </h2>
      <p className="sg-ch3-note">{copy.timelineNote}</p>

      <div className="sg-track" data-ttrack>
        <span className="sg-track-rail" aria-hidden />
        <span className="sg-track-fill" data-tfill aria-hidden />
        <span className="sg-comet" data-comet aria-hidden />

        <div className="sg-tl-list">
          {timeline.map((t, i) => (
            <div className="sg-tl" data-tl key={i}>
              <span className="sg-tl-dot" data-dot aria-hidden />
              <div className="sg-tl-when sg-mono">{t.when}</div>
              <div className="sg-tl-body">
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TimelineSection;
