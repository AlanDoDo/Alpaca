import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "alandodo-1315761622.cos.ap-beijing.myqcloud.com" },
      { protocol: "https", hostname: "techalpaca.vercel.app" },
    ],
  },
};

export default nextConfig;


