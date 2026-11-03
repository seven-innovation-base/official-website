import type { Metadata } from "next";

import Analytics from "@/components/site/Analytics";
import Footer from "@/components/site/Footer";
import { siteConfig } from "@/lib/content";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.siteName} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: `${siteConfig.fullName}官方网站。${siteConfig.tagline}。三大部门：软件部、大数据部、算法部。`,
  keywords: [
    "桂电",
    "七院创新基地",
    "桂林电子科技大学",
    "数学与计算科学学院",
    "大学生数学应用及创新基地",
    "招新",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: siteConfig.siteName,
    title: `${siteConfig.siteName} · ${siteConfig.tagline}`,
    description: `${siteConfig.fullName}官方网站`,
    images: [{ url: "/videos/promo.jpg", width: 1280, height: 720, alt: siteConfig.siteName }],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <main>{children}</main>
        <Footer />
        <Analytics baiduToken={siteConfig.analytics?.baiduToken} />
      </body>
    </html>
  );
}
