import React from "react";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";

interface HeroProps {
  overlayFinished: boolean;
}

const Hero: React.FC<HeroProps> = ({ overlayFinished }) => {
  return (
    <div>
      {overlayFinished && (
        <TextGenerateEffect
          className="text-center text-[40px] md:text-5xl lg:text-6xl"
          words="Welcome to the singularity!"
        />
      )}
    </div>
  );
};

export default Hero;
