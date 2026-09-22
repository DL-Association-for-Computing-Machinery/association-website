import type { Metadata } from "next";
import { IntroScreen } from "@/components/home/intro-screen";
import { PageShine } from "@/components/page-shine";
import { PrototypeScripts } from "@/components/prototype-scripts";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_BOOTSTRAP_SCRIPT } from "@/lib/site-runtime";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "东华理工大学计算机协会",
    template: "%s｜东华理工大学计算机协会",
  },
  description: "东华理工大学学生计算机协会：算法训练、项目实践与技术交流。",
};

/**
 * 站点外壳，结构对齐 #30 首页基线（`public/prototype/index.html` 的 body 段）：
 * 开屏 → 跳过链接 → 顶栏 Dock → 内容 → 收尾区块与页脚 → 整页彩框。
 *
 * 两处与基线不同，都是为了「六类页面共用同一套外壳」：
 * - 基线把开屏与页脚写在 index.html 里，这里提到 layout —— 页脚因此每个路由都有，
 *   开屏则由首帧内联脚本按路由决定要不要播（只有首页播，其余路由打 `intro-skipped`）；
 * - 基线的组件脚本写在 `<head>`，这里由 `<PrototypeScripts>` 在客户端水合之后注入，
 *   原因见该组件：那些自定义元素会改写自己的子节点，早于水合加载会打断 React 水合。
 *
 * `no-js` 与 `intro-active` 必须在服务端就写上、再由脚本摘掉：
 * 前者保证禁用脚本时首屏字标有回落文案，后者保证开屏那一帧不会先闪出主页内容。
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className="no-js intro-active"
      data-theme="light"
      // 首帧内联脚本会在水合前改写 html 的 class 与 data-theme，这是有意为之。
      suppressHydrationWarning
    >
      <body id="top">
        <script dangerouslySetInnerHTML={{ __html: SITE_BOOTSTRAP_SCRIPT }} />

        <IntroScreen />

        <a className="skip-link" href="#main">
          跳到主要内容
        </a>

        <SiteHeader />

        {children}

        <SiteFooter />
        <PageShine />
        <PrototypeScripts />
      </body>
    </html>
  );
}
