# TechAlpaca — Codex 接手摘要

更新日期：2026-09-26

> 新 Codex 任务先读根目录 `AGENTS.md` 和 [迁移与接手指南](docs/development/migration.md)。该指南描述环境恢复、路由地图、环境变量、安全边界和 Windows Git 所有权问题。

## 当前目标与产品边界

TechAlpaca 是 AI、机器人、金融与个人思考的个人内容平台。当前主线是个人内容中心；文章由 Git 中的 Markdown/MDX 提供。社区身份、Supabase 和去中心化身份仍属后续阶段。保持模块清晰，不要把未实现能力写成已上线。

## 技术栈与注意事项

- Next.js 16.3.6 App Router、React 19、TypeScript、Tailwind CSS 4。
- npm scripts：`dev`、`lint`、`typecheck`、`build`。
- 必须遵循 `AGENTS.md`：修改 Next.js 代码前阅读当前安装版本的 `node_modules/next/dist/docs/` 对应文档。
- 文章数据与验证位于 `src/modules/content/`；Markdown 展示位于 `src/components/blog/`。
- 管理后台位于 `src/app/admin/`、`src/app/api/admin/` 和 `src/components/admin/`；认证位于 `src/lib/admin-auth.ts`。

## 已实现的后台文章编辑能力

- `/admin/login`、`/admin/articles`：管理员登录与编辑工作台。
- Markdown 编辑、即时预览、元数据编辑、分类与标签、可选 HTTPS 封面、文章导出。
- localStorage 草稿自动保存和刷新恢复。
- 服务端经 GitHub Contents API 发布到 `content/blog/<slug>.mdx`；更新按 SHA 检查版本冲突。
- Cookie 为 HttpOnly、SameSite Strict、8 小时过期；写操作做同源校验；管理路由不索引。
- 发布后由 Vercel Git 部署。需要分别配置本地与 Vercel 环境变量；不要在 Codex 中索取或记录真实密钥。
- 相关配置详见 [README 在线文章编辑器](README.md#在线文章编辑器) 和 [迁移指南](docs/development/migration.md)。

## Git 与已知工作区状态

- GitHub：`https://github.com/AlanDoDo/Alpaca.git`
- 主分支：`main`
- 本 handoff 文档编写前，远端和本地已同步至 `9c9fbc6`（文章摘要更新）。
- **已知未跟踪文章**：`content/blog/ai-agent-internet.mdx`。在它由用户确认提交之前，不要删除、覆盖或随其他文件一起 stage/push。
- 新任务应重新运行 `git status --short --branch`；本快照可能已经过期。
- 当前 Windows Codex/Administrator 的 Git SID 不同，若出现 dubious ownership，使用迁移指南中的仓库级精确 safe.directory 设置。不要使用通配符 `*`。

## 对用户偏好的记录

- 直接在当前项目完成实现，不只给方案；有足够上下文时自行做常规工程决策。
- 中文沟通，重视桌面/手机适配、白昼/暗夜主题、细节与可运行状态。
- 编辑器文章需保留 Markdown 源文件；没有封面时不渲染占位封面。
- 修改后按范围运行 TypeScript、ESLint 和 build；不要把真实凭据写入仓库。
- 提交或推送时只包含明确选定的文件，保护用户其他本地改动和未跟踪草稿。
