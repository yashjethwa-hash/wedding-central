"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DRAWER_LINKS, NAVBAR_HEIGHT } from "./navigation";

export type NavbarProps = {
  /**
   * Centre logo. Defaults to the brand image.
   *
   * If the file is not in `public/` the image fails to load and the wordmark
   * below takes its place, so a missing asset degrades to text rather than to
   * a broken image icon on every page.
   */
  logoSrc?: string;
  logoAlt?: string;
  /** Wordmark used when the logo image is absent or fails to load. */
  brand?: string;
};

/** Icons are inline SVG rather than a package, so nothing new is installed. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {open ? (
        <>
          <path d="M5 5l14 14" />
          <path d="M19 5L5 19" />
        </>
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

/** Shared by both icon buttons, so they stay identical targets. */
const ICON_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-lg text-ivory drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory";

export default function Navbar({
  logoSrc = "/edited-image.png",
  logoAlt = "Wedding Central",
  brand = "WEDDING CENTRAL",
}: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const reduceMotion = useReducedMotion();

  /*
    onError alone is not enough. The markup is server rendered, so the browser
    can request the logo and fail it before React hydrates and attaches the
    handler, and that error event is then missed entirely. A finished image
    with no intrinsic width is one that failed, so this catches the case the
    handler slept through.
  */
  useEffect(() => {
    const img = logoRef.current;
    if (img?.complete && img.naturalWidth === 0) setLogoBroken(true);
  }, []);

  // Navigating with the drawer open would otherwise leave it hanging there.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes it, and the body stops scrolling behind the overlay.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showLogo = Boolean(logoSrc) && !logoBroken;

  return (
    <>
      {/*
        Transparent, as specified. The icons carry a drop shadow instead of the
        bar carrying a tint, which is what keeps them legible if the bar ever
        passes over a light background.
      */}
      <header
        className="fixed inset-x-0 top-0 z-50 bg-transparent"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8"
        >
          {/* Left: drawer trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label="Open menu"
            className={ICON_BUTTON}
          >
            <MenuIcon open={false} />
          </button>

          {/* Centre: logo, routing home */}
          <Link
            href="/"
            aria-label="Wedding Central, go to the homepage"
            className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
          >
            {showLogo ? (
              /* A plain img, not next/image: this needs an onError fallback,
                 and the file is not guaranteed to be there.
                 eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={logoRef}
                src={logoSrc}
                alt={logoAlt}
                onError={() => setLogoBroken(true)}
                className="block h-8 w-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)] md:h-10"
              />
            ) : (
              <span className="block font-body text-xs font-semibold tracking-[0.2em] text-ivory drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] sm:text-sm md:text-base">
                {brand}
              </span>
            )}
          </Link>

          {/* Right: account */}
          <Link href="/contact" aria-label="Account" className={ICON_BUTTON}>
            <UserIcon />
          </Link>
        </nav>
      </header>

      {/* Side drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.div
              key="drawer"
              id="nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 380, damping: 40 }
              }
              className="fixed inset-y-0 left-0 z-[56] flex w-[min(20rem,85vw)] flex-col border-r border-white/15 bg-[#4a0f28]/95 backdrop-blur-xl"
            >
              <div
                className="flex items-center justify-between px-5"
                style={{ height: NAVBAR_HEIGHT }}
              >
                <span className="font-body text-xs font-semibold tracking-[0.2em] text-ivory/70 uppercase">
                  Menu
                </span>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  autoFocus
                  className={ICON_BUTTON}
                >
                  <MenuIcon open />
                </button>
              </div>

              <ul className="m-0 flex list-none flex-col gap-1 p-4">
                {DRAWER_LINKS.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-4 py-3 font-body text-base transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory ${
                          active
                            ? "bg-white/10 font-semibold text-ivory"
                            : "text-ivory/75 hover:bg-white/5 hover:text-ivory"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
