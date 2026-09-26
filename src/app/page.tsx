import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getAllArticles } from "@/modules/content";
import { HomeArticleRow } from "@/components/blog/home-article-row";

const topics = ["AI", "机器人", "产业", "编程", "工程技术", "金融", "设计", "杂谈"];

export default function HomePage() {
  const articles = getAllArticles();
  const [featured, ...latest] = articles;

  return (
    <>
      <section className="homepage-intro relative flex min-h-[calc(100svh-7rem)] flex-col justify-center overflow-hidden border-b border-[var(--line)] px-4 py-16 sm:min-h-[calc(100svh-5rem)] sm:px-6 sm:py-24" aria-labelledby="homepage-title">
        <div className="home-intro-copy mx-auto w-full max-w-6xl pb-10 sm:pb-14">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--muted)] sm:text-xs sm:tracking-[0.24em]">AI × ROBOTICS × FINANCE</p>
          <h1 id="homepage-title" className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.16] tracking-tight sm:mt-6 sm:text-5xl sm:leading-[1.12] md:text-7xl md:leading-[1.08]">研究技术如何改变产业，也研究钱最终流向哪里。</h1>
          <p className="mt-5 text-base text-[var(--muted)] sm:mt-6 sm:text-lg">Ideas, technology, companies and capital.</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:mt-9"><Link className="underline underline-offset-4 decoration-[var(--line)] transition-colors hover:text-[var(--accent)]" href="/blog">阅读文章</Link><Link className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]" href="/about">关于 TechAlpaca</Link></div>
        </div>
        <a href="#featured" aria-label="向下进入精选文章" className="home-scroll-arrow absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-full px-4 py-2 text-[10px] tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)] sm:bottom-6">
          <span>向下浏览</span><ChevronDown size={21} aria-hidden="true" />
        </a>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {featured && (
          <section id="featured" className="scroll-mt-6 border-b border-[var(--line)] py-9 sm:scroll-mt-8 sm:py-12 md:py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">FEATURED <span className="px-1 text-[var(--line)]">/</span> {featured.category.toUpperCase()}</p>
              <p className="text-xs text-[var(--muted)] sm:text-sm">{featured.date} · {featured.readingTime} 分钟阅读</p>
            </div>
            <div className={`mt-5 grid overflow-hidden border border-[var(--line)] bg-[var(--surface)] ${featured.cover ? "md:grid-cols-[1.05fr_1fr]" : ""}`}>
              {featured.cover && <Link href={`/article/${featured.slug}`} className="block overflow-hidden"><Image src={featured.cover} alt={featured.title} width={960} height={640} sizes="(min-width: 768px) 50vw, 100vw" priority unoptimized={featured.cover.includes("techalpaca.vercel.app")} className="aspect-[16/10] h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" /></Link>}
              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8 md:p-10">
                <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl"><Link className="hover:text-[var(--accent)]" href={`/article/${featured.slug}`}>{featured.title}</Link></h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:mt-4 sm:text-base">{featured.description}</p>
                <Link href={`/article/${featured.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--accent)] sm:mt-7">阅读全文 <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
          </section>
        )}

        <section className="py-9 sm:py-12 md:py-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
            <div><p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">LATEST</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">最近更新</h2></div>
            <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]" href="/blog">全部文章 <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {latest.slice(0, 8).map((article, index) => <HomeArticleRow key={article.slug} article={article} index={index} />)}
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-9 sm:py-12 md:py-14">
          <div className="mb-5 sm:mb-7"><p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">TOPICS</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">按主题阅读</h2></div>
          <div className="grid grid-cols-2 border-l border-t border-[var(--line)] sm:grid-cols-4">
            {topics.map((topic, index) => (
              <Link key={topic} className="group flex min-h-16 items-center justify-between gap-2 border-b border-r border-[var(--line)] px-3 py-3 transition-colors hover:bg-[var(--surface-hover)] sm:min-h-20 sm:px-5" href={`/blog?category=${encodeURIComponent(topic)}`}>
                <span className="flex items-center gap-2.5 text-sm font-medium sm:text-base"><span className="font-mono text-[10px] text-[var(--muted)]">0{index + 1}</span>{topic}</span>
                <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
