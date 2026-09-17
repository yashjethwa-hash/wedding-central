/**
 * Shared Open Graph bits.
 *
 * A page-level `openGraph` object replaces the parent's rather than merging
 * into it, so a page that sets only a title and description silently drops the
 * inherited image. Every page spreads OG_IMAGE back in to avoid that.
 */

/**
 * TODO: public/og-image.jpg does not exist yet. Export a 1200x630 image from
 * Canva and drop it in before launch, or link previews render with a broken
 * image.
 */
export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Wedding Central",
};
