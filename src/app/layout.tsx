import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingActionDock } from "@/components/layout/floating-action-dock";
import { SiteContextMenu } from "@/components/layout/site-context-menu";


import "./globals.css";

const siteUrl = getSiteUrl();
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: { default: "TechAlpaca — AI × Robotics × Finance", template: "%s — TechAlpaca" },
  description: "研究技术如何改变产业，也研究钱最终流向哪里。",
  openGraph: { type: "website", siteName: "TechAlpaca", title: "TechAlpaca — AI × Robotics × Finance", description: "Ideas, technology, companies and capital.", images: [{ url: "/images/techalpaca-avatar.png", width: 480, height: 480, alt: "TechAlpaca" }] },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body><SiteHeader /><main>{children}</main><SiteFooter /><FloatingActionDock /><SiteContextMenu /></body></html>;
}
