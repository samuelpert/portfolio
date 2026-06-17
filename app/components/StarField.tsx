"use client";

import React, { useEffect, useRef } from "react";
import { registerStarCanvas } from "@/app/lib/starField";

/**
 * StarField
 *
 * The fixed, site-wide canvas for the ONE shared starfield (see
 * `app/lib/starField.ts`). It just hands its canvas to the shared simulation —
 * the same simulation also draws the intro's behind-the-black-hole canvas, so
 * the stars you fall through in the intro are literally the same stars sitting
 * behind the portfolio.
 */
const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return registerStarCanvas(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 block h-full w-full"
    />
  );
};

export default StarField;
