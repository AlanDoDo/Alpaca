import { permanentRedirect } from "next/navigation";
const legacyTopics: Record<string, string> = { mechanics: "mechanics", electronics: "electronics", control: "control", perception: "perception", systems: "systems", embodied: "learning" };
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  permanentRedirect(legacyTopics[category] ? `/forum?topic=${legacyTopics[category]}` : "/blog?category=%E7%BC%96%E7%A8%8B");
}
