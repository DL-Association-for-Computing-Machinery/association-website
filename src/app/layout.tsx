import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "东华理工大学计算机协会",
  description: "东华理工大学学生计算机协会：算法训练、项目实践与技术交流。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
