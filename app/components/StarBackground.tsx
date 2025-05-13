"use client";

import { Points, PointMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as random from "maath/random";
import { useState, useRef, Suspense, useMemo } from "react";
import type { Points as PointsType } from "three";
import { PointsInstancesProps } from "@react-three/drei";

export const StarBackground = (props: PointsInstancesProps) => {
  const ref = useRef<PointsType | null>(null);

  // Use useMemo to prevent recreating the sphere on each render
  const sphere = useMemo(() => {
    // Temporarily reduced for testing - original was 5000
    const positions = random.inSphere(new Float32Array(5000 * 3), {
      radius: 1.2,
    });
    if (positions.some(isNaN)) {
      console.error("Positions array contains NaN values");
    }
    return positions;
  }, []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        stride={3}
        positions={new Float32Array(sphere)}
        frustumCulled
        {...props}
      >
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

export const StarsCanvas = () => (
  <div className="w-full h-screen fixed inset-0 -z-10">
    <Canvas
      camera={{ position: [0, 0, 1] }}
      dpr={[1, 2]} // Limit pixel ratio for better performance
      performance={{ min: 0.5 }} // Allow frame rate to drop for better performance
    >
      <Suspense fallback={null}>
        <StarBackground />
      </Suspense>
    </Canvas>
  </div>
);
