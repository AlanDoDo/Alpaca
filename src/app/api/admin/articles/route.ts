import { NextRequest, NextResponse } from "next/server";
import { parseFrontmatter } from "@/lib/parse-frontmatter";
import { readJsonObject, RequestBodyError } from "@/lib/request-json";
import fs from "node:fs";
import path from "node:path";
import { isRoboticsArticle, researchCategories, researchTopic } from "@/modules/content/research";
import { journalTopics } from "@/modules/content/journal";
import { getArticleBySlug } from "@/modules/content";
import { adminAuthConfigured, verifyAdminSessionValue, ADMIN_COOKIE } from "@/lib/admin-auth";
import { isSameOriginRequest } from "@/lib/request-origin";
import type { ArticleCategory } from "@/modules/content/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categories: ArticleCategory[] = ["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maxArticleBytes = 500_000;

type ArticleDraft = {
  notesTopic?: unknown; researchTopic?: unknown; contentType?: unknown; id?: unknown; aliases?: unknown; slug?: unknown; title?: unknown; description?: unknown; date?: unknown; category?: unknown;
  tags?: unknown; author?: unknown; featured?: unknown; cover?: unknown; content?: unknown; expectedSha?: unknown; forceOverwrite?: unknown;
};

type ValidatedDraft = { notesTopic?: string; researchTopic?: string; contentType: "blog"; id: string; aliases: string[]; slug: string; title: string; description: string; date: string; category: ArticleCategory; tags: string[]; author: string; featured: boolean; cover: string; content: string; expectedSha: string | null; forceOverwrite: boolean };
function authorized(request: NextRequest) {
  return adminAuthConfigured() && verifyAdminSessionValue(request.cookies.get(ADMIN_COOKIE)?.value);
}

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

