import type { Metadata } from "next";
import { ArticleRow } from "@/components/blog/article-row";
import { searchArticles } from "@/modules/content";

export const metadata: Metadata = { title: "Search", description: "搜索 TechAlpaca 的文章。" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = searchArticles(q);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 md:py-24">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">SEARCH</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:mt-4 sm:text-5xl">搜索文章</h1>
      <form className="mt-6 flex items-stretch gap-2 sm:mt-8 sm:gap-3" action="/search">
        <label className="sr-only" htmlFor="query">关键词</label>
        <input id="query" name="q" defaultValue={q} placeholder="标题、正文、标签或分类" className="min-w-0 flex-1 border-b border-[var(--line)] bg-transparent px-1 py-3 text-sm outline-none focus:border-[var(--accent)] sm:text-base" />
        <button className="shrink-0 border-b border-[var(--ink)] px-3 text-sm sm:px-4" type="submit">搜索</button>
      </form>
      {q && <p className="mt-6 text-sm text-[var(--muted)] sm:mt-8">“{q}” 的搜索结果：{results.length} 篇</p>}
      <div className="mt-2 sm:mt-4">{results.map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
      {q && results.length === 0 && <p className="mt-6 text-sm text-[var(--muted)] sm:mt-8">没有找到相关文章。</p>}
    </div>
  );
}
