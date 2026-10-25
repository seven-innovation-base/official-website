"use client";

import { useState } from "react";

type VideoSectionProps = {
  title: string;
  description: string;
  embedUrl: string;
};

/**
 * 宣传视频：封面占位 + 点击后懒加载 B 站 iframe（移动端 aspect-ratio 自适应）。
 */
export default function VideoSection({ title, description, embedUrl }: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-mist py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-bold text-ink">{title}</h2>
        <p className="mt-3 text-center text-slate-500">{description}</p>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-light shadow-xl shadow-primary/20">
          {playing ? (
            <iframe
              src={`${embedUrl}&autoplay=1`}
              title={title}
              scrolling="no"
              frameBorder="no"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-5 text-white"
              aria-label="播放宣传视频"
            >
              <span className="text-sm tracking-widest text-blue-100/80">PLAY VIDEO</span>
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:scale-110 group-hover:bg-accent/80">
                <svg className="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-base text-blue-100">点击播放 · B 站</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
