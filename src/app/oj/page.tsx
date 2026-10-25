import type { Metadata } from "next";

import OjProbe from "@/components/oj/OjProbe";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "OJ 练习",
  description: "七院创新基地在线判题系统（OJ）：221 道题，写完就判，仅校园网访问",
};

const features = [
  { title: "221 道题", desc: "从 hello world 到算法题，难度递进" },
  { title: "写完就判", desc: "提交代码几秒出结果，错了立刻改" },
  { title: "随时可刷", desc: "基地成员日常练习与考核同款平台" },
];

export default function OjPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1z" />
          </svg>
          仅校园网访问
        </span>
        <h1 className="mt-4 text-4xl font-bold text-ink">{siteConfig.oj.name}</h1>
        <p className="mt-4 text-slate-500">在线判题练习系统——上机编程、实时判分、排名可见</p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200/90 bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-bold text-primary">{f.title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <OjProbe />
      </div>

      <p className="mt-8 text-center text-xs leading-6 text-slate-400">
        账号注册与使用指引在加入基地后发放；
        <br />
        遇到无法访问的情况，请先确认是否已连接校园网或学校 VPN。
      </p>
    </div>
  );
}
