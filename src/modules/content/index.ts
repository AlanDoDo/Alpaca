import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Article, ArticleCategory, ArticleSummary } from "./types";
export type { Article, ArticleCategory, ArticleSummary } from "./types";
const contentDirectory = path.join(process.cwd(), "content/blog");
const categories: ArticleCategory[] = ["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"];
function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function readArticle(fileName: string): Article {
  const source = fs.readFileSync(path.join(contentDirectory, fileName), "utf8");
  const { data, content } = matter(source);
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const date = typeof data.date === "string" ? data.date : "";
  const category = data.category as ArticleCategory;
  const cover = typeof data.cover === "string" && /^https:\/\//i.test(data.cover) ? data.cover : undefined;
  if (!title || !description || !isValidDate(date) || !categories.includes(category)) {
    throw new Error(`Invalid article frontmatter in content/blog/${fileName}: check title, description, date (YYYY-MM-DD), and category.`);
  }
  const cjkCharacters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = content.replace(/[\u3400-\u9fff]/g, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  const readingTime = Math.max(1, Math.ceil(cjkCharacters / 400 + latinWords / 200));
  return { slug: fileName.replace(/\.mdx?$/, ""), title, description, date, category, tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [], readingTime, featured: data.featured === true, cover, content };
}
export function getAllArticles(): ArticleSummary[] {
  if (!fs.existsSync(contentDirectory)) return [];
  return fs.readdirSync(contentDirectory).filter((name) => /\.mdx?$/.test(name)).map(readArticle).sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date)).map(({ slug, title, description, date, category, tags, readingTime, featured, cover }) => ({ slug, title, description, date, category, tags, readingTime, featured, cover }));
}
export function getArticleBySlug(slug: string): Article | undefined {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  const fileName = [`${slug}.mdx`, `${slug}.md`].find((name) => fs.existsSync(path.join(contentDirectory, name)));
  return fileName ? readArticle(fileName) : undefined;
}
export function searchArticles(query: string): ArticleSummary[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  if (!fs.existsSync(contentDirectory)) return [];
  return fs.readdirSync(contentDirectory)
    .filter((name) => /\.mdx?$/.test(name))
    .map(readArticle)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date))
    .filter((article) => [article.title, article.description, article.category, ...article.tags, article.content].join(" ").toLocaleLowerCase().includes(normalized))
    .map(({ slug, title, description, date, category, tags, readingTime, featured, cover }) => ({ slug, title, description, date, category, tags, readingTime, featured, cover }));
}
