# 上线前检查记录

日期：2026-09-27。

## 分类与内容

- 全部 104 篇博客文章均有明确分区：Research 82 篇、Notes 22 篇；无遗漏、重复或冲突。
- Notes：随笔思考 8 篇、行业思考 4 篇、工具分享 10 篇。
- Research：编程 57 篇、产业与应用 1 篇、电子与嵌入式 6 篇、感知与定位 2 篇、规划与导航 2 篇、运动与控制 2 篇、具身智能 4 篇、系统与工程 8 篇。机械与执行机构暂无文章，保留空状态。
- 每篇文章保存 researchTopic 或 notesTopic。Notes 显式选择优先于旧文章分类；后台、前台、搜索摘要、导出与发布使用相同字段。
- ChatGPT 使用感受改归随笔思考，DeFi 实战教程改归工具分享；完整逐篇清单见 article-organization.md。
- 原文正文与链接保持有效；四篇独立金融笔记保留原页面。

## 已通过

| 检查 | 结果 |
| --- | --- |
| npm run typecheck | 通过 |
| npm run lint | 通过 |
| npm run build | 通过，生成 126 个页面 |
| npm run content:audit | 104 篇元数据、84 个本地图片引用通过 |
| node scripts/audit-article-sections.mjs | 无遗漏、重复、冲突；刷新逐篇清单 |
| node scripts/check-article-classification.mjs | 3 个 Notes 分类、9 个 Research 分类校验与序列化往返通过，冲突及无效值拒绝 |
| node scripts/security-check.mjs | 安全回归通过 |
| npm audit --omit=dev --audit-level=high | 生产依赖 0 个已知漏洞 |
| git diff --check | 通过 |
| 生产模式浏览器测试 | 通过，最终运行无浏览器运行时异常 |

## 浏览器验证范围

测试运行于本地生产服务 http://localhost:3001，使用系统 Chrome 和工作区运行时提供的 Playwright；agent-browser CLI 在当前环境不可用。

- 首页、Notes、Research、AI、金融、About 正常打开。
- Notes 三个筛选、Research 具身智能与编程筛选正常。
- 遍历 Notes 两页及 Research 十四页：覆盖全部 104 篇，无重叠。
- 全部 104 个阅读 URL 和四篇金融笔记返回 200。
- Notes 的 22 个正文接口与 STM32 搜索通过。
- 桌面 1440px、手机 390px：主要页面无横向溢出，手机 Notes 单列；暗夜主题截图正常。
- 卡片悬停展开与移开收起通过。
- 后台登录、Research/Notes 下拉选择、Notes 文章库筛选、Markdown 导出字段通过。
- 修复手机文章库弹层左侧裁切，增加弹层边界断言并复测通过。
- 未登录发布返回 401，分区冲突返回 400。分类往返测试不调用 GitHub。

截图与机器结果在 .next/qa（忽略目录，不提交）。测试命令：设置 PLAYWRIGHT_MODULE 指向可用的 Playwright 包，运行 node scripts/prelaunch-browser.mjs；可通过 QA_BASE_URL、QA_BROWSER_PATH 指定地址与浏览器。

## 上线范围与限制

本次完成本地生产模式验证，尚未提交 GitHub、触发 Vercel 部署或验证公网新版本；未进行真实文章发布。后台读取 GitHub 的文章版本将在提交这些分类元数据后与本地一致。

开发模式曾捕获网易云 iframe 内部访问父窗口产生的跨域异常，属于第三方播放器脚本；最终生产复测未出现该异常。其稳定性仍依赖网易云服务及浏览器播放策略。

现有 content/finance/trading-system.md 修改由此前工作保留，此轮未更改其内容。

## 2026-10-02 发布前复查

- `npm run lint`、`npm run typecheck`、`npm run content:audit` 和 `npm run build` 均通过；本地内容审计为 106 篇文章、84 个本地图片引用，资源清单含 GitHub 最新收录的 13 项资源。
- `node scripts/security-check.mjs` 通过；`npm audit --omit=dev --audit-level=high` 未发现生产依赖已知漏洞。
- 生产模式浏览器检查通过：首页、Notes、Research、AI、Finance、About、Resources、STM32 文章详情均在 1440px 和 390px 视口打开，无横向溢出。全部 106 个文章阅读地址返回 200。
- 后台验证登录、文章分区切换、Notes 文章库、资源管理卡片和添加表单；资源列表读取要求管理员会话，匿名读取返回 401。检查没有提交文章或网站，不调用 GitHub 写入。
- 浏览器未发现站内运行时、控制台或 HTTP 错误。网易云播放器第三方脚本仍会报告跨域 iframe、加速度计权限和遥测连接消息；这些来自 `music.163.com` / `music.126.net`，不影响站内交互检查。
- Git 忽略规则排除 `.env.local`、`.vercel`、`.next`、依赖目录、本机日志与缓存；Git 跟踪文件扫描未发现环境凭据文件。

这次本地复查不代表 GitHub 推送或 Vercel 生产部署已经完成。线上状态以最新生产部署 Ready 和正式域名检查为准。
