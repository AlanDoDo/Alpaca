/** Resolve the public origin without failing module evaluation on an empty env value. */
export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "http://localhost:3000",
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) continue;
      return url.origin;
    } catch {
      // Try Vercel's generated hostname before the local-development fallback.
    }
  }
  return "http://localhost:3000";
}
