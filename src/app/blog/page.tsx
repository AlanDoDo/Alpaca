import type { Metadata } from "next";
import Link from "next/link";
import { ArticleRow } from "@/components/blog/article-row";
import { ArticlePagination } from "@/components/blog/article-pagination";
import { getAllArticles } from "@/modules/content";

export const metadata: Metadata = { title: "Blog", description: "TechAlpaca 的文章与研究。" };
const categories = ["AI", "机器人", "产业", "编程", "工程技术", "金融", "设计", "杂谈"];
const articlesPerPage = 8;

type BlogSearchParams = { category?: string | string[]; page?: string | string[] };

export default async function BlogPage({ searchParams }: { searchParams: Promise<BlogSearchParams> }) {
  const params = await searchParams;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const requestedPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const matchingArticles = getAllArticles().filter((article) => !category || article.category === category);
  const pageCount = Math.max(1, Math.ceil(matchingArticles.length / articlesPerPage));
  const pageNumber = Math.min(pageCount, Math.max(1, Number.parseInt(requestedPage ?? "1", 10) || 1));
  const articles = matchingArticles.slice((pageNumber - 1) * articlesPerPage, pageNumber * articlesPerPage);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">TECHALPACA / JOURNAL</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:mt-4 sm:text-5xl">文章</h1>
      <nav aria-label="文章分类" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-b border-[var(--line)] pb-4 text-sm text-[var(--muted)] sm:mt-8 sm:gap-x-5 sm:pb-5">
        <Link className="py-1 hover:text-[var(--ink)]" href="/blog">全部</Link>
        {categories.map((item) => <Link className="py-1 hover:text-[var(--ink)]" key={item} href={`/blog?category=${encodeURIComponent(item)}`}>{item}</Link>)}
      </nav>
      {category && <p className="mt-5 text-sm text-[var(--muted)]">{category} · {matchingArticles.length} 篇文章</p>}
      <div className="mt-2 sm:mt-4">{articles.map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
      <ArticlePagination currentPage={pageNumber} pageCount={pageCount} category={category} />
    </div>
  );
}
