# 开发文档

这组文档是 TechAlpaca 的工程入口。实现以可维护的内容产品为起点，依赖明确的模块接口逐步扩展；阶段计划和当前完成状态分开记录。

| 文档 | 说明 |
| --- | --- |
| [产品需求](product/requirements.md) | 用户、页面、范围与验收标准 |
| [模块架构](architecture/modules.md) | 目录布局、依赖方向、各模块责任 |
| [数据模型](architecture/data-model.md) | PostgreSQL 表、身份映射与迁移规则 |
| [安全基线](architecture/security.md) | Auth、RLS、输入验证和秘密管理 |
| [开发流程](development/workflow.md) | 分支、编码约定、质量门槛 |
| [项目迁移](development/migration.md) | 新电脑环境恢复、Git 安全目录、文章工作流与 Codex 接手步骤 |
| [部署指南](operations/deployment.md) | Supabase 与 Vercel 配置步骤 |
| [产品路线图](product/roadmap.md) | MVP 到开放社交协议的阶段边界 |
| [ADR](adr/README.md) | 重要技术决定及其背景 |

## 约定

- 每个业务能力放入 `src/modules/<module>`，由模块公开入口暴露服务和类型。
- 页面路由负责组合和参数解析，业务逻辑由模块实现。
- 文章正文保存在 Git；数据库保存用户生成内容和关系数据。
- Supabase 接入之前，未实现的能力以明确的占位页呈现，不使用假数据冒充持久化功能。
- 任何新增数据表都要同时写迁移、索引、约束和 RLS 策略。
