import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, MoveUpRight } from "lucide-react";
import type { Metadata } from "next";
import { ArticleRow } from "@/components/blog/article-row";
import { getAllArticles } from "@/modules/content";

export const metadata: Metadata = {
  title: "研究领域",
  description: "以机器人为主线，持续研究 AI、机器人产业与金融。",
};

const areaCopy = {
  robotics: "我的工作方向与长期主线。记录具身智能、机器人系统、运动规划与产业应用。",
  ai: "关注 AI 模型、Agent 与自动化，观察智能如何进入真实工作流。",
  finance: "从产业出发理解资本、市场与长期价值，关注钱最终流向哪里。",
};

export default function ForumPage() {
  const articles = getAllArticles();
  const byLatest = (a: (typeof articles)[number], b: (typeof articles)[number]) => b.date.localeCompare(a.date);
  const robotics = articles.filter((article) => article.category === "机器人").sort(byLatest);
  const ai = articles.filter((article) => article.category === "AI").sort(byLatest);
  const finance = articles.filter((article) => article.category === "金融").sort(byLatest);
  const roboticsLead = robotics[0];

  return (
    <div id="top" className="research-page mx-auto max-w-6xl px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-14 md:pt-16">
      <header className="research-hero research-hero-compact">
        <p className="research-eyebrow">TECHALPACA <span>/</span> AREAS OF FOCUS</p>
        <h1>研究领域</h1>
        <p className="research-lede">以机器人为主线，持续关注 AI 技术、产业应用与金融价值。</p>
      </header>

      <section id="robotics" className="research-primary scroll-mt-8">
        <div className="research-section-heading">
          <div><p className="research-eyebrow"><span className="research-index">01</span> PRIMARY FOCUS</p><h2>机器人</h2><p>{areaCopy.robotics}</p></div>
          <Link href="/blog?category=%E6%9C%BA%E5%99%A8%E4%BA%BA" className="research-more">全部机器人文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        {roboticsLead ? (
          <article className={`research-lead ${roboticsLead.cover ? "has-cover" : "no-cover"}`}>
            {roboticsLead.cover && <Link href={`/article/${roboticsLead.slug}`} className="research-lead-image"><Image src={roboticsLead.cover} alt={roboticsLead.title} width={1980} height={1080} sizes="(min-width: 768px) 52vw, 100vw" preload unoptimized={roboticsLead.cover.includes("techalpaca.vercel.app")} className="transition-transform duration-700 hover:scale-[1.025]" /></Link>}
            <div className="research-lead-copy">
              <p className="research-eyebrow">LATEST ROBOTICS RESEARCH <span>/</span> {roboticsLead.date}</p>
              <h3><Link href={`/article/${roboticsLead.slug}`}>{roboticsLead.title}</Link></h3>
              <p className="research-lead-description">{roboticsLead.description}</p>
              <Link href={`/article/${roboticsLead.slug}`} className="research-read-link">阅读文章 <MoveUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        ) : <p className="research-empty">机器人文章正在整理中。</p>}
        {robotics.length > 1 && <div className="research-robotics-list">{robotics.slice(1, 5).map((article) => <ArticleRow key={article.slug} article={article} />)}</div>}
      </section>

      <div className="research-secondary-grid">
        <section id="ai" className="research-secondary-card scroll-mt-8">
          <div className="research-secondary-head"><div><p className="research-eyebrow"><span className="research-index">02</span> RESEARCH AREA</p><h2>AI</h2></div><span className="research-count">{String(ai.length).padStart(2, "0")}</span></div>
          <p className="research-secondary-copy">{areaCopy.ai}</p>
          {ai.length > 0 ? <div className="research-secondary-list">{ai.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="research-empty">相关文章正在整理中。</p>}
          <Link href="/blog?category=AI" className="research-more">浏览 AI 文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
        <section id="finance" className="research-secondary-card scroll-mt-8">
          <div className="research-secondary-head"><div><p className="research-eyebrow"><span className="research-index">03</span> RESEARCH AREA</p><h2>金融</h2></div><span className="research-count">{String(finance.length).padStart(2, "0")}</span></div>
          <p className="research-secondary-copy">{areaCopy.finance}</p>
          {finance.length > 0 ? <div className="research-secondary-list">{finance.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="research-empty">相关文章正在整理中。</p>}
          <Link href="/blog?category=%E9%87%91%E8%9E%8D" className="research-more">浏览金融文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
      </div>
      <div className="research-footer"><a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]">返回顶部 <ArrowDown size={13} aria-hidden="true" className="rotate-180" /></a></div>
    </div>
  );
}
