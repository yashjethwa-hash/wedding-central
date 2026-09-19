"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Playlist = {
  id: number;
  name: string;
  youtubePlaylistId: string;
  /** The sleeve's two colours. */
  tint: [string, string];
  /**
   * Optional artwork laid over the drawn sleeve: a path under /public, or
   * youtubeThumb("<first video id>"). A playlist id on its own cannot produce a
   * thumbnail - YouTube serves cover images per video, so the frame has to come
   * from a video in the list. Anything that fails to load falls back to the
   * sleeve underneath.
   */
  cover?: string;
};

/** Build a cover URL from the id of a video inside the playlist. */
export function youtubeThumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * The functions in the order the week runs, ending at the bidaai.
 *
 * Each sleeve is pressed on its own colour, following the week's own palette -
 * turmeric for the haldi, henna green for the mehendi, marigold for the
 * varmala - so the reel reads as a shelf of records rather than ten copies of
 * one placeholder.
 */
const PLAYLISTS: Playlist[] = [
  { name: "Engagement", youtubePlaylistId: "PLcGTPcmPB--w", tint: ["#7d1338", "#3a091c"] },
  { name: "Haldi", youtubePlaylistId: "PLdbe0z5kx7Nk", tint: ["#b8860b", "#4f3106"] },
  { name: "Mehendi", youtubePlaylistId: "PLZZEG_CAuwik", tint: ["#42632f", "#182513"] },
  { name: "Sangeet", youtubePlaylistId: "PLJzcm8nb2LEU", tint: ["#7b2a6e", "#30112b"] },
  { name: "Bride Entry", youtubePlaylistId: "PLAY-nasSgvj0", tint: ["#a8475d", "#41141d"] },
  { name: "Groom Entry", youtubePlaylistId: "PLKZ3m1gAMO5s", tint: ["#33406f", "#11172c"] },
  { name: "Varmala", youtubePlaylistId: "PLeGav1AR-sg8", tint: ["#b5611a", "#4c2609"] },
  { name: "Pheras", youtubePlaylistId: "PLe4xl7SpQnSg", tint: ["#8f2116", "#380c07"] },
  { name: "Reception", youtubePlaylistId: "PLcP628aE66-s", tint: ["#8a6a3a", "#352614"] },
  { name: "Bidaai", youtubePlaylistId: "PLEXO7U22Bmw8", tint: ["#3c4f6b", "#141d2a"] },
].map((item, index) => ({ ...item, id: index + 1 }) as Playlist);

const N = PLAYLISTS.length;

/**
 * Degrees of turn that load the next function. With ten functions at 36
 * degrees, one complete revolution of the record is the whole week.
 */
const STEP_DEG = 36;

/** Coasting after the hand lets go. */
const MAX_FLICK = 0.9; // deg per ms
const FRICTION_MS = 240; // velocity e-folds over this
const STOP_DEG_MS = 0.004;

/** Idle turn while a set plays - a slow 10rpm, not a real 33. */
const PLAY_SPIN = 0.06;

/** How long the embedded player has to answer before we offer the link. */
const HANDSHAKE_MS = 4500;

/** Where each tile sits, by its distance from the active one. */
const LAYOUT: Record<string, { y: string; s: number; o: number; b: number; z: number }> = {
  "0": { y: "0%", s: 1, o: 1, b: 0, z: 6 },
  "1": { y: "102%", s: 0.74, o: 0.72, b: 0.8, z: 4 },
  "-1": { y: "-102%", s: 0.74, o: 0.72, b: 0.8, z: 4 },
  "2": { y: "188%", s: 0.56, o: 0, b: 2, z: 2 },
  "-2": { y: "-188%", s: 0.56, o: 0, b: 2, z: 2 },
};

