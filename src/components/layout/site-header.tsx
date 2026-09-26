import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const links = [
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "领域" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
        <Link href="/" className="w-fit text-lg font-semibold tracking-tight">TechAlpaca</Link>
        <nav aria-label="主导航" className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-[var(--muted)] sm:gap-x-4 sm:text-sm md:gap-x-7">
          {links.map((link) => <Link key={link.href} className="rounded-md px-2 py-2 transition hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]" href={link.href}>{link.label}</Link>)}
          <Link className="rounded-md px-2 py-2 font-medium text-[var(--ink)] transition hover:bg-[var(--surface-hover)]" href="/login">登录</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


