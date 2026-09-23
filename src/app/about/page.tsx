import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/about-page";

export const metadata: Metadata = {
  title: "协会介绍",
  description: "东华理工大学计算机协会的简介、发展方向、可公开的成员与指导信息，以及发展历程。",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
