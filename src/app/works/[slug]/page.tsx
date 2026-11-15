import Link from "next/link";
import { notFound } from "next/navigation";

import { projects } from "@/lib/content";

/**
 * 作品体验页：/works/{slug}/
 * 纯前端作品（如游戏）的源文件放在 public/works/{slug}/game.html，
 * 本页用 iframe 全屏承载，顶部提供返回站点与作品信息。
 * （iframe 引用带文件名的静态资源，避免与路由导出的 index.html 冲突）
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects
    .filter((p) => p.link?.startsWith("/works/"))
    .map((p) => ({ slug: p.link!.split("/")[2] }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.link === `/works/${slug}`);
  return {
    title: project ? `${project.title} · 七院创新基地` : "作品体验 · 七院创新基地",
    description: project?.description,
  };
}

export default async function WorkPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.link === `/works/${slug}`);
  if (!project) notFound();

  return (
    <div className="flex h-screen flex-col bg-[#0a1628]">
      {/* 顶部信息栏 */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 text-white md:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-white/25 px-3.5 py-1.5 text-sm text-white/90 transition hover:border-white/70 hover:bg-white/10"
          >
            ← 返回首页
          </Link>
          <div>
            <h1 className="text-base font-bold leading-tight md:text-lg">{project.title}</h1>
            <p className="text-xs text-white/55">七院创新基地 · {project.type}作品</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span>👤 {project.author}</span>
          <a
            href={`/works/${slug}/game.html`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-white/85 transition hover:bg-white/20"
          >
            全屏打开 ↗
          </a>
        </div>
      </header>

      {/* 游戏画布：占满剩余视口 */}
      <iframe
        src={`/works/${slug}/game.html`}
        title={project.title}
        className="w-full flex-1 border-0 bg-[#0a1628]"
      />
    </div>
  );
}
