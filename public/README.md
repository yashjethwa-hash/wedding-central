# Static assets

Drop the following files into this directory, spelled exactly as shown
(lowercase, and `.jpg` vs `.png` matters). They are referenced by path from the
app and are not checked in:

| File               | Used by                            | Purpose                                      |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| `bg-pattern.jpg`   | `app/globals.css` (`body::before`) | Fixed, full-bleed damask background           |
| `dd.png`           | `components/Preloader.tsx`         | Monogram — large in phase 1, small in phase 2 |
| `we.png`           | `components/Preloader.tsx`         | Phase 2 — slides in from the left             |
| `ing.png`          | `components/Preloader.tsx`         | Phase 2 — slides in from the right            |
| `central.png`      | `components/Preloader.tsx`         | Phase 2 — slides up from the bottom           |

The four lockup files must have **transparent** backgrounds (PNG, not JPG), or
they will sit on opaque rectangles over the damask.

## Trim the lockup artwork

`we.png`, `dd.png`, `ing.png` and `central.png` are laid out edge to edge in a
flex row, so **each PNG should be cropped tight to its glyphs**. Exported with
generous transparent margins (for example a word centred on a tall portrait
canvas) the visible letters end up as small, widely spaced specks and
"WEDDING" will not read as one word. The row is sized by height in
`Preloader.tsx` (`CAP_HEIGHT`, `MONOGRAM_HEIGHT`); adjust those if your crops
differ.

## Background sizing

`bg-pattern.jpg` is drawn with `background-size: cover`, which fills any
viewport seamlessly but enlarges the damask motifs on wide screens — a portrait
export stretched across a desktop monitor gets noticeably scaled up. To keep the
motifs at a fixed size instead, see the commented alternative in
`app/globals.css`; it needs a seamlessly tiling export or the tile edges show.

A deep magenta (`--magenta`, sampled from the artwork) is painted underneath, so
the page comes up the right colour instead of flashing white while the image
loads.

## Typefaces

The preloader words are artwork, so no font is needed to render them. For the
rest of the site `app/layout.tsx` loads the closest free matches —
**Playfair Display** for headings and **Montserrat** for body text — exposed as
`--font-display-stack` and `--font-sans-stack`. If the original design file
names the real typefaces, swap them in `layout.tsx`; nothing else changes.
