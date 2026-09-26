# 开发流程

## 开发命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

提交前根据改动范围运行 lint、typecheck 和 build；构建依赖所需的环境变量应使用无敏感信息的示例值。

## 实施顺序

1. 项目骨架、全局 Layout、设计 tokens。
2. 首页和可复用文章列表。
3. MDX 解析、文章页、静态参数和 SEO metadata。
4. Supabase schema、RLS、服务端与浏览器客户端边界。
5. Auth 与 profile。
6. 论坛、评论、互动和社区权限。
7. 搜索、RSS、sitemap、robots。
8. 移动端、可访问性和性能收尾。
9. Vercel Preview 验证与 Production 发布准备。

## 代码约定

- 文件名用 kebab-case，组件用 PascalCase，函数和变量用 camelCase。
- 默认使用 Server Component；只有需要状态、事件或浏览器 API 时才加 `use client`。
- 单文件保持单一职责；路由不承担数据库映射、输入验证或复杂业务规则。
- 日期在数据层使用 ISO 8601；展示时统一时区和格式。
- 组件 props 使用明确定义的类型，不用宽泛 `any`。
- 页面结构支持键盘导航、语义标签和可见焦点。

## 变更记录

技术决策通过 ADR 记录背景、选项和后果。新增依赖要说明它解决的具体问题；新模块同步更新架构图、数据模型或安全说明。
