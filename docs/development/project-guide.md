# TechAlpaca 开发与运维手册

更新：2026-10-02。本文是当前项目的统一入口；历史性能数据和规划文档不代表实时运行状态。

## 1. 当前项目

| 项目 | 当前配置 |
| --- | --- |
| 正式地址 | https://www.alandodo.cn |
| 根域名 | https://alandodo.cn，跳转到 www |
| 默认域名 | https://alpaca-murex.vercel.app，仍保留 |
| GitHub | https://github.com/AlanDoDo/Alpaca，生产分支 main |
| Vercel | techalpaca-projects/alpaca |
| 域名解析 | 腾讯云 DNSPod |
| 本地工作区 | `F:\software\Alpaca` |
| 技术栈 | Node.js 24.x、Next.js 16.3.6、React 19、TypeScript、Tailwind CSS 4 |
| 内容快照 | 106 篇博客文章、4 篇金融笔记、13 项公开资源（2026-10-02）；以实际文件为准 |

网站定位是机器人研究与个人写作，AI 和金融为独立辅助内容。尚未接入普通用户系统、社区写入、评论、Supabase 数据库、封面文件上传。

## 2. 页面与代码

| 路由 | 用途 | 主要入口 |
| --- | --- | --- |
| `/` | 首页与精选文章 | `src/app/page.tsx` |
| `/blog` | 文章列表，分类与分页，每页最多 8 篇 | `src/app/blog/page.tsx` |
| `/article/[slug]` | 文章阅读、长文右侧目录 | `src/app/article/[slug]/page.tsx` |
| `/forum` | Research，机器人文章 | `src/app/forum/page.tsx` |
| `/ai` | AI 研究文章 | `src/app/ai/page.tsx` |
| `/finance` | 投机与投资笔记 | `src/app/finance/page.tsx` |
| `/finance/[slug]` | 金融笔记阅读 | `src/modules/content/finance.ts` |
| `/about` | 个人介绍、AI/金融入口与书单 | `src/app/about/page.tsx` |
| `/admin/login` | 管理员登录 | `src/lib/admin-auth.ts` |
| `/admin/articles` | Research、Notes、Resources 工作台，文章库与 Markdown 编辑 | `src/components/admin/article-editor.tsx`、`src/components/admin/resource-manager.tsx` |
| `/api/admin/session` | 登录、配置状态与退出 | `src/app/api/admin/session/route.ts` |
| `/api/admin/articles` | 后台读取、GitHub 发布 | `src/app/api/admin/articles/route.ts` |
| `/api/resources` | 读取资源、管理员向 GitHub 添加网站 | `src/app/api/resources/route.ts` |
| `/api/search` | 关键词搜索，最多 10 个结果 | `src/app/api/search/route.ts` |
| `/sitemap.xml`、`/robots.txt`、`/feed.xml` | 搜索索引与 RSS | `src/lib/site-url.ts` 统一站点地址 |

全局样式及主题在 `src/app/globals.css`；导航、音乐、搜索弹窗、右键菜单和悬浮开关在 `src/components/layout/`。列表摘要与正文由 `src/modules/content/` 管理。

## 3. 在新电脑恢复开发

先安装 Git、Node.js 24.x 和 npm，然后在准备存放项目的目录执行：

```powershell
git clone https://github.com/AlanDoDo/Alpaca.git
Set-Location Alpaca
npm install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

打开 `http://localhost:3000`。已有工作区先查看 `git status --short --branch`，确认无未保存修改后再 `git pull --ff-only origin main`。不要重复 `git init`，不要覆盖已有 `.env.local`。

### 环境变量

