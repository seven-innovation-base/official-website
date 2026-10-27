"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 评论区（GitHub Issue 模式，复刻旧站逻辑但现代化）。
 *
 * 数据源：官方仓库 Issue #86 的评论列表（GitHub REST API，免认证）。
 * 留言方式：点击「去 GitHub 留言」跳转到 Issue 页发表，需要 GitHub 账号——
 * 这个门槛是特性（成员为主、天然防灌水）。
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
  /** Issue 网页地址（「去留言」跳转目标） */
  issueUrl: string;
};

const CACHE_KEY = "issue-comments-cache-v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 分钟内的重复访问直接用缓存，不消耗 API 配额

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
    (parent ?? o).replies.push(...(parent ? [o] : []));
    if (!parent) top.push(o); // 引用找不到主评论时按顶层兜底，不丢数据
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

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <div>
      {/* 顶部：计数 + 留言按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {status === "loading" ? "加载中……" : `${total} 条留言`}
        </p>
        <a
          href={issueUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:scale-105 hover:bg-primary-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          去 GitHub 留言
        </a>
      </div>

      {/* 错误/缓存提示 */}
      {status === "stale" && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-800">
          GitHub 接口暂时不可用（{errKind === "ratelimit" ? "请求配额已用完" : "网络异常"}），以下为最近一次缓存内容
          {savedAt ? `（更新于 ${fmtTime(new Date(savedAt).toISOString())}）` : ""}。
          <button onClick={() => setTick((t) => t + 1)} className="ml-1 font-semibold underline">
            重试
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50/70 px-4 py-6 text-center text-sm text-red-600">
          留言加载失败（{errKind === "ratelimit" ? "GitHub 请求配额已用完，请一小时后再试" : "网络异常，请检查网络后重试"}）。
          <button onClick={() => setTick((t) => t + 1)} className="ml-2 font-semibold underline">
            重试
          </button>
        </div>
      )}

      {/* 留言列表 */}
      {status === "ok" && total > 0 && (
        <div className="mt-6 space-y-4">
          {comments.map((c) => (
            <article key={c.id} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={c.avatar}
                  alt={c.nick}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full ring-2 ring-mist"
                />
                <div className="min-w-0">
                  <a
                    href={c.profile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary transition hover:text-accent"
                  >
                    {c.nick}
                  </a>
                  <p className="text-xs text-slate-400">{c.timeText}</p>
                </div>
              </div>
              {c.quote && (
                <blockquote className="mt-3 border-l-2 border-slate-200 pl-3 text-xs leading-6 text-slate-400">
                  {c.quote}
                </blockquote>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">{c.content}</p>

              {c.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex items-start gap-2.5">
                      <img
                        src={r.avatar}
                        alt={r.nick}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-7 w-7 rounded-full ring-2 ring-mist"
                      />
                      <div className="min-w-0">
                        <p className="text-xs">
                          <a
                            href={r.profile}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-primary hover:text-accent"
                          >
                            {r.nick}
                          </a>
                          <span className="ml-2 text-slate-400">{r.timeText}</span>
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {status === "ok" && total === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-mist/60 px-6 py-10 text-center text-slate-500">
          还没有人留言，来抢一楼！
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-6 text-slate-400">
        留言需要 GitHub 账号（基地成员标配），数据存放在基地官方仓库的 Issue 中。
        <br />
        <a
          href={`${issueUrl}#start-of-content`}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-primary"
        >
          查看 GitHub 上的原始留言 →
        </a>
      </p>
    </div>
  );
}
