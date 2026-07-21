import React, { useState, useEffect, useRef } from "react";
import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "@/app/components/MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import { Spotlight } from "./ui/SpotLight";
import { trackResumeClick } from "./GoogleAnalytics";

const Hero = ({ startAnimation }: { startAnimation: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [inView, setInView] = useState(false);

  // Only start the emergence once the hero is actually on screen — otherwise
  // the animation plays hidden below the fold during the intro blackout and
  // the user arrives to a finished, static hero.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // On mobile (< 768px), start animation as soon as the hero is visible
    // On desktop, also wait for the intro's startAnimation signal
    const isMobile = window.innerWidth < 768;
    if ((isMobile || startAnimation) && inView) {
      setShouldAnimate(true);
    }
  }, [startAnimation, inView]);

  return (
    // Emerge from the void: after the black hole swallows the screen, the hero
    // scales up out of the dark toward the viewer — continuing the fall-in
    // motion — rather than looking like it was scrolled to.
    <div
      ref={rootRef}
      className="pb-20 pt-20 relative"
      style={{
        opacity: shouldAnimate ? 1 : 0,
        transform: shouldAnimate ? "scale(1)" : "scale(0.82)",
        transition:
          "opacity 1s ease-out, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen mix-blend-screen"
          fill="white"
        />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw] mix-blend-screen" fill="white" />

      {/* Subtle grid overlay — transparent bg so the black body shows through naturally */}
      <div
        className="h-screen w-full absolute top-0 left-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(255,255,255,0.15)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E")`,
          maskImage: "radial-gradient(ellipse at center, black 5%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 5%, transparent 70%)",
        }}
      />

      <div className="flex justify-center relative my-20">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          {/* Hide face image on mobile (below md breakpoint) */}

          <p className="uppercase tracking-widest text-xs text-center text-orange-100 max-w-80">
            {/* Show different text on mobile vs desktop */}
            <span className="block md:hidden">Welcome to my portfolio!</span>
            <span className="hidden md:block">
              You Have Entered The Singularity!
            </span>
          </p>

          <TextGenerateEffect
            words="I'm Samuel. Emerging Software Engineer."
            className="text-center text-[40px] md:text-5xl lg:text-6xl mb-6"
            startAnimation={shouldAnimate}
          />

          <p className="text-center md:tracking-wider mb-6 text-lg md:text-lg lg:text-2xl">
            I am a Sophomore Computer Science Undergrad at Florida International
            University (FIU). Interested in machine learning development and web
            applications.
          </p>


          <div className="flex gap-4">
            <a href="#projects">
              <MagicButton
                title="My latest work"
                icon={<FaLocationArrow />}
                position="right"
              />
            </a>
            <a
              href="https://acrobat.adobe.com/id/urn:aaid:sc:US:047ab663-7ce6-4961-bb73-3ecd1bb59fb2"
              target="_blank"
              onClick={trackResumeClick}
            >
              <MagicButton
                title="My Resume"
                icon={<FaLocationArrow />}
                position="right"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
