import type { ArticleSummary } from "./types";
export const journalTopics = [
  { id: "essays", title: "随笔思考" },
  { id: "industry", title: "行业思考" },
  { id: "tools", title: "工具分享" },
] as const;
export type JournalTopic = (typeof journalTopics)[number]["id"];
export function journalTopic(article: Pick<ArticleSummary, "title" | "tags" | "category" | "researchTopic" | "notesTopic">): JournalTopic {
  if (journalTopics.some((item) => item.id === article.notesTopic)) return article.notesTopic as JournalTopic;
  const text = `${article.title} ${article.tags.join(" ")}`;
  if (/教育|人生|生活|文案|浪漫|旅行|风景|立场|对错|总结/.test(text)) return "essays";
  if (article.category === "产业" || article.category === "金融" || article.researchTopic === "industry" || /行业|产业|商业|互联网入口|未来|融资/.test(text)) return "industry";
  if (["编程", "工程技术", "设计", "机器人"].includes(article.category) || article.researchTopic || /工具|插件|下载|主题|美化|提示词|读书|图书|书单|Books|学习|教程|训练指南|部署|资料/i.test(text)) return "tools";
  if (article.category === "AI") return "industry";
  return "essays";
}
export function journalExcerpt(content: string, fallback: string) {
  const plain = content.replace(/\r\n?/g, "\n")
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "\n\n")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "\n\n")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, (_match, reference: string) => reference.split("|").pop() ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "").replace(/^#{1,6}[ \t]+/gm, "")
    .replace(/^[ \t]*([-*_])[ \t]*\1[ \t]*\1[-*_ \t]*$/gm, "")
    .replace(/^[ \t]*>[ \t]?/gm, "").replace(/^[ \t]*[-*+][ \t]+/gm, "• ")
    .replace(/[*_`~]/g, "").replace(/[ \t]+/g, " ")
    .replace(/^ +| +$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  const long = content.trim().length > 550 || /```|\|.+\|/.test(content);
  return { text: long ? (plain || fallback).slice(0, 420) : plain || fallback, long };
}
