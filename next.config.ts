import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：产物部署到阿里云服务器 / GitHub Pages 均可（方案 D3）
  output: "export",
  // 目录式 URL，兼容旧站外链与 GitHub Pages
  trailingSlash: true,
  // 关闭开发模式左下角的 Next.js 角标（生产构建本就不会出现）
  devIndicators: false,
  images: {
    // 静态导出不支持默认图片优化服务
    unoptimized: true,
  },
};

export default nextConfig;
