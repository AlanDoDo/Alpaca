"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => { fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.json()).then((data: { configured?: boolean }) => setConfigured(data.configured === true)).catch(() => setConfigured(false)); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setError(data.error ?? "登录失败，请重试。"); return; }
      router.replace("/admin/articles");
      router.refresh();
    } catch {
      setError("连接失败，请检查服务后重试。");
    } finally { setBusy(false); }
  }

  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-lg items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-10">
        <Link href="/" className="text-sm font-semibold tracking-tight">TechAlpaca <span className="font-normal text-[var(--muted)]">/ Admin</span></Link>
        <div className="mt-10 flex size-12 items-center justify-center rounded-full bg-[var(--surface-hover)]"><LockKeyhole className="size-5" /></div>
        <p className="mt-7 text-[10px] font-semibold tracking-[0.2em] text-[var(--muted)]">PRIVATE WORKSPACE</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">管理员登录</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">登录后可创建、编辑并发布站点文章。</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium" htmlFor="admin-password">管理员密码</label>
          <input autoComplete="current-password" autoFocus className="admin-input w-full" disabled={configured === false} id="admin-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          {error && <p role="alert" className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-sm text-[var(--danger)]">{error}</p>}
          <button className="admin-primary-button w-full" disabled={busy || configured === false} type="submit">{configured === null ? "检查后台配置…" : busy ? "验证中…" : <>进入编辑器 <ArrowRight className="size-4" /></>}</button>
        </form>
        <p className="mt-6 flex items-center gap-2 text-xs text-[var(--muted)]"><ShieldCheck className="size-4" />使用受保护的 HttpOnly 会话</p>
      </div>
    </section>
  );
}
