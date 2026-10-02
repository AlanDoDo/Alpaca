import { NextRequest, NextResponse } from "next/server";
import { resources, resourceCategories, type Resource, type ResourceCategory } from "@/modules/content/resources";
import { readJsonObject, RequestBodyError } from "@/lib/request-json";
import { isSameOriginRequest } from "@/lib/request-origin";
import { ADMIN_COOKIE, adminAuthConfigured, verifyAdminSessionValue } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function githubConfig() {
  const { GITHUB_TOKEN: token, GITHUB_OWNER: owner, GITHUB_REPO: repo } = process.env;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

function headers(token: string) {
  return { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
}

function fileUrl(owner: string, repo: string) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/src/modules/content/resources-data.json`;
}

async function currentData() {
  const config = githubConfig();
  if (!config) return { items: resources, sha: null };
  const response = await fetch(`${fileUrl(config.owner, config.repo)}?ref=${encodeURIComponent(config.branch)}`, { headers: headers(config.token), cache: "no-store" });
  if (response.status === 404) return { items: resources, sha: null };
  if (!response.ok) throw new Error("无法从 GitHub 读取资源列表。");
  const file = await response.json() as { content?: string; encoding?: string; sha?: string };
  if (!file.content || file.encoding !== "base64" || !file.sha) throw new Error("GitHub 返回的资源列表无效。");
  const items = JSON.parse(Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8")) as Resource[];
  return { items, sha: file.sha };
}

export async function GET(request: NextRequest) {
  if (!adminAuthConfigured() || !verifyAdminSessionValue(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "请先登录管理员后台。" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const { items } = await currentData();
    return NextResponse.json({ resources: items }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "资源列表暂时无法载入。" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源校验失败。" }, { status: 403 });
  if (!adminAuthConfigured() || !verifyAdminSessionValue(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "请先登录管理员后台。" }, { status: 401 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "请求格式无效。" }, { status: 415 });
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 8192); } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: status === 413 ? "请求内容过大。" : "请求内容无效。" }, { status });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const categoryValue = typeof body.category === "string" ? body.category : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!name || name.length > 100) return NextResponse.json({ error: "网站名称必填，且不能超过 100 个字符。" }, { status: 400 });
  if (!/^https:\/\//i.test(url) || url.length > 2048) return NextResponse.json({ error: "请填写有效的 HTTPS 网站地址。" }, { status: 400 });
  try { new URL(url); } catch { return NextResponse.json({ error: "请填写有效的网站地址。" }, { status: 400 }); }
  if (!resourceCategories.includes(categoryValue as ResourceCategory)) return NextResponse.json({ error: "请选择有效分类。" }, { status: 400 });
  const category = categoryValue as ResourceCategory;
  if (!description || description.length > 320) return NextResponse.json({ error: "网站简介必填，且不能超过 320 个字符。" }, { status: 400 });
  const config = githubConfig();
  if (!config) return NextResponse.json({ error: "发布配置尚未完成，请设置 GITHUB_TOKEN、GITHUB_OWNER、GITHUB_REPO 和 GITHUB_BRANCH。" }, { status: 503 });

  try {
    const { items, sha } = await currentData();
    if (items.some((item) => item.url.replace(/\/$/, "") === url.replace(/\/$/, ""))) return NextResponse.json({ error: "这个网站已经收录了。" }, { status: 409 });
    const resource: Resource = { name, url, category, description, kind: "网站" };
    const response = await fetch(fileUrl(config.owner, config.repo), {
      method: "PUT",
      headers: { ...headers(config.token), "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Add resource: ${name}`, content: Buffer.from(JSON.stringify([...items, resource], null, 2) + "\n", "utf8").toString("base64"), branch: config.branch, ...(sha ? { sha } : {}) }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "保存到 GitHub 失败，请检查 Token 权限后重试。" }, { status: 502 });
    return NextResponse.json({ ok: true, resource, message: "网站已提交，部署完成后会显示在资源指南中。" });
  } catch {
    return NextResponse.json({ error: "保存网站时连接 GitHub 失败，请稍后重试。" }, { status: 502 });
  }
}
