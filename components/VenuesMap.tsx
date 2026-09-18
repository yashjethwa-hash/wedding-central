"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* The map                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The map is artwork, not a traced path: `public/india-map.png`, exported from
 * the design file. It already carries state boundaries and the Andaman and
 * Nicobar chain, and its background is transparent, so it sits over the damask
 * without a panel behind it.
 *
 * Pin percentages are fitted to THIS artwork, not to a generic projection of
 * India. The fit was solved by measuring the drawing's own mainland bounding
 * box and matching it to India's extent, then checked against fourteen cities
 * and three extreme points: it lands within about one percent of the width.
 * Replacing the artwork means refitting, or every pin moves.
 */
const MAP_SRC = "/india-map.png";

/** Intrinsic size of that file, which sets the aspect ratio of the pin layer. */
const MAP_SIZE = { width: 1045, height: 1188 };

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

export type Place = {
  name: string;
  description: string;
  /** Percentage down the map, taken from the projection above. */
  top: number;
  /** Percentage across the map, taken from the projection above. */
  left: number;
  /** URL-encoded, ready to drop into a Google Maps search. */
  mapQuery: string;
};

const destinations: Place[] = [
  {
    name: "Udaipur",
    description:
      "Famous for stunning lakes and royal palace hotels like Taj Lake Palace",
    top: 41.57,
    left: 19.53,
    mapQuery: "Udaipur",
  },
  {
    name: "Jaipur",
    description:
      "Offers majestic forts, havelis, and vibrant Pink City culture",
    top: 33.26,
    left: 26.5,
    mapQuery: "Jaipur",
  },
  {
    name: "Goa",
    description:
      "Known for relaxed beachside ceremonies and tropical party vibes",
    top: 72.71,
    left: 19.93,
    mapQuery: "Goa",
  },
  {
    name: "Jodhpur",
    description:
      "Features the dramatic cliffside views of Mehrangarh Fort",
    top: 35.66,
    left: 17.22,
    mapQuery: "Jodhpur",
  },
  {
    name: "Jaisalmer",
    description:
      "Ideal for royal desert weddings amid dunes and golden forts",
    top: 33.26,
    left: 10.11,
    mapQuery: "Jaisalmer",
  },
  {
    name: "Kerala",
    description:
      "Perfect for serene backwater and coconut-fringed houseboat celebrations",
    top: 91.03,
    left: 28.11,
    mapQuery: "Kerala",
  },
  {
    name: "Rishikesh",
    description:
      "Great for spiritual riverside vows along the holy Ganges",
    top: 21.62,
    left: 34.82,
    mapQuery: "Rishikesh",
  },
  {
    name: "Mussoorie",
    description:
      "A scenic hill station in the Himalayas with cool weather",
    top: 20.25,
    left: 34.15,
    mapQuery: "Mussoorie",
  },
  {
    name: "Shimla",
    description:
      "Offers pine-covered slopes and colonial-era charm",
    top: 17.85,
    left: 31.13,
    mapQuery: "Shimla",
  },
  {
    // Snapped onto the islands as the artwork draws them: the chain sits a
    // little off where the mainland fit predicts, so the projected position
    // left this pin in open sea.
    name: "Andaman and Nicobar Islands",
    description:
      "Secluded white-sand beaches with turquoise water",
    top: 86.53,
    left: 88.28,
    mapQuery: "Andaman%20Nicobar%20Islands",
  },
  {
    name: "Agra",
    description:
      "Romantic settings with views of the historic Taj Mahal",
    top: 32.28,
    left: 33.94,
    mapQuery: "Agra",
  },
  {
    name: "Jim Corbett",
    description:
      "Surrounded by lush green forests and peaceful riverside lawns",
    top: 23.7,
    left: 37.1,
    mapQuery: "Jim%20Corbett",
  },
  {
    name: "Bikaner",
    description:
      "A royal heritage city with medieval palaces and forts",
    top: 29.24,
    left: 18.19,
    mapQuery: "Bikaner",
  },
  {
    name: "Udupi and Mangalore",
    description:
      "Coastal temple towns with scenic, quiet beaches",
    top: 81.39,
    left: 23.32,
    mapQuery: "Udupi%20Mangalore",
  },
  {
    name: "Lavasa",
    description:
      "A planned Italian-style hill city near Pune with lakeside promenades",
    top: 62.9,
    left: 18.86,
    mapQuery: "Lavasa",
  },
  {
    name: "Mahabalipuram",
    description:
      "Historical coastal town in Tamil Nadu known for shore temples and beach resorts",
    top: 82.22,
    left: 41.25,
    mapQuery: "Mahabalipuram",
  },
  {
    name: "Alwar",
    description:
      "Features heritage properties and proximity to the Sariska Tiger Reserve",
    top: 30.94,
    left: 29.32,
    mapQuery: "Alwar",
  },
  {
    name: "Kasauli",
    description:
      "A quiet, intimate hill station in Himachal Pradesh with colonial charm",
    top: 18.6,
    left: 30.42,
    mapQuery: "Kasauli",
  },
  {
    name: "Pondicherry",
    description:
      "Offers French colonial architecture and relaxed coastal backdrops",
    top: 84.49,
    left: 40.05,
    mapQuery: "Pondicherry",
  },
  {
    name: "Khajuraho",
    description:
      "A unique cultural hub featuring ancient, intricately carved temples",
    top: 40.61,
    left: 40.35,
    mapQuery: "Khajuraho",
  },
];

