"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

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

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

/** A bubble lives this long, in ms, before it pops. */
const POP_AFTER_MIN = 6000;
const POP_AFTER_MAX = 14000;

/** How long a popped bubble stays gone before it comes back, in ms. */
const RESPAWN_DELAY = 5000;

const POP = { duration: 0.34, ease: "easeOut" } as const;
const SPAWN = { duration: 1.0, ease: "easeOut" } as const;

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

/** Four bubbles, one per quadrant, so two can never collide. */
const QUADRANTS = [
  { id: "tl", cx: 25, cy: 25 },
  { id: "tr", cx: 75, cy: 25 },
  { id: "bl", cx: 25, cy: 75 },
  { id: "br", cx: 75, cy: 75 },
] as const;

const DIAMETER_MIN = 132;
const DIAMETER_MAX = 300;
/** How much of the shorter quadrant edge a bubble may take up. */
const QUADRANT_FILL = 0.86;
/** Breathing room between a bubble and its quadrant's edge, in percent. */
const GUTTER = 1;

/**
 * Font size as a fraction of the bubble's diameter.
 *
 * Longer questions take a smaller face. The measure is fixed, so smaller type
 * fits more characters per line — which is what keeps even the longest question
 * to three or four lines instead of five.
 */
function fontScaleFor(label: string) {
  if (label.length > 46) return 0.062;
  if (label.length > 34) return 0.068;
  return 0.074;
}

/**
 * Text inset as a fraction of the diameter. A circle's largest inscribed square
 * is 70.7% of its diameter, so anything past ~14.6% would spill over the curve;
 * 0.17 leaves a little air.
 *
 * Applied in px, not as a percentage: percentage padding resolves against the
 * containing block's width, and these elements are positioned against the
 * section, so `17%` would have meant 17% of the whole viewport.
 */
const TEXT_INSET = 0.17;
/**
 * Measure, as a fraction of the diameter, so a long question breaks into three
 * or four lines. Derived from the diameter rather than set in `ch`: a ch-based
 * measure can resolve wider than the padded box and quietly breach the inset.
 */
const TEXT_MEASURE = 0.62;

type Layout = {
  diameter: number;
  /** How far a bubble may stray from its quadrant's centre, in percent. */
  playX: number;
  playY: number;
  /** Drift amplitude, in px, already sized to fit inside the play above. */
  driftX: number;
  driftY: number;
};

/**
 * Size the bubbles to the viewport and work out how far they may travel.
 *
 * A bubble must stay wholly inside its own quadrant, so the room it has to move
 * is whatever is left of the quadrant once its own radius and the gutter are
 * taken out. Half of that is spent on where it spawns and half on its drift,
 * which is what keeps it inside the quadrant at every point of the animation
 * rather than only at rest.
 */
function measure(vw: number, vh: number): Layout {
  const diameter = Math.min(
    DIAMETER_MAX,
    Math.max(DIAMETER_MIN, Math.min(vw / 2, vh / 2) * QUADRANT_FILL),
  );

  const halfX = ((diameter / 2) / vw) * 100;
  const halfY = ((diameter / 2) / vh) * 100;

  // A quadrant reaches 25% either side of its centre.
  const playX = Math.max(0, 25 - halfX - GUTTER);
  const playY = Math.max(0, 25 - halfY - GUTTER);

  return {
    diameter,
    playX: playX / 2,
    playY: playY / 2,
    driftX: ((playX / 2) / 100) * vw,
    driftY: ((playY / 2) / 100) * vh,
  };
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function shuffled<T>(items: T[]) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Slot = {
  /** Bumped on every respawn; used as the React key so the bubble remounts. */
  key: number;
  question: string;
  x: number;
  y: number;
  popAfter: number;
};

/* -------------------------------------------------------------------------- */

function Bubble({
  slot,
  layout,
  src,
  onRespawn,
}: {
  slot: Slot;
  layout: Layout;
  src: string;
  onRespawn: () => void;
}) {
  const reduced = useReducedMotion();

  // Held in a ref and kept out of the effect's deps below. The parent hands
  // down a fresh closure on every render, and one slot respawning re-renders
  // all four — depending on it directly would restart every bubble's timers
  // and drift each time any one of them came back.
  const respawnRef = useRef(onRespawn);
  useEffect(() => {
    respawnRef.current = onRespawn;
  });

  // The artwork and the text are siblings rather than nested, because
  // `mix-blend-mode` only reaches as far as its nearest stacking-context
  // ancestor — wrapping them in a shared animated div would box the blend in
  // and it would composite against nothing. They are driven by the same motion
  // values instead, so they move as one without either being inside the other.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.6);
  const opacity = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      scale.set(1);
      opacity.set(1);
      return;
    }

    const controls = [
      animate(scale, 1, SPAWN),
      animate(opacity, 1, SPAWN),
      animate(x, [0, layout.driftX, -layout.driftX * 0.7, 0], {
        duration: rand(15, 24),
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }),
      animate(y, [0, -layout.driftY, layout.driftY * 0.6, 0], {
        duration: rand(13, 21),
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }),
    ];

    // Live, pop, then hand back to the parent for a fresh question and position.
    const pop = setTimeout(() => {
      animate(scale, 1.2, POP);
      animate(opacity, 0, POP);
    }, slot.popAfter);

    const back = setTimeout(
      () => respawnRef.current(),
      slot.popAfter + POP.duration * 1000 + RESPAWN_DELAY,
    );

    return () => {
      controls.forEach((c) => c.stop());
      clearTimeout(pop);
      clearTimeout(back);
    };
  }, [reduced, layout, slot.popAfter, x, y, scale, opacity]);

  const box = {
    position: "absolute",
    width: layout.diameter,
    height: layout.diameter,
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    marginLeft: -layout.diameter / 2,
    marginTop: -layout.diameter / 2,
  } as const;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={src}
        alt=""
        style={{
          ...box,
          x,
          y,
          scale,
          opacity,
          display: "block",
          // Lets the damask read through the film instead of sitting flatly on
          // top of it, and the white bloom gives the rim its soapy pop.
          mixBlendMode: "hard-light",
          filter: "drop-shadow(0 0 14px rgba(255, 255, 255, 0.4))",
        }}
      />

      {/* Deliberately not blended: the text has to stay crisp and opaque. */}
      <motion.span
        style={{
          ...box,
          x,
          y,
          scale,
          opacity,
          display: "grid",
          placeItems: "center",
          padding: layout.diameter * TEXT_INSET,
        }}
      >
        <span
          style={{
            maxWidth: layout.diameter * TEXT_MEASURE,
            textAlign: "center",
            fontFamily: "var(--font-sans-stack)",
            fontWeight: 700,
            fontSize: layout.diameter * fontScaleFor(slot.question),
            lineHeight: 1.3,
            color: "#ffffff",
            textShadow:
              "0 1px 2px rgba(0, 0, 0, 0.55), 0 2px 10px rgba(0, 0, 0, 0.45)",
          }}
        >
          {slot.question}
        </span>
      </motion.span>
    </>
  );
}

