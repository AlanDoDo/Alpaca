"use client";
import { ArticleBody } from "./article-body";
export default function JournalBody({ source }: { source: string }) {
  return <ArticleBody source={source} headings={[]} />;
}
