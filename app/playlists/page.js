import PlaylistDeck from "@/components/PlaylistDeck";
import { OG_IMAGE } from "@/lib/seo";

export const metadata = {
  title: "Playlists",
  description:
    "Ten wedding playlists, one for every function of the week, from the engagement through to the bidaai. Turn the record to load the next one.",
  openGraph: {
    title: "Playlists | Wedding Central",
    description:
      "A set for every function of the week, from the engagement through to the bidaai.",
    images: [OG_IMAGE],
  },
};

export default function PlaylistsPage() {
  return (
    /* The fixed damask painted by body::before in globals.css shows through:
       the page adds no background of its own. */
    <main className="w-full py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/70 uppercase">
            Wedding Central
          </p>

          <h1 className="mt-4 font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
            Playlists
          </h1>

          <p className="mt-5 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
            Ten sets, one for every function of the week &mdash; from the
            engagement through to the bidaai. Turn the record to load the next
            one; a full revolution is the whole wedding.
          </p>
        </header>

        <PlaylistDeck />
      </div>
    </main>
  );
}
