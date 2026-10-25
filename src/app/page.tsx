import Link from "next/link";

import VideoSection from "@/components/home/VideoSection";
import Hero3DLoader from "@/components/hero3d/Hero3DLoader";
import { departments, siteConfig } from "@/lib/content";

const heroEntries = [
  { href: "/join/", label: "加入我们", primary: true },
  { href: "/ftp/", label: "FTP 资料库", primary: false },
  { href: "/oj/", label: "OJ 练习", primary: false, badge: "仅校园网" },
  { href: "/members/", label: "团队成员", primary: false },
];

export default function HomePage() {
  return (
    <>
      {/* ============ Hero（3D 主视觉区：粒子网络/星云，分级质量 + 懒加载）============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary-dark to-primary text-white">
        {/* 静态渐变光晕：3D 场景加载前后的兜底视觉 */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-primary-light/30 blur-3xl" />

        <Hero3DLoader />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-wide md:text-7xl">{siteConfig.siteName}</h1>
          <p className="mt-8 text-lg tracking-[0.35em] text-blue-100 md:text-2xl">
            {siteConfig.tagline}
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {heroEntries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className={
                  entry.primary
                    ? "rounded-xl bg-white px-7 py-3 text-base font-semibold text-primary shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-blue-50"
                    : "rounded-xl border border-white/40 px-7 py-3 text-base font-medium text-white backdrop-blur transition hover:scale-105 hover:border-white hover:bg-white/10"
                }
              >
                <span className="flex items-center gap-2">
                  {entry.label}
                  {entry.badge && (
                    <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-medium text-accent">
                      {entry.badge}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>

          <p className="absolute bottom-8 text-xs tracking-widest text-blue-200/60">
            桂林电子科技大学 · 数学与计算科学学院
          </p>
        </div>
      </section>

      {/* ============ 三大部门 ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-ink">三大部门</h2>
          <p className="mt-3 text-slate-500">软件部 · 大数据部 · 算法部</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="group rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
            >
              <span className="text-xs font-semibold tracking-widest text-accent">{dept.tagline}</span>
              <h3 className="mt-2 text-2xl font-bold text-primary">{dept.name}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{dept.duty}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {dept.branches.map((branch) => (
                  <span
                    key={branch}
                    className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-primary-dark"
                  >
                    {branch}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-400">技术栈：{dept.tools.join(" · ")}</p>

              <p className="mt-4 border-t border-dashed border-slate-200 pt-4 text-sm leading-7 text-ink">
                <span className="font-semibold text-accent">一年后：</span>
                {dept.outcome}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 宣传视频（点击封面懒加载）============ */}
      <VideoSection
        title={siteConfig.video.title}
        description={siteConfig.video.description}
        embedUrl={siteConfig.video.embedUrl}
      />

      {/* ============ 留言板（Phase 4 接入 Waline，历史评论完整保留）============ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-mist/60 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-ink">留言板</h2>
          <p className="mt-4 text-slate-500">
            留言板升级迁移中（Waline · 历史评论将完整保留），即将开放。
          </p>
        </div>
      </section>
    </>
  );
}
