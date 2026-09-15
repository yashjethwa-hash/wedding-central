# Static assets

All five assets are present and wired up.

| File              | Size      | Used by                            | Purpose                                      |
| ----------------- | --------- | ---------------------------------- | -------------------------------------------- |
| `bg-pattern.jpg`  | 1080×1920 | `app/globals.css` (`body::before`) | Fixed, full-bleed damask background           |
| `dd.png`          | 792×448   | `components/Preloader.tsx`         | Monogram — large in phase 1, small in phase 2 |
| `we.png`          | 530×246   | `components/Preloader.tsx`         | Phase 2 — slides in from the left             |
| `ing.png`         | 586×252   | `components/Preloader.tsx`         | Phase 2 — slides in from the right            |
| `central.png`     | 822×140   | `components/Preloader.tsx`         | Phase 2 — slides up from the bottom           |

## How the wordmarks were prepared

The originals in `design-source/` are cream lettering on an **opaque white**
ground, each centred in a 1414×2000 canvas — roughly 83% of the height is empty.
Used as-is they render as white rectangles over the damask, with the words too
small and far apart to read as one word.

Each was therefore cropped to its glyphs and the white ground keyed out to
alpha. The lettering is the only thing on the canvas with chroma (`r - b`), so
chroma serves as the matte: it isolates the cream, discards the neutral grey
drop shadow, and falls off smoothly across antialiased edges. The sampled
cream is `#fef5dc`, which is also the `--ivory` token in `globals.css`.

**If you re-export, repeat that step** — or export straight to PNG with a
transparent background, cropped to the glyphs, which is simpler.

The baked drop shadow was dropped deliberately: it was a grey glow designed for
a white ground and reads as haze over magenta. If the lettering needs more
separation, add `filter: drop-shadow(0 2px 12px rgba(0,0,0,.35))` to the images
in `Preloader.tsx` rather than baking it back into the artwork.

## Background

`bg-pattern.jpg` is drawn with `background-size: cover`, which fills any
viewport seamlessly but enlarges the damask on wide screens. To keep the motifs
at a fixed size instead, see the commented alternative in `app/globals.css`; it
needs a seamlessly tiling export or the tile edges show.

A deep magenta (`--magenta`) is painted underneath, so the page comes up the
right colour instead of flashing white while the image loads. At 1.8 MB this is
the heaviest asset on the page — worth re-exporting at around 70% JPEG quality,
or as WebP, if first paint matters.

## Typefaces

The preloader words are artwork, so no font is needed to render them. For the
rest of the site `app/layout.tsx` loads the closest free matches —
**Playfair Display** for headings and **Montserrat** for body text — exposed as
`--font-display-stack` and `--font-sans-stack`. If the original design file
names the real typefaces, swap them in `layout.tsx`; nothing else changes.
