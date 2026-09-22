import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { findSection } from "@/lib/site-navigation";

const section = findSection("/about");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <h1 className="route-head__title">{section.title}</h1>
          <p className="route-head__lede">{section.summary}</p>
        </div>
        <EmptyState
          body="完整的协会介绍页由后续板块票接入内容后交付，目前先给出首页上的协会定位与公开活动记录。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/activities", label: "浏览活动回顾" },
          ]}
        />
      </div>
    </section>
  );
}
