import resourceData from "./resources-data.json";

export type ResourceKind = "网站" | "开源项目" | "数据集";
export const resourceCategories = [
  "机械与执行机构",
  "电子与嵌入式",
  "感知与定位",
  "规划与导航",
  "运动与控制",
  "具身智能",
  "系统与工程",
  "算法与模型",
  "数据集与仿真",
  "开发工具与平台",
  "研究与学习资料",
] as const;
export type ResourceCategory = (typeof resourceCategories)[number];

export type Resource = {
  name: string;
  category: ResourceCategory;
  kind: ResourceKind;
  description: string;
  url: string;
  language?: string;
};

export const resources = resourceData as Resource[];
