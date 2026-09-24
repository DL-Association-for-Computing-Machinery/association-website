import type { Metadata } from "next";

import { PrototypeScripts } from "./_components/prototype-scripts";
import "./globals.css";

import { SITE_DESCRIPTION, SITE_NAME } from "@/config";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

/**
 * 首帧前执行：恢复主题偏好、移除 no-js。
 *
 * 必须内联且同步，否则水合前会闪一下降级版字标（样式里
 * html:not(.no-js) 才会隐藏 fallback 字标、显示 Web Component）。
 * 同时把开屏期间的 requestAnimationFrame 暂存起来，等开屏结束再统一释放，
 * 避免首屏动画与开屏动画挤在同一帧。
 */
const BOOTSTRAP_SCRIPT = `(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  try {
    if (window.localStorage.getItem("ecut-ca-prototype-theme") === "dark") {
      root.classList.add("theme-dark");
      root.dataset.theme = "dark";
    }
  } catch {}

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const queued = new Map();
  let nextId = 1;
  let released = false;

  window.requestAnimationFrame = (callback) => {
    if (released) return nativeRaf(callback);
    const id = nextId++;
    queued.set(id, callback);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (queued.delete(id)) return;
    nativeCancel(id);
  };
  window.__releaseIntroFrames = () => {
    if (released) return;
    released = true;
    const callbacks = [...queued.values()];
    queued.clear();
    callbacks.forEach((callback) => nativeRaf(callback));
  };
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="no-js intro-active" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
      </head>
      <body id="top">
        {children}
        <PrototypeScripts />
      </body>
    </html>
  );
}
