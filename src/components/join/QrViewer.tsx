"use client";

import { useEffect, useState } from "react";

/**
 * 招新群二维码查看器：缩略图点击放大（灯箱），支持保存/下载（同源 download 属性）。
 * Esc 或点击遮罩关闭。
 */
export default function QrViewer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* 缩略图（点击放大） */}
      <button
        onClick={() => setOpen(true)}
        aria-label="查看二维码大图"
        className="group mt-7 shrink-0 rounded-xl bg-white p-2.5 shadow-2xl shadow-black/30 transition hover:scale-[1.02]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/qq-qrcode.jpg"
          alt="2026 招新群二维码"
          className="h-72 w-auto rounded-lg object-contain"
        />
        <span className="mt-2 block text-center text-xs text-slate-400 transition group-hover:text-primary">
          🔍 点击查看大图 · 可保存
        </span>
      </button>

      {/* 灯箱 */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="招新群二维码大图"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/qq-qrcode.jpg"
            alt="2026 招新群二维码"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[64vh] w-auto rounded-xl bg-white p-3 shadow-2xl"
          />
          <div className="mt-6 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <a
              href="/images/qq-qrcode.jpg"
              download="2026招新群二维码.jpg"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:scale-105"
            >
              ⬇ 保存 / 下载
            </a>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/40 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              关闭
            </button>
          </div>
          <p className="mt-4 text-xs text-white/50">按 Esc 或点击空白处关闭</p>
        </div>
      )}
    </>
  );
}
