import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceDirectory = path.resolve(process.argv[2] ?? path.join(projectRoot, ".migration-cache/online-blog"));
const destinationDirectory = path.join(projectRoot, "content/blog");
const dryRun = process.argv.includes("--dry-run");
const sourceBase = "https://techalpaca.vercel.app";

function categoryFor(post) {
  const text = [post.title, ...(post.tags ?? [])].join(" ") + " " + (post.category === "金融" ? "金融" : "");
  if (/金融|投资|黄金|股票|资本/.test(text)) return "金融";
  if (/编程基础|C语言|Python|Java|代码|编程/.test(text)) return "编程";
  if (/产业链|行业发展|产业|行业/.test(text)) return "产业";
  if (/机器人|VLA|机械臂/i.test(text)) return "机器人";
  if (/AI|人工智能|大模型|Transformer|CNN|强化学习|提示词|模型训练/i.test(text)) return "AI";
  return "杂谈";
}

function descriptionFrom(body, fallback) {
  const line = body.split(/\r?\n/).map((item) => item.trim()).find((item) => item && !/^#{1,6}\s/.test(item) && !/^[-*|>`]/.test(item));
  const cleaned = (line ?? fallback).replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[**_`>#]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 180 ? cleaned.slice(0, 177) + "…" : cleaned;
}

function slugFor(sourceSlug) {
  return sourceSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "online-post";
}

const posts = JSON.parse(fs.readFileSync(path.join(sourceDirectory, "index.json"), "utf8"));
if (!Array.isArray(posts)) throw new Error("The source blog index is not a JSON array.");
const visiblePosts = posts.filter((post) => post && post.slug && post.title && !post.hidden);
const reserved = new Set(fs.readdirSync(destinationDirectory).map((name) => name.replace(/\.mdx?$/i, "")));
const prepared = [];
const counts = new Map();

for (const post of visiblePosts) {
  const bodyPath = path.join(sourceDirectory, post.slug, "index.md");
  if (!fs.existsSync(bodyPath)) throw new Error(`Missing Markdown source for ${post.slug}`);
  let body = fs.readFileSync(bodyPath, "utf8").trim();
  body = body.replace(/\]\((\/?blogs\/)/g, `](https://${new URL(sourceBase).host}/$1`)
    .replace(/src=["'](\/?blogs\/)/g, `src="https://${new URL(sourceBase).host}/$1`)
    .replace(/!\[([^\]]*)\]\((?!https?:|\/\/)([^)]+)\)/g, (_, alt, asset) => `![${alt}](${sourceBase}/blogs/${encodeURIComponent(post.slug)}/${asset})`);
  const category = categoryFor(post);
  const date = String(post.date ?? "").match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!date) throw new Error(`Invalid date on source article ${post.slug}`);
  let slug = slugFor(post.slug);
  let suffix = 2;
  while (reserved.has(slug)) slug = `${slugFor(post.slug)}-${suffix++}`;
  reserved.add(slug);
  const description = String(post.summary ?? "").trim() || descriptionFrom(body, post.title);
  const coverPath = String(post.cover ?? "").trim();
  const cover = coverPath ? new URL(coverPath, sourceBase).toString() : "";
  const tags = Array.isArray(post.tags) ? post.tags.map(String) : [];
  const frontmatter = [
    "---",
    "title: " + JSON.stringify(post.title),
    "description: " + JSON.stringify(description),
    "date: " + JSON.stringify(date),
    "category: " + JSON.stringify(category),
    "tags: " + JSON.stringify(tags),
    'author: "TechAlpaca"',
    "featured: false",
    ...(cover ? ["cover: " + JSON.stringify(cover)] : []),
    'source: "legacy-online"',
    "---",
  ].join("\n");
  prepared.push({ slug, category, output: `${frontmatter}\n\n${body}\n` });
  counts.set(category, (counts.get(category) ?? 0) + 1);
}

console.log("Public source posts:", visiblePosts.length);
console.log("Ready to import:", prepared.length);
console.log("Category counts:", Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "zh-CN"))));
console.log("Example slugs:", prepared.slice(0, 8).map(({ slug }) => slug).join(", "));
if (!dryRun) {
  fs.mkdirSync(destinationDirectory, { recursive: true });
  for (const item of prepared) fs.writeFileSync(path.join(destinationDirectory, `${item.slug}.mdx`), item.output, "utf8");
  console.log(`Imported ${prepared.length} posts into ${destinationDirectory}`);
}

