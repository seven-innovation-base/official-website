"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { heroInteraction } from "./interaction";
import type { SceneQuality } from "./HeroScene";

// three.js 不参与 SSR，也不打入主 chunk（方案 §4.5.1 加载策略）
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Tier = SceneQuality | "low";

/** 「时间算法」专属配色（青铜绿 × 铜金，D4 定稿） */
const ARMILLARY_PALETTE = {
  from: "#07130f",
  via: "#12281f",
  to: "#0a1a14",
  accent: "#C58A4A",
};

/** 分级质量探测：WebGL 可用性与设备能力，一次性决策 */
function detectTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  if (!gl) return "low";
  if (window.innerWidth < 768) return "medium"; // 移动端默认中档
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;
  return mem >= 8 || cores >= 8 ? "high" : "medium";
}

/** 点击/拖拽目标是否为 Hero 空白区（按钮、链接、Logo、标题、副标题不参与交互） */
function isHeroEmptyArea(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== "function") return false;
  return !el.closest("a, button, img, h1, p, nav");
}

export default function Hero3DLoader() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  // LCP 之后空闲时再加载 3D，永不阻塞首屏内容
  useEffect(() => {
    const detected = detectTier();
    setTier(detected);
    if (detected === "low") return;

    const start = () => setReady(true);
    const ric = window.requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
    if (ric) {
      const id = ric(start, { timeout: 1600 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(start, 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(t);
  }, [ready]);

  // 能量波配色（铜金）
  useEffect(() => {
    heroInteraction.rippleColor.set(ARMILLARY_PALETTE.accent);
  }, []);

  // DOM 侧交互监听：视差坐标 + 拖拽 + 单击能量波（3D 画布保持 pointer-events:none，按钮绝对安全）
  useEffect(() => {
    const el = wrapRef.current?.parentElement; // Hero <section>
    if (!el) return;
    let startX = 0;
    let lastX = 0;
    let moved = 0;
    let downOnEmpty = false;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      heroInteraction.px = ((e.clientX - r.left) / r.width) * 2 - 1;
      heroInteraction.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
      heroInteraction.inside = true;
      el.style.cursor = isHeroEmptyArea(e.target) ? (heroInteraction.dragging ? "grabbing" : "grab") : "";
      if (heroInteraction.dragging) {
        const prev = heroInteraction.dragOffset;
        heroInteraction.dragOffset = Math.max(-0.315, Math.min(0.315, ((e.clientX - startX) / r.width) * 0.63));
        heroInteraction.dragVel = (heroInteraction.dragOffset - prev) * 30;
        moved += Math.abs(e.clientX - lastX);
        lastX = e.clientX;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!isHeroEmptyArea(e.target) || e.pointerType !== "mouse") return;
      downOnEmpty = true;
      startX = lastX = e.clientX;
      moved = 0;
      heroInteraction.dragging = true;
      heroInteraction.dragVel = 0;
    };
    const onUp = (e: PointerEvent) => {
      if (heroInteraction.dragging && moved < 6 && downOnEmpty) {
        const r = el.getBoundingClientRect();
        heroInteraction.rippleNx = ((e.clientX - r.left) / r.width) * 2 - 1;
        heroInteraction.rippleNy = -(((e.clientY - r.top) / r.height) * 2 - 1);
        heroInteraction.rippleTime = 0.0001;
      }
      heroInteraction.dragging = false;
      downOnEmpty = false;
      el.style.cursor = "";
    };
    const onLeave = () => {
      heroInteraction.inside = false;
      heroInteraction.px = 0;
      heroInteraction.py = 0;
      el.style.cursor = "";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const showScene = tier !== null && tier !== "low" && ready;
  const mask =
    "[-webkit-mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)] [mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)]";
  const palette = ARMILLARY_PALETTE;

  return (
    <div ref={wrapRef} className="contents">
      {/* 「时间算法」专属底色（青铜绿渐变 + 铜金光晕，3D 层之下） */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.via} 55%, ${palette.to} 100%)`,
        }}
        aria-hidden
      >
        <div
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl"
          style={{ background: palette.accent, opacity: 0.13 }}
        />
        <div
          className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: palette.accent, opacity: 0.09 }}
        />
      </div>

      {showScene && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${mask} ${
            visible ? "opacity-90" : "opacity-0"
          }`}
          aria-hidden
        >
          <HeroScene quality={tier as SceneQuality} />
        </div>
      )}
    </div>
  );
}
