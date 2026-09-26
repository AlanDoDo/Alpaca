import type { Metadata } from "next";
export const metadata: Metadata = { title: "Login" };
export default function LoginPage() { return <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24"><p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">ACCOUNT</p><h1 className="mt-5 text-3xl font-semibold sm:text-4xl">登录</h1><p className="mt-5 leading-7 text-[var(--muted)]">账户功能将在 Supabase Auth、资料权限和隐私设置配置完成后开放。目前 TechAlpaca 的文章无需登录即可阅读。</p></div>; }
