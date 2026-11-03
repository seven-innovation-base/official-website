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

      {/* 灯箱（百度图片查看器风格：无边框大图 + 悬浮操作） */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="招新群二维码大图"
        >
          {/* 右上角关闭 */}
          <button
            onClick={() => setOpen(false)}
            aria-label="关闭"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/25"
          >
            ×
          </button>

          {/* 无边框大图 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/qq-qrcode.jpg"
            alt="2026 招新群二维码"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-auto max-w-[92vw] rounded-md shadow-2xl"
          />

          {/* 底部悬浮下载 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
            <a
              href="/images/qq-qrcode.jpg"
              download="2026招新群二维码.jpg"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-2xl transition hover:scale-105"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              保存图片
            </a>
          </div>
        </div>
      )}
    </>
  );
}
