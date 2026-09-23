import type { Metadata } from "next";
import { JoinPageContent } from "@/components/join/join-page";

export const metadata: Metadata = {
  title: "加入我们",
  description: "东华理工大学计算机协会的参与方式：零基础、新生与竞赛方向各自的起点。",
};

export default function JoinPage() {
  return <JoinPageContent />;
}
