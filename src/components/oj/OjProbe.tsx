"use client";

import { useEffect, useState } from "react";

/**
 * OJ 可达性探测（方案 §6.2）：
 * HTTPS 页面探测 HTTP 资源会受混合内容限制，故采用双手段兜底——
 * ① fetch no-cors（可达 = 请求发出未拒绝）② img 探测（被动内容，通常不受限）。
 * 任何失败都给出"手动地址 + 复制"保底，探测结果仅供参考。
 */

const OJ_URL = "http://10.60.92.17/";

type Status = "checking" | "ok" | "fail";

function probeFetch(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  return fetch(`${OJ_URL}favicon.ico?t=${Date.now()}`, { mode: "no-cors", signal: controller.signal })
    .then(() => {
      clearTimeout(timer);
      return true;
    })
    .catch(() => {
      clearTimeout(timer);
      return false;
    });
}

function probeImage(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 2500);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = `${OJ_URL}favicon.ico?t=${Date.now()}`;
  });
}

export default function OjProbe() {
  const [status, setStatus] = useState<Status>("checking");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const byFetch = await probeFetch();
      const byImg = byFetch ? true : await probeImage();
      if (!cancelled) setStatus(byFetch || byImg ? "ok" : "fail");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const copyAddress = () => {
    navigator.clipboard
      ?.writeText(OJ_URL)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div className="space-y-5">
      {/* 探测状态卡 */}
      <div
        className={`rounded-2xl border p-6 transition ${
          status === "ok"
            ? "border-emerald-200 bg-emerald-50/70"
            : status === "fail"
              ? "border-amber-200 bg-amber-50/70"
              : "border-slate-200 bg-mist/60"
        }`}
      >
        {status === "checking" && (
          <p className="flex items-center gap-3 text-slate-600">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            正在检测校园网环境……
          </p>
        )}
        {status === "ok" && (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-emerald-800">
              ✅ 检测到校园网环境，可以直接进入 OJ。
            </p>
            <a
              href={OJ_URL}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:scale-105 hover:bg-primary-dark"
            >
              进入 OJ →
            </a>
          </div>
        )}
        {status === "fail" && (
          <div>
            <p className="text-amber-800">⚠️ 当前似乎不在校园网内，暂时无法访问 OJ。</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-amber-800/80">
              <li>在校：连接校园网 Wi-Fi（或校园有线网络）后刷新本页</li>
              <li>校外：先连接学校 VPN，再回到本页</li>
              <li>也可以复制下方地址，等到校园网环境后再打开</li>
            </ul>
          </div>
        )}
      </div>

      {/* 地址卡 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">OJ 地址（仅校园网可达）</p>
          <code className="mt-1 block truncate font-mono text-sm font-semibold text-primary">{OJ_URL}</code>
        </div>
        <button
          onClick={copyAddress}
          className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-mist"
        >
          {copied ? "已复制 ✓" : "复制地址"}
        </button>
      </div>
    </div>
  );
}
