import type { Metadata } from "next";

import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "学习文档（旧站归档）",
};

export default function LegacyPage() {
  return (
    <PagePlaceholder
      title="学习文档"
      description="旧站 docs / blog 只读归档入口。"
      phase="PHASE 4 上线"
    />
  );
}
