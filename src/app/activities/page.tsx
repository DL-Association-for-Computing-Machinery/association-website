import type { Metadata } from "next";
import { RoutePage } from "@/components/route-page";

export const metadata: Metadata = {
  title: "活动",
  description: "东华理工大学计算机协会的活动记录：按年份与类型浏览，含时间、地点与报名状态。",
};

export default function ActivitiesPage() {
  return (
    <RoutePage
      kicker="ACTIVITIES"
      title="活动"
      summary="回答「协会做过什么」：按年份与类型浏览活动记录，从列表进入详情，含时间、地点与报名状态。"
      emptyTitle="活动列表待数据接入后展示"
      emptyBody="活动列表要逐条登记时间、地点与报名状态，并核验来源之后才能公开。本轮先建立路由与空状态，列表、筛选和详情由活动相关议题接入；在此之前，首页「活动回顾」区块是唯一的活动入口。"
      related={["about", "knowledge"]}
    />
  );
}
