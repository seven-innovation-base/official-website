"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * FTP 资料库浏览器（方案 §6.1，功能对齐旧编目页，视觉按新站设计系统重写）：
 * 分区折叠 + 目录树懒展开 + 全局搜索（高亮）+ 复制 ftp:// 路径。
 * 数据懒加载：进入页面后才 fetch /data/ftp-catalog.json（不打入主 bundle）。
 */

type CatalogNode = {
  name: string;
  files: number;
  size: number;
  direct: number;
  fl?: Array<[string, number]>;
  children?: CatalogNode[];
};

const FTP_PREFIX = "ftp://10.60.92.17";

const PARTITION_SUBS: Record<string, string> = {
  "00": "新成员第一站",
  "01": "三专业全课程库",
  "02": "从培训到获奖全流程",
  "03": "2007 年至今的家底",
  "04": "学长学姐留下的",
  "05": "考研人专区（持续补充）",
  "06": "装机必备一站配齐",
  "07": "服务器与设备资料",
};

function human(n: number): string {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)} GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

/** 搜索命中高亮 */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-amber-100 px-0.5 text-ink">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CopyButton({ path, onCopy }: { path: string; onCopy: (p: string) => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCopy(path);
      }}
      title={`复制路径：${path}`}
      className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-mist hover:text-primary group-hover:opacity-100"
    >
      ⧉
    </button>
  );
}

/* ---------------- 目录树节点 ---------------- */

