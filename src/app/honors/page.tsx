import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "成果",
  description: "东华理工大学计算机协会的竞赛获奖、项目成果，以及算法与开发类荣誉和来源说明。",
};

export default function HonorsPage() {
  return (
    <RoutePage
      kicker="HONORS"
      title="成果"
      summary="回答「协会有哪些结果」：竞赛获奖、项目成果，以及算法与开发类荣誉，每条都注明来源。"
      emptyTitle="完整成果清单待来源登记后填充"
      emptyBody="首页「我们赢得」区块已经按内容包列出 10 条省级及以上成绩。本页要承载的完整清单，需要逐条登记赛事、时间与来源之后才能公开，因此本轮保留空状态，不重复陈列同一批条目。"
      related={["activities", { href: "/#honors", label: "首页的荣誉摘要" }]}
    />
  );
}
