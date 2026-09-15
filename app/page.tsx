"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Preloader from "@/components/Preloader";

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
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: isLoading ? 0 : 0.2 }}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 400 }}>
          Wedding Central
        </h1>
        <p style={{ margin: 0, maxWidth: "38ch", lineHeight: 1.6, color: "var(--accent)" }}>
          Placeholder homepage — the real content goes here once the preloader has
          handed over.
        </p>
      </motion.main>
    </>
  );
}
