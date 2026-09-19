import type { Metadata } from "next";
import PlaylistDeck from "@/components/PlaylistDeck";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Playlists",
  description:
    "Ten sets, one for every function of the week, from the engagement through to the bidaai. Turn the record to load the next one.",
  openGraph: {
    title: "Playlists | Wedding Central",
    description:
      "Ten sets, one for every function of the week, from the engagement through to the bidaai.",
    images: [OG_IMAGE],
  },
};

export default function PlaylistsPage() {
  return (
    <main className="w-full px-6 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
          Playlists
        </h1>

        <p className="mt-6 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
          Ten sets, one for every function of the week, from the engagement
          through to the bidaai. Turn the record to load the next one; a full
          revolution is the whole wedding.
        </p>
      </header>

      <div className="mx-auto max-w-6xl">
        <PlaylistDeck />
      </div>
    </main>
  );
}
