"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { SceneQuality, SceneVariant } from "./HeroScene";

// three.js 不参与 SSR，也不打入主 chunk（方案 §4.5.1 加载策略）
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Tier = SceneQuality | "low";

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

const VARIANTS: Array<{ id: SceneVariant; label: string }> = [
  { id: "network", label: "粒子网络" },
  { id: "nebula", label: "深空星云" },
  { id: "combo", label: "组合" },
];

export default function Hero3DLoader() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<SceneVariant>("network");

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

  const showScene = tier !== null && tier !== "low" && ready;

  return (
    <>
      {showScene && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 [-webkit-mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)] [mask-image:radial-gradient(ellipse_58%_52%_at_50%_46%,transparent_32%,black_78%)] ${
            visible ? "opacity-90" : "opacity-0"
          }`}
          aria-hidden
        >
          <HeroScene variant={variant} quality={tier as SceneQuality} />
        </div>
      )}

      {/* 开发模式小样切换器：D4 视觉拍板用（生产构建自动隐藏） */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1.5 text-xs text-white backdrop-blur">
          <span className="px-1.5 text-[10px] tracking-wider text-slate-400">3D 小样</span>
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`rounded-full px-2.5 py-1 transition ${
                variant === v.id ? "bg-accent text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
