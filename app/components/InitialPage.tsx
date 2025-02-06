import React from "react";

interface InitialPageProps {
  handleInitialClick: () => void;
}

const InitialPage: React.FC<InitialPageProps> = ({ handleInitialClick }) => {
  return (
    <div className="flex flex-col items-center ">
      <h1 className="mb-4 text-3xl font-extrabold opacity-100 dark:text-white md:text-6xl lg:text-7xl">
        Click Inside{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-yellow-600/100 from-red-400/100">
          Gargantua!
        </span>
      </h1>
      <h1 className="mb-4 text-3xl font-extrabold opacity-50 dark:text-white md:text-6xl lg:text-7xl">
        Click Inside{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-yellow-600/50 from-red-400/50">
          Gargantua!
        </span>
      </h1>
      <h1 className="mb-4 text-3xl font-extrabold opacity-25 dark:text-white md:text-6xl lg:text-7xl">
        Click Inside{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-yellow-600/25 from-red-400/25">
          Gargantua!
        </span>
      </h1>

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
    </div>
  );
};

export default InitialPage;
