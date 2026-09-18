"use client";

import { useEffect, useState } from "react";
import { NAVBAR_HEIGHT } from "./navigation";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";

type Metric = {
  /** The figure the counter ticks up to. */
  target: number;
  /** Rendered immediately after the counter, outside the animated span. */
  suffix?: string;
  /** What the figure counts, set small beneath it. */
  label: string;
};

const METRICS: Metric[] = [
  { target: 10, suffix: "M+", label: "Indians Get Married every year" },
  { target: 50, suffix: "M+", label: "Wedding Attendees" },
  { target: 12, suffix: "K+", label: "Struggle with Wedding decision making" },
];

/** How long every counter takes to reach its target. */
const COUNT_DURATION = 2;

/** Scroll distance, in pixels, over which the metrics fade back. */
const FADE_OVER = 420;
const FADED_OPACITY = 0.2;

/** WE and ING, sized off the monogram's height the way the preloader sizes them. */
const WORDMARK_BASE =
  "font-serif-display text-[2.8rem] font-medium leading-none md:text-[4rem]";

/** Over the pale textured artwork, where cream would be illegible. */
const WORDMARK_DARK = `${WORDMARK_BASE} text-maroon`;

const WORDMARK =
  "font-serif-display text-[2.8rem] font-medium leading-none text-ivory md:text-[4rem]";

/* -------------------------------------------------------------------------- */
/* The wave                                                                    */
/* -------------------------------------------------------------------------- */

const WAVE_WIDTH = 1000;
const WAVE_BOX_HEIGHT = 100;

/**
 * The header's wavy bottom edge, traced from the reference artwork in
 * `design-source/wavy-header-reference.png`.
 *
 * Not a repeating wave: one lazy S that dips to a trough at 17% of the width
 * and rises to a crest at 75%, which is the shape in the artwork. Drawn with
 * `preserveAspectRatio="none"`, so the single curve stretches to whatever width
 * it is given - it spans any desktop width without a seam, and elongates to fit
 * rather than breaking on a phone.
 */
const WAVE_PATH =
  "M0.0,58.5 C14.0,63.8 56.2,83.5 84.0,90.4 C111.8,97.3 139.5,98.7 167.0,100.0 " +
  "C194.5,101.3 221.3,100.3 249.0,98.4 C276.7,96.5 305.2,92.8 333.0,88.8 " +
  "C360.8,84.8 388.2,80.9 416.0,74.5 C443.8,68.1 472.0,58.6 500.0,50.6 " +
  "C528.0,42.6 556.2,33.1 584.0,26.7 C611.8,20.3 639.5,15.8 667.0,12.4 " +
  "C694.5,9.0 721.3,6.3 749.0,6.0 C776.7,5.7 805.2,7.4 833.0,10.8 " +
  "C860.8,14.2 888.2,18.8 916.0,26.7 C943.8,34.6 986.0,53.2 1000.0,58.5 V0 H0 Z";

/**
 * The header's wavy bottom edge as a clip path, in objectBoundingBox units so
 * it follows whatever size the header ends up.
 *
 * This is the same traced curve the sage band used, converted from its 1000 by
 * 100 viewBox. It exists because the artwork cannot carry the wave itself: the
 * header runs from about 1.7 to 1 on a phone to 8 to 1 on a wide monitor, and
 * no single image aspect survives that range. Stretching one to fit squashed
 * the texture by over three times on a desktop. Clipping instead lets the
 * texture scale uniformly and crop, while the wave stays a curve that is drawn,
 * not stretched.
 *
 * It is referenced through an SVG clipPath with clipPathUnits set to
 * objectBoundingBox, not through the CSS path() function: path() reads its
 * coordinates as pixels, so these 0 to 1 values clipped the header down to a
 * single pixel and the texture vanished entirely.
 */
