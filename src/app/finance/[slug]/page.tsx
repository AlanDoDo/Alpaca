import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getFinanceNote, getFinanceNotes } from "@/modules/content/finance";
import { extractArticleHeadings } from "@/modules/content/headings";
import { ArticleBody } from "@/components/blog/article-body";
import { ArticleTableOfContents } from "@/components/blog/article-toc";
import { getFinanceImageDimensions } from "@/modules/content/image-metadata";

export function generateStaticParams() { return getFinanceNotes().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getFinanceNote(slug);
  return note ? { title: note.title, description: note.description, alternates: { canonical: `/finance/${slug}` } } : {};
}

export default async function FinanceNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getFinanceNote(slug);
  if (!note) notFound();
  const headings = extractArticleHeadings(note.content);
  const showToc = headings.length >= 3 && note.content.length >= 1600;
  const sectionId = note.section === "投机" ? "speculation" : "investment";
  const related = getFinanceNotes().filter((item) => item.section === note.section && item.slug !== slug).slice(0, 3);
  return <div className={showToc ? "mx-auto grid max-w-7xl items-stretch gap-10 px-5 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12" : "mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-16"}>
    <article className="min-w-0"><Link href={`/finance#${sectionId}`} className="finance-back"><ArrowLeft size={15} aria-hidden="true" />金融 / {note.section}</Link><header className="finance-reading-header"><p className="finance-eyebrow">{note.topic} / PERSONAL NOTES</p><h1>{note.title}</h1><p>{note.description}</p><div><span>TechAlpaca</span><span>{note.readingTime} 分钟阅读</span><span>个人研究笔记</span></div></header>
      <p className="finance-source-note">整理自《{note.source.replace(/\.md$/, "")}》。以下保留学习笔记与摘录的原始观点；其中的行情、财务数据、概率及配置示例并未作为当前结论核验。</p>
      <ArticleBody source={note.content} headings={headings} images={getFinanceImageDimensions(note.content)} />
      <footer className="finance-reading-footer"><Link href={`/finance#${sectionId}`} className="finance-back"><ArrowLeft size={15} aria-hidden="true" />返回{note.section}笔记</Link>{related.length > 0 && <div className="mt-8"><p className="finance-eyebrow">继续阅读</p>{related.map((item) => <Link key={item.slug} href={`/finance/${item.slug}`} className="finance-related-link">{item.title}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>}</footer>
    </article>
    {showToc && <aside className="hidden min-w-0 lg:block"><ArticleTableOfContents headings={headings} /></aside>}
  </div>;
}
