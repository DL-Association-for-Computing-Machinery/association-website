import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { findSection } from "@/lib/site-navigation";

const section = findSection("/activities");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function ActivitiesPage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <h1 className="route-head__title">{section.title}</h1>
          <p className="route-head__lede">{section.summary}</p>
        </div>
        <EmptyState
          body="活动列表、筛选条件与详情页由后续板块票接入内容后交付。已公开的两次活动记录现在可以在首页的活动回顾区块查看。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/honors", label: "查看成果" },
          ]}
        />
      </div>
    </section>
  );
}
