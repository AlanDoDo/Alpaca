import { searchArticles } from "@/modules/content";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
  if (!query) return Response.json([]);

  const results = searchArticles(query).slice(0, 10);
  return Response.json(results, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
