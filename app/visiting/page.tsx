import type { Metadata } from "next";
import CategoryPage from "@/lib/categoryPage";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Visiting a Wedding",
  description:
    "Guest etiquette, gifting, dress codes and what the ceremony actually means. What to know before you turn up to an Indian wedding.",
  openGraph: {
    title: "Visiting a Wedding | Wedding Central",
    description:
      "Guest etiquette, gifting, dress codes and what the ceremony actually means.",
    images: [OG_IMAGE],
  },
};

export default function VisitingPage() {
  return (
    <CategoryPage
      eyebrow="Wedding Central"
      title="Visiting a Wedding"
      intro="Etiquette, gifting, dress codes and what is actually happening during the ceremony. What to know before you turn up."
      category="Attending"
    />
  );
}
