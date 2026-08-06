import React from "react";
import Image from "next/image";
import { projects } from "@/app/data";
import { trackProjectView } from "../GoogleAnalytics";

/**
 * 02 Accretion disk — the projects.
 *
 * The cards are absolutely positioned and get their size and transform from the
 * controller every frame: they sweep in one at a time onto a centred deck, then
 * unfold into an interlocking mosaic. Nothing here sets their geometry, so the
 * markup is just the card face.
 */
const ProjectsSection: React.FC = () => (
  <section className="sg-ch2" data-ch data-maze id="ch2">
    <div className="sg-ch2-pin">
      <header className="sg-ch2-head">
        <div>
          <div className="sg-eyebrow sg-mono">02 &nbsp;Accretion disk</div>
          <h2 className="sg-h2">
            Most recent <span className="sg-accent">projects</span>
          </h2>
        </div>
        <div className="sg-ch2-meta sg-mono">
          <div>
            <span className="sg-count" data-f-count>
              01
            </span>{" "}
            / {String(projects.length).padStart(2, "0")} captured
          </div>
          <div className="sg-ch2-phase" data-f-phase>
            Infalling
          </div>
        </div>
      </header>

      <div className="sg-stage" data-f-stage>
        {projects.map((p) => (
          <a
            key={p.id}
            className="sg-card"
            data-f-card
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackProjectView(p.title)}
          >
            <div className="sg-card-media">
              {/* bg.png holds the frame while the screenshot decodes. */}
              <Image src="/bg.png" alt="" fill sizes="640px" aria-hidden />
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 767px) 100vw, 640px"
              />
              <div className="sg-card-scrim" aria-hidden />
              <div className="sg-card-tag sg-mono">{p.tag}</div>
            </div>

            <div className="sg-card-body">
              <h3 className="sg-card-title" data-f-title>
                {p.title}
              </h3>
              <p className="sg-card-desc" data-f-desc>
                {p.des}
              </p>
              <div className="sg-card-foot">
                <div className="sg-icons">
                  {p.iconLists.map((icon) => (
                    <span className="sg-icon" key={icon}>
                      {/* Stack badges are tiny fixed-size marks — no point
                          round-tripping them through the image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={icon} alt="" aria-hidden />
                    </span>
                  ))}
                </div>
                <span className="sg-card-live sg-mono">Live site &#8599;</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default ProjectsSection;
