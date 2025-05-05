// Optimized TextGenerateEffect.tsx
"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/app/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  startAnimation,
  reducedMotion = false,
}: {
  words: string;
  className?: string;
  startAnimation: boolean;
  reducedMotion?: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (startAnimation && !reducedMotion) {
      animate(
        "span",
        {
          opacity: 1,
        },
        {
          duration: 2,
          delay: stagger(0.2),
          ease: "easeInOut", // Smoother animation
        }
      );
    } else if (startAnimation && reducedMotion) {
      // If reduced motion, just make all words visible immediately
      animate(
        "span",
        { opacity: 1 },
        { duration: 0.1 } // Very quick transition
      );
    }
  }, [startAnimation, animate, reducedMotion]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={` ${
                idx > 4
                  ? "bg-gradient-to-r from-[#FF0800] via-[#FF751B] to-[#FFE111] bg-clip-text text-transparent"
                  : "text-white"
              } opacity-0`}
              style={{
                // Add will-change only during animation
                willChange:
                  !reducedMotion && startAnimation ? "opacity" : "auto",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="my-4">
        <div className="dark:text-white text-black leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
