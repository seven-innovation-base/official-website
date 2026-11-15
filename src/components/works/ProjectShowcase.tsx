"use client";

import { useState } from "react";

import { projects, type Project } from "@/lib/content";

/* ---------- 分类过滤 ---------- */

const FILTERS = ["全部", "游戏", "网站", "数据工具", "其他"] as const;

/* ---------- 类型标签 → 徽章 CSS 类（样式见 globals.css）---------- */

const TYPE_BADGE_CLS: Record<string, string> = {
  游戏: "game",
  网站: "web",
  数据工具: "data",
  其他: "other",
};

/* ---------- 封面：真实截图优先，缺省时用 CSS 模拟占位 ---------- */

function ScreenshotMock({ project }: { project: Project }) {
  if (project.title.includes("贪吃蛇")) {
    return (
      <div className="mock-snake">
        <div className="s" /><div className="s2" /><div className="s" /><div /><div /><div /><div /><div /><div className="food" /><div /><div /><div />
        <div /><div /><div /><div className="glow" /><div /><div /><div /><div /><div /><div /><div /><div />
        <div /><div className="s" /><div className="s2" /><div /><div /><div /><div /><div /><div /><div /><div className="glow" /><div />
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
        <div className="food" /><div /><div /><div /><div className="s" /><div /><div /><div /><div /><div /><div /><div />
      </div>
    );
  }
  return (
    <div className="mock-other">{project.title.charAt(0)}</div>
  );
}

function Cover({ project }: { project: Project }) {
  if (project.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={project.cover} alt={`${project.title} 游戏画面`} loading="lazy" />
    );
  }
  return <ScreenshotMock project={project} />;
}

/* ---------- 单张项目卡片 ---------- */

function ProjectCard({ project }: { project: Project }) {
  const badgeCls = TYPE_BADGE_CLS[project.type] ?? "other";
  const { link } = project;
  const isExternal = !!link && link.startsWith("http");

  return (
    <div className="project-card">
      {/* 截图区：hover 微放大 + 链接按钮淡入 */}
      <div className="card-preview">
        <div className="preview-mock">
          <Cover project={project} />
        </div>
        {link && (
          <div className="preview-overlay">
            <a
              href={link}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="preview-link"
            >
              {link.startsWith("/") ? "在线体验 →" : "查看项目 →"}
            </a>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="card-body">
        <div className="card-top">
          <span className={`type-badge ${badgeCls}`}>{project.type}</span>
          <span className="card-title">
            {link ? (
              <a href={link} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                {project.title}
              </a>
            ) : (
              project.title
            )}
          </span>
        </div>
        <p className="card-desc">{project.description}</p>
        <div className="card-footer">
          <div className="card-tags">
            {project.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 主组件：项目展示（分类 tab + 卡片网格）---------- */

export default function ProjectShowcase() {
  const [filter, setFilter] = useState<string>("全部");

  const filtered =
    filter === "全部" ? projects : projects.filter((p) => p.type === filter);

  return (
    <div>
      {/* 分类 tab 栏：即使某分类暂无作品也保留入口 */}
      <div className="mb-9 flex flex-wrap justify-center gap-2.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              filter === f
                ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                : "border-slate-200 bg-white text-slate-500 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 卡片网格 */}
      <div className="project-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-slate-400">该分类下暂无内容</p>
      )}
    </div>
  );
}
