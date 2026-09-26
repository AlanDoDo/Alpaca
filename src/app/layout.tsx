import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MusicWidget } from "@/components/layout/music-widget";
import { BackToPreviousButton } from "@/components/layout/back-to-previous-button";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: { default: "TechAlpaca — AI × Robotics × Finance", template: "%s — TechAlpaca" },
  description: "研究技术如何改变产业，也研究钱最终流向哪里。",
  openGraph: { type: "website", siteName: "TechAlpaca", title: "TechAlpaca — AI × Robotics × Finance", description: "Ideas, technology, companies and capital." },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><SiteHeader /><main>{children}</main><SiteFooter /><MusicWidget /><BackToPreviousButton /></body></html>;
}