function githubHeaders(token: string) {
  return { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
}

function githubFileUrl(owner: string, repo: string, slug: string) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/content/blog/${encodeURIComponent(slug)}.mdx`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "请先登录管理员后台。" }, { status: 401 });
  const requestedType = request.nextUrl.searchParams.get("type") ?? "blog";
  if (requestedType !== "blog") return NextResponse.json({ error: "内容类型无效。" }, { status: 400 });
  const contentType = "blog" as const;
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  if (!slugPattern.test(slug) || slug.length > 100) return NextResponse.json({ error: "文章标识无效。" }, { status: 400 });

  const config = githubConfig();
  if (config) {
    try {
      const response = await fetch(`${githubFileUrl(config.owner, config.repo, slug)}?ref=${encodeURIComponent(config.branch)}`, { headers: githubHeaders(config.token), cache: "no-store" });
      if (response.ok) {
        const file = await response.json() as { content?: string; encoding?: string; sha?: string };
        if (!file.content || file.encoding !== "base64" || !file.sha) return NextResponse.json({ error: "暂时无法读取这篇文章。" }, { status: 502 });
        const raw = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
        const parsed = parseFrontmatter(raw);
        const classification = { notesTopic: parsed.data.notesTopic, researchTopic: parsed.data.researchTopic, category: parsed.data.category, title: parsed.data.title ?? "", tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [] };
        return NextResponse.json({ notesTopic: parsed.data.notesTopic, researchTopic: isRoboticsArticle(classification) ? researchTopic(classification) : undefined, contentType, id: parsed.data.id ?? `${contentType}:${slug}`, aliases: Array.isArray(parsed.data.aliases) ? parsed.data.aliases : [], slug, title: parsed.data.title ?? "", description: parsed.data.description ?? "", date: typeof parsed.data.date === "string" ? parsed.data.date : new Date().toISOString().slice(0, 10), category: parsed.data.category ?? "机器人", tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [], author: parsed.data.author ?? "TechAlpaca", featured: parsed.data.featured === true, cover: parsed.data.cover ?? "", content: parsed.content.trimStart(), expectedSha: file.sha });
      }
      if (response.status !== 404) return NextResponse.json({ error: "从 GitHub 读取文章失败，请稍后重试。" }, { status: 502 });
    } catch {
      return NextResponse.json({ error: "连接 GitHub 失败，请检查网络后重试。" }, { status: 502 });
    }
  }

  const article = getArticleBySlug(slug);
  if (!article) return NextResponse.json({ error: "文章不存在，或 GitHub 尚未配置。" }, { status: 404 });
  const filePath = [".mdx", ".md"].map((extension) => path.join(process.cwd(), "content/blog", slug + extension)).find((candidate) => fs.existsSync(candidate));
  const parsed = parseFrontmatter(filePath ? fs.readFileSync(filePath, "utf8") : "");
  return NextResponse.json({ notesTopic: parsed.data.notesTopic, researchTopic: isRoboticsArticle(article) ? researchTopic(article) : undefined, contentType, id: parsed.data.id ?? `blog:${slug}`, aliases: Array.isArray(parsed.data.aliases) ? parsed.data.aliases : [], slug, title: article.title, description: article.description, date: article.date, category: article.category, tags: article.tags, author: parsed.data.author ?? "TechAlpaca", featured: article.featured, cover: article.cover ?? "", content: article.content, expectedSha: null });
}

function validateDraft(body: ArticleDraft) {
  const contentType = body.contentType === undefined ? "blog" : body.contentType;
  if (contentType !== "blog") return { error: "内容类型无效。" };
  const topic = typeof body.researchTopic === "string" && body.researchTopic ? body.researchTopic : undefined;
  const notesTopic = typeof body.notesTopic === "string" && body.notesTopic ? body.notesTopic : undefined;
  if (notesTopic && !journalTopics.some((item) => item.id === notesTopic)) return { error: "Notes 分类无效。" };
  if (notesTopic && topic) return { error: "请只选择 Research 或 Notes 的一个分类。" };
  if (topic && !researchCategories.some((item) => item.id === topic)) return { error: "机器人方向无效。" };
  const aliases = Array.isArray(body.aliases) ? body.aliases.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];
  if (aliases.length > 20 || aliases.some((item) => item.length > 160)) return { error: "别名最多 20 个，每个不能超过 160 字。" };
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const category = typeof body.category === "string" ? body.category as ArticleCategory : undefined;
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 20) : [];
  const author = typeof body.author === "string" ? body.author.trim() : "TechAlpaca";
  const featured = body.featured === true;
  const cover = typeof body.cover === "string" ? body.cover.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  if (!slugPattern.test(slug) || slug.length > 100) return { error: "文章路径只支持小写英文、数字和连字符。" };
  if (!title || title.length > 160) return { error: "标题必填，且不能超过 160 个字符。" };
  if (!description || description.length > 320) return { error: "摘要必填，且不能超过 320 个字符。" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return { error: "日期格式请使用 YYYY-MM-DD。" };
  if (!category || !categories.includes(category)) return { error: "请选择有效分类。" };
  if (author.length > 80) return { error: "作者名称不能超过 80 个字符。" };
  if (tags.some((tag) => tag.length > 80)) return { error: "单个标签不能超过 80 个字符。" };
  if (cover && (!/^https:\/\//i.test(cover) || cover.length > 2048)) return { error: "封面请填写有效的 HTTPS 图片地址；留空表示无封面。" };
  if (!content.trim() || Buffer.byteLength(content, "utf8") > maxArticleBytes) return { error: "正文不能为空，且不能超过 500 KB。" };
  if (typeof body.expectedSha !== "string" && body.expectedSha !== null) return { error: "文章版本信息无效，请重新打开文章。" };
  if (typeof body.expectedSha === "string" && !/^[a-f0-9]{40}$/.test(body.expectedSha)) return { error: "文章版本信息无效，请重新打开文章。" };
  if (body.forceOverwrite !== undefined && typeof body.forceOverwrite !== "boolean") return { error: "覆盖选项无效。" };
  const id = `${contentType}:${slug}`;
  if (body.id !== undefined && body.id !== id) return { error: "内容标识不匹配，请重新打开文章。" };
  return { value: { notesTopic, researchTopic: topic, contentType, id, aliases, slug, title, description, date, category, tags, author: author || "TechAlpaca", featured, cover, content, expectedSha: body.expectedSha as string | null, forceOverwrite: body.forceOverwrite === true } satisfies ValidatedDraft };
}

function frontmatter(value: ValidatedDraft) {
  const fields = [
    `id: ${JSON.stringify(value.id)}`,
    `aliases: ${JSON.stringify(value.aliases)}`,
    ...(value.notesTopic ? [`notesTopic: ${JSON.stringify(value.notesTopic)}`] : []),
    ...(value.researchTopic ? [`researchTopic: ${JSON.stringify(value.researchTopic)}`] : []),
    `title: ${JSON.stringify(value.title)}`,
    `description: ${JSON.stringify(value.description)}`,
    `date: ${JSON.stringify(value.date)}`,
    `category: ${JSON.stringify(value.category)}`,
    `tags: ${JSON.stringify(value.tags)}`,
    `author: ${JSON.stringify(value.author)}`,
    `featured: ${value.featured}`,
    ...(value.cover ? [`cover: ${JSON.stringify(value.cover)}`] : []),
  ];
  return `---\n${fields.join("\n")}\n---\n\n${value.content.trim()}\n`;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源校验失败。" }, { status: 403 });
  if (!authorized(request)) return NextResponse.json({ error: "登录状态已失效，请重新登录。" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "请求格式无效。" }, { status: 415 });
  let body: ArticleDraft;
  // JSON escaping can expand Markdown by up to six bytes per source character.
  try { body = await readJsonObject(request, maxArticleBytes * 6 + 32_000); } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: status === 413 ? "文章内容超过允许大小。" : "请求内容无效。" }, { status });
  }
  const validated = validateDraft(body);
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const config = githubConfig();
  if (!config) return NextResponse.json({ error: "发布配置尚未完成。请在本地 .env.local 或 Vercel 环境变量中设置 GITHUB_TOKEN、GITHUB_OWNER、GITHUB_REPO、GITHUB_BRANCH。" }, { status: 503 });
  const value = validated.value;
  const url = githubFileUrl(config.owner, config.repo, value.slug);
  try {
    const existingResponse = await fetch(`${url}?ref=${encodeURIComponent(config.branch)}`, { headers: githubHeaders(config.token), cache: "no-store" });
    let currentSha: string | null = null;
    if (existingResponse.ok) {
      const existing = await existingResponse.json() as { sha?: string; content?: string; encoding?: string };
      currentSha = existing.sha ?? null;
      if (existing.content && existing.encoding === "base64") {
        const previous = parseFrontmatter(Buffer.from(existing.content.replace(/\n/g, ""), "base64").toString("utf8"));
        const oldAliases = Array.isArray(previous.data.aliases) ? previous.data.aliases.filter((item): item is string => typeof item === "string") : [];
        const oldTitle = typeof previous.data.title === "string" && previous.data.title !== value.title ? [previous.data.title] : [];
        value.aliases = [...new Set([...oldAliases, ...value.aliases, ...oldTitle])];
        if (value.aliases.length > 20) return NextResponse.json({ error: "历史别名超过 20 个，请整理别名后再发布。" }, { status: 400 });
      }
    } else if (existingResponse.status !== 404) {
      return NextResponse.json({ error: "检查 GitHub 文章版本失败，请稍后重试。" }, { status: 502 });
    }
    if (!value.forceOverwrite && currentSha !== value.expectedSha) return NextResponse.json({ error: "GitHub 上的文章版本已变化。请重新打开文章并合并最新内容后再发布。" }, { status: 409 });

    const published = await fetch(url, {
      method: "PUT",
      headers: { ...githubHeaders(config.token), "Content-Type": "application/json" },
      body: JSON.stringify({ message: `${currentSha ? "Update" : "Publish"} article: ${value.title}`, content: Buffer.from(frontmatter(value), "utf8").toString("base64"), branch: config.branch, ...(currentSha ? { sha: currentSha } : {}) }),
      cache: "no-store",
    });
    if (!published.ok) {
      const status = published.status;
      if (status === 401 || status === 403) return NextResponse.json({ error: "GitHub 拒绝了发布请求。请检查 Token 权限和仓库访问设置。" }, { status: 502 });
      return NextResponse.json({ error: status === 409 ? "GitHub 发现版本冲突，请重新打开文章后再试。" : "发布到 GitHub 失败，请稍后重试。" }, { status: status === 409 ? 409 : 502 });
    }
    const result = await published.json() as { content?: { html_url?: string; sha?: string }; commit?: { html_url?: string } };
    return NextResponse.json({ ok: true, slug: value.slug, expectedSha: result.content?.sha ?? null, fileUrl: result.content?.html_url ?? null, commitUrl: result.commit?.html_url ?? null });
  } catch {
    return NextResponse.json({ error: "连接 GitHub 失败，请检查网络后重试。" }, { status: 502 });
  }
}
