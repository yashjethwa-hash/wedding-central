import type { Metadata } from "next";
import VenuesMap from "@/components/VenuesMap";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Venues & Markets",
  description:
    "Twenty destination wedding locations across India and eighteen wedding markets, from Chandni Chowk to Johari Bazaar. Pinned on a map, with directions.",
  openGraph: {
    title: "Venues & Markets | Wedding Central",
    description:
      "Destination wedding locations across India and the markets couples shop in before they go.",
    images: [OG_IMAGE],
  },
};

export default function VenuesPage() {
  return (
    <main className="w-full py-16 md:py-24">
      <header className="mx-auto mb-14 max-w-3xl px-6 text-center md:mb-20 md:px-8">
        <p className="font-body text-xs font-semibold tracking-[0.22em] text-ivory/70 uppercase">
          Wedding Central
        </p>

        <h1 className="mt-4 font-serif-display text-4xl leading-tight font-medium text-ivory md:text-5xl">
          Venues &amp; Markets
        </h1>

        <p className="mt-6 font-body text-base leading-relaxed font-light text-ivory/85 sm:text-lg">
          Twenty places couples travel to for the wedding itself, and eighteen
          markets they shop in before they go.
        </p>
      </header>

      <VenuesMap />
    </main>
  );
}