| 变量 | 本地/生产用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 本地 localhost；Production `https://www.alandodo.cn` |
| `ADMIN_EDITOR_PASSWORD` | 后台密码，建议使用至少 16 位随机值 |
| `ADMIN_SESSION_SECRET` | 会话签名密钥，至少 32 字符的随机值 |
| `GITHUB_TOKEN` | 服务端仓库 Contents 读写 Token |
| `GITHUB_OWNER` | `AlanDoDo` |
| `GITHUB_REPO` | `Alpaca` |
| `GITHUB_BRANCH` | `main` |

Supabase 变量仅预留，目前运行博客不需要。凭据从安全存储单独恢复，不通过 Git 迁移；不要粘贴到对话或文档。

Production 的三个凭据已保存为 Vercel Secret。新电脑需登录有权限的 Vercel 账户并关联已有项目；不要重新创建生产项目。不要用 `vercel env pull` 覆盖手工配置的 `.env.local`，尤其不要把生产写入 Token 用于不可信 Preview。

## 4. 内容与后台发布

```text
后台登录 → 文章库选择已有文章 / 新建 → 编辑 Markdown 和元数据
  → 本地草稿保存 → 确认发布 → GitHub Contents API 写入 main
  → Vercel 自动构建 → Ready 后线上更新
```

- 博客源文件：`content/blog/*.md`、`*.mdx`；金融笔记：`content/finance/`；图片：`public/images/`。
- 后台文章库按钮位于导出左侧，选择文章后载入编辑，不跳转阅读页面。
- 草稿保存在当前浏览器 localStorage，不能跨浏览器或设备恢复。更换域名也会切换存储空间；迁移前从旧域名导出未发布草稿。
- 正式文章读取优先使用 GitHub 最新版本。普通编辑按 `expectedSha` 检查冲突；发布确认框明确说明覆盖后，管理员可以用当前编辑器内容覆盖 GitHub 的最新版本。覆盖发布前请确认当前草稿包含需要保留的修改。
- Resources 工作台卡片用于管理资源指南中的网站；它要求管理员会话及服务端 GitHub 写入配置，并将数据更新到 `src/modules/content/resources-data.json`。资源页面只展示资源，不提供写入入口。
- 添加资源仅允许 HTTPS 网站地址和已配置的分类；保存会提交 GitHub 并触发 Vercel 部署。发布完成后新资源进入公开资源指南。
- `.mdx` 只是文件扩展名，正文不执行 JSX。元数据限制 YAML/JSON，JavaScript 引擎禁用；HTML 经 sanitize 清理。
- 发布正文不超过 500 KB；标题 160 字符、摘要 320 字符、作者及单个标签 80 字符，标签最多 20 个。封面输入 HTTPS 地址，不提供本地上传接口。
- 新增金融笔记还需维护 `src/modules/content/finance.ts` 的展示顺序，否则不会出现在金融列表。后台发布接口目前只写博客目录。

Frontmatter 示例与分类见 [内容维护](content-authoring.md)。

## 5. 开发与发布流程

先读 `AGENTS.md`，写 Next.js 代码前读当前安装版本 `node_modules/next/dist/docs/`。Node/npm 版本、锁文件和 `vercel.json` 应保持一致。

按用户要求及修改范围选择验证命令：

```powershell
npm run lint
npm run typecheck
npm run content:audit
node scripts/security-check.mjs
npm run build
```

提交仅暂存本次文件，检查 diff 后再 commit/push。main 更新会触发 Vercel 生产部署；检查 Ready、实际 commit 和正式域名，不把成功 push 当成成功上线。后台会同时产生远端提交，禁止 force push。

Vercel 使用 Next.js 预设、Node.js 24.x、`npm install` 与 `npm run build`。`outputFileTracingIncludes` 保证需要文件内容的服务端路由包含文章。修改服务器环境变量后需重新部署，不依赖本地 `.env.local` 上线。

## 6. 域名、HTTPS 与迁移

腾讯云 DNSPod 管理 `alandodo.cn`，Vercel 绑定根域名与 www；两个域名所有权均已通过验证。2026-09-27 的 A 记录为 `216.198.79.1`，迁移或重新绑定时以 Vercel 当前提示为准。

