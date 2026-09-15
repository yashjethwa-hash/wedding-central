# Static assets

Drop the following files into this directory. They are referenced by path from
the app and are not checked in:

| File                | Used by                          | Purpose                                     |
| ------------------- | -------------------------------- | ------------------------------------------- |
| `bg-pattern.jpg`    | `app/globals.css` (`body::before`) | Fixed, full-bleed page background            |
| `dd.png`            | `components/Preloader.tsx`       | Preloader phase 1 — fades in first           |
| `edited-image.png`  | `components/Preloader.tsx`       | Preloader phase 2 — fades in at 2s           |

Until they are added the layout falls back to the `#f6efe6` background colour
and the preloader images render as broken images.
