"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "@/components/Preloader";
import HeroMetrics from "@/components/HeroMetrics";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Stable identity so the preloader's timers are not restarted on re-render.
  const handleComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader key="preloader" onComplete={handleComplete} />}
      </AnimatePresence>

      <motion.main
        className="min-h-screen w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: isLoading ? 0 : 0.2 }}
      >
        <HeroMetrics />
      </motion.main>
    </>
  );
}
