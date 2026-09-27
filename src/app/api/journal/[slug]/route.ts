import { getArticleBySlug } from "@/modules/content";
import { renderKnowledgeLinks } from "@/modules/content/connected";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return Response.json({ error: "文章不存在。" }, { status: 404 });
  return Response.json({ content: renderKnowledgeLinks(article.content) }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
