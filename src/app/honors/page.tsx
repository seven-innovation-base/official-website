import type { Metadata } from "next";

import Reveal from "@/components/site/Reveal";
import { honors } from "@/lib/content";

export const metadata: Metadata = {
  title: "历史荣誉",
  description: "七院创新基地近年国家级、省部级获奖记录",
};

/**
 * 奖项级别 → 标签配色（沿用旧站 antd Tag 的色彩语义，Tailwind 实现）：
 * 国一紫 / 国二品红 / 国三青 / 省一火山红 / 省二橙 / 省三蓝，其他（一等奖、金奖、国优等）用青色。
 */
const LEVEL_COLORS: Array<[string, string]> = [
  ["国一", "bg-purple-50 text-purple-700 ring-purple-200"],
  ["国二", "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200"],
  ["国三", "bg-cyan-50 text-cyan-700 ring-cyan-200"],
  ["省一", "bg-red-50 text-red-600 ring-red-200"],
  ["省二", "bg-orange-50 text-orange-600 ring-orange-200"],
  ["省三", "bg-blue-50 text-blue-700 ring-blue-200"],
];

function levelColor(tag: string): string {
  for (const [level, classes] of LEVEL_COLORS) {
    if (tag.endsWith(level)) return classes;
  }
  return "bg-teal-50 text-teal-700 ring-teal-200";
}

export default function HonorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-ink">近年参赛获奖</h1>
        <p className="mt-4 text-slate-500">
          很多，还在整理当中，下面展示是近年国家级、省部级获奖的一部分......
        </p>
      </header>

      <Reveal delay={100}>
        <div className="mt-14 overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-mist text-slate-500">
              <th className="px-5 py-4 font-semibold">名字</th>
              <th className="px-5 py-4 font-semibold">比赛</th>
              <th className="px-5 py-4 font-semibold">奖项级别</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {honors.map((honor, index) => (
              <tr key={`${honor.contest}-${index}`} className="transition hover:bg-mist/60">
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {honor.names.map((name) => (
                      <span
                        key={name}
                        className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 align-top font-medium leading-6 text-ink">{honor.contest}</td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {honor.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${levelColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Reveal>
    </div>
  );
}
