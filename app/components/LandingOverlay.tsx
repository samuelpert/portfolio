"use client";

import React, { useState, useEffect } from "react";
import InitialPage from "./InitialPage";

interface LandingOverlayProps {
  onFinished: () => void;
}

type Phase = "initial" | "transition";

export default function LandingOverlay({ onFinished }: LandingOverlayProps) {
  // "phase" decides which view to display.
  const [phase, setPhase] = useState<Phase>("initial");
  // "zooming" triggers the zoom animation when the initial video is clicked.
  const [zooming, setZooming] = useState(false);
  // "fadeOut" triggers the fade-out transition.
  const [fadeOut, setFadeOut] = useState(false);
  // "videoFadeIn" triggers the video fade in.
  const [videoFadeIn, setVideoFadeIn] = useState(false);

  // When the initial element is clicked the zoom animation is set to true.
  const handleInitialClick = () => {
    if (!zooming) {
      setZooming(true);
      // Wait for the zoom animation to finish before switching phases.
      setTimeout(() => {
        setPhase("transition");
        setZooming(false);
      }, 500);
    }
  };

  // Trigger fade-out when the video ends or when the user clicks button skip.
  const triggerFadeOut = () => {
    if (!fadeOut) {
      setFadeOut(true);
      setTimeout(() => {
        onFinished();
      }, 1000);
    }
  };

  // Handler for when the video finishes playing.
  const handleTransitionEnded = () => {
    triggerFadeOut();
  };

  // When phase becomes "transition", trigger the video fade in.
  useEffect(() => {
    if (phase === "transition") {
      setVideoFadeIn(true);
    }
  }, [phase]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {phase === "initial" && (
        // Wrap the InitialPage in a div that conditionally applies a zoom animation.
        <div
          className={`transition-transform duration-[2500ms] origin-[50%_25%] ${
            zooming ? "scale-[100]" : "scale-100"
          }`}
        >
          <InitialPage handleInitialClick={handleInitialClick} />
        </div>
      )}
      {phase === "transition" && (
        <>
          <video
            // The videoFadeIn state is used to trigger the video fade in.
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoFadeIn ? "opacity-100" : "opacity-0"
            }`}
            src="/videos/transition_optimized.mp4"
            autoPlay
            playsInline
            onEnded={handleTransitionEnded}
          />
          <button
            onClick={triggerFadeOut}
            className="absolute bottom-10 px-4 py-2 bg-transparent text-white rounded border border-white hover:border-gray-400 hover:text-gray-400 transition duration-200"
          >
            Skip
          </button>
        </>
      )}
    </div>
  );
}
