import type { Metadata } from "next";

import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "团队成员",
};

export default function MembersPage() {
  return (
    <PagePlaceholder
      title="团队成员"
      description="按届展示基地成员的时间线，支持「送我上墙」。"
      phase="PHASE 2 上线"
    />
  );
}
