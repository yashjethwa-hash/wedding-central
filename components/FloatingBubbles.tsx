"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const QUESTIONS = [
  "How to make a wedding budget-friendly?",
  "How to decide a wedding theme?",
  "What shall I gift the couple?",
  "How to pick the right wedding photographer?",
  "How to choose the right colour for bride and groom’s outfit?",
  "What games can be played in a wedding?",
  "What skincare should the bride and groom follow before the wedding?",
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

/**
 * Empty bubbles scattered across the whole section, behind and between the
 * four question bubbles. They carry no text, so they are free to sit anywhere
 * and to overlap anything without making something harder to read.
 */
const DECOR_COUNT = 18;
/** Decorative diameters, as a fraction of a question bubble's. */
const DECOR_SMALL: [number, number] = [0.14, 0.26];
const DECOR_MEDIUM: [number, number] = [0.32, 0.52];
/** How much of the shorter quadrant edge a bubble may take up. */
const QUADRANT_FILL = 0.86;
/** Breathing room between a bubble and its quadrant's edge, in percent. */
const GUTTER = 1;

/**
 * Font size as a fraction of the bubble's diameter.
 *
 * Longer questions take a smaller face. The measure is fixed, so smaller type
 * fits more characters per line - which is what keeps even the longest question
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

type Decor = {
  id: number;
  /** Diameter in px. */
  d: number;
  /** The grid cell this bubble keeps to, in percent of the section. */
  cell: { x0: number; x1: number; y0: number; y1: number };
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  driftMs: number;
  delayMs: number;
  popAfter: number;
};

/** A random point inside a rectangle, inset so the bubble is not born straddling an edge. */
function spotIn(cell: Decor["cell"], d: number, vw: number, vh: number) {
  const halfX = ((d / 2) / vw) * 100;
  const halfY = ((d / 2) / vh) * 100;
  const x0 = Math.max(halfX, cell.x0);
  const x1 = Math.min(100 - halfX, cell.x1);
  const y0 = Math.max(halfY, cell.y0);
  const y1 = Math.min(100 - halfY, cell.y1);
  return {
    x: x0 < x1 ? rand(x0, x1) : (x0 + x1) / 2,
    y: y0 < y1 ? rand(y0, y1) : (y0 + y1) / 2,
  };
}

/**
 * Scatter the empty bubbles across the whole section.
 *
 * Stratified rather than uniform: the section is split into a coarse grid and
 * one bubble is dropped at random inside each cell. Drawing all of them from a
 * single uniform distribution clumps badly at this count, leaving one half of
 * the section crowded and the other bare. This keeps every position random
 * while guaranteeing the coverage is even, and each bubble stays in its cell on
 * respawn so the coverage holds over time.
 */
function buildDecor(vw: number, vh: number, base: number): Decor[] {
  const cols = vw < 768 ? 3 : 6;
  const rows = Math.ceil(DECOR_COUNT / cols);
  const cw = 100 / cols;
  const ch = 100 / rows;

  return Array.from({ length: DECOR_COUNT }, (_, id) => {
    const range = id % 3 === 0 ? DECOR_MEDIUM : DECOR_SMALL;
    const d = base * rand(range[0], range[1]);
    const col = id % cols;
    const row = Math.floor(id / cols);
    const cell = { x0: col * cw, x1: (col + 1) * cw, y0: row * ch, y1: (row + 1) * ch };
    return {
      id,
      d,
      cell,
      ...spotIn(cell, d, vw, vh),
      driftX: rand(10, 34),
      driftY: rand(14, 46),
      driftMs: rand(11, 22) * 1000,
      delayMs: rand(0, 7) * 1000,
      popAfter: rand(POP_AFTER_MIN, POP_AFTER_MAX),
    };
  });
}

/* -------------------------------------------------------------------------- */

function DecorBubble({
  decor,
  src,
  vw,
  vh,
}: {
  decor: Decor;
  src: string;
  vw: number;
  vh: number;
}) {
  const reduced = useReducedMotion();
  const [spot, setSpot] = useState({ n: 0, x: decor.x, y: decor.y });

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

    // The pop left these at 1.2 and 0; reset so a respawn fades in the same way
    // the first appearance did rather than shrinking into view.
    scale.set(0.6);
    opacity.set(0);

    const controls = [
      animate(scale, 1, SPAWN),
      animate(opacity, 1, SPAWN),
      animate(x, [0, decor.driftX, -decor.driftX * 0.7, 0], {
        duration: decor.driftMs / 1000,
        delay: decor.delayMs / 1000,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }),
      animate(y, [0, -decor.driftY, decor.driftY * 0.6, 0], {
        duration: (decor.driftMs * 0.85) / 1000,
        delay: decor.delayMs / 1000,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }),
    ];

    const pop = setTimeout(() => {
      animate(scale, 1.2, POP);
      animate(opacity, 0, POP);
    }, decor.popAfter);

    const back = setTimeout(() => {
      setSpot((s) => ({ n: s.n + 1, ...spotIn(decor.cell, decor.d, vw, vh) }));
    }, decor.popAfter + POP.duration * 1000 + RESPAWN_DELAY);

    return () => {
      controls.forEach((c) => c.stop());
      clearTimeout(pop);
      clearTimeout(back);
    };
    // `spot.n` restarts the whole cycle when the bubble comes back somewhere new.
  }, [reduced, decor, spot.n, vw, vh, x, y, scale, opacity]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <motion.img
      src={src}
      alt=""
      style={{
        position: "absolute",
        width: decor.d,
        height: decor.d,
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        marginLeft: -decor.d / 2,
        marginTop: -decor.d / 2,
        x,
        y,
        scale,
        opacity,
        display: "block",
        mixBlendMode: "hard-light",
        filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.35))",
      }}
    />
  );
}

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
  // all four - depending on it directly would restart every bubble's timers
  // and drift each time any one of them came back.
  const respawnRef = useRef(onRespawn);
  useEffect(() => {
    respawnRef.current = onRespawn;
  });

  // The artwork and the text are siblings rather than nested, because
  // `mix-blend-mode` only reaches as far as its nearest stacking-context
  // ancestor - wrapping them in a shared animated div would box the blend in
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
  const [decor, setDecor] = useState<Decor[] | null>(null);
  const [view, setView] = useState({ vw: 0, vh: 0 });

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
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const l = measure(vw, vh);
    setLayout(l);
    setView({ vw, vh });
    setDecor(buildDecor(vw, vh, l.diameter));
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
        {/* Painted first so the question bubbles sit over them. */}
        {decor?.map((d) => (
          <DecorBubble key={d.id} decor={d} src={src} vw={view.vw} vh={view.vh} />
        ))}

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
