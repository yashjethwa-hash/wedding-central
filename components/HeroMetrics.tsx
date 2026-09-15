"use client";

import { useEffect } from "react";
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
  /** Thousands separators only make sense on the large figure. */
  grouped?: boolean;
};

const METRICS: Metric[] = [
  { target: 30000, label: "Indian's Get Married every year", grouped: true },
  { target: 6, suffix: "M+", label: "Wedding Attendees" },
  { target: 12, suffix: "K+", label: "Struggle with Wedding decision making" },
];

/** How long every counter takes to reach its target. */
const COUNT_DURATION = 2;

/** Scroll distance, in pixels, over which the metrics fade back. */
const FADE_OVER = 420;
const FADED_OPACITY = 0.2;

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

/* -------------------------------------------------------------------------- */

function MetricFigure({ metric, start }: { metric: Metric; start: boolean }) {
  const count = useMotionValue(0);

  // An explicit locale - relying on the runtime's default would risk the server
  // and the client formatting the same number differently and breaking hydration.
  const text = useTransform(count, (latest) => {
    const n = Math.round(latest);
    return metric.grouped ? n.toLocaleString("en-US") : String(n);
  });

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
  startCounting = true,
}: HeroMetricsProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_OVER], [1, FADED_OPACITY]);

  return (
    <section className="w-full">
      {/* Header band - solid sage, logo centred. */}
      <div className="w-full bg-sage px-6 pt-7 pb-2 md:pt-10 md:pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={logoAlt}
          className="mx-auto block h-14 w-auto md:h-20"
        />
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
