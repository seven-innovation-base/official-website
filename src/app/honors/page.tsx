import type { Metadata } from "next";

import HonorsTable from "@/components/honors/HonorsTable";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "历史荣誉",
  description: "七院创新基地近年国家级、省部级获奖记录",
};

export default function HonorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-ink">近年参赛获奖</h1>
        <p className="mt-4 text-slate-500">
          很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......
        </p>
      </header>

      <Reveal delay={100} className="mt-14">
        <HonorsTable />
      </Reveal>
    </div>
  );
}
