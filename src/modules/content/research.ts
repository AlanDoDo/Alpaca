import type { ArticleSummary } from "./types";
export const researchCategories = [
  { id: "industry", title: "产业与应用" },
  { id: "mechanics", title: "机械与执行机构" },
  { id: "electronics", title: "电子与嵌入式" },
  { id: "perception", title: "感知与定位" },
  { id: "navigation", title: "规划与导航" },
  { id: "control", title: "运动与控制" },
  { id: "learning", title: "具身智能" },
  { id: "systems", title: "系统与工程" },
  { id: "programming", title: "编程" },
] as const;
export type ResearchTopic = (typeof researchCategories)[number]["id"];
export function isRoboticsArticle(article: Pick<ArticleSummary, "title" | "tags" | "category" | "researchTopic" | "notesTopic">) {
  if (["essays", "industry", "tools"].includes(article.notesTopic ?? "")) return false;
  return researchCategories.some((item) => item.id === article.researchTopic) || article.researchTopic === "hardware" || article.category === "机器人" || article.category === "编程" || /编程自学网站/.test(article.title) || (article.category === "产业" && /机器人|具身智能/.test(`${article.title} ${article.tags.join(" ")}`));
}
export function researchTopic(article: Pick<ArticleSummary, "title" | "tags" | "researchTopic"> & { category?: string }): ResearchTopic {
  if (researchCategories.some((item) => item.id === article.researchTopic)) return article.researchTopic as ResearchTopic;
  if (article.category === "编程" || /编程自学网站/.test(article.title)) return "programming";
  const text = `${article.title} ${article.tags.join(" ")}`;
  if (/产业|行业|公司|市场|白皮书|融资|商业/.test(text)) return "industry";
  if (/具身|VLA|强化学习|模仿学习|世界模型|Transformer/i.test(text)) return "learning";
  if (/路径规划|运动规划|任务规划|避障|导航|Nav2/i.test(text)) return "navigation";
  if (/SLAM|视觉|目标检测|YOLO|CNN|定位|感知/i.test(text)) return "perception";
  if (/运动学|动力学|轨迹跟踪|舵机控制|步态|电机控制/.test(text)) return "control";
  if (/机械结构|关节设计|传动|减速器|夹爪|执行器|电机选型/.test(text)) return "mechanics";
  if (/PCB|电路|硬件|传感器接口|嵌入式|固件|STM32/i.test(text)) return "electronics";
  return "systems";
}
