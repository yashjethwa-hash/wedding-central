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
 * Kept separate from the drawer so /blogs stays reachable: the drawer does not
 * list it. /contact is deliberately in neither, so the only way in is a direct
 * link - put it back in one of these two lists if the page should be findable.
 */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Venues", href: "/venues" },
  { label: "Blogs", href: "/blogs" },
  { label: "Playlists", href: "/playlists" },
];

/** Height of the fixed bar. The layout reserves this much room above content. */
export const NAVBAR_HEIGHT = "4rem";
