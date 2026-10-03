"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, BookMarked, CheckCircle2, Plus } from "lucide-react";
import { resourceCategories, resources as initialResources, type Resource } from "@/modules/content/resources";

export function ResourceManager() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/resources", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("资源列表暂时无法同步。");
      const data = await response.json() as { resources?: Resource[] };
      if (active && data.resources) setResources(data.resources);
    }).catch(() => {
      if (active) setFormError("资源列表暂时无法同步，仍可尝试添加网站。");
    });
    return () => { active = false; };
  }, []);

  async function addResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), url: form.get("url"), category: form.get("category"), description: form.get("description") }),
      });
      const data = await response.json() as { error?: string; resource?: Resource; message?: string };
      if (!response.ok || !data.resource) {
        setFormError(data.error ?? "添加失败，请稍后重试。");
        return;
      }
      setResources((current) => [...current, data.resource!]);
      setNotice(data.message ?? "网站已添加。");
      formElement.reset();
      setShowForm(false);
    } catch {
      setFormError("网络暂时不可用，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  return <section className="admin-resource-card" aria-labelledby="admin-resource-title">
    <header className="admin-resource-header">
      <div className="admin-resource-heading">
        <span className="admin-resource-icon"><BookMarked className="size-4" /></span>
        <div><p className="admin-eyebrow">LIBRARY</p><h2 id="admin-resource-title">资源管理</h2></div>
      </div>
      <div className="admin-resource-actions">
        <span className="admin-resource-count">已收录 {resources.length} 项</span>
        <button className="admin-primary-button" type="button" onClick={() => { setShowForm((open) => !open); setFormError(""); }}><Plus className="size-4" />{showForm ? "收起表单" : "添加网站"}</button>
      </div>
    </header>
    <p className="admin-resource-description">维护资源指南中的网站、开源项目和数据集。新增网站会保存到 GitHub，并触发站点部署。</p>
    {notice && <div className="admin-resource-notice" role="status" aria-live="polite">
      <CheckCircle2 className="admin-resource-notice-icon" size={19} aria-hidden="true" />
      <span><strong>上传成功</strong><span>{notice}</span></span>
    </div>}
    {formError && <p className="admin-resource-error" role="alert">{formError}</p>}
    {showForm && <form className="admin-resource-form" onSubmit={addResource}>
      <div className="admin-resource-form-grid">
        <label className="admin-field"><span>网站名称</span><input autoFocus name="name" required maxLength={100} placeholder="例如：ROS 2 Documentation" /></label>
        <label className="admin-field"><span>网站地址</span><input name="url" type="url" required placeholder="https://example.com" /></label>
        <label className="admin-field"><span>所属分类</span><select name="category" required defaultValue={resourceCategories[0]}>{resourceCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="admin-field admin-resource-description-field"><span>网站简介</span><textarea name="description" required maxLength={320} placeholder="简单介绍网站的内容和用途" /></label>
      </div>
      <div className="admin-resource-form-footer"><span>仅支持 HTTPS 地址</span><button className="admin-secondary-button" disabled={saving} onClick={() => setShowForm(false)} type="button">取消</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "正在保存…" : "保存网站"}</button></div>
    </form>}
    <div className="admin-resource-list" aria-label="已收录资源">
      {resources.map((resource) => <a className="admin-resource-item" href={resource.url} key={resource.url} rel="noreferrer" target="_blank">
        <span className="admin-resource-item-main"><strong>{resource.name}</strong><small>{resource.category} · {resource.kind}</small></span>
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>)}
    </div>
  </section>;
}
