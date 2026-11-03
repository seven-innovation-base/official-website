import Link from "next/link";

import VideoSection from "@/components/home/VideoSection";
import IssueComments from "@/components/home/IssueComments";
import HonorsTable from "@/components/honors/HonorsTable";
import Hero3DLoader from "@/components/hero3d/Hero3DLoader";
import Reveal from "@/components/site/Reveal";
import { departments, siteConfig, type Department } from "@/lib/content";

const heroEntries = [
  { href: "/join/", label: "加入我们" },
  { href: "/ftp/", label: "FTP 资料库" },
  { href: "/oj/", label: "OJ 练习", badge: "仅校园网" },
  { href: "/members/", label: "团队成员" },
];

/** 部门卡片：插画 + 一段式介绍（旧站文案风格） */
function DeptCard({ dept }: { dept: Department }) {
  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      <div className="flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-mist to-white p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dept.image}
          alt={dept.name}
          loading="lazy"
          className="max-h-full w-auto object-contain transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-7">
        <span className="text-xs font-semibold tracking-widest text-accent">{dept.tagline}</span>
        <h3 className="mt-2 text-xl font-bold text-primary">{dept.name}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{dept.duty}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ============ Hero（3D 主视觉区：时间算法·冰蓝×白，D4 定稿）============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#061019] via-[#0e2436] to-[#081826] text-white">
        {/* 静态渐变光晕：3D 场景加载前后的兜底视觉（深海蓝 × 冰蓝） */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#7CC4F2]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#2E7BC4]/25 blur-3xl" />

        <Hero3DLoader />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
          {/* Logo（参照三院科协形态：悬于标题上方） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo2.png"
            alt="七院创新基地 Logo"
            className="animate-hero-float h-20 w-20 rounded-full bg-white/10 object-cover shadow-2xl shadow-black/40 ring-2 ring-white/30 backdrop-blur"
          />
          <h1 className="mt-7 bg-gradient-to-b from-white via-white to-slate-300/90 bg-clip-text text-4xl font-bold tracking-wide text-transparent drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] sm:text-5xl md:text-6xl">
            {siteConfig.siteName}
          </h1>
          <p className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-100/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] md:text-base">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/50 md:w-14" />
            <span className="tracking-[0.3em] md:tracking-[0.4em]">{siteConfig.tagline}</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/50 md:w-14" />
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {heroEntries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:scale-105 hover:border-white hover:bg-white/10 md:px-6 md:py-3 md:text-base"
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

          <a
            href="#video"
            aria-label="向下滚动查看更多"
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 transition hover:text-white"
          >
            <svg className="h-6 w-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>

          <p className="absolute bottom-3.5 text-[10px] tracking-widest text-white/50">
            桂林电子科技大学 · 数学与计算科学学院
          </p>
        </div>
      </section>

      {/* ============ 宣传视频（点击封面懒加载，本地自托管）============ */}
      <div id="video" className="scroll-mt-4">
        <Reveal>
          <VideoSection
            title={siteConfig.video.title}
            description={siteConfig.video.description}
            type={siteConfig.video.type}
            src={siteConfig.video.src}
            poster={siteConfig.video.poster}
            embedUrl={siteConfig.video.embedUrl}
          />
        </Reveal>
      </div>

      {/* ============ 三大部门（文案沿用旧站风格，布局借鉴三院科协 2+1）============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold text-ink">三大部门</h2>
          <p className="mt-3 text-slate-500">软件部 · 大数据部 · 算法部</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {departments.slice(0, 2).map((dept, index) => (
            <Reveal key={dept.id} delay={index * 90}>
              <DeptCard dept={dept} />
            </Reveal>
          ))}
          {departments.length > 2 && (
            <Reveal delay={180} className="md:col-span-2 md:mx-auto md:w-[calc(50%-0.75rem)]">
              <DeptCard dept={departments[2]} />
            </Reveal>
          )}
        </div>
      </section>

      {/* ============ 历史荣誉（留言板上方）============ */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold text-ink">近年参赛获奖</h2>
          <p className="mt-3 text-slate-500">
            很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <HonorsTable />
        </Reveal>
      </section>

      {/* ============ 留言板（GitHub Issue 模式：数据存于官方仓库 Issue #86）============ */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink">一些关于基地的评价🥰</h2>
            <p className="mt-3 text-sm text-slate-500">这个页面是对基地的一些评价，欢迎发言😎</p>
          </div>
          <div className="mt-8">
            <IssueComments apiUrl={siteConfig.comments.apiUrl} issueUrl={siteConfig.comments.issueUrl} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
