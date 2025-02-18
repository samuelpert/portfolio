"use client";

import React, { useState } from "react";
import InitialPage from "./InitialPage";

interface LandingOverlayProps {
  onFinished: () => void;
}

type Phase = "initial" | "transition";

export default function LandingOverlay({ onFinished }: LandingOverlayProps) {
  // 'phase' decides which view to display; 'fadeOut' triggers the fade-out transition.
  const [phase, setPhase] = useState<Phase>("initial");
  // 'zooming' triggers the zoom animation when the initial video is clicked.
  const [zooming, setZooming] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // When the initial blackhole is clicked, trigger the zoom animation and switch to the transition phase.
  const handleInitialClick = () => {
    if (!zooming) {
      setZooming(true);
      // Wait for the zoom animation (now with a bigger scale) to complete before switching phases.
      setTimeout(() => {
        setPhase("transition");
        setZooming(false);
      }, 1000); // Adjust this duration to match your desired animation length.
    }
  };

  // Trigger fade-out when the transition video ends or when the user clicks "skip."
  const triggerFadeOut = () => {
    if (!fadeOut) {
      setFadeOut(true);
      setTimeout(() => {
        onFinished();
      }, 1000); // 1000ms fade-out duration.
    }
  };

  // Handler for when the transition video finishes playing.
  const handleTransitionEnded = () => {
    triggerFadeOut();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {phase === "initial" && (
        // Wrap the InitialPage in a div that conditionally applies a zoom animation.
        <div
          className={`transition-transform duration-1000 origin-[50%_25%] ${
            zooming ? "scale-[7]" : "scale-100"
          }`}
        >
          <InitialPage handleInitialClick={handleInitialClick} />
        </div>
      )}
      {phase === "transition" && (
        <>
          <video
            className="w-full h-full object-cover"
            src="/path-to-transition-video.mp4"
            autoPlay
            playsInline
            onEnded={handleTransitionEnded}
          />
          <button
            onClick={triggerFadeOut}
            className="absolute bottom-10 px-4 py-2 bg-white text-black rounded shadow"
          >
            Skip
          </button>
        </>
      )}
    </div>
  );
}
