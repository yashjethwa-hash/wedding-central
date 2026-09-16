"use client";

import Link from "next/link";
import { useId, useState } from "react";

const LINKS = [
  { label: "Plan a Wedding", href: "/blogs" },
  { label: "Visit a wedding", href: "/blogs" },
  { label: "Venues", href: "/blogs" },
  { label: "Playlists", href: "/blogs" },
  { label: "About", href: "/blogs" },
];

/** Minimal stroked chevron. Sized in em so it tracks the link's own type size. */
function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-[0.9em] w-[0.9em] shrink-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function FooterSection() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // The browser has already enforced type="email" and required by this point.
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer
      /*
        Dark glass: the panel grounds the foot of the page while the damask
        still reads through it. The top border catches the light and keeps the
        panel from looking like it simply fades out.
      */
      className="relative w-full border-t border-white/15 bg-black/45 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-5xl gap-14 px-6 py-16 md:grid-cols-2 md:gap-12 md:px-8 md:py-20">
        {/* Newsletter */}
        <section aria-labelledby={`${emailId}-heading`}>
          <h2
            id={`${emailId}-heading`}
            className="font-serif-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Get Latest Blog Updates
          </h2>

          <p className="mt-3 max-w-[38ch] font-body text-sm font-light leading-relaxed text-ivory-dim">
            New rituals, regional guides and planning tools, straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={emailId}
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                disabled={subscribed}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-white/25 bg-white/10 px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/45 transition duration-200 hover:border-white/40 focus:border-ivory/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(254,245,220,0.16)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              />

              <button
                type="submit"
                disabled={subscribed}
                className="shrink-0 rounded-lg bg-ivory px-6 py-3 font-body text-sm font-semibold text-maroon transition duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-default disabled:bg-ivory/80"
              >
                {subscribed ? "Subscribed!" : "Submit"}
              </button>
            </div>

            {/*
              A live region that is present from the start, so assistive tech
              announces the confirmation instead of missing a node that only
              appears after the fact.
            */}
            <p
              role="status"
              aria-live="polite"
              className="mt-4 min-h-[1.25rem] font-body text-sm text-ivory"
            >
              {subscribed ? "Thank you. You are on the list." : ""}
            </p>
          </form>
        </section>

        {/* Site map */}
        <nav aria-label="Site map" className="md:justify-self-end">
          <h2 className="font-serif-display text-2xl font-medium text-ivory sm:text-3xl">
            Explore
          </h2>

          <ul className="mt-6 flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-2.5 rounded py-2 font-body text-base text-ivory-dim transition-colors duration-200 hover:text-ivory focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory md:text-lg"
                >
                  {/* Both label and chevron ride the same transform, so they
                      travel together rather than the gap stretching. */}
                  <span className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                    {link.label}
                  </span>
                  <span className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                    <ChevronRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-5xl px-6 py-6 font-body text-xs font-light text-ivory-dim md:px-8">
          Wedding Central. Decoding how India celebrates love.
        </p>
      </div>
    </footer>
  );
}
