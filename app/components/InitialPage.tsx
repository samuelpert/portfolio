import React, { useState, useEffect } from "react";
import { StarsCanvas } from "@/app/components/StarBackground";
import { socialMedia } from "../data";
import Image from "next/image";
import { trackBlackHoleWait, trackBlackHoleStartClick } from "./GoogleAnalytics";

interface InitialPageProps {}

const InitialPage: React.FC<InitialPageProps> = () => {
  const [countdown, setCountdown] = useState(2);

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
    }
  }, [countdown]);

  return (
    // Show component on all screen sizes
    <div className="flex flex-col items-center justify-center h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StarsCanvas />
      </div>
      <video
        className="object-contain w-full h-full scale-[2.5] sm:scale-[2] md:scale-150 lg:scale-[1.1] mix-blend-screen relative z-[100]"
        autoPlay
        muted
        playsInline
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
      <div className="absolute bottom-[3%] flex space-x-4 mt-5 mb-5 z-[110]">
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
