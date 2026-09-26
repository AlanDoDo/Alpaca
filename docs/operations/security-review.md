# 安全检查与维护

检查时间：2026-09-27。范围：管理员登录、会话、GitHub 发布、Markdown 渲染、依赖与部署配置。

## 本次修复

- 登录接口每个来源每个实例最多 10 次 / 15 分钟，超过返回 429 和 Retry-After；仅 Vercel 环境信任平台覆盖的 X-Forwarded-For。其他部署合并为一个限流来源。
- 登录和发布接口按实际请求流字节数限制大小，拒绝 null、数组、无效 JSON，防止请求头伪造导致限制失效和未捕获异常。
- 文章元数据仅接受 YAML/JSON，禁用 gray-matter 自带 JavaScript 执行引擎，包括 GitHub 读取和本地文章加载。
- 会话签名绑定管理员密码；更换密码或会话密钥后旧会话失效。本次签名版本更新会要求已登录管理员重新登录。
- 后台/API 禁止缓存；全站添加防嵌入、MIME 嗅探、来源及设备权限保护头。
- CSP 仅限制 base/object/frame-ancestors/form-action，保留静态页面和音乐兼容性；不是完整的脚本 CSP。文章 HTML 仍经 rehype-sanitize 清理，MDX 不执行代码。
- 发布接口限制标签长度与 GitHub SHA 格式，文章路径继续限制在 content/blog 目录。

## 验证

运行 `node scripts/security-check.mjs`、`npm run typecheck`、`npm run lint`、`npm run build`、`npm audit`。
安全回归检查使用临时密码，不读取本地凭据，不发布文章。

## 线上仍需关注

- 内存限流在冷启动时重置，多个 Vercel 实例不会共享计数。正式抗暴力尝试需要 Vercel WAF 的共享限流规则或 Redis。建议对 POST /api/admin/session 配置 10 次 / 15 分钟的来源限流；具体配额按账号套餐支持设置。
  参考：[Vercel 限流指南](https://vercel.com/kb/guide/add-rate-limiting-vercel)。
- 曾经在聊天或日志中出现过的管理员密码应更换；若 GitHub Token / 会话密钥泄露，同样立即轮换。不要在聊天中粘贴新凭据。
- GitHub 优先使用仅针对本仓库的 fine-grained Token，仅授予 Contents 读写，设置有效期。不要使用全账号仓库权限。
- .env.local 和 .vercel 不进入 Git；线上值仅保存在 Vercel 服务端环境变量。不要添加 NEXT_PUBLIC_ 前缀。
- 本地代码修改在重新部署前不会改变当前线上网站。依赖审计没有已知漏洞不代表没有未知漏洞，定期重新审计。
- 第三方音乐 iframe 和远程图片仍会连接外部服务，不向其提供后台 Cookie；可按隐私要求关闭音乐模块。

## Vercel 核对与更新（2026-09-27）

- 项目：techalpaca-projects/alpaca；生产域名 https://alpaca-murex.vercel.app。
- 三项凭据保持 Production Secret；未加入 Preview 环境，未修改已有部署保护。
- 已发布防火墙监测规则 `Monitor admin login attempts`：仅匹配 POST /api/admin/session，按来源 IP 50 次 / 60 秒后记录。此规则处于观察模式，不拦截请求；应用层仍执行 10 次 / 15 分钟限制。后续观察正常使用频率后再决定拦截阈值。
- 音乐播放器改为访问网站即加载 `auto=1`，仍默认收起。iframe 去掉剪贴板写权限并加入沙箱限制。浏览器或网易云策略可能阻止有声自动播放，音乐面板始终提供手动播放提示。
- Git 与 Vercel 源码上传均排除 .env.local 和 .vercel；安全回归、Lint、类型检查和 117 页生产构建通过。
