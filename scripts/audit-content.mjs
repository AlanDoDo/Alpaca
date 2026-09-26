import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "content/blog");
const publicDirectory = path.join(process.cwd(), "public");
const categories = new Set(["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"]);
const files = fs.existsSync(directory) ? fs.readdirSync(directory).filter((file) => /\.mdx?$/.test(file)).sort() : [];
const issues = [];
let coverCount = 0;
let taglessCount = 0;
let localImageCount = 0;

function withoutCodeBlocks(source) {
  const lines = source.split(/\r?\n/);
  const visible = [];
  let marker = "";
  let markerLength = 0;
  for (const line of lines) {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      const nextMarker = fence[1][0];
      if (!marker) {
        marker = nextMarker;
        markerLength = fence[1].length;
      } else if (marker === nextMarker && fence[1].length >= markerLength) {
        marker = "";
        markerLength = 0;
      }
      continue;
    }
    if (!marker) visible.push(line);
  }
  return visible.join("\n");
}

for (const file of files) {
  const fullPath = path.join(directory, file);
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
  const slug = file.replace(/\.mdx?$/, "");
  const prefix = `content/blog/${file}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) issues.push(`${prefix}: invalid filename slug`);
  if (typeof data.title !== "string" || !data.title.trim()) issues.push(`${prefix}: title is required`);
  if (typeof data.description !== "string" || !data.description.trim()) issues.push(`${prefix}: description is required`);
  if (typeof data.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || new Date(`${data.date}T00:00:00Z`).toISOString().slice(0, 10) !== data.date) issues.push(`${prefix}: date must be a real YYYY-MM-DD date`);
  if (!categories.has(data.category)) issues.push(`${prefix}: unknown category ${JSON.stringify(data.category)}`);
  if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string" || !tag.trim()))) issues.push(`${prefix}: tags must be a list of non-empty strings`);
  if (!Array.isArray(data.tags) || data.tags.length === 0) taglessCount++;
  if (data.cover) {
    coverCount++;
    if (typeof data.cover !== "string" || !/^https:\/\//i.test(data.cover)) issues.push(`${prefix}: cover must use HTTPS`);
  }

  const body = withoutCodeBlocks(content);
  const imageUrls = [
    ...[...body.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)].map((match) => match[1]),
    ...[...body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]),
  ];
  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith("/") || imageUrl.startsWith("//")) continue;
    localImageCount++;
    const localPath = path.resolve(publicDirectory, decodeURIComponent(imageUrl.split(/[?#]/, 1)[0].slice(1)));
    if (!localPath.startsWith(`${publicDirectory}${path.sep}`) || !fs.existsSync(localPath)) issues.push(`${prefix}: missing local image ${imageUrl}`);
  }
}

console.log(`Audited ${files.length} articles: ${coverCount} with covers, ${taglessCount} without tags, ${localImageCount} local image references.`);
if (issues.length) {
  console.error(`${issues.length} content issue(s):\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Article frontmatter and local image references look good.");
}
