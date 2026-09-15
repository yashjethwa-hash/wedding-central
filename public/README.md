# Static assets

Drop the following files into this directory. They are referenced by path from
the app and are not checked in:

| File               | Used by                            | Purpose                                      |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| `bg-pattern.jpg`   | `app/globals.css` (`body::before`) | Fixed, full-bleed page background             |
| `dd.png`           | `components/Preloader.tsx`         | Monogram — large in phase 1, small in phase 2 |
| `we.png`           | `components/Preloader.tsx`         | Phase 2 — slides in from the left             |
| `ing.png`          | `components/Preloader.tsx`         | Phase 2 — slides in from the right            |
| `central.png`      | `components/Preloader.tsx`         | Phase 2 — slides up from the bottom           |

Until they are added the layout falls back to the `#f6efe6` background colour
and the preloader images render as broken images.

## Trim the lockup artwork

`we.png`, `dd.png`, `ing.png` and `central.png` are laid out edge to edge in a
flex row, so **each PNG should be cropped tight to its glyphs**. Exported with
generous transparent margins (for example a word centred on a tall portrait
canvas) the visible letters end up as small, widely spaced specks and
"WEDDING" will not read as one word. The widths set in `Preloader.tsx` assume
trimmed artwork; adjust them there if your crops differ.
