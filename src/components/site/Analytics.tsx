import Script from "next/script";

/**
 * 百度统计：token 在 content/site-config.json → analytics.baiduToken 配置，
 * 留空则完全不加载脚本（本地开发不产生统计噪音）。
 */
export default function Analytics({ baiduToken }: { baiduToken?: string }) {
  if (!baiduToken) return null;
  return <Script src={`https://hm.baidu.com/hm.js?${baiduToken}`} strategy="afterInteractive" />;
}
