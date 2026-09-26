import type { MetadataRoute } from "next";
import { getAllArticles } from "@/modules/content";
import { getFinanceNotes } from "@/modules/content/finance";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [{ url: base, changeFrequency: "weekly", priority: 1 }, { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.9 }, { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 }, { url: `${base}/forum`, changeFrequency: "weekly", priority: 0.7 }, { url: `${base}/ai`, changeFrequency: "monthly", priority: 0.5 }, { url: `${base}/finance`, changeFrequency: "weekly", priority: 0.7 }, ...getFinanceNotes().map((note) => ({ url: `${base}/finance/${note.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })), ...getAllArticles().map((article) => ({ url: `${base}/article/${article.slug}`, lastModified: article.date, changeFrequency: "monthly" as const, priority: article.featured ? 0.9 : 0.7 }))];
}
