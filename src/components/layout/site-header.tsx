import Link from "next/link";

const links = [
  { href: "/forum", label: "Research" },
  { href: "/blog", label: "Notes" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="site-header border-b border-[var(--line)]">
      <div className="site-shell flex items-center justify-between gap-2 py-3 sm:gap-6 sm:py-5">
        <Link href="/" className="w-fit shrink-0 text-base font-semibold tracking-tight sm:text-lg">TechAlpaca</Link>
        <nav aria-label="主导航" className="flex shrink-0 items-center gap-x-0.5 whitespace-nowrap text-xs text-[var(--muted)] sm:gap-x-4 sm:text-sm md:gap-x-7">
          {links.map((link) => <Link key={link.href} className="inline-flex min-h-11 items-center rounded-md px-1.5 transition hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] sm:px-2" href={link.href}>{link.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
