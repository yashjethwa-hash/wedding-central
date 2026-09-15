"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const QUESTIONS = [
  "How to choose from too many options?",
  "What shall I wear to a daytime and a nighttime wedding?",
  "How do I choose the right colour for my wedding?",
  "Where do we start planning our wedding?",
  "How to plan the shaadi menu?",
  "What shall I gift the couple?",
  "How to manage the guest list?",
  "What is the best time for the pheras?",
  "How to pick the right wedding photographer?",
];

/**
 * Empty bubbles floating among the questions, purely for texture.
 *
 * This is the density dial. They are free to overlap anything — only the
 * question bubbles are kept apart — so raising it thickens the field without
 * making anything harder to read.
 */
const DECOR_COUNT = 14;

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

/** A bubble lives this long, in ms, before it pops. */
const POP_AFTER_MIN = 7000;
const POP_AFTER_MAX = 17000;

/** How long a popped bubble stays gone, in ms. */
const RESPAWN_MIN = 5000;
const RESPAWN_MAX = 6000;

const POP_TRANSITION = { duration: 0.32, ease: "easeOut" } as const;
const SPAWN_TRANSITION = { duration: 1.1, ease: "easeOut" } as const;

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

const SIZES = {
  question: "clamp(140px, 24vw, 215px)",
  medium: "clamp(84px, 14vw, 150px)",
  small: "clamp(44px, 8vw, 92px)",
};

/**
 * A circle's largest inscribed square is 70.7% of its diameter, so anything
 * past ~14.6% inset would spill over the curve. 17% leaves a little air.
 */
const TEXT_INSET = "17%";

/** Where bubbles may sit, in percent, kept off the edges so none is half-cut. */
const X_RANGE: [number, number] = [7, 93];
const Y_RANGE: [number, number] = [8, 90];

/**
 * How far a question may wander from the centre of its cell, as a fraction of
 * the cell. Small on purpose: it is what guarantees two questions can never
 * drift close enough for their text to collide.
 */
const CELL_PLAY = 0.14;

/** Tailwind's `md`. Below it the grid drops to two columns. */
const MD = 768;

type Cell = { cx: number; cy: number; w: number; h: number };

type Spec = {
  id: string;
  label?: string;
  size: string;
  /** Font size as a fraction of the bubble's diameter. */
  fontScale: number;
  /** Set for questions: the cell this bubble is confined to. */
  cell?: Cell;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  floatDuration: number;
  floatDelay: number;
  popAfter: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Longer questions need smaller type to stay inside the circle. */
function fontScaleFor(label: string) {
  if (label.length > 46) return 0.061;
  if (label.length > 34) return 0.068;
  return 0.076;
}

/** A random point inside a cell, held back from its edges by CELL_PLAY. */
function pointIn(cell: Cell) {
  return {
    x: round1(cell.cx + rand(-CELL_PLAY, CELL_PLAY) * cell.w),
    y: round1(cell.cy + rand(-CELL_PLAY, CELL_PLAY) * cell.h),
  };
}

/**
 * Build the field.
 *
 * Questions get one grid cell each and never leave it — neither when drifting
 * nor when respawning. Letting them roam freely reads better for about two
 * seconds and then two of them overlap and neither can be read. Empty bubbles
 * have no such constraint and are scattered anywhere, which is what keeps the
 * field from looking like a grid.
 */
function buildBubbles(viewportWidth: number): Spec[] {
  const cols = viewportWidth < MD ? 2 : 3;
  const rows = Math.ceil(QUESTIONS.length / cols);

  const spanX = X_RANGE[1] - X_RANGE[0];
  const spanY = Y_RANGE[1] - Y_RANGE[0];
  const cellW = spanX / cols;
  const cellH = spanY / rows;

  // Shuffle which cell each question lands in, so the reading order is not the
  // same as the visual order on every load.
  const cellIndexes = QUESTIONS.map((_, i) => i);
  for (let i = cellIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellIndexes[i], cellIndexes[j]] = [cellIndexes[j], cellIndexes[i]];
  }

  const specs: Spec[] = QUESTIONS.map((label, i) => {
    const slot = cellIndexes[i];
    const cell: Cell = {
      cx: X_RANGE[0] + ((slot % cols) + 0.5) * cellW,
      cy: Y_RANGE[0] + (Math.floor(slot / cols) + 0.5) * cellH,
      w: cellW,
      h: cellH,
    };
    const at = pointIn(cell);
    return {
      id: `q-${i}`,
      label,
      size: SIZES.question,
      fontScale: fontScaleFor(label),
      cell,
      x: at.x,
      y: at.y,
      // Gentle drift: a question that wanders far undoes the spacing above.
      driftX: Math.round(rand(8, 16)),
      driftY: Math.round(rand(10, 20)),
      floatDuration: round1(rand(16, 26)),
      floatDelay: round1(rand(0, 6)),
      popAfter: Math.round(rand(POP_AFTER_MIN, POP_AFTER_MAX)),
    };
  });

  for (let i = 0; i < DECOR_COUNT; i++) {
    specs.push({
      id: `d-${i}`,
      size: i % 3 === 0 ? SIZES.medium : SIZES.small,
      fontScale: 0,
      x: round1(rand(X_RANGE[0] - 3, X_RANGE[1] + 3)),
      y: round1(rand(Y_RANGE[0] - 4, Y_RANGE[1] + 4)),
      driftX: Math.round(rand(20, 55)),
      driftY: Math.round(rand(24, 64)),
      floatDuration: round1(rand(12, 24)),
      floatDelay: round1(rand(0, 8)),
      popAfter: Math.round(rand(POP_AFTER_MIN, POP_AFTER_MAX)),
    });
  }

  return specs;
}

