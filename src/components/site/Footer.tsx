import Link from "next/link";

import FooterHomeLink from "@/components/site/FooterHomeLink";
import { siteConfig } from "@/lib/content";

/**
 * 页脚（兼站内导航）：顶部导航栏已移除，导航入口全部收拢于此。
 * 列结构：基地 / 站内导航 / 资源中心 / 常用链接 / 友情链接
 */
export default function Footer() {
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/members/", label: "团队成员" },
    { href: "/honors/", label: "历史荣誉" },
    { href: "/join/", label: "加入我们" },
  ];

  const resourceLinks = [
    { href: "/ftp/", label: "FTP 资料库" },
    { href: "/oj/", label: "OJ 练习（仅校园网）" },
    // 旧站归档是 public/ 下的纯静态目录：开发服务器不解析目录索引，故直链 index.html
    // （生产环境 nginx/静态托管同样兼容，/legacy/ 亦可访问）
    { href: "/legacy/index.html", label: "学习文档", direct: true },
  ];

  return (
    <footer className="border-t border-[#7CC4F2]/20 bg-[#10314a] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="七院创新基地" className="h-9 w-9 shrink-0 rounded-full" />
            <span className="whitespace-nowrap text-lg font-bold text-white">{siteConfig.siteName}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{siteConfig.tagline}</p>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            {siteConfig.address.map((addr) => (
              <span key={addr} className="block">
                {addr}
              </span>
            ))}
            <span className="mt-1 block">招新 QQ 群：{siteConfig.qqGroup}</span>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">站内导航</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <FooterHomeLink />
            </li>
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">资源中心</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                {"direct" in link && link.direct ? (
                  <a href={link.href} className="hover:text-white">
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">常用链接</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={siteConfig.links.guet} target="_blank" rel="noreferrer" className="hover:text-white">
                桂林电子科技大学
              </a>
            </li>
            <li>
              <a href={siteConfig.links.college} target="_blank" rel="noreferrer" className="hover:text-white">
                数学与计算科学学院
              </a>
            </li>
            <li>
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className="hover:text-white">
                基地 GitHub
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">友情链接</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {siteConfig.links.friends.map((friend) => (
              <li key={friend.url}>
                <a href={friend.url} target="_blank" rel="noreferrer" className="hover:text-white">
                  {friend.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {siteConfig.foundedYear}–{year} {siteConfig.siteName}
          </p>
          <p>{siteConfig.fullName}</p>
        </div>
      </div>
    </footer>
  );
}
