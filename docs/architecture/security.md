# 安全基线

## 当前已实现保护

管理员是服务端密码登录与 HMAC 签名 Cookie，不依赖 Supabase。HttpOnly、生产 Secure、SameSite Strict 会话有效 8 小时；密码或会话密钥变化使旧会话失效。后台禁止缓存，写接口校验同源和授权，登录/发布按实际请求流字节限制大小，发布校验 slug、字段和 GitHub SHA。

登录限制为每来源每实例 10 次 / 15 分钟，冷启动会重置，实例间不共享。Vercel 登录监测规则为 50 次 / 60 秒且仅记录，不宣称已实现分布式防爆破。详细安全审计、维护限制与凭据轮换见 [安全记录](../operations/security-review.md)。

## 密钥与运行环境

- `.env.local` 不提交；`.env.example` 只放空值和说明。
- `NEXT_PUBLIC_*` 是公开变量，任何客户端 bundle 都可读取。
- `SUPABASE_SERVICE_ROLE_KEY` 仅限受控服务端任务，模块应标注 `server-only`；通常优先使用用户会话和 RLS，而不是 service role。
- Preview 和 Production 使用各自独立 Supabase 项目或明确隔离的 schema/数据。

## 数据访问

以下为后续 Supabase/社区接入时的约束，目前没有这些数据库写入能力。

- 所有用户数据表默认启用 RLS，未编写策略前不给公开访问。
- profile 公开字段和私密设置分开定义；用户只能修改自己的资料。
- 用户可以读公开帖子；只有作者或明确的版主权限可以编辑/删除帖子。
- 点赞、收藏、关注写策略校验 `auth.uid()` 与 `user_id` 一致。
- 计数、角色授予、举报处置等敏感行为在受控服务端或数据库函数处理。

## 输入与渲染

- 在 Server Action/API 边界使用 schema 校验类型、长度、格式和枚举。
- 将 Markdown 当不可信输入处理；当前使用 rehype-raw 解析 HTML，再通过 rehype-sanitize 清理，不执行 MDX JSX。文章 frontmatter 限制为 YAML/JSON，禁用 JavaScript 引擎。
- 链接方案限制为 `https:`、`http:`、站内路径；上传图片需校验类型、大小和授权。
- React 默认文本转义不替代输入校验；禁止 `dangerouslySetInnerHTML` 处理用户文本。
- 当前登录已有实例内限流与线上监测；后续新增发帖、评论等端点时单独设计共享限流，不能复用日志规则冒充拦截。

## Web 安全与隐私

- 当前后台写请求使用管理员签名会话并检查来源与授权；未来普通用户写入使用 Supabase session 与 RLS。
- 错误响应不得返回 SQL、token、内部路径或个人敏感信息。
- 最少收集个人资料；用户资料字段是否公开应有明确产品默认值。
- 重要安全策略作为迁移的一部分保存并代码审阅，不仅依赖 Supabase 控制台手工设置。