function playlistUrl(item: Playlist) {
  return `https://www.youtube.com/playlist?list=${item.youtubePlaylistId}`;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

/** Keeps a step across the -180/180 seam from reading as a 350 degree jump. */
function shortest(delta: number) {
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

export default function PlaylistDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const recordRef = useRef<HTMLDivElement>(null);
  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Held in refs, not state: the loop writes a transform every frame, and
  // re-rendering the whole deck sixty times a second to move one disc would be
  // wasted work.
  const rotation = useRef(0);
  const carry = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const samples = useRef<{ a: number; t: number }[]>([]);
  const playingRef = useRef(false);

  const active = PLAYLISTS[activeIndex];

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const step = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + N) % N);
    // Every change drops the player back to its sleeve, or the set just rolled
    // past would carry on playing under the new one.
    setPlaying(false);
    setBlocked(false);
  }, []);

  /**
   * Turn the disc by `deg`. Input turns bank toward the next step; the idle
   * spin while a set plays does not, or the record would walk the week on its
   * own.
   */
  const turn = useCallback(
    (deg: number, isInput: boolean) => {
      rotation.current += deg;
      if (!isInput) return;

      carry.current += deg;
      while (carry.current >= STEP_DEG) {
        carry.current -= STEP_DEG;
        step(1);
      }
      while (carry.current <= -STEP_DEG) {
        carry.current += STEP_DEG;
        step(-1);
      }
    },
    [step],
  );

  /** Turn the disc as well, for steps the hand did not turn itself. */
  const driveTo = useCallback(
    (direction: number) => {
      rotation.current += direction * STEP_DEG;
      step(direction);
    },
    [step],
  );

  const jumpTo = useCallback((index: number) => {
    setActiveIndex((current) => {
      if (index === current) return current;
      // Turn by the shorter way round, so the rail and the record agree.
      const forward = (index - current + N) % N;
      const steps = forward <= N - forward ? forward : forward - N;
      rotation.current += steps * STEP_DEG;
      return index;
    });
    setPlaying(false);
    setBlocked(false);
  }, []);

  /* ------------------------------------------------------------ the rolling */
  const angleAt = (event: React.PointerEvent) => {
    const node = recordRef.current;
    if (!node) return 0;
    const box = node.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    return (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    velocity.current = 0;
    // Each grab starts from zero. Carrying the leftover turn across gestures
    // makes the record unpredictable - the same small roll would step once or
    // not at all depending on where the last one stopped.
    carry.current = 0;
    lastAngle.current = angleAt(event);
    samples.current = [{ a: lastAngle.current, t: event.timeStamp }];
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const angle = angleAt(event);
    turn(shortest(angle - lastAngle.current), true);
    lastAngle.current = angle;

    samples.current.push({ a: angle, t: event.timeStamp });
    if (samples.current.length > 6) samples.current.shift();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // Velocity over the last few samples, so the throw carries on.
    const list = samples.current;
    if (list.length > 1) {
      const first = list[0];
      const last = list[list.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        const v = shortest(last.a - first.a) / dt;
        velocity.current = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
      }
    }

    samples.current = [];
  };

  /* --------------------------------------------------------------- the loop */
  useEffect(() => {
    const node = recordRef.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;

      if (!dragging.current) {
        if (Math.abs(velocity.current) > STOP_DEG_MS) {
          turn(velocity.current * dt, true);
          velocity.current *= Math.exp(-dt / FRICTION_MS);
        } else {
          velocity.current = 0;
        }

        // The idle turn only runs while a set is playing, and never fights a
        // hand that is on the record.
        if (playingRef.current && !reduceMotion) turn(PLAY_SPIN * dt, false);
      }

      node.style.setProperty("--rot", `${rotation.current.toFixed(2)}deg`);
      raf = window.requestAnimationFrame(frame);
    };

    raf = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(raf);
  }, [turn]);

  /* A trackpad or wheel over the record turns it too. Bound by hand because
     React's onWheel is passive, and this one has to preventDefault. */
  useEffect(() => {
    const node = recordRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      turn(Math.max(-24, Math.min(24, event.deltaY * 0.4)), true);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [turn]);

  /* Keeps the rail's active chip in view as the record rolls past it. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      railRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 130);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  /*
    A blocked frame still fires `load` - the browser has loaded its own error
    page into it - so the load event cannot tell us the player is really there.
    Asking the player itself can: with enablejsapi on, it answers a "listening"
    message. No answer, and we put the playlist one click away rather than
    leaving a dead panel.
  */
  useEffect(() => {
    if (!playing) return;

    let answered = false;

    const onMessage = (event: MessageEvent) => {
      if (event.source === frameRef.current?.contentWindow) answered = true;
    };

    window.addEventListener("message", onMessage);

    const handshake = window.setTimeout(() => {
      try {
        frameRef.current?.contentWindow?.postMessage(
          '{"event":"listening","id":1,"channel":"widget"}',
          "https://www.youtube.com",
        );
      } catch {
        /* blocked frames refuse the handshake; the watchdog below copes */
      }
    }, 400);

    const watchdog = window.setTimeout(() => {
      if (!answered) setBlocked(true);
    }, HANDSHAKE_MS);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(handshake);
      window.clearTimeout(watchdog);
    };
  }, [playing, activeIndex]);

  const onRecordKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      driveTo(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      driveTo(-1);
    }
  };

  const counter = `${pad(activeIndex + 1)} / ${pad(N)}`;

  return (
    <>
      {/* Pulls the eye to the middle of the stage and settles the busy damask.
          Sits in the same negative layer as the fixed pattern in globals.css,
          later in the document, so it paints over it and under the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: -1,
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(41, 6, 22, 0.55) 100%)",
        }}
      />

      {/*
        The running order, directly under the header. The ten functions run in a
        fixed order, so this rail is that order rather than decoration - it is
        what places the record at Sangeet on a Thursday night rather than at
        track four of ten.
      */}
      <section className="mt-11 text-center" aria-label="The week, in order">
        <span className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/70 uppercase">
          The week, in order
        </span>

        <div className="no-scrollbar mt-4 overflow-x-auto py-1 [mask-image:linear-gradient(to_right,transparent,#000_2.5rem,#000_calc(100%-2.5rem),transparent)]">
          <div className="mx-auto flex w-max gap-2 px-10">
            {PLAYLISTS.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  railRefs.current[index] = node;
                }}
                type="button"
                onClick={() => jumpTo(index)}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`flex-none cursor-pointer rounded-full border px-4 py-2 font-body text-[0.8125rem] whitespace-nowrap transition-all duration-200 ${
                  index === activeIndex
                    ? "border-sage bg-sage font-semibold text-maroon shadow-[0_6px_18px_-6px_rgba(178,190,133,0.7)]"
                    : "border-white/10 bg-black/20 text-ivory/50 hover:-translate-y-0.5 hover:border-white/20 hover:text-ivory"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid items-center gap-14 py-12 lg:grid-cols-2 lg:gap-16 lg:py-14 [&>*]:min-w-0">
        {/* --------------------------------------------- left: the cover reel */}
        <section aria-live="polite">
          <div className="flex items-baseline gap-3.5">
            <p className="font-body text-[0.7rem] font-semibold tracking-[0.22em] text-ivory/50 tabular-nums">
              {counter}
            </p>

            {playing && (
              <span className="inline-flex h-5 items-center gap-2 rounded-full bg-sage px-2.5 font-body text-[0.625rem] font-bold tracking-[0.14em] text-maroon uppercase">
                <span aria-hidden="true" className="flex h-2.5 items-end gap-[2px]">
                  <i className="wc-eq w-[2px] rounded-[1px] bg-maroon" />
                  <i className="wc-eq w-[2px] rounded-[1px] bg-maroon [animation-delay:0.18s]" />
                  <i className="wc-eq w-[2px] rounded-[1px] bg-maroon [animation-delay:0.36s]" />
                </span>
                Now playing
              </span>
            )}
          </div>

          {/* Fixed block, so a one-word name and a two-word name do not shift
              the reel underneath. */}
          <div className="mt-2 flex min-h-14 items-end md:min-h-[4.5rem]">
            <h2
              key={active.id}
              className="wc-name font-serif-display text-[clamp(2.25rem,5.5vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.01em] text-ivory"
            >
              {active.name}
            </h2>
          </div>

          {/*
            A vertical reel: the record turns on the right, the covers roll past
            on the left. Sized from its own width - the tile is 16/9 of that, so
            a 16/21 stage always leaves the same slice of the covers above and
            below on show, at every screen size.
          */}
          <div className="relative mt-5 aspect-[16/21] w-full max-w-sm [mask-image:linear-gradient(to_bottom,transparent,#000_13%,#000_87%,transparent)]">
            {PLAYLISTS.map((item, index) => {
              const raw = (index - activeIndex + N) % N;
              const offset = raw > N / 2 ? raw - N : raw;
              const spec = LAYOUT[String(offset)] ?? {
                y: offset > 0 ? "210%" : "-210%",
                s: 0.5,
                o: 0,
                b: 3,
                z: 1,
              };
              const isActive = offset === 0;
              const far = spec.o === 0;

              return (
                <div
                  key={item.id}
                  className="absolute top-1/2 left-1/2 aspect-video w-full -translate-x-1/2 -translate-y-1/2 transition-[transform,opacity,filter] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={
                    {
                      "--c1": item.tint[0],
                      "--c2": item.tint[1],
                      transform: `translateY(${spec.y}) scale(${spec.s})`,
                      opacity: spec.o,
                      filter: `blur(${spec.b}px)`,
                      zIndex: spec.z,
                      pointerEvents: far ? "none" : undefined,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    tabIndex={far ? -1 : 0}
                    onClick={() => (isActive ? setPlaying(true) : jumpTo(index))}
                    aria-label={
                      isActive
                        ? `Play the ${item.name} playlist`
                        : `Load the ${item.name} playlist`
                    }
                    className={`relative block h-full w-full cursor-pointer overflow-hidden rounded-2xl border p-0 text-left shadow-[0_28px_56px_-28px_rgba(0,0,0,0.85)] ${
                      isActive
                        ? "border-ivory/35 shadow-[0_34px_64px_-26px_rgba(0,0,0,0.9),0_0_0_1px_rgba(178,190,133,0.25)]"
                        : "border-white/20"
                    }`}
                  >
                    {/* The sleeve, drawn in CSS, so a cover always renders with
                        no image to fetch. */}
                    <span className="wc-sleeve absolute inset-0" />

                    {/* Real artwork, when there is any. A cover that fails to
                        load removes itself and the sleeve shows through. */}
                    {item.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cover}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 block h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/5 to-[62%]" />

                    <span className="absolute top-3.5 left-4 z-[2] flex items-center gap-2 font-body text-[0.5625rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">
                      <b className="font-bold text-ivory tabular-nums">{pad(item.id)}</b>
                      <i className="h-px w-5 bg-ivory/40" />
                      Wedding Central
                    </span>

                    <span className="absolute right-4 bottom-3 left-4 z-[2] font-serif-display text-xl leading-[1.15] font-medium text-ivory drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
                      {item.name}
                    </span>

                    {isActive && !playing && (
                      <span className="absolute inset-0 z-[2] flex items-center justify-center">
                        <span className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-black/45 px-6 py-3.5 font-body text-sm font-semibold text-ivory shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-colors">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[1.125rem] w-[1.125rem]">
                            <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.14-6.86a.5.5 0 0 0 0-.86L8.76 4.71a.5.5 0 0 0-.76.43Z" />
                          </svg>
                          Play Playlist
                        </span>
                      </span>
                    )}
                  </button>

                  {isActive && playing && (
                    <div className="absolute inset-0 z-[3] overflow-hidden rounded-2xl bg-maroon">
                      <iframe
                        ref={frameRef}
                        className="block h-full w-full border-0"
                        src={`https://www.youtube.com/embed/videoseries?list=${item.youtubePlaylistId}&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                        title={`${item.name} playlist`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />

                      {/* Always reachable while a set is up, whatever the
                          player is doing. */}
                      <a
                        href={playlistUrl(item)}
                        target="_blank"
                        rel="noopener"
                        className="absolute right-2.5 bottom-2.5 z-[5] rounded-full bg-black/60 px-3 py-1.5 font-body text-[0.625rem] font-semibold tracking-[0.08em] text-ivory uppercase backdrop-blur-sm transition-colors hover:bg-black/85"
                      >
                        Open on YouTube
                      </a>

                      {/* Shown only when the embedded player never answers. */}
                      {blocked && (
                        <div className="wc-sleeve absolute inset-0 z-[6] flex flex-col items-center justify-center gap-3.5 p-5 text-center">
                          <p className="font-body text-[0.8125rem] text-ivory/80">
                            The YouTube player did not load here.
                          </p>

                          <a
                            href={playlistUrl(item)}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center rounded-full bg-sage px-5 py-2.5 font-body text-[0.8125rem] font-bold text-maroon shadow-[0_8px_22px_-8px_rgba(0,0,0,0.7)] transition-transform hover:scale-105"
                          >
                            Open the {item.name} playlist
                          </a>

                          <button
                            type="button"
                            onClick={() => setBlocked(false)}
                            className="cursor-pointer border-0 bg-transparent font-body text-[0.6875rem] tracking-[0.1em] text-ivory/50 uppercase hover:text-ivory"
                          >
                            Hide
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------- right: the deck */}
        <section className="flex flex-col items-center gap-7">
          <div className="relative aspect-square w-full max-w-[17rem] [container-type:inline-size] sm:max-w-[22rem] lg:max-w-[26rem]">
            {/* Warm pool of light under the record, so the black disc has
                something to sit on rather than floating on the damask. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[12%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(178, 190, 133, 0.22), rgba(163, 26, 87, 0) 62%)",
              }}
            />

            <div
              ref={recordRef}
              role="slider"
              tabIndex={0}
              aria-label="Playlist selector. Turn the record, or use the arrow keys, to load another function."
              aria-valuemin={1}
              aria-valuemax={N}
              aria-valuenow={activeIndex + 1}
              aria-valuetext={active.name}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onRecordKeyDown}
              // touch-pan-y claims the turn while leaving vertical scrolling to
              // the page.
              className="absolute inset-0 z-[1] cursor-grab touch-pan-y rounded-full select-none active:cursor-grabbing"
              style={{ transform: "rotate(var(--rot, 0deg))" }}
            >
              {/*
                vinyl.png is a 1080x1920 portrait with the disc centred in
                transparent padding. `cover` inside a square crops the padding
                away; `contain` would shrink the disc to the image's width and
                leave it floating.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/vinyl.png"
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full rounded-full object-cover drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/*
              The centre label. A sibling of the disc rather than a child, so it
              holds still and stays readable while the record turns underneath -
              the record always says which playlist is loaded.
            */}
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 z-[2] flex aspect-square w-[35cqw] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[0.35cqw] rounded-full p-[4cqw] text-center text-maroon shadow-[inset_0_0_0_1px_rgba(74,15,40,0.18),0_2px_10px_rgba(0,0,0,0.35)]"
              style={{
                background:
                  "radial-gradient(circle at 38% 32%, #fffaf0, #f0e4c6 68%, #d9cba6)",
              }}
            >
              <span className="font-body text-[2.4cqw] font-bold tracking-[0.2em] tabular-nums opacity-65">
                {counter}
              </span>
              <span className="font-serif-display text-[4.4cqw] leading-[1.12] font-semibold text-balance">
                {active.name}
              </span>
              <span className="font-body text-[1.9cqw] font-semibold tracking-[0.22em] uppercase opacity-55">
                Wedding Central
              </span>
            </div>

            {/*
              Seen from above, a deck's arm runs down the right-hand side of the
              platter: pivot high and just outside the disc, stylus down on the
              lead-in groove. It rests 13 degrees out from that and swings in
              when a set starts.
            */}
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[4] overflow-visible"
            >
              <defs>
                <linearGradient id="wc-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#efe9dc" />
                  <stop offset="45%" stopColor="#b6ae9c" />
                  <stop offset="100%" stopColor="#7d7566" />
                </linearGradient>
              </defs>

              <g
                style={{
                  transformBox: "view-box",
                  transformOrigin: "90px 12px",
                  transform: playing ? "rotate(0deg)" : "rotate(-13deg)",
                  transition: "transform 1.1s cubic-bezier(0.62, 0.02, 0.26, 1)",
                }}
              >
                {/* counterweight, behind the pivot */}
                <rect x="86.2" y="1" width="7" height="5" rx="1.5" fill="#3a3630" />
                {/* arm tube */}
                <line x1="90" y1="12" x2="91.9" y2="57.4" stroke="url(#wc-metal)" strokeWidth="2.1" strokeLinecap="round" />
                {/* headshell, in line with the tube */}
                <rect x="89.2" y="53.4" width="5.4" height="8" rx="1.2" fill="#2b2622" />
                {/* pivot housing */}
                <circle cx="90" cy="12" r="4.4" fill="url(#wc-metal)" />
                <circle cx="90" cy="12" r="1.7" fill="#3a3630" />
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => driveTo(-1)}
              aria-label="Previous function"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 text-ivory transition-all duration-200 hover:scale-105 hover:bg-white/15 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[1.125rem] w-[1.125rem]">
                <path d="M3.5 12a8.5 8.5 0 1 1 2.9 6.4" />
                <path d="M3 7.5V12h4.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => driveTo(1)}
              aria-label="Next function"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 text-ivory transition-all duration-200 hover:scale-105 hover:bg-white/15 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[1.125rem] w-[1.125rem]">
                <path d="M20.5 12a8.5 8.5 0 1 0-2.9 6.4" />
                <path d="M21 7.5V12h-4.5" />
              </svg>
            </button>
          </div>

          <p className="max-w-sm text-center font-body text-[0.8125rem] leading-relaxed font-light text-ivory/50">
            Grab the record and roll it. Clockwise moves the week forward,
            anticlockwise winds it back &mdash; let go and it keeps turning.
          </p>
        </section>
      </div>
    </>
  );
}
