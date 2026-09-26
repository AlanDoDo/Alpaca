import { getAllArticles } from "@/modules/content";

export const dynamic = "force-dynamic";

export function GET() {
  const articles = getAllArticles();
  const categories = [...new Set(articles.map((article) => article.category))];
  const randomArticle = articles.length ? articles[Math.floor(Math.random() * articles.length)] : undefined;

  return Response.json({
    categories,
    randomSlug: randomArticle?.slug ?? null,
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
