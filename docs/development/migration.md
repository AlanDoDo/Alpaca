# 项目迁移与新 Codex 接手指南

更新日期：2026-09-27

本指南用于在新电脑、Codex 新任务或新工作区恢复 TechAlpaca。涉及密钥的配置只记录变量名，不记录实际值。

## 项目身份

- GitHub：`AlanDoDo/Alpaca`
- 主分支：`main`
- 本地目录（当前机器）：`F:\software\Alpaca`
- 正式域名：`https://www.alandodo.cn`；根域名跳转到 www，腾讯云 DNSPod 管理解析。
- Vercel 项目：`techalpaca-projects/alpaca`，Node.js 24.x。
- 网站：Next.js App Router；文章 Markdown/MDX 保存在 `content/blog/`。
- 域名配置记录基线：`e9596d8`。接手时先运行 `git fetch` 和 `git status`，以远端实际状态为准，不据此回退项目。

## 新 Codex 任务的接手顺序

1. 确认工作目录是仓库根目录，并先读根目录 `AGENTS.md`。
2. 阅读本文件、[项目手册](project-guide.md)、[接手摘要](../../CODEX_HANDOFF.md)、[模块架构](../architecture/modules.md) 和 [安全基线](../architecture/security.md)。
3. 查看 `git status --short --branch`、`git log -5 --oneline --decorate` 和 `git remote -v`；不要覆盖、重置或丢弃已有修改。
4. 如果需要修改 Next.js 代码，先按 `AGENTS.md` 从 `node_modules/next/dist/docs/` 阅读对应的 Next.js 16.3.6 参考文档。
5. 按用户任务要求和改动范围选择验证命令；纯文档修改检查内容及相对链接即可，不自动运行应用测试。
6. 只有在用户明确要求时才提交或推送。提交时只暂存本次明确涉及的文件，不要用 `git add .` 捎带文章草稿或用户的其他本地更改。

## 环境恢复

要求 Node.js 24.x 与 npm：

```powershell
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

浏览器打开 `http://localhost:3000`。本地构建与检查：

```powershell
npm run typecheck
npm run lint
npm run build
```

`.env.local` 已被 `.gitignore` 忽略。不要把密钥粘贴到对话、README、客户端变量或 Git。新机器需自行从安全密码管理器恢复环境变量。

## 环境变量清单

