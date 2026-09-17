"use client";

import { useId, useState } from "react";

/**
 * Newsletter signup, lifted out of the old FooterSection so the new Footer can
 * stay a server component and this stays the only client boundary it needs.
 *
 * TODO: there is no backend. Submitting only updates the UI, and no address is
 * stored anywhere. Wire this to a provider before launch.
 */
export default function NewsletterSignup() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // The browser has already enforced type="email" and required by this point.
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <section aria-labelledby={`${emailId}-heading`}>
      <h2
        id={`${emailId}-heading`}
        className="font-serif-display text-xl font-medium text-ivory sm:text-2xl"
      >
        Get Latest Blog Updates
      </h2>

      <p className="mt-2 max-w-[38ch] font-body text-sm font-light leading-relaxed text-ivory-dim">
        New rituals, regional guides and planning tools, straight to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
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
            className="w-full rounded-lg border border-white/25 bg-white/10 px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/45 transition duration-200 hover:border-white/40 focus:border-ivory/70 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(254,245,220,0.16)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-sm sm:flex-1"
          />

          <button
            type="submit"
            disabled={subscribed}
            className="shrink-0 rounded-lg bg-ivory px-6 py-3 font-body text-sm font-semibold text-maroon transition duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-default disabled:bg-ivory/80"
          >
            {subscribed ? "Subscribed!" : "Submit"}
          </button>
        </div>

        {/* Present from first render, so assistive tech announces the
            confirmation instead of missing a node that appears after the fact. */}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 min-h-[1.25rem] font-body text-sm text-ivory"
        >
          {subscribed ? "Thank you. You are on the list." : ""}
        </p>
      </form>
    </section>
  );
}
