import type { Metadata } from "next";

import FtpExplorer from "@/components/ftp/FtpExplorer";

export const metadata: Metadata = {
  title: "FTP 资料库",
  description: "七院创新基地 FTP 资料库目录导航：11,455 份资料、八大分区，可搜索、可复制路径",
};

export default function FtpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-ink">基地 FTP 资料库</h1>
        <p className="mt-4 text-slate-500">三专业全课程 · 竞赛资料 · 历年家底 · 考研专区 · 装机必备，历届整理，持续更新</p>
      </header>

      <div className="mt-10">
        <FtpExplorer />
      </div>
    </div>
  );
}
