import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { findSection } from "@/lib/site-navigation";

const section = findSection("/honors");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function HonorsPage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <h1 className="route-head__title">{section.title}</h1>
          <p className="route-head__lede">{section.summary}</p>
        </div>
        <EmptyState
          body="按赛事与级别浏览的成果页由后续板块票接入内容后交付。首页的已核验荣誉摘要列出当前达到证据粒度、可以公开的成绩。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/activities", label: "浏览活动回顾" },
          ]}
        />
      </div>
    </section>
  );
}
