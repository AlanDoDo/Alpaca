import { createHash } from "node:crypto";

// Instance-local protection. Vercel WAF is needed for a shared limit across instances.
const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 10;

export function consumeLoginAttempt(request: Request) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  // Trust forwarding headers only on Vercel, which overwrites incoming X-Forwarded-For.
  const address = process.env.VERCEL === "1"
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local";
  const key = createHash("sha256").update(address).digest("hex");
  let entry = attempts.get(key);
  if (!entry) {
    if (attempts.size >= 10_000) return { allowed: false, retryAfter: 60 };
    entry = { count: 0, resetAt: now + windowMs };
    attempts.set(key, entry);
  }
  entry.count++;
  return { allowed: entry.count <= maxAttempts, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}
