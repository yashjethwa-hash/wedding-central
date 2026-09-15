"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Timeline for the preloader, in milliseconds.
 *
 * Everything is driven off these numbers, so tweaking the sequence only means
 * editing this object — no need to hunt through the JSX.
 */
export const PRELOADER_TIMELINE = {
  /** When `/dd.png` starts fading in. */
  phaseOneAt: 0,
  /** When `/edited-image.png` starts fading in. */
  phaseTwoAt: 2000,
  /** When the preloader reports that it is done and should be unmounted. */
  totalDuration: 5000,
  /** How long each image takes to fade in. */
  fadeDuration: 0.9,
} as const;

type Phase = 0 | 1 | 2;

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: PRELOADER_TIMELINE.fadeDuration,
      ease: "easeOut",
    },
  },
} as const;

export type PreloaderProps = {
  /**
   * Called once the full timeline has elapsed. The parent owns unmounting, so
   * the exit animation can be wired up with `<AnimatePresence>`.
   */
  onComplete: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), PRELOADER_TIMELINE.phaseOneAt),
      setTimeout(() => setPhase(2), PRELOADER_TIMELINE.phaseTwoAt),
      setTimeout(onComplete, PRELOADER_TIMELINE.totalDuration),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      // Exit is played by the parent's <AnimatePresence> when the preloader unmounts.
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
        // Transparent on purpose: the fixed `/bg-pattern.jpg` layer shows through.
        background: "transparent",
        pointerEvents: "none",
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Phase 1 */}
      <motion.img
        src="/dd.png"
        alt=""
        variants={fadeIn}
        initial="hidden"
        animate={phase >= 1 ? "visible" : "hidden"}
        style={{
          width: "min(220px, 45vw)",
          height: "auto",
          display: "block",
        }}
      />

      {/* Phase 2 */}
      <motion.img
        src="/edited-image.png"
        alt=""
        variants={fadeIn}
        initial="hidden"
        animate={phase >= 2 ? "visible" : "hidden"}
        style={{
          width: "min(420px, 80vw)",
          height: "auto",
          display: "block",
        }}
      />
    </motion.div>
  );
}
