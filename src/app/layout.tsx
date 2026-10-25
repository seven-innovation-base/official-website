import type { Metadata } from "next";

import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import { siteConfig } from "@/lib/content";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.siteName} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: `${siteConfig.fullName}官方网站。${siteConfig.tagline}。`,
  keywords: ["桂电", "七院创新基地", "数学与计算科学学院", "大学生数学应用及创新基地"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
