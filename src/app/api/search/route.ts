import { searchContent } from "@/modules/content/connected";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
  if (!query) return Response.json([]);

  const results = searchContent(query).slice(0, 10);
  return Response.json(results, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
