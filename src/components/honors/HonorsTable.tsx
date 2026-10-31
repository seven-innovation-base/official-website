import { honors } from "@/lib/content";

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

function NameTag({ name }: { name: string }) {
  return (
    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{name.toUpperCase()}</span>
  );
}

function LevelTag({ tag }: { tag: string }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${levelColor(tag)}`}>{tag}</span>
  );
}

/**
 * 荣誉展示（旧站 HistoricalHonor 形态），首页与 /honors 共用。
 * 桌面端：三列表格；移动端：卡片列表（比赛 → 奖项级别 → 名字，免横向拖动）。
 */
export default function HonorsTable() {
  return (
    <>
      {/* 桌面端：表格（窄屏可横向拖动兜底） */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm md:block">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-mist text-slate-500">
              <th className="px-5 py-4 font-semibold">名字</th>
              <th className="px-5 py-4 font-semibold">比赛</th>
              <th className="px-5 py-4 font-semibold">奖项级别</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {honors.map((honor, index) => (
              <tr key={`${honor.contest}-${index}`} className="transition hover:bg-mist/60">
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {honor.names.map((name) => (
                      <NameTag key={name} name={name} />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 align-top font-medium leading-6 text-ink">{honor.contest}</td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {honor.tags.map((tag) => (
                      <LevelTag key={tag} tag={tag} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端：卡片列表（比赛 → 奖项级别 → 名字） */}
      <div className="space-y-3 md:hidden">
        {honors.map((honor, index) => (
          <div
            key={`${honor.contest}-m-${index}`}
            className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold leading-6 text-ink">{honor.contest}</h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {honor.tags.map((tag) => (
                <LevelTag key={tag} tag={tag} />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {honor.names.map((name) => (
                <NameTag key={name} name={name} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
