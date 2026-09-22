import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "协会介绍",
  description: "东华理工大学计算机协会的简介、发展方向、可公开的成员与指导信息，以及发展历程。",
};

export default function AboutPage() {
  return (
    <RoutePage
      kicker="ABOUT"
      title="协会介绍"
      summary="回答「协会如何运行」：简介、发展方向、可公开的成员与指导信息，以及发展历程。"
      emptyTitle="协会介绍正文待内容模型接入后填充"
      emptyBody="首页已经给出协会定位和一段简介。完整的介绍正文、发展方向、可公开的成员与指导信息、发展历程，需要逐条登记来源之后再填入；本轮只建立路由与入口，不预造材料里没有的内容。"
      related={["honors", "join"]}
    />
  );
}
