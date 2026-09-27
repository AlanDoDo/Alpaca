import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleSummary } from "@/modules/content";

export function HomeArticleRow({ article, index }: { article: ArticleSummary; index: number }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="ink-article-row group grid gap-3 py-5 transition-colors hover:bg-[var(--surface-hover)] sm:gap-4 sm:py-6 md:grid-cols-[4.5rem_minmax(0,1fr)_9rem] md:items-center md:px-4"
    >
      <span className="hidden font-mono text-sm tabular-nums text-[var(--muted)] md:block">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold tracking-[0.13em] text-[var(--muted)] sm:text-[11px]">
          <span className="text-[var(--accent)]">{article.category.toUpperCase()}</span>
          <span>{article.date}</span>
        </div>
        <h3 className="mt-2 break-words text-lg font-medium leading-snug sm:mt-2.5 sm:text-xl">{article.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--muted)] sm:mt-2">{article.description}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted)] md:justify-end md:gap-3">
        <span className="md:text-right">{article.readingTime} 分钟阅读</span>
        <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
      </div>
    </Link>
  );
}


