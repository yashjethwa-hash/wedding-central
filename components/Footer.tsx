import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";
import { NAV_LINKS } from "./navigation";

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
};

/** Placeholder targets. Pass real URLs through the socialLinks prop. */
const DEFAULT_SOCIALS: Required<SocialLinks> = {
  instagram: "#",
  facebook: "#",
  pinterest: "#",
};

// TODO: placeholder contact details. Replace both before launch.
const CONTACT = {
  email: "hello@weddingcentral.example",
  phone: "+91 00000 00000",
};

export type FooterProps = {
  socialLinks?: SocialLinks;
};

/** Minimal stroked mark per network, sized in em so it tracks the type. */
const SOCIAL_ICONS = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14.5 8.5h2.5V5h-2.5A4 4 0 0 0 10.5 9v2H8v3.5h2.5V22H14v-7.5h2.6l.4-3.5H14V9a.5.5 0 0 1 .5-.5Z" />,
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5c-2 0-3.5 1.4-3.5 3.1 0 .8.4 1.6 1 2M12 7.5c2 0 3.3 1.2 3.3 3 0 2.2-1.3 3.8-3 3.8-.7 0-1.3-.4-1.5-.9M10.8 13.4 9.5 18.5" />
    </>
  ),
} as const;

const SOCIAL_ORDER: (keyof SocialLinks)[] = ["instagram", "facebook", "pinterest"];

const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
};

export default function Footer({ socialLinks }: FooterProps) {
  const socials = { ...DEFAULT_SOCIALS, ...socialLinks };

  return (
    /*
      Dark glass: the panel grounds the foot of the page while the damask still
      reads through it. The top border catches the light and keeps the panel
      from looking like it simply fades out.
    */
    <footer className="relative w-full border-t border-white/15 bg-black/45 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-10">
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

            <ul className="mt-6 flex list-none items-center gap-3 p-0">
              {SOCIAL_ORDER.map((key) => (
                <li key={key}>
                  <a
                    href={socials[key]}
                    aria-label={SOCIAL_LABELS[key]}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-ivory-dim transition duration-200 hover:border-white/40 hover:bg-white/15 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-[1.15em] w-[1.15em]"
                    >
                      {SOCIAL_ICONS[key]}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
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

          {/* Contact */}
          <div>
            <h2 className="font-serif-display text-xl font-medium text-ivory sm:text-2xl">
              Contact
            </h2>

            <ul className="mt-5 flex list-none flex-col gap-3 p-0 font-body text-base text-ivory-dim">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="rounded transition-colors duration-200 hover:text-ivory focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}
                  className="rounded transition-colors duration-200 hover:text-ivory focus-visible:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
                >
                  {CONTACT.phone}
                </a>
              </li>
            </ul>
          </div>
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
