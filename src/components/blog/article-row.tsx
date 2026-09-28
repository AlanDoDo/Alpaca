import { isRoboticsArticle, researchCategories, researchTopic } from "@/modules/content/research";
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/modules/content";

export function ArticleRow({ article }: { article: ArticleSummary }) {
  const category = isRoboticsArticle(article)
    ? researchCategories.find((item) => item.id === researchTopic(article))?.title
    : article.category.toUpperCase();

  return (
    <article className={`ink-article-row grid items-center gap-4 border-b border-[var(--line)] py-5 sm:py-6 sm:gap-6 ${article.cover ? "grid-cols-[minmax(0,1fr)_6rem] sm:grid-cols-[minmax(0,1fr)_11rem]" : "grid-cols-1"}`}>
      <div className="min-w-0">
        <p className="article-row-meta">{category}<span>·</span><time dateTime={article.date}>{article.date}</time><span>·</span>{article.readingTime} 分钟阅读</p>
        <h2 className="mt-2 text-lg leading-snug sm:text-xl"><Link className="break-words hover:text-[var(--accent)]" href={article.href ?? `/article/${article.slug}`}>{article.title}</Link></h2>
        <p className="mt-2 max-w-2xl break-words text-sm leading-7 text-[var(--muted)]">{article.description}</p>
      </div>
      {article.cover && <Link href={article.href ?? `/article/${article.slug}`} aria-label={article.title} className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-sm bg-[var(--surface-hover)]"><Image src={article.cover} alt="" width={1980} height={1080} sizes="(min-width: 640px) 176px, 100vw" loading="lazy" unoptimized={article.cover.includes("techalpaca.vercel.app")} className="absolute inset-0 h-full w-full object-cover" /></Link>}
    </article>
  );
}


