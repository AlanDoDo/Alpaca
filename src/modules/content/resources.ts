import resourceData from "./resources-data.json";

export type ResourceKind = "网站" | "开源项目" | "数据集";

export type Resource = {
  name: string;
  category: string;
  kind: ResourceKind;
  description: string;
  url: string;
  language?: string;
};

export const resourceCategories = ["机器人开发", "仿真与控制", "具身智能", "AI 工具", "研究资料"] as const;
export const resources = resourceData as Resource[];
