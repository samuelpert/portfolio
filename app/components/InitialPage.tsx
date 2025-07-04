import React, { useState, useEffect } from "react";
import { StarsCanvas } from "@/app/components/StarBackground";
import { socialMedia } from "../data";
import Image from "next/image";

interface InitialPageProps {
  handleInitialClick: () => void;
}

const InitialPage: React.FC<InitialPageProps> = ({ handleInitialClick }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInitialClick(); // Trigger zoom transition when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [handleInitialClick]);

  return (
    // Hide entire component on mobile, only show on md+ screens
    <div className="hidden md:flex flex-col items-center h-screen">
      <StarsCanvas />
      <div className="h-[10vh]"></div>{" "}
      <video
        className="object-contain cursor-pointer w-screen max-h-[80vh] mx-auto mix-blend-screen relative z-[100]"
        autoPlay
        muted
        loop
        playsInline
        onClick={handleInitialClick}
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
      <div className="text-center">
        <p className="text-white text-2xl sm:text-2xl md:text-2xl lg:text-3xl mt-4 blink-animation font-bold ">
          <span className="bg-gradient-to-r from-[#FF0800] via-[#FF751B] to-[#FFE135] bg-clip-text text-transparent">
            Click
          </span>{" "}
          Anywhere to Start!
        </p>
        <p className="text-white text-m sm:text-base md:text-lg lg:text-xl font-bold blink-animation">
          {countdown > 0 ? `Auto-start in ${countdown}s` : "Starting..."}
        </p>
      </div>
      <div className="absolute bottom-[3%] flex space-x-4 mb-5">
        {socialMedia.map((info) => (
          <a
            key={info.id}
            href={info.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300 z-10 opacity-50 hover:opacity-75"
          >
            <Image src={info.img} alt="icons" width={20} height={20} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default InitialPage;
