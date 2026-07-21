"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import CinematicIntro from "./components/CinematicIntro";
import Projects from "./components/Projects";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import { registerStarCanvas } from "@/app/lib/starField";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const handleEnter = useCallback(() => setEntered(true), []);
  const bgStarRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = bgStarRef.current;
    if (!canvas) return;
    return registerStarCanvas(canvas);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={bgStarRef}
        aria-hidden
        className="fixed inset-0 z-30 block h-full w-full"
        style={{
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: entered ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />

      <CinematicIntro onEnter={handleEnter} />

      <main className="relative z-10 min-h-screen flex justify-center items-center flex-col mx-auto sm:px-10 px-2 overflow-clip">
        <div className="max-w-7xl w-full">
          <Hero startAnimation={entered} />
          <Projects />
          <Footer />
        </div>
      </main>
    </div>
  );
}
