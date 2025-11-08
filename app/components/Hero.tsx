import React, { useState, useEffect } from "react";
import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "@/app/components/MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import { Spotlight } from "./ui/SpotLight";

const Hero = ({ startAnimation }: { startAnimation: boolean }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // On mobile (< 768px), start animation immediately
    // On desktop, wait for startAnimation prop
    const isMobile = window.innerWidth < 768;
    if (isMobile || startAnimation) {
      setShouldAnimate(true);
    }
  }, [startAnimation]);

  return (
    <div className="pb-20 pt-20 relative">
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="white" />
      </div>

      <div
        className="h-screen w-full bg-black bg-grid-white/[0.06] flex items-center justify-center absolute top-0 left-0 mix-blend-screen"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Radial gradient for the container to give a faded look */}
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="flex justify-center relative my-20">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          {/* Hide face image on mobile (below md breakpoint) */}
          <div className="hidden md:block">
            <img
              src="/me.png"
              alt="Samuel"
              className="rounded-full border-2 border-[#FF751B] w-32 h-32 mb-4" // Adjust size as needed
            />
          </div>

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
