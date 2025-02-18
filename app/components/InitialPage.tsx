import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

interface InitialPageProps {
  handleInitialClick: () => void;
}

const InitialPage: React.FC<InitialPageProps> = ({ handleInitialClick }) => {
  return (
    <div className="flex flex-col items-center ">
      <video
        className="object-contain cursor-pointer w-screen max-h-[60vh] mx-auto"
        autoPlay
        muted
        loop
        playsInline
        onClick={handleInitialClick}
      >
        <source src="/videos/blackholeloop.webm" type="video/webm" />
      </video>

      <p className="text-white text-xl mt-4 blink-animation font-bold mb-40">
        [Click Inside Gargantua To See My Portfolio]
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

      <div className="flex space-x-4 mt-6">
        <a
          href="https://www.linkedin.com/in/samuel-perez-tovar"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2"
        >
          <FaLinkedin
            size={40}
            className="filter brightness-50 hover:brightness-75 transition duration-200"
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
            className="filter brightness-50 hover:brightness-75 transition duration-200"
          />
        </a>
      </div>
    </div>
  );
};

export default InitialPage;
