import React, { useState, useEffect } from "react";
import { StarsCanvas } from "@/app/components/StarBackground";
import { socialMedia } from "../data";
import Image from "next/image";
import { trackBlackHoleWait, trackBlackHoleStartClick } from "./GoogleAnalytics";

interface InitialPageProps {
  handleInitialClick: () => void;
}

const InitialPage: React.FC<InitialPageProps> = ({ handleInitialClick }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      // User waited for the auto-start
      trackBlackHoleWait();
      handleInitialClick();
    }
  }, [countdown, handleInitialClick]);

  return (
    // Hide entire component on mobile, only show on md+ screens
    <div className="flex flex-col items-center justify-center h-screen">
      <StarsCanvas />
      <div className="w-full h-[65vh] md:h-[80vh] overflow-hidden flex items-center justify-center">
      <video
        className="object-cover object-center cursor-pointer w-full h-full mx-auto mix-blend-screen"
        autoPlay
        muted
        loop
        playsInline
        onClick={() => {
            trackBlackHoleStartClick();
            handleInitialClick();
        }}
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
      </div>
      <div className="absolute bottom-[3%] flex space-x-4 mt-5 mb-5">
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
