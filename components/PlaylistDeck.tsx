"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./PlaylistDeck.module.css";

type Playlist = {
  /** The function this set is for, as it appears on the sleeve and the label. */
  name: string;
  /** The YouTube list id, without the `list=` prefix. */
  youtubePlaylistId: string;
  /**
   * The sleeve's two colours, following the week's own palette: turmeric for
   * the haldi, henna green for the mehendi, marigold for the varmala.
   */
  tint: [string, string];
  /**
   * Optional artwork laid over the drawn sleeve.
   *
   * A path to an image file, or a YouTube thumbnail once the video ids are to
   * hand. A playlist id on its own cannot produce one: YouTube serves cover
   * images per video, so the frame has to come from a video in the list.
   * Anything that fails to load falls back to the drawn sleeve.
   */
  cover?: string;
};

/** The functions in the order the week runs, ending at the bidaai. */
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
];

const N = PLAYLISTS.length;

/**
 * Degrees of turn that load the next function. With ten functions at 36
 * degrees, one complete revolution of the record is the whole week.
 */
const STEP_DEG = 36;
/** Coasting after the hand lets go, in degrees per millisecond. */
const MAX_FLICK = 0.9;
/** Velocity e-folds over this many milliseconds. */
const FRICTION_MS = 240;
const STOP_DEG_MS = 0.004;
/** Idle turn while a set plays - a slow 10rpm, not a real 33. */
const PLAY_SPIN = 0.06;
/** How long the embedded player has to answer before we offer the link. */
const HANDSHAKE_MS = 4500;

/** How each tile sits, by its signed distance from the active one. */
const LAYOUT: Record<string, { y: string; s: number; o: number; b: number; z: number; state: string }> = {
  "0": { y: "0%", s: 1, o: 1, b: 0, z: 6, state: "active" },
  "1": { y: "102%", s: 0.74, o: 0.72, b: 0.8, z: 4, state: "near" },
  "-1": { y: "-102%", s: 0.74, o: 0.72, b: 0.8, z: 4, state: "near" },
  "2": { y: "188%", s: 0.56, o: 0, b: 2, z: 2, state: "far" },
  "-2": { y: "-188%", s: 0.56, o: 0, b: 2, z: 2, state: "far" },
};

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function playlistUrl(item: Playlist) {
  return `https://www.youtube.com/playlist?list=${item.youtubePlaylistId}`;
}

