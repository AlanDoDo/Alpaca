import { InkArt } from "@/components/visual/ink-art";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getAllArticles } from "@/modules/content";
import { isRoboticsArticle } from "@/modules/content/research";
import { HomeArticleRow } from "@/components/blog/home-article-row";
import { InkFish } from "@/components/visual/ink-fish";

export default function HomePage() {
  const articles = getAllArticles();
  const researchRecommendation = articles.find((article) => article.featured && isRoboticsArticle(article));
  const latest = articles.filter((article) => article.slug !== researchRecommendation?.slug).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="homepage-intro relative flex min-h-[calc(100svh-7rem)] flex-col justify-center overflow-hidden border-b border-[var(--line)] py-16 sm:min-h-[calc(100svh-5rem)] sm:py-24" aria-labelledby="homepage-title">
        <InkArt variant="hero" />
        <InkFish />
        <div className="home-intro-copy site-shell pb-10 sm:pb-14">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] sm:text-xs sm:tracking-[0.24em]">AI × ROBOTICS × FINANCE</p>
          <h1 id="homepage-title" className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.16] tracking-tight sm:mt-6 sm:text-5xl sm:leading-[1.12] md:text-7xl md:leading-[1.08]">研究技术如何改变产业，也研究钱最终流向哪里。</h1>
          <p className="mt-5 text-base text-[var(--muted)] sm:mt-6 sm:text-lg">Ideas, technology, companies and capital.</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:mt-9"><Link className="underline underline-offset-4 decoration-[var(--line)] transition-colors hover:text-[var(--accent)]" href="/forum">阅读文章</Link><Link className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]" href="/about">关于 TechAlpaca</Link></div>
        </div>
        <a href="#latest" aria-label="向下浏览最近文章" className="home-scroll-arrow absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-full px-4 py-2 text-[10px] tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)] sm:bottom-6">
          <span>向下浏览</span><ChevronDown size={21} aria-hidden="true" />
        </a>
      </section>

      <div className="site-shell">
        <section data-ink-reveal id="latest" className="ink-section py-9 sm:py-12 md:py-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
            <div><p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">LATEST</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">最近更新</h2></div>
            <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]" href="/blog">全部文章 <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {latest.slice(0, 8).map((article, index) => <HomeArticleRow key={article.slug} article={article} index={index} />)}
          </div>
        </section>

      </div>
    </>
  );
}
