import React from "react";
import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "@/app/components/MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import { Spotlight } from "./ui/SpotLight";

const Hero = ({ startAnimation }: { startAnimation: boolean }) => {
  return (
    <div className="pb-20 pt-36">
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
          startAnimation={startAnimation}
        />
        <Spotlight
          className="top-10 left-full h-[80vw] w-[50vw]"
          fill="white"
          startAnimation={startAnimation}
        />
        <Spotlight
          className="top-28 left-80 h-[80vh] w-[50vw]"
          fill="white"
          startAnimation={startAnimation}
        />
      </div>

      <div
        className="h-screen w-full bg-black bg-grid-white/[0.06] flex items-center justify-center absolute top-0 left-0 mix-blend-screen"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Radial gradient for the container to give a faded look */}
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <div>
            <img
              src="/me.png" // Replace with the actual path to your image
              alt="Samuel"
              className="rounded-full border-2 border-[#FF751B] w-32 h-32 mb-4" // Adjust size as needed
            />
          </div>

          <p className="uppercase tracking-widest text-xs text-center text-orange-100 max-w-80">
            You Have Entered The Singularity!
          </p>

          {/**
           *  Link: https://ui.aceternity.com/components/text-generate-effect
           *
           *  change md:text-6xl, add more responsive code
           */}
          <TextGenerateEffect
            words="Hi! I'm Samuel. Emerging Software Engineer."
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
            startAnimation={startAnimation}
          />

          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl">
            I&apos;m a sophomore computer science undergrad at Florida
            International University. Interested on machine learning development
            and web apps.
          </p>

          <a href="#projects">
            <MagicButton
              title="Look at my work"
              icon={<FaLocationArrow />}
              position="right"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
