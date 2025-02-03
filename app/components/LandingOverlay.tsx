"use client";

import React, { useState } from "react";

interface LandingOverlayProps {
  onFinished: () => void;
}

type Phase = "initial" | "transition";

export default function LandingOverlay({ onFinished }: LandingOverlayProps) {
  // 'phase' decides which video to display; 'fadeOut' triggers the fade-out transition.
  const [phase, setPhase] = useState<Phase>("initial");
  const [fadeOut, setFadeOut] = useState(false);

  // When the initial (clickable) video is clicked, switch to the transition video.
  const handleInitialClick = () => {
    setPhase("transition");
  };

  // When the transition video ends or the user clicks skip, trigger fade-out.
  const triggerFadeOut = () => {
    if (!fadeOut) {
      setFadeOut(true);
      // Wait for the fade-out to complete before calling onFinished.
      setTimeout(() => {
        onFinished();
      }, 1000); // 1000ms fade-out duration.
    }
  };

  // Handler for when transition video finishes playing.
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
        <video
          className="w-full h-full object-cover cursor-pointer"
          src="/path-to-clickable-blackhole-video.mp4"
          autoPlay
          loop
          playsInline
          onClick={handleInitialClick}
        />
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
