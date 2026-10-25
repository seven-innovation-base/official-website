import type { Metadata } from "next";

import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "FTP 资料库",
};

export default function FtpPage() {
  return (
    <PagePlaceholder
      title="FTP 资料库"
      description="11,455 份资料 · 132.7GB · 八大分区的目录导航与检索。"
      phase="PHASE 3 上线"
    />
  );
}
