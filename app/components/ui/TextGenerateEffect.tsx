"use client";
import { useEffect, useMemo } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/app/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  startAnimation,
}: {
  words: string;
  className?: string;
  startAnimation: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  // Pre-compute word classes to avoid recalculating during animation
  const wordClasses = useMemo(() => {
    return wordsArray.map((_, idx) =>
      idx > 4
        ? "bg-gradient-to-r from-[#FF0800] via-[#FF751B] to-[#FFE111] bg-clip-text text-transparent"
        : "text-white"
    );
  }, [wordsArray]);

  // Separate the animation logic to avoid running it unnecessarily
  useEffect(() => {
    if (startAnimation) {
      // Use reduced animation times for better performance
      animate(
        "span",
        {
          opacity: 1,
        },
        {
          duration: 1.5, // Reduced from 2
          delay: stagger(0.15), // Reduced from 0.2
        }
      );
    }
  }, [startAnimation, animate]); // Removed wordsArray dependency

  return (
    <div className={cn("font-bold", className)}>
      <div className="my-4">
        <div className="dark:text-white text-black leading-snug tracking-wide">
          <motion.div ref={scope}>
            {wordsArray.map((word, idx) => (
              <motion.span
                key={word + idx}
                className={`${wordClasses[idx]} opacity-0`}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
