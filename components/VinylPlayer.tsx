"use client";

import { motion, useReducedMotion } from "framer-motion";
import VinylRecord from "./VinylRecord";

export type CoverArt = {
  /** Shown under the tile and read out by assistive tech. */
  title: string;
  /** Optional artwork. Falls back to the tinted placeholder tile below. */
  src?: string;
  /** Placeholder tile colour, used when there is no image. */
  tint: string;
};

/**
 * Placeholder covers. Pass real artwork through the coverArts prop and each
 * tile renders the image instead, with no other change needed.
 */
const DEFAULT_COVERS: CoverArt[] = [
  { title: "Baraat Entry", tint: "#b2be85" },
  { title: "Sangeet Night", tint: "#d98da8" },
  { title: "Haldi Morning", tint: "#e8c46a" },
  { title: "Pheras", tint: "#8fa4c9" },
  { title: "Vidaai", tint: "#c98a6b" },
  { title: "After Party", tint: "#9d7fc0" },
];

/**
 * Where each cover sits around the record, as a percentage of the stage.
 *
 * Hand-placed rather than evenly spaced on a circle: an even ring leaves the
 * tiles level with the record's edge, where they collide with it at small
 * widths. `mobile: false` drops a cover under `sm`, which is what keeps the
 * remaining four clear of each other on a phone.
 */
const SLOTS = [
  { x: 6, y: 16, mobile: true },
  { x: 76, y: 8, mobile: true },
  { x: 88, y: 46, mobile: false },
  { x: 74, y: 78, mobile: true },
  { x: 8, y: 70, mobile: true },
  { x: -2, y: 44, mobile: false },
];

function MusicNote() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6 md:h-7 md:w-7"
    >
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

export type VinylPlayerProps = {
  coverArts?: CoverArt[];
};

export default function VinylPlayer({ coverArts }: VinylPlayerProps) {
  const covers = (coverArts ?? DEFAULT_COVERS).slice(0, SLOTS.length);
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full py-20 md:py-28" aria-labelledby="vinyl-heading">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="vinyl-heading"
            className="font-serif-display text-3xl font-medium text-ivory sm:text-4xl"
          >
            The sound of the whole week
          </h2>
          <p className="mt-4 font-body text-base font-light leading-relaxed text-ivory/85">
            A playlist for every function, from the baraat to the last hour of
            the after party.
          </p>
        </header>

        {/*
          One square stage. The record is centred inside it and the covers are
          positioned as percentages of the same box, so the whole arrangement
          scales together instead of drifting apart at different widths.
        */}
        <div className="relative mx-auto mt-14 aspect-square w-full max-w-[19rem] sm:max-w-[26rem] lg:max-w-[32rem]">
          {/* group/vinyl so hovering anywhere on the stage pauses the spin,
              rather than only the record's own bounding box. */}
          <div className="group/vinyl absolute inset-[18%] sm:inset-[20%]">
            <motion.div
              className="h-full w-full"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 3.5, ease: "linear", repeat: Infinity }
              }
              style={{ animationPlayState: "running" }}
            >
              <VinylRecord className="h-full w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]" />
            </motion.div>
          </div>

          {covers.map((cover, index) => {
            const slot = SLOTS[index];
            return (
              <motion.figure
                key={cover.title}
                className={`absolute m-0 ${slot.mobile ? "" : "hidden sm:block"}`}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                // Staggered offsets and durations, so no two tiles bob together.
                animate={
                  reduceMotion ? undefined : { y: [0, -12, 0], rotate: [-2, 2, -2] }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 4.5 + index * 0.6,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: index * 0.45,
                      }
                }
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/30 text-maroon shadow-lg shadow-black/35 sm:h-20 sm:w-20 md:h-24 md:w-24"
                  style={
                    cover.src
                      ? undefined
                      : { backgroundColor: cover.tint }
                  }
                >
                  {cover.src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cover.src}
                      alt=""
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <MusicNote />
                  )}
                </div>

                <figcaption className="mt-2 max-w-16 font-body text-[0.6rem] leading-tight text-ivory/75 sm:max-w-20 sm:text-[0.7rem] md:max-w-24">
                  {cover.title}
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