function TreeNode({
  node,
  parentPath,
  onCopy,
  depth,
}: {
  node: CatalogNode;
  parentPath: string;
  onCopy: (p: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const path = `${parentPath}/${node.name}`;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-mist"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <svg
          className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6 3l5 5-5 5z" />
        </svg>
        <span className="shrink-0 text-amber-500" aria-hidden>
          📁
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-ink">{node.name}</span>
        <span className="shrink-0 font-mono text-xs text-primary">
          {node.files.toLocaleString()} <span className="hidden sm:inline text-slate-400">份</span>
        </span>
        {node.size > 0 && (
          <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:inline">{human(node.size)}</span>
        )}
        <CopyButton path={path} onCopy={onCopy} />
      </button>

      {open && (
        <div className="border-l border-dashed border-slate-200" style={{ marginLeft: `${depth * 14 + 14}px` }}>
          {node.children?.map((child) => (
            <TreeNode key={child.name} node={child} parentPath={path} onCopy={onCopy} depth={0} />
          ))}
          {node.fl?.map(([name, size]) => (
            <div
              key={name}
              className="group flex items-center gap-2 px-2 py-1.5 text-sm transition hover:bg-mist/70"
              style={{ paddingLeft: "22px" }}
            >
              <span className="h-2.5 w-2 shrink-0 rounded-sm border border-sky-300 bg-sky-50" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-slate-600">{name}</span>
              <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:inline">{human(size)}</span>
              <CopyButton path={`${path}/${name}`} onCopy={onCopy} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 分区 ---------------- */

function Partition({
  node,
  onCopy,
}: {
  node: CatalogNode;
  onCopy: (p: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const no = node.name.slice(0, 2);
  const sub = PARTITION_SUBS[no] ?? "";
  const path = `/${node.name}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-3 border-l-4 border-primary bg-mist/70 px-4 py-3.5 text-left transition hover:bg-mist"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6 3l5 5-5 5z" />
        </svg>
        <span className="font-mono text-sm font-bold text-primary/70">{no}</span>
        <span className="text-base font-bold text-primary">{node.name.slice(2).replace(/^-/, "")}</span>
        {sub && <span className="hidden text-xs text-slate-400 md:inline">— {sub}</span>}
        <span className="ml-auto shrink-0 font-mono text-xs text-primary">{node.files.toLocaleString()} 份</span>
        <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:inline">{human(node.size)}</span>
        <CopyButton path={path} onCopy={onCopy} />
      </button>

      {open && (
        <div className="px-2 py-2">
          {node.children?.map((child) => (
            <TreeNode key={child.name} node={child} parentPath={path} onCopy={onCopy} depth={0} />
          ))}
          {node.fl?.length ? (
            <div className="px-2 py-1.5">
              {node.fl.map(([name, size]) => (
                <div key={name} className="group flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-mist/70">
                  <span className="h-2.5 w-2 shrink-0 rounded-sm border border-sky-300 bg-sky-50" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-slate-600">{name}</span>
                  <span className="hidden font-mono text-xs text-slate-400 sm:inline">{human(size)}</span>
                  <CopyButton path={`${path}/${name}`} onCopy={onCopy} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ---------------- 搜索 ---------------- */

type Hit = { kind: "folder" | "file"; name: string; path: string; size?: number };

function buildIndex(node: CatalogNode, parentPath: string, folders: Hit[], files: Hit[]) {
  const path = parentPath ? `${parentPath}/${node.name}` : `/${node.name}`;
  folders.push({ kind: "folder", name: node.name, path });
  node.fl?.forEach(([name, size]) => files.push({ kind: "file", name, path: `${path}/${name}`, size }));
  node.children?.forEach((c) => buildIndex(c, path, folders, files));
}

function SearchResults({ query, index, onCopy }: { query: string; index: Hit[]; onCopy: (p: string) => void }) {
  const q = query.toLowerCase();
  const hits = useMemo(
    () => index.filter((h) => h.name.toLowerCase().includes(q)).slice(0, 200),
    [index, q],
  );
  const folderHits = hits.filter((h) => h.kind === "folder");
  const fileHits = hits.filter((h) => h.kind === "file");
  const total = index.filter((h) => h.name.toLowerCase().includes(q)).length;

  if (!hits.length) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-mist/50 px-6 py-10 text-center text-slate-500">没有找到与「{query}」匹配的文件或文件夹</p>;
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">
        共 {total} 项匹配{total > 200 ? "，仅展示前 200 项，请细化关键词" : ""}
      </p>
      {folderHits.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-slate-400">文件夹（{folderHits.length}）</p>
          {folderHits.map((h) => (
            <div key={h.path} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-mist/70">
              <span aria-hidden>📁</span>
              <span className="shrink-0 font-medium text-ink">
                <Highlight text={h.name} query={query} />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{h.path}</span>
              <CopyButton path={h.path} onCopy={onCopy} />
            </div>
          ))}
        </div>
      )}
      {fileHits.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-slate-400">文件（{fileHits.length}）</p>
          {fileHits.map((h) => (
            <div key={h.path} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-mist/70">
              <span className="h-2.5 w-2 shrink-0 rounded-sm border border-sky-300 bg-sky-50" aria-hidden />
              <span className="shrink-0 text-slate-700">
                <Highlight text={h.name} query={query} />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{h.path}</span>
              {h.size !== undefined && (
                <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:inline">{human(h.size)}</span>
              )}
              <CopyButton path={h.path} onCopy={onCopy} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 主组件 ---------------- */

export default function FtpExplorer() {
  const [data, setData] = useState<CatalogNode | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/data/ftp-catalog.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const index = useMemo(() => {
    if (!data) return [] as Hit[];
    const folders: Hit[] = [];
    const files: Hit[] = [];
    data.children?.forEach((c) => buildIndex(c, "", folders, files));
    return [...folders, ...files];
  }, [data]);

  const folderCount = useMemo(() => index.filter((h) => h.kind === "folder").length, [index]);

  const onCopy = (path: string) => {
    const full = `${FTP_PREFIX}${path}`;
    navigator.clipboard
      ?.writeText(full)
      .then(() => setToast(`已复制：${full}`))
      .catch(() => setToast(full));
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (failed) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
        资料库数据加载失败，请刷新重试。
      </p>
    );
  }

  if (!data) {
    return (
      <p className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-slate-500 shadow-sm">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        正在加载资料库编目……
      </p>
    );
  }

  return (
    <div>
      {/* 统计条 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [data.files.toLocaleString(), "份文件"],
          [(data.size / 1024 ** 3).toFixed(1), "GB 资料"],
          [String(data.children?.length ?? 0), "大分区"],
          [folderCount.toLocaleString(), "个文件夹"],
        ].map(([num, label]) => (
          <div key={label} className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-bold text-primary">{num}</p>
            <p className="mt-0.5 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 使用说明 */}
      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-xs leading-6 text-slate-600">
        资料本体存放在基地内网 FTP（<code className="rounded bg-white px-1.5 py-0.5 font-mono text-primary">{FTP_PREFIX}</code>
        ，仅校园网）：先在下方找到需要的文件，点 ⧉ 复制完整路径，再到 FTP 客户端中粘贴下载。账号与使用方法见
        <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono">00-使用规范</code>分区。
      </div>

      {/* 搜索 */}
      <div className="sticky top-2 z-10 mt-5 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 px-2">
          <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索资料：数模、答辩、MATLAB、C语言……"
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-mist">
              清除
            </button>
          )}
        </div>
      </div>

      {/* 主体：搜索结果 / 分区树 */}
      <div className="mt-5 space-y-4">
        {query.trim() ? (
          <SearchResults query={query.trim()} index={index} onCopy={onCopy} />
        ) : (
          (data.children ?? [])
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => <Partition key={p.name} node={p} onCopy={onCopy} />)
        )}
      </div>

      {/* 复制提示 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
