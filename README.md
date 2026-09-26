# TechAlpaca

TechAlpaca 是一个围绕 AI、机器人、金融与个人思考的个人内容平台。当前仓库从内容中心开始，后续按阶段加入社区、账户和社交能力。

## 当前状态

- 已有：Next.js App Router、响应式 editorial 首页、博客列表、Markdown/GFM 文章详情、95 篇迁移文章、搜索、RSS、sitemap 和全局 metadata。
- 文档已定义：模块边界、数据模型、安全策略、阶段路线和部署步骤。
- 尚未接入：Supabase 用户体系、论坛写入和评论互动。管理员专用登录与 Markdown 文章工作台已实现；论坛与普通用户账户仍明确显示规划状态。

## 本地开发

需要 Node.js 20.9 或更高版本和 npm。

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

打开 http://localhost:3000 。正式文章放在 `content/blog/*.md` 或 `*.mdx`；正文按安全的 Markdown/GFM 语法渲染，原始 HTML 会先经过清理，不执行 MDX JSX。

## 文档索引

- [开发文档总览](docs/README.md)
- [迁移与 Codex 接手指南](docs/development/migration.md)
- [当前 Codex 接手摘要](CODEX_HANDOFF.md)
- [产品需求与范围](docs/product/requirements.md)
- [文章迁移与分类](docs/product/content-migration.md)
- [架构与模块职责](docs/architecture/modules.md)
- [数据模型与演进](docs/architecture/data-model.md)
- [安全基线](docs/architecture/security.md)
- [开发流程与质量门槛](docs/development/workflow.md)
- [部署指南](docs/operations/deployment.md)
- [路线图](docs/product/roadmap.md)
- [决策记录](docs/adr/README.md)

## 内容 frontmatter

```yaml
---
title: "文章标题"
description: "搜索结果和列表使用的摘要。"
date: "2026-09-25"
category: "AI"
tags: ["AI", "研究"]
author: "TechAlpaca"
featured: false
---
```

允许分类：`AI`、`机器人`、`金融`、`产业`、`编程`、`工程技术`、`设计`、`杂谈`。新增文章请放在 `content/blog/`。原 Hexo 文章及线上博客文章的迁移流程见 [迁移记录](docs/product/content-migration.md)。

## 环境变量

复制 `.env.example` 为 `.env.local`。网站展示需要 `NEXT_PUBLIC_SITE_URL`；使用在线文章编辑器还需配置管理员登录和 GitHub 发布变量，详见下方“在线文章编辑器”。Supabase 值在接入身份和社区模块时配置。`SUPABASE_SERVICE_ROLE_KEY` 只允许服务端使用，不能传入客户端组件或提交到 Git。

## 命令

```bash
npm run dev       # 本地开发
npm run lint      # ESLint
npm run typecheck # TypeScript 检查
npm run build     # 生产构建
```

更详细的数据库配置、Vercel Preview/Production 环境和上线步骤见 [部署指南](docs/operations/deployment.md)。

左下角的音乐卡片默认播放网易云歌单 `7231928049`，按歌单列表顺序播放，并会在页面载入时请求自动播放。用户可在卡片中换歌单；浏览器可能因自动播放策略要求先进行一次点击。

## 在线文章编辑器

访问 /admin/articles 进入受保护的文章工作台。管理员登录后可搜索已有文章或新建文章，填写标题、摘要、分类、日期、标签、可选 HTTPS 封面与 Markdown 正文。桌面端提供实时预览，手机端可切换编辑和预览。草稿自动保存在当前浏览器并在刷新后恢复，也可以导出为 .md 文件。发布前需要确认；服务端会将 .mdx 提交到 GitHub 指定分支，随后由 Vercel 自动部署。

### 本地配置

把 .env.example 复制为 .env.local，并设置：

- ADMIN_EDITOR_PASSWORD：管理员登录密码，建议至少 16 位随机密码。
- ADMIN_SESSION_SECRET：用于签发 8 小时 HttpOnly 会话，至少 32 个字符。可以使用 Node crypto 模块 randomBytes 方法生成随机密钥。
- GITHUB_TOKEN：GitHub Fine-grained personal access token，仅授予目标仓库 Contents 读写权限。
- GITHUB_OWNER、GITHUB_REPO、GITHUB_BRANCH：目标仓库所有者、仓库名和发布分支（例如 main）。

设置后重启 npm run dev，再打开 http://localhost:3000/admin/articles 。未配置 GitHub 凭据时，编辑与草稿仍可用，但发布会说明缺少配置。

### Vercel 配置

在 Vercel 项目 Settings → Environment Variables 中配置相同的 ADMIN_EDITOR_PASSWORD、ADMIN_SESSION_SECRET、GITHUB_TOKEN、GITHUB_OWNER、GITHUB_REPO 和 GITHUB_BRANCH。至少应用到 Production；如果要在 Preview 试用，也需配置 Preview。保存后重新部署。管理员密码和 GitHub Token 都是服务端变量，不要添加 NEXT_PUBLIC_ 前缀。

发布 API 使用 HttpOnly、SameSite Strict 会话、同源校验、输入验证和 GitHub SHA 冲突检测。当前环境没有配置管理员密码或 GitHub Token，因此不会尝试向远程仓库发布。
