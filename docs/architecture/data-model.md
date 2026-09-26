# 数据模型与身份演进

数据库以 Supabase PostgreSQL 为目标。首期文章内容在 Git；以下社区表属于接入 Supabase 阶段的逻辑模型，尚未通过迁移创建。

## 身份原则

`profiles.id` 对应平台内部主体 ID，并在初期与 `auth.users.id` 一对一。外部登录方式和未来协议身份作为单独关联记录，不把任意 DID 或钱包地址当主键。更换认证供应商时，业务内容关联的主体 ID 应保持稳定。

## 表与约束

| 表 | 关键字段 | 约束 / 备注 |
| --- | --- | --- |
| `profiles` | `id`, `username`, `display_name`, `avatar_url`, `bio`, `did`, `public_key`, `wallet_address`, `identity_provider`, timestamps | `id` FK 到 Auth；username 唯一且规范化；身份扩展字段可空 |
| `posts` | `id`, `author_id`, `title`, `content`, `category`, timestamps, `view_count` | 作者 FK；浏览计数服务端维护；内容长度有限制 |
| `comments` | `id`, `post_id`, `author_id`, `parent_id`, `content`, `created_at` | 父评论必须属于相同帖子；限制嵌套深度或只允许一级回复 |
| `likes` | `id`, `user_id`, `post_id`, `created_at` | `(user_id, post_id)` 唯一；用户只能为帖子点赞 |
| `follows` | `id`, `follower_id`, `following_id`, `created_at` | 复合唯一；禁止自我关注 |
| `bookmarks` | `id`, `user_id`, `post_id`, `created_at` | `(user_id, post_id)` 唯一；仅本人可读写 |

未来需求明确后，再拆建 `identities`、`social_graph`、`notifications`、`communities` 和信誉记录。首期不建空壳表。

## 迁移要求

- 所有 schema 改动通过 `supabase/migrations/<timestamp>_<name>.sql` 版本控制。
- 外键、检查约束、索引和 RLS 与建表在同一个变更中提供。
- 删除内容优先考虑软删除和审计需求；账号删除遵守用户内容保留策略。
- 不在客户端接受 `like_count`、`view_count`、`created_at` 作为权威值。
- 生产迁移必须可审阅、可重复部署，并提供必要的数据回填步骤。
