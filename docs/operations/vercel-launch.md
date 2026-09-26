# Vercel 上线填写清单

## 导入项目

仓库 `AlanDoDo/Alpaca`，Production Branch `main`，Root Directory `./`。

| 设置 | 值 |
| --- | --- |
| Framework Preset | Next.js |
| Node.js | 24.x（package.json 已声明） |
| Install Command | npm install（vercel.json 已声明） |
| Build Command | npm run build |
| Output Directory | 使用 Next.js 默认值，不填写 out |

本项目包含管理员、搜索等服务端 API，不能使用纯静态导出。

## Production 环境变量

| 变量 | 值 |
| --- | --- |
| NEXT_PUBLIC_SITE_URL | 完整实际域名，如 https://your-project.vercel.app |
| ADMIN_EDITOR_PASSWORD | 从密码管理器或本地 .env.local 获取 |
| ADMIN_SESSION_SECRET | 至少 32 字符的随机密钥 |
| GITHUB_TOKEN | 仅目标仓库 Contents 读写权限的 Token |
| GITHUB_OWNER | AlanDoDo |
| GITHUB_REPO | Alpaca |
| GITHUB_BRANCH | main |

Supabase 尚未接入，无需填写其变量。不要上传 .env.local。Preview 环境如需试写，使用单独发布分支和对应权限的凭据，避免预览发布改动 main。

如果尚不知道最终域名，可先不创建 NEXT_PUBLIC_SITE_URL，代码会采用 Vercel 生成的项目域名。取得正式域名后再明确设置，重新部署生效。

## 已处理的问题

- 空字符串不再使 metadataBase 抛出 Invalid URL。
- URL 统一用于元信息、RSS、robots 与 sitemap。
- 服务端文章读取路由显式包含 content/blog 文件，避免上线后找不到文章。
- 已审查 unrs-resolver 1.12.2 的 postinstall，它通过 napi-postinstall 准备当前平台的原生解析依赖；仅批准此版本。升级该依赖后重新审查批准记录。
- ESLint 9 的停止维护提示仍可能出现，当前不是构建失败原因；大版本升级作为独立维护任务进行。

## 部署后确认

1. Deployments 状态为 Ready，确认部署来源是最新 main 提交。
2. 打开首页、About、Research、AI、Finance 和一篇长文。
3. 搜索“机器人”，确认返回文章；打开一个不存在的地址，确认 404。
4. /sitemap.xml、/robots.txt、/feed.xml 中的域名为正式地址。
5. /admin/login 登录成功，文章库可载入。发布会写入 GitHub；普通检查使用草稿和预览即可。
6. 检查桌面和手机布局。GitHub 发布不会直接改写部署中的文件，需要等待新部署完成。

Vercel 环境变量、域名及实际部署状态需在账户中配置；本清单不代表已经部署。

## 当前项目关联

项目：`techalpaca-projects/alpaca`，正式默认域名：`https://alpaca-murex.vercel.app`。
GitHub 仓库已连接，生产分支为 `main`。`vercel.json` 固定使用 `npm install`，`.vercelignore` 明确排除本地凭据与构建缓存。
管理员及 GitHub 发布变量已在用户授权后配置到 Production；实际值不记录在文档中。

2026-09-27：生产部署达到 Ready；首页、About、Research、AI、Finance、长文、sitemap、robots、RSS 和搜索访问正常，未知路径返回 404。管理员登录和 GitHub 文章读取均返回 200。未执行文章发布操作。

参考：https://vercel.com/docs/functions/runtimes/node-js/node-js-versions 、https://vercel.com/docs/environment-variables
