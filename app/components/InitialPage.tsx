import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { StarsCanvas } from "@/app/components/StarBackground";

interface InitialPageProps {
  handleInitialClick: () => void;
}

const InitialPage: React.FC<InitialPageProps> = ({ handleInitialClick }) => {
  return (
    <div className="flex flex-col items-center h-screen">
      <StarsCanvas />
      <div className="h-[10vh]"></div>{" "}
      <video
        className="object-contain cursor-pointer w-screen max-h-[70vh] mx-auto mix-blend-screen relative z-[100]"
        autoPlay
        muted
        loop
        playsInline
        onClick={handleInitialClick}
      >
        <source src="/videos/blackhole.webm" type="video/webm" />
      </video>
      <p className="text-white text-center text-1xl sm:text-1xl md:text-2xl lg:text-3xl mt-4 blink-animation font-bold mb-40">
        [
        <span className="bg-gradient-to-r from-red-500 via-red-400 to-yellow-500 bg-clip-text text-transparent">
          Click
        </span>{" "}
        Inside Gargantua To See My Portfolio]
      </p>
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .blink-animation {
          animation: blink 2.5s infinite;
        }
      `}</style>
      <div className="absolute bottom-[1%] flex space-x-4 mb-5">
        <a
          href="https://www.linkedin.com/in/samuel-perez-tovar"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2"
        >
          <FaLinkedin
            size={40}
            className="text-gray-600 hover:text-gray-400 transition-colors duration-200"
          />
        </a>
        <a
          href="https://github.com/samuelpert"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2"
        >
          <FaGithub
            size={40}
            className="text-gray-600 hover:text-gray-400 transition-colors duration-200"
          />
        </a>
      </div>
    </div>
  );
};

export default InitialPage;