export type FloatingBubblesProps = {
  /** The bubble artwork. */
  src?: string;
};

export default function FloatingBubbles({
  src = "/bubble.png",
}: FloatingBubblesProps) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);

  // A shuffled deck, so every question gets shown before any repeats, and a
  // record of what is on screen so two bubbles never carry the same one.
  const deck = useRef<string[]>([]);
  const onScreen = useRef<Set<string>>(new Set());

  const draw = useCallback((replacing?: string) => {
    if (replacing) onScreen.current.delete(replacing);
    let pick = "";
    for (let guard = 0; guard < 24; guard++) {
      if (deck.current.length === 0) deck.current = shuffled(QUESTIONS);
      pick = deck.current.pop() as string;
      if (!onScreen.current.has(pick)) break;
    }
    onScreen.current.add(pick);
    return pick;
  }, []);

  const place = useCallback((quadrant: number, l: Layout) => {
    const q = QUADRANTS[quadrant];
    return {
      x: q.cx + rand(-l.playX, l.playX),
      y: q.cy + rand(-l.playY, l.playY),
    };
  }, []);

  const build = useCallback(() => {
    const l = measure(window.innerWidth, window.innerHeight);
    setLayout(l);
    deck.current = [];
    onScreen.current = new Set();
    setSlots(
      QUADRANTS.map((_, i) => ({
        key: 0,
        question: draw(),
        popAfter: rand(POP_AFTER_MIN, POP_AFTER_MAX),
        ...place(i, l),
      })),
    );
  }, [draw, place]);

  useEffect(() => {
    build();

    // Only rebuild when the width moves enough to change the sizing, so an
    // address bar sliding away does not restart the whole field.
    let last = window.innerWidth;
    const onResize = () => {
      if (Math.abs(window.innerWidth - last) < 150) return;
      last = window.innerWidth;
      build();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [build]);

  const respawn = useCallback(
    (index: number) => {
      setSlots((prev) => {
        if (!prev || !layout) return prev;
        return prev.map((slot, i) =>
          i === index
            ? {
                key: slot.key + 1,
                question: draw(slot.question),
                popAfter: rand(POP_AFTER_MIN, POP_AFTER_MAX),
                ...place(i, layout),
              }
            : slot,
        );
      });
    },
    [draw, place, layout],
  );

  return (
    <section
      aria-label="Questions couples ask us"
      // `overflow-hidden` is what guarantees containment: nothing inside can
      // spill into the metrics above or the page below.
      className="relative w-full min-h-screen overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      {/* The bubbles are built from the viewport size after mount, so this list
          is what carries the questions in the server-rendered HTML. */}
      <ul className="sr-only">
        {QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>

      <div aria-hidden="true">
        {layout &&
          slots?.map((slot, i) => (
            <Bubble
              key={`${i}-${slot.key}`}
              slot={slot}
              layout={layout}
              src={src}
              onRespawn={() => respawn(i)}
            />
          ))}
      </div>
    </section>
  );
}
