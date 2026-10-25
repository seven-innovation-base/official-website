import type { Metadata } from "next";

import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "OJ 练习",
};

export default function OjPage() {
  return (
    <PagePlaceholder
      title="OJ 练习系统"
      description="在线判题练习平台（仅校园网访问），含可达性探测与使用指引。"
      phase="PHASE 3 上线"
    />
  );
}
