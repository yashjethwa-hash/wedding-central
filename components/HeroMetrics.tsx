import type { ReactNode } from "react";

type Metric = {
  /** The figure itself, set large. */
  value: string;
  /** What the figure counts, set small beneath it. */
  label: string;
};

const METRICS: Metric[] = [
  { value: "30,000", label: "Indian's Get Married every year" },
  { value: "6M+", label: "Wedding Attendees" },
  { value: "12K+", label: "Struggle with Wedding decision making" },
];

export type HeroMetricsProps = {
  /**
   * Logo shown in the header band.
   *
   * Defaults to the monogram, which is the only logo currently in `public/`.
   * Pass `/edited-image.png` once that file is added — note it needs to be dark
   * enough to read against the light green band.
   */
  logoSrc?: string;
  /** Alternative text for the logo. */
  logoAlt?: string;
  children?: ReactNode;
};

export default function HeroMetrics({
  logoSrc = "/dd.png",
  logoAlt = "Wedding Central",
}: HeroMetricsProps) {
  return (
    <section className="w-full">
      {/* Header band — solid light green, logo centred. */}
      <div className="w-full bg-sage px-6 py-7 md:py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={logoAlt}
          className="mx-auto block h-14 w-auto md:h-20"
        />
      </div>

      {/*
        Metrics — no background of its own, so the fixed damask painted by
        `body::before` shows through. Stacks on mobile, sits in a row from `md`.
      */}
      <div className="flex min-h-[60vh] w-full items-center justify-center px-6 py-16 md:py-24">
        <dl className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 md:flex-row md:items-start md:gap-8">
          {METRICS.map((metric) => (
            <div
              key={metric.value}
              /*
                `flex-col-reverse` puts the figure above its label on screen
                while the DOM keeps label-then-value order, so a screen reader
                reads "Wedding Attendees: 6M+" rather than a bare number.
              */
              className="flex flex-1 flex-col-reverse items-center gap-3 text-center"
            >
              <dt className="max-w-[24ch] font-body text-sm font-light leading-relaxed text-ivory-dim md:text-base">
                {metric.label}
              </dt>
              <dd className="m-0 font-serif-display text-5xl font-medium leading-none tracking-tight text-ivory md:text-6xl lg:text-7xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
