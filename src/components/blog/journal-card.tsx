"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleSummary } from "@/modules/content/types";
const JournalBody = dynamic(() => import("./journal-body"), { loading: () => <p className="journal-loading">正在排版正文…</p> });
export function JournalCard({ article, excerpt, long, label, priority }: { article: ArticleSummary; excerpt: string; long: boolean; label: string; priority: boolean }) {
  const [active, setActive] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const preview = <div className="journal-excerpt">{excerpt.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
  useEffect(() => {
    if (!long || !cardRef.current) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver((entries) => {
      window.clearTimeout(timer);
      if (entries.some((entry) => entry.isIntersecting)) {
        timer = window.setTimeout(() => { setActive(true); observer.disconnect(); }, 350);
      }
    }, { rootMargin: "160px" });
    observer.observe(cardRef.current);
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, [long]);
  useEffect(() => {
    const content = contentRef.current;
    const body = bodyRef.current;
    if (!content || !body) return;
    const measure = () => {
      const height = Math.ceil(content.getBoundingClientRect().height);
      body.style.setProperty("--journal-rest-height", `${Math.min(height, 180)}px`);
      body.style.setProperty("--journal-open-height", `${Math.min(height, 320)}px`);
      body.style.setProperty("--journal-touch-height", `${Math.min(height, 240)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!long || !active || source !== null) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setFailed(true); controller.abort(); }, 20000);
    Promise.all([fetch(`/api/journal/${encodeURIComponent(article.slug)}`, { signal: controller.signal }), import("./journal-body")]).then(async ([response]) => {
      if (!response.ok) throw new Error("正文载入失败");
      const data = await response.json() as { content?: unknown };
      if (typeof data.content !== "string") throw new Error("正文格式无效");
      const content = data.content;
      startTransition(() => { setSource(content); setFailed(false); });
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); }).finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [article.slug, active, long, source, retry]);
  return <article ref={cardRef} className="journal-card" onPointerEnter={() => setActive(true)} onFocusCapture={() => setActive(true)}>
    {article.cover && !imageFailed && <Link href={`/article/${article.slug}`} className="journal-card-cover" aria-label={`阅读：${article.title}`}>
      <Image
        src={article.cover}
        alt=""
        width={960}
        height={540}
        sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 2rem)"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        unoptimized={article.cover.includes("techalpaca.vercel.app")}
        onError={() => setImageFailed(true)}
      />
    </Link>}
    <div className="journal-card-copy">
      <div className="journal-card-meta"><time dateTime={article.date}>{article.date.replaceAll("-", ".")}</time><span>{label}</span></div>
      <h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2>
      <div ref={bodyRef} className="journal-scroll-region journal-scroll-body" role="region" aria-label={`${article.title}，可滚动阅读`} tabIndex={0}>
        <div ref={contentRef} className="journal-body-content">
        {long && source !== null ? <JournalBody source={source} /> : preview}
        {failed && <div className="journal-load-error" role="alert"><p>正文暂时无法载入，可前往阅读页。</p><button type="button" onClick={() => { setFailed(false); setRetry((value) => value + 1); }}>重新加载</button></div>}
        </div>
      </div>
      <div className="journal-card-actions"><Link href={`/article/${article.slug}`} aria-label={`在阅读页打开：${article.title}`}>阅读页 <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    </div>
  </article>;
}
