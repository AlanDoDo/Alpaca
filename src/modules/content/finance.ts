import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/parse-frontmatter";
import { createFileCollection } from "./file-collection";

export type FinanceNote = { slug: string; title: string; description: string; section: "投机" | "投资"; topic: string; source: string; content: string; readingTime: number };
const directory = path.join(process.cwd(), "content/finance");
const order = ["trading-system", "asset-allocation", "company-research", "investment-framework"];

const getNoteFiles = createFileCollection<FinanceNote>(directory, (fileName) => {
    const slug = fileName.replace(/\.mdx?$/, "");
    const { data, content } = parseFrontmatter(fs.readFileSync(path.join(directory, fileName), "utf8"));
    if (typeof data.title !== "string" || typeof data.description !== "string" || !["投机", "投资"].includes(data.section)) throw new Error(`Invalid finance note: ${slug}`);
    const characters = content.match(/[\u3400-\u9fff]/g)?.length ?? 0;
    return { slug, title: data.title, description: data.description, section: data.section, topic: data.topic ?? "研究笔记", source: data.source ?? "", content, readingTime: Math.max(1, Math.ceil(characters / 400)) };
});

export function getFinanceNotes(): FinanceNote[] {
  return getNoteFiles().filter((note) => order.includes(note.slug)).slice().sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export function getFinanceNote(slug: string) {
  return getFinanceNotes().find((note) => note.slug === slug);
}
