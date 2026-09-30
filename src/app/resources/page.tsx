import type { Metadata } from "next";
import { InkArt } from "@/components/visual/ink-art";
import { ResourceDirectory } from "@/components/resources/resource-directory";

export const metadata: Metadata = {
  title: "资源指南",
  description: "整理机器人、具身智能与 AI 开发相关的官方文档、开源项目和数据资源。",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return <div className="resources-page site-shell">
    <header className="resources-hero ink-page-heading"><InkArt variant="hero" className="resources-taiji" />
      <p className="resources-eyebrow">TECHALPACA <span>/</span> RESOURCE GUIDE</p>
      <h1>资源指南</h1>
      <p>把值得收藏的文档、开源项目与数据资源，整理成一份好找、好用的清单。</p>
    </header>
    <ResourceDirectory />
  </div>;
}
