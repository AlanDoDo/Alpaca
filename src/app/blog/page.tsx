import type { Metadata } from "next";
import Link from "next/link";
import { InkArt } from "@/components/visual/ink-art";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { JournalGrid } from "@/components/blog/journal-grid";
import { JournalSearch } from "@/components/blog/journal-search";
import { ArticlePagination } from "@/components/blog/article-pagination";
import { getAllArticles, getArticleBySlug } from "@/modules/content";
import { isRoboticsArticle } from "@/modules/content/research";
import { journalExcerpt, journalTopic, journalTopics } from "@/modules/content/journal";
export const metadata: Metadata = {
  title: "Notes", description: "随笔思考、行业思考、工具分享：记录研究之外的经历与想法。", alternates: { canonical: "/blog" },
};
type BlogSearchParams = { category?: string | string[]; topic?: string | string[]; page?: string | string[] };
const first = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
export default async function BlogPage({ searchParams }: { searchParams: Promise<BlogSearchParams> }) {
  const params = await searchParams;
  const category = first(params.category);
  const requestedTopic = first(params.topic);
  if (requestedTopic === "archive" || requestedTopic === "thinking") redirect("/forum?topic=programming");
  const normalizedTopic = requestedTopic === "life" ? "essays" : requestedTopic === "work" ? "industry" : requestedTopic === "reading" ? "tools" : requestedTopic;
  const topic = journalTopics.some((item) => item.id === normalizedTopic) ? normalizedTopic! : "all";
  const all = getAllArticles().filter((article) => !isRoboticsArticle(article)).sort((a, b) => b.date.localeCompare(a.date));
  const matching = all.filter((article) => (!category || article.category === category) && (topic === "all" || journalTopic(article) === topic));
  const pageCount = Math.max(1, Math.ceil(matching.length / 12));
  const pageNumber = Math.min(pageCount, Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1));
  const visible = matching.slice((pageNumber - 1) * 12, pageNumber * 12);
  return <div className="journal-page mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-14">
    <header className="journal-header ink-page-heading ink-heading-notes"><InkArt /><p className="journal-eyebrow">TECHALPACA / NOTES</p><h1>Notes</h1><p>记录个人思考、行业观察，以及值得分享的工具与实践。</p></header>
    <div className="journal-filter-bar"><nav aria-label="Notes 分类" className="journal-filters"><Link href="/blog" aria-current={!category && topic === "all" ? "page" : undefined}>全部</Link>{journalTopics.map((item) => <Link key={item.id} href={`/blog?topic=${item.id}`} aria-current={!category && topic === item.id ? "page" : undefined}>{item.title}</Link>)}</nav><JournalSearch /></div>
    <div className="journal-archive-heading"><span>{category ?? journalTopics.find((item) => item.id === topic)?.title ?? "全部 Notes"} · {matching.length} 篇</span>{category && <Link href="/blog">返回 Notes</Link>}</div>
    {visible.length > 0 ? <JournalGrid items={visible.map((article, index) => {
      const body = getArticleBySlug(article.slug)?.content ?? "";
      const excerpt = journalExcerpt(body, article.description);
      const label = journalTopics.find((item) => item.id === journalTopic(article))!.title;
      return { article, excerpt: excerpt.text, long: excerpt.long, label, priority: index === 0 };
    })} /> : <div className="journal-empty"><p>这里还没有 Notes。</p><span>慢慢记录，慢慢积累。</span></div>}
    <ArticlePagination currentPage={pageNumber} pageCount={pageCount} category={category} topic={topic} />
    <footer className="journal-page-footer"><span>片刻值得留下，想法可以慢慢生长。</span><div><Link href="/forum">Research <ArrowUpRight size={13} /></Link><Link href="/ai">AI 研究 <ArrowUpRight size={13} /></Link><Link href="/finance">金融研究 <ArrowUpRight size={13} /></Link></div></footer>
  </div>;
}
