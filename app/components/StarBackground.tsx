"use client";

import { Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as random from "maath/random";
import { useState, useRef, Suspense, useEffect } from "react";
import type { Points as PointsType } from "three";

export const StarBackground = (props: any) => {
  // Detect if the device is mobile to adjust the number of stars
  const [isMobile, setIsMobile] = useState(false);
  const [pointCount, setPointCount] = useState(3000); // Reduced from 5000

  // Adjust point count based on device capability
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      // Check if device is mobile
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setPointCount(mobile ? 1500 : 3000); // Half the stars on mobile
      };

      // Initial check
      checkMobile();

      // Add resize listener
      window.addEventListener("resize", checkMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const ref = useRef<PointsType | null>(null);
  const [sphere] = useState(() => {
    return random.inSphere(new Float32Array(pointCount * 3), {
      radius: 1.2,
    });
  });

  // Reduce rotation speed on mobile for better performance
  const rotationSpeedX = isMobile ? 100 : 10;
  const rotationSpeedY = isMobile ? 150 : 15;

  useFrame((_state, delta) => {
    if (ref.current) {
      // Only rotate if page is visible
      const isInViewport = document.visibilityState === "visible";

      if (isInViewport) {
        ref.current.rotation.x -= delta / rotationSpeedX;
        ref.current.rotation.y -= delta / rotationSpeedY;
      }
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} stride={3} positions={sphere} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#fff"
          size={0.002}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export const StarsCanvas = () => {
  // Track if canvas is in viewport to improve performance
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Function to check if any part of the canvas is in viewport
    const checkVisibility = () => {
      // Simple visibility check based on scroll position
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      // Consider canvas visible if we're anywhere in the first 2 viewport heights
      // or last 2 viewport heights of the page
      setIsVisible(
        scrollPosition < windowHeight * 2 ||
          scrollPosition > documentHeight - windowHeight * 2
      );
    };

    // Initial check
    checkVisibility();

    // Add scroll event listener
    window.addEventListener("scroll", checkVisibility);

    // Cleanup
    return () => window.removeEventListener("scroll", checkVisibility);
  }, []);

  return (
    <div className="w-full h-screen fixed inset-0 -z-10">
      {isVisible && (
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Suspense fallback={null}>
            <StarBackground />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};
