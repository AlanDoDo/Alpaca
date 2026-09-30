"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ArticleBody } from "@/components/blog/article-body";
import { isRoboticsArticle, researchCategories, researchTopic } from "@/modules/content/research";
import { journalTopic, journalTopics } from "@/modules/content/journal";
import type { ArticleCategory, ArticleSummary } from "@/modules/content/types";
import { ArrowDownToLine, ArrowLeft, Bold, Check, ChevronDown, Code2, Eye, FilePlus2, Heading2, Heading3, Italic, LoaderCircle, LogOut, Quote, Search, Send, BookOpen, List, ListOrdered, ListTodo, Link2, Minus, Strikethrough, Table2, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const categories: ArticleCategory[] = ["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"];
type Draft = { notesTopic?: string; researchTopic?: string; contentType?: "blog"; id?: string; aliases?: string[]; slug: string; title: string; description: string; date: string; category: ArticleCategory; tags: string[]; author: string; featured: boolean; cover: string; content: string; expectedSha: string | null };
type Status = "saved" | "saving" | "changed";
const localDate = () => { const date = new Date(); return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); };
const blankDraft = (slug = "article-muhzgyj2"): Draft => ({ researchTopic: "control", slug, title: "", description: "", date: localDate(), category: "机器人", tags: [], author: "TechAlpaca", featured: false, cover: "", content: "", expectedSha: null });

function draftKey(slug: string) { return `techalpaca:article-draft:${slug || "new"}`; }

