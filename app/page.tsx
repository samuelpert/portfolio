"use client";

import { useState } from "react";
import LandingOverlay from "./components/LandingOverlay";

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);

  const handleLandingFinished = () => {
    setShowLanding(false);
  };

  return (
    <div className="relative">
      {showLanding && <LandingOverlay onFinished={handleLandingFinished} />}
      <main className={`min-h-screen ${showLanding ? "hidden" : "block"}`}>
        {/* Your main portfolio content goes here */}
        <h1 className="text-4xl font-bold">My Portfolio</h1>

        {/* Add more static content such as your name, photo, projects, contact info, etc. */}
      </main>
    </div>
  );
}
