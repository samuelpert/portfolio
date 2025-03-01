"use client";

import React, { useState } from "react";
import LandingOverlay from "./components/LandingOverlay";
import Projects from "./components/Projects";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { Navbar } from "./components/ui/Navbar";
import { navItems } from "./data";

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
        } relative flex justify-center items-center flex-col mx-auto sm:px-10 px-2 overflow-clip`}
      >
        <div className="max-w-7xl w-full">
          <Navbar navItems={navItems} />
          <Hero startAnimation={startAnimation} />
          <Projects />
          <Footer />
        </div>
      </main>
    </div>
  );
}
