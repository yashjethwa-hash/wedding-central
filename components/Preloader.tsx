"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Timeline for the preloader, in seconds.
 *
 * Everything is driven off these numbers, so retiming the sequence only means
 * editing this object - no need to hunt through the JSX.
 */
export const PRELOADER_TIMELINE = {
  /** How long `/dd.png` takes to fade in. */
  introFade: 0.8,
  /** When the monogram shrinks and the words fly in around it. */
  assembleAt: 1.5,
  /** How long that assembly takes. */
  assembleDuration: 0.8,
  /** How long the composed lockup is held before it leaves. */
  hold: 1.5,
  /** How long the whole container takes to fade out. */
  fadeOut: 0.7,
} as const;

/** Soft deceleration - quick off the mark, gentle landing. */
const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/* Sizing - retune the lockup here rather than in the JSX.                     */
/* -------------------------------------------------------------------------- */

const MONOGRAM_WIDTH = "min(210px, 40vw)";
const WORD_SIZE = "clamp(2.5rem, 10.5vw, 6rem)";
const CENTRAL_SIZE = "clamp(0.7rem, 2.6vw, 1.15rem)";

/** Intrinsic aspect ratio of `/dd.png` (792 x 448). */
const MONOGRAM_ASPECT = 792 / 448;
const ASSEMBLED_SCALE = 0.8;

/**
 * A CSS transform does not change an element's layout box, so scaling the
 * monogram to 0.8 leaves (1 - 0.8) / 2 of its width as dead space on each side
 * and the same fraction of its height above and below. The words anchor to that
 * stale box, so without this compensation they float clear of the artwork and
 * the lockup stops reading as one word.
 */
const INSET = (1 - ASSEMBLED_SCALE) / 2;
const SIDE_GAP = `calc(${MONOGRAM_WIDTH} * ${INSET})`;
const BOTTOM_GAP = `calc(${MONOGRAM_WIDTH} / ${MONOGRAM_ASPECT} * ${INSET})`;

/** Extra nudge so the monogram's own transparent margin is closed up too. */
const TUCK = "0.04em";

type Stage = "intro" | "assembled" | "exiting";

export type PreloaderProps = {
  /**
   * Fired once the container has finished fading out - driven by Framer's own
   * completion callback rather than a timer, so the handover cannot land while
   * the fade is still painting.
   */
  onAnimationComplete: () => void;
};

/**
 * WE and ING are positioned off the monogram's edges rather than laid out in a
 * row with it. That keeps the monogram exactly centred the whole time: it never
 * shifts sideways to make room when the words arrive.
 */
const flankBase = {
  position: "absolute",
  top: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  fontFamily: "var(--font-display-stack)",
  fontSize: WORD_SIZE,
  fontWeight: 500,
  lineHeight: 1,
  color: "var(--ivory)",
} as const;

export default function Preloader({ onAnimationComplete }: PreloaderProps) {
  const [stage, setStage] = useState<Stage>("intro");

  useEffect(() => {
    const T = PRELOADER_TIMELINE;
    const timers = [
      setTimeout(() => setStage("assembled"), T.assembleAt * 1000),
      setTimeout(
        () => setStage("exiting"),
        (T.assembleAt + T.assembleDuration + T.hold) * 1000,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const assembled = stage !== "intro";
  const exiting = stage === "exiting";

  // One transition shared by every piece of the assembly, so the monogram's
  // shrink and the three words' arrival run on exactly the same curve.
  const assembly = {
    duration: assembled ? PRELOADER_TIMELINE.assembleDuration : PRELOADER_TIMELINE.introFade,
    ease: EASE,
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: PRELOADER_TIMELINE.fadeOut, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (exiting) onAnimationComplete();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
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
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* The monogram. Fades in, then shrinks in place - it never leaves. */}
        <motion.img
          src="/dd.png"
          alt=""
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: assembled ? ASSEMBLED_SCALE : 1 }}
          transition={assembly}
          style={{ width: MONOGRAM_WIDTH, height: "auto", display: "block" }}
        />

        {/* WE - slides in from the left, landing against the monogram. */}
        <motion.span
          initial={{ opacity: 0, x: "-70%" }}
          animate={{ opacity: assembled ? 1 : 0, x: assembled ? "0%" : "-70%" }}
          transition={assembly}
          style={{
            ...flankBase,
            right: "100%",
            marginRight: `calc(${SIDE_GAP} * -1 + ${TUCK})`,
          }}
        >
          WE
        </motion.span>

        {/* ING - slides in from the right. */}
        <motion.span
          initial={{ opacity: 0, x: "70%" }}
          animate={{ opacity: assembled ? 1 : 0, x: assembled ? "0%" : "70%" }}
          transition={assembly}
          style={{
            ...flankBase,
            left: "100%",
            marginLeft: `calc(${SIDE_GAP} * -1 + ${TUCK})`,
          }}
        >
          ING
        </motion.span>

        {/* CENTRAL - rises into place directly under the lockup. */}
        <motion.span
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: assembled ? 1 : 0, y: assembled ? 0 : 48 }}
          transition={assembly}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: `calc(${BOTTOM_GAP} * -1)`,
            display: "flex",
            justifyContent: "center",
            paddingTop: "0.5rem",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-sans-stack)",
            fontSize: CENTRAL_SIZE,
            fontWeight: 300,
            letterSpacing: "0.42em",
            // Offsets the trailing letter-space so the word stays optically centred.
            textIndent: "0.42em",
            color: "var(--ivory)",
          }}
        >
          CENTRAL
        </motion.span>
      </div>
    </motion.div>
  );
}
