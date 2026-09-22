import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "加入我们",
  description: "东华理工大学计算机协会的参与方式：零基础、竞赛训练与项目实践各自的起点。",
};

export default function JoinPage() {
  return (
    <RoutePage
      kicker="JOIN"
      title="加入我们"
      summary="回答「如何参与」：零基础同学、想参加算法竞赛的同学、喜欢开发的同学，各自从哪一步开始。"
      emptyTitle="暂无已核验的报名入口"
      emptyBody="当前页面暂无已核验的报名入口。可先了解协会活动，并关注公众号「计协ECUT」的后续信息。本轮不提供无效按钮、假二维码或私人联系方式。"
      related={["activities", { href: "/#join", label: "首页的加入入口" }]}
    />
  );
}
