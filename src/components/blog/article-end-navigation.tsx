import Link from "next/link";
import type { ArticleSummary } from "@/modules/content/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Props = { previous?: ArticleSummary; next?: ArticleSummary; related: ArticleSummary[] };

export function ArticleEndNavigation({ previous, next, related }: Props) {
  return (
    <>
      {(previous || next) && <nav aria-label="文章导航" className="article-end-navigation">
        {previous ? <Link className="article-end-link" href={`/article/${previous.slug}`} rel="prev"><span className="article-end-label"><ArrowLeft aria-hidden="true" className="mr-1 inline size-3.5" />上一篇</span><span className="article-end-title">{previous.title}</span></Link> : <span />}
        {next ? <Link className="article-end-link text-right" href={`/article/${next.slug}`} rel="next"><span className="article-end-label">下一篇<ArrowRight aria-hidden="true" className="ml-1 inline size-3.5" /></span><span className="article-end-title">{next.title}</span></Link> : <span />}
      </nav>}
      {related.length > 0 && <section aria-labelledby="related-articles-title" className="article-related">
        <h2 className="article-related-heading" id="related-articles-title">继续阅读</h2>
        <div className="article-related-list">
          {related.map((item) => <Link className="article-related-link" href={`/article/${item.slug}`} key={item.slug}><span className="article-related-title">{item.title}</span><span className="article-related-meta">{item.category} · {item.readingTime} 分钟</span></Link>)}
        </div>
      </section>}
    </>
  );
}
