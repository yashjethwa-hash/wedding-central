"use client";

import { useEffect, useState } from "react";
import { useChrome } from "./ChromeGate";
import { NAVBAR_HEIGHT } from "./navigation";

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
 *
 * Only drawn when the textured artwork is missing. Its swing is squashed to 70
 * percent of the trace for the same reason the clip below is, so the two shapes
 * stay the same curve.
 */
const WAVE_PATH =
  "M0.0,42.8 C14.0,46.5 56.2,60.3 84.0,65.1 C111.8,69.9 139.5,70.9 167.0,71.8 " +
  "C194.5,72.7 221.3,72.0 249.0,70.7 C276.7,69.4 305.2,66.8 333.0,64.0 " +
  "C360.8,61.2 388.2,58.4 416.0,53.9 C443.8,49.5 472.0,42.8 500.0,37.2 " +
  "C528.0,31.6 556.2,25.0 584.0,20.5 C611.8,16.0 639.5,12.9 667.0,10.5 " +
  "C694.5,8.1 721.3,6.2 749.0,6.0 C776.7,5.8 805.2,7.0 833.0,9.4 " +
  "C860.8,11.7 888.2,15.0 916.0,20.5 C943.8,26.0 986.0,39.0 1000.0,42.8 V0 H0 Z";

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
 * The swing between crest and trough is 70 percent of the traced original. At
 * full depth the trough on the left ran to the very bottom of the header box,
 * which read as the band hanging too far down that side; holding the crest
 * still and lifting the trough shallows the dip without moving the right-hand
 * side of the curve.
 *
 * It is referenced through an SVG clipPath with clipPathUnits set to
 * objectBoundingBox, not through the CSS path() function: path() reads its
 * coordinates as pixels, so these 0 to 1 values clipped the header down to a
 * single pixel and the texture vanished entirely.
 */
const WAVE_CLIP =
  "M0,0.8051C0.014,0.8176 0.0562,0.8645 0.084,0.881C0.1118,0.8974 0.1395,0.9007 0.167,0.9038C0.1945,0.9069 0.2213,0.9045 0.249,0.9C0.2767,0.8955 0.3052,0.8867 0.333,0.8771C0.3608,0.8676 0.3882,0.8584 0.416,0.8431C0.4438,0.8279 0.472,0.8053 0.5,0.7862C0.528,0.7672 0.5562,0.7446 0.584,0.7294C0.6118,0.7141 0.6395,0.7034 0.667,0.6954C0.6945,0.6872 0.7213,0.6808 0.749,0.6801C0.7767,0.6794 0.8052,0.6835 0.833,0.6915C0.8608,0.6996 0.8882,0.7106 0.916,0.7294C0.9438,0.7481 0.986,0.7924 1,0.8051V0H0Z";

/** WE and ING, sized off the monogram's height the way the preloader sizes them. */
const WORDMARK_BASE =
  "font-serif-display text-[2.8rem] font-medium leading-none md:text-[4rem]";

/** Over the pale textured artwork, where cream would be illegible. */
const WORDMARK_DARK = `${WORDMARK_BASE} text-maroon`;

/** Over the flat sage band of the fallback, where cream is the readable one. */
const WORDMARK_LIGHT = `${WORDMARK_BASE} text-ivory`;

export type BrandHeaderProps = {
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
};

/**
 * The band at the top of every page: the textured artwork, clipped to the wave,
 * with the WEDDING CENTRAL lockup drawn over it.
 *
 * It lives in the root layout rather than in each page so the masthead is one
 * thing in one place, and so no page can drift into a plain text heading where
 * the others carry the artwork.
 */
export default function BrandHeader({
  logoSrc = "/dd.png",
  logoAlt = "Wedding Central",
  bandImageSrc = "/edited-image.png",
}: BrandHeaderProps) {
  const { chromeReady } = useChrome();
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

      Held at zero opacity while the homepage preloader is on screen, so the
      WEDDING lockup plays against nothing but the background and the header is
      not sitting behind it the whole time. Every other route reports ready
      immediately, so there is nothing to wait for.
    */
    <div
      className="w-full transition-opacity duration-700 ease-out"
      style={{
        marginTop: `calc(${NAVBAR_HEIGHT} * -1)`,
        opacity: chromeReady ? 1 : 0,
      }}
    >
      {hasBandImage ? (
        /*
          The artwork is the ground, not the whole header: it carries the
          texture but no lettering, so the lockup is drawn over it. The image
          runs flush to the top with the navbar on it, which is what stops a
          strip of damask appearing above the header.
        */
        <div className="relative h-56 w-full sm:h-64 md:h-80">
          {/* The clip path itself. Zero sized, so it takes no layout. */}
          <svg width="0" height="0" aria-hidden="true" className="absolute">
            <defs>
              <clipPath id="wc-wave" clipPathUnits="objectBoundingBox">
                <path d={WAVE_CLIP} />
              </clipPath>
            </defs>
          </svg>

          {/*
            Clipped to the wave rather than relying on the artwork's own, and
            scaled with cover so the texture keeps its proportions at every
            width. Anchored to the top, which is the flat part of the artwork:
            the wave printed into the lower third of the file is cropped away
            and replaced by the clip.
          */}
          <div className="absolute inset-0" style={{ clipPath: "url(#wc-wave)" }}>
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
            style={{ paddingTop: NAVBAR_HEIGHT, paddingBottom: "27%" }}
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
              The same lockup the preloader assembles: WE and ING either side of
              the monogram, CENTRAL set beneath it. The preloader has to position
              the words absolutely so the monogram stays pinned while they fly in;
              here nothing moves, so a plain flex row does the job. The negative
              margins close up the monogram's own transparent edge.

              Hidden from assistive tech and named once by the label below, or it
              would be read out as three separate words.
            */}
            <div className="flex flex-col items-center" aria-hidden="true">
              <div className="flex items-center justify-center">
                <span className={`${WORDMARK_LIGHT} -mr-[0.04em]`}>WE</span>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="" className="block h-14 w-auto md:h-20" />

                <span className={`${WORDMARK_LIGHT} -ml-[0.04em]`}>ING</span>
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
    </div>
  );
}