- 根域名重定向到 www；Production 站点 URL 为 `https://www.alandodo.cn`。
- 验证时两个域名分别需要 TXT 记录，主机都是 `_vercel`；值由 Vercel 当前目标账户生成，不复用旧验证值。
- 只调整对应网站 DNS 记录，保留邮箱 MX、SPF 等其他用途记录。
- 绑定后检查 HTTPS、根域名跳转、canonical、sitemap、RSS、搜索、后台登录及文章读取。
- 更换 Vercel 账户/项目时，重新关联 GitHub、恢复服务端变量、完成域名所有权验证，再调整解析。旧 `.vercel/project.json` 不直接复用。
- Git 保存源码和正式文章；浏览器草稿、本地未提交修改、Vercel Secret、腾讯云 DNS 配置均需另行保护。

详见 [上线清单](../operations/vercel-launch.md) 和 [Codex 迁移指南](migration.md)。

## 7. 常见故障

| 现象 | 排查及处理 |
| --- | --- |
| `ERR_CONNECTION_TIMED_OUT` | 记录访问地区、运营商与准确 URL；检查 DNS/网络链路，不通过关闭认证解决 |
| 旧 `.vercel.app` 地址不可达 | 优先分享正式自有域名；自有域名也不能保证所有地区连接稳定 |
| 域名需要验证 | 获取当前项目 TXT 值，在实际 DNS 服务商添加，再验证根域名和 www |
| `ERR_TOO_MANY_REDIRECTS` | 检查根/www 是否循环跳转、子域名是否仍绑定其他账户 |
| 登录 403 | 检查来源 URL 是否同源、是否使用正确部署；不要删除 Origin 校验 |
| 登录 429 | 应用按来源每实例最多 10 次 / 15 分钟，等待窗口结束 |
| 发布 409 | 文章在最后一次版本检查后又发生变化；保留草稿，重新载入最新版本并合并后重试 |
| 发布 502 | 检查 GitHub 网络、Token 有效期与 Contents 权限，不打印 Token |
| 发布后页面未更新 | 查看 GitHub 文件提交及 Vercel 最新构建状态，等 Ready 后刷新 |
| build `ERR_INVALID_URL` | 核查 Production 站点 URL；`getSiteUrl()` 已有空值/格式回退保护 |
| `npm ci` 失败 | 取日志开头的实际原因，检查锁文件同步；当前生产安装命令为 `npm install` |
| Git dubious ownership | 确认自己的仓库后精确信任 `F:/software/Alpaca`，不使用 `*` |
| 音乐没有声音 | 第三方/浏览器策略可能拦截，打开音乐面板手动播放；延后加载是设计行为 |

## 8. 安全与后续维护

- HttpOnly、生产 Secure、SameSite Strict 会话有效 8 小时；更换密码或会话密钥会使旧会话失效。
- 后台禁止缓存；写请求检查同源和授权，请求流按实际大小限制。
- 登录内存限流不跨实例共享；Vercel `Monitor admin login attempts` 为 50 次 / 60 秒的观察规则，只记录，不拦截。不要把它描述为已完成分布式防爆破。
- 基础 CSP 限制 base/object/frame/form，不是完整的脚本 nonce 策略。不要未经验证强加严格 CSP 破坏静态页面或音乐。
- Preview 保留部署保护，不复制生产写入凭据。真实凭据不使用 NEXT_PUBLIC_ 前缀，不入 Git、截图或文档。
- 定期审查依赖、轮换泄露/过期凭据、核查 Token 最小权限与域名续费。最新审计记录见 [安全维护](../operations/security-review.md)。

2026-09-27 已验证新域名下首页、Research、AI、Finance、长文、搜索、sitemap、robots、RSS、管理员登录和 GitHub 文章读取；未为验证操作发布文章。这是历史验收记录，后续部署仍需按任务确认。
