import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
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
  const robotics = articles.filter((article) => article.category === "机器人");
  const ai = articles.filter((article) => article.category === "AI");
  const finance = articles.filter((article) => article.category === "金融");
  const roboticsLead = robotics[0];

  return (
    <div id="top" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <header className="border-b border-[var(--line)] pb-8 sm:pb-10">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] sm:text-xs">TECHALPACA / AREAS OF FOCUS</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6 sm:mt-5">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">三个研究方向，<br className="hidden sm:block" />一条机器人主线。</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:mt-5 sm:text-base sm:leading-8">从机器人出发，连接 AI 技术与产业资本。这里整理我的工作方向、持续研究和阶段性思考。</p>
          </div>
          <nav aria-label="研究领域导航" className="flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
            <a href="#robotics" className="rounded-full border border-[var(--line)] px-3 py-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">机器人 <span className="ml-1 text-[var(--muted)]">{robotics.length}</span></a>
            <a href="#ai" className="rounded-full border border-[var(--line)] px-3 py-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">AI <span className="ml-1 text-[var(--muted)]">{ai.length}</span></a>
            <a href="#finance" className="rounded-full border border-[var(--line)] px-3 py-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">金融 <span className="ml-1 text-[var(--muted)]">{finance.length}</span></a>
          </nav>
        </div>
      </header>

      <section id="robotics" className="scroll-mt-8 border-b border-[var(--line)] py-9 sm:py-12 md:py-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--accent)] sm:text-[11px]">01 / PRIMARY FOCUS</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">机器人</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:mt-3 sm:text-base sm:leading-7">{areaCopy.robotics}</p>
          </div>
          <Link href="/blog?category=%E6%9C%BA%E5%99%A8%E4%BA%BA" className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]">全部机器人文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>

        {roboticsLead ? (
          <article className={`grid overflow-hidden border border-[var(--line)] bg-[var(--surface)] ${roboticsLead.cover ? "md:grid-cols-[1.1fr_1fr]" : ""}`}>
            {roboticsLead.cover && <Link href={`/article/${roboticsLead.slug}`} className="relative block aspect-[1980/1080] w-full overflow-hidden bg-[var(--surface)] md:aspect-auto md:h-full"><Image src={roboticsLead.cover} alt={roboticsLead.title} width={1980} height={1080} sizes="(min-width: 768px) 55vw, 100vw" priority unoptimized={roboticsLead.cover.includes("techalpaca.vercel.app")} className="absolute inset-0 h-full w-full object-fill transition-transform duration-500 hover:scale-[1.01]" /></Link>}
            <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-10">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-[11px]">LATEST ROBOTICS RESEARCH <span className="px-1 text-[var(--line)]">/</span> {roboticsLead.date}</p>
              <h3 className="mt-3 break-words text-2xl font-semibold leading-tight tracking-tight sm:mt-4 sm:text-3xl md:text-4xl"><Link href={`/article/${roboticsLead.slug}`} className="transition-colors hover:text-[var(--accent)]">{roboticsLead.title}</Link></h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:mt-4 sm:text-base">{roboticsLead.description}</p>
              <Link href={`/article/${roboticsLead.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--accent)] sm:mt-7">阅读文章 <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
        ) : (
          <p className="border-y border-[var(--line)] py-6 text-sm text-[var(--muted)]">机器人文章正在整理中。</p>
        )}

        {robotics.length > 1 && <div className="mt-5 border-t border-[var(--line)] sm:mt-7">{robotics.slice(1, 4).map((article) => <ArticleRow key={article.slug} article={article} />)}</div>}
      </section>

      <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-[var(--line)]">
        <section id="ai" className="scroll-mt-8 border-b border-[var(--line)] py-9 sm:py-11 md:border-b-0 md:py-12 md:pr-8 lg:pr-12">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--muted)] sm:text-[11px]">02 / RESEARCH AREA</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">AI</h2></div>
            <span className="pt-1 font-mono text-sm text-[var(--muted)]">{String(ai.length).padStart(2, "0")}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:leading-7">{areaCopy.ai}</p>
          {ai.length > 0 ? <div className="mt-3">{ai.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="mt-5 text-sm text-[var(--muted)]">相关文章正在整理中。</p>}
          <Link href="/blog?category=AI" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--accent)]">浏览 AI 文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>

        <section id="finance" className="scroll-mt-8 py-9 sm:py-11 md:py-12 md:pl-8 lg:pl-12">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--muted)] sm:text-[11px]">03 / RESEARCH AREA</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">金融</h2></div>
            <span className="pt-1 font-mono text-sm text-[var(--muted)]">{String(finance.length).padStart(2, "0")}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:leading-7">{areaCopy.finance}</p>
          {finance.length > 0 ? <div className="mt-3">{finance.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div> : <p className="mt-5 text-sm text-[var(--muted)]">相关文章正在整理中。</p>}
          <Link href="/blog?category=%E9%87%91%E8%9E%8D" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--accent)]">浏览金融文章 <ArrowRight size={15} aria-hidden="true" /></Link>
        </section>
      </div>

      <div className="border-t border-[var(--line)] py-6 text-center text-[10px] tracking-[0.18em] text-[var(--muted)] sm:py-8">
        <a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]">返回顶部 <ArrowDown size={13} aria-hidden="true" className="rotate-180" /></a>
      </div>
    </div>
  );
}





