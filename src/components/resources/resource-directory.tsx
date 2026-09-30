"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { resources, resourceCategories, type ResourceKind } from "@/modules/content/resources";

const allCategories = ["全部", ...resourceCategories] as const;
const kindStyles: Record<ResourceKind, string> = { 网站: "resource-kind-site", 开源项目: "resource-kind-open", 数据集: "resource-kind-data" };

export function ResourceDirectory() {
  const [category, setCategory] = useState<string>("全部");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => resources.filter((item) => {
    const categoryMatches = category === "全部" || item.category === category;
    const queryMatches = `${item.name} ${item.category} ${item.kind} ${item.description} ${item.language ?? ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return categoryMatches && queryMatches;
  }), [category, query]);
  const groups = resourceCategories.map((name) => ({ name, items: filtered.filter((resource) => resource.category === name) })).filter((group) => group.items.length > 0);

  return <>
    <div className="resource-controls">
      <nav aria-label="资源分类" className="resource-filters">{allCategories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span>{item === "全部" ? resources.length : resources.filter((resource) => resource.category === item).length}</span></button>)}</nav>
      <label className="resource-search"><Search size={17} aria-hidden="true" /><input aria-label="搜索资源" onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、方向或技术" value={query} /></label>
    </div>
    <p className="resource-results" aria-live="polite">{category === "全部" ? "精选资源" : category} <span>· {filtered.length} 项</span></p>
    {filtered.length ? <div className="resource-groups">{groups.map((group) => <section className="resource-group" aria-label={group.name} key={group.name}>
      <header><h2>{group.name}</h2><span>{String(group.items.length).padStart(2, "0")} 项</span></header>
      <div className="resource-list">{group.items.map((resource) => <a className="resource-row" data-ink-reveal href={resource.url} key={resource.url} rel="noreferrer" target="_blank">
        <span className="resource-row-index">{String(filtered.indexOf(resource) + 1).padStart(2, "0")}</span>
        <div className="resource-row-main"><p className="resource-row-kicker"><span className={`resource-kind ${kindStyles[resource.kind]}`}>{resource.kind}</span>{resource.language && <><i>/</i><span>{resource.language}</span></>}</p><h3>{resource.name}</h3><p className="resource-row-description">{resource.description}</p></div>
        <div className="resource-row-aside"><span>{resource.category}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
      </a>)}</div>
    </section>)}</div> : <p className="resource-empty">没有找到匹配的资源，试试其他关键词或分类。</p>}
    <p className="resource-note">资源由 TechAlpaca 持续整理；访问前请留意各项目的许可协议、硬件要求与文档版本。</p>
  </>;
}
