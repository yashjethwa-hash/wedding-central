"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import HeroMetrics from "@/components/HeroMetrics";

export default function Home() {
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

      <motion.main
        className="min-h-screen w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* The counters wait for the preloader, so the reveal catches them mid-tick
            rather than already finished. */}
        <HeroMetrics startCounting={!isLoading} />
      </motion.main>
    </>
  );
}
