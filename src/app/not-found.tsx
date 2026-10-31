import Link from "next/link";

import { siteConfig } from "@/lib/content";

/** 404 页（静态导出必需） */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#061019] via-[#0e2436] to-[#081826] text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#7CC4F2]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#2E7BC4]/25 blur-3xl" />

      <div className="relative px-6 text-center">
        <p className="font-mono text-7xl font-bold tracking-wider text-[#7CC4F2] md:text-8xl">404</p>
        <h1 className="mt-6 text-2xl font-bold">这里没有你要找的页面</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300/80">
          它可能被移动了，或者从未存在过。
          <br />
          要不回首页看看？
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/40 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:scale-105 hover:border-white hover:bg-white/10"
          >
            返回首页
          </Link>
          <Link
            href="/join/"
            className="rounded-xl border border-white/40 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:scale-105 hover:border-white hover:bg-white/10"
          >
            加入我们
          </Link>
        </div>
        <p className="mt-10 text-xs tracking-widest text-white/40">{siteConfig.fullName}</p>
      </div>
    </section>
  );
}
