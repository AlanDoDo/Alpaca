import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  // File-based articles must be bundled with the corresponding server functions.
  outputFileTracingIncludes: {
    "/api/search": ["./content/blog/**/*"],
    "/api/context-menu": ["./content/blog/**/*"],
    "/api/admin/articles": ["./content/blog/**/*"],
    "/admin/articles": ["./content/blog/**/*"],
    "/blog": ["./content/blog/**/*"],
    "/forum": ["./content/blog/**/*"],
    "/forum/notes/[slug]": ["./content/blog/**/*"],
    "/article/[slug]": ["./content/blog/**/*"],
    "/search": ["./content/blog/**/*"],
    "/feed.xml": ["./content/blog/**/*"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // Compatible with statically rendered Next.js pages and the music iframe.
        // This is a baseline policy, not a nonce-based script XSS defense.
        { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
      ] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "tianjihub-1315761622.cos.ap-guangzhou.myqcloud.com", port: "", pathname: "/img/**" },
      { protocol: "https", hostname: "alandodo-1315761622.cos.ap-beijing.myqcloud.com" },
      { protocol: "https", hostname: "techalpaca.vercel.app" },
    ],
  },
};

export default nextConfig;


