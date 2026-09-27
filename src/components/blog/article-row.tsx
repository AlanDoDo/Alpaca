import { isRoboticsArticle, researchCategories, researchTopic } from "@/modules/content/research";
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/modules/content";

export function ArticleRow({ article }: { article: ArticleSummary }) {
  return (
    <article className="ink-article-row grid gap-2 border-b border-[var(--line)] py-5 sm:py-6 md:grid-cols-[8rem_1fr] md:gap-4">
      <p className="text-[11px] font-semibold tracking-wide text-[var(--muted)] sm:text-xs">{isRoboticsArticle(article) ? researchCategories.find((item) => item.id === researchTopic(article))?.title : article.category.toUpperCase()}</p>
      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-medium leading-snug sm:text-xl"><Link className="break-words hover:text-[var(--accent)]" href={article.href ?? `/article/${article.slug}`}>{article.title}</Link></h2>
          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-[var(--muted)]">{article.description}</p>
          <p className="mt-3 text-[11px] text-[var(--muted)] sm:text-xs">{article.date} · {article.readingTime} 分钟阅读</p>
        </div>
        {article.cover && <Link href={article.href ?? `/article/${article.slug}`} aria-label={article.title} className="relative block aspect-[1980/1080] w-24 shrink-0 overflow-hidden rounded-sm bg-[var(--surface-hover)] sm:w-44"><Image src={article.cover} alt="" width={1980} height={1080} sizes="(min-width: 640px) 176px, 96px" loading="lazy" unoptimized={article.cover.includes("techalpaca.vercel.app")} className="absolute inset-0 h-full w-full object-fill" /></Link>}
      </div>
    </article>
  );
}


