import Link from "next/link";
import { PenLine } from "lucide-react";

export function AdminEditorButton() {
  return (
    <Link
      href="/admin/articles"
      aria-label="打开文章管理编辑器"
      title="文章管理"
      className="group flex h-11 w-11 items-center gap-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--accent)] pl-3 text-[var(--accent-contrast)] shadow-lg shadow-blue-950/15 transition-[width,transform,box-shadow] duration-200 hover:w-28 hover:-translate-y-0.5 hover:shadow-xl focus-visible:w-28 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <PenLine aria-hidden="true" className="size-[18px] shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-[max-width,margin,opacity] duration-200 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">
        文章管理
      </span>
    </Link>
  );
}