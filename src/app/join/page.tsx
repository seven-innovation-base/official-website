import type { Metadata } from "next";

import QrViewer from "@/components/join/QrViewer";
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

        <div className="mx-auto mt-12 flex max-w-xl flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-8 py-9 backdrop-blur">
          <p className="text-xs tracking-[0.3em] text-blue-100/80">招新咨询 QQ 群</p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-wider">{siteConfig.qqGroup}</p>
          <p className="mt-4 text-sm leading-7 text-blue-100/85">
            扫码或搜索群号进群
            <br />
            群内发布：报名表 · 考核安排 · 常见问题
          </p>

          {/* 二维码（点击查看大图，可保存下载） */}
          <QrViewer />
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
