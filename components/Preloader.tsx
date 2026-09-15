"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

/**
 * Timeline for the preloader, in milliseconds.
 *
 * Everything is driven off these numbers, so tweaking the sequence only means
 * editing this object — no need to hunt through the JSX.
 */
export const PRELOADER_TIMELINE = {
  /** When the phase 1 `/dd.png` monogram starts fading in. */
  phaseOneAt: 0,
  /** When phase 1 cross-fades into the phase 2 lockup. */
  phaseTwoAt: 2000,
  /** When the preloader reports that it is done and should be unmounted. */
  totalDuration: 5000,
  /** Fade duration for the phase 1 monogram, in seconds. */
  introFade: 0.9,
  /** Entrance duration for each phase 2 image, in seconds. */
  lockupEntrance: 0.85,
  /** Gap between each phase 2 image's entrance, in seconds. */
  lockupStagger: 0.12,
} as const;

type Phase = 0 | 1 | 2;

/* -------------------------------------------------------------------------- */
/* Sizing — kept here so the lockup can be retuned without touching the JSX.   */
/* -------------------------------------------------------------------------- */

/** Cap height of `we.png` / `ing.png` in the phase 2 row. */
const CAP_HEIGHT = "min(74px, 10vw)";
/** Height of the small centre monogram; slightly taller than the caps. */
const MONOGRAM_HEIGHT = "min(92px, 12.5vw)";
/** Width of the `central.png` wordmark beneath the row. */
const CENTRAL_WIDTH = "min(320px, 56vw)";

/** Soft deceleration curve — fast out of the gate, gentle landing. */
const EASE_OUT = [0.22, 1, 0.36, 1];

const entrance = {
  duration: PRELOADER_TIMELINE.lockupEntrance,
  ease: EASE_OUT,
};

/* -------------------------------------------------------------------------- */
/* Phase 2 variants — one per image, named after the motion they describe.     */
/* -------------------------------------------------------------------------- */

/** Parent of the four lockup images; only exists to stagger its children. */
const lockup: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: PRELOADER_TIMELINE.lockupStagger },
  },
};

/** `/we.png` — slides in from the left. */
const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -90 },
  visible: { opacity: 1, x: 0, transition: entrance },
};

/** `/dd.png` (small) — scales up in the centre. */
const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.25 },
  visible: { opacity: 1, scale: 1, transition: entrance },
};

/** `/ing.png` — slides in from the right. */
const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 90 },
  visible: { opacity: 1, x: 0, transition: entrance },
};

/** `/central.png` — slides up from the bottom. */
const slideFromBottom: Variants = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0, transition: entrance },
};

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
        // Grid rather than flex: both phases occupy the same cell (see `gridArea`
        // below), so they cross-fade in place instead of pushing each other around.
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        // Transparent on purpose: the fixed `/bg-pattern.jpg` layer shows through.
        background: "transparent",
        pointerEvents: "none",
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      <AnimatePresence>
        {phase === 1 && (
          <motion.img
            key="intro"
            src="/dd.png"
            alt=""
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: PRELOADER_TIMELINE.introFade, ease: "easeOut" }}
            style={{
              gridArea: "1 / 1",
              width: "min(260px, 50vw)",
              height: "auto",
              display: "block",
            }}
          />
        )}

        {phase === 2 && (
          <motion.div
            key="lockup"
            variants={lockup}
            initial="hidden"
            animate="visible"
            style={{
              gridArea: "1 / 1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {/*
              WE · dd · ING — reads as "WEDDING" once assembled.

              The lettering is sized by HEIGHT, not width: `we.png` and `ing.png`
              have different aspect ratios, so matching their widths would leave
              their cap heights mismatched and the word would not sit on one line.
            */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <motion.img
                src="/we.png"
                alt=""
                variants={slideFromLeft}
                style={{ height: CAP_HEIGHT, width: "auto", display: "block" }}
              />
              <motion.img
                src="/dd.png"
                alt=""
                variants={scaleUp}
                style={{ height: MONOGRAM_HEIGHT, width: "auto", display: "block" }}
              />
              <motion.img
                src="/ing.png"
                alt=""
                variants={slideFromRight}
                style={{ height: CAP_HEIGHT, width: "auto", display: "block" }}
              />
            </div>

            <motion.img
              src="/central.png"
              alt=""
              variants={slideFromBottom}
              style={{ width: CENTRAL_WIDTH, height: "auto", display: "block" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
