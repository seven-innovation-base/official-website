"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 评论区（GitHub Issue 模式，复刻旧站逻辑但现代化）。
 *
 * 数据源：官方仓库 Issue #86 的评论列表（GitHub REST API，免认证）。
 * 留言方式：点击「我也来说几句」跳转到 Issue 页发表，需要 GitHub 账号——
 * 这个门槛是特性（成员为主、天然防灌水）。
 *
 * 版式对齐旧站（antd Comment）：宽幅无边框、每页 5 条分页、底部「我也来说几句」。
 *
 * 限流与缓存策略：未认证 GitHub API 为 60 次/小时/IP。
 * - 评论数据缓存到 localStorage（TTL 10 分钟），命中则不发请求
 * - 请求失败（限流/断网）时展示最近一次缓存内容 + 错误提示，不白屏
 */

type IssueComment = {
  id: number;
  nick: string;
  avatar: string;
  profile: string;
  link: string;
  createdAt: string;
  timeText: string;
  /** 用户自己写的内容（非引用部分） */
  content: string;
  /** 以 `>` 引用的原文（楼中楼靠它挂到主评论下），可能为空 */
  quote: string;
  replies: IssueComment[];
};

type Props = {
  /** GitHub API 地址（Issue 评论列表） */
  apiUrl: string;
  /** Issue 网页地址（「我也来说几句」跳转目标） */
  issueUrl: string;
};

const CACHE_KEY = "issue-comments-cache-v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 分钟内的重复访问直接用缓存，不消耗 API 配额
const PER_PAGE = 5; // 与旧站 antd Pagination 每页条数一致

type Cache = { savedAt: number; comments: IssueComment[] };

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as Cache;
    return Array.isArray(cache.comments) ? cache : null;
  } catch {
    return null;
  }
}

