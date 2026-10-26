"use client";

import { useEffect, useRef } from "react";

import "@waline/client/waline.css";

/**
 * Waline 评论（方案 §7.3）：客户端 SDK 动态导入（不进主 bundle），
 * serverURL 来自站点配置——部署环境切换只改 content/site-config.json。
 *
 * 头像补丁：Waline 服务端按 mail 生成 gravatar 默认头像，而历史留言真正对应的是
 * GitHub 账号（导入时 link 存的是 github.com/<user>）。这里读评论 DOM 里的
 * 昵称链接，把头像替换为对应 GitHub 头像（https://github.com/<user>.png），
 * 用 MutationObserver 覆盖分页/新评论/回复等动态渲染。
 */
const GITHUB_PROFILE = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/?$/;

export default function CommentsSection({ serverUrl }: { serverUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let disconnect: (() => void) | undefined;
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
      if (instance) destroy = () => instance.destroy();

      const patchAvatars = () => {
        const root = ref.current;
        if (!root) return;
        // 评论项容器为 .wl-card-item（.wl-comment 是输入表单）
        root.querySelectorAll<HTMLElement>(".wl-card-item").forEach((comment) => {
          const nickLink = comment.querySelector<HTMLAnchorElement>("a.wl-nick[href]");
          const avatar = comment.querySelector<HTMLImageElement>(".wl-user-avatar, .wl-avatar");
          if (!nickLink || !avatar) return;
          const matched = nickLink.getAttribute("href")?.match(GITHUB_PROFILE);
          if (!matched) return;
          const ghAvatar = `https://github.com/${matched[1]}.png?size=96`;
          if (avatar.dataset.srcPatched === ghAvatar) return;
          avatar.src = ghAvatar;
          avatar.srcset = "";
          avatar.loading = "lazy";
          avatar.referrerPolicy = "no-referrer";
          avatar.dataset.srcPatched = ghAvatar;
        });
      };

      patchAvatars();
      const observer = new MutationObserver(patchAvatars);
      observer.observe(ref.current, { childList: true, subtree: true });
      disconnect = () => observer.disconnect();
    });

    return () => {
      destroyed = true;
      disconnect?.();
      destroy?.();
    };
  }, [serverUrl]);

  return <div ref={ref} className="site-comments" />;
}
