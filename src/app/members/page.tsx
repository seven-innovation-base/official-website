import type { Metadata } from "next";

import { members, siteConfig, type Member } from "@/lib/content";

export const metadata: Metadata = {
  title: "团队成员",
  description: "七院创新基地历届团队成员名录",
};

/** 旧站约定：avatar 形如 "github:用户名" 时使用 GitHub 头像 */
function resolveAvatar(member: Member): string | undefined {
  if (!member.avatar) return undefined;
  if (member.avatar.startsWith("github:")) {
    return `https://avatars.githubusercontent.com/${member.avatar.slice(7)}?s=160`;
  }
  return member.avatar;
}

/** 旧数据中存在 github 字段误存头像 URL 的情况，只有真正的仓库链接才展示 */
function isGitHubUrl(url?: string): boolean {
  return !!url && url.startsWith("https://github.com/");
}

function MemberCard({ member }: { member: Member }) {
  const avatar = resolveAvatar(member);

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={member.name}
            loading="lazy"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-mist transition group-hover:ring-primary/30"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-2xl font-bold text-primary">
            {member.name.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-ink">{member.name}</h3>
          {member.role && (
            <span className="mt-1 inline-block rounded-full bg-mist px-2.5 py-0.5 text-xs font-medium text-primary-dark">
              {member.role}
            </span>
          )}
        </div>
      </div>

      {member.description && <p className="mt-4 text-sm leading-6 text-slate-500">{member.description}</p>}

      {(isGitHubUrl(member.github) || member.blog || member.email) && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {isGitHubUrl(member.github) && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary transition hover:text-accent"
            >
              GitHub ↗
            </a>
          )}
          {member.blog && (
            <a
              href={member.blog}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary transition hover:text-accent"
            >
              博客 ↗
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`} className="font-medium text-primary transition hover:text-accent">
              邮箱
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-ink">团队成员</h1>
        <p className="mt-4 text-slate-500">这里是我们团队的详细成员介绍</p>
      </header>

      {/* 按届时间线 */}
      <div className="relative ml-3 mt-16 border-l-2 border-primary/15 pb-4 sm:ml-6">
        {members.map((group) => (
          <section key={group.classOf} className="relative pb-14 pl-8 last:pb-0 sm:pl-10">
            <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-white" />
            <h2 className="text-2xl font-bold text-primary">
              {group.classOf}
              <span className="ml-1 text-base font-medium text-slate-400">级</span>
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.memberList.map((member) => (
                <MemberCard key={`${group.classOf}-${member.name}`} member={member} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 text-center">
        <a
          className="inline-block rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:scale-105 hover:bg-primary-dark"
          href={`https://github.com/xiaoxiaoyu-123/official-website-new/edit/main/content/members.json`}
          target="_blank"
          rel="noreferrer"
        >
          送我上墙
        </a>
        <p className="mt-4 text-xs text-slate-400">
          点击进入 GitHub 编辑 {siteConfig.siteName} 成员数据，提交后自动上线
        </p>
      </div>
    </div>
  );
}
