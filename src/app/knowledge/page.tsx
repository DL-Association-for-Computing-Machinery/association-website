import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "知识与文章",
  description: "东华理工大学计算机协会的公开文章、学习资料与来源说明。",
};

export default function KnowledgePage() {
  return (
    <RoutePage
      kicker="KNOWLEDGE"
      title="知识与文章"
      summary="回答「可以继续学什么」：经过审核的公开文章、学习资料，以及每份材料的来源说明。"
      emptyTitle="文章与学习资料待审核后发布"
      emptyBody="按公开内容治理口径，只有来源清楚并通过审核的文章与资料才会出现在公开页面。当前经核验的公开文章尚未就绪，本页先保留路由与空状态，由内容相关议题接入正文。"
      related={["about", { href: "/#learning", label: "首页的学习方向" }]}
    />
  );
}
