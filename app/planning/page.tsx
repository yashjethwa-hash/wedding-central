import type { Metadata } from "next";
import CategoryPage from "@/lib/categoryPage";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Planning a Wedding",
  description:
    "Rituals, regional traditions, outfits, vendors and real budgets. Everything Wedding Central knows about planning an Indian wedding.",
  openGraph: {
    title: "Planning a Wedding | Wedding Central",
    description:
      "Rituals, regional traditions, outfits, vendors and real budgets, for planning an Indian wedding.",
    images: [OG_IMAGE],
  },
};

export default function PlanningPage() {
  return (
    <CategoryPage
      title="Planning a Wedding"
      intro="Rituals, regional traditions, outfits, vendors and what things actually cost. The reading for everyone putting a shaadi together."
      category="Planning"
    />
  );
}
