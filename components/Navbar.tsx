"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAV_LINKS, NAVBAR_HEIGHT } from "./navigation";


export type NavbarProps = {
  /**
   * Optional logo image. Falls back to the wordmark below when absent, so a
   * real file can be dropped in later without touching anything else.
   */
  logoSrc?: string;
  logoAlt?: string;
  /** Wordmark used when no logo image is supplied. */
  brand?: string;
};

function isActive(pathname: string, href: string) {
  // /blogs stays lit while reading an article underneath it.
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar({
  logoSrc,
  logoAlt = "Wedding Central",
  brand = "WEDDING CENTRAL",
}: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Navigating with the panel open would otherwise leave it hanging there.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes it, which the hamburger alone does not give you.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    /*
      Fixed and translucent so the damask reads through it. The tint is a dark
      maroon rather than nothing at all: the bar passes over the sage header
      band, and cream on sage is far too low contrast to read.
    */
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#4a0f28]/55 backdrop-blur-lg"
      style={{ height: NAVBAR_HEIGHT }}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8"
      >
        <Link
          href="/"
          className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
        >
          {logoSrc ? (
            <Image src={logoSrc} alt={logoAlt} height={32} width={160} className="h-8 w-auto" />
          ) : (
            <span className="font-body text-sm font-semibold tracking-[0.2em] text-ivory sm:text-base">
              {brand}
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <ul className="hidden list-none items-center gap-1 p-0 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded px-4 py-2 font-body text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory ${
                    active ? "text-ivory" : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  {link.label}
                  {/* One shared underline slides between links rather than
                      fading in and out on each. */}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-ivory"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-ivory transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory md:hidden"
        >
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
        </button>
      </nav>

      {/* Mobile panel, sliding down from under the bar. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 top-full border-b border-white/10 bg-[#4a0f28]/95 backdrop-blur-lg md:hidden"
          >
            <ul className="m-0 flex list-none flex-col p-4">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
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
        )}
      </AnimatePresence>
    </header>
  );
}
