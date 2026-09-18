import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";
import { NAV_LINKS } from "./navigation";

export default function Footer() {

  return (
    /*
      Dark glass: the panel grounds the foot of the page while the damask still
      reads through it. The top border catches the light and keeps the panel
      from looking like it simply fades out.
    */
    <footer className="relative w-full border-t border-white/15 bg-black/45 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr] md:gap-10">
          {/* Brand */}
          <div>
            <p className="font-body text-sm font-semibold tracking-[0.2em] text-ivory">
              WEDDING CENTRAL
            </p>

            <p className="mt-4 max-w-[42ch] font-body text-sm font-light leading-relaxed text-ivory-dim">
              Decoding how India celebrates love, one baraat at a time. Rituals,
              regional traditions, outfits and budgets, for everyone planning a
              shaadi or turning up to one.
            </p>

          </div>

          {/* Quick links, drawn from the same list the navbar uses. */}
          <nav aria-label="Quick links">
            <h2 className="font-serif-display text-xl font-medium text-ivory sm:text-2xl">
              Quick Links
            </h2>

            <ul className="mt-5 flex list-none flex-col gap-1 p-0">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2.5 rounded py-1.5 font-body text-base text-ivory-dim transition-colors duration-200 hover:text-ivory focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
                  >
                    <span className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                      {link.label}
                    </span>
                    <span className="transition-transform duration-200 ease-out group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="h-[0.9em] w-[0.9em] shrink-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <NewsletterSignup />
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-6 font-body text-xs font-light text-ivory-dim md:px-8">
          &copy; 2026 Wedding Central. Decoding how India celebrates love.
        </p>
      </div>
    </footer>
  );
}
