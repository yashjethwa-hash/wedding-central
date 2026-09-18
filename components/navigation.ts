/**
 * Shared navigation constants.
 *
 * These live outside Navbar.tsx on purpose. Navbar is a "use client" module,
 * and when a server component imports from one, Next swaps the module for a
 * client reference proxy: the components still render, but plain exports like
 * an array or a string come back as proxies rather than their values. Footer
 * and the root layout are both server components, so reading these from here
 * keeps them real.
 */

/** Links in the navbar's side drawer. */
export const DRAWER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Planning a Wedding", href: "/planning" },
  { label: "Visiting a Wedding", href: "/visiting" },
  { label: "Venues", href: "/venues" },
  { label: "Playlists", href: "/playlists" },
];

/**
 * Footer quick links.
 *
 * Kept separate from the drawer so /blogs and /contact stay reachable: the
 * drawer no longer lists either of them.
 */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

/** Height of the fixed bar. The layout reserves this much room above content. */
export const NAVBAR_HEIGHT = "4rem";