/**
 * Markets in the same city are a few kilometres apart, which at this scale puts
 * them inside a fraction of one percent of each other. The Delhi and Mumbai
 * entries are fanned out on a circle of radius 3 percent, starting due east so
 * a pair splits sideways rather than stacking, and corrected for the artwork's
 * aspect ratio. Measured against the 20 by 28 pixel marker, a 2 percent radius
 * still leaves a three-pin cluster overlapping. Those clusters are deliberately
 * not to scale.
 */
const markets: Place[] = [
  {
    name: "Delhi Chawri Bazaar",
    description:
      "The absolute capital for wedding invitation cards and stationery",
    top: 26.93,
    left: 34.3,
    mapQuery: "Delhi%20Chawri%20Bazaar",
  },
  {
    name: "Delhi Chandni Chowk",
    description:
      "Bridal lehengas, sarees, sherwanis, suits, wedding accessories, jewellery",
    top: 26.9,
    left: 28.33,
    mapQuery: "Delhi%20Chandni%20Chowk",
  },
  {
    name: "Mumbai Mangaldas Market",
    description:
      "Wholesale fabrics, silk, dress materials, lining, lace",
    top: 61.06,
    left: 19.58,
    mapQuery: "Mumbai%20Mangaldas%20Market",
  },
  {
    name: "Mumbai Crawford Market",
    description:
      "Flowers, gifting, decor, household and wedding supplies",
    top: 63.36,
    left: 15.09,
    mapQuery: "Mumbai%20Crawford%20Market",
  },
  {
    name: "Jaipur Johari Bazaar",
    description:
      "Kundan, polki, meenakari, gemstones, bridal jewellery",
    top: 33.22,
    left: 26.6,
    mapQuery: "Jaipur%20Johari%20Bazaar",
  },
  {
    name: "Surat New Textile Market",
    description:
      "Sarees, dress materials, fabrics, lehenga materials",
    top: 53.4,
    left: 16.58,
    mapQuery: "Surat%20New%20Textile%20Market",
  },
  {
    name: "Varanasi Chowk and Thatheri Bazaar",
    description:
      "Banarasi silk, brocade, bridal sarees",
    top: 38.95,
    left: 50.71,
    mapQuery: "Varanasi%20Chowk%20Thatheri%20Bazaar",
  },
  {
    name: "Hyderabad Charminar",
    description:
      "Pearls, bangles, traditional jewellery, wedding shopping",
    top: 66.44,
    left: 35.49,
    mapQuery: "Hyderabad%20Charminar",
  },
  {
    name: "Lucknow Chowk",
    description:
      "Chikankari, zardozi, shararas, ghararas",
    top: 33.47,
    left: 43.63,
    mapQuery: "Lucknow%20Chowk",
  },
  {
    name: "Ahmedabad Dhalgarwad",
    description:
      "Bandhani, Gujarati textiles, sarees",
    top: 47.05,
    left: 15.74,
    mapQuery: "Ahmedabad%20Dhalgarwad",
  },
  {
    name: "Kolkata Gariahat",
    description:
      "Bengali sarees, Tant, Garad, Baluchari, weddingwear",
    top: 48.79,
    left: 68.68,
    mapQuery: "Kolkata%20Gariahat",
  },
  {
    name: "Jodhpur Mochi Bazaar",
    description:
      "Juttis and traditional footwear",
    top: 35.48,
    left: 17.22,
    mapQuery: "Jodhpur%20Mochi%20Bazaar",
  },
  {
    name: "Mathura and Vrindavan",
    description:
      "Religious wedding items, puja accessories",
    top: 31.12,
    left: 32.8,
    mapQuery: "Mathura%20Vrindavan",
  },
  {
    name: "Moradabad Brass Market",
    description:
      "Wedding decor, gifting, brass and metalware",
    top: 26.24,
    left: 36.53,
    mapQuery: "Moradabad%20Brass%20Market",
  },
  {
    name: "Mumbai Lamington Road",
    description:
      "Lighting and electronics for wedding decor and events",
    top: 58.74,
    left: 15.05,
    mapQuery: "Mumbai%20Lamington%20Road",
  },
  {
    name: "Bengaluru Avenue Road",
    description:
      "Wedding stationery, printing, textiles, accessories",
    top: 81.06,
    left: 32.5,
    mapQuery: "Bengaluru%20Avenue%20Road",
  },
  {
    name: "Panipat Textile Markets",
    description:
      "Home textiles, bedsheets, blankets, wedding trousseau",
    top: 24.21,
    left: 30.46,
    mapQuery: "Panipat%20Textile%20Markets",
  },
  {
    name: "Firozabad Glass Market",
    description:
      "Glassware, decorative pieces, bangles",
    top: 32.39,
    left: 35.25,
    mapQuery: "Firozabad%20Glass%20Market",
  },
];

