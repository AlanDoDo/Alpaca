import Link from "next/link";
import { InkArt } from "@/components/visual/ink-art";
import type { Metadata } from "next";
import { ArticleRow } from "@/components/blog/article-row";
import { ArticlePagination } from "@/components/blog/article-pagination";
import { getAllArticles } from "@/modules/content";
import { isRoboticsArticle, researchCategories, researchTopic } from "@/modules/content/research";
export const metadata: Metadata = {
  title: "机器人研究", alternates: { canonical: "/forum" },
  description: "围绕产业、机械、电子、感知、规划、控制、具身智能、系统工程与编程，整理机器人研究与实践。",
};
export default async function ForumPage({ searchParams }: { searchParams: Promise<{ topic?: string; page?: string }> }) {
  const params = await searchParams;
  const topics = [{ id: "all", title: "全部" }, ...researchCategories];
  const requestedTopic = params.topic === "embodied" ? "learning" : params.topic === "practice" ? "systems" : params.topic === "hardware" ? "electronics" : params.topic;
  const topic = topics.some((item) => item.id === requestedTopic) ? requestedTopic! : "all";
  const articles = getAllArticles().filter(isRoboticsArticle).sort((a, b) => b.date.localeCompare(a.date));
  const matching = articles.filter((article) => topic === "all" || researchTopic(article) === topic);
  const pageCount = Math.max(1, Math.ceil(matching.length / 6));
  const currentPage = Math.min(pageCount, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const visible = matching.slice((currentPage - 1) * 6, currentPage * 6);
  return <div className="research-page mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-6 sm:pt-14">
    <header className="research-hero research-hero-compact ink-page-heading ink-heading-research"><InkArt />
      <p className="research-eyebrow">TECHALPACA <span>/</span> ROBOTICS RESEARCH</p>
      <h1>机器人研究</h1>
      <p className="research-lede">从技术到落地，记录机器人行业的研究与实践。</p>
    </header>
    <section className="robotics-home-section" aria-label="机器人文章">
      <nav aria-label="机器人研究分类" className="research-topic-tabs">
        {topics.map((item) => <Link key={item.id} href={item.id === "all" ? "/forum" : `/forum?topic=${item.id}`} aria-current={item.id === topic ? "page" : undefined}>{item.title}<span>{articles.filter((article) => item.id === "all" || researchTopic(article) === item.id).length}</span></Link>)}
      </nav>
      {visible.length ? <div className="research-robotics-list">{visible.map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="research-empty">这个方向的文章正在积累中。</p>}
      <ArticlePagination currentPage={currentPage} pageCount={pageCount} basePath="/forum" topic={topic} />
    </section>
  </div>;
}
