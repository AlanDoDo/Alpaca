export type ArticleCategory = "AI" | "机器人" | "金融" | "产业" | "编程" | "工程技术" | "设计" | "杂谈";
export type ArticleSummary = { slug: string; title: string; description: string; date: string; category: ArticleCategory; tags: string[]; readingTime: number; featured: boolean; cover?: string; researchTopic?: string; notesTopic?: string; contentType?: "blog"; href?: string; id?: string; aliases?: string[] };
export type Article = ArticleSummary & { content: string };

