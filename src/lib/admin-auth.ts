import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "techalpaca_admin_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

export function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_EDITOR_PASSWORD && sessionSecret() && sessionSecret()!.length >= 32);
}

function signature(expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(`techalpaca-admin:v2:${expiresAt}:${process.env.ADMIN_EDITOR_PASSWORD ?? ""}`).digest("base64url");
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_EDITOR_PASSWORD;
  if (!expected) return false;
  const expectedHash = createHmac("sha256", "techalpaca-admin-password").update(expected).digest();
  const suppliedHash = createHmac("sha256", "techalpaca-admin-password").update(password).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

export function createAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS);
  return { value: `${expiresAt}.${signature(expiresAt, secret)}`, maxAge: SESSION_LIFETIME_SECONDS };
}

export function verifyAdminSessionValue(value?: string) {
  const secret = sessionSecret();
  if (!secret || !value) return false;
  const [expiresAt, suppliedSignature, extra] = value.split(".");
  if (!expiresAt || !suppliedSignature || extra || !/^\d{10}$/.test(expiresAt)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number(expiresAt) <= now || Number(expiresAt) > now + SESSION_LIFETIME_SECONDS) return false;
  const expected = Buffer.from(signature(expiresAt, secret));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function isAdminAuthenticated() {
  if (!adminAuthConfigured()) return false;
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(ADMIN_COOKIE)?.value);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_LIFETIME_SECONDS,
};
