# 安全基线

## 密钥与运行环境

- `.env.local` 不提交；`.env.example` 只放空值和说明。
- `NEXT_PUBLIC_*` 是公开变量，任何客户端 bundle 都可读取。
- `SUPABASE_SERVICE_ROLE_KEY` 仅限受控服务端任务，模块应标注 `server-only`；通常优先使用用户会话和 RLS，而不是 service role。
- Preview 和 Production 使用各自独立 Supabase 项目或明确隔离的 schema/数据。

## 数据访问

- 所有用户数据表默认启用 RLS，未编写策略前不给公开访问。
- profile 公开字段和私密设置分开定义；用户只能修改自己的资料。
- 用户可以读公开帖子；只有作者或明确的版主权限可以编辑/删除帖子。
- 点赞、收藏、关注写策略校验 `auth.uid()` 与 `user_id` 一致。
- 计数、角色授予、举报处置等敏感行为在受控服务端或数据库函数处理。

## 输入与渲染

- 在 Server Action/API 边界使用 schema 校验类型、长度、格式和枚举。
- 将 Markdown 当不可信输入处理；渲染器不启用原始 HTML 或 MDX 执行。文章只使用 Markdown/GFM 表格、列表和代码块。
- 链接方案限制为 `https:`、`http:`、站内路径；上传图片需校验类型、大小和授权。
- React 默认文本转义不替代输入校验；禁止 `dangerouslySetInnerHTML` 处理用户文本。
- 登录、发帖、评论和搜索端点后续配置合理的速率限制与滥用监控。

## Web 安全与隐私

- 写请求依赖 Supabase session 和受保护的 server action/API；检查来源与授权，避免跨站请求造成状态改变。
- 错误响应不得返回 SQL、token、内部路径或个人敏感信息。
- 最少收集个人资料；用户资料字段是否公开应有明确产品默认值。
- 重要安全策略作为迁移的一部分保存并代码审阅，不仅依赖 Supabase 控制台手工设置。
