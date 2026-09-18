"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import HeroMetrics from "@/components/HeroMetrics";
import FloatingBubbles from "@/components/FloatingBubbles";
import HomeCarousels from "@/components/HomeCarousels";
import InteractiveMap from "@/components/InteractiveMap";
import VinylPlayer from "@/components/VinylPlayer";

export default function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);

  // Stable identity so the preloader's timers are not restarted on re-render.
  const handleAnimationComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <Preloader key="preloader" onAnimationComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      {/*
        The reveal moved up onto a wrapper so the footer fades in with
        everything else while still sitting outside <main>, which is where a
        footer belongs.
      */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <main className="min-h-screen w-full">
          {/* The counters wait for the preloader, so the reveal catches them
              mid-tick rather than already finished. */}
          <HeroMetrics startCounting={!isLoading} />

          <FloatingBubbles />

          <HomeCarousels />

          <InteractiveMap />

          <VinylPlayer />
        </main>
      </motion.div>
    </>
  );
}