const TABS = [
  { id: "destinations", label: "Destinations", places: destinations },
  { id: "markets", label: "Markets", places: markets },
] as const;

type TabId = (typeof TABS)[number]["id"];

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=";

/* -------------------------------------------------------------------------- */

/** A teardrop marker whose tip, not its centre, sits on the coordinate. */
function PinGlyph({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 34"
      aria-hidden="true"
      className={`h-7 w-5 drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] transition-transform duration-200 ${
        active ? "scale-115" : ""
      }`}
    >
      <path
        d="M12 33.5C12 33.5 23 20.5 23 12A11 11 0 1 0 1 12c0 8.5 11 21.5 11 21.5Z"
        fill="var(--color-ivory)"
        stroke="rgba(74,15,40,0.55)"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="4.2" fill={active ? "#4a0f28" : "#a31a57"} />
    </svg>
  );
}

export default function VenuesMap() {
  const [tab, setTab] = useState<TabId>("destinations");
  const [openPin, setOpenPin] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const active = TABS.find((entry) => entry.id === tab) ?? TABS[0];

  function switchTab(next: TabId) {
    setTab(next);
    // A tooltip left open would otherwise point at a pin from the old set.
    setOpenPin(null);
  }

  return (
    <section className="w-full" aria-labelledby="venues-heading">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2
              id="venues-heading"
              className="font-serif-display text-3xl font-medium text-ivory sm:text-4xl"
            >
              Where India gets married
            </h2>
            <p className="mt-4 font-body text-base font-light leading-relaxed text-ivory/85">
              The places couples travel to, and the markets they shop in before
              they go. Tap a pin for the detail.
            </p>
          </div>

          {/* Pill toggle, as a tablist so it works from the keyboard. */}
          <div
            role="tablist"
            aria-label="Map view"
            className="flex shrink-0 rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-md"
          >
            {TABS.map((entry) => {
              const selected = entry.id === tab;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => switchTab(entry.id)}
                  className="relative rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                >
                  {/* One shared thumb slides between the two. */}
                  {selected && (
                    <motion.span
                      layoutId="venues-toggle-thumb"
                      className="absolute inset-0 rounded-full bg-ivory"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  )}
                  <span
                    className={`relative z-10 ${selected ? "text-maroon" : "text-ivory/80"}`}
                  >
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clicking the backdrop dismisses an open tooltip on touch, where
            there is no pointer to move away. */}
        <div
          className="relative mx-auto mt-12 w-full max-w-[24rem] sm:max-w-[30rem] lg:max-w-[36rem]"
          onClick={() => setOpenPin(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MAP_SRC}
            alt="Map of India"
            width={MAP_SIZE.width}
            height={MAP_SIZE.height}
            className="block h-auto w-full"
          />

          {/* Pins ride above the map in their own percentage-positioned layer,
              so they never distort with the viewBox. */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} className="absolute inset-0">
                {active.places.map((place, index) => {
                  const isOpen = openPin === place.name;
                  // Flip the card to the left of the pin near the right edge,
                  // or it would run off the map.
                  const flip = place.left > 62;

                  return (
                    <div
                      key={place.name}
                      className="absolute"
                      style={{
                        left: `${place.left}%`,
                        top: `${place.top}%`,
                        zIndex: isOpen ? 30 : 10,
                        /*
                          The offset belongs on this wrapper, not on the button
                          inside it. A transform does not move the layout box,
                          so offsetting the button left the wrapper sitting at
                          the coordinate while the pin drew up and to the left,
                          and neighbouring wrappers then swallowed each other's
                          hover and click targets.
                        */
                        transform: "translate(-50%, -100%)",
                      }}
                      /*
                        Hover lives on the wrapper, not the pin, for two
                        reasons. The tooltip is inside it, so reaching for the
                        Google Maps button does not count as leaving. And the
                        guard on pointerType keeps touch out: a tap fires
                        pointerenter before click, so without it the enter
                        opened the card and the click immediately toggled it
                        shut again.
                      */
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setOpenPin(place.name);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType !== "mouse") return;
                        setOpenPin((current) =>
                          current === place.name ? null : current,
                        );
                      }}
                    >
                      <motion.button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={place.name}
                        /*
                          No onFocus here on purpose. A tap focuses the button
                          before it clicks it, so opening on focus left the
                          click seeing isOpen as true and toggling straight
                          back shut: the card never appeared on touch. Enter
                          and Space already fire click, so the keyboard is
                          covered by this handler alone.
                        */
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenPin(isOpen ? null : place.name);
                        }}
                        className="block cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: -28, scale: 0.6 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.2, delay: index * 0.01 }
                            : {
                                type: "spring",
                                stiffness: 520,
                                damping: 24,
                                delay: index * 0.035,
                              }
                        }
                      >
                        <PinGlyph active={isOpen} />
                      </motion.button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={
                              reduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 0.92, y: 6 }
                            }
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={
                              reduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 0.92, y: 6 }
                            }
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            onClick={(event) => event.stopPropagation()}
                            className={`absolute bottom-2 w-56 rounded-xl border border-white/25 bg-[#2c0917]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:w-64 ${
                              flip ? "right-3" : "left-3"
                            }`}
                          >
                            <p className="font-serif-display text-base font-semibold text-ivory">
                              {place.name}
                            </p>

                            <p className="mt-2 font-body text-xs leading-relaxed text-ivory/80">
                              {place.description}
                            </p>

                            <a
                              href={`${MAPS_URL}${place.mapQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ivory px-3 py-2 font-body text-xs font-semibold text-maroon transition duration-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                            >
                              View on Google Maps
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                                className="h-[0.9em] w-[0.9em]"
                              >
                                <path d="M7 17 17 7M9 7h8v8" />
                              </svg>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center font-body text-xs leading-relaxed text-ivory/55">
          Pin positions are projected from real coordinates. Markets in the same
          city are fanned out so each one can be reached, so those clusters are
          not to scale.
        </p>
      </div>
    </section>
  );
}
