import type { Metadata } from "next";

import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "加入我们",
};

export default function JoinPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-deep via-primary-dark to-primary py-28 text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold">加入我们</h1>
        <p className="mt-6 text-lg leading-9 text-blue-100">
          扫码或搜索 QQ 群进群，报名与咨询都在群里。
          <br />
          也欢迎直接来基地看看——不用预约，敲门进来就行。
        </p>

        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-white/20 bg-white/10 p-10 backdrop-blur">
          <p className="text-sm tracking-widest text-blue-200">招新咨询 QQ 群</p>
          <p className="mt-3 font-mono text-5xl font-bold tracking-wider">{siteConfig.qqGroup}</p>
        </div>

        <p className="mt-10 text-sm leading-7 text-blue-200/80">
          {siteConfig.address.map((addr) => (
            <span key={addr} className="mx-2">
              {addr}
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs text-blue-200/60">群二维码图片待补充（QQ 群号可直接搜索加入）</p>
      </div>
    </section>
  );
}