const WAVE_CLIP =
  "M0,0.8589C0.014,0.8769 0.0562,0.9439 0.084,0.9674C0.1118,0.9908 0.1395,0.9956 0.167,1C0.1945,1.0044 0.2213,1.001 0.249,0.9946C0.2767,0.9881 0.3052,0.9755 0.333,0.9619C0.3608,0.9483 0.3882,0.9351 0.416,0.9133C0.4438,0.8915 0.472,0.8592 0.5,0.832C0.528,0.8048 0.5562,0.7725 0.584,0.7508C0.6118,0.729 0.6395,0.7137 0.667,0.7022C0.6945,0.6906 0.7213,0.6814 0.749,0.6804C0.7767,0.6794 0.8052,0.6852 0.833,0.6967C0.8608,0.7083 0.8882,0.7239 0.916,0.7508C0.9438,0.7776 0.986,0.8409 1,0.8589V0H0Z";

/* -------------------------------------------------------------------------- */

function MetricFigure({ metric, start }: { metric: Metric; start: boolean }) {
  const count = useMotionValue(0);

  const text = useTransform(count, (latest) => String(Math.round(latest)));

  useEffect(() => {
    if (!start) return;
    const controls = animate(count, metric.target, {
      duration: COUNT_DURATION,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [start, metric.target, count]);

  return (
    /*
      `flex-col-reverse` puts the figure above its label on screen while the DOM
      keeps label-then-value order, so a screen reader reads
      "Wedding Attendees: 6M+" rather than a bare number.
    */
    <div className="flex flex-1 flex-col-reverse items-center gap-3 text-center">
      <dt className="max-w-[24ch] font-body text-sm font-light leading-relaxed text-ivory-dim md:text-base">
        {metric.label}
      </dt>
      <dd className="m-0 font-serif-display text-5xl font-medium leading-none tracking-tight text-ivory tabular-nums md:text-6xl lg:text-7xl">
        <motion.span>{text}</motion.span>
        {metric.suffix}
      </dd>
    </div>
  );
}

export type HeroMetricsProps = {
  /**
   * Logo shown in the header band.
   *
   * Defaults to the monogram, which is the only logo currently in `public/`.
   * Pass `/edited-image.png` once that file is added - note it needs to be dark
   * enough to read against the sage band.
   */
  logoSrc?: string;
  /** Alternative text for the logo. */
  logoAlt?: string;
  /**
   * The wavy header artwork.
   *
   * When this file loads, it is drawn full width as the whole header and the
   * navbar sits over it. When it is missing, the sage band with the live-text
   * lockup below is used instead. The image is preloaded rather than rendered
   * optimistically, so a missing file never flashes a broken image across the
   * top of the page.
   */
  bandImageSrc?: string;
  /**
   * Whether the counters may run. Defaults to true, so the figures tick up on
   * mount. The homepage passes `false` while the preloader is still on screen,
   * otherwise the count would finish behind it and the reveal would land on
   * three static numbers.
   */
  startCounting?: boolean;
};

export default function HeroMetrics({
  logoSrc = "/dd.png",
  logoAlt = "Wedding Central",
  bandImageSrc = "/edited-image.png",
  startCounting = true,
}: HeroMetricsProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_OVER], [1, FADED_OPACITY]);
  const [hasBandImage, setHasBandImage] = useState(false);

  // Preloaded rather than rendered and swapped on error: the header is full
  // width, so a broken image flashing across it would be very visible.
  useEffect(() => {
    if (!bandImageSrc) return;
    const probe = new window.Image();
    let live = true;
    probe.onload = () => {
      if (live) setHasBandImage(true);
    };
    probe.src = bandImageSrc;
    return () => {
      live = false;
    };
  }, [bandImageSrc]);

  return (
    /*
      Pulled up by the height of the fixed navbar, which the root layout has
      reserved room for. The bar is meant to sit over the wavy header and read
      as part of it, rather than floating on a strip of background above it.
    */
    <section className="w-full" style={{ marginTop: `calc(${NAVBAR_HEIGHT} * -1)` }}>
      {hasBandImage ? (
        /*
          The artwork is the ground, not the whole header: it carries the
          texture and the wavy edge but no lettering, so the lockup is drawn
          over it. The image runs flush to the top with the navbar on it, which
          is what stops a strip of damask appearing above the header.
        */
        <div className="relative h-56 w-full sm:h-64 md:h-80">
          {/*
            Clipped to the wave rather than relying on the artwork's own, and
            scaled with cover so the texture keeps its proportions at every
            width. Anchored to the top, which is the flat part of the artwork:
            the wave printed into the lower third of the file is cropped away
            and replaced by the clip.
          */}
          {/* The clip path itself. Zero sized, so it takes no layout. */}
          <svg width="0" height="0" aria-hidden="true" className="absolute">
            <defs>
              <clipPath id="wc-wave" clipPathUnits="objectBoundingBox">
                <path d={WAVE_CLIP} />
              </clipPath>
            </defs>
          </svg>

          <div
            className="absolute inset-0"
            style={{ clipPath: "url(#wc-wave)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bandImageSrc}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </div>

          {/*
            Maroon, not cream. The texture is a pale green, where cream sits at
            about 1.8 to 1 and is barely there. The monogram is a cream PNG, so
            it is recoloured by using it as a mask over a maroon fill rather
            than by filtering it.

            Biased above centre because the wave occupies the lower part of the
            artwork, and hidden from assistive tech, or it would be read out as
            three separate words.
          */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ paddingTop: NAVBAR_HEIGHT, paddingBottom: "34%" }}
            aria-hidden="true"
          >
            <div className="flex items-center justify-center">
              <span className={`${WORDMARK_DARK} -mr-[0.04em]`}>WE</span>

              <span
                className="block h-14 w-[6.2rem] bg-maroon md:h-20 md:w-[8.8rem]"
                style={{
                  maskImage: `url(${logoSrc})`,
                  WebkitMaskImage: `url(${logoSrc})`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />

              <span className={`${WORDMARK_DARK} -ml-[0.04em]`}>ING</span>
            </div>

            <span className="mt-1 font-body text-[0.6rem] font-light tracking-[0.42em] text-maroon indent-[0.42em] md:mt-1.5 md:text-[0.8rem]">
              CENTRAL
            </span>
          </div>

          <span className="sr-only">{logoAlt}</span>
        </div>
      ) : (
        <>
      {/* Header band - solid sage, wordmark centred. Top padding carries the
          navbar's height, so the lockup sits below the bar rather than under it. */}
      <div
        className="w-full bg-sage px-6 pb-3 md:pb-5"
        style={{ paddingTop: `calc(${NAVBAR_HEIGHT} + 1.75rem)` }}
      >
        {/*
          The same lockup the preloader assembles: WE and ING either side of the
          monogram, CENTRAL set beneath it. The preloader has to position the
          words absolutely so the monogram stays pinned while they fly in; here
          nothing moves, so a plain flex row does the job. The negative margins
          close up the monogram's own transparent edge.

          Hidden from assistive tech and named once by the label below, or it
          would be read out as three separate words.
        */}
        <div className="flex flex-col items-center" aria-hidden="true">
          <div className="flex items-center justify-center">
            <span className={`${WORDMARK} -mr-[0.04em]`}>WE</span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" className="block h-14 w-auto md:h-20" />

            <span className={`${WORDMARK} -ml-[0.04em]`}>ING</span>
          </div>

          <span className="mt-1 font-body text-[0.6rem] font-light tracking-[0.42em] text-ivory indent-[0.42em] md:mt-1.5 md:text-[0.8rem]">
            CENTRAL
          </span>
        </div>

        <span className="sr-only">{logoAlt}</span>
      </div>

      {/* The band's wavy bottom edge. `-mt-px` closes the hairline that
          subpixel rounding can otherwise open between the two. */}
      <div className="-mt-px w-full text-sage">
        <svg
          className="block h-10 w-full md:h-20"
          viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_BOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d={WAVE_PATH} fill="currentColor" />
        </svg>
      </div>
        </>
      )}

      {/*
        Metrics - no background of its own, so the fixed damask painted by
        `body::before` shows through. Stacks on mobile, sits in a row from `md`.
      */}
      <div className="flex min-h-[55vh] w-full items-center justify-center px-6 py-16 md:py-24">
        <motion.dl
          style={{ opacity }}
          className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 md:flex-row md:items-start md:gap-8"
        >
          {METRICS.map((metric) => (
            <MetricFigure
              key={metric.label}
              metric={metric}
              start={startCounting}
            />
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
