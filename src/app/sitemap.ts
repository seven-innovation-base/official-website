import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/content";

// 静态导出模式要求元数据路由显式声明
export const dynamic = "force-static";

/** 站点地图：静态导出时生成 out/sitemap.xml（域名在 content/site-config.json 的 siteUrl 配置） */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const lastModified = new Date();

  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/join/`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/members/`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/honors/`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ftp/`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/oj/`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
