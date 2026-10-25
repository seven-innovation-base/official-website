"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { heroInteraction } from "./interaction";
import type { SceneQuality, SceneVariant } from "./HeroScene";

// three.js 不参与 SSR，也不打入主 chunk（方案 §4.5.1 加载策略）
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Tier = SceneQuality | "low";

/** 进阶场景专属配色（Hero 底色随之切换，避免品牌藏青污染整体色调） */
type Palette = { from: string; via: string; to: string; accent: string };

const SCENE_PALETTES: Partial<Record<SceneVariant, Palette>> = {
  goldenRatio: { from: "#050505", via: "#17120b", to: "#0a0906", accent: "#C8A25F" },
  fractalForest: { from: "#03130f", via: "#06281f", to: "#041c14", accent: "#7DF9C6" },
  quantumRibbon: { from: "#0b0612", via: "#1b0f2d", to: "#0d0916", accent: "#B69CFF" },
  redshift: { from: "#120406", via: "#310a10", to: "#180609", accent: "#FF6B5E" },
  monolith: { from: "#050608", via: "#11151b", to: "#08090d", accent: "#DCE6F2" },
  armillary: { from: "#07130f", via: "#12281f", to: "#0a1a14", accent: "#C58A4A" },
};

const VARIANTS: Array<{ id: SceneVariant; label: string }> = [
  { id: "goldenRatio", label: "黄金比例之门" },
  { id: "fractalForest", label: "分形算法林" },
  { id: "quantumRibbon", label: "量子棱镜潮汐" },
  { id: "redshift", label: "红移星环" },
  { id: "monolith", label: "镜面纪念碑" },
  { id: "armillary", label: "时间算法" },
  { id: "lorenz", label: "洛伦兹风暴眼" },
  { id: "tesseract", label: "超立方折光门" },
  { id: "loom", label: "算法织机" },
  { id: "field", label: "向量场之茧" },
  { id: "eclipse", label: "日蚀磁场" },
  { id: "converge", label: "Logo 汇聚" },
  { id: "math", label: "数学符号" },
  { id: "aurora", label: "极光" },
  { id: "waves", label: "正弦波场" },
  { id: "network", label: "粒子网络" },
  { id: "nebula", label: "深空星云" },
  { id: "globe", label: "网格星球" },
  { id: "combo", label: "组合" },
  { id: "halo", label: "光晕" },
];

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
  const [variant, setVariant] = useState<SceneVariant>("goldenRatio");

  const palette = SCENE_PALETTES[variant];

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

  // 场景能量波配色
  useEffect(() => {
    heroInteraction.rippleColor.set(palette?.accent ?? "#13c2c2");
  }, [palette]);

  // "Logo 汇聚"模式下，粒子成形后淡出静态 Logo 图，避免重影
  useEffect(() => {
    const staticLogo = document.querySelector<HTMLElement>("[data-hero-logo]");
    if (staticLogo) {
      staticLogo.style.opacity = variant === "converge" && visible ? "0" : "1";
    }
  }, [variant, visible]);

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
    variant === "converge"
      ? "[-webkit-mask-image:radial-gradient(ellipse_52%_36%_at_50%_64%,transparent_26%,black_66%)] [mask-image:radial-gradient(ellipse_52%_36%_at_50%_64%,transparent_26%,black_66%)]"
      : "[-webkit-mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)] [mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)]";

  return (
    <div ref={wrapRef} className="contents">
      {/* 进阶场景专属底色（覆盖品牌藏青渐变，3D 层之下） */}
      {palette && (
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
      )}

      {showScene && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${mask} ${
            visible ? "opacity-90" : "opacity-0"
          }`}
          aria-hidden
        >
          <HeroScene variant={variant} quality={tier as SceneQuality} />
        </div>
      )}

      {/* 开发模式小样切换器：D4 视觉拍板用（生产构建自动隐藏） */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-3 right-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-end gap-1 rounded-2xl bg-black/60 px-2 py-1.5 text-[11px] text-white backdrop-blur">
          <span className="px-1 text-[10px] tracking-wider text-slate-400">3D 小样</span>
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`rounded-full px-2 py-0.5 transition ${
                variant === v.id ? "bg-accent text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
