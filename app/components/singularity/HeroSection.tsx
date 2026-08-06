import React from "react";
import Image from "next/image";
import { copy, RESUME_URL } from "@/app/data";
import { trackResumeClick } from "../GoogleAnalytics";

/**
 * Split a phrase into per-word spans. The controller staggers these by scroll
 * position, so the headline is assembled by the reader's own scrolling rather
 * than by a timer they can arrive after.
 */
const Words: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(" ").map((word, i) => (
      <React.Fragment key={i}>
        {i > 0 ? " " : null}
        <span className="sg-word" data-word>
          {word}
        </span>
      </React.Fragment>
    ))}
  </>
);

/**
 * 01 Event horizon — the hero, pinned for two screens while it emerges.
 *
 * Desktop is a two-column split with the portrait on the right; phones stack it
 * into a centred column with the portrait on top (`order: -1`) and no eyebrow.
 */
const HeroSection: React.FC = () => (
  <section className="sg-ch1" data-ch id="ch1">
    <div className="sg-ch1-pin">
      <div className="sg-grid-overlay" aria-hidden />

      <div className="sg-hero" data-hero>
        <div className="sg-eyebrow sg-hero-eyebrow sg-mono" data-hero-rest>
          01 &nbsp;Event horizon
        </div>

        <div className="sg-hero-grid">
          <div className="sg-hero-main">
            <h1 className="sg-hero-h1">
              <Words text="I&#8217;m Samuel." />{" "}
              <span className="sg-accent">
                <Words text="Emerging Software Engineer." />
              </span>
            </h1>

            <p className="sg-hero-p" data-hero-rest>
              <span className="sg-label-long">{copy.introDesktop}</span>
              <span className="sg-label-short">{copy.introMobile}</span>
            </p>

            <div className="sg-hero-actions" data-hero-rest>
              <a className="sg-btn sg-btn-primary" href="#ch2" data-work>
                My latest work <span className="sg-accent">&#8599;</span>
              </a>
              <a
                className="sg-btn sg-btn-ghost"
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackResumeClick}
              >
                My Resume &#8599;
              </a>
            </div>

            <div className="sg-chips sg-mono" data-hero-rest>
              <span className="sg-chip sg-chip-gold">
                Open to SWE / ML internships
              </span>
              <span className="sg-chip">
                <span className="sg-label-long">FIU · Computer Science</span>
                <span className="sg-label-short">FIU · CS</span>
              </span>
            </div>
          </div>

          <div className="sg-portrait" data-hero-rest>
            <Image
              src="/headshot.png"
              alt="Samuel Perez Tovar"
              width={1023}
              height={1537}
              sizes="(max-width: 767px) 96px, 320px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
