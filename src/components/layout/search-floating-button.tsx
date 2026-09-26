"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import type { ArticleSummary } from "@/modules/content/types";

type SearchState = "idle" | "loading" | "done" | "error";
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return text;
  const haystack = text.toLocaleLowerCase();
  const parts = [];
  let start = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    parts.push(text.slice(start, index), <mark key={index}>{text.slice(index, index + needle.length)}</mark>);
    start = index + needle.length;
    index = haystack.indexOf(needle, start);
  }
  parts.push(text.slice(start));
  return <>{parts}</>;
}

export function SearchFloatingButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleSummary[]>([]);
  const [status, setStatus] = useState<SearchState>("idle");
  const [resolvedQuery, setResolvedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const resultCache = useRef(new Map<string, { results: ArticleSummary[]; expires: number }>());

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    function handleOpenSearch(event: Event) {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      if (typeof detail?.query === "string") setQuery(detail.query);
      setOpen(true);
    }
    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("techalpaca:open-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("techalpaca:open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input') ?? []);
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", trapFocus);
    return () => { document.body.style.overflow = originalOverflow; document.removeEventListener("keydown", trapFocus); previousFocus?.focus(); };
  }, [open]);

  useEffect(() => {
    const normalized = query.trim();
    if (!open || !normalized) return;

    const controller = new AbortController();
    const cached = resultCache.current.get(normalized.toLocaleLowerCase());
    const freshCache = cached && cached.expires > Date.now() ? cached : undefined;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        if (freshCache) {
          setResults(freshCache.results);
          setResolvedQuery(normalized);
          setStatus("done");
          return;
        }
        const response = await fetch("/api/search?q=" + encodeURIComponent(normalized), { signal: controller.signal });
        if (!response.ok) throw new Error("Search request failed");
        const matches = (await response.json()) as ArticleSummary[];
        if (controller.signal.aborted) return;
        if (resultCache.current.size >= 20) resultCache.current.delete(resultCache.current.keys().next().value!);
        resultCache.current.set(normalized.toLocaleLowerCase(), { results: matches, expires: Date.now() + 30_000 });
        setResults(matches);
        setResolvedQuery(normalized);
        setStatus("done");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResolvedQuery(normalized);
          setStatus("error");
        }
      }
    }, freshCache ? 0 : 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const normalizedQuery = query.trim();
  const showingCurrentQuery = normalizedQuery.length > 0 && normalizedQuery === resolvedQuery;

  return (
    <>
      <button
        type="button"
        aria-label="搜索文章"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="搜索文章（Ctrl/⌘ K）"
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)] shadow-md shadow-blue-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <Search aria-hidden="true" size={18} />
      </button>

      {open && typeof document !== "undefined" && createPortal((
        <div className="search-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section ref={dialogRef} className="search-dialog" role="dialog" aria-modal="true" aria-label="搜索 TechAlpaca 文章">
            <form className="search-dialog-form" onSubmit={(event) => event.preventDefault()}>
              <Search size={21} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文章、主题或关键词..."
                aria-label="搜索文章、主题或关键词"
                autoComplete="off"
                spellCheck={false}
              />
              {query && <button type="button" className="search-clear" aria-label="清除搜索" onClick={() => { setQuery(""); inputRef.current?.focus(); }}><X size={17} /></button>}
              <button type="button" className="search-close" aria-label="关闭搜索" onClick={() => setOpen(false)}><X size={19} /></button>
            </form>

            <div className="search-dialog-content" aria-live="polite">
              {!normalizedQuery && <p className="search-dialog-hint">输入关键词，搜索文章标题、正文、标签与分类</p>}
              {normalizedQuery && !showingCurrentQuery && <p className="search-dialog-state"><LoaderCircle size={17} className="animate-spin" />正在搜索文章…</p>}
              {showingCurrentQuery && status === "loading" && <p className="search-dialog-state"><LoaderCircle size={17} className="animate-spin" />正在搜索文章…</p>}
              {showingCurrentQuery && status === "error" && <p className="search-dialog-state">搜索暂时不可用，请稍后再试。</p>}
              {showingCurrentQuery && status === "done" && results.length === 0 && <p className="search-dialog-state">没有找到相关文章，试试其他关键词。</p>}
              {showingCurrentQuery && status === "done" && results.length > 0 && (
                <div className="search-results">
                  <p className="search-results-label">{results.length === 10 ? "展示前 10 篇匹配文章，输入更具体的关键词可缩小范围" : `找到 ${results.length} 篇文章`}</p>
                  {results.map((article) => (
                    <Link prefetch={false} key={article.slug} href={"/article/" + article.slug} onClick={() => setOpen(false)} className="search-result">
                      <span className="search-result-copy"><span className="search-result-meta">{article.category} <i>/</i> {article.date}</span><strong><Highlight text={article.title} query={normalizedQuery} /></strong><small><Highlight text={article.description} query={normalizedQuery} /></small></span>
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <footer className="search-dialog-footer">
              <span><kbd>ESC</kbd> 关闭</span>
              <span><kbd>↵</kbd> 输入关键词后即时搜索</span>
              <span className="search-shortcut"><kbd>CTRL</kbd><b>或</b><kbd>⌘</kbd><i>+</i><kbd>K</kbd> 打开搜索</span>
            </footer>
          </section>
        </div>
      ), document.body)}
    </>
  );
}
