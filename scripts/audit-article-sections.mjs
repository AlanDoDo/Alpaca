import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import matter from "gray-matter";

const require = createRequire(import.meta.url);
function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", code)(require, exports);
  return exports;
}
const research = load("src/modules/content/research.ts");
const notes = load("src/modules/content/journal.ts");
const files = fs.readdirSync("content/blog").filter((file) => /\.mdx?$/.test(file));
const slugs = new Set();
const rows = files.map((file) => {
  const { data } = matter(fs.readFileSync(path.join("content/blog", file), "utf8"), { engines: { javascript: () => { throw Error("Executable metadata disabled"); }, js: () => { throw Error("Executable metadata disabled"); } } });
  const slug = file.replace(/\.mdx?$/, "");
  assert(!slugs.has(slug), `Duplicate article: ${slug}`);
  slugs.add(slug);
  assert(Boolean(data.researchTopic) !== Boolean(data.notesTopic), `Missing or conflicting section: ${slug}`);
  const article = { ...data, tags: data.tags ?? [] };
  const inResearch = research.isRoboticsArticle(article);
  const topics = inResearch ? research.researchCategories : notes.journalTopics;
  const id = inResearch ? research.researchTopic(article) : notes.journalTopic(article);
  const topic = topics.find((item) => item.id === id);
  assert(topic, `Unknown section topic: ${slug}`);
  assert.equal(id, inResearch ? data.researchTopic : data.notesTopic, `Resolved topic differs from saved topic: ${slug}`);
  return { slug, title: data.title, section: inResearch ? "Research" : "Notes", topic: topic.title };
});
const counts = {};
for (const row of rows) counts[`${row.section} / ${row.topic}`] = (counts[`${row.section} / ${row.topic}`] ?? 0) + 1;
assert.equal(rows.length, Object.values(counts).reduce((sum, count) => sum + count, 0));
assert.equal(research.isRoboticsArticle({ title: "Python", category: "编程", tags: [], notesTopic: "essays" }), false);
assert.equal(notes.journalTopic({ title: "行业", category: "产业", tags: [], notesTopic: "tools" }), "tools");
const lines = ["# 文章分区核对清单", "", "Notes 与 Research 互斥。每篇文章明确保存 researchTopic 或 notesTopic，分类不再随标题变化。金融独立笔记保留原页面。", "", "| 分区 / 主题 | 篇数 |", "| --- | ---: |", ...Object.entries(counts).sort().map(([key, count]) => `| ${key} | ${count} |`), "", "## 逐篇清单", "", "| 文章 | 分区 | 主题 | 标识 |", "| --- | --- | --- | --- |", ...rows.sort((a, b) => (a.section + a.topic).localeCompare(b.section + b.topic, "zh-CN")).map((row) => `| ${row.title.replaceAll("|", "／")} | ${row.section} | ${row.topic} | ${row.slug} |`), "", "运行 node scripts/audit-article-sections.mjs 可重新检查遗漏、重复、互斥关系、保存与展示的一致性并刷新清单。", ""];
fs.writeFileSync("docs/development/article-organization.md", lines.join("\n"));
console.log(JSON.stringify({ articles: rows.length, counts, missing: 0, duplicates: 0, conflicts: 0 }, null, 2));
