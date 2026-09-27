"use client";
import { Search } from "lucide-react";
export function JournalSearch() {
  return <button className="journal-search-button" type="button" aria-label="搜索所有文章" onClick={() => window.dispatchEvent(new CustomEvent("techalpaca:open-search"))}><Search size={19} aria-hidden="true" /></button>;
}
