import type { MetadataRoute } from "next";
import { getAllArticles } from "@/modules/content";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [{ url: base, changeFrequency: "weekly", priority: 1 }, { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.9 }, { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 }, ...getAllArticles().map((article) => ({ url: `${base}/article/${article.slug}`, lastModified: article.date, changeFrequency: "monthly" as const, priority: article.featured ? 0.9 : 0.7 }))];
}
