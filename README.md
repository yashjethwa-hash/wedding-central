# Wedding Central

A Next.js site for planning and discovering weddings across India: destination
venues, Mumbai markets, rituals, outfits, budgets, guest etiquette, playlists,
and a blog.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Deployment target:** Vercel (zero-config — see below)
- **Contact form backend:** [Web3Forms](https://web3forms.com) (client-only POST, no server)

There is no database and no custom backend. Blog content lives in a TypeScript
file (`data/blogs.ts`); everything else is static React/JSX.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_WEB3FORMS_KEY
npm run dev
```

Open http://localhost:3000.

Other scripts:

```bash
npm run build   # production build (also type-checks and lints)
npm run start   # serve the production build locally
npm run lint    # next lint
npx tsc --noEmit  # type-check only
```

`npm run build` has been verified to complete cleanly (no TypeScript errors,
no build errors) and statically generates all 21 routes.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Yes, for the contact form to actually deliver mail | Access key for [Web3Forms](https://web3forms.com). Free tier: sign up with the inbox you want messages delivered to, and the key arrives by email. Without it, `/contact` renders but submissions go nowhere. |

Copy `.env.example` to `.env.local` for local development. On Vercel, add the
same variable under **Project Settings → Environment Variables** (all
environments). It's prefixed `NEXT_PUBLIC_` intentionally — the browser posts
directly to Web3Forms with no server in between, which is what lets this
run as a fully static/serverless site. It is not a secret in the sense of
needing to be hidden (it ships in the client bundle), but keep your real key
out of version control regardless — `.env*.local` is already git-ignored.

No other environment variables are read anywhere in the codebase.

## Deploying to Vercel

This is a stock Next.js App Router project, so Vercel needs no special
configuration:

1. Import the GitHub repo at https://vercel.com/new.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `next build` (auto-detected / default).
4. Install command: `npm install` (auto-detected / default).
5. Output: handled automatically by the Next.js Vercel adapter (no static
   export is configured — `next.config.mjs` only sets `reactStrictMode`).
6. Add `NEXT_PUBLIC_WEB3FORMS_KEY` under Environment Variables before the
   first deploy that needs the contact form to work.
7. Deploy.

Every push to the branch connected to Vercel (typically `main`) triggers a
new deployment automatically; other branches get preview deployments.

## Folder structure

```
app/                  Route segments (Next.js App Router)
  layout.tsx          Root layout: fonts, global <head> metadata, Navbar/Footer chrome
  page.tsx            Home page
  globals.css         Tailwind entry point + global styles/CSS variables
  planning/           "Planning a wedding" page
  visiting/           "Visiting a wedding" page
  venues/             Venues page (map + listings)
  playlists/          Playlists page
  blogs/              Blog index (page.tsx) + blogs/[slug] (dynamic post page)
  contact/            Contact page + ContactForm.tsx (client component, Web3Forms POST)

components/           Shared React components used across routes
  Navbar.tsx, Footer.tsx, BrandHeader.tsx   Site chrome
  HomeContent.tsx, HomeCarousels.tsx, HeroMetrics.tsx   Home page sections
  VenuesMap.tsx, InteractiveMap.tsx          Map/venue UI
  PlaylistDeck.tsx (+ .module.css)           Playlist page UI
  PostCard.tsx                               Blog card used on home + /blogs
  NewsletterSignup.tsx                       Footer newsletter form (see Known limitations)
  VinylPlayer.tsx, VinylRecord.tsx, FloatingBubbles.tsx, Preloader.tsx, ChromeGate.tsx
                                              Decorative/UI-state components
  navigation.ts                              Shared nav link constants (kept out of
                                              Navbar.tsx deliberately — see comment in file)

lib/
  seo.ts               Shared Open Graph image metadata, spread into every page's metadata
  categoryPage.tsx      Shared layout for the Planning/Visiting category pages

data/
  blogs.ts             All blog post content and metadata (source of truth for /blogs)

public/                Static assets served as-is (images, /blogs/<slug>.jpg artwork, icon.svg)
design-source/         Original, unprocessed design exports (NOT served by the app —
                        see design-source/README.md). Keep source files here when you
                        redo artwork, so public/ only ever holds processed, web-ready assets.

.env.example           Documents required environment variables (copy to .env.local)
next.config.mjs, tsconfig.json, postcss.config.mjs, package.json  Tooling config
```

### Path alias

`@/*` maps to the project root (see `tsconfig.json`), so imports look like
`import Footer from "@/components/Footer"` regardless of which route file is
importing it.

## Future editing

### Add a blog post

1. Open `data/blogs.ts`.
2. Add a new object to the exported array following the existing shape
   (`slug`, `title`, `category`, `author`, `readTime`, `date`, optional
   `image`, `excerpt`, and body content — the file's own comments document
   each field in detail).
3. If you have artwork, drop `public/blogs/<slug>.jpg` in and set `image` to
   match. Without one, the card renders a placeholder panel instead — no
   crash either way.
4. The post is immediately reachable at `/blogs/<slug>` and appears in the
   `/blogs` index and any home-page carousel that pulls from `data/blogs.ts`.
   No routing code to touch.

### Add images/assets

Put processed, web-ready files directly in `public/` (or a subfolder, like
`public/blogs/`). Reference them in components as `/filename.ext` (root-
relative, no `import`). If you're deriving a web asset from a larger source
file (e.g. keying out a background), keep the original in `design-source/`
and only commit the processed result to `public/`.

### Add a page

Create a new folder under `app/`, e.g. `app/faq/page.tsx`, exporting a
default React component. Next.js's App Router turns the folder path into the
route automatically — no manual route registration. Add it to
`components/navigation.ts` (`DRAWER_LINKS` and/or `NAV_LINKS`) if it should
be reachable from the nav drawer or footer; a page can also be deliberately
link-only (see `/contact`, and the comment in `navigation.ts` explaining why).

### Add a feature/component

Drop a new `.tsx` file in `components/`, mark it `"use client"` only if it
needs interactivity/state/browser APIs — otherwise leave it a server
component for a smaller client bundle. Import with the `@/components/...`
alias from any page or component.

### Working without Claude artifacts

Everything above lives in ordinary files in this repository — there is no
Claude-artifact-only content to migrate. Clone the repo, run `npm install`,
and edit with any editor; `npm run dev` gives you hot reload immediately.

## Known limitations / unfinished before public launch

These are flagged in code comments (`TODO`) at the locations below, and are
left as-is because finishing them requires information/decisions only you
can make (a real domain, a chosen email provider, exported artwork):

- **`app/layout.tsx`** — `SITE_URL` is a placeholder
  (`https://weddingcentral.example`). Open Graph/Twitter card metadata needs
  the real production domain here before social link previews will be
  correct. Update once you know the domain you're deploying to (e.g. your
  Vercel URL or a custom domain).
- **`lib/seo.ts`** — `public/og-image.jpg` referenced by `OG_IMAGE` does not
  exist yet. Export a 1200×630 image (Canva or similar) and add it at that
  path, or link previews on social/chat apps will show a broken image.
- **`components/NewsletterSignup.tsx`** — the footer newsletter form is
  UI-only. Submitting flips the UI to a "subscribed" state, but no email
  address is sent or stored anywhere. Wire it to a real provider (Mailchimp,
  Buttondown, ConvertKit, a Web3Forms endpoint like the contact form, etc.)
  before relying on it to collect subscribers.
- **Contact form** works today, but only if `NEXT_PUBLIC_WEB3FORMS_KEY` is
  set (see Environment variables above) — without it, submissions silently
  go nowhere.

No other TODOs, broken links, or build/type errors were found: `npm run
build` and `npx tsc --noEmit` both complete cleanly, and all 21 routes
(home, planning, visiting, venues, playlists, contact, blog index, and every
individual blog post) statically generate without error.

## Verification performed

- `npm install` — clean install, 0 errors (2 pre-existing moderate/high
  `npm audit` advisories in transitive dependencies; run `npm audit` for
  details if you want to address them).
- `npx tsc --noEmit` — no type errors.
- `npm run build` — compiles, type-checks, lints, and statically generates
  all pages successfully.
