import { getAllArticles, getArticleBySlug } from "./index";
import { extractArticleHeadings } from "./headings";
import type { ArticleSummary } from "./types";

export type ConnectedDocument = ArticleSummary & { id: string; href: string; contentType: "blog"; content: string; aliases: string[] };
export function getConnectedDocuments(): ConnectedDocument[] {
  const blogs: ConnectedDocument[] = getAllArticles().map((article) => ({ ...article, id: article.id ?? `blog:${article.slug}`, href: `/article/${article.slug}`, contentType: "blog", aliases: article.aliases ?? [], content: getArticleBySlug(article.slug)?.content ?? "" }));
  return blogs;
}
function summary(document: ConnectedDocument): ArticleSummary { return { slug: document.slug, id: document.id, aliases: document.aliases, title: document.title, description: document.description, date: document.date, category: document.category, tags: document.tags, readingTime: document.readingTime, featured: document.featured, cover: document.cover, href: document.href, contentType: document.contentType, researchTopic: document.researchTopic }; }
export function contentSummaries(): ArticleSummary[] {
  return getConnectedDocuments().map(summary);
}
export function searchContent(query: string): ArticleSummary[] {
  const term = query.trim().toLocaleLowerCase(); if (!term) return [];
  return getConnectedDocuments().filter((document) => [document.title, document.description, document.content, ...document.tags, ...document.aliases, document.category].join(" ").toLocaleLowerCase().includes(term)).sort((a, b) => Number(b.title.toLocaleLowerCase().includes(term)) - Number(a.title.toLocaleLowerCase().includes(term))).map(summary);
}
function normalize(value: string) { return value.trim().replace(/\.mdx?$/, "").normalize("NFKC").toLocaleLowerCase(); }
export function resolveReference(target: string, documents = getConnectedDocuments()) {
  const [name, heading] = target.split("#");
  const normalized = normalize(name.replace(/\\/g, "/").split("/").pop() ?? "");
  const exact = documents.find((document) => normalize(document.id) === normalized);
  const matching = exact ? [exact] : documents.filter((document) => [document.slug, document.title, ...document.aliases].some((alias) => normalize(alias) === normalized));
  if (matching.length !== 1) return undefined;
  const document = matching[0];
  const section = heading ? extractArticleHeadings(document.content).find((item) => item.title === heading.trim()) : undefined;
  return { document, href: document.href + (section ? `#${section.id}` : "") };
}
// Leave code blocks and inline code untouched; a code example is not a knowledge relation.
function outsideCode(source: string, transform: (part: string) => string) {
  return source.split(/(```[^]*?```|~~~[^]*?~~~|`[^`\n]*`)/g).map((part, index) => index % 2 ? part : transform(part)).join("");
}
export function renderKnowledgeLinks(source: string) {
  const documents = getConnectedDocuments();
  return outsideCode(source, (part) => part.replace(/(?<!!)\[\[([^\]\n]+)\]\]/g, (_match, reference: string) => {
    const [target, customLabel] = reference.split("|");
    const label = (customLabel || target).replace(/[\[\]\n]/g, "");
    const resolved = resolveReference(target, documents);
    return resolved ? `[${label}](${resolved.href})` : label;
  }));
}
function references(document: ConnectedDocument, documents: ConnectedDocument[]) {
  const outgoing = new Map<string, ConnectedDocument>(); const unresolved = new Set<string>();
  outsideCode(document.content, (part) => {
    for (const match of part.matchAll(/(?<!!)\[\[([^\]\n]+)\]\]/g)) {
      const target = match[1].split("|")[0]; const resolved = resolveReference(target, documents);
      if (!resolved) unresolved.add(target); else if (resolved.document.id !== document.id) outgoing.set(resolved.document.id, resolved.document);
    }
    for (const match of part.matchAll(/(?<!!)\[[^\]]*\]\((\/(?:article|forum\/notes)\/[^)#\s]+)(?:#[^)]*)?\)/g)) {
      const target = documents.find((item) => item.href === match[1]); if (target && target.id !== document.id) outgoing.set(target.id, target);
    }
    return part;
  });
  return { outgoing: [...outgoing.values()], unresolved: [...unresolved] };
}
export function documentRelations(href: string) {
  const documents = getConnectedDocuments(); const current = documents.find((item) => item.href === href);
  if (!current) return { outgoing: [], incoming: [], unresolved: [] };
  const direct = references(current, documents);
  return { ...direct, incoming: documents.filter((item) => item.id !== current.id && references(item, documents).outgoing.some((target) => target.id === current.id)) };
}