/* -------------------------------------------------------------------------- */

function Bubble({ spec, src }: { spec: Spec; src: string }) {
  const reduced = useReducedMotion();

  // `n` doubles as the React key: bumping it remounts the inner element so the
  // spawn animation replays from `initial` at the new coordinates.
  const [spawn, setSpawn] = useState({
    n: 0,
    x: spec.x,
    y: spec.y,
    popAfter: spec.popAfter,
  });
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    if (reduced || popped) return;
    const t = setTimeout(() => setPopped(true), spawn.popAfter);
    return () => clearTimeout(t);
  }, [reduced, popped, spawn.n, spawn.popAfter]);

  useEffect(() => {
    if (!popped) return;
    const t = setTimeout(() => {
      // A question respawns inside its own cell; an empty bubble anywhere.
      const at = spec.cell
        ? pointIn(spec.cell)
        : {
            x: round1(rand(X_RANGE[0] - 3, X_RANGE[1] + 3)),
            y: round1(rand(Y_RANGE[0] - 4, Y_RANGE[1] + 4)),
          };
      setSpawn((s) => ({
        n: s.n + 1,
        x: at.x,
        y: at.y,
        popAfter: Math.round(rand(POP_AFTER_MIN, POP_AFTER_MAX)),
      }));
      setPopped(false);
    }, rand(RESPAWN_MIN, RESPAWN_MAX));
    return () => clearTimeout(t);
  }, [popped, spec.cell]);

  const drift = reduced
    ? undefined
    : {
        x: [0, spec.driftX, -spec.driftX * 0.7, 0],
        y: [0, -spec.driftY, spec.driftY * 0.6, 0],
      };

  return (
    <div
      // Centred on its coordinate with margins rather than a translate, which
      // leaves the transform free for the drift.
      style={{
        position: "absolute",
        left: `${spawn.x}%`,
        top: `${spawn.y}%`,
        width: spec.size,
        height: spec.size,
        marginLeft: `calc(${spec.size} / -2)`,
        marginTop: `calc(${spec.size} / -2)`,
      }}
    >
      {/* Drift layer — runs forever, independent of the pop cycle. */}
      <motion.div
        style={{ width: "100%", height: "100%" }}
        animate={drift}
        transition={{
          duration: spec.floatDuration,
          delay: spec.floatDelay,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {/* Pop and respawn layer. */}
        <motion.div
          key={spawn.n}
          initial={{ opacity: 0, scale: 0.55 }}
          animate={popped ? { opacity: 0, scale: 1.2 } : { opacity: 1, scale: 1 }}
          transition={popped ? POP_TRANSITION : SPAWN_TRANSITION}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            style={{ display: "block", width: "100%", height: "100%" }}
          />

          {spec.label && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                padding: TEXT_INSET,
                textAlign: "center",
                fontFamily: "var(--font-sans-stack)",
                fontWeight: 700,
                fontSize: `calc(${spec.size} * ${spec.fontScale})`,
                lineHeight: 1.28,
                color: "#ffffff",
                // The bubble film is pale, so plain white needs a little help
                // to hold up against it.
                textShadow: "0 1px 10px rgba(70, 6, 36, 0.55)",
              }}
            >
              {spec.label}
            </span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export type FloatingBubblesProps = {
  /** The bubble artwork. */
  src?: string;
};

export default function FloatingBubbles({
  src = "/bubble.png",
}: FloatingBubblesProps) {
  // The grid needs the viewport width to choose its column count, so the field
  // is built after mount. The questions are also rendered as plain text below,
  // which keeps them in the server HTML for assistive tech and crawlers.
  const [specs, setSpecs] = useState<Spec[] | null>(null);

  useEffect(() => {
    setSpecs(buildBubbles(window.innerWidth));

    // Rebuild only when the width changes enough to cross or reshape the grid,
    // so ordinary mobile toolbar resizes do not restart the whole field.
    let last = window.innerWidth;
    const onResize = () => {
      if (Math.abs(window.innerWidth - last) < 150) return;
      last = window.innerWidth;
      setSpecs(buildBubbles(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      aria-label="Questions couples ask us"
      /*
        `-mt-[28vh]` pulls the field up into the empty lower half of HeroMetrics
        and `z-0` keeps it behind that section's content, so bubbles drift past
        the figures instead of starting at a visible seam below them.

        `overflow-x-clip` rather than `overflow-hidden`: bubbles need to cross
        the top and bottom edges freely — clipping them there is exactly what
        would make this read as a separate band — but must not be able to push
        the page sideways.
      */
      className="relative z-0 -mt-[28vh] min-h-[135vh] w-full overflow-x-clip md:min-h-screen"
      style={{ pointerEvents: "none" }}
    >
      <ul className="sr-only">
        {QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      {/* The field itself is decorative; the list above is what gets read. */}
      <div aria-hidden="true">
        {specs?.map((spec) => (
          <Bubble key={spec.id} spec={spec} src={src} />
        ))}
      </div>
    </section>
  );
}
