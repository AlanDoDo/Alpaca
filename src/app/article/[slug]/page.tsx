import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/modules/content";
import { extractArticleHeadings } from "@/modules/content/headings";
import { renderKnowledgeLinks } from "@/modules/content/connected";
import { DocumentRelations } from "@/components/blog/document-relations";
import { ArticleBody } from "@/components/blog/article-body";
import { ArticleTableOfContents } from "@/components/blog/article-toc";
import { ArticleEndNavigation } from "@/components/blog/article-end-navigation";

export function generateStaticParams() { return getAllArticles().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return article ? {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: { title: article.title, description: article.description, type: "article", publishedTime: article.date, ...(article.cover ? { images: [article.cover] } : {}) },
  } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const linkedContent = renderKnowledgeLinks(article.content);
  const headings = extractArticleHeadings(linkedContent);
  const allArticles = getAllArticles();
  const chronology = allArticles.slice().sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
  const articleIndex = chronology.findIndex((item) => item.slug === article.slug);
  const previous = articleIndex >= 0 ? chronology[articleIndex + 1] : undefined;
  const next = articleIndex > 0 ? chronology[articleIndex - 1] : undefined;
  const related = allArticles
    .filter((item) => item.slug !== article.slug)
    .map((item) => ({ item, score: (item.category === article.category ? 2 : 0) + item.tags.filter((tag) => article.tags.includes(tag)).length * 3 }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date))
    .slice(0, 3)
    .map(({ item }) => item);
  const showToc = article.content.length >= 1600 && headings.length >= 3;

  return (
    <div className={showToc
      ? "mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:py-24 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-14"
      : "mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-24"}>
      <article className="ink-reading mx-auto w-full max-w-4xl min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.2em]">{article.category.toUpperCase()}</p>
        <h1 className="mt-4 break-words text-3xl font-semibold leading-tight tracking-tight sm:mt-5 sm:text-4xl md:text-6xl">{article.title}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:mt-6 sm:text-lg sm:leading-8">{article.description}</p>
        <p className="mt-5 border-b border-[var(--line)] pb-5 text-xs text-[var(--muted)] sm:mt-6 sm:pb-6 sm:text-sm">TechAlpaca · {article.date} · {article.readingTime} 分钟阅读</p>
        {article.cover && <Image src={article.cover} alt={article.title} width={1200} height={675} sizes="(min-width: 768px) 768px, 100vw" priority unoptimized={article.cover.includes("techalpaca.vercel.app")} className="mt-6 aspect-[16/9] w-full rounded-sm object-cover sm:mt-8" />}
        <ArticleBody source={linkedContent} headings={showToc ? headings : []} />
        <DocumentRelations href={`/article/${slug}`} />
        <ArticleEndNavigation previous={previous} next={next} related={related} />
      </article>
      {showToc && <aside className="hidden min-w-0 lg:block"><ArticleTableOfContents headings={headings} /></aside>}
    </div>
  );
}


