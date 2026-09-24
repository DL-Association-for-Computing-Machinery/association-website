import Script from "next/script";

/**
 * 加载原型的 Web Components 与页面脚本。
 *
 * 组件是经典脚本（无 import/export），靠 customElements.define 注册，
 * 因此交给 next/script 注入，而不是手工 createElement：
 * ScriptCache 按 src 去重，StrictMode 双调用与客户端导航都不会重复注册。
 *
 * 加载顺序由两件事共同保证，缺一不可：
 * 1. `icon-set.js` 排在全部 `dia-*` 之前 —— `dia-icon-cloud` 在
 *    connectedCallback 里同步读 `window.DIA_ICON_SET`，此时元素已由 SSR
 *    HTML 升级，没有重试机会，读到空表就会渲染成无图标的白板。
 * 2. `async={false}` —— 动态插入的脚本默认 async=true（下载完就执行），
 *    仅靠数组顺序不成立。这是唯一真正需要顺序的地方，其余脚本互不依赖。
 *
 * 组件从 /components/ 加载，其内部的 threeui-source 用
 * new URL("./threeui-source/…", document.currentScript.src) 解析，
 * 所以源件必须与组件同目录（public/components/threeui-source/）。
 */

const SCRIPT_SOURCES = [
  // icon-set.js 必须最先执行：dia-icon-cloud 会同步读它写入的全局
  "/assets/icon-set.js",

  // 以下 13 个 dia-* 互不依赖，顺序随意
  "/components/dia-text-reveal.js",
  "/components/dia-terminal.js",
  "/components/dia-file-tree.js",
  "/components/dia-blur-fade.js",
  "/components/dia-pixel-image.js",
  "/components/dia-icon-cloud.js",
  "/components/dia-animated-list.js",
  "/components/dia-retro-grid.js",
  "/components/dia-dot-pattern.js",
  "/components/dia-dock.js",
  "/components/dia-marquee.js",
  "/components/dia-avatar-circles.js",
  "/components/dia-logo-particles.js",

  // threeui-* 读 window.__ECUT_EMBEDDED_SOURCES__（当前无人写入，走 URL 回退），
  // 与 dia-* 无依赖关系
  "/components/threeui-globe-study.js",
  "/components/threeui-character-carousel.js",
];

export function PrototypeScripts() {
  return (
    <>
      {SCRIPT_SOURCES.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" async={false} />
      ))}
    </>
  );
}
