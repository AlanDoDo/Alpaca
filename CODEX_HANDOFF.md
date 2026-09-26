# TechAlpaca — Codex 接手摘要

更新日期：2026-09-27

> 新 Codex 任务先读根目录 `AGENTS.md` 和 [迁移与接手指南](docs/development/migration.md)。该指南描述环境恢复、路由地图、环境变量、安全边界和 Windows Git 所有权问题。

## 当前目标与产品边界

TechAlpaca 是 AI、机器人、金融与个人思考的个人内容平台。当前主线是个人内容中心；文章由 Git 中的 Markdown/MDX 提供。社区身份、Supabase 和去中心化身份仍属后续阶段。保持模块清晰，不要把未实现能力写成已上线。

## 技术栈与注意事项

- Next.js 16.3.6 App Router、React 19、TypeScript、Tailwind CSS 4。
- npm scripts：`dev`、`lint`、`typecheck`、`build`。
- Node.js 24.x；内容审计 `npm run content:audit`；安全回归 `node scripts/security-check.mjs`。
- 开发和运维入口：[项目手册](docs/development/project-guide.md)。
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
- 已完成自定义域名配置文档提交 `e9596d8`。这是本次文档整理前的快照，不是要求回退到的提交。
- `content/blog/ai-agent-internet.mdx` 已是已跟踪文章；不要沿用旧交接文档中的“未跟踪”判断。
- 用户通过线上工作台发布时会产生新的 GitHub 提交。修改前检查远端，工作区干净时使用 `git pull --ff-only`；禁止 force push 覆盖在线文章。
- 新任务应重新运行 `git status --short --branch`；本快照可能已经过期。
- 当前 Windows Codex/Administrator 的 Git SID 不同，若出现 dubious ownership，使用迁移指南中的仓库级精确 safe.directory 设置。不要使用通配符 `*`。

## 当前生产配置

- 站点：https://www.alandodo.cn；根域名 alandodo.cn 跳转到 www。
- Vercel：`techalpaca-projects/alpaca`，GitHub main 自动部署，Node.js 24.x，函数区域 iad1。
- 腾讯云 DNSPod 管理域名解析；两个域名所有权已验证，HTTPS、搜索、后台登录和 GitHub 读取已检查。
- Production `NEXT_PUBLIC_SITE_URL=https://www.alandodo.cn`；后台密码、会话密钥、GitHub Token 为服务端 Secret。Preview 不使用生产凭据。
- `.vercel` 中的关联文件和临时验证脚本不入 Git；在新机器重新 link，不创建另一个同名项目。
- 最近功能：机器人 Research、独立 AI/Finance、右下角快捷菜单与搜索弹窗、安全加固、页面 load 后 1.5 秒准备音乐。
- 已知边界：实例内登录限流不共享；Vercel WAF 登录规则只监测；草稿仅存在浏览器本地；跨网络访问速度不能保证。

## 对用户偏好的记录

- 直接在当前项目完成实现，不只给方案；有足够上下文时自行做常规工程决策。
- 中文沟通，重视桌面/手机适配、白昼/暗夜主题、细节与可运行状态。
- 编辑器文章需保留 Markdown 源文件；没有封面时不渲染占位封面。
- 实现验证按用户任务要求运行；纯文档修改核对链接和事实即可，不自动运行应用测试。不要把真实凭据写入仓库。
- 提交或推送时只包含明确选定的文件，保护用户其他本地改动和未跟踪草稿。
