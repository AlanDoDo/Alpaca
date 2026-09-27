import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-10 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-sm text-[var(--muted)] sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} TechAlpaca</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/feed.xml">RSS</Link><Link href="/about">About</Link></div>
      </div>
    </footer>
  );
}