export function ArticleEditor({ articles }: { articles: ArticleSummary[] }) {
  const [draft, setDraft] = useState<Draft>(() => blankDraft());
  const previewContent = useDeferredValue(draft.content);
  const linkedPreview = useMemo(() => previewContent.split(/(```[^]*?```|~~~[^]*?~~~|`[^`\n]*`)/g).map((part, index) => index % 2 ? part : part.replace(/(?<!!)\[\[([^\]\n]+)\]\]/g, (_match, reference: string) => {
    const [target, label] = reference.split("|");
    const name = target.split("#")[0].trim().replace(/\.mdx?$/, "").normalize("NFKC").toLocaleLowerCase();
    const matches = articles.filter((item) => [item.id ?? `blog:${item.slug}`, item.slug, item.title, ...(item.aliases ?? [])].some((value) => value.normalize("NFKC").toLocaleLowerCase() === name));
    const text = (label || target).replace(/[\[\]\n]/g, "");
    return matches.length === 1 ? `[${text}](${matches[0].href ?? `/article/${matches[0].slug}`})` : text;
  })).join(""), [previewContent, articles]);
  const previewBody = useMemo(() => <ArticleBody source={linkedPreview || "开始输入 Markdown，文章预览会即时更新。\n\n## 章节标题\n\n支持 **粗体**、列表、链接、代码和表格。"} headings={[]} />, [linkedPreview]);
  const router = useRouter();
  const [status, setStatus] = useState<Status>("saved");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [query, setQuery] = useState("");
  const [librarySection, setLibrarySection] = useState<"all" | "research" | "notes">("all");
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showArticleMenu, setShowArticleMenu] = useState(false);
  const [loadingArticleSlug, setLoadingArticleSlug] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const articleMenuRef = useRef<HTMLDivElement>(null);
  const draftReadyRef = useRef(false);
  const draftRef = useRef(draft);
  const libraryArticles = useMemo(() => articles.map((article) => {
    const research = isRoboticsArticle(article);
    const section = research ? "research" : "notes";
    const topic = research ? researchCategories.find((item) => item.id === researchTopic(article))!.title : journalTopics.find((item) => item.id === journalTopic(article))!.title;
    return { article, section, topic, label: research ? "Research" : "Notes" };
  }), [articles]);
  const researchCount = libraryArticles.filter((item) => item.section === "research").length;
  const filteredArticles = useMemo(() => libraryArticles.filter((item) => (librarySection === "all" || item.section === librarySection) && `${item.article.title} ${item.article.category} ${item.article.slug} ${item.label} ${item.topic}`.toLowerCase().includes(query.trim().toLowerCase())), [libraryArticles, librarySection, query]);
  const visibleArticles = showAllArticles ? filteredArticles : filteredArticles.slice(0, 6);
  const draftIsResearch = isRoboticsArticle(draft);
  const draftSection = draftIsResearch ? "Research" : "Notes";
  const draftTopic = draftIsResearch ? researchCategories.find((item) => item.id === researchTopic(draft))!.title : journalTopics.find((item) => item.id === journalTopic(draft))!.title;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const latestSlug = window.localStorage.getItem("techalpaca:article-draft:latest");
        const latest = latestSlug ? window.localStorage.getItem(`techalpaca:article-draft:${latestSlug}`) : null;
        if (latest) {
          const restored = JSON.parse(latest) as Draft;
          if (restored.slug === latestSlug && typeof restored.content === "string") {
            draftRef.current = restored;
            setDraft(restored);
          }
        }
      } catch { /* Ignore invalid browser draft data. */ }
      draftReadyRef.current = true;
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const saveDraft = useCallback((value: Draft) => {
    try {
      window.localStorage.setItem(draftKey(value.slug), JSON.stringify({ ...value, localSavedAt: new Date().toISOString() }));
      window.localStorage.setItem("techalpaca:article-draft:latest", value.slug);
      setStatus("saved");
      return true;
    } catch {
      setStatus("changed");
      setNotice("浏览器暂不允许保存草稿，请检查存储空间或隐私设置。");
      setNoticeError(true);
      return false;
    }
  }, []);

  useEffect(() => {
    draftRef.current = draft;
    if (!draftReadyRef.current) return;
    const timeout = window.setTimeout(() => saveDraft(draft), 450);
    return () => window.clearTimeout(timeout);
  }, [draft, saveDraft]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (status === "saved") return;
      saveDraft(draftRef.current);
      event.preventDefault();
      event.returnValue = "";
    }
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDraft(draftRef.current);
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [saveDraft, status]);

  function guardNavigation(event: MouseEvent<HTMLDivElement>) {
    if (status === "saved" || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const next = new URL(anchor.href, window.location.href);
    if (next.origin !== window.location.origin || next.pathname === window.location.pathname) return;
    if (!window.confirm("草稿仍在保存或尚未保存，确定离开写作台吗？")) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    saveDraft(draftRef.current);
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setStatus("saving"); setDraft((current) => { const next = { ...current, [key]: value }; draftRef.current = next; return next; }); }

  function loadLocalDraft(base: Draft) {
    try {
      const saved = window.localStorage.getItem(draftKey(base.slug));
      if (saved) {
        const parsed = JSON.parse(saved) as Draft & { localSavedAt?: string };
        if (parsed.slug === base.slug) return { ...base, ...parsed, expectedSha: base.expectedSha, contentType: base.contentType, id: base.id };
      }
    } catch { /* Ignore an invalid stale browser draft. */ }
    return base;
  }

  function createArticle() {
    if (!saveDraft(draftRef.current)) return;
    setNotice("");
    const nextDraft = loadLocalDraft({ ...blankDraft(`article-${Date.now().toString(36)}`), contentType: "blog", researchTopic: "control" });
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setMobileTab("edit");
  }

  async function editArticle(slug: string, contentType: "blog" = "blog") {
    setLoadingArticleSlug(slug);
    setNotice("");
    if (!saveDraft(draftRef.current)) { setLoadingArticleSlug(null); return; }
    try {
      const response = await fetch(`/api/admin/articles?slug=${encodeURIComponent(slug)}&type=${contentType}`, { cache: "no-store" });
      const data = await response.json() as Draft & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "文章载入失败，请稍后重试。");
      const nextDraft = loadLocalDraft(data);
      draftRef.current = nextDraft;
      setDraft(nextDraft);
      setStatus("saved");
      setMobileTab("edit");
      setShowArticleMenu(false);
      setQuery("");
      setShowAllArticles(false);
      setNotice(`已载入《${nextDraft.title}》，编辑后可发布更新。`);
      setNoticeError(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "文章载入失败，请稍后重试。");
      setNoticeError(true);
    } finally {
      setLoadingArticleSlug(null);
    }
  }

  useEffect(() => {
    if (!showArticleMenu) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !articleMenuRef.current?.contains(event.target)) setShowArticleMenu(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowArticleMenu(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showArticleMenu]);

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

  function prefixMarkdownLines(prefix: string) {
    const input = textareaRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const lineStart = draft.content.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const selectedEnd = draft.content.indexOf("\n", end);
    const lineEnd = selectedEnd === -1 ? draft.content.length : selectedEnd;
    const block = draft.content.slice(lineStart, lineEnd) || "内容";
    const nextBlock = block.split("\n").map((line) => `${prefix}${line}`).join("\n");
    update("content", `${draft.content.slice(0, lineStart)}${nextBlock}${draft.content.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(lineStart, lineStart + nextBlock.length);
    });
  }

  function insertBlock(template: string, selectOffset = template.length) {
    const input = textareaRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const needsLeadingBreak = start > 0 && draft.content[start - 1] !== "\n";
    const prefix = needsLeadingBreak ? "\n\n" : "";
    const insertion = `${prefix}${template}`;
    const next = `${draft.content.slice(0, start)}${insertion}${draft.content.slice(end)}`;
    update("content", next);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + prefix.length + selectOffset;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && !event.shiftKey) {
      const key = event.key.toLowerCase();
      if (key === "b" || key === "i" || key === "k") {
        event.preventDefault();
        if (key === "b") insertMarkdown("**", "**");
        if (key === "i") insertMarkdown("*", "*");
        if (key === "k") insertMarkdown("[", "](https://)", "链接文字");
        return;
      }
    }
    if (event.key === "Tab") {
      event.preventDefault();
      insertMarkdown("  ", "", "");
    }
  }

  const wordCount = draft.content.trim() ? draft.content.trim().split(/\s+/u).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 300));

  async function publish() {
    setPublishing(true); setNotice("");
    try {
      const response = await fetch("/api/admin/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, expectedSha: draft.expectedSha }) });
      const data = await response.json() as { ok?: boolean; error?: string; expectedSha?: string };
      if (!response.ok) throw new Error(data.error ?? "发布失败，请稍后重试。");
      if (data.expectedSha) setDraft((current) => ({ ...current, expectedSha: data.expectedSha ?? current.expectedSha }));
      setPublishOpen(false); setNotice("发布成功！文章已提交到 GitHub，Vercel 正在自动部署；稍后会更新到网站。"); setNoticeError(false);
      saveDraft({ ...draft, expectedSha: data.expectedSha ?? draft.expectedSha });
    } catch (error) { setNotice(error instanceof Error ? error.message : "发布失败，请稍后重试。"); setNoticeError(true); }
    finally { setPublishing(false); }
  }

  function exportDraft() {
    try {
      const fields = { ...(draft.notesTopic ? { notesTopic: draft.notesTopic } : {}), id: draft.id ?? `${draft.contentType ?? "blog"}:${draft.slug}`, aliases: draft.aliases ?? [], ...(draft.researchTopic ? { researchTopic: draft.researchTopic } : {}), title: draft.title, description: draft.description, date: draft.date, category: draft.category, tags: draft.tags, author: draft.author, featured: draft.featured, ...(draft.cover ? { cover: draft.cover } : {}) };
      const markdown = `---\n${Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join("\n")}\n---\n\n${draft.content}`;
      const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url; link.download = `${draft.slug || "draft"}.md`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setNotice("下载失败，请重试。"); setNoticeError(true); }
  }

  async function logout() {
    setLoggingOut(true);
    try { await fetch("/api/admin/session", { method: "DELETE" }); router.replace("/admin/login"); router.refresh(); }
    catch { setLoggingOut(false); setNotice("退出失败，请刷新页面后重试。"); setNoticeError(true); }
  }

  const markdownPanel = (
    <section className={`admin-pane min-h-[620px] flex-col ${mobileTab === "edit" ? "flex" : "hidden"} lg:flex`} aria-label="Markdown 编辑器">
      <div className="admin-pane-header"><div><p className="admin-eyebrow">WRITE</p><h2>Markdown</h2></div><span className="admin-mono">{draft.content.length.toLocaleString()} 字符</span></div>
      <div className="admin-toolbar" role="toolbar" aria-label="Markdown 格式工具">
        <div className="admin-toolbar-group" aria-label="标题"><button type="button" title="二级标题" aria-label="插入二级标题" onClick={() => prefixMarkdownLines("## ")}><Heading2 /></button><button type="button" title="三级标题" aria-label="插入三级标题" onClick={() => prefixMarkdownLines("### ")}><Heading3 /></button></div>
        <span aria-hidden="true" />
        <div className="admin-toolbar-group" aria-label="文字样式"><button type="button" title="粗体 · Ctrl/⌘ B" aria-label="粗体" onClick={() => insertMarkdown("**", "**")}><Bold /></button><button type="button" title="斜体 · Ctrl/⌘ I" aria-label="斜体" onClick={() => insertMarkdown("*", "*")}><Italic /></button><button type="button" title="删除线" aria-label="删除线" onClick={() => insertMarkdown("~~", "~~")}><Strikethrough /></button><button type="button" title="行内代码" aria-label="行内代码" onClick={() => insertMarkdown("`", "`", "code")}><Code2 /></button></div>
        <span aria-hidden="true" />
        <div className="admin-toolbar-group" aria-label="内容块"><button type="button" title="引用" aria-label="引用" onClick={() => prefixMarkdownLines("> ")}><Quote /></button><button type="button" title="无序列表" aria-label="无序列表" onClick={() => prefixMarkdownLines("- ")}><List /></button><button type="button" title="有序列表" aria-label="有序列表" onClick={() => prefixMarkdownLines("1. ")}><ListOrdered /></button><button type="button" title="任务清单" aria-label="任务清单" onClick={() => prefixMarkdownLines("- [ ] ")}><ListTodo /></button><button type="button" title="分隔线" aria-label="插入分隔线" onClick={() => insertBlock("---\n\n")}><Minus /></button></div>
        <span aria-hidden="true" />
        <div className="admin-toolbar-group" aria-label="插入内容"><button type="button" title="链接 · Ctrl/⌘ K" aria-label="插入链接" onClick={() => insertMarkdown("[", "](https://)", "链接文字")}><Link2 /></button><button type="button" title="图片" aria-label="插入图片 Markdown" onClick={() => insertMarkdown("![", "](图片地址)", "图片描述")}><ImagePlus /></button><button type="button" title="代码块" aria-label="插入代码块" onClick={() => insertBlock("```语言\n代码\n```", 3)}><Code2 /></button><button type="button" title="表格" aria-label="插入表格" onClick={() => insertBlock("| 列一 | 列二 |\n| --- | --- |\n| 内容 | 内容 |\n", 0)}><Table2 /></button><button type="button" title="文章双向链接" aria-label="插入文章双向链接" onClick={() => insertMarkdown("[[", "]]", "blog:stm32|STM32 学习笔记")}><BookOpen /></button></div>
      </div>
      <textarea ref={textareaRef} aria-label="文章 Markdown 正文" className="admin-markdown-textarea" onChange={(event) => update("content", event.target.value)} onKeyDown={handleEditorKeyDown} placeholder={"从这里开始写作…\n\n支持标题、列表、链接、代码、表格、任务清单和文章双向链接。"} spellCheck value={draft.content} />
      <div className="admin-pane-footer"><span>{wordCount.toLocaleString()} 词 · 约 {readingMinutes} 分钟阅读 · Tab 缩进 · Ctrl/⌘ B/I/K 格式快捷键</span><button className="admin-quiet-button" type="button" disabled={!draft.content} onClick={() => { if (window.confirm("确定清空正文吗？建议先导出 Markdown 备份。")) update("content", ""); }}>清空正文</button></div>
    </section>
  );

  return (
    <div className="admin-workspace mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <header className="admin-topbar">
        <div className="min-w-0"><Link href="/" className="text-sm font-semibold tracking-tight">TechAlpaca <span className="font-normal text-[var(--muted)]">/ Studio</span></Link><h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">文章工作台</h1><p className="mt-1 text-sm text-[var(--muted)]">Markdown 写作、即时预览与 GitHub 发布</p></div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><button aria-label="立即保存草稿" className="admin-save-indicator" onClick={() => saveDraft(draftRef.current)} title="草稿自动保存在此浏览器；按 Ctrl+S 或点击此处立即保存" type="button"><span className={`admin-save-dot ${status === "saving" ? "is-saving" : ""}`} />{status === "saving" ? "正在保存草稿" : status === "saved" ? "草稿已保存 · Ctrl+S" : "尚未保存，点击保存"}</button><button className="admin-quiet-button" disabled={loggingOut} onClick={logout} type="button"><LogOut className="size-4" /><span className="hidden sm:inline">{loggingOut ? "退出中" : "退出"}</span></button></div>
      </header>

      {notice && <div className={`admin-notice ${noticeError ? "is-error" : ""}`} role={noticeError ? "alert" : "status"}><span>{notice}</span><button aria-label="关闭提示" onClick={() => setNotice("")}><X className="size-4" /></button></div>}

      <div className="admin-layout mt-6 lg:mt-8" onClickCapture={guardNavigation}>
        <section className="admin-writing-column">
          <div className="admin-editor-actions"><div className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted)]"><span className="admin-live-dot" />{draft.expectedSha ? "已发布文章" : "新建草稿"}<span>· {draftSection} / {draftTopic}</span></div><div className="flex items-center gap-2">
            <div className="admin-article-menu-wrap" ref={articleMenuRef}>
              <button aria-controls="admin-article-menu" aria-expanded={showArticleMenu} aria-haspopup="dialog" className="admin-secondary-button" onClick={() => setShowArticleMenu((current) => !current)} type="button"><BookOpen className="size-4" /><span>文章库</span><ChevronDown className={`size-3 transition-transform ${showArticleMenu ? "rotate-180" : ""}`} /></button>
              {showArticleMenu && <div aria-label="文章库" className="admin-article-menu" id="admin-article-menu" role="dialog">
                <div className="admin-library-sections" role="group" aria-label="文章所属板块">
                  {([{ id: "all", title: "全部", count: articles.length }, { id: "research", title: "Research", count: researchCount }, { id: "notes", title: "Notes", count: articles.length - researchCount }] as const).map((section) => <button type="button" key={section.id} aria-pressed={librarySection === section.id} onClick={() => { setLibrarySection(section.id); setShowAllArticles(false); }}>{section.title}<span>{section.count}</span></button>)}
                </div>
                <label className="admin-search"><Search className="size-4" /><input autoFocus aria-label="搜索文章" onChange={(event) => { setQuery(event.target.value); setShowAllArticles(false); }} placeholder="搜索标题、分类或板块" value={query} /></label>
                <div className="admin-library-list">{visibleArticles.map(({ article, label, topic }) => <button aria-busy={loadingArticleSlug === article.slug} className="admin-article-option" disabled={loadingArticleSlug !== null} key={`${article.contentType}:${article.slug}`} onClick={() => void editArticle(article.slug)} type="button"><span className="admin-option-category">{loadingArticleSlug === article.slug ? "正在载入文章…" : <><strong>{label}</strong> <span>·</span> {topic} <span>·</span> {article.date}</>}</span><span className="admin-option-title">{article.title}</span></button>)}{!filteredArticles.length && <p className="px-3 py-5 text-sm text-[var(--muted)]">该板块没有匹配的文章</p>}{filteredArticles.length > 6 && <button className="admin-library-more" onClick={() => setShowAllArticles((current) => !current)} type="button">{showAllArticles ? "收起文章" : `显示其余 ${filteredArticles.length - 6} 篇`}<ChevronDown className={showAllArticles ? "rotate-180" : ""} /></button>}</div>
                <p className="admin-article-menu-count">匹配 {filteredArticles.length} 篇文章 · 点击载入编辑器</p>
              </div>}
            </div>
            <button className="admin-secondary-button" onClick={exportDraft} type="button"><ArrowDownToLine className="size-4" />导出 .md</button>
            <button className="admin-secondary-button" onClick={createArticle} type="button"><FilePlus2 className="size-4" /><span>新建</span></button>
            <button className="admin-primary-button" onClick={() => {
              if (!draft.title.trim() || !draft.description.trim() || !draft.content.trim() || !draft.slug) {
                setNotice("发布前请填写标题、摘要、文章路径和正文。"); setNoticeError(true); return;
              }
              if (!saveDraft(draftRef.current)) return;
              setPublishOpen(true);
            }} type="button"><Send className="size-4" /><span>发布</span></button>
          </div></div>

          <div className="admin-meta-card">
            <div className="admin-section-summary"><strong>{draftSection}</strong><span>{draftTopic}</span><small>发布后展示的板块与分类</small></div>
            <label className="admin-field mb-4"><span>所属板块与分类</span><select aria-label="所属板块与分类" value={draft.notesTopic ? `notes:${draft.notesTopic}` : draft.researchTopic ?? ""} onChange={(event) => { const value = event.target.value; update("notesTopic", value.startsWith("notes:") ? value.slice(6) : undefined); update("researchTopic", value.startsWith("notes:") ? "" : value); }}><option value="">自动判断所属板块</option><optgroup label="Research">{researchCategories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup><optgroup label="Notes">{journalTopics.map((item) => <option key={item.id} value={`notes:${item.id}`}>{item.title}</option>)}</optgroup></select><small>选择 Notes 分类后只在 Notes 展示；选择 Research 方向后只在 Research 展示。自动模式根据文章原分类判断。</small></label>
            <p className="mb-4 text-xs leading-6 text-[var(--muted)]">双向链接写法：<code>[[blog:stm32|STM32 学习笔记]]</code>，也可以填写文章标题。发布后自动生成反向引用。</p>
            <div className="admin-field-row"><label className="admin-field admin-field-wide"><span>文章标题</span><input maxLength={160} onChange={(event) => update("title", event.target.value)} placeholder="写一个清晰、有吸引力的标题" value={draft.title} /></label><label className="admin-field admin-slug-field"><span>文章路径</span><input disabled={Boolean(draft.expectedSha || draft.id)} autoCapitalize="none" onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-"))} placeholder="article-slug" value={draft.slug} /><small>/article/{draft.slug || "…"}</small></label></div>
            <label className="admin-field mt-4"><span>文章摘要</span><textarea maxLength={320} onChange={(event) => update("description", event.target.value)} placeholder="用一两句话概括文章内容" rows={2} value={draft.description} /><small className="text-right">{draft.description.length}/320</small></label>
            <div className="admin-field-row mt-4"><label className="admin-field"><span>分类</span><select onChange={(event) => { update("category", event.target.value as ArticleCategory); if (event.target.value !== "机器人") update("researchTopic", ""); }} value={draft.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="admin-field"><span>日期</span><input onChange={(event) => update("date", event.target.value)} type="date" value={draft.date} /></label><label className="admin-field"><span>作者</span><input maxLength={80} onChange={(event) => update("author", event.target.value)} value={draft.author} /></label></div>
            <div className="admin-field-row mt-4"><label className="admin-field"><span>标签 <em>逗号分隔</em></span><input onChange={(event) => update("tags", event.target.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 20))} placeholder="具身智能, 机器人" value={draft.tags.join(", ")} /></label><label className="admin-field"><span>封面图 <em>可选</em></span><input onChange={(event) => update("cover", event.target.value)} placeholder="https://… 留空表示不使用封面" type="url" value={draft.cover} />{draft.cover && <span className="admin-cover-hint">封面已加载到右侧预览；无法显示时请检查 HTTPS 图片地址。</span>}</label></div>
            <label className="admin-featured-toggle"><input checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} type="checkbox" /><span>设为首页精选</span><small>精选文章会优先展示</small></label>
          </div>

          <div className="admin-mobile-tabs" role="tablist" aria-label="正文视图"><button aria-selected={mobileTab === "edit"} onClick={() => setMobileTab("edit")} role="tab" type="button">Markdown</button><button aria-selected={mobileTab === "preview"} onClick={() => setMobileTab("preview")} role="tab" type="button"><Eye className="size-4" />预览</button></div>
          <div className="admin-content-grid">{markdownPanel}
            <section className={`admin-pane admin-preview-pane min-h-[620px] flex-col ${mobileTab === "preview" ? "flex" : "hidden"} lg:flex`} aria-label="文章实时预览"><div className="admin-preview-scroll min-h-0 flex-1"><article className="admin-preview-article"><p className="admin-eyebrow">{draft.category}{draft.tags.length ? ` / ${draft.tags.slice(0, 2).join(" / ")}` : ""}</p><h1>{draft.title || "文章标题"}</h1><p className="admin-preview-description">{draft.description || "文章摘要将在这里展示。"}</p><div className="admin-preview-byline">{draft.author} <span>·</span> {draft.date}</div>{draft.cover && <Image alt="文章封面预览" className="admin-cover-preview" height={480} src={draft.cover} unoptimized width={960} />}</article>{previewBody}</div></section>
          </div>
          <footer className="admin-bottom-row"><Link className="admin-quiet-button" href="/blog"><ArrowLeft className="size-4" />返回网站</Link><span>草稿仅保存在此浏览器，发布后才会写入网站仓库。</span></footer>
        </section>
      </div>

      {publishOpen && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !publishing) setPublishOpen(false); }}><section aria-labelledby="publish-title" aria-modal="true" className="admin-confirm-modal" role="dialog"><button aria-label="关闭" className="admin-modal-close" disabled={publishing} onClick={() => setPublishOpen(false)} type="button"><X className="size-4" /></button><div className="admin-confirm-icon"><Send className="size-5" /></div><p className="admin-eyebrow mt-6">PUBLISH ARTICLE</p><h2 className="mt-2 text-2xl font-semibold" id="publish-title">发布到 TechAlpaca？</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">这会将 <strong className="text-[var(--ink)]">{draft.slug}.mdx</strong> 提交到 GitHub，并触发 Vercel 自动部署。网站文章将在部署完成后更新。</p><div className="admin-publish-summary"><span>{draft.category} · {draft.date}</span><strong>{draft.title || "未命名文章"}</strong></div><div className="mt-6 flex justify-end gap-3"><button className="admin-secondary-button" disabled={publishing} onClick={() => setPublishOpen(false)} type="button">继续编辑</button><button className="admin-primary-button" disabled={publishing} onClick={() => void publish()} type="button">{publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{publishing ? "正在发布…" : "确认发布"}</button></div></section></div>}
    </div>
  );
}
