"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 页脚「首页」链接：已在首页时拦截路由跳转，改为平滑滚动回顶部（过渡动画），
 * 其他页面则正常跳转到首页。
 */
export default function FooterHomeLink() {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="hover:text-white"
    >
      首页
    </Link>
  );
}
