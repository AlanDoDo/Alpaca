import type { Metadata } from "next";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() { return <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24"><p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">ACCOUNT</p><h1 className="mt-5 text-3xl font-semibold sm:text-4xl">账户设置</h1><p className="mt-5 leading-7 text-[var(--muted)]">个人资料和隐私设置将在账户功能开放后提供。</p></div>; }