/** Keeps a step across the -180/180 seam from reading as a 350 degree jump. */
function shortest(delta: number) {
  let d = delta;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

export default function PlaylistDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const recordRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const railButtons = useRef<(HTMLButtonElement | null)[]>([]);

  /* Turn state lives in refs: it is written every animation frame, and putting
     it in state would re-render the whole stage sixty times a second. */
  const rotation = useRef(0);
  const carry = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const samples = useRef<{ a: number; t: number }[]>([]);
  const playingRef = useRef(false);
  /* Set on the first step, so the rail does not scroll itself on first paint. */
  const stepped = useRef(false);

  const active = PLAYLISTS[activeIndex];
  const counter = `${pad(activeIndex + 1)} / ${pad(N)}`;

  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  /* Tearing the iframe out is what actually stops the sound. */
  const stop = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    setBlocked(false);
    setWaiting(false);
  }, []);

  /*
    step: +1 for the next function, -1 for the one before. The index wraps both
    ways, so the record never hits an end, and every change drops the player
    back to its cover - otherwise the set just rolled past would carry on
    playing under the new one.
  */
  const goTo = useCallback(
    (step: number) => {
      stepped.current = true;
      setActiveIndex((i) => ((i + step) % N + N) % N);
      stop();
    },
    [stop],
  );

  /* Turn the disc as well, for the steps the hand did not turn itself. */
  const driveTo = useCallback(
    (step: number) => {
      rotation.current += step * STEP_DEG;
      goTo(step);
    },
    [goTo],
  );

  const jumpTo = useCallback(
    (index: number) => {
      setActiveIndex((current) => {
        if (index === current) return current;
        const forward = ((index - current) % N + N) % N;
        const steps = forward <= N - forward ? forward : forward - N;
        rotation.current += steps * STEP_DEG;
        stepped.current = true;
        return index;
      });
      stop();
    },
    [stop],
  );

  /*
    Turn the disc by `deg`. Input turns bank toward the next step; the idle spin
    while a set plays does not, or the record would walk the week on its own.
  */
  const turn = useCallback(
    (deg: number, isInput: boolean) => {
      rotation.current += deg;
      if (!isInput) return;

      carry.current += deg;
      while (carry.current >= STEP_DEG) {
        carry.current -= STEP_DEG;
        goTo(1);
      }
      while (carry.current <= -STEP_DEG) {
        carry.current += STEP_DEG;
        goTo(-1);
      }
    },
    [goTo],
  );

  /* ------------------------------------------------------------- the frame */
  useEffect(() => {
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;

      if (!dragging.current && Math.abs(velocity.current) > STOP_DEG_MS) {
        turn(velocity.current * dt, true);
        velocity.current *= Math.exp(-dt / FRICTION_MS);
      } else if (!dragging.current) {
        velocity.current = 0;
      }

      /* The idle turn only runs while a set is playing, and never fights a hand
         that is on the record. */
      if (playingRef.current && !dragging.current && !reduceMotion) {
        turn(PLAY_SPIN * dt, false);
      }

      recordRef.current?.style.setProperty("--rot", `${rotation.current.toFixed(2)}deg`);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [turn, reduceMotion]);

  /* ---------------------------------------------------------- the rolling */
  const angleAt = (event: { clientX: number; clientY: number }) => {
    const node = recordRef.current;
    if (!node) return 0;
    const box = node.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    return (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    velocity.current = 0;
    /*
      Each grab starts from zero. Carrying the leftover turn across gestures
      makes the record unpredictable - the same small roll would step once or
      not at all depending on where the last one stopped.
    */
    carry.current = 0;
    lastAngle.current = angleAt(event);
    samples.current = [{ a: lastAngle.current, t: event.timeStamp }];
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    const angle = angleAt(event);
    const delta = shortest(angle - lastAngle.current);
    lastAngle.current = angle;

    turn(delta, true);

    samples.current.push({ a: angle, t: event.timeStamp });
    if (samples.current.length > 6) samples.current.shift();
  };

  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    /* Velocity over the last few samples, so the throw carries on. */
    if (samples.current.length > 1) {
      const first = samples.current[0];
      const last = samples.current[samples.current.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        const v = shortest(last.a - first.a) / dt;
        velocity.current = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
      }
    }

    samples.current = [];
  };

  /*
    A trackpad or wheel over the record turns it too. Bound by hand rather than
    through onWheel: React attaches its wheel listener passively, and a passive
    listener cannot preventDefault, so the page would scroll away underneath.
  */
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

  /* ---------------------------------------------------------- the rail scroll */
  useEffect(() => {
    if (!stepped.current) return;
    railButtons.current[activeIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, reduceMotion]);

  /* ---------------------------------------------------------------- player */
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
      if (frameRef.current && event.source === frameRef.current.contentWindow) {
        answered = true;
      }
    };

    window.addEventListener("message", onMessage);
    const watchdog = window.setTimeout(() => {
      if (!answered) setBlocked(true);
    }, HANDSHAKE_MS);

    return () => {
      window.clearTimeout(watchdog);
      window.removeEventListener("message", onMessage);
    };
  }, [playing]);

  const play = useCallback(() => {
    playingRef.current = true;
    setBlocked(false);
    setWaiting(true);
    setPlaying(true);
  }, []);

  const onFrameLoad = () => {
    setWaiting(false);
    try {
      frameRef.current?.contentWindow?.postMessage(
        '{"event":"listening","id":1,"channel":"widget"}',
        "https://www.youtube.com",
      );
    } catch {
      /* blocked frames refuse the handshake; the watchdog copes */
    }
  };

  /* Shortest signed distance from the active tile, so the reel wraps. */
  const offsetOf = (i: number) => {
    const d = ((i - activeIndex) % N + N) % N;
    return d > N / 2 ? d - N : d;
  };

  return (
    <div className={`${styles.wrap} ${playing ? styles.isPlaying : ""}`}>
      {/* The index of the whole week, directly under the page header. */}
      <section className={styles.order} aria-label="The week, in order">
        <span className={styles.eyebrow}>The week, in order</span>

        <div className={styles.railScroll}>
          <div className={styles.rail} ref={railRef}>
            {PLAYLISTS.map((item, i) => (
              <button
                key={item.name}
                type="button"
                ref={(node) => {
                  railButtons.current[i] = node;
                }}
                aria-current={i === activeIndex ? "true" : undefined}
                onClick={() => jumpTo(i)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.split}>
        {/* ----------------------------------------- left: the cover reel */}
        <section aria-live="polite">
          <div className={styles.now}>
            <p className={styles.position}>{counter}</p>

            <span className={styles.playingFlag}>
              <span className={styles.bars} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Now playing
            </span>
          </div>

          <div className={styles.nameSlot}>
            {/* Keyed on the index, so React remounts it and the entry animation
                replays on every step. */}
            <h2
              key={activeIndex}
              className={`${styles.name} font-serif-display font-medium text-ivory`}
            >
              {active.name}
            </h2>
          </div>

          <div className={styles.reel}>
            {PLAYLISTS.map((item, i) => {
              const offset = offsetOf(i);
              const spec = LAYOUT[String(offset)] ?? {
                y: offset > 0 ? "210%" : "-210%",
                s: 0.5,
                o: 0,
                b: 3,
                z: 1,
                state: "far",
              };
              const isActive = offset === 0;

              return (
                <div
                  key={item.name}
                  className={styles.tile}
                  data-state={spec.state}
                  style={
                    {
                      "--y": spec.y,
                      "--s": spec.s,
                      "--o": spec.o,
                      "--b": `${spec.b}px`,
                      "--z": spec.z,
                      "--c1": item.tint[0],
                      "--c2": item.tint[1],
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className={styles.tileFace}
                    tabIndex={spec.state === "far" ? -1 : 0}
                    aria-label={
                      isActive
                        ? `Play the ${item.name} playlist`
                        : `Load the ${item.name} playlist`
                    }
                    onClick={() => (isActive ? play() : jumpTo(i))}
                  >
                    <span className={styles.sleeve} />

                    {item.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className={styles.coverArt}
                        src={item.cover}
                        alt=""
                        loading="lazy"
                      />
                    ) : null}

                    <span className={styles.sleeveScrim} />

                    <span className={styles.sleeveTop}>
                      <b>{pad(i + 1)}</b>
                      <i />
                      Wedding Central
                    </span>

                    <span className={`${styles.sleeveName} font-serif-display`}>
                      {item.name}
                    </span>

                    <span className={styles.play}>
                      <span>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.14-6.86a.5.5 0 0 0 0-.86L8.76 4.71a.5.5 0 0 0-.76.43Z" />
                        </svg>
                        Play Playlist
                      </span>
                    </span>
                  </button>

                  {isActive && playing ? (
                    <div
                      className={`${styles.tilePlayer} ${waiting ? styles.waiting : ""}`}
                    >
                      <iframe
                        ref={frameRef}
                        src={`https://www.youtube.com/embed/videoseries?list=${item.youtubePlaylistId}&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                        title={`${item.name} playlist`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        onLoad={onFrameLoad}
                      />

                      {/* Always reachable while a set is up, whatever the player
                          is doing. */}
                      <a
                        className={styles.playerOut}
                        href={playlistUrl(item)}
                        target="_blank"
                        rel="noopener"
                      >
                        Open on YouTube
                      </a>

                      {blocked ? (
                        <div className={styles.playerBlocked}>
                          <p>The YouTube player did not load here.</p>

                          <a
                            className={styles.blockedOpen}
                            href={playlistUrl(item)}
                            target="_blank"
                            rel="noopener"
                          >
                            Open the {item.name} playlist
                          </a>

                          <button
                            type="button"
                            className={styles.blockedHide}
                            onClick={() => setBlocked(false)}
                          >
                            Hide
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------- right: the deck */}
        <section className={styles.deckWrap}>
          <div className={styles.deck}>
            <div
              className={styles.record}
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
              onPointerUp={release}
              onPointerCancel={release}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  driveTo(1);
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  driveTo(-1);
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vinyl.png" alt="" />
            </div>

            <div key={activeIndex} className={styles.label}>
              <span className={styles.labelNum}>{counter}</span>
              <span className={`${styles.labelName} font-serif-display`}>
                {active.name}
              </span>
              <span className={styles.labelFoot}>Wedding Central</span>
            </div>

            <svg className={styles.tonearm} viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="wc-tonearm-metal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#efe9dc" />
                  <stop offset="45%" stopColor="#b6ae9c" />
                  <stop offset="100%" stopColor="#7d7566" />
                </linearGradient>
              </defs>

              <g className={styles.armG}>
                {/*
                  Seen from above, a deck's arm runs down the right-hand side of
                  the platter: pivot high and just outside the disc, stylus down
                  on the lead-in groove at about four o'clock. It rests 13
                  degrees out from that and swings in when a set starts.
                */}
                {/* counterweight, behind the pivot */}
                <rect x="86.2" y="1" width="7" height="5" rx="1.5" fill="#3a3630" />
                {/* arm tube */}
                <line
                  x1="90"
                  y1="12"
                  x2="91.9"
                  y2="57.4"
                  stroke="url(#wc-tonearm-metal)"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
                {/* headshell, in line with the tube */}
                <rect x="89.2" y="53.4" width="5.4" height="8" rx="1.2" fill="#2b2622" />
                {/* pivot housing */}
                <circle cx="90" cy="12" r="4.4" fill="url(#wc-tonearm-metal)" />
                <circle cx="90" cy="12" r="1.7" fill="#3a3630" />
              </g>
            </svg>
          </div>

          <div className={styles.transport}>
            <button
              className={styles.step}
              type="button"
              aria-label="Previous function"
              onClick={() => driveTo(-1)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3.5 12a8.5 8.5 0 1 1 2.9 6.4" />
                <path d="M3 7.5V12h4.5" />
              </svg>
            </button>

            <button
              className={styles.step}
              type="button"
              aria-label="Next function"
              onClick={() => driveTo(1)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.5 12a8.5 8.5 0 1 0-2.9 6.4" />
                <path d="M21 7.5V12h-4.5" />
              </svg>
            </button>
          </div>

          <p className={styles.hint}>
            Grab the record and roll it. Clockwise moves the week forward,
            anticlockwise winds it back, let go and it keeps turning.
          </p>
        </section>
      </div>
    </div>
  );
}
