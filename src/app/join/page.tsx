import type { Metadata } from "next";

import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "加入我们",
  description: "七院创新基地招新——扫码或搜索 QQ 群进群，报名与咨询都在群里",
};

export default function JoinPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#061019] via-[#0e2436] to-[#081826] py-28 text-white">
      {/* 光晕（与首页 Hero 同款：冰蓝 × 白） */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#7CC4F2]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-[#2E7BC4]/25 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">加入我们</h1>
        <p className="mt-6 text-base leading-9 text-slate-100/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
          扫码或搜索 QQ 群号进群，报名与咨询都在群里。
          <br />
          也欢迎直接来基地看看——不用预约，敲门进来就行。
        </p>

        <div className="mx-auto mt-12 flex max-w-xl flex-col items-center justify-center gap-9 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur sm:flex-row sm:gap-10">
          {/* 二维码（白底保证可扫） */}
          <div className="shrink-0 rounded-xl bg-white p-2.5 shadow-2xl shadow-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/qq-qrcode.jpg"
              alt="2026 招新群二维码"
              className="h-72 w-auto rounded-lg object-contain"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs tracking-[0.3em] text-blue-100/80">招新咨询 QQ 群</p>
            <p className="mt-3 font-mono text-4xl font-bold tracking-wider">{siteConfig.qqGroup}</p>
            <p className="mt-4 text-sm leading-7 text-blue-100/85">
              扫码或搜索群号进群
              <br />
              群内发布：报名表 · 考核安排 · 常见问题
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm leading-7 text-blue-100/80">
          {siteConfig.address.map((addr) => (
            <span key={addr} className="mx-2">
              {addr}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
