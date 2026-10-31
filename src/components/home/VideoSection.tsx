"use client";

import { useState } from "react";

type VideoSectionProps = {
  title: string;
  description: string;
  type: "local" | "embed";
  src?: string;
  poster?: string;
  embedUrl?: string;
};

/**
 * 宣传视频：封面占位 + 点击后加载。
 * 本地自托管视频（封面完全可控，preload=none 不预载流量）或 B 站 iframe 均支持，
 * 移动端 aspect-video 自适应。
 */
export default function VideoSection({
  title,
  description,
  type,
  src,
  poster,
  embedUrl,
}: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  const facade = (
    <button
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 flex h-full w-full items-center justify-center"
      aria-label="播放宣传视频"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary-deep via-primary to-primary-light" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-primary-deep/60 via-transparent to-transparent" />
      <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-2xl backdrop-blur transition group-hover:scale-110 group-hover:bg-accent/90">
        <svg className="ml-1 h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );

  return (
    <section className="bg-mist py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-bold text-ink">{title}</h2>
        <p className="mt-3 text-center text-slate-500">{description}</p>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl shadow-xl shadow-primary/20 ring-1 ring-slate-900/10">
          {playing ? (
            type === "local" && src ? (
              <video
                src={src}
                poster={poster}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-black"
              >
                您的浏览器不支持视频播放。
              </video>
            ) : embedUrl ? (
              <iframe
                src={`${embedUrl}&autoplay=1`}
                title={title}
                scrolling="no"
                frameBorder="no"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : null
          ) : (
            facade
          )}
        </div>
      </div>
    </section>
  );
}
