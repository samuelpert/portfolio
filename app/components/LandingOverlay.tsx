"use client";
import {
  trackBlackHoleComplete,
  trackBlackHoleStart,
  trackBlackHoleSkip,
  trackBlackHoleView,
} from "./GoogleAnalytics";
import React, { useState, useEffect } from "react";
import InitialPage from "./InitialPage";

interface LandingOverlayProps {
  onFinished: () => void;
}

type Phase = "initial" | "transition";

export default function LandingOverlay({ onFinished }: LandingOverlayProps) {
  const [phase, setPhase] = useState<Phase>("initial");
  const [zooming, setZooming] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoFadeIn, setVideoFadeIn] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState<number>(0);
  const [transitionStartTime, setTransitionStartTime] = useState<number>(0);
  const [loopCount, setLoopCount] = useState(0);

  // Check if mobile and skip overlay entirely
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        // Mobile users skip overlay entirely - no tracking needed
        onFinished();
      } else {
        // Desktop user sees the black hole - track this view
        trackBlackHoleView();
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [onFinished]);

  // When the initial black hole is clicked - THIS IS THE KEY TRACKING!
  const handleInitialClick = () => {
    if (!zooming) {
      // 🎯 Track that user clicked the black hole to start animation
      trackBlackHoleStart();

      setZooming(true);
      setAnimationStartTime(Date.now());

      setTimeout(() => {
        setPhase("transition");
        setZooming(false);
        setTransitionStartTime(Date.now());
      }, 500);
    }
  };

  // Handler for when the video finishes playing naturally - LOOP BACK!
  const handleTransitionEnded = () => {
    // Instead of finishing, loop back to initial state
    setLoopCount((prev) => prev + 1);

    // Track completion of this loop
    if (animationStartTime) {
      const totalDuration = Date.now() - animationStartTime;
      trackBlackHoleComplete(totalDuration);
    }

    // Reset to initial state for next loop
    setTimeout(() => {
      setPhase("initial");
      setVideoFadeIn(false);
      setZooming(false);
      setAnimationStartTime(0);
      setTransitionStartTime(0);
    }, 1000);
  };

  // Handler for skip button - also loops back
  const handleSkipClick = () => {
    setLoopCount((prev) => prev + 1);

    if (animationStartTime && transitionStartTime) {
      const timeBeforeSkip = Date.now() - transitionStartTime;
      trackBlackHoleSkip(timeBeforeSkip);
    }

    // Reset to initial state for next loop
    setTimeout(() => {
      setPhase("initial");
      setVideoFadeIn(false);
      setZooming(false);
      setAnimationStartTime(0);
      setTransitionStartTime(0);
    }, 500);
  };

  // When phase becomes "transition", trigger the video fade in
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
        <div
          className={`transition-transform duration-1000 origin-[50%_30%] ${
            zooming ? "scale-[100]" : "scale-100"
          }`}
        >
          <InitialPage handleInitialClick={handleInitialClick} />
        </div>
      )}
      {phase === "transition" && (
        <>
          <video
            className={`w-full h-screen object-cover mix-blend-screen transition-opacity duration-1000 ${
              videoFadeIn ? "opacity-100" : "opacity-0"
            }`}
            src="/videos/transition.webm"
            autoPlay
            playsInline
            onEnded={handleTransitionEnded}
          />
          <button
            onClick={handleSkipClick}
            className="absolute bottom-10 px-4 py-2 bg-transparent text-white rounded border border-white hover:border-gray-400 hover:text-gray-400 transition duration-200"
          >
            Skip Loop
          </button>
          {/* Loop counter display */}
          <div className="absolute top-10 right-10 text-white text-sm opacity-70">
            Loop: {loopCount}
          </div>
        </>
      )}
    </div>
  );
}