function writeCache(comments: IssueComment[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), comments } satisfies Cache));
  } catch {
    // 隐私模式等场景写入失败可忽略
  }
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** 解析留言正文：`>` 开头的行是引用（楼中楼依据），其余是用户自己写的内容 */
function parseComments(list: Array<Record<string, unknown>>): IssueComment[] {
  const parsed = list.map((c) => {
    const user = (c.user ?? {}) as { login?: string; avatar_url?: string; html_url?: string };
    const lines = String(c.body ?? "").split("\n");
    const quote: string[] = [];
    const own: string[] = [];
    for (const line of lines) {
      if (/^>\s?/.test(line)) quote.push(line.replace(/^>\s?/, ""));
      else own.push(line);
    }
    return {
      id: Number(c.id),
      nick: user.login ?? "匿名",
      avatar: user.avatar_url ?? "",
      profile: user.html_url ?? "",
      link: String(c.html_url ?? ""),
      createdAt: String(c.created_at ?? ""),
      timeText: c.created_at ? fmtTime(String(c.created_at)) : "",
      content: own.join("\n").trim(),
      quote: quote.join("\n").trim(),
      replies: [] as IssueComment[],
    };
  });

  // 主评论：有自己内容；纯引用无正文的 → 挂到被引用的主评论下（旧站约定）
  const top = parsed.filter((c) => c.content !== "");
  const byContent = new Map(top.map((c) => [norm(c.content), c]));
  for (const o of parsed) {
    if (o.content !== "") continue;
    const parent = byContent.get(norm(o.quote));
    if (parent) parent.replies.push(o);
    else top.push(o); // 引用找不到主评论时按顶层兜底，不丢数据
  }
  return top.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

type Status = "loading" | "ok" | "stale" | "error";

export default function IssueComments({ apiUrl, issueUrl }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [errKind, setErrKind] = useState<"ratelimit" | "network">("network");
  const [tick, setTick] = useState(0); // 重试按钮触发
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus((s) => (s === "ok" ? "ok" : "loading"));
    const cache = readCache();

    // 缓存新鲜：直接展示，不消耗 API 配额
    if (cache && Date.now() - cache.savedAt < CACHE_TTL) {
      setComments(cache.comments);
      setSavedAt(cache.savedAt);
      setStatus("ok");
      return;
    }

    try {
      const res = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
      if (res.status === 403 || res.status === 429) {
        throw Object.assign(new Error("rate limited"), { kind: "ratelimit" as const });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const comments = parseComments(await res.json());
      writeCache(comments);
      setComments(comments);
      setSavedAt(Date.now());
      setStatus("ok");
    } catch (e) {
      setErrKind((e as { kind?: "ratelimit" }).kind === "ratelimit" ? "ratelimit" : "network");
      if (cache) {
        // 有缓存就不白屏：展示缓存内容并注明
        setComments(cache.comments);
        setSavedAt(cache.savedAt);
        setStatus("stale");
      } else {
        setStatus("error");
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load, tick]);

  const totalPages = Math.max(1, Math.ceil(comments.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = comments.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const total = comments.length;

  const goPage = (p: number) => {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* 错误/缓存提示 */}
      {status === "stale" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-800">
          GitHub 接口暂时不可用（{errKind === "ratelimit" ? "请求配额已用完" : "网络异常"}），以下为最近一次缓存内容
          {savedAt ? `（更新于 ${fmtTime(new Date(savedAt).toISOString())}）` : ""}。
          <button onClick={() => setTick((t) => t + 1)} className="ml-1 font-semibold underline">
            重试
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-6 text-center text-sm text-red-600">
          留言加载失败（{errKind === "ratelimit" ? "GitHub 请求配额已用完，请一小时后再试" : "网络异常，请检查网络后重试"}）。
          <button onClick={() => setTick((t) => t + 1)} className="ml-2 font-semibold underline">
            重试
          </button>
        </div>
      )}

      {/* 加载中 */}
      {status === "loading" && (
        <p className="flex items-center justify-center gap-3 py-10 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          正在加载留言……
        </p>
      )}

      {/* 留言列表（旧站 antd Comment 版式：宽幅无边框，头像居左） */}
      <div ref={listRef} className="scroll-mt-20">
        {status !== "error" && status !== "loading" && pageItems.length === 0 && (
          <p className="py-10 text-center text-slate-500">还没有人留言，来抢一楼！</p>
        )}
        {pageItems.map((c) => (
          <div key={c.id} className="flex gap-4 py-6">
            <a href={c.profile} target="_blank" rel="noreferrer" className="shrink-0">
              <img
                src={c.avatar}
                alt={c.nick}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full"
              />
            </a>
            <div className="min-w-0 flex-1">
              <p className="leading-6">
                <a
                  href={c.profile}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-slate-700 transition hover:text-primary"
                >
                  {c.nick}
                </a>
                <span className="ml-3 text-xs text-slate-400">{c.timeText}</span>
              </p>
              {c.quote && (
                <blockquote className="mt-1 border-l-2 border-slate-200 pl-3 text-xs leading-6 text-slate-400">
                  {c.quote}
                </blockquote>
              )}
              <div className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-ink">{c.content}</div>

              {c.replies.length > 0 && (
                <div className="mt-3 space-y-4">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex gap-3">
                      <a href={r.profile} target="_blank" rel="noreferrer" className="shrink-0">
                        <img
                          src={r.avatar}
                          alt={r.nick}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-7 w-7 rounded-full"
                        />
                      </a>
                      <div className="min-w-0 flex-1">
                        <p className="leading-6">
                          <a
                            href={r.profile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-slate-700 hover:text-primary"
                          >
                            {r.nick}
                          </a>
                          <span className="ml-3 text-xs text-slate-400">{r.timeText}</span>
                        </p>
                        <div className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-ink">{r.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 分页（旧站 5 条/页） */}
      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-2" aria-label="留言分页">
          <button
            onClick={() => goPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition enabled:hover:border-primary/40 enabled:hover:text-primary disabled:opacity-40"
            aria-label="上一页"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${
                p === safePage
                  ? "border-primary font-semibold text-primary"
                  : "border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition enabled:hover:border-primary/40 enabled:hover:text-primary disabled:opacity-40"
            aria-label="下一页"
          >
            ›
          </button>
        </nav>
      )}

      {/* 我也来说几句（跳转 GitHub Issue，旧站同款位置） */}
      <div className="mt-10 text-center">
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-xl bg-primary px-10 py-3.5 text-base font-semibold text-white shadow-md shadow-primary/20 transition hover:scale-105 hover:bg-primary-dark"
        >
          我也来说几句
        </a>
      </div>
    </div>
  );
}
