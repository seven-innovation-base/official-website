"use client";

import { useEffect, useRef } from "react";

import "@waline/client/waline.css";

/**
 * Waline 评论（方案 §7.3）：客户端 SDK 动态导入（不进主 bundle），
 * serverURL 来自站点配置——部署环境切换只改 content/site-config.json。
 */
export default function CommentsSection({ serverUrl }: { serverUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let destroy: (() => void) | undefined;

    import("@waline/client").then(({ init }) => {
      if (destroyed || !ref.current) return;
      const instance = init({
        el: ref.current,
        serverURL: serverUrl,
        lang: "zh-CN",
        dark: "auto",
        pageview: false,
        search: false,
      });
      if (instance) {
        destroy = () => instance.destroy();
      }
    });

    return () => {
      destroyed = true;
      destroy?.();
    };
  }, [serverUrl]);

  return <div ref={ref} />;
}
