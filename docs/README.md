# 开发文档

这组文档是 TechAlpaca 的工程入口。实现以可维护的内容产品为起点，依赖明确的模块接口逐步扩展；阶段计划和当前完成状态分开记录。

| 文档 | 说明 |
| --- | --- |
| [开发与运维手册](development/project-guide.md) | 当前线上状态、路由、环境恢复、发布、域名及故障排查的统一入口 |
| [Codex 接手摘要](../CODEX_HANDOFF.md) | 新任务优先阅读的当前状态与用户偏好 |
| [产品需求](product/requirements.md) | 用户、页面、范围与验收标准 |
| [模块架构](architecture/modules.md) | 目录布局、依赖方向、各模块责任 |
| [数据模型](architecture/data-model.md) | PostgreSQL 表、身份映射与迁移规则 |
| [安全基线](architecture/security.md) | Auth、RLS、输入验证和秘密管理 |
| [开发流程](development/workflow.md) | 分支、编码约定、质量门槛 |
| [文章写作与维护](development/content-authoring.md) | Frontmatter、草稿、封面和内容审计 |
| [项目迁移](development/migration.md) | 新电脑环境恢复、Git 安全目录、文章工作流与 Codex 接手步骤 |
| [部署指南](operations/deployment.md) | Supabase 与 Vercel 配置步骤 |
| [Vercel 上线记录](operations/vercel-launch.md) | 项目关联、生产变量、腾讯云域名绑定 |
| [安全维护记录](operations/security-review.md) | 当前认证保护、限流边界与凭据轮换 |
| [访问与性能排查](operations/connectivity.md) | 连接超时、默认域名可达性及音乐加载 |
| [性能记录](development/performance.md) | 文件缓存、图片、搜索与首屏优化的历史测量 |
| [金融内容维护](development/finance-notebook.md) | 金融笔记来源、目录与维护方式 |
| [产品路线图](product/roadmap.md) | MVP 到开放社交协议的阶段边界 |
| [ADR](adr/README.md) | 重要技术决定及其背景 |

## 约定

- 每个业务能力放入 `src/modules/<module>`，由模块公开入口暴露服务和类型。
- 页面路由负责组合和参数解析，业务逻辑由模块实现。
- 文章正文保存在 Git；数据库保存用户生成内容和关系数据。
- Supabase 接入之前，未实现的能力以明确的占位页呈现，不使用假数据冒充持久化功能。
- 任何新增数据表都要同时写迁移、索引、约束和 RLS 策略。
- 当前状态以 [开发与运维手册](development/project-guide.md) 为准；数据模型中未接入的 Supabase/社区能力是规划，不是线上功能。
- 修改路由、发布流程、变量或域名时同步更新文档；只记录变量名，不记录凭据值。
