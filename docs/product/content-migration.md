# 博客文章迁移记录

## 导入结果

当前 `content/blog/` 共收录 **95 篇**文章：81 篇来自本地 Hexo 目录 `F:\software\Blog\source\_posts`，另有 14 篇从 [techalpaca.vercel.app](https://techalpaca.vercel.app/blog) 的公开文章索引和 Markdown 正文合并而来。迁移不会修改原站或本地源文件。

本地文章保留 Markdown、GFM 表格和代码块。旧 Hexo 提示、文字颜色和折叠标签会转换成普通 Markdown；旧文章可安全显示的 HTML 由渲染器清理后输出。Front Matter 中的标题、日期、标签、封面和描述会尽量保留，缺失字段会根据文件名或正文生成默认值。

图片沿用原有托管位置：本地 Hexo 文章继续加载腾讯云 COS 图片；线上文章使用 `techalpaca.vercel.app/blogs/...` 下的原图与封面，不重复复制图片。

## 分类

| 分类 | 文章数 | 内容范围 |
| --- | ---: | --- |
| 编程 | 49 | Python、Java、前端、数据库、Git、数据结构、C 语言等 |
| 工程技术 | 13 | Linux、网络、操作系统、嵌入式、IoT、Web3 等 |
| 机器人 | 10 | ROS、导航、仿真、机械臂、机器人产业链与 VLA |
| AI | 10 | ChatGPT、机器学习、AI 模型、CNN、Transformer、强化学习等 |
| 杂谈 | 6 | 个人思考、教育、阅读与生活方式 |
| 产业 | 4 | 行业与产业相关内容 |
| 金融 | 2 | 投资与黄金相关内容 |
| 设计 | 1 | Photoshop 与视觉设计 |

分类依据标题、原分类和标签映射到 TechAlpaca 的固定分类；标签作为文章元数据保留。

## 重新导入

本地 Hexo 源文章：

```powershell
node scripts/import-legacy-blog.mjs 'F:\software\Blog\source\_posts' --dry-run
node scripts/import-legacy-blog.mjs 'F:\software\Blog\source\_posts'
```

从线上公开索引重新获取文章：

```powershell
.\scripts\import-online-blog.ps1 --dry-run
.\scripts\import-online-blog.ps1
```

线上迁移脚本只导入公开索引中的可见文章；下载缓存保存在 `.migration-cache/`，不会被站点打包。导入时遇到已有 slug 会自动追加序号。

演示文章移至 `content/samples/`，不显示在正式博客中。
