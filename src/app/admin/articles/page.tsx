import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllArticles } from "@/modules/content";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ArticleEditor } from "@/components/admin/article-editor";

export const metadata: Metadata = { title: "文章编辑器", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  if (!await isAdminAuthenticated()) redirect("/admin/login");
  const articles = getAllArticles();
  return <ArticleEditor articles={articles} />;
}
