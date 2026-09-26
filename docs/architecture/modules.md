# 架构与模块职责

## 当前技术边界

- Next.js App Router + React Server Components：页面组合和静态渲染。
- TypeScript：共享类型与服务边界。
- Tailwind CSS：表现层样式。
- Git 中的 Markdown 文件系统：首期文章来源；用安全的 Markdown 渲染器显示，不执行文章里的 JSX。
- Supabase PostgreSQL/Auth：后续用户生成内容和认证。
- Vercel：构建、预览和托管。

## 目录布局

```text
src/
  app/                    # 路由、页面组合、metadata、全局样式
  components/
    ui/                   # 无业务含义的基础 UI
    layout/               # 全站导航与页脚
    blog/                 # 文章展示组件
    forum/                # 论坛展示组件
    profile/              # 用户资料展示组件
  modules/
    content/              # Markdown 读取、解析、查询和文章类型
    identity/             # 用户身份映射、profile、Auth 适配器
    community/            # 帖子、评论、点赞、收藏、关注
    search/               # 内容索引与搜索用例
    shared/               # 验证、错误和跨模块基础类型
  lib/
    supabase/             # Supabase 客户端构造器（server/browser 分开）
    utils/                # 通用纯函数
  types/                  # 真正跨模块的基础类型
content/blog/              # 受版本控制的文章
supabase/migrations/       # 可重复执行的数据库结构变更
docs/                      # 产品、架构、运维和决策文档
```

## 依赖方向

```text
app routes -> feature components -> module public API -> adapters (filesystem / Supabase)
```

- `app` 只做路由、metadata、Server Action/API 入口和组件组合。
- 页面组件不得直接写 SQL 或从 Supabase 任意表读取。
- 业务规则和数据校验进入对应的 `modules/*`。
- `components/ui` 不依赖业务模块；业务组件可以接收模块类型作为 props。
- 服务端密钥只能由 server-only adapter 读取；浏览器只能使用公开 anon key 和受 RLS 保护的请求。
- 模块间通过导出的类型和用例协作，避免相互导入私有文件。

## 模块契约

### content

当前已实现 `getAllArticles()`、`getArticleBySlug()` 和文章类型。只在服务端读取文件；输出摘要与正文类型分开，避免列表载入正文。frontmatter 在进入页面之前解析，新增校验后应对无效字段给出文件名和字段名。

### identity（规划）

认证提供者映射到平台稳定的内部 `profile.id`。Supabase Auth UUID 是当前 provider subject，不是跨协议通用身份。`did`、`public_key`、`wallet_address` 和 `identity_provider` 都是可空关联属性。

### community（规划）

对外提供帖子、回复、点赞、收藏和关注用例。写操作必须确认用户身份、校验输入，并依赖 RLS 再做数据库层约束。帖子计数由受控函数/查询计算或事务更新，不信任客户端传入计数。

### search（规划）

先从文章元数据和正文建立轻量索引。搜索接口返回统一的结果类型；内容来源可由 MDX 切换到 PostgreSQL 全文检索，不让页面耦合搜索实现。

## 新增模块的完成清单

1. 明确模块唯一职责、公开 API 和错误语义。
2. 类型与输入 schema 放在模块内部。
3. 数据读写 adapter 放在服务端，UI 不携带数据库细节。
4. 若引入持久化表，添加迁移、外键、唯一约束、索引和 RLS。
5. 更新对应文档中的状态与配置说明。
