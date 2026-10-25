"use client";

import { useState } from "react";
import Link from "next/link";

const resourceLinks = [
  { href: "/ftp/", label: "FTP 资料库", desc: "11,455 份资料目录导航" },
  { href: "/oj/", label: "OJ 练习", desc: "仅校园网访问", badge: "仅校园网" },
  { href: "/legacy/", label: "学习文档", desc: "旧站文档归档" },
];

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/members/", label: "团队成员" },
  { href: "/honors/", label: "历史荣誉" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="七院创新基地" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold text-primary">桂电七院创新基地</span>
        </Link>

        {/* 桌面端导航 */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[15px] font-medium text-slate-600 transition hover:bg-mist hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          {/* 资源中心下拉 */}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-medium text-slate-600 transition group-hover:bg-mist group-hover:text-primary">
              资源中心
              <svg className="h-3.5 w-3.5 transition group-hover:rotate-180" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 11L3 6h10z" />
              </svg>
            </button>
            <div className="invisible absolute left-0 top-full w-60 translate-y-1 pt-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-900/5">
                {resourceLinks.map((res) => (
                  <Link
                    key={res.href}
                    href={res.href}
                    className="flex flex-col gap-0.5 px-4 py-2.5 transition hover:bg-mist"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                      {res.label}
                      {res.badge && (
                        <span className="rounded-full bg-accent/10 px-1.5 py-px text-[10px] font-medium text-accent">
                          {res.badge}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">{res.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/join/"
            className="ml-2 rounded-lg bg-primary px-4 py-2 text-[15px] font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            加入我们
          </Link>
        </div>

        {/* 移动端汉堡按钮 */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="切换菜单"
          aria-expanded={open}
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* 移动端菜单 */}
      {open && (
        <div className="border-t border-slate-200/70 bg-white px-4 pb-4 pt-2 md:hidden">
          {[...navLinks, { href: "/join/", label: "加入我们" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-mist"
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-2 px-3 pb-1 text-xs font-semibold tracking-wide text-slate-400">资源中心</p>
          {resourceLinks.map((res) => (
            <Link
              key={res.href}
              href={res.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-mist"
            >
              {res.label}
              {res.badge && (
                <span className="rounded-full bg-accent/10 px-1.5 py-px text-[10px] font-medium text-accent">
                  {res.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
