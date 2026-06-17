"use client";

import React, { useCallback, useState } from "react";
import CinematicIntro from "./components/CinematicIntro";
import Projects from "./components/Projects";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { Navbar } from "./components/ui/Navbar";
import { navItems } from "./data";

export default function Home() {
  // Flips true as the user "falls in" past the intro — kicks off Hero's intro animation.
  const [entered, setEntered] = useState(false);
  const handleEnter = useCallback(() => setEntered(true), []);

  return (
    <div className="relative">
      <CinematicIntro onEnter={handleEnter} />

      <main className="relative z-10 min-h-screen flex justify-center items-center flex-col mx-auto sm:px-10 px-2 overflow-clip">
        <div className="max-w-7xl w-full">
          <Navbar navItems={navItems} />
          <Hero startAnimation={entered} />
          <Projects />
          <Footer />
        </div>
      </main>
    </div>
  );
}
