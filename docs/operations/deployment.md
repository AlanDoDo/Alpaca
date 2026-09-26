# 部署指南

## 本地准备

1. 安装 Node.js 20.9+ 和 npm。
2. 运行 `npm install`。
3. 复制 `.env.example` 到 `.env.local`。
4. 设置 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`。
5. 运行 `npm run dev`，确认首页、文章列表和文章详情可访问。

当前静态内容版本不依赖 Supabase 密钥。接入 Auth/社区后，创建 Supabase 项目并配置 URL、anon key；service role key 仅用于明确需要绕开 RLS 的服务端任务。

## Vercel

1. 将代码推送到 GitHub 仓库并在 Vercel 导入。
2. 使用 Next.js 默认框架预设和 `npm run build`。
3. 分别设置 Preview 与 Production 环境变量。
4. Preview 部署确认文章路由、metadata、窄屏布局与 404。
5. 将自定义域名指向 Production，确认 `NEXT_PUBLIC_SITE_URL` 使用最终 HTTPS 域名后重新部署。

部署前检查 Git 中没有 `.env.local`、Supabase service role key 或真实用户数据。文章构建为静态参数；新增文章随部署进入站点。

## Supabase 阶段

- 开发、预览和生产环境使用隔离凭据。
- 先在开发项目应用 `supabase/migrations`，验证 RLS 后再部署到生产。
- 配置 Auth redirect URL 和允许的站点域名；OAuth provider secret 保存在 Supabase/Vercel 服务端设置中。
- 生产部署前核对匿名用户、登录用户、作者和非作者的访问结果。

## 上线检查

### 站点地址与空值

`NEXT_PUBLIC_SITE_URL` 应填写完整 HTTPS 地址，例如 `https://your-project.vercel.app`。不要填写引号或 Markdown 链接。
站点地址解析现在跳过空值、去除首尾空格，并为仅域名的值补上 HTTPS；无效值依次回退到 `VERCEL_PROJECT_PRODUCTION_URL`、`VERCEL_URL` 和本地地址。
元信息、站点地图、robots 和 RSS 使用同一解析结果。环境变量改动后重新部署；生产环境仍建议明确设置最终域名，以保证分享和索引地址准确。

- `npm run lint`、`npm run typecheck`、`npm run build` 成功。
- 页面 metadata、canonical、robots、sitemap 和 RSS 已逐项核实。
- 375px 和桌面宽度下导航、长标题和正文可用。
- 环境变量分环境配置，错误日志没有敏感值。
- Supabase 表启用 RLS，匿名与普通用户策略经验证。
