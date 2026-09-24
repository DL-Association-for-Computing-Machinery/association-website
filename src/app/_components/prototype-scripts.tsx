"use client";

import { useEffect } from "react";

/**
 * 加载原型的 Web Components 与页面脚本。
 *
 * 组件是经典脚本（无 import/export），靠 customElements.define 注册，
 * 因此按顺序注入 <script defer>：组件先于 main.js。
 *
 * 组件从 /components/ 加载，其内部的 threeui-source 用
 * new URL("./threeui-source/…", document.currentScript.src) 解析，
 * 所以源文件必须与组件同目录（public/components/threeui-source/）。
 */

const SCRIPT_SOURCES = [
  "/components/dia-text-reveal.js",
  "/components/dia-terminal.js",
  "/components/dia-file-tree.js",
  "/components/dia-blur-fade.js",
  "/components/dia-pixel-image.js",
  "/assets/icon-set.js",
  "/components/dia-icon-cloud.js",
  "/components/dia-animated-list.js",
  "/components/dia-retro-grid.js",
  "/components/dia-dot-pattern.js",
  "/components/dia-dock.js",
  "/components/dia-marquee.js",
  "/components/dia-avatar-circles.js",
  "/components/dia-logo-particles.js",
  "/components/threeui-globe-study.js",
  "/components/threeui-character-carousel.js",
];

export function PrototypeScripts() {
  useEffect(() => {
    const loaded: HTMLScriptElement[] = [];

    for (const src of SCRIPT_SOURCES) {
      // 已存在则跳过，避免 StrictMode 下重复注册自定义元素。
      if (document.querySelector(`script[data-prototype-src="${src}"]`)) continue;

      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.dataset.prototypeSrc = src;
      document.head.appendChild(script);
      loaded.push(script);
    }

    return () => {
      // 脚本本身不卸载：自定义元素注册无法撤销，重复注册会抛错。
      // 这里只清理标记，保持与 StrictMode 双调用兼容。
      loaded.forEach((script) => script.removeAttribute("data-pending"));
    };
  }, []);

  return null;
}
