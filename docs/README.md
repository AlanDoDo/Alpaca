# 开发文档

按任务进入对应文档。产品状态、路由、环境变量和运维信息以[项目与运维手册](development/project-guide.md)为准；历史记录用于说明变更背景，不代表当前线上状态。

## 开始开发

- [项目与运维手册](development/project-guide.md)：路由、模块、环境恢复、发布、线上排查
- [开发流程](development/workflow.md)：分支、实现约定与质量检查
- [迁移与交接](development/migration.md)：在新设备恢复工作区和内容
- [Codex 交接摘要](../CODEX_HANDOFF.md)：工作区现状和协作约定

## 产品与内容

- [产品需求](product/requirements.md) · [产品路线图](product/roadmap.md)
- [内容维护](development/content-authoring.md) · [分类与文章组织](development/article-organization.md)
- [内容迁移](product/content-migration.md)
- [Research 机器人资料库](development/robotics-library.md) · [Notes 画廊](development/notes-gallery.md)
- [金融笔记](development/finance-notebook.md)

## 架构与安全

- [模块边界](architecture/modules.md) · [数据模型](architecture/data-model.md)
- [安全基线](architecture/security.md) · [安全维护记录](operations/security-review.md)
- [架构决策记录](adr/README.md)

## 部署与运行

- [部署指南](operations/deployment.md) · [Vercel 上线清单](operations/vercel-launch.md)
- [访问问题排查](operations/connectivity.md) · [性能记录](development/performance.md)
- [上线前检查记录](development/prelaunch-check.md)

## UI 与专项实现

- [视觉系统](development/ink-visual-system.md) · [音乐播放器](development/music-player.md)
- [编辑器体验](development/experience-improvements.md)

## 项目约定

- 路由组合页面，`src/modules/` 管理内容和领域逻辑，组件负责展示与交互。
- 文章及资源目录保存在 Git；规划中的 Supabase 和社区功能不视为已上线能力。
- 新增或修改环境变量、路由、发布流程时同步更新相关文档。文档只记录变量名，不记录凭据值。
- Next.js 约定以当前安装版本的 `node_modules/next/dist/docs/` 为准；先读仓库根目录的 `AGENTS.md`。
