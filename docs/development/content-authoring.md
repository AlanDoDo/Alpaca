# 文章写作与内容维护

## 文章放在哪里

文章正文以 Markdown/MDX 文件保存在 `content/blog/`，随 Git 版本管理。文章页面使用静态生成；更新文章后部署完成即可上线。没有封面时省略 `cover` 字段，不要填写占位图。

## Frontmatter 约定

```yaml
---
title: "文章标题"
description: "用于列表和搜索结果的简短摘要"
date: "2026-09-26"
category: "机器人"
tags: ["具身智能", "VLA"]
author: "TechAlpaca"
featured: false
cover: "https://example.com/cover.webp" # 可选；无封面时删除这一行
---

正文从这里开始。
```

- 文件名是文章 URL 的 slug，只能使用小写英文字母、数字和连字符，例如 `vla-for-robotics.mdx`。
- 日期必须是有效的 `YYYY-MM-DD` 日期。
- 分类使用 `AI`、`机器人`、`金融`、`产业`、`编程`、`工程技术`、`设计`、`杂谈` 之一。
- 标签可以省略；封面如果存在，必须是 HTTPS 图片地址。
- 文章图片优先放在 `public/images/`，正文引用时使用 `/images/name.webp`。不要依赖临时目录或无法稳定访问的远程图片。
- 标题使用 Markdown 的 `##` / `###`，长教程会自动显示侧边目录。

## 编辑器草稿与发布

`/admin/articles` 编辑器的草稿存储在当前浏览器本地，不会同步到别的设备。它会自动保存，也可以点击保存状态或按 `Ctrl+S` 立即保存。发布会将 MDX 文件提交到 GitHub，Vercel 构建成功后更新网站。

## 内容检查

```bash
npm run content:audit
```

检查 frontmatter、分类、日期、文件 slug 和正文中引用的本地图片。Markdown 代码围栏中的示例不会按实际图片链接检查。外部图片服务可用性会变化，发布前可在预览环境中检查实际展示。
