import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import matter from "gray-matter";
function compile(source, values = {}) {
  const exports = {};
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", ...Object.keys(values), code)(exports, ...Object.values(values));
  return exports;
}
const research = compile(fs.readFileSync("src/modules/content/research.ts", "utf8"));
const notes = compile(fs.readFileSync("src/modules/content/journal.ts", "utf8"));
const route = fs.readFileSync("src/app/api/admin/articles/route.ts", "utf8");
const functions = route.slice(route.indexOf("function validateDraft("), route.indexOf("export async function POST("));
const api = compile(functions + "\nexport { validateDraft, frontmatter };", { researchCategories: research.researchCategories, journalTopics: notes.journalTopics, categories: ["AI", "机器人", "金融", "产业", "编程", "工程技术", "设计", "杂谈"], slugPattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, maxArticleBytes: 500_000 });
const base = { slug: "qa-classification", title: "分类回归", description: "用于验证分类往返", date: "2026-09-27", category: "编程", tags: [], author: "TechAlpaca", featured: false, cover: "", content: "## 正文\n\n回归内容", expectedSha: null };
for (const topic of notes.journalTopics) {
  const result = api.validateDraft({ ...base, notesTopic: topic.id });
  assert(result.value);
  const { data } = matter(api.frontmatter(result.value));
  assert.equal(data.notesTopic, topic.id);
  assert.equal(research.isRoboticsArticle(data), false);
  assert.equal(notes.journalTopic(data), topic.id);
}
for (const topic of research.researchCategories) {
  const result = api.validateDraft({ ...base, researchTopic: topic.id });
  assert(result.value);
  const { data } = matter(api.frontmatter(result.value));
  assert.equal(research.researchTopic(data), topic.id);
  assert.equal(research.isRoboticsArticle(data), true);
}
assert(api.validateDraft({ ...base, notesTopic: "invalid" }).error);
assert(api.validateDraft({ ...base, notesTopic: "essays", researchTopic: "programming" }).error);
console.log("All 3 Notes and 9 Research classifications validate, serialize and resolve correctly; invalid/conflicting selections rejected. No GitHub writes performed.");
