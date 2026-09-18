"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Placeholder art and playlist id.
 *
 * Swap these per entry in PLAYLISTS below as the real YouTube playlists and
 * cover art come in - nothing else on this page needs to change.
 */
const PLACEHOLDER_THUMBNAIL = "/bg-pattern.jpg";
const PLACEHOLDER_PLAYLIST_ID = "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG";

/** The thirteen functions, in the order the week actually runs. */
const PLAYLISTS = [
  "Engagement",
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Bride Entry",
  "Groom Entry",
  "Varmala",
  "Pheras",
  "Reception",
  "Couple Dance",
  "Family Dance",
  "Bidaai",
  "After Party",
].map((name, index) => ({
  id: index + 1,
  name,
  thumbnail: PLACEHOLDER_THUMBNAIL,
  youtubePlaylistId: PLACEHOLDER_PLAYLIST_ID,
}));

/** How far the record has to travel before the swipe counts. */
const SWIPE_THRESHOLD = 50;

/** Degrees the record turns per playlist. */
const ROTATION_STEP = 45;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.14-6.86a.5.5 0 0 0 0-.86L8.76 4.71a.5.5 0 0 0-.76.43Z" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-4 w-4 ${direction === "next" ? "" : "rotate-180"}`}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function PlaylistsPage() {
  // Held in state so the list can later come from a CMS or API without the
  // rest of the page changing shape.
  const [playlists] = useState(PLAYLISTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

  const activePlaylist = playlists[activeIndex];

  /**
   * step: +1 for the next playlist, -1 for the previous one.
   *
   * The index wraps both ways, so the record never hits an end. Every change
   * drops the player back to the thumbnail - otherwise the iframe would keep
   * playing the track you just swiped away from.
   */
  const goTo = useCallback(
    (step) => {
      setActiveIndex((current) => (current + step + playlists.length) % playlists.length);
      // Next turns the record anticlockwise, previous turns it clockwise.
      setRotation((current) => current - step * ROTATION_STEP);
      setIsPlaying(false);
    },
    [playlists.length],
  );

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goTo(1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goTo(-1);
    }
  };

  // The record is the primary control, so it answers the arrow keys too. Without
  // this it would be reachable but unusable for anyone not swiping.
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goTo(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goTo(-1);
    }
  };

  const rotationTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 120, damping: 18, mass: 0.8 };

  return (
    /* No background of its own: the fixed damask painted by body::before in
       globals.css shows through the whole page. */
    <main className="w-full py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/70 uppercase">
            Wedding Central
          </p>

          <h1 className="mt-4 font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
            Playlists
          </h1>

          <p className="mt-5 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
            A set for every function, from the engagement to the last hour of the
            after party. Spin the record to change the mood.
          </p>
        </header>

        {/* Split screen from lg up: details and player on the left, record on
            the right. Below that they stack, with the record underneath. */}
        <div className="mt-12 grid items-center gap-12 md:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* ---------------------------------------------------------------
              Left: the active playlist and its player
              --------------------------------------------------------------- */}
          <section className="w-full" aria-live="polite">
            <p className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/60 uppercase">
              {String(activeIndex + 1).padStart(2, "0")} / {String(playlists.length).padStart(2, "0")}
            </p>

            {/* min-h keeps the player from jumping as names of different
                lengths wrap in and out. */}
            <div className="mt-3 min-h-[3.5rem] md:min-h-[4.5rem]">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activePlaylist.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="font-serif-display text-4xl leading-tight font-medium text-ivory sm:text-5xl md:text-6xl"
                >
                  {activePlaylist.name}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* The frame itself is translucent glass, so the pattern stays
                visible around the art. */}
            <div className="relative mt-7 aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key={`player-${activePlaylist.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/videoseries?list=${activePlaylist.youtubePlaylistId}&autoplay=1`}
                      title={`${activePlaylist.name} playlist`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key={`thumb-${activePlaylist.id}`}
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="group absolute inset-0 block h-full w-full cursor-pointer"
                    aria-label={`Play the ${activePlaylist.name} playlist`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePlaylist.thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      draggable={false}
                    />

                    {/* Darkens the art just enough for the button to hold. */}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center gap-2.5 rounded-full border border-white/30 bg-black/45 px-6 py-3 font-body text-sm font-semibold tracking-wide text-ivory shadow-lg shadow-black/40 backdrop-blur-sm transition-colors group-hover:bg-black/65">
                        <PlayIcon />
                        Play Playlist
                      </span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Arrow controls, for anyone on a mouse or a keyboard who is not
                going to swipe the record. */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 text-ivory transition-colors hover:bg-white/15"
                aria-label="Previous playlist"
              >
                <ChevronIcon direction="previous" />
              </button>

              <button
                type="button"
                onClick={() => goTo(1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 text-ivory transition-colors hover:bg-white/15"
                aria-label="Next playlist"
              >
                <ChevronIcon direction="next" />
              </button>

              <p className="font-body text-xs leading-snug font-light text-ivory/65 sm:text-sm">
                Swipe the record left for the next function, right for the last one.
              </p>
            </div>
          </section>

          {/* ---------------------------------------------------------------
              Right: the record
              --------------------------------------------------------------- */}
          <section className="flex w-full justify-center">
            <div className="relative aspect-square w-full max-w-[17rem] sm:max-w-[22rem] lg:max-w-[26rem]">
              <motion.div
                // x is what the drag moves; rotate is driven by state, so the
                // two never fight over the same value.
                drag="x"
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.18}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={{ rotate: rotation }}
                transition={rotationTransition}
                whileTap={{ scale: 0.97 }}
                onKeyDown={handleKeyDown}
                role="slider"
                tabIndex={0}
                aria-label="Playlist selector. Swipe or use the arrow keys to change playlist."
                aria-valuemin={1}
                aria-valuemax={playlists.length}
                aria-valuenow={activeIndex + 1}
                aria-valuetext={activePlaylist.name}
                className="relative h-full w-full cursor-grab touch-pan-y rounded-full select-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ivory active:cursor-grabbing"
              >
                {/*
                  vinyl.png is a 1080x1920 portrait with the record centred in
                  transparent padding, so `contain` would shrink the disc to the
                  image's width. `cover` inside a square crops that padding away
                  and leaves the record filling the circle.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/vinyl.png"
                  alt=""
                  className="h-full w-full rounded-full object-cover drop-shadow-[0_16px_34px_rgba(0,0,0,0.5)]"
                  draggable={false}
                />
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
