import type { Metadata } from "next";
import CategoryPage from "@/lib/categoryPage";
import { OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Planning a Wedding",
  description:
    "Wedding planning tips on rituals, regional traditions, outfits, themes, vendors and real budgets. Everything Wedding Central knows about planning an Indian wedding.",
  keywords: [
    "wedding planning tips",
    "how to plan an Indian wedding",
    "Indian wedding checklist",
    "wedding budget planning India",
  ],
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
      intro="Rituals, regional traditions, outfits, themes, vendors and what things actually cost. The reading for everyone putting a shaadi together."
      category="Planning"
    />
  );
}
