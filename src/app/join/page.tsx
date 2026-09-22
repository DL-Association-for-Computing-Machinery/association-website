import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { findSection } from "@/lib/site-navigation";

const section = findSection("/join");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function JoinPage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <h1 className="route-head__title">{section.title}</h1>
          <p className="route-head__lede">{section.summary}</p>
        </div>
        <EmptyState
          body="当前页面暂无已核验的报名入口。可先了解协会活动，并关注公众号「计协ECUT」的后续信息。完整的加入指引由后续板块票交付，在不掌握有效入口时不生成按钮、二维码或私人联系方式。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/activities", label: "浏览活动回顾" },
          ]}
        />
      </div>
    </section>
  );
}
