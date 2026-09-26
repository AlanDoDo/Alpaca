# 金融笔记页面

金融首页 `/finance` 分为投机、投资，About 页提供入口。4 篇 Markdown 笔记存放于 `content/finance/`，附图位于 `public/images/finance/`。阅读路由为 `/finance/[slug]`，复用现有安全 Markdown 渲染和桌面悬浮目录。

每篇 frontmatter 包含 `title`、`description`、`section`（投机或投资）、`topic`、`source`。文件名是路由 slug；显示顺序在 `src/modules/content/finance.ts` 的 `order` 数组维护。新增文件需同步加入该数组。

原始 Obsidian 笔记迁移命令：

```powershell
node scripts/import-finance-notes.mjs 'F:/Note/人形机器人/交易投资'
```

脚本重新运行会覆盖同名金融 Markdown 和附图，因此网站侧编辑后不要直接重新导入。它将一级标题转为二级标题，将 Obsidian 提示块转换为普通引用，并将相对图片地址复制为站内地址。原笔记目录不被修改。第三方 PDF 不转载。

当前保留 4 篇笔记，附图使用站内地址。原文中的市场数据、概率、配置方案和摘录仍保留原始语境；本次迁移没有做事实核验或将其改写成当前投资建议。金融笔记暂不进入博客文章工作台，编辑项目内 Markdown 即可更新内容。
