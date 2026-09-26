import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminAuthConfigured, adminSessionCookieOptions, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";
import { isSameOriginRequest } from "@/lib/request-origin";

export const runtime = "nodejs";


export async function GET() {
  return NextResponse.json({ configured: adminAuthConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源校验失败。" }, { status: 403 });
  if (!adminAuthConfigured()) return NextResponse.json({ error: "后台尚未配置。请在服务器设置管理员密码和至少 32 位的会话密钥。" }, { status: 503 });
  if (!request.headers.get("content-type")?.includes("application/json")) return NextResponse.json({ error: "请求格式无效。" }, { status: 415 });

  let body: { password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求内容无效。" }, { status: 400 }); }
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length > 512 || !verifyAdminPassword(password)) return NextResponse.json({ error: "密码不正确。" }, { status: 401 });

  const session = createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, session.value, { ...adminSessionCookieOptions, maxAge: session.maxAge });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "请求来源校验失败。" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
