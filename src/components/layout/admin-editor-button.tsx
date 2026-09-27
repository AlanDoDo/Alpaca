import Link from "next/link";
import { PenLine } from "lucide-react";

export function AdminEditorButton() {
  return (
    <Link
      href="/admin/articles"
      prefetch={false}
      aria-label="打开文章管理编辑器"
      title="文章管理"
      className="group flex h-11 w-11 items-center gap-0 overflow-hidden rounded-full border border-blue-500 bg-blue-600 pl-3 text-white shadow-lg shadow-blue-950/15 transition-[width,transform,box-shadow,background-color] duration-200 hover:w-28 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:w-28 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <PenLine aria-hidden="true" className="size-[18px] shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-[max-width,margin,opacity] duration-200 group-hover:ml-2 group-hover:max-w-16 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-16 group-focus-visible:opacity-100">
        文章管理
      </span>
    </Link>
  );
}
