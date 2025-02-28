"use client";

import React, { useState } from "react";
import LandingOverlay from "./components/LandingOverlay";
import Projects from "./components/Projects";
import Hero from "./components/Hero";

export default function Home() {
  const [overlayFinished, setOverlayFinished] = useState(false);

  const handleOverlayFinish = () => {
    setOverlayFinished(true);
  };

  return (
    <div className="relative">
      {!overlayFinished && <LandingOverlay onFinished={handleOverlayFinish} />}
      <main
        className={`min-h-screen ${
          overlayFinished ? "block" : "hidden"
        } relative flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-2`}
      >
        {/* Your main portfolio content goes here */}
        <div className="max-w-7xl w-full">
          <Hero />
          <Projects />
        </div>
      </main>
    </div>
  );
}
