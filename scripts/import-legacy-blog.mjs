import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceDirectory = path.resolve(process.argv[2] ?? "F:/software/Blog/source/_posts");
const destinationDirectory = path.join(projectRoot, "content/blog");
const dryRun = process.argv.includes("--dry-run");

function categoryFor(title, originalCategory) {
  const text = title + " " + originalCategory;
  if (/产业链|黑客马拉松|Web3|工业/i.test(text)) return "产业";
  if (/人工智能|Chat\s*GPT|ChatGPT|机器学习|大模型/i.test(text)) return "AI";
  if (/Robot|机器人|机械臂|ROS|URDF|Gazebo|Nav2|AI智能车/i.test(text)) return "机器人";
  if (/图书推荐|文案|随笔|生活|Books/i.test(text)) return "杂谈";
  if (/设计|视觉|Photoshop|PS基础/i.test(text)) return "设计";
  if (/操作系统|计算机网络|网络|HTTP|协议|MQTT|Docker|Ubuntu|Linux|虚拟机|网盘|嵌入式/i.test(text)) return "工程技术";
  if (/Python|前端|JAVA|Java|C\+\+|^C$|MySQL|数据结构|Blog|WeChat|Architecture|Webpack|开发|技术分享|Mybatis|Flask|Node\.?js|JS|Vue|Ajax|JQuery|BOM/i.test(text)) return "编程";
  return "编程";
}

function dateFrom(value, rawDate, fileName) {
  const dateMatch = fileName.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const fallback = dateMatch ? [dateMatch[1], dateMatch[2].padStart(2, "0"), dateMatch[3].padStart(2, "0")].join("-") : "";
  if (/\b24:00(?::00)?\b/.test(rawDate)) return fallback;
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

function makeSlug(fileName) {
  const stem = path.basename(fileName, ".md");
  const date = stem.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)?.slice(1);
  const prefix = date ? [date[0], date[1].padStart(2, "0"), date[2].padStart(2, "0")].join("-") : "legacy";
  const suffix = stem.replace(/^\d{4}-\d{1,2}-\d{1,2}-?/, "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return prefix + "-" + (suffix || "post");
}

function descriptionFrom(body, title) {
  const prose = body.split(/\r?\n/).map((line) => line.trim()).find((line) =>
    line && !/^#{1,6}\s/.test(line) && !/^(\x60\x60\x60|~~~|---|\*\*\*|!\[|<)/.test(line)
  );
  const cleaned = (prose ?? title).replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_>#]/g, "").split(String.fromCharCode(96)).join("").replace(/\s+/g, " ").trim();
  return cleaned.length > 180 ? cleaned.slice(0, 177) + "…" : cleaned;
}

function convertHexoShortcodes(body) {
  let inFence = false;
  const fenceStart = String.fromCharCode(96).repeat(3);
  return body.split(/\r?\n/).map((line) => {
    if (line.trimStart().startsWith(fenceStart) || /^\s*~~~/ .test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    let converted = line
      .replace(/\{% p\s+[^,]+,\s*(.*?)\s*%\}/g, "**$1**")
      .replace(/\{% span\s+[^,]+,\s*(.*?)\s*%\}/g, "**$1**")
      .replace(/\{% note\s+[^%]*%\}\s*(.*?)\s*\{% endnote %\}/g, "> **$1**")
      .replace(/\{% folding\b([^%]*?) %\}/g, (_, args) => "\n#### " + args.split(",").at(-1).trim() + "\n");
    converted = converted.replace(/\{% endfolding %\}/g, "");
    return converted;
  }).join("\n");
}

const sourceFiles = fs.readdirSync(sourceDirectory).filter((name) => name.toLowerCase().endsWith(".md")).sort();
if (!sourceFiles.length) throw new Error("No Markdown source posts were found.");
const reserved = new Set(fs.readdirSync(destinationDirectory).map((name) => name.replace(/\.mdx?$/i, "")));
const prepared = [];
const counts = new Map();
const errors = [];

for (const fileName of sourceFiles) {
  try {
    const source = fs.readFileSync(path.join(sourceDirectory, fileName), "utf8");
    const sourceFrontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    if (!sourceFrontmatter) throw new Error("Missing YAML frontmatter");
    const rawDateLine = sourceFrontmatter[1].match(/^date:\s*(.*?)\s*$/m)?.[1] ?? "";
    const parsed = matter(source);
    const title = typeof parsed.data.title === "string" ? parsed.data.title.trim() : "";
    if (!title) throw new Error("Missing title");
    const category = categoryFor(title, String(parsed.data.categories ?? ""));
    const date = dateFrom(parsed.data.date, rawDateLine, fileName);
    if (!date) throw new Error("Missing/invalid date and no date in filename");
    const tagsValue = parsed.data.tags;
    const tags = Array.isArray(tagsValue) ? tagsValue.map(String) : (tagsValue ? [String(tagsValue)] : []);
    const cover = typeof parsed.data.cover === "string" ? parsed.data.cover.trim() : "";
    let slug = makeSlug(fileName);
    let duplicate = 2;
    while (reserved.has(slug)) { slug = makeSlug(fileName) + "-" + duplicate++; }
    reserved.add(slug);
    const body = convertHexoShortcodes(parsed.content.trimStart());
    const description = descriptionFrom(body, title);
    const frontmatter = [
      "---",
      "title: " + JSON.stringify(title),
      "description: " + JSON.stringify(description),
      "date: " + JSON.stringify(date),
      "category: " + JSON.stringify(category),
      "tags: " + JSON.stringify(tags),
      "author: \"TechAlpaca\"",
      "featured: " + (/产业链白皮书/.test(title) ? "true" : "false"),
      ...(cover ? ["cover: " + JSON.stringify(cover)] : []),
      "source: \"legacy-blog\"",
      "---",
    ].join("\n");
    prepared.push({ fileName, slug, category, output: frontmatter + "\n\n" + body.replace(/\s+$/, "") + "\n" });
    counts.set(category, (counts.get(category) ?? 0) + 1);
  } catch (error) {
    errors.push(fileName + ": " + (error instanceof Error ? error.message : String(error)));
  }
}

console.log("Source Markdown files:", sourceFiles.length);
console.log("Ready to import:", prepared.length);
console.log("Category counts:", Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b, "zh-CN"))));
console.log("Example slugs:", prepared.slice(0, 12).map(({ slug }) => slug).join(", "));
if (errors.length) console.log("Needs review:\n" + errors.join("\n"));
if (errors.length) process.exitCode = 1;
else if (!dryRun) {
  fs.mkdirSync(destinationDirectory, { recursive: true });
  for (const item of prepared) fs.writeFileSync(path.join(destinationDirectory, item.slug + ".mdx"), item.output, "utf8");
  console.log("Imported", prepared.length, "posts into", destinationDirectory);
}


