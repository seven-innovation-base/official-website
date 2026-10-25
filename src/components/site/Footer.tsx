import Link from "next/link";

import { siteConfig } from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-deep text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="七院创新基地" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-bold text-white">{siteConfig.siteName}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{siteConfig.tagline}</p>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            {siteConfig.address.map((addr) => (
              <span key={addr} className="block">
                {addr}
              </span>
            ))}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">常用链接</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={siteConfig.links.guet} target="_blank" rel="noreferrer" className="hover:text-white">
                桂林电子科技大学官网
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

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200">加入我们</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/join/" className="hover:text-white">
                招新咨询 QQ 群：{siteConfig.qqGroup}
              </Link>
            </li>
            <li>
              <Link href="/ftp/" className="hover:text-white">
                FTP 资料库
              </Link>
            </li>
            <li>
              <Link href="/oj/" className="hover:text-white">
                OJ 练习系统（仅校园网）
              </Link>
            </li>
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
