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
      "Wedding Attendees: 50M+" rather than a bare number.
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
   * Whether the counters may run. Defaults to true, so the figures tick up on
   * mount. The homepage passes `false` while the preloader is still on screen,
   * otherwise the count would finish behind it and the reveal would land on
   * three static numbers.
   */
  startCounting?: boolean;
};

/**
 * The three figures under the masthead.
 *
 * The masthead itself is BrandHeader, in the root layout: it sits on every
 * page, so it cannot belong to the homepage's hero.
 */
export default function HeroMetrics({ startCounting = true }: HeroMetricsProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_OVER], [1, FADED_OPACITY]);

  return (
    /*
      No background of its own, so the fixed damask painted by `body::before`
      shows through. Stacks on mobile, sits in a row from `md`.
    */
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
  );
}
