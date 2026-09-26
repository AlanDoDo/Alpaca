import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowDown, ArrowLeft, ArrowUpRight, BrainCircuit, Layers3, Lightbulb, Workflow } from "lucide-react";
import { getAllArticles, type ArticleSummary } from "@/modules/content";

export const metadata: Metadata = {
  title: "AI 研究",
  description: "从模型与算法到 Agent 和工作流，记录 AI 研究、应用实践与长期思考。",
  alternates: { canonical: "/ai" },
};

function topicFor(article: ArticleSummary) {
  const text = `${article.title} ${article.tags.join(" ")}`;
  if (/CNN|Transformer|强化学习|机器学习|训练|算法/i.test(text)) return "models";
  if (/提示词|Chat\s?GPT|部署|工作流/i.test(text)) return "practice";
  return "perspectives";
}

const topics = [
  { id: "models", name: "模型与算法", english: "MODELS & ALGORITHMS", description: "理解智能如何学习，从基础模型走向训练与决策。", icon: Layers3 },
  { id: "practice", name: "应用与实践", english: "TOOLS & PRACTICE", description: "把 AI 用进日常工作，记录工具、提示词与实践经验。", icon: Workflow },
  { id: "perspectives", name: "观察与思考", english: "IDEAS & PERSPECTIVES", description: "关注技术改变人与产业的方式，留下自己的判断。", icon: Lightbulb },
];

function AiArticleCard({ article }: { article: ArticleSummary }) {
  return <article className="ai-article-card"><div className="ai-article-copy"><p className="ai-article-meta">{article.date} <span>·</span> {article.readingTime} 分钟阅读</p><h3><Link href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="ai-article-description">{article.description}</p><Link href={`/article/${article.slug}`} className="ai-article-read">阅读文章 <ArrowUpRight size={15} aria-hidden="true" /></Link></div>{article.cover && <Link className="ai-article-cover" href={`/article/${article.slug}`} aria-label={`阅读：${article.title}`}><Image src={article.cover} alt="" width={1980} height={1080} sizes="(min-width: 640px) 144px, 96px" loading="lazy" unoptimized={article.cover.includes("techalpaca.vercel.app")} /></Link>}</article>;
}

export default function AiPage() {
  const articles = getAllArticles().filter((article) => article.category === "AI").sort((a, b) => b.date.localeCompare(a.date));
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const remaining = articles.filter((article) => article.slug !== featured?.slug);
  return <div className="ai-page mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
    <Link href="/about" className="finance-back"><ArrowLeft size={15} aria-hidden="true" />关于我</Link>
    <header className="ai-page-header"><p className="finance-eyebrow">TECHALPACA / AI NOTEBOOK</p><h1>理解智能，<br className="sm:hidden" />也探索它的可能。</h1><p>从模型原理到实际应用，记录学习、实践与思考。<br className="hidden sm:block" />让技术成为解决问题的方法。</p><span className="ai-article-count">{articles.length} 篇文章 · 持续记录</span></header>
    <nav className="ai-topic-nav" aria-label="AI 文章主题">{topics.map(({ id, name, description, icon: Icon }) => <a key={id} href={`#${id}`}><span className="ai-topic-nav-title"><Icon size={19} aria-hidden="true" /><strong>{name}</strong><ArrowDown size={15} aria-hidden="true" /></span><span>{description}</span></a>)}</nav>
    {featured ? <section className="ai-featured" aria-label="重点文章"><div className="ai-featured-copy"><p className="finance-eyebrow">FEATURED / 重点阅读</p><h2><Link href={`/article/${featured.slug}`}>{featured.title}</Link></h2><p>{featured.description}</p><div className="ai-featured-bottom"><span>{featured.date} · {featured.readingTime} 分钟阅读</span><Link href={`/article/${featured.slug}`}>阅读全文 <ArrowUpRight size={17} aria-hidden="true" /></Link></div></div><div className="ai-featured-art" aria-hidden="true"><span className="ai-orbit ai-orbit-one" /><span className="ai-orbit ai-orbit-two" /><span className="ai-core"><BrainCircuit size={45} strokeWidth={1} /></span><span className="ai-art-label">LEARN · THINK · BUILD</span></div></section> : <p className="research-empty">AI 文章正在整理中。</p>}
    <div className="ai-topics">{topics.map(({ id, name, english, description }, index) => {
      const items = remaining.filter((article) => topicFor(article) === id);
      return <section className="ai-topic-section" id={id} key={id}><header><div><p className="finance-eyebrow">0{index + 1} / {english}</p><h2>{name}<span>{items.length} 篇</span></h2><p>{description}</p></div></header><div className="ai-article-grid">{items.slice(0, 4).map((article) => <AiArticleCard key={article.slug} article={article} />)}</div>{items.length > 4 && <details className="ai-more-articles"><summary>展开其余 {items.length - 4} 篇文章 <ArrowDown size={15} aria-hidden="true" /></summary><div className="ai-article-grid">{items.slice(4).map((article) => <AiArticleCard key={article.slug} article={article} />)}</div></details>}{items.length === 0 && <p className="research-empty">这个主题的文章正在整理中。</p>}</section>;
    })}</div>
    <footer className="ai-page-footer"><p>保持好奇，把理解变成实践。</p><Link href="/forum">继续探索机器人研究 <ArrowUpRight size={16} aria-hidden="true" /></Link></footer>
  </div>;
}
