"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** 进场延迟（ms），用于卡片交错效果 */
  delay?: number;
  className?: string;
};

/**
 * 滚动渐显（对标三院科协的丝滑进场）：元素每次进入视口都从下方淡入上移，
 * 离开视口后重置——上下反复滚动时动画可重复播放。
 * 纯 CSS transition 实现（无 JS 动画库），尊重"减弱动态效果"设置。
 */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), {
      threshold: 0.08,
      rootMargin: "0px 0px -30px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
