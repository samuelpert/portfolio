"use client";

import {
  trackBlackHoleComplete,
  trackBlackHoleSkip,
} from "./GoogleAnalytics";
import React, { useState, useEffect } from "react";
import InitialPage from "./InitialPage";

interface LandingOverlayProps {
  onFinished: () => void;
}

type Phase = "initial" | "transition";

// Words and their display durations in ms
const WORD_SEQUENCE: { word: string; duration: number }[] = [
  { word: "Welcome", duration: 2000 },
  { word: "To", duration: 1000 },
  { word: "My", duration: 1000 },
  { word: "Portfolio.", duration: 2000 },
];

export default function LandingOverlay({ onFinished }: LandingOverlayProps) {
  const [phase, setPhase] = useState<Phase>("initial");
  const [fadeOut, setFadeOut] = useState(false);
  const [videoFadeIn, setVideoFadeIn] = useState(false);
  const [animationStartTime, setAnimationStartTime] = useState<number>(0);
  const [transitionStartTime, setTransitionStartTime] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordVisible, setWordVisible] = useState(false);

  const zoomRef = React.useRef<HTMLDivElement>(null);

  // Exponential zoom: perceived speed stays constant
  useEffect(() => {
    const startScale = 1;
    const endScale = 10;
    const duration = 1500; // total zoom duration in ms
    let startTime: number | null = null;
    let animationId: number;

    const timer = setTimeout(() => {
      setAnimationStartTime(Date.now());

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const tLinear = Math.min(elapsed / duration, 1); // 0 to 1

        // Ease-in: moderate start, accelerates over time
        const tEased = Math.pow(tLinear, 10);

        // Exponential interpolation with ease-in curve
        const scale = startScale * Math.pow(endScale / startScale, tEased);

        if (zoomRef.current) {
          zoomRef.current.style.transform = `scale(${scale})`;
        }

        if (tLinear < 1) {
          animationId = requestAnimationFrame(animate);
        } else {
          // Zoom finished, switch to transition phase
          setPhase("transition");
          setTransitionStartTime(Date.now());
        }
      };

      animationId = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Word sequence animation during transition phase
  useEffect(() => {
    if (phase !== "transition") return;

    let wordIdx = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const fadeOutDuration = 700; // ms for fade-out

    const showNextWord = () => {
      if (wordIdx >= WORD_SEQUENCE.length) return;

      const { duration } = WORD_SEQUENCE[wordIdx];
      const idx = wordIdx;

      // Set the word first with opacity 0, then fade in on next frame
      setCurrentWordIndex(idx);
      setWordVisible(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWordVisible(true);
        });
      });

      // After the display duration, fade out
      const fadeOutTimeout = setTimeout(() => {
        setWordVisible(false);

        // After fade-out completes, show next word
        const nextTimeout = setTimeout(() => {
          wordIdx++;
          showNextWord();
        }, fadeOutDuration);
        timeouts.push(nextTimeout);
      }, duration);
      timeouts.push(fadeOutTimeout);
    };

    // Start the first word after a brief delay
    const startTimeout = setTimeout(() => {
      showNextWord();
    }, 500);
    timeouts.push(startTimeout);

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [phase]);

  // Trigger fade-out (can be from skip button or natural end)
  const triggerFadeOut = (wasSkipped: boolean = false) => {
    if (!fadeOut) {
      setFadeOut(true);

      if (animationStartTime) {
        if (wasSkipped && transitionStartTime) {
          const timeBeforeSkip = Date.now() - transitionStartTime;
          trackBlackHoleSkip(timeBeforeSkip);
        } else {
          const totalDuration = Date.now() - animationStartTime;
          trackBlackHoleComplete(totalDuration);
        }
      }

      setTimeout(() => {
        onFinished();
      }, 1000);
    }
  };

  // Handler for when the video finishes playing naturally
  const handleTransitionEnded = () => {
    triggerFadeOut(false); // false = not skipped, natural completion
  };

  // Handler for skip button
  const handleSkipClick = () => {
    triggerFadeOut(true); // true = user skipped
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
          ref={zoomRef}
          className="origin-center"
        >
          <InitialPage />
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
            muted
            playsInline
            onEnded={handleTransitionEnded}
          />
          {/* Word sequence overlay */}
          {currentWordIndex >= 0 && currentWordIndex < WORD_SEQUENCE.length && (
            <div
              className={`absolute inset-0 flex items-end justify-center pb-[25%] pointer-events-none transition-opacity duration-700 ${
                wordVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-white font-bold text-[40px] md:text-5xl lg:text-6xl tracking-wide drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {WORD_SEQUENCE[currentWordIndex].word}
              </span>
            </div>
          )}
          <button
            onClick={handleSkipClick}
            className="absolute bottom-10 px-4 py-2 bg-transparent text-white rounded border border-white hover:border-gray-400 hover:text-gray-400 transition duration-200"
          >
            Skip
          </button>
        </>
      )}
    </div>
  );
}
