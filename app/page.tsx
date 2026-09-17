import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Plan & Discover Weddings Across India",
  description:
    "Destination weddings, Mumbai markets, rituals and real planning numbers. Wedding Central decodes how India celebrates love, for everyone planning a shaadi or attending one.",
  openGraph: {
    title: "Wedding Central - Plan & Discover Weddings Across India",
    description:
      "Destination weddings, Mumbai markets, rituals and real planning numbers, in one place.",
    images: [OG_IMAGE],
  },
};

/*
  A server component so it can export metadata. Everything interactive, which
  is to say the preloader handover and every section under it, lives in
  HomeContent, which is the client half.
*/
export default function Home() {
  return <HomeContent />;
}
