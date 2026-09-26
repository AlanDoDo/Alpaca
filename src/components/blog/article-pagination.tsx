import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PageItem = number | "ellipsis";

function visiblePages(currentPage: number, pageCount: number): PageItem[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);

  let pages: number[];
  if (currentPage <= 3) {
    pages = [1, 2, 3, 4, pageCount];
  } else if (currentPage >= pageCount - 2) {
    pages = [1, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  } else {
    pages = [1, currentPage - 1, currentPage, currentPage + 1, pageCount];
  }

  return pages.flatMap((page, index) => index > 0 && page - pages[index - 1] > 1 ? ["ellipsis", page] : [page]);
}

function pageHref(page: number, category?: string, basePath = "/blog", topic?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (topic && topic !== "all") params.set("topic", topic);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

const pageButtonClass = "grid size-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function ArticlePagination({ currentPage, pageCount, category, basePath = "/blog", topic }: { currentPage: number; pageCount: number; category?: string; basePath?: string; topic?: string }) {
  if (pageCount <= 1) return null;
  const href = (page: number) => pageHref(page, category, basePath, topic);

  return (
    <nav aria-label="文章分页" className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--line)] pt-6 sm:mt-12 sm:pt-8">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} rel="prev" aria-label="上一页" title="上一页" className={pageButtonClass}><ArrowLeft size={16} aria-hidden="true" /></Link>
      ) : (
        <span aria-disabled="true" aria-label="没有上一页" className={`${pageButtonClass} cursor-not-allowed opacity-40`}><ArrowLeft size={16} aria-hidden="true" /></span>
      )}
      {visiblePages(currentPage, pageCount).map((item, index) => item === "ellipsis" ? (
        <span key={`ellipsis-${index}`} aria-hidden="true" className="px-0.5 text-lg tracking-[0.12em] text-[var(--muted)]">...</span>
      ) : (
        <Link key={item} href={href(item)} aria-current={currentPage === item ? "page" : undefined} className={`${pageButtonClass} ${currentPage === item ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-contrast)] shadow-sm shadow-blue-900/15 hover:text-[var(--accent-contrast)]" : ""}`}>
          {item}
        </Link>
      ))}
      {currentPage < pageCount ? (
        <Link href={href(currentPage + 1)} rel="next" aria-label="下一页" title="下一页" className={pageButtonClass}><ArrowRight size={16} aria-hidden="true" /></Link>
      ) : (
        <span aria-disabled="true" aria-label="没有下一页" className={`${pageButtonClass} cursor-not-allowed opacity-40`}><ArrowRight size={16} aria-hidden="true" /></span>
      )}
    </nav>
  );
}

