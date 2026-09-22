"use client";

import { useEffect } from "react";
import { PROTOTYPE_COMPONENT_SCRIPTS } from "@/lib/site-runtime";

/** 窄屏轻量模式的断点。必须与基线组件脚本、样式表里的 `48rem` 一致。 */
const MOBILE_LITE_QUERY = "(max-width: 48rem)";

/**
 * 需要在跨越断点时重新初始化一次的自定义元素。
 *
 * 这几个组件在升级时用 `(max-width: 48rem)` 判定一次「窄屏轻量模式」，把结论写进
 * `data-mobile-static`，然后整段跳过初始化，之后视口再变宽也不复查。结果是
 * **「窄窗口打开页面 → 把窗口拉宽/最大化」之后，这几块在大屏上永久空白**：
 * `dia-icon-cloud` 的画布停在 300×150 的默认尺寸、一个像素都不画；
 * `threeui-character-carousel` 与 `threeui-globe-study` 连 iframe 都不创建；
 * 而窄屏那份静态回落又被 CSS 的媒体查询收了起来 —— 两边都空。
 *
 * 修法是在跨越断点时把元素换成一个克隆：克隆不带 shadow root、也不带已建的
 * iframe，浏览器会按当前视口重新升级它，等于从头完整初始化一次。light DOM
 * 子节点（标签云的 `<ul class="cloud-list">` 等）会被克隆带过来，数据不丢。
 *
 * 没有直接改这些脚本：`public/prototype/` 是只读基线，评审要拿它做对照。
 */
const MOBILE_STATIC_REBIND_SELECTOR = [
  "dia-icon-cloud",
  "dia-logo-particles",
  "dia-retro-grid",
  "threeui-character-carousel",
  "threeui-globe-study",
].join(",");

/**
 * 只在「窄 → 宽」时重建。
 *
 * 反方向不需要：这些组件在宽屏初始化之后，窄屏那一侧由 CSS 媒体查询负责
 * （标签云收起画布、露出列表接着用），实测这条路径是好的。
 */
function rebindMobileStaticElements() {
  const nodes = document.querySelectorAll<HTMLElement>(
    `${MOBILE_STATIC_REBIND_SELECTOR}[data-mobile-static="true"]`,
  );

  for (const node of nodes) {
    const clone = node.cloneNode(true) as HTMLElement;

    // 这两个属性是上一次初始化的结论，克隆必须重新判定。
    clone.removeAttribute("data-mobile-static");
    // `threeui-*` 的窄屏分支会把 ready 一并设上；不清掉的话新的
    // connectedCallback 一进门就被 `dataset.ready === "true"` 挡回去。
    clone.removeAttribute("data-ready");

    if (clone.tagName.toLowerCase() === "dia-logo-particles") {
      // 它的窄屏分支会往自身 append 一张静态徽章图，克隆会一并带过来，
      // 重新初始化时又 append 一张。它的服务端形态是空元素，清空即还原。
      clone.replaceChildren();
      clone.classList.remove("is-loaded", "is-settled");
    }

    node.replaceWith(clone);
  }
}

/**
 * 注入基线自定义元素脚本。
 *
 * 这 15 个脚本是 #30 基线里 `<dia-dock>`、`<dia-text-reveal>`、`<dia-terminal>`
 * 等原生 Web Component 的实现，本身就是主站要复用的「组件」。它们仍是经典脚本
 * （不是 ES 模块 —— 基线刻意如此，双击 HTML 打开也能跑）。
 *
 * 为什么不让它们像基线那样写成 `<script defer>`：这些组件在升级时会改写自己的子节点，
 * 比如 `dia-text-reveal` 把「探索计协」搬进自己的 shadow root。`defer` 执行早于
 * React 水合，水合时 React 按服务端 HTML 逐个核对文本节点，就会因为对不上而
 * 抛水合失败、整棵树改由客户端重渲染。基线没有水合这一步，所以原样照搬会踩到。
 *
 * 所以改成水合之后注入，并强制按声明顺序执行：
 * 动态插入的脚本默认 `async`，把 `async` 置为 false 才会保持插入顺序，
 * 这条依赖是硬的 —— `assets/icon-set.js` 必须先于 `dia-icon-cloud.js` 执行。
 *
 * 全部就绪后再摘 `no-js`：`html:not(.no-js)` 才切到组件版字标，
 * 早一步会露出还没升级的空元素，晚一步则让回落文案多停一帧。
 */
function injectComponentScripts() {
  const elements = PROTOTYPE_COMPONENT_SCRIPTS.map((src) => {
    const element = document.createElement("script");

    element.src = src;
    element.async = false;
    document.head.append(element);

    return element;
  });

  const last = elements.at(-1);

  if (!last) {
    document.documentElement.classList.remove("no-js");

    return;
  }

  const releaseFallback = () => {
    document.documentElement.classList.remove("no-js");
  };

  // 末位脚本落定就说明前面都已按序执行完；即使它加载失败也要摘 no-js，
  // 否则 `dia-*` 会一直显示回落文案。
  last.addEventListener("load", releaseFallback, { once: true });
  last.addEventListener("error", releaseFallback, { once: true });
}

let scriptsInjected = false;

export function PrototypeScripts() {
  useEffect(() => {
    if (!scriptsInjected) {
      scriptsInjected = true;
      injectComponentScripts();
    }

    // 断点监听独立注册：`scriptsInjected` 只该挡重复注入脚本，
    // 不能把监听器也一起挡掉（开发模式下副作用会跑两遍，
    // 第二次进到这里时 scriptsInjected 已经是 true）。
    const mobileLite = window.matchMedia(MOBILE_LITE_QUERY);
    const handleBreakpoint = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        rebindMobileStaticElements();
      }
    };

    mobileLite.addEventListener("change", handleBreakpoint);

    return () => {
      mobileLite.removeEventListener("change", handleBreakpoint);
    };
  }, []);

  return null;
}
