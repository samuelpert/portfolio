"use client";

import React, { useState } from "react";
import LandingOverlay from "./components/LandingOverlay";
import Projects from "./components/Projects";
import Hero from "./components/Hero";

export default function Home() {
  const [overlayFinished, setOverlayFinished] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  const handleOverlayFinish = () => {
    setOverlayFinished(true);
    setStartAnimation(true);
  };

  return (
    <div className="relative">
      {!overlayFinished && <LandingOverlay onFinished={handleOverlayFinish} />}
      <main
        className={`min-h-screen ${
          overlayFinished ? "block" : "hidden"
        } relative flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-2`}
      >
        <div className="max-w-7xl w-full">
          <Hero startAnimation={startAnimation} />
          <Projects />
        </div>
      </main>
    </div>
  );
}
