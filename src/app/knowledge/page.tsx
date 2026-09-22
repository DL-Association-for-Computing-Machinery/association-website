import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { findSection } from "@/lib/site-navigation";

const section = findSection("/knowledge");

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function KnowledgePage() {
  return (
    <section className="section">
      <div className="shell">
        <div className="route-head">
          <h1 className="route-head__title">{section.title}</h1>
          <p className="route-head__lede">{section.summary}</p>
        </div>
        <EmptyState
          body="文章列表与阅读页由后续板块票接入内容后交付。首页的学习方向区块给出了当前可以开始的三件事。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/join", label: "了解加入方式" },
          ]}
        />
      </div>
    </section>
  );
}
