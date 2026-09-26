"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleBody } from "@/components/blog/article-body";
import type { ArticleCategory, ArticleSummary } from "@/modules/content/types";
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, Bold, Check, ChevronDown, Code2, Eye, FilePlus2, Heading2, Italic, LoaderCircle, LogOut, Quote, Search, Send, Sparkles, List, Link2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const categories: ArticleCategory[] = ["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"];
type Draft = { slug: string; title: string; description: string; date: string; category: ArticleCategory; tags: string[]; author: string; featured: boolean; cover: string; content: string; expectedSha: string | null };
type Status = "saved" | "saving" | "changed";
const localDate = () => { const date = new Date(); return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); };
const blankDraft = (): Draft => ({ slug: `article-muhzgyj2`, title: "", description: "", date: localDate(), category: "机器人", tags: [], author: "TechAlpaca", featured: false, cover: "", content: "", expectedSha: null });

function draftKey(slug: string) { return `techalpaca:article-draft:${slug || "new"}`; }

export function ArticleEditor({ articles }: { articles: ArticleSummary[] }) {
  const [draft, setDraft] = useState<Draft>(() => blankDraft());
  const router = useRouter();
  const [status, setStatus] = useState<Status>("saved");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filteredArticles = useMemo(() => articles.filter((article) => `${article.title} ${article.category} ${article.slug}`.toLowerCase().includes(query.toLowerCase())), [articles, query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const latestSlug = window.localStorage.getItem("techalpaca:article-draft:latest");
        const latest = latestSlug ? window.localStorage.getItem(draftKey(latestSlug)) : null;
        if (latest) {
          const restored = JSON.parse(latest) as Draft;
          if (restored.slug === latestSlug && typeof restored.content === "string") setDraft(restored);
        }
      } catch { /* Ignore invalid browser draft data. */ }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try { window.localStorage.setItem(draftKey(draft.slug), JSON.stringify({ ...draft, localSavedAt: new Date().toISOString() })); window.localStorage.setItem("techalpaca:article-draft:latest", draft.slug); setStatus("saved"); }
      catch { setStatus("changed"); setNotice("浏览器暂不允许保存草稿，请检查存储空间或隐私设置。"); setNoticeError(true); }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setStatus("saving"); setDraft((current) => ({ ...current, [key]: value })); }

  function loadLocalDraft(base: Draft) {
    try {
      const saved = window.localStorage.getItem(draftKey(base.slug));
      if (saved) {
        const parsed = JSON.parse(saved) as Draft & { localSavedAt?: string };
        if (parsed.slug === base.slug) return { ...base, ...parsed, expectedSha: base.expectedSha };
      }
    } catch { /* Ignore an invalid stale browser draft. */ }
    return base;
  }

  async function openArticle(slug: string) {
    setNotice("");
    try {
      const response = await fetch(`/api/admin/articles?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await response.json() as Draft & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "读取文章失败。");
      setDraft(loadLocalDraft(data));
      setMobileTab("edit");
    } catch (error) { setNotice(error instanceof Error ? error.message : "读取文章失败。"); setNoticeError(true); }
  }

  function createArticle() {
    setNotice("");
    setDraft(loadLocalDraft(blankDraft()));
    setMobileTab("edit");
  }

  function insertMarkdown(before: string, after = "", placeholder = "文本") {
    const input = textareaRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selection = draft.content.slice(start, end) || placeholder;
    const next = `${draft.content.slice(0, start)}${before}${selection}${after}${draft.content.slice(end)}`;
    update("content", next);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + before.length, start + before.length + selection.length); });
  }

  async function publish() {
    setPublishing(true); setNotice("");
    try {
      const response = await fetch("/api/admin/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, expectedSha: draft.expectedSha }) });
      const data = await response.json() as { ok?: boolean; error?: string; expectedSha?: string };
      if (!response.ok) throw new Error(data.error ?? "发布失败，请稍后重试。");
      if (data.expectedSha) setDraft((current) => ({ ...current, expectedSha: data.expectedSha ?? current.expectedSha }));
      setPublishOpen(false); setNotice("已提交到 GitHub，Vercel 将自动开始部署。文章将在部署完成后更新到网站。"); setNoticeError(false);
      window.localStorage.removeItem(draftKey(draft.slug));
    } catch (error) { setNotice(error instanceof Error ? error.message : "发布失败，请稍后重试。"); setNoticeError(true); }
    finally { setPublishing(false); }
  }

  async function logout() {
    setLoggingOut(true);
    try { await fetch("/api/admin/session", { method: "DELETE" }); router.replace("/admin/login"); router.refresh(); }
    catch { setLoggingOut(false); setNotice("退出失败，请刷新页面后重试。"); setNoticeError(true); }
  }

  const markdownPanel = (
    <section className={`admin-pane min-h-[620px] flex-col ${mobileTab === "edit" ? "flex" : "hidden"} lg:flex`} aria-label="Markdown 编辑器">
      <div className="admin-pane-header"><div><p className="admin-eyebrow">WRITE</p><h2>Markdown</h2></div><span className="admin-mono">{draft.content.length.toLocaleString()} 字符</span></div>
      <div className="admin-toolbar" aria-label="Markdown 格式工具">
        <button title="二级标题" onClick={() => insertMarkdown("## ", "", "章节标题")}><Heading2 /></button>
        <span />
        <button title="粗体" onClick={() => insertMarkdown("**", "**")}><Bold /></button>
        <button title="斜体" onClick={() => insertMarkdown("*", "*")}><Italic /></button>
        <button title="引用" onClick={() => insertMarkdown("> ", "", "引用内容")}><Quote /></button>
        <button title="行内代码" onClick={() => insertMarkdown("`", "`", "code")}><Code2 /></button>
        <button title="无序列表" onClick={() => insertMarkdown("- ", "", "列表内容")}><List /></button>
        <button title="链接" onClick={() => insertMarkdown("[", "](https://)", "链接文字")}><Link2 /></button>
      </div>
      <textarea ref={textareaRef} aria-label="文章 Markdown 正文" className="admin-markdown-textarea" onChange={(event) => update("content", event.target.value)} placeholder={"从这里开始写作…\n\n支持 Markdown 与 GFM：标题、列表、链接、代码、表格和引用。"} spellCheck value={draft.content} />
      <div className="admin-pane-footer"><span>支持标准 Markdown 与 GitHub Flavored Markdown</span><button className="admin-quiet-button" type="button" onClick={() => update("content", "")}>清空正文</button></div>
    </section>
  );

  return (
    <div className="admin-workspace mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="admin-topbar">
        <div className="min-w-0"><Link href="/" className="text-sm font-semibold tracking-tight">TechAlpaca <span className="font-normal text-[var(--muted)]">/ Studio</span></Link><h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">文章工作台</h1><p className="mt-1 text-sm text-[var(--muted)]">Markdown 写作、即时预览与 GitHub 发布</p></div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><span className="admin-save-indicator"><span className={`admin-save-dot ${status === "saving" ? "is-saving" : ""}`} />{status === "saving" ? "正在保存草稿" : status === "saved" ? "草稿已保存" : "尚未保存"}</span><button className="admin-quiet-button" disabled={loggingOut} onClick={logout} type="button"><LogOut className="size-4" /><span className="hidden sm:inline">{loggingOut ? "退出中" : "退出"}</span></button></div>
      </header>

      {notice && <div className={`admin-notice ${noticeError ? "is-error" : ""}`} role={noticeError ? "alert" : "status"}><span>{notice}</span><button aria-label="关闭提示" onClick={() => setNotice("")}><X className="size-4" /></button></div>}

      <div className="admin-layout mt-6 lg:mt-8">
        <aside className="admin-library">
          <div className="flex items-center justify-between"><div><p className="admin-eyebrow">LIBRARY</p><h2 className="mt-1 text-lg font-semibold">文章</h2></div><button aria-label="新建文章" className="admin-icon-button" onClick={createArticle} title="新建文章" type="button"><FilePlus2 className="size-4" /></button></div>
          <label className="admin-search mt-4"><Search className="size-4" /><input aria-label="搜索文章" onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或分类" value={query} /></label>
          <div className="admin-library-list">
            <button className={`admin-article-option ${draft.expectedSha === null && !articles.some((article) => article.slug === draft.slug) ? "is-current" : ""}`} onClick={createArticle} type="button"><span className="admin-option-category">新文章</span><span className="admin-option-title">开始一篇新文章</span></button>
            {filteredArticles.map((article) => <button key={article.slug} className={`admin-article-option ${draft.slug === article.slug ? "is-current" : ""}`} onClick={() => void openArticle(article.slug)} type="button"><span className="admin-option-category">{article.category} <span>·</span> {article.date}</span><span className="admin-option-title">{article.title}</span></button>)}
            {!filteredArticles.length && <p className="px-3 py-5 text-sm text-[var(--muted)]">没有匹配的文章</p>}
          </div>
          <div className="admin-library-footer"><Sparkles className="size-4" /><span>共 {articles.length} 篇文章</span></div>
        </aside>

        <section className="admin-writing-column">
          <div className="admin-editor-actions"><div className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted)]"><span className="admin-live-dot" />{draft.expectedSha ? "已发布文章" : "新建草稿"}<ChevronDown className="size-3" /></div><div className="flex items-center gap-2"><button className="admin-secondary-button hidden sm:inline-flex" onClick={() => { try { const blob = new Blob([draft.content], { type: "text/markdown;charset=utf-8" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${draft.slug}.md`; link.click(); URL.revokeObjectURL(link.href); } catch { setNotice("下载失败，请重试。"); setNoticeError(true); } }} type="button"><ArrowDownToLine className="size-4" />导出 .md</button><button className="admin-primary-button" onClick={() => setPublishOpen(true)} type="button"><Send className="size-4" /><span>发布</span></button></div></div>

          <div className="admin-meta-card">
            <div className="admin-field-row"><label className="admin-field admin-field-wide"><span>文章标题</span><input maxLength={160} onChange={(event) => update("title", event.target.value)} placeholder="写一个清晰、有吸引力的标题" value={draft.title} /></label><label className="admin-field admin-slug-field"><span>文章路径</span><input autoCapitalize="none" onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-"))} placeholder="article-slug" value={draft.slug} /><small>/article/{draft.slug || "…"}</small></label></div>
            <label className="admin-field mt-4"><span>文章摘要</span><textarea maxLength={320} onChange={(event) => update("description", event.target.value)} placeholder="用一两句话概括文章内容" rows={2} value={draft.description} /><small className="text-right">{draft.description.length}/320</small></label>
            <div className="admin-field-row mt-4"><label className="admin-field"><span>分类</span><select onChange={(event) => update("category", event.target.value as ArticleCategory)} value={draft.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="admin-field"><span>日期</span><input onChange={(event) => update("date", event.target.value)} type="date" value={draft.date} /></label><label className="admin-field"><span>作者</span><input maxLength={80} onChange={(event) => update("author", event.target.value)} value={draft.author} /></label></div>
            <div className="admin-field-row mt-4"><label className="admin-field"><span>标签 <em>逗号分隔</em></span><input onChange={(event) => update("tags", event.target.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 20))} placeholder="具身智能, 机器人" value={draft.tags.join(", ")} /></label><label className="admin-field"><span>封面图 <em>可选</em></span><input onChange={(event) => update("cover", event.target.value)} placeholder="https://… 留空表示不使用封面" type="url" value={draft.cover} /></label></div>
            <label className="admin-featured-toggle"><input checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /><span>设为首页精选</span><small>精选文章会优先展示</small></label>
          </div>

          <div className="admin-mobile-tabs" role="tablist" aria-label="正文视图"><button aria-selected={mobileTab === "edit"} onClick={() => setMobileTab("edit")} role="tab" type="button">Markdown</button><button aria-selected={mobileTab === "preview"} onClick={() => setMobileTab("preview")} role="tab" type="button"><Eye className="size-4" />预览</button></div>
          <div className="admin-content-grid">{markdownPanel}
            <section className={`admin-pane admin-preview-pane ${mobileTab === "preview" ? "flex" : "hidden"} lg:flex`} aria-label="文章实时预览"><div className="admin-pane-header"><div><p className="admin-eyebrow">PREVIEW</p><h2>实时预览</h2></div><span className="admin-preview-badge"><span className="admin-live-dot" />LIVE</span></div><div className="admin-preview-scroll"><article className="admin-preview-article"><p className="admin-eyebrow">{draft.category}{draft.tags.length ? ` / ${draft.tags.slice(0, 2).join(" / ")}` : ""}</p><h1>{draft.title || "文章标题"}</h1><p className="admin-preview-description">{draft.description || "文章摘要将在这里展示。"}</p><div className="admin-preview-byline">{draft.author} <span>·</span> {draft.date}</div>{draft.cover && <Image alt="文章封面预览" className="admin-cover-preview" height={480} src={draft.cover} unoptimized width={960} />}</article><ArticleBody source={draft.content || "开始输入 Markdown，文章预览会即时更新。\n\n## 章节标题\n\n支持 **粗体**、列表、链接、代码和表格。"} headings={[]} /></div><div className="admin-pane-footer"><span>预览经过与正文相同的 HTML 安全清理</span><Link className="admin-quiet-button" href="/blog" target="_blank">查看网站 <ArrowUpRight className="size-3" /></Link></div></section>
          </div>
          <footer className="admin-bottom-row"><Link className="admin-quiet-button" href="/blog"><ArrowLeft className="size-4" />返回网站</Link><span>草稿仅保存在此浏览器，发布后才会写入网站仓库。</span></footer>
        </section>
      </div>

      {publishOpen && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !publishing) setPublishOpen(false); }}><section aria-labelledby="publish-title" aria-modal="true" className="admin-confirm-modal" role="dialog"><button aria-label="关闭" className="admin-modal-close" disabled={publishing} onClick={() => setPublishOpen(false)} type="button"><X className="size-4" /></button><div className="admin-confirm-icon"><Send className="size-5" /></div><p className="admin-eyebrow mt-6">PUBLISH ARTICLE</p><h2 className="mt-2 text-2xl font-semibold" id="publish-title">发布到 TechAlpaca？</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">这会将 <strong className="text-[var(--ink)]">{draft.slug}.mdx</strong> 提交到 GitHub，并触发 Vercel 自动部署。网站文章将在部署完成后更新。</p><div className="admin-publish-summary"><span>{draft.category} · {draft.date}</span><strong>{draft.title || "未命名文章"}</strong></div><div className="mt-6 flex justify-end gap-3"><button className="admin-secondary-button" disabled={publishing} onClick={() => setPublishOpen(false)} type="button">继续编辑</button><button className="admin-primary-button" disabled={publishing} onClick={() => void publish()} type="button">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{publishing ? "正在发布…" : "确认发布"}</button></div></section></div>}
    </div>
  );
}