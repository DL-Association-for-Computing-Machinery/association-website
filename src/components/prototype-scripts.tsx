"use client";

import { useEffect } from "react";
import { PROTOTYPE_COMPONENT_SCRIPTS } from "@/lib/site-runtime";

/**
 * 基线自定义元素的加载器。
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
let scriptsInjected = false;

export function PrototypeScripts() {
  useEffect(() => {
    // React 在开发模式下会重复执行副作用，而部分基线组件没有做重复注册保护。
    if (scriptsInjected) {
      return;
    }

    scriptsInjected = true;

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
  }, []);

  return null;
}
