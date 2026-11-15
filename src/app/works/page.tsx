import type { Metadata } from "next";

import Reveal from "@/components/site/Reveal";
import ProjectShowcase from "@/components/works/ProjectShowcase";

export const metadata: Metadata = {
  title: "项目展示",
  description: "七院创新基地成员的作品展示——游戏、工具、网站，点击即可在线体验",
};

/** 作品展示列表页：/works/（入口在首页 Hero 按钮排与页脚「站内导航」） */
export default function WorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-ink">项目展示</h1>
        <p className="mt-4 text-slate-500">基地成员的作品，点击即可在线体验</p>
      </header>

      <Reveal delay={120} className="mt-14">
        <ProjectShowcase />
      </Reveal>
    </div>
  );
}
