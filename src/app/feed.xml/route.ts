import { getAllArticles, getArticleBySlug } from "@/modules/content";
import { getSiteUrl } from "@/lib/site-url";
export async function GET() {
  const base = getSiteUrl();
  const items = getAllArticles().map((article) => {
    const full = getArticleBySlug(article.slug);
    return `<item><title>${escapeXml(article.title)}</title><link>${base}/article/${article.slug}</link><guid>${base}/article/${article.slug}</guid><pubDate>${new Date(article.date).toUTCString()}</pubDate><description>${escapeXml(article.description)}</description><content:encoded><![CDATA[${(full?.content ?? "").replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>TechAlpaca</title><link>${base}</link><description>AI × Robotics × Finance</description><language>zh-CN</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
function escapeXml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;"); }
