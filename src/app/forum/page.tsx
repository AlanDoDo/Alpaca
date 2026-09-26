import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, MoveUpRight } from "lucide-react";
import type { Metadata } from "next";
import { ArticleRow } from "@/components/blog/article-row";
import { ArticlePagination } from "@/components/blog/article-pagination";
import { getAllArticles } from "@/modules/content";
import type { ArticleSummary } from "@/modules/content/types";

export const metadata: Metadata = {
  title: "机器人研究",
  alternates: { canonical: "/forum" },
  description: "围绕机器人与具身智能，记录工作实践、技术研究与产业观察。",
};

const roboticsCopy = "我的工作方向与长期主线。记录具身智能、机器人系统、运动规划与产业应用。";
const topics = [{ id: "all", label: "全部研究" }, { id: "industry", label: "行业观察" }, { id: "technology", label: "技术学习" }, { id: "practice", label: "项目实践" }];
function researchTopic(article: ArticleSummary) {
  const text = `${article.title} ${article.tags.join(" ")}`;
  if (/项目|实践|实战|部署|搭建|调试|开发记录/.test(text)) return "practice";
  if (/产业|行业|公司|市场|白皮书|融资/.test(text)) return "industry";
  return "technology";
}

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ topic?: string; page?: string }> }) {
  const params = await searchParams;
  const topic = topics.some((item) => item.id === params.topic) ? params.topic! : "all";
  const articles = getAllArticles();
  const byLatest = (a: (typeof articles)[number], b: (typeof articles)[number]) => b.date.localeCompare(a.date);
  const robotics = articles.filter((article) => article.category === "机器人" || (article.category === "产业" && /机器人|具身智能/.test(`${article.title} ${article.tags.join(" ")}`))).sort(byLatest);
  const roboticsLead = robotics.find((article) => article.featured) ?? robotics[0];
  const matching = robotics.filter((article) => (topic === "all" || researchTopic(article) === topic) && (topic !== "all" || article.slug !== roboticsLead?.slug));
  const pageCount = Math.max(1, Math.ceil(matching.length / 7));
  const currentPage = Math.min(pageCount, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const visible = matching.slice((currentPage - 1) * 7, currentPage * 7);

  return (
    <div id="top" className="research-page mx-auto max-w-6xl px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-14 md:pt-16">
      <header className="research-hero research-hero-compact">
        <p className="research-eyebrow">TECHALPACA <span>/</span> ROBOTICS RESEARCH</p>
        <h1>机器人研究</h1>
        <p className="research-lede">聚焦机器人与具身智能，记录技术如何走进真实世界。</p>
      </header>

      <section id="robotics" className="research-primary scroll-mt-8">
        <div className="research-section-heading">
          <div><p className="research-eyebrow"><span className="research-index">01</span> RESEARCH NOTES</p><h2>机器人</h2><p>{roboticsCopy}</p></div>
          <Link href="/blog?category=%E6%9C%BA%E5%99%A8%E4%BA%BA" className="research-more">全部机器人文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        {topic === "all" && currentPage === 1 && roboticsLead ? (
          <article className={`research-lead ${roboticsLead.cover ? "has-cover" : "no-cover"}`}>
            {roboticsLead.cover && <Link href={`/article/${roboticsLead.slug}`} className="research-lead-image"><Image src={roboticsLead.cover} alt={roboticsLead.title} width={1980} height={1080} sizes="(min-width: 1280px) 600px, (min-width: 768px) 52vw, calc(100vw - 32px)" preload unoptimized={roboticsLead.cover.includes("techalpaca.vercel.app")} className="transition-transform duration-700 hover:scale-[1.025]" /></Link>}
            <div className="research-lead-copy">
              <p className="research-eyebrow">精选研究 <span>/</span> {roboticsLead.date}</p>
              <h3><Link href={`/article/${roboticsLead.slug}`}>{roboticsLead.title}</Link></h3>
              <p className="research-lead-description">{roboticsLead.description}</p>
              <Link href={`/article/${roboticsLead.slug}`} className="research-read-link">阅读文章 <MoveUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        ) : null}
        <nav aria-label="机器人研究分类" className="research-topic-tabs">
          {topics.map((item) => <Link key={item.id} href={item.id === "all" ? "/forum" : `/forum?topic=${item.id}`} aria-current={item.id === topic ? "page" : undefined}>{item.label}<span>{robotics.filter((article) => item.id === "all" || researchTopic(article) === item.id).length}</span></Link>)}
        </nav>
        {visible.length ? <div className="research-robotics-list">{visible.map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="research-empty">这个方向的笔记正在积累中，可先查看其他分类。</p>}
        <ArticlePagination currentPage={currentPage} pageCount={pageCount} basePath="/forum" topic={topic} />
      </section>

      <div className="research-footer"><a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]">返回顶部 <ArrowDown size={13} aria-hidden="true" className="rotate-180" /></a></div>
    </div>
  );
}
