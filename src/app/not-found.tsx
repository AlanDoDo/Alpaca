import Link from "next/link";
export default function NotFound() { return <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24"><p className="text-xs tracking-[0.2em] text-[var(--muted)]">404</p><h1 className="mt-4 text-3xl font-semibold sm:text-4xl">页面不存在</h1><Link className="mt-6 inline-block min-h-11 py-3 underline underline-offset-4" href="/">返回首页</Link></div>; }