- `NEXT_PUBLIC_SITE_URL`：本地 `http://localhost:3000`；Production `https://www.alandodo.cn`。
- `ADMIN_EDITOR_PASSWORD`：文章后台登录密码。
- `ADMIN_SESSION_SECRET`：至少 32 个字符，用于签发 8 小时 HttpOnly 管理员会话。
- `GITHUB_TOKEN`：仅用于服务端发布 API 的 Fine-grained token；仅给目标仓库 Contents 写入权限。
- `GITHUB_OWNER`、`GITHUB_REPO`、`GITHUB_BRANCH`：GitHub 发布目标。
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`：预留给 Supabase 阶段；目前站点 MVP 没有接入 Supabase。

本地管理员凭据与 GitHub 发布凭据不会从 GitHub 自动迁移。Vercel Production/Preview 环境变量也需在 Vercel 项目设置中单独配置。变量模板见根目录 `.env.example`，详细流程见 [部署指南](../operations/deployment.md) 和 [在线编辑器章节](../../README.md#在线文章编辑器)。

Vercel 当前 Production 已配置服务端 Secret。新电脑登录同一有权限的账户，关联已有项目即可，不重新创建生产项目；`.vercel` 关联文件不入 Git。Preview 不复制生产凭据。`vercel env pull` 会覆盖目标文件，执行前确认不会丢失本地配置。

## 当前功能地图

- `src/app/`：Next.js 路由、页面、Route Handler。
- `src/components/layout/`：站点导航、页脚、音乐组件、主题切换。
- `src/components/blog/`：文章正文渲染、目录、文章行、分页。
- `src/components/admin/`：在线文章工作台。
- `src/modules/content/`：读取文章文件、校验 frontmatter、文章类型和标题提取。
- `src/lib/admin-auth.ts`：签名管理员会话与 cookie 验证。
- `src/lib/request-json.ts`、`login-rate-limit.ts`、`parse-frontmatter.ts`：请求大小、登录限流及安全文章解析。
- `content/blog/*.mdx`：线上文章的版本化源文件。
- `content/finance/`：投机/投资笔记；新增内容需维护 `finance.ts` 的展示顺序。
- `public/`：头像、图像和静态资源。
- `docs/`：产品、架构、安全、部署与交接文档。

文章是 Git 仓库中的静态 Markdown/MDX，发布 API 提交文章文件到 GitHub；Vercel 从该分支自动构建部署。社区、Supabase 用户系统仍按路线图推进，不要在接手时假设已完成。

## 在线编辑器流程

- 登录页：`/admin/login`
- 编辑器：`/admin/articles`
- 会话 API：`/api/admin/session`
- 文章读取/发布 API：`/api/admin/articles`
- 自动保存只写入当前浏览器的 localStorage；正式发布需要在二次确认框点击“确认发布”。
- 没有管理员环境变量时，编辑器不能登录；没有 GitHub 发布变量时，文章不能发布。
- 发布新文章写入 `content/blog/<slug>.mdx`。更新文章默认检查 GitHub SHA；如果管理员在发布确认框确认覆盖，当前草稿会替换 GitHub 最新版本。确认前请保留需要合并的远端内容。
- Markdown 预览使用 `react-markdown`、GFM 与 HTML 清理；不执行 MDX JSX。
- 浏览器草稿按网站来源隔离，换域名或设备前从旧浏览器导出 .md。Production 从旧默认域名切换到 www 后，旧域名草稿不会自动迁移。
- 线上工作台发布会使 main 产生新提交；本地修改前 fetch，禁止 force push 覆盖它们。

## Windows / Codex 文件权限提示

当前仓库的 `.git` 可能由 Codex 沙箱 SID 创建，而 PowerShell 使用 Windows Administrator SID。此时 Git 会报 `detected dubious ownership`。仅在你确认这是自己的项目后，为**这一个仓库**添加信任：

```powershell
git config --global --add safe.directory 'F:/software/Alpaca'
```

不要设置 `safe.directory '*'`，也不要反复执行 `git init`。新机器若仓库由当前账户克隆创建，通常不需要此设置。

正确的远端 URL 是纯文本（不要带 Markdown 的方括号或括号）：

```powershell
git remote -v
git status --short --branch
git pull --ff-only origin main
```

提交前检查差异，只 stage 明确变更的文件；本地草稿不要默认上传。

## 迁移时的保护清单

- 不复制 `node_modules/`、`.next/`、`.npm-cache/`；新工作区重新运行 `npm install`。
- 不复制或提交 `.env.local`、Token、管理员密码、用户数据或私钥。
- 先检查并保留原工作区的未提交、未跟踪文件；不要因切换 Codex 任务自动清理它们。
- GitHub 上的内容是已提交版本；本地未跟踪的文章或图片不会随 clone/push 自动同步。
- 本文中的“当前状态”是时间点快照，接手时应以 `git status`、远端分支和应用实际路由为准。

## 可直接用于新 Codex 任务的提示词

```text
请接手 TechAlpaca 项目。先确认工作目录并读取 AGENTS.md、CODEX_HANDOFF.md、
docs/development/project-guide.md 和 migration.md，再检查 git status、remote、最近提交。
正式站点是 https://www.alandodo.cn，Vercel 项目为 techalpaca-projects/alpaca，
GitHub 为 AlanDoDo/Alpaca/main。Research 只做机器人，AI/金融为独立页面。
保留白昼/暗夜主题、手机适配、Markdown 源文件和安全验证。
修改 Next.js 代码前阅读当前 node_modules/next/dist/docs/ 对应文档。
保护未提交修改与浏览器草稿，不索取或打印密钥，不 force push。
按我本次明确的任务进行开发；验证、提交、部署按本次授权执行。
完成后更新相关开发文档，说明已完成内容与尚未验证的边界。
```
