import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug } from "@/modules/content";
export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getArticleBySlug(slug)) notFound();
  permanentRedirect(`/article/${slug}`);
}
