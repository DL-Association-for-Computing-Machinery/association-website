import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteClosing } from "@/components/site-closing";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "东华理工大学计算机协会",
    template: "%s｜东华理工大学计算机协会",
  },
  description: "东华理工大学计算机协会：算法训练、项目实践与技术交流。",
};

/**
 * 首屏前决定深浅外观：先读本站记忆值，没有则跟随系统偏好。
 * 放在 head 里同步执行，避免先渲染浅色再跳成深色。
 */
const themeInitScript = `(function(){try{var k="ecut-acm-theme";var saved=window.localStorage.getItem(k);var dark=saved?saved==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("theme-dark",dark);}catch(error){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // 主题类名由上面的内联脚本在客户端改写，水合时不需要比对这一处差异。
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          跳到正文
        </a>
        <SiteHeader />
        <main className="site-main" id="main">
          {children}
        </main>
        <SiteClosing />
      </body>
    </html>
  );
}
