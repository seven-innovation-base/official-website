import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/content";

// 静态导出模式要求元数据路由显式声明
export const dynamic = "force-static";

/** 爬虫规则：静态导出时生成 out/robots.txt */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 旧站归档内容不需要重点抓取
      disallow: ["/legacy/"],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
