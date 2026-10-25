import type { Metadata } from "next";

import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "历史荣誉",
};

export default function HonorsPage() {
  return (
    <PagePlaceholder
      title="历史荣誉"
      description="近年国家级、省部级获奖记录（数据已迁移就绪）。"
      phase="PHASE 2 上线"
    />
  );
}
